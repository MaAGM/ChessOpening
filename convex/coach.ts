import { DAY, MINUTE, RateLimiter } from "@convex-dev/rate-limiter";
import { v } from "convex/values";
import { COACH_MAX_USER_PROMPT_LENGTH, COACH_SYSTEM_PROMPT } from "../src/lib/coach/systemPrompt";
import { components, internal } from "./_generated/api";
import { action, env, internalMutation, type MutationCtx } from "./_generated/server";
import { callCoachModel, CoachModelError, DEFAULT_COACH_MODEL } from "./lib/llm";
import { check, requireUserId } from "./lib/validation";

/**
 * Coach IA : explication d'un coup hors répertoire par le LLM.
 *
 * Le client analyse la position avec son moteur local et construit le prompt
 * (`src/lib/coach/`) ; il n'envoie ici que la partie « utilisateur ». Les consignes
 * système, la clé d'API et le choix du modèle restent côté serveur.
 *
 * Quotas par utilisateur (composant `rateLimiter`, seaux à jetons) :
 *  - 30 explications par 24 h glissantes ;
 *  - 5 par minute (anti-rafale).
 * Une explication déjà en cache est servie sans consommer de quota.
 */

export const COACH_DAILY_LIMIT = 30;
export const COACH_BURST_LIMIT = 5;

const rateLimiter = new RateLimiter(components.rateLimiter, {
  coachDaily: { kind: "token bucket", rate: COACH_DAILY_LIMIT, period: DAY, capacity: COACH_DAILY_LIMIT },
  coachBurst: { kind: "token bucket", rate: COACH_BURST_LIMIT, period: MINUTE, capacity: COACH_BURST_LIMIT },
});

const explainResult = v.union(
  v.object({ status: v.literal("ok"), text: v.string(), cached: v.boolean() }),
  v.object({ status: v.literal("quota"), retryAfterMs: v.number() }),
  v.object({ status: v.literal("unavailable"), message: v.string() }),
);

export type CoachExplainResult =
  | { status: "ok"; text: string; cached: boolean }
  | { status: "quota"; retryAfterMs: number }
  | { status: "unavailable"; message: string };

function utcDay(now: number): string {
  return new Date(now).toISOString().slice(0, 10);
}

async function sha256(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function bumpUsage(
  ctx: MutationCtx,
  userId: string,
  delta: { requests?: number; cachedHits?: number; inputTokens?: number; outputTokens?: number },
): Promise<void> {
  const now = Date.now();
  const day = utcDay(now);
  const existing = await ctx.db
    .query("coachUsage")
    .withIndex("by_userId_and_day", (q) => q.eq("userId", userId).eq("day", day))
    .unique();
  if (existing) {
    await ctx.db.patch("coachUsage", existing._id, {
      requests: existing.requests + (delta.requests ?? 0),
      cachedHits: existing.cachedHits + (delta.cachedHits ?? 0),
      inputTokens: existing.inputTokens + (delta.inputTokens ?? 0),
      outputTokens: existing.outputTokens + (delta.outputTokens ?? 0),
      updatedAt: now,
    });
  } else {
    await ctx.db.insert("coachUsage", {
      userId,
      day,
      requests: delta.requests ?? 0,
      cachedHits: delta.cachedHits ?? 0,
      inputTokens: delta.inputTokens ?? 0,
      outputTokens: delta.outputTokens ?? 0,
      updatedAt: now,
    });
  }
}

// ---------------------------------------------------------------------------
// Fonctions internes (appelées par l'action)
// ---------------------------------------------------------------------------

/** Explication en cache ; compte la consultation dans le suivi d'utilisation. */
export const takeCached = internalMutation({
  args: { userId: v.string(), hash: v.string() },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, { userId, hash }) => {
    const cached = await ctx.db
      .query("coachExplanations")
      .withIndex("by_hash", (q) => q.eq("hash", hash))
      .unique();
    if (!cached) return null;
    await bumpUsage(ctx, userId, { cachedHits: 1 });
    return cached.text;
  },
});

