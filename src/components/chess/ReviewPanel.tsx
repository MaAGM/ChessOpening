import type { ReviewManager } from "@/hooks/useReviewManager";
import type { Side } from "@/lib/review/reviewRepertoire";

type ReviewPanelProps = {
  side: Side;
  review: ReviewManager;
};

export function ReviewPanel({ side, review }: ReviewPanelProps) {
  const {
    hasRepertoire,
    isPlayerTurn,
    isLineFinished,
    canRestartLine,
    finishedLineMistakes,
    feedback,
    currentChapterNames,
    stats,
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

      {/* Statistiques de la session */}
      <p className="border-t border-slate-700 pt-2 text-xs text-slate-400">
        Lignes terminées : {stats.completedLines} · Sans faute : {stats.perfectLines} · Erreurs :{" "}
        {stats.mistakes}
      </p>
    </section>
  );
}