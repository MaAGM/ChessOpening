"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Chess, type Square } from "chess.js";

import { useReviewStore } from "@/hooks/useReviewStore";
import type { PanelMode } from "@/hooks/useTrainerMode";
import type { Arrow } from "@/lib/data/openings/types";
import {
  buildReviewTreeForSide,
  getReviewChapters,
  type Side,
} from "@/lib/review/reviewRepertoire";
import {
  getExpectedMoves,
  getHintArrows,
  getNodeAtPath,
  isLeaf,
  pickRandomChild,
  sanToSquares,
  type ReviewNode,
} from "@/lib/review/reviewTree";

const COMPUTER_MOVE_DELAY_MS = 400;

export type ReviewManagerParams = {
  /** Current board position in FEN */
  currentFen: string;
  /** Hook from useChessGame – executes a move */
  onPieceDrop: (source: string, target: string | null) => boolean;
  /** Hook from useChessGame – informs the board about a clicked square */
  onSquareClick: (square: string) => void;
  /** Reset the board to the starting position */
  resetGame: () => void;
  /** Clear selection + move dots after a refused move */
  clearSelection: () => void;
  /** Current UI mode – owned by useTrainerMode */
  panelMode: PanelMode;
  /** Side the user trains with – owned by useTrainerMode */
  reviewSide: Side | null;
};

export type ReviewFeedback = {
  message: string;
  /** Case d'arrivée du mauvais coup, surlignée en rouge */
  wrongSquare: string;
  /** Flèches vers les bons coups, affichées sur l'échiquier */
  arrows: Arrow[];
};

export type ReviewStats = {
  completedLines: number;
  perfectLines: number;
  mistakes: number;
};

const EMPTY_STATS: ReviewStats = { completedLines: 0, perfectLines: 0, mistakes: 0 };

/**
 * Gameplay du mode Révision : le joueur est testé sur l'arbre fusionné de ses
 * chapitres sauvegardés. Il ne possède ni le mode ni l'échiquier : il lit
 * `panelMode` / `reviewSide` et pilote le plateau via les callbacks de useChessGame.
 */
