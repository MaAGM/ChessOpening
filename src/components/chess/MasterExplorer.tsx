"use client";

import { useEffect, useState } from "react";
import { fetchMasterMoves, type LichessMasterMove } from "@/lib/chess/explorer";

type MasterExplorerProps = {
  currentFen: string;
};

function toPercent(value: number, total: number): number {
  if (total <= 0) return 0;
  return (value / total) * 100;
}

export function MasterExplorer({ currentFen }: MasterExplorerProps) {
  const [moves, setMoves] = useState<LichessMasterMove[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadMoves() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchMasterMoves(currentFen);
        if (!isActive) return;
        setMoves(data.moves.slice(0, 10));
      } catch (err) {
        if (!isActive) return;
        setMoves([]);
        setError(err instanceof Error ? err.message : "Failed to load master moves.");
      } finally {
        if (isActive) setLoading(false);
      }
    }

    void loadMoves();

    return () => {
      isActive = false;
    };
  }, [currentFen]);

  return (
    <section className="w-full max-w-md rounded-lg border border-slate-700 bg-slate-800/60 p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
        Master Explorer
      </h2>

      {loading && <p className="text-sm text-slate-400">Loading master moves…</p>}

      {error && !loading && (
        <p className="text-sm text-rose-400">{error}</p>
      )}

      {!loading && !error && moves.length === 0 && (
        <p className="text-sm text-slate-400">No master data for this position.</p>
      )}

      {!loading && !error && moves.length > 0 && (
        <ul className="space-y-3">
          {moves.map((move) => {
            const total = move.white + move.draws + move.black;
            const whitePct = toPercent(move.white, total);
            const drawsPct = toPercent(move.draws, total);
            const blackPct = toPercent(move.black, total);

            return (
              <li key={move.uci} className="rounded-md border border-slate-700/80 bg-slate-900/40 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-medium text-slate-100">{move.san}</span>
                  <span className="text-xs text-slate-400">{total.toLocaleString()} games</span>
                </div>

                <div className="h-2 w-full overflow-hidden rounded bg-slate-700">
                  <div className="flex h-full w-full">
                    <div className="bg-slate-100" style={{ width: `${whitePct}%` }} />
                    <div className="bg-slate-400" style={{ width: `${drawsPct}%` }} />
                    <div className="bg-slate-900" style={{ width: `${blackPct}%` }} />
                  </div>
                </div>

                <div className="mt-1 text-xs text-slate-400">
                  W {move.white} · D {move.draws} · B {move.black}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}