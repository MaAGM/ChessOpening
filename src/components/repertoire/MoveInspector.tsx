"use client";

import { useEffect, useRef, useState } from "react";
import { REPERTOIRE_LIMITS } from "@/lib/repertoire/limits";
import { SYMBOL_LABELS, formatMove } from "@/lib/repertoire/notation";
import { MOVE_SYMBOLS, type MoveSymbol, type RepertoireNode } from "@/lib/repertoire/types";

type MoveInspectorProps = {
  /** Coup affiché (null à la position initiale). */
  node: RepertoireNode | null;
  /** Nombre de coups depuis le début de la ligne jusqu'à ce coup (1 = premier coup des Blancs). */
  ply: number;
  onToggleSymbol: (symbol: MoveSymbol) => void;
  onSetComment: (nodeId: string, comment: string) => void;
};

/** Annotation du coup affiché : appréciation (! ? !! ?? !? ?!) et commentaire. */
export function MoveInspector({ node, ply, onToggleSymbol, onSetComment }: MoveInspectorProps) {
  if (!node) {
    return (
      <p className="rounded-lg border border-slate-700 bg-slate-900/40 p-2 text-xs text-slate-500">
        Sélectionnez un coup pour l&apos;annoter.
      </p>
    );
  }

  // Une clé par coup : le brouillon du commentaire repart de zéro quand on change de coup.
  return (
    <InspectorBody
      key={node.id}
      node={node}
      label={formatMove(ply - 1, node.san, node.symbol)}
      onToggleSymbol={onToggleSymbol}
      onSetComment={onSetComment}
    />
  );
}

function InspectorBody({
  node,
  label,
  onToggleSymbol,
  onSetComment,
}: {
  node: RepertoireNode;
  label: string;
  onToggleSymbol: (symbol: MoveSymbol) => void;
  onSetComment: (nodeId: string, comment: string) => void;
}) {
  const incoming = node.comment ?? "";

  // Le champ suit le commentaire enregistré quand il change ailleurs (annulation,
  // autre onglet) — état dérivé calculé pendant le rendu, sans effet.
  const [saved, setSaved] = useState(incoming);
  const [draft, setDraft] = useState(incoming);
  if (incoming !== saved) {
    setSaved(incoming);
    setDraft(incoming);
  }

  // Les refs permettent d'enregistrer le brouillon à la fermeture du champ, même depuis
  // un nettoyage d'effet qui n'a pas vu les derniers rendus.
  const draftRef = useRef(draft);
  const storedRef = useRef(incoming);
  const onSetCommentRef = useRef(onSetComment);
  useEffect(() => {
    storedRef.current = incoming;
    onSetCommentRef.current = onSetComment;
  });

  const commit = () => {
    if (draftRef.current.trim() === storedRef.current.trim()) return;
    onSetCommentRef.current(node.id, draftRef.current);
  };

  // Navigation vers un autre coup ou sortie de l'éditeur : le brouillon est enregistré.
  // (Sans changement réel, l'enregistrement est ignoré : l'appel est sans danger.)
  useEffect(() => () => commit(), []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section
      aria-label="Annotation du coup"
      className="flex flex-col gap-2 rounded-lg border border-slate-700 bg-slate-900/40 p-2"
    >
      <p className="text-xs text-slate-400">
        Coup sélectionné : <strong className="text-slate-100">{label}</strong>
      </p>

      <div className="flex gap-1" role="group" aria-label="Appréciation du coup">
        {MOVE_SYMBOLS.map((symbol) => (
          <button
            key={symbol}
            type="button"
            title={`${symbol} — ${SYMBOL_LABELS[symbol]}`}
            aria-label={SYMBOL_LABELS[symbol]}
            aria-pressed={node.symbol === symbol}
            onClick={() => onToggleSymbol(symbol)}
            className={`min-w-9 rounded-md border px-2 py-1 text-sm font-semibold transition ${
              node.symbol === symbol
                ? "border-[#D4AF37]/70 bg-[#D4AF37]/25 text-[#D4AF37]"
                : "border-slate-600 text-slate-300 hover:bg-slate-700/60"
            }`}
          >
            {symbol}
          </button>
        ))}
      </div>

      <textarea
        aria-label="Commentaire du coup"
        value={draft}
        rows={3}
        maxLength={REPERTOIRE_LIMITS.maxCommentLength}
        placeholder="Plan, idée, piège… (enregistré en quittant le champ)"
        onChange={(event) => {
          draftRef.current = event.target.value;
          setDraft(event.target.value);
        }}
        onBlur={commit}
        className="resize-none rounded-md border border-slate-600 bg-slate-900 px-2 py-1.5 text-xs leading-relaxed text-slate-100 placeholder:text-slate-500"
      />
    </section>
  );
}
