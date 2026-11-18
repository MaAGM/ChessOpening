// @vitest-environment edge-runtime
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  batchItems,
  createConvexRepertoireRemote,
  docToRepertoire,
  docsToState,
  repertoireToItem,
  type RepertoireDoc,
} from "./repertoireRemote";
import type { Repertoire } from "@/lib/repertoire/types";
import { setup } from "../../../tests/convex/test.setup";
import { recordingCaller } from "../../../tests/convex/recordingCaller";

const T1 = Date.parse("2026-11-01T10:00:00.000Z");
const T2 = Date.parse("2026-11-02T10:00:00.000Z");
const NOW = Date.parse("2026-11-10T10:00:00.000Z");

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

const baseData = () => JSON.parse(repertoireToItem(rep(), 0).data) as Record<string, unknown>;

const doc = (overrides: Partial<RepertoireDoc> = {}): RepertoireDoc => ({
  ...repertoireToItem(rep(), 0),
  deletedAt: null,
  ...overrides,
});

function remoteFor(failOn?: Parameters<typeof recordingCaller>[1]) {
  const env = setup();
  const alice = recordingCaller(env.alice, failOn);
  const bob = recordingCaller(env.bob);
  return {
    remote: createConvexRepertoireRemote(alice.client),
    calls: alice.calls,
    other: createConvexRepertoireRemote(bob.client),
  };
}

describe("conversions répertoire <-> document", () => {
  it("écrit les métadonnées en champs, le reste et la position dans data (JSON)", () => {
    const item = repertoireToItem(rep(), 3);
    expect(item).toEqual({
      repertoireId: "r1",
      name: "Mon 1.e4",
      side: "white",
      category: "Ouvertures",
      reviewEnabled: false,
      data: expect.any(String),
      createdAt: T1,
      updatedAt: T2,
    });
    expect(JSON.parse(item.data)).toEqual({
      version: 1,
      position: 3,
      children: rep().children,
      origin: { kind: "template", templateId: "italienne", version: 2 },
      comment: "Plan : centre",
    });
  });

  it("relit à l'identique ce qu'elle écrit", () => {
    expect(docToRepertoire(doc({ ...repertoireToItem(rep(), 4) }))).toEqual({ repertoire: rep(), position: 4 });
  });

  it("valide les données reçues et applique des valeurs par défaut", () => {
    const back = docToRepertoire(
      doc({ name: "  ", category: null, data: JSON.stringify({ children: [{ san: "d4" }, "oups"] }) }),
    );
    expect(back?.repertoire).toMatchObject({ name: "Sans titre", origin: { kind: "custom" } });
    expect(back?.repertoire.children).toHaveLength(1);
    expect(back?.position).toBe(Number.MAX_SAFE_INTEGER);
  });

  it("tolère un JSON illisible", () => {
    const back = docToRepertoire(doc({ data: "{pas du json" }));
    expect(back?.repertoire.children).toEqual([]);
  });

  it("rejette un document sans couleur valide", () => {
    expect(docToRepertoire(doc({ side: "rouge" }))).toBeNull();
  });
});

describe("docsToState", () => {
  it("reconstruit l'ordre depuis data.position et transforme deletedAt en pierre tombale", () => {
    const withPosition = (position: number) => JSON.stringify({ ...baseData(), position });
    const state = docsToState([
      doc({ repertoireId: "b", data: withPosition(1) }),
      doc({ repertoireId: "a", data: withPosition(0) }),
      doc({ repertoireId: "x", deletedAt: Date.parse("2026-11-03T10:00:00.000Z") }),
      doc({ repertoireId: "bad", side: "?" }),
    ]);

    expect(state.order).toEqual(["a", "b"]);
    expect(Object.keys(state.repertoires).sort()).toEqual(["a", "b"]);
    expect(state.deleted).toEqual({ x: Date.parse("2026-11-03T10:00:00.000Z") });
  });
});

describe("batchItems", () => {
  it("limite chaque lot en nombre", () => {
    const items = Array.from({ length: 25 }, (_, i) => repertoireToItem(rep({ id: `r${i}` }), i));
    expect(batchItems(items).map((b) => b.length)).toEqual([10, 10, 5]);
  });

  it("limite chaque lot en volume (un gros répertoire part seul)", () => {
    const small = repertoireToItem(rep({ id: "s" }), 0);
    const big = { ...repertoireToItem(rep({ id: "big" }), 1), data: "x".repeat(1000) };
    expect(batchItems([small, big, small], 10, 1000).map((b) => b.map((i) => i.repertoireId))).toEqual([
      ["s"],
      ["big"],
      ["s"],
    ]);
  });
});

