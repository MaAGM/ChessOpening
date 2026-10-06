const STORAGE_KEY = "chess-opening:review-store-v1";
// Ancienne clé : lue une seule fois pour migrer les chapitres déjà complétés.
const LEGACY_COMPLETED_KEY = "chess-opening:completed-chapters-v2";
const STORE_VERSION = 1;

export type ReviewChapterEntry = {
  addedAt: number;
  // v2 (répétition espacée) : box, due, fails, etc.
};

export type ReviewStoreState = {
  version: typeof STORE_VERSION;
  /** Chapitres ajoutés aux révisions, indexés par chapterId. */
  reviewChapters: Record<string, ReviewChapterEntry>;
  /** Chapitres terminés en mode Masterclass. */
  completedChapters: string[];
};

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

function createEmptyState(): ReviewStoreState {
  return { version: STORE_VERSION, reviewChapters: {}, completedChapters: [] };
}

/** Snapshot serveur (SSR + hydratation) : référence stable, jamais mutée. */
const EMPTY_STATE: ReviewStoreState = Object.freeze(createEmptyState());

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

/** Valide et nettoie des données lues dans le localStorage. */
function sanitize(raw: unknown): ReviewStoreState | null {
  if (!isRecord(raw) || raw.version !== STORE_VERSION) return null;

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

  return { version: STORE_VERSION, reviewChapters, completedChapters };
}

function load(): ReviewStoreState {
  if (!hasBrowserStorage()) return EMPTY_STATE;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = sanitize(JSON.parse(raw));
      if (parsed) return parsed;
    }
  } catch {
    // JSON corrompu : on retombe sur la migration / l'état vide.
  }

  // Première utilisation du nouveau store : migration depuis l'ancienne clé.
  return { ...createEmptyState(), completedChapters: readLegacyCompleted() };
}

function persist(state: ReviewStoreState): void {
  if (!hasBrowserStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    // Quota dépassé, navigation privée, etc. : l'état en mémoire reste valide.
    console.warn("[reviewStore] Persistance impossible :", error);
  }
}

// ---------------------------------------------------------------------------
// Store externe (contrat useSyncExternalStore)
// ---------------------------------------------------------------------------
let cache: ReviewStoreState | null = null;
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

function commit(next: ReviewStoreState): void {
  cache = next;
  persist(next);
  notify();
}

/** Synchronisation entre onglets : un seul handler global pour tous les abonnés. */
function onStorageEvent(event: StorageEvent): void {
  if (event.key === STORAGE_KEY || event.key === null) {
    cache = load();
    notify();
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
  if (cache === null) cache = load();
  return cache;
}

export function getServerSnapshot(): ReviewStoreState {
  return EMPTY_STATE;
}

// ---------------------------------------------------------------------------
// Actions (références stables, utilisables hors React)
// ---------------------------------------------------------------------------
export function addReviewChapter(chapterId: string): void {
  const state = getSnapshot();
  if (has(state.reviewChapters, chapterId)) return;
  commit({
    ...state,
    reviewChapters: { ...state.reviewChapters, [chapterId]: { addedAt: Date.now() } },
  });
}

export function removeReviewChapter(chapterId: string): void {
  const state = getSnapshot();
  if (!has(state.reviewChapters, chapterId)) return;
  const { [chapterId]: _removed, ...rest } = state.reviewChapters;
  commit({ ...state, reviewChapters: rest });
}

export function markChapterComplete(chapterId: string): void {
  const state = getSnapshot();
  if (state.completedChapters.includes(chapterId)) return;
  commit({ ...state, completedChapters: [...state.completedChapters, chapterId] });
}