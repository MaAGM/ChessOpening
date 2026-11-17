import { Chess } from "chess.js";
import type { BookMove, CoachEngineInput, CoachMistakeInput } from "./types";

/**
 * Scénarios partagés par les tests du coach (positions réelles, analyses moteur simulées).
 * Les scores sont donnés du point de vue des Blancs, comme `EngineAnalysis`.
 */

export const fenAfter = (sans: readonly string[]): string => {
  const game = new Chess();
  sans.forEach((san) => game.move(san));
  return game.fen();
};

export const cp = (value: number, pv: string[] = [], depth = 18): CoachEngineInput => ({
  score: { type: "cp", value },
  depth,
  pv,
});

export const mate = (value: number, pv: string[] = [], depth = 18): CoachEngineInput => ({
  score: { type: "mate", value },
  depth,
  pv,
});

export const book = (san: string, extra: Partial<BookMove> = {}): BookMove => ({
  san,
  sourceId: "rep-1",
  sourceName: "Mon répertoire",
  isMainLine: true,
  continuation: [],
  ...extra,
});

/** Noirs : 1.e4 e5 2.Nf3 Nc6 3.Bc4, le répertoire prévoit 3…Bc5 ; le joueur offre sa dame (3…Qg5??). */
export function queenBlunder(): CoachMistakeInput {
  const history = ["e4", "e5", "Nf3", "Nc6", "Bc4"];
  return {
    fenBefore: fenAfter(history),
    playedSan: "Qg5",
    history,
    openingName: "Italian Game",
    bookMoves: [
      book("Bc5", { symbol: "!", comment: "Le fou vise f2.", continuation: ["c3", "Nf6"] }),
    ],
    positionNotes: [
      { sourceId: "rep-1", sourceName: "Mon répertoire", san: "Bc4", comment: "Les Blancs visent f7." },
    ],
    engine: {
      played: cp(900, ["f3g5", "d7d6", "g5f3"]),
      expected: { Bc5: cp(30, ["c2c3", "g8f6"]) },
    },
  };
}

/** Noirs : 1.e4 e5 2.Bc4 Nc6 3.Qh5, le répertoire prévoit 3…g6 ; 3…Nf6?? permet 4.Qxf7#. */
export function scholarsMate(): CoachMistakeInput {
  const history = ["e4", "e5", "Bc4", "Nc6", "Qh5"];
  return {
    fenBefore: fenAfter(history),
    playedSan: "Nf6",
    history,
    bookMoves: [book("g6", { continuation: ["Qf3", "Nf6"] })],
    engine: {
      played: mate(1, ["h5f7"]),
      expected: { g6: cp(-20, ["h5f3", "g8f6"]) },
    },
  };
}

/** Blancs : 1.e4 e5, le répertoire prévoit 2.Nf3 ; 2.Nc3 (Viennoise) est tout à fait jouable. */
export function playableDeviation(playedCp = 25, expectedCp = 30): CoachMistakeInput {
  const history = ["e4", "e5"];
  return {
    fenBefore: fenAfter(history),
    playedSan: "Nc3",
    history,
    openingName: "King's Pawn Game",
    bookMoves: [book("Nf3", { continuation: ["Nc6", "Bb5"] })],
    engine: {
      played: cp(playedCp, ["g8f6"]),
      expected: { Nf3: cp(expectedCp, ["b8c6"]) },
    },
  };
}

/** Blancs : 1.d4 d5, le répertoire prévoit 2.c4 ; 2.Kd2?! ne perd rien mais ruine la position. */
export function kingWalk(playedCp = -150): CoachMistakeInput {
  const history = ["d4", "d5"];
  return {
    fenBefore: fenAfter(history),
    playedSan: "Kd2",
    history,
    bookMoves: [book("c4")],
    engine: {
      played: cp(playedCp, ["e7e5"]),
      expected: { c4: cp(30, ["e7e6"]) },
    },
  };
}
