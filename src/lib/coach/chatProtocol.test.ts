import { describe, expect, it } from "vitest";

import {
  buildChatTurns,
  COACH_CHAT_SYSTEM_PROMPT,
  describeScore,
  describeSides,
  formatMoveSequence,
  formatPositionContext,
  type CoachPositionSnapshot,
} from "./chatProtocol";

const position: CoachPositionSnapshot = {
  fen: "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2",
  moves: ["e4", "c5"],
  openingName: "Sicilian Defense",
  engine: { score: { type: "cp", value: 35 }, depth: 16, line: ["Nf3", "d6", "d4"] },
  explorer: {
    totalGames: 1000,
    moves: [{ san: "Nf3", games: 700, white: 40.2, draws: 30.1, black: 29.7, averageRating: 2512.4 }],
  },
  boardOrientation: "black",
};

describe("formatMoveSequence", () => {
  it("numérote les coups depuis la position initiale", () => {
    expect(formatMoveSequence(["e4", "c5", "Nf3"])).toBe("1.e4 c5 2.Nf3");
  });

  it("commence par « 2... » quand la ligne débute sur un coup noir", () => {
    expect(formatMoveSequence(["d6", "d4"], 3)).toBe("2...d6 3.d4");
  });

  it("renvoie une chaîne vide sans coup", () => {
    expect(formatMoveSequence([])).toBe("");
  });
});

describe("describeScore", () => {
  it("traduit l'évaluation en mots, du point de vue des Blancs", () => {
    expect(describeScore({ type: "cp", value: 10 })).toBe("+0.10 (équilibre)");
    expect(describeScore({ type: "cp", value: 50 })).toBe("+0.50 (léger avantage Blancs)");
    expect(describeScore({ type: "cp", value: -120 })).toBe("-1.20 (net avantage Noirs)");
    expect(describeScore({ type: "cp", value: 400 })).toBe("+4.00 (avantage décisif Blancs)");
    expect(describeScore({ type: "cp", value: 0 })).toBe("0.00 (équilibre)");
  });

  it("décrit les mats", () => {
    expect(describeScore({ type: "mate", value: 3 })).toBe("mat en 3 pour les Blancs");
    expect(describeScore({ type: "mate", value: -2 })).toBe("mat en 2 pour les Noirs");
    expect(describeScore({ type: "mate", value: 0 })).toBe("mat sur l'échiquier");
  });
});

describe("formatPositionContext", () => {
  it("reprend tout ce que le joueur voit à l'écran", () => {
    const text = formatPositionContext(position);
    expect(text).toContain(`FEN : ${position.fen}`);
    expect(text).toContain("Coups joués : 1.e4 c5");
    expect(text).toContain("Trait aux Blancs : ce sont les Blancs qui jouent le prochain coup");
    expect(text).toContain("Dernier coup joué : 1...c5 (par les Noirs)");
    expect(text).toContain("Camp vu par l'élève : les Noirs (en bas de l'échiquier) ; c'est à son adversaire (les Blancs) de jouer");
    expect(text).toContain("Ouverture : Sicilian Defense");
    expect(text).toContain("Stockfish (profondeur 16) : +0.35 (léger avantage Blancs) ; ligne principale : 2.Nf3 d6 3.d4");
    expect(text).toContain("Base des maîtres : 1000 parties");
    expect(text).toContain("- Nf3 : 700 parties, Blancs 40 % / nulles 30 % / Noirs 30 %, Elo moyen 2512");
  });

  it("signale les données absentes", () => {
    const text = formatPositionContext({
      fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
      moves: [],
      openingName: null,
      engine: null,
      explorer: null,
    });
    expect(text).toContain("aucun (position initiale)");
    expect(text).toContain("Trait aux Noirs");
    expect(text).toContain("Stockfish : analyse indisponible");
    expect(text).toContain("aucune partie de maître");
    expect(text).not.toContain("Ouverture :");
    // Sans coup ni orientation (ancien client) : ni dernier coup ni camp vu.
    expect(text).not.toContain("Dernier coup");
    expect(text).not.toContain("Camp vu");
  });
});

describe("describeSides", () => {
  const afterE4 = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1";

  it("dit quand c'est à l'élève de jouer", () => {
    expect(describeSides({ fen: afterE4, moves: ["e4"], boardOrientation: "black" })).toEqual([
      "Trait aux Noirs : ce sont les Noirs qui jouent le prochain coup",
      "Dernier coup joué : 1.e4 (par les Blancs)",
      "Camp vu par l'élève : les Noirs (en bas de l'échiquier) ; c'est à l'élève de jouer",
    ]);
  });

  it("dit quand c'est à l'adversaire de jouer, juste après le coup de l'élève", () => {
    expect(describeSides({ fen: afterE4, moves: ["e4"], boardOrientation: "white" })[2]).toBe(
      "Camp vu par l'élève : les Blancs (en bas de l'échiquier) ; c'est à son adversaire (les Noirs) de jouer",
    );
  });
});

describe("buildChatTurns", () => {
  it("joint le contexte complet à la dernière question et la position aux précédentes", () => {
    const turns = buildChatTurns(
      [
        { role: "user", content: "Pourquoi e4 ?", moves: ["e4"] },
        { role: "assistant", content: "Pour le centre." },
        { role: "user", content: "Et c5 ?" },
        { role: "assistant", content: "Pour d4." },
        { role: "user", content: "Que jouer ?", moves: ["e4", "c5"] },
      ],
      position,
    );
    expect(turns[0]).toEqual({ role: "user", content: "(Position après 1.e4) Pourquoi e4 ?" });
    expect(turns[1]).toEqual({ role: "assistant", content: "Pour le centre." });
    expect(turns[2]).toEqual({ role: "user", content: "(Position initiale) Et c5 ?" });
    expect(turns[4].content.startsWith("[Position affichée]")).toBe(true);
    expect(turns[4].content.endsWith("[Question]\nQue jouer ?")).toBe(true);
  });
});

describe("COACH_CHAT_SYSTEM_PROMPT", () => {
  it("impose un ton d'entraîneur concis", () => {
    expect(COACH_CHAT_SYSTEM_PROMPT).toMatch(/2 à 4 phrases courtes/);
    expect(COACH_CHAT_SYSTEM_PROMPT).toMatch(/Pas de titres, pas de listes/);
  });

  it("ancre les réponses sur Stockfish et les maîtres, et interdit les affirmations non vérifiées", () => {
    expect(COACH_CHAT_SYSTEM_PROMPT).toMatch(/1\) la ligne principale de Stockfish, 2\) les statistiques de la base des maîtres/);
    expect(COACH_CHAT_SYSTEM_PROMPT).toMatch(/N'affirme jamais qu'une pièce contrôle, attaque ou défend une case sans l'avoir vérifié dans le FEN/);
    expect(COACH_CHAT_SYSTEM_PROMPT).toMatch(/structure de pions .* qu'après avoir lu l'emplacement réel des pions dans le FEN/);
    expect(COACH_CHAT_SYSTEM_PROMPT).toMatch(/généralités d'ouverture .* que si elles se confirment dans la position/);
  });

  it("explique comment distinguer le camp au trait du camp vu par l'élève", () => {
    expect(COACH_CHAT_SYSTEM_PROMPT).toMatch(/le dernier coup a été joué par l'autre camp/);
    expect(COACH_CHAT_SYSTEM_PROMPT).toMatch(/camp vu par l'élève/);
  });
});
