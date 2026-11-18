import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createAuthSyncController, createSyncTarget, type AuthSource, type AuthSyncDeps } from "./authSync";
import type { AuthState, AuthUser } from "./authStore";
import { hasStateData, type ReviewStoreState } from "@/lib/review/reviewStore";

const emptyState = (): ReviewStoreState => ({
  version: 2,
  reviewChapters: {},
  completedChapters: [],
  positions: {},
});

const guestWithData = (): ReviewStoreState => ({
  ...emptyState(),
  reviewChapters: { c1: { addedAt: 1 } },
});

const user = (id: string): AuthUser => ({
  id,
  email: `${id}@exemple.fr`,
  fullName: "Ada Lovelace",
  avatarUrl: "https://img/a.png",
});

/** Fausse source de session : `emit` simule ce que le fournisseur d'authentification signale. */
function fakeSource() {
  let listener: ((u: AuthUser | null) => void) | null = null;
  const unsubscribe = vi.fn();
  const subscribe = vi.fn((l: (u: AuthUser | null) => void) => {
    listener = l;
    return unsubscribe;
  });
  const source: AuthSource = { subscribe };
  return { source, subscribe, unsubscribe, emit: (u: AuthUser | null) => listener!(u) };
}

describe("createAuthSyncController", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  function setup(options: { guest?: ReviewStoreState; configured?: boolean; detachResult?: boolean } = {}) {
    const fake = fakeSource();
    const engine = {
      attach: vi.fn(async () => true),
      detach: vi.fn(async () => options.detachResult ?? true),
    };
    const store = {
      setStorageScope: vi.fn(),
      readGuestState: vi.fn(() => options.guest ?? emptyState()),
      clearUserCache: vi.fn(),
    };
    const authStates: Partial<AuthState>[] = [];

    const deps: AuthSyncDeps = {
      source: options.configured === false ? null : fake.source,
      targets: [createSyncTarget({ ...store, hasData: hasStateData }, engine)],
      setAuthState: (patch) => authStates.push(patch),
    };
    const controller = createAuthSyncController(deps);

    return {
      controller,
      engine,
      store,
      authStates,
      unsubscribe: fake.unsubscribe,
      send: async (u: AuthUser | null) => {
        fake.emit(u);
        await vi.advanceTimersByTimeAsync(0);
        await controller.idle();
      },
    };
  }

  it("reste en mode invité quand le backend n'est pas configuré", () => {
    const t = setup({ configured: false });
    t.controller.start();
    expect(t.authStates).toEqual([{ status: "guest", user: null }]);
  });

  it("reste invité sans toucher au stockage quand il n'y a pas de session", async () => {
    const t = setup();
    t.controller.start();
    await t.send(null);

    expect(t.authStates.at(-1)).toEqual({ status: "guest", user: null });
    expect(t.store.setStorageScope).not.toHaveBeenCalled();
    expect(t.engine.attach).not.toHaveBeenCalled();
  });

  it("à la première connexion, transmet les données d'invité au moteur (auto-migration)", async () => {
    const guest = guestWithData();
    const t = setup({ guest });
    t.controller.start();
    await t.send(user("u1"));

    expect(t.store.setStorageScope).toHaveBeenCalledWith({ kind: "user", userId: "u1" });
    expect(t.engine.attach).toHaveBeenCalledWith("u1", guest);
    expect(t.authStates.at(-1)).toMatchObject({
      status: "authenticated",
      user: { id: "u1", email: "u1@exemple.fr", fullName: "Ada Lovelace", avatarUrl: "https://img/a.png" },
    });
  });

  it("ne transmet rien quand il n'y a pas de données d'invité", async () => {
    const t = setup();
    t.controller.start();
    await t.send(user("u1"));
    expect(t.engine.attach).toHaveBeenCalledWith("u1", null);
  });

  it("ignore les événements répétés pour le même utilisateur", async () => {
    const t = setup({ guest: guestWithData() });
    t.controller.start();
    await t.send(user("u1")); // session initiale
    await t.send(user("u1")); // jeton rafraîchi
    await t.send(user("u1")); // retour sur l'onglet

    expect(t.engine.attach).toHaveBeenCalledTimes(1);
    expect(t.store.setStorageScope).toHaveBeenCalledTimes(1);
  });

  it("met à jour le profil affiché sans reconnecter quand l'utilisateur ne change pas", async () => {
    const t = setup();
    t.controller.start();
    await t.send(user("u1"));
    await t.send({ ...user("u1"), fullName: "Ada King" });

    expect(t.engine.attach).toHaveBeenCalledTimes(1);
    expect(t.authStates.at(-1)).toMatchObject({ status: "authenticated", user: { fullName: "Ada King" } });
  });

  it("à la déconnexion, détache, repasse en invité et efface le cache s'il est synchronisé", async () => {
    const t = setup({ detachResult: true });
    t.controller.start();
    await t.send(user("u1"));
    await t.send(null);

    expect(t.engine.detach).toHaveBeenCalledTimes(1);
    expect(t.store.setStorageScope).toHaveBeenLastCalledWith({ kind: "guest" });
    expect(t.store.clearUserCache).toHaveBeenCalledWith("u1");
    expect(t.authStates.at(-1)).toEqual({ status: "guest", user: null });
  });

  it("conserve le cache de l'utilisateur si tout n'était pas synchronisé", async () => {
    const t = setup({ detachResult: false });
    t.controller.start();
    await t.send(user("u1"));
    await t.send(null);

    expect(t.store.setStorageScope).toHaveBeenLastCalledWith({ kind: "guest" });
    expect(t.store.clearUserCache).not.toHaveBeenCalled();
  });

  it("gère le passage direct d'un utilisateur à un autre", async () => {
    const t = setup();
    t.controller.start();
    await t.send(user("u1"));
    await t.send(user("u2"));

    expect(t.engine.detach).toHaveBeenCalledTimes(1);
    expect(t.engine.attach).toHaveBeenNthCalledWith(2, "u2", null);
    expect(t.store.clearUserCache).toHaveBeenCalledWith("u1");
  });

  it("traite les événements dans l'ordre d'arrivée", async () => {
    const t = setup();
    t.controller.start();
    // Deux événements émis coup sur coup, avant que le premier ne soit traité
    t.controller.start();
    await t.send(user("u1"));
    await t.send(null);

    const order = [t.engine.attach.mock.invocationCallOrder[0], t.engine.detach.mock.invocationCallOrder[0]];
    expect(order[0]).toBeLessThan(order[1]);
  });

  it("ne s'abonne qu'une fois même si start est appelé plusieurs fois", () => {
    const fake = fakeSource();
    const controller = createAuthSyncController({ source: fake.source, targets: [], setAuthState() {} });
    controller.start();
    controller.start();
    expect(fake.subscribe).toHaveBeenCalledTimes(1);
  });

  it("se désabonne de la source à l'arrêt", () => {
    const t = setup();
    t.controller.start();
    t.controller.stop();
    expect(t.unsubscribe).toHaveBeenCalledTimes(1);
  });

  it("connecte et déconnecte chaque cible (révisions et répertoires) avec ses propres données", async () => {
    const fake = fakeSource();
    const makeTarget = (guest: { items: string[] }) => {
      const store = {
        setStorageScope: vi.fn(),
        readGuestState: vi.fn(() => guest),
        clearUserCache: vi.fn(),
        hasData: (state: { items: string[] }) => state.items.length > 0,
      };
      const engine = {
        attach: vi.fn<(userId: string, guest: { items: string[] } | null) => Promise<boolean>>(
          async () => true,
        ),
        detach: vi.fn(async () => true),
      };
      return { store, engine, target: createSyncTarget(store, engine) };
    };
    const review = makeTarget({ items: [] });
    const repertoires = makeTarget({ items: ["r1"] });

    const controller = createAuthSyncController({
      source: fake.source,
      targets: [review.target, repertoires.target],
      setAuthState() {},
    });
    controller.start();

    fake.emit(user("u1"));
    await vi.advanceTimersByTimeAsync(0);
    await controller.idle();

    expect(review.engine.attach).toHaveBeenCalledWith("u1", null);
    expect(repertoires.engine.attach).toHaveBeenCalledWith("u1", { items: ["r1"] });
    for (const t of [review, repertoires]) {
      expect(t.store.setStorageScope).toHaveBeenCalledWith({ kind: "user", userId: "u1" });
      // l'invité est lu avant de basculer de périmètre
      expect(t.store.readGuestState.mock.invocationCallOrder[0]).toBeLessThan(
        t.store.setStorageScope.mock.invocationCallOrder[0],
      );
    }

    fake.emit(null);
    await vi.advanceTimersByTimeAsync(0);
    await controller.idle();

    for (const t of [review, repertoires]) {
      expect(t.engine.detach).toHaveBeenCalledTimes(1);
      expect(t.store.setStorageScope).toHaveBeenLastCalledWith({ kind: "guest" });
      expect(t.store.clearUserCache).toHaveBeenCalledWith("u1");
    }
  });
});
