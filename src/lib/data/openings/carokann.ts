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

// Caro‑Kann – B12: 1. e4 c6 2. d4 d5 3. e5 Bf5 4. Nf3 e6
const carokannB12Root: TutorialNode = buildTutorialNode(
  ["e4", "c6", "d4", "d5", "e5", "Bf5", "Nf3", "e6"],
  [
    "e4 occupe le centre et ouvre la diagonale du fou.",
    "...c6 prépare le coup ...d5 tout en conservant une structure solide.",
    "d4 renforce le centre blanc.",
    "...d5 conteste le centre et ouvre la voie au fou.",
    "e5 pousse le pion, prend de l'espace et empêche le fou noir de se développer sur c8.",
    "...Bf5 développe le fou actif sur la case f5, pressant le pion c2.",
    "Nf3 développe le cavalier, contrôle e5 et prépare le roque.",
    "...e6 consolide le centre noir et libère le fou c8."
  ],
  [
    [["e2","e4"]],
    [["c7","c6"]],
    [["d2","d4"]],
    [["d7","d5"]],
    [["e4","e5"]],
    [["c8","f5"]],
    [["g1","f3"]],
    [["e7","e6"]]
  ]
);

// Caro‑Kann – B13 (Échange) : 1. e4 c6 2. d4 d5 3. exd5 cxd5 4. Bd3 Nc6 5. c3
const carokannB13Root: TutorialNode = buildTutorialNode(
  ["e4", "c6", "d4", "d5", "exd5", "cxd5", "Bd3", "Nc6", "c3"],
  [
    "e4 occupe le centre.",
    "...c6 prépare ...d5 tout en gardant la structure flexible.",
    "d4 renforce le centre.",
    "...d5 conteste le centre.",
    "exd5 échange le pion, ouvrant la colonne d.",
    "cxd5 recaptule, maintenant un centre de pions symétrique.",
    "Bd3 développe le fou, prépare le roque et contrôle e4.",
    "...Nc6 développe le cavalier, prépare le développement du fou.",
    "c3 renforce le contrôle du centre et prépare d4‑d5.",
  ],
  [
    [["e2","e4"]],
    [["c7","c6"]],
    [["d2","d4"]],
    [["d7","d5"]],
    [["e4","d5"]],
    [["c6","d5"]],
    [["f1","d3"]],
    [["b8","c6"]],
    [["c2","c3"]]
  ]
);

export const carokannCourse: OpeningCourse = {
  id: "caro_kann",
  name: "Caro Kann",
  description: "Formation complète sur Caro Kann",
  chapters: [
    { id: "caro_kann-b12", name: "Caro‑Kann - Avance", root: carokannB12Root },
    { id: "caro_kann-b13", name: "Caro‑Kann - Échange", root: carokannB13Root },
  ],
};

