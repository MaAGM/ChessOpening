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

// Trompowsky – A45: 1. d4 Nf6 2. Bg5 Ne4 3. Bf4
const trompowskyA45Root: TutorialNode = buildTutorialNode(
  ["d4", "Nf6", "Bg5", "Ne4", "Bf4"],
  [
    "d4 occupe le centre et prépare le développement du fou.",
    "...Nf6 développe le cavalier, contrôle e4 et prépare le roque.",
    "Bg5 crée une menace immédiate sur le cavalier f6, cherchant à perturber la défense noire.",
    "...Ne4 contre‑attaque en attaquant le fou blanc et en gagnant du temps.",
    "Bf4 redéploie le fou, maintient la pression sur le centre et prépare le roque.",
  ],
  [
    [["d2","d4"]],
    [["g8","f6"]],
    [["c1","g5"]],
    [["f6","e4"]],
    [["c1","f4"]],
  ]
);

export const trompowskyCourse: OpeningCourse = {
  id: "trompowsky",
  name: "Trompowsky",
  description: "Formation complète sur Trompowsky",
  chapters: [
    {
      id: "trompowsky-a45",
      name: "Attaque Trompowsky",
      root: trompowskyA45Root,
    },
  ],
};

