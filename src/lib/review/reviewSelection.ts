import type { ReviewGraph } from "./reviewGraph";
import type { PositionKey } from "./positionKey";
import { SRS_CONFIG, classifyCard, urgency, type PositionStats } from "./srs";
import type { Side } from "./types";

export type SelectionContext = {
  /** Camp du joueur (celui qui s'entraîne). */
  playerSide: Side;
  stats: Record<PositionKey, PositionStats>;
  now: number;
};

export type CardSummary = {
  total: number;
  new: number;
  due: number;
  learning: number;
  mastered: number;
};

function isCard(graph: ReviewGraph, key: PositionKey, playerSide: Side): boolean {
  const node = graph.nodes.get(key);
  return node !== undefined && node.turn === playerSide && Object.keys(node.edges).length > 0;
}

/** Positions atteignables depuis une position (elle comprise), chacune comptée une fois. */
export function reachableKeys(graph: ReviewGraph, startKey: PositionKey): Set<PositionKey> {
  const seen = new Set<PositionKey>();
  const stack = [startKey];

  while (stack.length > 0) {
    const key = stack.pop()!;
    if (seen.has(key)) continue;
    seen.add(key);
    const node = graph.nodes.get(key);
    if (node) stack.push(...Object.values(node.edges));
  }

  return seen;
}

/** Clés des fiches : positions où c'est au joueur de jouer, avec au moins un coup attendu. */
export function listCardKeys(graph: ReviewGraph, playerSide: Side): PositionKey[] {
  return [...graph.nodes.keys()].filter((key) => isCard(graph, key, playerSide));
}

/** Répartition des fiches du répertoire par statut (pour l'interface). */
export function summarizeCards(
  graph: ReviewGraph,
  playerSide: Side,
  stats: Record<PositionKey, PositionStats>,
  now: number,
): CardSummary {
  const summary: CardSummary = { total: 0, new: 0, due: 0, learning: 0, mastered: 0 };
  for (const key of listCardKeys(graph, playerSide)) {
    summary.total += 1;
    summary[classifyCard(stats[key], now)] += 1;
  }
  return summary;
}

/**
 * Probabilité de chaque réponse de l'ordinateur depuis une position.
 *
 * Poids d'une réponse = somme des urgences des fiches atteignables après elle ;
 * un plancher d'exploration en répartit une part uniformément, pour qu'aucune
 * branche ne soit jamais exclue.
 */
export function getMoveWeights(
  graph: ReviewGraph,
  node: { edges: Record<string, PositionKey> },
  ctx: SelectionContext,
): { san: string; probability: number }[] {
  const sans = Object.keys(node.edges);
  if (sans.length === 0) return [];

  const raw = sans.map((san) => {
    let sum = 0;
    for (const key of reachableKeys(graph, node.edges[san])) {
      if (isCard(graph, key, ctx.playerSide)) sum += urgency(ctx.stats[key], ctx.now);
    }
    return sum;
  });

  const total = raw.reduce((a, b) => a + b, 0);
  const floor = SRS_CONFIG.explorationFloor;

  return sans.map((san, i) => ({
    san,
    probability: total > 0 ? (1 - floor) * (raw[i] / total) + floor / sans.length : 1 / sans.length,
  }));
}

/** Tire une réponse de l'ordinateur selon ces probabilités (rng injectable pour les tests). */
export function pickWeightedMove(
  graph: ReviewGraph,
  node: { edges: Record<string, PositionKey> },
  ctx: SelectionContext,
  rng: () => number = Math.random,
): string | null {
  const weights = getMoveWeights(graph, node, ctx);
  if (weights.length === 0) return null;

  const target = rng();
  let cumulative = 0;
  for (const { san, probability } of weights) {
    cumulative += probability;
    if (target < cumulative) return san;
  }
  return weights[weights.length - 1].san;
}