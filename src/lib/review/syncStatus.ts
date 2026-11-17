/** État de la synchronisation cloud, affiché dans l'interface. */
export type SyncState =
  | "disabled" // invité, ou Supabase non configuré : rien à synchroniser
  | "idle" // tout est synchronisé
  | "syncing"
  | "error" // échec : une nouvelle tentative est programmée
  | "offline"; // échec parce que le navigateur est hors ligne

export type SyncStatus = {
  state: SyncState;
  /** Dernière synchronisation réussie (ms depuis l'epoch). */
  lastSyncedAt: number | null;
  error: string | null;
};

const DISABLED_STATUS: SyncStatus = Object.freeze({
  state: "disabled",
  lastSyncedAt: null,
  error: null,
});

let status: SyncStatus = DISABLED_STATUS;
const listeners = new Set<() => void>();

export function subscribeSyncStatus(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSyncStatus(): SyncStatus {
  return status;
}

export function getServerSyncStatus(): SyncStatus {
  return DISABLED_STATUS;
}

/** Du plus au moins important : l'interface affiche l'état le plus préoccupant. */
const STATE_PRIORITY: SyncState[] = ["error", "offline", "syncing", "idle", "disabled"];

/**
 * Combine les états de plusieurs moteurs (révisions, répertoires) en un seul :
 * l'état le plus préoccupant l'emporte, avec son message d'erreur ; la dernière
 * synchronisation est la plus ancienne des moteurs actifs.
 */
export function combineSyncStatuses(list: SyncStatus[]): SyncStatus {
  const state = STATE_PRIORITY.find((s) => list.some((status) => status.state === s)) ?? "disabled";
  const error =
    state === "error" || state === "offline"
      ? (list.find((status) => status.state === state)?.error ?? null)
      : null;
  const times = list
    .filter((status) => status.state !== "disabled" && status.lastSyncedAt !== null)
    .map((status) => status.lastSyncedAt as number);
  return { state, lastSyncedAt: times.length > 0 ? Math.min(...times) : null, error };
}

const channels = new Map<string, SyncStatus>();

/**
 * Canal d'état propre à un moteur de synchronisation : chaque moteur écrit dans le sien,
 * et l'état global (celui affiché) est recalculé à partir de tous les canaux.
 */
export function createSyncStatusChannel(name: string): (patch: Partial<SyncStatus>) => void {
  channels.set(name, DISABLED_STATUS);
  return (patch) => {
    channels.set(name, { ...(channels.get(name) ?? DISABLED_STATUS), ...patch });
    updateSyncStatus(combineSyncStatuses([...channels.values()]));
  };
}

export function updateSyncStatus(patch: Partial<SyncStatus>): void {
  const next = { ...status, ...patch };
  if (
    next.state === status.state &&
    next.lastSyncedAt === status.lastSyncedAt &&
    next.error === status.error
  ) {
    return;
  }
  status = next;
  listeners.forEach((listener) => listener());
}
