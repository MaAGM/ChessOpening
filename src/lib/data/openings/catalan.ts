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

// Catalan – Ouverte (E04)
const catalanRoot: TutorialNode = buildTutorialNode(
  ["d4", "Nf6", "c4", "e6", "g3", "d5", "Bg2", "dxc4", "Nf3", "a6", "O-O"],
  [
    "d4 occupe le centre et prépare le fou.",
    "...Nf6 développe le cavalier, prépare la pression sur e4.",
    "c4 renforce le contrôle du centre et prépare le fianchetto.",
    "...e6 prépare le développement du fou c8 et soutient le centre.",
    "g3 prépare le fianchetto du fou blanc sur la grande diagonale.",
    "...d5 conteste le centre blanc, ouvre la voie au fou noir.",
    "Bg2 fianchette le fou, contrôle la diagonale a8–h1.",
    "...dxc4 accepte le gambit, capture le pion c4.",
    "Nf3 développe le cavalier, prépare le roque.",
    "...a6 empêche le fou blanc de s'enfuir en b5.",
    "O-O sécurise le roi et connecte les tours.",
  ],
  [
    [["d2","d4"]],
    [["g8","f6"]],
    [["c2","c4"]],
    [["e7","e6"]],
    [["g2","g3"]],
    [["d7","d5"]],
    [["f1","g2"]],
    [["d5","c4"]],
    [["g1","f3"]],
    [["a7","a6"]],
    [["e1","g1"]],
  ]
);

export const catalanCourse: OpeningCourse = {
  id: "catalan",
  name: "Catalan",
  description: "Formation complète sur Catalan",
  chapters: [
    {
      id: "catalan-e04",
      name: "Catalane - Ouverte",
      root: catalanRoot,
    },
  ],
};

