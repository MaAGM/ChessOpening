// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ExplorerWorkspace } from "./ExplorerWorkspace";

function renderWorkspace(onFlipBoard?: () => void) {
  const { container } = render(
    <ExplorerWorkspace
      onFlipBoard={onFlipBoard}
      back={<button type="button">Menu</button>}
      title="Sicilienne"
      board={<div>board</div>}
      moves={<div>moves</div>}
      engine={<div>stockfish</div>}
      explorer={<div>explorer</div>}
      coach={<div>coach</div>}
    />,
  );
  const visible = (name: string) =>
    !container.querySelector(`[data-slot="${name}"]`)!.classList.contains("hidden");
  return { visible, container };
}

afterEach(cleanup);

describe("ExplorerWorkspace", () => {
  it("n'affiche qu'une vue à la fois, Explorateur par défaut, et bascule en un clic", () => {
    const { visible, container } = renderWorkspace();

    expect(screen.getAllByRole("tab").map((tab) => tab.getAttribute("aria-label"))).toEqual(["Explorateur", "Coach"]);
    // Boutons-icônes, sans texte, dans la même barre que Stockfish.
    expect(screen.getAllByRole("tab").every((tab) => tab.textContent === "")).toBe(true);
    const toolbar = container.querySelector('[data-slot="toolbar"]')!;
    expect(toolbar.contains(screen.getByText("stockfish"))).toBe(true);
    expect(toolbar.contains(screen.getByRole("tablist"))).toBe(true);
    expect(screen.getByRole("tab", { name: "Explorateur" }).getAttribute("aria-selected")).toBe("true");
    expect(visible("explorer")).toBe(true);
    expect(visible("coach")).toBe(false);
    expect(screen.getByText("stockfish")).toBeTruthy();

    fireEvent.click(screen.getByRole("tab", { name: "Coach" }));
    expect(visible("explorer")).toBe(false);
    expect(visible("coach")).toBe(true);
    // Les deux vues restent montées (la discussion survit au changement de vue).
    expect(screen.getByText("explorer")).toBeTruthy();

    fireEvent.click(screen.getByRole("tab", { name: "Explorateur" }));
    expect(visible("explorer")).toBe(true);
    expect(visible("coach")).toBe(false);
  });

  it("propose de retourner l'échiquier depuis la barre du panneau", () => {
    const onFlip = vi.fn();
    const { container } = renderWorkspace(onFlip);
    const button = screen.getByRole("button", { name: "Retourner l'échiquier" });
    expect(container.querySelector('[data-slot="toolbar"]')!.contains(button)).toBe(true);
    fireEvent.click(button);
    expect(onFlip).toHaveBeenCalledTimes(1);
  });

  it("masque le bouton de retournement sans gestionnaire", () => {
    renderWorkspace();
    expect(screen.queryByRole("button", { name: "Retourner l'échiquier" })).toBeNull();
  });
});
