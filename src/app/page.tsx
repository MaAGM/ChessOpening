"use client";

import { useAuthSyncBootstrap } from "@/hooks/useAuth";
import { useChessGame } from "@/hooks/useChessGame";
import { useEngineAnalysis } from "@/hooks/useEngineAnalysis";
import { useRepertoireEditor } from "@/hooks/useRepertoireEditor";
import { useRepertoireStore } from "@/hooks/useRepertoireStore";
import { useReviewManager } from "@/hooks/useReviewManager";
import { useTrainerMode } from "@/hooks/useTrainerMode";
import { useTutorialManager } from "@/hooks/useTutorialManager";
import type { Side } from "@/lib/review/reviewRepertoire";
import { uciToSquares } from "@/lib/engine";
import { ENGINE_ARROW_COLOR, engineAllowed, resolveBoardController } from "@/lib/trainer/boardController";

import { OpeningName } from "@/components/chess/OpeningName";
import { ChessBoard } from "@/components/chess/ChessBoard";
import { EvalBar } from "@/components/chess/EvalBar";
import { TrainerSidebar, type TrainerNavigation } from "@/components/chess/TrainerSidebar";
import { TrainerLayout } from "@/components/layout/TrainerLayout";

export default function HomePage() {
  // Authentification Better Auth (Convex) + synchronisation cloud (sans effet en mode invité)
  useAuthSyncBootstrap();

  // ----------------------------------------------------------------------
  // Navigation state (which screen the sidebar shows, review side)
  // ----------------------------------------------------------------------
  const {
    panelMode,
    setPanelMode,
    reviewSide,
    setReviewSide,
    editingRepertoireId,
    setEditingRepertoireId,
  } = useTrainerMode();
  const { getRepertoire } = useRepertoireStore();

  // ----------------------------------------------------------------------
  // Core board state (from the generic chess hook).
  // Les flèches ← → de l'historique sont coupées pendant l'entraînement : la
  // position affichée y pilote la partie, elle ne doit pas changer en cours de ligne.
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
    clearSelection,
    resetGame,
    loadPosition,
  } = useChessGame({
    navigationEnabled: panelMode !== "review_active" && panelMode !== "repertoire_editor",
  });

  // ----------------------------------------------------------------------
  // One manager per mode – each one drives the board through the same callbacks
  // ----------------------------------------------------------------------
  const tutorial = useTutorialManager({
    currentFen,
    onPieceDrop,
    onSquareClick,
    loadPosition,
    resetGame,
    clearSelection,
    panelMode,
    setPanelMode,
  });

  const review = useReviewManager({
    currentFen,
    onPieceDrop,
    onSquareClick,
    resetGame,
    clearSelection,
    panelMode,
    reviewSide,
  });

  const editor = useRepertoireEditor({
    repertoireId: editingRepertoireId,
    panelMode,
    currentFen,
    onPieceDrop,
    onSquareClick,
    loadPosition,
    clearSelection,
  });

  // ----------------------------------------------------------------------
  // Mode transitions shared by the sidebar
  // ----------------------------------------------------------------------
  const handleBackToMenu = () => {
    tutorial.handleBackToMenu(); // repasse en "menu" et remet l'échiquier à zéro
    review.resetSession();
    editor.resetSession();
    setReviewSide(null);
    setEditingRepertoireId(null);
  };

  const handleStartReview = (side: Side) => {
    resetGame();
    review.resetSession();
    setReviewSide(side);
    setPanelMode("review_active");
  };

  const handleOpenRepertoire = (id: string) => {
    resetGame();
    editor.resetSession();
    setEditingRepertoireId(id);
    setPanelMode("repertoire_editor");
  };

  const handleCloseRepertoire = () => {
    resetGame();
    editor.resetSession();
    setEditingRepertoireId(null);
    setPanelMode("repertoire_list");
  };

  const navigation: TrainerNavigation = {
    panelMode,
    setPanelMode,
    reviewSide,
    onBackToMenu: handleBackToMenu,
    onStartReview: handleStartReview,
    onOpenRepertoire: handleOpenRepertoire,
    onCloseRepertoire: handleCloseRepertoire,
  };

  // ----------------------------------------------------------------------
  // Board wiring: l'écran actif décide qui reçoit les coups, les flèches, l'orientation
  // ----------------------------------------------------------------------
  // Analyse Stockfish locale (coupée pendant la révision et l'apprentissage)
  const engine = useEngineAnalysis(currentFen, engineAllowed(panelMode));
  const engineBestMove = engine.analysis?.bestMove ? uciToSquares(engine.analysis.bestMove) : null;

  const editingRepertoire =
    panelMode === "repertoire_editor" && editingRepertoireId
      ? getRepertoire(editingRepertoireId)
      : null;

  const board = resolveBoardController({
    panelMode,
    baseSquareStyles: squareStyles,
    editor: {
      handlePieceDrop: editor.handlePieceDrop,
      handleSquareClick: editor.handleSquareClick,
      lastMoveSquares: editor.lastMoveSquares,
      currentNode: editor.currentNode,
      side: editingRepertoire?.side ?? null,
    },
    review: {
      handlePieceDrop: review.handlePieceDrop,
      handleSquareClick: review.handleSquareClick,
      errorSquares: review.errorSquares,
      hintArrows: review.hintArrows,
      side: reviewSide,
    },
    tutorial: {
      handlePieceDrop: tutorial.handlePieceDrop,
      handleSquareClick: tutorial.handlePieceClick,
      activeNode: tutorial.activeNode,
      userColor: tutorial.userColor,
    },
    engineBestMove,
  });

  return (
    <TrainerLayout
      boardHeader={<OpeningName name={openingName} />}
      board={
        <ChessBoard
          position={currentFen}
          boardOrientation={board.orientation}
          currentGame={currentGame}
          squareStyles={board.squareStyles}
          onPieceDrop={board.onPieceDrop}
          onPieceDragBegin={onPieceDragBegin}
          onPieceDragEnd={onPieceDragEnd}
          onSquareClick={board.onSquareClick}
          onSquareRightClick={onSquareRightClick}
          customArrows={board.arrows}
          arrowColor={board.arrowColor}
          engineArrow={board.engineArrow}
          engineArrowColor={ENGINE_ARROW_COLOR}
        />
      }
      boardAside={
        board.showEngine ? (
          <EvalBar analysis={engine.analysis} status={engine.status} orientation={board.orientation} />
        ) : undefined
      }
      panel={
        <TrainerSidebar
          navigation={navigation}
          tutorial={tutorial}
          review={review}
          editor={editor}
          currentFen={currentFen}
        />
      }
      // coach : futur panneau Coach IA
    />
  );
}
