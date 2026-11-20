import { describe, expect, it } from "vitest";

import type { LichessMasterMove, LichessMastersResponse } from "./explorer";
import { formatGameCount, resultShares, summarizeExplorer } from "./explorerStats";

const move = (san: string, white: number, draws: number, black: number): LichessMasterMove => ({
  uci: san.toLowerCase(),
  san,
  averageRating: 2500,
  white,
  draws,
  black,
});

const response = (moves: LichessMasterMove[]): LichessMastersResponse => ({
  white: moves.reduce((n, m) => n + m.white, 0),
  draws: moves.reduce((n, m) => n + m.draws, 0),
  black: moves.reduce((n, m) => n + m.black, 0),
  moves,
  topGames: [],
  recentGames: [],
  opening: { eco: "B20", name: "Sicilian Defense" },
});

describe("resultShares", () => {
  it("calcule les pourcentages", () => {
    expect(resultShares(50, 30, 20)).toEqual({ white: 50, draws: 30, black: 20 });
  });

  it("renvoie des zéros sans partie", () => {
    expect(resultShares(0, 0, 0)).toEqual({ white: 0, draws: 0, black: 0 });
  });
});

describe("summarizeExplorer", () => {
  it("résume la position et trie les coups par popularité", () => {
    const summary = summarizeExplorer(response([move("Nc3", 10, 5, 5), move("Nf3", 60, 10, 10)]));
    expect(summary).toMatchObject({ totalGames: 100, openingName: "Sicilian Defense", eco: "B20", white: 70 });
    expect(summary.moves.map((m) => m.san)).toEqual(["Nf3", "Nc3"]);
    expect(summary.moves[0]).toMatchObject({ games: 80, popularity: 80, white: 75 });
  });

  it("limite le nombre de coups", () => {
    const moves = Array.from({ length: 15 }, (_, i) => move(`m${i}`, 1, 1, 1));
    expect(summarizeExplorer(response(moves), 4).moves).toHaveLength(4);
  });

  it("gère une position sans partie et sans ouverture", () => {
    const summary = summarizeExplorer({ ...response([]), opening: undefined });
    expect(summary).toMatchObject({ totalGames: 0, openingName: null, eco: null, moves: [] });
  });
});

describe("formatGameCount", () => {
  it("abrège les grands nombres", () => {
    expect(formatGameCount(999)).toBe("999");
    expect(formatGameCount(1234)).toBe("1,2 k");
    expect(formatGameCount(45678)).toBe("46 k");
    expect(formatGameCount(2_345_678)).toBe("2,3 M");
  });
});
