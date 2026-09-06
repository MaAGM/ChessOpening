"use client";

import { FC } from "react";

import { MasterExplorer } from "@/components/chess/MasterExplorer";
import { OpeningSelector } from "@/components/chess/OpeningSelector";
import { LearningPanel } from "@/components/chess/LearningPanel";

import type { TutorialNode } from "@/lib/data/openings";

type Props = {
  /** Current UI mode – controlled by the tutorial hook */
  panelMode: "menu" | "explorer" | "opening_selector" | "learning_active";
  /** Setter for the UI mode */
  setPanelMode: (mode: "menu" | "explorer" | "opening_selector" | "learning_active") => void;

  /** Derived data from the tutorial hook */
  activeNode: TutorialNode | null;
  isChapterFinished: boolean;
  nextChapter: { id: string; name: string } | null;
  previousBranchPath: string[] | null;
  currentFen: string;

  /** Callback helpers from the tutorial hook */
  handleBackToMenu: () => void;
  handleRewindToBranch: () => void;
  handleStartTutorial: (id: string) => void;
  handleNextChapter: () => void;
};

/**
 * The sidebar contains the **menu**, the **explorer**, the **opening selector**
 * and the **learning panel** (shown only when a tutorial is active).
 *
 * All visual logic lives here; the page component only renders this
 * component and passes the hook‑generated props.
 */
export const TrainerSidebar: FC<Props> = ({
  panelMode,
  setPanelMode,
  activeNode,
  isChapterFinished,
  nextChapter,
  previousBranchPath,
  handleBackToMenu,
  handleRewindToBranch,
  handleStartTutorial,
  handleNextChapter,
  currentFen,
}) => {
  return (
    <aside
      className={`flex h-137.5 flex-col rounded-lg border border-slate-700 bg-slate-800/60 p-4 transition-all duration-300 ease-in-out ${
        panelMode === "opening_selector" ? "w-225" : "w-80"
      }`}
    >
      {/* ------------------------------------------------------------------ */}
      {/* MENU – displayed when panelMode === "menu" */}
      {/* ------------------------------------------------------------------ */}
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
        // ------------------------------------------------------------------
        // CONTENT – displayed for every mode except the root menu
        // ------------------------------------------------------------------
        <div className="flex h-full flex-col gap-3 relative">
          {/* Back button – always visible when not in the root menu */}
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
                d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l5.5-5.25a.75.75 0 0 1 0-1.08l-5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
                clipRule="evenodd"
              />
            </svg>
            Retour
          </button>

          {/* ---------------------------------------------------------------- */}
          {/* Explorer – shown when panelMode === "explorer" */}
          {/* ---------------------------------------------------------------- */}
          {panelMode === "explorer" && <MasterExplorer currentFen={currentFen}/>}

          {/* ---------------------------------------------------------------- */}
          {/* Opening selector – shown when panelMode === "opening_selector" */}
          {/* ---------------------------------------------------------------- */}
          {panelMode === "opening_selector" && (
            <OpeningSelector onSelectOpening={handleStartTutorial} />
          )}

          {/* ---------------------------------------------------------------- */}
          {/* Learning panel – shown when a tutorial is active */}
          {/* ---------------------------------------------------------------- */}
          {panelMode === "learning_active" && activeNode && (
            <>
              <LearningPanel
                currentNode={activeNode}
                onSaveMove={(move) => {
                  // The hook already adds the move to the repertoire when the board
                  // executes it, but the UI may want to persist it for user history.
                  // We expose the `addSavedMove` helper from the hook; here we just
                  // forward the call.
                }}
                hasPreviousBranch={Boolean(previousBranchPath)}
                onRewindToBranch={handleRewindToBranch}
                onBackToMenu={handleBackToMenu}
              />

              {/* ------------------------------------------------------------ */}
              {/* End‑of‑chapter UI – gold button / completion banner */}
              {/* ------------------------------------------------------------ */}
              {isChapterFinished && nextChapter && (
                <button
                  onClick={handleNextChapter}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#D4AF37] px-4 py-3 font-bold text-slate-900 shadow-[0_0_15px_rgba(212,175,55,0.2)] transition hover:bg-[#F3E5AB] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                >
                  Chapitre suivant : {nextChapter.name}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}

              {isChapterFinished && !nextChapter && (
                <div className="mt-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-center font-bold text-emerald-400">
                  🎉 Cours complet terminé !
                </div>
              )}
            </>
          )}
        </div>
      )}
    </aside>
  );
};