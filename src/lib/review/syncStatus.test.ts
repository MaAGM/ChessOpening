import { describe, expect, it } from "vitest";
import { combineSyncStatuses, type SyncStatus } from "./syncStatus";

const s = (state: SyncStatus["state"], lastSyncedAt: number | null = null, error: string | null = null): SyncStatus => ({
  state,
  lastSyncedAt,
  error,
});

describe("combineSyncStatuses", () => {
  it("est désactivé sans moteur actif", () => {
    expect(combineSyncStatuses([])).toEqual(s("disabled"));
    expect(combineSyncStatuses([s("disabled"), s("disabled")])).toEqual(s("disabled"));
  });

  it("affiche l'état le plus préoccupant, avec son message", () => {
    expect(combineSyncStatuses([s("idle", 5), s("syncing")]).state).toBe("syncing");
    expect(combineSyncStatuses([s("syncing"), s("offline", null, "hors ligne")])).toMatchObject({
      state: "offline",
      error: "hors ligne",
    });
    expect(combineSyncStatuses([s("offline", null, "a"), s("error", null, "b")])).toMatchObject({
      state: "error",
      error: "b",
    });
  });

  it("retient la plus ancienne des dernières synchronisations des moteurs actifs", () => {
    expect(combineSyncStatuses([s("idle", 50), s("idle", 20), s("disabled", 1)]).lastSyncedAt).toBe(20);
    expect(combineSyncStatuses([s("idle", 50), s("syncing")]).lastSyncedAt).toBe(50);
  });

  it("n'affiche pas d'erreur quand tout va bien", () => {
    expect(combineSyncStatuses([s("idle", 1, "ancienne"), s("idle", 2)]).error).toBeNull();
  });
});
