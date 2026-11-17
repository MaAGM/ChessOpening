"use client";

import { useMemo, useState } from "react";
import { useRepertoireStore } from "@/hooks/useRepertoireStore";
import {
  formatBytes,
  getLocalStorageUsageBytes,
  storageUsageRatio,
} from "@/lib/browser/storageUsage";
import {
  filterBySide,
  formatMoveCount,
  groupByCategory,
  listCategories,
  type SideFilter,
} from "@/lib/repertoire/grouping";
import type { RepertoireError } from "@/lib/repertoire/repertoireStore";
import { RepertoireCard } from "./RepertoireCard";
import { PgnImporter, type PgnAnalysis } from "./PgnImporter";
import { RepertoireForm, type RepertoireFormValues } from "./RepertoireForm";

type FormState =
  | { kind: "create" }
  | { kind: "edit"; id: string }
  | { kind: "import" }
  | { kind: "import-details"; analysis: PgnAnalysis }
  | null;

const ERROR_MESSAGES: Record<RepertoireError, string> = {
  "invalid-name": "Donnez un nom au répertoire.",
  "not-found": "Ce répertoire n'existe plus.",
  "limit-reached": "Ce répertoire dépasse la limite de coups autorisée.",
  "invalid-order": "Ordre invalide.",
};

const FILTERS: { value: SideFilter; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "white", label: "Blancs" },
  { value: "black", label: "Noirs" },
];

type RepertoireListPanelProps = {
  /** Ouvre un répertoire dans l'éditeur. */
  onOpen: (id: string) => void;
};

