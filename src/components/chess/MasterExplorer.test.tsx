// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { MasterExplorerState } from "@/hooks/useMasterExplorer";

import { MasterExplorer } from "./MasterExplorer";

const ready: MasterExplorerState = {
  status: "ready",
  summary: {
    totalGames: 1200,
    openingName: "Sicilienne",
    eco: "B20",
    white: 40,
    draws: 35,
    black: 25,
    moves: [
      { uci: "e1h1", san: "O-O", games: 900, popularity: 75, averageRating: 2450.4, white: 40, draws: 40, black: 20 },
      { uci: "d2d4", san: "d4", games: 300, popularity: 25, averageRating: 2390, white: 30, draws: 30, black: 40 },
    ],
  },
};

afterEach(cleanup);

describe("MasterExplorer", () => {
  it("affiche les états de chargement, d'erreur et de position vide", () => {
    const { rerender } = render(<MasterExplorer state={{ status: "loading", summary: null }} />);
    expect(screen.getByText("Chargement…")).toBeTruthy();

    rerender(<MasterExplorer state={{ status: "error", summary: null, message: "Indisponible" }} />);
    expect(screen.getByText("Indisponible")).toBeTruthy();

    rerender(<MasterExplorer state={{ status: "ready", summary: { ...ready.summary!, totalGames: 0, moves: [] } }} />);
    expect(screen.getByText("Aucune partie de maître depuis cette position.")).toBeTruthy();
  });

  it("transmet le SAN (et non l'UCI roi-vers-tour) au survol et au clic", () => {
    const onPreviewMove = vi.fn();
    const onPlayMove = vi.fn();
    render(<MasterExplorer state={ready} onPreviewMove={onPreviewMove} onPlayMove={onPlayMove} />);

    expect(screen.getByText("1,2 k parties")).toBeTruthy();
    expect(screen.getByText("2450")).toBeTruthy();

    const castle = screen.getByRole("button", { name: "O-O" });
    fireEvent.mouseEnter(castle.closest("tr")!);
    expect(onPreviewMove).toHaveBeenLastCalledWith("O-O");

    fireEvent.click(castle);
    expect(onPlayMove).toHaveBeenCalledTimes(1);
    expect(onPlayMove).toHaveBeenCalledWith("O-O");

    fireEvent.mouseLeave(castle.closest("tbody")!);
    expect(onPreviewMove).toHaveBeenLastCalledWith(null);
  });
});
