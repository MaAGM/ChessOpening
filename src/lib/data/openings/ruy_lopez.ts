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

// Ruy Lopez – Berlin Defense (C65)
const ruyLopezBerlinRoot: TutorialNode = buildTutorialNode(
  ["e4", "e5", "Nf3", "Nc6", "Bb5", "Nf6", "O-O", "Nxe4", "d4"],
  [
    "e4 occupe le centre et ouvre la diagonale du fou.",
    "...e5 répond symétriquement, contrôle le centre.",
    "Nf3 développe le cavalier, prépare le roque et attaque e5.",
    "...Nc6 développe le cavalier, soutient e5.",
    "Bb5 crée une pression sur le cavalier noir en c6, vise le pion e5.",
    "...Nf6 développe le cavalier, attaque le pion e4.",
    "O-O sécurise le roi et connecte les tours.",
    "...Nxe4 saisit le pion e4, cherchant à gagner du matériel.",
    "d4 ouvre le centre, prépare le développement du fou et la récupération du pion.",
  ],
  [
    [["e2","e4"]],
    [["e7","e5"]],
    [["g1","f3"]],
    [["b8","c6"]],
    [["f1","b5"]],
    [["g8","f6"]],
    [["e1","g1"]],
    [["f6","e4"]],
    [["d2","d4"]],
  ]
);

// Ruy Lopez – Morphy Defense (C78)
const ruyLopezMorphyRoot: TutorialNode = buildTutorialNode(
  ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6", "O-O", "Be7"],
  [
    "e4 occupe le centre.",
    "...e5 répond, contrôle le centre.",
    "Nf3 développe le cavalier, prépare le roque.",
    "...Nc6 développe le cavalier, soutient e5.",
    "Bb5 attaque le cavalier en c6, créant une tension.",
    "...a6 force le fou à se déplacer.",
    "Ba4 recule le fou, maintient la pression sur c6.",
    "...Nf6 développe le cavalier, attaque e4.",
    "O-O sécurise le roi.",
    "...Be7 développe le fou, prépare le roque noir.",
  ],
  [
    [["e2","e4"]],
    [["e7","e5"]],
    [["g1","f3"]],
    [["b8","c6"]],
    [["f1","b5"]],
    [["a7","a6"]],
    [["b5","a4"]],
    [["g8","f6"]],
    [["e1","g1"]],
    [["f8","e7"]],
  ]
);

export const ruyLopezCourse: OpeningCourse = {
  id: "ruy_lopez",
  name: "Ruy Lopez",
  description: "Formation complète sur Ruy Lopez",
  chapters: [
    { id: "ruy_lopez-c65", name: "Espagnole - Défense Berlin", root: ruyLopezBerlinRoot },
    { id: "ruy_lopez-c78", name: "Espagnole - Défense Morphy", root: ruyLopezMorphyRoot },
  ],
};

