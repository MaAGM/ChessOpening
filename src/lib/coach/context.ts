import { Chess } from "chess.js";
import { fenTurn } from "@/lib/review/positionKey";
import {
  DEFAULT_COACH_THRESHOLDS,
  materialDelta,
  severityOf,
  toPlayerScore,
  uciLineToSan,
  winChance,
} from "./evaluation";
import type {
  CoachAssessment,
  CoachContext,
  CoachEngineInput,
  CoachMistakeInput,
  CoachThresholds,
  CoachVerdict,
  MoveEvaluation,
  PlayerScore,
} from "./types";
import type { Side } from "@/lib/review/types";

/** Joue un coup SAN depuis une FEN ; null s'il est illégal. */
function playSan(fen: string, san: string): { san: string; fen: string } | null {
  try {
    const game = new Chess(fen);
    const move = game.move(san);
    return { san: move.san, fen: game.fen() };
  } catch {
    return null;
  }
}

/** Demi-coup (0 = premier coup blanc) d'après les champs trait et numéro de coup d'une FEN. */
function plyFromFen(fen: string): number {
  const fields = fen.trim().split(/\s+/);
  const fullMove = Number.parseInt(fields[5] ?? "1", 10);
  const base = (Number.isFinite(fullMove) && fullMove > 0 ? fullMove : 1) - 1;
  return base * 2 + (fields[1] === "b" ? 1 : 0);
}

/** Évaluation d'un coup déjà joué : `analysis` porte sur la position APRÈS le coup. */
function evaluateAfterMove(
  san: string,
  fenAfter: string,
  analysis: CoachEngineInput | null | undefined,
  playerSide: Side,
): MoveEvaluation | null {
  if (!analysis?.score) return null;
  const score = toPlayerScore(analysis.score, fenAfter, playerSide);
  return {
    san,
    score,
    winChance: winChance(score),
    depth: analysis.depth,
    line: uciLineToSan(fenAfter, analysis.pv),
  };
}

/** Meilleur coup du moteur : `analysis` porte sur la position AVANT le coup (PV[0] = le coup). */
function evaluateEngineBest(
  fenBefore: string,
  analysis: CoachEngineInput | null | undefined,
  playerSide: Side,
): MoveEvaluation | null {
  if (!analysis?.score) return null;
  const sans = uciLineToSan(fenBefore, analysis.pv);
  if (sans.length === 0) return null;
  const score = toPlayerScore(analysis.score, fenBefore, playerSide);
  return {
    san: sans[0],
    score,
    winChance: winChance(score),
    depth: analysis.depth,
    line: sans.slice(1),
  };
}

const isMateFor = (score: PlayerScore, winner: "player" | "opponent") =>
  score.kind === "mate" && score.winner === winner;

function verdictOf(
  severity: CoachAssessment["severity"],
  tactical: boolean,
): Exclude<CoachVerdict, "unevaluated"> {
  switch (severity) {
    case "blunder":
    case "mistake":
      return tactical ? "tactical_blunder" : "strategic_error";
    case "inaccuracy":
      return "inaccuracy";
    case "none":
      return "playable_deviation";
  }
}

