"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Chess } from "chess.js";

import { useReviewStore } from "@/hooks/useReviewStore";
import type { PanelMode } from "@/hooks/useTrainerMode";
import type { CourseChapter, Lesson, OpeningCourse, Side, TutorialNode } from "@/lib/data/openings";
import {
  computeFenForPath,
  findNodeByMoveSequence,
  getCourseEntry,
  getLessonLocation,
  getLoadedCourse,
  loadCourse,
} from "@/lib/data/openings";
import { computeCoverage, findRewindPath, hasUnexploredBelow, pathKey } from "@/lib/learning/coverage";
import { nextLessonId } from "@/lib/learning/progress";

const COMPUTER_MOVE_DELAY_MS = 400;

export type TutorialManagerParams = {
  /** Current board position in FEN */
  currentFen: string;
  /** Hook from useChessGame – executes a move */
  onPieceDrop: (source: string, target: string | null) => boolean;
  /** Hook from useChessGame – informs the board about a clicked square */
  onSquareClick: (square: string) => void;
  /** Load a FEN string into the board */
  loadPosition: (fen: string) => void;
  /** Reset the whole game (used when leaving a tutorial) */
  resetGame: () => void;
  /** Clear selection + move dots after a refused move */
  clearSelection: () => void;
  /** Current UI mode – owned by useTrainerMode */
  panelMode: PanelMode;
  /** Setter for the UI mode – owned by useTrainerMode */
  setPanelMode: (mode: PanelMode) => void;
};

const isLeaf = (node: TutorialNode | null | undefined) =>
  Boolean(node) && Object.keys(node!.children ?? {}).length === 0;

function findLesson(course: OpeningCourse | null, lessonId: string | null) {
  if (!course || !lessonId) return null;
  for (const chapter of course.chapters) {
    const index = chapter.lessons.findIndex((lesson) => lesson.id === lessonId);
    if (index >= 0) return { chapter, lesson: chapter.lessons[index], lessonIndex: index };
  }
  return null;
}

/**
 * Mode Apprentissage (Masterclass) : navigation Ouverture → Chapitres → Cours et
 * déroulé d'un cours sur l'échiquier.
 *
 * - Une ouverture est chargée à la demande (`loadCourse`) quand on l'ouvre.
 * - Dans un cours, l'ordinateur joue seul quand il n'a qu'un coup ; s'il en a plusieurs,
 *   le joueur choisit la variante à étudier.
 * - Les fins de variante atteintes sont mémorisées pendant la session : le cours est marqué
 *   « parcouru » quand toutes ses fins de variante obligatoires (`mustCover`) l'ont été.
 */
