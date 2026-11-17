import { describe, expect, it, vi } from "vitest";

import type { PanelMode } from "@/hooks/useTrainerMode";

import {
  REVIEW_HINT_ARROW_COLOR,
  boardModeKind,
  resolveBoardController,
  type BoardControllerInput,
} from "./boardController";

function makeInput(panelMode: PanelMode, overrides: Partial<BoardControllerInput> = {}) {
  const input: BoardControllerInput = {
    panelMode,
    baseSquareStyles: { e2: { background: "base" } },
    editor: {
      handlePieceDrop: vi.fn(() => true),
      handleSquareClick: vi.fn(),
      lastMoveSquares: { e2: { background: "last" }, e4: { background: "last" } },
      currentNode: { arrows: [["g1", "f3"]] },
      side: "black",
    },
    review: {
      handlePieceDrop: vi.fn(() => true),
      handleSquareClick: vi.fn(),
      errorSquares: { e2: { background: "error" } },
      hintArrows: [["d2", "d4"]],
      side: "black",
    },
    tutorial: {
      handlePieceDrop: vi.fn(() => true),
      handleSquareClick: vi.fn(),
      activeNode: { arrows: [["c2", "c4"]] },
      userColor: "white",
    },
    ...overrides,
  };
  return input;
}

describe("boardModeKind", () => {
  it("associe chaque écran à son mode d'échiquier", () => {
    expect(boardModeKind("repertoire_editor")).toBe("editor");
    expect(boardModeKind("review_active")).toBe("review");
    const tutorialLike: PanelMode[] = [
      "menu",
      "explorer",
      "opening_selector",
      "learning_active",
      "review_setup",
      "repertoire_list",
    ];
    for (const mode of tutorialLike) expect(boardModeKind(mode)).toBe("tutorial");
  });
});

describe("resolveBoardController", () => {
  it("éditeur : handlers de l'éditeur, sélection par-dessus le dernier coup, couleur du répertoire", () => {
    const input = makeInput("repertoire_editor");
    const c = resolveBoardController(input);
    expect(c.kind).toBe("editor");
    expect(c.orientation).toBe("black");
    expect(c.squareStyles).toEqual({ e2: { background: "base" }, e4: { background: "last" } });
    expect(c.arrows).toEqual([["g1", "f3"]]);
    expect(c.arrowColor).toBeUndefined();
    expect(c.onPieceDrop).toBe(input.editor.handlePieceDrop);
    expect(c.onSquareClick).toBe(input.editor.handleSquareClick);
  });

  it("éditeur sans répertoire : retombe sur la couleur du tutoriel", () => {
    const input = makeInput("repertoire_editor");
    input.editor.side = null;
    expect(resolveBoardController(input).orientation).toBe("white");
  });

  it("révision : erreurs par-dessus la sélection, flèches vertes, couleur choisie", () => {
    const input = makeInput("review_active");
    const c = resolveBoardController(input);
    expect(c.kind).toBe("review");
    expect(c.orientation).toBe("black");
    expect(c.squareStyles).toEqual({ e2: { background: "error" } });
    expect(c.arrows).toEqual([["d2", "d4"]]);
    expect(c.arrowColor).toBe(REVIEW_HINT_ARROW_COLOR);
    expect(c.onPieceDrop).toBe(input.review.handlePieceDrop);
    expect(c.onSquareClick).toBe(input.review.handleSquareClick);
  });

  it("révision sans couleur : retombe sur la couleur du tutoriel", () => {
    const input = makeInput("review_active");
    input.review.side = null;
    expect(resolveBoardController(input).orientation).toBe("white");
  });

  it("autres écrans : le tutoriel pilote l'échiquier, l'éditeur n'influence pas l'orientation", () => {
    const input = makeInput("learning_active");
    const c = resolveBoardController(input);
    expect(c.kind).toBe("tutorial");
    expect(c.orientation).toBe("white");
    expect(c.squareStyles).toBe(input.baseSquareStyles);
    expect(c.arrows).toEqual([["c2", "c4"]]);
    expect(c.arrowColor).toBeUndefined();
    expect(c.onPieceDrop).toBe(input.tutorial.handlePieceDrop);
    expect(c.onSquareClick).toBe(input.tutorial.handleSquareClick);
  });

  it("tutoriel sans nœud actif : aucune flèche", () => {
    const input = makeInput("menu");
    input.tutorial.activeNode = null;
    expect(resolveBoardController(input).arrows).toBeUndefined();
  });
});
