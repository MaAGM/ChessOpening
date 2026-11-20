import type { MustCover, TutorialNode } from "@/lib/data/openings/types";

/**
 * Couverture d'un cours ramifié : quelles fins de variante doivent être atteintes pour
 * que le cours soit « parcouru », et lesquelles l'ont déjà été pendant la session.
 *
 * Une fin de variante est identifiée par son chemin de coups (`pathKey`).
 */

export const pathKey = (path: readonly string[]): string => path.join(" ");

const childrenOf = (node: TutorialNode): [string, TutorialNode][] => Object.entries(node.children ?? {});

/** Chemins de toutes les fins de variante sous `node` (préfixées par `prefix`). */
function allLeaves(node: TutorialNode, prefix: string[]): string[][] {
  const children = childrenOf(node);
  if (children.length === 0) return [prefix];
  return children.flatMap(([san, child]) => allLeaves(child, [...prefix, san]));
}

/** Fins de variante obligatoires d'un cours. */
export function requiredLeafPaths(root: TutorialNode, mustCover: MustCover): string[][] {
  if (mustCover === "allBranches") return allLeaves(root, []).filter((path) => path.length > 0);

  // Ligne principale : premier coup à chaque bifurcation.
  const path: string[] = [];
  let next = childrenOf(root)[0];
  while (next) {
    path.push(next[0]);
    next = childrenOf(next[1])[0];
  }
  return path.length > 0 ? [path] : [];
}

export type Coverage = { explored: number; total: number; complete: boolean };

export function computeCoverage(
  root: TutorialNode,
  mustCover: MustCover,
  exploredLeaves: ReadonlySet<string>,
): Coverage {
  const required = requiredLeafPaths(root, mustCover).map(pathKey);
  const explored = required.filter((key) => exploredLeaves.has(key)).length;
  return { explored, total: required.length, complete: explored === required.length };
}

const startsWith = (path: readonly string[], prefix: readonly string[]) =>
  prefix.every((san, i) => path[i] === san);

/** Vrai s'il reste une fin de variante obligatoire non explorée sous ce préfixe. */
export function hasUnexploredBelow(
  root: TutorialNode,
  mustCover: MustCover,
  exploredLeaves: ReadonlySet<string>,
  prefix: readonly string[],
): boolean {
  return requiredLeafPaths(root, mustCover).some(
    (leaf) => startsWith(leaf, prefix) && !exploredLeaves.has(pathKey(leaf)),
  );
}

/**
 * Où revenir pour explorer une autre variante : le point le plus proche (en remontant
 * le chemin courant) d'où part encore une fin de variante obligatoire non explorée.
 * Null quand tout est exploré.
 */
export function findRewindPath(
  root: TutorialNode,
  mustCover: MustCover,
  exploredLeaves: ReadonlySet<string>,
  currentPath: readonly string[],
): string[] | null {
  for (let length = currentPath.length - 1; length >= 0; length -= 1) {
    const prefix = currentPath.slice(0, length);
    if (hasUnexploredBelow(root, mustCover, exploredLeaves, prefix)) return prefix;
  }
  return null;
}
