import type { LichessMastersResponse } from "./explorer";

/** Répartition des résultats en pourcentages (0-100, somme ≈ 100). */
export type ResultShares = { white: number; draws: number; black: number };

export type ExplorerMoveRow = ResultShares & {
  uci: string;
  san: string;
  games: number;
  /** Part des parties de la position qui ont joué ce coup (0-100). */
  popularity: number;
  averageRating: number;
};

export type ExplorerSummary = ResultShares & {
  totalGames: number;
  openingName: string | null;
  eco: string | null;
  moves: ExplorerMoveRow[];
};

export function resultShares(white: number, draws: number, black: number): ResultShares {
  const total = white + draws + black;
  if (total <= 0) return { white: 0, draws: 0, black: 0 };
  return { white: (white / total) * 100, draws: (draws / total) * 100, black: (black / total) * 100 };
}

/** Résume la réponse de la base Masters : totaux, pourcentages, coups triés par popularité. */
export function summarizeExplorer(response: LichessMastersResponse, maxMoves = 12): ExplorerSummary {
  const totalGames = response.white + response.draws + response.black;
  const moves = response.moves
    .map((move): ExplorerMoveRow => {
      const games = move.white + move.draws + move.black;
      return {
        uci: move.uci,
        san: move.san,
        games,
        popularity: totalGames > 0 ? (games / totalGames) * 100 : 0,
        averageRating: move.averageRating,
        ...resultShares(move.white, move.draws, move.black),
      };
    })
    .sort((a, b) => b.games - a.games)
    .slice(0, maxMoves);

  return {
    totalGames,
    openingName: response.opening?.name ?? null,
    eco: response.opening?.eco ?? null,
    moves,
    ...resultShares(response.white, response.draws, response.black),
  };
}

/** `1234567` → `1,2 M` ; `12345` → `12,3 k` ; `999` → `999`. */
export function formatGameCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(".", ",")} M`;
  if (count >= 10_000) return `${Math.round(count / 1000)} k`;
  if (count >= 1_000) return `${(count / 1000).toFixed(1).replace(".", ",")} k`;
  return String(count);
}
