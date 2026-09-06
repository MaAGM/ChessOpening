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

// Kings Gambit – C33: 1. e4 e5 2. f4 exf4 3. Nf3 g5
const kingsGambitRoot: TutorialNode = buildTutorialNode(
  ["e4", "e5", "f4", "exf4", "Nf3", "g5"],
  [
    "e4 occupe le case centrales et ouvre la diagonale du fou.",
    "...e5 répond symétriquement, contrôlant le centre.",
    "f4 offre le gambit du roi, sacrifie un pion pour l'initiative.",
    "...exf4 accepte le pion, mais ouvre la diagonale a7‑g1 du fou noir.",
    "Nf3 développe le cavalier, prépare le roque et attaque le pion f4.",
    "...g5 attaque le cavalier et crée des menaces sur le roi blanc."
  ],
  [
    [["e2","e4"]],
    [["e7","e5"]],
    [["f2","f4"]],
    [["e5","f4"]],
    [["g1","f3"]],
    [["g7","g5"]]
  ]
);

export const kings_gambitCourse: OpeningCourse = {
  id: "kings_gambit",
  name: "Kings Gambit",
  description: "Formation complète sur Kings Gambit",
  chapters: [
    {
      id: "kings_gambit-c33",
      name: "Gambit Roi Accepté",
      root: kingsGambitRoot,
    },
  ],
};