describe("createConvexRepertoireRemote (aller-retour avec le serveur)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });
  afterEach(() => vi.useRealTimers());

  it("relit à l'identique ce qui a été poussé, dans l'ordre", async () => {
    const { remote } = remoteFor();
    await remote.pushChanges("u1", {
      upserts: [
        { repertoire: rep({ id: "b" }), position: 1 },
        { repertoire: rep({ id: "a" }), position: 0 },
      ],
      deletes: [],
    });

    const state = await remote.fetchState("u1");
    expect(state.order).toEqual(["a", "b"]);
    expect(state.repertoires.a).toEqual(rep({ id: "a" }));
  });

  it("lit toutes les pages et ne voit pas les répertoires d'un autre utilisateur", async () => {
    const { remote, other, calls } = remoteFor();
    const upserts = Array.from({ length: 20 }, (_, i) => ({
      repertoire: rep({ id: `r${String(i).padStart(2, "0")}` }),
      position: i,
    }));
    await remote.pushChanges("u1", { upserts, deletes: [] });
    await other.pushChanges("u2", { upserts: [{ repertoire: rep({ id: "autre" }), position: 0 }], deletes: [] });
    calls.length = 0;

    const state = await remote.fetchState("u1");

    expect(state.order).toHaveLength(20);
    expect(state.order[0]).toBe("r00");
    expect(state.repertoires.autre).toBeUndefined();
    expect(calls.filter((c) => c.name === "repertoires:list")).toHaveLength(3);
  });

  it("pousse les upserts puis les suppressions douces (pierres tombales relues)", async () => {
    const { remote, calls } = remoteFor();
    await remote.pushChanges("u1", { upserts: [{ repertoire: rep({ id: "old" }), position: 0 }], deletes: [] });
    calls.length = 0;

    await remote.pushChanges("u1", {
      upserts: [{ repertoire: rep(), position: 2 }],
      deletes: [{ id: "old", deletedAt: NOW }],
    });

    expect(calls.map((c) => c.name)).toEqual(["repertoires:upsert", "repertoires:softDelete"]);
    expect(calls[0].args).toEqual({ items: [repertoireToItem(rep(), 2)] });
    expect(calls[1].args).toEqual({ items: [{ repertoireId: "old", deletedAt: NOW }] });

    const state = await remote.fetchState("u1");
    expect(state.deleted).toEqual({ old: NOW });
    expect(Object.keys(state.repertoires)).toEqual(["r1"]);
  });

  it("garde la version la plus récente quand un appareil envoie une version périmée", async () => {
    const { remote } = remoteFor();
    await remote.pushChanges("u1", { upserts: [{ repertoire: rep({ name: "Récent", updatedAt: T2 }), position: 0 }], deletes: [] });
    await remote.pushChanges("u1", { upserts: [{ repertoire: rep({ name: "Périmé", updatedAt: T1 }), position: 0 }], deletes: [] });

    expect((await remote.fetchState("u1")).repertoires.r1.name).toBe("Récent");
  });

  it("découpe les gros envois en lots", async () => {
    const { remote, calls } = remoteFor();
    const upserts = Array.from({ length: 25 }, (_, i) => ({ repertoire: rep({ id: `r${i}` }), position: i }));
    await remote.pushChanges("u1", { upserts, deletes: [] });
    expect(calls.map((c) => (c.args.items as unknown[]).length)).toEqual([10, 10, 5]);
  });

  it("n'appelle pas le serveur quand il n'y a rien à envoyer", async () => {
    const { remote, calls } = remoteFor();
    await remote.pushChanges("u1", { upserts: [], deletes: [] });
    expect(calls).toHaveLength(0);
  });

  it("remonte les erreurs avec le nom de la fonction", async () => {
    const { remote } = remoteFor(() => "permission refusée");
    await expect(remote.fetchState("u1")).rejects.toThrow("[repertoires:list] permission refusée");
  });
});
