import ecoData from "./eco.json";

export type OpeningEntry = {
  eco: string;
  name: string;
};

/**
 * Normalizes a full FEN string down to its first 4 fields
 * (piece placement, active color, castling rights, en passant square).
 * The halfmove clock and fullmove number are stripped because they do not
 * affect which opening a position belongs to, and including them would make
 * every lookup miss after the first couple of moves.
 */
function normalizeFen(fen: string): string {
  return fen.split(" ").slice(0, 4).join(" ");
}

// Built once at module load time; reused for every lookup for the lifetime
// of the app. Keying by normalized FEN gives O(1) lookups instead of
// scanning an array of {fen, name} pairs on every move.
const openingMap: Map<string, OpeningEntry> = new Map(
  Object.entries(ecoData as Record<string, OpeningEntry>)
);

/**
 * Returns the opening entry (ECO code + name) matching the given FEN,
 * or null if the position isn't in the local database (i.e. the game
 * has left known opening theory, or the dataset doesn't cover it yet).
 */
export function getOpening(fen: string): OpeningEntry | null {
  const key = normalizeFen(fen);
  return openingMap.get(key) ?? null;
}

/**
 * Convenience wrapper returning just the display name, or null.
 */
export function getOpeningName(fen: string): string | null {
  return getOpening(fen)?.name ?? null;
}