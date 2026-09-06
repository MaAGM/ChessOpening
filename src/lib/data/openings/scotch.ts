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

// Scotch – C45: 1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Nxd4 Nf6 5. Nxc6
const scotchRoot: TutorialNode = buildTutorialNode(
  ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Nxd4", "Nf6", "Nxc6"],
  [
    "e4 occupe le centre et ouvre la diagonale du fou.",
    "...e5 répond symétriquement, contestation du centre.",
    "Nf3 développe le cavalier, prépare le centre et le roque.",
    "...Nc6 développe le cavalier, controle e5 et prépare d4.",
    "d4 ouvre le centre, offrant des possibilités d'échange.",
    "...exd4 accepte le pion, ouvrant la colonne e.",
    "Nxd4 récupère le pion, centralise le cavalier.",
    "...Nf6 développe le cavalier, attaque e4 et prépare le roque.",
    "Nxc6 capture le cavalier en c6, double les pions noirs et crée une faiblesse.",
  ],
  [
    [["e2","e4"]],
    [["e7","e5"]],
    [["g1","f3"]],
    [["b8","c6"]],
    [["d2","d4"]],
    [["e5","d4"]],
    [["f3","d4"]],
    [["g8","f6"]],
    [["d4","c6"]],
  ]
);

export const scotchCourse: OpeningCourse = {
  id: "scotch",
  name: "Scotch",
  description: "Formation complète sur Scotch",
  chapters: [
    {
      id: "scotch-c45",
      name: "Partie Écossaise",
      root: scotchRoot,
    },
  ],
};

