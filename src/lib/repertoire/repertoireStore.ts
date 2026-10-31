import { REPERTOIRE_LIMITS } from "./limits";
import { countNodes, createNodeId } from "./repertoireTree";
import {
  isMoveSymbol,
  type Repertoire,
  type RepertoireDraft,
  type RepertoireNode,
  type RepertoireOrigin,
  type RepertoireStoreState,
} from "./types";
import type { Side } from "@/lib/review/types";

/**
 * Store des répertoires de l'utilisateur.
 *
 * VOLONTAIREMENT local à l'appareil, indépendant du mode invité / connecté : tant que
 * la synchronisation cloud des répertoires n'existe pas, lier ce store au compte ferait
 * disparaître les répertoires d'un invité à sa connexion. Il suffira, le moment venu,
 * de lui donner un périmètre comme à `reviewStore`.
 */
const STORAGE_KEY = "chess-opening:repertoires-v1";
const STORE_VERSION = 1;

export type RepertoireError = "invalid-name" | "not-found" | "limit-reached" | "invalid-order";
export type StoreResult<T> = { ok: true; value: T } | { ok: false; error: RepertoireError };

export type ChangeSource = "local" | "external";
export type ChangeListener = (
  prev: RepertoireStoreState,
  next: RepertoireStoreState,
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

function createEmptyState(): RepertoireStoreState {
  return { version: STORE_VERSION, repertoires: {}, order: [] };
}

/** Snapshot serveur (SSR + hydratation) : référence stable, jamais mutée. */
const EMPTY_STATE: RepertoireStoreState = Object.freeze(createEmptyState());

function createRepertoireId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeName(name: string): string | null {
  const trimmed = name.trim().replace(/\s+/g, " ").slice(0, REPERTOIRE_LIMITS.maxNameLength);
  return trimmed === "" ? null : trimmed;
}

function normalizeCategory(category: string | null | undefined): string | null {
  const trimmed = (category ?? "").trim().replace(/\s+/g, " ");
  return trimmed === "" ? null : trimmed.slice(0, REPERTOIRE_LIMITS.maxCategoryLength);
}

function normalizeComment(comment: string | undefined): string | undefined {
  const trimmed = comment?.trim().slice(0, REPERTOIRE_LIMITS.maxCommentLength);
  return trimmed ? trimmed : undefined;
}

// ---------------------------------------------------------------------------
// Validation des données lues dans le localStorage
// ---------------------------------------------------------------------------
function sanitizeArrows(raw: unknown): [string, string][] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const arrows = raw.filter(
    (a): a is [string, string] =>
      Array.isArray(a) && a.length === 2 && typeof a[0] === "string" && typeof a[1] === "string",
  );
  return arrows.length > 0 ? arrows : undefined;
}

/**
 * Nettoie un arbre : ignore les nœuds invalides, les coups en double chez des frères,
 * les identifiants manquants ou répétés, et les branches trop profondes. Ne tronque
 * jamais un arbre trop gros (les limites ne s'appliquent qu'aux ajouts).
 */
function sanitizeNodes(raw: unknown, depth: number, taken: Set<string>): RepertoireNode[] {
  if (!Array.isArray(raw) || depth > REPERTOIRE_LIMITS.maxDepth) return [];

  const nodes: RepertoireNode[] = [];
  const sans = new Set<string>();

  for (const item of raw) {
    if (!isRecord(item)) continue;
    const { san } = item;
    if (typeof san !== "string" || san === "" || san.length > 12 || sans.has(san)) continue;
    sans.add(san);

    let id = typeof item.id === "string" && item.id !== "" ? item.id : "";
    if (id === "" || id === "root" || taken.has(id)) id = createNodeId(taken);
    taken.add(id);

    const node: RepertoireNode = { id, san, children: [] };
    if (isMoveSymbol(item.symbol)) node.symbol = item.symbol;
    const comment = typeof item.comment === "string" ? normalizeComment(item.comment) : undefined;
    if (comment) node.comment = comment;
    const arrows = sanitizeArrows(item.arrows);
    if (arrows) node.arrows = arrows;
    node.children = sanitizeNodes(item.children, depth + 1, taken);

    nodes.push(node);
  }
  return nodes;
}

function sanitizeOrigin(raw: unknown): RepertoireOrigin {
  if (
    isRecord(raw) &&
    raw.kind === "template" &&
    typeof raw.templateId === "string" &&
    typeof raw.version === "number"
  ) {
    return { kind: "template", templateId: raw.templateId, version: raw.version };
  }
  return { kind: "custom" };
}

