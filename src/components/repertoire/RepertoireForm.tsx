"use client";

import { useState } from "react";
import { REPERTOIRE_LIMITS } from "@/lib/repertoire/limits";
import type { Repertoire } from "@/lib/repertoire/types";
import type { Side } from "@/lib/review/types";

export type RepertoireFormValues = {
  name: string;
  side: Side;
  category: string | null;
};

type RepertoireFormProps = {
  /** Répertoire à modifier ; absent pour une création. */
  initial?: Repertoire;
  /** Valeurs proposées pour une création (par exemple depuis un PGN importé). */
  defaults?: Partial<RepertoireFormValues>;
  /** Titre et libellé du bouton, pour les cas particuliers (import). */
  title?: string;
  submitLabel?: string;
  /** Catégories existantes, proposées à la saisie. */
  categories: string[];
  /** Renvoie un message d'erreur, ou null si l'enregistrement a réussi. */
  onSubmit: (values: RepertoireFormValues) => string | null;
  onCancel: () => void;
};

const SIDES: { side: Side; label: string; symbol: string }[] = [
  { side: "white", label: "Blancs", symbol: "♔" },
  { side: "black", label: "Noirs", symbol: "♚" },
];

export function RepertoireForm({
  initial,
  defaults,
  title,
  submitLabel,
  categories,
  onSubmit,
  onCancel,
}: RepertoireFormProps) {
  const [name, setName] = useState(initial?.name ?? defaults?.name ?? "");
  const [side, setSide] = useState<Side>(initial?.side ?? defaults?.side ?? "white");
  const [category, setCategory] = useState(initial?.category ?? defaults?.category ?? "");
  const [error, setError] = useState<string | null>(null);

  const isEdit = initial !== undefined;
  const hasContent = (initial?.children.length ?? 0) > 0;
  const sideChanged = isEdit && hasContent && side !== initial.side;

  const submit = () => {
    const message = onSubmit({ name, side, category: category.trim() === "" ? null : category });
    setError(message);
  };

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-slate-600 bg-slate-800/70 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
        {title ?? (isEdit ? "Modifier le répertoire" : "Nouveau répertoire")}
      </h2>

      <label className="flex flex-col gap-1 text-xs text-slate-400">
        Nom
        <input
          type="text"
          value={name}
          autoFocus
          maxLength={REPERTOIRE_LIMITS.maxNameLength}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && name.trim() !== "") submit();
          }}
          placeholder="Mon 1.e4 contre la Sicilienne"
          className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
        />
      </label>

      <fieldset className="flex flex-col gap-1">
        <legend className="mb-1 text-xs text-slate-400">Vous jouez avec les…</legend>
        <div className="grid grid-cols-2 gap-2">
          {SIDES.map((option) => (
            <button
              key={option.side}
              type="button"
              aria-pressed={side === option.side}
              onClick={() => setSide(option.side)}
              className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                side === option.side
                  ? "border-emerald-400/70 bg-emerald-500/25 text-emerald-100"
                  : "border-slate-600 bg-slate-900/60 text-slate-300 hover:border-slate-400"
              }`}
            >
              <span className="mr-1">{option.symbol}</span>
              {option.label}
            </button>
          ))}
        </div>
        {sideChanged && (
          <p className="text-xs text-amber-300">
            Changer de couleur ne modifie pas les coups : seul le camp qui joue change.
          </p>
        )}
      </fieldset>

      <label className="flex flex-col gap-1 text-xs text-slate-400">
        Catégorie (facultatif)
        <input
          type="text"
          value={category}
          list="repertoire-categories"
          maxLength={REPERTOIRE_LIMITS.maxCategoryLength}
          onChange={(event) => setCategory(event.target.value)}
          placeholder="Ex. 1.e4 contre la Sicilienne"
          className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
        />
        <datalist id="repertoire-categories">
          {categories.map((existing) => (
            <option key={existing} value={existing} />
          ))}
        </datalist>
      </label>

      {error && <p className="text-xs text-rose-300">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          disabled={name.trim() === ""}
          onClick={submit}
          className="flex-1 rounded-lg border border-emerald-400/40 bg-emerald-500/20 px-3 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitLabel ?? (isEdit ? "Enregistrer" : "Créer et ouvrir")}
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