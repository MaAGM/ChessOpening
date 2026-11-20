// @vitest-environment jsdom
import { act, cleanup, renderHook, type RenderHookResult } from "@testing-library/react";
import { Chess } from "chess.js";
import { useState } from "react";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import type { PanelMode } from "./useTrainerMode";
import { useTutorialManager } from "./useTutorialManager";
import {
  findNodeByMoveSequence,
  loadAllCourses,
  type Lesson,
  type OpeningCourse,
  type OpeningCourseData,
} from "@/lib/data/openings";
import { pathKey, requiredLeafPaths } from "@/lib/learning/coverage";
import { INITIAL_FEN } from "@/lib/repertoire/repertoireTree";
import { applyRemoteState, createEmptyState, getSnapshot } from "@/lib/review/reviewStore";

/**
 * Le catalogue converti ne contient que des lignes sans variante : pour tester l'exploration
 * des branches, le premier cours de la Française est remplacé par une version ramifiée
 * (les Blancs ont le choix au 2e et au 3e coup → trois fins de variante).
 */
const BRANCHED_PGN = "1. e4 e6 2. d4 (2. d3 d5) 2... d5 3. Nc3 (3. e5 c5) 3... Bb4";
vi.mock("@/lib/data/openings/courses/french.json", async (importOriginal) => {
  const original = (await importOriginal<{ default: OpeningCourseData }>()).default;
  const course: OpeningCourseData = structuredClone(original);
  course.chapters[0].lessons[0].pgn = BRANCHED_PGN;
  return { default: course };
});

/** Mini-échiquier : reproduit ce que fournissent useChessGame et useTrainerMode. */
function useHarness() {
  const [fen, setFen] = useState(INITIAL_FEN);
  const [panelMode, setPanelMode] = useState<PanelMode>("menu");

  const tutorial = useTutorialManager({
    currentFen: fen,
    onPieceDrop: (from, to) => {
      if (!to) return false;
      const game = new Chess(fen);
      try {
        game.move({ from, to, promotion: "q" });
      } catch {
        return false;
      }
      setFen(game.fen());
      return true;
    },
    onSquareClick: () => {},
    loadPosition: setFen,
    resetGame: () => setFen(INITIAL_FEN),
    clearSelection: () => {},
    panelMode,
    setPanelMode,
  });

  return { tutorial, fen, panelMode };
}

type Harness = RenderHookResult<ReturnType<typeof useHarness>, unknown>;

const computerPlays = () =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(450);
  });

const isUserTurn = (h: Harness) => {
  const toMove = new Chess(h.result.current.fen).turn() === "w" ? "white" : "black";
  return toMove === h.result.current.tutorial.userColor;
};

/** Joue le cours jusqu'à une fin de variante, en suivant `target` quand c'est possible. */
async function playTo(h: Harness, target: string[]) {
  for (let guard = 0; guard < 80 && !h.result.current.tutorial.isLessonFinished; guard++) {
    const t = h.result.current.tutorial;
    const choices = Object.keys(t.activeNode?.children ?? {});
    const ply = playedPath(h).length;
    const san = choices.includes(target[ply]) ? target[ply] : choices[0];

    if (isUserTurn(h)) {
      const move = new Chess(h.result.current.fen).move(san);
      act(() => {
        h.result.current.tutorial.handlePieceDrop(move.from, move.to);
      });
    } else if (t.isWaitingForBranchChoice) {
      act(() => h.result.current.tutorial.handleBranchChoice(san));
    } else {
      await computerPlays();
    }
  }
  expect(h.result.current.tutorial.isLessonFinished).toBe(true);
}

/** Chemin joué, reconstitué en cherchant la position courante dans l'arbre. */
let currentTarget: string[] = [];
function playedPath(h: Harness): string[] {
  const lesson = h.result.current.tutorial.activeLesson!;
  const game = new Chess();
  const path: string[] = [];
  for (const san of currentTarget) {
    if (game.fen() === h.result.current.fen) break;
    game.move(san);
    path.push(san);
  }
  if (game.fen() !== h.result.current.fen) throw new Error("position hors de la variante visée");
  expect(findNodeByMoveSequence(lesson.root, path)).not.toBeNull();
  return path;
}

let courses: OpeningCourse[];
beforeAll(async () => {
  courses = await loadAllCourses();
});

