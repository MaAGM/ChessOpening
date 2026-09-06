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

// Alekhine – B02: 1. e4 Nf6 2. e5 Nd5 3. d4 d6
const alekhineB02Root: TutorialNode = buildTutorialNode(
  ["e4", "Nf6", "e5", "Nd5", "d4", "d6"],
  [
    "e4 occupe le centre et ouvre la diagonale du fou.",
    "...Nf6 développe le cavalier, attaque e4 et prépare un contre‑jeu hypermoderne.",
    "e5 avance le pion, attaque le cavalier noir et prend de l'espace au centre.",
    "...Nd5 recule le cavalier tout en conservant la pression sur e3 et c3.",
    "d4 renforce le centre blanc et ouvre la voie au fou.",
    "...d6 consolide le centre noir et prépare le développement du fou.",
  ],
  [
    [["e2","e4"]],
    [["g8","f6"]],
    [["e4","e5"]],
    [["f6","d5"]],
    [["d2","d4"]],
    [["d7","d6"]]
  ]
);

export const alekhineCourse: OpeningCourse = {
  id: "alekhine",
  name: "Alekhine",
  description: "Formation complète sur Alekhine",
  chapters: [
    {
      id: "alekhine-b02",
      name: "Défense Alekhine",
      root: alekhineB02Root,
    },
  ],
};

