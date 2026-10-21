import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReviewStoreState } from "./reviewStore";
import {
  ReviewSyncEngine,
  diffStates,
  isEmptyChangeSet,
  mergeStates,
  type ChangeSet,
  type ReviewRemote,
} from "./reviewSync";
import type { PositionStats } from "./srs";

const stats = (overrides: Partial<PositionStats> = {}): PositionStats => ({
  box: 2,
  due: 5000,
  attempts: 1,
  failures: 0,
  lastSeen: 1000,
  recent: [1],
  ...overrides,
});

const makeState = (partial: Partial<ReviewStoreState> = {}): ReviewStoreState => ({
  version: 2,
  reviewChapters: {},
  completedChapters: [],
  positions: {},
  ...partial,
});

// ---------------------------------------------------------------------------
describe("mergeStates", () => {
  it("fait l'union des chapitres et garde la date d'ajout la plus ancienne", () => {
    const merged = mergeStates(
      makeState({ reviewChapters: { a: { addedAt: 500 }, b: { addedAt: 900 } }, completedChapters: ["a"] }),
      makeState({ reviewChapters: { b: { addedAt: 100 }, c: { addedAt: 300 } }, completedChapters: ["a", "c"] }),
    );
    expect(merged.reviewChapters).toEqual({
      a: { addedAt: 500 },
      b: { addedAt: 100 },
      c: { addedAt: 300 },
    });
    expect(merged.completedChapters).toEqual(["a", "c"]);
  });

  it("garde, pour chaque position, la version la plus récente", () => {
    const older = stats({ lastSeen: 1000, box: 2 });
    const newer = stats({ lastSeen: 9000, box: 4 });
    const merged = mergeStates(
      makeState({ positions: { p1: older, p2: newer, only: stats() } }),
      makeState({ positions: { p1: newer, p2: older, other: stats() } }),
    );
    expect(merged.positions.p1.box).toBe(4);
    expect(merged.positions.p2.box).toBe(4);
    expect(Object.keys(merged.positions).sort()).toEqual(["only", "other", "p1", "p2"]);
  });

  it("départage deux versions simultanées par le nombre de tentatives", () => {
    const few = stats({ lastSeen: 1000, attempts: 2, box: 2 });
    const many = stats({ lastSeen: 1000, attempts: 7, box: 3 });
    expect(mergeStates(makeState({ positions: { p: few } }), makeState({ positions: { p: many } })).positions.p.box).toBe(3);
    expect(mergeStates(makeState({ positions: { p: many } }), makeState({ positions: { p: few } })).positions.p.box).toBe(3);
  });

  it("ne mute pas ses entrées", () => {
    const a = makeState({ reviewChapters: { a: { addedAt: 1 } }, positions: { p: stats() } });
    const b = makeState({ reviewChapters: { b: { addedAt: 2 } }, positions: { q: stats() } });
    const before = JSON.stringify([a, b]);
    mergeStates(a, b);
    expect(JSON.stringify([a, b])).toBe(before);
  });
});

