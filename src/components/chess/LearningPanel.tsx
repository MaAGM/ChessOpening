import type { TutorialNode } from "@/lib/data/openings";

type LearningPanelProps = {
  currentNode: TutorialNode;
  currentPath: string[];
  onBranchSelect: (san: string) => void;
  onSaveMove: (move: string) => void;
};

export function LearningPanel({ currentNode, currentPath, onBranchSelect, onSaveMove }: LearningPanelProps) {
  const branchEntries = Object.entries(currentNode.children ?? {});

  return (
    <section className="flex h-full flex-col rounded-xl border border-slate-600 bg-slate-900/60 p-4 shadow-lg shadow-slate-950/40">
      {currentNode.explanation && (
        <p className="rounded-lg border border-amber-400/30 bg-amber-500/10 p-3 text-sm leading-relaxed text-amber-100">
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

        {branchEntries.map(([san, _node]) => (
          <button
            key={san}
            type="button"
            onClick={() => onBranchSelect(san)}
            className="rounded-lg border border-slate-400/40 bg-slate-700/40 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-amber-300/70 hover:bg-amber-500/20 hover:text-amber-100"
          >
            Jouer {san}
          </button>
        ))}
      </div>
    </section>
  );
}
