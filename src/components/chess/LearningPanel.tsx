import type { TutorialNode } from "@/lib/data/openings";

type LearningPanelProps = {
  currentNode: TutorialNode;
  onSaveMove: (move: string) => void;
  hasPreviousBranch: boolean;
  onRewindToBranch: () => void;
  onBackToMenu: () => void;
};

export function LearningPanel({
  currentNode,
  onSaveMove,
  hasPreviousBranch,
  onRewindToBranch,
  onBackToMenu,
}: LearningPanelProps) {
  const isLeafNode = !currentNode.children || Object.keys(currentNode.children).length === 0;

  return (
    <section className="flex h-full flex-col rounded-xl border border-slate-600 bg-slate-800/70 p-4 shadow-lg shadow-slate-950/40">
      {currentNode.explanation && (
        <p className="rounded-lg border border-slate-500/30 bg-slate-700/20 p-3 text-sm leading-relaxed text-slate-100">
          {currentNode.explanation}
        </p>
      )}

      <div className="mt-4 grid grid-cols-1 gap-3">
        {currentNode.move && (
          <button
            type="button"
            onClick={() => onSaveMove(currentNode.move!)}
            className="rounded-lg border border-emerald-400/40 bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:border-emerald-300/80 hover:bg-emerald-500/30"
          >
            Ajouter au répertoire
          </button>
        )}

        {isLeafNode && hasPreviousBranch && (
          <button
            type="button"
            onClick={onRewindToBranch}
            className="group flex items-center justify-center gap-2 rounded-lg border border-amber-300/50 bg-linear-to-r from-amber-400/25 via-yellow-300/20 to-amber-500/25 px-4 py-3 text-sm font-semibold text-amber-100 shadow-lg shadow-amber-700/20 transition hover:scale-[1.01] hover:border-amber-200 hover:from-amber-300/30 hover:to-yellow-300/30 hover:text-amber-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5 transition group-hover:-translate-x-0.5"
            >
              <path
                fillRule="evenodd"
                d="M9.53 3.47a.75.75 0 0 1 0 1.06L5.81 8.25H10a5.75 5.75 0 1 1-5.656 6.79.75.75 0 1 1 1.472-.288A4.25 4.25 0 1 0 10 9.75H5.81l3.72 3.72a.75.75 0 1 1-1.06 1.06l-5-5a.75.75 0 0 1 0-1.06l5-5a.75.75 0 0 1 1.06 0Z"
                clipRule="evenodd"
              />
            </svg>
            Explorer une autre variante
          </button>
        )}

        {isLeafNode && !hasPreviousBranch && (
          <button
            type="button"
            onClick={onBackToMenu}
            className="rounded-lg border border-sky-300/40 bg-sky-500/15 px-4 py-3 text-sm font-semibold text-sky-100 shadow-md shadow-sky-900/40 transition hover:border-sky-200/80 hover:bg-sky-500/25 hover:text-sky-50"
          >
            Chapitre terminé
          </button>
        )}
      </div>
    </section>
  );
}