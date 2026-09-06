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

// Pirc – B07: 1. e4 d6 2. d4 Nf6 3. Nc3 g6
const pircB07Root: TutorialNode = buildTutorialNode(
  ["e4", "d6", "d4", "Nf6", "Nc3", "g6"],
  [
    "e4 occupe le centre et ouvre la diagonale du fou.",
    "...d6 prépare la structure solide et garde l'option de ...c5.",
    "d4 renforce le centre et ouvre la voie au fou.",
    "...Nf6 développe le cavalier, contrôle e4 et prépare la pression sur d4.",
    "Nc3 développe le cavalier, soutient le centre et prépare le fianchetto.",
    "...g6 prépare le fianchetto du fou noir, contrôlant les cases sombres.",
  ],
  [
    [["e2","e4"]],
    [["d7","d6"]],
    [["d2","d4"]],
    [["g8","f6"]],
    [["b1","c3"]],
    [["g7","g6"]],
  ]
);

export const pircCourse: OpeningCourse = {
  id: "pirc",
  name: "Pirc",
  description: "Formation complète sur Pirc",
  chapters: [
    {
      id: "pirc-b07",
      name: "Défense Pirc",
      root: pircB07Root,
    },
  ],
};

