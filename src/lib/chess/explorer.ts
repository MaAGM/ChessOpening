export interface LichessExplorerPlayer {
  name: string | null;
  rating: number | null;
}

export interface LichessExplorerGame {
  id: string;
  winner: "white" | "black" | null;
  white: LichessExplorerPlayer;
  black: LichessExplorerPlayer;
  year: number;
  month: string | number;
}

export interface LichessExplorerOpening {
  eco: string;
  name: string;
}

export interface LichessMasterMove {
  uci: string;
  san: string;
  averageRating: number;
  white: number;
  draws: number;
  black: number;
  game?: LichessExplorerGame;
  opening?: LichessExplorerOpening;
}

export interface LichessMastersResponse {
  white: number;
  draws: number;
  black: number;
  moves: LichessMasterMove[];
  topGames: LichessExplorerGame[];
  recentGames: LichessExplorerGame[];
  opening?: LichessExplorerOpening;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isMove(value: unknown): value is LichessMasterMove {
  if (!isRecord(value)) return false;
  return (
    typeof value.uci === "string" &&
    typeof value.san === "string" &&
    typeof value.averageRating === "number" &&
    typeof value.white === "number" &&
    typeof value.draws === "number" &&
    typeof value.black === "number"
  );
}

function isMastersResponse(value: unknown): value is LichessMastersResponse {
  if (!isRecord(value)) return false;

  return (
    typeof value.white === "number" &&
    typeof value.draws === "number" &&
    typeof value.black === "number" &&
    Array.isArray(value.moves) &&
    value.moves.every(isMove) &&
    Array.isArray(value.topGames) &&
    Array.isArray(value.recentGames)
  );
}

export async function fetchMasterMoves(fen: string): Promise<LichessMastersResponse> {
  const trimmedFen = fen.trim();
  if (!trimmedFen) {
    throw new Error("FEN is required.");
  }

  // 1. Le "s" est de retour (l'URL officielle pointe bien vers /masters)
  // 2. encodeURIComponent transforme les espaces du FEN en "%20" 
  const url = `https://explorer.lichess.ovh/masters?fen=${encodeURIComponent(trimmedFen)}`;

  let response: Response;

  try {
    response = await fetch(url, {
      method: "GET",
      headers: { 
        "Accept": "application/json",
        // C'est ici qu'on injecte le token stocké dans ton fichier .env.local
        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_LICHESS_TOKEN}`
      },
      cache: "no-store",
    });
  } catch (error) {
    console.error("Fetch error:", error);
    throw new Error("Network error while contacting Lichess Explorer.");
  }

  if (response.status === 429) {
    throw new Error("Lichess rate limit reached. Please retry shortly.");
  }

  if (!response.ok) {
    throw new Error(`Lichess Explorer request failed (${response.status}).`);
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error("Failed to parse Lichess Explorer response.");
  }

  return data as LichessMastersResponse;
}