function assess(
  fenBefore: string,
  played: MoveEvaluation | null,
  bookEvaluations: MoveEvaluation[],
  engineBest: MoveEvaluation | null,
  thresholds: CoachThresholds,
): CoachAssessment {
  // Étalon : meilleur coup du répertoire évalué (premier en cas d'égalité), sinon le moteur.
  const bestBook = bookEvaluations.reduce<MoveEvaluation | null>(
    (best, current) => (!best || current.winChance > best.winChance ? current : best),
    null,
  );
  const reference = bestBook
    ? { ...bestBook, origin: "book" as const }
    : engineBest
      ? { ...engineBest, origin: "engine" as const }
      : null;

  const empty = {
    played,
    reference,
    engineBest,
    lossCp: null,
    winChanceLoss: null,
    playedIsBetter: false,
  };

  if (!played) {
    return {
      ...empty,
      severity: "none",
      verdict: "unevaluated",
      motifs: { allowsMate: false, missesMate: false, materialLoss: null },
    };
  }

  const playedMaterial = materialDelta(
    fenBefore,
    [played.san, ...played.line],
    thresholds.materialPlies,
  );

  if (!reference) {
    // Sans étalon, seul un mat concédé permet de conclure.
    const allowsMate = isMateFor(played.score, "opponent");
    return {
      ...empty,
      severity: allowsMate ? "blunder" : "none",
      verdict: allowsMate ? "tactical_blunder" : "unevaluated",
      motifs: { allowsMate, missesMate: false, materialLoss: null },
    };
  }

  const allowsMate = isMateFor(played.score, "opponent") && !isMateFor(reference.score, "opponent");
  const missesMate = isMateFor(reference.score, "player") && !isMateFor(played.score, "player");

  const referenceMaterial = materialDelta(
    fenBefore,
    [reference.san, ...reference.line],
    thresholds.materialPlies,
  );
  const materialLoss =
    playedMaterial !== null && referenceMaterial !== null
      ? referenceMaterial - playedMaterial
      : null;

  const winChanceLoss = reference.winChance - played.winChance;
  const lossCp =
    reference.score.kind === "cp" && played.score.kind === "cp"
      ? reference.score.cp - played.score.cp
      : null;

  let severity = severityOf(winChanceLoss, thresholds);
  if (allowsMate) severity = "blunder";
  else if (missesMate && severity === "none") severity = "inaccuracy";

  const tactical =
    allowsMate ||
    missesMate ||
    (materialLoss !== null && materialLoss >= thresholds.tacticalMaterial);

  return {
    ...empty,
    lossCp,
    winChanceLoss,
    severity,
    verdict: verdictOf(severity, tactical),
    motifs: { allowsMate, missesMate, materialLoss },
    playedIsBetter: -winChanceLoss >= thresholds.inaccuracy,
  };
}

/**
 * Assemble le contexte pédagogique d'une erreur de révision (coup hors répertoire).
 * Fonction pure : aucune dépendance aux stores ni au moteur ; les analyses sont fournies.
 *
 * Renvoie `null` si la FEN est invalide ou si le coup joué est illégal.
 */
export function buildCoachContext(input: CoachMistakeInput): CoachContext | null {
  const thresholds: CoachThresholds = { ...DEFAULT_COACH_THRESHOLDS, ...input.thresholds };
  const playedMove = playSan(input.fenBefore, input.playedSan);
  if (!playedMove) return null;

  const playerSide = fenTurn(input.fenBefore);
  const engine = input.engine ?? {};

  const played = evaluateAfterMove(playedMove.san, playedMove.fen, engine.played, playerSide);

  const bookEvaluations: MoveEvaluation[] = [];
  const seen = new Set<string>();
  for (const book of input.bookMoves) {
    if (seen.has(book.san)) continue;
    seen.add(book.san);
    const after = playSan(input.fenBefore, book.san);
    if (!after) continue;
    const evaluation = evaluateAfterMove(after.san, after.fen, engine.expected?.[book.san], playerSide);
    if (evaluation) bookEvaluations.push(evaluation);
  }

  const engineBest = evaluateEngineBest(input.fenBefore, engine.before, playerSide);

  return {
    fenBefore: input.fenBefore,
    fenAfter: playedMove.fen,
    playerSide,
    ply: input.history ? input.history.length : plyFromFen(input.fenBefore),
    playedSan: playedMove.san,
    openingName: input.openingName?.trim() || null,
    history: input.history ? [...input.history] : [],
    bookMoves: [...input.bookMoves].sort((a, b) => Number(b.isMainLine) - Number(a.isMainLine)),
    positionNotes: input.positionNotes ? [...input.positionNotes] : [],
    assessment: assess(input.fenBefore, played, bookEvaluations, engineBest, thresholds),
  };
}
