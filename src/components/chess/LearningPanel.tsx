import type { TutorialStep } from "@/lib/data/openings";

type LearningPanelProps = {
  currentStep: TutorialStep;
  onNextStep: () => void;
  onSaveMove: (move: string) => void;
};

export function LearningPanel({ currentStep, onNextStep, onSaveMove }: LearningPanelProps) {
  return (
    <section className="flex h-full flex-col rounded-xl border border-slate-600 bg-slate-900/60 p-4 shadow-lg shadow-slate-950/40">
      <p className="rounded-lg border border-amber-400/30 bg-amber-500/10 p-3 text-sm leading-relaxed text-amber-100">
        {currentStep.explanation}
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3">
        <button
          type="button"
          onClick={() => onSaveMove(currentStep.expectedMove)}
          className="rounded-lg border border-emerald-400/40 bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:border-emerald-300/80 hover:bg-emerald-500/30"
        >
          Ajouter au répertoire
        </button>

        <button
          type="button"
          onClick={onNextStep}
          className="rounded-lg border border-slate-400/40 bg-slate-700/40 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-amber-300/70 hover:bg-amber-500/20 hover:text-amber-100"
        >
          Coup suivant
        </button>
      </div>
    </section>
  );
}
