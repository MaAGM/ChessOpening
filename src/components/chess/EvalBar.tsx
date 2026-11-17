import { formatScore, whiteShare, type EngineAnalysis } from "@/lib/engine";
import type { Side } from "@/lib/review/types";

import type { EngineAnalysisState } from "@/hooks/useEngineAnalysis";

type EvalBarProps = {
  analysis: EngineAnalysis | null;
  status: EngineAnalysisState["status"];
  /** Sens de l'échiquier : la part des Blancs est toujours du côté des Blancs. */
  orientation: Side;
};

/** Barre d'évaluation verticale, à gauche de l'échiquier. */
export function EvalBar({ analysis, status, orientation }: EvalBarProps) {
  const unavailable = status === "error" || status === "unsupported";
  const score = analysis?.score ?? null;
  const share = score && analysis ? whiteShare(score, analysis.turn) : 0.5;
  const label = unavailable ? "—" : score ? formatScore(score) : "…";
  const whiteAtBottom = orientation === "white";
  const whiteLeads = share >= 0.5;

  const title = unavailable
    ? "Analyse Stockfish indisponible"
    : analysis
      ? `Stockfish : ${label} (profondeur ${analysis.depth})`
      : "Analyse Stockfish en cours…";

  return (
    <div
      className="relative h-full w-6 overflow-hidden rounded-sm border border-slate-700 bg-slate-800"
      role="meter"
      aria-label="Évaluation Stockfish"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(share * 100)}
      aria-valuetext={label}
      title={title}
      data-testid="eval-bar"
    >
      <div
        className="absolute inset-x-0 bg-slate-100 transition-[height] duration-500 ease-out"
        style={{ height: `${share * 100}%`, ...(whiteAtBottom ? { bottom: 0 } : { top: 0 }) }}
      />
      <span
        className={`absolute inset-x-0 text-center text-[10px] font-semibold leading-none ${
          whiteLeads ? "text-slate-900" : "text-slate-100"
        } ${whiteLeads === whiteAtBottom ? "bottom-1" : "top-1"}`}
      >
        {label}
      </span>
    </div>
  );
}
