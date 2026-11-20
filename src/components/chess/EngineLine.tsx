"use client";

import type { EngineAnalysisState } from "@/hooks/useEngineAnalysis";
import { formatMoveSequence } from "@/lib/coach/chatProtocol";
import { uciLineToSan } from "@/lib/coach/chatSnapshot";
import { formatScore } from "@/lib/engine";

type EngineLineProps = EngineAnalysisState & {
  fen: string;
  /** Demi-coups joués avant la position (numérotation de la ligne). */
  ply: number;
};

const MAX_PLIES = 10;

/** Bandeau Stockfish : évaluation, profondeur et ligne principale en notation algébrique. */
export function EngineLine({ analysis, status, fen, ply }: EngineLineProps) {
  const unavailable = status === "error" || status === "unsupported";
  const score = analysis?.score ?? null;
  const line = analysis ? uciLineToSan(fen, analysis.pv).slice(0, MAX_PLIES) : [];
  const positive = score ? (score.type === "mate" ? score.value > 0 : score.value >= 0) : true;

  return (
    <section aria-label="Analyse Stockfish" className="flex items-start gap-3">
      <span
        className={`min-w-14 rounded-md px-2 py-1 text-center text-sm font-bold tabular-nums ${
          positive ? "bg-slate-100 text-slate-900" : "bg-slate-950 text-slate-100 ring-1 ring-slate-600"
        }`}
        data-testid="engine-score"
      >
        {unavailable ? "—" : score ? formatScore(score) : "…"}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wide text-slate-500">
          Stockfish{analysis && analysis.depth > 0 ? ` · prof. ${analysis.depth}` : ""}
        </p>
        <p className="truncate text-sm text-slate-200" title={line.length > 0 ? formatMoveSequence(line, ply) : undefined}>
          {unavailable
            ? "Analyse indisponible sur ce navigateur."
            : line.length > 0
              ? formatMoveSequence(line, ply)
              : "Analyse en cours…"}
        </p>
      </div>
    </section>
  );
}
