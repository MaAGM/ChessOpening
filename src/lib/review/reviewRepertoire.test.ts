import { beforeAll, describe, expect, it } from "vitest";
import { Chess } from "chess.js";
import { courseEntries, getLoadedLesson, loadAllCourses } from "@/lib/data/openings";
import type { Repertoire, RepertoireNode } from "@/lib/repertoire/types";
import {
  buildReviewGraphForSide,
  countReviewChaptersBySide,
  countReviewSourcesBySide,
  getRepertoireSources,
  getReviewLessons,
  getReviewSources,
  repertoireSourceId,
} from "./reviewRepertoire";
import { getExpectedMoves } from "./reviewGraph";
import { toPositionKey } from "./positionKey";

// Les IDs sont lus dans les données réelles : les tests ne dépendent d'aucun ID précis.
const chapterIdsOf = (side: "white" | "black") =>
  courseEntries
    .filter((course) => course.side === side)
    .flatMap((c) => c.chapters.flatMap((ch) => ch.lessons.map((lesson) => lesson.id)));

// Les arbres des cours sont chargés à la demande : la révision ne lit que les ouvertures chargées.
beforeAll(async () => {
  await loadAllCourses();
});

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
    const countEdges = (g: NonNullable<ReturnType<typeof buildReviewGraphForSide>>) =>
      [...g.nodes.values()].reduce((n, node) => n + Object.keys(node.edges).length, 0);
    // Un graphe de positions partage les préfixes communs : il reste bien plus petit
    // que la somme des coups de tous les chapitres pris séparément.
    const separate = ids.reduce((n, id) => n + countEdges(buildReviewGraphForSide("black", [id])!), 0);
    expect(graph.nodes.size).toBeGreaterThan(ids.length);
    expect(countEdges(graph)).toBeLessThan(separate * 0.7);
  });

  it("filtre par couleur : un chapitre Blancs n'entre pas dans le répertoire des Noirs", () => {
    const ids = [oneWhite, oneBlack];
    expect(getReviewLessons("black", ids).map((c) => c.id)).toEqual([oneBlack]);
    expect(getReviewLessons("white", ids).map((c) => c.id)).toEqual([oneWhite]);
  });

  it("ignore les IDs obsolètes et renvoie null si rien ne reste", () => {
    expect(buildReviewGraphForSide("white", ["chapitre-supprime"])).toBeNull();
    expect(buildReviewGraphForSide("white", [])).toBeNull();
  });

  it("compte les chapitres par couleur", () => {
    expect(countReviewChaptersBySide([oneWhite, oneBlack, "nope"])).toEqual({ white: 1, black: 1 });
  });
});

// ---------------------------------------------------------------------------
// Répertoires de l'utilisateur comme sources de révision
// ---------------------------------------------------------------------------
let counter = 0;

/** « e4 e6 d4 » : une ligne de coups devenue chaîne de nœuds. */
const line = (...sans: string[]): RepertoireNode[] => {
  let children: RepertoireNode[] = [];
  for (const san of [...sans].reverse()) children = [{ id: `n${++counter}-${san}`, san, children }];
  return children;
};

const repertoire = (overrides: Partial<Repertoire> & Pick<Repertoire, "side">): Repertoire => ({
  id: `rep-${++counter}`,
  name: `Répertoire ${counter}`,
  category: null,
  reviewEnabled: true,
  children: line("e4", "e5"),
  origin: { kind: "custom" },
  createdAt: 0,
  updatedAt: 0,
  ...overrides,
});

const keyAfter = (...sans: string[]) => {
  const game = new Chess();
  sans.forEach((san) => game.move(san));
  return toPositionKey(game.fen());
};

describe("getRepertoireSources", () => {
  it("ne garde que les répertoires de la couleur, activés et non vides", () => {
    const white = repertoire({ side: "white" });
    const black = repertoire({ side: "black" });
    const disabled = repertoire({ side: "white", reviewEnabled: false });
    const empty = repertoire({ side: "white", children: [] });

    const sources = getRepertoireSources("white", [white, black, disabled, empty]);

    expect(sources.map((source) => source.id)).toEqual([repertoireSourceId(white.id)]);
  });

  it("préfixe l'identifiant pour ne jamais le confondre avec un chapitre, et garde le nom", () => {
    const white = repertoire({ side: "white", name: "Mon 1.e4" });
    const [source] = getRepertoireSources("white", [white]);

    expect(source.id).toBe(`repertoire:${white.id}`);
    expect(source.name).toBe("Mon 1.e4");
    expect(source.side).toBe("white");
    expect(Object.keys(source.root.children ?? {})).toEqual(["e4"]);
  });
});

