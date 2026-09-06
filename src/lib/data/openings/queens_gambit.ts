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

// Queens Gambit – Accepted (D20)
const queensGambitAcceptedRoot: TutorialNode = buildTutorialNode(
  ["d4", "d5", "c4", "dxc4", "Nf3", "Nf6", "e3", "e6", "Bxc4"],
  [
    "d4 occupe le centre, prépare le fou.",
    "...d5 répond de façon symétrique, contrôle le centre.",
    "c4 offre un gambit de pion, aimant le pion d5.",
    "...dxc4 accepte le gambit, capture le pion c4.",
    "Nf3 développe le cavalier, prépare le roque.",
    "...Nf6 développe le cavalier, contrôle e4.",
    "e3 prépare le développement du fou c1.",
    "...e6 prépare le développement du fou c8.",
    "Bxc4 récupère le pion, développe le fou et exerce pression sur le centre.",
  ],
  [
    [["d2","d4"]],
    [["d7","d5"]],
    [["c2","c4"]],
    [["d5","c4"]],
    [["g1","f3"]],
    [["g8","f6"]],
    [["e2","e3"]],
    [["e7","e6"]],
    [["f1","c4"]],
  ]
);

// Queens Gambit – Refused (D30)
const queensGambitRefusedRoot: TutorialNode = buildTutorialNode(
  ["d4", "d5", "c4", "e6", "Nc3", "Nf6", "Bg5"],
  [
    "d4 occupe le centre.",
    "...d5 contrôle le centre.",
    "c4 propose le gambit.",
    "...e6 prépare le développement du fou, refuse le gambit.",
    "Nc3 développe le cavalier, soutient d5.",
    "...Nf6 développe le cavalier, contrôle e4.",
    "Bg5 cloue le cavalier noir, crée des menaces sur le roi.",
  ],
  [
    [["d2","d4"]],
    [["d7","d5"]],
    [["c2","c4"]],
    [["e7","e6"]],
    [["b1","c3"]],
    [["g8","f6"]],
    [["c1","g5"]],
  ]
);

export const queens_gambitCourse: OpeningCourse = {
  id: "queens_gambit",
  name: "Queens Gambit",
  description: "Formation complète sur Queens Gambit",
  chapters: [
    { id: "queens_gambit-d20", name: "Gambit Dame Accepté", root: queensGambitAcceptedRoot },
    { id: "queens_gambit-d30", name: "Gambit Dame Refusé", root: queensGambitRefusedRoot },
  ],
};

