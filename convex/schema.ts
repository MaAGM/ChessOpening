import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Schéma Convex de ChessmateTheory (équivalent des scripts SQL archivés dans docs/archive/supabase/).
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

  /**
   * Suivi d'utilisation du Coach IA : une ligne par utilisateur et par jour (UTC, « AAAA-MM-JJ »).
   * Les quotas eux-mêmes sont appliqués par le composant `rateLimiter` ; cette table sert au suivi
   * (messages facturés, tokens consommés) et au budget journalier de tokens par utilisateur.
   * `cachedHits` ne sert plus (ancien cache du Coach de révision).
   */
  coachUsage: defineTable({
    userId: v.string(),
    day: v.string(),
    requests: v.number(),
    cachedHits: v.number(),
    inputTokens: v.number(),
    outputTokens: v.number(),
    updatedAt: v.number(),
  }).index("by_userId_and_day", ["userId", "day"]),

  /**
   * OBSOLÈTE : cache de l'ancien Coach de révision (explications indexées par empreinte SHA-256).
   * Plus lue ni écrite depuis le passage au chat du mode Exploration ; conservée dans le schéma
   * pour ne pas bloquer le déploiement tant qu'elle contient des documents.
   */
  coachExplanations: defineTable({
    hash: v.string(),
    model: v.string(),
    text: v.string(),
    createdAt: v.number(),
  }).index("by_hash", ["hash"]),
});
