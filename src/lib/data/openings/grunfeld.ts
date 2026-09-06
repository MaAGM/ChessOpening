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

// Grunfeld – Défense Grünfeld (D80)
const grunfeldRoot: TutorialNode = buildTutorialNode(
  ["d4", "Nf6", "c4", "g6", "Nc3", "d5", "cxd5", "Nxd5", "e4", "Nxc3", "bxc3"],
  [
    "d4 occupe le centre et prépare le développement du fou.",
    "...Nf6 développe le cavalier, prépare la pression sur e4.",
    "c4 renforce le contrôle du centre et prépare la poussée d5.",
    "...g6 prépare le fianchetto du fou noir, contrôle la grande diagonale.",
    "Nc3 développe le cavalier, soutient d4 et prépare e4.",
    "...d5 défie le centre blanc, ouvrant la bataille.",
    "cxd5 accepte le pion, libère le centre blanc.",
    "...Nxd5 développe le cavalier, garde le contrôle du centre.",
    "e4 lance l'attaque centrale, crée un fort point d'appui.",
    "...Nxc3 échange le cavalier, affaiblit la structure des pions blancs.",
    "bxc3 reconstruit le centre avec les pions, prépare le fianchetto du fou blanc.",
  ],
  [
    [["d2","d4"]],
    [["g8","f6"]],
    [["c2","c4"]],
    [["g7","g6"]],
    [["b1","c3"]],
    [["d7","d5"]],
    [["c4","d5"]],
    [["f6","d5"]],
    [["e2","e4"]],
    [["d5","c3"]],
    [["b2","c3"]],
  ]
);

export const grunfeldCourse: OpeningCourse = {
  id: "grunfeld",
  name: "Grunfeld",
  description: "Formation complète sur Grunfeld",
  chapters: [
    {
      id: "grunfeld-d80",
      name: "Défense Grünfeld",
      root: grunfeldRoot,
    },
  ],
};