/** Gestion des répertoires : créer, renommer, catégoriser, copier, supprimer, ouvrir. */
export function RepertoireListPanel({ onOpen }: RepertoireListPanelProps) {
  const store = useRepertoireStore();
  const [filter, setFilter] = useState<SideFilter>("all");
  const [form, setForm] = useState<FormState>(null);

  const categories = useMemo(() => listCategories(store.repertoires), [store.repertoires]);
  const groups = useMemo(
    () => groupByCategory(filterBySide(store.repertoires, filter)),
    [store.repertoires, filter],
  );
  const counts = useMemo(
    () => ({
      all: store.repertoires.length,
      white: filterBySide(store.repertoires, "white").length,
      black: filterBySide(store.repertoires, "black").length,
    }),
    [store.repertoires],
  );

  const editing = form?.kind === "edit" ? store.getRepertoire(form.id) : null;

  // Espace occupé par les données du site : on prévient avant que la sauvegarde n'échoue.
  const storageBytes = useMemo(() => getLocalStorageUsageBytes(), [store.repertoires]); // eslint-disable-line react-hooks/exhaustive-deps
  const storageNearlyFull = storageUsageRatio(storageBytes) >= 0.8;

  /** Création d'un répertoire à partir d'un PGN analysé. */
  const handleImportSubmit = (analysis: PgnAnalysis) => (values: RepertoireFormValues): string | null => {
    const result = store.addRepertoire({
      name: values.name,
      side: values.side,
      category: values.category,
      reviewEnabled: true,
      children: analysis.children,
      origin: { kind: "custom" },
    });
    if (!result.ok) return ERROR_MESSAGES[result.error];
    setForm(null);
    onOpen(result.value);
    return null;
  };

  const handleSubmit = (values: RepertoireFormValues): string | null => {
    if (form?.kind === "edit") {
      const result = store.updateRepertoireMeta(form.id, values);
      if (!result.ok) return ERROR_MESSAGES[result.error];
      setForm(null);
      return null;
    }

    const result = store.createRepertoire(values);
    if (!result.ok) return ERROR_MESSAGES[result.error];
    setForm(null);
    onOpen(result.value);
    return null;
  };

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-3">
      <h2 className="text-center text-sm font-semibold uppercase tracking-wide text-slate-300">
        Mes répertoires
      </h2>

      {store.persistError && (
        <p
          role="alert"
          className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-xs leading-relaxed text-rose-200"
        >
          {store.persistError}
        </p>
      )}

      {storageNearlyFull && (
        <p
          role="status"
          className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-100"
        >
          L&apos;espace de stockage du navigateur est presque plein ({formatBytes(storageBytes)} utilisés
          sur environ 5 Mo). Exportez vos répertoires en PGN pour les sauvegarder, puis supprimez ceux
          dont vous n&apos;avez plus besoin.
        </p>
      )}

      {form?.kind === "import" ? (
        <PgnImporter
          title="Importer un PGN"
          confirmLabel={() => "Continuer"}
          onConfirm={(analysis) => {
            setForm({ kind: "import-details", analysis });
            return null;
          }}
          onCancel={() => setForm(null)}
        />
      ) : form?.kind === "import-details" ? (
        <RepertoireForm
          key="import-details"
          title="Nouveau répertoire depuis un PGN"
          submitLabel={`Importer ${formatMoveCount(form.analysis.report.nodeCount)}`}
          defaults={{
            name: form.analysis.suggestedName ?? "",
            side: form.analysis.suggestedSide ?? "white",
          }}
          categories={categories}
          onSubmit={handleImportSubmit(form.analysis)}
          onCancel={() => setForm(null)}
        />
      ) : form ? (
        <RepertoireForm
          // Une clé différente par répertoire réinitialise les champs
          key={form.kind === "edit" ? form.id : "create"}
          initial={editing ?? undefined}
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={() => setForm(null)}
        />
      ) : (
        <>
          <button
            type="button"
            onClick={() => setForm({ kind: "create" })}
            className="rounded-xl border border-emerald-400/40 bg-emerald-500/20 px-4 py-2.5 text-left text-sm font-semibold text-emerald-100 transition hover:border-emerald-300/70 hover:bg-emerald-500/30"
          >
            + Nouveau répertoire
          </button>
          <button
            type="button"
            onClick={() => setForm({ kind: "import" })}
            className="rounded-xl border border-sky-400/40 bg-sky-500/15 px-4 py-2 text-left text-sm font-semibold text-sky-100 transition hover:border-sky-300/70 hover:bg-sky-500/25"
          >
            Importer un PGN
          </button>

          {store.repertoires.length > 0 && (
            <div className="flex gap-1" role="group" aria-label="Filtrer par couleur">
              {FILTERS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={filter === option.value}
                  onClick={() => setFilter(option.value)}
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    filter === option.value
                      ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-100"
                      : "border-slate-600 text-slate-400 hover:border-slate-400"
                  }`}
                >
                  {option.label} ({counts[option.value]})
                </button>
              ))}
            </div>
          )}

          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
            {store.repertoires.length === 0 ? (
              <p className="rounded-lg border border-slate-500/30 bg-slate-700/20 p-3 text-sm leading-relaxed text-slate-300">
                Aucun répertoire pour l&apos;instant. Créez-en un pour commencer à saisir vos
                lignes : vous pourrez jouer vos coups sur l&apos;échiquier, et revenir en arrière
                pour ajouter des variantes sans tout rejouer.
              </p>
            ) : groups.length === 0 ? (
              <p className="text-sm text-slate-400">Aucun répertoire pour cette couleur.</p>
            ) : (
              groups.map((group) => (
                <div key={group.key} className="flex flex-col gap-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {group.label} · {group.items.length}
                  </h3>
                  {group.items.map((repertoire) => (
                    <RepertoireCard
                      key={repertoire.id}
                      repertoire={repertoire}
                      onOpen={() => onOpen(repertoire.id)}
                      onEdit={() => setForm({ kind: "edit", id: repertoire.id })}
                      onDuplicate={() => store.duplicateRepertoire(repertoire.id)}
                      onDelete={() => store.deleteRepertoire(repertoire.id)}
                      onToggleReview={(enabled) =>
                        store.updateRepertoireMeta(repertoire.id, { reviewEnabled: enabled })
                      }
                    />
                  ))}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </section>
  );
}