// ---------------------------------------------------------------------------
describe("diffStates", () => {
  it("est vide pour deux états identiques", () => {
    const state = makeState({
      reviewChapters: { a: { addedAt: 1 } },
      completedChapters: ["a"],
      positions: { p: stats() },
    });
    expect(isEmptyChangeSet(diffStates(state, JSON.parse(JSON.stringify(state))))).toBe(true);
  });

  it("détecte fiches ajoutées, modifiées et supprimées", () => {
    const prev = makeState({ positions: { same: stats(), changed: stats(), gone: stats() } });
    const next = makeState({
      positions: { same: stats(), changed: stats({ box: 3 }), fresh: stats() },
    });
    const changes = diffStates(prev, next);
    expect(Object.keys(changes.positionsUpsert).sort()).toEqual(["changed", "fresh"]);
    expect(changes.positionsDelete).toEqual(["gone"]);
  });

  it("détecte les chapitres ajoutés aux révisions et complétés", () => {
    const changes = diffStates(
      makeState(),
      makeState({ reviewChapters: { a: { addedAt: 42 } }, completedChapters: ["a", "b"] }),
    );
    expect(changes.chaptersReviewSet).toEqual({ a: 42 });
    expect(changes.chaptersCompletedSet.sort()).toEqual(["a", "b"]);
  });

  it("retire des révisions : la ligne reste si le chapitre est complété, sinon elle est supprimée", () => {
    const prev = makeState({
      reviewChapters: { done: { addedAt: 1 }, open: { addedAt: 1 } },
      completedChapters: ["done"],
    });
    const changes = diffStates(prev, makeState({ completedChapters: ["done"] }));
    expect(changes.chaptersReviewClear).toEqual(["done"]);
    expect(changes.chaptersDelete).toEqual(["open"]);
  });
});

