// @vitest-environment edge-runtime
import { describe, expect, it } from "vitest";
import { api } from "../../convex/_generated/api";
import { setup } from "./test.setup";

const PAGE = { paginationOpts: { numItems: 100, cursor: null } };

function position(key: string, overrides: Partial<Record<string, unknown>> = {}) {
  return {
    positionKey: key,
    fen: key,
    box: 1,
    nextReviewAt: 1_000,
    lastReviewedAt: null,
    attempts: 0,
    failures: 0,
    recentResults: [] as number[],
    ...overrides,
  };
}

const noChapterChanges = {
  reviewSet: [],
  completedSet: [],
  reviewClear: [],
  completedClear: [],
  deletes: [],
};

describe("reviews : authentification", () => {
  it("refuse un appel sans utilisateur", async () => {
    const { t } = setup();
    await expect(t.query(api.reviews.listPositions, PAGE)).rejects.toThrow(/Non authentifié/);
    await expect(
      t.mutation(api.reviews.applyPositionChanges, { upserts: [], deletes: [] }),
    ).rejects.toThrow(/Non authentifié/);
  });

  it("isole les fiches de chaque utilisateur", async () => {
    const { alice, bob } = setup();
    await alice.mutation(api.reviews.applyPositionChanges, { upserts: [position("k1")], deletes: [] });

    expect((await bob.query(api.reviews.listPositions, PAGE)).page).toEqual([]);
    // Bob ne peut pas supprimer la fiche d'Alice
    await bob.mutation(api.reviews.applyPositionChanges, { upserts: [], deletes: ["k1"] });
    expect((await alice.query(api.reviews.listPositions, PAGE)).page).toHaveLength(1);
  });
});

describe("reviews : fiches", () => {
  it("insère puis met à jour une fiche (upsert sur la clé)", async () => {
    const { alice } = setup();
    await alice.mutation(api.reviews.applyPositionChanges, { upserts: [position("k1")], deletes: [] });
    await alice.mutation(api.reviews.applyPositionChanges, {
      upserts: [position("k1", { box: 3, attempts: 4, failures: 1, recentResults: [1, 0, 1], lastReviewedAt: 500 })],
      deletes: [],
    });

    const { page } = await alice.query(api.reviews.listPositions, PAGE);
    expect(page).toEqual([
      {
        positionKey: "k1",
        box: 3,
        nextReviewAt: 1_000,
        lastReviewedAt: 500,
        attempts: 4,
        failures: 1,
        recentResults: [1, 0, 1],
      },
    ]);
  });

  it("supprime des fiches", async () => {
    const { alice } = setup();
    await alice.mutation(api.reviews.applyPositionChanges, {
      upserts: [position("k1"), position("k2")],
      deletes: [],
    });
    await alice.mutation(api.reviews.applyPositionChanges, { upserts: [], deletes: ["k1", "absente"] });

    const { page } = await alice.query(api.reviews.listPositions, PAGE);
    expect(page.map((p) => p.positionKey)).toEqual(["k2"]);
  });

  it.each([
    ["box hors limites", { box: 6 }],
    ["box nulle", { box: 0 }],
    ["tentatives négatives", { attempts: -1 }],
    ["échecs non entiers", { failures: 1.5 }],
    ["trop de résultats récents", { recentResults: [1, 1, 1, 1, 1, 1] }],
    ["résultat récent invalide", { recentResults: [2] }],
    ["clé vide", { positionKey: "" }],
  ])("refuse une fiche invalide : %s", async (_label, overrides) => {
    const { alice } = setup();
    await expect(
      alice.mutation(api.reviews.applyPositionChanges, { upserts: [position("k", overrides)], deletes: [] }),
    ).rejects.toThrow();
  });

  it("refuse un lot trop volumineux", async () => {
    const { alice } = setup();
    const upserts = Array.from({ length: 501 }, (_, i) => position(`k${i}`));
    await expect(
      alice.mutation(api.reviews.applyPositionChanges, { upserts, deletes: [] }),
    ).rejects.toThrow(/Lot trop volumineux/);
  });

  it("pagine la lecture", async () => {
    const { alice } = setup();
    await alice.mutation(api.reviews.applyPositionChanges, {
      upserts: [position("a"), position("b"), position("c")],
      deletes: [],
    });
    const first = await alice.query(api.reviews.listPositions, { paginationOpts: { numItems: 2, cursor: null } });
    expect(first.page).toHaveLength(2);
    expect(first.isDone).toBe(false);
    const second = await alice.query(api.reviews.listPositions, {
      paginationOpts: { numItems: 2, cursor: first.continueCursor },
    });
    expect(second.page.map((p) => p.positionKey)).toEqual(["c"]);
    expect(second.isDone).toBe(true);
  });
});

describe("reviews : chapitres", () => {
  it("ajoute aux révisions sans effacer la complétion", async () => {
    const { alice } = setup();
    await alice.mutation(api.reviews.applyChapterChanges, { ...noChapterChanges, completedSet: ["ch1"] });
    await alice.mutation(api.reviews.applyChapterChanges, {
      ...noChapterChanges,
      reviewSet: [{ chapterId: "ch1", addedAt: 42 }],
    });

    const { page } = await alice.query(api.reviews.listChapters, PAGE);
    expect(page).toHaveLength(1);
    expect(page[0].addedToReviewAt).toBe(42);
    expect(page[0].completedAt).toEqual(expect.any(Number));
  });

  it("vide une colonne sans supprimer la ligne, puis supprime la ligne", async () => {
    const { alice } = setup();
    await alice.mutation(api.reviews.applyChapterChanges, {
      ...noChapterChanges,
      reviewSet: [{ chapterId: "ch1", addedAt: 42 }],
      completedSet: ["ch1"],
    });

    await alice.mutation(api.reviews.applyChapterChanges, { ...noChapterChanges, reviewClear: ["ch1"] });
    let { page } = await alice.query(api.reviews.listChapters, PAGE);
    expect(page[0].addedToReviewAt).toBeNull();
    expect(page[0].completedAt).not.toBeNull();

    await alice.mutation(api.reviews.applyChapterChanges, { ...noChapterChanges, completedClear: ["ch1"] });
    ({ page } = await alice.query(api.reviews.listChapters, PAGE));
    expect(page[0].completedAt).toBeNull();

    await alice.mutation(api.reviews.applyChapterChanges, { ...noChapterChanges, deletes: ["ch1"] });
    ({ page } = await alice.query(api.reviews.listChapters, PAGE));
    expect(page).toEqual([]);
  });

  it("ignore le retrait d'un chapitre absent", async () => {
    const { alice } = setup();
    await alice.mutation(api.reviews.applyChapterChanges, {
      ...noChapterChanges,
      reviewClear: ["absent"],
      completedClear: ["absent"],
      deletes: ["absent"],
    });
    expect((await alice.query(api.reviews.listChapters, PAGE)).page).toEqual([]);
  });
});
