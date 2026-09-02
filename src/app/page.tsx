"use client";

import { useState } from "react";
import { useChessGame } from "@/hooks/useChessGame";
import { ChessBoard } from "@/components/chess/ChessBoard";
import { OpeningName } from "@/components/chess/OpeningName";
import { MasterExplorer } from "@/components/chess/MasterExplorer";

export default function Home() {
  const {
    currentFen,
    currentGame,
    openingName,
    squareStyles,
    onPieceDrop,
    onPieceDragBegin,
    onPieceDragEnd,
    onSquareClick,
    onSquareRightClick,
  } = useChessGame();
  const [panelMode, setPanelMode] = useState<"menu" | "explorer">("menu");

  const handlePieceDrop = (sourceSquare: string, targetSquare: string | null) => {
    if (panelMode === "menu") {
      setPanelMode("explorer");
    }

    return onPieceDrop(sourceSquare, targetSquare);
  };

  return (
    <main className="flex min-h-screen items-center justify-start gap-6 bg-slate-900 px-4 py-10 pl-16 text-slate-100">
      <div className="flex flex-col gap-4">
        <OpeningName name={openingName} />

        <section className="w-full max-w-137.5 border-2 border-[#D4AF37] bg-[#D4AF37]/10 p-2 shadow-2xl shadow-black/40">
          <ChessBoard
            position={currentFen}
            currentGame={currentGame}
            squareStyles={squareStyles}
            onPieceDrop={handlePieceDrop}
            onPieceDragBegin={onPieceDragBegin}
            onPieceDragEnd={onPieceDragEnd}
            onSquareClick={onSquareClick}
            onSquareRightClick={onSquareRightClick}
          />
        </section>
      </div>

      <aside className="flex h-137.5 w-80 flex-col rounded-lg border border-slate-700 bg-slate-800/60 p-4">
        {panelMode === "menu" ? (
          <div className="flex h-full flex-col justify-center gap-4">
            <h2 className="text-center text-sm font-semibold uppercase tracking-wide text-slate-300">
              Chess Opening Trainer
            </h2>
            <button
              type="button"
              className="rounded-xl border border-emerald-400/40 bg-emerald-500/20 px-4 py-3 text-left font-semibold text-emerald-100 transition hover:bg-emerald-500/35 hover:text-white"
              onClick={() => setPanelMode("explorer")}
            >
              Apprendre une ouverture
            </button>
            <button
              type="button"
              className="rounded-xl border border-blue-400/40 bg-blue-500/20 px-4 py-3 text-left font-semibold text-blue-100 transition hover:bg-blue-500/35 hover:text-white"
              onClick={() => setPanelMode("explorer")}
            >
              Mettre à jour son répertoire
            </button>
            <button
              type="button"
              className="rounded-xl border border-amber-400/40 bg-amber-500/20 px-4 py-3 text-left font-semibold text-amber-100 transition hover:bg-amber-500/35 hover:text-white"
              onClick={() => setPanelMode("explorer")}
            >
              Réviser les ouvertures
            </button>
          </div>
        ) : (
          <MasterExplorer currentFen={currentFen} />
        )}
      </aside>
    </main>
  );
}