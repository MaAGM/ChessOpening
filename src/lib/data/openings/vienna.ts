import type { OpeningCourse, OpeningChapter, TutorialNode, TutorialArrow } from "./types";

/** Helper to build a linear tutorial tree */
function buildTutorialNode(
  moves: string[],
  explanations: string[],
  arrows: TutorialArrow[][]
): TutorialNode {
  if (moves.length === 0) return {};
  const [move, ...restMoves] = moves;
  const [exp, ...restExps] = explanations;
  const [arrowSet, ...restArrows] = arrows;
  const node: TutorialNode = {
    move,
    explanation: exp,
    arrows: arrowSet,
    children: restMoves.length > 0 ? { [restMoves[0]]: buildTutorialNode(restMoves, restExps, restArrows) } : undefined,
  };
  return node;
}

// Vienna – C25: 1. e4 e5 2. Nc3 Nf6 3. Bc4 Bc5
const viennaRoot: TutorialNode = buildTutorialNode(
  ["e4", "e5", "Nc3", "Nf6", "Bc4", "Bc5"],
  [
    "e4 occupe le centre et ouvre la diagonale du fou blanc.",
    "...e5 répond symétriquement, contestation immédiate du centre.",
    "Nc3 développe le cavalier, soutient le centre et prépare le fou en c4.",
    "...Nf6 développe le cavalier, attaque le pion e4 et prépare le roque.",
    "Bc4 place le fou sur la puissante diagonale a2‑g8, visant f7.",
    "...Bc5 place le fou noir en symétrie, appuie le pion e5 et contrôle la case f2.",
  ],
  [
    [["e2","e4"]],
    [["e7","e5"]],
    [["b1","c3"]],
    [["g8","f6"]],
    [["f1","c4"]],
    [["f8","c5"]],
  ]
);

export const viennaCourse: OpeningCourse = {
  id: "vienna",
  name: "Vienna",
  description: "Formation complète sur Vienna",
  chapters: [
    {
      id: "vienna-c25",
      name: "Partie Viennoise",
      root: viennaRoot,
    },
  ],
};