export function useReviewManager(params: ReviewManagerParams) {
  const {
    currentFen,
    onPieceDrop,
    onSquareClick,
    resetGame,
    clearSelection,
    panelMode,
    reviewSide,
  } = params;

  const { reviewChapterIds } = useReviewStore();

  // ----------------------------------------------------------------------
  // État de la session
  // ----------------------------------------------------------------------
  const [path, setPath] = useState<string[]>([]);
  const [moveFrom, setMoveFrom] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<ReviewFeedback | null>(null);
  const [stats, setStats] = useState<ReviewStats>(EMPTY_STATS);
  /** Erreurs de la dernière ligne terminée (null tant que la ligne est en cours) */
  const [finishedLineMistakes, setFinishedLineMistakes] = useState<number | null>(null);
  /** Erreurs de la ligne en cours (ref : lu dans des callbacks asynchrones) */
  const lineMistakesRef = useRef(0);

  // onPieceDrop est recréé à chaque rendu par useChessGame : on garde la dernière
  // version dans une ref pour que le timer de l'ordinateur ne soit pas relancé en boucle.
  const onPieceDropRef = useRef(onPieceDrop);
  useEffect(() => {
    onPieceDropRef.current = onPieceDrop;
  });

  // ----------------------------------------------------------------------
  // Données dérivées
  // ----------------------------------------------------------------------
  const isReviewMode = panelMode === "review_active" && reviewSide !== null;

  const tree = useMemo(
    () =>
      isReviewMode && reviewSide ? buildReviewTreeForSide(reviewSide, reviewChapterIds) : null,
    [isReviewMode, reviewSide, reviewChapterIds],
  );

  const node = useMemo(() => (tree ? getNodeAtPath(tree, path) : null), [tree, path]);

  const sideToMove: Side = path.length % 2 === 0 ? "white" : "black";
  const isLineFinished = node !== null && isLeaf(node);
  const isPlayerTurn = isReviewMode && node !== null && !isLineFinished && sideToMove === reviewSide;
  const isComputerTurn =
    isReviewMode && node !== null && !isLineFinished && sideToMove !== reviewSide;

  const chapterNameById = useMemo(() => {
    if (!reviewSide) return new Map<string, string>();
    return new Map(getReviewChapters(reviewSide, reviewChapterIds).map((c) => [c.id, c.name]));
  }, [reviewSide, reviewChapterIds]);

  /** Chapitres dont une ligne passe par la position courante (vide à la racine). */
  const currentChapterNames = useMemo(() => {
    if (!node || path.length === 0) return [];
    return node.chapterIds
      .map((id) => chapterNameById.get(id))
      .filter((name): name is string => Boolean(name));
  }, [node, path.length, chapterNameById]);

  // ----------------------------------------------------------------------
  // Actions internes
  // ----------------------------------------------------------------------
  /** Enregistre un coup valide (joueur ou ordinateur) et détecte la fin de ligne. */
  const advance = useCallback((san: string, nextNode: ReviewNode) => {
    setPath((p) => [...p, san]);
    setFeedback(null);
    setMoveFrom(null);

    if (isLeaf(nextNode)) {
      const mistakes = lineMistakesRef.current;
      setFinishedLineMistakes(mistakes);
      setStats((s) => ({
        ...s,
        completedLines: s.completedLines + 1,
        perfectLines: s.perfectLines + (mistakes === 0 ? 1 : 0),
      }));
    }
  }, []);

  /** Coup légal mais hors répertoire : on compte l'erreur et on affiche les bons coups. */
  const registerMistake = (wrongSquare: string) => {
    if (!node) return;
    lineMistakesRef.current += 1;
    setStats((s) => ({ ...s, mistakes: s.mistakes + 1 }));

    const expected = getExpectedMoves(node);
    const hint =
      expected.length > 1
        ? `Coups possibles : ${expected.join(", ")}.`
        : `Coup attendu : ${expected[0]}.`;

    setFeedback({
      message: `Ce coup n'est pas dans votre répertoire. ${hint}`,
      wrongSquare,
      arrows: getHintArrows(currentFen, node),
    });
  };

  /** Joue le coup sur une copie de la position ; null s'il est illégal. */
  const previewMove = (from: string, to: string) => {
    try {
      return new Chess(currentFen).move({ from, to, promotion: "q" });
    } catch {
      return null;
    }
  };

  // ----------------------------------------------------------------------
  // Interactions du joueur
  // ----------------------------------------------------------------------
  const handlePieceDrop = (sourceSquare: string, targetSquare: string | null) => {
    // Coup refusé : la pièce revient et on efface sélection + points d'aide.
    const reject = () => {
      clearSelection();
      return false;
    };

    if (!isPlayerTurn || !node || !targetSquare) return reject();

    const move = previewMove(sourceSquare, targetSquare);
    if (!move) return reject(); // coup illégal : pas d'erreur comptée

    if (!getExpectedMoves(node).includes(move.san)) {
      registerMistake(targetSquare);
      return reject();
    }

    const moved = onPieceDrop(sourceSquare, targetSquare);
    if (moved) advance(move.san, node.children[move.san]);
    return moved;
  };

  const handleSquareClick = (square: string) => {
    if (!isPlayerTurn || !node) return;

    const position = new Chess(currentFen);
    const clicked = position.get(square as Square);
    const isOwnPiece = Boolean(clicked) && clicked?.color === position.turn();

    // 1) Aucune sélection : on ne sélectionne qu'une de ses propres pièces
    if (!moveFrom) {
      if (isOwnPiece) {
        setMoveFrom(square);
        onSquareClick(square);
      }
      return;
    }

    // 2) Clic sur la même case : désélection
    if (moveFrom === square) {
      setMoveFrom(null);
      onSquareClick(square);
      return;
    }

    // 3) Clic sur une autre de ses pièces : changement de sélection
    if (isOwnPiece) {
      setMoveFrom(square);
      onSquareClick(square);
      return;
    }

    // 4) Tentative de coup
    const move = previewMove(moveFrom, square);
    if (!move) return; // destination illégale : on garde la sélection

    if (getExpectedMoves(node).includes(move.san)) {
      onSquareClick(square); // useChessGame applique le coup
      advance(move.san, node.children[move.san]);
    } else {
      registerMistake(square);
      onSquareClick(moveFrom); // désélectionne côté useChessGame
      setMoveFrom(null);
    }
  };

  // ----------------------------------------------------------------------
  // Coup automatique de l'ordinateur (réponse tirée au hasard dans l'arbre)
  // ----------------------------------------------------------------------
  useEffect(() => {
    if (!isComputerTurn || !node) return;

    const timer = setTimeout(() => {
      const pick = pickRandomChild(node);
      if (!pick) return;

      const squares = sanToSquares(currentFen, pick.san);
      if (!squares) return;

      if (onPieceDropRef.current(squares.from, squares.to)) {
        advance(pick.san, pick.node);
      }
    }, COMPUTER_MOVE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [isComputerTurn, node, currentFen, advance]);

  // ----------------------------------------------------------------------
  // Contrôle de session
  // ----------------------------------------------------------------------
  const clearLineState = () => {
    setPath([]);
    setMoveFrom(null);
    setFeedback(null);
    setFinishedLineMistakes(null);
    lineMistakesRef.current = 0;
  };

  /** Nouvelle ligne : l'échiquier repart de la position initiale. */
  const restartLine = () => {
    resetGame();
    clearLineState();
  };

  /**
   * Remet la session à zéro (stats comprises), sans toucher à l'échiquier.
   * À appeler au démarrage d'une révision et au retour au menu.
   */
  const resetSession = () => {
    clearLineState();
    setStats(EMPTY_STATS);
  };

  /** Surlignage rouge de la case d'arrivée du dernier mauvais coup. */
  const errorSquares = useMemo<Record<string, CSSProperties>>(
    () =>
      feedback ? { [feedback.wrongSquare]: { backgroundColor: "rgba(239, 68, 68, 0.45)" } } : {},
    [feedback],
  );

  /** Vrai quand une ligne est en cours (au moins un coup joué, pas encore terminée). */
  const canRestartLine = isReviewMode && path.length > 0 && !isLineFinished;

  return {
    // État
    hasRepertoire: tree !== null,
    isPlayerTurn,
    isComputerTurn,
    isLineFinished,
    canRestartLine,
    finishedLineMistakes,
    feedback,
    hintArrows: feedback?.arrows ?? [],
    errorSquares,
    currentChapterNames,
    stats,

    // Handlers
    handlePieceDrop,
    handleSquareClick,
    restartLine,
    resetSession,
  };
}

export type ReviewManager = ReturnType<typeof useReviewManager>;