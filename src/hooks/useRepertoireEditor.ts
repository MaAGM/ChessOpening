"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Chess, type Square } from "chess.js";

import { useRepertoireStore } from "@/hooks/useRepertoireStore";
import type { PanelMode } from "@/hooks/useTrainerMode";
import {
  EMPTY_HISTORY,
  canRedo,
  canUndo,
  recordEdit,
  redo as redoHistory,
  undo as undoHistory,
  type EditorHistory,
  type EditorSnapshot,
} from "@/lib/repertoire/editorHistory";
import {
  branchSize,
  canMakeMainLine,
  canPromote,
  deleteCurrent,
  makeMainLineCurrent,
  navigate,
  playMove,
  promoteCurrent,
  type EditorState,
  type NavigationAction,
} from "@/lib/repertoire/editorActions";
import { REPERTOIRE_LIMITS } from "@/lib/repertoire/limits";
import { getSnapshot as getRepertoireSnapshot } from "@/lib/repertoire/repertoireStore";
import {
  INITIAL_FEN,
  computeFensIncremental,
  countNodes,
  findTranspositions,
  getNode,
  getParentId,
  getPathIds,
  mergeTrees,
  updateNode,
  type NodePatch,
} from "@/lib/repertoire/repertoireTree";
import { ROOT_ID, type MoveSymbol, type RepertoireNode, type TreeRoot } from "@/lib/repertoire/types";
import { toPositionKey } from "@/lib/review/positionKey";
import { sanToSquares } from "@/lib/review/reviewGraph";

export type RepertoireEditorParams = {
  /** Répertoire ouvert dans l'éditeur. */
  repertoireId: string | null;
  panelMode: PanelMode;
  /** Position affichée sur l'échiquier. */
  currentFen: string;
  /** useChessGame : joue un coup sur l'échiquier. */
  onPieceDrop: (source: string, target: string | null) => boolean;
  /** useChessGame : informe l'échiquier d'un clic sur une case. */
  onSquareClick: (square: string) => void;
  /** useChessGame : affiche une position (FEN). */
  loadPosition: (fen: string) => void;
  /** useChessGame : efface sélection et points d'aide après un coup refusé. */
  clearSelection: () => void;
};

/** Branche en attente de confirmation de suppression. */
export type PendingDelete = { id: string; san: string; size: number };

type Session = { repertoireId: string | null; cursorId: string; history: EditorHistory };

const freshSession = (repertoireId: string | null): Session => ({
  repertoireId,
  cursorId: ROOT_ID,
  history: EMPTY_HISTORY,
});

const NO_CHILDREN: RepertoireNode[] = [];

const LIMIT_MESSAGE = `Limite atteinte : un répertoire ne peut pas dépasser ${REPERTOIRE_LIMITS.maxNodes} coups.`;

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

/**
 * Éditeur d'un répertoire : l'échiquier et l'arbre sont synchronisés dans les deux sens.
 *
 *  - jouer un coup sur l'échiquier se place sur le coup s'il existe déjà, sinon crée la
 *    branche (variante si le nœud avait déjà des suites) ;
 *  - se déplacer dans l'arbre (clic, clavier) affiche la position correspondante ;
 *  - toutes les modifications sont enregistrées aussitôt dans le store et annulables.
 *
 * L'arbre vit dans le store ; ce hook ne garde que le curseur et l'historique d'annulation.
 */
