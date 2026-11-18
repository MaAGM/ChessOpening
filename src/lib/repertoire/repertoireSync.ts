import { SyncEngine, type GenericSyncEngineDeps, type SyncRemote, type SyncStrategy } from "@/lib/sync/syncEngine";
import { createEmptyRepertoireState } from "./repertoireStore";
import type { Repertoire, RepertoireStoreState } from "./types";

// ===========================================================================
// Fonctions pures : fusion et différences d'états de répertoires
// ===========================================================================
//
// Résolution des conflits, répertoire par répertoire (« la dernière écriture gagne ») :
//  - deux versions vivantes : la plus récente (`updatedAt`) l'emporte ;
//  - une version vivante et une pierre tombale : la suppression l'emporte, sauf si la
//    version vivante a été modifiée après la suppression ;
//  - l'ordre d'affichage voyage avec chaque répertoire (`position`, stockée dans
//    `data.position` côté cloud) : l'ordre fusionné trie les gagnants par position.

/** Répertoire à écrire dans le cloud, avec sa place dans l'ordre d'affichage. */
export type RepertoireUpsert = { repertoire: Repertoire; position: number };

export type RepertoireChangeSet = {
  upserts: RepertoireUpsert[];
  /** Suppressions douces (`deleted_at`) de répertoires présents dans le cloud. */
  deletes: { id: string; deletedAt: number }[];
};

export function createEmptyRepertoireChangeSet(): RepertoireChangeSet {
  return { upserts: [], deletes: [] };
}

export function isEmptyRepertoireChangeSet(changes: RepertoireChangeSet): boolean {
  return changes.upserts.length === 0 && changes.deletes.length === 0;
}

function hasOwn(obj: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

/** Position de chaque répertoire dans l'ordre d'affichage d'un état. */
export function positionsOf(state: RepertoireStoreState): Map<string, number> {
  return new Map(state.order.map((id, index) => [id, index]));
}

/**
 * Reconstruit l'ordre d'affichage à partir des positions. Les égalités (positions venues
 * de deux appareils, ou position absente) sont départagées par ancienneté puis par id,
 * pour un résultat identique sur tous les appareils.
 */
export function buildOrder(
  entries: { id: string; position: number; createdAt: number }[],
): string[] {
  return [...entries]
    .sort(
      (a, b) =>
        a.position - b.position ||
        a.createdAt - b.createdAt ||
        (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
    )
    .map((entry) => entry.id);
}

/** Sérialisation à clés triées : deux objets égaux donnent la même chaîne. */
function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (typeof value === "object" && value !== null) {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

/** Vrai si deux versions d'un répertoire ont le même contenu. */
export function sameRepertoire(a: Repertoire, b: Repertoire): boolean {
  if (a === b) return true;
  if (a.updatedAt !== b.updatedAt) return false;
  return stableStringify(a) === stableStringify(b);
}

/**
 * Fusionne deux états (cache local, cloud, données d'invité). En cas d'égalité parfaite
 * des dates entre deux versions vivantes, celle de `a` est conservée.
 * La fonction est pure et ne modifie aucune de ses entrées.
 */
export function mergeRepertoireStates(
  a: RepertoireStoreState,
  b: RepertoireStoreState,
): RepertoireStoreState {
  const positionsA = positionsOf(a);
  const positionsB = positionsOf(b);
  const ids = new Set([
    ...Object.keys(a.repertoires),
    ...Object.keys(a.deleted),
    ...Object.keys(b.repertoires),
    ...Object.keys(b.deleted),
  ]);

  const repertoires: Record<string, Repertoire> = {};
  const deleted: Record<string, number> = {};
  const entries: { id: string; position: number; createdAt: number }[] = [];

  for (const id of ids) {
    const liveA = hasOwn(a.repertoires, id) ? a.repertoires[id] : undefined;
    const liveB = hasOwn(b.repertoires, id) ? b.repertoires[id] : undefined;

    let live: Repertoire | undefined;
    let position = Number.MAX_SAFE_INTEGER;
    if (liveA && (!liveB || liveA.updatedAt >= liveB.updatedAt)) {
      live = liveA;
      position = positionsA.get(id) ?? position;
    } else if (liveB) {
      live = liveB;
      position = positionsB.get(id) ?? position;
    }

    const tombA = hasOwn(a.deleted, id) ? a.deleted[id] : undefined;
    const tombB = hasOwn(b.deleted, id) ? b.deleted[id] : undefined;
    const tomb =
      tombA === undefined ? tombB : tombB === undefined ? tombA : Math.max(tombA, tombB);

    if (live && (tomb === undefined || live.updatedAt > tomb)) {
      repertoires[id] = live;
      entries.push({ id, position, createdAt: live.createdAt });
    } else if (tomb !== undefined) {
      deleted[id] = tomb;
    }
  }

  return { version: a.version, repertoires, order: buildOrder(entries), deleted };
}

/** Opérations à envoyer pour que le cloud, supposé égal à `prev`, devienne égal à `next`. */
export function diffRepertoireStates(
  prev: RepertoireStoreState,
  next: RepertoireStoreState,
): RepertoireChangeSet {
  const changes = createEmptyRepertoireChangeSet();
  const prevPositions = positionsOf(prev);

  next.order.forEach((id, position) => {
    const repertoire = next.repertoires[id];
    if (!repertoire) return;
    const before = hasOwn(prev.repertoires, id) ? prev.repertoires[id] : undefined;
    if (!before || prevPositions.get(id) !== position || !sameRepertoire(before, repertoire)) {
      changes.upserts.push({ repertoire, position });
    }
  });

  // Seuls les répertoires connus du cloud ont besoin d'une suppression douce : un
  // répertoire créé puis supprimé hors ligne n'y a jamais existé.
  for (const [id, deletedAt] of Object.entries(next.deleted)) {
    if (hasOwn(prev.repertoires, id) && !hasOwn(next.repertoires, id)) {
      changes.deletes.push({ id, deletedAt });
    }
  }

  return changes;
}

// ===========================================================================
// Moteur de synchronisation (algorithme commun : src/lib/sync/syncEngine.ts)
// ===========================================================================

/** Accès à la table `userRepertoires` (implémenté avec Convex, remplaçable dans les tests). */
export type RepertoireRemote = SyncRemote<RepertoireStoreState, RepertoireChangeSet>;

export type RepertoireSyncEngineDeps = Omit<
  GenericSyncEngineDeps<RepertoireStoreState, RepertoireChangeSet>,
  "strategy"
>;

export const repertoireSyncStrategy: SyncStrategy<RepertoireStoreState, RepertoireChangeSet> = {
  emptyState: createEmptyRepertoireState,
  merge: mergeRepertoireStates,
  diff: diffRepertoireStates,
  isEmpty: isEmptyRepertoireChangeSet,
};

/** Moteur de synchronisation des répertoires, distinct de celui des révisions. */
export class RepertoireSyncEngine extends SyncEngine<RepertoireStoreState, RepertoireChangeSet> {
  constructor(deps: RepertoireSyncEngineDeps) {
    super({ ...deps, strategy: repertoireSyncStrategy });
  }
}
