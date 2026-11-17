import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { REPERTOIRE_LIMITS } from "./limits";
import { sanitizeRepertoireState } from "./repertoireStore";
import type { RepertoireDraft, RepertoireNode } from "./types";

const STORAGE_KEY = "chess-opening:repertoires-v1";

type StoreModule = typeof import("./repertoireStore");

describe("repertoireStore (avec localStorage factice)", () => {
  let data: Record<string, string>;
  let handlers: Record<string, (event: { key: string | null }) => void>;
  let failWrites: boolean;

  beforeEach(() => {
    data = {};
    handlers = {};
    failWrites = false;
    vi.resetModules();
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (k: string) => (k in data ? data[k] : null),
        setItem: (k: string, v: string) => {
          if (failWrites) throw new Error("QuotaExceededError");
          data[k] = v;
        },
        removeItem: (k: string) => {
          delete data[k];
        },
      },
      addEventListener: (type: string, fn: (event: { key: string | null }) => void) => {
        handlers[type] = fn;
      },
      removeEventListener: () => {},
    });
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  const load = (): Promise<StoreModule> => import("./repertoireStore");

  const node = (id: string, san: string, children: RepertoireNode[] = []): RepertoireNode => ({
    id,
    san,
    children,
  });

  const unwrap = <T,>(result: { ok: true; value: T } | { ok: false; error: string }): T => {
    if (!result.ok) throw new Error(`échec inattendu : ${result.error}`);
    return result.value;
  };

  describe("création", () => {
    it("crée un répertoire vide avec des valeurs par défaut et le persiste", async () => {
      const store = await load();
      const id = unwrap(
        store.createRepertoire({ name: "Mon 1.e4", side: "white", category: "Ouvertures" }),
      );

      const created = store.getSnapshot().repertoires[id];
      expect(created).toMatchObject({
        name: "Mon 1.e4",
        side: "white",
        category: "Ouvertures",
        reviewEnabled: true,
        children: [],
        origin: { kind: "custom" },
      });
      expect(store.getSnapshot().order).toEqual([id]);
      expect(JSON.parse(data[STORAGE_KEY]).repertoires[id].name).toBe("Mon 1.e4");
    });

    it("normalise le nom (espaces, longueur) et refuse un nom vide", async () => {
      const store = await load();
      expect(store.createRepertoire({ name: "   ", side: "black" })).toEqual({
        ok: false,
        error: "invalid-name",
      });

      const id = unwrap(store.createRepertoire({ name: "  Mon   répertoire  ", side: "black" }));
      expect(store.getSnapshot().repertoires[id].name).toBe("Mon répertoire");

      const long = unwrap(store.createRepertoire({ name: "x".repeat(200), side: "black" }));
      expect(store.getSnapshot().repertoires[long].name).toHaveLength(REPERTOIRE_LIMITS.maxNameLength);
    });

    it("transforme une catégorie vide en absence de catégorie", async () => {
      const store = await load();
      const id = unwrap(store.createRepertoire({ name: "A", side: "white", category: "  " }));
      expect(store.getSnapshot().repertoires[id].category).toBeNull();
    });

    it("refuse un répertoire qui dépasse la limite de coups", async () => {
      const store = await load();
      const children = Array.from({ length: REPERTOIRE_LIMITS.maxNodes + 1 }, (_, i) =>
        node(`n${i}`, `m${i}`),
      );
      const draft: RepertoireDraft = {
        name: "Énorme",
        side: "white",
        category: null,
        reviewEnabled: true,
        children,
        origin: { kind: "custom" },
      };
      expect(store.addRepertoire(draft)).toEqual({ ok: false, error: "limit-reached" });
      expect(store.getSnapshot().order).toEqual([]);
    });
  });

  describe("modification", () => {
    it("met à jour les métadonnées", async () => {
      const store = await load();
      const id = unwrap(store.createRepertoire({ name: "A", side: "white" }));

      unwrap(
        store.updateRepertoireMeta(id, {
          name: "Renommé",
          side: "black",
          category: "Solide",
          reviewEnabled: false,
          comment: "  Plan : fianchetto  ",
        }),
      );

      expect(store.getSnapshot().repertoires[id]).toMatchObject({
        name: "Renommé",
        side: "black",
        category: "Solide",
        reviewEnabled: false,
        comment: "Plan : fianchetto",
      });
    });

    it("supprime le commentaire quand il est vidé", async () => {
      const store = await load();
      const id = unwrap(store.createRepertoire({ name: "A", side: "white" }));
      store.updateRepertoireMeta(id, { comment: "note" });
      store.updateRepertoireMeta(id, { comment: "" });
      expect("comment" in store.getSnapshot().repertoires[id]).toBe(false);
    });

    it("refuse un nom vide sans rien modifier, et signale un répertoire inconnu", async () => {
      const store = await load();
      const id = unwrap(store.createRepertoire({ name: "A", side: "white" }));
      const before = store.getSnapshot();

      expect(store.updateRepertoireMeta(id, { name: " " })).toEqual({ ok: false, error: "invalid-name" });
      expect(store.updateRepertoireMeta("inconnu", { name: "B" })).toEqual({ ok: false, error: "not-found" });
      expect(store.getSnapshot()).toBe(before);
    });

    it("ne notifie rien et ne change pas la date quand rien ne change", async () => {
      const store = await load();
      const id = unwrap(store.createRepertoire({ name: "A", side: "white" }));
      const listener = vi.fn();
      store.subscribeToChanges(listener);
      const before = store.getSnapshot();

      store.updateRepertoireMeta(id, { name: "A", side: "white", reviewEnabled: true });

      expect(listener).not.toHaveBeenCalled();
      expect(store.getSnapshot()).toBe(before);
    });

    it("remplace l'arbre et met à jour la date de modification", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(1_000);
      const store = await load();
      const id = unwrap(store.createRepertoire({ name: "A", side: "white" }));

      vi.setSystemTime(5_000);
      const children = [node("a", "e4")];
      unwrap(store.updateRepertoireTree(id, children));

      const updated = store.getSnapshot().repertoires[id];
      expect(updated.children).toBe(children);
      expect(updated.updatedAt).toBe(5_000);
      expect(updated.createdAt).toBe(1_000);
    });

    it("ignore un remplacement par le même arbre et signale un répertoire inconnu", async () => {
      const store = await load();
      const id = unwrap(store.createRepertoire({ name: "A", side: "white" }));
      const before = store.getSnapshot();

      unwrap(store.updateRepertoireTree(id, before.repertoires[id].children));
      expect(store.getSnapshot()).toBe(before);
      expect(store.updateRepertoireTree("inconnu", [])).toEqual({ ok: false, error: "not-found" });
    });
  });

  describe("suppression, copie, ordre", () => {
    it("supprime un répertoire et le retire de l'ordre", async () => {
      const store = await load();
      const a = unwrap(store.createRepertoire({ name: "A", side: "white" }));
      const b = unwrap(store.createRepertoire({ name: "B", side: "black" }));

      unwrap(store.deleteRepertoire(a));

      expect(Object.keys(store.getSnapshot().repertoires)).toEqual([b]);
      expect(store.getSnapshot().order).toEqual([b]);
      expect(store.deleteRepertoire(a)).toEqual({ ok: false, error: "not-found" });
    });

    it("copie un répertoire sous un nouvel identifiant", async () => {
      const store = await load();
      const id = unwrap(store.createRepertoire({ name: "Sicilienne", side: "white", category: "e4" }));
      store.updateRepertoireTree(id, [node("a", "e4", [node("b", "c5")])]);

      const copyId = unwrap(store.duplicateRepertoire(id));
      const copy = store.getSnapshot().repertoires[copyId];

      expect(copyId).not.toBe(id);
      expect(copy.name).toBe("Sicilienne (copie)");
      expect(copy.category).toBe("e4");
      expect(copy.children).toEqual(store.getSnapshot().repertoires[id].children);
      expect(copy.origin).toEqual({ kind: "custom" });
      expect(store.getSnapshot().order).toEqual([id, copyId]);
    });

    it("réordonne uniquement avec une permutation valide", async () => {
      const store = await load();
      const a = unwrap(store.createRepertoire({ name: "A", side: "white" }));
      const b = unwrap(store.createRepertoire({ name: "B", side: "white" }));
      const c = unwrap(store.createRepertoire({ name: "C", side: "white" }));

      unwrap(store.reorderRepertoires([c, a, b]));
      expect(store.getSnapshot().order).toEqual([c, a, b]);

      const invalid = { ok: false, error: "invalid-order" };
      expect(store.reorderRepertoires([a, b])).toEqual(invalid); // il en manque un
      expect(store.reorderRepertoires([a, a, b])).toEqual(invalid); // doublon
      expect(store.reorderRepertoires([a, b, "inconnu"])).toEqual(invalid);
      expect(store.getSnapshot().order).toEqual([c, a, b]);
    });
  });

  describe("persistance", () => {
    it("retrouve répertoires et ordre après un rechargement", async () => {
      const first = await load();
      const a = unwrap(first.createRepertoire({ name: "A", side: "white" }));
      const b = unwrap(first.createRepertoire({ name: "B", side: "black" }));
      first.updateRepertoireTree(a, [node("x", "e4")]);
      first.reorderRepertoires([b, a]);

      vi.resetModules();
      const second = await load();
      const state = second.getSnapshot();
      expect(state.order).toEqual([b, a]);
      expect(state.repertoires[a].children[0].san).toBe("e4");
    });

    it("repart d'un état vide si les données sont corrompues", async () => {
      data[STORAGE_KEY] = "{pas du json";
      const store = await load();
      expect(store.getSnapshot().order).toEqual([]);
    });

    it("signale l'échec de sauvegarde, garde l'état en mémoire, puis efface l'alerte au succès", async () => {
      const store = await load();
      const alerts: (string | null)[] = [];
      store.subscribePersistError(() => alerts.push(store.getPersistError()));

      failWrites = true;
      const id = unwrap(store.createRepertoire({ name: "A", side: "white" }));
      expect(store.getPersistError()).toMatch(/Sauvegarde impossible/);
      expect(store.getSnapshot().repertoires[id]).toBeDefined(); // l'édition continue en mémoire

      failWrites = false;
      store.updateRepertoireMeta(id, { name: "A2" });
      expect(store.getPersistError()).toBeNull();
      expect(JSON.parse(data[STORAGE_KEY]).repertoires[id].name).toBe("A2");
      expect(alerts).toHaveLength(2); // apparition puis disparition, sans doublon
    });
  });

  describe("abonnements", () => {
    it("distingue les changements locaux de ceux d'un autre onglet", async () => {
      const store = await load();
      const sources: string[] = [];
      store.subscribeToChanges((_prev, _next, source) => sources.push(source));
      store.subscribe(() => {}); // enregistre l'écouteur « storage »

      const id = unwrap(store.createRepertoire({ name: "A", side: "white" }));
      data[STORAGE_KEY] = JSON.stringify({
        version: 1,
        repertoires: {
          autre: { id: "autre", name: "Venu d'ailleurs", side: "black", children: [] },
        },
        order: ["autre"],
      });
      handlers.storage({ key: STORAGE_KEY });

      expect(sources).toEqual(["local", "external"]);
      expect(store.getSnapshot().repertoires.autre.name).toBe("Venu d'ailleurs");
      expect(store.getSnapshot().repertoires[id]).toBeUndefined();
    });

    it("ignore les modifications d'autres clés du localStorage", async () => {
      const store = await load();
      const listener = vi.fn();
      store.subscribe(() => {});
      store.subscribeToChanges(listener);
      handlers.storage({ key: "autre-cle" });
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe("synchronisation : dates, pierres tombales et ordre", () => {
    it("laisse une pierre tombale postérieure à la dernière modification", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(1_000);
      const store = await load();
      const id = unwrap(store.createRepertoire({ name: "A", side: "white" }));

      vi.setSystemTime(4_000);
      unwrap(store.deleteRepertoire(id));

      expect(store.getSnapshot().deleted).toEqual({ [id]: 4_000 });
      expect(JSON.parse(data[STORAGE_KEY]).deleted).toEqual({ [id]: 4_000 });
    });

    it("date chaque modification après la version précédente, même si l'horloge recule", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(10_000);
      const store = await load();
      const id = unwrap(store.createRepertoire({ name: "A", side: "white" }));

      vi.setSystemTime(2_000); // horloge en retard sur celle qui a écrit la version courante
      store.updateRepertoireMeta(id, { name: "B" });
      expect(store.getSnapshot().repertoires[id].updatedAt).toBe(10_001);
      store.updateRepertoireTree(id, [node("a", "e4")]);
      expect(store.getSnapshot().repertoires[id].updatedAt).toBe(10_002);
      store.deleteRepertoire(id);
      expect(store.getSnapshot().deleted[id]).toBe(10_003);
    });

    it("ne date à nouveau que les répertoires qui changent de place", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(1_000);
      const store = await load();
      const a = unwrap(store.createRepertoire({ name: "A", side: "white" }));
      const b = unwrap(store.createRepertoire({ name: "B", side: "white" }));
      const c = unwrap(store.createRepertoire({ name: "C", side: "white" }));

      vi.setSystemTime(9_000);
      unwrap(store.reorderRepertoires([b, a, c]));
      const { repertoires } = store.getSnapshot();
      expect([repertoires[a].updatedAt, repertoires[b].updatedAt, repertoires[c].updatedAt]).toEqual([
        9_000, 9_000, 1_000,
      ]);
    });

    it("ignore un réordonnancement identique", async () => {
      const store = await load();
      const a = unwrap(store.createRepertoire({ name: "A", side: "white" }));
      const before = store.getSnapshot();
      unwrap(store.reorderRepertoires([a]));
      expect(store.getSnapshot()).toBe(before);
    });
  });

  describe("périmètre invité / connecté", () => {
    const USER_KEY = "chess-opening:repertoires-v1:user:u1";

    it("sépare les données d'invité du cache de chaque utilisateur", async () => {
      const store = await load();
      const guestId = unwrap(store.createRepertoire({ name: "Invité", side: "white" }));

      store.setStorageScope({ kind: "user", userId: "u1" });
      expect(store.getStorageScope()).toEqual({ kind: "user", userId: "u1" });
      expect(store.getSnapshot().order).toEqual([]);

      const userId = unwrap(store.createRepertoire({ name: "Compte", side: "black" }));
      expect(JSON.parse(data[USER_KEY]).order).toEqual([userId]);
      expect(JSON.parse(data[STORAGE_KEY]).order).toEqual([guestId]);
      expect(store.readGuestState().order).toEqual([guestId]);

      store.setStorageScope({ kind: "guest" });
      expect(store.getSnapshot().order).toEqual([guestId]);
    });

    it("efface les données d'invité après migration et le cache à la déconnexion", async () => {
      const store = await load();
      unwrap(store.createRepertoire({ name: "Invité", side: "white" }));
      store.clearGuestState();
      expect(data[STORAGE_KEY]).toBeUndefined();
      expect(store.getSnapshot().order).toEqual([]);

      store.setStorageScope({ kind: "user", userId: "u1" });
      unwrap(store.createRepertoire({ name: "Compte", side: "black" }));
      store.setStorageScope({ kind: "guest" });
      store.clearUserCache("u1");
      expect(data[USER_KEY]).toBeUndefined();
    });

    it("applique un état venu du cloud avec la source « remote », sauf s'il est identique", async () => {
      const store = await load();
      const sources: string[] = [];
      store.subscribeToChanges((_prev, _next, source) => sources.push(source));

      const remote = {
        version: 1 as const,
        repertoires: {
          r1: {
            id: "r1",
            name: "Cloud",
            side: "white" as const,
            category: null,
            reviewEnabled: true,
            children: [],
            origin: { kind: "custom" as const },
            createdAt: 1,
            updatedAt: 1,
          },
        },
        order: ["r1"],
        deleted: { old: 5 },
      };
      store.applyRemoteState(remote);
      store.applyRemoteState(JSON.parse(JSON.stringify(remote)));

      expect(sources).toEqual(["remote"]);
      expect(store.getSnapshot().repertoires.r1.name).toBe("Cloud");
      expect(JSON.parse(data[STORAGE_KEY]).deleted).toEqual({ old: 5 });
    });

    it("signale la présence de données à migrer", async () => {
      const store = await load();
      expect(store.hasRepertoireData(store.getSnapshot())).toBe(false);
      const id = unwrap(store.createRepertoire({ name: "A", side: "white" }));
      expect(store.hasRepertoireData(store.getSnapshot())).toBe(true);
      store.deleteRepertoire(id);
      expect(store.hasRepertoireData(store.getSnapshot())).toBe(false); // pierres tombales seules
    });
  });
});

