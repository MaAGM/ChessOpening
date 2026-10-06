import { describe, expect, it } from "vitest";
import { Chess } from "chess.js";
import { buildTreeFromMoves } from "@/lib/utils/openingParser";
import {
  buildReviewTree,
  getExpectedMoves,
  getHintArrows,
  getNodeAtPath,
  isLeaf,
  mergeTrees,
  pickRandomChild,
  toReviewNode,
} from "./reviewTree";

const chapter = (id: string, line: string, isBlack = false) => ({
  id,
  root: buildTreeFromMoves([line], [], isBlack),
});

describe("mergeTrees / buildReviewTree", () => {
  it("fusionne deux chapitres qui partagent un préfixe (Française Avance + Winawer)", () => {
    const tree = buildReviewTree([
      chapter("advance", "1. e4 e6 2. d4 d5 3. e5 c5", true),
      chapter("winawer", "1. e4 e6 2. d4 d5 3. Nc3 Bb4", true),
    ]);

    const fork = getNodeAtPath(tree, ["e4", "e6", "d4", "d5"]);
    expect(fork).not.toBeNull();
    expect(getExpectedMoves(fork!)).toEqual(["e5", "Nc3"]);
    expect(fork!.chapterIds).toEqual(["advance", "winawer"]);

    expect(getNodeAtPath(tree, ["e4", "e6", "d4", "d5", "e5"])!.chapterIds).toEqual(["advance"]);
    expect(getNodeAtPath(tree, ["e4", "e6", "d4", "d5", "Nc3"])!.chapterIds).toEqual(["winawer"]);
  });

  it("garde plusieurs coups du joueur au même nœud (Caro-Kann + Française côté Noirs)", () => {
    const tree = buildReviewTree([
      chapter("caro", "1. e4 c6 2. d4 d5", true),
      chapter("french", "1. e4 e6 2. d4 d5", true),
    ]);

    expect(getExpectedMoves(getNodeAtPath(tree, ["e4"])!)).toEqual(["c6", "e6"]);
  });

  it("ne traite pas comme une feuille la fin d'un chapitre prolongé par un autre", () => {
    const tree = buildReviewTree([
      chapter("short", "1. e4 e5"),
      chapter("long", "1. e4 e5 2. Nf3 Nc6"),
    ]);

    const node = getNodeAtPath(tree, ["e4", "e5"])!;
    expect(isLeaf(node)).toBe(false);
    expect(getExpectedMoves(node)).toEqual(["Nf3"]);
    expect(isLeaf(getNodeAtPath(tree, ["e4", "e5", "Nf3", "Nc6"])!)).toBe(true);
  });

  it("ne mute pas ses entrées", () => {
    const a = toReviewNode(chapter("a", "1. e4 e5 2. Nf3").root, "a");
    const b = toReviewNode(chapter("b", "1. e4 e5 2. Bc4").root, "b");
    const before = JSON.stringify([a, b]);

    mergeTrees(a, b);

    expect(JSON.stringify([a, b])).toBe(before);
  });

  it("renvoie une racine vide pour une liste vide", () => {
    const tree = buildReviewTree([]);
    expect(isLeaf(tree)).toBe(true);
    expect(tree.chapterIds).toEqual([]);
  });
});

describe("getNodeAtPath", () => {
  it("renvoie null pour un chemin inexistant", () => {
    const tree = buildReviewTree([chapter("a", "1. e4 e5")]);
    expect(getNodeAtPath(tree, ["d4"])).toBeNull();
    expect(getNodeAtPath(tree, ["e4", "c5"])).toBeNull();
  });
});

describe("pickRandomChild", () => {
  const tree = buildReviewTree([
    chapter("advance", "1. e4 e6 2. d4 d5 3. e5", true),
    chapter("winawer", "1. e4 e6 2. d4 d5 3. Nc3", true),
  ]);
  const fork = getNodeAtPath(tree, ["e4", "e6", "d4", "d5"])!;

  it("est déterministe avec un rng injecté", () => {
    expect(pickRandomChild(fork, () => 0)!.san).toBe("e5");
    expect(pickRandomChild(fork, () => 0.999)!.san).toBe("Nc3");
  });

  it("renvoie null sur une feuille", () => {
    const leaf = getNodeAtPath(tree, ["e4", "e6", "d4", "d5", "e5"])!;
    expect(pickRandomChild(leaf)).toBeNull();
  });
});

describe("getHintArrows", () => {
  it("convertit les coups attendus en flèches [from, to]", () => {
    const tree = buildReviewTree([chapter("a", "1. e4 e5"), chapter("b", "1. d4 d5")]);
    expect(getHintArrows(new Chess().fen(), tree)).toEqual([
      ["e2", "e4"],
      ["d2", "d4"],
    ]);
  });

  it("ignore un coup illégal dans la position donnée", () => {
    const tree = buildReviewTree([chapter("a", "1. e4 e5")]);
    const afterE4 = new Chess();
    afterE4.move("e4");
    // Dans la position après 1.e4, "e4" n'est plus jouable : aucune flèche.
    expect(getHintArrows(afterE4.fen(), tree)).toEqual([]);
  });
});