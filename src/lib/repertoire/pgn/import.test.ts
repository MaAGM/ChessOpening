import { describe, expect, it } from "vitest";
import { importPgn } from "./import";
import { collectIds, countNodes, findInvalidNodeIds } from "../repertoireTree";
import type { RepertoireNode } from "../types";

function ok(text: string, options?: Parameters<typeof importPgn>[1]) {
  const result = importPgn(text, options);
  if (!result.ok) throw new Error(`import refusé : ${result.error}`);
  return result;
}

/** Nœud atteint en suivant un chemin de coups depuis la position initiale. */
function at(children: RepertoireNode[], path: string[]): RepertoireNode {
  let nodes = children;
  let node: RepertoireNode | undefined;
  for (const san of path) {
    node = nodes.find((candidate) => candidate.san === san);
    if (!node) throw new Error(`coup introuvable : ${san} (chemin ${path.join(" ")})`);
    nodes = node.children;
  }
  if (!node) throw new Error("chemin vide");
  return node;
}

const NAJDORF = ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3"];

/** « e4(e5(Nf3),c5) » */
const shape = (nodes: RepertoireNode[]): string =>
  nodes.map((n) => (n.children.length > 0 ? `${n.san}(${shape(n.children)})` : n.san)).join(",");

describe("importPgn : arbre", () => {
  it("construit l'arbre d'une partie avec variantes, et le valide coup par coup", () => {
    const { children, report } = ok("1. e4 e5 (1... c5 2. Nf3 d6) 2. Nf3 Nc6 *");
    expect(shape(children)).toBe("e4(e5(Nf3(Nc6)),c5(Nf3(d6)))");
    expect(report).toMatchObject({ gamesFound: 1, gamesImported: 1, nodeCount: 7, issueCount: 0, truncated: false });
    expect(findInvalidNodeIds({ children })).toEqual([]);
  });

  it("écrit les coups en notation canonique (mat, échec…)", () => {
    const { children } = ok("1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6 4. Qxf7");
    const last = children[0].children[0].children[0].children[0].children[0].children[0].children[0];
    expect(last.san).toBe("Qxf7#"); // le « # » est ajouté
  });

  it("fusionne les parties qui partagent des coups en un seul arbre", () => {
    const { children, report } = ok(
      '[Event "A"]\n1. e4 e5 2. Nf3 *\n\n[Event "B"]\n1. e4 e5 2. Bc4 *\n\n[Event "C"]\n1. e4 c5 *',
    );
    expect(shape(children)).toBe("e4(e5(Nf3,Bc4),c5)");
    expect(report.gamesImported).toBe(3);
    expect(report.nodeCount).toBe(5); // e4, e5, Nf3, Bc4, c5
  });

  it("fusionne une variante identique à la ligne principale", () => {
    expect(shape(ok("1. e4 e5 (1... e5 2. Nf3) 2. Nf3").children)).toBe("e4(e5(Nf3))");
  });

  it("génère des identifiants uniques", () => {
    const { children } = ok("1. e4 e5 (1... c5) 2. Nf3 (2. f4) Nc6");
    expect(collectIds({ children }).size).toBe(countNodes({ children }));
  });

  it("conserve symboles, commentaires et flèches (la première annotation l'emporte)", () => {
    const { children } = ok(
      '[Event "A"]\n1. e4 $1 { [%cal Ge2e4] Coup roi } e5 *\n\n[Event "B"]\n1. e4 $2 {Autre avis} e5!? *',
    );
    expect(children[0]).toMatchObject({ san: "e4", symbol: "!", comment: "Coup roi", arrows: [["e2", "e4"]] });
    expect(children[0].children[0].symbol).toBe("!?"); // complété par la 2e partie
  });
});

