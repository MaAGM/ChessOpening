import type { Database, Json } from "./database.types";
import type { TypedSupabaseClient } from "./client";
import { createEmptyRepertoireState, sanitizeRepertoire } from "@/lib/repertoire/repertoireStore";
import {
  buildOrder,
  type RepertoireChangeSet,
  type RepertoireRemote,
} from "@/lib/repertoire/repertoireSync";
import type { Repertoire, RepertoireStoreState } from "@/lib/repertoire/types";

type RepertoireRow = Database["public"]["Tables"]["user_repertoires"]["Row"];
type RepertoireInsert = Database["public"]["Tables"]["user_repertoires"]["Insert"];

const TABLE = "user_repertoires";
/** PostgREST renvoie au plus 1000 lignes par requête : on pagine la lecture. */
const PAGE_SIZE = 1000;
/** Taille des lots d'écriture (les arbres peuvent être volumineux). */
const WRITE_CHUNK = 50;
const DATA_VERSION = 1;

/**
 * Contenu de la colonne JSONB `data` : tout ce qui n'a pas sa propre colonne.
 * `position` est l'index du répertoire dans l'ordre d'affichage.
 */
export type RepertoireData = {
  version: typeof DATA_VERSION;
  position: number;
  children: Repertoire["children"];
  origin: Repertoire["origin"];
  comment?: string;
};

type FetchedRow = Pick<
  RepertoireRow,
  | "id"
  | "name"
  | "side"
  | "category"
  | "review_enabled"
  | "data"
  | "created_at"
  | "updated_at"
  | "deleted_at"
>;

const SELECTED_COLUMNS =
  "id, name, side, category, review_enabled, data, created_at, updated_at, deleted_at";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toIso(ms: number): string {
  return new Date(ms).toISOString();
}

function parseTime(value: string | null): number | null {
  if (!value) return null;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : null;
}

// ---------------------------------------------------------------------------
// Conversions répertoire <-> ligne de la base
// ---------------------------------------------------------------------------

/**
 * Ligne à écrire pour un répertoire vivant. `updated_at` est la date d'édition locale
 * (le trigger `user_repertoires_guard` refuse une version plus ancienne que celle du
 * serveur) et `deleted_at` est explicitement remis à null.
 */
export function repertoireToRow(
  userId: string,
  repertoire: Repertoire,
  position: number,
): RepertoireInsert {
  const data: RepertoireData = {
    version: DATA_VERSION,
    position,
    children: repertoire.children,
    origin: repertoire.origin,
    ...(repertoire.comment ? { comment: repertoire.comment } : {}),
  };
  return {
    id: repertoire.id,
    user_id: userId,
    name: repertoire.name,
    side: repertoire.side,
    category: repertoire.category,
    review_enabled: repertoire.reviewEnabled,
    data: data as unknown as Json,
    created_at: toIso(repertoire.createdAt),
    updated_at: toIso(repertoire.updatedAt),
    deleted_at: null,
  };
}

/**
 * Répertoire vivant lu dans le cloud (validé comme une lecture du localStorage) et sa
 * position ; null si la ligne est inutilisable. Les lignes supprimées ne passent pas ici.
 */
export function rowToRepertoire(
  row: Omit<FetchedRow, "deleted_at">,
): { repertoire: Repertoire; position: number } | null {
  const data = isRecord(row.data) ? row.data : {};
  const createdAt = parseTime(row.created_at);
  const updatedAt = parseTime(row.updated_at);

  const repertoire = sanitizeRepertoire({
    id: row.id,
    name: row.name,
    side: row.side,
    category: row.category,
    reviewEnabled: row.review_enabled,
    comment: data.comment,
    children: data.children,
    origin: data.origin,
    ...(createdAt !== null ? { createdAt } : {}),
    ...(updatedAt !== null ? { updatedAt } : {}),
  });
  if (!repertoire) return null;

  const position =
    typeof data.position === "number" && Number.isFinite(data.position)
      ? data.position
      : Number.MAX_SAFE_INTEGER;
  return { repertoire, position };
}

/** Reconstruit un état du store à partir des lignes du cloud (vivantes et supprimées). */
export function rowsToState(rows: FetchedRow[]): RepertoireStoreState {
  const state = createEmptyRepertoireState();
  const entries: { id: string; position: number; createdAt: number }[] = [];

  for (const row of rows) {
    const deletedAt = parseTime(row.deleted_at);
    if (deletedAt !== null) {
      state.deleted[row.id] = deletedAt;
      continue;
    }
    const parsed = rowToRepertoire(row);
    if (!parsed) continue;
    state.repertoires[parsed.repertoire.id] = parsed.repertoire;
    entries.push({
      id: parsed.repertoire.id,
      position: parsed.position,
      createdAt: parsed.repertoire.createdAt,
    });
  }

  state.order = buildOrder(entries);
  return state;
}

function chunks<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) result.push(items.slice(i, i + size));
  return result;
}

function fail(error: { message: string }): never {
  throw new Error(`[${TABLE}] ${error.message}`);
}

// ---------------------------------------------------------------------------
// Implémentation Supabase
// ---------------------------------------------------------------------------
export function createSupabaseRepertoireRemote(client: TypedSupabaseClient): RepertoireRemote {
  return {
    async fetchState(userId): Promise<RepertoireStoreState> {
      const rows: FetchedRow[] = [];
      for (let from = 0; ; from += PAGE_SIZE) {
        const { data, error } = await client
          .from(TABLE)
          .select(SELECTED_COLUMNS)
          .eq("user_id", userId)
          .order("id")
          .range(from, from + PAGE_SIZE - 1);
        if (error) fail(error);
        rows.push(...data);
        if (data.length < PAGE_SIZE) break;
      }
      return rowsToState(rows);
    },

    async pushChanges(userId, changes: RepertoireChangeSet): Promise<void> {
      // 1) Créations, modifications et changements de position : upsert par lots sur la
      //    clé primaire (user_id, id).
      const rows = changes.upserts.map(({ repertoire, position }) =>
        repertoireToRow(userId, repertoire, position),
      );
      for (const chunk of chunks(rows, WRITE_CHUNK)) {
        const { error } = await client.from(TABLE).upsert(chunk, { onConflict: "user_id,id" });
        if (error) fail(error);
      }

      // 2) Suppressions douces : la date de suppression sert aussi de date de modification,
      //    pour que le trigger accepte la mise à jour (et refuse une suppression périmée).
      for (const { id, deletedAt } of changes.deletes) {
        const at = toIso(deletedAt);
        const { error } = await client
          .from(TABLE)
          .update({ deleted_at: at, updated_at: at })
          .eq("user_id", userId)
          .eq("id", id);
        if (error) fail(error);
      }
    },
  };
}
