"use client";

import { Fragment, useEffect, useRef, type ReactNode, type RefObject } from "react";
import { formatMove } from "@/lib/repertoire/notation";
import { ROOT_ID, type RepertoireNode, type TreeRoot } from "@/lib/repertoire/types";

type TreeContext = {
  fens: ReadonlyMap<string, string>;
  cursorId: string;
  onSelect: (id: string) => void;
  activeRef: RefObject<HTMLButtonElement | null>;
};

function MoveToken({
  node,
  ply,
  showNumber,
  ctx,
}: {
  node: RepertoireNode;
  ply: number;
  showNumber: boolean;
  ctx: TreeContext;
}) {
  const active = node.id === ctx.cursorId;
  const valid = ctx.fens.has(node.id);

  return (
    <button
      ref={active ? ctx.activeRef : undefined}
      type="button"
      aria-current={active ? "true" : undefined}
      title={node.comment ?? (valid ? undefined : "Coup illégal dans cette position")}
      onClick={() => ctx.onSelect(node.id)}
      className={`inline rounded px-1 py-0.5 text-left font-medium transition ${
        active
          ? "bg-[#D4AF37]/25 text-[#D4AF37]"
          : valid
            ? "text-slate-100 hover:bg-slate-700/60"
            : "text-rose-300 line-through hover:bg-rose-500/10"
      }`}
    >
      {formatMove(ply, node.san, node.symbol, showNumber)}
      {node.comment && <span aria-label="commenté" className="ml-0.5 text-[10px] text-sky-300">●</span>}
    </button>
  );
}

/**
 * Une ligne : la suite principale se déroule à plat, et chaque alternative à un coup
 * s'affiche en retrait juste après lui. La boucle évite une récursion par coup : seule
 * l'imbrication des variantes est récursive.
 */
function Line({ siblings, ply, ctx }: { siblings: RepertoireNode[]; ply: number; ctx: TreeContext }) {
  const parts: ReactNode[] = [];
  let current = siblings;
  let currentPly = ply;
  let needsNumber = true; // un coup noir est numéroté en début de ligne ou après une variante

  while (current.length > 0) {
    const [main, ...alternatives] = current;

    parts.push(
      <Fragment key={main.id}>
        <MoveToken node={main} ply={currentPly} showNumber={needsNumber} ctx={ctx} />{" "}
      </Fragment>,
    );

    for (const alternative of alternatives) {
      parts.push(
        <div
          key={alternative.id}
          className="my-1 ml-2 border-l border-slate-600 pl-2 text-slate-300"
        >
          (<Line siblings={[alternative]} ply={currentPly} ctx={ctx} />)
        </div>,
      );
    }

    needsNumber = alternatives.length > 0;
    current = main.children;
    currentPly += 1;
  }

  return <>{parts}</>;
}

type VariationTreeProps = {
  root: TreeRoot;
  fens: ReadonlyMap<string, string>;
  cursorId: string;
  onSelect: (id: string) => void;
};

/** Arbre des variantes sous forme de liste de coups, avec les variantes en retrait. */
export function VariationTree({ root, fens, cursorId, onSelect }: VariationTreeProps) {
  const activeRef = useRef<HTMLButtonElement | null>(null);

  // Le coup affiché reste visible quand on navigue au clavier dans une longue ligne.
  useEffect(() => {
    activeRef.current?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
  }, [cursorId]);

  const ctx: TreeContext = { fens, cursorId, onSelect, activeRef };

  return (
    <div className="text-sm leading-7">
      <button
        type="button"
        aria-current={cursorId === ROOT_ID ? "true" : undefined}
        onClick={() => onSelect(ROOT_ID)}
        className={`mb-1 rounded px-1.5 py-0.5 text-xs transition ${
          cursorId === ROOT_ID
            ? "bg-[#D4AF37]/25 text-[#D4AF37]"
            : "text-slate-400 hover:bg-slate-700/60"
        }`}
      >
        Position initiale
      </button>

      {root.children.length === 0 ? (
        <p className="text-slate-400">
          Aucun coup pour l&apos;instant. Jouez votre premier coup sur l&apos;échiquier.
        </p>
      ) : (
        <div>
          <Line siblings={root.children} ply={0} ctx={ctx} />
        </div>
      )}
    </div>
  );
}