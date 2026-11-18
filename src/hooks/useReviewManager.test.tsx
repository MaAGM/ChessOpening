// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { Chess } from "chess.js";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PanelMode } from "./useTrainerMode";
import { useReviewManager } from "./useReviewManager";
import { openingCourses } from "@/lib/data/openings";
import {
  createRepertoire,
  deleteRepertoire,
  getSnapshot as getRepertoireSnapshot,
  updateRepertoireMeta,
  updateRepertoireTree,
} from "@/lib/repertoire/repertoireStore";
import { INITIAL_FEN } from "@/lib/repertoire/repertoireTree";
import type { RepertoireNode } from "@/lib/repertoire/types";
import { toPositionKey } from "@/lib/review/positionKey";
import {
  addReviewChapter,
  getSnapshot as getReviewSnapshot,
  removeReviewChapter,
  resetPositionStats,
} from "@/lib/review/reviewStore";
import type { Side } from "@/lib/review/types";

/** Mini-échiquier : reproduit ce que fournit useChessGame (position, coup joué, remise à zéro). */
function useHarness(side: Side | null, panelMode: PanelMode = "review_active") {
  const [fen, setFen] = useState(INITIAL_FEN);

  const review = useReviewManager({
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
    resetGame: () => setFen(INITIAL_FEN),
    clearSelection: () => {},
    panelMode,
    reviewSide: side,
  });

  return { review, fen };
}

const line = (...sans: string[]): RepertoireNode[] => {
  let children: RepertoireNode[] = [];
  for (const san of [...sans].reverse()) children = [{ id: `id-${san}-${children.length}`, san, children }];
  return children;
};

/** Crée un répertoire contenant la ligne donnée. */
function newRepertoire(side: Side, sans: string[], name = "Ma Française"): string {
  const created = createRepertoire({ name, side });
  if (!created.ok) throw new Error("création impossible");
  updateRepertoireTree(created.value, line(...sans));
  return created.value;
}

const keyAfter = (...sans: string[]) => {
  const game = new Chess();
  sans.forEach((san) => game.move(san));
  return toPositionKey(game.fen());
};

/** Laisse le temps à l'ordinateur de jouer son coup (délai de 400 ms). */
const computerPlays = () =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(450);
  });

