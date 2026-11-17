// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Chess } from "chess.js";
import { createElement, useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MoveInspector } from "./MoveInspector";
import { RepertoireEditorPanel } from "./RepertoireEditorPanel";
import { RepertoireListPanel } from "./RepertoireListPanel";
import { VariationTree } from "./VariationTree";
import { useRepertoireEditor } from "@/hooks/useRepertoireEditor";
import { REPERTOIRE_LIMITS } from "@/lib/repertoire/limits";
import { createRepertoire, deleteRepertoire, getSnapshot, updateRepertoireTree } from "@/lib/repertoire/repertoireStore";
import { INITIAL_FEN, computeFens, findTranspositions } from "@/lib/repertoire/repertoireTree";
import type { RepertoireNode, TreeRoot } from "@/lib/repertoire/types";

// L'espace de stockage est simulé : jsdom ne permet pas de remplir 4 Mo sans lenteur.
const storage = vi.hoisted(() => ({ bytes: 0 }));
vi.mock("@/lib/browser/storageUsage", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/browser/storageUsage")>()),
  getLocalStorageUsageBytes: () => storage.bytes,
}));

afterEach(cleanup);
beforeEach(() => {
  window.localStorage.clear();
  storage.bytes = 0;
  for (const id of [...getSnapshot().order]) deleteRepertoire(id);
});

const node = (id: string, san: string, children: RepertoireNode[] = []): RepertoireNode => ({ id, san, children });

/** 1.d4 Nf6 2.c4 e6 3.Nc3  et  1.c4 e6 2.Nc3 Nf6 3.d4 : deux ordres de coups, même position. */
const transposingTree = (): TreeRoot => ({
  children: [
    node("d4", "d4", [node("nf6", "Nf6", [node("c4", "c4", [node("e6", "e6", [node("nc3a", "Nc3")])])])]),
    node("c4b", "c4", [node("e6b", "e6", [node("nc3b", "Nc3", [node("nf6b", "Nf6", [node("d4b", "d4")])])])]),
  ],
});