export function useRepertoireEditor(params: RepertoireEditorParams) {
  const { repertoireId, panelMode, currentFen, onPieceDrop, onSquareClick, loadPosition, clearSelection } =
    params;

  const { getRepertoire, updateRepertoireTree, persistError } = useRepertoireStore();
  const repertoire = repertoireId ? getRepertoire(repertoireId) : null;
  const isActive = panelMode === "repertoire_editor" && repertoire !== null;

  // ----------------------------------------------------------------------
  // État de session (curseur + historique), lié au répertoire ouvert
  // ----------------------------------------------------------------------
  const [storedSession, setSession] = useState<Session>(() => freshSession(null));
  const session = storedSession.repertoireId === repertoireId ? storedSession : freshSession(repertoireId);

  const [moveFrom, setMoveFrom] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // ----------------------------------------------------------------------
  // Arbre, positions et curseur
  // ----------------------------------------------------------------------
  const children = repertoire?.children ?? NO_CHILDREN;
  const root: TreeRoot = useMemo(() => ({ children }), [children]);

  // Positions (FEN) de chaque nœud, recalculées seulement pour les nouveaux nœuds.
  // (État dérivé calculé pendant le rendu, sans effet ni ref.)
  const [fensState, setFensState] = useState<{
    children: RepertoireNode[];
    fens: Map<string, string>;
  } | null>(null);
  let fens: Map<string, string>;
  if (fensState && fensState.children === children) {
    fens = fensState.fens;
  } else {
    fens = computeFensIncremental(root, fensState?.fens);
    setFensState({ children, fens });
  }

  // Un nœud supprimé ailleurs (autre onglet) ramène le curseur à la position initiale.
  const cursorId =
    session.cursorId === ROOT_ID || getNode(root, session.cursorId) !== null
      ? session.cursorId
      : ROOT_ID;
  const currentNode = cursorId === ROOT_ID ? null : getNode(root, cursorId);
  const fen = fens.get(cursorId) ?? INITIAL_FEN;
  /** Nombre de coups depuis le début de la ligne jusqu'au nœud affiché (0 à la racine). */
  const cursorPly = useMemo(
    () => (cursorId === ROOT_ID ? 0 : getPathIds(root, cursorId).length),
    [root, cursorId],
  );
  const state: EditorState = { children, cursorId };

  /** Nœuds qui aboutissent à la même position qu'un autre nœud de l'arbre. */
  const transpositions = useMemo(() => findTranspositions(fens), [fens]);

  /** Cases du dernier coup (celui qui mène au nœud affiché), pour les surligner sur l'échiquier. */
  const lastMoveSquares = useMemo<Record<string, CSSProperties>>(() => {
    if (!isActive || cursorId === ROOT_ID) return {};
    const node = getNode(root, cursorId);
    const parentId = getParentId(root, cursorId);
    const parentFen = parentId ? fens.get(parentId) : undefined;
    if (!node || !parentFen) return {};

    const squares = sanToSquares(parentFen, node.san);
    if (!squares) return {};
    const style: CSSProperties = { backgroundColor: "rgba(245, 236, 142, 0.6)" };
    return { [squares.from]: style, [squares.to]: style };
  }, [isActive, cursorId, root, fens]);

  /** Coups illégaux (données corrompues) : absents de la table des positions. */
  const invalidCount = countNodes(root) - (fens.size - 1);

  // ----------------------------------------------------------------------
  // Synchronisation arbre -> échiquier
  // ----------------------------------------------------------------------
  useEffect(() => {
    if (isActive && toPositionKey(fen) !== toPositionKey(currentFen)) loadPosition(fen);
  }, [isActive, fen, currentFen, loadPosition]);

  // ----------------------------------------------------------------------
  // Modifications
  // ----------------------------------------------------------------------
  const snapshot = (): EditorSnapshot => ({ children, cursorId });

  /** Enregistre un nouvel état (arbre + curseur), avec ou sans entrée d'annulation. */
  const commit = (next: EditorState, withHistory: boolean) => {
    if (!repertoire) return;
    if (next.children !== children) updateRepertoireTree(repertoire.id, next.children);
    setSession({
      repertoireId: repertoire.id,
      cursorId: next.cursorId,
      history: withHistory ? recordEdit(session.history, snapshot()) : session.history,
    });
    setPendingDelete(null);
    setNotice(null);
  };

  /** Déplace le curseur (sans modification de l'arbre, donc sans historique). */
  const goTo = (id: string) => {
    if (!isActive || (id !== ROOT_ID && !fens.has(id))) return;
    setSession({ ...session, repertoireId: repertoireId, cursorId: id });
    setMoveFrom(null);
    setPendingDelete(null);
    clearSelection();
  };

  const move = (action: NavigationAction) => {
    if (isActive) goTo(navigate(state, action));
  };

  const undo = () => {
    if (!repertoire) return;
    const result = undoHistory(session.history, snapshot());
    if (!result) return;
    updateRepertoireTree(repertoire.id, result.snapshot.children);
    setSession({ repertoireId: repertoire.id, cursorId: result.snapshot.cursorId, history: result.history });
    setPendingDelete(null);
    setNotice(null);
  };

  const redo = () => {
    if (!repertoire) return;
    const result = redoHistory(session.history, snapshot());
    if (!result) return;
    updateRepertoireTree(repertoire.id, result.snapshot.children);
    setSession({ repertoireId: repertoire.id, cursorId: result.snapshot.cursorId, history: result.history });
    setPendingDelete(null);
    setNotice(null);
  };

  const promote = () => {
    if (isActive && canPromote(state)) commit(promoteCurrent(state), true);
  };

  const makeMainLine = () => {
    if (isActive && canMakeMainLine(state)) commit(makeMainLineCurrent(state), true);
  };

  const performDelete = () => {
    const next = deleteCurrent(state);
    if (next) commit(next, true);
  };

  /** Supprime la branche affichée : tout de suite si c'est un seul coup, sinon après confirmation. */
  const requestDelete = () => {
    if (!isActive || !currentNode) return;
    const size = branchSize(state);
    if (size <= 1) {
      performDelete();
      return;
    }
    setPendingDelete({ id: currentNode.id, san: currentNode.san, size });
  };

  const confirmDelete = () => {
    if (pendingDelete && pendingDelete.id === cursorId) performDelete();
    setPendingDelete(null);
  };

  const cancelDelete = () => setPendingDelete(null);

  /**
   * Modifie les annotations d'un nœud (symbole, commentaire), avec une entrée d'annulation.
   * Lit l'arbre le plus récent du store : l'appelant (un champ de commentaire qui se ferme)
   * peut dater d'un rendu précédent. Sans changement réel, rien n'est enregistré.
   */
  const annotate = (nodeId: string, patch: NodePatch) => {
    if (!repertoire) return;
    const stored = getRepertoireSnapshot().repertoires[repertoire.id];
    if (!stored) return;

    const next = updateNode({ children: stored.children }, nodeId, patch);
    if (next.children === stored.children) return;

    updateRepertoireTree(repertoire.id, next.children);
    setSession((previous) => {
      const base = previous.repertoireId === repertoire.id ? previous : freshSession(repertoire.id);
      return {
        ...base,
        history: recordEdit(base.history, { children: stored.children, cursorId: base.cursorId }),
      };
    });
    setNotice(null);
  };

  /**
   * Fusionne des coups importés (PGN) dans le répertoire ouvert, en une seule entrée
   * d'annulation. Lit l'arbre le plus récent du store. Renvoie le nombre de coups ajoutés.
   */
  const importTree = (incoming: RepertoireNode[]): { added: number; truncated: boolean } | null => {
    if (!repertoire) return null;
    const stored = getRepertoireSnapshot().repertoires[repertoire.id];
    if (!stored) return null;

    const merged = mergeTrees({ children: stored.children }, { children: incoming });
    const unchanged = JSON.stringify(merged.root.children) === JSON.stringify(stored.children);
    if (unchanged) return { added: 0, truncated: merged.truncated };

    updateRepertoireTree(repertoire.id, merged.root.children);
    setSession((previous) => {
      const base = previous.repertoireId === repertoire.id ? previous : freshSession(repertoire.id);
      return {
        ...base,
        history: recordEdit(base.history, { children: stored.children, cursorId: base.cursorId }),
      };
    });
    setPendingDelete(null);
    setNotice(merged.truncated ? `Import partiel : ${LIMIT_MESSAGE}` : null);
    return { added: merged.added, truncated: merged.truncated };
  };

  /** Pose le symbole sur le coup affiché, ou le retire s'il y est déjà. */
  const toggleSymbol = (symbol: MoveSymbol) => {
    if (!isActive || !currentNode) return;
    annotate(currentNode.id, { symbol: currentNode.symbol === symbol ? undefined : symbol });
  };

  // ----------------------------------------------------------------------
  // Interactions avec l'échiquier
  // ----------------------------------------------------------------------
  /** Joue le coup sur une copie de la position ; null s'il est illégal. */
  const previewMove = (from: string, to: string) => {
    try {
      return new Chess(currentFen).move({ from, to, promotion: "q" });
    } catch {
      return null;
    }
  };

  const handlePieceDrop = (sourceSquare: string, targetSquare: string | null) => {
    const reject = () => {
      clearSelection();
      return false;
    };
    if (!isActive || !targetSquare) return reject();

    const played = previewMove(sourceSquare, targetSquare);
    if (!played) return reject();

    // On vérifie que l'arbre accepte le coup avant de l'appliquer à l'échiquier.
    const result = playMove(state, played.san);
    if (!result.ok) {
      setNotice(result.error === "limit-reached" ? LIMIT_MESSAGE : null);
      return reject();
    }

    const moved = onPieceDrop(sourceSquare, targetSquare);
    if (moved) commit(result.state, result.created);
    return moved;
  };

  const handleSquareClick = (square: string) => {
    if (!isActive) return;

    const position = new Chess(currentFen);
    const clicked = position.get(square as Square);
    const isOwnPiece = Boolean(clicked) && clicked?.color === position.turn();

    if (!moveFrom) {
      if (isOwnPiece) {
        setMoveFrom(square);
        onSquareClick(square);
      }
      return;
    }

    if (moveFrom === square) {
      setMoveFrom(null);
      onSquareClick(square);
      return;
    }

    if (isOwnPiece) {
      setMoveFrom(square);
      onSquareClick(square);
      return;
    }

    const played = previewMove(moveFrom, square);
    if (!played) return; // destination illégale : on garde la sélection

    const result = playMove(state, played.san);
    if (!result.ok) {
      setNotice(result.error === "limit-reached" ? LIMIT_MESSAGE : null);
      onSquareClick(moveFrom); // désélectionne
      setMoveFrom(null);
      return;
    }

    onSquareClick(square); // useChessGame applique le coup
    setMoveFrom(null);
    commit(result.state, result.created);
  };

  // ----------------------------------------------------------------------
  // Clavier
  // ----------------------------------------------------------------------
  // Les actions changent à chaque rendu : l'écouteur lit toujours la dernière version.
  const latest = useRef({ move, undo, redo, requestDelete, confirmDelete, cancelDelete, pending: false });
  useEffect(() => {
    latest.current = {
      move,
      undo,
      redo,
      requestDelete,
      confirmDelete,
      cancelDelete,
      pending: pendingDelete !== null,
    };
  });

  // `annotate` est appelée par des composants qui peuvent se fermer après un rendu plus récent :
  // la version exposée est stable et délègue toujours à la dernière implémentation.
  const annotateRef = useRef(annotate);
  useEffect(() => {
    annotateRef.current = annotate;
  });
  const stableAnnotate = useCallback(
    (nodeId: string, patch: NodePatch) => annotateRef.current(nodeId, patch),
    [],
  );

  useEffect(() => {
    if (!isActive) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;
      const actions = latest.current;
      const modifier = event.ctrlKey || event.metaKey;

      if (modifier && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) actions.redo();
        else actions.undo();
        return;
      }
      if (modifier && event.key.toLowerCase() === "y") {
        event.preventDefault();
        actions.redo();
        return;
      }
      if (modifier || event.altKey) return;

      switch (event.key) {
        case "ArrowLeft":
          actions.move("back");
          break;
        case "ArrowRight":
          actions.move("forward");
          break;
        case "ArrowUp":
          actions.move("previousVariation");
          break;
        case "ArrowDown":
          actions.move("nextVariation");
          break;
        case "Home":
          actions.move("start");
          break;
        case "End":
          actions.move("end");
          break;
        case "Delete":
        case "Backspace":
          actions.requestDelete();
          break;
        case "Escape":
          if (!actions.pending) return;
          actions.cancelDelete();
          break;
        case "Enter":
          if (!actions.pending) return;
          actions.confirmDelete();
          break;
        default:
          return;
      }
      event.preventDefault();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isActive]);

  /** Remet l'éditeur à zéro (curseur, historique) : à l'ouverture, à la fermeture, au retour au menu. */
  const resetSession = () => {
    setSession(freshSession(repertoireId));
    setMoveFrom(null);
    setPendingDelete(null);
    setNotice(null);
  };

  return {
    // État
    repertoire,
    isActive,
    root,
    fens,
    transpositions,
    lastMoveSquares,
    cursorId,
    cursorPly,
    currentNode,
    invalidCount,
    persistError,
    notice,
    pendingDelete,
    canUndo: canUndo(session.history),
    canRedo: canRedo(session.history),
    canPromote: isActive && canPromote(state),
    canMakeMainLine: isActive && canMakeMainLine(state),
    canDelete: isActive && currentNode !== null,

    // Actions
    goTo,
    move,
    undo,
    redo,
    promote,
    makeMainLine,
    requestDelete,
    confirmDelete,
    cancelDelete,
    annotate: stableAnnotate,
    toggleSymbol,
    importTree,
    dismissNotice: () => setNotice(null),
    resetSession,

    // Handlers de l'échiquier
    handlePieceDrop,
    handleSquareClick,
  };
}

export type RepertoireEditor = ReturnType<typeof useRepertoireEditor>;