import type { Side } from "./types";

/**
 * Identité d'une position pour le répertoire : placement des pièces + trait +
 * droits de roque.
 *
 * On ignore volontairement :
 *  - les compteurs de demi-coups / de coups complets (ils dépendent du chemin) ;
 *  - la case en passant (sans effet sur un répertoire d'ouvertures).
 *
 * Deux ordres de coups qui mènent à la même position donnent donc la même clé.
 */
export type PositionKey = string;

export function toPositionKey(fen: string): PositionKey {
  const [placement, turn, castling] = fen.trim().split(/\s+/);
  return `${placement} ${turn} ${castling ?? "-"}`;
}

/** Camp au trait d'après une FEN. */
export function fenTurn(fen: string): Side {
  return fen.trim().split(/\s+/)[1] === "b" ? "black" : "white";
}

/**
 * FEN complète reconstruite à partir d'une clé de position (case en passant
 * absente, compteurs à 0 / 1). Sert à stocker une FEN lisible côté serveur.
 */
export function fenFromPositionKey(key: PositionKey): string {
  return `${key} - 0 1`;
}