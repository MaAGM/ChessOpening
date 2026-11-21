import { describe, expect, it } from "vitest";

import {
  buildChatTurns,
  COACH_CHAT_MAX_COMMENT_LENGTH,
  COACH_CHAT_MAX_EXPECTED_MOVES,
  COACH_CHAT_MAX_OBJECTIVES,
  COACH_CHAT_SYSTEM_PROMPT,
  COACH_LEARN_SYSTEM_PROMPT,
  coachSystemPrompt,
  formatPositionContext,
  isStudentToMove,
  maskSpoilers,
  secretMoves,
  type CoachLessonContext,
  type CoachPositionSnapshot,
} from "./chatProtocol";
import { buildPositionSnapshot, clampLessonContext, learningSuggestions, suggestedQuestions } from "./chatSnapshot";
import { buildLessonContext } from "./lessonContext";

/** Partie italienne après 1.e4 e5 2.Nf3 Nc6 : aux Blancs (l'élève) de trouver 3.Bc4. */
const FEN_WHITE_TO_MOVE = "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3";
/** Après 3.Bc4 : aux Noirs (l'adversaire) de répondre. */
const FEN_BLACK_TO_MOVE = "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3";

const lesson: CoachLessonContext = {
  courseName: "Partie italienne",
  chapterTitle: "Les fondations",
  lessonTitle: "3.Bc4 : le fou contre f7",
  objectives: ["Comprendre pourquoi f7 est la cible de l'Italienne"],
  comment: "Le cavalier c6 défend e5.",
  expectedMoves: ["Bc4"],
};

const studentTurn: CoachPositionSnapshot = {
  fen: FEN_WHITE_TO_MOVE,
  moves: ["e4", "e5", "Nf3", "Nc6"],
  openingName: "Partie italienne",
  engine: { score: { type: "cp", value: 30 }, depth: 16, line: ["Bb5", "a6", "Ba4"] },
  explorer: null,
  boardOrientation: "white",
  lesson,
};

const opponentTurn: CoachPositionSnapshot = {
  ...studentTurn,
  fen: FEN_BLACK_TO_MOVE,
  moves: [...studentTurn.moves, "Bc4"],
  engine: { score: { type: "cp", value: 25 }, depth: 16, line: ["Bc5", "c3"] },
  lesson: { ...lesson, comment: "Le fou vise f7.", expectedMoves: ["Bc5", "Nf6"] },
};

describe("contexte de cours envoyé au Coach", () => {
  it("détecte quand c'est à l'élève de jouer (et seulement en Apprentissage)", () => {
    expect(isStudentToMove(studentTurn)).toBe(true);
    expect(isStudentToMove(opponentTurn)).toBe(false);
    expect(isStudentToMove({ ...studentTurn, lesson: undefined })).toBe(false);
    expect(isStudentToMove({ ...studentTurn, boardOrientation: "black" })).toBe(false);
  });

  it("présente le cours et marque le coup attendu de l'élève comme secret", () => {
    const context = formatPositionContext(studentTurn);
    expect(context).toContain("[Cours suivi par l'élève]");
    expect(context).toContain("Ouverture : Partie italienne ; chapitre : Les fondations ; cours : 3.Bc4 : le fou contre f7");
    expect(context).toContain("Objectifs du cours : Comprendre pourquoi f7 est la cible de l'Italienne");
    expect(context).toContain("Commentaire du cours affiché à l'élève : Le cavalier c6 défend e5.");
    expect(context).toContain("Coup(s) attendu(s) de l'élève — SECRET");
    expect(context).toContain("indice stratégique");
  });

  it("masque la ligne Stockfish quand l'élève doit trouver le coup, mais garde l'évaluation", () => {
    const context = formatPositionContext(studentTurn);
    expect(context).toContain("Stockfish (profondeur 16) : +0.30 (léger avantage Blancs) ; ligne principale masquée");
    expect(context).toContain("ligne principale masquée");
    expect(context).not.toContain("Bb5");
  });

  it("laisse parler librement des réponses de l'adversaire", () => {
    const context = formatPositionContext(opponentTurn);
    expect(context).not.toContain("SECRET");
    expect(context).toContain("Réponse(s) prévue(s) de l'adversaire dans le cours : Bc5, Nf6");
    expect(context).toContain("ligne principale : 3...Bc5 4.c3");
  });

  it("signale la fin de variante", () => {
    const end = { ...studentTurn, lesson: { ...lesson, expectedMoves: [] } };
    expect(formatPositionContext(end)).toContain("Fin de la variante étudiée");
  });

  it("n'ajoute aucun bloc de cours en Exploration", () => {
    const explorer = { ...studentTurn, lesson: undefined };
    expect(formatPositionContext(explorer)).not.toContain("[Cours suivi");
    expect(formatPositionContext(explorer)).toContain("ligne principale : 3.Bb5 a6 4.Ba4");
  });

  it("joint le contexte de cours à la dernière question", () => {
    const turns = buildChatTurns([{ role: "user", content: "Donne-moi un indice" }], studentTurn);
    expect(turns[0].content).toContain("SECRET");
    expect(turns[0].content).toMatch(/\[Question\]\nDonne-moi un indice$/);
  });
});

