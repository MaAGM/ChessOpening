import { describe, expect, it } from "vitest";
import { openingCourses } from "@/lib/data/openings";
import {
  buildReviewGraphForSide,
  countReviewChaptersBySide,
  getReviewChapters,
} from "./reviewRepertoire";
import { getExpectedMoves } from "./reviewGraph";

// Les IDs sont lus dans les données réelles : les tests ne dépendent d'aucun ID précis.
const chapterIdsOf = (side: "white" | "black") =>
  openingCourses.filter((course) => course.side === side).flatMap((c) => c.chapters.map((ch) => ch.id));

const oneWhite = chapterIdsOf("white")[0];
const oneBlack = chapterIdsOf("black")[0];

describe("reviewRepertoire (données réelles)", () => {
  it("construit le graphe de tous les chapitres d'une couleur", () => {
    const graph = buildReviewGraphForSide("black", chapterIdsOf("black"));
    expect(graph).not.toBeNull();

    const start = graph!.nodes.get(graph!.startKey)!;
    // Les cours Noirs répondent à 1.e4 et à 1.d4
    expect(getExpectedMoves(start)).toEqual(expect.arrayContaining(["e4", "d4"]));
  });

  it("fusionne par position : moins de nœuds que de positions cumulées par les chapitres", () => {
    const ids = chapterIdsOf("black");
    const graph = buildReviewGraphForSide("black", ids)!;
    const edges = [...graph.nodes.values()].reduce((n, node) => n + Object.keys(node.edges).length, 0);
    // Un graphe de positions partage les préfixes communs : il reste bien plus petit
    // que la somme des coups de tous les chapitres.
    expect(graph.nodes.size).toBeGreaterThan(ids.length);
    expect(edges).toBeLessThan(ids.length * 14);
  });

  it("filtre par couleur : un chapitre Blancs n'entre pas dans le répertoire des Noirs", () => {
    const ids = [oneWhite, oneBlack];
    expect(getReviewChapters("black", ids).map((c) => c.id)).toEqual([oneBlack]);
    expect(getReviewChapters("white", ids).map((c) => c.id)).toEqual([oneWhite]);
  });

  it("ignore les IDs obsolètes et renvoie null si rien ne reste", () => {
    expect(buildReviewGraphForSide("white", ["chapitre-supprime"])).toBeNull();
    expect(buildReviewGraphForSide("white", [])).toBeNull();
  });

  it("compte les chapitres par couleur", () => {
    expect(countReviewChaptersBySide([oneWhite, oneBlack, "nope"])).toEqual({ white: 1, black: 1 });
  });
});