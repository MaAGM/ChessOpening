import { Chess } from "chess.js";
import type { EngineScore } from "@/lib/engine/uci";
import { fenTurn } from "@/lib/review/positionKey";
import type { Side } from "@/lib/review/types";
import type { CoachThresholds, PlayerScore, Severity } from "./types";

export const DEFAULT_COACH_THRESHOLDS: CoachThresholds = {
  inaccuracy: 0.1,
  mistake: 0.2,
  blunder: 0.3,
  tacticalMaterial: 2,
  materialPlies: 7,
};

/** Même pente que `whiteShare` (moteur) : ±400 cp ≈ 82 % / 18 %. */
const WIN_CHANCE_SLOPE = 0.00368208;

export function opposite(side: Side): Side {
  return side === "white" ? "black" : "white";
}

/**
 * Convertit un score « point de vue des Blancs » en score « point de vue du joueur ».
 * `fen` est la position analysée : elle sert à interpréter `mate 0` (le camp au trait est maté).
 */
export function toPlayerScore(score: EngineScore, fen: string, playerSide: Side): PlayerScore {
  if (score.type === "cp") {
    return { kind: "cp", cp: playerSide === "white" ? score.value : -score.value };
  }
  if (score.value === 0) {
    const mated = fenTurn(fen);
    return { kind: "mate", moves: 0, winner: mated === playerSide ? "opponent" : "player" };
  }
  const mating: Side = score.value > 0 ? "white" : "black";
  return {
    kind: "mate",
    moves: Math.abs(score.value),
    winner: mating === playerSide ? "player" : "opponent",
  };
}

/** Chances de gain du joueur, de -1 (perdu) à +1 (gagné). */
export function winChance(score: PlayerScore): number {
  if (score.kind === "mate") return score.winner === "player" ? 1 : -1;
  return 2 / (1 + Math.exp(-WIN_CHANCE_SLOPE * score.cp)) - 1;
}

export function severityOf(winChanceLoss: number, thresholds: CoachThresholds): Severity {
  if (winChanceLoss >= thresholds.blunder) return "blunder";
  if (winChanceLoss >= thresholds.mistake) return "mistake";
  if (winChanceLoss >= thresholds.inaccuracy) return "inaccuracy";
  return "none";
}

/**
 * Convertit une variante UCI en SAN depuis `fen`. S'arrête au premier coup invalide
 * (variante tronquée ou incohérente avec la position).
 */
export function uciLineToSan(fen: string, uciMoves: readonly string[]): string[] {
  let game: Chess;
  try {
    game = new Chess(fen);
  } catch {
    return [];
  }
  const sans: string[] = [];
  for (const uci of uciMoves) {
    try {
      const move = game.move({
        from: uci.slice(0, 2),
        to: uci.slice(2, 4),
        promotion: uci.length > 4 ? uci[4] : undefined,
      });
      sans.push(move.san);
    } catch {
      break;
    }
  }
  return sans;
}

const PIECE_VALUES: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

/** Bilan matériel (en pions) du point de vue de `side`, d'après le placement d'une FEN. */
export function materialBalance(fen: string, side: Side): number {
  const placement = fen.trim().split(/\s+/)[0] ?? "";
  let white = 0;
  let black = 0;
  for (const char of placement) {
    const value = PIECE_VALUES[char.toLowerCase()];
    if (value === undefined) continue;
    if (char === char.toUpperCase()) white += value;
    else black += value;
  }
  return side === "white" ? white - black : black - white;
}

/**
 * Variation du bilan matériel du joueur le long d'une ligne (SAN) jouée depuis `fenBefore`
 * (le joueur au trait). La ligne est tronquée à un nombre IMPAIR de demi-coups pour finir
 * sur un coup du joueur : une prise adverse n'est comptée qu'une fois la reprise possible
 * jouée. Renvoie `null` si la ligne est vide ou illégale dès le premier coup.
 */
export function materialDelta(
  fenBefore: string,
  line: readonly string[],
  maxPlies: number,
): number | null {
  let game: Chess;
  try {
    game = new Chess(fenBefore);
  } catch {
    return null;
  }
  const side = fenTurn(fenBefore);
  const start = materialBalance(fenBefore, side);

  let limit = Math.min(line.length, Math.max(1, maxPlies));
  if (limit % 2 === 0) limit -= 1;

  let played = 0;
  for (let i = 0; i < limit; i++) {
    try {
      game.move(line[i]);
      played++;
    } catch {
      break;
    }
  }
  if (played === 0) return null;
  // Variante interrompue sur un coup adverse : on revient au dernier coup du joueur.
  if (played % 2 === 0) game.undo();
  return materialBalance(game.fen(), side) - start;
}
