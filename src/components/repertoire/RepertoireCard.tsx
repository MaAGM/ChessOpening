"use client";

import { useState } from "react";
import { formatMoveCount } from "@/lib/repertoire/grouping";
import { countNodes } from "@/lib/repertoire/repertoireTree";
import type { Repertoire } from "@/lib/repertoire/types";

type RepertoireCardProps = {
  repertoire: Repertoire;
  onOpen: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
};

export function RepertoireCard({
  repertoire,
  onOpen,
  onEdit,
  onDuplicate,
  onDelete,
}: RepertoireCardProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const isWhite = repertoire.side === "white";

  return (
    <article className="flex flex-col gap-2 rounded-xl border border-slate-700 bg-slate-800 p-3">
      <div className="flex items-start gap-2">
        <span
          title={isWhite ? "Blancs" : "Noirs"}
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-base ${
            isWhite ? "bg-slate-100 text-slate-900" : "bg-slate-900 text-slate-100 ring-1 ring-slate-500"
          }`}
        >
          {isWhite ? "♔" : "♚"}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-100">{repertoire.name}</p>
          <p className="text-xs text-slate-400">
            {isWhite ? "Blancs" : "Noirs"} · {formatMoveCount(countNodes(repertoire))} · modifié le{" "}
            {new Date(repertoire.updatedAt).toLocaleDateString("fr-FR")}
          </p>
        </div>
      </div>

      {confirmingDelete ? (
        <div className="flex flex-col gap-2 rounded-lg border border-rose-500/40 bg-rose-500/10 p-2">
          <p className="text-xs text-rose-100">
            Supprimer « {repertoire.name} » et tous ses coups ? Cette action est définitive. Vos
            statistiques de révision sont conservées.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onDelete}
              className="rounded-lg border border-rose-400/50 bg-rose-500/25 px-3 py-1.5 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/40"
            >
              Supprimer
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-slate-700/60"
            >
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpen}
            className="rounded-lg border border-emerald-400/40 bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-500/30"
          >
            Ouvrir
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="text-xs text-slate-400 underline transition hover:text-slate-200"
          >
            Modifier
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            className="text-xs text-slate-400 underline transition hover:text-slate-200"
          >
            Copier
          </button>
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="ml-auto text-xs text-rose-300 underline transition hover:text-rose-200"
          >
            Supprimer
          </button>
        </div>
      )}
    </article>
  );
}
