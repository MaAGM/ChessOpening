import { describe, expect, it } from "vitest";

import { buildLessonTree } from "@/lib/data/openings/lessonTree";
import { computeCoverage, findRewindPath, hasUnexploredBelow, pathKey, requiredLeafPaths } from "./coverage";

// Blancs : 1.e4 puis trois réponses noires, dont une qui se ramifie encore.
const root = buildLessonTree("1. e4 e5 (1... c5 2. Nf3 d6 (2... Nc6)) (1... e6 2. d4) 2. Nf3", "white");

const E5 = ["e4", "e5", "Nf3"];
const C5_D6 = ["e4", "c5", "Nf3", "d6"];
const C5_NC6 = ["e4", "c5", "Nf3", "Nc6"];
const E6 = ["e4", "e6", "d4"];

describe("requiredLeafPaths", () => {
  it("allBranches : toutes les fins de variante", () => {
    expect(requiredLeafPaths(root, "allBranches")).toEqual([E5, C5_D6, C5_NC6, E6]);
  });

  it("mainline : la seule ligne principale", () => {
    expect(requiredLeafPaths(root, "mainline")).toEqual([E5]);
  });
});

describe("computeCoverage", () => {
  it("n'est complète qu'une fois toutes les branches obligatoires explorées", () => {
    const explored = new Set([pathKey(E5), pathKey(C5_D6)]);
    expect(computeCoverage(root, "allBranches", explored)).toEqual({ explored: 2, total: 4, complete: false });

    explored.add(pathKey(C5_NC6)).add(pathKey(E6));
    expect(computeCoverage(root, "allBranches", explored).complete).toBe(true);
  });

  it("mainline : la ligne principale suffit", () => {
    expect(computeCoverage(root, "mainline", new Set([pathKey(E5)])).complete).toBe(true);
    expect(computeCoverage(root, "mainline", new Set([pathKey(E6)])).complete).toBe(false);
  });

  it("ignore les chemins qui ne sont pas des fins de variante obligatoires", () => {
    expect(computeCoverage(root, "allBranches", new Set(["e4", "inconnu"])).explored).toBe(0);
  });
});

describe("findRewindPath", () => {
  it("revient à la bifurcation la plus proche qui a une variante non explorée", () => {
    // Après c5 … d6 : la sous-variante 2…Nc6 reste à voir, juste au-dessus.
    const explored = new Set([pathKey(E5), pathKey(C5_D6)]);
    expect(findRewindPath(root, "allBranches", explored, C5_D6)).toEqual(["e4", "c5", "Nf3"]);
  });

  it("remonte plus haut quand la bifurcation proche est épuisée", () => {
    const explored = new Set([pathKey(E5), pathKey(C5_D6), pathKey(C5_NC6)]);
    expect(findRewindPath(root, "allBranches", explored, C5_NC6)).toEqual(["e4"]);
  });

  it("renvoie null quand tout est exploré", () => {
    const explored = new Set([E5, C5_D6, C5_NC6, E6].map(pathKey));
    expect(findRewindPath(root, "allBranches", explored, E6)).toBeNull();
  });
});

describe("hasUnexploredBelow", () => {
  it("indique si une variante reste à voir sous un coup", () => {
    const explored = new Set([pathKey(E5)]);
    expect(hasUnexploredBelow(root, "allBranches", explored, ["e4", "e5"])).toBe(false);
    expect(hasUnexploredBelow(root, "allBranches", explored, ["e4", "c5"])).toBe(true);
  });
});
