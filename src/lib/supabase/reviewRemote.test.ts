import { describe, expect, it } from "vitest";
import type { TypedSupabaseClient } from "./client";
import { createSupabaseReviewRemote, rowToStats, statsToRow } from "./reviewRemote";
import { createEmptyChangeSet } from "@/lib/review/reviewSync";
import type { PositionStats } from "@/lib/review/srs";

type Filter = ["eq" | "in", string, unknown];
type Call = {
  table: string;
  op: "select" | "upsert" | "update" | "delete";
  filters: Filter[];
  range: [number, number] | null;
  payload: unknown;
  options: unknown;
};

/** Faux client Supabase : enregistre les appels et sert des lignes en mémoire. */
function createFakeClient(
  db: Record<string, Record<string, unknown>[]>,
  failOn?: (call: Call) => string | null,
) {
  const calls: Call[] = [];

  const client = {
    from(table: string) {
      const call: Call = { table, op: "select", filters: [], range: null, payload: null, options: null };
      const builder = {
        select: () => builder,
        upsert: (rows: unknown, options: unknown) => {
          call.op = "upsert";
          call.payload = rows;
          call.options = options;
          return builder;
        },
        update: (values: unknown) => {
          call.op = "update";
          call.payload = values;
          return builder;
        },
        delete: () => {
          call.op = "delete";
          return builder;
        },
        eq: (column: string, value: unknown) => {
          call.filters.push(["eq", column, value]);
          return builder;
        },
        in: (column: string, values: unknown) => {
          call.filters.push(["in", column, values]);
          return builder;
        },
        order: () => builder,
        range: (from: number, to: number) => {
          call.range = [from, to];
          return builder;
        },
        then: (resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) => {
          calls.push(call);
          const message = failOn?.(call) ?? null;
          if (message) return Promise.resolve({ data: null, error: { message } }).then(resolve, reject);

          if (call.op !== "select") return Promise.resolve({ data: null, error: null }).then(resolve, reject);

          let rows = db[table] ?? [];
          for (const [kind, column, value] of call.filters) {
            if (kind === "eq") rows = rows.filter((row) => row[column] === value);
          }
          if (call.range) rows = rows.slice(call.range[0], call.range[1] + 1);
          return Promise.resolve({ data: rows, error: null }).then(resolve, reject);
        },
      };
      return builder;
    },
  };

  return { client: client as unknown as TypedSupabaseClient, calls };
}

const stats = (overrides: Partial<PositionStats> = {}): PositionStats => ({
  box: 3,
  due: Date.parse("2026-10-21T10:00:00.000Z"),
  attempts: 4,
  failures: 1,
  lastSeen: Date.parse("2026-10-20T10:00:00.000Z"),
  recent: [1, 0, 1],
  ...overrides,
});

describe("conversions fiche <-> ligne", () => {
  it("convertit une fiche en ligne (dates ISO, FEN reconstruite) et inversement", () => {
    const key = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq";
    const row = statsToRow("u1", key, stats());

    expect(row).toMatchObject({
      user_id: "u1",
      position_key: key,
      fen: `${key} - 0 1`,
      box: 3,
      next_review_at: "2026-10-21T10:00:00.000Z",
      last_reviewed_at: "2026-10-20T10:00:00.000Z",
      attempts: 4,
      failures: 1,
      recent_results: [1, 0, 1],
    });

    expect(
      rowToStats({
        box: row.box!,
        next_review_at: row.next_review_at!,
        last_reviewed_at: row.last_reviewed_at!,
        attempts: row.attempts!,
        failures: row.failures!,
        recent_results: row.recent_results!,
      }),
    ).toEqual(stats());
  });
});

describe("fetchState", () => {
  it("construit l'état local depuis les lignes de la base", async () => {
    const { client } = createFakeClient({
      user_positions: [
        {
          user_id: "u1",
          position_key: "k1",
          box: 2,
          next_review_at: "2026-10-21T00:00:00.000Z",
          last_reviewed_at: null,
          attempts: 1,
          failures: 0,
          recent_results: [1],
        },
      ],
      user_chapters: [
        { user_id: "u1", chapter_id: "both", completed_at: "2026-10-01T00:00:00.000Z", added_to_review_at: "2026-10-02T00:00:00.000Z" },
        { user_id: "u1", chapter_id: "review-only", completed_at: null, added_to_review_at: "2026-10-03T00:00:00.000Z" },
        { user_id: "u1", chapter_id: "done-only", completed_at: "2026-10-04T00:00:00.000Z", added_to_review_at: null },
        { user_id: "autre", chapter_id: "not-mine", completed_at: "2026-10-04T00:00:00.000Z", added_to_review_at: null },
      ],
    });

    const state = await createSupabaseReviewRemote(client).fetchState("u1");

    expect(state.positions.k1).toMatchObject({ box: 2, lastSeen: 0, recent: [1] });
    expect(Object.keys(state.reviewChapters).sort()).toEqual(["both", "review-only"]);
    expect(state.reviewChapters.both.addedAt).toBe(Date.parse("2026-10-02T00:00:00.000Z"));
    expect(state.completedChapters.sort()).toEqual(["both", "done-only"]);
  });

  it("lit toutes les pages quand il y a plus de 1000 fiches", async () => {
    const rows = Array.from({ length: 2500 }, (_, i) => ({
      user_id: "u1",
      position_key: `k${String(i).padStart(4, "0")}`,
      box: 1,
      next_review_at: "2026-10-21T00:00:00.000Z",
      last_reviewed_at: null,
      attempts: 0,
      failures: 0,
      recent_results: [],
    }));
    const { client, calls } = createFakeClient({ user_positions: rows, user_chapters: [] });

    const state = await createSupabaseReviewRemote(client).fetchState("u1");

    expect(Object.keys(state.positions)).toHaveLength(2500);
    const ranges = calls.filter((c) => c.table === "user_positions").map((c) => c.range);
    expect(ranges).toEqual([[0, 999], [1000, 1999], [2000, 2999]]);
  });

  it("propage une erreur de la base avec le nom de la table", async () => {
    const { client } = createFakeClient({}, (call) => (call.table === "user_chapters" ? "permission denied" : null));
    await expect(createSupabaseReviewRemote(client).fetchState("u1")).rejects.toThrow(/user_chapters.*permission denied/);
  });
});

