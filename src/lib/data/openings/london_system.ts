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

// London System – Classical (D02)
const londonSystemRoot: TutorialNode = buildTutorialNode(
  ["d4", "d5", "Bf4", "Nf6", "e3", "c6", "Nf3"],
  [
    "d4 occupe le centre et prépare le développement du fou.",
    "...d5 répond symétriquement, établissant un centre solide.",
    "Bf4 développe le fou en dehors de la chaîne de pions, vise c7.",
    "...Nf6 développe le cavalier, prépare le roque noir.",
    "e3 renforce le centre, ouvre la diagonale du fou c1.",
    "...c6 soutient le pion d5 et prépare ...b5.",
    "Nf3 développe le cavalier, prépare le roque blanc.",
  ],
  [
    [["d2","d4"]],
    [["d7","d5"]],
    [["c1","f4"]],
    [["g8","f6"]],
    [["e2","e3"]],
    [["c7","c6"]],
    [["g1","f3"]],
  ]
);

export const londonSystemCourse: OpeningCourse = {
  id: "london_system",
  name: "London System",
  description: "Formation complète sur London System",
  chapters: [
    {
      id: "london_system-d02",
      name: "Système de Londres (Classique)",
      root: londonSystemRoot,
    },
  ],
};

