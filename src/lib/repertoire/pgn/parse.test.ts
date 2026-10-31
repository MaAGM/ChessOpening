import { describe, expect, it } from "vitest";
import { extractComment, parsePgn, type PgnNode } from "./parse";
import { tokenizePgn } from "./tokenize";

/** Représentation compacte d'un arbre : « e4(e5(Nf3),c5) » = e4 puis e5 (avec Nf3) ou c5. */
function shape(nodes: PgnNode[]): string {
  return nodes
    .map((n) => (n.children.length > 0 ? `${n.san}(${shape(n.children)})` : n.san))
    .join(",");
}

const first = (pgn: string) => parsePgn(pgn)[0];

describe("tokenizePgn", () => {
  it("lit les coups, numéros collés, points de suspension et résultat", () => {
    const tokens = tokenizePgn("1.e4 e5 2. Nf3 2... Nc6 12…Bb5 1-0");
    expect(tokens.filter((t) => t.type === "move").map((t) => (t as { san: string }).san)).toEqual([
      "e4", "e5", "Nf3", "Nc6", "Bb5",
    ]);
    expect(tokens.at(-1)).toEqual({ type: "result", value: "1-0" });
  });

  it("normalise le roque écrit avec des zéros, sans le confondre avec un résultat", () => {
    const sans = tokenizePgn("0-0 0-0-0 O-O 12.0-0 0-1")
      .filter((t) => t.type === "move")
      .map((t) => (t as { san: string }).san);
    expect(sans).toEqual(["O-O", "O-O-O", "O-O", "O-O"]);
    expect(tokenizePgn("0-1").at(-1)).toEqual({ type: "result", value: "0-1" });
  });

  it("sépare les symboles collés au coup", () => {
    const tokens = tokenizePgn("e4! Nf3?? Bb5!? a4?! d4!! c3?");
    expect(tokens).toEqual([
      { type: "move", san: "e4", symbol: "!" },
      { type: "move", san: "Nf3", symbol: "??" },
      { type: "move", san: "Bb5", symbol: "!?" },
      { type: "move", san: "a4", symbol: "?!" },
      { type: "move", san: "d4", symbol: "!!" },
      { type: "move", san: "c3", symbol: "?" },
    ]);
  });

  it("lit la notation figurée", () => {
    const sans = tokenizePgn("♘f3 ♗b5").map((t) => (t as { san: string }).san);
    expect(sans).toEqual(["Nf3", "Bb5"]);
  });

  it("gère un BOM, des fins de ligne Windows, les lignes « % » et les commentaires « ; »", () => {
    const tokens = tokenizePgn("\uFEFF%escape ignoré\r\n1. e4 ; note de fin de ligne\r\ne5");
    expect(tokens).toEqual([
      { type: "move", san: "e4" },
      { type: "comment", text: " note de fin de ligne" },
      { type: "move", san: "e5" },
    ]);
  });

  it("signale un commentaire ou un en-tête mal formé sans s'arrêter", () => {
    expect(tokenizePgn("e4 {jamais fermé").map((t) => t.type)).toEqual(["move", "comment", "problem"]);
    const bad = tokenizePgn('[Event "x" e4');
    expect(bad.some((t) => t.type === "problem")).toBe(true);
  });

  it("lit les en-têtes avec des guillemets échappés", () => {
    expect(tokenizePgn('[Event "Le \\"grand\\" tournoi"]')).toEqual([
      { type: "tag", name: "Event", value: 'Le "grand" tournoi' },
    ]);
  });
});

describe("extractComment", () => {
  it("convertit les flèches Lichess et retire les autres commandes", () => {
    const result = extractComment("[%cal Gc2c4,Re7e5][%clk 0:03:00] Plan : [%eval 0.17] fianchetto [%csl Gd4]");
    expect(result.arrows).toEqual([["c2", "c4"], ["e7", "e5"]]);
    expect(result.text).toBe("Plan : fianchetto");
  });

  it("conserve les paragraphes d'un commentaire et réduit les espaces", () => {
    expect(extractComment("  Ligne  un\n\n\n\nLigne   deux \n troisième  ").text).toBe(
      "Ligne un\n\nLigne deux\ntroisième",
    );
  });

  it("ignore les flèches invalides ou en double", () => {
    expect(extractComment("[%cal Ge2e4,Ge2e4,Gxx,Ga1a1,e7e5]").arrows).toEqual([["e2", "e4"], ["e7", "e5"]]);
  });
});

