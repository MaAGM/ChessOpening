// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AnnotatedSource, CoachEngine } from "@/lib/coach";
import { cp, fenAfter } from "@/lib/coach/testFixtures";
import type { CoachExplainer, CoachExplainResult } from "@/lib/convex/coachRemote";
import { useCoach, type IdentifiedMistake } from "./useCoach";

afterEach(cleanup);

const source: AnnotatedSource = {
  kind: "tutorial",
  id: "ch-1",
  name: "Italienne",
  root: { children: { e4: { children: { e5: { children: { Nf3: { children: { Nc6: { children: { Bc4: { children: { Bc5: {} } } } } } } } } } } } },
};

const FEN = fenAfter(["e4", "e5", "Nf3", "Nc6", "Bc4"]);
const mistake = (id: number, playedSan = "Qg5"): IdentifiedMistake => ({
  id,
  fenBefore: FEN,
  playedSan,
  sources: [source],
});

const engine: CoachEngine = { analyze: async () => cp(0) };

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}

function renderCoach(initial: IdentifiedMistake | null, explainer: CoachExplainer | null) {
  return renderHook(
    ({ m, e }: { m: IdentifiedMistake | null; e: CoachExplainer | null }) =>
      useCoach({ mistake: m, openingName: "Italian Game", getEngine: () => engine, explainer: e }),
    { initialProps: { m: initial, e: explainer } },
  );
}

describe("useCoach", () => {
  it("reste inactif sans erreur", () => {
    const { result } = renderCoach(null, null);
    expect(result.current.state).toEqual({ status: "idle" });
    expect(result.current.canExplain).toBe(false);
  });

  it("analyse localement chaque nouvelle erreur, sans appeler le serveur", async () => {
    const explainer = vi.fn<CoachExplainer>();
    const { result } = renderCoach(mistake(1), explainer);
    expect(result.current.state.status).toBe("analyzing");

    await waitFor(() => expect(result.current.state.status).toBe("ready"));
    if (result.current.state.status !== "ready") throw new Error();
    expect(result.current.state.analysis.context.playedSan).toBe("Qg5");
    expect(result.current.state.analysis.prompt.user).toContain("Italian Game");
    expect(result.current.canExplain).toBe(true);
    expect(explainer).not.toHaveBeenCalled();
  });

  it("demande l'explication à la demande et l'affiche", async () => {
    const reply = deferred<CoachExplainResult>();
    const explainer = vi.fn<CoachExplainer>(() => reply.promise);
    const { result } = renderCoach(mistake(1), explainer);
    await waitFor(() => expect(result.current.state.status).toBe("ready"));

    let pending!: Promise<void>;
    act(() => {
      pending = result.current.explain();
    });
    expect(result.current.state.status).toBe("thinking");
    expect(explainer).toHaveBeenCalledWith(expect.stringContaining("# Écart au répertoire"));

    await act(async () => {
      reply.resolve({ status: "ok", text: "Explication.", cached: false });
      await pending;
    });
    expect(result.current.state).toMatchObject({ status: "explained", text: "Explication." });
    expect(result.current.canExplain).toBe(false);
  });

  it("signale un quota atteint et permet de réessayer", async () => {
    const explainer = vi.fn<CoachExplainer>(async () => ({ status: "quota", retryAfterMs: 120_000 }));
    const { result } = renderCoach(mistake(1), explainer);
    await waitFor(() => expect(result.current.state.status).toBe("ready"));
    await act(() => result.current.explain());
    expect(result.current.state).toMatchObject({ status: "quota", retryAfterMs: 120_000 });
    expect(result.current.canExplain).toBe(true);
  });

  it("transforme une panne réseau en message d'erreur", async () => {
    const explainer = vi.fn<CoachExplainer>(async () => Promise.reject(new Error("offline")));
    const { result } = renderCoach(mistake(1), explainer);
    await waitFor(() => expect(result.current.state.status).toBe("ready"));
    await act(() => result.current.explain());
    expect(result.current.state).toMatchObject({ status: "error" });
  });

  it("un invité garde le verdict local mais ne peut pas demander d'explication", async () => {
    const { result } = renderCoach(mistake(1), null);
    await waitFor(() => expect(result.current.state.status).toBe("ready"));
    expect(result.current.canExplain).toBe(false);
  });

  it("ignore une explication arrivée après une nouvelle erreur", async () => {
    const reply = deferred<CoachExplainResult>();
    const explainer = vi.fn<CoachExplainer>(() => reply.promise);
    const { result, rerender } = renderCoach(mistake(1), explainer);
    await waitFor(() => expect(result.current.state.status).toBe("ready"));

    let pending!: Promise<void>;
    act(() => {
      pending = result.current.explain();
    });
    rerender({ m: mistake(2, "Nf6"), e: explainer });
    await act(async () => {
      reply.resolve({ status: "ok", text: "Ancienne explication.", cached: false });
      await pending;
    });

    await waitFor(() => expect(result.current.state.status).toBe("ready"));
    if (result.current.state.status !== "ready") throw new Error();
    expect(result.current.state.analysis.context.playedSan).toBe("Nf6");
  });

  it("revient à l'état inactif quand l'erreur est effacée (nouvelle ligne)", async () => {
    const { result, rerender } = renderCoach(mistake(1), null);
    await waitFor(() => expect(result.current.state.status).toBe("ready"));
    rerender({ m: null, e: null });
    expect(result.current.state).toEqual({ status: "idle" });
  });
});
