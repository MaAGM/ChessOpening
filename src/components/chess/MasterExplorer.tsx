"use client";

import type { MasterExplorerState } from "@/hooks/useMasterExplorer";
import { formatGameCount, type ResultShares } from "@/lib/chess/explorerStats";

type MasterExplorerProps = {
  state: MasterExplorerState;
  /**
   * Survol d'un coup (SAN) : aperçu sur l'échiquier ; `null` à la sortie. Le SAN est préféré
   * à l'UCI de Lichess, qui note le roque « roi vers tour » (e1h1).
   */
  onPreviewMove?: (san: string | null) => void;
  /** Clic sur un coup (SAN) : il est joué sur l'échiquier. */
  onPlayMove?: (san: string) => void;
};

function pct(value: number): string {
  return `${Math.round(value)} %`;
}

/** Barre Blancs / nulles / Noirs ; les pourcentages s'affichent dans les segments assez larges. */
export function ResultBar({ shares, label }: { shares: ResultShares; label: string }) {
  const segments = [
    { key: "white", value: shares.white, className: "bg-slate-100 text-slate-900" },
    { key: "draws", value: shares.draws, className: "bg-slate-500 text-slate-50" },
    { key: "black", value: shares.black, className: "bg-slate-950 text-slate-200" },
  ];
  return (
    <div
      className="flex h-4 w-full overflow-hidden rounded-sm text-[10px] font-semibold leading-4 ring-1 ring-slate-700"
      role="img"
      aria-label={`${label} : Blancs ${pct(shares.white)}, nulles ${pct(shares.draws)}, Noirs ${pct(shares.black)}`}
    >
      {segments.map((segment) => (
        <div
          key={segment.key}
          className={`${segment.className} overflow-hidden text-center`}
          style={{ width: `${segment.value}%` }}
        >
          {segment.value >= 14 ? Math.round(segment.value) : ""}
        </div>
      ))}
    </div>
  );
}

/** Tableau compact de la base des maîtres (Lichess) pour la position affichée. */
export function MasterExplorer({ state, onPreviewMove, onPlayMove }: MasterExplorerProps) {
  return (
    <section className="flex min-h-0 flex-1 flex-col" aria-labelledby="master-explorer-title">
      <header className="mb-1.5 flex shrink-0 items-baseline justify-between gap-2">
        <h2 id="master-explorer-title" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Base des maîtres
        </h2>
        {state.status === "ready" && state.summary.totalGames > 0 && (
          <span className="text-xs tabular-nums text-slate-400">
            {formatGameCount(state.summary.totalGames)} parties
          </span>
        )}
      </header>

      {state.status === "loading" && <p className="py-6 text-center text-sm text-slate-500">Chargement…</p>}

      {state.status === "error" && <p className="py-6 text-center text-sm text-rose-300">{state.message}</p>}

      {state.status === "ready" && state.summary.moves.length === 0 && (
        <p className="py-6 text-center text-sm text-slate-500">Aucune partie de maître depuis cette position.</p>
      )}

      {state.status === "ready" && state.summary.moves.length > 0 && (
        <>
          <div className="mb-2 shrink-0">
            <ResultBar shares={state.summary} label="Toutes les parties" />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <table className="w-full table-fixed border-collapse text-sm leading-5">
              <thead>
                <tr className="sticky top-0 z-10 bg-[#182234] text-left text-[11px] uppercase tracking-wide text-slate-500">
                  <th className="w-14 py-1 font-medium">Coup</th>
                  <th className="w-24 py-1 text-right font-medium">Parties</th>
                  <th className="py-1 pl-3 font-medium">Résultats</th>
                  <th className="w-11 py-1 text-right font-medium">Elo</th>
                </tr>
              </thead>
              <tbody onMouseLeave={() => onPreviewMove?.(null)}>
                {state.summary.moves.map((move) => (
                  <tr
                    key={move.uci}
                    className="group cursor-pointer border-t border-slate-700/60 hover:bg-slate-700/40"
                    onMouseEnter={() => onPreviewMove?.(move.san)}
                    onClick={() => onPlayMove?.(move.san)}
                  >
                    <td className="py-1">
                      <button
                        type="button"
                        className="font-semibold text-slate-100 group-hover:text-[#D4AF37] focus:outline-none focus-visible:text-[#D4AF37]"
                        onFocus={() => onPreviewMove?.(move.san)}
                        onBlur={() => onPreviewMove?.(null)}
                        onClick={(event) => {
                          event.stopPropagation();
                          onPlayMove?.(move.san);
                        }}
                      >
                        {move.san}
                      </button>
                    </td>
                    <td className="whitespace-nowrap py-1 text-right tabular-nums text-slate-300">
                      {pct(move.popularity)}
                      <span className="ml-1.5 text-[11px] text-slate-500">{formatGameCount(move.games)}</span>
                    </td>
                    <td className="py-1 pl-3">
                      <ResultBar shares={move} label={move.san} />
                    </td>
                    <td className="py-1 text-right tabular-nums text-xs text-slate-400">
                      {Math.round(move.averageRating)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