function sanitizeRepertoire(raw: unknown): Repertoire | null {
  if (!isRecord(raw)) return null;
  if (typeof raw.id !== "string" || raw.id === "") return null;
  if (raw.side !== "white" && raw.side !== "black") return null;

  const createdAt = typeof raw.createdAt === "number" ? raw.createdAt : Date.now();
  const comment = typeof raw.comment === "string" ? normalizeComment(raw.comment) : undefined;

  return {
    id: raw.id,
    name: (typeof raw.name === "string" ? normalizeName(raw.name) : null) ?? "Sans titre",
    side: raw.side,
    category: typeof raw.category === "string" ? normalizeCategory(raw.category) : null,
    reviewEnabled: typeof raw.reviewEnabled === "boolean" ? raw.reviewEnabled : true,
    ...(comment ? { comment } : {}),
    children: sanitizeNodes(raw.children, 1, new Set()),
    origin: sanitizeOrigin(raw.origin),
    createdAt,
    updatedAt: typeof raw.updatedAt === "number" ? raw.updatedAt : createdAt,
  };
}

/** Valide et nettoie un état lu dans le localStorage ; null si le format est inconnu. */
export function sanitizeRepertoireState(raw: unknown): RepertoireStoreState | null {
  if (!isRecord(raw) || raw.version !== STORE_VERSION) return null;

  const repertoires: Record<string, Repertoire> = {};
  if (isRecord(raw.repertoires)) {
    for (const value of Object.values(raw.repertoires)) {
      const repertoire = sanitizeRepertoire(value);
      if (repertoire) repertoires[repertoire.id] = repertoire;
    }
  }

  // Ordre : on garde l'ordre enregistré pour les répertoires qui existent encore,
  // puis on ajoute à la fin ceux qui n'y figuraient pas (du plus ancien au plus récent).
  const order: string[] = [];
  if (Array.isArray(raw.order)) {
    for (const id of raw.order) {
      if (typeof id === "string" && has(repertoires, id) && !order.includes(id)) order.push(id);
    }
  }
  const missing = Object.values(repertoires)
    .filter((r) => !order.includes(r.id))
    .sort((a, b) => a.createdAt - b.createdAt);
  order.push(...missing.map((r) => r.id));

  return { version: STORE_VERSION, repertoires, order };
}

function load(): RepertoireStoreState {
  if (!hasBrowserStorage()) return EMPTY_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = sanitizeRepertoireState(JSON.parse(raw));
      if (parsed) return parsed;
    }
  } catch {
    // JSON corrompu : on repart d'un état vide plutôt que de bloquer l'application.
  }
  return createEmptyState();
}

// ---------------------------------------------------------------------------
// Erreur de sauvegarde : perdre des modifications en silence est inacceptable
// pour un éditeur, l'interface doit pouvoir prévenir l'utilisateur.
// ---------------------------------------------------------------------------
let persistError: string | null = null;
const persistErrorListeners = new Set<() => void>();

function setPersistError(next: string | null): void {
  if (next === persistError) return;
  persistError = next;
  persistErrorListeners.forEach((listener) => listener());
}

export function getPersistError(): string | null {
  return persistError;
}

export function getServerPersistError(): string | null {
  return null;
}

export function subscribePersistError(listener: () => void): () => void {
  persistErrorListeners.add(listener);
  return () => {
    persistErrorListeners.delete(listener);
  };
}

function persist(state: RepertoireStoreState): void {
  if (!hasBrowserStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setPersistError(null);
  } catch (error) {
    console.warn("[repertoireStore] Persistance impossible :", error);
    setPersistError(
      "Sauvegarde impossible : l'espace de stockage du navigateur est plein ou indisponible. " +
        "Vos dernières modifications ne sont pas enregistrées.",
    );
  }
}

// ---------------------------------------------------------------------------
// Store externe (contrat useSyncExternalStore)
// ---------------------------------------------------------------------------
let cache: RepertoireStoreState | null = null;
const listeners = new Set<() => void>();
const changeListeners = new Set<ChangeListener>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

function commit(next: RepertoireStoreState): void {
  const prev = getSnapshot();
  cache = next;
  persist(next);
  notify();
  changeListeners.forEach((listener) => listener(prev, next, "local"));
}

/** Synchronisation entre onglets. */
function onStorageEvent(event: StorageEvent): void {
  if (event.key !== STORAGE_KEY && event.key !== null) return;
  const prev = getSnapshot();
  cache = load();
  notify();
  changeListeners.forEach((listener) => listener(prev, cache!, "external"));
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", onStorageEvent);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorageEvent);
  };
}

export function getSnapshot(): RepertoireStoreState {
  if (cache === null) cache = load();
  return cache;
}

export function getServerSnapshot(): RepertoireStoreState {
  return EMPTY_STATE;
}

/** Abonnement aux changements, avec leur origine (servira à la synchronisation cloud). */
export function subscribeToChanges(listener: ChangeListener): () => void {
  changeListeners.add(listener);
  return () => {
    changeListeners.delete(listener);
  };
}

