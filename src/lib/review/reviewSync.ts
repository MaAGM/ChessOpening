import type { ReviewStoreState } from "./reviewStore";
import type { PositionStats } from "./srs";
import {
  SyncEngine,
  type GenericSyncEngineDeps,
  type SyncRemote,
  type SyncStrategy,
} from "@/lib/sync/syncEngine";

// ===========================================================================
// Fonctions pures : fusion et différences d'états
// ===========================================================================

/** Ensemble des opérations à envoyer au cloud pour passer d'un état à un autre. */
export type ChangeSet = {
  positionsUpsert: Record<string, PositionStats>;
  positionsDelete: string[];
  /** chapterId -> date d'ajout aux révisions (ms) */
  chaptersReviewSet: Record<string, number>;
  /** Chapitres retirés des révisions mais encore complétés (la ligne reste) */
  chaptersReviewClear: string[];
  chaptersCompletedSet: string[];
  chaptersCompletedClear: string[];
  /** Chapitres sans plus aucune donnée : la ligne est supprimée */
  chaptersDelete: string[];
};

export function createEmptyChangeSet(): ChangeSet {
  return {
    positionsUpsert: {},
    positionsDelete: [],
    chaptersReviewSet: {},
    chaptersReviewClear: [],
    chaptersCompletedSet: [],
    chaptersCompletedClear: [],
    chaptersDelete: [],
  };
}

export function isEmptyChangeSet(changes: ChangeSet): boolean {
  return (
    Object.keys(changes.positionsUpsert).length === 0 &&
    changes.positionsDelete.length === 0 &&
    Object.keys(changes.chaptersReviewSet).length === 0 &&
    changes.chaptersReviewClear.length === 0 &&
    changes.chaptersCompletedSet.length === 0 &&
    changes.chaptersCompletedClear.length === 0 &&
    changes.chaptersDelete.length === 0
  );
}

function hasOwn(obj: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function statsEqual(a: PositionStats, b: PositionStats): boolean {
  return (
    a.box === b.box &&
    a.due === b.due &&
    a.attempts === b.attempts &&
    a.failures === b.failures &&
    a.lastSeen === b.lastSeen &&
    a.recent.length === b.recent.length &&
    a.recent.every((value, i) => value === b.recent[i])
  );
}

/** Entre deux versions d'une même fiche, garde la plus récente (puis la plus travaillée). */
function pickNewer(a: PositionStats, b: PositionStats): PositionStats {
  if (a.lastSeen !== b.lastSeen) return a.lastSeen > b.lastSeen ? a : b;
  return b.attempts > a.attempts ? b : a;
}

/**
 * Fusionne deux états (par exemple le cache local et le cloud).
 *  - chapitres ajoutés aux révisions et chapitres complétés : union ;
 *  - fiches : pour chaque position, la version la plus récente (dernier passage) l'emporte.
 * La fonction est pure et ne modifie aucune de ses entrées.
 */
export function mergeStates(a: ReviewStoreState, b: ReviewStoreState): ReviewStoreState {
  const reviewChapters = { ...a.reviewChapters };
  for (const [id, entry] of Object.entries(b.reviewChapters)) {
    reviewChapters[id] = hasOwn(reviewChapters, id)
      ? { ...reviewChapters[id], addedAt: Math.min(reviewChapters[id].addedAt, entry.addedAt) }
      : entry;
  }

  const completedChapters = Array.from(new Set([...a.completedChapters, ...b.completedChapters]));

  const positions = { ...a.positions };
  for (const [key, incoming] of Object.entries(b.positions)) {
    positions[key] = hasOwn(positions, key) ? pickNewer(positions[key], incoming) : incoming;
  }

  return { version: a.version, reviewChapters, completedChapters, positions };
}

/** Opérations à envoyer pour que le cloud, supposé égal à `prev`, devienne égal à `next`. */
export function diffStates(prev: ReviewStoreState, next: ReviewStoreState): ChangeSet {
  const changes = createEmptyChangeSet();

  // Fiches
  for (const [key, stats] of Object.entries(next.positions)) {
    if (!hasOwn(prev.positions, key) || !statsEqual(prev.positions[key], stats)) {
      changes.positionsUpsert[key] = stats;
    }
  }
  for (const key of Object.keys(prev.positions)) {
    if (!hasOwn(next.positions, key)) changes.positionsDelete.push(key);
  }

  // Chapitres
  const prevCompleted = new Set(prev.completedChapters);
  const nextCompleted = new Set(next.completedChapters);
  const ids = new Set([
    ...Object.keys(prev.reviewChapters),
    ...Object.keys(next.reviewChapters),
    ...prevCompleted,
    ...nextCompleted,
  ]);

  for (const id of ids) {
    const wasReview = hasOwn(prev.reviewChapters, id);
    const isReview = hasOwn(next.reviewChapters, id);
    const wasDone = prevCompleted.has(id);
    const isDone = nextCompleted.has(id);

    if (!isReview && !isDone) {
      if (wasReview || wasDone) changes.chaptersDelete.push(id);
      continue;
    }

    if (isReview && !wasReview) changes.chaptersReviewSet[id] = next.reviewChapters[id].addedAt;
    if (!isReview && wasReview) changes.chaptersReviewClear.push(id);
    if (isDone && !wasDone) changes.chaptersCompletedSet.push(id);
    if (!isDone && wasDone) changes.chaptersCompletedClear.push(id);
  }

  return changes;
}

// ===========================================================================
// Moteur de synchronisation (algorithme commun : src/lib/sync/syncEngine.ts)
// ===========================================================================

/** Accès au cloud (implémenté avec Supabase, remplaçable dans les tests). */
export type ReviewRemote = SyncRemote<ReviewStoreState, ChangeSet>;

export type SyncEngineDeps = Omit<GenericSyncEngineDeps<ReviewStoreState, ChangeSet>, "strategy">;

function emptyState(): ReviewStoreState {
  return { version: 2, reviewChapters: {}, completedChapters: [], positions: {} };
}

export const reviewSyncStrategy: SyncStrategy<ReviewStoreState, ChangeSet> = {
  emptyState,
  merge: mergeStates,
  diff: diffStates,
  isEmpty: isEmptyChangeSet,
};

/** Moteur de synchronisation des révisions (fiches et chapitres). */
export class ReviewSyncEngine extends SyncEngine<ReviewStoreState, ChangeSet> {
  constructor(deps: SyncEngineDeps) {
    super({ ...deps, strategy: reviewSyncStrategy });
  }
}