import { describe, expect, it, vi } from "vitest";

import { EngineClient, type EngineTransport } from "./engineClient";

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const AFTER_E4 = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1";
const MATED = "rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3";

/** Faux moteur UCI : enregistre les commandes, émet les lignes qu'on lui dicte. */
function createFakeEngine() {
  const sent: string[] = [];
  let onLine: ((line: string) => void) | null = null;
  let onError: ((error: unknown) => void) | null = null;
  const transport: EngineTransport = {
    post: (command) => sent.push(command),
    subscribe(line, error) {
      onLine = line;
      onError = error;
      return () => {
        onLine = null;
        onError = null;
      };
    },
    terminate: vi.fn(),
  };
  return {
    transport,
    sent,
    emit: (...lines: string[]) => lines.forEach((line) => onLine?.(line)),
    crash: () => onError?.(new Error("boom")),
    /** Répond à la poignée de main UCI. */
    boot() {
      this.emit("id name Stockfish", "uciok");
      this.emit("readyok");
    },
    /** Commandes envoyées depuis le dernier appel. */
    drain() {
      return sent.splice(0, sent.length);
    },
  };
}

describe("EngineClient", () => {
  it("fait la poignée de main UCI avant toute recherche", async () => {
    const engine = createFakeEngine();
    const client = new EngineClient(engine.transport, { defaultDepth: 10 });
    expect(client.status).toBe("loading");

    const promise = client.analyze(START);
    expect(engine.drain()).toEqual(["uci"]);

    engine.emit("uciok");
    expect(engine.drain()).toEqual(["isready"]);

    engine.emit("readyok");
    expect(client.status).toBe("ready");
    expect(engine.drain()).toEqual([`position fen ${START}`, "go depth 10"]);

    engine.emit("info depth 10 score cp 30 pv e2e4 e7e5", "bestmove e2e4 ponder e7e5");
    await expect(promise).resolves.toMatchObject({ depth: 10, bestMove: "e2e4", complete: true });
  });

  it("transmet les analyses progressives et convertit le score côté Blancs", async () => {
    const engine = createFakeEngine();
    const client = new EngineClient(engine.transport);
    engine.boot();
    const onUpdate = vi.fn();

    const promise = client.analyze(AFTER_E4, { depth: 2, onUpdate });
    engine.emit(
      "info depth 1 score cp 20 pv c7c5",
      "info depth 2 score cp 40 lowerbound pv e7e5", // borne : ignorée
      "info depth 2 multipv 2 score cp -10 pv d7d5", // variante secondaire : ignorée
      "info string bla",
      "info depth 2 score cp 25 pv e7e5 g1f3",
      "bestmove e7e5",
    );

    const result = await promise;
    expect(onUpdate).toHaveBeenCalledTimes(3); // depth 1, depth 2, final
    expect(onUpdate.mock.calls[0][0]).toMatchObject({ depth: 1, bestMove: "c7c5", complete: false });
    expect(result).toMatchObject({
      turn: "black",
      depth: 2,
      score: { type: "cp", value: -25 },
      bestMove: "e7e5",
      pv: ["e7e5", "g1f3"],
      complete: true,
    });
  });

  it("annule la recherche en cours quand la position change", async () => {
    const engine = createFakeEngine();
    const client = new EngineClient(engine.transport, { defaultDepth: 12 });
    engine.boot();
    engine.drain();

    const first = client.analyze(START);
    engine.emit("info depth 3 score cp 10 pv d2d4");
    expect(engine.drain()).toEqual([`position fen ${START}`, "go depth 12"]);

    const onUpdate = vi.fn();
    const second = client.analyze(AFTER_E4, { onUpdate });
    expect(engine.drain()).toEqual(["stop"]);
    await expect(first).resolves.toBeNull();

    // Lignes tardives de la recherche abandonnée : jamais transmises.
    engine.emit("info depth 4 score cp 12 pv d2d4");
    expect(onUpdate).not.toHaveBeenCalled();

    // Le moteur clôt l'ancienne recherche, la nouvelle démarre ensuite.
    engine.emit("bestmove d2d4");
    expect(engine.drain()).toEqual([`position fen ${AFTER_E4}`, "go depth 12"]);
    expect(client.getCached(START)).toBeNull(); // recherche incomplète : pas en cache

    engine.emit("info depth 12 score cp -30 pv c7c5", "bestmove c7c5");
    await expect(second).resolves.toMatchObject({ bestMove: "c7c5", score: { type: "cp", value: 30 } });
  });

  it("ne garde que la dernière demande en attente", async () => {
    const engine = createFakeEngine();
    const client = new EngineClient(engine.transport, { defaultDepth: 8 });
    engine.boot();

    const a = client.analyze(START);
    const b = client.analyze(AFTER_E4);
    const c = client.analyze(MATED);
    await expect(a).resolves.toBeNull();
    await expect(b).resolves.toBeNull();
    engine.drain();

    engine.emit("bestmove e2e4"); // fin de la recherche « a »
    expect(engine.drain()).toEqual([`position fen ${MATED}`, "go depth 8"]);
    engine.emit("info depth 0 score mate 0", "bestmove (none)");
    await expect(c).resolves.toMatchObject({
      bestMove: null,
      pv: [],
      depth: 8,
      score: { type: "mate", value: 0 },
      complete: true,
    });
  });

  it("met en cache par position et sert le cache sans relancer le moteur", async () => {
    const engine = createFakeEngine();
    const client = new EngineClient(engine.transport, { defaultDepth: 10 });
    engine.boot();

    const first = client.analyze(START);
    engine.emit("info depth 10 score cp 20 pv e2e4", "bestmove e2e4");
    await first;
    engine.drain();

    const onUpdate = vi.fn();
    // Même position, compteurs différents : même clé.
    const again = await client.analyze(START.replace(/0 1$/, "4 7"), { onUpdate });
    expect(again).toMatchObject({ bestMove: "e2e4", complete: true });
    expect(onUpdate).toHaveBeenCalledWith(again);
    expect(engine.drain()).toEqual([]);

    // Plus profond que le cache : nouvelle recherche.
    client.analyze(START, { depth: 20 });
    expect(engine.drain()).toEqual([`position fen ${START}`, "go depth 20"]);
  });

  it("un résultat servi par le cache interrompt la recherche en cours", async () => {
    const engine = createFakeEngine();
    const client = new EngineClient(engine.transport, { defaultDepth: 5 });
    engine.boot();
    const first = client.analyze(START);
    engine.emit("info depth 5 score cp 20 pv e2e4", "bestmove e2e4");
    await first;

    const running = client.analyze(AFTER_E4);
    engine.drain();
    await expect(client.analyze(START)).resolves.toMatchObject({ bestMove: "e2e4" });
    await expect(running).resolves.toBeNull();
    expect(engine.drain()).toEqual(["stop"]);
  });

  it("panne du moteur : demandes résolues à null, statut « error »", async () => {
    const engine = createFakeEngine();
    const client = new EngineClient(engine.transport);
    engine.boot();
    const running = client.analyze(START);
    engine.crash();
    await expect(running).resolves.toBeNull();
    expect(client.status).toBe("error");
    await expect(client.analyze(AFTER_E4)).resolves.toBeNull();
  });

  it("dispose : quitte le moteur et résout les demandes", async () => {
    const engine = createFakeEngine();
    const client = new EngineClient(engine.transport);
    const waiting = client.analyze(START); // avant même la poignée de main
    client.dispose();
    await expect(waiting).resolves.toBeNull();
    expect(engine.sent.at(-1)).toBe("quit");
    expect(engine.transport.terminate).toHaveBeenCalledOnce();
    expect(client.status).toBe("disposed");
    await expect(client.analyze(START)).resolves.toBeNull();
  });
});