// ---------------------------------------------------------------------------
describe("ReviewSyncEngine", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  function setup(initial = makeState(), remoteState = makeState()) {
    let local = initial;
    const remote = {
      state: remoteState,
      pushes: [] as ChangeSet[],
      fetchError: null as Error | null,
      pushError: null as Error | null,
    };
    const api: ReviewRemote = {
      fetchState: vi.fn(async () => {
        if (remote.fetchError) throw remote.fetchError;
        return remote.state;
      }),
      pushChanges: vi.fn(async (_userId: string, changes: ChangeSet) => {
        if (remote.pushError) throw remote.pushError;
        remote.pushes.push(changes);
      }),
    };
    const statuses: string[] = [];
    const onGuestMigrated = vi.fn();
    const engine = new ReviewSyncEngine({
      remote: api,
      getState: () => local,
      applyRemoteState: (state) => {
        local = state;
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
      onGuestMigrated,
      statuses,
      getLocal: () => local,
      setLocal: (state: ReviewStoreState) => {
        local = state;
      },
    };
  }

  it("à la connexion, fusionne cloud + invité et ne pousse que ce qui manque", async () => {
    const t = setup(makeState(), makeState({ positions: { a: stats({ lastSeen: 1000 }) } }));
    const guest = makeState({
      positions: { b: stats() },
      reviewChapters: { c1: { addedAt: 77 } },
      completedChapters: ["c1"],
    });

    expect(await t.engine.attach("u1", guest)).toBe(true);

    expect(Object.keys(t.getLocal().positions).sort()).toEqual(["a", "b"]);
    expect(t.remote.pushes).toHaveLength(1);
    expect(Object.keys(t.remote.pushes[0].positionsUpsert)).toEqual(["b"]); // « a » est déjà dans le cloud
    expect(t.remote.pushes[0].chaptersReviewSet).toEqual({ c1: 77 });
    expect(t.remote.pushes[0].chaptersCompletedSet).toEqual(["c1"]);
    expect(t.onGuestMigrated).toHaveBeenCalledTimes(1);
    expect(t.statuses.at(-1)).toBe("idle");
  });

  it("ne pousse rien quand le cache local est déjà égal au cloud", async () => {
    const shared = makeState({ positions: { a: stats() } });
    const t = setup(shared, shared);
    await t.engine.attach("u1", null);
    expect(t.remote.pushes).toHaveLength(0);
    expect(t.onGuestMigrated).not.toHaveBeenCalled();
  });

  it("regroupe plusieurs changements rapprochés en un seul envoi", async () => {
    const t = setup();
    await t.engine.attach("u1", null);

    t.setLocal(makeState({ positions: { a: stats() } }));
    t.engine.notifyLocalChange();
    await vi.advanceTimersByTimeAsync(50);
    t.setLocal(makeState({ positions: { a: stats(), b: stats() } }));
    t.engine.notifyLocalChange();
    expect(t.remote.pushes).toHaveLength(0); // encore dans le délai

    await vi.advanceTimersByTimeAsync(100);
    expect(t.remote.pushes).toHaveLength(1);
    expect(Object.keys(t.remote.pushes[0].positionsUpsert).sort()).toEqual(["a", "b"]);
    expect(t.statuses.at(-1)).toBe("idle");
  });

  it("réessaie après un échec d'envoi, avec la même différence", async () => {
    const t = setup();
    await t.engine.attach("u1", null);

    t.remote.pushError = new Error("réseau coupé");
    t.setLocal(makeState({ positions: { a: stats() } }));
    t.engine.notifyLocalChange();
    await vi.advanceTimersByTimeAsync(100);
    expect(t.statuses.at(-1)).toBe("error");
    expect(t.remote.pushes).toHaveLength(0);

    t.remote.pushError = null;
    await vi.advanceTimersByTimeAsync(1000); // délai de la première nouvelle tentative
    expect(t.remote.pushes).toHaveLength(1);
    expect(Object.keys(t.remote.pushes[0].positionsUpsert)).toEqual(["a"]);
    expect(t.statuses.at(-1)).toBe("idle");
  });

  it("allonge le délai entre les tentatives (backoff)", async () => {
    const t = setup();
    await t.engine.attach("u1", null);
    t.remote.pushError = new Error("hors service");
    t.setLocal(makeState({ positions: { a: stats() } }));
    t.engine.notifyLocalChange();

    await vi.advanceTimersByTimeAsync(100); // 1er essai
    const afterFirst = (t.api.pushChanges as ReturnType<typeof vi.fn>).mock.calls.length;
    await vi.advanceTimersByTimeAsync(1000); // 2e essai à +1 s
    const afterSecond = (t.api.pushChanges as ReturnType<typeof vi.fn>).mock.calls.length;
    await vi.advanceTimersByTimeAsync(1500); // le 3e n'arrive qu'à +2 s : pas encore
    expect((t.api.pushChanges as ReturnType<typeof vi.fn>).mock.calls.length).toBe(afterSecond);
    await vi.advanceTimersByTimeAsync(600);
    expect((t.api.pushChanges as ReturnType<typeof vi.fn>).mock.calls.length).toBe(afterSecond + 1);
    expect(afterSecond).toBe(afterFirst + 1);
  });

  it("si le cloud est injoignable à la connexion, réessaie sans migrer l'invité", async () => {
    const t = setup();
    t.remote.fetchError = new Error("injoignable");
    const guest = makeState({ positions: { g: stats() } });

    expect(await t.engine.attach("u1", guest)).toBe(false);
    expect(t.engine.isAttached).toBe(false);
    expect(t.onGuestMigrated).not.toHaveBeenCalled();

    t.remote.fetchError = null;
    await vi.advanceTimersByTimeAsync(1000);

    expect(t.engine.isAttached).toBe(true);
    expect(t.getLocal().positions.g).toBeDefined();
    expect(t.remote.pushes).toHaveLength(1);
    expect(t.onGuestMigrated).toHaveBeenCalledTimes(1);
  });

  it("n'efface pas l'invité tant que l'envoi échoue, puis le fait une fois réussi", async () => {
    const t = setup();
    t.remote.pushError = new Error("refusé");
    const guest = makeState({ positions: { g: stats() } });

    await t.engine.attach("u1", guest);
    expect(t.engine.isAttached).toBe(true); // fusion faite, envoi à refaire
    expect(t.onGuestMigrated).not.toHaveBeenCalled();

    t.remote.pushError = null;
    await vi.advanceTimersByTimeAsync(1000);
    expect(t.onGuestMigrated).toHaveBeenCalledTimes(1);
  });

  it("envoie aussi les changements survenus pendant un envoi en cours", async () => {
    let release!: () => void;
    const pushes: ChangeSet[] = [];
    let first = true;
    let local = makeState();
    const engine = new ReviewSyncEngine({
      remote: {
        fetchState: async () => makeState(),
        pushChanges: (_u, changes) => {
          pushes.push(changes);
          if (first) {
            first = false;
            return new Promise<void>((resolve) => {
              release = resolve;
            });
          }
          return Promise.resolve();
        },
      },
      getState: () => local,
      applyRemoteState: (s) => {
        local = s;
      },
      setStatus: () => {},
      debounceMs: 10,
    });
    await engine.attach("u1", null);

    local = makeState({ positions: { a: stats() } });
    engine.notifyLocalChange();
    await vi.advanceTimersByTimeAsync(10); // 1er envoi démarré, bloqué

    local = makeState({ positions: { a: stats(), b: stats() } }); // changement pendant l'envoi
    engine.notifyLocalChange();
    release();
    await vi.advanceTimersByTimeAsync(50);

    expect(pushes).toHaveLength(2);
    expect(Object.keys(pushes[1].positionsUpsert)).toEqual(["b"]);
  });

  it("détache après un dernier envoi et n'envoie plus rien ensuite", async () => {
    const t = setup();
    await t.engine.attach("u1", null);
    t.setLocal(makeState({ positions: { a: stats() } }));

    expect(await t.engine.detach()).toBe(true);
    expect(t.remote.pushes).toHaveLength(1);
    expect(t.statuses.at(-1)).toBe("disabled");

    t.setLocal(makeState({ positions: { a: stats(), z: stats() } }));
    t.engine.notifyLocalChange();
    await vi.advanceTimersByTimeAsync(500);
    expect(t.remote.pushes).toHaveLength(1);
  });

  it("signale que tout n'est pas synchronisé si le dernier envoi échoue", async () => {
    const t = setup();
    await t.engine.attach("u1", null);
    t.remote.pushError = new Error("hors ligne");
    t.setLocal(makeState({ positions: { a: stats() } }));
    expect(await t.engine.detach()).toBe(false);
  });

  it("refresh : récupère les progrès d'un autre appareil sans les renvoyer", async () => {
    const t = setup(makeState({ positions: { a: stats({ lastSeen: 1000, box: 2 }) } }));
    t.remote.state = makeState({ positions: { a: stats({ lastSeen: 1000, box: 2 }) } });
    await t.engine.attach("u1", null);
    const pushesBefore = t.remote.pushes.length;

    // Un autre appareil a progressé entre-temps
    t.remote.state = makeState({
      positions: { a: stats({ lastSeen: 9000, box: 4 }), z: stats({ lastSeen: 9000 }) },
    });
    expect(await t.engine.refresh()).toBe(true);

    expect(t.getLocal().positions.a.box).toBe(4);
    expect(t.getLocal().positions.z).toBeDefined();
    expect(t.remote.pushes).toHaveLength(pushesBefore); // rien à renvoyer
  });

  it("ignore la réponse d'une connexion devenue obsolète", async () => {
    let resolveFirst!: (state: ReviewStoreState) => void;
    let calls = 0;
    let local = makeState();
    const applied: ReviewStoreState[] = [];
    const engine = new ReviewSyncEngine({
      remote: {
        fetchState: () => {
          calls += 1;
          if (calls === 1) {
            return new Promise<ReviewStoreState>((resolve) => {
              resolveFirst = resolve;
            });
          }
          return Promise.resolve(makeState({ positions: { second: stats() } }));
        },
        pushChanges: async () => {},
      },
      getState: () => local,
      applyRemoteState: (s) => {
        local = s;
        applied.push(s);
      },
      setStatus: () => {},
    });

    const first = engine.attach("user-1", null);
    await engine.attach("user-2", null);
    resolveFirst(makeState({ positions: { first: stats() } }));
    expect(await first).toBe(false);

    expect(Object.keys(local.positions)).toEqual(["second"]);
    expect(applied.every((s) => !("first" in s.positions))).toBe(true);
  });
});
