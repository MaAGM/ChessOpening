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

// Sicilian – B22: 1. e4 c5 2. c3 Nf6 3. e5 Nd5
const sicilianB22Root: TutorialNode = buildTutorialNode(
  ["e4", "c5", "c3", "Nf6", "e5", "Nd5"],
  [
    "e4 occupe le centre et ouvre la diagonale du fou.",
    "...c5 conteste le centre immédiatement, cherchant à créer une structure asymétrique.",
    "c3 prépare un futur d4 et un contrôle du centre tout en gardant la structure flexible.",
    "...Nf6 développe le cavalier, vise e4 et prépare le ...d5.",
    "e5 avance le pion, prend de l'espace et limite le cavalier noir.",
    "...Nd5 recule le cavalier tout en ciblant le pion c3 et en contrôlant e4."
  ],
  [
    [["e2","e4"]],
    [["c7","c5"]],
    [["c2","c3"]],
    [["g8","f6"]],
    [["e4","e5"]],
    [["f6","d5"]]
  ]
);

// Sicilian – B70 (Dragon): 1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 g6 6. Be3 Bg7 7. f3
const sicilianB70Root: TutorialNode = buildTutorialNode(
  ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "g6", "Be3", "Bg7", "f3"],
  [
    "e4 occupe le centre.",
    "...c5 ouvre la colonne c et crée un jeu asymétrique.",
    "Nf3 développe le cavalier, contrôle d4 et e5.",
    "...d6 renforce le centre noir et prépare le fianchetto du fou.",
    "d4 occupe le centre et ouvre la position.",
    "...cxd4 échange un pion, libérant la colonne c.",
    "Nxd4 récupère le pion et centralise le cavalier.",
    "...Nf6 développe le cavalier, attaque e4.",
    "Nc3 développe le second cavalier, soutient d5.",
    "...g6 prépare le fianchetto du fou noir.",
    "Be3 développe le fou, prépare le roque et renforce le centre.",
    "...Bg7 fianchette le fou, visant la diagonale a1-h8.",
    "f3 renforce le centre, prépare e4‑e5 et empêche ...Bg4."
  ],
  [
    [["e2","e4"]],
    [["c7","c5"]],
    [["g1","f3"]],
    [["d7","d6"]],
    [["d2","d4"]],
    [["c5","d4"]],
    [["f3","d4"]],
    [["g8","f6"]],
    [["b1","c3"]],
    [["g7","g6"]],
    [["c1","e3"]],
    [["f8","g7"]],
    [["f2","f3"]]
  ]
);

// Sicilian – B90 (Najdorf): 1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Be3 e5
const sicilianB90Root: TutorialNode = buildTutorialNode(
  ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Be3", "e5"],
  [
    "e4 occupe le centre.",
    "...c5 conteste le centre et crée une dynamique asymétrique.",
    "Nf3 développe le cavalier, contrôle d4.",
    "...d6 renforce le centre noir et prépare le ...e5.",
    "d4 ouvre le centre, préparant l'échange de pions.",
    "...cxd4 échange le pion central.",
    "Nxd4 récupère le pion, centralise le cavalier.",
    "...Nf6 développe le cavalier, cible e4.",
    "Nc3 développe le second cavalier, prépare le ...a6.",
    "...a6 empêche le cavalier blanc Nb5 et prépare ...b5.",
    "Be3 développe le fou, prépare le roque et soutient le centre.",
    "...e5 avance le pion central, gagne de l'espace et attaque le cavalier en d4."
  ],
  [
    [["e2","e4"]],
    [["c7","c5"]],
    [["g1","f3"]],
    [["d7","d6"]],
    [["d2","d4"]],
    [["c5","d4"]],
    [["f3","d4"]],
    [["g8","f6"]],
    [["b1","c3"]],
    [["a7","a6"]],
    [["c1","e3"]],
    [["e7","e5"]]
  ]
);

export const sicilianCourse: OpeningCourse = {
  id: "sicilian",
  name: "Sicilian",
  description: "Formation complète sur Sicilian",
  chapters: [
    { id: "sicilian-b22", name: "Sicilienne - Alapine", root: sicilianB22Root },
    { id: "sicilian-b70", name: "Sicilienne - Dragon", root: sicilianB70Root },
    { id: "sicilian-b90", name: "Sicilienne - Najdorf", root: sicilianB90Root },
  ],
};

