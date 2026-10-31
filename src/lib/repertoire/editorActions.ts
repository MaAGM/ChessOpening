import {
  addMove,
  deleteBranch,
  getAdjacentVariationId,
  getLineEndId,
  getMainChildId,
  getNode,
  getParentId,
  makeMainLine,
  promoteVariation,
  type AddMoveOptions,
} from "./repertoireTree";
import { ROOT_ID, type RepertoireNode, type TreeRoot } from "./types";

/** État de l'éditeur : l'arbre et le nœud affiché (ROOT_ID = position initiale). */
export type EditorState = {
  children: RepertoireNode[];
  cursorId: string;
};

export type NavigationAction =
  | "back"
  | "forward"
  | "previousVariation"
  | "nextVariation"
  | "start"
  | "end";

const asRoot = (state: EditorState): TreeRoot => ({ children: state.children });

/** Nœud vers lequel mène une action de navigation (le curseur ne bouge pas si c'est impossible). */
export function navigate(state: EditorState, action: NavigationAction): string {
  const root = asRoot(state);
  const { cursorId } = state;

  switch (action) {
    case "back":
      return getParentId(root, cursorId) ?? cursorId;
    case "forward":
      return getMainChildId(root, cursorId) ?? cursorId;
    case "previousVariation":
      return getAdjacentVariationId(root, cursorId, -1) ?? cursorId;
    case "nextVariation":
      return getAdjacentVariationId(root, cursorId, 1) ?? cursorId;
    case "start":
      return ROOT_ID;
    case "end":
      return getLineEndId(root, cursorId);
  }
}

export type PlayMoveResult =
  | { ok: true; state: EditorState; created: boolean }
  | { ok: false; error: "empty-move" | "limit-reached" | "parent-not-found" };

/**
 * Joue un coup depuis le nœud affiché : se place sur le coup s'il existe déjà, sinon crée
 * la branche (variante si le nœud avait déjà des suites, suite principale sinon).
 */
export function playMove(
  state: EditorState,
  san: string,
  options?: AddMoveOptions,
): PlayMoveResult {
  const result = addMove(asRoot(state), state.cursorId, san, options);
  if (!result.ok) return result;
  return {
    ok: true,
    created: result.created,
    state: { children: result.root.children, cursorId: result.nodeId },
  };
}

/** Taille de la branche du nœud affiché (lui compris) ; 0 à la racine. */
export function branchSize(state: EditorState): number {
  const node = getNode(asRoot(state), state.cursorId);
  if (!node) return 0;
  const count = (n: RepertoireNode): number => n.children.reduce((sum, c) => sum + count(c), 1);
  return count(node);
}

/** Supprime la branche du nœud affiché ; le curseur remonte au parent. Null à la racine. */
export function deleteCurrent(state: EditorState): EditorState | null {
  const result = deleteBranch(asRoot(state), state.cursorId);
  if (!result) return null;
  return { children: result.root.children, cursorId: result.parentId };
}

/** Peut-on remonter la variante affichée d'un rang ? */
export function canPromote(state: EditorState): boolean {
  return getAdjacentVariationId(asRoot(state), state.cursorId, -1) !== null;
}

export function promoteCurrent(state: EditorState): EditorState {
  const root = promoteVariation(asRoot(state), state.cursorId);
  return root.children === state.children ? state : { ...state, children: root.children };
}

/** La ligne menant au nœud affiché n'est-elle pas déjà la ligne principale ? */
export function canMakeMainLine(state: EditorState): boolean {
  if (state.cursorId === ROOT_ID) return false;
  return makeMainLine(asRoot(state), state.cursorId).children !== state.children;
}

export function makeMainLineCurrent(state: EditorState): EditorState {
  const root = makeMainLine(asRoot(state), state.cursorId);
  return root.children === state.children ? state : { ...state, children: root.children };
}
