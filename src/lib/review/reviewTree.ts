import { Chess } from "chess.js";
import type { Arrow, TutorialNode } from "@/lib/data/openings/types";

/**
 * Nœud de l'arbre de révision (fusion de plusieurs chapitres).
 *
 * On ne garde volontairement que la structure : les explications et les flèches
 * du tutoriel n'ont pas de sens une fois les chapitres fusionnés (le texte de
 * fin de variante d'un chapitre apparaîtrait au milieu d'un autre).
 *
 * RÈGLE : un ReviewNode est immuable. Les fonctions de ce fichier ne mutent
 * jamais leurs entrées ; le résultat de mergeTrees peut partager des sous-arbres
 * avec ses entrées.
 */
export type ReviewNode = {
  /** Coup (SAN) qui mène à ce nœud ; absent sur la racine. */
  move?: string;
  /** Chapitres dont une ligne passe par ce nœud (utile pour l'affichage et les stats). */
  chapterIds: string[];
  children: Record<string, ReviewNode>;
};

// ---------------------------------------------------------------------------
// Construction & fusion
// ---------------------------------------------------------------------------

export function createEmptyReviewRoot(): ReviewNode {
  return { chapterIds: [], children: {} };
}

/** Convertit l'arbre d'un chapitre (TutorialNode) en ReviewNode. */
export function toReviewNode(node: TutorialNode, chapterId: string, move?: string): ReviewNode {
  const children: Record<string, ReviewNode> = {};
  for (const [san, child] of Object.entries(node.children ?? {})) {
    children[san] = toReviewNode(child, chapterId, san);
  }
  return {
    ...(move !== undefined ? { move } : {}),
    chapterIds: [chapterId],
    children,
  };
}

function hasOwn(obj: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

/** Union récursive de deux arbres (fonction pure). */
export function mergeTrees(a: ReviewNode, b: ReviewNode): ReviewNode {
  const children: Record<string, ReviewNode> = { ...a.children };

  for (const [san, bChild] of Object.entries(b.children)) {
    children[san] = hasOwn(children, san) ? mergeTrees(children[san], bChild) : bChild;
  }

  const move = a.move ?? b.move;
  return {
    ...(move !== undefined ? { move } : {}),
    chapterIds: Array.from(new Set([...a.chapterIds, ...b.chapterIds])),
    children,
  };
}

/** Fusionne une liste de chapitres en un seul arbre. */
export function buildReviewTree(chapters: { id: string; root: TutorialNode }[]): ReviewNode {
  return chapters
    .map((chapter) => toReviewNode(chapter.root, chapter.id))
    .reduce(mergeTrees, createEmptyReviewRoot());
}

// ---------------------------------------------------------------------------
// Navigation & aides au gameplay
// ---------------------------------------------------------------------------

export function isLeaf(node: ReviewNode): boolean {
  return Object.keys(node.children).length === 0;
}

/** Les coups (SAN) attendus depuis ce nœud. */
export function getExpectedMoves(node: ReviewNode): string[] {
  return Object.keys(node.children);
}

/** Suit un chemin de coups SAN depuis la racine ; null si le chemin n'existe pas. */
export function getNodeAtPath(root: ReviewNode, path: string[]): ReviewNode | null {
  let current = root;
  for (const san of path) {
    if (!hasOwn(current.children, san)) return null;
    current = current.children[san];
  }
  return current;
}

/**
 * Choisit un enfant au hasard (réponse de l'ordinateur).
 * `rng` est injectable pour rendre les tests déterministes.
 */
export function pickRandomChild(
  node: ReviewNode,
  rng: () => number = Math.random,
): { san: string; node: ReviewNode } | null {
  const moves = getExpectedMoves(node);
  if (moves.length === 0) return null;
  const index = Math.min(moves.length - 1, Math.floor(rng() * moves.length));
  const san = moves[index];
  return { san, node: node.children[san] };
}

/** Convertit un coup SAN en cases from/to pour une position donnée (FEN). */
export function sanToSquares(fen: string, san: string): { from: string; to: string } | null {
  try {
    const move = new Chess(fen).move(san);
    return move ? { from: move.from, to: move.to } : null;
  } catch {
    return null;
  }
}

/** Flèches [from, to] vers chaque coup attendu depuis ce nœud (indice après une erreur). */
export function getHintArrows(fen: string, node: ReviewNode): Arrow[] {
  const arrows: Arrow[] = [];
  for (const san of getExpectedMoves(node)) {
    const squares = sanToSquares(fen, san);
    if (squares) arrows.push([squares.from, squares.to]);
  }
  return arrows;
}