import { Chess } from "chess.js";
import type { Arrow, TutorialNode } from "@/lib/data/openings/types";
import { toPositionKey, type PositionKey } from "./positionKey";
import type { Side } from "./types";

/**
 * Graphe de positions du répertoire : chaque position connue est un nœud (clé
 * dérivée de la FEN), chaque coup d'un chapitre est une arête position → position.
 * Quand deux chapitres arrivent à la même position par des ordres de coups
 * différents (transposition), ils partagent le même nœud.
 *
 * RÈGLE : le graphe est immuable une fois construit.
 */
export type GraphNode = {
  key: PositionKey;
  /** Camp au trait dans cette position. */
  turn: Side;
  /** Coup (SAN canonique) -> clé de la position d'arrivée. */
  edges: Record<string, PositionKey>;
  /** Chapitres dont une ligne passe par cette position. */
  chapterIds: string[];
};

export type ReviewGraph = {
  startKey: PositionKey;
  nodes: Map<PositionKey, GraphNode>;
};

// ---------------------------------------------------------------------------
// Construction
// ---------------------------------------------------------------------------

/** Construit le graphe à partir des arbres de coups des chapitres. */
export function buildReviewGraph(chapters: { id: string; root: TutorialNode }[]): ReviewGraph {
  const nodes = new Map<PositionKey, GraphNode>();
  const start = new Chess();
  const startKey = toPositionKey(start.fen());

  const ensureNode = (game: Chess, chapterId: string): GraphNode => {
    const key = toPositionKey(game.fen());
    let node = nodes.get(key);
    if (!node) {
      node = { key, turn: game.turn() === "w" ? "white" : "black", edges: {}, chapterIds: [] };
      nodes.set(key, node);
    }
    if (!node.chapterIds.includes(chapterId)) node.chapterIds.push(chapterId);
    return node;
  };

  const walk = (treeNode: TutorialNode, game: Chess, chapterId: string): void => {
    const from = ensureNode(game, chapterId);

    for (const [san, child] of Object.entries(treeNode.children ?? {})) {
      const next = new Chess(game.fen());
      let canonicalSan: string;
      try {
        canonicalSan = next.move(san).san;
      } catch {
        console.warn(`[reviewGraph] Coup invalide ignoré : "${san}" (chapitre ${chapterId})`);
        continue;
      }

      const to = ensureNode(next, chapterId);
      from.edges[canonicalSan] = to.key;
      walk(child, next, chapterId);
    }
  };

  for (const chapter of chapters) walk(chapter.root, start, chapter.id);

  return { startKey, nodes };
}

// ---------------------------------------------------------------------------
// Lecture
// ---------------------------------------------------------------------------

/** Nœud correspondant à une position (FEN), ou null si elle est hors répertoire. */
export function getNode(graph: ReviewGraph, fen: string): GraphNode | null {
  return graph.nodes.get(toPositionKey(fen)) ?? null;
}

export function isLeafNode(node: GraphNode): boolean {
  return Object.keys(node.edges).length === 0;
}

/** Les coups (SAN) attendus depuis cette position. */
export function getExpectedMoves(node: GraphNode): string[] {
  return Object.keys(node.edges);
}

// ---------------------------------------------------------------------------
// Aides au gameplay
// ---------------------------------------------------------------------------

/** Convertit un coup SAN en cases from/to pour une position donnée (FEN). */
export function sanToSquares(fen: string, san: string): { from: string; to: string } | null {
  try {
    const move = new Chess(fen).move(san);
    return move ? { from: move.from, to: move.to } : null;
  } catch {
    return null;
  }
}

/** Flèches [from, to] vers chaque coup attendu (indice après une erreur). */
export function getHintArrows(fen: string, node: GraphNode): Arrow[] {
  const arrows: Arrow[] = [];
  for (const san of getExpectedMoves(node)) {
    const squares = sanToSquares(fen, san);
    if (squares) arrows.push([squares.from, squares.to]);
  }
  return arrows;
}

export type MoveEvaluation =
  | { kind: "illegal" }
  /** Coup prévu par le répertoire depuis cette position. */
  | { kind: "book"; san: string; nextKey: PositionKey }
  /** Coup hors des arêtes, mais qui mène à une position connue du répertoire. */
  | { kind: "transposition"; san: string; nextKey: PositionKey }
  | { kind: "mistake"; san: string };

/**
 * Évalue un coup du joueur : illégal, dans le répertoire, transposition vers une
 * position connue, ou erreur. La position de départ est donnée par sa FEN.
 */
export function evaluatePlayerMove(
  graph: ReviewGraph,
  fen: string,
  from: string,
  to: string,
): MoveEvaluation {
  const game = new Chess(fen);
  let san: string;
  try {
    san = game.move({ from, to, promotion: "q" }).san;
  } catch {
    return { kind: "illegal" };
  }

  const node = graph.nodes.get(toPositionKey(fen));
  const bookKey = node ? node.edges[san] : undefined;
  if (bookKey !== undefined) return { kind: "book", san, nextKey: bookKey };

  const nextKey = toPositionKey(game.fen());
  if (graph.nodes.has(nextKey)) return { kind: "transposition", san, nextKey };

  return { kind: "mistake", san };
}