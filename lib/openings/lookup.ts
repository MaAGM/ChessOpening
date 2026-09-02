import openingsData from "./openings.json";

// openings.json maps a bare piece-placement string (the first FEN field
// only - no side-to-move, castling rights, or en passant square) directly
// to an opening name, e.g.:
//   "rnbqkbnr/pppppppp/8/8/8/7N/PPPPPPPP/RNBQKB1R": "Amar Opening"
// This is coarser than a full position (it ignores castling rights and
// en passant), but that's actually fine for opening identification: two
// positions with the same piece placement almost always belong to the
// same opening line in practice, and this is the exact key format the
// dataset ships with.
const openingsByPlacement = openingsData as Record<string, string>;

function getPiecePlacement(fen: string): string {
  return fen.split(" ")[0];
}

/**
 * Returns the opening name for the given FEN, or null if the position
 * isn't in the local database (the game has left known theory, or this
 * exact placement isn't covered).
 *
 * Because the dataset contains one entry per known theoretical position -
 * from the very first move down to deep, specific lines - looking this up
 * on every ply naturally yields more and more specific names as the game
 * progresses through known theory (e.g. "King's Indian Defense" early on,
 * later "King's Indian Defense: Sämisch Variation, Bronstein Defense" once
 * enough moves have been played). There's no separate "refine" step needed:
 * refinement falls out of calling this again after every move.
 */
export function getOpeningName(fen: string): string | null {
  const placement = getPiecePlacement(fen);
  return openingsByPlacement[placement] ?? null;
}