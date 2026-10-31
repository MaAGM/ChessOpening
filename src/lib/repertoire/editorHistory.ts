import type { RepertoireNode } from "./types";

/** Photo de l'éditeur à un instant : l'arbre et le nœud affiché. */
export type EditorSnapshot = {
  children: RepertoireNode[];
  cursorId: string;
};

export type EditorHistory = {
  past: EditorSnapshot[];
  future: EditorSnapshot[];
};

/** Nombre maximal de modifications annulables. */
export const HISTORY_LIMIT = 100;

export const EMPTY_HISTORY: EditorHistory = Object.freeze({ past: [], future: [] });

/**
 * Enregistre l'état d'avant une modification. Une nouvelle modification efface les
 * « rétablir » en attente. Les arbres sont immuables et partagent leurs branches
 * inchangées : conserver 100 photos coûte très peu de mémoire.
 */
export function recordEdit(history: EditorHistory, before: EditorSnapshot): EditorHistory {
  return { past: [...history.past, before].slice(-HISTORY_LIMIT), future: [] };
}

export function canUndo(history: EditorHistory): boolean {
  return history.past.length > 0;
}

export function canRedo(history: EditorHistory): boolean {
  return history.future.length > 0;
}

/** Revient à l'état précédent ; `current` est mis de côté pour pouvoir le rétablir. */
export function undo(
  history: EditorHistory,
  current: EditorSnapshot,
): { history: EditorHistory; snapshot: EditorSnapshot } | null {
  const snapshot = history.past[history.past.length - 1];
  if (!snapshot) return null;
  return {
    snapshot,
    history: { past: history.past.slice(0, -1), future: [current, ...history.future] },
  };
}

export function redo(
  history: EditorHistory,
  current: EditorSnapshot,
): { history: EditorHistory; snapshot: EditorSnapshot } | null {
  const snapshot = history.future[0];
  if (!snapshot) return null;
  return {
    snapshot,
    history: { past: [...history.past, current], future: history.future.slice(1) },
  };
}
