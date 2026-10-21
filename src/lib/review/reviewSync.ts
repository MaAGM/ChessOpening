import type { ReviewStoreState } from "./reviewStore";
import type { PositionStats } from "./srs";
import type { SyncStatus } from "./syncStatus";

// ===========================================================================
// Fonctions pures : fusion et différences d'états
// ===========================================================================

/** Ensemble des opérations à envoyer au cloud pour passer d'un état à un autre. */
export type ChangeSet = {
  positionsUpsert: Record<string, PositionStats>;
  positionsDelete: string[];
  /** chapterId -> date d'ajout aux révisions (ms) */
  chaptersReviewSet: Record<string, number>;
  /** Chapitres retirés des révisions mais encore complétés (la ligne reste) */
  chaptersReviewClear: string[];
  chaptersCompletedSet: string[];
  chaptersCompletedClear: string[];
  /** Chapitres sans plus aucune donnée : la ligne est supprimée */
  chaptersDelete: string[];
};

export function createEmptyChangeSet(): ChangeSet {
  return {
    positionsUpsert: {},
    positionsDelete: [],
    chaptersReviewSet: {},
    chaptersReviewClear: [],
    chaptersCompletedSet: [],
    chaptersCompletedClear: [],
    chaptersDelete: [],
  };
}

export function isEmptyChangeSet(changes: ChangeSet): boolean {
  return (
    Object.keys(changes.positionsUpsert).length === 0 &&
    changes.positionsDelete.length === 0 &&
    Object.keys(changes.chaptersReviewSet).length === 0 &&
    changes.chaptersReviewClear.length === 0 &&
    changes.chaptersCompletedSet.length === 0 &&
    changes.chaptersCompletedClear.length === 0 &&
    changes.chaptersDelete.length === 0
  );
}

