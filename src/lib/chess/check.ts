import type { CSSProperties } from "react";
import { Chess } from "chess.js";

const BOARD_FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

/**
 * Returns the squareStyles patch that highlights the king currently in
 * check, or {} if nobody is in check. Pure function: no state, just reads
 * the given Chess instance's board.
 */
export function getCheckSquareStyles(fenGame: Chess): Record<string, CSSProperties> {
  if (!fenGame.inCheck()) {
    return {};
  }

  const turn = fenGame.turn();
  const board = fenGame.board();

  for (let rank = 0; rank < board.length; rank++) {
    for (let file = 0; file < board[rank].length; file++) {
      const piece = board[rank][file];
      if (piece && piece.type === "k" && piece.color === turn) {
        const kingSquare = `${BOARD_FILES[file]}${8 - rank}`;
        return {
          [kingSquare]: {
            background: "radial-gradient(transparent 0%, transparent 79%, rgba(220, 20, 60, 0.8) 80%)",
          },
        };
      }
    }
  }

  return {};
}