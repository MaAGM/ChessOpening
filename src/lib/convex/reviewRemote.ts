import { api } from "../../../convex/_generated/api";
import { callMutation, callQuery, chunks, fetchAllPages, type ConvexCaller } from "./caller";
import { fenFromPositionKey } from "@/lib/review/positionKey";
import type { ChangeSet, ReviewRemote } from "@/lib/review/reviewSync";
import type { ReviewStoreState } from "@/lib/review/reviewStore";
import type { PositionStats } from "@/lib/review/srs";

/** Fiches lues par page (une requête Convex lit un volume limité de documents). */
export const POSITION_PAGE_SIZE = 1000;
export const CHAPTER_PAGE_SIZE = 1000;
/** Taille maximale d'un lot d'écriture (doit rester ≤ MAX_BATCH côté serveur). */
export const WRITE_CHUNK = 500;

export type PositionDoc = {
  positionKey: string;
  fen: string;
  box: number;
  nextReviewAt: number;
  lastReviewedAt: number | null;
  attempts: number;
  failures: number;
  recentResults: number[];
};

// ---------------------------------------------------------------------------
// Conversions état local <-> documents Convex
// ---------------------------------------------------------------------------
export function statsToPosition(key: string, stats: PositionStats): PositionDoc {
  return {
    positionKey: key,
    fen: fenFromPositionKey(key),
    box: stats.box,
    nextReviewAt: stats.due,
    lastReviewedAt: stats.lastSeen > 0 ? stats.lastSeen : null,
    attempts: stats.attempts,
    failures: stats.failures,
    recentResults: stats.recent,
  };
}

export function positionToStats(doc: Omit<PositionDoc, "positionKey" | "fen">): PositionStats {
  return {
    box: doc.box,
    due: doc.nextReviewAt,
    attempts: doc.attempts,
    failures: doc.failures,
    lastSeen: doc.lastReviewedAt ?? 0,
    recent: doc.recentResults,
  };
}

// ---------------------------------------------------------------------------
// Implémentation Convex
// ---------------------------------------------------------------------------
export function createConvexReviewRemote(
  client: ConvexCaller,
  options: { pageSize?: number } = {},
): ReviewRemote {
  const positionPageSize = options.pageSize ?? POSITION_PAGE_SIZE;
  const chapterPageSize = options.pageSize ?? CHAPTER_PAGE_SIZE;

  async function pushPositions(changes: ChangeSet): Promise<void> {
    const upserts = Object.entries(changes.positionsUpsert).map(([key, stats]) => statsToPosition(key, stats));
    const deletes = changes.positionsDelete;
    if (upserts.length === 0 && deletes.length === 0) return;

    // Cas courant : un seul appel, donc une seule transaction.
    if (upserts.length <= WRITE_CHUNK && deletes.length <= WRITE_CHUNK) {
      await callMutation(client, api.reviews.applyPositionChanges, { upserts, deletes });
      return;
    }
    // Gros volumes (migration d'invité) : les écritures puis les suppressions, par lots.
    for (const chunk of chunks(upserts, WRITE_CHUNK)) {
      await callMutation(client, api.reviews.applyPositionChanges, { upserts: chunk, deletes: [] });
    }
    for (const chunk of chunks(deletes, WRITE_CHUNK)) {
      await callMutation(client, api.reviews.applyPositionChanges, { upserts: [], deletes: chunk });
    }
  }

  async function pushChapters(changes: ChangeSet): Promise<void> {
    const lists = {
      reviewSet: Object.entries(changes.chaptersReviewSet).map(([chapterId, addedAt]) => ({ chapterId, addedAt })),
      completedSet: changes.chaptersCompletedSet,
      reviewClear: changes.chaptersReviewClear,
      completedClear: changes.chaptersCompletedClear,
      deletes: changes.chaptersDelete,
    };
    const empty = { reviewSet: [], completedSet: [], reviewClear: [], completedClear: [], deletes: [] };
    const values = Object.values(lists);
    if (values.every((list) => list.length === 0)) return;

    if (values.every((list) => list.length <= WRITE_CHUNK)) {
      await callMutation(client, api.reviews.applyChapterChanges, lists);
      return;
    }
    // Même ordre que le serveur : ajouts, complétions, retraits, puis suppressions.
    for (const chunk of chunks(lists.reviewSet, WRITE_CHUNK)) {
      await callMutation(client, api.reviews.applyChapterChanges, { ...empty, reviewSet: chunk });
    }
    for (const field of ["completedSet", "reviewClear", "completedClear", "deletes"] as const) {
      for (const chunk of chunks(lists[field], WRITE_CHUNK)) {
        await callMutation(client, api.reviews.applyChapterChanges, { ...empty, [field]: chunk });
      }
    }
  }

  return {
    async fetchState(): Promise<ReviewStoreState> {
      const [positions, chapters] = await Promise.all([
        fetchAllPages(
          (paginationOpts) => callQuery(client, api.reviews.listPositions, { paginationOpts }),
          positionPageSize,
        ),
        fetchAllPages(
          (paginationOpts) => callQuery(client, api.reviews.listChapters, { paginationOpts }),
          chapterPageSize,
        ),
      ]);

      const state: ReviewStoreState = { version: 2, reviewChapters: {}, completedChapters: [], positions: {} };
      for (const doc of positions) state.positions[doc.positionKey] = positionToStats(doc);
      for (const doc of chapters) {
        if (doc.addedToReviewAt !== null) state.reviewChapters[doc.chapterId] = { addedAt: doc.addedToReviewAt };
        if (doc.completedAt !== null) state.completedChapters.push(doc.chapterId);
      }
      return state;
    },

    async pushChanges(_userId, changes: ChangeSet): Promise<void> {
      await pushPositions(changes);
      await pushChapters(changes);
    },
  };
}
