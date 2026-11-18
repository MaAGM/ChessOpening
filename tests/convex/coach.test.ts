// @vitest-environment edge-runtime
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../../convex/_generated/api";
import { COACH_BURST_LIMIT, COACH_DAILY_LIMIT } from "../../convex/coach";
import { COACH_SYSTEM_PROMPT } from "../../src/lib/coach/systemPrompt";
import { setup } from "./test.setup";

// L'API Claude n'est jamais appelée : le module d'appel au LLM est simulé.
const callCoachModel = vi.hoisted(() => vi.fn());
vi.mock("../../convex/lib/llm", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../convex/lib/llm")>()),
  callCoachModel,
}));

const completion = (text = "Ton coup perd la dame.") => ({
  text,
  model: "claude-haiku-5-5",
  inputTokens: 1200,
  outputTokens: 180,
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-18T10:00:00Z"));
  process.env.ANTHROPIC_API_KEY = "test-key";
  delete process.env.COACH_MODEL;
  callCoachModel.mockReset();
  callCoachModel.mockResolvedValue(completion());
});

afterEach(() => {
  vi.useRealTimers();
  delete process.env.ANTHROPIC_API_KEY;
});

async function usageRows(t: ReturnType<typeof setup>["t"]) {
  return t.run((ctx) => ctx.db.query("coachUsage").take(10));
}

describe("coach.explain", () => {
  it("refuse un appel sans utilisateur", async () => {
    const { t } = setup();
    await expect(t.action(api.coach.explain, { prompt: "x" })).rejects.toThrow(/Non authentifié/);
    expect(callCoachModel).not.toHaveBeenCalled();
  });

  it("refuse un prompt vide ou trop long", async () => {
    const { alice } = setup();
    await expect(alice.action(api.coach.explain, { prompt: "   " })).rejects.toThrow(/longueur/);
    await expect(alice.action(api.coach.explain, { prompt: "x".repeat(12_001) })).rejects.toThrow(/longueur/);
  });

  it("appelle le LLM avec les consignes du serveur et la clé de l'environnement", async () => {
    const { t, alice } = setup();
    const result = await alice.action(api.coach.explain, { prompt: "  # Écart au répertoire  " });

    expect(result).toEqual({ status: "ok", text: "Ton coup perd la dame.", cached: false });
    expect(callCoachModel).toHaveBeenCalledWith({
      apiKey: "test-key",
      model: "claude-haiku-5-5",
      system: COACH_SYSTEM_PROMPT,
      user: "# Écart au répertoire",
    });
    expect(await usageRows(t)).toMatchObject([
      { day: "2026-11-18", requests: 1, cachedHits: 0, inputTokens: 1200, outputTokens: 180 },
    ]);
  });

  it("respecte COACH_MODEL", async () => {
    process.env.COACH_MODEL = "claude-sonnet-5-5";
    const { alice } = setup();
    await alice.action(api.coach.explain, { prompt: "p" });
    expect(callCoachModel).toHaveBeenCalledWith(expect.objectContaining({ model: "claude-sonnet-5-5" }));
  });

  it("sert une explication déjà produite depuis le cache, sans quota ni appel au LLM", async () => {
    const { t, alice, bob } = setup();
    await alice.action(api.coach.explain, { prompt: "même prompt" });
    const again = await bob.action(api.coach.explain, { prompt: "même prompt" });

    expect(again).toEqual({ status: "ok", text: "Ton coup perd la dame.", cached: true });
    expect(callCoachModel).toHaveBeenCalledTimes(1);
    const rows = await usageRows(t);
    expect(rows.find((r) => r.userId.endsWith("user-bob"))).toMatchObject({ requests: 0, cachedHits: 1 });
  });

  it("applique l'anti-rafale par minute, par utilisateur", async () => {
    const { alice, bob } = setup();
    for (let i = 0; i < COACH_BURST_LIMIT; i++) {
      expect((await alice.action(api.coach.explain, { prompt: `p${i}` })).status).toBe("ok");
    }
    const blocked = await alice.action(api.coach.explain, { prompt: "encore" });
    expect(blocked.status).toBe("quota");
    if (blocked.status === "quota") expect(blocked.retryAfterMs).toBeGreaterThan(0);

    // Les quotas sont propres à chaque utilisateur
    expect((await bob.action(api.coach.explain, { prompt: "encore" })).status).toBe("ok");

    // Une minute plus tard, l'anti-rafale s'est rechargé
    vi.advanceTimersByTime(60_000);
    expect((await alice.action(api.coach.explain, { prompt: "encore" })).status).toBe("ok");
  });

  it(`plafonne à ${COACH_DAILY_LIMIT} explications par 24 h`, async () => {
    const { alice } = setup();
    for (let i = 0; i < COACH_DAILY_LIMIT; i++) {
      if (i > 0 && i % COACH_BURST_LIMIT === 0) vi.advanceTimersByTime(60_000);
      expect((await alice.action(api.coach.explain, { prompt: `p${i}` })).status).toBe("ok");
    }
    vi.advanceTimersByTime(60_000);
    const blocked = await alice.action(api.coach.explain, { prompt: "de trop" });
    expect(blocked.status).toBe("quota");
    // Le prochain jeton quotidien revient au bout de 24 h / 30 = 48 min environ, pas dans une minute.
    if (blocked.status === "quota") expect(blocked.retryAfterMs).toBeGreaterThan(60_000);
  });

  it("rend le quota si le LLM échoue et renvoie un message affichable", async () => {
    const { alice } = setup();
    callCoachModel.mockRejectedValue(new Error("529 overloaded"));
    vi.spyOn(console, "error").mockImplementation(() => {});

    for (let i = 0; i < COACH_BURST_LIMIT + 2; i++) {
      const result = await alice.action(api.coach.explain, { prompt: `p${i}` });
      expect(result).toEqual({
        status: "unavailable",
        message: "Le Coach est momentanément indisponible. Réessaie dans un instant.",
      });
    }
    // Les échecs n'ont rien consommé : l'appel suivant passe
    callCoachModel.mockResolvedValue(completion());
    expect((await alice.action(api.coach.explain, { prompt: "ok" })).status).toBe("ok");
  });

  it("signale un serveur sans clé d'API sans appeler le LLM", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const { alice } = setup();
    expect(await alice.action(api.coach.explain, { prompt: "p" })).toEqual({
      status: "unavailable",
      message: "Le Coach IA n'est pas configuré sur le serveur.",
    });
    expect(callCoachModel).not.toHaveBeenCalled();
  });
});
