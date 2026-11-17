import { Chess } from "chess.js";
import type { Arrow, TutorialNode } from "@/lib/data/openings/types";
import type { MoveSymbol, TreeRoot } from "@/lib/repertoire/types";
import { toPositionKey } from "@/lib/review/positionKey";
import type { BookMove, PositionNote } from "./types";

/**
 * Source annotée à fouiller : un répertoire de l'utilisateur (arbre `RepertoireNode`,
 * avec symboles) ou un chapitre Masterclass (arbre `TutorialNode`, sans symboles).
 */
export type AnnotatedSource =
  | { kind: "repertoire"; id: string; name: string; root: TreeRoot }
  | { kind: "tutorial"; id: string; name: string; root: TutorialNode };

export type BookAnnotations = {
  /** Coups prévus depuis la position, ligne principale en tête. */
  bookMoves: BookMove[];
  /** Commentaires du coup qui a mené à la position. */
  positionNotes: PositionNote[];
};

export const DEFAULT_CONTINUATION_PLIES = 8;

/** Forme commune aux deux arbres ; children[0] = ligne principale. */
type GenericNode = {
  san: string;
  symbol?: MoveSymbol;
  comment?: string;
  arrows?: Arrow[];
  children: GenericNode[];
};

function fromRepertoire(root: TreeRoot): GenericNode[] {
  // Un RepertoireNode a déjà la forme attendue (champs supplémentaires ignorés).
  return root.children;
}

function fromTutorial(root: TutorialNode): GenericNode[] {
  const convert = (children: Record<string, TutorialNode> | undefined): GenericNode[] =>
    Object.entries(children ?? {}).map(([san, node]) => ({
      san,
      ...(node.explanation ? { comment: node.explanation } : {}),
      ...(node.arrows && node.arrows.length > 0 ? { arrows: node.arrows } : {}),
      children: convert(node.children),
    }));
  return convert(root.children);
}

function mainContinuation(node: GenericNode, maxPlies: number): string[] {
  const line: string[] = [];
  let current = node.children[0];
  while (current && line.length < maxPlies) {
    line.push(current.san);
    current = current.children[0];
  }
  return line;
}

const hasText = (text: string | undefined): text is string =>
  typeof text === "string" && text.trim().length > 0;

/**
 * Rassemble, dans toutes les sources, les coups prévus depuis la position `fen`
 * et les commentaires du coup qui y mène. Les transpositions sont prises en compte
 * (comparaison par clé de position, comme le graphe de révision).
 *
 * Doublons (même source, même coup atteint par deux ordres de coups) : la première
 * occurrence est gardée, complétée par les annotations des suivantes si elle en manque.
 */
export function collectBookAnnotations(
  sources: readonly AnnotatedSource[],
  fen: string,
  options: { continuationPlies?: number } = {},
): BookAnnotations {
  const target = toPositionKey(fen);
  const maxPlies = options.continuationPlies ?? DEFAULT_CONTINUATION_PLIES;
  const bookMoves: BookMove[] = [];
  const positionNotes: PositionNote[] = [];

  for (const source of sources) {
    const roots = source.kind === "repertoire" ? fromRepertoire(source.root) : fromTutorial(source.root);
    const game = new Chess();

    const addBookMove = (child: GenericNode, canonicalSan: string, isMainLine: boolean) => {
      const existing = bookMoves.find((m) => m.sourceId === source.id && m.san === canonicalSan);
      if (existing) {
        existing.isMainLine ||= isMainLine;
        if (!existing.symbol && child.symbol) existing.symbol = child.symbol;
        if (!hasText(existing.comment) && hasText(child.comment)) existing.comment = child.comment;
        if (!existing.arrows?.length && child.arrows?.length) existing.arrows = child.arrows;
        return;
      }
      bookMoves.push({
        san: canonicalSan,
        sourceId: source.id,
        sourceName: source.name,
        isMainLine,
        ...(child.symbol ? { symbol: child.symbol } : {}),
        ...(hasText(child.comment) ? { comment: child.comment } : {}),
        ...(child.arrows?.length ? { arrows: child.arrows } : {}),
        continuation: mainContinuation(child, maxPlies),
      });
    };

    const addNote = (node: GenericNode, canonicalSan: string) => {
      if (!hasText(node.comment) && !node.arrows?.length) return;
      const duplicate = positionNotes.some(
        (n) => n.sourceId === source.id && n.san === canonicalSan && n.comment === node.comment,
      );
      if (duplicate) return;
      positionNotes.push({
        sourceId: source.id,
        sourceName: source.name,
        san: canonicalSan,
        ...(hasText(node.comment) ? { comment: node.comment } : {}),
        ...(node.arrows?.length ? { arrows: node.arrows } : {}),
      });
    };

    // Parcours en profondeur avec une seule instance (move / undo).
    const walk = (children: GenericNode[]) => {
      const atTarget = toPositionKey(game.fen()) === target;
      children.forEach((child, index) => {
        let san: string;
        try {
          san = game.move(child.san).san;
        } catch {
          return; // coup invalide : branche ignorée, comme dans le graphe de révision
        }
        if (atTarget) addBookMove(child, san, index === 0);
        if (toPositionKey(game.fen()) === target) addNote(child, san);
        walk(child.children);
        game.undo();
      });
    };

    walk(roots);
  }

  // Lignes principales d'abord ; tri stable, l'ordre des sources est conservé.
  const ordered = [...bookMoves].sort((a, b) => Number(b.isMainLine) - Number(a.isMainLine));
  return { bookMoves: ordered, positionNotes };
}