describe("getReviewSources", () => {
  it("réunit les chapitres ajoutés et les répertoires, chapitres d'abord", () => {
    const black = repertoire({ side: "black" });
    const sources = getReviewSources("black", [oneBlack], [black]);
    expect(sources.map((source) => source.id)).toEqual([oneBlack, repertoireSourceId(black.id)]);
  });

  it("fonctionne sans répertoire (comportement d'avant)", () => {
    expect(getReviewSources("black", [oneBlack]).map((source) => source.id)).toEqual([oneBlack]);
  });
});

describe("buildReviewGraphForSide avec des répertoires", () => {
  it("construit un graphe à partir d'un seul répertoire", () => {
    const rep = repertoire({ side: "black", children: line("e4", "e6", "d4", "d5") });
    const graph = buildReviewGraphForSide("black", [], [rep])!;

    expect(graph).not.toBeNull();
    expect(getExpectedMoves(graph.nodes.get(graph.startKey)!)).toEqual(["e4"]);
    expect(graph.nodes.get(keyAfter("e4", "e6", "d4", "d5"))).toBeDefined();
  });

  it("renvoie null quand rien n'est à réviser pour la couleur", () => {
    const white = repertoire({ side: "white" });
    const disabled = repertoire({ side: "black", reviewEnabled: false });
    expect(buildReviewGraphForSide("black", [], [white, disabled])).toBeNull();
  });

  it("fusionne deux répertoires qui partagent un début de ligne", () => {
    const a = repertoire({ side: "white", children: line("e4", "e5", "Nf3") });
    const b = repertoire({ side: "white", children: line("e4", "c5", "Nf3") });
    const graph = buildReviewGraphForSide("white", [], [a, b])!;

    const afterE4 = graph.nodes.get(keyAfter("e4"))!;
    expect(getExpectedMoves(afterE4)).toEqual(["e5", "c5"]);
    expect(afterE4.chapterIds).toEqual([repertoireSourceId(a.id), repertoireSourceId(b.id)]);
  });

  it("reconnaît une transposition entre deux répertoires : même position, même nœud", () => {
    // 1.d4 Nf6 2.c4 e6 3.Nc3  et  1.c4 e6 2.Nc3 Nf6 3.d4 arrivent à la même position
    const a = repertoire({ side: "black", children: line("d4", "Nf6", "c4", "e6", "Nc3") });
    const b = repertoire({ side: "black", children: line("c4", "e6", "Nc3", "Nf6", "d4") });
    const graph = buildReviewGraphForSide("black", [], [a, b])!;

    const shared = graph.nodes.get(keyAfter("d4", "Nf6", "c4", "e6", "Nc3"))!;
    expect(shared.key).toBe(keyAfter("c4", "e6", "Nc3", "Nf6", "d4"));
    expect(shared.chapterIds).toEqual([repertoireSourceId(a.id), repertoireSourceId(b.id)]);
  });

  it("fusionne un répertoire avec un chapitre Masterclass de la même couleur", () => {
    const chapter = getLoadedLesson(chapterIdsOf("white")[0])!;
    const firstMove = Object.keys(chapter.root.children ?? {})[0];
    const rep = repertoire({ side: "white", children: line(firstMove) });

    const graph = buildReviewGraphForSide("white", [chapter.id], [rep])!;
    const afterFirst = graph.nodes.get(graph.nodes.get(graph.startKey)!.edges[firstMove])!;

    expect(afterFirst.chapterIds).toContain(chapter.id);
    expect(afterFirst.chapterIds).toContain(repertoireSourceId(rep.id));
  });
});

describe("countReviewSourcesBySide", () => {
  it("distingue chapitres et répertoires, par couleur", () => {
    const counts = countReviewSourcesBySide(
      [oneWhite, oneBlack, "inconnu"],
      [
        repertoire({ side: "white" }),
        repertoire({ side: "white" }),
        repertoire({ side: "black", reviewEnabled: false }),
        repertoire({ side: "black", children: [] }),
      ],
    );
    expect(counts).toEqual({
      white: { chapters: 1, repertoires: 2 },
      black: { chapters: 1, repertoires: 0 },
    });
  });

  it("ne compte que les chapitres quand il n'y a pas de répertoire", () => {
    expect(countReviewSourcesBySide([oneWhite])).toEqual({
      white: { chapters: 1, repertoires: 0 },
      black: { chapters: 0, repertoires: 0 },
    });
  });
});