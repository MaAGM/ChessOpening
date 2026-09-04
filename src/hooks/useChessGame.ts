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
  const [sanHistory, setSanHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [moveSquares, setMoveSquares] = useState<Record<string, CSSProperties>>({});
  const [optionSquares, setOptionSquares] = useState<Record<string, CSSProperties>>({});
  const [rightClickedSquares, setRightClickedSquares] = useState<Record<string, CSSProperties>>({});
  const [checkSquare, setCheckSquare] = useState<Record<string, CSSProperties>>({});
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [lastKnownOpening, setLastKnownOpening] = useState<string | null>(null);

  const currentFen = history[historyIndex];
  const currentGame = useMemo(() => new Chess(currentFen), [currentFen]);

  useEffect(() => {
    setCheckSquare(getCheckSquareStyles(new Chess(currentFen)));
  }, [currentFen]);

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
      nextHistory = history.slice(0, historyIndex + 1);
      nextSanHistory = sanHistory.slice(0, historyIndex);
      nextGame.load(history[historyIndex]);
    }

    let move;
    try {
      move = nextGame.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
    } catch {
      return false;
    }
    if (!move) return false;

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
    setMoveSquares({});
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
    if (!targetSquare) return false;
    return applyMove(sourceSquare as Square, targetSquare as Square);
  };

  const onPieceDragBegin = ({ square }: PieceHandlerArgs) => {
    if (!square) return;
    playSound("select");
    const clickedSquare = square as Square;
    const positionGame = new Chess(currentFen);
    setRightClickedSquares({});
    const piece = positionGame.get(clickedSquare);
    if (!piece || piece.color !== positionGame.turn()) return;
    setSelectedSquare(clickedSquare);
    setOptionSquares(getMoveOptions(clickedSquare, positionGame));
  };

  const onPieceDragEnd = () => {
    setOptionSquares({});
  };

  const onSquareRightClick = (square: string) => {
    setRightClickedSquares((prev) => {
      if (prev[square]) {
        const { [square]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [square]: { backgroundColor: "rgba(235, 97, 80, 0.8)" } };
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
      if (moved) return;
      return;
    }

    const piece = positionGame.get(clickedSquare);
    if (!piece || piece.color !== positionGame.turn()) return;
    playSound("select");
    const options = getMoveOptions(clickedSquare, positionGame);
    setSelectedSquare(clickedSquare);
    setOptionSquares(options);
  };

  const goToMove = (index: number) => {
    if (index < 0 || index > history.length - 1) return;
    setHistoryIndex(index);
    setSelectedSquare(null);
    setOptionSquares({});
    setRightClickedSquares({});
    setMoveSquares({});
  };

  const resetGame = () => {
    const freshGame = new Chess();
    setGame(freshGame);
    setHistory([initialFen]);
    setSanHistory([]);
    setHistoryIndex(0);
    setMoveSquares({});
    setOptionSquares({});
    setRightClickedSquares({});
    setCheckSquare({});
    setSelectedSquare(null);
    setLastKnownOpening(null);
  };

  const loadPosition = (fen: string) => {
    try {
      const tempGame = new Chess();
      tempGame.load(fen);
      setGame(tempGame);
      setHistory([tempGame.fen()]);
      setSanHistory([]);
      setHistoryIndex(0);
      setMoveSquares({});
      setOptionSquares({});
      setRightClickedSquares({});
      setCheckSquare({});
      setSelectedSquare(null);
    } catch (e) {
      console.error("Failed to load FEN:", fen, e);
    }
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
    resetGame,
    loadPosition,
  };
}