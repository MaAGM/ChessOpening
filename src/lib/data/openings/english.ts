import type { OpeningCourse, OpeningChapter, TutorialNode, TutorialArrow } from "./types";

/** Helper to build a linear tutorial tree from a move list */
function buildTutorialNode(
  moves: string[],
  explanations: string[],
  arrows: TutorialArrow[][]
): TutorialNode {
  if (moves.length === 0) {
    return {};
  }
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

// English – A20: 1. c4 e5 2. Nc3 Nf6 3. g3
const englishA20Root: TutorialNode = buildTutorialNode(
  ["c4", "e5", "Nc3", "Nf6", "g3"],
  [
    "Le premier coup, c4, prend le contrôle du centre et prépare le fianchetto du fou du fou.",
    "...e5 répond en occupant le centre et ouvre la diagonale pour le fou.",
    "Nc3 développe le cavalier en soutenant le pion c4 et prépare le fianchetto.",
    "...Nf6 développe le cavalier, contrôle e4 et prépare le roque.",
    "g3 prépare le fianchetto du fou blanc, renforçant le contrôle sur les cases centrales d5 et e4."
  ],
  [
    [["c2","c4"]],
    [["e7","e5"]],
    [["b1","c3"]],
    [["g8","f6"]],
    [["g2","g3"]]
  ]
);

// English – A30: 1. c4 c5 2. Nf3 Nf6 3. g3 g6
const englishA30Root: TutorialNode = buildTutorialNode(
  ["c4", "c5", "Nf3", "Nf6", "g3", "g6"],
  [
    "c4 lutte pour le centre et garde les options de fianchetto.",
    "...c5 réplique symétriquement, menant à des structures de type Symmetrical English.",
    "Nf3 développe le cavalier, soutient le contrôle du centre.",
    "...Nf6 développe le cavalier noir, préparant le fianchetto du fou.",
    "g3 prépare le fianchetto du fou blanc, un thème clé de l'English.",
    "...g6 prépare le fianchetto du fou noir, créant des tensions sur les cases centrales."
  ],
  [
    [["c2","c4"]],
    [["c7","c5"]],
    [["g1","f3"]],
    [["g8","f6"]],
    [["g2","g3"]],
    [["g7","g6"]]
  ]
);

export const englishCourse: OpeningCourse = {
  id: "english",
  name: "English",
  description: "Formation complète sur English",
  chapters: [
    {
      id: "english-a20",
      name: "Anglaise - Sicilienne Inversée",
      root: englishA20Root,
    },
    {
      id: "english-a30",
      name: "Anglaise - Symétrique",
      root: englishA30Root,
    },
  ],
};

