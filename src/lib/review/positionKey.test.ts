import { describe, expect, it } from "vitest";
import { Chess } from "chess.js";
import { fenFromPositionKey, fenTurn, toPositionKey } from "./positionKey";

const fenAfter = (...sans: string[]) => {
  const game = new Chess();
  sans.forEach((san) => game.move(san));
  return game.fen();
};

describe("toPositionKey", () => {
  it("donne la même clé pour deux ordres de coups menant à la même position", () => {
    const a = fenAfter("e4", "e5", "Nf3", "Nc6");
    const b = fenAfter("Nf3", "Nc6", "e4", "e5");
    expect(toPositionKey(a)).toBe(toPositionKey(b));
  });

  it("ignore les compteurs de demi-coups et de coups complets", () => {
    const a = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    const b = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 7 23";
    expect(toPositionKey(a)).toBe(toPositionKey(b));
  });

  it("distingue deux positions qui ne diffèrent que par les droits de roque", () => {
    const original = fenAfter("e4", "e5", "Nf3", "Nc6");
    const sansRoque = fenAfter("e4", "e5", "Nf3", "Nc6", "Ke2", "Ke7", "Ke1", "Ke8");
    expect(sansRoque.split(" ")[0]).toBe(original.split(" ")[0]); // même placement
    expect(toPositionKey(sansRoque)).not.toBe(toPositionKey(original));
  });

  it("distingue deux positions qui ne diffèrent que par le trait", () => {
    const blancs = "8/8/8/8/8/8/8/K6k w - - 0 1";
    const noirs = "8/8/8/8/8/8/8/K6k b - - 0 1";
    expect(toPositionKey(blancs)).not.toBe(toPositionKey(noirs));
  });
});

describe("fenTurn", () => {
  it("lit le camp au trait", () => {
    expect(fenTurn(new Chess().fen())).toBe("white");
    expect(fenTurn(fenAfter("e4"))).toBe("black");
  });
});

describe("fenFromPositionKey", () => {
  it("reconstruit une FEN valide qui redonne la même clé", () => {
    const key = toPositionKey(fenAfter("e4", "e5", "Nf3"));
    const fen = fenFromPositionKey(key);
    expect(() => new Chess(fen)).not.toThrow();
    expect(toPositionKey(fen)).toBe(key);
  });
});