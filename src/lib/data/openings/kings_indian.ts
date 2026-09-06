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

// Kings Indian – Classique (E90)
const kingsIndianRoot: TutorialNode = buildTutorialNode(
  ["d4", "Nf6", "c4", "g6", "Nc3", "Bg7", "e4", "d6", "Nf3", "O-O", "Be2", "e5"],
  [
    "d4 occupe le centre et prépare le développement du fou.",
    "...Nf6 développe le cavalier, prépare la pression sur e4.",
    "c4 renforce le contrôle du centre, prépare le fianchetto noir.",
    "...g6 prépare le fianchetto du fou noir sur g7.",
    "Nc3 développe le cavalier, soutient le centre et prépare e4.",
    "...Bg7 fianchette le fou, contrôle la grande diagonale.",
    "e4 revendique le centre, crée un point d’appui pour les pièces.",
    "...d6 solidifie le centre noir et prépare le contre‑attaque.",
    "Nf3 développe le cavalier, prépare le roque.",
    "...O-O sécurise le roi noir et connecte les tours.",
    "Be2 prépare le roque blanc et conserve la flexibilité du fou.",
    "...e5 conteste le centre, ouvre la bataille.",
  ],
  [
    [["d2","d4"]],
    [["g8","f6"]],
    [["c2","c4"]],
    [["g7","g6"]],
    [["b1","c3"]],
    [["f8","g7"]],
    [["e2","e4"]],
    [["d7","d6"]],
    [["g1","f3"]],
    [["e8","g8"]],
    [["f1","e2"]],
    [["e7","e5"]],
  ]
);

export const kings_indianCourse: OpeningCourse = {
  id: "kings_indian",
  name: "Kings Indian",
  description: "Formation complète sur Kings Indian",
  chapters: [
    {
      id: "kings_indian-e90",
      name: "Est-Indienne - Classique",
      root: kingsIndianRoot,
    },
  ],
};