describe("importPgn : coups illégaux", () => {
  it("ignore la branche d'un coup illégal et signale où, sans perdre le reste", () => {
    const { children, report } = ok("1. e4 e5 (1... Qh5 2. Nf3) 2. Nf3 Nc6 *");
    expect(shape(children)).toBe("e4(e5(Nf3(Nc6)))"); // la variante illégale n'est pas importée
    expect(report.issueCount).toBe(1);
    expect(report.issues[0].message).toBe("Coup illégal « Qh5 » après 1. e4 : cette branche est ignorée.");
  });

  it("signale un coup illégal dès la position initiale", () => {
    const { report } = ok("1. Qh5 e5");
    expect(report.issues[0].message).toMatch(/dès la position initiale/);
    expect(report.nodeCount).toBe(0);
  });

  it("ne rapporte qu'un nombre limité de problèmes mais les compte tous", () => {
    const pgn = `1. e4 ${"(1. Qh5) ".repeat(80)} e5`;
    const { report } = ok(pgn);
    expect(report.issueCount).toBe(80);
    expect(report.issues).toHaveLength(50);
  });

  it("reprend les problèmes de syntaxe dans le rapport", () => {
    const { report } = ok("1. e4 e5 (1... c5");
    expect(report.issues.map((i) => i.message).join(" ")).toMatch(/non fermée/);
  });
});

describe("importPgn : parties ignorées", () => {
  it("ignore une partie qui part d'une position personnalisée", () => {
    const { children, report } = ok(
      '[Event "Finale"]\n[SetUp "1"]\n[FEN "8/8/8/8/8/4k3/8/4K2R w - - 0 1"]\n\n1. Rh3+ *\n\n[Event "Normale"]\n\n1. e4 *',
    );
    expect(shape(children)).toBe("e4");
    expect(report.skipped).toEqual([{ game: 1, reason: expect.stringContaining("position de départ") }]);
    expect(report.gamesImported).toBe(1);
  });

  it("accepte « From Position » quand la position est la position initiale", () => {
    const { report } = ok(
      '[Variant "From Position"]\n[FEN "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"]\n\n1. e4 *',
    );
    expect(report.gamesImported).toBe(1);
  });

  it("ignore une variante du jeu non prise en charge", () => {
    const { report } = ok('[Variant "Crazyhouse"]\n\n1. e4 *');
    expect(report.skipped[0].reason).toMatch(/Crazyhouse/);
  });

  it("ignore une partie sans coup, ou avec une FEN invalide", () => {
    const { report } = ok(`[Event "Vide"]\n\n*\n\n[FEN "pas une FEN"]\n\n1. e4 *`);
    expect(report.skipped.map((s) => s.game)).toEqual([1, 2]);
  });
});

describe("importPgn : limites et erreurs", () => {
  it("respecte la limite de coups et le signale", () => {
    const { children, report } = ok("1. e4 e5 2. Nf3 Nc6 3. Bb5 a6", { maxNodes: 4 });
    expect(countNodes({ children })).toBe(4);
    expect(report.truncated).toBe(true);
  });

  it("refuse un texte vide, trop gros ou sans partie", () => {
    expect(importPgn("   ")).toEqual({ ok: false, error: "empty" });
    expect(importPgn("1. e4 e5", { maxBytes: 3 })).toEqual({ ok: false, error: "too-large" });
    expect(importPgn("%%%")).toEqual({ ok: false, error: "no-game" });
  });

  it("compte les octets, pas les caractères", () => {
    const text = `{${"é".repeat(10)}} 1. e4`; // « é » pèse 2 octets : 10 octets de plus que de caractères
    const bytes = text.length + 10;
    expect(importPgn(text, { maxBytes: bytes }).ok).toBe(true);
    expect(importPgn(text, { maxBytes: bytes - 1 })).toEqual({ ok: false, error: "too-large" });
  });
});

describe("importPgn : suggestions", () => {
  it("propose le nom de l'étude ou de l'événement, et la couleur de l'orientation", () => {
    const study = ok('[StudyName "Mon 1.e4"]\n[Event "Mon 1.e4: Chapitre 1"]\n[Orientation "black"]\n\n1. e4 *');
    expect(study.suggestedName).toBe("Mon 1.e4");
    expect(study.suggestedSide).toBe("black");

    const event = ok('[Event "Tournoi"]\n\n1. e4 *');
    expect(event.suggestedName).toBe("Tournoi");
    expect(event.suggestedSide).toBeNull();

    expect(ok('[Event "?"]\n\n1. e4 *').suggestedName).toBeNull();
  });
});

