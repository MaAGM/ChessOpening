import { Chess } from "chess.js";

import { parsePgn, type PgnNode } from "@/lib/repertoire/pgn/parse";
import type { Arrow, Side, TutorialNode } from "./types";

export const DEFAULT_LESSON_END = "🎉 Variante terminée ! Vous maîtrisez cette ligne.";

const join = (...texts: (string | undefined)[]): string | undefined => {
  const kept = texts.filter((t): t is string => Boolean(t));
  return kept.length > 0 ? kept.join("\n\n") : undefined;
};

/**
 * Construit l'arbre d'un cours à partir de son PGN annoté (parseur PGN interne).
 *
 * Dans le PGN, un commentaire explique le coup qui le précède. Le panneau d'apprentissage,
 * lui, affiche le texte du nœud atteint après le dernier coup joué, et c'est l'ordinateur
 * qui répond aussitôt aux coups du joueur. Le texte est donc placé sur les nœuds de l'ORDI :
 *   commentaire du coup de l'ordi + commentaire du coup que le joueur doit jouer ensuite
 *   (avec ses flèches, qui montrent ce coup sur l'échiquier).
 *  - Les nœuds des coups du joueur n'affichent rien (il vient de jouer).
 *  - La racine affiche le commentaire d'introduction, plus celui du premier coup pour les Blancs.
 *  - Une fin de variante affiche la conclusion du cours (ou un message par défaut).
 *
 * Chaque coup est vérifié avec chess.js : un coup illégal lève une erreur (donnée invalide).
 */
export function buildLessonTree(pgn: string, side: Side, conclusion?: string): TutorialNode {
  const [game] = parsePgn(pgn);
  if (!game || game.children.length === 0) throw new Error("PGN de cours vide.");
  if (game.problems.length > 0) throw new Error(`PGN de cours invalide : ${game.problems.join(" ")}`);

  const end = conclusion ?? DEFAULT_LESSON_END;
  const chess = new Chess();
  const isComputerPly = (ply: number) => (side === "white" ? ply % 2 === 1 : ply % 2 === 0);

  const convertChildren = (nodes: PgnNode[], ply: number): Record<string, TutorialNode> => {
    const children: Record<string, TutorialNode> = {};
    for (const node of nodes) {
      const converted = convert(node, ply);
      children[converted.move!] ??= converted;
    }
    return children;
  };

  const convert = (node: PgnNode, ply: number): TutorialNode => {
    let san: string;
    try {
      san = chess.move(node.san).san;
    } catch {
      throw new Error(`Coup illégal « ${node.san} » au demi-coup ${ply + 1} du cours.`);
    }

    const children = convertChildren(node.children, ply + 1);
    chess.undo();

    const first = node.children[0];
    let explanation: string | undefined;
    let arrows: Arrow[] | undefined;

    if (!first) {
      explanation = isComputerPly(ply) ? join(node.comment, end) : end;
      arrows = isComputerPly(ply) ? node.arrows : undefined;
    } else if (isComputerPly(ply)) {
      explanation = join(node.comment, first.comment);
      arrows = first.arrows ?? node.arrows;
    }

    return {
      move: san,
      ...(explanation ? { explanation } : {}),
      ...(arrows ? { arrows } : {}),
      children,
    };
  };

  const children = convertChildren(game.children, 0);
  const first = game.children[0];
  const explanation = side === "white" ? join(game.comment, first.comment) : join(game.comment);
  const arrows = side === "white" ? first.arrows : undefined;

  return {
    ...(explanation ? { explanation } : {}),
    ...(arrows ? { arrows } : {}),
    children,
  };
}
