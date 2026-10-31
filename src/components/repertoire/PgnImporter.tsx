"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { readFileAsText } from "@/lib/browser/download";
import { REPERTOIRE_LIMITS } from "@/lib/repertoire/limits";
import { importPgn, type PgnImportResult } from "@/lib/repertoire/pgn/import";

/** Résultat d'une analyse réussie (arbre prêt à être ajouté, rapport, suggestions). */
export type PgnAnalysis = Extract<PgnImportResult, { ok: true }>;

const MAX_MB = REPERTOIRE_LIMITS.maxPgnBytes / (1024 * 1024);

const ERROR_MESSAGES = {
  empty: "Collez un PGN ou choisissez un fichier.",
  "too-large": `Texte trop volumineux (maximum ${MAX_MB} Mo).`,
  "no-game": "Aucune partie reconnue dans ce texte.",
} as const;

type PgnImporterProps = {
  title: string;
  /** Texte du bouton de confirmation, selon le nombre de coups trouvés. */
  confirmLabel: (nodeCount: number) => string;
  /** Appelé quand une analyse réussit (pour préremplir des champs). */
  onAnalyzed?: (analysis: PgnAnalysis) => void;
  /** Confirmation : renvoie un message d'erreur, ou null si tout s'est bien passé. */
  onConfirm: (analysis: PgnAnalysis) => string | null;
  onCancel: () => void;
};

/** Saisie d'un PGN (collé ou fichier), analyse avec rapport, puis confirmation. */
export function PgnImporter({ title, confirmLabel, onAnalyzed, onConfirm, onCancel }: PgnImporterProps) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [analysis, setAnalysis] = useState<PgnImportResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement | null>(null);

  const analyze = async (source: string) => {
    setBusy(true);
    setMessage(null);
    await new Promise((resolve) => setTimeout(resolve, 0)); // laisse afficher « Analyse… »
    const result = importPgn(source);
    setBusy(false);
    setAnalysis(result);
    if (result.ok) onAnalyzed?.(result);
  };

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // permet de rechoisir le même fichier
    if (!file) return;

    if (file.size > REPERTOIRE_LIMITS.maxPgnBytes) {
      setAnalysis({ ok: false, error: "too-large" });
      return;
    }
    try {
      const content = await readFileAsText(file);
      setText(content);
      await analyze(content);
    } catch {
      setMessage("Impossible de lire ce fichier.");
    }
  };

  const confirm = () => {
    if (!analysis?.ok) return;
    setMessage(onConfirm(analysis));
  };

  const ready = analysis?.ok === true && analysis.report.nodeCount > 0;

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">{title}</h2>

      <textarea
        aria-label="Texte PGN"
        value={text}
        rows={6}
        placeholder="Collez ici un PGN (partie, étude Lichess exportée…)"
        onChange={(event) => {
          setText(event.target.value);
          setAnalysis(null); // le rapport ne correspond plus au texte
          setMessage(null);
        }}
        className="resize-none rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 font-mono text-xs text-slate-100 placeholder:text-slate-500"
      />

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileInput}
          type="file"
          accept=".pgn,.txt,text/plain"
          aria-label="Fichier PGN"
          onChange={(event) => void handleFile(event)}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-slate-700/60"
        >
          Choisir un fichier…
        </button>
        <button
          type="button"
          disabled={busy || text.trim() === ""}
          onClick={() => void analyze(text)}
          className="rounded-lg border border-sky-400/40 bg-sky-500/20 px-3 py-1.5 text-xs font-semibold text-sky-100 transition hover:bg-sky-500/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Analyse…" : "Analyser"}
        </button>
      </div>

      {analysis && !analysis.ok && (
        <p role="alert" className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-2 text-xs text-rose-200">
          {ERROR_MESSAGES[analysis.error]}
        </p>
      )}

      {analysis?.ok && <AnalysisReport analysis={analysis} />}

      {message && (
        <p role="alert" className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-2 text-xs text-rose-200">
          {message}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          disabled={!ready}
          onClick={confirm}
          className="flex-1 rounded-lg border border-emerald-400/40 bg-emerald-500/20 px-3 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {analysis?.ok ? confirmLabel(analysis.report.nodeCount) : "Importer"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-700/60"
        >
          Annuler
        </button>
      </div>
    </section>
  );
}

function AnalysisReport({ analysis }: { analysis: PgnAnalysis }) {
  const { report } = analysis;
  const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? "s" : ""}`;

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-slate-600 bg-slate-800/70 p-2 text-xs text-slate-200">
      <p>
        <strong>{plural(report.gamesFound, "partie")}</strong> trouvée{report.gamesFound > 1 ? "s" : ""},{" "}
        {report.gamesImported} importable{report.gamesImported > 1 ? "s" : ""} ·{" "}
        <strong>{plural(report.nodeCount, "coup")}</strong>
        {report.gamesFound > 1 ? " (parties fusionnées)" : ""}
      </p>

      {report.nodeCount === 0 && <p className="text-amber-200">Rien à importer dans ce texte.</p>}

      {report.truncated && (
        <p className="text-amber-200">
          Import partiel : la limite de {REPERTOIRE_LIMITS.maxNodes} coups est atteinte.
        </p>
      )}

      {report.skipped.length > 0 && (
        <ul className="list-disc pl-4 text-amber-200">
          {report.skipped.map((skipped) => (
            <li key={skipped.game}>
              Partie {skipped.game} ignorée : {skipped.reason}.
            </li>
          ))}
        </ul>
      )}

      {report.issueCount > 0 && (
        <details>
          <summary className="cursor-pointer text-amber-200">
            {plural(report.issueCount, "problème")} (les lignes concernées sont ignorées)
          </summary>
          <ul className="mt-1 list-disc pl-4 text-slate-300">
            {report.issues.map((issue, index) => (
              <li key={index}>
                Partie {issue.game} : {issue.message}
              </li>
            ))}
            {report.issueCount > report.issues.length && (
              <li>… et {report.issueCount - report.issues.length} autres.</li>
            )}
          </ul>
        </details>
      )}
    </div>
  );
}
