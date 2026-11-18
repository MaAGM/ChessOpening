import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Schéma Convex de ChessmateTheory (équivalent de supabase/schema/phase2 + phase3, conservés en archive).
 *
 * - `userId` est `identity.tokenIdentifier` (émetteur + utilisateur Better Auth), lu côté serveur : le client
 *   ne choisit jamais l'utilisateur d'une écriture (équivalent des politiques RLS).
 * - Toutes les dates sont des millisecondes depuis l'epoch.
 * - Les comptes, sessions et profils sont gérés par le composant Better Auth (convex.config.ts) :
 *   la table `profiles` de Supabase n'a donc pas d'équivalent ici.
 */
export default defineSchema({
  /** Une fiche Leitner par position (clé FEN) et par utilisateur (ex-`user_positions`). */
  userPositions: defineTable({
    userId: v.string(),
    positionKey: v.string(),
    fen: v.string(),
    box: v.number(),
    nextReviewAt: v.number(),
    lastReviewedAt: v.union(v.number(), v.null()),
    attempts: v.number(),
    failures: v.number(),
    /** 5 derniers résultats (1 = juste du premier coup, 0 = raté). */
    recentResults: v.array(v.number()),
    updatedAt: v.number(),
  })
    .index("by_userId_and_positionKey", ["userId", "positionKey"])
    .index("by_userId_and_nextReviewAt", ["userId", "nextReviewAt"]),

  /** État des chapitres par utilisateur (ex-`user_chapters`). */
  userChapters: defineTable({
    userId: v.string(),
    chapterId: v.string(),
    completedAt: v.union(v.number(), v.null()),
    addedToReviewAt: v.union(v.number(), v.null()),
    updatedAt: v.number(),
  }).index("by_userId_and_chapterId", ["userId", "chapterId"]),

  /**
   * Un répertoire = un document (ex-`user_repertoires`).
   *
   * `data` est le JSON sérialisé de `RepertoireData` ({ version, position, children, origin,
   * comment }) : un arbre de variantes est trop profond pour une valeur Convex imbriquée,
   * et la chaîne permet de contrôler la taille (limite de 1 Mio par document).
   *
   * `updatedAt` est la date d'édition FOURNIE PAR L'APPAREIL : elle départage deux appareils
   * (la mutation `repertoires.upsert` refuse une version plus ancienne que celle du serveur).
   */
  userRepertoires: defineTable({
    userId: v.string(),
    repertoireId: v.string(),
    name: v.string(),
    side: v.union(v.literal("white"), v.literal("black")),
    category: v.union(v.string(), v.null()),
    reviewEnabled: v.boolean(),
    data: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.union(v.number(), v.null()),
  })
    .index("by_userId_and_repertoireId", ["userId", "repertoireId"])
    .index("by_userId_and_updatedAt", ["userId", "updatedAt"]),
});
