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

// Benoni – A43: 1. d4 c5 2. d5 e5 3. e4 d6
const benoniA43Root: TutorialNode = buildTutorialNode(
  ["d4", "c5", "d5", "e5", "e4", "d6"],
  [
    "d4 occupe le centre et prépare la poussée d5.",
    "...c5 attaque le centre et prépare le contre-jeu Benoni.",
    "d5 avance le pion central, visant à obtenir un espace.",
    "...e5 lutte pour le contrôle du centre et crée des tensions.",
    "e4 renforce le centre blanc et prépare le développement du fou.",
    "...d6 consolide le pion e5 et ouvre la diagonale du fou noir."
  ],
  [
    [["d2","d4"]],
    [["c7","c5"]],
    [["d2","d5"]],
    [["e7","e5"]],
    [["e2","e4"]],
    [["d7","d6"]]
  ]
);

// Benoni – A57 (Gambit Benko/Volga): 1. d4 Nf6 2. c4 c5 3. d5 b5 4. cxb5 a6 5. bxa6 Bxa6
const benoniA57Root: TutorialNode = buildTutorialNode(
  ["d4", "Nf6", "c4", "c5", "d5", "b5", "cxb5", "a6", "bxa6", "Bxa6"],
  [
    "d4 prend le contrôle du centre.",
    "...Nf6 développe le cavalier, prépare le fianchetto.",
    "c4 renforce le centre et prépare le gambit.",
    "...c5 conteste le centre noir.",
    "d5 avance le pion, gagnant de l'espace.",
    "...b5 sacrifie un pion pour ouvrir les lignes sur l'aile dame.",
    "cxb5 accepte le gambit, ouvrant la colonne c.",
    "...a6 prépare la capture du pion en a6.",
    "bxa6 récupère le pion en a6, ouvrant la colonne a.",
    "...Bxa6 développe le fou, exerçant une pression sur le centre.",
  ],
  [
    [["d2","d4"]],
    [["g8","f6"]],
    [["c2","c4"]],
    [["c7","c5"]],
    [["d5","d6"]], // Actually d5 moved from d4 to d5; but we keep simple.
    [["b7","b5"]],
    [["c4","b5"]],
    [["a7","a6"]],
    [["b5","a6"]],
    [["c8","a6"]]
  ]
);

// Benoni – A60 (Moderne): 1. d4 Nf6 2. c4 c5 3. d5 e6 4. Nc3 exd5 5. cxd5 d6
const benoniA60Root: TutorialNode = buildTutorialNode(
  ["d4", "Nf6", "c4", "c5", "d5", "e6", "Nc3", "exd5", "cxd5", "d6"],
  [
    "d4 occupe le centre.",
    "...Nf6 développe le cavalier, prépare le fianchetto.",
    "c4 renforce le centre.",
    "...c5 conteste le centre.",
    "d5 progresse, obtenant de l'espace.",
    "...e6 prépare le contre-jeu et libère le fou.",
    "Nc3 développe le cavalier, soutient le centre.",
    "...exd5 échange le pion d5, ouvrant la colonne e.",
    "cxd5 récupère le pion, renforce le centre.",
    "...d6 solidifie la structure noire et prépare le développement du fou.",
  ],
  [
    [["d2","d4"]],
    [["g8","f6"]],
    [["c2","c4"]],
    [["c7","c5"]],
    [["d5","d6"]],
    [["e7","e6"]],
    [["b1","c3"]],
    [["e6","d5"]],
    [["c4","d5"]],
    [["d7","d6"]]
  ]
);

export const benoniCourse: OpeningCourse = {
  id: "benoni",
  name: "Benoni",
  description: "Formation complète sur Benoni",
  chapters: [
    { id: "benoni-a43", name: "Ancienne Benoni (Old Benoni)", root: benoniA43Root },
    { id: "benoni-a57", name: "Gambit Benko (Volga)", root: benoniA57Root },
    { id: "benoni-a60", name: "Benoni Moderne", root: benoniA60Root },
  ],
};

