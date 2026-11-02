import type { Side, SourceCount } from "@/lib/review/reviewRepertoire";

type ReviewSetupProps = {
  /** Nombre de chapitres et de répertoires proposés en révision, par couleur */
  counts: Record<Side, SourceCount>;
  onStart: (side: Side) => void;
};

const SIDES: { side: Side; label: string }[] = [
  { side: "white", label: "S'entraîner avec les Blancs" },
  { side: "black", label: "S'entraîner avec les Noirs" },
];

const total = (count: SourceCount): number => count.chapters + count.repertoires;

/** « 2 chapitres · 1 répertoire » (les types absents sont omis). */
export function describeSources(count: SourceCount): string {
  const parts: string[] = [];
  if (count.chapters > 0) parts.push(`${count.chapters} chapitre${count.chapters > 1 ? "s" : ""}`);
  if (count.repertoires > 0) {
    parts.push(`${count.repertoires} répertoire${count.repertoires > 1 ? "s" : ""}`);
  }
  return parts.length > 0 ? parts.join(" · ") : "Rien à réviser";
}

export function ReviewSetup({ counts, onStart }: ReviewSetupProps) {
  const anySource = total(counts.white) + total(counts.black) > 0;

  return (
    <section className="flex h-full flex-col gap-3">
      <h2 className="text-center text-sm font-semibold uppercase tracking-wide text-slate-300">
        Réviser les ouvertures
      </h2>

      {!anySource ? (
        <p className="rounded-lg border border-slate-500/30 bg-slate-700/20 p-3 text-sm leading-relaxed text-slate-300">
          Rien à réviser pour l&apos;instant. Terminez un chapitre dans « Apprendre une ouverture »
          puis cliquez sur « Ajouter à mes révisions », ou créez un répertoire dans « Mettre à jour
          son répertoire ».
        </p>
      ) : (
        <p className="text-xs text-slate-400">Avec quelle couleur voulez-vous vous entraîner ?</p>
      )}

      <div className="grid grid-cols-1 gap-3">
        {SIDES.map(({ side, label }) => {
          const count = counts[side];
          const disabled = total(count) === 0;

          return (
            <button
              key={side}
              type="button"
              disabled={disabled}
              onClick={() => onStart(side)}
              className={`rounded-xl border px-4 py-3 text-left font-semibold transition ${
                disabled
                  ? "cursor-not-allowed border-slate-600/40 bg-slate-700/20 text-slate-400 opacity-50"
                  : "border-amber-400/40 bg-amber-500/20 text-amber-100 hover:border-amber-300/70 hover:bg-amber-500/30"
              }`}
            >
              <span className="block">{label}</span>
              <span className="block text-xs font-normal text-slate-400">
                {describeSources(count)}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}