beforeEach(() => {
  vi.useFakeTimers();
  window.localStorage.clear();
  for (const id of [...getRepertoireSnapshot().order]) deleteRepertoire(id);
  for (const id of Object.keys(getReviewSnapshot().reviewChapters)) removeReviewChapter(id);
  resetPositionStats();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("useReviewManager avec un répertoire", () => {
  it("propose la révision d'un répertoire seul, avec ses fiches toutes nouvelles", () => {
    newRepertoire("black", ["e4", "e6", "d4", "d5"]);
    const { result } = renderHook(() => useHarness("black"));

    expect(result.current.review.hasRepertoire).toBe(true);
    // Deux positions où les Noirs jouent : après 1.e4 et après 1.e4 e6 2.d4
    expect(result.current.review.cardSummary).toMatchObject({ total: 2, new: 2, due: 0, mastered: 0 });
  });

  it("fait jouer l'ordinateur d'après le répertoire, et nomme la ligne en cours", async () => {
    newRepertoire("black", ["e4", "e6", "d4", "d5"]);
    const { result } = renderHook(() => useHarness("black"));

    expect(result.current.review.isComputerTurn).toBe(true); // les Blancs ouvrent
    await computerPlays();

    expect(result.current.fen).toContain("4P3"); // 1.e4 est joué
    expect(result.current.review.isPlayerTurn).toBe(true);
    expect(result.current.review.currentChapterNames).toEqual(["Ma Française"]);
  });

  it("note la fiche quand le joueur trouve le bon coup du premier coup", async () => {
    newRepertoire("black", ["e4", "e6", "d4", "d5"]);
    const { result } = renderHook(() => useHarness("black"));
    await computerPlays();

    let accepted = false;
    act(() => {
      accepted = result.current.review.handlePieceDrop("e7", "e6");
    });

    expect(accepted).toBe(true);
    const card = getReviewSnapshot().positions[keyAfter("e4")];
    expect(card).toMatchObject({ box: 2, attempts: 1, failures: 0 });
  });

  it("refuse un coup hors répertoire, montre le bon coup et note l'échec", async () => {
    newRepertoire("black", ["e4", "e6", "d4", "d5"]);
    const { result } = renderHook(() => useHarness("black"));
    await computerPlays();

    let accepted = true;
    act(() => {
      accepted = result.current.review.handlePieceDrop("a7", "a6");
    });

    expect(accepted).toBe(false);
    expect(result.current.review.feedback?.message).toContain("e6");
    expect(result.current.review.hintArrows).toEqual([["e7", "e6"]]);
    expect(result.current.review.stats.mistakes).toBe(1);
    expect(getReviewSnapshot().positions[keyAfter("e4")]).toMatchObject({ box: 1, failures: 1 });
  });

  it("transmet chaque coup hors répertoire au Coach, et l'oublie à la ligne suivante", async () => {
    newRepertoire("black", ["e4", "e6", "d4", "d5"]);
    const { result } = renderHook(() => useHarness("black"));
    await computerPlays();
    expect(result.current.review.lastMistake).toBeNull();

    const fenBefore = result.current.fen;
    act(() => {
      result.current.review.handlePieceDrop("a7", "a6");
    });
    const first = result.current.review.lastMistake;
    expect(first).toMatchObject({ fenBefore, playedSan: "a6" });
    // Le répertoire est repris avec son arbre d'origine (symboles compris)
    expect(first?.sources).toEqual([
      expect.objectContaining({ kind: "repertoire", name: "Ma Française" }),
    ]);

    act(() => {
      result.current.review.handlePieceDrop("c7", "c5");
    });
    expect(result.current.review.lastMistake).toMatchObject({ playedSan: "c5" });
    expect(result.current.review.lastMistake?.id).not.toBe(first?.id);

    act(() => {
      result.current.review.restartLine();
    });
    expect(result.current.review.lastMistake).toBeNull();
  });

  it("déroule toute une ligne du répertoire jusqu'à la fin", async () => {
    newRepertoire("black", ["e4", "e6", "d4", "d5"]);
    const { result } = renderHook(() => useHarness("black"));

    await computerPlays(); // 1.e4
    act(() => {
      result.current.review.handlePieceDrop("e7", "e6");
    });
    await computerPlays(); // 2.d4
    act(() => {
      result.current.review.handlePieceDrop("d7", "d5");
    });

    expect(result.current.review.isLineFinished).toBe(true);
    expect(result.current.review.stats).toMatchObject({ completedLines: 1, perfectLines: 1, mistakes: 0 });
    expect(result.current.review.cardSummary).toMatchObject({ total: 2, new: 0, learning: 2 });
  });
});

describe("sources de révision", () => {
  it("n'offre rien pour la mauvaise couleur", () => {
    newRepertoire("white", ["e4", "e5"]);
    const { result } = renderHook(() => useHarness("black"));
    expect(result.current.review.hasRepertoire).toBe(false);
  });

  it("ignore un répertoire dont l'interrupteur est désactivé, et réagit quand on le réactive", () => {
    const id = newRepertoire("black", ["e4", "e6"]);
    updateRepertoireMeta(id, { reviewEnabled: false });
    const { result } = renderHook(() => useHarness("black"));
    expect(result.current.review.hasRepertoire).toBe(false);

    act(() => {
      updateRepertoireMeta(id, { reviewEnabled: true });
    });
    expect(result.current.review.hasRepertoire).toBe(true);

    act(() => {
      updateRepertoireMeta(id, { reviewEnabled: false });
    });
    expect(result.current.review.hasRepertoire).toBe(false);
  });

  it("n'offre rien pour un répertoire sans coup", () => {
    const created = createRepertoire({ name: "Vide", side: "black" });
    if (!created.ok) throw new Error("création impossible");
    const { result } = renderHook(() => useHarness("black"));
    expect(result.current.review.hasRepertoire).toBe(false);
  });

  it("ajoute les fiches d'un répertoire à celles des chapitres déjà ajoutés aux révisions", () => {
    const blackChapter = openingCourses.find((c) => c.side === "black")!.chapters[0];
    addReviewChapter(blackChapter.id);
    const { result, rerender } = renderHook(() => useHarness("black"));
    const chaptersOnly = result.current.review.cardSummary.total;
    expect(chaptersOnly).toBeGreaterThan(0);

    // Une ligne du répertoire qui n'existe dans aucun chapitre ajoute de nouvelles fiches
    act(() => {
      newRepertoire("black", ["a3", "a6", "b3", "b6"]);
    });
    rerender();

    expect(result.current.review.cardSummary.total).toBe(chaptersOnly + 2);
  });

  it("ne reconstruit rien quand on n'est pas en mode révision", () => {
    newRepertoire("black", ["e4", "e6"]);
    const { result } = renderHook(() => useHarness("black", "menu"));
    expect(result.current.review.hasRepertoire).toBe(false);
  });
});
