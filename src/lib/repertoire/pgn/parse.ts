import type { Arrow } from "@/lib/data/openings/types";
import { isMoveSymbol, type MoveSymbol } from "../types";
import { tokenizePgn } from "./tokenize";

/** Coup lu dans un PGN, avant toute vérification de légalité. */
export type PgnNode = {
  san: string;
  symbol?: MoveSymbol;
  comment?: string;
  arrows?: Arrow[];
  children: PgnNode[];
};

export type PgnGame = {
  /** Numéro de la partie dans le fichier (à partir de 1). */
  index: number;
  headers: Record<string, string>;
  /** Commentaire placé avant le premier coup. */
  comment?: string;
  /** Premiers coups : la ligne principale en tête, les variantes ensuite. */
  children: PgnNode[];
  result: string | null;
  /** Problèmes de syntaxe rencontrés (la lecture a continué). */
  problems: string[];
};

/** NAG (« $1 »…) vers symbole d'appréciation. Les autres NAG sont ignorés. */
const NAG_SYMBOLS: Record<number, MoveSymbol> = { 1: "!", 2: "?", 3: "!!", 4: "??", 5: "!?", 6: "?!" };

const COMMAND = /\[%(\w+)\s*([^\]]*)\]/g;
const ARROW = /^[GRYBgryb]?([a-h][1-8])([a-h][1-8])$/;

/**
 * Sépare le texte d'un commentaire de ses commandes Lichess : `[%cal Gc2c4,Re7e5]` donne
 * des flèches ; `[%clk]`, `[%eval]`, `[%csl]`… sont retirées.
 */
export function extractComment(raw: string): { text: string; arrows: Arrow[] } {
  const arrows: Arrow[] = [];

  const withoutCommands = raw.replace(COMMAND, (_match, name: string, args: string) => {
    if (name === "cal") {
      for (const item of args.split(",")) {
        const match = ARROW.exec(item.trim());
        if (match && match[1] !== match[2] && !arrows.some((a) => a[0] === match[1] && a[1] === match[2])) {
          arrows.push([match[1], match[2]]);
        }
      }
    }
    return " ";
  });

  return { text: normalizeText(withoutCommands), arrows };
}

/**
 * Nettoie un commentaire en gardant ses retours à la ligne (paragraphes) : les espaces
 * multiples sont réduits, pas les sauts de ligne.
 */
function normalizeText(text: string): string {
  return text
    .replace(/[ \t\f\v]+/g, " ")
    .replace(/ ?\n ?/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

type LineContext = {
  /** Liste où sera ajouté le prochain coup. */
  container: PgnNode[];
  /** Dernier coup lu dans cette ligne. */
  last: PgnNode | null;
  /** Liste qui contient `last` : une variante est une alternative à `last`, donc s'y ajoute. */
  lastContainer: PgnNode[];
  /** Commentaires lus avant le premier coup d'une variante. */
  before: string[];
};

function join(a: string | undefined, b: string): string {
  return a ? `${a} ${b}` : b;
}

/** Lit un texte PGN (une ou plusieurs parties) et construit l'arbre de coups de chaque partie. */
export function parsePgn(text: string): PgnGame[] {
  const tokens = tokenizePgn(text);
  const games: PgnGame[] = [];

  let game: PgnGame | null = null;
  let started = false; // des coups ont été lus dans la partie en cours
  let context: LineContext = { container: [], last: null, lastContainer: [], before: [] };
  let stack: LineContext[] = [];

  const open = (): PgnGame => {
    const created: PgnGame = {
      index: games.length + 1,
      headers: {},
      children: [],
      result: null,
      problems: [],
    };
    context = { container: created.children, last: null, lastContainer: created.children, before: [] };
    stack = [];
    started = false;
    return created;
  };

  const close = () => {
    if (!game) return;
    if (stack.length > 0) game.problems.push("Variante non fermée : parenthèse « ) » manquante.");
    games.push(game);
    game = null;
  };

  const hasContent = (g: PgnGame) =>
    Object.keys(g.headers).length > 0 || g.children.length > 0 || g.comment !== undefined;

  for (const token of tokens) {
    switch (token.type) {
      case "tag": {
        // Un en-tête après des coups ouvre une nouvelle partie (résultat manquant).
        if (game && started) close();
        game ??= open();
        game.headers[token.name] = token.value;
        break;
      }

      case "problem": {
        game ??= open();
        game.problems.push(token.message);
        break;
      }

      case "move": {
        game ??= open();
        started = true;
        const node: PgnNode = { san: token.san, children: [] };
        if (token.symbol) node.symbol = token.symbol;
        if (context.before.length > 0) {
          node.comment = context.before.join(" ");
          context.before = [];
        }
        context.container.push(node);
        context.lastContainer = context.container;
        context.container = node.children;
        context.last = node;
        break;
      }

      case "comment": {
        game ??= open();
        const { text: clean, arrows } = extractComment(token.text);
        if (context.last) {
          if (clean) context.last.comment = join(context.last.comment, clean);
          if (arrows.length > 0) {
            const existing = context.last.arrows ?? [];
            context.last.arrows = [
              ...existing,
              ...arrows.filter((a) => !existing.some((e) => e[0] === a[0] && e[1] === a[1])),
            ];
          }
        } else if (stack.length > 0) {
          if (clean) context.before.push(clean);
        } else if (clean) {
          game.comment = join(game.comment, clean);
        }
        break;
      }

      case "nag": {
        const symbol = NAG_SYMBOLS[token.value];
        if (context.last && isMoveSymbol(symbol)) context.last.symbol = symbol;
        break;
      }

      case "variationStart": {
        game ??= open();
        started = true;
        stack.push(context);
        if (context.last) {
          // Alternative au dernier coup : elle part de la même position que lui.
          context = { container: context.lastContainer, last: null, lastContainer: context.lastContainer, before: [] };
        } else {
          game.problems.push("Variante sans coup précédent : ignorée.");
          const discarded: PgnNode[] = [];
          context = { container: discarded, last: null, lastContainer: discarded, before: [] };
        }
        break;
      }

      case "variationEnd": {
        game ??= open();
        const previous = stack.pop();
        if (previous) context = previous;
        else game.problems.push("Parenthèse fermante « ) » sans variante ouverte : ignorée.");
        break;
      }

      case "result": {
        if (!game) break; // résultat orphelin
        if (stack.length > 0) {
          game.problems.push("Résultat à l'intérieur d'une variante : ignoré.");
          break;
        }
        game.result = token.value;
        close();
        break;
      }
    }
  }

  if (game && hasContent(game)) close();
  return games;
}
