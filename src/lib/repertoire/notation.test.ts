import { describe, expect, it } from "vitest";
import { SYMBOL_LABELS, formatLine, formatMove, moveNumber } from "./notation";
import { MOVE_SYMBOLS } from "./types";

describe("moveNumber", () => {
  it("numérote les demi-coups à partir de 1", () => {
    expect([0, 1, 2, 3, 10, 11].map(moveNumber)).toEqual([1, 1, 2, 2, 6, 6]);
  });
});

describe("formatMove", () => {
  it("écrit un coup blanc avec son numéro", () => {
    expect(formatMove(0, "e4")).toBe("1. e4");
    expect(formatMove(4, "Nf3")).toBe("3. Nf3");
  });

  it("écrit un coup noir avec des points de suspension, ou sans numéro", () => {
    expect(formatMove(1, "e5")).toBe("1… e5");
    expect(formatMove(1, "e5", undefined, false)).toBe("e5");
  });

  it("ajoute le symbole d'appréciation", () => {
    expect(formatMove(11, "a6", "!?")).toBe("6… a6!?");
    expect(formatMove(2, "Nf3", "!!")).toBe("2. Nf3!!");
  });
});

describe("SYMBOL_LABELS", () => {
  it("décrit chacun des six symboles", () => {
    for (const symbol of MOVE_SYMBOLS) expect(SYMBOL_LABELS[symbol]).toBeTruthy();
    expect(Object.keys(SYMBOL_LABELS)).toHaveLength(MOVE_SYMBOLS.length);
  });
});

describe("formatLine", () => {
  it("écrit une ligne avec ses numéros de coup", () => {
    expect(formatLine(["e4", "e5", "Nf3", "Nc6"])).toBe("1. e4 e5 2. Nf3 Nc6");
    expect(formatLine(["e4"])).toBe("1. e4");
    expect(formatLine([])).toBe("");
  });
});