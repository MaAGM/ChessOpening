// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Coach, CoachState } from "@/hooks/useCoach";
import { buildCoachContext, buildCoachPrompt, type CoachAnalysis } from "@/lib/coach";
import { queenBlunder } from "@/lib/coach/testFixtures";
import { CoachPanel, type CoachAccess } from "./CoachPanel";

afterEach(cleanup);

function analysis(): CoachAnalysis {
  const context = buildCoachContext(queenBlunder());
  if (!context) throw new Error("contexte invalide");
  return { context, prompt: buildCoachPrompt(context) };
}

function renderPanel(state: CoachState, access: CoachAccess = "authenticated", canExplain = false) {
  const coach: Coach = { state, canExplain, explain: vi.fn(async () => {}) };
  const onSignIn = vi.fn();
  render(<CoachPanel coach={coach} access={access} onSignIn={onSignIn} />);
  return { coach, onSignIn };
}

describe("CoachPanel", () => {
  it("invite à jouer tant qu'il n'y a pas d'erreur", () => {
    renderPanel({ status: "idle" });
    expect(screen.getByText(/le Coach analysera ton coup/)).toBeTruthy();
  });

  it("affiche l'analyse en cours", () => {
    renderPanel({ status: "analyzing" });
    expect(screen.getByText("Analyse de la position…")).toBeTruthy();
  });

  it("affiche le verdict local et le bouton Expliquer pour un utilisateur connecté", () => {
    const { coach } = renderPanel({ status: "ready", analysis: analysis() }, "authenticated", true);
    expect(screen.getByText("Gaffe tactique")).toBeTruthy();
    expect(screen.getByText("3… Qg5")).toBeTruthy();
    expect(screen.getByText("3… Bc5")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Expliquer" }));
    expect(coach.explain).toHaveBeenCalledTimes(1);
  });

  it("un invité voit le verdict et une invitation à se connecter, sans bouton Expliquer", () => {
    const { onSignIn } = renderPanel({ status: "ready", analysis: analysis() }, "guest");
    expect(screen.getByText("Gaffe tactique")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Expliquer" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Se connecter avec Google" }));
    expect(onSignIn).toHaveBeenCalledTimes(1);
  });

  it("affiche l'attente puis l'explication du Coach", () => {
    renderPanel({ status: "thinking", analysis: analysis() });
    expect(screen.getByText("Le Coach réfléchit…")).toBeTruthy();
    cleanup();

    renderPanel({ status: "explained", analysis: analysis(), text: "Ta dame est en prise.", cached: false });
    expect(screen.getByTestId("coach-explanation").textContent).toBe("Ta dame est en prise.");
    expect(screen.queryByRole("button", { name: "Expliquer" })).toBeNull();
  });

  it("signale le quota atteint avec le délai, et propose de réessayer", () => {
    renderPanel({ status: "quota", analysis: analysis(), retryAfterMs: 5 * 60_000 }, "authenticated", true);
    expect(screen.getByText(/limite d'explications\. Réessaie dans 5 minutes/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Réessayer" })).toBeTruthy();
  });

  it("affiche le message d'erreur du serveur", () => {
    renderPanel({ status: "error", analysis: analysis(), message: "Le Coach IA n'est pas configuré sur le serveur." });
    expect(screen.getByText("Le Coach IA n'est pas configuré sur le serveur.")).toBeTruthy();
  });
});
