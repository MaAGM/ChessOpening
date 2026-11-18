// @vitest-environment edge-runtime
import { describe, expect, it } from "vitest";
import { createConvexReviewRemote, positionToStats, statsToPosition } from "./reviewRemote";
import { createEmptyChangeSet } from "@/lib/review/reviewSync";
import type { PositionStats } from "@/lib/review/srs";
import { setup } from "../../../tests/convex/test.setup";
import { recordingCaller } from "../../../tests/convex/recordingCaller";

const stats = (overrides: Partial<PositionStats> = {}): PositionStats => ({
  box: 3,
  due: Date.parse("2026-10-21T10:00:00.000Z"),
  attempts: 4,
  failures: 1,
  lastSeen: Date.parse("2026-10-20T10:00:00.000Z"),
  recent: [1, 0, 1],
  ...overrides,
});

function remoteFor(user: "alice" | "bob" = "alice", failOn?: Parameters<typeof recordingCaller>[1]) {
  const env = setup();
  const alice = recordingCaller(env.alice, failOn);
  const bob = recordingCaller(env.bob);
  const recorder = user === "alice" ? alice : bob;
  return {
    remote: createConvexReviewRemote(recorder.client),
    calls: recorder.calls,
    other: createConvexReviewRemote(user === "alice" ? bob.client : alice.client),
  };
}

describe("conversions fiche <-> document", () => {
  it("convertit une fiche en document (FEN reconstruite) et inversement", () => {
    const key = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq";
    const doc = statsToPosition(key, stats());

    expect(doc).toEqual({
      positionKey: key,
      fen: `${key} - 0 1`,
      box: 3,
      nextReviewAt: Date.parse("2026-10-21T10:00:00.000Z"),
      lastReviewedAt: Date.parse("2026-10-20T10:00:00.000Z"),
      attempts: 4,
      failures: 1,
      recentResults: [1, 0, 1],
    });
    expect(positionToStats(doc)).toEqual(stats());
  });

  it("représente une fiche jamais révisée par lastReviewedAt = null", () => {
    const doc = statsToPosition("k", stats({ lastSeen: 0 }));
    expect(doc.lastReviewedAt).toBeNull();
    expect(positionToStats(doc).lastSeen).toBe(0);
  });
});

describe("fetchState / pushChanges (aller-retour avec le serveur)", () => {
  it("relit ce qui a été poussé : fiches et chapitres", async () => {
    const { remote } = remoteFor();
    const changes = createEmptyChangeSet();
    changes.positionsUpsert = { k1: stats(), k2: stats({ box: 1, lastSeen: 0, recent: [] }) };
    changes.chaptersReviewSet = { both: 10, "review-only": 20 };
    changes.chaptersCompletedSet = ["both", "done-only"];

    await remote.pushChanges("u1", changes);
    const state = await remote.fetchState("u1");

    expect(state.positions).toEqual({ k1: stats(), k2: stats({ box: 1, lastSeen: 0, recent: [] }) });
    expect(state.reviewChapters).toEqual({ both: { addedAt: 10 }, "review-only": { addedAt: 20 } });
    expect(state.completedChapters.sort()).toEqual(["both", "done-only"]);
  });

  it("ne lit pas les données d'un autre utilisateur", async () => {
    const { remote, other } = remoteFor();
    const changes = createEmptyChangeSet();
    changes.positionsUpsert = { k1: stats() };
    changes.chaptersCompletedSet = ["c1"];
    await other.pushChanges("bob", changes);

    const state = await remote.fetchState("alice");
    expect(state.positions).toEqual({});
    expect(state.completedChapters).toEqual([]);
  });

  it("applique suppressions de fiches, retraits et suppressions de chapitres", async () => {
    const { remote } = remoteFor();
    const setupChanges = createEmptyChangeSet();
    setupChanges.positionsUpsert = { a: stats(), b: stats() };
    setupChanges.chaptersReviewSet = { "still-done": 1, empty: 2 };
    setupChanges.chaptersCompletedSet = ["still-done"];
    await remote.pushChanges("u1", setupChanges);

    const changes = createEmptyChangeSet();
    changes.positionsDelete = ["a"];
    changes.chaptersReviewClear = ["still-done"];
    changes.chaptersDelete = ["empty"];
    await remote.pushChanges("u1", changes);

    const state = await remote.fetchState("u1");
    expect(Object.keys(state.positions)).toEqual(["b"]);
    expect(state.reviewChapters).toEqual({});
    expect(state.completedChapters).toEqual(["still-done"]);
  });

  it("lit toutes les pages (fiches et chapitres)", async () => {
    const env = setup();
    const recorder = recordingCaller(env.alice);
    const remote = createConvexReviewRemote(recorder.client, { pageSize: 10 });
    const changes = createEmptyChangeSet();
    for (let i = 0; i < 25; i++) changes.positionsUpsert[`k${String(i).padStart(2, "0")}`] = stats();
    for (let i = 0; i < 12; i++) changes.chaptersCompletedSet.push(`c${i}`);
    await remote.pushChanges("u1", changes);
    recorder.calls.length = 0;

    const state = await remote.fetchState("u1");

    expect(Object.keys(state.positions)).toHaveLength(25);
    expect(state.completedChapters).toHaveLength(12);
    expect(recorder.calls.filter((c) => c.name === "reviews:listPositions")).toHaveLength(3);
    expect(recorder.calls.filter((c) => c.name === "reviews:listChapters")).toHaveLength(2);
  });
});