describe("pushChanges", () => {
  it("envoie les fiches par lots de 500 avec la cible d'upsert attendue", async () => {
    const changes = createEmptyChangeSet();
    for (let i = 0; i < 1200; i++) changes.positionsUpsert[`k${i}`] = stats();
    const { client, calls } = createFakeClient({});

    await createSupabaseReviewRemote(client).pushChanges("u1", changes);

    const upserts = calls.filter((c) => c.table === "user_positions" && c.op === "upsert");
    expect(upserts.map((c) => (c.payload as unknown[]).length)).toEqual([500, 500, 200]);
    expect(upserts[0].options).toEqual({ onConflict: "user_id,position_key" });
  });

  it("supprime les fiches retirées, limitées à l'utilisateur", async () => {
    const changes = createEmptyChangeSet();
    changes.positionsDelete = ["a", "b"];
    const { client, calls } = createFakeClient({});

    await createSupabaseReviewRemote(client).pushChanges("u1", changes);

    const del = calls.find((c) => c.op === "delete")!;
    expect(del.filters).toEqual([["eq", "user_id", "u1"], ["in", "position_key", ["a", "b"]]]);
  });

  it("n'écrit que la colonne concernée pour les chapitres (lots homogènes)", async () => {
    const changes = createEmptyChangeSet();
    changes.chaptersReviewSet = { c1: Date.parse("2026-10-02T00:00:00.000Z") };
    changes.chaptersCompletedSet = ["c2"];
    const { client, calls } = createFakeClient({});

    await createSupabaseReviewRemote(client).pushChanges("u1", changes);

    const upserts = calls.filter((c) => c.table === "user_chapters" && c.op === "upsert");
    expect(upserts).toHaveLength(2);
    expect(upserts[0].payload).toEqual([
      { user_id: "u1", chapter_id: "c1", added_to_review_at: "2026-10-02T00:00:00.000Z" },
    ]);
    expect(Object.keys((upserts[1].payload as Record<string, unknown>[])[0]).sort()).toEqual([
      "chapter_id",
      "completed_at",
      "user_id",
    ]);
    expect(upserts[0].options).toMatchObject({ onConflict: "user_id,chapter_id", defaultToNull: false });
  });

  it("vide la colonne des chapitres retirés et supprime les lignes devenues vides", async () => {
    const changes = createEmptyChangeSet();
    changes.chaptersReviewClear = ["still-done"];
    changes.chaptersDelete = ["empty"];
    const { client, calls } = createFakeClient({});

    await createSupabaseReviewRemote(client).pushChanges("u1", changes);

    const update = calls.find((c) => c.op === "update")!;
    expect(update.payload).toEqual({ added_to_review_at: null });
    expect(update.filters).toEqual([["eq", "user_id", "u1"], ["in", "chapter_id", ["still-done"]]]);
    expect(calls.find((c) => c.op === "delete")!.filters).toEqual([
      ["eq", "user_id", "u1"],
      ["in", "chapter_id", ["empty"]],
    ]);
  });

  it("n'effectue aucun appel quand il n'y a rien à envoyer", async () => {
    const { client, calls } = createFakeClient({});
    await createSupabaseReviewRemote(client).pushChanges("u1", createEmptyChangeSet());
    expect(calls).toHaveLength(0);
  });

  it("s'arrête à la première erreur et la propage", async () => {
    const changes = createEmptyChangeSet();
    changes.positionsUpsert.k = stats();
    changes.chaptersReviewSet = { c1: 1 };
    const { client, calls } = createFakeClient({}, (call) => (call.table === "user_positions" ? "violates RLS" : null));

    await expect(createSupabaseReviewRemote(client).pushChanges("u1", changes)).rejects.toThrow(/user_positions.*violates RLS/);
    expect(calls.some((c) => c.table === "user_chapters")).toBe(false);
  });
});
