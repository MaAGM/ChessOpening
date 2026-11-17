import { Chess } from "chess.js";
import { toPositionKey } from "@/lib/review/positionKey";
import { REPERTOIRE_LIMITS } from "./limits";
import { ROOT_ID, type RepertoireNode, type TreeRoot } from "./types";

/** Position initiale (FEN de la racine). */
export const INITIAL_FEN = new Chess().fen();

// ===========================================================================
// Identifiants
// ===========================================================================
const ID_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";

/** Identifiant court (8 caractères), unique parmi `taken`. */
export function createNodeId(taken?: ReadonlySet<string>): string {
  for (;;) {
    let id = "";
    for (let i = 0; i < 8; i++) id += ID_ALPHABET[Math.floor(Math.random() * ID_ALPHABET.length)];
    if (id !== ROOT_ID && (!taken || !taken.has(id))) return id;
  }
}

// ===========================================================================
// Lecture
// ===========================================================================
type Located = {
  node: RepertoireNode;
  /** Tableau de frères qui contient le nœud (lui compris). */
  siblings: RepertoireNode[];
  index: number;
  /** Ancêtres, du premier coup au parent direct (la racine n'y figure pas). */
  ancestors: RepertoireNode[];
};

function locate(
  children: RepertoireNode[],
  id: string,
  ancestors: RepertoireNode[] = [],
): Located | null {
  for (let index = 0; index < children.length; index++) {
    const node = children[index];
    if (node.id === id) return { node, siblings: children, index, ancestors };
    const found = locate(node.children, id, [...ancestors, node]);
    if (found) return found;
  }
  return null;
}

export function getNode(root: TreeRoot, id: string): RepertoireNode | null {
  return locate(root.children, id)?.node ?? null;
}

/** Suites d'un nœud (ou premiers coups pour la racine) ; null si le nœud n'existe pas. */
export function getChildren(root: TreeRoot, id: string): RepertoireNode[] | null {
  if (id === ROOT_ID) return root.children;
  return locate(root.children, id)?.node.children ?? null;
}

export function collectIds(root: TreeRoot): Set<string> {
  const ids = new Set<string>();
  const visit = (nodes: RepertoireNode[]) => {
    for (const node of nodes) {
      ids.add(node.id);
      visit(node.children);
    }
  };
  visit(root.children);
  return ids;
}

export function countNodes(root: TreeRoot): number {
  const count = (nodes: RepertoireNode[]): number =>
    nodes.reduce((total, node) => total + 1 + count(node.children), 0);
  return count(root.children);
}

/** Longueur de la plus longue ligne (en demi-coups). */
export function maxDepth(root: TreeRoot): number {
  const depth = (nodes: RepertoireNode[]): number =>
    nodes.reduce((best, node) => Math.max(best, 1 + depth(node.children)), 0);
  return depth(root.children);
}

// ===========================================================================
// Navigation
// ===========================================================================
/** Ids du premier coup jusqu'au nœud (vide pour la racine ou un id inconnu). */
export function getPathIds(root: TreeRoot, id: string): string[] {
  const found = locate(root.children, id);
  return found ? [...found.ancestors.map((n) => n.id), id] : [];
}

/** Coups (SAN) du premier coup jusqu'au nœud. */
export function getPathSans(root: TreeRoot, id: string): string[] {
  const found = locate(root.children, id);
  return found ? [...found.ancestors.map((n) => n.san), found.node.san] : [];
}

/** Parent d'un nœud (ROOT_ID pour un premier coup) ; null pour la racine ou un id inconnu. */
export function getParentId(root: TreeRoot, id: string): string | null {
  const found = locate(root.children, id);
  if (!found) return null;
  return found.ancestors.length > 0 ? found.ancestors[found.ancestors.length - 1].id : ROOT_ID;
}

/** Suite principale d'un nœud (ou premier coup principal pour la racine). */
export function getMainChildId(root: TreeRoot, id: string): string | null {
  return getChildren(root, id)?.[0]?.id ?? null;
}

/** Variante voisine (delta -1 : précédente, +1 : suivante) ; null aux extrémités. */
export function getAdjacentVariationId(root: TreeRoot, id: string, delta: -1 | 1): string | null {
  const found = locate(root.children, id);
  if (!found) return null;
  return found.siblings[found.index + delta]?.id ?? null;
}

/** Fin de la ligne principale à partir d'un nœud. */
export function getLineEndId(root: TreeRoot, fromId: string = ROOT_ID): string {
  let current = fromId;
  for (;;) {
    const next = getMainChildId(root, current);
    if (next === null) return current;
    current = next;
  }
}

