import type { CSSProperties } from "react";

import type { PanelMode } from "@/hooks/useTrainerMode";
import type { Side } from "@/lib/review/types";

/** Écran qui pilote l'échiquier. Tous les écrans hors éditeur / révision se comportent comme le tutoriel. */
export type BoardModeKind = "editor" | "review" | "tutorial";

export type SquareStyles = Record<string, CSSProperties>;
export type BoardArrow = [string, string];

/** Couleur des flèches d'indice en révision (les autres modes gardent la couleur par défaut de l'échiquier). */
export const REVIEW_HINT_ARROW_COLOR = "#22c55e";

/** Couleur de la flèche du meilleur coup Stockfish (distincte des flèches de cours). */
export const ENGINE_ARROW_COLOR = "#3b82f6";

/** Ce que chaque écran expose à l'échiquier (sous-ensemble structurel de son manager). */
export type BoardInteraction = {
  handlePieceDrop: (source: string, target: string | null) => boolean;
  handleSquareClick: (square: string) => void;
};

export type EditorBoardSource = BoardInteraction & {
  lastMoveSquares: SquareStyles;
  currentNode: { arrows?: BoardArrow[] } | null;
  /** Couleur du répertoire ouvert (null si aucun). */
  side: Side | null;
};

export type ReviewBoardSource = BoardInteraction & {
  errorSquares: SquareStyles;
  hintArrows: BoardArrow[];
  /** Couleur choisie pour la révision (null tant qu'elle n'est pas lancée). */
  side: Side | null;
};

export type TutorialBoardSource = BoardInteraction & {
  activeNode: { arrows?: BoardArrow[] } | null;
  userColor: Side;
};

export type BoardControllerInput = {
  panelMode: PanelMode;
  /** Styles de cases du jeu de base (sélection, coups possibles…). */
  baseSquareStyles: SquareStyles;
  editor: EditorBoardSource;
  review: ReviewBoardSource;
  tutorial: TutorialBoardSource;
  /** Meilleur coup du moteur pour la position affichée (`null` / absent : aucun). */
  engineBestMove?: BoardArrow | null;
};

/** Contrat unique entre l'écran actif et l'échiquier. */
export type BoardController = {
  kind: BoardModeKind;
  orientation: Side;
  squareStyles: SquareStyles;
  arrows: BoardArrow[] | undefined;
  /** `undefined` = couleur par défaut de l'échiquier. */
  arrowColor: string | undefined;
  onPieceDrop: (source: string, target: string | null) => boolean;
  onSquareClick: (square: string) => void;
  /** Barre d'évaluation et flèche du moteur affichées sur cet écran. */
  showEngine: boolean;
  /** Flèche du meilleur coup (`null` si masquée ou inconnue). */
  engineArrow: BoardArrow | null;
};

export function boardModeKind(panelMode: PanelMode): BoardModeKind {
  if (panelMode === "repertoire_editor") return "editor";
  if (panelMode === "review_active") return "review";
  return "tutorial";
}

/**
 * Écrans de navigation (menu et les trois options choisies mais pas encore lancées) :
 * l'échiquier y est libre, et jouer un coup ouvre le mode Exploration.
 */
const BROWSING_MODES: readonly PanelMode[] = ["menu", "opening_selector", "review_setup", "repertoire_list"];

export function isBrowsingScreen(panelMode: PanelMode): boolean {
  return BROWSING_MODES.includes(panelMode);
}

/** Un coup vient d'être ajouté à la partie depuis un écran de navigation. */
export function shouldEnterExplorer(panelMode: PanelMode, previousPlies: number, plies: number): boolean {
  return isBrowsingScreen(panelMode) && plies > previousPlies;
}

/**
 * L'analyse Stockfish est masquée pendant les exercices (révision, apprentissage
 * d'une ligne) : elle donnerait la réponse. Elle reste disponible ailleurs.
 */
export function engineAllowed(panelMode: PanelMode): boolean {
  return panelMode !== "review_active" && panelMode !== "learning_active";
}

/**
 * Décide, selon l'écran affiché, qui reçoit les coups joués sur l'échiquier,
 * quelles flèches / cases sont surlignées et dans quel sens l'échiquier est orienté.
 *
 * Ordre de fusion des styles : dans l'éditeur, la sélection courante recouvre la
 * surbrillance du dernier coup ; en révision, les cases d'erreur recouvrent la sélection.
 */
export function resolveBoardController(input: BoardControllerInput): BoardController {
  const { panelMode, baseSquareStyles, editor, review, tutorial } = input;
  const kind = boardModeKind(panelMode);
  const showEngine = engineAllowed(panelMode);
  const engine = { showEngine, engineArrow: showEngine ? (input.engineBestMove ?? null) : null };

  switch (kind) {
    case "editor":
      return {
        kind,
        orientation: editor.side ?? tutorial.userColor,
        squareStyles: { ...editor.lastMoveSquares, ...baseSquareStyles },
        arrows: editor.currentNode?.arrows,
        arrowColor: undefined,
        onPieceDrop: editor.handlePieceDrop,
        onSquareClick: editor.handleSquareClick,
        ...engine,
      };
    case "review":
      return {
        kind,
        orientation: review.side ?? tutorial.userColor,
        squareStyles: { ...baseSquareStyles, ...review.errorSquares },
        arrows: review.hintArrows,
        arrowColor: REVIEW_HINT_ARROW_COLOR,
        onPieceDrop: review.handlePieceDrop,
        onSquareClick: review.handleSquareClick,
        ...engine,
      };
    case "tutorial":
      return {
        kind,
        orientation: tutorial.userColor,
        squareStyles: baseSquareStyles,
        arrows: tutorial.activeNode?.arrows,
        arrowColor: undefined,
        onPieceDrop: tutorial.handlePieceDrop,
        onSquareClick: tutorial.handleSquareClick,
        ...engine,
      };
  }
}
