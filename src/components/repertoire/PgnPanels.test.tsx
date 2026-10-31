// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Chess } from "chess.js";
import { createElement, useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PgnExportPanel } from "./PgnExportPanel";
import { PgnImporter, type PgnAnalysis } from "./PgnImporter";
import { RepertoireEditorPanel } from "./RepertoireEditorPanel";
import { RepertoireListPanel } from "./RepertoireListPanel";
import { useRepertoireEditor } from "@/hooks/useRepertoireEditor";
import { INITIAL_FEN } from "@/lib/repertoire/repertoireTree";
import { createRepertoire, getSnapshot, updateRepertoireTree } from "@/lib/repertoire/repertoireStore";
import type { Repertoire } from "@/lib/repertoire/types";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
beforeEach(() => window.localStorage.clear());

const PGN = `[Event "Mon 1.e4"]
[Orientation "black"]

1. e4 e5 (1... c5 2. Nf3) 2. Nf3 Nc6 *`;

const analyzeText = async (text: string) => {
  fireEvent.change(screen.getByLabelText("Texte PGN"), { target: { value: text } });
  fireEvent.click(screen.getByRole("button", { name: "Analyser" }));
};

const confirmMock = (result: string | null = null) =>
  vi.fn<(analysis: PgnAnalysis) => string | null>(() => result);
type ConfirmMock = ReturnType<typeof confirmMock>;