// ===========================================================================
// Positions (FEN)
// ===========================================================================
/**
 * FEN de chaque nœud (clé : id, ROOT_ID inclus). Un nœud dont le coup est illégal
 * (données corrompues) est absent de la table, ainsi que toute sa descendance.
 */
export function computeFens(root: TreeRoot): Map<string, string> {
  const fens = new Map<string, string>([[ROOT_ID, INITIAL_FEN]]);

  const visit = (nodes: RepertoireNode[], fen: string) => {
    for (const node of nodes) {
      const game = new Chess(fen);
      try {
        game.move(node.san);
      } catch {
        continue;
      }
      const next = game.fen();
      fens.set(node.id, next);
      visit(node.children, next);
    }
  };

  visit(root.children, INITIAL_FEN);
  return fens;
}

/**
 * Comme `computeFens`, mais réutilise les positions déjà connues (`previous`) : seules
 * les positions des nouveaux nœuds sont calculées. C'est valide car l'identifiant d'un
 * nœud est lié à vie à son chemin de coups (aucune opération ne modifie le `san` d'un
 * nœud ni ses ancêtres : suppression, promotion et annotation ne changent pas les chemins).
 */
export function computeFensIncremental(
  root: TreeRoot,
  previous?: ReadonlyMap<string, string>,
): Map<string, string> {
  const fens = new Map<string, string>([[ROOT_ID, INITIAL_FEN]]);

  const visit = (nodes: RepertoireNode[], parentFen: string) => {
    for (const node of nodes) {
      let fen = previous?.get(node.id);
      if (fen === undefined) {
        const game = new Chess(parentFen);
        try {
          game.move(node.san);
        } catch {
          continue;
        }
        fen = game.fen();
      }
      fens.set(node.id, fen);
      visit(node.children, fen);
    }
  };

  visit(root.children, INITIAL_FEN);
  return fens;
}

/**
 * Transpositions : nœuds qui aboutissent à la même position qu'un autre nœud du même arbre
 * (par un autre ordre de coups). Clé : id du nœud ; valeur : ids des autres nœuds de cette
 * position. Seuls les nœuds concernés figurent dans la table. `fens` vient de `computeFens`.
 */
export function findTranspositions(fens: ReadonlyMap<string, string>): Map<string, string[]> {
  const groups = new Map<string, string[]>();
  for (const [id, fen] of fens) {
    if (id === ROOT_ID) continue;
    const key = toPositionKey(fen);
    const group = groups.get(key);
    if (group) group.push(id);
    else groups.set(key, [id]);
  }

  const transpositions = new Map<string, string[]>();
  for (const ids of groups.values()) {
    if (ids.length < 2) continue;
    for (const id of ids) transpositions.set(id, ids.filter((other) => other !== id));
  }
  return transpositions;
}

/** Ids des nœuds dont le coup est illégal dans leur position. */
export function findInvalidNodeIds(root: TreeRoot): string[] {
  const fens = computeFens(root);
  const invalid: string[] = [];
  const visit = (nodes: RepertoireNode[]) => {
    for (const node of nodes) {
      if (!fens.has(node.id)) invalid.push(node.id);
      visit(node.children);
    }
  };
  visit(root.children);
  return invalid;
}

/** FEN d'un seul nœud, par rejeu de sa ligne ; null s'il n'existe pas ou si un coup est illégal. */
export function getFenAt(root: TreeRoot, id: string): string | null {
  if (id === ROOT_ID) return INITIAL_FEN;
  const sans = getPathSans(root, id);
  if (sans.length === 0) return null;

  const game = new Chess();
  try {
    for (const san of sans) game.move(san);
  } catch {
    return null;
  }
  return game.fen();
}

// ===========================================================================
// Modification (immuable)
// ===========================================================================

/**
 * Applique `apply` au tableau de frères contenant le nœud `id`, et reconstruit
 * les ancêtres. Renvoie null si le nœud n'existe pas.
 */
function updateAt(
  children: RepertoireNode[],
  id: string,
  apply: (siblings: RepertoireNode[], index: number) => RepertoireNode[],
): RepertoireNode[] | null {
  const index = children.findIndex((node) => node.id === id);
  if (index >= 0) return apply(children, index);

  for (let i = 0; i < children.length; i++) {
    const updated = updateAt(children[i].children, id, apply);
    if (updated !== null) {
      // Rien n'a changé plus bas : on ne reconstruit pas les ancêtres.
      if (updated === children[i].children) return children;
      const next = children.slice();
      next[i] = { ...children[i], children: updated };
      return next;
    }
  }
  return null;
}

