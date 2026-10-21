import { SRS_CONFIG, clampBox, nextStats, type PositionStats } from "./srs";

// Invité : la clé garde son nom d'origine (la version du format est dans les données).
const GUEST_STORAGE_KEY = "chess-opening:review-store-v1";
// Connecté : un cache hors ligne par utilisateur, séparé des données d'invité.
const USER_STORAGE_PREFIX = "chess-opening:review-store-v2:user:";
// Ancienne clé : lue une seule fois pour migrer les chapitres déjà complétés.
const LEGACY_COMPLETED_KEY = "chess-opening:completed-chapters-v2";
const STORE_VERSION = 2;

export type ReviewChapterEntry = {
  addedAt: number;
};

export type ReviewStoreState = {
  version: typeof STORE_VERSION;
  /** Chapitres ajoutés aux révisions, indexés par chapterId. */
  reviewChapters: Record<string, ReviewChapterEntry>;
  /** Chapitres terminés en mode Masterclass. */
  completedChapters: string[];
  /** Statistiques de répétition espacée, indexées par clé de position. */
  positions: Record<string, PositionStats>;
};

/** Où l'état est lu et écrit en local : mode invité ou cache d'un utilisateur connecté. */
export type StorageScope = { kind: "guest" } | { kind: "user"; userId: string };

/**
 * Origine d'un changement :
 *  - local    : action de l'utilisateur dans l'application (à synchroniser) ;
 *  - remote   : état fusionné avec le cloud (déjà synchronisé) ;
 *  - external : modification venue d'un autre onglet (cet onglet n'a rien à pousser).
 */
export type ChangeSource = "local" | "remote" | "external";
export type ChangeListener = (
  prev: ReviewStoreState,
  next: ReviewStoreState,
  source: ChangeSource,
) => void;