/**
 * Consomme un jeton de chaque quota, ou aucun : les deux seaux sont vérifiés avant
 * d'en débiter un (la mutation est une transaction).
 */
export const consumeQuota = internalMutation({
  args: { userId: v.string() },
  returns: v.union(v.object({ ok: v.literal(true) }), v.object({ ok: v.literal(false), retryAfterMs: v.number() })),
  handler: async (ctx, { userId }) => {
    const daily = await rateLimiter.check(ctx, "coachDaily", { key: userId });
    const burst = await rateLimiter.check(ctx, "coachBurst", { key: userId });
    if (!daily.ok || !burst.ok) {
      const retryAfterMs = Math.max(daily.ok ? 0 : daily.retryAfter, burst.ok ? 0 : burst.retryAfter);
      return { ok: false as const, retryAfterMs: Math.ceil(retryAfterMs) };
    }
    await rateLimiter.limit(ctx, "coachDaily", { key: userId, throws: true });
    await rateLimiter.limit(ctx, "coachBurst", { key: userId, throws: true });
    return { ok: true as const };
  },
});

/** Rend les jetons d'un appel au LLM qui a échoué (l'utilisateur n'a rien reçu). */
export const refundQuota = internalMutation({
  args: { userId: v.string() },
  returns: v.null(),
  handler: async (ctx, { userId }) => {
    await rateLimiter.credit(ctx, "coachDaily", { key: userId });
    await rateLimiter.credit(ctx, "coachBurst", { key: userId });
    return null;
  },
});

/** Enregistre l'explication produite (cache partagé) et l'usage de l'utilisateur. */
export const recordExplanation = internalMutation({
  args: {
    userId: v.string(),
    hash: v.string(),
    model: v.string(),
    text: v.string(),
    inputTokens: v.number(),
    outputTokens: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("coachExplanations")
      .withIndex("by_hash", (q) => q.eq("hash", args.hash))
      .unique();
    if (!existing) {
      await ctx.db.insert("coachExplanations", {
        hash: args.hash,
        model: args.model,
        text: args.text,
        createdAt: Date.now(),
      });
    }
    await bumpUsage(ctx, args.userId, {
      requests: 1,
      inputTokens: args.inputTokens,
      outputTokens: args.outputTokens,
    });
    return null;
  },
});

// ---------------------------------------------------------------------------
// API publique
// ---------------------------------------------------------------------------

export const explain = action({
  args: { prompt: v.string() },
  returns: explainResult,
  handler: async (ctx, { prompt }): Promise<CoachExplainResult> => {
    const userId = await requireUserId(ctx);
    const user = prompt.trim();
    check(user.length > 0 && user.length <= COACH_MAX_USER_PROMPT_LENGTH, "prompt : longueur hors limites");

    const apiKey = env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return { status: "unavailable", message: "Le Coach IA n'est pas configuré sur le serveur." };
    }
    const model = env.COACH_MODEL || DEFAULT_COACH_MODEL;
    const hash = await sha256(JSON.stringify([model, COACH_SYSTEM_PROMPT, user]));

    const cached: string | null = await ctx.runMutation(internal.coach.takeCached, { userId, hash });
    if (cached !== null) return { status: "ok", text: cached, cached: true };

    const quota = await ctx.runMutation(internal.coach.consumeQuota, { userId });
    if (!quota.ok) return { status: "quota", retryAfterMs: quota.retryAfterMs };

    let completion;
    try {
      completion = await callCoachModel({ apiKey, model, system: COACH_SYSTEM_PROMPT, user });
    } catch (error) {
      await ctx.runMutation(internal.coach.refundQuota, { userId });
      console.error("[coach.explain] échec de l'appel au LLM", error);
      return {
        status: "unavailable",
        message:
          error instanceof CoachModelError
            ? error.message
            : "Le Coach est momentanément indisponible. Réessaie dans un instant.",
      };
    }

    await ctx.runMutation(internal.coach.recordExplanation, {
      userId,
      hash,
      model: completion.model,
      text: completion.text,
      inputTokens: completion.inputTokens,
      outputTokens: completion.outputTokens,
    });
    return { status: "ok", text: completion.text, cached: false };
  },
});
