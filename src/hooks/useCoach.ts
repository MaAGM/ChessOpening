"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { analyzeMistake, type CoachAnalysis, type CoachEngine, type CoachMistake } from "@/lib/coach";
import type { CoachExplainer } from "@/lib/convex/coachRemote";

/**
 * État du panneau Coach pour la dernière erreur :
 *  - `idle`       : aucune erreur dans la ligne en cours ;
 *  - `analyzing`  : analyse locale (moteur) en cours ;
 *  - `ready`      : verdict local disponible, explication pas encore demandée ;
 *  - `thinking`   : explication demandée au serveur ;
 *  - `explained`  : explication reçue ;
 *  - `quota`      : quota atteint (`retryAfterMs` avant le prochain essai) ;
 *  - `error`      : analyse impossible ou Coach indisponible.
 */
export type CoachState =
  | { status: "idle" }
  | { status: "analyzing" }
  | { status: "ready"; analysis: CoachAnalysis }
  | { status: "thinking"; analysis: CoachAnalysis }
  | { status: "explained"; analysis: CoachAnalysis; text: string; cached: boolean }
  | { status: "quota"; analysis: CoachAnalysis; retryAfterMs: number }
  | { status: "error"; analysis: CoachAnalysis | null; message: string };

export type IdentifiedMistake = CoachMistake & { id: number };

export type UseCoachParams = {
  /** Dernière erreur de la révision (null : rien à expliquer). */
  mistake: IdentifiedMistake | null;
  /** Nom de l'ouverture affiché au moment de l'erreur. */
  openingName?: string | null;
  /** Moteur local (lu au moment de l'analyse) ; null : diagnostic « non évalué ». */
  getEngine: () => CoachEngine | null;
  /** Appel serveur ; null pour un invité (aucune explication possible). */
  explainer: CoachExplainer | null;
};

type Entry = { id: number; state: CoachState };

const ANALYSIS_ERROR = "Impossible d'analyser cette position.";
const SERVER_ERROR = "Le Coach est momentanément indisponible. Réessaie dans un instant.";

/**
 * Coach IA de la révision : analyse locale à chaque nouvelle erreur, puis explication
 * du LLM à la demande (`explain`). Aucun état n'est partagé avec les stores : changer
 * d'erreur abandonne l'analyse et ignore une réponse arrivée en retard.
 */
export function useCoach({ mistake, openingName = null, getEngine, explainer }: UseCoachParams) {
  const [entry, setEntry] = useState<Entry | null>(null);
  const mistakeId = mistake?.id ?? null;
  const currentIdRef = useRef<number | null>(mistakeId);

  // Valeurs lues au lancement de l'analyse, sans la relancer quand elles changent.
  const inputsRef = useRef({ mistake, openingName, getEngine });
  useEffect(() => {
    currentIdRef.current = mistakeId;
    inputsRef.current = { mistake, openingName, getEngine };
  });

  useEffect(() => {
    const { mistake: current, openingName: name, getEngine: engine } = inputsRef.current;
    if (mistakeId === null || !current) return;

    const controller = new AbortController();
    analyzeMistake({ ...current, openingName: name }, engine(), { signal: controller.signal })
      .then((analysis) => {
        if (controller.signal.aborted) return;
        setEntry({
          id: mistakeId,
          state: analysis
            ? { status: "ready", analysis }
            : { status: "error", analysis: null, message: ANALYSIS_ERROR },
        });
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setEntry({ id: mistakeId, state: { status: "error", analysis: null, message: ANALYSIS_ERROR } });
        }
      });
    return () => controller.abort();
  }, [mistakeId]);

  const state: CoachState =
    mistakeId === null
      ? { status: "idle" }
      : entry?.id === mistakeId
        ? entry.state
        : { status: "analyzing" };

  const analysis = "analysis" in state ? state.analysis : null;
  const canExplain =
    explainer !== null &&
    analysis !== null &&
    (state.status === "ready" || state.status === "quota" || state.status === "error");

  const explain = useCallback(async () => {
    if (!canExplain || !explainer || !analysis || mistakeId === null) return;
    const id = mistakeId;
    const update = (next: CoachState) => {
      if (currentIdRef.current === id) setEntry({ id, state: next });
    };

    update({ status: "thinking", analysis });
    try {
      const result = await explainer(analysis.prompt.user);
      if (result.status === "ok") {
        update({ status: "explained", analysis, text: result.text, cached: result.cached });
      } else if (result.status === "quota") {
        update({ status: "quota", analysis, retryAfterMs: result.retryAfterMs });
      } else {
        update({ status: "error", analysis, message: result.message });
      }
    } catch {
      update({ status: "error", analysis, message: SERVER_ERROR });
    }
  }, [canExplain, explainer, analysis, mistakeId]);

  return { state, canExplain, explain };
}

export type Coach = ReturnType<typeof useCoach>;
