"use client";

import { useEffect, useMemo, useState } from "react";
import { Chess } from "chess.js";
import { useChessGame } from "@/hooks/useChessGame";
import { ChessBoard } from "@/components/chess/ChessBoard";
import { OpeningName } from "@/components/chess/OpeningName";
import { LearningPanel } from "@/components/chess/LearningPanel";
import { MasterExplorer } from "@/components/chess/MasterExplorer";
import { OpeningSelector } from "@/components/chess/OpeningSelector";
import { useRepertoire } from "@/hooks/useRepertoire";
import type { TutorialNode } from "@/lib/data/openings";
import { findNodeByMoveSequence, computeFenForPath, getAllChapters, openingCourses } from "@/lib/data/openings";

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

function getUserColorForCourse(courseId?: string | null): "white" | "black" {
  if (!courseId) return "white";
  return BLACK_DEFENSE_COURSE_IDS.has(courseId) ? "black" : "white";
}

function getPreviousBranchPath(rootNode: TutorialNode, currentPath: string[]): string[] | null {
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
    resetGame,
    loadPosition,
  } = useChessGame();
  const { addSavedMove } = useRepertoire();
  const [panelMode, setPanelMode] = useState<
    "menu" | "explorer" | "opening_selector" | "learning_active"
  >("menu");
  const [activeTutorialId, setActiveTutorialId] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const activeCourse = useMemo(
    () => openingCourses.find((course) => course.chapters.some((chapter) => chapter.id === activeTutorialId)) ?? null,
    [activeTutorialId],
  );
  const userColor = getUserColorForCourse(activeCourse?.id);

  const activeTutorial = getAllChapters().find((chapter) => chapter.id === activeTutorialId) ?? null;
  const activeNode = useMemo<TutorialNode | null>(() => {
    if (!activeTutorial) return null;
    if (currentPath.length === 0) {
      return {
        ...activeTutorial.root,
        explanation: `Prêt à apprendre la variante : ${activeTutorial.name} ? Jouez le premier coup sur l'échiquier !`,
        arrows: [],
      };
    }
    return findNodeByMoveSequence(activeTutorial.root, currentPath);
  }, [activeTutorial, currentPath]);
  const previousBranchPath = useMemo<string[] | null>(() => {
    if (!activeTutorial) return null;
    return getPreviousBranchPath(activeTutorial.root, currentPath);
  }, [activeTutorial, currentPath]);

  const handlePieceDrop = (sourceSquare: string, targetSquare: string | null) => {
    if (panelMode === "menu") {
      setPanelMode("explorer");
    }
    if (panelMode === "learning_active" && activeNode) {
      if (!targetSquare) return false;

      const sideToMove = currentPath.length % 2 === 0 ? "white" : "black";
      if (sideToMove !== userColor) {
        return false;
      }

      const previewGame = new Chess(currentFen);
      let previewMove;
      try {
        previewMove = previewGame.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
      } catch {
        return false;
      }
      if (!previewMove) return false;

      const nextMoves = Object.keys(activeNode.children ?? {});
      if (!nextMoves.includes(previewMove.san)) {
        return false;
      }

      const moved = onPieceDrop(sourceSquare, targetSquare);
      if (moved) {
        setCurrentPath((prev) => [...prev, previewMove.san]);
      }
      return moved;
    }
    return onPieceDrop(sourceSquare, targetSquare);
  };

  const handleStartTutorial = (id: string) => {
    const tutorial = getAllChapters().find((t) => t.id === id);
    if (!tutorial) return;

    setActiveTutorialId(id);
    setCurrentPath([]);
    setPanelMode("learning_active");
    // Load the initial position (empty path)
    try {
      const fen = computeFenForPath([]);
      loadPosition(fen);
    } catch (e) {
      console.error(e);
      loadPosition(new Chess().fen());
    }
  };

  const handleBackToMenu = () => {
    setPanelMode("menu");
    setActiveTutorialId(null);
    setCurrentPath([]);
    resetGame();
  };

  const handleRewindToBranch = () => {
    if (!activeTutorial) return;
    const branchPath = getPreviousBranchPath(activeTutorial.root, currentPath);
    if (!branchPath) return;

    setCurrentPath(branchPath);
    try {
      const fen = computeFenForPath(branchPath);
      loadPosition(fen);
    } catch (e) {
      console.error(e);
      loadPosition(new Chess().fen());
    }
  };

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
        setCurrentPath((prev) => [...prev, mainLineMove]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [panelMode, activeNode, currentPath, userColor, currentFen, onPieceDrop]);

  return (
    <main className="flex min-h-screen items-center justify-start gap-6 bg-slate-900 px-4 py-10 pl-16 text-slate-100">
      <div className="flex flex-col gap-4">
        <OpeningName name={openingName} />

        <section className="w-full max-w-137.5 border-2 border-[#D4AF37] bg-[#D4AF37]/10 p-2 shadow-2xl shadow-black/40">
          <ChessBoard
            position={currentFen}
            boardOrientation={userColor}
            currentGame={currentGame}
            squareStyles={squareStyles}
            onPieceDrop={handlePieceDrop}
            onPieceDragBegin={onPieceDragBegin}
            onPieceDragEnd={onPieceDragEnd}
            onSquareClick={onSquareClick}
            onSquareRightClick={onSquareRightClick}
              customArrows={activeNode?.arrows}
          />
        </section>
      </div>

      <aside className={`flex h-137.5 flex-col rounded-lg border border-slate-700 bg-slate-800/60 p-4 transition-all duration-300 ease-in-out ${panelMode === "opening_selector" ? "w-[900px]" : "w-80"}`}>
        {panelMode === "menu" ? (
          <div className="flex h-full flex-col justify-center gap-4">
            <h2 className="text-center text-sm font-semibold uppercase tracking-wide text-slate-300">
              Chess Opening Trainer
            </h2>
            <button
              type="button"
              onClick={() => setPanelMode("opening_selector")}
              className="rounded-xl border border-emerald-400/40 bg-emerald-500/20 px-4 py-3 text-left font-semibold text-emerald-100 transition hover:border-emerald-300/70 hover:bg-emerald-500/30"
            >
              Apprendre une ouverture
            </button>
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-xl border border-blue-400/40 bg-blue-500/20 px-4 py-3 text-left font-semibold text-blue-100 opacity-50 grayscale"
            >
              Mettre à jour son répertoire
            </button>
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-xl border border-amber-400/40 bg-amber-500/20 px-4 py-3 text-left font-semibold text-amber-100 opacity-50 grayscale"
            >
              Réviser les ouvertures
            </button>
            <p className="text-center text-xs text-slate-500">
              Jouez un coup sur l&apos;échiquier pour commencer.
            </p>
          </div>
        ) : (
          <div className="flex h-full flex-col gap-3">
            <button
              type="button"
              onClick={handleBackToMenu}
              className="flex w-fit items-center gap-2 rounded-lg border border-slate-600 bg-slate-700/40 px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:border-[#D4AF37]/60 hover:bg-slate-700/70 hover:text-[#D4AF37]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path
                  fillRule="evenodd"
                  d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
                  clipRule="evenodd"
                />
              </svg>
              Retour
            </button>

            {panelMode === "explorer" && <MasterExplorer currentFen={currentFen} />}

            {panelMode === "opening_selector" && <OpeningSelector onSelectOpening={handleStartTutorial} />}

            {panelMode === "learning_active" && activeNode && (
              <LearningPanel
                currentNode={activeNode}
                onSaveMove={addSavedMove}
                hasPreviousBranch={Boolean(previousBranchPath)}
                onRewindToBranch={handleRewindToBranch}
                onBackToMenu={handleBackToMenu}
              />
            )}
          </div>
        )}
      </aside>
    </main>
  );
}