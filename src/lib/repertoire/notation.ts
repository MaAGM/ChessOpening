import type { MoveSymbol } from "./types";

/** Libellé de chaque appréciation, pour les info-bulles et l'accessibilité. */
export const SYMBOL_LABELS: Record<MoveSymbol, string> = {
  "!": "Bon coup",
  "?": "Erreur",
  "!!": "Excellent coup",
  "??": "Gaffe",
  "!?": "Coup intéressant",
  "?!": "Coup douteux",
};

/** Numéro de coup (à partir de 1) d'un demi-coup (0 = premier coup des Blancs). */
export function moveNumber(ply: number): number {
  return Math.floor(ply / 2) + 1;
}

/**
 * Coup écrit comme dans une partie : « 5. Nf3 » (Blancs) ou « 5… a6 » (Noirs).
 * Pour un coup noir, le numéro n'est affiché que si `showBlackNumber` est vrai
 * (début de ligne, ou juste après une variante).
 */
export function formatMove(
  ply: number,
  san: string,
  symbol?: MoveSymbol,
  showBlackNumber = true,
): string {
  const number = moveNumber(ply);
  const prefix = ply % 2 === 0 ? `${number}. ` : showBlackNumber ? `${number}… ` : "";
  return `${prefix}${san}${symbol ?? ""}`;
}

/** Ligne écrite comme dans une partie, de la position initiale : « 1. e4 e5 2. Nf3 ». */
export function formatLine(sans: string[]): string {
  return sans.map((san, ply) => formatMove(ply, san, undefined, ply === 0)).join(" ");
}