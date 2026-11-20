"use client";

import { FC, useMemo } from "react";

import { OpeningSelector } from "@/components/chess/OpeningSelector";
import { LearningPanel } from "@/components/chess/LearningPanel";
import { AccountPanel } from "@/components/chess/AccountPanel";
import { ReviewPanel } from "@/components/chess/ReviewPanel";
import { RepertoireEditorPanel } from "@/components/repertoire/RepertoireEditorPanel";
import { RepertoireListPanel } from "@/components/repertoire/RepertoireListPanel";
import { ReviewSetup } from "@/components/chess/ReviewSetup";
import { Button } from "@/components/ui/Button";
import type { RepertoireEditor } from "@/hooks/useRepertoireEditor";
import type { ReviewManager } from "@/hooks/useReviewManager";
import { useRepertoireStore } from "@/hooks/useRepertoireStore";
import { useReviewStore } from "@/hooks/useReviewStore";
import type { PanelMode } from "@/hooks/useTrainerMode";
import type { TutorialManager } from "@/hooks/useTutorialManager";
import { countReviewSourcesBySide, type Side } from "@/lib/review/reviewRepertoire";

/** Écran courant et transitions entre écrans (possédés par la page). */
export type TrainerNavigation = {
  /** Current UI mode – owned by useTrainerMode */
  panelMode: PanelMode;
  setPanelMode: (mode: PanelMode) => void;
  /** Couleur choisie en mode révision (null hors révision) */
  reviewSide: Side | null;
  /** Retour au menu principal (réinitialise toutes les sessions) */
  onBackToMenu: () => void;
  /** Lance l'entraînement pour une couleur */
  onStartReview: (side: Side) => void;
  /** Ouvre un répertoire dans l'éditeur */
  onOpenRepertoire: (id: string) => void;
  /** Ferme l'éditeur et revient à la liste des répertoires */
  onCloseRepertoire: () => void;
};

type Props = {
  navigation: TrainerNavigation;
  /** État et actions du tutoriel (useTutorialManager) */
  tutorial: TutorialManager;
  /** État et actions de la session de révision (useReviewManager) */
  review: ReviewManager;
  /** État et actions de l'éditeur de répertoire (useRepertoireEditor) */
  editor: RepertoireEditor;
};

/** Largeur du panneau selon l'écran affiché (classes complètes pour Tailwind). */
function sidebarWidthClass(mode: PanelMode, courseOpen: boolean): string {
  switch (mode) {
    case "opening_selector":
      return courseOpen ? "w-120" : "w-225";
    case "repertoire_list":
      return "w-96";
    case "repertoire_editor":
      return "w-120";
    default:
      return "w-80";
  }
}

/**
 * The sidebar contains the **menu**, the **opening selector**,
 * the **learning panel** (tutorial) and the **review screens**.
 *
 * All visual logic lives here; the page component only renders this
 * component and passes the hook‑generated props.
 */