describe("importPgn : étude Lichess réaliste", () => {
  const study = `[Event "Ma Sicilienne: Najdorf"]
[Site "https://lichess.org/study/abcd1234/EfGh5678"]
[Result "*"]
[UTCDate "2026.10.24"]
[Variant "Standard"]
[ECO "B90"]
[Opening "Sicilian Defense: Najdorf Variation"]
[Annotator "https://lichess.org/@/moi"]
[Orientation "white"]

1. e4 { [%clk 0:10:00] } 1... c5 { [%cal Gg1f3] } 2. Nf3 $1 { Développement naturel. } 2... d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 { [%csl Ra6][%eval 0.3] La Najdorf. } 6. Be3 ( 6. Bg5 { Attaque Richter-Rauzer ? } 6... e6 ( 6... Nbd7 ) 7. f4 ) 6... e5 7. Nb3 *


[Event "Ma Sicilienne: Dragon"]
[Variant "Standard"]
[Orientation "white"]

1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 g6 6. Be3 Bg7 7. f3 O-O 8. Qd2 Nc6 9. Bc4 *
`;

  it("importe les deux chapitres dans un seul arbre sans perdre de ligne", () => {
    const { children, report } = ok(study);
    expect(report).toMatchObject({ gamesFound: 2, gamesImported: 2, issueCount: 0, truncated: false });
    expect(report.skipped).toEqual([]);

    // Les deux chapitres se séparent après 5.Nc3 : a6 (Najdorf) ou g6 (Dragon)
    expect(at(children, NAJDORF).children.map((n) => n.san)).toEqual(["a6", "g6"]);
    expect(at(children, [...NAJDORF, "g6", "Be3", "Bg7", "f3", "O-O", "Qd2", "Nc6", "Bc4"]).children).toEqual([]);
  });

  it("garde les annotations utiles et retire les commandes techniques", () => {
    const { children } = ok(study);

    expect(at(children, ["e4"]).comment).toBeUndefined(); // [%clk] seul : aucun commentaire
    expect(at(children, ["e4", "c5"]).arrows).toEqual([["g1", "f3"]]);
    expect(at(children, ["e4", "c5", "Nf3"])).toMatchObject({
      symbol: "!",
      comment: "Développement naturel.",
    });
    // [%csl] et [%eval] retirés, le texte est conservé
    expect(at(children, [...NAJDORF, "a6"]).comment).toBe("La Najdorf.");
  });

  it("importe les variantes imbriquées, avec leur commentaire", () => {
    const { children } = ok(study);
    const a6 = at(children, [...NAJDORF, "a6"]);

    // 6.Be3 (ligne principale) et 6.Bg5 (variante)
    expect(a6.children.map((n) => n.san)).toEqual(["Be3", "Bg5"]);

    const bg5 = at(children, [...NAJDORF, "a6", "Bg5"]);
    expect(bg5.comment).toBe("Attaque Richter-Rauzer ?");
    expect(bg5.children.map((n) => n.san)).toEqual(["e6", "Nbd7"]); // 6...e6 et sa variante 6...Nbd7
    expect(at(children, [...NAJDORF, "a6", "Bg5", "e6"]).children.map((n) => n.san)).toEqual(["f4"]);

    expect(at(children, [...NAJDORF, "a6", "Be3", "e5", "Nb3"]).children).toEqual([]);
    expect(findInvalidNodeIds({ children })).toEqual([]);
  });

  it("propose le nom de l'étude et sa couleur", () => {
    const result = ok(study);
    expect(result.suggestedName).toBe("Ma Sicilienne: Najdorf");
    expect(result.suggestedSide).toBe("white");
  });
});
