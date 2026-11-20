import { describe, expect, it } from "vitest";

import type { ExplorerSummary } from "@/lib/chess/explorerStats";
import { analysisKey, type EngineAnalysis } from "@/lib/engine";

import type { CoachChatMessage } from "./chatProtocol";
import { buildPositionSnapshot, suggestedQuestions, trimHistory, uciLineToSan } from "./chatSnapshot";

const FEN_AFTER_E4_C5 = "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2";

const analysis = (fen: string, overrides: Partial<EngineAnalysis> = {}): EngineAnalysis => ({
  fen,
  key: analysisKey(fen),
  turn: "white",
  depth: 16,
  score: { type: "cp", value: 31.6 },
  bestMove: "g1f3",
  pv: ["g1f3", "d7d6", "d2d4", "c5d4", "f3d4", "g8f6", "b1c3", "a7a6", "c1e3", "e7e5"],
  complete: true,
  ...overrides,
});

const explorer: ExplorerSummary = {
  totalGames: 1000,
  white: 40,
  draws: 30,
  black: 30,
  openingName: "Sicilian Defense",
  eco: "B20",
  moves: Array.from({ length: 8 }, (_, i) => ({
    uci: `m${i}`,
    san: ["Nf3", "Nc3", "c3", "d4", "f4", "Bc4", "g3", "b3"][i],
    games: 500 - i * 50,
    popularity: 50 - i * 5,
    white: 40.26,
    draws: 30.04,
    black: 29.7,
    averageRating: 2512.6,
  })),
};

describe("uciLineToSan", () => {
  it("convertit une variante UCI en SAN", () => {
    expect(uciLineToSan(FEN_AFTER_E4_C5, ["g1f3", "d7d6"])).toEqual(["Nf3", "d6"]);
  });

  it("s'arrête au premier coup illégal", () => {
    expect(uciLineToSan(FEN_AFTER_E4_C5, ["g1f3", "e1e8", "d7d6"])).toEqual(["Nf3"]);
  });

  it("renvoie une liste vide pour une FEN invalide", () => {
    expect(uciLineToSan("pas une fen", ["e2e4"])).toEqual([]);
  });
});

describe("buildPositionSnapshot", () => {
  it("assemble la position, Stockfish et l'explorateur dans les limites du serveur", () => {
    const snapshot = buildPositionSnapshot({
      fen: FEN_AFTER_E4_C5,
      moves: ["e4", "c5"],
      openingName: "Sicilian Defense",
      analysis: analysis(FEN_AFTER_E4_C5),
      explorer,
      boardOrientation: "black",
    });
    expect(snapshot.fen).toBe(FEN_AFTER_E4_C5);
    expect(snapshot.moves).toEqual(["e4", "c5"]);
    expect(snapshot.boardOrientation).toBe("black");
    expect(snapshot.engine).toEqual({
      score: { type: "cp", value: 32 },
      depth: 16,
      line: ["Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6"],
    });
    expect(snapshot.explorer?.moves).toHaveLength(5);
    expect(snapshot.explorer?.moves[0]).toEqual({
      san: "Nf3",
      games: 500,
      white: 40.3,
      draws: 30,
      black: 29.7,
      averageRating: 2513,
    });
  });

  it("ignore une analyse qui porte sur une autre position", () => {
    const start = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    const snapshot = buildPositionSnapshot({
      fen: FEN_AFTER_E4_C5,
      moves: ["e4", "c5"],
      openingName: null,
      analysis: analysis(start),
      explorer: null,
      boardOrientation: "white",
    });
    expect(snapshot.engine).toBeNull();
    expect(snapshot.explorer).toBeNull();
  });

  it("ignore une analyse sans score", () => {
    const snapshot = buildPositionSnapshot({
      fen: FEN_AFTER_E4_C5,
      moves: [],
      openingName: null,
      analysis: analysis(FEN_AFTER_E4_C5, { score: null }),
      explorer: null,
      boardOrientation: "white",
    });
    expect(snapshot.engine).toBeNull();
  });

  it("tronque un nom d'ouverture trop long", () => {
    const snapshot = buildPositionSnapshot({
      fen: FEN_AFTER_E4_C5,
      moves: [],
      openingName: "x".repeat(500),
      analysis: null,
      explorer: null,
      boardOrientation: "white",
    });
    expect(snapshot.openingName).toHaveLength(120);
  });
});

describe("trimHistory", () => {
  const conversation = (count: number): CoachChatMessage[] =>
    Array.from({ length: count }, (_, i) => ({ role: i % 2 === 0 ? "user" : "assistant", content: `m${i}` }));

  it("garde tout un historique court", () => {
    expect(trimHistory(conversation(3))).toHaveLength(3);
  });

  it("ne garde que les derniers messages, en commençant par une question", () => {
    // m0…m10 : les 10 derniers commencent par une réponse (m1), retirée.
    const trimmed = trimHistory(conversation(11));
    expect(trimmed).toHaveLength(9);
    expect(trimmed[0]).toEqual({ role: "user", content: "m2" });
    expect(trimmed.at(-1)).toEqual({ role: "user", content: "m10" });
  });

  it("respecte une limite personnalisée", () => {
    expect(trimHistory(conversation(5), 3).map((m) => m.content)).toEqual(["m2", "m3", "m4"]);
  });
});

describe("suggestedQuestions", () => {
  it("s'appuie sur les coups des maîtres", () => {
    expect(
      suggestedQuestions({ moves: ["e4"], explorer: { totalGames: 1, moves: [explorer.moves[0], explorer.moves[1]] } }),
    ).toEqual(["Pourquoi les maîtres jouent Nf3 ?", "Quel est le plan ici ?", "Nf3 ou Nc3 ?"]);
  });

  it("propose des questions génériques sans explorateur", () => {
    expect(suggestedQuestions({ moves: [], explorer: null })).toEqual([
      "Par quoi commencer ?",
      "Quels sont les pièges à connaître ?",
    ]);
  });
});