beforeEach(() => {
  vi.useFakeTimers();
  window.localStorage.clear();
  applyRemoteState(createEmptyState());
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const allLessons = () => courses.flatMap((c) => c.chapters.flatMap((ch) => ch.lessons));
const leavesOf = (lesson: Lesson) => requiredLeafPaths(lesson.root, lesson.mustCover);

describe("useTutorialManager : Ouverture → Chapitres → Cours", () => {
  it("ouvre une ouverture, démarre un cours et laisse l'ordinateur jouer", async () => {
    const h = renderHook(() => useHarness());
    act(() => h.result.current.tutorial.handleOpenCourse("french"));

    expect(h.result.current.panelMode).toBe("opening_selector");
    expect(h.result.current.tutorial.course?.id).toBe("french");

    act(() => h.result.current.tutorial.handleStartLesson("french-c1-l2"));
    expect(h.result.current.panelMode).toBe("learning_active");
    expect(h.result.current.tutorial.userColor).toBe("black");
    expect(h.result.current.tutorial.activeChapterIndex).toBe(0);

    await computerPlays(); // les Blancs jouent seuls 1.e4
    expect(new Chess(h.result.current.fen).turn()).toBe("b");
    expect(h.result.current.tutorial.activeNode?.explanation).toBeTruthy();
  });

  it("refuse un coup qui n'est pas dans le cours", async () => {
    const h = renderHook(() => useHarness());
    act(() => h.result.current.tutorial.handleStartLesson("french-c1-l2"));
    await computerPlays();
    const before = h.result.current.fen;
    act(() => {
      expect(h.result.current.tutorial.handlePieceDrop("a7", "a6")).toBe(false);
    });
    expect(h.result.current.fen).toBe(before);
  });

  it("marque le cours « parcouru » seulement quand toutes ses variantes obligatoires sont vues", async () => {
    const lesson = allLessons().find((l) => l.id === "french-c1-l1");
    const leaves = leavesOf(lesson!);
    expect(leaves).toEqual([
      ["e4", "e6", "d4", "d5", "Nc3", "Bb4"],
      ["e4", "e6", "d4", "d5", "e5", "c5"],
      ["e4", "e6", "d3", "d5"],
    ]);

    const h = renderHook(() => useHarness());
    act(() => h.result.current.tutorial.handleStartLesson(lesson!.id));

    for (const [index, leaf] of leaves.entries()) {
      if (index > 0) {
        // « Explorer une autre variante » : retour à la bifurcation la plus proche
        expect(h.result.current.tutorial.canExploreOtherBranch).toBe(true);
        act(() => h.result.current.tutorial.handleRewindToBranch());
        expect(h.result.current.tutorial.isWaitingForBranchChoice).toBe(true);
        expect(h.result.current.tutorial.exploredChoices.length).toBeGreaterThan(0);
      }
      currentTarget = leaf;
      await playTo(h, leaf);

      const done = getSnapshot().completedChapters.includes(lesson!.id);
      expect(done, `après ${index + 1}/${leaves.length} variantes`).toBe(index === leaves.length - 1);
      expect(h.result.current.tutorial.coverage).toMatchObject({ explored: index + 1, total: leaves.length });
    }
    expect(h.result.current.tutorial.canExploreOtherBranch).toBe(false);
    expect(h.result.current.tutorial.isLessonCompleted).toBe(true);
    expect(leaves.map(pathKey)).toHaveLength(new Set(leaves.map(pathKey)).size);
  });

  it("« Cours suivant » passe au chapitre suivant après le dernier cours d'un chapitre", () => {
    const h = renderHook(() => useHarness());
    act(() => h.result.current.tutorial.handleStartLesson("french-c1-l2"));

    expect(h.result.current.tutorial.nextLesson).toMatchObject({ id: "french-c2-l1", isNewChapter: true });
    act(() => h.result.current.tutorial.handleNextLesson());
    expect(h.result.current.tutorial.activeLessonId).toBe("french-c2-l1");
    expect(h.result.current.tutorial.activeChapterIndex).toBe(1);
    expect(h.result.current.fen).toBe(INITIAL_FEN);

    act(() => h.result.current.tutorial.handleStartLesson("french-c2-l3"));
    expect(h.result.current.tutorial.nextLesson).toBeNull();
  });

  it("revient à la vue des chapitres, puis au menu", () => {
    const h = renderHook(() => useHarness());
    act(() => h.result.current.tutorial.handleStartLesson("italian-c2-l1"));
    act(() => h.result.current.tutorial.handleBackToCourse());

    expect(h.result.current.panelMode).toBe("opening_selector");
    expect(h.result.current.tutorial.selectedCourseId).toBe("italian");
    expect(h.result.current.tutorial.activeLesson).toBeNull();

    act(() => h.result.current.tutorial.handleBackToMenu());
    expect(h.result.current.panelMode).toBe("menu");
    expect(h.result.current.tutorial.selectedCourseId).toBeNull();
  });
});
