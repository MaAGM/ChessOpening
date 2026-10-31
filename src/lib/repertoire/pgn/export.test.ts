import { describe, expect, it } from "vitest";
import { openingCourses } from "@/lib/data/openings";
import { repertoireFromChapter } from "../convert";
import { exportPgn } from "./export";
import { importPgn } from "./import";
import { parsePgn } from "./parse";
import type { RepertoireNode, TreeRoot } from "../types";

const DATE = new Date(2026, 9, 26); // 26 octobre 2026

const node = (
  san: string,
  children: RepertoireNode[] = [],
  extra: Partial<RepertoireNode> = {},
): RepertoireNode => ({ id: `id-${san}-${Math.random().toString(36).slice(2, 6)}`, san, children, ...extra });

/** Structure comparable (sans les identifiants). */
type Plain = { san: string; symbol?: string; comment?: string; arrows?: unknown; children: Plain[] };
const plain = (nodes: RepertoireNode[]): Plain[] =>
  nodes.map((n) => ({
    san: n.san,
    ...(n.symbol ? { symbol: n.symbol } : {}),
    ...(n.comment ? { comment: n.comment } : {}),
    ...(n.arrows ? { arrows: n.arrows } : {}),
    children: plain(n.children),
  }));

function roundTrip(children: RepertoireNode[]): RepertoireNode[] {
  const pgn = exportPgn({ name: "Test", side: "white", children }, { date: DATE });
  const result = importPgn(pgn);
  if (!result.ok) throw new Error(`réimport refusé : ${result.error}`);
  expect(result.report.issueCount).toBe(0);
  return result.children;
}

describe("exportPgn : format", () => {
  it("écrit les en-têtes, les coups numérotés et le résultat", () => {
    const pgn = exportPgn(
      { name: "Mon 1.e4", side: "black", children: [node("e4", [node("e5", [node("Nf3")])])] },
      { date: DATE },
    );
    expect(pgn).toBe(
      [
        '[Event "Mon 1.e4"]',
        '[Site "ChessmateTheory"]',
        '[Date "2026.10.26"]',
        '[Round "-"]',
        '[White "?"]',
        '[Black "?"]',
        '[Result "*"]',
        '[Annotator "ChessmateTheory"]',
        '[Orientation "black"]',
        "",
        "1. e4 e5 2. Nf3 *",
        "",
      ].join("\n"),
    );
  });

  it("écrit les variantes entre parenthèses et renumérote le coup noir qui suit", () => {
    const pgn = exportPgn(
      {
        name: "T",
        side: "white",
        children: [node("e4", [node("e5", [node("Nf3")]), node("c5", [node("Nf3")])])],
      },
      { date: DATE },
    );
    expect(pgn).toContain("1. e4 e5 ( 1... c5 2. Nf3 ) 2. Nf3 *");
  });

  it("écrit les symboles en NAG, les commentaires entre accolades et les flèches en commandes Lichess", () => {
    const pgn = exportPgn(
      {
        name: "T",
        side: "white",
        children: [
          node("e4", [node("e5")], {
            symbol: "!?",
            comment: "Coup roi",
            arrows: [["e2", "e4"], ["g1", "f3"]],
          }),
        ],
      },
      { date: DATE },
    );
    expect(pgn).toContain("1. e4 $5 {[%cal Ge2e4,Gg1f3] Coup roi} 1... e5 *");
  });

  it("protège les caractères qui casseraient le format", () => {
    const pgn = exportPgn(
      { name: 'Le "grand" \\ test', side: "white", children: [node("e4", [], { comment: "a } b [%clk 1] c" })] },
      { date: DATE },
    );
    expect(pgn).toContain('[Event "Le \\"grand\\" \\\\ test"]');
    expect(pgn).toContain("{a ) b [ %clk 1] c}");
  });

  it("revient à la ligne avant 80 colonnes sans couper un mot", () => {
    let chain: RepertoireNode[] = [];
    for (const san of ["Nf3", "Nf6", "Ng1", "Ng8"].concat(["Nf3", "Nf6", "Ng1", "Ng8"], ["Nf3", "Nf6", "Ng1", "Ng8"])
      .concat(["Nf3", "Nf6", "Ng1", "Ng8"], ["Nf3", "Nf6", "Ng1", "Ng8"], ["Nf3", "Nf6", "Ng1", "Ng8"])
      .reverse()) {
      chain = [node(san, chain)];
    }
    const movetext = exportPgn({ name: "T", side: "white", children: chain }, { date: DATE }).split("\n\n")[1];
    for (const line of movetext.trim().split("\n")) expect(line.length).toBeLessThanOrEqual(80);
    expect(movetext.trim().split("\n").length).toBeGreaterThan(1);
  });

  it("conserve les paragraphes d'un commentaire à l'identique", () => {
    const comment = "Premier paragraphe : le plan principal.\n\nSecond paragraphe.\n- idée A\n- idée B";
    const pgn = exportPgn({ name: "T", side: "white", children: [node("e4", [], { comment })] }, { date: DATE });

    expect(pgn).toContain("{Premier paragraphe : le plan principal.\n\nSecond paragraphe.\n- idée A\n- idée B}");
    expect(parsePgn(pgn)[0].children[0].comment).toBe(comment);
  });

  it("ne coupe jamais un commentaire, même plus long qu'une ligne", () => {
    const comment = "mot ".repeat(60).trim(); // 239 caractères sur une seule ligne
    const pgn = exportPgn({ name: "T", side: "white", children: [node("e4", [], { comment })] }, { date: DATE });
    expect(pgn).toContain(`{${comment}}`);
    expect(parsePgn(pgn)[0].children[0].comment).toBe(comment);
  });

  it("revient à la ligne entre les coups qui suivent un commentaire multiligne", () => {
    let chain: RepertoireNode[] = [];
    const sans = ["Nf3", "Nf6", "Ng1", "Ng8", "Nf3", "Nf6", "Ng1", "Ng8", "Nf3", "Nf6", "Ng1", "Ng8", "Nf3", "Nf6"];
    for (const san of [...sans].reverse()) chain = [node(san, chain, san === "Nf3" && chain.length === 0 ? { comment: "a\nb" } : {})];
    const movetext = exportPgn({ name: "T", side: "white", children: chain }, { date: DATE }).split("\n\n")[1];
    for (const line of movetext.split("\n")) expect(line.length).toBeLessThanOrEqual(80);
  });

  it("exporte un répertoire vide", () => {
    const pgn = exportPgn({ name: "Vide", side: "white", children: [] }, { date: DATE });
    expect(pgn.endsWith("\n\n*\n")).toBe(true);
  });

  it("écrit le commentaire du répertoire avant le premier coup", () => {
    const pgn = exportPgn({ name: "T", side: "white", comment: "Mon plan", children: [node("e4")] }, { date: DATE });
    expect(pgn).toContain("{Mon plan} 1. e4 *");
    expect(parsePgn(pgn)[0].comment).toBe("Mon plan");
  });
});

