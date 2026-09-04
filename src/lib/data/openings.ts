import { Chess } from "chess.js";

export type TutorialArrow = [startSquare: string, endSquare: string];

export interface TutorialNode {
  /** SAN move that led to this node. Omitted only for the root node. */
  move?: string;
  explanation?: string;
  arrows?: TutorialArrow[];
  /** Branching children, keyed by the SAN move that leads to each. */
  children?: Record<string, TutorialNode>;
}

export interface OpeningTutorial {
  id: string;
  name: string;
  /** The root of the variation tree. Its own `move` is undefined. */
  root: TutorialNode;
}

/**
 * Recursively walks the tree following `moveSequence` (an array of SAN
 * moves) and returns the node reached, or null if the sequence departs
 * from every known branch at some point.
 *
 * Pure and side-effect free: does not touch chess.js, does not validate
 * legality — it only follows the shape of the tree.
 */
export function findNodeByMoveSequence(
  rootNode: TutorialNode,
  moveSequence: string[],
): TutorialNode | null {
  if (moveSequence.length === 0) {
    return rootNode;
  }

  const [nextMove, ...rest] = moveSequence;
  const nextNode = rootNode.children?.[nextMove];
  if (!nextNode) {
    return null;
  }

  return findNodeByMoveSequence(nextNode, rest);
}

/**
 * Computes the FEN for a given node by replaying the path from the root
 * down to that node through chess.js. Since nodes don't store FEN, this
 * is the canonical way to get a position for rendering.
 *
 * `path` is the sequence of SAN moves from the root to `targetNode`
 * (exclusive of any move at the root itself, since the root has none).
 */
export function computeFenForPath(path: string[]): string {
  const game = new Chess();
  for (const san of path) {
    const move = game.move(san);
    if (!move) {
      throw new Error(`Illegal or unknown move "${san}" while replaying tutorial path.`);
    }
  }
  return game.fen();
}

/**
 * Convenience walk that returns every node along a path together with the
 * SAN move that reaches it, useful for building a FEN at each step (e.g.
 * to animate a variation) without re-deriving the path from scratch per
 * node.
 */
export function walkPath(
  rootNode: TutorialNode,
  moveSequence: string[],
): { node: TutorialNode; path: string[] }[] {
  const results: { node: TutorialNode; path: string[] }[] = [
    { node: rootNode, path: [] },
  ];

  let current = rootNode;
  const path: string[] = [];

  for (const san of moveSequence) {
    const next = current.children?.[san];
    if (!next) break;
    path.push(san);
    results.push({ node: next, path: [...path] });
    current = next;
  }

  return results;
}

export const openingTutorials: OpeningTutorial[] = [
  {
    id: "french-defense",
    name: "French Defense",
    root: {
      // Root: board before any moves. No `move`, no explanation needed.
      children: {
        e4: {
          move: "e4",
          explanation:
            "White stakes a claim in the center with the King's Pawn, inviting Black to respond symmetrically or counter with a different structure.",
          children: {
            e6: {
              move: "e6",
              explanation:
                "Black plays e6 to prepare ...d5, contesting the center with d5 next while keeping the pawn chain solid.",
              arrows: [["d7", "d5"]],
              children: {
                d4: {
                  move: "d4",
                  explanation:
                    "White reinforces the center, transposing into the main line of the French Defense.",
                  children: {
                    d5: {
                      move: "d5",
                      explanation:
                        "Black strikes back in the center immediately, creating the characteristic closed French pawn chain and forcing White to decide how to handle the tension on e4.",
                      children: {
                        // --- Branch point: White chooses a third move ---
                        e5: {
                          move: "e5",
                          explanation:
                            "The Advance Variation. White grabs space and closes the center, planning to attack Black's kingside while Black counters the base of the pawn chain with ...c5.",
                          arrows: [["e4", "e5"]],
                          children: {
                            c5: {
                              move: "c5",
                              explanation:
                                "Black immediately strikes at White's pawn chain from d4, the standard freeing break in the Advance Variation.",
                              arrows: [["c7", "c5"]],
                            },
                          },
                        },
                        Nc3: {
                          move: "Nc3",
                          explanation:
                            "The Classical Variation. White develops naturally and keeps the tension on e4, inviting ...Nf6 or ...Bb4 (Winawer) from Black.",
                          arrows: [["b1", "c3"]],
                          children: {
                            Nf6: {
                              move: "Nf6",
                              explanation:
                                "The Classical (Steinitz-style) main line: Black develops the knight and pressures e4 directly.",
                              arrows: [["g8", "f6"]],
                            },
                            Bb4: {
                              move: "Bb4",
                              explanation:
                                "The Winawer Variation: Black pins the knight immediately, aiming for sharp, unbalanced positions.",
                              arrows: [["f8", "b4"]],
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
];

export const openingTutorialById: Record<string, OpeningTutorial> =
  openingTutorials.reduce(
    (acc, tutorial) => {
      acc[tutorial.id] = tutorial;
      return acc;
    },
    {} as Record<string, OpeningTutorial>,
  );