/** Applique `apply` aux suites d'un nœud (ou aux premiers coups pour la racine). */
function updateChildrenOf(
  root: TreeRoot,
  parentId: string,
  apply: (children: RepertoireNode[]) => RepertoireNode[],
): RepertoireNode[] | null {
  if (parentId === ROOT_ID) return apply(root.children);
  return updateAt(root.children, parentId, (siblings, index) => {
    const next = siblings.slice();
    next[index] = { ...siblings[index], children: apply(siblings[index].children) };
    return next;
  });
}

export type AddMoveResult =
  | { ok: true; root: TreeRoot; nodeId: string; created: boolean }
  | { ok: false; error: "parent-not-found" | "empty-move" | "limit-reached" };

export type AddMoveOptions = {
  maxNodes?: number;
  /** Fabrique d'identifiants (remplaçable dans les tests). */
  idFactory?: (taken: ReadonlySet<string>) => string;
};

/**
 * Ajoute un coup sous un nœud. Si ce coup existe déjà à cet endroit, renvoie le nœud
 * existant sans rien modifier ; sinon crée une branche (variante si le nœud avait
 * déjà des suites, ligne principale sinon).
 * Le SAN doit être canonique : la légalité est vérifiée par l'appelant.
 */
export function addMove(
  root: TreeRoot,
  parentId: string,
  san: string,
  options: AddMoveOptions = {},
): AddMoveResult {
  if (san.trim() === "") return { ok: false, error: "empty-move" };

  const siblings = getChildren(root, parentId);
  if (siblings === null) return { ok: false, error: "parent-not-found" };

  const existing = siblings.find((node) => node.san === san);
  if (existing) return { ok: true, root, nodeId: existing.id, created: false };

  const maxNodes = options.maxNodes ?? REPERTOIRE_LIMITS.maxNodes;
  if (countNodes(root) >= maxNodes) return { ok: false, error: "limit-reached" };

  const taken = collectIds(root);
  const id = (options.idFactory ?? createNodeId)(taken);
  const node: RepertoireNode = { id, san, children: [] };

  const children = updateChildrenOf(root, parentId, (current) => [...current, node])!;
  return { ok: true, root: { ...root, children }, nodeId: id, created: true };
}

/**
 * Supprime une branche (le nœud et toute sa descendance).
 * Renvoie le nouvel arbre et l'id du parent (pour replacer le curseur) ; null si inconnu.
 */
export function deleteBranch(
  root: TreeRoot,
  id: string,
): { root: TreeRoot; parentId: string } | null {
  const parentId = getParentId(root, id);
  if (parentId === null) return null;

  const children = updateAt(root.children, id, (siblings, index) => [
    ...siblings.slice(0, index),
    ...siblings.slice(index + 1),
  ]);
  if (children === null) return null;
  return { root: { ...root, children }, parentId };
}

/** Déplace une variante d'un rang vers le haut / bas parmi ses frères (sans effet aux extrémités). */
function moveVariation(root: TreeRoot, id: string, delta: -1 | 1): TreeRoot {
  const children = updateAt(root.children, id, (siblings, index) => {
    const target = index + delta;
    if (target < 0 || target >= siblings.length) return siblings;
    const next = siblings.slice();
    [next[index], next[target]] = [next[target], next[index]];
    return next;
  });
  return children === null || children === root.children ? root : { ...root, children };
}

/** Remonte une variante d'un rang (la première est la ligne principale). */
export function promoteVariation(root: TreeRoot, id: string): TreeRoot {
  return moveVariation(root, id, -1);
}

export function demoteVariation(root: TreeRoot, id: string): TreeRoot {
  return moveVariation(root, id, 1);
}

/**
 * Fait de la ligne menant à ce nœud la ligne principale : à chaque fourche
 * rencontrée depuis le premier coup, la branche suivie passe en tête.
 */
