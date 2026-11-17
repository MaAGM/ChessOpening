"use client";

import { useState } from "react";
import type { RepertoireEditor } from "@/hooks/useRepertoireEditor";
import { formatMoveCount } from "@/lib/repertoire/grouping";
import { REPERTOIRE_LIMITS, getLimitStatus } from "@/lib/repertoire/limits";
import { EDITOR_SHORTCUTS } from "@/lib/repertoire/shortcuts";
import { countNodes } from "@/lib/repertoire/repertoireTree";
import { EditorToolbar } from "./EditorToolbar";
import { MoveInspector } from "./MoveInspector";
import { PgnExportPanel } from "./PgnExportPanel";
import { PgnImporter } from "./PgnImporter";
import { VariationTree } from "./VariationTree";

type RepertoireEditorPanelProps = {
  editor: RepertoireEditor;
};

/** Éditeur d'un répertoire : barre d'outils, arbre des variantes, annotations, import / export PGN. */
export function RepertoireEditorPanel({ editor }: RepertoireEditorPanelProps) {
  const { repertoire } = editor;
  const [pgnMode, setPgnMode] = useState<"import" | "export" | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);

  if (!repertoire) {
    return (
      <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
        Ce répertoire n&apos;existe plus. Revenez à la liste.
      </p>
    );
  }

  const pending = editor.pendingDelete;
  const nodeCount = countNodes(repertoire);
  const limitStatus = getLimitStatus(nodeCount, REPERTOIRE_LIMITS.maxNodes);

  const openPgn = (mode: "import" | "export") => {
    setImportMessage(null);
    setPgnMode(mode);
  };

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-2">
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-slate-100">{repertoire.name}</h2>
          <p className="text-xs text-slate-400">
            {repertoire.side === "white" ? "Blancs" : "Noirs"} ·{" "}
            {formatMoveCount(countNodes(repertoire))}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={() => openPgn("import")}
            className="rounded-lg border border-slate-600 px-2 py-1 text-xs text-slate-200 transition hover:bg-slate-700/60"
          >
            Importer PGN
          </button>
          <button
            type="button"
            onClick={() => openPgn("export")}
            className="rounded-lg border border-slate-600 px-2 py-1 text-xs text-slate-200 transition hover:bg-slate-700/60"
          >
            Exporter PGN
          </button>
        </div>
      </header>

      {editor.persistError && (
        <p
          role="alert"
          className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-2 text-xs leading-relaxed text-rose-200"
        >
          {editor.persistError}
        </p>
      )}

      {importMessage && (
        <p
          role="status"
          className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-2 text-xs text-emerald-200"
        >
          {importMessage}
        </p>
      )}

      {editor.notice && (
        <p className="flex items-start justify-between gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-2 text-xs text-amber-100">
          <span>{editor.notice}</span>
          <button
            type="button"
            onClick={editor.dismissNotice}
            aria-label="Fermer le message"
            className="text-amber-200 hover:text-amber-50"
          >
            ✕
          </button>
        </p>
      )}

      {limitStatus !== "ok" && (
        <p
          role="status"
          className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-2 text-xs leading-relaxed text-amber-100"
        >
          {limitStatus === "full"
            ? `Limite atteinte : ${REPERTOIRE_LIMITS.maxNodes} coups. Les nouveaux coups sont refusés : supprimez des branches ou répartissez vos lignes dans plusieurs répertoires.`
            : `Ce répertoire approche de la limite (${nodeCount} / ${REPERTOIRE_LIMITS.maxNodes} coups). Exportez-le en PGN et répartissez vos lignes dans plusieurs répertoires.`}
        </p>
      )}

      {editor.invalidCount > 0 && (
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-2 text-xs text-amber-100">
          {editor.invalidCount} coup{editor.invalidCount > 1 ? "s" : ""} illégal
          {editor.invalidCount > 1 ? "s" : ""} (barrés dans l&apos;arbre) : supprimez-les pour
          nettoyer ce répertoire.
        </p>
      )}

      {pgnMode === "import" ? (
        <PgnImporter
          title="Importer un PGN"
          confirmLabel={(count) => `Ajouter jusqu'à ${formatMoveCount(count)}`}
          onConfirm={(analysis) => {
            const result = editor.importTree(analysis.children);
            if (!result) return "Ce répertoire n'existe plus.";
            setImportMessage(
              result.added > 0
                ? `${formatMoveCount(result.added)} ajouté${result.added > 1 ? "s" : ""} (annulable avec Ctrl+Z).`
                : "Ces coups figuraient déjà dans le répertoire : rien à ajouter.",
            );
            setPgnMode(null);
            return null;
          }}
          onCancel={() => setPgnMode(null)}
        />
      ) : pgnMode === "export" ? (
        <PgnExportPanel repertoire={repertoire} onClose={() => setPgnMode(null)} />
      ) : (
        <>
          <EditorToolbar
            canUndo={editor.canUndo}
            canRedo={editor.canRedo}
            canPromote={editor.canPromote}
            canMakeMainLine={editor.canMakeMainLine}
            canDelete={editor.canDelete}
            onUndo={editor.undo}
            onRedo={editor.redo}
            onPromote={editor.promote}
            onMakeMainLine={editor.makeMainLine}
            onDelete={editor.requestDelete}
          />

          {pending && (
            <div
              role="alertdialog"
              aria-label="Confirmer la suppression"
              className="flex flex-col gap-2 rounded-lg border border-rose-500/40 bg-rose-500/10 p-2"
            >
              <p className="text-xs text-rose-100">
                Supprimer <strong>{pending.san}</strong> et ses {pending.size - 1} coup
                {pending.size - 1 > 1 ? "s" : ""} suivant{pending.size - 1 > 1 ? "s" : ""} ?
                L&apos;action est annulable (Ctrl+Z).
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={editor.confirmDelete}
                  className="rounded-lg border border-rose-400/50 bg-rose-500/25 px-3 py-1 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/40"
                >
                  Supprimer (Entrée)
                </button>
                <button
                  type="button"
                  onClick={editor.cancelDelete}
                  className="rounded-lg border border-slate-600 px-3 py-1 text-xs text-slate-300 transition hover:bg-slate-700/60"
                >
                  Annuler (Échap)
                </button>
              </div>
            </div>
          )}

          <div className="min-h-28 flex-1 overflow-y-auto rounded-lg border border-slate-700 bg-slate-900/50 p-2">
            <VariationTree
              root={editor.root}
              fens={editor.fens}
              transpositions={editor.transpositions}
              cursorId={editor.cursorId}
              onSelect={editor.goTo}
              emptyContent={
                <div className="flex flex-col gap-2">
                  <p className="font-medium text-slate-100">Ce répertoire est vide.</p>
                  <ol className="list-decimal pl-4 text-xs leading-relaxed text-slate-400">
                    <li>Jouez vos coups sur l&apos;échiquier : chaque coup crée la ligne.</li>
                    <li>
                      Revenez en arrière (← ou un clic dans l&apos;arbre) et jouez une alternative
                      pour ajouter une variante.
                    </li>
                    <li>Ou importez un PGN (étude Lichess, partie annotée…).</li>
                  </ol>
                  <button
                    type="button"
                    onClick={() => openPgn("import")}
                    className="w-fit rounded-lg border border-sky-400/40 bg-sky-500/15 px-3 py-1.5 text-xs font-semibold text-sky-100 transition hover:bg-sky-500/25"
                  >
                    Importer un PGN
                  </button>
                </div>
              }
            />
          </div>

          <MoveInspector
            node={editor.currentNode}
            ply={editor.cursorPly}
            onToggleSymbol={editor.toggleSymbol}
            onSetComment={(nodeId, comment) => editor.annotate(nodeId, { comment })}
          />

          <div>
            <button
              type="button"
              aria-expanded={showShortcuts}
              onClick={() => setShowShortcuts((open) => !open)}
              className="text-[11px] text-slate-400 underline transition hover:text-slate-200"
            >
              Raccourcis clavier
            </button>
            {showShortcuts && (
              <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-[11px] text-slate-400">
                {EDITOR_SHORTCUTS.map((shortcut) => (
                  <div key={shortcut.keys} className="contents">
                    <dt className="font-medium text-slate-200">{shortcut.keys}</dt>
                    <dd>{shortcut.description}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </>
      )}
    </section>
  );
}