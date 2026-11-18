"use client";

import type { Coach } from "@/hooks/useCoach";
import { formatPlayerScore, type CoachAnalysis, type CoachVerdict, type MoveEvaluation } from "@/lib/coach";
import { formatMove } from "@/lib/repertoire/notation";
import { Button } from "@/components/ui/Button";
import { Callout, type CalloutTone } from "@/components/ui/Callout";
import { Panel } from "@/components/ui/Panel";

/** Accès au Coach IA : l'explication du LLM est réservée aux utilisateurs connectés. */
export type CoachAccess = "loading" | "guest" | "authenticated" | "unconfigured";

type CoachPanelProps = {
  coach: Coach;
  access: CoachAccess;
  onSignIn: () => void;
};

const VERDICTS: Record<CoachVerdict, { label: string; tone: CalloutTone }> = {
  tactical_blunder: { label: "Gaffe tactique", tone: "danger" },
  strategic_error: { label: "Erreur stratégique", tone: "warning" },
  inaccuracy: { label: "Imprécision", tone: "warning" },
  playable_deviation: { label: "Coup jouable, hors répertoire", tone: "info" },
  unevaluated: { label: "Non évalué par le moteur", tone: "info" },
};

function formatRetry(ms: number): string {
  const minutes = Math.ceil(ms / 60_000);
  return minutes <= 1 ? "dans une minute" : `dans ${minutes} minutes`;
}

function EvaluationRow({ label, evaluation, ply }: { label: string; evaluation: MoveEvaluation; ply: number }) {
  return (
    <li className="flex items-baseline justify-between gap-3">
      <span className="text-slate-300">
        {label} <span className="font-semibold text-slate-100">{formatMove(ply, evaluation.san, undefined, true)}</span>
      </span>
      <span className="font-mono text-xs text-slate-400">{formatPlayerScore(evaluation.score)}</span>
    </li>
  );
}

/** Verdict local (moteur), disponible pour tous, connecté ou non. */
function LocalVerdict({ analysis }: { analysis: CoachAnalysis }) {
  const { context } = analysis;
  const { assessment, ply } = context;
  const verdict = VERDICTS[assessment.verdict];
  const { played, reference, engineBest } = assessment;
  const showEngineBest = engineBest && engineBest.san !== reference?.san && engineBest.san !== played?.san;
  const expected = context.bookMoves.map((move) => move.san);

  return (
    <div className="flex flex-col gap-3" data-testid="coach-verdict">
      <Callout tone={verdict.tone} as="p" className="px-3 py-2 text-sm font-semibold text-slate-100">
        {verdict.label}
      </Callout>
      <ul className="flex flex-col gap-1 text-sm">
        {played ? (
          <EvaluationRow label="Ton coup" evaluation={played} ply={ply} />
        ) : (
          <li className="text-slate-300">
            Ton coup <span className="font-semibold text-slate-100">{formatMove(ply, context.playedSan, undefined, true)}</span>
          </li>
        )}
        {reference ? (
          <EvaluationRow
            label={reference.origin === "book" ? "Répertoire" : "Moteur"}
            evaluation={reference}
            ply={ply}
          />
        ) : expected.length > 0 ? (
          <li className="text-slate-300">
            Répertoire : <span className="font-semibold text-slate-100">{expected.join(", ")}</span>
          </li>
        ) : null}
        {showEngineBest ? <EvaluationRow label="Moteur" evaluation={engineBest} ply={ply} /> : null}
      </ul>
    </div>
  );
}

/**
 * Panneau Coach IA (slot `coach` de TrainerLayout) : verdict local à chaque erreur,
 * explication du LLM à la demande pour un utilisateur connecté.
 */
export function CoachPanel({ coach, access, onSignIn }: CoachPanelProps) {
  const { state, canExplain, explain } = coach;
  const analysis = "analysis" in state ? state.analysis : null;

  return (
    <Panel className="flex w-80 flex-col gap-3 text-slate-200" aria-live="polite" aria-label="Coach IA">
      <h2 className="text-sm font-bold uppercase tracking-wide text-[#D4AF37]">Coach IA</h2>

      {state.status === "idle" ? (
        <p className="text-sm text-slate-400">
          Joue ta ligne : si tu t&apos;écartes du répertoire, le Coach analysera ton coup.
        </p>
      ) : null}

      {state.status === "analyzing" ? <p className="text-sm text-slate-400">Analyse de la position…</p> : null}

      {analysis ? <LocalVerdict analysis={analysis} /> : null}

      {analysis && access === "guest" ? (
        <Callout tone="info" className="flex flex-col gap-2 p-3 text-sm text-slate-200">
          <p>Connecte-toi pour obtenir l&apos;explication détaillée du Coach.</p>
          <Button className="px-3 py-1.5 text-sm" onClick={onSignIn}>
            Se connecter avec Google
          </Button>
        </Callout>
      ) : null}

      {analysis && access === "unconfigured" ? (
        <p className="text-xs text-slate-400">L&apos;explication du Coach nécessite un compte connecté.</p>
      ) : null}

      {access === "authenticated" && state.status === "ready" ? (
        <Button className="px-3 py-2 text-sm" onClick={() => void explain()} disabled={!canExplain}>
          Expliquer
        </Button>
      ) : null}

      {state.status === "thinking" ? <p className="text-sm text-slate-400">Le Coach réfléchit…</p> : null}

      {state.status === "explained" ? (
        <p className="whitespace-pre-line text-sm leading-relaxed text-slate-100" data-testid="coach-explanation">
          {state.text}
        </p>
      ) : null}

      {state.status === "quota" ? (
        <Callout tone="warning" as="p" className="p-3 text-sm text-slate-200">
          Tu as atteint ta limite d&apos;explications. Réessaie {formatRetry(state.retryAfterMs)}.
        </Callout>
      ) : null}

      {state.status === "error" ? (
        <Callout tone="danger" as="p" className="p-3 text-sm text-slate-200">
          {state.message}
        </Callout>
      ) : null}

      {access === "authenticated" && (state.status === "quota" || state.status === "error") && canExplain ? (
        <Button variant="link" className="self-start" onClick={() => void explain()}>
          Réessayer
        </Button>
      ) : null}
    </Panel>
  );
}
