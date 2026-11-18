import { describe, expect, it } from "vitest";
import type { Repertoire } from "@/lib/repertoire/types";
import { repertoireSourceId, type ReviewSource } from "@/lib/review/reviewRepertoire";
import { toAnnotatedSources } from "./reviewSources";

const repertoire = {
  id: "r1",
  name: "Ma Française",
  side: "black",
  children: [{ id: "a", san: "e4", symbol: "!", children: [] }],
} as unknown as Repertoire;

const sources: ReviewSource[] = [
  { id: "ch-1", name: "Chapitre", side: "black", root: { children: { e4: {} } } },
  { id: repertoireSourceId("r1"), name: "Ma Française", side: "black", root: { children: { e4: {} } } },
];

describe("toAnnotatedSources", () => {
  it("garde l'arbre d'origine d'un répertoire (symboles compris) et les chapitres en TutorialNode", () => {
    const result = toAnnotatedSources(sources, [repertoire]);
    expect(result).toEqual([
      { kind: "tutorial", id: "ch-1", name: "Chapitre", root: sources[0].root },
      { kind: "repertoire", id: "repertoire:r1", name: "Ma Française", root: repertoire },
    ]);
  });

  it("filtre sur les sources qui passent par la position", () => {
    expect(toAnnotatedSources(sources, [repertoire], ["ch-1"]).map((s) => s.id)).toEqual(["ch-1"]);
  });

  it("retombe sur l'arbre converti si le répertoire n'est plus dans le store", () => {
    expect(toAnnotatedSources(sources, [])[1]).toMatchObject({ kind: "tutorial", id: "repertoire:r1" });
  });
});
