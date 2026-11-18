import { api } from "../../../convex/_generated/api";
import { callMutation, callQuery, chunks, fetchAllPages, type ConvexCaller } from "./caller";
import { createEmptyRepertoireState, sanitizeRepertoire } from "@/lib/repertoire/repertoireStore";
import {
  buildOrder,
  type RepertoireChangeSet,
  type RepertoireRemote,
} from "@/lib/repertoire/repertoireSync";
import type { Repertoire, RepertoireStoreState } from "@/lib/repertoire/types";

/**
 * Un document peut peser jusqu'à ~900 Kio : on lit peu de répertoires par page pour rester
 * sous la limite de lecture d'une requête Convex.
 */
export const REPERTOIRE_PAGE_SIZE = 8;
/** Lots d'écriture : au plus 10 répertoires (MAX_REPERTOIRE_BATCH côté serveur)… */
export const WRITE_CHUNK = 10;
/** …et au plus ~4 Mio de JSON par mutation. */
export const WRITE_CHUNK_BYTES = 4 * 1024 * 1024;
/** Lots de suppressions douces (MAX_BATCH côté serveur). */
export const DELETE_CHUNK = 500;
const DATA_VERSION = 1;

/**
 * Contenu sérialisé dans `data` : tout ce qui n'a pas son propre champ.
 * `position` est l'index du répertoire dans l'ordre d'affichage.
 */
export type RepertoireData = {
  version: typeof DATA_VERSION;
  position: number;
  children: Repertoire["children"];
  origin: Repertoire["origin"];
  comment?: string;
};

/** Document tel qu'envoyé à `repertoires:upsert`. */
export type RepertoireItem = {
  repertoireId: string;
  name: string;
  side: Repertoire["side"];
  category: string | null;
  reviewEnabled: boolean;
  data: string;
  createdAt: number;
  updatedAt: number;
};

/** Document tel que renvoyé par `repertoires:list`. */
export type RepertoireDoc = Omit<RepertoireItem, "side"> & { side: string; deletedAt: number | null };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseData(data: string): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(data);
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

// ---------------------------------------------------------------------------
// Conversions répertoire <-> document
// ---------------------------------------------------------------------------

/** Document à écrire : `updatedAt` est la date d'édition locale (le serveur refuse une version périmée). */
export function repertoireToItem(repertoire: Repertoire, position: number): RepertoireItem {
  const data: RepertoireData = {
    version: DATA_VERSION,
    position,
    children: repertoire.children,
    origin: repertoire.origin,
    ...(repertoire.comment ? { comment: repertoire.comment } : {}),
  };
  return {
    repertoireId: repertoire.id,
    name: repertoire.name,
    side: repertoire.side,
    category: repertoire.category,
    reviewEnabled: repertoire.reviewEnabled,
    data: JSON.stringify(data),
    createdAt: repertoire.createdAt,
    updatedAt: repertoire.updatedAt,
  };
}

/**
 * Répertoire vivant lu dans le cloud (validé comme une lecture du localStorage) et sa
 * position ; null si le document est inutilisable.
 */
export function docToRepertoire(
  doc: Omit<RepertoireDoc, "deletedAt">,
): { repertoire: Repertoire; position: number } | null {
  const data = parseData(doc.data);
  const repertoire = sanitizeRepertoire({
    id: doc.repertoireId,
    name: doc.name,
    side: doc.side,
    category: doc.category,
    reviewEnabled: doc.reviewEnabled,
    comment: data.comment,
    children: data.children,
    origin: data.origin,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  });
  if (!repertoire) return null;

  const position =
    typeof data.position === "number" && Number.isFinite(data.position)
      ? data.position
      : Number.MAX_SAFE_INTEGER;
  return { repertoire, position };
}

/** Reconstruit un état du store à partir des documents du cloud (vivants et supprimés). */
export function docsToState(docs: RepertoireDoc[]): RepertoireStoreState {
  const state = createEmptyRepertoireState();
  const entries: { id: string; position: number; createdAt: number }[] = [];

  for (const doc of docs) {
    if (doc.deletedAt !== null) {
      state.deleted[doc.repertoireId] = doc.deletedAt;
      continue;
    }
    const parsed = docToRepertoire(doc);
    if (!parsed) continue;
    state.repertoires[parsed.repertoire.id] = parsed.repertoire;
    entries.push({ id: parsed.repertoire.id, position: parsed.position, createdAt: parsed.repertoire.createdAt });
  }

  state.order = buildOrder(entries);
  return state;
}

/** Lots limités à la fois en nombre et en volume (un répertoire volumineux part seul). */
export function batchItems(items: RepertoireItem[], maxCount = WRITE_CHUNK, maxBytes = WRITE_CHUNK_BYTES) {
  const batches: RepertoireItem[][] = [];
  let current: RepertoireItem[] = [];
  let bytes = 0;
  for (const item of items) {
    const size = item.data.length + item.name.length;
    if (current.length > 0 && (current.length >= maxCount || bytes + size > maxBytes)) {
      batches.push(current);
      current = [];
      bytes = 0;
    }
    current.push(item);
    bytes += size;
  }
  if (current.length > 0) batches.push(current);
  return batches;
}

// ---------------------------------------------------------------------------
// Implémentation Convex
// ---------------------------------------------------------------------------
export function createConvexRepertoireRemote(client: ConvexCaller): RepertoireRemote {
  return {
    async fetchState(): Promise<RepertoireStoreState> {
      const docs = await fetchAllPages(
        (paginationOpts) => callQuery(client, api.repertoires.list, { paginationOpts }),
        REPERTOIRE_PAGE_SIZE,
      );
      return docsToState(docs);
    },

    async pushChanges(_userId, changes: RepertoireChangeSet): Promise<void> {
      // 1) Créations, modifications et changements de position. Une version plus ancienne
      //    que celle du serveur est ignorée par la mutation : la prochaine fusion la corrigera.
      const items = changes.upserts.map(({ repertoire, position }) => repertoireToItem(repertoire, position));
      for (const batch of batchItems(items)) {
        await callMutation(client, api.repertoires.upsert, { items: batch });
      }

      // 2) Suppressions douces.
      const deletes = changes.deletes.map(({ id, deletedAt }) => ({ repertoireId: id, deletedAt }));
      for (const chunk of chunks(deletes, DELETE_CHUNK)) {
        await callMutation(client, api.repertoires.softDelete, { items: chunk });
      }
    },
  };
}
