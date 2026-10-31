/** Garde-fous : le localStorage du navigateur est limité (environ 5 Mo). */
export const REPERTOIRE_LIMITS = {
  maxNodes: 5000,
  maxDepth: 500,
  maxNameLength: 80,
  maxCategoryLength: 60,
  maxCommentLength: 2000,
  maxPgnBytes: 2 * 1024 * 1024,
} as const;
