import { describe, expect, it } from "vitest";
import { Chess } from "chess.js";
import { buildTreeFromMoves } from "@/lib/utils/openingParser";
import { toPositionKey } from "./positionKey";
import { buildReviewGraph, getNode } from "./reviewGraph";
import { pickWeightedMove } from "./reviewSelection";
import { nextStats, type PositionStats } from "./srs";

const HOUR_MS = 60 * 60 * 1000;
const T0 = 1_000_000_000_000;

const fenAfter = (...sans: string[]) => {
  const game = new Chess();
  sans.forEach((san) => game.move(san));
  return game.fen();
};
const keyAfter = (...sans: string[]) => toPositionKey(fenAfter(...sans));

/** Générateur pseudo-aléatoire déterministe. */
function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

describe("boucle complète : tirage pondéré + répétition espacée", () => {
  const graph = buildReviewGraph([
    { id: "advance", root: buildTreeFromMoves(["1. e4 e6 2. d4 d5 3. e5 c5"], [], true) },
    { id: "winawer", root: buildTreeFromMoves(["1. e4 e6 2. d4 d5 3. Nc3 Bb4"], [], true) },
  ]);
  const fork = getNode(graph, fenAfter("e4", "e6", "d4", "d5"))!;
  const cardAfter = { e5: keyAfter("e4", "e6", "d4", "d5", "e5"), Nc3: keyAfter("e4", "e6", "d4", "d5", "Nc3") };

  it("fait tomber plus souvent sur la variante où l'on se trompe", () => {
    const rng = seededRng(7);
    const stats: Record<string, PositionStats> = {};
    const picks: string[] = [];

    for (let i = 0; i < 60; i++) {
      const now = T0 + i * HOUR_MS;
      const san = pickWeightedMove(graph, fork, { playerSide: "black", stats, now }, rng)!;
      picks.push(san);

      // L'utilisateur connaît la ligne e5 mais rate systématiquement la Winawer.
      const key = cardAfter[san as "e5" | "Nc3"];
      stats[key] = nextStats(stats[key], san === "e5", now);
    }

    const early = picks.slice(5, 40);
    const winawerShare = early.filter((san) => san === "Nc3").length / early.length;
    expect(winawerShare).toBeGreaterThan(0.7);
    expect(picks).toContain("e5"); // la branche maîtrisée reste testée de temps en temps
  });

  it("rééquilibre les tirages une fois la variante apprise", () => {
    const rng = seededRng(11);
    const stats: Record<string, PositionStats> = {};
    // Les deux variantes sont réussies à chaque fois : aucune ne doit être écartée.
    let nc3 = 0;
    const runs = 400;
    for (let i = 0; i < runs; i++) {
      const now = T0 + i * HOUR_MS;
      const san = pickWeightedMove(graph, fork, { playerSide: "black", stats, now }, rng)!;
      if (san === "Nc3") nc3++;
      const key = cardAfter[san as "e5" | "Nc3"];
      stats[key] = nextStats(stats[key], true, now);
    }
    expect(nc3 / runs).toBeGreaterThan(0.2);
    expect(nc3 / runs).toBeLessThan(0.8);
  });
});
