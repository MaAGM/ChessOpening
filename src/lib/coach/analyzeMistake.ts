import { Chess } from "chess.js";
import { collectBookAnnotations, type AnnotatedSource } from "./bookMoves";
import { buildCoachContext } from "./context";
import { buildCoachPrompt } from "./prompt";
import type { CoachContext, CoachEngineData, CoachEngineInput, CoachPrompt } from "./types";

/**
 * Moteur utilisé par le coach : sous-ensemble de `EngineClient` (une recherche à la fois,
 * `null` si la recherche est abandonnée ou si le moteur est indisponible).
 */
export type CoachEngine = {
  analyze(fen: string, options?: { depth?: number }): Promise<CoachEngineInput | null>;
};

/** Erreur de révision à expliquer : position, coup joué et sources du répertoire. */
export type CoachMistake = {
  fenBefore: string;
  playedSan: string;
  openingName?: string | null;
  sources: readonly AnnotatedSource[];
};

export type CoachAnalysis = { context: CoachContext; prompt: CoachPrompt };

export type AnalyzeMistakeOptions = {
  /** Profondeur des analyses (plus faible que l'affichage : 3 à 5 positions à analyser). */
  depth?: number;
  /** Nombre maximal de coups du répertoire analysés (lignes principales d'abord). */
  maxBookMoves?: number;
  /** Abandon : aucune nouvelle recherche n'est lancée et le résultat vaut `null`. */
  signal?: AbortSignal;
};

export const COACH_ENGINE_DEPTH = 12;
export const COACH_MAX_BOOK_MOVES = 3;

function fenAfterSan(fen: string, san: string): string | null {
  try {
    const game = new Chess(fen);
    game.move(san);
    return game.fen();
  } catch {
    return null;
  }
}

/**
 * Analyse locale d'un coup hors répertoire, puis contexte et prompt du coach.
 *
 * Les recherches sont lancées l'une après l'autre (le moteur n'en mène qu'une à la fois) :
 * position avant le coup, après le coup joué, puis après chaque coup attendu. Une analyse
 * manquante (moteur indisponible) n'empêche pas le diagnostic : il devient « non évalué ».
 *
 * Renvoie `null` si l'analyse est abandonnée ou si la position / le coup sont invalides.
 */
export async function analyzeMistake(
  mistake: CoachMistake,
  engine: CoachEngine | null,
  options: AnalyzeMistakeOptions = {},
): Promise<CoachAnalysis | null> {
  const depth = options.depth ?? COACH_ENGINE_DEPTH;
  const maxBookMoves = options.maxBookMoves ?? COACH_MAX_BOOK_MOVES;
  const { signal } = options;

  const fenPlayed = fenAfterSan(mistake.fenBefore, mistake.playedSan);
  if (!fenPlayed) return null;

  const { bookMoves, positionNotes } = collectBookAnnotations(mistake.sources, mistake.fenBefore);

  const run = async (fen: string): Promise<CoachEngineInput | null> => {
    if (!engine || signal?.aborted) return null;
    try {
      const result = await engine.analyze(fen, { depth });
      return result ? { score: result.score, depth: result.depth, pv: result.pv } : null;
    } catch {
      return null;
    }
  };

  const engineData: CoachEngineData = {};
  engineData.before = await run(mistake.fenBefore);
  engineData.played = await run(fenPlayed);

  const expected: Record<string, CoachEngineInput | null> = {};
  const expectedSans = [...new Set(bookMoves.map((move) => move.san))].slice(0, maxBookMoves);
  for (const san of expectedSans) {
    const fen = fenAfterSan(mistake.fenBefore, san);
    if (fen) expected[san] = await run(fen);
  }
  engineData.expected = expected;

  if (signal?.aborted) return null;

  const context = buildCoachContext({
    fenBefore: mistake.fenBefore,
    playedSan: mistake.playedSan,
    openingName: mistake.openingName,
    bookMoves,
    positionNotes,
    engine: engineData,
  });
  if (!context) return null;
  return { context, prompt: buildCoachPrompt(context) };
}
