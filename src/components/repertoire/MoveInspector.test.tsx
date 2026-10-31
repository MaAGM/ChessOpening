// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MoveInspector } from "./MoveInspector";
import type { RepertoireNode } from "@/lib/repertoire/types";

afterEach(cleanup);

const node = (overrides: Partial<RepertoireNode> = {}): RepertoireNode => ({
  id: "n1",
  san: "Nf3",
  children: [],
  ...overrides,
});

const setup = (n: RepertoireNode | null, ply = 3) => {
  const onToggleSymbol = vi.fn();
  const onSetComment = vi.fn();
  // createElement plutôt que du JSX : aucun réglage de compilation n'est nécessaire pour ce test
  const element = (node: RepertoireNode | null, nodePly: number) =>
    createElement(MoveInspector, { node, ply: nodePly, onToggleSymbol, onSetComment });

  const view = render(element(n, ply));
  const rerender = (next: RepertoireNode | null, nextPly = ply) => view.rerender(element(next, nextPly));
  return { onToggleSymbol, onSetComment, rerender, unmount: view.unmount };
};

const textarea = () => screen.getByLabelText("Commentaire du coup") as HTMLTextAreaElement;

describe("MoveInspector", () => {
  it("invite à sélectionner un coup à la position initiale", () => {
    setup(null);
    expect(screen.getByText(/Sélectionnez un coup/)).toBeTruthy();
    expect(screen.queryByLabelText("Commentaire du coup")).toBeNull();
  });

  it("affiche le coup avec son numéro (Blancs et Noirs)", () => {
    const { rerender } = setup(node({ san: "Nf3" }), 3);
    expect(screen.getByText("2. Nf3")).toBeTruthy();

    rerender(node({ id: "n2", san: "a6", symbol: "!?" }), 10);
    expect(screen.getByText("5… a6!?")).toBeTruthy();
  });

  it("indique le symbole actif et signale le clic sur un symbole", () => {
    const { onToggleSymbol } = setup(node({ symbol: "!" }));

    expect(screen.getByRole("button", { name: "Bon coup" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "Gaffe" }).getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(screen.getByRole("button", { name: "Gaffe" }));
    expect(onToggleSymbol).toHaveBeenCalledWith("??");
  });

  it("enregistre le commentaire en quittant le champ, une seule fois", () => {
    const { onSetComment } = setup(node());

    fireEvent.change(textarea(), { target: { value: "Idée : pression sur e5" } });
    expect(onSetComment).not.toHaveBeenCalled(); // pas à chaque frappe

    fireEvent.blur(textarea());
    expect(onSetComment).toHaveBeenCalledTimes(1);
    expect(onSetComment).toHaveBeenCalledWith("n1", "Idée : pression sur e5");
  });

  it("n'enregistre rien quand le commentaire n'a pas changé", () => {
    const { onSetComment } = setup(node({ comment: "déjà là" }));
    fireEvent.focus(textarea());
    fireEvent.blur(textarea());
    expect(onSetComment).not.toHaveBeenCalled();

    // Des espaces en plus ne comptent pas comme un changement
    fireEvent.change(textarea(), { target: { value: "  déjà là  " } });
    fireEvent.blur(textarea());
    expect(onSetComment).not.toHaveBeenCalled();
  });

  it("enregistre le brouillon quand on passe à un autre coup", () => {
    const { onSetComment, rerender } = setup(node({ id: "n1" }));
    fireEvent.change(textarea(), { target: { value: "à ne pas perdre" } });

    rerender(node({ id: "n2", san: "d4", comment: "autre coup" }), 3);

    expect(onSetComment).toHaveBeenCalledWith("n1", "à ne pas perdre");
    expect(textarea().value).toBe("autre coup"); // le champ affiche le commentaire du nouveau coup
  });

  it("enregistre le brouillon quand le panneau se ferme", () => {
    const { onSetComment, unmount } = setup(node());
    fireEvent.change(textarea(), { target: { value: "noté juste avant de partir" } });

    unmount();

    expect(onSetComment).toHaveBeenCalledWith("n1", "noté juste avant de partir");
  });

  it("suit le commentaire enregistré quand il change ailleurs (annulation)", () => {
    const { rerender } = setup(node({ comment: "version 2" }));
    expect(textarea().value).toBe("version 2");

    rerender(node({ comment: "version 1" }));
    expect(textarea().value).toBe("version 1");

    rerender(node({ comment: undefined }));
    expect(textarea().value).toBe("");
  });
});
