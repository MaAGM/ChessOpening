"use client";

import { useChessGame } from "@/hooks/useChessGame";
import { ChessBoard } from "@/components/chess/ChessBoard"
import { OpeningName } from "@/components/chess/OpeningName";
import { MoveList } from "@/components/chess/MoveList";

export default function Home() {
  const {
    currentFen,
    currentGame,
    sanHistory,
    historyIndex,
    openingName,
    squareStyles,
    onPieceDrop,
    onPieceDragBegin,
    onPieceDragEnd,
    onSquareClick,
    goToMove,
  } = useChessGame();

  return (
    <main className="flex min-h-screen items-center justify-start gap-6 bg-slate-900 px-4 py-10 pl-16 text-slate-100">
      <div className="flex flex-col gap-4">
        <OpeningName name={openingName} />

        <section className="w-full max-w-137.5 border-2 border-[#D4AF37] bg-[#D4AF37]/10 p-2 shadow-2xl shadow-black/40">
          <ChessBoard
            position={currentFen}
            currentGame={currentGame}
            squareStyles={squareStyles}
            onPieceDrop={onPieceDrop}
            onPieceDragBegin={onPieceDragBegin}
            onPieceDragEnd={onPieceDragEnd}
            onSquareClick={onSquareClick}
          />
        </section>
      </div>

      <aside className="flex h-137.5 w-64 flex-col gap-2 rounded-lg border border-slate-700 bg-slate-800/60 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Moves
        </h2>
        <MoveList sanHistory={sanHistory} historyIndex={historyIndex} onSelectMove={goToMove} />
      </aside>
    </main>
  );
}