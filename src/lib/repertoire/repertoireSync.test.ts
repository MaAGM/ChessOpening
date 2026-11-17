import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  RepertoireSyncEngine,
  buildOrder,
  diffRepertoireStates,
  isEmptyRepertoireChangeSet,
  mergeRepertoireStates,
  sameRepertoire,
  type RepertoireChangeSet,
  type RepertoireRemote,
} from "./repertoireSync";
import type { Repertoire, RepertoireStoreState } from "./types";

const rep = (id: string, overrides: Partial<Repertoire> = {}): Repertoire => ({
  id,
  name: `Répertoire ${id}`,
  side: "white",
  category: null,
  reviewEnabled: true,
  children: [],
  origin: { kind: "custom" },
  createdAt: 100,
  updatedAt: 100,
  ...overrides,
});

const state = (
  repertoires: Repertoire[] = [],
  deleted: Record<string, number> = {},
): RepertoireStoreState => ({
  version: 1,
  repertoires: Object.fromEntries(repertoires.map((r) => [r.id, r])),
  order: repertoires.map((r) => r.id),
  deleted,
});

// ---------------------------------------------------------------------------
describe("buildOrder", () => {
  it("trie par position, puis par ancienneté, puis par id", () => {
    expect(
      buildOrder([
        { id: "c", position: 1, createdAt: 5 },
        { id: "b", position: 0, createdAt: 9 },
        { id: "a", position: 1, createdAt: 5 },
        { id: "d", position: 1, createdAt: 1 },
      ]),
    ).toEqual(["b", "d", "a", "c"]);
  });
});

describe("sameRepertoire", () => {
  it("ignore l'ordre des clés mais pas le contenu ni la date", () => {
    const a = rep("a", { comment: "x" });
    const reordered = { comment: "x", ...rep("a") } as Repertoire;
    expect(sameRepertoire(a, reordered)).toBe(true);
    expect(sameRepertoire(a, { ...a, name: "autre" })).toBe(false);
    expect(sameRepertoire(a, { ...a, updatedAt: 101 })).toBe(false);
  });
});

describe("mergeRepertoireStates", () => {
  it("fait l'union des répertoires des deux côtés", () => {
    const merged = mergeRepertoireStates(state([rep("a")]), state([rep("b", { createdAt: 200 })]));
    expect(Object.keys(merged.repertoires).sort()).toEqual(["a", "b"]);
    expect(merged.order).toEqual(["a", "b"]); // même position 0 : le plus ancien d'abord
  });

  it("garde la version la plus récente d'un même répertoire, avec sa position", () => {
    const older = state([rep("x"), rep("a", { name: "Ancien", updatedAt: 100 })]);
    const newer = state([rep("a", { name: "Récent", updatedAt: 500 }), rep("x")]);
    const merged = mergeRepertoireStates(older, newer);
    expect(merged.repertoires.a.name).toBe("Récent");
    expect(merged.order).toEqual(["a", "x"]);
    expect(mergeRepertoireStates(newer, older).repertoires.a.name).toBe("Récent");
  });

  it("à date égale, conserve la version du premier argument", () => {
    const merged = mergeRepertoireStates(state([rep("a", { name: "A" })]), state([rep("a", { name: "B" })]));
    expect(merged.repertoires.a.name).toBe("A");
  });

  it("une suppression postérieure l'emporte et laisse une pierre tombale", () => {
    const merged = mergeRepertoireStates(state([rep("a", { updatedAt: 100 })]), state([], { a: 200 }));
    expect(merged.repertoires.a).toBeUndefined();
    expect(merged.order).toEqual([]);
    expect(merged.deleted).toEqual({ a: 200 });
  });

  it("une modification postérieure à la suppression ressuscite le répertoire", () => {
    const merged = mergeRepertoireStates(state([], { a: 200 }), state([rep("a", { updatedAt: 300 })]));
    expect(merged.repertoires.a.updatedAt).toBe(300);
    expect(merged.deleted).toEqual({});
  });

  it("garde la suppression la plus récente quand les deux côtés en ont une", () => {
    expect(mergeRepertoireStates(state([], { a: 1 }), state([], { a: 9 })).deleted).toEqual({ a: 9 });
  });

  it("ne modifie pas ses entrées", () => {
    const a = state([rep("a")]);
    const b = state([], { a: 999 });
    const snapshot = JSON.stringify([a, b]);
    mergeRepertoireStates(a, b);
    expect(JSON.stringify([a, b])).toBe(snapshot);
  });
});

