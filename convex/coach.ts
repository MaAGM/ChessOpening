import { DAY, MINUTE, RateLimiter } from "@convex-dev/rate-limiter";
import { v } from "convex/values";
import {
  buildChatTurns,
  COACH_CHAT_MAX_COMMENT_LENGTH,
  COACH_CHAT_MAX_ENGINE_LINE,
  COACH_CHAT_MAX_EXPECTED_MOVES,
  COACH_CHAT_MAX_EXPLORER_MOVES,
  COACH_CHAT_MAX_FEN_LENGTH,
  COACH_CHAT_MAX_HISTORY,
  COACH_CHAT_MAX_LESSON_TITLE_LENGTH,
  COACH_CHAT_MAX_MESSAGE_LENGTH,
  COACH_CHAT_MAX_MOVES,
  COACH_CHAT_MAX_OBJECTIVE_LENGTH,
  COACH_CHAT_MAX_OBJECTIVES,
  COACH_CHAT_MAX_OPENING_LENGTH,
  COACH_CHAT_MAX_REPLY_LENGTH,
  COACH_CHAT_MAX_SAN_LENGTH,
  coachSystemPrompt,
  maskSpoilers,
  type CoachChatMessage,
  type CoachLessonContext,
  type CoachPositionSnapshot,
} from "../src/lib/coach/chatProtocol";
import { components, internal } from "./_generated/api";
import { action, env, internalMutation, query, type MutationCtx } from "./_generated/server";
import { callCoachModel, CoachModelError, DEFAULT_COACH_MODEL } from "./lib/llm";
import { check, requireUserId } from "./lib/validation";

/**
 * Coach IA : discussion sur la position du mode Exploration, ou du cours suivi en mode
 * Apprentissage (jamais en Révision : le client n'y affiche pas le Coach).
 *
 * Le client envoie l'historique récent de la discussion et un instantané structuré de
 * ce qu'il voit (position, coups, explorateur, Stockfish, cours). Le serveur valide tout,
 * met le contexte en forme et garde pour lui les consignes, la clé d'API et le modèle.
 * En Apprentissage, quand c'est à l'élève de jouer, le coup attendu est masqué dans la
 * réponse (en plus de la consigne qui interdit de le révéler).
 *
 * Garde-fous contre la surconsommation :
 *  - utilisateur connecté uniquement (`requireUserId`) ;
 *  - 30 messages par 24 h glissantes et 6 par minute, par utilisateur ;
 *  - 400 messages par 24 h tous utilisateurs confondus (coupe-circuit global) ;
 *  - budget de 200 000 tokens d'entrée par utilisateur et par jour (UTC) ;
 *  - historique ≤ 10 messages, question ≤ 500 caractères, contexte borné ;
 *  - sortie ≤ 600 tokens (`convex/lib/llm.ts`) ;
 *  - `COACH_CHAT_ENABLED=false` coupe le chat sans redéploiement.
 * Un appel au LLM qui échoue rend les jetons consommés.
 */

export const COACH_DAILY_LIMIT = 30;
export const COACH_BURST_LIMIT = 6;
export const COACH_GLOBAL_DAILY_LIMIT = 400;
export const COACH_DAILY_INPUT_TOKEN_BUDGET = 200_000;

/** Seaux de quotas du Coach (exporté pour les tests : ce n'est pas une fonction Convex). */
export const rateLimiter = new RateLimiter(components.rateLimiter, {
  coachDaily: { kind: "token bucket", rate: COACH_DAILY_LIMIT, period: DAY, capacity: COACH_DAILY_LIMIT },
  coachBurst: { kind: "token bucket", rate: COACH_BURST_LIMIT, period: MINUTE, capacity: COACH_BURST_LIMIT },
  coachGlobal: {
    kind: "token bucket",
    rate: COACH_GLOBAL_DAILY_LIMIT,
    period: DAY,
    capacity: COACH_GLOBAL_DAILY_LIMIT,
  },
});

const quotaScope = v.union(v.literal("user"), v.literal("global"), v.literal("budget"));

const chatResult = v.union(
  v.object({ status: v.literal("ok"), text: v.string(), remaining: v.number() }),
  v.object({ status: v.literal("quota"), scope: quotaScope, retryAfterMs: v.number() }),
  v.object({ status: v.literal("unavailable"), message: v.string() }),
);

