import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "@supabase/supabase-js";
import { createAuthSyncController, toAuthUser, type AuthSyncDeps } from "./authSync";
import type { AuthState } from "./authStore";
import type { ReviewStoreState } from "@/lib/review/reviewStore";

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

const session = (id: string): Session =>
  ({
    user: {
      id,
      email: `${id}@exemple.fr`,
      user_metadata: { full_name: "Ada Lovelace", picture: "https://img/a.png" },
    },
  }) as unknown as Session;

describe("createAuthSyncController", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  function setup(options: { guest?: ReviewStoreState; client?: boolean; detachResult?: boolean } = {}) {
    let emit: ((event: string, session: Session | null) => void) | null = null;
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
    const unsubscribe = vi.fn();

    const deps: AuthSyncDeps = {
      client:
        options.client === false
          ? null
          : {
              auth: {
                onAuthStateChange: (callback) => {
                  emit = callback;
                  return { data: { subscription: { unsubscribe } } };
                },
              },
            },
      engine,
      store,
      setAuthState: (patch) => authStates.push(patch),
    };
    const controller = createAuthSyncController(deps);

    return {
      controller,
      engine,
      store,
      authStates,
      unsubscribe,
      send: async (event: string, s: Session | null) => {
        emit!(event, s);
        await vi.advanceTimersByTimeAsync(0);
        await controller.idle();
      },
    };
  }

  it("reste en mode invité quand Supabase n'est pas configuré", () => {
    const t = setup({ client: false });
    t.controller.start();
    expect(t.authStates).toEqual([{ status: "guest", user: null }]);
  });

  it("reste invité sans toucher au stockage quand il n'y a pas de session", async () => {
    const t = setup();
    t.controller.start();
    await t.send("INITIAL_SESSION", null);

    expect(t.authStates.at(-1)).toEqual({ status: "guest", user: null });
    expect(t.store.setStorageScope).not.toHaveBeenCalled();
    expect(t.engine.attach).not.toHaveBeenCalled();
  });

  it("à la première connexion, transmet les données d'invité au moteur (auto-migration)", async () => {
    const guest = guestWithData();
    const t = setup({ guest });
    t.controller.start();
    await t.send("SIGNED_IN", session("u1"));

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
    await t.send("SIGNED_IN", session("u1"));
    expect(t.engine.attach).toHaveBeenCalledWith("u1", null);
  });

  it("ignore les événements répétés pour le même utilisateur", async () => {
    const t = setup({ guest: guestWithData() });
    t.controller.start();
    await t.send("INITIAL_SESSION", session("u1"));
    await t.send("TOKEN_REFRESHED", session("u1"));
    await t.send("SIGNED_IN", session("u1")); // émis aussi au retour sur l'onglet

    expect(t.engine.attach).toHaveBeenCalledTimes(1);
    expect(t.store.setStorageScope).toHaveBeenCalledTimes(1);
  });

  it("à la déconnexion, détache, repasse en invité et efface le cache s'il est synchronisé", async () => {
    const t = setup({ detachResult: true });
    t.controller.start();
    await t.send("SIGNED_IN", session("u1"));
    await t.send("SIGNED_OUT", null);

    expect(t.engine.detach).toHaveBeenCalledTimes(1);
    expect(t.store.setStorageScope).toHaveBeenLastCalledWith({ kind: "guest" });
    expect(t.store.clearUserCache).toHaveBeenCalledWith("u1");
    expect(t.authStates.at(-1)).toEqual({ status: "guest", user: null });
  });

  it("conserve le cache de l'utilisateur si tout n'était pas synchronisé", async () => {
    const t = setup({ detachResult: false });
    t.controller.start();
    await t.send("SIGNED_IN", session("u1"));
    await t.send("SIGNED_OUT", null);

    expect(t.store.setStorageScope).toHaveBeenLastCalledWith({ kind: "guest" });
    expect(t.store.clearUserCache).not.toHaveBeenCalled();
  });

  it("gère le passage direct d'un utilisateur à un autre", async () => {
    const t = setup();
    t.controller.start();
    await t.send("SIGNED_IN", session("u1"));
    await t.send("SIGNED_IN", session("u2"));

    expect(t.engine.detach).toHaveBeenCalledTimes(1);
    expect(t.engine.attach).toHaveBeenNthCalledWith(2, "u2", null);
    expect(t.store.clearUserCache).toHaveBeenCalledWith("u1");
  });

  it("traite les événements dans l'ordre d'arrivée", async () => {
    const t = setup();
    t.controller.start();
    // Deux événements émis coup sur coup, avant que le premier ne soit traité
    t.controller.start();
    await t.send("SIGNED_IN", session("u1"));
    await t.send("SIGNED_OUT", null);

    const order = [t.engine.attach.mock.invocationCallOrder[0], t.engine.detach.mock.invocationCallOrder[0]];
    expect(order[0]).toBeLessThan(order[1]);
  });

  it("ne s'abonne qu'une fois même si start est appelé plusieurs fois", () => {
    let subscriptions = 0;
    const controller = createAuthSyncController({
      client: {
        auth: {
          onAuthStateChange: () => {
            subscriptions += 1;
            return { data: { subscription: { unsubscribe() {} } } };
          },
        },
      },
      engine: { attach: async () => true, detach: async () => true },
      store: { setStorageScope() {}, readGuestState: emptyState, clearUserCache() {} },
      setAuthState() {},
    });
    controller.start();
    controller.start();
    expect(subscriptions).toBe(1);
  });
});

describe("toAuthUser", () => {
  it("lit le nom et l'avatar dans les métadonnées (Google : name / picture)", () => {
    const user = toAuthUser({
      id: "u1",
      email: "a@b.c",
      user_metadata: { name: "Ada", picture: "https://img/p.png" },
    } as never);
    expect(user).toEqual({ id: "u1", email: "a@b.c", fullName: "Ada", avatarUrl: "https://img/p.png" });
  });

  it("renvoie null pour les champs absents", () => {
    const user = toAuthUser({ id: "u1", email: undefined, user_metadata: {} } as never);
    expect(user).toEqual({ id: "u1", email: null, fullName: null, avatarUrl: null });
  });
});
