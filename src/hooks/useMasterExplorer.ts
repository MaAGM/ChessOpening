"use client";

import { useEffect, useState } from "react";

import { fetchMasterMoves } from "@/lib/chess/explorer";
import { summarizeExplorer, type ExplorerSummary } from "@/lib/chess/explorerStats";

export type MasterExplorerState =
  | { status: "loading"; summary: null }
  | { status: "ready"; summary: ExplorerSummary }
  | { status: "error"; summary: null; message: string };

/** Positions déjà consultées : revenir en arrière ne recontacte pas Lichess. */
const CACHE_LIMIT = 200;
const cache = new Map<string, ExplorerSummary>();

function remember(fen: string, summary: ExplorerSummary): void {
  cache.delete(fen);
  cache.set(fen, summary);
  if (cache.size > CACHE_LIMIT) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
}

/** Vide le cache (tests). */
export function clearMasterExplorerCache(): void {
  cache.clear();
}

type Entry = { fen: string; state: MasterExplorerState };

/** Statistiques de la base Masters de Lichess pour `fen` (coupé si `enabled` est faux). */
export function useMasterExplorer(fen: string, enabled: boolean): MasterExplorerState {
  const [entry, setEntry] = useState<Entry | null>(null);

  useEffect(() => {
    if (!enabled || cache.has(fen)) return;
    let active = true;
    fetchMasterMoves(fen)
      .then((data) => {
        const summary = summarizeExplorer(data);
        remember(fen, summary);
        if (active) setEntry({ fen, state: { status: "ready", summary } });
      })
      .catch((error: unknown) => {
        if (!active) return;
        const message = error instanceof Error && /429|rate limit/i.test(error.message)
          ? "Lichess limite les requêtes. Réessaie dans un instant."
          : "Base des maîtres indisponible pour le moment.";
        setEntry({ fen, state: { status: "error", summary: null, message } });
      });
    return () => {
      active = false;
    };
  }, [fen, enabled]);

  const cached = cache.get(fen);
  if (cached) return { status: "ready", summary: cached };
  if (entry?.fen === fen) return entry.state;
  return { status: "loading", summary: null };
}
