import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { Chess, Square } from "chess.js";
import type { PieceHandlerArgs } from "react-chessboard";
import { playSound } from "@/lib/chess/sounds";
import { getCheckSquareStyles } from "@/lib/chess/check";
import { getMoveOptions } from "@/lib/chess/moveOptions";
import { getOpeningName } from "@/lib/openings/lookup";

const initialFen = new Chess().fen();

export function useChessGame() {
  const [game, setGame] = useState(() => new Chess());
  const [history, setHistory] = useState<string[]>([initialFen]);
  // sanHistory[i] is the SAN of the move that took history[i] -> history[i+1].
  // Always one shorter than history. Kept in lockstep on every mutation
  // (push, truncate-then-push, and reset) so historyIndex can index both.
  const [sanHistory, setSanHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [moveSquares, setMoveSquares] = useState<Record<string, CSSProperties>>({});
  const [optionSquares, setOptionSquares] = useState<Record<string, CSSProperties>>({});
  const [rightClickedSquares, setRightClickedSquares] = useState<Record<string, CSSProperties>>({});
  const [checkSquare, setCheckSquare] = useState<Record<string, CSSProperties>>({});
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);

  // Sticky opening name: re-derived from the local database on every move.
  // Because the dataset has an entry per known theoretical position (not
  // just top-level openings), this naturally becomes more specific as play
  // continues through known theory - e.g. "King's Indian Defense" early on,
  // then "King's Indian Defense: Sämisch Variation" a few moves later. It
  // only "stops updating" once the game leaves the database entirely, at
  // which point the last (most specific) match found stays displayed
  // rather than disappearing.
  const [lastKnownOpening, setLastKnownOpening] = useState<string | null>(null);

  const currentFen = history[historyIndex];
  const currentGame = useMemo(() => new Chess(currentFen), [currentFen]);

  // Keep the check highlight in sync with every move AND with history navigation.
  useEffect(() => {
    setCheckSquare(getCheckSquareStyles(new Chess(currentFen)));
  }, [currentFen]);

  // Opening detection: re-evaluate on every position change. If the current
  // position matches a known opening, update the sticky label (this is what
  // lets the name become more specific move after move). If it doesn't
  // match but we're at the very start (index 0), reset to null so a fresh
  // game doesn't inherit a stale label from a previous session.
  useEffect(() => {
    const name = getOpeningName(currentFen);
    if (name) {
      setLastKnownOpening(name);
    } else if (historyIndex === 0) {
      setLastKnownOpening(null);
    }
  }, [currentFen, historyIndex]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setHistoryIndex((prev) => (prev > 0 ? prev - 1 : prev));
        return;
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        setHistoryIndex((prev) => (prev < history.length - 1 ? prev + 1 : prev));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [history.length]);

  const applyMove = (sourceSquare: Square, targetSquare: Square) => {
    let nextHistory = history;
    let nextSanHistory = sanHistory;
    const nextGame = new Chess(game.fen());

    if (historyIndex < history.length - 1) {
      // We're browsing a past position; playing a move here discards the
      // "future" branch, same as any standard PGN viewer / trainer.
      nextHistory = history.slice(0, historyIndex + 1);
      nextSanHistory = sanHistory.slice(0, historyIndex);
      nextGame.load(history[historyIndex]);
    }

    let move;
    try {
      move = nextGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });
    } catch {
      return false;
    }

    if (!move) {
      return false;
    }

    const nextFen = nextGame.fen();
    const updatedHistory = [...nextHistory, nextFen];
    const updatedSanHistory = [...nextSanHistory, move.san];

    if (nextGame.isCheckmate() || nextGame.isGameOver()) {
      playSound("checkmate");
    } else if (nextGame.inCheck()) {
      playSound("check");
    } else if (move.captured || move.flags.includes("c") || move.flags.includes("e")) {
      playSound("capture");
    } else if (move.flags.includes("k") || move.flags.includes("q")) {
      playSound("castle");
    } else {
      playSound("move");
    }

    setGame(nextGame);
    setHistory(updatedHistory);
    setSanHistory(updatedSanHistory);
    setHistoryIndex(updatedHistory.length - 1);
    setMoveSquares({
      [move.from]: { backgroundColor: "rgba(245, 236, 142, 0.6)" },
      [move.to]: { backgroundColor: "rgba(245, 236, 142, 0.6)" },
    });
    setOptionSquares({});
    setRightClickedSquares({});
    setSelectedSquare(null);

    return true;
  };

  const onPieceDrop = (sourceSquare: string, targetSquare: string | null) => {
    setSelectedSquare(null);
    setOptionSquares({});

    if (!targetSquare) {
      return false;
    }

    return applyMove(sourceSquare as Square, targetSquare as Square);
  };

  const onPieceDragBegin = ({ square }: PieceHandlerArgs) => {
    if (!square) {
      return;
    }

    playSound("select");

    const clickedSquare = square as Square;
    const positionGame = new Chess(currentFen);
    setRightClickedSquares({});

    const piece = positionGame.get(clickedSquare);
    if (!piece || piece.color !== positionGame.turn()) {
      return;
    }

    setSelectedSquare(clickedSquare);
    setOptionSquares(getMoveOptions(clickedSquare, positionGame));
  };

  const onPieceDragEnd = () => {
    setOptionSquares({});
  };

  // Right-click toggles a red highlight on a square, chess.com-style.
  // Clicking an already-highlighted square removes it; clicking a new one
  // adds it. Multiple squares can be highlighted at once. These highlights
  // are cleared whenever a move is played or a left-click interaction
  // starts (see the setRightClickedSquares({}) calls in applyMove,
  // onPieceDragBegin, and onSquareClick below).
  const onSquareRightClick = (square: string) => {
    setRightClickedSquares((prev) => {
      if (prev[square]) {
        const { [square]: _removed, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [square]: { backgroundColor: "rgba(235, 97, 80, 0.8)" },
      };
    });
  };

  const onSquareClick = (square: string) => {
    const clickedSquare = square as Square;
    const positionGame = new Chess(currentFen);
    setRightClickedSquares({});

    if (selectedSquare) {
      if (clickedSquare === selectedSquare) {
        setSelectedSquare(null);
        setOptionSquares({});
        return;
      }

      const clickedPiece = positionGame.get(clickedSquare);
      if (clickedPiece && clickedPiece.color === positionGame.turn()) {
        playSound("select");
        setSelectedSquare(clickedSquare);
        setOptionSquares(getMoveOptions(clickedSquare, positionGame));
        return;
      }

      const moved = applyMove(selectedSquare, clickedSquare);
      if (moved) {
        return;
      }

      return;
    }

    const piece = positionGame.get(clickedSquare);
    if (!piece || piece.color !== positionGame.turn()) {
      return;
    }

    playSound("select");
    const options = getMoveOptions(clickedSquare, positionGame);
    setSelectedSquare(clickedSquare);
    setOptionSquares(options);
  };

  // Jump directly to a given ply (0 = starting position, 1 = after move 1, ...).
  // Used by the MoveList sidebar so clicking a move navigates the board.
  const goToMove = (index: number) => {
    if (index < 0 || index > history.length - 1) {
      return;
    }
    setHistoryIndex(index);
    setSelectedSquare(null);
    setOptionSquares({});
    setRightClickedSquares({});
  };

  return {
    currentFen,
    currentGame,
    history,
    sanHistory,
    historyIndex,
    openingName: lastKnownOpening,
    squareStyles: {
      ...rightClickedSquares,
      ...moveSquares,
      ...optionSquares,
      ...checkSquare,
    },
    onPieceDrop,
    onPieceDragBegin,
    onPieceDragEnd,
    onSquareClick,
    onSquareRightClick,
    goToMove,
  };
}