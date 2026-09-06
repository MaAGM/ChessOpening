"use client";

import { useChessGame } from "@/hooks/useChessGame";
import { useTutorialManager } from "@/hooks/useTutorialManager";

import { OpeningName } from "@/components/chess/OpeningName";
import { ChessBoard } from "@/components/chess/ChessBoard";
import { TrainerSidebar } from "@/components/chess/TrainerSidebar";

export default function HomePage() {
  // ----------------------------------------------------------------------
  // Core board state (from the generic chess hook)
  // ----------------------------------------------------------------------
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
    resetGame,
    loadPosition,
    // boardOrientation is derived from the tutorial hook (userColor)
  } = useChessGame();

  // ----------------------------------------------------------------------
  // Tutorial‑specific logic – completely isolated from UI
  // ----------------------------------------------------------------------
  const tutorial = useTutorialManager({
    currentFen,
    onPieceDrop,
    onSquareClick,
    loadPosition,
    resetGame,
  });

  // ----------------------------------------------------------------------
  // Render the three‑column layout:
  //   - Opening title
  //   - Chess board
  //   - Trainer sidebar (menu / explorer / tutorial UI)
  // ----------------------------------------------------------------------
  return (
    <main className="flex min-h-screen items-center justify-start gap-6 bg-slate-900 px-4 py-10 pl-16 text-slate-100">
      <div className="flex flex-col gap-4">
        {/* Opening title */}
        <OpeningName name={openingName} />

        {/* Chess board */}
        <section className="w-full max-w-137.5 border-2 border-[#D4AF37] bg-[#D4AF37]/10 p-2 shadow-2xl shadow-black/40">
          <ChessBoard
            position={currentFen}
            boardOrientation={tutorial.userColor}
            currentGame={currentGame}
            squareStyles={squareStyles}
            onPieceDrop={tutorial.handlePieceDrop}
            onPieceDragBegin={onPieceDragBegin}
            onPieceDragEnd={onPieceDragEnd}
            onSquareClick={tutorial.handlePieceClick}
            onSquareRightClick={onSquareRightClick}
            customArrows={tutorial.activeNode?.arrows}
          />
        </section>
      </div>

      {/* Sidebar: menu, explorer, opening selector, learning UI */}
      <TrainerSidebar
        panelMode={tutorial.panelMode}
        setPanelMode={tutorial.setPanelMode}
        activeNode={tutorial.activeNode}
        isChapterFinished={tutorial.isChapterFinished}
        nextChapter={tutorial.nextChapter}
        previousBranchPath={tutorial.previousBranchPath}
        handleBackToMenu={tutorial.handleBackToMenu}
        handleRewindToBranch={tutorial.handleRewindToBranch}
        handleStartTutorial={tutorial.handleStartTutorial}
        handleNextChapter={tutorial.handleNextChapter}
        currentFen={currentFen}
      />
    </main>
  );
}