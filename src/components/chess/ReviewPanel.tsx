import type { ReviewManager } from "@/hooks/useReviewManager";
import type { Side } from "@/lib/review/types";

type ReviewPanelProps = {
  side: Side;
  review: ReviewManager;
};

export function ReviewPanel({ side, review }: ReviewPanelProps) {
  const {
    hasRepertoire,
    isPlayerTurn,
    isLineFinished,
    isOutOfRepertoire,
    canRestartLine,
    finishedLineMistakes,
    feedback,
    notice,
    currentChapterNames,
    stats,
    cardSummary,
    restartLine,
  } = review;

  const sideLabel = side === "white" ? "Blancs" : "Noirs";

  if (!hasRepertoire) {
    return (
      <section className="rounded-xl border border-slate-600 bg-slate-800/70 p-4 text-sm text-slate-300">
        Aucun chapitre dans votre répertoire pour les {sideLabel}.
      </section>
    );
  }

  const masteredPercent =
    cardSummary.total > 0 ? Math.round((cardSummary.mastered / cardSummary.total) * 100) : 0;

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-slate-600 bg-slate-800/70 p-4 shadow-lg shadow-slate-950/40">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
        Entraînement · {sideLabel}
      </h2>

      {/* Statut de la partie */}
      {isLineFinished ? (
        <div className="flex flex-col gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
          <p className="text-sm font-semibold text-emerald-300">Ligne terminée</p>
          <p className="text-sm text-emerald-100">
            {finishedLineMistakes === 0
              ? "Sans faute, bravo !"
              : `${finishedLineMistakes} erreur${finishedLineMistakes === 1 ? "" : "s"} sur cette ligne.`}
          </p>
          <button
            type="button"
            onClick={restartLine}
            className="rounded-lg border border-emerald-400/40 bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:border-emerald-300/80 hover:bg-emerald-500/30"
          >
            Ligne suivante
          </button>
        </div>
      ) : isOutOfRepertoire ? (
        <div className="flex flex-col gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
          <p className="text-sm text-amber-100">
            Cette position n&apos;est pas dans votre répertoire.
          </p>
          <button
            type="button"
            onClick={restartLine}
            className="rounded-lg border border-amber-400/40 bg-amber-500/20 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:border-amber-300/80 hover:bg-amber-500/30"
          >
            Recommencer la ligne
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-slate-200">
            {isPlayerTurn ? "À vous de jouer." : "L'adversaire joue…"}
          </p>
          {canRestartLine && (
            <button
              type="button"
              onClick={restartLine}
              className="text-xs text-slate-400 underline transition hover:text-slate-200"
            >
              Recommencer la ligne
            </button>
          )}
        </div>
      )}

      {/* Transposition reconnue */}
      {notice && !isLineFinished && (
        <p className="rounded-lg border border-indigo-500/40 bg-indigo-500/10 p-3 text-sm leading-relaxed text-indigo-100">
          {notice}
        </p>
      )}

      {/* Retour d'erreur */}
      {feedback && !isLineFinished && (
        <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-sm leading-relaxed text-rose-200">
          {feedback.message}
        </p>
      )}

      {/* Chapitres concernés par la position */}
      {currentChapterNames.length > 0 && (
        <p className="text-xs text-slate-400">
          Ligne en cours : {currentChapterNames.join(" · ")}
        </p>
      )}

      {/* Progression du répertoire (répétition espacée) */}
      <div className="flex flex-col gap-2 border-t border-slate-700 pt-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Positions du répertoire</span>
          <span>
            {cardSummary.mastered}/{cardSummary.total} maîtrisées
          </span>
        </div>
        <div className="h-2 w-full rounded bg-slate-700">
          <div className="h-2 rounded bg-emerald-500" style={{ width: `${masteredPercent}%` }} />
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-2 py-1.5 text-sky-200">
            <p className="text-base font-semibold">{cardSummary.new}</p>
            <p>Nouvelles</p>
          </div>
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-1.5 text-amber-200">
            <p className="text-base font-semibold">{cardSummary.due}</p>
            <p>À réviser</p>
          </div>
          <div className="rounded-lg border border-slate-500/30 bg-slate-700/30 px-2 py-1.5 text-slate-300">
            <p className="text-base font-semibold">{cardSummary.learning}</p>
            <p>En cours</p>
          </div>
        </div>
      </div>

      {/* Statistiques de la session */}
      <p className="text-xs text-slate-400">
        Session : {stats.completedLines} ligne{stats.completedLines > 1 ? "s" : ""} terminée
        {stats.completedLines > 1 ? "s" : ""} · {stats.perfectLines} sans faute · {stats.mistakes}{" "}
        erreur{stats.mistakes > 1 ? "s" : ""}
      </p>
    </section>
  );
}