describe("consignes du mode Apprentissage", () => {
  it("choisit les consignes selon la présence d'un cours", () => {
    expect(coachSystemPrompt(studentTurn)).toBe(COACH_LEARN_SYSTEM_PROMPT);
    expect(coachSystemPrompt({ ...studentTurn, lesson: undefined })).toBe(COACH_CHAT_SYSTEM_PROMPT);
  });

  it("interdit de révéler le coup attendu et impose un indice à la place", () => {
    expect(COACH_LEARN_SYSTEM_PROMPT).toContain("ne révèle JAMAIS le coup attendu");
    expect(COACH_LEARN_SYSTEM_PROMPT).toContain("même si l'élève insiste");
    expect(COACH_LEARN_SYSTEM_PROMPT).toContain("donne un indice stratégique");
    expect(COACH_LEARN_SYSTEM_PROMPT).toContain("Ne cite pas non plus le premier coup de la ligne Stockfish");
    expect(COACH_LEARN_SYSTEM_PROMPT).toContain("2 à 4 phrases courtes");
    expect(COACH_CHAT_SYSTEM_PROMPT).not.toContain("anti-divulgation");
  });
});

describe("maskSpoilers (filet de sécurité)", () => {
  it("masque le coup attendu en notation anglaise, française et numérotée", () => {
    expect(maskSpoilers("Joue Bc4 !", studentTurn)).toBe("Joue (à toi de le trouver) !");
    expect(maskSpoilers("Le coup Fc4 s'impose.", studentTurn)).toBe("Le coup (à toi de le trouver) s'impose.");
    expect(maskSpoilers("Après 3.Bc4, f7 souffre.", studentTurn)).toBe("Après (à toi de le trouver), f7 souffre.");
  });

  it("masque aussi le premier coup de la ligne Stockfish", () => {
    expect(secretMoves(studentTurn)).toEqual(["Bc4", "Bb5"]);
    expect(maskSpoilers("Stockfish aime Bb5+.", studentTurn)).toBe("Stockfish aime (à toi de le trouver).");
  });

  it("ne touche ni aux cases, ni aux autres coups, ni au tour de l'adversaire", () => {
    expect(maskSpoilers("Vise la case c4 et le pion f7 ; Bc45 n'existe pas.", studentTurn)).toBe(
      "Vise la case c4 et le pion f7 ; Bc45 n'existe pas.",
    );
    expect(maskSpoilers("Les Noirs jouent souvent Bc5.", opponentTurn)).toBe("Les Noirs jouent souvent Bc5.");
    expect(maskSpoilers("Joue Bc4.", { ...studentTurn, lesson: undefined })).toBe("Joue Bc4.");
  });

  it("ne masque pas une poussée de pion simple (son nom est celui d'une case)", () => {
    const pawn = { ...studentTurn, engine: null, lesson: { ...lesson, expectedMoves: ["d4"] } };
    expect(secretMoves(pawn)).toEqual([]);
    expect(maskSpoilers("Le pion d4 est central.", pawn)).toBe("Le pion d4 est central.");
  });

  it("masque les roques sous leurs deux écritures, sans confondre petit et grand roque", () => {
    const castle = { ...studentTurn, engine: null, lesson: { ...lesson, expectedMoves: ["O-O"] } };
    expect(maskSpoilers("Joue O-O ou 0-0.", castle)).toBe("Joue (à toi de le trouver) ou (à toi de le trouver).");
    expect(maskSpoilers("Le grand roque O-O-O est risqué.", castle)).toBe("Le grand roque O-O-O est risqué.");
  });
});

