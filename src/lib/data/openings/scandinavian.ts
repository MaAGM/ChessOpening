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

// Scandinavian – B01: 1. e4 d5 2. exd5 Qxd5 3. Nc3 Qa5
const scandinavianB01Root: TutorialNode = buildTutorialNode(
  ["e4", "d5", "exd5", "Qxd5", "Nc3", "Qa5"],
  [
    "e4 occupe le centre et ouvre les lignes pour le fou.",
    "...d5 conteste immédiatement le centre et ouvre la dame.",
    "exd5 capture le pion central, ouvrant la colonne e.",
    "Qxd5 développe la dame tôt, contrôlant le centre mais exposée.",
    "Nc3 développe le cavalier en attaquant la dame.",
    "Qa5 déplace la dame en dehors du centre, pointe sur le cavalier en c3 et le pion a2."
  ],
  [
    [["e2","e4"]],
    [["d7","d5"]],
    [["e4","d5"]],
    [["d8","d5"]],
    [["b1","c3"]],
    [["d5","a5"]]
  ]
);

export const scandinavianCourse: OpeningCourse = {
  id: "scandinavian",
  name: "Scandinavian",
  description: "Formation complète sur Scandinavian",
  chapters: [
    {
      id: "scandinavian-b01",
      name: "Défense Scandinave",
      root: scandinavianB01Root,
    },
  ],
};

