"use client";

import { useState } from "react";
import { downloadTextFile } from "@/lib/browser/download";
import { slugifyFilename } from "@/lib/repertoire/pgn/filename";
import { exportPgn } from "@/lib/repertoire/pgn/export";
import { formatMoveCount } from "@/lib/repertoire/grouping";
import { countNodes } from "@/lib/repertoire/repertoireTree";
import type { Repertoire } from "@/lib/repertoire/types";

type PgnExportPanelProps = {
  repertoire: Repertoire;
  onClose: () => void;
};

/** Export du répertoire en PGN : copie dans le presse-papiers ou téléchargement. */
export function PgnExportPanel({ repertoire, onClose }: PgnExportPanelProps) {
  const [status, setStatus] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(exportPgn(repertoire));
      setStatus({ kind: "ok", text: "PGN copié dans le presse-papiers." });
    } catch {
      setStatus({ kind: "error", text: "Copie impossible dans ce navigateur : utilisez le téléchargement." });
    }
  };

  const download = () => {
    downloadTextFile(`${slugifyFilename(repertoire.name)}.pgn`, exportPgn(repertoire));
    setStatus({ kind: "ok", text: "Fichier téléchargé." });
  };

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Exporter en PGN</h2>
      <p className="text-xs leading-relaxed text-slate-400">
        « {repertoire.name} » ({formatMoveCount(countNodes(repertoire))}) sera exporté avec ses variantes,
        ses symboles, ses commentaires et ses flèches. Le fichier peut être importé dans Lichess.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void copy()}
          className="rounded-lg border border-emerald-400/40 bg-emerald-500/20 px-3 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/30"
        >
          Copier le PGN
        </button>
        <button
          type="button"
          onClick={download}
          className="rounded-lg border border-sky-400/40 bg-sky-500/20 px-3 py-2 text-sm font-semibold text-sky-100 transition hover:bg-sky-500/30"
        >
          Télécharger (.pgn)
        </button>
      </div>

      {status && (
        <p className={status.kind === "ok" ? "text-xs text-emerald-300" : "text-xs text-rose-300"} role="status">
          {status.text}
        </p>
      )}

      <button
        type="button"
        onClick={onClose}
        className="w-fit rounded-lg border border-slate-600 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-slate-700/60"
      >
        Fermer
      </button>
    </section>
  );
}
