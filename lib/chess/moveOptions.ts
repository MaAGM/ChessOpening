import type { CSSProperties } from "react";
import type { Chess, Square } from "chess.js";

/**
 * Returns the squareStyles patch highlighting the selected square and all
 * of its legal destination squares (dot for quiet moves, ring for
 * captures). Pure function: takes the position to evaluate as a parameter
 * rather than reading component state.
 */
export function getMoveOptions(
  square: Square,
  positionGame: Chess
): Record<string, CSSProperties> {
  const moves = positionGame.moves({ square, verbose: true });
  if (moves.length === 0) {
    return {};
  }

  const squares: Record<string, CSSProperties> = {
    [square]: { backgroundColor: "rgba(20, 85, 30, 0.3)" },
  };

  moves.forEach((move) => {
    squares[move.to] = {
      background:
        move.captured
          ? "radial-gradient(transparent 0%, transparent 79%, rgba(0, 0, 0, 0.25) 80%)"
          : "radial-gradient(circle, rgba(0, 0, 0, 0.25) 25%, transparent 25%)",
    };
  });

  return squares;
}