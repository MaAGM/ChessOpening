import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { MAX_CLOCK_SKEW_MS, check, checkBatch, checkLength, requireUserId } from "./lib/validation";

/**
 * Répertoires (remplace l'ancienne table Supabase `user_repertoires` et son déclencheur SQL
 * `user_repertoires_guard`) : « la version la plus récente gagne », côté serveur.
 *
 * - une version plus ancienne que celle du serveur est ignorée sans erreur ;
 * - l'horodatage est plafonné à « maintenant + 5 minutes » ;
 * - `createdAt` et `userId` ne changent jamais après la création ;
 * - suppression douce (`deletedAt`) : une suppression est une version comme une autre.
 */

/** Taille maximale du JSON `data` (un document Convex est limité à 1 Mio). */
export const MAX_DATA_BYTES = 900 * 1024;
/** Les arbres peuvent être volumineux : lots plus petits que pour les révisions. */
export const MAX_REPERTOIRE_BATCH = 10;

const repertoireValidator = v.object({
  repertoireId: v.string(),
  name: v.string(),
  side: v.union(v.literal("white"), v.literal("black")),
  category: v.union(v.string(), v.null()),
  reviewEnabled: v.boolean(),
  data: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
});

function byteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, { paginationOpts }) => {
    const userId = await requireUserId(ctx);
    const page = await ctx.db
      .query("userRepertoires")
      .withIndex("by_userId_and_repertoireId", (q) => q.eq("userId", userId))
      .paginate(paginationOpts);
    return {
      ...page,
      page: page.page.map((row) => ({
        repertoireId: row.repertoireId,
        name: row.name,
        side: row.side,
        category: row.category,
        reviewEnabled: row.reviewEnabled,
        data: row.data,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        deletedAt: row.deletedAt,
      })),
    };
  },
});

/** Créations, modifications et changements de position. Renvoie les ids ignorés (versions périmées). */
export const upsert = mutation({
  args: { items: v.array(repertoireValidator) },
  handler: async (ctx, { items }) => {
    const userId = await requireUserId(ctx);
    checkBatch(items, MAX_REPERTOIRE_BATCH);
    const maxTime = Date.now() + MAX_CLOCK_SKEW_MS;
    const skipped: string[] = [];

    for (const item of items) {
      checkLength(item.repertoireId, 1, 64, "repertoireId");
      checkLength(item.name, 1, 80, "name");
      if (item.category !== null) checkLength(item.category, 1, 60, "category");
      check(byteLength(item.data) <= MAX_DATA_BYTES, "data : répertoire trop volumineux");
      let parsed: unknown;
      try {
        parsed = JSON.parse(item.data);
      } catch {
        parsed = null;
      }
      check(typeof parsed === "object" && parsed !== null && !Array.isArray(parsed), "data : objet JSON attendu");

      const updatedAt = Math.min(item.updatedAt, maxTime);
      const existing = await ctx.db
        .query("userRepertoires")
        .withIndex("by_userId_and_repertoireId", (q) =>
          q.eq("userId", userId).eq("repertoireId", item.repertoireId),
        )
        .unique();

      if (!existing) {
        await ctx.db.insert("userRepertoires", { ...item, userId, updatedAt, deletedAt: null });
        continue;
      }
      if (updatedAt < existing.updatedAt) {
        skipped.push(item.repertoireId);
        continue;
      }
      const { createdAt: _ignored, ...rest } = item;
      void _ignored;
      await ctx.db.patch("userRepertoires", existing._id, { ...rest, updatedAt, deletedAt: null });
    }
    return { skipped };
  },
});

/**
 * Suppressions douces : la date de suppression sert aussi de date de modification, pour
 * qu'une suppression périmée soit refusée. Un répertoire absent du serveur est ignoré.
 */
export const softDelete = mutation({
  args: { items: v.array(v.object({ repertoireId: v.string(), deletedAt: v.number() })) },
  handler: async (ctx, { items }) => {
    const userId = await requireUserId(ctx);
    checkBatch(items);
    const maxTime = Date.now() + MAX_CLOCK_SKEW_MS;
    const skipped: string[] = [];

    for (const { repertoireId, deletedAt } of items) {
      const at = Math.min(deletedAt, maxTime);
      const existing = await ctx.db
        .query("userRepertoires")
        .withIndex("by_userId_and_repertoireId", (q) => q.eq("userId", userId).eq("repertoireId", repertoireId))
        .unique();
      if (!existing) continue;
      if (at < existing.updatedAt) {
        skipped.push(repertoireId);
        continue;
      }
      await ctx.db.patch("userRepertoires", existing._id, { deletedAt: at, updatedAt: at });
    }
    return { skipped };
  },
});
