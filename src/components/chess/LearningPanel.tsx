"use client";

import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { useReviewStore } from "@/hooks/useReviewStore";
import type { TutorialManager } from "@/hooks/useTutorialManager";

const SIDE_LABELS = { white: "Blancs", black: "Noirs" } as const;

function ArrowRightIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden>
      <path
        fillRule="evenodd"
        d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

type LearningPanelProps = {
  tutorial: TutorialManager;
};

/** Déroulé d'un cours : fil d'Ariane, explications, choix de variante et fin de cours. */
export function LearningPanel({ tutorial }: LearningPanelProps) {
  const {
    course,
    activeLesson,
    activeChapter,
    activeChapterIndex,
    activeLessonIndex,
    activeNode,
    isLessonFinished,
    isLessonCompleted,
    coverage,
    canExploreOtherBranch,
    nextLesson,
    computerColor,
    isWaitingForBranchChoice,
    branchChoices,
    exploredChoices,
    loadError,
    handleBranchChoice,
    handleRewindToBranch,
    handleNextLesson,
    handleRestartLesson,
  } = tutorial;
  const { isInReview, addToReview, removeFromReview } = useReviewStore();

  if (!activeLesson || !activeNode || !course || !activeChapter) {
    return (
      <section className="rounded-xl border border-slate-600 bg-slate-800/70 p-4 text-sm text-slate-300">
        {loadError ?? "Chargement du cours…"}
      </section>
    );
  }

  const inReview = isInReview(activeLesson.id);
  const showCoverage = coverage !== null && coverage.total > 1;

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
      {/* Fil d'Ariane : Ouverture › Chapitre › Cours */}
      <header className="flex flex-col gap-1">
        <p className="truncate text-xs text-slate-400">
          {course.name} › Chapitre {activeChapterIndex + 1} · {activeChapter.title}
        </p>
        <h2 className="flex items-start justify-between gap-2 text-sm font-semibold text-slate-100">
          <span>
            Cours {activeLessonIndex + 1} · {activeLesson.title}
          </span>
          {isLessonCompleted && (
            <span className="shrink-0 text-xs font-semibold text-emerald-400" aria-label="Cours parcouru">
              ✓
            </span>
          )}
        </h2>
        {activeLesson.objectives.length > 0 && (
          <ul className="list-disc pl-5 text-xs text-slate-300">
            {activeLesson.objectives.map((objective) => (
              <li key={objective}>{objective}</li>
            ))}
          </ul>
        )}
        {showCoverage && (
          <p className="text-xs text-slate-400">
            Variantes explorées : {coverage.explored}/{coverage.total}
          </p>
        )}
      </header>

      <div className="rounded-xl border border-slate-600 bg-slate-800/70 p-4 shadow-lg shadow-slate-950/40">
        {isWaitingForBranchChoice ? (
          <div className="flex flex-col gap-3">
            <p className="rounded-lg border border-indigo-500/40 bg-indigo-500/20 p-3 text-sm font-semibold leading-relaxed text-indigo-100">
              Les {SIDE_LABELS[computerColor]} ont plusieurs réponses. Laquelle voulez-vous étudier ?
            </p>
            <div className="grid grid-cols-2 gap-2">
              {branchChoices.map((move) => {
                const explored = exploredChoices.includes(move);
                return (
                  <button
                    key={move}
                    type="button"
                    onClick={() => handleBranchChoice(move)}
                    className="rounded-lg border border-indigo-400/40 bg-indigo-500/30 px-4 py-3 text-sm font-semibold text-indigo-50 transition hover:border-indigo-300/80 hover:bg-indigo-500/50"
                  >
                    {explored ? "✓ " : ""}Analyser {move}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          activeNode.explanation && (
            <p className="whitespace-pre-line rounded-lg border border-slate-500/30 bg-slate-700/20 p-3 text-sm leading-relaxed text-slate-100">
              {activeNode.explanation}
            </p>
          )
        )}

        {isLessonFinished && (
          <div className="mt-4 flex flex-col gap-2">
            {canExploreOtherBranch && (
              <Button tone="amber" onClick={handleRewindToBranch} className="px-4 py-3 text-sm">
                Explorer une autre variante
              </Button>
            )}

            {coverage?.complete && !nextLesson && (
              <Callout tone="success" className="px-4 py-3 text-center font-bold text-emerald-400">
                🎉 Ouverture terminée : tous les cours sont parcourus !
              </Callout>
            )}

            <Button variant="link" onClick={handleRestartLesson} className="w-fit self-center">
              Recommencer le cours
            </Button>
          </div>
        )}
      </div>

      {isLessonFinished && activeLesson.reviewable &&
        (inReview ? (
          <Callout
            tone="success"
            className="flex items-center justify-between px-4 py-2 text-sm font-semibold text-emerald-300"
          >
            <span>✓ Ajouté à vos révisions</span>
            <Button variant="link" onClick={() => removeFromReview(activeLesson.id)} className="font-normal">
              Retirer
            </Button>
          </Callout>
        ) : (
          <Button tone="emerald" onClick={() => addToReview(activeLesson.id)} className="w-full px-4 py-3 text-sm">
            Ajouter à mes révisions
          </Button>
        ))}

      {isLessonFinished && nextLesson && (
        <Button
          variant="primary"
          onClick={handleNextLesson}
          className="flex w-full items-center justify-center gap-2 text-sm"
        >
          <span className="min-w-0 truncate">
            {nextLesson.isNewChapter ? "Chapitre suivant" : "Cours suivant"} : {nextLesson.title}
          </span>
          <ArrowRightIcon />
        </Button>
      )}
    </section>
  );
}