// ---------------------------------------------------------------------------
// Actions (références stables, utilisables hors React)
// ---------------------------------------------------------------------------

/** Ajoute un répertoire (création, copie, import, modèle). Renvoie son identifiant. */
export function addRepertoire(draft: RepertoireDraft): StoreResult<string> {
  const name = normalizeName(draft.name);
  if (name === null) return { ok: false, error: "invalid-name" };
  if (countNodes(draft) > REPERTOIRE_LIMITS.maxNodes) return { ok: false, error: "limit-reached" };

  const state = getSnapshot();
  const now = Date.now();
  const comment = normalizeComment(draft.comment);
  const repertoire: Repertoire = {
    id: createRepertoireId(),
    name,
    side: draft.side,
    category: normalizeCategory(draft.category),
    reviewEnabled: draft.reviewEnabled,
    ...(comment ? { comment } : {}),
    children: draft.children,
    origin: draft.origin,
    createdAt: now,
    updatedAt: now,
  };

  commit({
    ...state,
    repertoires: { ...state.repertoires, [repertoire.id]: repertoire },
    order: [...state.order, repertoire.id],
  });
  return { ok: true, value: repertoire.id };
}

/** Crée un répertoire vide. */
export function createRepertoire(input: {
  name: string;
  side: Side;
  category?: string | null;
}): StoreResult<string> {
  return addRepertoire({
    name: input.name,
    side: input.side,
    category: input.category ?? null,
    reviewEnabled: true,
    children: [],
    origin: { kind: "custom" },
  });
}

export type RepertoireMetaPatch = Partial<
  Pick<Repertoire, "name" | "side" | "category" | "reviewEnabled" | "comment">
>;

export function updateRepertoireMeta(id: string, patch: RepertoireMetaPatch): StoreResult<null> {
  const state = getSnapshot();
  if (!has(state.repertoires, id)) return { ok: false, error: "not-found" };
  const current = state.repertoires[id];

  const next: Repertoire = { ...current };
  if (patch.name !== undefined) {
    const name = normalizeName(patch.name);
    if (name === null) return { ok: false, error: "invalid-name" };
    next.name = name;
  }
  if (patch.side !== undefined) next.side = patch.side;
  if (patch.category !== undefined) next.category = normalizeCategory(patch.category);
  if (patch.reviewEnabled !== undefined) next.reviewEnabled = patch.reviewEnabled;
  if ("comment" in patch) {
    const comment = normalizeComment(patch.comment);
    if (comment) next.comment = comment;
    else delete next.comment;
  }

  const unchanged =
    next.name === current.name &&
    next.side === current.side &&
    next.category === current.category &&
    next.reviewEnabled === current.reviewEnabled &&
    next.comment === current.comment;
  if (unchanged) return { ok: true, value: null };

  next.updatedAt = Date.now();
  commit({ ...state, repertoires: { ...state.repertoires, [id]: next } });
  return { ok: true, value: null };
}

/** Remplace l'arbre d'un répertoire (chemin des modifications de l'éditeur). */
export function updateRepertoireTree(id: string, children: RepertoireNode[]): StoreResult<null> {
  const state = getSnapshot();
  if (!has(state.repertoires, id)) return { ok: false, error: "not-found" };
  const current = state.repertoires[id];
  if (children === current.children) return { ok: true, value: null };

  commit({
    ...state,
    repertoires: { ...state.repertoires, [id]: { ...current, children, updatedAt: Date.now() } },
  });
  return { ok: true, value: null };
}

export function deleteRepertoire(id: string): StoreResult<null> {
  const state = getSnapshot();
  if (!has(state.repertoires, id)) return { ok: false, error: "not-found" };

  const { [id]: _removed, ...rest } = state.repertoires;
  commit({ ...state, repertoires: rest, order: state.order.filter((other) => other !== id) });
  return { ok: true, value: null };
}

/** Copie un répertoire (nouvel identifiant, nom suffixé, origine « personnalisée »). */
export function duplicateRepertoire(id: string): StoreResult<string> {
  const state = getSnapshot();
  if (!has(state.repertoires, id)) return { ok: false, error: "not-found" };
  const source = state.repertoires[id];

  return addRepertoire({
    name: `${source.name} (copie)`,
    side: source.side,
    category: source.category,
    reviewEnabled: source.reviewEnabled,
    comment: source.comment,
    children: source.children,
    origin: { kind: "custom" },
  });
}

/** Réordonne les répertoires : `order` doit contenir exactement les identifiants existants. */
export function reorderRepertoires(order: string[]): StoreResult<null> {
  const state = getSnapshot();
  const sameSet =
    order.length === state.order.length &&
    new Set(order).size === order.length &&
    order.every((id) => has(state.repertoires, id));
  if (!sameSet) return { ok: false, error: "invalid-order" };

  commit({ ...state, order });
  return { ok: true, value: null };
}
