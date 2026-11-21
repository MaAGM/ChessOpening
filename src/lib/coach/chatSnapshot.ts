import { Chess } from "chess.js";

import type { ExplorerSummary } from "@/lib/chess/explorerStats";
import { analysisKey, type EngineAnalysis } from "@/lib/engine";

import {
  COACH_CHAT_MAX_COMMENT_LENGTH,
  COACH_CHAT_MAX_ENGINE_LINE,
  COACH_CHAT_MAX_EXPECTED_MOVES,
  COACH_CHAT_MAX_EXPLORER_MOVES,
  COACH_CHAT_MAX_HISTORY,
  COACH_CHAT_MAX_LESSON_TITLE_LENGTH,
  COACH_CHAT_MAX_MOVES,
  COACH_CHAT_MAX_OBJECTIVE_LENGTH,
  COACH_CHAT_MAX_OBJECTIVES,
  COACH_CHAT_MAX_OPENING_LENGTH,
  isStudentToMove,
  type CoachChatMessage,
  type CoachLessonContext,
  type CoachPositionSnapshot,
  type CoachSide,
} from "./chatProtocol";

/** Nombre de coups de la base des maîtres transmis au Coach. */
export const COACH_SNAPSHOT_EXPLORER_MOVES = 5;
/** Longueur de la ligne principale Stockfish transmise au Coach (demi-coups). */
export const COACH_SNAPSHOT_ENGINE_PLIES = 8;

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

export type SnapshotInput = {
  fen: string;
  moves: readonly string[];
  openingName: string | null;
  /** Analyse Stockfish affichée ; ignorée si elle porte sur une autre position. */
  analysis: EngineAnalysis | null;
  explorer: ExplorerSummary | null;
  /** Camp affiché en bas de l'échiquier (camp étudié par le joueur). */
  boardOrientation: CoachSide;
  /** Cours suivi (mode Apprentissage) ; absent ou null en Exploration. */
  lesson?: CoachLessonContext | null;
};

/** Ramène le contexte de cours dans les limites acceptées par le serveur. */
export function clampLessonContext(lesson: CoachLessonContext): CoachLessonContext {
  const title = (text: string) => text.slice(0, COACH_CHAT_MAX_LESSON_TITLE_LENGTH);
  const comment = lesson.comment?.trim();
  return {
    courseName: title(lesson.courseName),
    chapterTitle: title(lesson.chapterTitle),
    lessonTitle: title(lesson.lessonTitle),
    objectives: lesson.objectives
      .slice(0, COACH_CHAT_MAX_OBJECTIVES)
      .map((objective) => objective.slice(0, COACH_CHAT_MAX_OBJECTIVE_LENGTH)),
    comment: comment ? comment.slice(0, COACH_CHAT_MAX_COMMENT_LENGTH) : null,
    expectedMoves: lesson.expectedMoves.slice(0, COACH_CHAT_MAX_EXPECTED_MOVES),
  };
}

/** Ce que le joueur voit à l'écran, dans le format validé par `coach.chat`. */
export function buildPositionSnapshot({
  fen,
  moves,
  openingName,
  analysis,
  explorer,
  boardOrientation,
  lesson,
}: SnapshotInput): CoachPositionSnapshot {
  const engine =
    analysis && analysis.score && analysis.key === analysisKey(fen)
      ? {
          score: { type: analysis.score.type, value: Math.round(analysis.score.value) },
          depth: analysis.depth,
          line: uciLineToSan(fen, analysis.pv).slice(0, Math.min(COACH_SNAPSHOT_ENGINE_PLIES, COACH_CHAT_MAX_ENGINE_LINE)),
        }
      : null;

  return {
    fen,
    moves: moves.slice(-COACH_CHAT_MAX_MOVES),
    openingName: openingName ? openingName.slice(0, COACH_CHAT_MAX_OPENING_LENGTH) : null,
    engine,
    explorer: explorer
      ? {
          totalGames: explorer.totalGames,
          moves: explorer.moves
            .slice(0, Math.min(COACH_SNAPSHOT_EXPLORER_MOVES, COACH_CHAT_MAX_EXPLORER_MOVES))
            .map((move) => ({
              san: move.san,
              games: move.games,
              white: Math.round(move.white * 10) / 10,
              draws: Math.round(move.draws * 10) / 10,
              black: Math.round(move.black * 10) / 10,
              averageRating: Math.round(move.averageRating),
            })),
        }
      : null,
    boardOrientation,
    ...(lesson ? { lesson: clampLessonContext(lesson) } : {}),
  };
}

/**
 * Historique envoyé au serveur : les `max` derniers messages, en commençant toujours
 * par une question (une réponse orpheline en tête est retirée).
 */
export function trimHistory(messages: readonly CoachChatMessage[], max = COACH_CHAT_MAX_HISTORY): CoachChatMessage[] {
  const recent = messages.slice(-max);
  const start = recent.findIndex((message) => message.role === "user");
  return start === -1 ? [] : recent.slice(start);
}

/** Questions proposées pendant un cours (jamais plus de 3). */
export function learningSuggestions(
  snapshot: Pick<CoachPositionSnapshot, "fen" | "moves" | "boardOrientation" | "lesson">,
): string[] {
  const suggestions: string[] = [];
  if (snapshot.moves.length > 0) suggestions.push("Pourquoi ce coup ?");
  suggestions.push("Quel est le plan ici ?");
  if (isStudentToMove(snapshot) && (snapshot.lesson?.expectedMoves.length ?? 0) > 0) {
    suggestions.push("Donne-moi un indice");
  }
  return suggestions.slice(0, 3);
}

/** Questions proposées selon la position (jamais plus de 3). */
export function suggestedQuestions(
  snapshot: Pick<CoachPositionSnapshot, "moves" | "explorer"> &
    Partial<Pick<CoachPositionSnapshot, "fen" | "boardOrientation" | "lesson">>,
): string[] {
  if (snapshot.lesson && snapshot.fen) return learningSuggestions({ ...snapshot, fen: snapshot.fen });
  const suggestions: string[] = [];
  const top = snapshot.explorer?.moves[0];
  if (top) suggestions.push(`Pourquoi les maîtres jouent ${top.san} ?`);
  suggestions.push(snapshot.moves.length === 0 ? "Par quoi commencer ?" : "Quel est le plan ici ?");
  const second = snapshot.explorer?.moves[1];
  if (top && second) suggestions.push(`${top.san} ou ${second.san} ?`);
  else suggestions.push("Quels sont les pièges à connaître ?");
  return suggestions.slice(0, 3);
}
