"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAuth, useAuthSyncBootstrap } from "@/hooks/useAuth";
import { useChessGame } from "@/hooks/useChessGame";
import { useCoachChat } from "@/hooks/useCoachChat";
import { useEngineAnalysis } from "@/hooks/useEngineAnalysis";
import { useMasterExplorer } from "@/hooks/useMasterExplorer";
import { useRepertoireEditor } from "@/hooks/useRepertoireEditor";
import { useRepertoireStore } from "@/hooks/useRepertoireStore";
import { useReviewManager } from "@/hooks/useReviewManager";
import { useTrainerMode } from "@/hooks/useTrainerMode";
import { useTutorialManager } from "@/hooks/useTutorialManager";
import type { Side } from "@/lib/review/reviewRepertoire";
import { sanToSquares } from "@/lib/review/reviewGraph";
import { uciToSquares } from "@/lib/engine";
import { buildPositionSnapshot, suggestedQuestions } from "@/lib/coach/chatSnapshot";
import { getConvexClient } from "@/lib/convex/client";
import { createCoachChatBackend } from "@/lib/convex/coachRemote";
import {
  ENGINE_ARROW_COLOR,
  engineAllowed,
  resolveBoardController,
  shouldEnterExplorer,
} from "@/lib/trainer/boardController";

import { OpeningName } from "@/components/chess/OpeningName";
import { ChessBoard } from "@/components/chess/ChessBoard";
import { CoachChat, type CoachAccess } from "@/components/chess/CoachChat";
import { EngineLine } from "@/components/chess/EngineLine";
import { EvalBar } from "@/components/chess/EvalBar";
import { MasterExplorer } from "@/components/chess/MasterExplorer";
import { MoveList } from "@/components/chess/MoveList";
import { TrainerSidebar, type TrainerNavigation } from "@/components/chess/TrainerSidebar";
import { Button } from "@/components/ui/Button";
import { ExplorerWorkspace } from "@/components/layout/ExplorerWorkspace";
import { TrainerLayout } from "@/components/layout/TrainerLayout";

/** Flèche d'aperçu d'un coup survolé dans la base des maîtres. */
const PREVIEW_ARROW_COLOR = "#D4AF37";

