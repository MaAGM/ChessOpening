"use client";

import { useChessGame } from "@/hooks/useChessGame";
import { useReviewManager } from "@/hooks/useReviewManager";
import { useTrainerMode } from "@/hooks/useTrainerMode";
import { useTutorialManager } from "@/hooks/useTutorialManager";
import type { Side } from "@/lib/review/reviewRepertoire";

import { OpeningName } from "@/components/chess/OpeningName";
import { ChessBoard } from "@/components/chess/ChessBoard";
import { TrainerSidebar } from "@/components/chess/TrainerSidebar";

const REVIEW_HINT_ARROW_COLOR = "#22c55e";

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
  } = useChessGame();

  // ----------------------------------------------------------------------
  // Navigation state (which screen the sidebar shows, review side)
  // ----------------------------------------------------------------------
  const { panelMode, setPanelMode, reviewSide, setReviewSide } = useTrainerMode();

  // ----------------------------------------------------------------------
  // One manager per mode – each one drives the board through the same callbacks
  // ----------------------------------------------------------------------
  const tutorial = useTutorialManager({
    currentFen,
    onPieceDrop,
    onSquareClick,
    loadPosition,
    resetGame,
    panelMode,
    setPanelMode,
  });

  const review = useReviewManager({
    currentFen,
    onPieceDrop,
    onSquareClick,
    resetGame,
    panelMode,
    reviewSide,
  });

  // ----------------------------------------------------------------------
  // Mode transitions shared by the sidebar
  // ----------------------------------------------------------------------
  const handleBackToMenu = () => {
    tutorial.handleBackToMenu(); // repasse en "menu" et remet l'échiquier à zéro
    review.resetSession();
    setReviewSide(null);
  };

  const handleStartReview = (side: Side) => {
    resetGame();
    review.resetSession();
    setReviewSide(side);
    setPanelMode("review_active");
  };

  // ----------------------------------------------------------------------
  // Board wiring: the active mode decides who handles moves, arrows, orientation
  // ----------------------------------------------------------------------
  const isReviewMode = panelMode === "review_active";
  const boardOrientation = isReviewMode && reviewSide ? reviewSide : tutorial.userColor;

  return (
    <main className="flex min-h-screen items-center justify-start gap-6 bg-slate-900 px-4 py-10 pl-16 text-slate-100">
      <div className="flex flex-col gap-4">
        {/* Opening title */}
        <OpeningName name={openingName} />

        {/* Chess board */}
        <section className="w-full max-w-137.5 border-2 border-[#D4AF37] bg-[#D4AF37]/10 p-2 shadow-2xl shadow-black/40">
          <ChessBoard
            position={currentFen}
            boardOrientation={boardOrientation}
            currentGame={currentGame}
            squareStyles={squareStyles}
            onPieceDrop={isReviewMode ? review.handlePieceDrop : tutorial.handlePieceDrop}
            onPieceDragBegin={onPieceDragBegin}
            onPieceDragEnd={onPieceDragEnd}
            onSquareClick={isReviewMode ? review.handleSquareClick : tutorial.handlePieceClick}
            onSquareRightClick={onSquareRightClick}
            customArrows={isReviewMode ? review.hintArrows : tutorial.activeNode?.arrows}
            arrowColor={isReviewMode ? REVIEW_HINT_ARROW_COLOR : undefined}
          />
        </section>
      </div>

      {/* Sidebar: menu, explorer, opening selector, learning UI, review UI */}
      <TrainerSidebar
        panelMode={panelMode}
        setPanelMode={setPanelMode}
        reviewSide={reviewSide}
        onStartReview={handleStartReview}
        review={review}
        activeNode={tutorial.activeNode}
        activeChapterId={tutorial.activeTutorialId}
        isChapterFinished={tutorial.isChapterFinished}
        nextChapter={tutorial.nextChapter}
        previousBranchPath={tutorial.previousBranchPath}
        handleBackToMenu={handleBackToMenu}
        handleRewindToBranch={tutorial.handleRewindToBranch}
        handleStartTutorial={tutorial.handleStartTutorial}
        handleNextChapter={tutorial.handleNextChapter}
        currentFen={currentFen}
        isWaitingForBranchChoice={tutorial.isWaitingForBranchChoice}
        branchChoices={tutorial.branchChoices}
        onPlayMove={tutorial.handleBranchChoice}
      />
    </main>
  );
}