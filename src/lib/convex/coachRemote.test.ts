import { getFunctionName } from "convex/server";
import { describe, expect, it, vi } from "vitest";

import { createCoachChatBackend, type ConvexCoachCaller } from "./coachRemote";

const position = {
  fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  moves: [],
  openingName: null,
  engine: null,
  explorer: null,
};

describe("createCoachChatBackend", () => {
  it("appelle coach.chat avec l'historique et la position, sans identifiant d'utilisateur", async () => {
    const action = vi.fn().mockResolvedValue({ status: "ok", text: "Joue e4.", remaining: 29 });
    const client = { action, query: vi.fn() } as unknown as ConvexCoachCaller;
    const backend = createCoachChatBackend(client);
    const messages = [{ role: "user" as const, content: "Que jouer ?" }];

    await expect(backend.send(messages, position)).resolves.toEqual({ status: "ok", text: "Joue e4.", remaining: 29 });
    expect(getFunctionName(action.mock.calls[0][0])).toBe("coach:chat");
    expect(action.mock.calls[0][1]).toEqual({ messages, position });
  });

  it("lit le quota restant via coach.remaining", async () => {
    const query = vi.fn().mockResolvedValue({ remaining: 12, limit: 30 });
    const backend = createCoachChatBackend({ action: vi.fn(), query } as unknown as ConvexCoachCaller);
    await expect(backend.remaining()).resolves.toEqual({ remaining: 12, limit: 30 });
    expect(getFunctionName(query.mock.calls[0][0])).toBe("coach:remaining");
  });
});
