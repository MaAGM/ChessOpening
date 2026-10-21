import type { Database } from "./database.types";
import type { TypedSupabaseClient } from "./client";
import { fenFromPositionKey } from "@/lib/review/positionKey";
import type { ChangeSet, ReviewRemote } from "@/lib/review/reviewSync";
import type { ReviewStoreState } from "@/lib/review/reviewStore";
import type { PositionStats } from "@/lib/review/srs";

type PositionRow = Database["public"]["Tables"]["user_positions"]["Row"];
type PositionInsert = Database["public"]["Tables"]["user_positions"]["Insert"];

/** PostgREST renvoie au plus 1000 lignes par requête : on pagine la lecture. */
const PAGE_SIZE = 1000;
/** Taille des lots d'écriture. */
const WRITE_CHUNK = 500;

// ---------------------------------------------------------------------------
// Conversions état local <-> lignes de la base
// ---------------------------------------------------------------------------
export function statsToRow(userId: string, key: string, stats: PositionStats): PositionInsert {
  return {
    user_id: userId,
    position_key: key,
    fen: fenFromPositionKey(key),
    box: stats.box,
    next_review_at: new Date(stats.due).toISOString(),
    last_reviewed_at: stats.lastSeen > 0 ? new Date(stats.lastSeen).toISOString() : null,
    attempts: stats.attempts,
    failures: stats.failures,
    recent_results: stats.recent,
  };
}

export function rowToStats(
  row: Pick<
    PositionRow,
    "box" | "next_review_at" | "last_reviewed_at" | "attempts" | "failures" | "recent_results"
  >,
): PositionStats {
  return {
    box: row.box,
    due: Date.parse(row.next_review_at),
    attempts: row.attempts,
    failures: row.failures,
    lastSeen: row.last_reviewed_at ? Date.parse(row.last_reviewed_at) : 0,
    recent: row.recent_results,
  };
}

function chunks<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) result.push(items.slice(i, i + size));
  return result;
}

function fail(table: string, error: { message: string }): never {
  throw new Error(`[${table}] ${error.message}`);
}

// ---------------------------------------------------------------------------
// Implémentation Supabase
// ---------------------------------------------------------------------------
export function createSupabaseReviewRemote(client: TypedSupabaseClient): ReviewRemote {
  async function fetchPositions(userId: string) {
    const rows: Pick<
      PositionRow,
      | "position_key"
      | "box"
      | "next_review_at"
      | "last_reviewed_at"
      | "attempts"
      | "failures"
      | "recent_results"
    >[] = [];

    for (let from = 0; ; from += PAGE_SIZE) {
      const { data, error } = await client
        .from("user_positions")
        .select(
          "position_key, box, next_review_at, last_reviewed_at, attempts, failures, recent_results",
        )
        .eq("user_id", userId)
        .order("position_key")
        .range(from, from + PAGE_SIZE - 1);
      if (error) fail("user_positions", error);
      rows.push(...data);
      if (data.length < PAGE_SIZE) break;
    }
    return rows;
  }

  async function fetchChapters(userId: string) {
    const rows: { chapter_id: string; completed_at: string | null; added_to_review_at: string | null }[] =
      [];

    for (let from = 0; ; from += PAGE_SIZE) {
      const { data, error } = await client
        .from("user_chapters")
        .select("chapter_id, completed_at, added_to_review_at")
        .eq("user_id", userId)
        .order("chapter_id")
        .range(from, from + PAGE_SIZE - 1);
      if (error) fail("user_chapters", error);
      rows.push(...data);
      if (data.length < PAGE_SIZE) break;
    }
    return rows;
  }

  return {
    async fetchState(userId): Promise<ReviewStoreState> {
      const [positionRows, chapterRows] = await Promise.all([
        fetchPositions(userId),
        fetchChapters(userId),
      ]);

      const state: ReviewStoreState = {
        version: 2,
        reviewChapters: {},
        completedChapters: [],
        positions: {},
      };

      for (const row of positionRows) state.positions[row.position_key] = rowToStats(row);

      for (const row of chapterRows) {
        if (row.added_to_review_at) {
          state.reviewChapters[row.chapter_id] = { addedAt: Date.parse(row.added_to_review_at) };
        }
        if (row.completed_at) state.completedChapters.push(row.chapter_id);
      }

      return state;
    },

    async pushChanges(userId, changes: ChangeSet): Promise<void> {
      // 1) Fiches : upsert par lots
      const positionRows = Object.entries(changes.positionsUpsert).map(([key, stats]) =>
        statsToRow(userId, key, stats),
      );
      for (const chunk of chunks(positionRows, WRITE_CHUNK)) {
        const { error } = await client
          .from("user_positions")
          .upsert(chunk, { onConflict: "user_id,position_key" });
        if (error) fail("user_positions", error);
      }

      // 2) Fiches supprimées (réinitialisation de la progression)
      for (const chunk of chunks(changes.positionsDelete, WRITE_CHUNK)) {
        const { error } = await client
          .from("user_positions")
          .delete()
          .eq("user_id", userId)
          .in("position_key", chunk);
        if (error) fail("user_positions", error);
      }

      // 3) Chapitres ajoutés aux révisions. Chaque lot a les mêmes colonnes : en cas de
      //    conflit, seule `added_to_review_at` est mise à jour (completed_at est conservée).
      const reviewRows = Object.entries(changes.chaptersReviewSet).map(([id, addedAt]) => ({
        user_id: userId,
        chapter_id: id,
        added_to_review_at: new Date(addedAt).toISOString(),
      }));
      for (const chunk of chunks(reviewRows, WRITE_CHUNK)) {
        const { error } = await client
          .from("user_chapters")
          .upsert(chunk, { onConflict: "user_id,chapter_id", defaultToNull: false });
        if (error) fail("user_chapters", error);
      }

      // 4) Chapitres complétés (même principe : seule `completed_at` est écrite)
      const completedAt = new Date().toISOString();
      const completedRows = changes.chaptersCompletedSet.map((id) => ({
        user_id: userId,
        chapter_id: id,
        completed_at: completedAt,
      }));
      for (const chunk of chunks(completedRows, WRITE_CHUNK)) {
        const { error } = await client
          .from("user_chapters")
          .upsert(chunk, { onConflict: "user_id,chapter_id", defaultToNull: false });
        if (error) fail("user_chapters", error);
      }

      // 5) Retraits : on vide la colonne concernée (après les écritures ci-dessus, pour
      //    qu'une ligne ne soit jamais vide tant qu'elle porte encore une information)
      for (const chunk of chunks(changes.chaptersReviewClear, WRITE_CHUNK)) {
        const { error } = await client
          .from("user_chapters")
          .update({ added_to_review_at: null })
          .eq("user_id", userId)
          .in("chapter_id", chunk);
        if (error) fail("user_chapters", error);
      }
      for (const chunk of chunks(changes.chaptersCompletedClear, WRITE_CHUNK)) {
        const { error } = await client
          .from("user_chapters")
          .update({ completed_at: null })
          .eq("user_id", userId)
          .in("chapter_id", chunk);
        if (error) fail("user_chapters", error);
      }

      // 6) Lignes devenues vides : suppression
      for (const chunk of chunks(changes.chaptersDelete, WRITE_CHUNK)) {
        const { error } = await client
          .from("user_chapters")
          .delete()
          .eq("user_id", userId)
          .in("chapter_id", chunk);
        if (error) fail("user_chapters", error);
      }
    },
  };
}
