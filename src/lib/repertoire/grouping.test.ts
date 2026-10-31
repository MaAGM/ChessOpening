import { describe, expect, it } from "vitest";
import {
  UNCATEGORIZED_LABEL,
  filterBySide,
  formatMoveCount,
  groupByCategory,
  listCategories,
} from "./grouping";
import type { Repertoire } from "./types";

let counter = 0;
const rep = (name: string, side: "white" | "black", category: string | null): Repertoire => ({
  id: `r${++counter}`,
  name,
  side,
  category,
  reviewEnabled: true,
  children: [],
  origin: { kind: "custom" },
  createdAt: 0,
  updatedAt: 0,
});

describe("filterBySide", () => {
  const all = [rep("A", "white", null), rep("B", "black", null), rep("C", "white", null)];

  it("garde tout, ou uniquement une couleur", () => {
    expect(filterBySide(all, "all")).toHaveLength(3);
    expect(filterBySide(all, "white").map((r) => r.name)).toEqual(["A", "C"]);
    expect(filterBySide(all, "black").map((r) => r.name)).toEqual(["B"]);
  });
});

describe("groupByCategory", () => {
  it("trie les catégories par ordre alphabétique et place « sans catégorie » en dernier", () => {
    const groups = groupByCategory([
      rep("1", "white", null),
      rep("2", "white", "Sicilienne"),
      rep("3", "black", "Caro-Kann"),
      rep("4", "white", "Écossaise"),
    ]);
    expect(groups.map((g) => g.label)).toEqual([
      "Caro-Kann",
      "Écossaise",
      "Sicilienne",
      UNCATEGORIZED_LABEL,
    ]);
  });

  it("fusionne les catégories qui ne diffèrent que par la casse", () => {
    const groups = groupByCategory([
      rep("1", "white", "Sicilienne"),
      rep("2", "black", "sicilienne"),
      rep("3", "white", "SICILIENNE"),
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0].label).toBe("Sicilienne"); // première graphie rencontrée
    expect(groups[0].items).toHaveLength(3);
  });

  it("conserve l'ordre d'origine à l'intérieur d'un groupe", () => {
    const groups = groupByCategory([
      rep("Z", "white", "Gambits"),
      rep("A", "white", "Gambits"),
      rep("M", "white", "Gambits"),
    ]);
    expect(groups[0].items.map((r) => r.name)).toEqual(["Z", "A", "M"]);
  });

  it("renvoie une liste vide sans répertoire", () => {
    expect(groupByCategory([])).toEqual([]);
  });
});

describe("listCategories", () => {
  it("liste les catégories existantes sans doublon ni « sans catégorie »", () => {
    expect(
      listCategories([
        rep("1", "white", "B"),
        rep("2", "white", "a"),
        rep("3", "white", null),
        rep("4", "white", "A"),
      ]),
    ).toEqual(["a", "B"]);
  });
});

describe("formatMoveCount", () => {
  it("accorde au singulier et au pluriel", () => {
    expect(formatMoveCount(0)).toBe("0 coup");
    expect(formatMoveCount(1)).toBe("1 coup");
    expect(formatMoveCount(12)).toBe("12 coups");
  });
});