describe("parsePgn : structure", () => {
  it("lit une ligne simple avec ses en-têtes et son résultat", () => {
    const game = first('[Event "Test"]\n[White "A"]\n\n1. e4 e5 2. Nf3 Nc6 *');
    expect(game.headers).toEqual({ Event: "Test", White: "A" });
    expect(shape(game.children)).toBe("e4(e5(Nf3(Nc6)))");
    expect(game.result).toBe("*");
  });

  it("traite une variante comme une alternative au coup qui la précède", () => {
    const game = first("1. e4 e5 (1... c5 2. Nf3 d6) 2. Nf3 Nc6");
    // Après 1.e4 : e5 (ligne principale) ou c5 (variante)
    expect(shape(game.children)).toBe("e4(e5(Nf3(Nc6)),c5(Nf3(d6)))");
  });

  it("gère les variantes imbriquées et la reprise de la ligne principale", () => {
    const game = first("1. e4 e5 2. Nf3 (2. f4 exf4 (2... d5 3. exd5) 3. Nf3) 2... Nc6 3. Bb5");
    expect(shape(game.children)).toBe("e4(e5(Nf3(Nc6(Bb5)),f4(exf4(Nf3),d5(exd5))))");
  });

  it("gère plusieurs variantes successives sur le même coup", () => {
    const game = first("1. e4 (1. d4) (1. c4) e5");
    expect(shape(game.children)).toBe("e4(e5),d4,c4");
  });

  it("lit une variante qui démarre au premier coup des Blancs", () => {
    expect(shape(first("1. e4 (1. d4 d5) e5").children)).toBe("e4(e5),d4(d5)");
  });
});

describe("parsePgn : annotations", () => {
  it("rattache un commentaire au coup précédent, et le commentaire d'avant-partie à la partie", () => {
    const game = first("{Mon répertoire} 1. e4 {Coup roi} e5 {Réponse symétrique} {et solide}");
    expect(game.comment).toBe("Mon répertoire");
    expect(game.children[0].comment).toBe("Coup roi");
    expect(game.children[0].children[0].comment).toBe("Réponse symétrique et solide");
  });

  it("rattache un commentaire placé au début d'une variante à son premier coup", () => {
    const game = first("1. e4 e5 ( {Alternative sicilienne} 1... c5 ) 2. Nf3");
    expect(game.children[0].children[1]).toMatchObject({ san: "c5", comment: "Alternative sicilienne" });
  });

  it("convertit les NAG et les symboles collés (le NAG l'emporte)", () => {
    const game = first("1. e4! $2 e5 $5 2. Nf3 $14");
    expect(game.children[0].symbol).toBe("?");
    expect(game.children[0].children[0].symbol).toBe("!?");
    expect(game.children[0].children[0].children[0].symbol).toBeUndefined(); // $14 : évaluation, ignorée
  });

  it("extrait les flèches des commentaires Lichess", () => {
    const game = first("1. e4 { [%cal Ge2e4,Ge7e5] [%clk 0:10:00] Ouverture } e5");
    expect(game.children[0].arrows).toEqual([["e2", "e4"], ["e7", "e5"]]);
    expect(game.children[0].comment).toBe("Ouverture");
  });

  it("n'ajoute pas de commentaire vide quand il ne contient que des commandes", () => {
    const game = first("1. e4 {[%clk 0:03:00]} e5");
    expect(game.children[0].comment).toBeUndefined();
  });
});

describe("parsePgn : plusieurs parties et erreurs", () => {
  it("sépare les parties par leur résultat", () => {
    const games = parsePgn('[Event "A"]\n1. e4 e5 1-0\n\n[Event "B"]\n1. d4 d5 0-1');
    expect(games.map((g) => g.headers.Event)).toEqual(["A", "B"]);
    expect(games.map((g) => g.index)).toEqual([1, 2]);
    expect(games.map((g) => shape(g.children))).toEqual(["e4(e5)", "d4(d5)"]);
    expect(games.map((g) => g.result)).toEqual(["1-0", "0-1"]);
  });

  it("sépare aussi des parties dont le résultat manque (études Lichess)", () => {
    const games = parsePgn('[Event "Chapitre 1"]\n\n1. e4 e5\n\n[Event "Chapitre 2"]\n\n1. d4 d5');
    expect(games).toHaveLength(2);
    expect(games[1].headers.Event).toBe("Chapitre 2");
  });

  it("signale une parenthèse en trop ou manquante sans perdre le reste", () => {
    const extra = first("1. e4 ) e5");
    expect(shape(extra.children)).toBe("e4(e5)");
    expect(extra.problems.join(" ")).toMatch(/sans variante/);

    const open = first("1. e4 e5 (1... c5 2. Nf3");
    expect(shape(open.children)).toBe("e4(e5,c5(Nf3))");
    expect(open.problems.join(" ")).toMatch(/non fermée/);
  });

  it("ignore une variante sans coup précédent", () => {
    const game = first("( 1. e4 ) 1. d4");
    expect(shape(game.children)).toBe("d4");
    expect(game.problems.join(" ")).toMatch(/sans coup précédent/);
  });

  it("renvoie une liste vide pour un texte sans contenu", () => {
    expect(parsePgn("")).toEqual([]);
    expect(parsePgn("   \n\n  ")).toEqual([]);
  });
});
