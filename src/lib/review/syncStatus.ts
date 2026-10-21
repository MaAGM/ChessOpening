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
