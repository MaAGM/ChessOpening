import type { Arrow } from "@/lib/data/openings/types";
import type { MoveSymbol, Repertoire, RepertoireNode } from "../types";

/** Symbole d'appréciation vers NAG (la forme standard d'un PGN exporté). */
const NAG_OF_SYMBOL: Record<MoveSymbol, number> = { "!": 1, "?": 2, "!!": 3, "??": 4, "!?": 5, "?!": 6 };

export type ExportOptions = {
  /** Date de l'en-tête (maintenant par défaut ; fixée dans les tests). */
  date?: Date;
  /** Largeur maximale des lignes de coups. */
  lineWidth?: number;
};

const APP_NAME = "ChessmateTheory";

/**
 * Coup au format PGN standard : « 5. Nf3 » (Blancs), « 5... a6 » (Noirs, points ASCII)
 * ou « a6 » quand le numéro est inutile.
 */
function moveToken(ply: number, san: string, showBlackNumber: boolean): string {
  const number = Math.floor(ply / 2) + 1;
  if (ply % 2 === 0) return `${number}. ${san}`;
  return showBlackNumber ? `${number}... ${san}` : san;
}

function escapeHeader(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function formatDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;
}

/**
 * Commentaire en un seul bloc `{ … }`, avec ses flèches au format Lichess. Il n'est jamais
 * coupé : ses retours à la ligne sont des paragraphes que l'import doit retrouver tels quels.
 */
function commentToken(comment: string | undefined, arrows: Arrow[] | undefined): string | null {
  const parts: string[] = [];
  if (arrows && arrows.length > 0) {
    parts.push(`[%cal ${arrows.map(([from, to]) => `G${from}${to}`).join(",")}]`);
  }
  if (comment) {
    // Un « } » fermerait le commentaire ; un « [% » serait relu comme une commande.
    parts.push(comment.replace(/\}/g, ")").replace(/\[%/g, "[ %"));
  }
  return parts.length > 0 ? `{${parts.join(" ")}}` : null;
}

function lineTokens(siblings: RepertoireNode[], ply: number, tokens: string[], startsLine: boolean): void {
  let current = siblings;
  let currentPly = ply;
  let needsNumber = startsLine; // un coup noir est numéroté en début de ligne, après une variante ou un commentaire

  while (current.length > 0) {
    const [main, ...alternatives] = current;

    tokens.push(moveToken(currentPly, main.san, needsNumber));
    if (main.symbol) tokens.push(`$${NAG_OF_SYMBOL[main.symbol]}`);

    const comment = commentToken(main.comment, main.arrows);
    if (comment) tokens.push(comment);

    for (const alternative of alternatives) {
      tokens.push("(");
      lineTokens([alternative], currentPly, tokens, true);
      tokens.push(")");
    }

    needsNumber = alternatives.length > 0 || comment !== null;
    current = main.children;
    currentPly += 1;
  }
}

/** Longueur de la dernière ligne d'un texte (un commentaire peut en contenir plusieurs). */
function lastLineLength(text: string): number {
  return text.length - (text.lastIndexOf("\n") + 1);
}

/**
 * Assemble les jetons en lignes d'au plus `width` colonnes. Seuls les coups passent à la
 * ligne : un commentaire reste d'un seul tenant, même s'il dépasse la largeur.
 */
function wrap(tokens: string[], width: number): string {
  const lines: string[] = [];
  let line = "";
  for (const token of tokens) {
    const firstLine = token.split("\n")[0];
    if (line !== "" && lastLineLength(line) + 1 + firstLine.length > width) {
      lines.push(line);
      line = token;
    } else {
      line = line === "" ? token : `${line} ${token}`;
    }
  }
  if (line !== "") lines.push(line);
  return lines.join("\n");
}

/**
 * Exporte un répertoire au format PGN : lignes principales, variantes entre parenthèses,
 * symboles en NAG, commentaires entre accolades, flèches en commandes `[%cal]` (Lichess).
 */
export function exportPgn(
  repertoire: Pick<Repertoire, "name" | "side" | "children" | "comment">,
  options: ExportOptions = {},
): string {
  const headers: [string, string][] = [
    ["Event", repertoire.name],
    ["Site", APP_NAME],
    ["Date", formatDate(options.date ?? new Date())],
    ["Round", "-"],
    ["White", "?"],
    ["Black", "?"],
    ["Result", "*"],
    ["Annotator", APP_NAME],
    ["Orientation", repertoire.side],
  ];

  const tokens: string[] = [];
  const intro = commentToken(repertoire.comment, undefined);
  if (intro) tokens.push(intro);
  lineTokens(repertoire.children, 0, tokens, true);
  tokens.push("*");

  const head = headers.map(([name, value]) => `[${name} "${escapeHeader(value)}"]`).join("\n");
  return `${head}\n\n${wrap(tokens, options.lineWidth ?? 80)}\n`;
}