describe("badge de transposition dans l'arbre", () => {
  function renderTree(root: TreeRoot, onSelect = vi.fn()) {
    const fens = computeFens(root);
    render(
      createElement(VariationTree, {
        root,
        fens,
        transpositions: findTranspositions(fens),
        cursorId: "root",
        onSelect,
      }),
    );
    return onSelect;
  }

  const badgeTo = (line: string) =>
    screen
      .getAllByRole("button", { name: /Même position qu'après/ })
      .find((badge) => badge.getAttribute("aria-label")?.includes(line))!;

  it("signale les deux coups qui aboutissent à la même position, avec la ligne de l'autre", () => {
    renderTree(transposingTree());

    expect(screen.getAllByRole("button", { name: /Même position qu'après/ })).toHaveLength(2);
    // Chaque badge cite la ligne de l'AUTRE occurrence
    expect(badgeTo("1. c4 e6 2. Nc3 Nf6 3. d4")).toBeTruthy();
    expect(badgeTo("1. d4 Nf6 2. c4 e6 3. Nc3")).toBeTruthy();
  });

  it("mène à l'autre occurrence d'un clic", () => {
    const onSelect = renderTree(transposingTree());

    // Le badge placé sur « 3.Nc3 » (ligne 1.d4…) renvoie à « 3.d4 » (ligne 1.c4…)
    fireEvent.click(badgeTo("1. c4 e6 2. Nc3 Nf6 3. d4"));
    expect(onSelect).toHaveBeenLastCalledWith("d4b");

    fireEvent.click(badgeTo("1. d4 Nf6 2. c4 e6 3. Nc3"));
    expect(onSelect).toHaveBeenLastCalledWith("nc3a");
  });

  it("n'affiche aucun badge quand il n'y a pas de transposition", () => {
    renderTree({ children: [node("a", "e4", [node("b", "e5")]), node("c", "d4")] });
    expect(screen.queryByRole("button", { name: /Même position/ })).toBeNull();
  });

  it("affiche le contenu prévu pour un arbre vide, sinon le texte par défaut", () => {
    cleanup();
    render(createElement(VariationTree, { root: { children: [] }, fens: new Map(), cursorId: "root", onSelect: () => {}, emptyContent: createElement("p", null, "Contenu sur mesure") }));
    expect(screen.getByText("Contenu sur mesure")).toBeTruthy();

    cleanup();
    render(createElement(VariationTree, { root: { children: [] }, fens: new Map(), cursorId: "root", onSelect: () => {} }));
    expect(screen.getByText(/Aucun coup pour l'instant/)).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
let current: ReturnType<typeof useRepertoireEditor>;

function EditorHarness({ repertoireId }: { repertoireId: string }) {
  const [fen, setFen] = useState(INITIAL_FEN);
  const editor = useRepertoireEditor({
    repertoireId,
    panelMode: "repertoire_editor",
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
    clearSelection: () => {},
  });
  current = editor;
  return createElement(RepertoireEditorPanel, { editor });
}

function emptyRepertoire(): string {
  const created = createRepertoire({ name: "Test", side: "white" });
  if (!created.ok) throw new Error("création impossible");
  return created.value;
}

/** Arbre plat de `count` coups fictifs : sert uniquement à approcher la limite de coups. */
const filler = (count: number): RepertoireNode[] =>
  Array.from({ length: count }, (_, i) => node(`f${i}`, `x${i}`));

describe("éditeur : état vide, aide, limites", () => {
  it("accueille un répertoire vide avec des conseils et un accès direct à l'import", () => {
    render(createElement(EditorHarness, { repertoireId: emptyRepertoire() }));

    expect(screen.getByText("Ce répertoire est vide.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Importer un PGN" }));
    expect(screen.getByLabelText("Texte PGN")).toBeTruthy(); // l'import est ouvert
  });

  it("n'affiche plus l'accueil dès qu'un coup est joué", () => {
    render(createElement(EditorHarness, { repertoireId: emptyRepertoire() }));
    act(() => {
      current.handlePieceDrop("e2", "e4");
    });
    expect(screen.queryByText("Ce répertoire est vide.")).toBeNull();
  });

  it("affiche et masque l'aide des raccourcis clavier", () => {
    render(createElement(EditorHarness, { repertoireId: emptyRepertoire() }));
    const toggle = screen.getByRole("button", { name: "Raccourcis clavier" });

    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("Ctrl+Z")).toBeNull();

    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("Ctrl+Z")).toBeTruthy();
    expect(screen.getByText("Suppr")).toBeTruthy();

    fireEvent.click(toggle);
    expect(screen.queryByText("Ctrl+Z")).toBeNull();
  });

  it("prévient quand le répertoire approche de la limite de coups", () => {
    const id = emptyRepertoire();
    updateRepertoireTree(id, filler(Math.floor(REPERTOIRE_LIMITS.maxNodes * 0.92)));
    render(createElement(EditorHarness, { repertoireId: id }));
    expect(screen.getByText(/approche de la limite/)).toBeTruthy();
  });

  it("annonce que la limite est atteinte, et refuse un nouveau coup", () => {
    const id = emptyRepertoire();
    updateRepertoireTree(id, filler(REPERTOIRE_LIMITS.maxNodes));
    render(createElement(EditorHarness, { repertoireId: id }));

    expect(screen.getByText(/Limite atteinte : 5000 coups/)).toBeTruthy();

    let accepted = true;
    act(() => {
      accepted = current.handlePieceDrop("e2", "e4");
    });
    expect(accepted).toBe(false);
    expect(getSnapshot().repertoires[id].children).toHaveLength(REPERTOIRE_LIMITS.maxNodes);
  });

  it("ne dit rien de la limite pour un répertoire de taille normale", () => {
    const id = emptyRepertoire();
    updateRepertoireTree(id, [node("a", "e4")]);
    render(createElement(EditorHarness, { repertoireId: id }));
    expect(screen.queryByText(/limite/i)).toBeNull();
  });
});

describe("compteur de caractères du commentaire", () => {
  const setup = () =>
    render(createElement(MoveInspector, { node: node("n", "e4"), ply: 1, onToggleSymbol: () => {}, onSetComment: () => {} }));
  const write = (length: number) =>
    fireEvent.change(screen.getByLabelText("Commentaire du coup"), { target: { value: "a".repeat(length) } });

  it("n'apparaît que près de la limite", () => {
    setup();
    write(100);
    expect(screen.queryByText(/ \/ 2000/)).toBeNull();

    write(Math.floor(REPERTOIRE_LIMITS.maxCommentLength * 0.85));
    expect(screen.getByText(/ \/ 2000/)).toBeTruthy();
  });

  it("passe en rouge quand la limite est atteinte", () => {
    setup();
    write(REPERTOIRE_LIMITS.maxCommentLength);
    expect(screen.getByText("2000 / 2000").className).toContain("text-rose-300");
  });
});

describe("alerte d'espace de stockage dans la liste", () => {
  it("n'apparaît pas tant que l'espace est confortable", () => {
    storage.bytes = 1024 * 1024;
    render(createElement(RepertoireListPanel, { onOpen: () => {} }));
    expect(screen.queryByText(/espace de stockage/i)).toBeNull();
  });

  it("prévient et conseille d'exporter quand l'espace est presque plein", () => {
    storage.bytes = 4.4 * 1024 * 1024;
    render(createElement(RepertoireListPanel, { onOpen: () => {} }));
    expect(screen.getByText(/presque plein \(4,4 Mo utilisés/)).toBeTruthy();
    expect(screen.getByText(/Exportez vos répertoires en PGN/)).toBeTruthy();
  });
});
