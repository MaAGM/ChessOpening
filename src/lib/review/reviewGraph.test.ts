import { describe, expect, it } from "vitest";
import { Chess } from "chess.js";
import { buildTreeFromMoves } from "@/lib/utils/openingParser";
import { toPositionKey } from "./positionKey";
import {
  buildReviewGraph,
  evaluatePlayerMove,
  getExpectedMoves,
  getHintArrows,
  getNode,
  isLeafNode,
} from "./reviewGraph";

const chapter = (id: string, line: string) => ({
  id,
  root: buildTreeFromMoves([line], [], false),
});

const fenAfter = (...sans: string[]) => {
  const game = new Chess();
  sans.forEach((san) => game.move(san));
  return game.fen();
};

describe("buildReviewGraph", () => {
  it("fusionne les nœuds de deux chapitres qui se transposent", () => {
    const graph = buildReviewGraph([
      chapter("a", "1. e4 e6 2. d4 d5 3. e5"),
      chapter("b", "1. d4 e6 2. e4 d5 3. e5"),
    ]);

    // Même position après 1.e4 e6 2.d4 d5 et 1.d4 e6 2.e4 d5
    const shared = getNode(graph, fenAfter("e4", "e6", "d4", "d5"));
    expect(shared).not.toBeNull();
    expect(shared!.chapterIds).toEqual(["a", "b"]);
    expect(getExpectedMoves(shared!)).toEqual(["e5"]);

    // Le départ propose les deux premiers coups
    expect(getExpectedMoves(getNode(graph, new Chess().fen())!)).toEqual(["e4", "d4"]);
  });

  it("marque la fin des lignes comme feuilles", () => {
    const graph = buildReviewGraph([chapter("a", "1. e4 e5")]);
    expect(isLeafNode(getNode(graph, fenAfter("e4", "e5"))!)).toBe(true);
    expect(isLeafNode(getNode(graph, fenAfter("e4"))!)).toBe(false);
  });

  it("ne traite pas comme une feuille la fin d'un chapitre prolongé par un autre", () => {
    const graph = buildReviewGraph([
      chapter("short", "1. e4 e5"),
      chapter("long", "1. e4 e5 2. Nf3 Nc6"),
    ]);
    const node = getNode(graph, fenAfter("e4", "e5"))!;
    expect(isLeafNode(node)).toBe(false);
    expect(getExpectedMoves(node)).toEqual(["Nf3"]);
  });

  it("renvoie null pour une position hors répertoire", () => {
    const graph = buildReviewGraph([chapter("a", "1. e4 e5")]);
    expect(getNode(graph, fenAfter("d4"))).toBeNull();
  });

  it("construit un graphe vide pour une liste vide", () => {
    const graph = buildReviewGraph([]);
    expect(graph.nodes.size).toBe(0);
  });
});

describe("evaluatePlayerMove", () => {
  // Répertoire des Blancs : le Londres, atteint par deux ordres de coups.
  const graph = buildReviewGraph([
    chapter("bf4-first", "1. d4 d5 2. Bf4 Nf6 3. e3 c6"),
    chapter("nf3-first", "1. d4 d5 2. Nf3 Nf6 3. Bf4 e6"),
  ]);
  const fen = fenAfter("d4", "d5", "Bf4", "Nf6");

  it("reconnaît un coup du répertoire", () => {
    const result = evaluatePlayerMove(graph, fen, "e2", "e3");
    expect(result.kind).toBe("book");
  });

  it("reconnaît une transposition vers une position connue", () => {
    const result = evaluatePlayerMove(graph, fen, "g1", "f3");
    expect(result.kind).toBe("transposition");
    if (result.kind !== "transposition") return;

    // La position d'arrivée est celle du second chapitre, avec sa suite (…e6)
    expect(result.nextKey).toBe(toPositionKey(fenAfter("d4", "d5", "Nf3", "Nf6", "Bf4")));
    expect(getExpectedMoves(graph.nodes.get(result.nextKey)!)).toEqual(["e6"]);
  });

  it("refuse un coup légal qui mène hors du répertoire", () => {
    expect(evaluatePlayerMove(graph, fen, "h2", "h4").kind).toBe("mistake");
  });

  it("signale un coup illégal", () => {
    expect(evaluatePlayerMove(graph, fen, "e2", "e5").kind).toBe("illegal");
  });
});

describe("getHintArrows", () => {
  it("convertit les coups attendus en flèches [from, to]", () => {
    const graph = buildReviewGraph([chapter("a", "1. e4 e5"), chapter("b", "1. d4 d5")]);
    const start = getNode(graph, new Chess().fen())!;
    expect(getHintArrows(new Chess().fen(), start)).toEqual([
      ["e2", "e4"],
      ["d2", "d4"],
    ]);
  });

  it("ignore un coup illégal dans la position donnée", () => {
    const graph = buildReviewGraph([chapter("a", "1. e4 e5")]);
    const start = getNode(graph, new Chess().fen())!;
    expect(getHintArrows(fenAfter("e4"), start)).toEqual([]);
  });
});
