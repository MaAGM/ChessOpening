import type { Side } from "@/lib/review/types";

/**
 * Évaluation d'une position.
 *  - `cp`   : centipions ;
 *  - `mate` : mat en N coups (négatif = le camp concerné se fait mater). `mate 0` = déjà mat.
 */
export type EngineScore = { type: "cp" | "mate"; value: number };

/** Une ligne `info … score … pv …` exploitable (les autres lignes `info` sont ignorées). */
export type UciInfo = {
  depth: number;
  multipv: number;
  /** Score du point de vue du camp AU TRAIT (convention UCI). */
  score: EngineScore;
  /** Score partiel (`lowerbound` / `upperbound`) : à ne pas retenir comme résultat final. */
  bound: "lower" | "upper" | null;
  /** Variante principale en notation UCI longue (`e2e4`, `e7e8q`…). */
  pv: string[];
};

export type UciBestMove = {
  /** `null` quand il n'y a aucun coup légal (`bestmove (none)`). */
  bestMove: string | null;
  ponder: string | null;
};

const UCI_MOVE = /^[a-h][1-8][a-h][1-8][qrbn]?$/;

export function isUciMove(move: string): boolean {
  return UCI_MOVE.test(move);
}

/** Analyse une ligne `info`. Renvoie `null` si elle ne contient ni score ni variante. */
export function parseInfoLine(line: string): UciInfo | null {
  const tokens = line.trim().split(/\s+/);
  if (tokens[0] !== "info") return null;

  let depth: number | null = null;
  let multipv = 1;
  let score: EngineScore | null = null;
  let bound: UciInfo["bound"] = null;
  let pv: string[] = [];

  for (let i = 1; i < tokens.length; i++) {
    const token = tokens[i];
    switch (token) {
      case "depth":
        depth = Number.parseInt(tokens[++i], 10);
        break;
      case "multipv":
        multipv = Number.parseInt(tokens[++i], 10);
        break;
      case "score": {
        const type = tokens[i + 1];
        const value = Number.parseInt(tokens[i + 2], 10);
        if ((type === "cp" || type === "mate") && Number.isFinite(value)) {
          score = { type, value };
        }
        i += 2;
        break;
      }
      case "lowerbound":
        bound = "lower";
        break;
      case "upperbound":
        bound = "upper";
        break;
      case "pv":
        // `pv` est toujours le dernier champ de la ligne.
        pv = tokens.slice(i + 1).filter(isUciMove);
        i = tokens.length;
        break;
      case "string":
        // `info string …` : message libre, aucune donnée d'analyse.
        return null;
    }
  }

  if (depth === null || !Number.isFinite(depth) || score === null) return null;
  return { depth, multipv: Number.isFinite(multipv) ? multipv : 1, score, bound, pv };
}

/** Analyse une ligne `bestmove <coup> [ponder <coup>]`. */
export function parseBestMove(line: string): UciBestMove | null {
  const tokens = line.trim().split(/\s+/);
  if (tokens[0] !== "bestmove" || tokens.length < 2) return null;
  const bestMove = isUciMove(tokens[1]) ? tokens[1] : null;
  const ponderIndex = tokens.indexOf("ponder");
  const ponder = ponderIndex > 0 && isUciMove(tokens[ponderIndex + 1] ?? "") ? tokens[ponderIndex + 1] : null;
  return { bestMove, ponder };
}

/** Convertit un score « camp au trait » en score « point de vue des Blancs ». */
export function toWhitePov(score: EngineScore, turn: Side): EngineScore {
  if (turn === "white") return score;
  // `mate 0` reste 0 (pas de -0) : `whiteShare` et `formatScore` le traitent à part.
  return { type: score.type, value: score.value === 0 ? 0 : -score.value };
}

/** Coup UCI → flèche `[départ, arrivée]` pour l'échiquier. */
export function uciToSquares(move: string): [string, string] | null {
  if (!isUciMove(move)) return null;
  return [move.slice(0, 2), move.slice(2, 4)];
}

/**
 * Part de la barre occupée par les Blancs (0 → 1), à partir d'un score côté Blancs.
 * Courbe logistique proche de celle de Lichess : ±400 cp ≈ 82 % / 18 %.
 *
 * `turn` ne sert que pour `mate 0` : le camp au trait est maté, la barre bascule
 * entièrement du côté adverse.
 */
export function whiteShare(score: EngineScore, turn: Side): number {
  if (score.type === "mate") {
    if (score.value === 0) return turn === "white" ? 0 : 1;
    return score.value > 0 ? 1 : 0;
  }
  const share = 1 / (1 + Math.exp(-0.00368208 * score.value));
  return Math.min(1, Math.max(0, share));
}

/**
 * Texte court de l'évaluation, côté Blancs : `+0.3`, `-1.2`, `M3`, `-M2`, `#`.
 */
export function formatScore(score: EngineScore): string {
  if (score.type === "mate") {
    if (score.value === 0) return "#";
    return score.value > 0 ? `M${score.value}` : `-M${-score.value}`;
  }
  const pawns = score.value / 100;
  const text = Math.abs(pawns).toFixed(1);
  if (text === "0.0") return "0.0";
  return pawns > 0 ? `+${text}` : `-${text}`;
}