describe("instantané du mode Apprentissage", () => {
  it("borne le contexte de cours aux limites du serveur", () => {
    const clamped = clampLessonContext({
      ...lesson,
      objectives: Array.from({ length: 12 }, (_, i) => `Objectif ${i}`),
      comment: `  ${"x".repeat(COACH_CHAT_MAX_COMMENT_LENGTH + 50)}  `,
      expectedMoves: Array.from({ length: 12 }, () => "Nf3"),
    });
    expect(clamped.objectives).toHaveLength(COACH_CHAT_MAX_OBJECTIVES);
    expect(clamped.comment).toHaveLength(COACH_CHAT_MAX_COMMENT_LENGTH);
    expect(clamped.expectedMoves).toHaveLength(COACH_CHAT_MAX_EXPECTED_MOVES);
    expect(clampLessonContext({ ...lesson, comment: "   " }).comment).toBeNull();
  });

  it("ajoute le cours à l'instantané seulement s'il est fourni", () => {
    const base = { fen: FEN_WHITE_TO_MOVE, moves: studentTurn.moves, openingName: null, analysis: null, explorer: null, boardOrientation: "white" as const };
    expect(buildPositionSnapshot(base)).not.toHaveProperty("lesson");
    expect(buildPositionSnapshot({ ...base, lesson: null })).not.toHaveProperty("lesson");
    expect(buildPositionSnapshot({ ...base, lesson }).lesson).toEqual(lesson);
  });

  it("construit le contexte depuis l'état du tutoriel", () => {
    const source = {
      course: { name: "Partie italienne" },
      activeChapter: { title: "Les fondations" },
      activeLesson: { title: "3.Bc4 : le fou contre f7", objectives: ["Comprendre pourquoi f7 est la cible de l'Italienne"] },
      activeNode: { explanation: " Le cavalier c6 défend e5. ", children: { Bc4: {} } },
    };
    expect(buildLessonContext(source)).toEqual(lesson);
    expect(buildLessonContext({ ...source, activeNode: { children: {} } })).toMatchObject({ comment: null, expectedMoves: [] });
    expect(buildLessonContext({ ...source, activeLesson: null })).toBeNull();
  });

  it("propose « Pourquoi ce coup ? », « Quel est le plan ici ? » et un indice quand c'est à l'élève", () => {
    expect(learningSuggestions(studentTurn)).toEqual(["Pourquoi ce coup ?", "Quel est le plan ici ?", "Donne-moi un indice"]);
    expect(learningSuggestions(opponentTurn)).toEqual(["Pourquoi ce coup ?", "Quel est le plan ici ?"]);
    expect(learningSuggestions({ ...studentTurn, fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", moves: [] })).toEqual([
      "Quel est le plan ici ?",
      "Donne-moi un indice",
    ]);
    expect(suggestedQuestions(studentTurn)).toEqual(learningSuggestions(studentTurn));
  });
});
