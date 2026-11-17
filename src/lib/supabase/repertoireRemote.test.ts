import { describe, expect, it } from "vitest";
import type { TypedSupabaseClient } from "./client";
import {
  createSupabaseRepertoireRemote,
  repertoireToRow,
  rowToRepertoire,
  rowsToState,
} from "./repertoireRemote";
import type { Repertoire } from "@/lib/repertoire/types";

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
        eq: (column: string, value: unknown) => {
          call.filters.push(["eq", column, value]);
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

const T1 = Date.parse("2026-11-01T10:00:00.000Z");
const T2 = Date.parse("2026-11-02T10:00:00.000Z");

const rep = (overrides: Partial<Repertoire> = {}): Repertoire => ({
  id: "r1",
  name: "Mon 1.e4",
  side: "white",
  category: "Ouvertures",
  reviewEnabled: false,
  comment: "Plan : centre",
  children: [{ id: "a", san: "e4", symbol: "!", children: [{ id: "b", san: "e5", children: [] }] }],
  origin: { kind: "template", templateId: "italienne", version: 2 },
  createdAt: T1,
  updatedAt: T2,
  ...overrides,
});

const baseData = () => repertoireToRow("u1", rep(), 0).data as Record<string, unknown>;

const row = (overrides: Record<string, unknown> = {}) => ({
  ...repertoireToRow("u1", rep(), 0),
  ...overrides,
});

describe("conversions répertoire <-> ligne", () => {
  it("écrit les métadonnées en colonnes, le reste et la position dans data", () => {
    expect(repertoireToRow("u1", rep(), 3)).toEqual({
      id: "r1",
      user_id: "u1",
      name: "Mon 1.e4",
      side: "white",
      category: "Ouvertures",
      review_enabled: false,
      data: {
        version: 1,
        position: 3,
        children: rep().children,
        origin: { kind: "template", templateId: "italienne", version: 2 },
        comment: "Plan : centre",
      },
      created_at: "2026-11-01T10:00:00.000Z",
      updated_at: "2026-11-02T10:00:00.000Z",
      deleted_at: null,
    });
  });

  it("relit à l'identique ce qu'elle écrit", () => {
    const back = rowToRepertoire(repertoireToRow("u1", rep(), 4) as never);
    expect(back).toEqual({ repertoire: rep(), position: 4 });
  });

  it("valide les données reçues et applique des valeurs par défaut", () => {
    const back = rowToRepertoire(
      row({ name: "  ", category: null, data: { children: [{ san: "d4" }, "oups"] } }) as never,
    );
    expect(back?.repertoire).toMatchObject({ name: "Sans titre", origin: { kind: "custom" } });
    expect(back?.repertoire.children).toHaveLength(1);
    expect(back?.position).toBe(Number.MAX_SAFE_INTEGER);
  });

  it("rejette une ligne sans couleur valide", () => {
    expect(rowToRepertoire(row({ side: "rouge" }) as never)).toBeNull();
  });
});

describe("rowsToState", () => {
  it("reconstruit l'ordre depuis data.position et transforme deleted_at en pierre tombale", () => {
    const state = rowsToState([
      row({ id: "b", data: { ...baseData(), position: 1 } }),
      row({ id: "a", data: { ...baseData(), position: 0 } }),
      row({ id: "x", deleted_at: "2026-11-03T10:00:00.000Z" }),
      row({ id: "bad", side: "?" }),
    ] as never);

    expect(state.order).toEqual(["a", "b"]);
    expect(Object.keys(state.repertoires).sort()).toEqual(["a", "b"]);
    expect(state.deleted).toEqual({ x: Date.parse("2026-11-03T10:00:00.000Z") });
  });
});

describe("createSupabaseRepertoireRemote", () => {
  it("lit toutes les lignes de l'utilisateur, page par page", async () => {
    const rows = Array.from({ length: 1001 }, (_, i) =>
      row({ id: `r${String(i).padStart(4, "0")}`, data: { ...baseData(), position: i } }),
    );
    const other = row({ id: "autre", user_id: "u2" });
    const { client, calls } = createFakeClient({ user_repertoires: [...rows, other] });

    const state = await createSupabaseRepertoireRemote(client).fetchState("u1");

    expect(state.order).toHaveLength(1001);
    expect(state.order[0]).toBe("r0000");
    expect(state.repertoires.autre).toBeUndefined();
    expect(calls.map((c) => c.range)).toEqual([
      [0, 999],
      [1000, 1999],
    ]);
  });

  it("pousse les upserts (avec updated_at local) puis les suppressions douces", async () => {
    const { client, calls } = createFakeClient({});
    await createSupabaseRepertoireRemote(client).pushChanges("u1", {
      upserts: [{ repertoire: rep(), position: 2 }],
      deletes: [{ id: "old", deletedAt: T2 }],
    });

    expect(calls).toHaveLength(2);
    expect(calls[0].op).toBe("upsert");
    expect(calls[0].payload).toEqual([repertoireToRow("u1", rep(), 2)]);
    expect(calls[0].options).toEqual({ onConflict: "user_id,id" });
    expect(calls[1]).toMatchObject({
      op: "update",
      payload: { deleted_at: "2026-11-02T10:00:00.000Z", updated_at: "2026-11-02T10:00:00.000Z" },
      filters: [
        ["eq", "user_id", "u1"],
        ["eq", "id", "old"],
      ],
    });
  });

  it("découpe les gros envois en lots", async () => {
    const { client, calls } = createFakeClient({});
    const upserts = Array.from({ length: 120 }, (_, i) => ({ repertoire: rep({ id: `r${i}` }), position: i }));
    await createSupabaseRepertoireRemote(client).pushChanges("u1", { upserts, deletes: [] });
    expect(calls.map((c) => (c.payload as unknown[]).length)).toEqual([50, 50, 20]);
  });

  it("n'appelle pas la base quand il n'y a rien à envoyer", async () => {
    const { client, calls } = createFakeClient({});
    await createSupabaseRepertoireRemote(client).pushChanges("u1", { upserts: [], deletes: [] });
    expect(calls).toHaveLength(0);
  });

  it("remonte les erreurs avec le nom de la table", async () => {
    const { client } = createFakeClient({}, () => "permission denied");
    await expect(createSupabaseRepertoireRemote(client).fetchState("u1")).rejects.toThrow(
      "[user_repertoires] permission denied",
    );
  });
});
