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

// Reti – A04: 1. Nf3 d5 2. c4
const retiA04Root: TutorialNode = buildTutorialNode(
  ["Nf3", "d5", "c4"],
  [
    "Nf3 développe le cavalier, contrôle les cases e5 et d4, et prépare un futur fianchetto du fou.",
    "...d5 occupe le centre, conteste e4 et libère le fou noir.",
    "c4 attaque le centre, prépare le contrôle du d5 noir et ouvre la diagonale du fou blanc vers g2."
  ],
  [
    [["g1","f3"]],
    [["d7","d5"]],
    [["c2","c4"]]
  ]
);

export const retiCourse: OpeningCourse = {
  id: "reti",
  name: "Reti",
  description: "Formation complète sur Reti",
  chapters: [
    {
      id: "reti-a04",
      name: "Ouverture Réti",
      root: retiA04Root,
    },
  ],
};

