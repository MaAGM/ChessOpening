import { isMoveSymbol, type MoveSymbol } from "../types";

export type PgnToken =
  | { type: "tag"; name: string; value: string }
  | { type: "move"; san: string; symbol?: MoveSymbol }
  | { type: "comment"; text: string }
  | { type: "nag"; value: number }
  | { type: "variationStart" }
  | { type: "variationEnd" }
  | { type: "result"; value: string }
  /** Problème de syntaxe non bloquant (la lecture continue). */
  | { type: "problem"; message: string };

const RESULTS = new Set(["1-0", "0-1", "1/2-1/2", "½-½", "*"]);
const SUFFIX = /(!!|\?\?|!\?|\?!|!|\?)$/;
const TAG = /\[\s*([A-Za-z0-9_]+)\s+"((?:[^"\\]|\\.)*)"\s*\]/y;

/** Notation figurée (♘f3) vers lettres (Nf3). */
const FIGURINES: Record<string, string> = {
  "♔": "K", "♚": "K", "♕": "Q", "♛": "Q", "♖": "R", "♜": "R",
  "♗": "B", "♝": "B", "♘": "N", "♞": "N",
};

const DELIMITERS = new Set(["(", ")", "{", "}", ";", "[", "]", "$"]);

function unescapeTagValue(raw: string): string {
  return raw.replace(/\\(.)/g, "$1");
}

/** Mot du texte de coups (« 12...Nf3!? », « 0-0 », « 1-0 », « e.p. »…) vers un jeton. */
function readWord(word: string): PgnToken | null {
  if (RESULTS.has(word)) return { type: "result", value: word === "½-½" ? "1/2-1/2" : word };
  if (/^\d+$/.test(word) || word === "e.p." || word === "ep") return null; // numéro isolé, « en passant »

  // Castling écrit avec des zéros, y compris avec un numéro de coup collé (« 12.0-0 »)
  const castling = word.replace(/^\d+(?:\.{1,3}|…+)/, "");
  if (/^0-0(?:-0)?[+#]?(?:!!|\?\?|!\?|\?!|!|\?)?$/.test(castling)) {
    return toMove(castling.replace(/0/g, "O"));
  }

  const stripped = word.replace(/^\d+(?:\.{1,3}|…+)/, "");
  if (stripped === "") return null; // « 1. » ou « 1... » : numéro seul
  return toMove(stripped.replace(/[♔♚♕♛♖♜♗♝♘♞]/g, (c) => FIGURINES[c]));
}

function toMove(text: string): PgnToken | null {
  const match = text.match(SUFFIX);
  const suffix = match?.[1];
  const san = suffix ? text.slice(0, -suffix.length) : text;
  if (san === "") return null;
  return isMoveSymbol(suffix) ? { type: "move", san, symbol: suffix } : { type: "move", san };
}

/** Découpe un texte PGN en éléments. Ne vérifie ni la légalité des coups ni la structure. */
export function tokenizePgn(input: string): PgnToken[] {
  const text = input.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  const tokens: PgnToken[] = [];
  const n = text.length;
  let i = 0;

  while (i < n) {
    const c = text[i];

    if (/\s/.test(c)) {
      i += 1;
      continue;
    }

    // Ligne d'échappement : « % » en début de ligne
    if (c === "%" && (i === 0 || text[i - 1] === "\n")) {
      while (i < n && text[i] !== "\n") i += 1;
      continue;
    }

    // Commentaire jusqu'à la fin de la ligne
    if (c === ";") {
      const start = i + 1;
      while (i < n && text[i] !== "\n") i += 1;
      tokens.push({ type: "comment", text: text.slice(start, i) });
      continue;
    }

    // Commentaire entre accolades
    if (c === "{") {
      const end = text.indexOf("}", i + 1);
      if (end === -1) {
        tokens.push({ type: "comment", text: text.slice(i + 1) });
        tokens.push({ type: "problem", message: "Commentaire non fermé (accolade « } » manquante)." });
        i = n;
      } else {
        tokens.push({ type: "comment", text: text.slice(i + 1, end) });
        i = end + 1;
      }
      continue;
    }

    // En-tête : [Nom "valeur"]
    if (c === "[") {
      TAG.lastIndex = i;
      const match = TAG.exec(text);
      if (match) {
        tokens.push({ type: "tag", name: match[1], value: unescapeTagValue(match[2]) });
        i = TAG.lastIndex;
      } else {
        tokens.push({ type: "problem", message: "En-tête mal formé, ignoré." });
        while (i < n && text[i] !== "]" && text[i] !== "\n") i += 1;
        i += 1;
      }
      continue;
    }

    if (c === "(") {
      tokens.push({ type: "variationStart" });
      i += 1;
      continue;
    }
    if (c === ")") {
      tokens.push({ type: "variationEnd" });
      i += 1;
      continue;
    }

    if (c === "$") {
      const match = /^\$(\d+)/.exec(text.slice(i, i + 8));
      if (match) {
        tokens.push({ type: "nag", value: Number(match[1]) });
        i += match[0].length;
      } else {
        i += 1;
      }
      continue;
    }

    // Caractères parasites isolés
    if (c === "]" || c === "}") {
      i += 1;
      continue;
    }

    // Mot : coup, numéro de coup ou résultat
    const start = i;
    while (i < n && !/\s/.test(text[i]) && !DELIMITERS.has(text[i])) i += 1;
    const token = readWord(text.slice(start, i));
    if (token) tokens.push(token);
  }

  return tokens;
}
