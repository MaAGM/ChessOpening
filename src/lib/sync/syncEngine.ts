import type { SyncStatus } from "@/lib/review/syncStatus";

/**
 * Moteur de synchronisation générique, partagé par les révisions (`reviewSync.ts`) et les
 * répertoires (`repertoireSync.ts`). Chaque store garde son propre moteur, son propre
 * périmètre et son propre cycle de vie : seul l'algorithme est commun.
 */

/** Accès au cloud (implémenté avec Supabase, remplaçable dans les tests). */
export interface SyncRemote<S, C> {
  fetchState(userId: string): Promise<S>;
  pushChanges(userId: string, changes: C): Promise<void>;
}

/** Fonctions pures propres à un type d'état : fusion et différences. */
export type SyncStrategy<S, C> = {
  emptyState(): S;
  /** Fusionne deux états (cache local, cloud, invité) sans modifier les entrées. */
  merge(a: S, b: S): S;
  /** Opérations à envoyer pour que le cloud, supposé égal à `prev`, devienne égal à `next`. */
  diff(prev: S, next: S): C;
  isEmpty(changes: C): boolean;
};

export type GenericSyncEngineDeps<S, C> = {
  remote: SyncRemote<S, C>;
  strategy: SyncStrategy<S, C>;
  /** État courant du store local. */
  getState: () => S;
  /** Applique au store local un état fusionné avec le cloud (sans le re-pousser). */
  applyRemoteState: (state: S) => void;
  setStatus: (patch: Partial<SyncStatus>) => void;
  /** Appelé quand les données d'invité ont été poussées avec succès (pour les effacer). */
  onGuestMigrated?: () => void;
  /** Attente avant d'envoyer après un changement local (regroupe les modifications rapprochées). */
  debounceMs?: number;
  retryBaseMs?: number;
  retryMaxMs?: number;
  now?: () => number;
};

const DEFAULT_DEBOUNCE_MS = 1500;
const DEFAULT_RETRY_BASE_MS = 2000;
const DEFAULT_RETRY_MAX_MS = 60_000;

/**
 * Synchronisation « état contre état » : le moteur mémorise ce que le cloud contient
 * (`lastSynced`) et envoie, à chaque fois, la différence avec l'état local courant.
 * Il n'y a donc pas de file d'attente à persister : après un échec, une coupure réseau
 * ou une fermeture d'onglet, la prochaine connexion refait la fusion et renvoie ce qui manque.
 */
export class SyncEngine<S, C> {
  private readonly debounceMs: number;
  private readonly retryBaseMs: number;
  private readonly retryMaxMs: number;
  private readonly now: () => number;
  private readonly strategy: SyncStrategy<S, C>;

  private userId: string | null = null;
  private attached = false;
  private generation = 0;
  private lastSynced: S;
  private guestPending: S | null = null;

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private retryDelay: number;
  private inFlight: Promise<boolean> | null = null;

  constructor(private readonly deps: GenericSyncEngineDeps<S, C>) {
    this.strategy = deps.strategy;
    this.debounceMs = deps.debounceMs ?? DEFAULT_DEBOUNCE_MS;
    this.retryBaseMs = deps.retryBaseMs ?? DEFAULT_RETRY_BASE_MS;
    this.retryMaxMs = deps.retryMaxMs ?? DEFAULT_RETRY_MAX_MS;
    this.now = deps.now ?? Date.now;
    this.retryDelay = this.retryBaseMs;
    this.lastSynced = this.strategy.emptyState();
  }

  get isAttached(): boolean {
    return this.attached;
  }

  /**
   * Connecte le moteur à un utilisateur : récupère le cloud, le fusionne avec l'état
   * local (et avec les données d'invité éventuelles), applique le résultat, puis pousse
   * ce qui manque au cloud. Renvoie vrai si le moteur est connecté (même si l'envoi
   * échoue, il réessaiera) ; faux si le cloud est injoignable (nouvelle tentative programmée).
   */
  async attach(userId: string, guestState: S | null): Promise<boolean> {
    this.reset();
    this.userId = userId;
    this.guestPending = guestState;
    return this.runAttach(this.generation);
  }