export const TrainerSidebar: FC<Props> = ({ navigation, tutorial, review, editor }) => {
  const {
    panelMode,
    setPanelMode,
    reviewSide,
    onBackToMenu,
    onStartReview,
    onOpenRepertoire,
    onCloseRepertoire,
  } = navigation;
  const { reviewChapterIds } = useReviewStore();
  const { repertoires } = useRepertoireStore();
  const reviewCounts = useMemo(
    () => countReviewSourcesBySide(reviewChapterIds, repertoires),
    [reviewChapterIds, repertoires],
  );

  // « Retour » : du cours vers les chapitres de l'ouverture, de l'éditeur vers la liste,
  // sinon vers le menu.
  const back =
    panelMode === "repertoire_editor"
      ? { onClick: onCloseRepertoire, label: "Mes répertoires" }
      : panelMode === "learning_active"
        ? { onClick: tutorial.handleBackToCourse, label: "Chapitres" }
        : { onClick: onBackToMenu, label: "Retour" };

  return (
    <aside
      className={`flex h-137.5 flex-col rounded-lg border border-slate-700 bg-slate-800/60 p-4 transition-all duration-300 ease-in-out ${
        sidebarWidthClass(panelMode, tutorial.selectedCourseId !== null)
      }`}
    >
      {/* ------------------------------------------------------------------ */}
      {/* MENU – displayed when panelMode === "menu" */}
      {/* ------------------------------------------------------------------ */}
      {panelMode === "menu" ? (
        <div className="flex h-full flex-col justify-center gap-4 overflow-y-auto">
          <h2 className="text-center text-sm font-semibold uppercase tracking-wide text-slate-300">
            Chess Opening Trainer
          </h2>

          <button
            type="button"
            onClick={() => {
              tutorial.handleCloseCourse();
              setPanelMode("opening_selector");
            }}
            className="rounded-xl border border-emerald-400/40 bg-emerald-500/20 px-4 py-3 text-left font-semibold text-emerald-100 transition hover:border-emerald-300/70 hover:bg-emerald-500/30"
          >
            Apprendre une ouverture
          </button>

          <button
            type="button"
            onClick={() => setPanelMode("repertoire_list")}
            className="rounded-xl border border-blue-400/40 bg-blue-500/20 px-4 py-3 text-left font-semibold text-blue-100 transition hover:border-blue-300/70 hover:bg-blue-500/30"
          >
            Mettre à jour son répertoire
          </button>

          <button
            type="button"
            onClick={() => setPanelMode("review_setup")}
            className="rounded-xl border border-amber-400/40 bg-amber-500/20 px-4 py-3 text-left font-semibold text-amber-100 transition hover:border-amber-300/70 hover:bg-amber-500/30"
          >
            Réviser les ouvertures
          </button>

          <p className="text-center text-xs text-slate-500">
            Jouez un coup sur l&apos;échiquier pour commencer.
          </p>

          <AccountPanel />
        </div>
      ) : (
        // ------------------------------------------------------------------
        // CONTENT – displayed for every mode except the root menu
        // ------------------------------------------------------------------
        <div className="flex h-full flex-col gap-3 relative">
          {/* Back button – always visible when not in the root menu */}
          <Button
            variant="secondary"
            onClick={back.onClick}
            className="flex w-fit items-center gap-2"
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
            {back.label}
          </Button>

          {/* ---------------------------------------------------------------- */}
          {/* Opening selector – shown when panelMode === "opening_selector" */}
          {/* ---------------------------------------------------------------- */}
          {panelMode === "opening_selector" && (
            <OpeningSelector
              selectedCourse={tutorial.courseEntry}
              isLoading={tutorial.isCourseLoading}
              loadError={tutorial.loadError}
              onOpenCourse={tutorial.handleOpenCourse}
              onCloseCourse={tutorial.handleCloseCourse}
              onStartLesson={tutorial.handleStartLesson}
            />
          )}

          {/* ---------------------------------------------------------------- */}
          {/* Review – side chooser */}
          {/* ---------------------------------------------------------------- */}
          {panelMode === "review_setup" && (
            <ReviewSetup counts={reviewCounts} onStart={onStartReview} />
          )}

          {/* ---------------------------------------------------------------- */}
          {/* Review – training session */}
          {/* ---------------------------------------------------------------- */}
          {panelMode === "review_active" && reviewSide && (
            <ReviewPanel side={reviewSide} review={review} />
          )}

          {/* ---------------------------------------------------------------- */}
          {/* Répertoires – liste de gestion et éditeur */}
          {/* ---------------------------------------------------------------- */}
          {panelMode === "repertoire_list" && <RepertoireListPanel onOpen={onOpenRepertoire} />}
          {panelMode === "repertoire_editor" && <RepertoireEditorPanel editor={editor} />}

          {/* ---------------------------------------------------------------- */}
          {/* Learning panel – shown when a tutorial is active */}
          {/* ---------------------------------------------------------------- */}
          {panelMode === "learning_active" && <LearningPanel tutorial={tutorial} />}
        </div>
      )}
    </aside>
  );
};
