// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RepertoireListPanel } from "./RepertoireListPanel";
import { ReviewSetup, describeSources } from "@/components/chess/ReviewSetup";
import {
  createRepertoire,
  deleteRepertoire,
  getSnapshot,
  updateRepertoireTree,
} from "@/lib/repertoire/repertoireStore";

afterEach(cleanup);
beforeEach(() => {
  window.localStorage.clear();
  for (const id of [...getSnapshot().order]) deleteRepertoire(id);
});

describe("describeSources", () => {
  it("décrit les chapitres et les répertoires, en omettant ce qui est absent", () => {
    expect(describeSources({ chapters: 2, repertoires: 1 })).toBe("2 chapitres · 1 répertoire");
    expect(describeSources({ chapters: 1, repertoires: 0 })).toBe("1 chapitre");
    expect(describeSources({ chapters: 0, repertoires: 3 })).toBe("3 répertoires");
    expect(describeSources({ chapters: 0, repertoires: 0 })).toBe("Rien à réviser");
  });
});

describe("ReviewSetup", () => {
  it("affiche ce qui est proposé par couleur et ne laisse choisir que celles qui ont du contenu", () => {
    const onStart = vi.fn();
    render(
      createElement(ReviewSetup, {
        counts: {
          white: { chapters: 1, repertoires: 2 },
          black: { chapters: 0, repertoires: 0 },
        },
        onStart,
      }),
    );

    expect(screen.getByText("1 chapitre · 2 répertoires")).toBeTruthy();
    expect(screen.getByText("Rien à réviser")).toBeTruthy();

    const black = screen.getByRole("button", { name: /Noirs/ }) as HTMLButtonElement;
    expect(black.disabled).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: /Blancs/ }));
    expect(onStart).toHaveBeenCalledWith("white");
  });

  it("accepte une couleur qui n'a que des répertoires", () => {
    const onStart = vi.fn();
    render(
      createElement(ReviewSetup, {
        counts: { white: { chapters: 0, repertoires: 1 }, black: { chapters: 0, repertoires: 0 } },
        onStart,
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: /Blancs/ }));
    expect(onStart).toHaveBeenCalledWith("white");
  });

  it("guide l'utilisateur quand rien n'est à réviser, en citant les deux façons d'alimenter la révision", () => {
    render(
      createElement(ReviewSetup, {
        counts: { white: { chapters: 0, repertoires: 0 }, black: { chapters: 0, repertoires: 0 } },
        onStart: () => {},
      }),
    );
    expect(screen.getByText(/Ajouter à mes révisions/)).toBeTruthy();
    expect(screen.getByText(/créez un répertoire/)).toBeTruthy();
  });
});

describe("interrupteur « en révision » d'un répertoire", () => {
  function listWith(sans: string[] = ["e4"]) {
    const created = createRepertoire({ name: "Ma Sicilienne", side: "white" });
    if (!created.ok) throw new Error("création impossible");
    updateRepertoireTree(
      created.value,
      sans.length > 0 ? [{ id: "a", san: sans[0], children: [] }] : [],
    );
    render(createElement(RepertoireListPanel, { onOpen: () => {} }));
    return created.value;
  }

  it("est activé par défaut et se désactive puis se réactive", () => {
    const id = listWith();
    const toggle = screen.getByRole("switch", { name: /Ma Sicilienne/ });

    expect(toggle.getAttribute("aria-checked")).toBe("true");
    expect(screen.getByText("Proposé en révision")).toBeTruthy();

    fireEvent.click(toggle);
    expect(getSnapshot().repertoires[id].reviewEnabled).toBe(false);
    expect(screen.getByText("Exclu de la révision")).toBeTruthy();
    expect(screen.getByRole("switch", { name: /Ma Sicilienne/ }).getAttribute("aria-checked")).toBe("false");

    fireEvent.click(screen.getByRole("switch", { name: /Ma Sicilienne/ }));
    expect(getSnapshot().repertoires[id].reviewEnabled).toBe(true);
  });

  it("prévient qu'un répertoire sans coup n'est pas encore proposé", () => {
    listWith([]);
    expect(screen.getByText(/Sans coups, ce répertoire n'est pas encore proposé/)).toBeTruthy();
  });

  it("ne dit rien de tel pour un répertoire qui a des coups", () => {
    listWith(["e4"]);
    expect(screen.queryByText(/Sans coups/)).toBeNull();
  });
});
