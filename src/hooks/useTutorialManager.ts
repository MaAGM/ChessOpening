"use client";

import { useEffect, useMemo, useState } from "react";
import { Chess } from "chess.js";

import { useRepertoire } from "@/hooks/useRepertoire";
import type { TutorialNode } from "@/lib/data/openings";
import {
  findNodeByMoveSequence,
  computeFenForPath,
  getAllChapters,
  openingCourses,
} from "@/lib/data/openings";

export type TutorialManagerParams = {
  /** Current board position in FEN */
  currentFen: string;
  /** Hook from useChessGame – executes a move */
  onPieceDrop: (source: string, target: string | null) => boolean;
  /** Hook from useChessGame – informs the board about a clicked square */
  onSquareClick: (square: string) => void;
  /** Load a FEN string into the board */
  loadPosition: (fen: string) => void;
  /** Reset the whole game (used when leaving a tutorial) */
  resetGame: () => void;
};

/**
 * Set of opening IDs that are traditionally played from the **black** side.
 * Used to infer the player colour for a given course.
 */
const BLACK_DEFENSE_COURSE_IDS = new Set([
  "sicilian",
  "french",
  "caro_kann",
  "pirc",
  "alekhine",
  "scandinavian",
  "dutch",
  "nimzo",
  "kings_indian",
  "grunfeld",
  "slav",
  "benoni",
]);

/** Infer the colour the user should play for a given course. */
function getUserColorForCourse(
  courseId?: string | null,
): "white" | "black" {
  if (!courseId) return "white";
  return BLACK_DEFENSE_COURSE_IDS.has(courseId) ? "black" : "white";
}

/**
 * Returns the most recent path where the tutorial branch diverged
 * (i.e. a node with > 1 child) so the UI can offer a “rewind” button.
 */
function getPreviousBranchPath(
  rootNode: TutorialNode,
  currentPath: string[],
): string[] | null {
  let node: TutorialNode | undefined = rootNode;
  let previousBranchPath: string[] | null =
    Object.keys(rootNode.children ?? {}).length > 1 ? [] : null;

  for (let i = 0; i < currentPath.length; i += 1) {
    if (!node?.children) break;
    node = node.children[currentPath[i]];
    if (!node) break;

    if (Object.keys(node.children ?? {}).length > 1) {
      previousBranchPath = currentPath.slice(0, i + 1);
    }
  }

  return previousBranchPath;
}

/**
 * All tutorial‑related state and behaviour lives inside this hook.
 * The component that consumes it (the page + the sidebar) stays
 * focused on layout and presentation.
 */
