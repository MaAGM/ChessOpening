import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPushAuthSource } from "./authSource";
import { createAuthSyncController, createSyncTarget } from "@/lib/auth/authSync";
import type { AuthUser } from "@/lib/auth/authStore";

const ada: AuthUser = { id: "u1", email: "ada@exemple.fr", fullName: "Ada", avatarUrl: null };

describe("createPushAuthSource", () => {
  it("n'émet rien tant que la session est inconnue", () => {
    const { source } = createPushAuthSource();
    const listener = vi.fn();
    source.subscribe(listener);
    expect(listener).not.toHaveBeenCalled();
  });

  it("transmet chaque publication aux abonnés", () => {
    const { source, publish } = createPushAuthSource();
    const received: (AuthUser | null)[] = [];
    source.subscribe((user) => received.push(user));

    publish(null);
    publish(ada);
    publish(null);
    expect(received).toEqual([null, ada, null]);
  });

  it("rejoue la dernière valeur à un abonné tardif", () => {
    const { source, publish } = createPushAuthSource();
    publish(ada);
    const listener = vi.fn();
    source.subscribe(listener);
    expect(listener).toHaveBeenCalledWith(ada);
  });

  it("n'appelle plus un abonné désinscrit", () => {
    const { source, publish } = createPushAuthSource();
    const listener = vi.fn();
    const unsubscribe = source.subscribe(listener);
    unsubscribe();
    publish(ada);
    expect(listener).not.toHaveBeenCalled();
  });
});

describe("createPushAuthSource + authSync", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("migre les données d'invité quand la session est publiée après le démarrage", async () => {
    const { source, publish } = createPushAuthSource();
    const guest = { items: ["r1"] };
    const store = {
      setStorageScope: vi.fn(),
      readGuestState: vi.fn(() => guest),
      clearUserCache: vi.fn(),
      hasData: (state: { items: string[] }) => state.items.length > 0,
    };
    const engine = { attach: vi.fn(async () => true), detach: vi.fn(async () => true) };
    const controller = createAuthSyncController({
      source,
      targets: [createSyncTarget(store, engine)],
      setAuthState() {},
    });
    controller.start();

    publish(ada);
    await vi.advanceTimersByTimeAsync(0);
    await controller.idle();

    expect(engine.attach).toHaveBeenCalledWith("u1", guest);
    expect(store.setStorageScope).toHaveBeenCalledWith({ kind: "user", userId: "u1" });
  });
});
