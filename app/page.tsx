"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { Chess, Square } from "chess.js";
import { Chessboard } from "react-chessboard";

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

export default function Home() {
  const [game, setGame] = useState(() => new Chess());
  const [history, setHistory] = useState<string[]>([initialFen]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [moveSquares, setMoveSquares] = useState<Record<string, CSSProperties>>({});
  const [optionSquares, setOptionSquares] = useState<Record<string, CSSProperties>>({});
  const [rightClickedSquares, setRightClickedSquares] = useState<Record<string, CSSProperties>>({});
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const currentFen = history[historyIndex];
  const currentGame = new Chess(currentFen);

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

    const move = nextGame.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });

    if (!move) {
      return false;
    }

    console.log("Move (SAN):", move.san);
    console.log("Position (FEN):", nextGame.fen());

    const nextFen = nextGame.fen();
    const updatedHistory = [...nextHistory, nextFen];

    setGame(nextGame);
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
    setMoveSquares({
      [move.from]: { backgroundColor: "rgba(255, 255, 0, 0.7)" },
      [move.to]: { backgroundColor: "rgba(255, 255, 0, 0.7)" },
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

  const getMoveOptions = (square: Square, positionGame: Chess) => {
    const moves = positionGame.moves({ square, verbose: true });
    if (moves.length === 0) {
      return {};
    }

    const squares: Record<string, CSSProperties> = {
      [square]: { backgroundColor: "rgba(0, 0, 255, 0.5)" },
    };

    moves.forEach((move) => {
      squares[move.to] = {
        background:
          move.captured
            ? "radial-gradient(transparent 0%, transparent 79%, rgba(0,0,0,.1) 80%)"
            : "radial-gradient(circle, rgba(0,0,255,.2) 25%, transparent 25%)",
      };
    });

    return squares;
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
          <Chessboard
            options={{
              id: "chess-opening-board",
              position: history[historyIndex],
              boardStyle: { width: "100%", height: "auto" },
              pieces: customPieces,
              darkSquareStyle: { backgroundColor: '#769656' },
              lightSquareStyle: { backgroundColor: '#b4c89d' },
              canDragPiece: ({ piece }) => piece.pieceType[0] === currentGame.turn(),
              onPieceDrop: ({ sourceSquare, targetSquare }) => onPieceDrop(sourceSquare, targetSquare),
              onSquareClick: ({ square }) => onSquareClick(square),
              squareStyles: { ...rightClickedSquares, ...moveSquares, ...optionSquares },
            }}
          />
        </div>
      </section>
    </main>
  );
}