export function useTutorialManager(params: TutorialManagerParams) {
  const { currentFen, onPieceDrop, onSquareClick, loadPosition, resetGame } =
    params;

  const { addSavedMove } = useRepertoire();

  // ----------------------------------------------------------------------
  // UI state that belongs to the tutorial subsystem
  // ----------------------------------------------------------------------
  const [panelMode, setPanelMode] = useState<
    "menu" | "explorer" | "opening_selector" | "learning_active"
  >("menu");
  const [activeTutorialId, setActiveTutorialId] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [moveFrom, setMoveFrom] = useState<string | null>(null);

  // ----------------------------------------------------------------------
  // Derived data
  // ----------------------------------------------------------------------
  const activeCourse = useMemo(
    () =>
      openingCourses.find((c) =>
        c.chapters.some((ch) => ch.id === activeTutorialId),
      ) ?? null,
    [activeTutorialId],
  );

  const userColor = getUserColorForCourse(activeCourse?.id);

  const activeTutorial = getAllChapters().find(
    (c) => c.id === activeTutorialId,
  );

  const activeNode: TutorialNode | null = useMemo(() => {
    if (!activeTutorial) return null;
    return currentPath.length === 0
      ? activeTutorial.root
      : findNodeByMoveSequence(activeTutorial.root, currentPath) ?? null;
  }, [activeTutorial, currentPath]);

  const previousBranchPath = useMemo(() => {
    if (!activeTutorial) return null;
    return getPreviousBranchPath(activeTutorial.root, currentPath);
  }, [activeTutorial, currentPath]);

  const isChapterFinished =
  activeNode ? Object.keys(activeNode.children ?? {}).length === 0 : false;

  const currentChapterIndex = activeCourse?.chapters.findIndex(
    (c) => c.id === activeTutorialId,
  );
  const nextChapter =
    activeCourse &&
    typeof currentChapterIndex === "number" &&
    currentChapterIndex !== -1 &&
    currentChapterIndex < activeCourse.chapters.length - 1
      ? activeCourse.chapters[currentChapterIndex + 1]
      : null;

  // ----------------------------------------------------------------------
  // Interaction handlers (piece drop, click, navigation)
  // ----------------------------------------------------------------------
  const handlePieceDrop = (sourceSquare: string, targetSquare: string | null) => {
    // Switch from the menu to the explorer automatically
    if (panelMode === "menu") {
      setPanelMode("explorer");
    }

    // If we are currently in tutorial mode, enforce the tutorial tree
    if (panelMode === "learning_active" && activeNode) {
      if (!targetSquare) return false;

      const sideToMove = currentPath.length % 2 === 0 ? "white" : "black";
      if (sideToMove !== userColor) return false;

      const previewGame = new Chess(currentFen);
      let previewMove;
      try {
        previewMove = previewGame.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: "q",
        });
      } catch {
        return false;
      }
      if (!previewMove) return false;

      const allowedMoves = Object.keys(activeNode.children ?? {});
      if (!allowedMoves.includes(previewMove.san)) return false;

      const moved = onPieceDrop(sourceSquare, targetSquare);
      if (moved) {
        setCurrentPath((p) => [...p, previewMove!.san]);
        setMoveFrom(null);
      }
      return moved;
    }

    // Normal (non‑tutorial) handling
    const moved = onPieceDrop(sourceSquare, targetSquare);
    if (moved) setMoveFrom(null);
    return moved;
  };

  const handleSquareClick = (square: string) => {
    if (panelMode === "learning_active" && activeNode) {
      const sideToMove = currentPath.length % 2 === 0 ? "white" : "black";
      if (sideToMove !== userColor) return;

      // 1️⃣ First click – just highlight possible moves
      if (!moveFrom) {
        setMoveFrom(square);
        onSquareClick(square);
        return;
      }

      // 2️⃣ Click same square – cancel selection
      if (moveFrom === square) {
        setMoveFrom(null);
        onSquareClick(square);
        return;
      }

      // 3️⃣ Attempt the move
      const previewGame = new Chess(currentFen);
      let previewMove;
      try {
        previewMove = previewGame.move({
          from: moveFrom,
          to: square,
          promotion: "q",
        });
      } catch {
        // Invalid chess move – reset selection to the new square
        setMoveFrom(square);
        onSquareClick(square);
        return;
      }

      const allowedMoves = Object.keys(activeNode.children ?? {});
      if (previewMove && allowedMoves.includes(previewMove.san)) {
        // Correct move – let the board apply it
        onSquareClick(square);
        setCurrentPath((p) => [...p, previewMove!.san]);
        setMoveFrom(null);
      } else {
        // Wrong move – refuse and clear the highlights
        onSquareClick(moveFrom);
        setMoveFrom(null);
      }
    } else {
      // Outside tutorial – pure board interaction
      onSquareClick(square);
    }
  };

  const handleStartTutorial = (id: string) => {
    const tutorial = getAllChapters().find((c) => c.id === id);
    if (!tutorial) return;

    setActiveTutorialId(id);
    setCurrentPath([]);
    setMoveFrom(null);
    setPanelMode("learning_active");

    try {
      const fen = computeFenForPath([]);
      loadPosition(fen);
    } catch {
      loadPosition(new Chess().fen());
    }
  };

  const handleNextChapter = () => {
    if (nextChapter) {
      handleStartTutorial(nextChapter.id);
    }
  };

  const handleBackToMenu = () => {
    setPanelMode("menu");
    setActiveTutorialId(null);
    setCurrentPath([]);
    setMoveFrom(null);
    resetGame();
  };

  const handleRewindToBranch = () => {
    if (!activeTutorial) return;
    const branchPath = getPreviousBranchPath(activeTutorial.root, currentPath);
    if (!branchPath) return;

    setCurrentPath(branchPath);
    setMoveFrom(null);
    try {
      const fen = computeFenForPath(branchPath);
      loadPosition(fen);
    } catch {
      loadPosition(new Chess().fen());
    }
  };

  // ----------------------------------------------------------------------
  // Computer‑side automatic move (when it’s the opponent’s turn)
  // ----------------------------------------------------------------------
  useEffect(() => {
    if (panelMode !== "learning_active" || !activeNode) return;

    const sideToMove = currentPath.length % 2 === 0 ? "white" : "black";
    const computerColor = userColor === "white" ? "black" : "white";
    if (sideToMove !== computerColor) return;

    const mainLineMove = Object.keys(activeNode.children ?? {})[0];
    if (!mainLineMove) return;

    const timer = setTimeout(() => {
      const previewGame = new Chess(currentFen);
      let previewMove;
      try {
        previewMove = previewGame.move(mainLineMove);
      } catch {
        return;
      }
      if (!previewMove) return;

      const moved = onPieceDrop(previewMove.from, previewMove.to);
      if (moved) {
        setCurrentPath((p) => [...p, mainLineMove]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [
    panelMode,
    activeNode,
    currentPath,
    userColor,
    currentFen,
    onPieceDrop,
  ]);

  // ----------------------------------------------------------------------
  // Return everything the UI components need
  // ----------------------------------------------------------------------
  return {
    // UI state
    panelMode,
    setPanelMode,
    // Tutorial state
    activeTutorialId,
    activeCourse,
    activeNode,
    isChapterFinished,
    nextChapter,
    previousBranchPath,
    userColor,
    // Interaction handlers
    handlePieceClick: handleSquareClick,
    handlePieceDrop,
    handleStartTutorial,
    handleNextChapter,
    handleBackToMenu,
    handleRewindToBranch,
    // Misc helpers (exported for potential external use)
    getUserColorForCourse,
    getPreviousBranchPath,
  };
}