"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
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

export default function Home() {
  // Keep the full chess game in state so we can always render from the latest FEN.
  const [game, setGame] = useState(() => new Chess());

  const onPieceDrop = (sourceSquare: string, targetSquare: string | null) => {
    if (!targetSquare) {
      return false;
    }

    // Work on a copy to keep state updates immutable.
    const nextGame = new Chess(game.fen());
    const move = nextGame.move({
      from: sourceSquare as Square,
      to: targetSquare as Square,
      promotion: "q",
    });

    if (!move) {
      return false;
    }

    console.log("Move (SAN):", move.san);
    console.log("Position (FEN):", nextGame.fen());

    setGame(nextGame);
    return true;
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
              position: game.fen(),
              boardStyle: { width: "100%", height: "auto" },
              pieces: customPieces,
              darkSquareStyle: { backgroundColor: '#769656' },
              lightSquareStyle: { backgroundColor: '#b4c89d' },
              onPieceDrop: ({ sourceSquare, targetSquare }) => onPieceDrop(sourceSquare, targetSquare),
            }}
          />
        </div>
      </section>
    </main>
  );
}
