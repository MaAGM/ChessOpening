// @vitest-environment edge-runtime
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../../convex/_generated/api";
import { MAX_DATA_BYTES } from "../../convex/repertoires";
import { setup } from "./test.setup";

const PAGE = { paginationOpts: { numItems: 100, cursor: null } };
const NOW = 1_700_000_000_000;
const FIVE_MINUTES = 5 * 60 * 1000;

function repertoire(id: string, overrides: Partial<Record<string, unknown>> = {}) {
  return {
    repertoireId: id,
    name: "Sicilienne",
    side: "black" as const,
    category: null,
    reviewEnabled: true,
    data: JSON.stringify({ version: 1, position: 0, children: [], origin: { kind: "custom" } }),
    createdAt: NOW - 10_000,
    updatedAt: NOW - 1_000,
    ...overrides,
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});
afterEach(() => {
  vi.useRealTimers();
});

describe("repertoires : authentification", () => {
  it("refuse un appel sans utilisateur", async () => {
    const { t } = setup();
    await expect(t.query(api.repertoires.list, PAGE)).rejects.toThrow(/Non authentifié/);
  });

  it("isole les répertoires de chaque utilisateur (même identifiant)", async () => {
    const { alice, bob } = setup();
    await alice.mutation(api.repertoires.upsert, { items: [repertoire("r1")] });
    await bob.mutation(api.repertoires.upsert, { items: [repertoire("r1", { name: "Française" })] });

    const a = await alice.query(api.repertoires.list, PAGE);
    const b = await bob.query(api.repertoires.list, PAGE);
    expect(a.page.map((r) => r.name)).toEqual(["Sicilienne"]);
    expect(b.page.map((r) => r.name)).toEqual(["Française"]);
  });
});

describe("repertoires : la version la plus récente gagne", () => {
  it("accepte une version plus récente et conserve createdAt", async () => {
    const { alice } = setup();
    await alice.mutation(api.repertoires.upsert, { items: [repertoire("r1")] });
    const result = await alice.mutation(api.repertoires.upsert, {
      items: [repertoire("r1", { name: "Najdorf", updatedAt: NOW, createdAt: 0 })],
    });

    expect(result.skipped).toEqual([]);
    const [row] = (await alice.query(api.repertoires.list, PAGE)).page;
    expect(row.name).toBe("Najdorf");
    expect(row.createdAt).toBe(NOW - 10_000);
    expect(row.updatedAt).toBe(NOW);
  });

  it("ignore sans erreur une version plus ancienne", async () => {
    const { alice } = setup();
    await alice.mutation(api.repertoires.upsert, { items: [repertoire("r1", { updatedAt: NOW })] });
    const result = await alice.mutation(api.repertoires.upsert, {
      items: [repertoire("r1", { name: "Ancienne", updatedAt: NOW - 5_000 })],
    });

    expect(result.skipped).toEqual(["r1"]);
    expect((await alice.query(api.repertoires.list, PAGE)).page[0].name).toBe("Sicilienne");
  });

  it("plafonne l'horodatage à maintenant + 5 minutes", async () => {
    const { alice } = setup();
    await alice.mutation(api.repertoires.upsert, {
      items: [repertoire("r1", { updatedAt: NOW + 365 * 24 * 3600 * 1000 })],
    });
    expect((await alice.query(api.repertoires.list, PAGE)).page[0].updatedAt).toBe(NOW + FIVE_MINUTES);
  });
});

describe("repertoires : suppression douce", () => {
  it("marque un répertoire supprimé, et une édition plus récente le ressuscite", async () => {
    const { alice } = setup();
    await alice.mutation(api.repertoires.upsert, { items: [repertoire("r1")] });
    await alice.mutation(api.repertoires.softDelete, { items: [{ repertoireId: "r1", deletedAt: NOW - 500 }] });

    let [row] = (await alice.query(api.repertoires.list, PAGE)).page;
    expect(row.deletedAt).toBe(NOW - 500);
    expect(row.updatedAt).toBe(NOW - 500);

    await alice.mutation(api.repertoires.upsert, { items: [repertoire("r1", { updatedAt: NOW })] });
    [row] = (await alice.query(api.repertoires.list, PAGE)).page;
    expect(row.deletedAt).toBeNull();
  });

  it("refuse une suppression périmée", async () => {
    const { alice } = setup();
    await alice.mutation(api.repertoires.upsert, { items: [repertoire("r1", { updatedAt: NOW })] });
    const result = await alice.mutation(api.repertoires.softDelete, {
      items: [{ repertoireId: "r1", deletedAt: NOW - 5_000 }],
    });

    expect(result.skipped).toEqual(["r1"]);
    expect((await alice.query(api.repertoires.list, PAGE)).page[0].deletedAt).toBeNull();
  });

  it("ignore la suppression d'un répertoire absent", async () => {
    const { alice } = setup();
    const result = await alice.mutation(api.repertoires.softDelete, {
      items: [{ repertoireId: "absent", deletedAt: NOW }],
    });
    expect(result.skipped).toEqual([]);
    expect((await alice.query(api.repertoires.list, PAGE)).page).toEqual([]);
  });
});

describe("repertoires : validation", () => {
  it.each([
    ["nom vide", { name: "" }],
    ["nom trop long", { name: "x".repeat(81) }],
    ["catégorie vide", { category: "" }],
    ["identifiant trop long", { repertoireId: "x".repeat(65) }],
    ["data non JSON", { data: "pas du json" }],
    ["data tableau", { data: "[]" }],
  ])("refuse : %s", async (_label, overrides) => {
    const { alice } = setup();
    await expect(
      alice.mutation(api.repertoires.upsert, { items: [repertoire("r1", overrides)] }),
    ).rejects.toThrow();
  });

  it("refuse un arbre trop volumineux", async () => {
    const { alice } = setup();
    const data = JSON.stringify({ version: 1, comment: "x".repeat(MAX_DATA_BYTES) });
    await expect(
      alice.mutation(api.repertoires.upsert, { items: [repertoire("r1", { data })] }),
    ).rejects.toThrow(/trop volumineux/);
  });

  it("refuse un lot trop volumineux", async () => {
    const { alice } = setup();
    const items = Array.from({ length: 11 }, (_, i) => repertoire(`r${i}`));
    await expect(alice.mutation(api.repertoires.upsert, { items })).rejects.toThrow(/Lot trop volumineux/);
  });
});
