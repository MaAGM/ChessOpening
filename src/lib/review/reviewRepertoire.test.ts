import { describe, expect, it } from "vitest";
import {
  buildReviewTreeForSide,
  countReviewChaptersBySide,
  getReviewChapters,
} from "./reviewRepertoire";
import { getExpectedMoves, getNodeAtPath } from "./reviewTree";

describe("reviewRepertoire (données réelles d'eco-blueprints.json)", () => {
  it("fusionne les chapitres sauvegardés d'une couleur", () => {
    const tree = buildReviewTreeForSide("black", ["french-c02", "french-c15"]);
    expect(tree).not.toBeNull();

    const fork = getNodeAtPath(tree!, ["e4", "e6", "d4", "d5"]);
    expect(fork).not.toBeNull();
    expect(getExpectedMoves(fork!).sort()).toEqual(["Nc3", "e5"]);
  });

  it("filtre par couleur : un chapitre Blancs n'entre pas dans l'arbre des Noirs", () => {
    const ids = ["french-c02", "english-a20"];
    expect(getReviewChapters("black", ids).map((c) => c.id)).toEqual(["french-c02"]);
    expect(getReviewChapters("white", ids).map((c) => c.id)).toEqual(["english-a20"]);
  });

  it("ignore les IDs obsolètes et renvoie null si rien ne reste", () => {
    expect(buildReviewTreeForSide("white", ["chapitre-supprime"])).toBeNull();
    expect(buildReviewTreeForSide("white", [])).toBeNull();
  });

  it("compte les chapitres par couleur", () => {
    expect(countReviewChaptersBySide(["french-c02", "english-a20", "nope"])).toEqual({
      white: 1,
      black: 1,
    });
  });
});