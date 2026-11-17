import { describe, expect, it } from "vitest";
import { Chess } from "chess.js";
import {
  DEFAULT_COACH_THRESHOLDS,
  materialBalance,
  materialDelta,
  severityOf,
  toPlayerScore,
  uciLineToSan,
  winChance,
} from "./evaluation";

const fenAfter = (...sans: string[]) => {
  const game = new Chess();
  sans.forEach((san) => game.move(san));
  return game.fen();
};

const START = new Chess().fen();

describe("toPlayerScore", () => {
  it("garde les centipions pour les Blancs et les inverse pour les Noirs", () => {
    expect(toPlayerScore({ type: "cp", value: 120 }, START, "white")).toEqual({ kind: "cp", cp: 120 });
    expect(toPlayerScore({ type: "cp", value: 120 }, START, "black")).toEqual({ kind: "cp", cp: -120 });
  });

  it("attribue un mat au bon camp", () => {
    expect(toPlayerScore({ type: "mate", value: 3 }, START, "white")).toEqual({
      kind: "mate",
      moves: 3,
      winner: "player",
    });
    expect(toPlayerScore({ type: "mate", value: 3 }, START, "black")).toEqual({
      kind: "mate",
      moves: 3,
      winner: "opponent",
    });
    expect(toPlayerScore({ type: "mate", value: -2 }, START, "black")).toEqual({
      kind: "mate",
      moves: 2,
      winner: "player",
    });
  });

  it("interprète « mate 0 » grâce au camp au trait (il est maté)", () => {
    const mated = fenAfter("e4", "e5", "Bc4", "Nc6", "Qh5", "Nf6", "Qxf7#"); // Noirs au trait, matés
    expect(toPlayerScore({ type: "mate", value: 0 }, mated, "white")).toEqual({
      kind: "mate",
      moves: 0,
      winner: "player",
    });
    expect(toPlayerScore({ type: "mate", value: 0 }, mated, "black")).toEqual({
      kind: "mate",
      moves: 0,
      winner: "opponent",
    });
  });
});

describe("winChance", () => {
  it("vaut 0 à l'équilibre, est symétrique et bornée par les mats", () => {
    expect(winChance({ kind: "cp", cp: 0 })).toBe(0);
    expect(winChance({ kind: "cp", cp: 300 })).toBeCloseTo(-winChance({ kind: "cp", cp: -300 }));
    expect(winChance({ kind: "cp", cp: 5000 })).toBeLessThan(1);
    expect(winChance({ kind: "mate", moves: 4, winner: "player" })).toBe(1);
    expect(winChance({ kind: "mate", moves: 0, winner: "opponent" })).toBe(-1);
  });
});

describe("severityOf", () => {
  it("applique les seuils par défaut", () => {
    const t = DEFAULT_COACH_THRESHOLDS;
    expect(severityOf(0.05, t)).toBe("none");
    expect(severityOf(-0.4, t)).toBe("none");
    expect(severityOf(0.1, t)).toBe("inaccuracy");
    expect(severityOf(0.25, t)).toBe("mistake");
    expect(severityOf(0.3, t)).toBe("blunder");
  });
});

describe("uciLineToSan", () => {
  it("convertit une variante UCI en SAN", () => {
    expect(uciLineToSan(START, ["e2e4", "e7e5", "g1f3"])).toEqual(["e4", "e5", "Nf3"]);
  });

  it("gère la promotion", () => {
    const fen = "8/P6k/8/8/8/8/8/K7 w - - 0 1";
    expect(uciLineToSan(fen, ["a7a8q"])).toEqual(["a8=Q"]);
  });

  it("s'arrête au premier coup invalide et tolère une FEN invalide", () => {
    expect(uciLineToSan(START, ["e2e4", "e2e4", "g1f3"])).toEqual(["e4"]);
    expect(uciLineToSan("pas une fen", ["e2e4"])).toEqual([]);
  });
});

describe("materialBalance", () => {
  it("compte le matériel du point de vue demandé", () => {
    expect(materialBalance(START, "white")).toBe(0);
    const queenless = "rnb1kbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    expect(materialBalance(queenless, "white")).toBe(9);
    expect(materialBalance(queenless, "black")).toBe(-9);
  });
});

describe("materialDelta", () => {
  // Après 1.e4 e5 2.Nf3 Nc6 3.Bc4 : les Noirs au trait.
  const fen = fenAfter("e4", "e5", "Nf3", "Nc6", "Bc4");

  it("mesure la dame perdue le long de la réfutation", () => {
    expect(materialDelta(fen, ["Qg5", "Nxg5", "d6", "Nf3"], 7)).toBe(-9);
  });

  it("tronque à un nombre impair de demi-coups (fin sur un coup du joueur)", () => {
    // 3…Nd4 4.Nxe5 : sans la réponse du joueur, la prise n'est pas comptée.
    expect(materialDelta(fen, ["Nd4", "Nxe5"], 7)).toBe(0);
    expect(materialDelta(fen, ["Nd4", "Nxe5", "Qg5"], 7)).toBe(-1);
  });

  it("revient au dernier coup du joueur quand la ligne devient illégale", () => {
    expect(materialDelta(fen, ["Qg5", "Nxg5", "Ke9"], 7)).toBe(0);
  });

  it("renvoie null pour une ligne vide ou illégale dès le départ", () => {
    expect(materialDelta(fen, [], 7)).toBeNull();
    expect(materialDelta(fen, ["Ke3"], 7)).toBeNull();
  });
});
