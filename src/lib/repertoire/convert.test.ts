import { describe, expect, it } from "vitest";
import { openingCourses } from "@/lib/data/openings";
import type { TutorialNode } from "@/lib/data/openings/types";
import { buildReviewGraph, getExpectedMoves, getNode } from "@/lib/review/reviewGraph";
import { fromTutorialRoot, repertoireFromChapter, toTutorialRoot } from "./convert";
import { INITIAL_FEN, countNodes, findInvalidNodeIds } from "./repertoireTree";
import type { TreeRoot } from "./types";

const sample: TreeRoot = {
  children: [
    {
      id: "a",
      san: "e4",
      comment: "Coup roi",
      arrows: [["e2", "e4"]],
      children: [
        { id: "b", san: "e5", children: [{ id: "c", san: "Nf3", children: [] }] },
        { id: "d", san: "c5", symbol: "!?", children: [] },
      ],
    },
  ],
};

const countTutorial = (node: TutorialNode): number =>
  Object.values(node.children ?? {}).reduce((n, child) => n + 1 + countTutorial(child), 0);

describe("toTutorialRoot / fromTutorialRoot", () => {
  it("conserve tous les coups, dans l'ordre, avec commentaires et flèches", () => {
    const tutorial = toTutorialRoot(sample);
    expect(Object.keys(tutorial.children!)).toEqual(["e4"]);
    expect(Object.keys(tutorial.children!.e4.children!)).toEqual(["e5", "c5"]);
    expect(tutorial.children!.e4.explanation).toBe("Coup roi");
    expect(tutorial.children!.e4.arrows).toEqual([["e2", "e4"]]);
    expect(countTutorial(tutorial)).toBe(countNodes(sample));
  });

  it("fait l'aller-retour sans perdre la structure (les symboles ne sont pas portés par le format Masterclass)", () => {
    const back = fromTutorialRoot(toTutorialRoot(sample));
    expect(countNodes(back)).toBe(countNodes(sample));
    expect(back.children[0].san).toBe("e4");
    expect(back.children[0].comment).toBe("Coup roi");
    expect(back.children[0].arrows).toEqual([["e2", "e4"]]);
    expect(back.children[0].children.map((n) => n.san)).toEqual(["e5", "c5"]);
  });

  it("génère des identifiants uniques", () => {
    const back = fromTutorialRoot(toTutorialRoot(sample));
    const ids = new Set<string>();
    const visit = (nodes: TreeRoot["children"]) =>
      nodes.forEach((n) => {
        ids.add(n.id);
        visit(n.children);
      });
    visit(back.children);
    expect(ids.size).toBe(countNodes(back));
  });
});

describe("un répertoire alimente le moteur de révision", () => {
  it("donne au graphe les mêmes coups attendus que l'arbre", () => {
    const graph = buildReviewGraph([{ id: "rep-1", root: toTutorialRoot(sample) }]);

    const start = getNode(graph, INITIAL_FEN)!;
    expect(getExpectedMoves(start)).toEqual(["e4"]);
    expect(start.chapterIds).toEqual(["rep-1"]);

    // Après 1.e4 : deux réponses, la ligne principale et la variante
    const afterE4 = graph.nodes.get(start.edges.e4)!;
    expect(getExpectedMoves(afterE4)).toEqual(["e5", "c5"]);
  });
});

describe("repertoireFromChapter (données réelles)", () => {
  it("convertit un chapitre Masterclass en brouillon de répertoire valide", () => {
    const course = openingCourses[0];
    const chapter = course.chapters[0];
    const draft = repertoireFromChapter(chapter, { name: course.name, side: course.side });

    expect(draft.name).toBe(chapter.name);
    expect(draft.side).toBe(chapter.side ?? course.side);
    expect(draft.category).toBe(course.name);
    expect(draft.reviewEnabled).toBe(true);
    expect(draft.origin).toEqual({ kind: "custom" });
    expect(countNodes(draft)).toBeGreaterThan(0);
    expect(findInvalidNodeIds(draft)).toEqual([]); // tous les coups sont légaux
  });

  it("convertit sans erreur tous les chapitres du catalogue", () => {
    for (const course of openingCourses) {
      for (const chapter of course.chapters) {
        const draft = repertoireFromChapter(chapter, { name: course.name, side: course.side });
        expect(findInvalidNodeIds(draft), chapter.id).toEqual([]);
      }
    }
  });
});
