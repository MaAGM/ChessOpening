// @vitest-environment edge-runtime
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api, internal } from "../../convex/_generated/api";
import {
  COACH_BURST_LIMIT,
  COACH_DAILY_INPUT_TOKEN_BUDGET,
  COACH_DAILY_LIMIT,
  COACH_GLOBAL_DAILY_LIMIT,
  rateLimiter,
} from "../../convex/coach";
import {
  COACH_CHAT_MAX_HISTORY,
  COACH_CHAT_MAX_MESSAGE_LENGTH,
  COACH_CHAT_SYSTEM_PROMPT,
  type CoachChatMessage,
  type CoachPositionSnapshot,
} from "../../src/lib/coach/chatProtocol";
import { setup } from "./test.setup";

// L'API Claude n'est jamais appelée : le module d'appel au LLM est simulé.
const callCoachModel = vi.hoisted(() => vi.fn());
vi.mock("../../convex/lib/llm", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../convex/lib/llm")>()),
  callCoachModel,
}));

const completion = (text = "Joue Nf3, tu développes et tu contrôles e5.") => ({
  text,
  model: "claude-haiku-5-5",
  inputTokens: 1200,
  outputTokens: 60,
});

const position: CoachPositionSnapshot = {
  fen: "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2",
  moves: ["e4", "c5"],
  openingName: "Sicilian Defense",
  engine: { score: { type: "cp", value: 30 }, depth: 16, line: ["Nf3", "d6"] },
  explorer: {
    totalGames: 1000,
    moves: [{ san: "Nf3", games: 700, white: 40, draws: 30, black: 30, averageRating: 2500 }],
  },
};

const ask = (content = "Que jouer ici ?"): CoachChatMessage[] => [{ role: "user", content }];

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-18T10:00:00Z"));
  process.env.ANTHROPIC_API_KEY = "test-key";
  delete process.env.COACH_MODEL;
  delete process.env.COACH_CHAT_ENABLED;
  callCoachModel.mockReset();
  callCoachModel.mockResolvedValue(completion());
});

afterEach(() => {
  vi.useRealTimers();
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.COACH_CHAT_ENABLED;
});

type T = ReturnType<typeof setup>["t"];

async function usageRows(t: T) {
  return t.run((ctx) => ctx.db.query("coachUsage").take(10));
}

describe("coach.chat — accès et validation", () => {
  it("refuse un appel sans utilisateur", async () => {
    const { t } = setup();
    await expect(t.action(api.coach.chat, { messages: ask(), position })).rejects.toThrow(/Non authentifié/);
    expect(callCoachModel).not.toHaveBeenCalled();
  });

  it("refuse une question vide ou trop longue", async () => {
    const { alice } = setup();
    await expect(alice.action(api.coach.chat, { messages: ask("   "), position })).rejects.toThrow(/longueur/);
    await expect(
      alice.action(api.coach.chat, { messages: ask("x".repeat(COACH_CHAT_MAX_MESSAGE_LENGTH + 1)), position }),
    ).rejects.toThrow(/longueur/);
  });

  it(`refuse un historique de plus de ${COACH_CHAT_MAX_HISTORY} messages`, async () => {
    const { alice } = setup();
    const messages: CoachChatMessage[] = [];
    for (let i = 0; i < COACH_CHAT_MAX_HISTORY + 1; i++) {
      messages.push({ role: i % 2 === 0 ? "user" : "assistant", content: `m${i}` });
    }
    await expect(alice.action(api.coach.chat, { messages, position })).rejects.toThrow(/historique/);
  });

  it("exige des rôles alternés, en commençant et en finissant par une question", async () => {
    const { alice } = setup();
    await expect(
      alice.action(api.coach.chat, { messages: [{ role: "assistant", content: "a" }, { role: "user", content: "q" }], position }),
    ).rejects.toThrow(/alterner/);
    await expect(
      alice.action(api.coach.chat, { messages: [{ role: "user", content: "q" }, { role: "assistant", content: "a" }], position }),
    ).rejects.toThrow(/dernier message/);
    await expect(
      alice.action(api.coach.chat, { messages: [{ role: "user", content: "q" }, { role: "user", content: "q2" }], position }),
    ).rejects.toThrow(/alterner/);
  });

  it("refuse une position mal formée", async () => {
    const { alice } = setup();
    await expect(
      alice.action(api.coach.chat, { messages: ask(), position: { ...position, fen: "n'importe quoi" } }),
    ).rejects.toThrow(/FEN/);
    await expect(
      alice.action(api.coach.chat, { messages: ask(), position: { ...position, moves: ["e4", "<script>"] } }),
    ).rejects.toThrow(/coup invalide/);
    const explorer = { totalGames: 1, moves: Array.from({ length: 7 }, () => position.explorer!.moves[0]) };
    await expect(alice.action(api.coach.chat, { messages: ask(), position: { ...position, explorer } })).rejects.toThrow(
      /explorateur/,
    );
    expect(callCoachModel).not.toHaveBeenCalled();
  });
});