  /** Signale un changement local : l'envoi est regroupé après un court délai. */
  notifyLocalChange(): void {
    if (!this.attached) return;
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = null;
      void this.flush();
    }, this.debounceMs);
  }

  /** Envoie immédiatement les changements locaux. Renvoie vrai si tout est synchronisé. */
  flush(): Promise<boolean> {
    if (!this.attached || !this.userId) return Promise.resolve(false);
    if (this.inFlight) return this.inFlight; // la boucle en cours relira l'état courant
    this.inFlight = this.runFlush(this.generation);
    return this.inFlight;
  }

  /** Récupère le cloud (modifié depuis un autre appareil) et le fusionne avec l'état local. */
  async refresh(): Promise<boolean> {
    const userId = this.userId;
    if (!this.attached || !userId) return false;
    const generation = this.generation;

    // On envoie d'abord ce qui est en attente : une suppression locale ne doit pas
    // être « ressuscitée » par la fusion avec un cloud pas encore à jour.
    if (!(await this.flush())) return false;

    try {
      const remote = await this.deps.remote.fetchState(userId);
      if (generation !== this.generation) return false;

      const merged = this.strategy.merge(this.deps.getState(), remote);
      this.lastSynced = remote;
      this.deps.applyRemoteState(merged);
      return await this.flush();
    } catch (error) {
      if (generation === this.generation) this.handleFailure(error);
      return false;
    }
  }

  /** Le navigateur est de nouveau en ligne : on réessaie sans attendre le délai. */
  handleOnline(): void {
    if (!this.userId) return;
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
    void this.retry();
  }

  /**
   * Déconnecte le moteur après un dernier envoi. Renvoie vrai si tout était synchronisé
   * (le cache local peut alors être effacé sans perte).
   */
  async detach(): Promise<boolean> {
    const synced = this.attached ? await this.flush() : false;
    this.reset();
    this.deps.setStatus({ state: "disabled", lastSyncedAt: null, error: null });
    return synced;
  }

  // -------------------------------------------------------------------------
  // Interne
  // -------------------------------------------------------------------------
  private reset(): void {
    this.generation += 1;
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.debounceTimer = null;
    this.retryTimer = null;
    this.retryDelay = this.retryBaseMs;
    this.inFlight = null;
    this.attached = false;
    this.userId = null;
    this.guestPending = null;
    this.lastSynced = this.strategy.emptyState();
  }

  private async runAttach(generation: number): Promise<boolean> {
    const userId = this.userId;
    if (!userId) return false;

    this.deps.setStatus({ state: "syncing", error: null });
    try {
      const remote = await this.deps.remote.fetchState(userId);
      if (generation !== this.generation) return false;

      // Cache local de l'utilisateur + cloud + données d'invité (première connexion).
      let merged = this.strategy.merge(this.deps.getState(), remote);
      if (this.guestPending) merged = this.strategy.merge(merged, this.guestPending);

      this.lastSynced = remote;
      this.attached = true;
      this.deps.applyRemoteState(merged);
    } catch (error) {
      if (generation === this.generation) this.handleFailure(error);
      return false;
    }

    await this.flush();
    return true;
  }

  private async runFlush(generation: number): Promise<boolean> {
    await Promise.resolve(); // jamais synchrone : inFlight est affecté avant la fin

    try {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = null;
      }

      for (;;) {
        const userId = this.userId;
        if (generation !== this.generation || !userId) return false;

        const snapshot = this.deps.getState();
        const changes = this.strategy.diff(this.lastSynced, snapshot);
        if (this.strategy.isEmpty(changes)) break;

        this.deps.setStatus({ state: "syncing", error: null });
        try {
          await this.deps.remote.pushChanges(userId, changes);
        } catch (error) {
          if (generation === this.generation) this.handleFailure(error);
          return false;
        }
        if (generation !== this.generation) return false;
        this.lastSynced = snapshot;
      }

      this.retryDelay = this.retryBaseMs;
      this.deps.setStatus({ state: "idle", lastSyncedAt: this.now(), error: null });

      if (this.guestPending) {
        this.guestPending = null;
        this.deps.onGuestMigrated?.();
      }
      return true;
    } finally {
      // Même tick que la sortie de la boucle : aucun changement ne peut passer entre les deux.
      if (generation === this.generation) this.inFlight = null;
    }
  }

  private handleFailure(error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    const offline = typeof navigator !== "undefined" && navigator.onLine === false;
    this.deps.setStatus({ state: offline ? "offline" : "error", error: message });
    this.scheduleRetry();
  }

  private scheduleRetry(): void {
    if (this.retryTimer) return;
    const delay = this.retryDelay;
    this.retryDelay = Math.min(this.retryMaxMs, delay * 2);
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      void this.retry();
    }, delay);
  }

  private async retry(): Promise<void> {
    if (!this.userId) return;
    if (this.attached) {
      await this.flush();
    } else {
      await this.runAttach(this.generation);
    }
  }
}
