"use client";

import { openingTutorials } from "@/lib/data/openings";
import { useRepertoire } from "@/hooks/useRepertoire";

type OpeningSelectorProps = {
  onSelectOpening: (id: string, startIndex: number) => void;
};

export function OpeningSelector({ onSelectOpening }: OpeningSelectorProps) {
  const { learningProgress } = useRepertoire();

  return (
    <section className="flex h-full flex-col gap-3">
      <h2 className="text-center text-sm font-semibold uppercase tracking-wide text-slate-300">
        Apprendre une ouverture
      </h2>

      <ul className="space-y-3">
        {openingTutorials.map((opening) => {
          const progressIndex = learningProgress[opening.id] ?? 0;
          const isResume = progressIndex > 0;

          return (
            <li key={opening.id} className="rounded-xl border border-slate-700 bg-slate-900/40 p-3">
              <p className="text-sm font-semibold text-slate-100">{opening.name}</p>
              <p className="mt-1 text-xs text-slate-400">
                Position de départ: {opening.initialSequence.join(" ")}
              </p>

              <button
                type="button"
                onClick={() => onSelectOpening(opening.id, progressIndex)}
                className="mt-3 w-full rounded-lg border border-emerald-400/40 bg-emerald-500/20 px-3 py-2 text-sm font-semibold text-emerald-100 transition hover:border-emerald-300/80 hover:bg-emerald-500/30"
              >
                {isResume ? "Reprendre" : "Commencer"}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
