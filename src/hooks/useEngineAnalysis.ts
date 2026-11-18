"use client";

import { useEffect, useRef, useState } from "react";

import type { CoachEngine } from "@/lib/coach";

import {
  EngineClient,
  analysisKey,
  createWorkerTransport,
  type EngineAnalysis,
  type EngineStatus,
} from "@/lib/engine";

/** Profondeur de l'analyse affichée (build lite : quelques secondes au plus). */
export const ENGINE_DISPLAY_DEPTH = 16;

export type EngineAnalysisState = {
  /** Analyse de la position affichée (jamais celle d'une position précédente). */
  analysis: EngineAnalysis | null;
  status: EngineStatus | "unsupported";
};

// Un seul moteur pour toute l'application : il garde son cache d'une position à l'autre.
let sharedClient: EngineClient | null = null;

function getSharedClient(): EngineClient | null {
  if (typeof window === "undefined" || typeof Worker === "undefined") return null;
  if (!sharedClient || sharedClient.status === "disposed") {
    try {
      sharedClient = new EngineClient(createWorkerTransport(), { defaultDepth: ENGINE_DISPLAY_DEPTH });
    } catch {
      return null;
    }
  }
  return sharedClient;
}

/**
 * Moteur du Coach : le même Stockfish que l'affichage (coupé pendant la révision),
 * pour ne pas charger un second worker. `null` si le navigateur ne le permet pas.
 */
export function getCoachEngine(): CoachEngine | null {
  const client = getSharedClient();
  return client ? { analyze: (fen, options) => client.analyze(fen, options) } : null;
}

/**
 * Analyse Stockfish locale de `fen`. Changer de position annule la recherche en
 * cours ; les positions déjà analysées sont servies par le cache du moteur.
 * `enabled = false` arrête la recherche (aucun calcul en arrière-plan).
 */
export function useEngineAnalysis(fen: string, enabled: boolean): EngineAnalysisState {
  const [analysis, setAnalysis] = useState<EngineAnalysis | null>(null);
  const [status, setStatus] = useState<EngineAnalysisState["status"]>("loading");
  /** Dernier état de `enabled` : on n'arrête le moteur qu'au passage actif → coupé. */
  const wasEnabledRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      // Pas d'arrêt à chaque changement de position une fois coupé : le moteur partagé
      // peut alors servir à une autre analyse (Coach pendant la révision).
      if (wasEnabledRef.current) sharedClient?.stop();
      wasEnabledRef.current = false;
      return;
    }
    wasEnabledRef.current = true;
    let active = true;
    const client = getSharedClient();
    if (!client) {
      // Hors du corps de l'effet : pas de rendu en cascade.
      void Promise.resolve().then(() => {
        if (active) setStatus("unsupported");
      });
      return () => {
        active = false;
      };
    }

    client
      .analyze(fen, {
        onUpdate: (update) => {
          if (!active) return;
          setAnalysis(update);
          setStatus(client.status);
        },
      })
      .then(() => {
        if (active) setStatus(client.status);
      });

    return () => {
      active = false;
    };
  }, [fen, enabled]);

  const current = enabled && analysis && analysis.key === analysisKey(fen) ? analysis : null;
  return { analysis: current, status };
}