describe("diffRepertoireStates", () => {
  it("ne produit rien entre deux états égaux (même reconstruits)", () => {
    const prev = state([rep("a"), rep("b")]);
    const next = JSON.parse(JSON.stringify(prev)) as RepertoireStoreState;
    expect(isEmptyRepertoireChangeSet(diffRepertoireStates(prev, next))).toBe(true);
  });

  it("envoie les créations et les modifications avec leur position", () => {
    const prev = state([rep("a")]);
    const next = state([rep("a", { name: "Renommé", updatedAt: 200 }), rep("b")]);
    const changes = diffRepertoireStates(prev, next);
    expect(changes.upserts.map((u) => [u.repertoire.id, u.position])).toEqual([
      ["a", 0],
      ["b", 1],
    ]);
    expect(changes.deletes).toEqual([]);
  });

  it("envoie les répertoires dont seule la position a changé", () => {
    const prev = state([rep("a"), rep("b"), rep("c")]);
    const next = { ...prev, order: ["b", "a", "c"] };
    const changes = diffRepertoireStates(prev, next);
    expect(changes.upserts.map((u) => [u.repertoire.id, u.position])).toEqual([
      ["b", 0],
      ["a", 1],
    ]);
  });

  it("envoie une suppression douce pour un répertoire connu du cloud", () => {
    const changes = diffRepertoireStates(state([rep("a")]), state([], { a: 300 }));
    expect(changes.deletes).toEqual([{ id: "a", deletedAt: 300 }]);
  });

  it("n'envoie rien pour un répertoire créé puis supprimé hors ligne", () => {
    expect(isEmptyRepertoireChangeSet(diffRepertoireStates(state(), state([], { a: 300 })))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
describe("RepertoireSyncEngine", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  function setup(initial = state(), remoteState = state()) {
    let local = initial;
    const remote = { state: remoteState, pushes: [] as RepertoireChangeSet[], pushError: null as Error | null };
    const api: RepertoireRemote = {
      fetchState: vi.fn(async () => remote.state),
      pushChanges: vi.fn(async (_userId: string, changes: RepertoireChangeSet) => {
        if (remote.pushError) throw remote.pushError;
        remote.pushes.push(changes);
      }),
    };
    const statuses: string[] = [];
    const onGuestMigrated = vi.fn();
    const engine = new RepertoireSyncEngine({
      remote: api,
      getState: () => local,
      applyRemoteState: (next) => {
        local = next;
      },
      setStatus: (patch) => {
        if (patch.state) statuses.push(patch.state);
      },
      onGuestMigrated,
      debounceMs: 100,
      retryBaseMs: 1000,
      retryMaxMs: 8000,
      now: () => 123,
    });
    return {
      engine,
      api,
      remote,
      statuses,
      onGuestMigrated,
      getLocal: () => local,
      setLocal: (next: RepertoireStoreState) => {
        local = next;
      },
    };
  }

  it("à la connexion, fusionne cloud + invité, pousse les répertoires d'invité puis les efface", async () => {
    const t = setup(state(), state([rep("cloud")]));
    const guest = state([rep("invite", { createdAt: 200 })]);

    expect(await t.engine.attach("u1", guest)).toBe(true);

    expect(t.getLocal().order).toEqual(["cloud", "invite"]);
    expect(t.remote.pushes).toHaveLength(1);
    expect(t.remote.pushes[0].upserts.map((u) => u.repertoire.id)).toEqual(["invite"]);
    expect(t.onGuestMigrated).toHaveBeenCalledTimes(1);
    expect(t.statuses.at(-1)).toBe("idle");
  });

  it("propage une suppression locale en suppression douce", async () => {
    const t = setup(state(), state([rep("a")]));
    await t.engine.attach("u1", null);

    t.setLocal(state([], { a: 500 }));
    t.engine.notifyLocalChange();
    await vi.advanceTimersByTimeAsync(100);

    expect(t.remote.pushes).toEqual([{ upserts: [], deletes: [{ id: "a", deletedAt: 500 }] }]);
  });

  it("récupère une suppression faite sur un autre appareil", async () => {
    const t = setup(state(), state([rep("a")]));
    await t.engine.attach("u1", null);

    t.remote.state = state([], { a: 900 });
    expect(await t.engine.refresh()).toBe(true);

    expect(t.getLocal().order).toEqual([]);
    expect(t.getLocal().deleted).toEqual({ a: 900 });
    expect(t.remote.pushes).toHaveLength(0);
  });

  it("garde les changements locaux si l'envoi échoue, puis réessaie", async () => {
    const t = setup(state(), state());
    await t.engine.attach("u1", null);

    t.remote.pushError = new Error("réseau");
    t.setLocal(state([rep("a")]));
    expect(await t.engine.flush()).toBe(false);
    expect(t.statuses.at(-1)).toBe("error");

    t.remote.pushError = null;
    await vi.advanceTimersByTimeAsync(1000);
    expect(t.remote.pushes).toHaveLength(1);
    expect(t.statuses.at(-1)).toBe("idle");
  });

  it("au détachement, signale si tout était synchronisé", async () => {
    const t = setup(state(), state());
    await t.engine.attach("u1", null);
    t.setLocal(state([rep("a")]));
    expect(await t.engine.detach()).toBe(true);
    expect(t.remote.pushes).toHaveLength(1);
    expect(t.statuses.at(-1)).toBe("disabled");
  });
});
