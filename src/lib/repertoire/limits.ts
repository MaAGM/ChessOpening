/** Garde-fous : le localStorage du navigateur est limité (environ 5 Mo). */
export const REPERTOIRE_LIMITS = {
  maxNodes: 5000,
  maxDepth: 500,
  maxNameLength: 80,
  maxCategoryLength: 60,
  maxCommentLength: 2000,
  maxPgnBytes: 2 * 1024 * 1024,
} as const;

export type LimitStatus = "ok" | "near" | "full";

/** Où en est-on par rapport à une limite : confortable, proche (90 % par défaut) ou atteinte. */
export function getLimitStatus(count: number, max: number, nearRatio = 0.9): LimitStatus {
  if (count >= max) return "full";
  return count >= max * nearRatio ? "near" : "ok";
}