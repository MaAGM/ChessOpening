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

// Slav Defense – main line (D10)
const slavRoot: TutorialNode = buildTutorialNode(
  ["d4", "d5", "c4", "c6", "Nf3", "Nf6", "Nc3", "dxc4", "a4"],
  [
    "d4 occupe le centre, prépare le développement du fou.",
    "...d5 répond symétriquement, contrôle le centre.",
    "c4 met la pression sur le centre noir et prépare la prise d4.",
    "...c6 soutient d5 et prépare la ...b5.",
    "Nf3 développe le cavalier, cible le pion e5.",
    "...Nf6 développe le cavalier, protège le pion d5.",
    "Nc3 développe le cavalier, soutient le centre.",
    "...dxc4 accepte le gambit, se débarrasse du centre.",
    "a4 empêche ...b5, préserve le pion c4.",
  ],
  [
    [["d2","d4"]],
    [["d7","d5"]],
    [["c2","c4"]],
    [["c7","c6"]],
    [["g1","f3"]],
    [["g8","f6"]],
    [["b1","c3"]],
    [["d5","c4"]],
    [["a2","a4"]],
  ]
);

export const slavCourse: OpeningCourse = {
  id: "slav",
  name: "Slav",
  description: "Formation complète sur Slav",
  chapters: [
    {
      id: "slav-d10",
      name: "Défense Slave",
      root: slavRoot,
    },
  ],
};

