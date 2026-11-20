import { describe, expect, it, vi } from "vitest";

import type { PanelMode } from "@/hooks/useTrainerMode";

import {
  ENGINE_ARROW_COLOR,
  REVIEW_HINT_ARROW_COLOR,
  boardModeKind,
  engineAllowed,
  isBrowsingScreen,
  resolveBoardController,
  shouldEnterExplorer,
  type BoardControllerInput,
} from "./boardController";

describe("shouldEnterExplorer", () => {
  const ALL: PanelMode[] = [
    "menu",
    "explorer",
    "opening_selector",
    "learning_active",
    "review_setup",
    "review_active",
    "repertoire_list",
    "repertoire_editor",
  ];

  it("le menu et les trois options pas encore lancées sont des écrans de navigation", () => {
    expect(ALL.filter(isBrowsingScreen)).toEqual(["menu", "opening_selector", "review_setup", "repertoire_list"]);
  });

  it("ouvre l'Exploration quand un coup est joué depuis un écran de navigation", () => {
    for (const mode of ["menu", "opening_selector", "review_setup", "repertoire_list"] as PanelMode[]) {
      expect(shouldEnterExplorer(mode, 0, 1)).toBe(true);
    }
  });

  it("ne bouge pas sans nouveau coup (remise à zéro, navigation) ni ailleurs", () => {
    expect(shouldEnterExplorer("opening_selector", 0, 0)).toBe(false);
    expect(shouldEnterExplorer("menu", 3, 0)).toBe(false);
    for (const mode of ["explorer", "learning_active", "review_active", "repertoire_editor"] as PanelMode[]) {
      expect(shouldEnterExplorer(mode, 0, 1)).toBe(false);
    }
  });
});

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

describe("analyse moteur", () => {
  it("engineAllowed : masquée pendant les exercices uniquement", () => {
    expect(engineAllowed("review_active")).toBe(false);
    expect(engineAllowed("learning_active")).toBe(false);
    const allowed: PanelMode[] = [
      "menu",
      "explorer",
      "opening_selector",
      "review_setup",
      "repertoire_list",
      "repertoire_editor",
    ];
    for (const mode of allowed) expect(engineAllowed(mode)).toBe(true);
  });

  it("transmet la flèche du meilleur coup sans toucher aux flèches de l'écran", () => {
    for (const mode of ["repertoire_editor", "menu"] as PanelMode[]) {
      const c = resolveBoardController(makeInput(mode, { engineBestMove: ["e2", "e4"] }));
      expect(c.showEngine).toBe(true);
      expect(c.engineArrow).toEqual(["e2", "e4"]);
    }
    const editor = resolveBoardController(makeInput("repertoire_editor", { engineBestMove: ["e2", "e4"] }));
    expect(editor.arrows).toEqual([["g1", "f3"]]);
  });

  it("masque la flèche en révision et en apprentissage", () => {
    for (const mode of ["review_active", "learning_active"] as PanelMode[]) {
      const c = resolveBoardController(makeInput(mode, { engineBestMove: ["e2", "e4"] }));
      expect(c.showEngine).toBe(false);
      expect(c.engineArrow).toBeNull();
    }
  });

  it("sans meilleur coup connu : aucune flèche moteur", () => {
    expect(resolveBoardController(makeInput("menu")).engineArrow).toBeNull();
    expect(resolveBoardController(makeInput("menu", { engineBestMove: null })).engineArrow).toBeNull();
  });

  it("couleur moteur distincte des autres flèches", () => {
    expect(ENGINE_ARROW_COLOR).not.toBe(REVIEW_HINT_ARROW_COLOR);
  });
});
