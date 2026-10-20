"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Chess, type Square } from "chess.js";

import { useReviewStore } from "@/hooks/useReviewStore";
import type { PanelMode } from "@/hooks/useTrainerMode";
import type { Arrow } from "@/lib/data/openings/types";
import { fenTurn } from "@/lib/review/positionKey";
import {
  evaluatePlayerMove,
  getExpectedMoves,
  getHintArrows,
  getNode,
  isLeafNode,
  sanToSquares,
  type GraphNode,
  type MoveEvaluation,
} from "@/lib/review/reviewGraph";
import { buildReviewGraphForSide, getReviewChapters } from "@/lib/review/reviewRepertoire";
import { pickWeightedMove, summarizeCards, type CardSummary } from "@/lib/review/reviewSelection";
import type { Side } from "@/lib/review/types";

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
const EMPTY_SUMMARY: CardSummary = { total: 0, new: 0, due: 0, learning: 0, mastered: 0 };

type AcceptedMove = Extract<MoveEvaluation, { kind: "book" | "transposition" }>;

/**
 * Gameplay du mode Révision.
 *
 * L'état de la partie est la POSITION courante (clé dérivée de la FEN), pas un
 * chemin de coups : une position atteinte par un ordre de coups inhabituel est
 * reconnue, et ses statistiques sont partagées quel que soit le chemin.
 *
 * Le joueur est testé sur le graphe de positions de ses chapitres sauvegardés.
 * Chaque position où c'est à lui de jouer est une fiche de répétition espacée :
 * juste du premier coup = réussite, au moins une erreur = échec.
 * Les réponses de l'ordinateur sont tirées au hasard, pondérées par l'urgence
 * des fiches de chaque branche.
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

  const { reviewChapterIds, positionStats, recordResult } = useReviewStore();

  // ----------------------------------------------------------------------
  // État de la session
  // ----------------------------------------------------------------------
  const [moveFrom, setMoveFrom] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<ReviewFeedback | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [stats, setStats] = useState<ReviewStats>(EMPTY_STATS);
  /** Erreurs de la dernière ligne terminée (null tant que la ligne est en cours) */
  const [finishedLineMistakes, setFinishedLineMistakes] = useState<number | null>(null);
  /** Horloge pour les statistiques affichées, mise à jour dans les gestionnaires d'événements */
  const [now, setNow] = useState(() => Date.now());

  /** Erreurs de la ligne en cours (ref : lu dans des callbacks asynchrones) */
  const lineMistakesRef = useRef(0);
  /** Positions déjà ratées pendant cette ligne : elles ne seront pas promues au bon coup. */
  const failedKeysRef = useRef<Set<string>>(new Set());

  // onPieceDrop est recréé à chaque rendu par useChessGame, et les statistiques
  // changent après chaque coup : on garde la dernière version dans des refs pour
  // que le timer de l'ordinateur ne soit pas relancé en boucle.
  const onPieceDropRef = useRef(onPieceDrop);
  const positionStatsRef = useRef(positionStats);
  useEffect(() => {
    onPieceDropRef.current = onPieceDrop;
    positionStatsRef.current = positionStats;
  });

  // ----------------------------------------------------------------------
  // Données dérivées
  // ----------------------------------------------------------------------
  const isReviewMode = panelMode === "review_active" && reviewSide !== null;

  const graph = useMemo(
    () =>
      isReviewMode && reviewSide ? buildReviewGraphForSide(reviewSide, reviewChapterIds) : null,
    [isReviewMode, reviewSide, reviewChapterIds],
  );

  /** Nœud de la position affichée (null si elle n'est pas dans le répertoire). */
  const node = useMemo(() => (graph ? getNode(graph, currentFen) : null), [graph, currentFen]);

  const turn = fenTurn(currentFen);
  const isLineFinished = node !== null && isLeafNode(node);
  const isOutOfRepertoire = isReviewMode && graph !== null && node === null;
  const isPlayerTurn = isReviewMode && node !== null && !isLineFinished && turn === reviewSide;
  const isComputerTurn = isReviewMode && node !== null && !isLineFinished && turn !== reviewSide;

  const chapterNameById = useMemo(() => {
    if (!reviewSide) return new Map<string, string>();
    return new Map(getReviewChapters(reviewSide, reviewChapterIds).map((c) => [c.id, c.name]));
  }, [reviewSide, reviewChapterIds]);

  /** Chapitres dont une ligne passe par la position courante (vide au départ). */
  const currentChapterNames = useMemo(() => {
    if (!node || !graph || node.key === graph.startKey) return [];
    return node.chapterIds
      .map((id) => chapterNameById.get(id))
      .filter((name): name is string => Boolean(name));
  }, [node, graph, chapterNameById]);

  /** Répartition des fiches du répertoire : nouvelles, à réviser, maîtrisées… */
  const cardSummary = useMemo(
    () =>
      graph && reviewSide ? summarizeCards(graph, reviewSide, positionStats, now) : EMPTY_SUMMARY,
    [graph, reviewSide, positionStats, now],
  );

  // ----------------------------------------------------------------------
  // Actions internes
  // ----------------------------------------------------------------------
  const finishLine = useCallback(() => {
    const mistakes = lineMistakesRef.current;
    setFinishedLineMistakes(mistakes);
    setStats((s) => ({
      ...s,
      completedLines: s.completedLines + 1,
      perfectLines: s.perfectLines + (mistakes === 0 ? 1 : 0),
    }));
  }, []);

  /** Note une fiche (position) dans le store et rafraîchit l'horloge d'affichage. */
  const recordCard = (key: string, success: boolean) => {
    recordResult(key, success);
    setNow(Date.now());
  };

  /** Coup légal mais hors répertoire : on compte l'erreur et on affiche les bons coups. */
  const registerMistake = (current: GraphNode, wrongSquare: string) => {
    lineMistakesRef.current += 1;
    setStats((s) => ({ ...s, mistakes: s.mistakes + 1 }));

    // Un seul échec par passage sur la position, même après plusieurs essais ratés.
    if (!failedKeysRef.current.has(current.key)) {
      failedKeysRef.current.add(current.key);
      recordCard(current.key, false);
    }

    const expected = getExpectedMoves(current);
    const hint =
      expected.length > 1
        ? `Coups possibles : ${expected.join(", ")}.`
        : `Coup attendu : ${expected[0]}.`;

    setFeedback({
      message: `Ce coup n'est pas dans votre répertoire. ${hint}`,
      wrongSquare,
      arrows: getHintArrows(currentFen, current),
    });
  };

  /** Coup accepté du joueur (répertoire ou transposition) : note la fiche, détecte la fin de ligne. */
  const acceptPlayerMove = (current: GraphNode, move: AcceptedMove) => {
    if (!failedKeysRef.current.has(current.key)) recordCard(current.key, true);
    failedKeysRef.current.delete(current.key);

    setFeedback(null);
    setMoveFrom(null);
    setNotice(
      move.kind === "transposition"
        ? `Transposition reconnue : ${move.san} mène à une position de votre répertoire.`
        : null,
    );

    const next = graph?.nodes.get(move.nextKey);
    if (next && isLeafNode(next)) finishLine();
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

    if (!isPlayerTurn || !node || !graph || !targetSquare) return reject();

    const evaluation = evaluatePlayerMove(graph, currentFen, sourceSquare, targetSquare);
    if (evaluation.kind === "illegal") return reject(); // pas d'erreur comptée
    if (evaluation.kind === "mistake") {
      registerMistake(node, targetSquare);
      return reject();
    }

    const moved = onPieceDrop(sourceSquare, targetSquare);
    if (moved) acceptPlayerMove(node, evaluation);
    return moved;
  };

  const handleSquareClick = (square: string) => {
    if (!isPlayerTurn || !node || !graph) return;

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
    const evaluation = evaluatePlayerMove(graph, currentFen, moveFrom, square);
    if (evaluation.kind === "illegal") return; // destination illégale : on garde la sélection

    if (evaluation.kind === "mistake") {
      registerMistake(node, square);
      onSquareClick(moveFrom); // désélectionne côté useChessGame
      setMoveFrom(null);
      return;
    }

    onSquareClick(square); // useChessGame applique le coup
    acceptPlayerMove(node, evaluation);
  };

  // ----------------------------------------------------------------------
  // Coup automatique de l'ordinateur : réponse tirée selon l'urgence des fiches
  // ----------------------------------------------------------------------
  useEffect(() => {
    if (!isComputerTurn || !node || !graph || !reviewSide) return;

    const timer = setTimeout(() => {
      const san = pickWeightedMove(graph, node, {
        playerSide: reviewSide,
        stats: positionStatsRef.current,
        now: Date.now(),
      });
      if (!san) return;

      const squares = sanToSquares(currentFen, san);
      if (!squares) return;

      if (onPieceDropRef.current(squares.from, squares.to)) {
        setFeedback(null);
        const next = graph.nodes.get(node.edges[san]);
        if (next && isLeafNode(next)) finishLine();
      }
    }, COMPUTER_MOVE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [isComputerTurn, node, graph, reviewSide, currentFen, finishLine]);

  // ----------------------------------------------------------------------
  // Contrôle de session
  // ----------------------------------------------------------------------
  const clearLineState = () => {
    setMoveFrom(null);
    setFeedback(null);
    setNotice(null);
    setFinishedLineMistakes(null);
    lineMistakesRef.current = 0;
    failedKeysRef.current.clear();
  };

  /** Nouvelle ligne : l'échiquier repart de la position initiale. */
  const restartLine = () => {
    resetGame();
    clearLineState();
  };

  /**
   * Remet la session à zéro (compteurs de session compris), sans toucher à l'échiquier
   * ni aux statistiques de répétition espacée, qui sont persistantes.
   * À appeler au démarrage d'une révision et au retour au menu.
   */
  const resetSession = () => {
    clearLineState();
    setStats(EMPTY_STATS);
    setNow(Date.now());
  };

  /** Surlignage rouge de la case d'arrivée du dernier mauvais coup. */
  const errorSquares = useMemo<Record<string, CSSProperties>>(
    () =>
      feedback ? { [feedback.wrongSquare]: { backgroundColor: "rgba(239, 68, 68, 0.45)" } } : {},
    [feedback],
  );

  /** Vrai quand une ligne est en cours (hors position de départ) ou quand on est sorti du répertoire. */
  const canRestartLine =
    isReviewMode &&
    !isLineFinished &&
    (isOutOfRepertoire || (node !== null && graph !== null && node.key !== graph.startKey));

  return {
    // État
    hasRepertoire: graph !== null,
    isPlayerTurn,
    isComputerTurn,
    isLineFinished,
    isOutOfRepertoire,
    canRestartLine,
    finishedLineMistakes,
    feedback,
    notice,
    hintArrows: feedback?.arrows ?? [],
    errorSquares,
    currentChapterNames,
    stats,
    cardSummary,

    // Handlers
    handlePieceDrop,
    handleSquareClick,
    restartLine,
    resetSession,
  };
}

export type ReviewManager = ReturnType<typeof useReviewManager>;