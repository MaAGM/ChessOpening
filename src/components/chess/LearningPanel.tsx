import type { TutorialNode } from "@/lib/data/openings";

type LearningPanelProps = {
  currentNode: TutorialNode;
  onSaveMove: (move: string) => void;
};

export function LearningPanel({ currentNode, onSaveMove }: LearningPanelProps) {
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
      </div>
    </section>
  );
}
