import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { check, checkBatch, checkCount, checkLength, requireUserId } from "./lib/validation";

/**
 * Révisions Leitner (fiches de positions et état des chapitres).
 * Remplace les anciennes tables Supabase `user_positions` / `user_chapters` : le client garde le calcul des différences
 * (`ChangeSet`), le serveur applique chaque lot dans une transaction.
 */

const MAX_BOX = 5;
const MAX_RECENT = 5;

const positionValidator = v.object({
  positionKey: v.string(),
  fen: v.string(),
  box: v.number(),
  nextReviewAt: v.number(),
  lastReviewedAt: v.union(v.number(), v.null()),
  attempts: v.number(),
  failures: v.number(),
  recentResults: v.array(v.number()),
});

// ---------------------------------------------------------------------------
// Lectures (paginées : une requête Convex lit un volume limité de documents)
// ---------------------------------------------------------------------------
export const listPositions = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, { paginationOpts }) => {
    const userId = await requireUserId(ctx);
    const page = await ctx.db
      .query("userPositions")
      .withIndex("by_userId_and_positionKey", (q) => q.eq("userId", userId))
      .paginate(paginationOpts);
    return {
      ...page,
      page: page.page.map((row) => ({
        positionKey: row.positionKey,
        box: row.box,
        nextReviewAt: row.nextReviewAt,
        lastReviewedAt: row.lastReviewedAt,
        attempts: row.attempts,
        failures: row.failures,
        recentResults: row.recentResults,
      })),
    };
  },
});

export const listChapters = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, { paginationOpts }) => {
    const userId = await requireUserId(ctx);
    const page = await ctx.db
      .query("userChapters")
      .withIndex("by_userId_and_chapterId", (q) => q.eq("userId", userId))
      .paginate(paginationOpts);
    return {
      ...page,
      page: page.page.map((row) => ({
        chapterId: row.chapterId,
        completedAt: row.completedAt,
        addedToReviewAt: row.addedToReviewAt,
      })),
    };
  },
});

// ---------------------------------------------------------------------------
// Écritures
// ---------------------------------------------------------------------------

/** Upsert de fiches et suppressions (réinitialisation de la progression). */
export const applyPositionChanges = mutation({
  args: {
    upserts: v.array(positionValidator),
    deletes: v.array(v.string()),
  },
  handler: async (ctx, { upserts, deletes }) => {
    const userId = await requireUserId(ctx);
    checkBatch(upserts);
    checkBatch(deletes);
    const now = Date.now();

    for (const position of upserts) {
      checkLength(position.positionKey, 1, 100, "positionKey");
      checkLength(position.fen, 1, 100, "fen");
      check(Number.isInteger(position.box) && position.box >= 1 && position.box <= MAX_BOX, "box : 1 à 5");
      checkCount(position.attempts, "attempts");
      checkCount(position.failures, "failures");
      check(
        position.recentResults.length <= MAX_RECENT &&
          position.recentResults.every((r) => r === 0 || r === 1),
        "recentResults : 5 valeurs 0/1 au plus",
      );

      const existing = await ctx.db
        .query("userPositions")
        .withIndex("by_userId_and_positionKey", (q) =>
          q.eq("userId", userId).eq("positionKey", position.positionKey),
        )
        .unique();
      if (existing) await ctx.db.patch("userPositions", existing._id, { ...position, updatedAt: now });
      else await ctx.db.insert("userPositions", { ...position, userId, updatedAt: now });
    }

    for (const positionKey of deletes) {
      const existing = await ctx.db
        .query("userPositions")
        .withIndex("by_userId_and_positionKey", (q) => q.eq("userId", userId).eq("positionKey", positionKey))
        .unique();
      if (existing) await ctx.db.delete("userPositions", existing._id);
    }
  },
});

/**
 * Changements de chapitres, dans l'ordre de `reviewRemote.pushChanges` :
 * ajouts aux révisions, complétions, retraits (colonne vidée), puis suppression des lignes vides.
 * Une ligne n'existe que si l'une des deux dates est renseignée.
 */
export const applyChapterChanges = mutation({
  args: {
    reviewSet: v.array(v.object({ chapterId: v.string(), addedAt: v.number() })),
    completedSet: v.array(v.string()),
    reviewClear: v.array(v.string()),
    completedClear: v.array(v.string()),
    deletes: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    for (const list of [args.reviewSet, args.completedSet, args.reviewClear, args.completedClear, args.deletes]) {
      checkBatch(list);
    }
    const now = Date.now();

    const find = (chapterId: string) =>
      ctx.db
        .query("userChapters")
        .withIndex("by_userId_and_chapterId", (q) => q.eq("userId", userId).eq("chapterId", chapterId))
        .unique();

    async function set(chapterId: string, patch: { addedToReviewAt?: number; completedAt?: number }) {
      checkLength(chapterId, 1, 100, "chapterId");
      const existing = await find(chapterId);
      if (existing) {
        await ctx.db.patch("userChapters", existing._id, { ...patch, updatedAt: now });
      } else {
        await ctx.db.insert("userChapters", {
          userId,
          chapterId,
          addedToReviewAt: patch.addedToReviewAt ?? null,
          completedAt: patch.completedAt ?? null,
          updatedAt: now,
        });
      }
    }

    async function clear(chapterId: string, field: "addedToReviewAt" | "completedAt") {
      const existing = await find(chapterId);
      if (existing) await ctx.db.patch("userChapters", existing._id, { [field]: null, updatedAt: now });
    }

    for (const { chapterId, addedAt } of args.reviewSet) await set(chapterId, { addedToReviewAt: addedAt });
    for (const chapterId of args.completedSet) await set(chapterId, { completedAt: now });
    for (const chapterId of args.reviewClear) await clear(chapterId, "addedToReviewAt");
    for (const chapterId of args.completedClear) await clear(chapterId, "completedAt");
    for (const chapterId of args.deletes) {
      const existing = await find(chapterId);
      if (existing) await ctx.db.delete("userChapters", existing._id);
    }
  },
});