// ---------------------------------------------------------------------------
// Utilitaires
// ---------------------------------------------------------------------------
function hasBrowserStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function has(obj: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function nonNegativeInt(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

export function createEmptyState(): ReviewStoreState {
  return { version: STORE_VERSION, reviewChapters: {}, completedChapters: [], positions: {} };
}

/** Snapshot serveur (SSR + hydratation) : référence stable, jamais mutée. */
const EMPTY_STATE: ReviewStoreState = Object.freeze(createEmptyState());

/** Vrai si l'état contient au moins une donnée (chapitre, chapitre complété ou statistique). */
export function hasStateData(state: ReviewStoreState): boolean {
  return (
    Object.keys(state.reviewChapters).length > 0 ||
    state.completedChapters.length > 0 ||
    Object.keys(state.positions).length > 0
  );
}

function storageKeyOf(scope: StorageScope): string {
  return scope.kind === "guest" ? GUEST_STORAGE_KEY : USER_STORAGE_PREFIX + scope.userId;
}

function readLegacyCompleted(): string[] {
  try {
    const raw = window.localStorage.getItem(LEGACY_COMPLETED_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return Array.from(new Set(parsed.filter((x): x is string => typeof x === "string")));
  } catch {
    return [];
  }
}

function sanitizePositions(raw: unknown): Record<string, PositionStats> {
  const positions: Record<string, PositionStats> = {};
  if (!isRecord(raw)) return positions;

  for (const [key, value] of Object.entries(raw)) {
    if (!isRecord(value)) continue;
    const { box, due, lastSeen, recent } = value;
    if (typeof box !== "number" || !Number.isFinite(box)) continue;
    if (typeof due !== "number" || !Number.isFinite(due)) continue;

    positions[key] = {
      box: clampBox(box),
      due,
      attempts: nonNegativeInt(value.attempts),
      failures: nonNegativeInt(value.failures),
      lastSeen: typeof lastSeen === "number" && Number.isFinite(lastSeen) ? lastSeen : 0,
      recent: Array.isArray(recent)
        ? recent.filter((r): r is number => r === 0 || r === 1).slice(-SRS_CONFIG.recentWindow)
        : [],
    };
  }

  return positions;
}

/**
 * Valide et nettoie des données lues dans le localStorage.
 * Accepte la version 1 (sans statistiques) et la migre vers la version 2.
 */
export function sanitizeState(raw: unknown): ReviewStoreState | null {
  if (!isRecord(raw) || (raw.version !== 1 && raw.version !== STORE_VERSION)) return null;

  const reviewChapters: Record<string, ReviewChapterEntry> = {};
  if (isRecord(raw.reviewChapters)) {
    for (const [id, entry] of Object.entries(raw.reviewChapters)) {
      const addedAt =
        isRecord(entry) && typeof entry.addedAt === "number" ? entry.addedAt : Date.now();
      reviewChapters[id] = { addedAt };
    }
  }

  const completedChapters = Array.isArray(raw.completedChapters)
    ? Array.from(new Set(raw.completedChapters.filter((x): x is string => typeof x === "string")))
    : [];

  return {
    version: STORE_VERSION,
    reviewChapters,
    completedChapters,
    positions: sanitizePositions(raw.positions),
  };
}

/** Lit l'état persisté d'un périmètre (invité ou utilisateur), sans toucher au cache. */
function loadScope(scope: StorageScope): ReviewStoreState {
  if (!hasBrowserStorage()) return EMPTY_STATE;

  try {
    const raw = window.localStorage.getItem(storageKeyOf(scope));
    if (raw) {
      const parsed = sanitizeState(JSON.parse(raw));
      if (parsed) return parsed;
    }
  } catch {
    // JSON corrompu : on retombe sur la migration / l'état vide.
  }

  // Première utilisation : migration de l'ancienne clé (mode invité uniquement).
  return scope.kind === "guest"
    ? { ...createEmptyState(), completedChapters: readLegacyCompleted() }
    : createEmptyState();
}

function persist(state: ReviewStoreState): void {
  if (!hasBrowserStorage()) return;
  try {
    window.localStorage.setItem(storageKeyOf(scope), JSON.stringify(state));
  } catch (error) {
    // Quota dépassé, navigation privée, etc. : l'état en mémoire reste valide.
    console.warn("[reviewStore] Persistance impossible :", error);
  }
}

function removeKey(key: string): void {
  if (!hasBrowserStorage()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Sans importance : la clé sera simplement relue plus tard.
  }
}

// ---------------------------------------------------------------------------
// Store externe (contrat useSyncExternalStore)
// ---------------------------------------------------------------------------
let scope: StorageScope = { kind: "guest" };
let cache: ReviewStoreState | null = null;
const listeners = new Set<() => void>();
const changeListeners = new Set<ChangeListener>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

function commit(next: ReviewStoreState, source: ChangeSource): void {
  const prev = getSnapshot();
  cache = next;
  persist(next);
  notify();
  changeListeners.forEach((listener) => listener(prev, next, source));
}

/** Synchronisation entre onglets : un seul handler global pour tous les abonnés. */
function onStorageEvent(event: StorageEvent): void {
  if (event.key === storageKeyOf(scope) || event.key === null) {
    const prev = getSnapshot();
    cache = loadScope(scope);
    notify();
    changeListeners.forEach((listener) => listener(prev, cache!, "external"));
  }
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", onStorageEvent);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorageEvent);
  };
}

export function getSnapshot(): ReviewStoreState {
  if (cache === null) cache = loadScope(scope);
  return cache;
}

export function getServerSnapshot(): ReviewStoreState {
  return EMPTY_STATE;
}

// ---------------------------------------------------------------------------
// Périmètre de stockage (invité / connecté) et synchronisation
// ---------------------------------------------------------------------------
export function getStorageScope(): StorageScope {
  return scope;
}

/** Bascule entre le mode invité et le cache d'un utilisateur : l'état affiché est rechargé. */
export function setStorageScope(next: StorageScope): void {
  if (storageKeyOf(next) === storageKeyOf(scope) && cache !== null) return;
  scope = next;
  cache = loadScope(next);
  notify();
}

/** Abonnement aux changements, avec leur origine (sert au moteur de synchronisation). */
export function subscribeToChanges(listener: ChangeListener): () => void {
  changeListeners.add(listener);
  return () => {
    changeListeners.delete(listener);
  };
}

/** État enregistré en mode invité (lu depuis le localStorage, sans changer de périmètre). */
export function readGuestState(): ReviewStoreState {
  return loadScope({ kind: "guest" });
}

/** Supprime les données d'invité (après leur migration réussie vers le compte). */
export function clearGuestState(): void {
  removeKey(GUEST_STORAGE_KEY);
  removeKey(LEGACY_COMPLETED_KEY);
  if (scope.kind === "guest") {
    cache = createEmptyState();
    notify();
  }
}

/** Supprime le cache hors ligne d'un utilisateur (à la déconnexion, une fois tout synchronisé). */
export function clearUserCache(userId: string): void {
  removeKey(storageKeyOf({ kind: "user", userId }));
}

/** Applique un état fusionné avec le cloud : persisté et affiché, sans être re-poussé. */
export function applyRemoteState(next: ReviewStoreState): void {
  const prev = getSnapshot();
  if (JSON.stringify(prev) === JSON.stringify(next)) return;
  commit(next, "remote");
}

// ---------------------------------------------------------------------------
// Actions (références stables, utilisables hors React)
// ---------------------------------------------------------------------------
export function addReviewChapter(chapterId: string): void {
  const state = getSnapshot();
  if (has(state.reviewChapters, chapterId)) return;
  commit(
    {
      ...state,
      reviewChapters: { ...state.reviewChapters, [chapterId]: { addedAt: Date.now() } },
    },
    "local",
  );
}

export function removeReviewChapter(chapterId: string): void {
  const state = getSnapshot();
  if (!has(state.reviewChapters, chapterId)) return;
  const { [chapterId]: _removed, ...rest } = state.reviewChapters;
  commit({ ...state, reviewChapters: rest }, "local");
}

export function markChapterComplete(chapterId: string): void {
  const state = getSnapshot();
  if (state.completedChapters.includes(chapterId)) return;
  commit({ ...state, completedChapters: [...state.completedChapters, chapterId] }, "local");
}

/** Enregistre le résultat d'une fiche (position) : juste du premier coup ou non. */
export function recordPositionResult(
  positionKey: string,
  success: boolean,
  now: number = Date.now(),
): void {
  const state = getSnapshot();
  const previous = has(state.positions, positionKey) ? state.positions[positionKey] : undefined;
  commit(
    {
      ...state,
      positions: { ...state.positions, [positionKey]: nextStats(previous, success, now) },
    },
    "local",
  );
}

/** Efface toutes les statistiques de répétition espacée (les chapitres sont conservés). */
export function resetPositionStats(): void {
  const state = getSnapshot();
  if (Object.keys(state.positions).length === 0) return;
  commit({ ...state, positions: {} }, "local");
}