export default function HomePage() {
  // Authentification Better Auth (Convex) + synchronisation cloud (sans effet en mode invité)
  useAuthSyncBootstrap();
  const { status: authStatus, configured: authConfigured, signInWithGoogle } = useAuth();

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
  const isExplorer = panelMode === "explorer";

  // ----------------------------------------------------------------------
  // Core board state (from the generic chess hook).
  // Les flèches ← → de l'historique sont coupées pendant l'entraînement : la
  // position affichée y pilote la partie, elle ne doit pas changer en cours de ligne.
  // ----------------------------------------------------------------------
  const {
    currentFen,
    currentGame,
    sanHistory,
    historyIndex,
    goToMove,
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
  // Analyse Stockfish locale (coupée pendant la révision et l'apprentissage)
  // ----------------------------------------------------------------------
  // ----------------------------------------------------------------------
  // Un coup joué depuis le menu (ou une option pas encore lancée) ouvre l'Exploration
  // ----------------------------------------------------------------------
  const previousPliesRef = useRef(sanHistory.length);
  useEffect(() => {
    const previous = previousPliesRef.current;
    previousPliesRef.current = sanHistory.length;
    if (shouldEnterExplorer(panelMode, previous, sanHistory.length)) setPanelMode("explorer");
  }, [sanHistory.length, panelMode, setPanelMode]);

  const engine = useEngineAnalysis(currentFen, engineAllowed(panelMode));
  const engineBestMove = engine.analysis?.bestMove ? uciToSquares(engine.analysis.bestMove) : null;

  // ----------------------------------------------------------------------
  // Mode Exploration : base des maîtres et Coach IA (chat, comptes connectés)
  // ----------------------------------------------------------------------
  const explorer = useMasterExplorer(currentFen, isExplorer);
  const explorerSummary = explorer.status === "ready" ? explorer.summary : null;
  const playedMoves = useMemo(() => sanHistory.slice(0, historyIndex), [sanHistory, historyIndex]);
  const displayedOpening = explorerSummary?.openingName ?? openingName;

  /** Orientation choisie avec « Retourner l'échiquier » (null : celle du tutoriel). */
  const [explorerFlip, setExplorerFlip] = useState<Side | null>(null);
  const explorerOrientation: Side = explorerFlip ?? tutorial.userColor;
  const flipExplorerBoard = () => setExplorerFlip(explorerOrientation === "white" ? "black" : "white");

  const coachAccess: CoachAccess = !authConfigured
    ? "unconfigured"
    : authStatus === "authenticated"
      ? "authenticated"
      : authStatus === "guest"
        ? "guest"
        : "loading";
  const coachBackend = useMemo(() => {
    const client = coachAccess === "authenticated" ? getConvexClient() : null;
    return client ? createCoachChatBackend(client) : null;
  }, [coachAccess]);
  const snapshot = useMemo(
    () =>
      buildPositionSnapshot({
        fen: currentFen,
        moves: playedMoves,
        openingName: displayedOpening,
        analysis: engine.analysis,
        explorer: explorerSummary,
        boardOrientation: explorerOrientation,
      }),
    [currentFen, playedMoves, displayedOpening, engine.analysis, explorerSummary, explorerOrientation],
  );
  const getSnapshot = useCallback(() => snapshot, [snapshot]);
  const coachChat = useCoachChat({ backend: coachBackend, getSnapshot });

  /** Coup de la base des maîtres survolé : aperçu en flèche sur l'échiquier. */
  const [previewSan, setPreviewSan] = useState<string | null>(null);
  const previewSquares = isExplorer && previewSan ? sanToSquares(currentFen, previewSan) : null;

  // ----------------------------------------------------------------------
  // Mode transitions shared by the sidebar
  // ----------------------------------------------------------------------
  const handleBackToMenu = () => {
    tutorial.handleBackToMenu(); // repasse en "menu" et remet l'échiquier à zéro
    review.resetSession();
    editor.resetSession();
    coachChat.reset();
    setPreviewSan(null);
    setExplorerFlip(null);
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

  const boardOrientation: Side = isExplorer ? explorerOrientation : board.orientation;

  const boardElement = (
    <ChessBoard
      position={currentFen}
      boardOrientation={boardOrientation}
      currentGame={currentGame}
      squareStyles={board.squareStyles}
      onPieceDrop={board.onPieceDrop}
      onPieceDragBegin={onPieceDragBegin}
      onPieceDragEnd={onPieceDragEnd}
      onSquareClick={board.onSquareClick}
      onSquareRightClick={onSquareRightClick}
      customArrows={previewSquares ? [[previewSquares.from, previewSquares.to]] : board.arrows}
      arrowColor={previewSquares ? PREVIEW_ARROW_COLOR : board.arrowColor}
      engineArrow={previewSquares ? null : board.engineArrow}
      engineArrowColor={ENGINE_ARROW_COLOR}
    />
  );

  const evalBar = board.showEngine ? (
    <EvalBar analysis={engine.analysis} status={engine.status} orientation={boardOrientation} />
  ) : undefined;

  if (isExplorer) {
    const playExplorerMove = (san: string) => {
      const squares = sanToSquares(currentFen, san);
      setPreviewSan(null);
      if (squares) board.onPieceDrop(squares.from, squares.to);
    };

    return (
      <ExplorerWorkspace
        back={
          <Button variant="secondary" onClick={handleBackToMenu} className="flex w-fit items-center gap-2">
            ← Menu
          </Button>
        }
        title={
          <div className="flex min-w-0 items-baseline gap-2">
            {explorerSummary?.eco && (
              <span className="rounded bg-[#D4AF37]/15 px-1.5 py-0.5 text-xs font-semibold text-[#D4AF37]">
                {explorerSummary.eco}
              </span>
            )}
            <h1 className="truncate text-lg font-semibold text-slate-100">
              {displayedOpening ?? "Exploration libre"}
            </h1>
          </div>
        }
        board={boardElement}
        evalBar={evalBar}
        onFlipBoard={flipExplorerBoard}
        moves={<MoveList sanHistory={sanHistory} historyIndex={historyIndex} onSelectMove={goToMove} />}
        engine={<EngineLine {...engine} fen={currentFen} ply={historyIndex} />}
        explorer={<MasterExplorer state={explorer} onPreviewMove={setPreviewSan} onPlayMove={playExplorerMove} />}
        coach={
          <CoachChat
            chat={coachChat}
            access={coachAccess}
            onSignIn={() => void signInWithGoogle()}
            suggestions={suggestedQuestions(snapshot)}
          />
        }
      />
    );
  }

  return (
    <TrainerLayout
      boardHeader={<OpeningName name={openingName} />}
      board={boardElement}
      boardAside={evalBar}
      panel={<TrainerSidebar navigation={navigation} tutorial={tutorial} review={review} editor={editor} />}
    />
  );
}
