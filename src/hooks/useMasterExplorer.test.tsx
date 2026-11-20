// @vitest-environment jsdom
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { LichessMastersResponse } from "@/lib/chess/explorer";

const fetchMasterMoves = vi.hoisted(() => vi.fn<(fen: string) => Promise<LichessMastersResponse>>());
vi.mock("@/lib/chess/explorer", () => ({ fetchMasterMoves }));

import { clearMasterExplorerCache, useMasterExplorer } from "./useMasterExplorer";

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

function response(): LichessMastersResponse {
  return {
    white: 40,
    draws: 35,
    black: 25,
    moves: [
      { uci: "d2d4", san: "d4", averageRating: 2400, white: 10, draws: 10, black: 5 },
      { uci: "e2e4", san: "e4", averageRating: 2410, white: 30, draws: 25, black: 20 },
    ],
    topGames: [],
    recentGames: [],
    opening: { eco: "A00", name: "Position initiale" },
  };
}

beforeEach(() => {
  clearMasterExplorerCache();
  fetchMasterMoves.mockReset();
});
afterEach(cleanup);

describe("useMasterExplorer", () => {
  it("ne contacte pas Lichess quand le mode Exploration est inactif", () => {
    const { result } = renderHook(() => useMasterExplorer(START, false));
    expect(result.current.status).toBe("loading");
    expect(fetchMasterMoves).not.toHaveBeenCalled();
  });

  it("résume la réponse puis la sert depuis le cache", async () => {
    fetchMasterMoves.mockResolvedValue(response());
    const first = renderHook(() => useMasterExplorer(START, true));
    expect(first.result.current.status).toBe("loading");
    await waitFor(() => expect(first.result.current.status).toBe("ready"));
    const summary = first.result.current.summary!;
    expect(summary.totalGames).toBe(100);
    expect(summary.moves.map((move) => move.san)).toEqual(["e4", "d4"]);

    const second = renderHook(() => useMasterExplorer(START, true));
    expect(second.result.current.status).toBe("ready");
    expect(fetchMasterMoves).toHaveBeenCalledTimes(1);
  });

  it("traduit une limite de débit Lichess en message lisible", async () => {
    fetchMasterMoves.mockRejectedValue(new Error("HTTP 429"));
    const { result } = renderHook(() => useMasterExplorer(START, true));
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current).toMatchObject({ message: "Lichess limite les requêtes. Réessaie dans un instant." });
  });

  it("affiche un message générique pour les autres erreurs", async () => {
    fetchMasterMoves.mockRejectedValue(new Error("réseau"));
    const { result } = renderHook(() => useMasterExplorer(START, true));
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current).toMatchObject({ message: "Base des maîtres indisponible pour le moment." });
  });
});
