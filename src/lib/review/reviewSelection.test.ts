import { describe, expect, it } from "vitest";
import { Chess } from "chess.js";
import { buildTreeFromMoves } from "@/lib/utils/openingParser";
import { toPositionKey } from "./positionKey";
import { buildReviewGraph, getNode } from "./reviewGraph";
import { getMoveWeights, listCardKeys, pickWeightedMove, summarizeCards } from "./reviewSelection";
import { DAY_MS, SRS_CONFIG, type PositionStats } from "./srs";

const NOW = 1_000_000_000_000;

const fenAfter = (...sans: string[]) => {
  const game = new Chess();
  sans.forEach((san) => game.move(san));
  return game.fen();
};
const keyAfter = (...sans: string[]) => toPositionKey(fenAfter(...sans));

// Répertoire des Noirs : après 1.e4 e6 2.d4 d5, l'ordinateur choisit 3.e5 ou 3.Nc3.
const graph = buildReviewGraph([
  { id: "advance", root: buildTreeFromMoves(["1. e4 e6 2. d4 d5 3. e5 c5"], [], true) },
  { id: "winawer", root: buildTreeFromMoves(["1. e4 e6 2. d4 d5 3. Nc3 Bb4"], [], true) },
]);
const fork = getNode(graph, fenAfter("e4", "e6", "d4", "d5"))!;
const afterE5 = keyAfter("e4", "e6", "d4", "d5", "e5");
const afterNc3 = keyAfter("e4", "e6", "d4", "d5", "Nc3");

const mastered: PositionStats = {
  box: 5,
  due: NOW + 10 * DAY_MS,
  attempts: 8,
  failures: 0,
  lastSeen: NOW,
  recent: [1, 1, 1, 1, 1],
};
const justFailed: PositionStats = {
  box: 1,
  due: NOW,
  attempts: 3,
  failures: 2,
  lastSeen: NOW,
  recent: [1, 0, 0],
};

const probabilityOf = (
  weights: { san: string; probability: number }[],
  san: string,
): number => weights.find((w) => w.san === san)!.probability;

describe("listCardKeys", () => {
  it("ne retient que les positions où c'est au joueur de jouer", () => {
    const keys = listCardKeys(graph, "black");
    expect(keys).toHaveLength(4); // après e4, après d4, après e5, après Nc3
    expect(keys).toContain(afterE5);
    expect(keys).toContain(afterNc3);
  });
});

describe("getMoveWeights", () => {
  it("est uniforme quand rien n'a encore été vu", () => {
    const weights = getMoveWeights(graph, fork, { playerSide: "black", stats: {}, now: NOW });
    expect(probabilityOf(weights, "e5")).toBeCloseTo(0.5, 5);
    expect(probabilityOf(weights, "Nc3")).toBeCloseTo(0.5, 5);
  });

  it("privilégie la branche non vue quand l'autre est maîtrisée, sans jamais l'exclure", () => {
    const weights = getMoveWeights(graph, fork, {
      playerSide: "black",
      stats: { [afterNc3]: mastered },
      now: NOW,
    });
    expect(probabilityOf(weights, "e5")).toBeGreaterThan(0.9);
    expect(probabilityOf(weights, "Nc3")).toBeGreaterThanOrEqual(SRS_CONFIG.explorationFloor / 2);
  });

  it("privilégie la branche où l'on vient de se tromper", () => {
    const weights = getMoveWeights(graph, fork, {
      playerSide: "black",
      stats: { [afterE5]: mastered, [afterNc3]: justFailed },
      now: NOW,
    });
    expect(probabilityOf(weights, "Nc3")).toBeGreaterThan(0.9);
  });

  it("a des probabilités qui somment à 1", () => {
    const weights = getMoveWeights(graph, fork, {
      playerSide: "black",
      stats: { [afterE5]: justFailed },
      now: NOW,
    });
    expect(weights.reduce((sum, w) => sum + w.probability, 0)).toBeCloseTo(1, 10);
  });

  it("renvoie une probabilité de 1 quand il n'y a qu'une réponse", () => {
    const node = getNode(graph, fenAfter("e4"))!; // une seule arête : e6
    const weights = getMoveWeights(graph, node, { playerSide: "black", stats: {}, now: NOW });
    expect(weights).toHaveLength(1);
    expect(weights[0].probability).toBeCloseTo(1, 10);
  });

  it("renvoie une liste vide sur une feuille", () => {
    const leaf = getNode(graph, fenAfter("e4", "e6", "d4", "d5", "e5", "c5"))!;
    expect(getMoveWeights(graph, leaf, { playerSide: "black", stats: {}, now: NOW })).toEqual([]);
  });
});

describe("pickWeightedMove", () => {
  it("tire de façon déterministe avec un rng injecté", () => {
    const ctx = { playerSide: "black" as const, stats: {}, now: NOW };
    expect(pickWeightedMove(graph, fork, ctx, () => 0)).toBe("e5");
    expect(pickWeightedMove(graph, fork, ctx, () => 0.999)).toBe("Nc3");
  });

  it("suit les poids sur un grand nombre de tirages", () => {
    const ctx = { playerSide: "black" as const, stats: { [afterNc3]: mastered }, now: NOW };
    let seed = 42;
    const rng = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    let e5 = 0;
    const runs = 2000;
    for (let i = 0; i < runs; i++) if (pickWeightedMove(graph, fork, ctx, rng) === "e5") e5++;
    expect(e5 / runs).toBeGreaterThan(0.85);
    expect(e5 / runs).toBeLessThan(0.99); // l'autre branche reste testée
  });

  it("renvoie null sur une feuille", () => {
    const leaf = getNode(graph, fenAfter("e4", "e6", "d4", "d5", "e5", "c5"))!;
    expect(pickWeightedMove(graph, leaf, { playerSide: "black", stats: {}, now: NOW })).toBeNull();
  });
});

describe("summarizeCards", () => {
  it("répartit les fiches par statut", () => {
    const summary = summarizeCards(
      graph,
      "black",
      { [afterE5]: mastered, [afterNc3]: { ...justFailed, due: NOW - 1 } },
      NOW,
    );
    expect(summary).toEqual({ total: 4, new: 2, due: 1, learning: 0, mastered: 1 });
  });
});