export function makeMainLine(root: TreeRoot, id: string): TreeRoot {
  const pathIds = getPathIds(root, id);
  if (pathIds.length === 0) return root;

  const promote = (
    children: RepertoireNode[],
    depth: number,
  ): { children: RepertoireNode[]; changed: boolean } => {
    if (depth >= pathIds.length) return { children, changed: false };
    const index = children.findIndex((node) => node.id === pathIds[depth]);
    if (index < 0) return { children, changed: false };

    const inner = promote(children[index].children, depth + 1);
    if (index === 0 && !inner.changed) return { children, changed: false };

    const node = inner.changed ? { ...children[index], children: inner.children } : children[index];
    return { children: [node, ...children.slice(0, index), ...children.slice(index + 1)], changed: true };
  };

  const result = promote(root.children, 0);
  return result.changed ? { ...root, children: result.children } : root;
}

export type NodePatch = {
  /** `undefined` supprime l'annotation. */
  symbol?: RepertoireNode["symbol"];
  comment?: string;
  arrows?: RepertoireNode["arrows"];
};

/** Modifie les annotations d'un nœud. Un commentaire vide est supprimé. */
export function updateNode(root: TreeRoot, id: string, patch: NodePatch): TreeRoot {
  const children = updateAt(root.children, id, (siblings, index) => {
    const next = siblings.slice();
    const node: RepertoireNode = { ...siblings[index] };

    if ("symbol" in patch) {
      if (patch.symbol === undefined) delete node.symbol;
      else node.symbol = patch.symbol;
    }
    if ("comment" in patch) {
      const comment = patch.comment?.trim().slice(0, REPERTOIRE_LIMITS.maxCommentLength);
      if (!comment) delete node.comment;
      else node.comment = comment;
    }
    if ("arrows" in patch) {
      if (!patch.arrows || patch.arrows.length === 0) delete node.arrows;
      else node.arrows = patch.arrows;
    }

    if (sameAnnotations(siblings[index], node)) return siblings;
    next[index] = node;
    return next;
  });
  return children === null || children === root.children ? root : { ...root, children };
}

function sameAnnotations(a: RepertoireNode, b: RepertoireNode): boolean {
  return (
    a.symbol === b.symbol &&
    a.comment === b.comment &&
    JSON.stringify(a.arrows) === JSON.stringify(b.arrows)
  );
}

// ===========================================================================
// Fusion de deux arbres (import PGN, modèles)
// ===========================================================================
export type MergeResult = {
  root: TreeRoot;
  /** Nombre de nœuds ajoutés. */
  added: number;
  /** Vrai si la limite de coups a empêché d'ajouter tout le contenu. */
  truncated: boolean;
};

/**
 * Fusionne `incoming` dans `base` par chemin de coups. Les nœuds déjà présents gardent
 * leurs annotations (celles de `incoming` ne servent qu'à compléter les manques) ;
 * les nouvelles branches sont ajoutées à la suite, avec de nouveaux identifiants.
 */
export function mergeTrees(
  base: TreeRoot,
  incoming: TreeRoot,
  options: { maxNodes?: number; idFactory?: (taken: ReadonlySet<string>) => string } = {},
): MergeResult {
  const maxNodes = options.maxNodes ?? REPERTOIRE_LIMITS.maxNodes;
  const idFactory = options.idFactory ?? createNodeId;
  const taken = collectIds(base);
  let budget = maxNodes - countNodes(base);
  let added = 0;
  let truncated = false;

  const cloneWithBudget = (node: RepertoireNode): RepertoireNode | null => {
    if (budget <= 0) {
      truncated = true;
      return null;
    }
    budget -= 1;
    added += 1;
    const id = idFactory(taken);
    taken.add(id);

    const clone: RepertoireNode = { ...node, id, children: [] };
    for (const child of node.children) {
      const clonedChild = cloneWithBudget(child);
      if (clonedChild) clone.children.push(clonedChild);
    }
    return clone;
  };

  const mergeChildren = (a: RepertoireNode[], b: RepertoireNode[]): RepertoireNode[] => {
    const result = a.slice();
    for (const incomingNode of b) {
      const index = result.findIndex((node) => node.san === incomingNode.san);
      if (index >= 0) {
        const existing = result[index];
        const merged: RepertoireNode = {
          ...existing,
          children: mergeChildren(existing.children, incomingNode.children),
        };
        if (!existing.symbol && incomingNode.symbol) merged.symbol = incomingNode.symbol;
        if (!existing.comment && incomingNode.comment) merged.comment = incomingNode.comment;
        if (!existing.arrows && incomingNode.arrows) merged.arrows = incomingNode.arrows;
        result[index] = merged;
      } else {
        const clone = cloneWithBudget(incomingNode);
        if (clone) result.push(clone);
      }
    }
    return result;
  };

  const children = mergeChildren(base.children, incoming.children);
  return { root: { ...base, children }, added, truncated };
}