describe("PgnImporter", () => {
  function setup(onConfirm: ConfirmMock = confirmMock()) {
    const onAnalyzed = vi.fn();
    const onCancel = vi.fn();
    render(
      createElement(PgnImporter, {
        title: "Importer un PGN",
        confirmLabel: (count: number) => `Importer ${count} coups`,
        onAnalyzed,
        onConfirm,
        onCancel,
      }),
    );
    return { onConfirm, onAnalyzed, onCancel };
  }

  it("analyse le texte collé, affiche le rapport puis confirme avec l'arbre analysé", async () => {
    const { onConfirm, onAnalyzed } = setup();
    await analyzeText(PGN);

    expect(await screen.findByText(/1 partie/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Importer 6 coups" })).toBeTruthy();
    expect(onAnalyzed).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Importer 6 coups" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    const analysis = (onConfirm.mock.calls[0] as unknown[])[0] as { suggestedName: string; suggestedSide: string };
    expect(analysis.suggestedName).toBe("Mon 1.e4");
    expect(analysis.suggestedSide).toBe("black");
  });

  it("garde le bouton de confirmation inactif tant que rien n'a été analysé", () => {
    setup();
    const confirm = screen.getByRole("button", { name: "Importer" }) as HTMLButtonElement;
    expect(confirm.disabled).toBe(true);
    expect((screen.getByRole("button", { name: "Analyser" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("invalide le rapport dès que le texte est modifié", async () => {
    setup();
    await analyzeText(PGN);
    await screen.findByText(/1 partie/);

    fireEvent.change(screen.getByLabelText("Texte PGN"), { target: { value: `${PGN} ` } });

    expect(screen.queryByText(/1 partie/)).toBeNull();
    expect((screen.getByRole("button", { name: "Importer" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("explique un texte sans partie et un import impossible", async () => {
    setup();
    await analyzeText("%%%");
    expect(await screen.findByText("Aucune partie reconnue dans ce texte.")).toBeTruthy();
  });

  it("signale les parties ignorées et les problèmes, sans bloquer le reste", async () => {
    setup();
    await analyzeText(`[Variant "Crazyhouse"]\n\n1. e4 *\n\n[Event "ok"]\n\n1. e4 e5 (1... Qh5) 2. Nf3 *`);

    expect(await screen.findByText(/Partie 1 ignorée/)).toBeTruthy();
    expect(screen.getByText(/1 problème/)).toBeTruthy();
    expect((screen.getByRole("button", { name: "Importer 3 coups" }) as HTMLButtonElement).disabled).toBe(false);
  });

  it("refuse la confirmation d'un texte sans aucun coup importable", async () => {
    setup();
    await analyzeText("[Event \"vide\"]\n\n*");
    expect(await screen.findByText(/Rien à importer/)).toBeTruthy();
  });

  it("affiche le message d'erreur renvoyé par la confirmation", async () => {
    setup(confirmMock("Ce répertoire n'existe plus."));
    await analyzeText(PGN);
    await screen.findByText(/1 partie/);
    fireEvent.click(screen.getByRole("button", { name: "Importer 6 coups" }));
    expect(await screen.findByText("Ce répertoire n'existe plus.")).toBeTruthy();
  });

  it("lit un fichier choisi et l'analyse aussitôt", async () => {
    setup();
    const input = screen.getByLabelText("Fichier PGN") as HTMLInputElement;
    const file = new File([PGN], "etude.pgn", { type: "application/x-chess-pgn" });

    fireEvent.change(input, { target: { files: [file] } });

    expect(await screen.findByText(/1 partie/)).toBeTruthy();
    expect((screen.getByLabelText("Texte PGN") as HTMLTextAreaElement).value).toContain("Mon 1.e4");
  });

  it("refuse un fichier trop volumineux sans le lire", async () => {
    setup();
    const input = screen.getByLabelText("Fichier PGN") as HTMLInputElement;
    const big = new File(["x"], "gros.pgn");
    Object.defineProperty(big, "size", { value: 3 * 1024 * 1024 });

    fireEvent.change(input, { target: { files: [big] } });

    expect(await screen.findByText(/trop volumineux/)).toBeTruthy();
  });

  it("permet d'annuler", () => {
    const { onCancel } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Annuler" }));
    expect(onCancel).toHaveBeenCalled();
  });
});

describe("PgnExportPanel", () => {
  const repertoire = {
    id: "r1",
    name: "Mon 1.e4 : Sicilienne",
    side: "white",
    category: null,
    reviewEnabled: true,
    children: [{ id: "a", san: "e4", children: [] }],
    origin: { kind: "custom" },
    createdAt: 0,
    updatedAt: 0,
  } as Repertoire;

  it("copie le PGN dans le presse-papiers", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    render(createElement(PgnExportPanel, { repertoire, onClose: () => {} }));

    fireEvent.click(screen.getByRole("button", { name: "Copier le PGN" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    const pgn = (writeText.mock.calls[0] as string[])[0];
    expect(pgn).toContain('[Event "Mon 1.e4 : Sicilienne"]');
    expect(pgn).toContain("1. e4 *");
    expect(await screen.findByText(/copié/)).toBeTruthy();
  });

  it("explique quand la copie est impossible", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockRejectedValue(new Error("refusé")) },
      configurable: true,
    });
    render(createElement(PgnExportPanel, { repertoire, onClose: () => {} }));
    fireEvent.click(screen.getByRole("button", { name: "Copier le PGN" }));
    expect(await screen.findByText(/Copie impossible/)).toBeTruthy();
  });

  it("télécharge un fichier .pgn au nom sûr", () => {
    const createObjectURL = vi.fn(() => "blob:test");
    const revokeObjectURL = vi.fn();
    Object.assign(URL, { createObjectURL, revokeObjectURL });
    const names: string[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      names.push(this.download);
    });
    render(createElement(PgnExportPanel, { repertoire, onClose: () => {} }));

    fireEvent.click(screen.getByRole("button", { name: "Télécharger (.pgn)" }));

    expect(names).toEqual(["mon-1-e4-sicilienne.pgn"]);
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:test");
  });
});

// ---------------------------------------------------------------------------
// Assemblages : l'éditeur et la liste, comme dans l'application
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

describe("import dans l'éditeur", () => {
  it("ajoute les coups d'un PGN au répertoire ouvert, puis tout s'annule en une fois", async () => {
    const created = createRepertoire({ name: "Test", side: "white" });
    if (!created.ok) throw new Error("création impossible");
    render(createElement(EditorHarness, { repertoireId: created.value }));

    fireEvent.click(screen.getByRole("button", { name: "Importer PGN" }));
    await analyzeText(PGN);
    await screen.findByText(/1 partie/);
    fireEvent.click(screen.getByRole("button", { name: "Ajouter jusqu'à 6 coups" }));

    expect(await screen.findByText(/6 coups ajoutés/)).toBeTruthy();
    expect(getSnapshot().repertoires[created.value].children[0].san).toBe("e4");
    expect(screen.getByText("Position initiale")).toBeTruthy(); // l'éditeur est revenu à l'arbre

    act(() => current.undo());
    expect(getSnapshot().repertoires[created.value].children).toHaveLength(0);
  });

  it("masque la barre d'outils pendant l'import et la rétablit à l'annulation", () => {
    const created = createRepertoire({ name: "Test", side: "white" });
    if (!created.ok) throw new Error("création impossible");
    render(createElement(EditorHarness, { repertoireId: created.value }));

    expect(screen.getByRole("toolbar")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Importer PGN" }));
    expect(screen.queryByRole("toolbar")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Annuler" }));
    expect(screen.getByRole("toolbar")).toBeTruthy();
  });

  it("propose l'export depuis l'éditeur", () => {
    const created = createRepertoire({ name: "Test", side: "white" });
    if (!created.ok) throw new Error("création impossible");
    updateRepertoireTree(created.value, [{ id: "a", san: "e4", children: [] }]);
    render(createElement(EditorHarness, { repertoireId: created.value }));

    fireEvent.click(screen.getByRole("button", { name: "Exporter PGN" }));
    expect(screen.getByRole("button", { name: "Copier le PGN" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Fermer" }));
    expect(screen.getByRole("toolbar")).toBeTruthy();
  });
});

describe("import depuis la liste des répertoires", () => {
  it("crée un répertoire à partir d'un PGN, avec le nom et la couleur proposés, et l'ouvre", async () => {
    const onOpen = vi.fn();
    render(createElement(RepertoireListPanel, { onOpen }));

    fireEvent.click(screen.getByRole("button", { name: "Importer un PGN" }));
    await analyzeText(PGN);
    await screen.findByText(/1 partie/);
    fireEvent.click(screen.getByRole("button", { name: "Continuer" }));

    // Formulaire prérempli depuis le PGN
    expect((screen.getByPlaceholderText("Mon 1.e4 contre la Sicilienne") as HTMLInputElement).value).toBe("Mon 1.e4");
    expect(screen.getByRole("button", { name: /Noirs/ }).getAttribute("aria-pressed")).toBe("true");

    fireEvent.click(screen.getByRole("button", { name: "Importer 6 coups" }));

    expect(onOpen).toHaveBeenCalledTimes(1);
    const id = (onOpen.mock.calls[0] as string[])[0];
    const created = getSnapshot().repertoires[id];
    expect(created).toMatchObject({ name: "Mon 1.e4", side: "black" });
    expect(created.children[0].san).toBe("e4");
  });
});
