import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sanitizeState } from "./reviewStore";
import { DAY_MS } from "./srs";

describe("sanitizeState", () => {
  it("migre la version 1 (sans statistiques) vers la version 2 sans rien perdre", () => {
    const state = sanitizeState({
      version: 1,
      reviewChapters: { "french-m1": { addedAt: 123 } },
      completedChapters: ["french-m1", "french-m1", 42],
    });
    expect(state).toEqual({
      version: 2,
      reviewChapters: { "french-m1": { addedAt: 123 } },
      completedChapters: ["french-m1"],
      positions: {},
    });
  });

  it("conserve des statistiques valides et nettoie les invalides", () => {
    const state = sanitizeState({
      version: 2,
      reviewChapters: {},
      completedChapters: [],
      positions: {
        ok: { box: 3, due: 5, attempts: 4, failures: 1, lastSeen: 2, recent: [1, 0, 1] },
        "box-hors-limites": { box: 99, due: 5, recent: [1, 1, 1, 1, 1, 1, 1, 0] },
        "sans-boite": { due: 5 },
        "pas-un-objet": "oups",
      },
    })!;

    expect(Object.keys(state.positions).sort()).toEqual(["box-hors-limites", "ok"]);
    expect(state.positions.ok).toEqual({
      box: 3, due: 5, attempts: 4, failures: 1, lastSeen: 2, recent: [1, 0, 1],
    });
    expect(state.positions["box-hors-limites"].box).toBe(5); // ramenée dans les limites
    expect(state.positions["box-hors-limites"].recent).toHaveLength(5); // fenêtre bornée
  });

  it("rejette les données inconnues", () => {
    expect(sanitizeState(null)).toBeNull();
    expect(sanitizeState("x")).toBeNull();
    expect(sanitizeState({ version: 99 })).toBeNull();
  });
});

// Le store garde un état en mémoire au niveau du module : on le recharge à chaque test
// avec un localStorage factice pour tester la persistance et la migration.
describe("reviewStore (avec localStorage factice)", () => {
  const STORAGE_KEY = "chess-opening:review-store-v1";
  let data: Record<string, string>;

  beforeEach(() => {
    data = {};
    vi.resetModules();
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (k: string) => (k in data ? data[k] : null),
        setItem: (k: string, v: string) => { data[k] = v; },
      },
      addEventListener: () => {},
      removeEventListener: () => {},
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("migre les chapitres complétés depuis l'ancienne clé", async () => {
    data["chess-opening:completed-chapters-v2"] = JSON.stringify(["a", "b"]);
    const store = await import("./reviewStore");
    expect(store.getSnapshot().completedChapters).toEqual(["a", "b"]);
  });

  it("enregistre un résultat de position et le persiste", async () => {
    const store = await import("./reviewStore");
    store.recordPositionResult("pos-1", true, 1000);

    const saved = JSON.parse(data[STORAGE_KEY]);
    expect(saved.version).toBe(2);
    expect(saved.positions["pos-1"]).toMatchObject({ box: 2, due: 1000 + DAY_MS, attempts: 1 });
  });

  it("fait monter puis retomber une fiche", async () => {
    const store = await import("./reviewStore");
    store.recordPositionResult("pos-1", true, 1000);
    store.recordPositionResult("pos-1", true, 2000);
    expect(store.getSnapshot().positions["pos-1"].box).toBe(3);

    store.recordPositionResult("pos-1", false, 3000);
    const stats = store.getSnapshot().positions["pos-1"];
    expect(stats.box).toBe(1);
    expect(stats.failures).toBe(1);
  });

  it("relit des statistiques déjà persistées au rechargement", async () => {
    const first = await import("./reviewStore");
    first.addReviewChapter("french-m1");
    first.recordPositionResult("pos-1", true, 1000);

    vi.resetModules();
    const second = await import("./reviewStore");
    const state = second.getSnapshot();
    expect(Object.keys(state.reviewChapters)).toEqual(["french-m1"]);
    expect(state.positions["pos-1"].box).toBe(2);
  });

  it("efface les statistiques en gardant les chapitres", async () => {
    const store = await import("./reviewStore");
    store.addReviewChapter("french-m1");
    store.recordPositionResult("pos-1", true, 1000);
    store.resetPositionStats();

    expect(store.getSnapshot().positions).toEqual({});
    expect(Object.keys(store.getSnapshot().reviewChapters)).toEqual(["french-m1"]);
  });
});
