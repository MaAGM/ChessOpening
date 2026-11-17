import { describe, expect, it } from "vitest";

import {
  formatScore,
  isUciMove,
  parseBestMove,
  parseInfoLine,
  toWhitePov,
  uciToSquares,
  whiteShare,
} from "./uci";

describe("parseInfoLine", () => {
  it("lit profondeur, score en centipions et variante principale", () => {
    const info = parseInfoLine(
      "info depth 12 seldepth 18 multipv 1 score cp 34 nodes 120000 nps 900000 hashfull 40 tbhits 0 time 130 pv e2e4 e7e5 g1f3",
    );
    expect(info).toEqual({
      depth: 12,
      multipv: 1,
      score: { type: "cp", value: 34 },
      bound: null,
      pv: ["e2e4", "e7e5", "g1f3"],
    });
  });

  it("lit un score de mat négatif et une promotion", () => {
    const info = parseInfoLine("info depth 5 score mate -2 pv a2a1q b7b8n");
    expect(info?.score).toEqual({ type: "mate", value: -2 });
    expect(info?.pv).toEqual(["a2a1q", "b7b8n"]);
  });

  it("repère les bornes et le numéro de multipv", () => {
    expect(parseInfoLine("info depth 9 multipv 2 score cp -15 lowerbound pv d2d4")).toMatchObject({
      multipv: 2,
      bound: "lower",
    });
    expect(parseInfoLine("info depth 9 score cp 15 upperbound")?.bound).toBe("upper");
  });

  it("ignore les lignes sans score, les messages libres et le reste", () => {
    expect(parseInfoLine("info depth 3 currmove e2e4 currmovenumber 1")).toBeNull();
    expect(parseInfoLine("info string NNUE evaluation using nn.nnue enabled")).toBeNull();
    expect(parseInfoLine("bestmove e2e4")).toBeNull();
    expect(parseInfoLine("")).toBeNull();
    expect(parseInfoLine("info depth x score cp 10")).toBeNull();
  });

  it("position finale : score sans variante", () => {
    expect(parseInfoLine("info depth 0 score mate 0")).toEqual({
      depth: 0,
      multipv: 1,
      score: { type: "mate", value: 0 },
      bound: null,
      pv: [],
    });
  });
});

describe("parseBestMove", () => {
  it("lit le coup et le ponder", () => {
    expect(parseBestMove("bestmove e2e4 ponder e7e5")).toEqual({ bestMove: "e2e4", ponder: "e7e5" });
    expect(parseBestMove("bestmove g1f3")).toEqual({ bestMove: "g1f3", ponder: null });
  });

  it("aucun coup légal", () => {
    expect(parseBestMove("bestmove (none)")).toEqual({ bestMove: null, ponder: null });
  });

  it("ignore les autres lignes", () => {
    expect(parseBestMove("info depth 1 score cp 1")).toBeNull();
    expect(parseBestMove("bestmove")).toBeNull();
  });
});

describe("conversions et affichage", () => {
  it("isUciMove / uciToSquares", () => {
    expect(isUciMove("e7e8q")).toBe(true);
    expect(isUciMove("e9e8")).toBe(false);
    expect(uciToSquares("g1f3")).toEqual(["g1", "f3"]);
    expect(uciToSquares("e7e8q")).toEqual(["e7", "e8"]);
    expect(uciToSquares("(none)")).toBeNull();
  });

  it("toWhitePov inverse le score quand les Noirs sont au trait", () => {
    expect(toWhitePov({ type: "cp", value: 50 }, "white")).toEqual({ type: "cp", value: 50 });
    expect(toWhitePov({ type: "cp", value: 50 }, "black")).toEqual({ type: "cp", value: -50 });
    expect(toWhitePov({ type: "mate", value: 3 }, "black")).toEqual({ type: "mate", value: -3 });
    expect(Object.is(toWhitePov({ type: "mate", value: 0 }, "black").value, 0)).toBe(true);
  });

  it("whiteShare : égalité au centre, borné, mats aux extrémités", () => {
    expect(whiteShare({ type: "cp", value: 0 }, "white")).toBeCloseTo(0.5);
    expect(whiteShare({ type: "cp", value: 400 }, "white")).toBeGreaterThan(0.8);
    expect(whiteShare({ type: "cp", value: -400 }, "white")).toBeLessThan(0.2);
    expect(whiteShare({ type: "cp", value: 100_000 }, "white")).toBeLessThanOrEqual(1);
    expect(whiteShare({ type: "mate", value: 2 }, "white")).toBe(1);
    expect(whiteShare({ type: "mate", value: -2 }, "black")).toBe(0);
    // Mat sur l'échiquier : le camp au trait a perdu.
    expect(whiteShare({ type: "mate", value: 0 }, "white")).toBe(0);
    expect(whiteShare({ type: "mate", value: 0 }, "black")).toBe(1);
  });

  it("formatScore", () => {
    expect(formatScore({ type: "cp", value: 34 })).toBe("+0.3");
    expect(formatScore({ type: "cp", value: -125 })).toBe("-1.3");
    expect(formatScore({ type: "cp", value: 0 })).toBe("0.0");
    expect(formatScore({ type: "cp", value: -4 })).toBe("0.0");
    expect(formatScore({ type: "mate", value: 3 })).toBe("M3");
    expect(formatScore({ type: "mate", value: -2 })).toBe("-M2");
    expect(formatScore({ type: "mate", value: 0 })).toBe("#");
  });
});
