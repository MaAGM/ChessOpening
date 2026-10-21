import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const GUEST_KEY = "chess-opening:review-store-v1";
const USER_KEY = (id: string) => `chess-opening:review-store-v2:user:${id}`;
const LEGACY_KEY = "chess-opening:completed-chapters-v2";

describe("reviewStore : périmètres invité / connecté et synchronisation", () => {
  let data: Record<string, string>;
  let handlers: Record<string, (event: { key: string | null }) => void>;

  beforeEach(() => {
    data = {};
    handlers = {};
    vi.resetModules();
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (k: string) => (k in data ? data[k] : null),
        setItem: (k: string, v: string) => {
          data[k] = v;
        },
        removeItem: (k: string) => {
          delete data[k];
        },
      },
      addEventListener: (type: string, fn: (event: { key: string | null }) => void) => {
        handlers[type] = fn;
      },
      removeEventListener: () => {},
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("écrit dans le cache de l'utilisateur sans toucher aux données d'invité", async () => {
    const store = await import("./reviewStore");
    store.addReviewChapter("guest-chapter");

    store.setStorageScope({ kind: "user", userId: "u1" });
    expect(store.getSnapshot().reviewChapters).toEqual({}); // le cache de u1 est vide
    store.addReviewChapter("user-chapter");

    expect(Object.keys(JSON.parse(data[GUEST_KEY]).reviewChapters)).toEqual(["guest-chapter"]);
    expect(Object.keys(JSON.parse(data[USER_KEY("u1")]).reviewChapters)).toEqual(["user-chapter"]);
  });

  it("recharge l'état du bon périmètre quand on bascule", async () => {
    const store = await import("./reviewStore");
    store.addReviewChapter("guest-chapter");
    store.setStorageScope({ kind: "user", userId: "u1" });
    store.addReviewChapter("user-chapter");

    store.setStorageScope({ kind: "guest" });
    expect(Object.keys(store.getSnapshot().reviewChapters)).toEqual(["guest-chapter"]);

    store.setStorageScope({ kind: "user", userId: "u1" });
    expect(Object.keys(store.getSnapshot().reviewChapters)).toEqual(["user-chapter"]);
  });

  it("notifie les abonnés React quand le périmètre change", async () => {
    const store = await import("./reviewStore");
    const listener = vi.fn();
    store.subscribe(listener);
    store.setStorageScope({ kind: "user", userId: "u1" });
    expect(listener).toHaveBeenCalled();
  });

  it("lit les données d'invité même quand le périmètre est celui d'un utilisateur", async () => {
    data[GUEST_KEY] = JSON.stringify({
      version: 2,
      reviewChapters: { g: { addedAt: 1 } },
      completedChapters: [],
      positions: {},
    });
    const store = await import("./reviewStore");
    store.setStorageScope({ kind: "user", userId: "u1" });
    expect(Object.keys(store.readGuestState().reviewChapters)).toEqual(["g"]);
  });

  it("inclut les chapitres complétés de l'ancienne clé dans les données d'invité", async () => {
    data[LEGACY_KEY] = JSON.stringify(["old-1", "old-2"]);
    const store = await import("./reviewStore");
    expect(store.readGuestState().completedChapters).toEqual(["old-1", "old-2"]);
  });

  it("efface les données d'invité (et l'ancienne clé) après migration", async () => {
    data[GUEST_KEY] = JSON.stringify({
      version: 2,
      reviewChapters: { g: { addedAt: 1 } },
      completedChapters: ["g"],
      positions: {},
    });
    data[LEGACY_KEY] = JSON.stringify(["g"]);
    const store = await import("./reviewStore");
    store.setStorageScope({ kind: "user", userId: "u1" });

    store.clearGuestState();

    expect(GUEST_KEY in data).toBe(false);
    expect(LEGACY_KEY in data).toBe(false);
    expect(store.hasStateData(store.readGuestState())).toBe(false);
  });

  it("efface le cache d'un utilisateur", async () => {
    const store = await import("./reviewStore");
    store.setStorageScope({ kind: "user", userId: "u1" });
    store.addReviewChapter("c");
    store.setStorageScope({ kind: "guest" });
    expect(USER_KEY("u1") in data).toBe(true);

    store.clearUserCache("u1");
    expect(USER_KEY("u1") in data).toBe(false);
  });

  it("distingue l'origine des changements : local, cloud et autre onglet", async () => {
    const store = await import("./reviewStore");
    const sources: string[] = [];
    store.subscribeToChanges((_prev, _next, source) => sources.push(source));
    store.subscribe(() => {}); // enregistre l'écouteur « storage »

    store.addReviewChapter("a");
    store.applyRemoteState({
      version: 2,
      reviewChapters: { a: { addedAt: 1 }, b: { addedAt: 2 } },
      completedChapters: [],
      positions: {},
    });
    data[GUEST_KEY] = JSON.stringify({
      version: 2,
      reviewChapters: { z: { addedAt: 3 } },
      completedChapters: [],
      positions: {},
    });
    handlers.storage({ key: GUEST_KEY });

    expect(sources).toEqual(["local", "remote", "external"]);
    expect(Object.keys(store.getSnapshot().reviewChapters)).toEqual(["z"]);
  });

  it("ignore un état distant identique (aucune notification inutile)", async () => {
    const store = await import("./reviewStore");
    const listener = vi.fn();
    store.addReviewChapter("a");
    store.subscribeToChanges(listener);

    store.applyRemoteState(JSON.parse(JSON.stringify(store.getSnapshot())));
    expect(listener).not.toHaveBeenCalled();
  });

  it("n'écoute que la clé du périmètre courant pour la synchronisation entre onglets", async () => {
    const store = await import("./reviewStore");
    store.subscribe(() => {});
    store.setStorageScope({ kind: "user", userId: "u1" });
    const listener = vi.fn();
    store.subscribeToChanges(listener);

    handlers.storage({ key: GUEST_KEY }); // clé d'invité : sans effet pour u1
    expect(listener).not.toHaveBeenCalled();
  });
});