export type CoachQuotaScope = "user" | "global" | "budget";

export type CoachChatResult =
  | { status: "ok"; text: string; remaining: number }
  | { status: "quota"; scope: CoachQuotaScope; retryAfterMs: number }
  | { status: "unavailable"; message: string };

const messageValidator = v.object({
  role: v.union(v.literal("user"), v.literal("assistant")),
  content: v.string(),
  moves: v.optional(v.array(v.string())),
});

const scoreValidator = v.object({ type: v.union(v.literal("cp"), v.literal("mate")), value: v.number() });

const positionValidator = v.object({
  fen: v.string(),
  moves: v.array(v.string()),
  openingName: v.union(v.string(), v.null()),
  engine: v.union(v.null(), v.object({ score: scoreValidator, depth: v.number(), line: v.array(v.string()) })),
  explorer: v.union(
    v.null(),
    v.object({
      totalGames: v.number(),
      moves: v.array(
        v.object({
          san: v.string(),
          games: v.number(),
          white: v.number(),
          draws: v.number(),
          black: v.number(),
          averageRating: v.number(),
        }),
      ),
    }),
  ),
  boardOrientation: v.optional(v.union(v.literal("white"), v.literal("black"))),
  // Mode Apprentissage : cours suivi et coup(s) attendu(s) (gardés secrets par le Coach).
  lesson: v.optional(
    v.object({
      courseName: v.string(),
      chapterTitle: v.string(),
      lessonTitle: v.string(),
      objectives: v.array(v.string()),
      comment: v.union(v.string(), v.null()),
      expectedMoves: v.array(v.string()),
    }),
  ),
});

// ---------------------------------------------------------------------------
// Validation des entrées
// ---------------------------------------------------------------------------

const FEN_PATTERN =
  /^([pnbrqkPNBRQK1-8]{1,8}\/){7}[pnbrqkPNBRQK1-8]{1,8} [wb] (-|[KQkq]{1,4}) (-|[a-h][36]) \d{1,3} \d{1,4}$/;