describe("export puis import : aller-retour", () => {
  it("restitue exactement l'arbre, ses variantes, annotations et flèches", () => {
    const tree: RepertoireNode[] = [
      node(
        "e4",
        [
          node("e5", [node("Nf3", [node("Nc6", [node("Bb5", [node("a6")], { symbol: "!" })]), node("Nf6")])], {
            comment: "Réponse symétrique",
          }),
          node("c5", [node("Nf3", [node("d6"), node("Nc6")]), node("c3")], { symbol: "?!", arrows: [["c7", "c5"]] }),
          node("e6"),
        ],
        { comment: "Coup roi", arrows: [["e2", "e4"]] },
      ),
      node("d4", [node("d5", [node("c4")])]),
    ];
    expect(plain(roundTrip(tree))).toEqual(plain(tree));
  });

  it("conserve les six symboles", () => {
    const tree = [
      node("e4", [node("e5", [node("Nf3", [node("Nc6", [node("Bb5", [node("a6", [node("Ba4")], { symbol: "?!" })], { symbol: "??" })], { symbol: "!?" })], { symbol: "!!" })], { symbol: "?" })], { symbol: "!" }),
    ];
    expect(plain(roundTrip(tree))).toEqual(plain(tree));
  });

  it("conserve un commentaire sur un coup noir suivi d'un coup blanc", () => {
    const tree = [node("e4", [node("e5", [node("Nf3")], { comment: "Après e5" })])];
    expect(plain(roundTrip(tree))).toEqual(plain(tree));
  });

  it("restitue les 105 chapitres du catalogue Masterclass à l'identique", () => {
    let chapters = 0;
    for (const course of openingCourses) {
      for (const chapter of course.chapters) {
        const draft = repertoireFromChapter(chapter, { name: course.name, side: course.side });
        const tree: TreeRoot = { children: draft.children };
        expect(plain(roundTrip(tree.children)), chapter.id).toEqual(plain(tree.children));
        chapters += 1;
      }
    }
    expect(chapters).toBeGreaterThan(0);
  });

  it("réimporte une suite de chapitres exportés comme un seul arbre fusionné", () => {
    const first = exportPgn({ name: "A", side: "white", children: [node("e4", [node("e5")])] }, { date: DATE });
    const second = exportPgn({ name: "B", side: "white", children: [node("e4", [node("c5")])] }, { date: DATE });
    const result = importPgn(`${first}\n${second}`);
    if (!result.ok) throw new Error("import refusé");
    expect(plain(result.children)).toEqual(plain([node("e4", [node("e5"), node("c5")])]));
    expect(result.report.gamesImported).toBe(2);
  });
});