// ---------------------------------------------------------------------------
describe("sanitizeRepertoireState", () => {
  const valid = (overrides: Record<string, unknown> = {}) => ({
    id: "r1",
    name: "Mon répertoire",
    side: "white",
    children: [],
    ...overrides,
  });
  const state = (repertoires: unknown[], order?: unknown) => ({
    version: 1,
    repertoires: Object.fromEntries(repertoires.map((r, i) => [`k${i}`, r])),
    ...(order !== undefined ? { order } : {}),
  });

  it("rejette un format inconnu", () => {
    expect(sanitizeRepertoireState(null)).toBeNull();
    expect(sanitizeRepertoireState("x")).toBeNull();
    expect(sanitizeRepertoireState({ version: 2, repertoires: {} })).toBeNull();
  });

  it("ignore les répertoires sans identifiant ou sans couleur valide", () => {
    const result = sanitizeRepertoireState(
      state([valid(), valid({ id: "" }), valid({ id: "r3", side: "rouge" }), "oups", null]),
    )!;
    expect(Object.keys(result.repertoires)).toEqual(["r1"]);
  });

  it("applique des valeurs par défaut aux champs manquants ou invalides", () => {
    const result = sanitizeRepertoireState(
      state([valid({ name: "   ", category: 12, reviewEnabled: "oui", origin: { kind: "???" } })]),
    )!;
    expect(result.repertoires.r1).toMatchObject({
      name: "Sans titre",
      category: null,
      reviewEnabled: true,
      origin: { kind: "custom" },
    });
  });

  it("conserve une origine « modèle » valide", () => {
    const result = sanitizeRepertoireState(
      state([valid({ origin: { kind: "template", templateId: "carlsen-e4", version: 3 } })]),
    )!;
    expect(result.repertoires.r1.origin).toEqual({ kind: "template", templateId: "carlsen-e4", version: 3 });
  });

  it("nettoie les arbres : nœuds invalides, coups en double, symboles et flèches", () => {
    const result = sanitizeRepertoireState(
      state([
        valid({
          children: [
            { id: "a", san: "e4", symbol: "!", comment: "  ok  ", arrows: [["e2", "e4"], ["bad"]], children: [] },
            { id: "b", san: "e4", children: [] }, // doublon chez un frère
            { id: "c", children: [] }, // sans coup
            { id: "d", san: "d4", symbol: "wow", children: "pas un tableau" },
            "oups",
          ],
        }),
      ]),
    )!;
    const [first, second, ...rest] = result.repertoires.r1.children;
    expect(rest).toHaveLength(0);
    expect(first).toMatchObject({ san: "e4", symbol: "!", comment: "ok", arrows: [["e2", "e4"]] });
    expect(second).toMatchObject({ san: "d4", children: [] });
    expect("symbol" in second).toBe(false);
  });

  it("régénère les identifiants manquants ou répétés pour qu'ils soient uniques", () => {
    const result = sanitizeRepertoireState(
      state([
        valid({
          children: [
            { id: "dup", san: "e4", children: [{ id: "dup", san: "e5", children: [] }] },
            { san: "d4", children: [{ id: "root", san: "d5", children: [] }] },
          ],
        }),
      ]),
    )!;
    const ids: string[] = [];
    const visit = (nodes: RepertoireNode[]) =>
      nodes.forEach((n) => {
        ids.push(n.id);
        visit(n.children);
      });
    visit(result.repertoires.r1.children);
    expect(ids).toHaveLength(4);
    expect(new Set(ids).size).toBe(4);
    expect(ids).not.toContain("root");
  });

  it("coupe les branches anormalement profondes sans planter", () => {
    let deep: unknown[] = [];
    for (let i = 0; i < REPERTOIRE_LIMITS.maxDepth + 50; i++) {
      deep = [{ id: `n${i}`, san: "Nf3", children: deep }];
    }
    const result = sanitizeRepertoireState(state([valid({ children: deep })]))!;
    let depth = 0;
    let nodes = result.repertoires.r1.children;
    while (nodes.length > 0) {
      depth += 1;
      nodes = nodes[0].children;
    }
    expect(depth).toBeLessThanOrEqual(REPERTOIRE_LIMITS.maxDepth);
  });

  it("répare l'ordre : retire les inconnus et les doublons, ajoute les oubliés par ancienneté", () => {
    const result = sanitizeRepertoireState(
      state(
        [
          valid({ id: "a", createdAt: 300 }),
          valid({ id: "b", createdAt: 100 }),
          valid({ id: "c", createdAt: 200 }),
        ],
        ["c", "inconnu", "c"],
      ),
    )!;
    expect(result.order).toEqual(["c", "b", "a"]);
  });

  it("lit les données d'avant la synchronisation (sans pierres tombales)", () => {
    expect(sanitizeRepertoireState(state([valid()]))!.deleted).toEqual({});
  });

  it("garde les pierres tombales valides, sauf pour un répertoire encore présent", () => {
    const result = sanitizeRepertoireState({
      ...state([valid()]),
      deleted: { r1: 50, gone: 70, bad: "hier", "": 3 },
    })!;
    expect(result.deleted).toEqual({ gone: 70 });
    expect(result.repertoires.r1).toBeDefined();
  });
});
