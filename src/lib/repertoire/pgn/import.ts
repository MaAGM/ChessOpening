import { Chess } from "chess.js";
import { toPositionKey } from "@/lib/review/positionKey";
import type { Side } from "@/lib/review/types";
import { REPERTOIRE_LIMITS } from "../limits";
import { formatLine } from "../notation";
import { INITIAL_FEN, countNodes, createNodeId } from "../repertoireTree";
import type { RepertoireNode } from "../types";
import { parsePgn, type PgnGame, type PgnNode } from "./parse";

/** Problème rencontré à l'import (coup illégal, syntaxe) : la lecture continue sans la ligne concernée. */
export type PgnIssue = { game: number; message: string };
export type SkippedGame = { game: number; reason: string };

export type PgnImportReport = {
  gamesFound: number;
  gamesImported: number;
  skipped: SkippedGame[];
  /** Les premiers problèmes seulement (voir `issueCount` pour le total). */
  issues: PgnIssue[];
  issueCount: number;
  /** Coups de l'arbre importé (avant fusion avec un répertoire existant). */
  nodeCount: number;
  /** Vrai si la limite de coups a empêché de tout importer. */
  truncated: boolean;
};

export type PgnImportOptions = {
  maxNodes?: number;
  maxBytes?: number;
  idFactory?: (taken: ReadonlySet<string>) => string;
};

export type PgnImportResult =
  | {
      ok: true;
      children: RepertoireNode[];
      report: PgnImportReport;
      /** Nom proposé pour un nouveau répertoire (étude ou événement du PGN). */
      suggestedName: string | null;
      /** Couleur proposée (en-tête Orientation). */
      suggestedSide: Side | null;
    }
  | { ok: false; error: "empty" | "too-large" | "no-game" };

const MAX_REPORTED_ISSUES = 50;
const INITIAL_KEY = toPositionKey(INITIAL_FEN);
const SUPPORTED_VARIANTS = new Set(["", "standard", "chess", "from position"]);

/** Raison pour laquelle une partie ne peut pas être importée, ou null. */
function skipReason(game: PgnGame): string | null {
  const variant = (game.headers.Variant ?? "").trim().toLowerCase();
  if (!SUPPORTED_VARIANTS.has(variant)) return `variante « ${game.headers.Variant} » non prise en charge`;

  const fen = game.headers.FEN;
  if (fen) {
    try {
      if (toPositionKey(new Chess(fen).fen()) !== INITIAL_KEY) {
        return "position de départ personnalisée (FEN) non prise en charge";
      }
    } catch {
      return "position de départ (FEN) invalide";
    }
  }

  if (game.children.length === 0) return "aucun coup";
  return null;
}

type Context = {
  budget: number;
  taken: Set<string>;
  truncated: boolean;
  issues: PgnIssue[];
  issueCount: number;
  idFactory: (taken: ReadonlySet<string>) => string;
};

function addIssue(ctx: Context, game: number, message: string): void {
  ctx.issueCount += 1;
  if (ctx.issues.length < MAX_REPORTED_ISSUES) ctx.issues.push({ game, message });
}

/**
 * Vérifie les coups de `pgnNodes` depuis `fen` et les ajoute à `target`, en fusionnant
 * avec ce qui existe déjà (mêmes coups = même nœud). Un coup illégal fait ignorer toute
 * sa branche, mais pas ses variantes sœurs.
 */
function convertNodes(
  pgnNodes: PgnNode[],
  fen: string,
  path: string[],
  target: RepertoireNode[],
  game: number,
  ctx: Context,
): void {
  for (const pgnNode of pgnNodes) {
    const board = new Chess(fen);
    let san: string;
    try {
      san = board.move(pgnNode.san).san; // SAN canonique (« Qxf7 » devient « Qxf7# » si c'est mat)
    } catch {
      const where = path.length > 0 ? `après ${formatLine(path)}` : "dès la position initiale";
      addIssue(ctx, game, `Coup illégal « ${pgnNode.san} » ${where} : cette branche est ignorée.`);
      continue;
    }

    let node = target.find((candidate) => candidate.san === san);
    if (!node) {
      if (ctx.budget <= 0) {
        ctx.truncated = true;
        continue;
      }
      ctx.budget -= 1;
      const id = ctx.idFactory(ctx.taken);
      ctx.taken.add(id);
      node = { id, san, children: [] };
      target.push(node);
    }

    // Annotations : la première rencontrée est conservée, les suivantes complètent les manques.
    if (!node.symbol && pgnNode.symbol) node.symbol = pgnNode.symbol;
    if (!node.comment && pgnNode.comment) {
      node.comment = pgnNode.comment.slice(0, REPERTOIRE_LIMITS.maxCommentLength);
    }
    if (!node.arrows && pgnNode.arrows && pgnNode.arrows.length > 0) node.arrows = pgnNode.arrows;

    convertNodes(pgnNode.children, board.fen(), [...path, san], node.children, game, ctx);
  }
}

function headerValue(game: PgnGame, name: string): string | null {
  const value = game.headers[name]?.trim();
  return value && value !== "?" ? value : null;
}

/**
 * Analyse un PGN (une ou plusieurs parties, variantes comprises) et construit l'arbre de
 * répertoire correspondant, sans rien enregistrer. Toutes les parties sont fusionnées dans
 * un seul arbre ; le rapport décrit ce qui a été importé, ignoré ou tronqué.
 */
export function importPgn(text: string, options: PgnImportOptions = {}): PgnImportResult {
  if (text.trim() === "") return { ok: false, error: "empty" };
  if (new TextEncoder().encode(text).length > (options.maxBytes ?? REPERTOIRE_LIMITS.maxPgnBytes)) {
    return { ok: false, error: "too-large" };
  }

  const games = parsePgn(text);
  if (games.length === 0) return { ok: false, error: "no-game" };

  const ctx: Context = {
    budget: options.maxNodes ?? REPERTOIRE_LIMITS.maxNodes,
    taken: new Set(),
    truncated: false,
    issues: [],
    issueCount: 0,
    idFactory: options.idFactory ?? createNodeId,
  };

  const children: RepertoireNode[] = [];
  const skipped: SkippedGame[] = [];
  const imported: PgnGame[] = [];

  for (const game of games) {
    const reason = skipReason(game);
    if (reason) {
      skipped.push({ game: game.index, reason });
      continue;
    }

    for (const problem of game.problems) addIssue(ctx, game.index, problem);
    convertNodes(game.children, INITIAL_FEN, [], children, game.index, ctx);
    imported.push(game);
  }

  const first = imported[0];
  return {
    ok: true,
    children,
    suggestedName: first ? (headerValue(first, "StudyName") ?? headerValue(first, "Event")) : null,
    suggestedSide: first
      ? (["white", "black"] as const).find((side) => first.headers.Orientation?.toLowerCase() === side) ?? null
      : null,
    report: {
      gamesFound: games.length,
      gamesImported: imported.length,
      skipped,
      issues: ctx.issues,
      issueCount: ctx.issueCount,
      nodeCount: countNodes({ children }),
      truncated: ctx.truncated,
    },
  };
}
