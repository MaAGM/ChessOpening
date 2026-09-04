export * from "./types";

import { frenchCourse } from "./french";

export const openingCourses = [frenchCourse];

// --- Helpers (same logic we already have) ---------------------------------
import { Chess } from "chess.js";
import type { TutorialNode, OpeningCourse, OpeningChapter } from "./types";

/** Recursively walks the tree following `moveSequence` and returns the node reached. */
export function findNodeByMoveSequence(
  rootNode: TutorialNode,
  moveSequence: string[],
): TutorialNode | null {
  if (moveSequence.length === 0) return rootNode;
  const [nextMove, ...rest] = moveSequence;
  const nextNode = rootNode.children?.[nextMove];
  return nextNode ? findNodeByMoveSequence(nextNode, rest) : null;
}

/** Computes the FEN for a given path by replaying the SAN moves. */
export function computeFenForPath(path: string[]): string {
  const game = new Chess();
  for (const san of path) {
    const mv = game.move(san);
    if (!mv) throw new Error(`Illegal move "${san}" while replaying tutorial path.`);
  }
  return game.fen();
}

/** Walks the path and returns every intermediate node. */
export function walkPath(
  rootNode: TutorialNode,
  moveSequence: string[],
): { node: TutorialNode; path: string[] }[] {
  const results: { node: TutorialNode; path: string[] }[] = [
    { node: rootNode, path: [] },
  ];
  let cur = rootNode;
  const p: string[] = [];
  for (const san of moveSequence) {
    const nxt = cur.children?.[san];
    if (!nxt) break;
    p.push(san);
    results.push({ node: nxt, path: [...p] });
    cur = nxt;
  }
  return results;
}

/** Flatten all chapters from every course. */
export function getAllChapters(): OpeningChapter[] {
  return openingCourses.flatMap((c) => c.chapters);
}