export function useTutorialManager(params: TutorialManagerParams) {
  const {
    currentFen,
    onPieceDrop,
    onSquareClick,
    loadPosition,
    resetGame,
    clearSelection,
    panelMode,
    setPanelMode,
  } = params;

  const { markComplete, completedChapters } = useReviewStore();

  // ----------------------------------------------------------------------
  // Ouverture sélectionnée (vue « chapitres ») et son chargement
  // ----------------------------------------------------------------------
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [loadTick, setLoadTick] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Lu dans le cache du chargeur : `loadTick` force le nouveau rendu une fois chargé.
  const course = useMemo(
    () => (selectedCourseId && loadTick >= 0 ? getLoadedCourse(selectedCourseId) : null),
    [selectedCourseId, loadTick],
  );
  const courseEntry = useMemo(
    () => (selectedCourseId ? getCourseEntry(selectedCourseId) : null),
    [selectedCourseId],
  );

  useEffect(() => {
    if (!selectedCourseId || course) return;
    let cancelled = false;
    loadCourse(selectedCourseId)
      .then(() => {
        if (!cancelled) setLoadTick((t) => t + 1);
      })
      .catch((error: unknown) => {
        console.warn("[Masterclass] Chargement impossible :", error);
        if (!cancelled) setLoadError("Impossible de charger cette ouverture. Réessayez plus tard.");
      });
    return () => {
      cancelled = true;
    };
  }, [selectedCourseId, course]);

  // ----------------------------------------------------------------------
  // Cours en cours
  // ----------------------------------------------------------------------
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [moveFrom, setMoveFrom] = useState<string | null>(null);
  /** Fins de variante atteintes pendant la session du cours (clés `pathKey`). */
  const [exploredLeaves, setExploredLeaves] = useState<ReadonlySet<string>>(() => new Set());

  const found = useMemo(() => findLesson(course, activeLessonId), [course, activeLessonId]);
  const activeLesson: Lesson | null = found?.lesson ?? null;
  const activeChapter: CourseChapter | null = found?.chapter ?? null;
  const activeChapterIndex = activeChapter && course ? course.chapters.indexOf(activeChapter) : -1;
  const activeLessonIndex = found?.lessonIndex ?? -1;

  const userColor: Side = activeLesson?.side ?? course?.side ?? "white";

  const activeNode: TutorialNode | null = useMemo(() => {
    if (!activeLesson) return null;
    return findNodeByMoveSequence(activeLesson.root, currentPath);
  }, [activeLesson, currentPath]);

  const isLessonFinished = isLeaf(activeNode);

  const coverage = useMemo(
    () => (activeLesson ? computeCoverage(activeLesson.root, activeLesson.mustCover, exploredLeaves) : null),
    [activeLesson, exploredLeaves],
  );

  /** Où revenir pour explorer une variante pas encore vue (null : tout est exploré). */
  const rewindPath = useMemo(
    () =>
      activeLesson && isLessonFinished
        ? findRewindPath(activeLesson.root, activeLesson.mustCover, exploredLeaves, currentPath)
        : null,
    [activeLesson, isLessonFinished, exploredLeaves, currentPath],
  );

  const nextLesson = useMemo(() => {
    if (!courseEntry || !activeLessonId) return null;
    const id = nextLessonId(courseEntry, activeLessonId);
    if (!id) return null;
    const location = getLessonLocation(id);
    const chapter = courseEntry.chapters.find((c) => c.id === location?.chapterId);
    const entry = chapter?.lessons.find((l) => l.id === id);
    return entry && chapter
      ? { id, title: entry.title, chapterTitle: chapter.title, isNewChapter: chapter.id !== activeChapter?.id }
      : null;
  }, [courseEntry, activeLessonId, activeChapter]);

  const isLessonCompleted = activeLessonId ? completedChapters.includes(activeLessonId) : false;

  // ----------------------------------------------------------------------
  // Cours parcouru : toutes les fins de variante obligatoires ont été atteintes.
  // markComplete est idempotent.
  // ----------------------------------------------------------------------
  useEffect(() => {
    if (panelMode === "learning_active" && activeLessonId && coverage?.complete) {
      markComplete(activeLessonId);
    }
  }, [panelMode, activeLessonId, coverage, markComplete]);

  // ----------------------------------------------------------------------
  // Avancer d'un coup dans l'arbre (joueur, ordinateur ou choix de variante)
  // ----------------------------------------------------------------------
  const advance = useCallback(
    (path: string[], san: string) => {
      const nextPath = [...path, san];
      setCurrentPath(nextPath);
      if (activeLesson && isLeaf(findNodeByMoveSequence(activeLesson.root, nextPath))) {
        setExploredLeaves((prev) => {
          const key = pathKey(nextPath);
          return prev.has(key) ? prev : new Set([...prev, key]);
        });
      }
    },
    [activeLesson],
  );

  const sideToMove: Side = currentPath.length % 2 === 0 ? "white" : "black";
  const isLearning = panelMode === "learning_active" && activeNode !== null;

  const previewSan = (from: string, to: string): string | null => {
    try {
      return new Chess(currentFen).move({ from, to, promotion: "q" }).san;
    } catch {
      return null;
    }
  };

  // ----------------------------------------------------------------------
  // Interaction handlers (piece drop, click)
  // ----------------------------------------------------------------------
  const handlePieceDrop = (sourceSquare: string, targetSquare: string | null) => {
    // Le passage au mode Exploration après un coup joué depuis le menu est géré par la
    // page (`shouldEnterExplorer`), pour le glisser-déposer comme pour le clic.
    if (isLearning && activeNode) {
      // Coup refusé : on efface aussi la sélection et les points d'aide.
      const reject = () => {
        clearSelection();
        return false;
      };

      if (!targetSquare || sideToMove !== userColor) return reject();
      const san = previewSan(sourceSquare, targetSquare);
      if (!san || !Object.keys(activeNode.children ?? {}).includes(san)) return reject();

      const moved = onPieceDrop(sourceSquare, targetSquare);
      if (moved) {
        advance(currentPath, san);
        setMoveFrom(null);
      }
      return moved;
    }

    const moved = onPieceDrop(sourceSquare, targetSquare);
    if (moved) setMoveFrom(null);
    return moved;
  };

  const handleSquareClick = (square: string) => {
    if (!isLearning || !activeNode) {
      onSquareClick(square);
      return;
    }
    if (sideToMove !== userColor) return;

    // 1) Premier clic : on montre les coups possibles
    if (!moveFrom) {
      setMoveFrom(square);
      onSquareClick(square);
      return;
    }

    // 2) Même case : annulation
    if (moveFrom === square) {
      setMoveFrom(null);
      onSquareClick(square);
      return;
    }

    // 3) Tentative de coup
    const san = previewSan(moveFrom, square);
    if (!san) {
      // Coup illégal : la sélection passe à la nouvelle case
      setMoveFrom(square);
      onSquareClick(square);
      return;
    }

    if (Object.keys(activeNode.children ?? {}).includes(san)) {
      onSquareClick(square); // useChessGame applique le coup
      advance(currentPath, san);
    } else {
      onSquareClick(moveFrom); // mauvais coup : on désélectionne
    }
    setMoveFrom(null);
  };

  // ----------------------------------------------------------------------
  // Navigation
  // ----------------------------------------------------------------------
  const resetLessonState = () => {
    setCurrentPath([]);
    setMoveFrom(null);
    setExploredLeaves(new Set());
  };

  /** Ouvre la vue des chapitres d'une ouverture (le contenu se charge en arrière-plan). */
  const handleOpenCourse = (courseId: string) => {
    setLoadError(null);
    setSelectedCourseId(courseId);
    setPanelMode("opening_selector");
  };

  /** Revient à la liste des ouvertures. */
  const handleCloseCourse = () => {
    setSelectedCourseId(null);
    setLoadError(null);
  };

  const handleStartLesson = (lessonId: string) => {
    const location = getLessonLocation(lessonId);
    if (!location) return;

    setSelectedCourseId(location.courseId);
    setActiveLessonId(lessonId);
    resetLessonState();
    setPanelMode("learning_active");
    loadPosition(computeFenForPath([]));

    // Normalement déjà chargée (vue des chapitres) ; sinon le cours s'affiche une fois prêt.
    if (!getLoadedCourse(location.courseId)) {
      loadCourse(location.courseId)
        .then(() => setLoadTick((t) => t + 1))
        .catch(() => setLoadError("Impossible de charger ce cours. Réessayez plus tard."));
    }
  };

  const handleNextLesson = () => {
    if (nextLesson) handleStartLesson(nextLesson.id);
  };

  /** Recommence le cours depuis le début (les variantes déjà vues restent comptées). */
  const handleRestartLesson = () => {
    setCurrentPath([]);
    setMoveFrom(null);
    loadPosition(computeFenForPath([]));
  };

  /** Quitte le cours et revient à la vue des chapitres de son ouverture. */
  const handleBackToCourse = () => {
    setActiveLessonId(null);
    resetLessonState();
    resetGame();
    setPanelMode("opening_selector");
  };

  const handleBackToMenu = () => {
    setPanelMode("menu");
    setSelectedCourseId(null);
    setActiveLessonId(null);
    setLoadError(null);
    resetLessonState();
    resetGame();
  };

  const handleRewindToBranch = () => {
    if (!rewindPath) return;
    setCurrentPath(rewindPath);
    setMoveFrom(null);
    try {
      loadPosition(computeFenForPath(rewindPath));
    } catch {
      loadPosition(new Chess().fen());
    }
  };

  // ----------------------------------------------------------------------
  // Coup automatique de l'ordinateur (quand il n'a qu'un seul coup possible)
  // ----------------------------------------------------------------------
  const computerColor: Side = userColor === "white" ? "black" : "white";
  const branchChoices = useMemo(() => Object.keys(activeNode?.children ?? {}), [activeNode]);
  const isComputerTurn = isLearning && sideToMove === computerColor;

  useEffect(() => {
    if (!isComputerTurn || branchChoices.length !== 1) return;
    const [mainLineMove] = branchChoices;

    const timer = setTimeout(() => {
      let move;
      try {
        move = new Chess(currentFen).move(mainLineMove);
      } catch {
        return;
      }
      if (onPieceDrop(move.from, move.to)) advance(currentPath, mainLineMove);
    }, COMPUTER_MOVE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [isComputerTurn, branchChoices, currentPath, currentFen, onPieceDrop, advance]);

  // ----------------------------------------------------------------------
  // Choix d'une variante quand l'ordinateur a plusieurs coups
  // ----------------------------------------------------------------------
  const isWaitingForBranchChoice = isComputerTurn && branchChoices.length > 1;

  /** Variantes déjà entièrement explorées depuis la position courante. */
  const exploredChoices = useMemo(
    () =>
      activeLesson && isWaitingForBranchChoice
        ? branchChoices.filter(
            (san) =>
              !hasUnexploredBelow(activeLesson.root, "allBranches", exploredLeaves, [...currentPath, san]),
          )
        : [],
    [activeLesson, isWaitingForBranchChoice, branchChoices, exploredLeaves, currentPath],
  );

  const handleBranchChoice = (moveSan: string) => {
    let move;
    try {
      move = new Chess(currentFen).move(moveSan);
    } catch {
      return;
    }
    if (onPieceDrop(move.from, move.to)) advance(currentPath, moveSan);
  };

  return {
    // Vue des chapitres
    selectedCourseId,
    course,
    courseEntry,
    isCourseLoading: selectedCourseId !== null && course === null && loadError === null,
    loadError,

    // Cours en cours
    activeLessonId,
    activeLesson,
    activeChapter,
    activeChapterIndex,
    activeLessonIndex,
    activeNode,
    isLessonFinished,
    isLessonCompleted,
    coverage,
    canExploreOtherBranch: rewindPath !== null,
    nextLesson,
    userColor,
    computerColor,

    // Choix de variante
    isWaitingForBranchChoice,
    branchChoices,
    exploredChoices,
    handleBranchChoice,

    // Interaction handlers
    handlePieceClick: handleSquareClick,
    handlePieceDrop,

    // Navigation
    handleOpenCourse,
    handleCloseCourse,
    handleStartLesson,
    handleNextLesson,
    handleRestartLesson,
    handleRewindToBranch,
    handleBackToCourse,
    handleBackToMenu,
  };
}

export type TutorialManager = ReturnType<typeof useTutorialManager>;
