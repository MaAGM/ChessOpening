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

// Italian – C53 (Giuoco Piano): 1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 d6
const italianC53Root: TutorialNode = buildTutorialNode(
  ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "c3", "d6"],
  [
    "e4 occupe le cases centrales et ouvre la diagonale du fou.",
    "...e5 répond symétriquement, contrôle le centre.",
    "Nf3 développe le cavalier, prépare le roque et contrôle d4.",
    "...Nc6 développe le cavalier, soutient e5 et prépare d4.",
    "Bc4 place le fou sur la puissante diagonale a2‑g8, visant f7.",
    "...Bc5 place le fou noir en symétrie, contrôle les cases centrales et prépare le roque.",
    "c3 renforce le centre, prépare d4 et donne au fou blanc un point d'appui.",
    "...d6 soutient le pion e5 et ouvre la voie au développement du fou noir.",
  ],
  [
    [["e2","e4"]],
    [["e7","e5"]],
    [["g1","f3"]],
    [["b8","c6"]],
    [["f1","c4"]],
    [["f8","c5"]],
    [["c2","c3"]],
    [["d7","d6"]],
  ]
);

// Italian – C55 (Deux Cavaliers): 1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. Ng5
const italianC55Root: TutorialNode = buildTutorialNode(
  ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5"],
  [
    "e4 occupe le cases centrales.",
    "...e5 répond, contestation du centre.",
    "Nf3 développe le cavalier, prépare le roque.",
    "...Nc6 développe le cavalier, soutient e5.",
    "Bc4 développe le fou, pointe vers le point faible f7.",
    "...Nf6 développe le cavalier, prépare le roque et défend e5.",
    "Ng5 attaque f7, préparant un sacrifice éventuel et mettant la pression sur le roi noir.",
  ],
  [
    [["e2","e4"]],
    [["e7","e5"]],
    [["g1","f3"]],
    [["b8","c6"]],
    [["f1","c4"]],
    [["g8","f6"]],
    [["f3","g5"]],
  ]
);

export const italianCourse: OpeningCourse = {
  id: "italian",
  name: "Italian",
  description: "Formation complète sur Italian",
  chapters: [
    {
      id: "italian-c53",
      name: "Italienne - Giuoco Piano",
      root: italianC53Root,
    },
    {
      id: "italian-c55",
      name: "Italienne - Deux Cavaliers",
      root: italianC55Root,
    },
  ],
};

