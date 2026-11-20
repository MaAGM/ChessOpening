// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { COACH_CHAT_MAX_HISTORY, COACH_CHAT_MAX_MESSAGE_LENGTH, type CoachPositionSnapshot } from "@/lib/coach/chatProtocol";
import type { CoachChatBackend, CoachChatResult } from "@/lib/convex/coachRemote";

import { formatRetryDelay, quotaMessage, useCoachChat } from "./useCoachChat";

const snapshot = (moves: string[] = ["e4"]): CoachPositionSnapshot => ({
  fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
  moves,
  openingName: null,
  engine: null,
  explorer: null,
});

function fakeBackend(results: Array<CoachChatResult | Error> = []) {
  const send = vi.fn(async () => {
    const next = results.shift() ?? { status: "ok" as const, text: "Réponse.", remaining: 20 };
    if (next instanceof Error) throw next;
    return next;
  });
  const remaining = vi.fn(async () => ({ remaining: 25, limit: 30 }));
  return { send, remaining } satisfies CoachChatBackend;
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}

afterEach(cleanup);

describe("useCoachChat", () => {
  it("charge le quota restant puis envoie la question avec la position", async () => {
    const backend = fakeBackend();
    const { result } = renderHook(() => useCoachChat({ backend, getSnapshot: () => snapshot() }));
    await waitFor(() => expect(result.current.remaining).toEqual({ remaining: 25, limit: 30 }));

    await act(async () => {
      expect(await result.current.send("  Que jouer ?  ")).toBe(true);
    });
    expect(backend.send).toHaveBeenCalledWith([{ role: "user", content: "Que jouer ?", moves: ["e4"] }], snapshot());
    expect(result.current.messages.map((m) => [m.role, m.content])).toEqual([
      ["user", "Que jouer ?"],
      ["assistant", "Réponse."],
    ]);
    expect(result.current.remaining).toEqual({ remaining: 20, limit: 30 });
    expect(result.current.pending).toBe(false);
  });

  it("n'envoie rien pour un invité, une question vide ou trop longue", async () => {
    const backend = fakeBackend();
    const guest = renderHook(() => useCoachChat({ backend: null, getSnapshot: () => snapshot() }));
    await act(async () => {
      expect(await guest.result.current.send("Bonjour")).toBe(false);
    });
    expect(guest.result.current.canSend).toBe(false);

    const { result } = renderHook(() => useCoachChat({ backend, getSnapshot: () => snapshot() }));
    await act(async () => {
      expect(await result.current.send("   ")).toBe(false);
      expect(await result.current.send("x".repeat(COACH_CHAT_MAX_MESSAGE_LENGTH + 1))).toBe(false);
    });
    expect(backend.send).not.toHaveBeenCalled();
  });

  it("refuse une deuxième question tant que la première n'a pas de réponse", async () => {
    const reply = deferred<CoachChatResult>();
    const backend = { send: vi.fn(() => reply.promise), remaining: vi.fn(async () => null) };
    const { result } = renderHook(() => useCoachChat({ backend, getSnapshot: () => snapshot() }));

    let first!: Promise<boolean>;
    act(() => {
      first = result.current.send("Première");
    });
    expect(result.current.pending).toBe(true);
    await act(async () => {
      expect(await result.current.send("Seconde")).toBe(false);
    });
    expect(backend.send).toHaveBeenCalledTimes(1);

    await act(async () => {
      reply.resolve({ status: "ok", text: "OK", remaining: 3 });
      await first;
    });
    expect(result.current.pending).toBe(false);
  });

  it(`n'envoie que les ${COACH_CHAT_MAX_HISTORY} derniers messages`, async () => {
    const backend = fakeBackend();
    const { result } = renderHook(() => useCoachChat({ backend, getSnapshot: () => snapshot() }));
    for (let i = 0; i < 7; i++) {
      await act(async () => {
        await result.current.send(`Question ${i}`);
      });
    }
    const lastCall = backend.send.mock.calls.at(-1) as unknown as [{ role: string; content: string }[]];
    const lastPayload = lastCall[0];
    expect(lastPayload).toHaveLength(9);
    expect(lastPayload[0]).toMatchObject({ role: "user", content: "Question 2" });
    expect(lastPayload.at(-1)).toMatchObject({ role: "user", content: "Question 6" });
    expect(result.current.messages).toHaveLength(14);
  });

  it("retire la question et affiche le quota atteint", async () => {
    const backend = fakeBackend([{ status: "quota", scope: "user", retryAfterMs: 90_000 }]);
    const { result } = renderHook(() => useCoachChat({ backend, getSnapshot: () => snapshot() }));
    await waitFor(() => expect(result.current.remaining).not.toBeNull());

    await act(async () => {
      expect(await result.current.send("Encore ?")).toBe(false);
    });
    expect(result.current.messages).toEqual([]);
    expect(result.current.notice).toEqual({ kind: "quota", text: "Doucement ! Tu pourras reposer une question dans 2 min." });
    expect(result.current.remaining?.remaining).toBe(0);
  });

  it("retire la question si le serveur échoue", async () => {
    const backend = fakeBackend([new Error("réseau")]);
    const { result } = renderHook(() => useCoachChat({ backend, getSnapshot: () => snapshot() }));
    await act(async () => {
      expect(await result.current.send("Allô ?")).toBe(false);
    });
    expect(result.current.messages).toEqual([]);
    expect(result.current.notice?.kind).toBe("error");
  });

  it("ignore une réponse arrivée après « Nouvelle discussion »", async () => {
    const reply = deferred<CoachChatResult>();
    const backend = { send: vi.fn(() => reply.promise), remaining: vi.fn(async () => null) };
    const { result } = renderHook(() => useCoachChat({ backend, getSnapshot: () => snapshot() }));

    let pending!: Promise<boolean>;
    act(() => {
      pending = result.current.send("Question");
    });
    act(() => result.current.reset());
    await act(async () => {
      reply.resolve({ status: "ok", text: "Trop tard", remaining: 1 });
      await pending;
    });
    expect(result.current.messages).toEqual([]);
    expect(result.current.pending).toBe(false);
  });
});

describe("messages de quota", () => {
  it("formate le délai", () => {
    expect(formatRetryDelay(500)).toBe("dans 1 s");
    expect(formatRetryDelay(45_000)).toBe("dans 45 s");
    expect(formatRetryDelay(61_000)).toBe("dans 2 min");
    expect(formatRetryDelay(2 * 60 * 60 * 1000)).toBe("dans 2 h");
  });

  it("distingue quota personnel, coupe-circuit global et budget", () => {
    expect(quotaMessage("global", 60_000)).toMatch(/beaucoup parlé/);
    expect(quotaMessage("budget", 60_000)).toMatch(/limite d'échanges/);
    expect(quotaMessage("user", 60_000)).toMatch(/Doucement/);
  });
});