function hasOwn(obj: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function statsEqual(a: PositionStats, b: PositionStats): boolean {
  return (
    a.box === b.box &&
    a.due === b.due &&
    a.attempts === b.attempts &&
    a.failures === b.failures &&
    a.lastSeen === b.lastSeen &&
    a.recent.length === b.recent.length &&
    a.recent.every((value, i) => value === b.recent[i])
  );
}

/** Entre deux versions d'une même fiche, garde la plus récente (puis la plus travaillée). */
function pickNewer(a: PositionStats, b: PositionStats): PositionStats {
  if (a.lastSeen !== b.lastSeen) return a.lastSeen > b.lastSeen ? a : b;
  return b.attempts > a.attempts ? b : a;
}

/**
 * Fusionne deux états (par exemple le cache local et le cloud).
 *  - chapitres ajoutés aux révisions et chapitres complétés : union ;
 *  - fiches : pour chaque position, la version la plus récente (dernier passage) l'emporte.
 * La fonction est pure et ne modifie aucune de ses entrées.
 */
export function mergeStates(a: ReviewStoreState, b: ReviewStoreState): ReviewStoreState {
  const reviewChapters = { ...a.reviewChapters };
  for (const [id, entry] of Object.entries(b.reviewChapters)) {
    reviewChapters[id] = hasOwn(reviewChapters, id)
      ? { ...reviewChapters[id], addedAt: Math.min(reviewChapters[id].addedAt, entry.addedAt) }
      : entry;
  }

  const completedChapters = Array.from(new Set([...a.completedChapters, ...b.completedChapters]));

  const positions = { ...a.positions };
  for (const [key, incoming] of Object.entries(b.positions)) {
    positions[key] = hasOwn(positions, key) ? pickNewer(positions[key], incoming) : incoming;
  }

  return { version: a.version, reviewChapters, completedChapters, positions };
}

/** Opérations à envoyer pour que le cloud, supposé égal à `prev`, devienne égal à `next`. */
export function diffStates(prev: ReviewStoreState, next: ReviewStoreState): ChangeSet {
  const changes = createEmptyChangeSet();

  // Fiches
  for (const [key, stats] of Object.entries(next.positions)) {
    if (!hasOwn(prev.positions, key) || !statsEqual(prev.positions[key], stats)) {
      changes.positionsUpsert[key] = stats;
    }
  }
  for (const key of Object.keys(prev.positions)) {
    if (!hasOwn(next.positions, key)) changes.positionsDelete.push(key);
  }

  // Chapitres
  const prevCompleted = new Set(prev.completedChapters);
  const nextCompleted = new Set(next.completedChapters);
  const ids = new Set([
    ...Object.keys(prev.reviewChapters),
    ...Object.keys(next.reviewChapters),
    ...prevCompleted,
    ...nextCompleted,
  ]);

  for (const id of ids) {
    const wasReview = hasOwn(prev.reviewChapters, id);
    const isReview = hasOwn(next.reviewChapters, id);
    const wasDone = prevCompleted.has(id);
    const isDone = nextCompleted.has(id);

    if (!isReview && !isDone) {
      if (wasReview || wasDone) changes.chaptersDelete.push(id);
      continue;
    }

    if (isReview && !wasReview) changes.chaptersReviewSet[id] = next.reviewChapters[id].addedAt;
    if (!isReview && wasReview) changes.chaptersReviewClear.push(id);
    if (isDone && !wasDone) changes.chaptersCompletedSet.push(id);
    if (!isDone && wasDone) changes.chaptersCompletedClear.push(id);
  }

  return changes;
}

// ===========================================================================
// Moteur de synchronisation
// ===========================================================================

/** Accès au cloud (implémenté avec Supabase, remplaçable dans les tests). */
export interface ReviewRemote {
  fetchState(userId: string): Promise<ReviewStoreState>;
  pushChanges(userId: string, changes: ChangeSet): Promise<void>;
}

export type SyncEngineDeps = {
  remote: ReviewRemote;
  /** État courant du store local. */
  getState: () => ReviewStoreState;
  /** Applique au store local un état fusionné avec le cloud (sans le re-pousser). */
  applyRemoteState: (state: ReviewStoreState) => void;
  setStatus: (patch: Partial<SyncStatus>) => void;
  /** Appelé quand les données d'invité ont été poussées avec succès (pour les effacer). */
  onGuestMigrated?: () => void;
  /** Attente avant d'envoyer après un changement local (regroupe les coups rapprochés). */
  debounceMs?: number;
  retryBaseMs?: number;
  retryMaxMs?: number;
  now?: () => number;
};

const DEFAULT_DEBOUNCE_MS = 1500;
const DEFAULT_RETRY_BASE_MS = 2000;
const DEFAULT_RETRY_MAX_MS = 60_000;

function emptyState(): ReviewStoreState {
  return { version: 2, reviewChapters: {}, completedChapters: [], positions: {} };
}

/**
 * Synchronisation « état contre état » : le moteur mémorise ce que le cloud contient
 * (`lastSynced`) et envoie, à chaque fois, la différence avec l'état local courant.
 * Il n'y a donc pas de file d'attente à persister : après un échec, une coupure réseau
 * ou une fermeture d'onglet, la prochaine connexion refait la fusion et renvoie ce qui manque.
 */
export class ReviewSyncEngine {
  private readonly debounceMs: number;
  private readonly retryBaseMs: number;
  private readonly retryMaxMs: number;
  private readonly now: () => number;

  private userId: string | null = null;
  private attached = false;
  private generation = 0;
  private lastSynced: ReviewStoreState = emptyState();
  private guestPending: ReviewStoreState | null = null;

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private retryDelay: number;
  private inFlight: Promise<boolean> | null = null;

  constructor(private readonly deps: SyncEngineDeps) {
    this.debounceMs = deps.debounceMs ?? DEFAULT_DEBOUNCE_MS;
    this.retryBaseMs = deps.retryBaseMs ?? DEFAULT_RETRY_BASE_MS;
    this.retryMaxMs = deps.retryMaxMs ?? DEFAULT_RETRY_MAX_MS;
    this.now = deps.now ?? Date.now;
    this.retryDelay = this.retryBaseMs;
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
  async attach(userId: string, guestState: ReviewStoreState | null): Promise<boolean> {
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

      const merged = mergeStates(this.deps.getState(), remote);
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
    this.lastSynced = emptyState();
  }

  private async runAttach(generation: number): Promise<boolean> {
    const userId = this.userId;
    if (!userId) return false;

    this.deps.setStatus({ state: "syncing", error: null });
    try {
      const remote = await this.deps.remote.fetchState(userId);
      if (generation !== this.generation) return false;

      // Cache local de l'utilisateur + cloud + données d'invité (première connexion).
      let merged = mergeStates(this.deps.getState(), remote);
      if (this.guestPending) merged = mergeStates(merged, this.guestPending);

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
        const changes = diffStates(this.lastSynced, snapshot);
        if (isEmptyChangeSet(changes)) break;

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
