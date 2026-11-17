import { describe, expect, it } from "vitest";
import { Chess } from "chess.js";
import type { TutorialNode } from "@/lib/data/openings/types";
import type { RepertoireNode } from "@/lib/repertoire/types";
import { collectBookAnnotations, type AnnotatedSource } from "./bookMoves";

let nextId = 0;
const n = (
  san: string,
  children: RepertoireNode[] = [],
  extra: Partial<Omit<RepertoireNode, "san" | "children">> = {},
): RepertoireNode => ({ id: `n${nextId++}`, san, children, ...extra });

const fenAfter = (...sans: string[]) => {
  const game = new Chess();
  sans.forEach((san) => game.move(san));
  return game.fen();
};

// 1.e4 e5 2.Nf3 Nc6 3.Bb5 (a6 4.Ba4! Nf6 5.O-O) (Nf6 4.O-O)
const spanish: AnnotatedSource = {
  kind: "repertoire",
  id: "rep-1",
  name: "Espagnole",
  root: {
    children: [
      n("e4", [
        n("e5", [
          n("Nf3", [
            n("Nc6", [
              n(
                "Bb5",
                [
                  n(
                    "a6",
                    [
                      n("Ba4", [n("Nf6", [n("O-O")])], {
                        symbol: "!",
                        comment: "On garde la pression sur c6.",
                        arrows: [["a4", "e8"]],
                      }),
                      n("Bxc6", [], { comment: "Variante d'échange." }),
                    ],
                    { comment: "Les Noirs questionnent le fou." },
                  ),
                ],
                { comment: "La Partie espagnole." },
              ),
            ]),
          ]),
        ]),
      ]),
    ],
  },
};

describe("collectBookAnnotations", () => {
  it("renvoie les coups attendus avec symbole, commentaire, flèches et suite principale", () => {
    const { bookMoves, positionNotes } = collectBookAnnotations(
      [spanish],
      fenAfter("e4", "e5", "Nf3", "Nc6", "Bb5", "a6"),
    );

    expect(bookMoves).toEqual([
      {
        san: "Ba4",
        sourceId: "rep-1",
        sourceName: "Espagnole",
        isMainLine: true,
        symbol: "!",
        comment: "On garde la pression sur c6.",
        arrows: [["a4", "e8"]],
        continuation: ["Nf6", "O-O"],
      },
      {
        san: "Bxc6",
        sourceId: "rep-1",
        sourceName: "Espagnole",
        isMainLine: false,
        comment: "Variante d'échange.",
        continuation: [],
      },
    ]);
    expect(positionNotes).toEqual([
      { sourceId: "rep-1", sourceName: "Espagnole", san: "a6", comment: "Les Noirs questionnent le fou." },
    ]);
  });

  it("renvoie des listes vides hors répertoire ou sans annotation", () => {
    expect(collectBookAnnotations([spanish], fenAfter("d4"))).toEqual({ bookMoves: [], positionNotes: [] });

    const { bookMoves, positionNotes } = collectBookAnnotations([spanish], fenAfter("e4"));
    expect(positionNotes).toEqual([]);
    expect(bookMoves).toHaveLength(1);
    expect(bookMoves[0]).not.toHaveProperty("comment");
    expect(bookMoves[0]).not.toHaveProperty("symbol");
  });

  it("limite la longueur de la suite principale", () => {
    const { bookMoves } = collectBookAnnotations([spanish], new Chess().fen(), { continuationPlies: 3 });
    expect(bookMoves[0].continuation).toEqual(["e5", "Nf3", "Nc6"]);
  });

  it("lit un chapitre Masterclass (explications → commentaires, premier coup = ligne principale)", () => {
    const tutorial: TutorialNode = {
      children: {
        e4: {
          move: "e4",
          explanation: "Le centre.",
          children: {
            c5: { move: "c5", children: { Nf3: { move: "Nf3", explanation: "Développement." } } },
            e6: { move: "e6" },
          },
        },
      },
    };
    const { bookMoves, positionNotes } = collectBookAnnotations(
      [{ kind: "tutorial", id: "sicilian", name: "Sicilienne", root: tutorial }],
      fenAfter("e4"),
    );

    expect(bookMoves.map((m) => [m.san, m.isMainLine, m.continuation])).toEqual([
      ["c5", true, ["Nf3"]],
      ["e6", false, []],
    ]);
    expect(positionNotes).toEqual([
      { sourceId: "sicilian", sourceName: "Sicilienne", san: "e4", comment: "Le centre." },
    ]);
  });

  it("trouve les coups atteints par transposition et fusionne les doublons d'une même source", () => {
    const source: AnnotatedSource = {
      kind: "repertoire",
      id: "fr",
      name: "Française",
      root: {
        children: [
          n("e4", [n("e6", [n("d4", [n("d5", [n("e5", [], { symbol: "!?" })])])])]),
          n("d4", [n("e6", [n("e4", [n("d5", [n("e5", [], { comment: "Avance." }), n("Nc3")])])])]),
        ],
      },
    };
    const { bookMoves } = collectBookAnnotations([source], fenAfter("e4", "e6", "d4", "d5"));

    expect(bookMoves).toEqual([
      {
        san: "e5",
        sourceId: "fr",
        sourceName: "Française",
        isMainLine: true,
        symbol: "!?",
        comment: "Avance.",
        continuation: [],
      },
      { san: "Nc3", sourceId: "fr", sourceName: "Française", isMainLine: false, continuation: [] },
    ]);
  });

  it("place les lignes principales en tête, toutes sources confondues", () => {
    const a: AnnotatedSource = { kind: "repertoire", id: "a", name: "A", root: { children: [n("d4"), n("e4")] } };
    const b: AnnotatedSource = { kind: "repertoire", id: "b", name: "B", root: { children: [n("c4")] } };
    const { bookMoves } = collectBookAnnotations([a, b], new Chess().fen());
    expect(bookMoves.map((m) => `${m.sourceId}:${m.san}`)).toEqual(["a:d4", "b:c4", "a:e4"]);
  });

  it("ignore les branches dont le coup est invalide", () => {
    const broken: AnnotatedSource = {
      kind: "repertoire",
      id: "x",
      name: "X",
      root: { children: [n("e4", [n("Ke3", [n("Nf3")]), n("e5")])] },
    };
    const { bookMoves } = collectBookAnnotations([broken], fenAfter("e4"));
    expect(bookMoves.map((m) => m.san)).toEqual(["e5"]);
  });
});