describe("pushChanges : découpage des envois", () => {
  it("regroupe un petit envoi en une seule mutation par table", async () => {
    const { remote, calls } = remoteFor();
    const changes = createEmptyChangeSet();
    changes.positionsUpsert = { k1: stats() };
    changes.positionsDelete = ["old"];
    changes.chaptersReviewSet = { c1: 1 };
    changes.chaptersCompletedSet = ["c2"];

    await remote.pushChanges("u1", changes);

    expect(calls.map((c) => c.name)).toEqual(["reviews:applyPositionChanges", "reviews:applyChapterChanges"]);
  });

  it("envoie les fiches par lots de 500, écritures puis suppressions", async () => {
    const { remote, calls } = remoteFor();
    const changes = createEmptyChangeSet();
    for (let i = 0; i < 1200; i++) changes.positionsUpsert[`k${i}`] = stats();
    changes.positionsDelete = ["x"];

    await remote.pushChanges("u1", changes);

    const sizes = calls.map((c) => [(c.args.upserts as unknown[]).length, (c.args.deletes as unknown[]).length]);
    expect(sizes).toEqual([[500, 0], [500, 0], [200, 0], [0, 1]]);
  });

  it("découpe les gros changements de chapitres dans l'ordre ajouts, complétions, retraits, suppressions", async () => {
    const { remote, calls } = remoteFor();
    const changes = createEmptyChangeSet();
    for (let i = 0; i < 600; i++) changes.chaptersReviewSet[`c${i}`] = i + 1;
    changes.chaptersCompletedSet = ["c0"];
    changes.chaptersDelete = ["gone"];

    await remote.pushChanges("u1", changes);

    const phases = calls.map((c) =>
      Object.entries(c.args)
        .filter(([, list]) => (list as unknown[]).length > 0)
        .map(([field, list]) => `${field}:${(list as unknown[]).length}`)
        .join(","),
    );
    expect(phases).toEqual(["reviewSet:500", "reviewSet:100", "completedSet:1", "deletes:1"]);
    const state = await remote.fetchState("u1");
    expect(Object.keys(state.reviewChapters)).toHaveLength(600);
    expect(state.completedChapters).toEqual(["c0"]);
  });

  it("n'effectue aucun appel quand il n'y a rien à envoyer", async () => {
    const { remote, calls } = remoteFor();
    await remote.pushChanges("u1", createEmptyChangeSet());
    expect(calls).toHaveLength(0);
  });

  it("s'arrête à la première erreur et la propage avec le nom de la fonction", async () => {
    const { remote, calls } = remoteFor("alice", (call) =>
      call.name === "reviews:applyPositionChanges" ? "réseau coupé" : null,
    );
    const changes = createEmptyChangeSet();
    changes.positionsUpsert.k = stats();
    changes.chaptersReviewSet = { c1: 1 };

    await expect(remote.pushChanges("u1", changes)).rejects.toThrow(
      "[reviews:applyPositionChanges] réseau coupé",
    );
    expect(calls.some((c) => c.name === "reviews:applyChapterChanges")).toBe(false);
  });

  it("propage une erreur de lecture avec le nom de la fonction", async () => {
    const { remote } = remoteFor("alice", (call) => (call.name === "reviews:listChapters" ? "refusé" : null));
    await expect(remote.fetchState("u1")).rejects.toThrow("[reviews:listChapters] refusé");
  });
});