describe("coach.chat — appel au LLM", () => {
  it("appelle le LLM avec les consignes du serveur et le contexte de la position", async () => {
    const { t, alice } = setup();
    const history: CoachChatMessage[] = [
      { role: "user", content: "Pourquoi c5 ?", moves: ["e4"] },
      { role: "assistant", content: "Pour prendre d4 de côté." },
      { role: "user", content: "  Et maintenant ?  " },
    ];
    const result = await alice.action(api.coach.chat, { messages: history, position });

    expect(result).toEqual({
      status: "ok",
      text: "Joue Nf3, tu développes et tu contrôles e5.",
      remaining: COACH_DAILY_LIMIT - 1,
    });
    expect(callCoachModel).toHaveBeenCalledTimes(1);
    const call = callCoachModel.mock.calls[0][0];
    expect(call).toMatchObject({ apiKey: "test-key", model: "claude-haiku-5-5", system: COACH_CHAT_SYSTEM_PROMPT });
    expect(call.messages).toHaveLength(3);
    expect(call.messages[0]).toEqual({ role: "user", content: "(Position après 1.e4) Pourquoi c5 ?" });
    expect(call.messages[2].content).toContain("FEN : " + position.fen);
    expect(call.messages[2].content).toContain("Coups joués : 1.e4 c5");
    expect(call.messages[2].content).toContain("Nf3 : 700 parties");
    expect(call.messages[2].content).toMatch(/\[Question\]\nEt maintenant \?$/);

    expect(await usageRows(t)).toMatchObject([{ day: "2026-11-18", requests: 1, inputTokens: 1200, outputTokens: 60 }]);
  });

  it("indique au Coach le camp vu par l'élève par rapport au camp qui a le trait", async () => {
    const { alice } = setup();
    await alice.action(api.coach.chat, { messages: ask(), position: { ...position, boardOrientation: "black" } });
    const context = callCoachModel.mock.calls[0][0].messages[0].content;
    expect(context).toContain("Trait aux Blancs : ce sont les Blancs qui jouent le prochain coup");
    expect(context).toContain("Dernier coup joué : 1...c5 (par les Noirs)");
    expect(context).toContain("Camp vu par l'élève : les Noirs (en bas de l'échiquier) ; c'est à son adversaire (les Blancs) de jouer");
  });

  it("respecte COACH_MODEL", async () => {
    process.env.COACH_MODEL = "claude-sonnet-5-5";
    const { alice } = setup();
    await alice.action(api.coach.chat, { messages: ask(), position });
    expect(callCoachModel).toHaveBeenCalledWith(expect.objectContaining({ model: "claude-sonnet-5-5" }));
  });

  it("COACH_CHAT_ENABLED=false coupe le chat sans appel ni quota", async () => {
    process.env.COACH_CHAT_ENABLED = "false";
    const { alice } = setup();
    expect(await alice.action(api.coach.chat, { messages: ask(), position })).toEqual({
      status: "unavailable",
      message: "Le Coach est désactivé pour le moment.",
    });
    expect(callCoachModel).not.toHaveBeenCalled();
    expect(await alice.query(api.coach.remaining, {})).toEqual({ remaining: COACH_DAILY_LIMIT, limit: COACH_DAILY_LIMIT });
  });

  it("signale un serveur sans clé d'API sans appeler le LLM", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const { alice } = setup();
    expect(await alice.action(api.coach.chat, { messages: ask(), position })).toEqual({
      status: "unavailable",
      message: "Le Coach IA n'est pas configuré sur le serveur.",
    });
    expect(callCoachModel).not.toHaveBeenCalled();
  });

  it("rend le quota si le LLM échoue et renvoie un message affichable", async () => {
    const { alice } = setup();
    callCoachModel.mockRejectedValue(new Error("529 overloaded"));
    vi.spyOn(console, "error").mockImplementation(() => {});

    for (let i = 0; i < COACH_BURST_LIMIT + 2; i++) {
      expect(await alice.action(api.coach.chat, { messages: ask(), position })).toEqual({
        status: "unavailable",
        message: "Le Coach est momentanément indisponible. Réessaie dans un instant.",
      });
    }
    expect(await alice.query(api.coach.remaining, {})).toEqual({ remaining: COACH_DAILY_LIMIT, limit: COACH_DAILY_LIMIT });
    callCoachModel.mockResolvedValue(completion());
    expect((await alice.action(api.coach.chat, { messages: ask(), position })).status).toBe("ok");
  });
});