const SAN_PATTERN = /^[a-hKQRBNO0x1-8=+#\-]+$/;

function isFiniteInRange(value: number, min: number, max: number): boolean {
  return Number.isFinite(value) && value >= min && value <= max;
}

function checkSanList(moves: readonly string[], max: number, field: string): void {
  check(moves.length <= max, `${field} : trop de coups`);
  for (const san of moves) {
    check(san.length > 0 && san.length <= COACH_CHAT_MAX_SAN_LENGTH && SAN_PATTERN.test(san), `${field} : coup invalide`);
  }
}

/** Valide l'historique : alterné, commence et finit par une question, tailles bornées. */
export function validateMessages(messages: readonly CoachChatMessage[]): CoachChatMessage[] {
  check(messages.length > 0 && messages.length <= COACH_CHAT_MAX_HISTORY, "messages : historique hors limites");
  check(messages[messages.length - 1].role === "user", "messages : le dernier message doit être une question");
  return messages.map((message, index) => {
    const expected = index % 2 === 0 ? "user" : "assistant";
    check(message.role === expected, "messages : les rôles doivent alterner en commençant par une question");
    const content = message.content.trim();
    const max = message.role === "user" ? COACH_CHAT_MAX_MESSAGE_LENGTH : COACH_CHAT_MAX_REPLY_LENGTH;
    check(content.length > 0 && content.length <= max, "messages : longueur hors limites");
    if (message.moves) checkSanList(message.moves, COACH_CHAT_MAX_MOVES, "messages");
    return message.role === "user"
      ? { role: "user", content, ...(message.moves ? { moves: message.moves } : {}) }
      : { role: "assistant", content };
  });
}

export function validatePosition(position: CoachPositionSnapshot): void {
  const fen = position.fen.trim();
  check(fen.length <= COACH_CHAT_MAX_FEN_LENGTH && FEN_PATTERN.test(fen), "position : FEN invalide");
  checkSanList(position.moves, COACH_CHAT_MAX_MOVES, "position");
  check(
    position.openingName === null || position.openingName.length <= COACH_CHAT_MAX_OPENING_LENGTH,
    "position : nom d'ouverture trop long",
  );
  if (position.engine) {
    const { score, depth, line } = position.engine;
    check(isFiniteInRange(score.value, -100_000, 100_000) && Number.isInteger(score.value), "position : score invalide");
    check(isFiniteInRange(depth, 0, 100), "position : profondeur invalide");
    checkSanList(line, COACH_CHAT_MAX_ENGINE_LINE, "position");
  }
  if (position.explorer) {
    const { totalGames, moves } = position.explorer;
    check(isFiniteInRange(totalGames, 0, 1e9), "position : explorateur invalide");
    check(moves.length <= COACH_CHAT_MAX_EXPLORER_MOVES, "position : trop de coups d'explorateur");
    for (const move of moves) {
      checkSanList([move.san], 1, "position");
      check(
        isFiniteInRange(move.games, 0, 1e9) &&
          isFiniteInRange(move.white, 0, 100) &&
          isFiniteInRange(move.draws, 0, 100) &&
          isFiniteInRange(move.black, 0, 100) &&
          isFiniteInRange(move.averageRating, 0, 4000),
        "position : statistiques invalides",
      );
    }
  }
  if (position.lesson) validateLesson(position.lesson);
}

function validateLesson(lesson: CoachLessonContext): void {
  for (const title of [lesson.courseName, lesson.chapterTitle, lesson.lessonTitle]) {
    check(title.trim().length > 0 && title.length <= COACH_CHAT_MAX_LESSON_TITLE_LENGTH, "cours : titre invalide");
  }
  check(lesson.objectives.length <= COACH_CHAT_MAX_OBJECTIVES, "cours : trop d'objectifs");
  for (const objective of lesson.objectives) {
    check(objective.length <= COACH_CHAT_MAX_OBJECTIVE_LENGTH, "cours : objectif trop long");
  }
  check(lesson.comment === null || lesson.comment.length <= COACH_CHAT_MAX_COMMENT_LENGTH, "cours : commentaire trop long");
  checkSanList(lesson.expectedMoves, COACH_CHAT_MAX_EXPECTED_MOVES, "cours");
}

// ---------------------------------------------------------------------------
// Suivi d'utilisation
// ---------------------------------------------------------------------------

function utcDay(now: number): string {
  return new Date(now).toISOString().slice(0, 10);
}

function msUntilNextUtcDay(now: number): number {
  const next = new Date(now);
  next.setUTCHours(24, 0, 0, 0);
  return next.getTime() - now;
}

async function usageOfDay(ctx: Pick<MutationCtx, "db">, userId: string, day: string) {
  return ctx.db
    .query("coachUsage")
    .withIndex("by_userId_and_day", (q) => q.eq("userId", userId).eq("day", day))
    .unique();
}

// ---------------------------------------------------------------------------
// Fonctions internes (appelées par l'action)
// ---------------------------------------------------------------------------

/**
 * Consomme un jeton de chaque quota, ou aucun : budget de tokens et seaux sont vérifiés
 * avant d'en débiter un (la mutation est une transaction).
 */
export const consumeQuota = internalMutation({
  args: { userId: v.string() },
  returns: v.union(
    v.object({ ok: v.literal(true), remaining: v.number() }),
    v.object({ ok: v.literal(false), scope: quotaScope, retryAfterMs: v.number() }),
  ),
  handler: async (ctx, { userId }) => {
    const now = Date.now();
    const usage = await usageOfDay(ctx, userId, utcDay(now));
    if (usage && usage.inputTokens >= COACH_DAILY_INPUT_TOKEN_BUDGET) {
      return { ok: false as const, scope: "budget" as const, retryAfterMs: msUntilNextUtcDay(now) };
    }

    const daily = await rateLimiter.check(ctx, "coachDaily", { key: userId });
    const burst = await rateLimiter.check(ctx, "coachBurst", { key: userId });
    if (!daily.ok || !burst.ok) {
      const retryAfterMs = Math.max(daily.ok ? 0 : daily.retryAfter, burst.ok ? 0 : burst.retryAfter);
      return { ok: false as const, scope: "user" as const, retryAfterMs: Math.ceil(retryAfterMs) };
    }
    const global = await rateLimiter.check(ctx, "coachGlobal");
    if (!global.ok) {
      return { ok: false as const, scope: "global" as const, retryAfterMs: Math.ceil(global.retryAfter) };
    }

    await rateLimiter.limit(ctx, "coachDaily", { key: userId, throws: true });
    await rateLimiter.limit(ctx, "coachBurst", { key: userId, throws: true });
    await rateLimiter.limit(ctx, "coachGlobal", { throws: true });
    const { value } = await rateLimiter.getValue(ctx, "coachDaily", { key: userId });
    return { ok: true as const, remaining: Math.max(0, Math.floor(value)) };
  },
});

/** Rend les jetons d'un appel au LLM qui a échoué (l'utilisateur n'a rien reçu). */
export const refundQuota = internalMutation({
  args: { userId: v.string() },
  returns: v.null(),
  handler: async (ctx, { userId }) => {
    await rateLimiter.credit(ctx, "coachDaily", { key: userId });
    await rateLimiter.credit(ctx, "coachBurst", { key: userId });
    await rateLimiter.credit(ctx, "coachGlobal");
    return null;
  },
});

/** Ajoute un message facturé et ses tokens au suivi du jour. */
export const recordUsage = internalMutation({
  args: { userId: v.string(), inputTokens: v.number(), outputTokens: v.number() },
  returns: v.null(),
  handler: async (ctx, { userId, inputTokens, outputTokens }) => {
    const now = Date.now();
    const day = utcDay(now);
    const existing = await usageOfDay(ctx, userId, day);
    if (existing) {
      await ctx.db.patch("coachUsage", existing._id, {
        requests: existing.requests + 1,
        inputTokens: existing.inputTokens + inputTokens,
        outputTokens: existing.outputTokens + outputTokens,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("coachUsage", {
        userId,
        day,
        requests: 1,
        cachedHits: 0,
        inputTokens,
        outputTokens,
        updatedAt: now,
      });
    }
    return null;
  },
});

// ---------------------------------------------------------------------------
// API publique
// ---------------------------------------------------------------------------

/** Messages restants pour l'utilisateur courant (null pour un invité). */
export const remaining = query({
  args: {},
  returns: v.union(v.null(), v.object({ remaining: v.number(), limit: v.number() })),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const { value } = await rateLimiter.getValue(ctx, "coachDaily", { key: identity.tokenIdentifier });
    return { remaining: Math.max(0, Math.floor(value)), limit: COACH_DAILY_LIMIT };
  },
});

const UNAVAILABLE = "Le Coach est momentanément indisponible. Réessaie dans un instant.";

function chatEnabled(): boolean {
  const flag = env.COACH_CHAT_ENABLED?.trim().toLowerCase();
  return !(flag === "false" || flag === "0" || flag === "off");
}

export const chat = action({
  args: { messages: v.array(messageValidator), position: positionValidator },
  returns: chatResult,
  handler: async (ctx, args): Promise<CoachChatResult> => {
    const userId = await requireUserId(ctx);
    const messages = validateMessages(args.messages);
    validatePosition(args.position);

    if (!chatEnabled()) {
      return { status: "unavailable", message: "Le Coach est désactivé pour le moment." };
    }
    const apiKey = env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return { status: "unavailable", message: "Le Coach IA n'est pas configuré sur le serveur." };
    }
    const model = env.COACH_MODEL || DEFAULT_COACH_MODEL;

    const quota = await ctx.runMutation(internal.coach.consumeQuota, { userId });
    if (!quota.ok) return { status: "quota", scope: quota.scope, retryAfterMs: quota.retryAfterMs };

    const position = { ...args.position, fen: args.position.fen.trim() };
    let completion;
    try {
      completion = await callCoachModel({
        apiKey,
        model,
        system: coachSystemPrompt(position),
        messages: buildChatTurns(messages, position),
      });
    } catch (error) {
      await ctx.runMutation(internal.coach.refundQuota, { userId });
      console.error("[coach.chat] échec de l'appel au LLM", error);
      return { status: "unavailable", message: error instanceof CoachModelError ? error.message : UNAVAILABLE };
    }

    await ctx.runMutation(internal.coach.recordUsage, {
      userId,
      inputTokens: completion.inputTokens,
      outputTokens: completion.outputTokens,
    });
    // Filet de sécurité du mode Apprentissage : le coup à trouver n'apparaît jamais en clair.
    const text = maskSpoilers(completion.text, position).slice(0, COACH_CHAT_MAX_REPLY_LENGTH);
    return { status: "ok", text, remaining: quota.remaining };
  },
});
