"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { Chess, Square } from "chess.js";
import { Chessboard } from "react-chessboard";
import type { PieceHandlerArgs } from "react-chessboard";

type PieceImageProps = {
  fill?: string;
  square?: string;
  svgStyle?: CSSProperties;
};

const renderCustomPiece =
  (piece: string) =>
  function PieceRenderer({ svgStyle }: PieceImageProps = {}) {
    return (
    <img
      src={`/pieces/${piece}.svg`}
      alt={`${piece} chess piece`}
      className="pointer-events-none h-full w-full select-none"
      style={svgStyle}
      draggable={false}
    />
    );
  };

const customPieces = {
  wP: renderCustomPiece("wP"),
  wN: renderCustomPiece("wN"),
  wB: renderCustomPiece("wB"),
  wR: renderCustomPiece("wR"),
  wQ: renderCustomPiece("wQ"),
  wK: renderCustomPiece("wK"),
  bP: renderCustomPiece("bP"),
  bN: renderCustomPiece("bN"),
  bB: renderCustomPiece("bB"),
  bR: renderCustomPiece("bR"),
  bQ: renderCustomPiece("bQ"),
  bK: renderCustomPiece("bK"),
};

const initialFen = new Chess().fen();
const BOARD_FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

export default function Home() {
  const [game, setGame] = useState(() => new Chess());
  const [history, setHistory] = useState<string[]>([initialFen]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [moveSquares, setMoveSquares] = useState<Record<string, CSSProperties>>({});
  const [optionSquares, setOptionSquares] = useState<Record<string, CSSProperties>>({});
  const [rightClickedSquares, setRightClickedSquares] = useState<Record<string, CSSProperties>>({});
  const [checkSquare, setCheckSquare] = useState<Record<string, CSSProperties>>({});
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [draggedSquare, setDraggedSquare] = useState<string | null>(null);
  const draggedSquareRef = useRef<string | null>(null);
  const currentFen = history[historyIndex];
  const currentGame = new Chess(currentFen);

  const restoreDraggedPiece = () => {
    draggedSquareRef.current = null;
    setDraggedSquare(null);
  };

  const updateCheckState = (fenGame: Chess) => {
    if (!fenGame.inCheck()) {
      setCheckSquare({});
      return;
    }

    const turn = fenGame.turn();
    const board = fenGame.board();

    for (let rank = 0; rank < board.length; rank++) {
      for (let file = 0; file < board[rank].length; file++) {
        const piece = board[rank][file];
        if (piece && piece.type === "k" && piece.color === turn) {
          const kingSquare = `${BOARD_FILES[file]}${8 - rank}`;
          setCheckSquare({
            [kingSquare]: {
              background: "radial-gradient(transparent 0%, transparent 79%, rgba(220, 20, 60, 0.8) 80%)",
            },
          });
          return;
        }
      }
    }

    setCheckSquare({});
  };

  // Keep the check highlight in sync with every move AND with history navigation.
  useEffect(() => {
    updateCheckState(new Chess(currentFen));
  }, [currentFen]);

  useEffect(() => {
    const onRelease = () => {
      if (!draggedSquareRef.current) {
        return;
      }
      restoreDraggedPiece();
    };

    window.addEventListener("pointerup", onRelease, true);
    window.addEventListener("pointercancel", onRelease, true);
    return () => {
      window.removeEventListener("pointerup", onRelease, true);
      window.removeEventListener("pointercancel", onRelease, true);
    };
  }, []);

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
    const nextGame = new Chess(game.fen());

    if (historyIndex < history.length - 1) {
      nextHistory = history.slice(0, historyIndex + 1);
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

    setGame(nextGame);
    setHistory(updatedHistory);
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
    restoreDraggedPiece();

    if (!targetSquare) {
      return false;
    }

    return applyMove(sourceSquare as Square, targetSquare as Square);
  };

  const getMoveOptions = (square: Square, positionGame: Chess) => {
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
  };

  const onPieceDragBegin = ({ square }: PieceHandlerArgs) => {
    if (!square) {
      return;
    }

    draggedSquareRef.current = square;
    setDraggedSquare(square);

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
    restoreDraggedPiece();
    setOptionSquares({});
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

    const options = getMoveOptions(clickedSquare, positionGame);
    setSelectedSquare(clickedSquare);
    setOptionSquares(options);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-slate-100">
      <section className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/40">
        <h1 className="mb-2 text-center text-2xl font-semibold">Chess Opening Starter</h1>
        <p className="mb-6 text-center text-sm text-slate-300">
          Drag and drop pieces to play legal moves. Open the browser console to see SAN and FEN logs.
        </p>

        <div className="mx-auto w-full max-w-[560px]">
          <div className="select-none">
          {draggedSquare ? (
            <style>{`
              #chess-opening-board-board [id*="-piece-"][id$="-${draggedSquare}"] {
                opacity: 0 !important;
              }
            `}</style>
          ) : null}
          <Chessboard
            options={{
              id: "chess-opening-board",
              position: history[historyIndex],
              boardStyle: { width: "100%", height: "auto" },
              pieces: customPieces,
              darkSquareStyle: { backgroundColor: '#769656' },
              lightSquareStyle: { backgroundColor: '#b4c89d' },
              draggingPieceGhostStyle: { opacity: 1 },
              canDragPiece: ({ piece }) => piece.pieceType[0] === currentGame.turn(),
              onPieceDrag: onPieceDragBegin,
              onPieceDragCancel: onPieceDragEnd,
              onPieceDrop: ({ sourceSquare, targetSquare }) => onPieceDrop(sourceSquare, targetSquare),
              onSquareClick: ({ square }) => onSquareClick(square),
              squareStyles: { ...rightClickedSquares, ...moveSquares, ...optionSquares, ...checkSquare },
            }}
          />
          </div>
        </div>
      </section>
    </main>
  );
}