describe("coach.chat — quotas", () => {
  it(`applique l'anti-rafale de ${COACH_BURST_LIMIT} messages par minute, par utilisateur`, async () => {
    const { alice, bob } = setup();
    for (let i = 0; i < COACH_BURST_LIMIT; i++) {
      expect((await alice.action(api.coach.chat, { messages: ask(), position })).status).toBe("ok");
    }
    const blocked = await alice.action(api.coach.chat, { messages: ask(), position });
    expect(blocked).toMatchObject({ status: "quota", scope: "user" });
    if (blocked.status === "quota") expect(blocked.retryAfterMs).toBeGreaterThan(0);

    expect((await bob.action(api.coach.chat, { messages: ask(), position })).status).toBe("ok");

    vi.advanceTimersByTime(60_000);
    expect((await alice.action(api.coach.chat, { messages: ask(), position })).status).toBe("ok");
  });

  it(`plafonne à ${COACH_DAILY_LIMIT} messages par 24 h`, async () => {
    const { alice } = setup();
    for (let i = 0; i < COACH_DAILY_LIMIT; i++) {
      if (i > 0 && i % COACH_BURST_LIMIT === 0) vi.advanceTimersByTime(60_000);
      expect((await alice.action(api.coach.chat, { messages: ask(), position })).status).toBe("ok");
    }
    vi.advanceTimersByTime(60_000);
    const blocked = await alice.action(api.coach.chat, { messages: ask(), position });
    expect(blocked).toMatchObject({ status: "quota", scope: "user" });
    if (blocked.status === "quota") expect(blocked.retryAfterMs).toBeGreaterThan(60_000);
    expect(await alice.query(api.coach.remaining, {})).toMatchObject({ remaining: 0 });
  });

  it(`coupe tout le monde au-delà de ${COACH_GLOBAL_DAILY_LIMIT} messages par jour`, async () => {
    const { t, alice } = setup();
    // Les autres utilisateurs ont épuisé le seau global : ses jetons sont consommés d'un coup.
    await t.run((ctx) =>
      rateLimiter.limit(ctx, "coachGlobal", { count: COACH_GLOBAL_DAILY_LIMIT, throws: true }),
    );
    expect((await t.mutation(internal.coach.consumeQuota, { userId: "user-bob" })).ok).toBe(false);

    const blocked = await alice.action(api.coach.chat, { messages: ask(), position });
    expect(blocked).toMatchObject({ status: "quota", scope: "global" });
    expect(callCoachModel).not.toHaveBeenCalled();
    // Le refus global n'a pas entamé le quota personnel d'Alice.
    expect(await alice.query(api.coach.remaining, {})).toMatchObject({ remaining: COACH_DAILY_LIMIT });
  });

  it("bloque l'utilisateur dont le budget journalier de tokens est épuisé, jusqu'au jour suivant", async () => {
    const { alice } = setup();
    callCoachModel.mockResolvedValue({ ...completion(), inputTokens: COACH_DAILY_INPUT_TOKEN_BUDGET });
    expect((await alice.action(api.coach.chat, { messages: ask(), position })).status).toBe("ok");

    const blocked = await alice.action(api.coach.chat, { messages: ask(), position });
    expect(blocked).toMatchObject({ status: "quota", scope: "budget" });
    // 10:00 UTC → minuit : 14 h
    if (blocked.status === "quota") {
      expect(Math.abs(blocked.retryAfterMs - 14 * 60 * 60 * 1000)).toBeLessThan(1000);
    }

    vi.setSystemTime(new Date("2026-11-19T00:00:01Z"));
    callCoachModel.mockResolvedValue(completion());
    expect((await alice.action(api.coach.chat, { messages: ask(), position })).status).toBe("ok");
  });
});

describe("coach.remaining", () => {
  it("renvoie null pour un invité", async () => {
    const { t } = setup();
    expect(await t.query(api.coach.remaining, {})).toBeNull();
  });
});
