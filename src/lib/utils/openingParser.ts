import { Chess } from "chess.js";
import type { Arrow, TutorialNode } from "@/lib/data/openings/types";

export type Annotation = string | { text: string; arrows?: Arrow[] };

const DEFAULT_END = "🎉 Variante terminée ! Vous maîtrisez cette ligne.";

function normalize(a?: Annotation): { text?: string; arrows?: Arrow[] } {
  if (a === undefined) return {};
  if (typeof a === "string") return { text: a };
  return { text: a.text, arrows: a.arrows?.length ? a.arrows : undefined };
}

/**
 * Construit l'arbre de tutoriel à partir de lignes de coups et d'annotations.
 *
 * Convention : annotations[i] explique le coup i (demi-coup, 0 = 1er coup blanc),
 * et annotations[nbCoups] est le texte de fin de variante.
 *
 * Règle d'affichage : le panneau montre l'explication du nœud atteint après le
 * dernier coup joué. On attache donc le texte aux nœuds des coups de l'ORDI :
 *   explication du coup de l'ordi + explication du coup que le joueur doit jouer.
 * Les nœuds des coups du joueur n'affichent rien.
 *
 * - Blancs (isBlackRepertoire = false) : ordi = indices impairs, la racine
 *   affiche annotations[0] (ton premier coup).
 * - Noirs  (isBlackRepertoire = true)  : ordi = indices pairs, racine vide
 *   (l'ordi joue d'abord).
 */
export function buildTreeFromMoves(
  moveLines: string[],
  annotations: Annotation[] = [],
  isBlackRepertoire: boolean = false,
): TutorialNode {
  const rootNorm = isBlackRepertoire ? {} : normalize(annotations[0]);
  const root: TutorialNode = {
    explanation: rootNorm.text,
    arrows: rootNorm.arrows,
    children: {},
  };

  for (const line of moveLines) {
    const cleanMoves = line
      .replace(/\d+\./g, "")
      .replace(/\*/g, "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    let currentNode = root;
    const game = new Chess();
    let played = 0;

    for (let i = 0; i < cleanMoves.length; i++) {
      const san = cleanMoves[i];

      try {
        game.move(san);
      } catch {
        console.warn(`[OpeningParser] Coup invalide ignoré : "${san}" dans la ligne : ${line}`);
        break;
      }

      currentNode.children ??= {};

      if (!currentNode.children[san]) {
        // Noirs : l'ordi = Blancs = indices pairs. Blancs : l'ordi = Noirs = indices impairs.
        const isComputerMove = isBlackRepertoire ? i % 2 === 0 : i % 2 === 1;

        let text: string | undefined;
        let arrows: Arrow[] | undefined;

        if (isComputerMove) {
          // Coup de l'ordi qui vient d'être joué + coup que TU dois jouer ensuite
          const own = normalize(annotations[i]);
          const next = normalize(annotations[i + 1]);
          const texts = [own.text, next.text].filter(Boolean);
          text = texts.length > 0 ? texts.join("\n\n") : undefined;
          arrows = next.arrows ?? own.arrows;
        }
        // Coup du joueur : rien à afficher, il vient de le jouer

        currentNode.children[san] = {
          move: san,
          explanation: text,
          ...(arrows && { arrows }),
          children: {},
        };
      }

      currentNode = currentNode.children[san];
      played++;
    }

    // Fin de variante : l'entrée juste après le dernier coup
    if (played === cleanMoves.length && played > 0) {
      const endText = normalize(annotations[cleanMoves.length]).text ?? DEFAULT_END;

      if (!currentNode.explanation?.includes(endText)) {
        currentNode.explanation = currentNode.explanation
          ? `${currentNode.explanation}\n\n${endText}`
          : endText;
      }
    }
  }

  return root;
}