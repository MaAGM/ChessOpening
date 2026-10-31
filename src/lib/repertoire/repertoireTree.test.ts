import { describe, expect, it } from "vitest";
import { Chess } from "chess.js";
import {
  INITIAL_FEN,
  addMove,
  collectIds,
  computeFens,
  computeFensIncremental,
  countNodes,
  deleteBranch,
  demoteVariation,
  findInvalidNodeIds,
  getAdjacentVariationId,
  getChildren,
  getFenAt,
  getLineEndId,
  getMainChildId,
  getNode,
  getParentId,
  getPathIds,
  getPathSans,
  makeMainLine,
  maxDepth,
  mergeTrees,
  promoteVariation,
  updateNode,
} from "./repertoireTree";
import { ROOT_ID, type RepertoireNode, type TreeRoot } from "./types";

/** Identifiants prévisibles : n1, n2, n3… */
function counterIds() {
  let n = 0;
  return () => `n${++n}`;
}

type Built = { root: TreeRoot; ids: Record<string, string> };

/**
 * Construit un arbre à partir de lignes de coups. L'index `ids` donne l'identifiant
 * du nœud atteint par un chemin « e4 e5 Nf3 » (clé = coups séparés par des espaces).
 */
function build(...lines: string[][]): Built {
  const idFactory = counterIds();
  let root: TreeRoot = { children: [] };
  const ids: Record<string, string> = {};

  for (const line of lines) {
    let parentId = ROOT_ID;
    const path: string[] = [];
    for (const san of line) {
      const result = addMove(root, parentId, san, { idFactory });
      if (!result.ok) throw new Error(`addMove a échoué : ${result.error}`);
      root = result.root;
      path.push(san);
      ids[path.join(" ")] = result.nodeId;
      parentId = result.nodeId;
    }
  }
  return { root, ids };
}

const sansOf = (nodes: RepertoireNode[]) => nodes.map((n) => n.san);

describe("addMove", () => {
  it("crée un premier coup puis une suite", () => {
    const { root } = build(["e4", "e5"]);
    expect(root.children).toHaveLength(1);
    expect(root.children[0].san).toBe("e4");
    expect(root.children[0].children[0].san).toBe("e5");
  });

  it("ne duplique pas un coup déjà présent et renvoie le même arbre", () => {
    const { root, ids } = build(["e4", "e5"]);
    const again = addMove(root, ROOT_ID, "e4");
    expect(again).toMatchObject({ ok: true, created: false, nodeId: ids.e4 });
    if (again.ok) expect(again.root).toBe(root);
  });

  it("ajoute une variante après la ligne principale", () => {
    const { root, ids } = build(["e4", "e5"], ["e4", "c5"]);
    const children = getChildren(root, ids.e4)!;
    expect(sansOf(children)).toEqual(["e5", "c5"]); // la ligne principale ne bouge pas
  });

  it("signale un parent inconnu, un coup vide et la limite de coups", () => {
    const { root } = build(["e4", "e5"]);
    expect(addMove(root, "inconnu", "Nf3")).toEqual({ ok: false, error: "parent-not-found" });
    expect(addMove(root, ROOT_ID, "  ")).toEqual({ ok: false, error: "empty-move" });
    expect(addMove(root, ROOT_ID, "d4", { maxNodes: 2 })).toEqual({
      ok: false,
      error: "limit-reached",
    });
  });

  it("ne mute pas l'arbre d'origine et partage les branches inchangées", () => {
    const { root, ids } = build(["e4", "e5"], ["d4", "d5"]);
    const before = JSON.stringify(root);
    const result = addMove(root, ids.e4, "c5");
    expect(JSON.stringify(root)).toBe(before);
    if (!result.ok) throw new Error("échec inattendu");
    expect(result.root.children[1]).toBe(root.children[1]); // branche d4 : même référence
  });

  it("génère des identifiants uniques", () => {
    let root: TreeRoot = { children: [] };
    let parent = ROOT_ID;
    for (const san of ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6", "O-O", "Be7"]) {
      const result = addMove(root, parent, san);
      if (!result.ok) throw new Error("échec inattendu");
      root = result.root;
      parent = result.nodeId;
    }
    expect(collectIds(root).size).toBe(countNodes(root));
    expect(collectIds(root).has(ROOT_ID)).toBe(false);
  });
});

describe("deleteBranch", () => {
  it("supprime le nœud et toute sa descendance, et renvoie le parent", () => {
    const { root, ids } = build(["e4", "e5", "Nf3"], ["e4", "c5"]);
    const result = deleteBranch(root, ids["e4 e5"])!;
    expect(result.parentId).toBe(ids.e4);
    expect(sansOf(getChildren(result.root, ids.e4)!)).toEqual(["c5"]);
    expect(getNode(result.root, ids["e4 e5 Nf3"])).toBeNull();
    expect(countNodes(root)).toBe(4); // l'original est intact
  });

  it("renvoie la racine comme parent d'un premier coup", () => {
    const { root, ids } = build(["e4", "e5"], ["d4"]);
    const result = deleteBranch(root, ids.e4)!;
    expect(result.parentId).toBe(ROOT_ID);
    expect(sansOf(result.root.children)).toEqual(["d4"]);
  });

  it("renvoie null pour un nœud inconnu", () => {
    expect(deleteBranch(build(["e4"]).root, "inconnu")).toBeNull();
  });
});

describe("promouvoir / rétrograder une variante", () => {
  it("remonte une variante d'un rang et rétrograde dans l'autre sens", () => {
    const { root, ids } = build(["e4", "e5"], ["e4", "c5"], ["e4", "e6"]);
    const promoted = promoteVariation(root, ids["e4 e6"]);
    expect(sansOf(getChildren(promoted, ids.e4)!)).toEqual(["e5", "e6", "c5"]);

    const demoted = demoteVariation(promoted, ids["e4 e6"]);
    expect(sansOf(getChildren(demoted, ids.e4)!)).toEqual(["e5", "c5", "e6"]);
  });

  it("est sans effet (même arbre) aux extrémités ou pour un id inconnu", () => {
    const { root, ids } = build(["e4", "e5"], ["e4", "c5"]);
    expect(promoteVariation(root, ids["e4 e5"])).toBe(root);
    expect(demoteVariation(root, ids["e4 c5"])).toBe(root);
    expect(promoteVariation(root, "inconnu")).toBe(root);
  });
});

describe("makeMainLine", () => {
  it("fait d'une variante profonde la ligne principale, à chaque fourche", () => {
    const { root, ids } = build(
      ["e4", "e5", "Nf3", "Nc6"],
      ["e4", "e5", "Nf3", "d6"],
      ["e4", "c5", "Nf3"],
    );
    const result = makeMainLine(root, ids["e4 e5 Nf3 d6"]);
    expect(getLineEndId(result, ROOT_ID)).toBe(ids["e4 e5 Nf3 d6"]);
    expect(sansOf(getChildren(result, ids["e4 e5 Nf3"])!)).toEqual(["d6", "Nc6"]);
  });

  it("promeut aussi les fourches plus haut dans la ligne", () => {
    const { root, ids } = build(["e4", "e5", "Nf3"], ["e4", "c5", "Nf3"]);
    const result = makeMainLine(root, ids["e4 c5 Nf3"]);
    expect(getPathSans(result, getLineEndId(result))).toEqual(["e4", "c5", "Nf3"]);
    expect(sansOf(getChildren(result, ids.e4)!)).toEqual(["c5", "e5"]);
  });

  it("renvoie le même arbre si la ligne est déjà principale ou si l'id est inconnu", () => {
    const { root, ids } = build(["e4", "e5", "Nf3"], ["e4", "c5"]);
    expect(makeMainLine(root, ids["e4 e5 Nf3"])).toBe(root);
    expect(makeMainLine(root, "inconnu")).toBe(root);
  });

  it("ne mute pas l'arbre d'origine", () => {
    const { root, ids } = build(["e4", "e5"], ["e4", "c5"]);
    const before = JSON.stringify(root);
    makeMainLine(root, ids["e4 c5"]);
    expect(JSON.stringify(root)).toBe(before);
  });
});

describe("updateNode", () => {
  it("pose un symbole et un commentaire, et les retire", () => {
    const { root, ids } = build(["e4", "e5"]);
    const annotated = updateNode(root, ids.e4, { symbol: "!?", comment: "  Coup roi  " });
    expect(getNode(annotated, ids.e4)).toMatchObject({ symbol: "!?", comment: "Coup roi" });

    const cleared = updateNode(annotated, ids.e4, { symbol: undefined, comment: "   " });
    const node = getNode(cleared, ids.e4)!;
    expect("symbol" in node).toBe(false);
    expect("comment" in node).toBe(false);
  });

  it("ne touche pas aux champs absents du patch", () => {
    const { root, ids } = build(["e4"]);
    const withSymbol = updateNode(root, ids.e4, { symbol: "!" });
    const withComment = updateNode(withSymbol, ids.e4, { comment: "ok" });
    expect(getNode(withComment, ids.e4)).toMatchObject({ symbol: "!", comment: "ok" });
  });

  it("gère les flèches", () => {
    const { root, ids } = build(["e4"]);
    const result = updateNode(root, ids.e4, { arrows: [["e2", "e4"]] });
    expect(getNode(result, ids.e4)!.arrows).toEqual([["e2", "e4"]]);
    expect("arrows" in getNode(updateNode(result, ids.e4, { arrows: [] }), ids.e4)!).toBe(false);
  });

  it("renvoie le même arbre pour un id inconnu ou quand rien ne change", () => {
    const { root, ids } = build(["e4", "e5"]);
    expect(updateNode(root, "inconnu", { symbol: "!" })).toBe(root);

    const annotated = updateNode(root, ids["e4 e5"], { symbol: "!", comment: "ok" });
    expect(updateNode(annotated, ids["e4 e5"], { symbol: "!", comment: " ok " })).toBe(annotated);
  });
});

describe("navigation", () => {
  const { root, ids } = build(["e4", "e5", "Nf3"], ["e4", "c5"], ["d4"]);

  it("donne le chemin d'un nœud", () => {
    expect(getPathSans(root, ids["e4 e5 Nf3"])).toEqual(["e4", "e5", "Nf3"]);
    expect(getPathIds(root, ids["e4 e5"])).toEqual([ids.e4, ids["e4 e5"]]);
    expect(getPathSans(root, ROOT_ID)).toEqual([]);
    expect(getPathSans(root, "inconnu")).toEqual([]);
  });

  it("trouve le parent (la racine pour un premier coup)", () => {
    expect(getParentId(root, ids["e4 e5"])).toBe(ids.e4);
    expect(getParentId(root, ids.e4)).toBe(ROOT_ID);
    expect(getParentId(root, ROOT_ID)).toBeNull();
    expect(getParentId(root, "inconnu")).toBeNull();
  });

  it("trouve la suite principale, y compris depuis la racine", () => {
    expect(getMainChildId(root, ROOT_ID)).toBe(ids.e4);
    expect(getMainChildId(root, ids.e4)).toBe(ids["e4 e5"]);
    expect(getMainChildId(root, ids["e4 e5 Nf3"])).toBeNull();
  });

  it("passe d'une variante à sa voisine, sans boucler", () => {
    expect(getAdjacentVariationId(root, ids["e4 e5"], 1)).toBe(ids["e4 c5"]);
    expect(getAdjacentVariationId(root, ids["e4 c5"], -1)).toBe(ids["e4 e5"]);
    expect(getAdjacentVariationId(root, ids["e4 e5"], -1)).toBeNull();
    expect(getAdjacentVariationId(root, ids["e4 c5"], 1)).toBeNull();
  });

  it("trouve la fin de la ligne principale", () => {
    expect(getLineEndId(root)).toBe(ids["e4 e5 Nf3"]);
    expect(getLineEndId(root, ids.d4)).toBe(ids.d4);
  });

  it("compte les coups et la profondeur", () => {
    expect(countNodes(root)).toBe(5); // e4, e5, Nf3, c5, d4
    expect(maxDepth(root)).toBe(3);
  });
});

describe("positions (FEN)", () => {
  it("calcule la FEN de chaque nœud, racine comprise", () => {
    const { root, ids } = build(["e4", "e5", "Nf3"], ["d4"]);
    const fens = computeFens(root);

    const expected = new Chess();
    expected.move("e4");
    expected.move("e5");
    expected.move("Nf3");

    expect(fens.get(ROOT_ID)).toBe(INITIAL_FEN);
    expect(fens.get(ids["e4 e5 Nf3"])).toBe(expected.fen());
    expect(getFenAt(root, ids["e4 e5 Nf3"])).toBe(expected.fen());
    expect(fens.size).toBe(1 + countNodes(root));
  });

  it("écarte un coup illégal et toute sa descendance", () => {
    const root: TreeRoot = {
      children: [
        { id: "ok", san: "e4", children: [] },
        { id: "bad", san: "Qh5", children: [{ id: "after", san: "e5", children: [] }] },
      ],
    };
    const fens = computeFens(root);
    expect(fens.has("ok")).toBe(true);
    expect(fens.has("bad")).toBe(false);
    expect(fens.has("after")).toBe(false);
    expect(findInvalidNodeIds(root).sort()).toEqual(["after", "bad"]);
    expect(getFenAt(root, "bad")).toBeNull();
    expect(getFenAt(root, "inconnu")).toBeNull();
  });
});

describe("mergeTrees", () => {
  it("ajoute les nouvelles branches, garde les annotations existantes et complète les manques", () => {
    const a = build(["e4", "e5"]);
    const annotatedBase = updateNode(a.root, a.ids["e4 e5"], { comment: "la mienne" });
    const b = build(["e4", "e5", "Nf3"], ["e4", "c5"]);
    const incoming = updateNode(b.root, b.ids["e4 e5"], { comment: "la leur", symbol: "!" });

    const result = mergeTrees(annotatedBase, incoming);

    expect(result.added).toBe(2); // Nf3 et c5
    expect(result.truncated).toBe(false);
    const e5 = getNode(result.root, a.ids["e4 e5"])!;
    expect(e5.comment).toBe("la mienne"); // l'existant gagne
    expect(e5.symbol).toBe("!"); // le manque est complété
    expect(sansOf(e5.children)).toEqual(["Nf3"]);
    expect(sansOf(getChildren(result.root, a.ids.e4)!)).toEqual(["e5", "c5"]);
  });

  it("donne de nouveaux identifiants aux nœuds ajoutés, sans collision", () => {
    const a = build(["e4"]);
    const b = build(["e4", "e5"], ["d4"]); // mêmes ids n1.. que `a`
    const result = mergeTrees(a.root, b.root);
    expect(collectIds(result.root).size).toBe(countNodes(result.root));
  });

  it("ne mute aucune des deux entrées", () => {
    const a = build(["e4", "e5"]);
    const b = build(["e4", "c5"], ["d4"]);
    const before = JSON.stringify([a.root, b.root]);
    mergeTrees(a.root, b.root);
    expect(JSON.stringify([a.root, b.root])).toBe(before);
  });

  it("respecte la limite de coups et le signale", () => {
    const a = build(["e4", "e5"]); // 2 coups
    const b = build(["d4", "d5", "c4"]);
    const result = mergeTrees(a.root, b.root, { maxNodes: 3 });
    expect(result.added).toBe(1);
    expect(result.truncated).toBe(true);
    expect(countNodes(result.root)).toBe(3);
  });
});

describe("computeFensIncremental", () => {
  it("donne le même résultat que computeFens", () => {
    const { root } = build(["e4", "e5", "Nf3", "Nc6"], ["e4", "c5"], ["d4", "d5"]);
    expect([...computeFensIncremental(root)]).toEqual([...computeFens(root)]);
  });

  it("réutilise les positions connues et ne calcule que les nouveaux nœuds", () => {
    const { root, ids } = build(["e4", "e5"]);
    const known = computeFens(root);
    // Une valeur factice prouve que la position connue n'est pas recalculée
    known.set(ids.e4, "VALEUR-EN-CACHE");

    const added = addMove(root, ids["e4 e5"], "Nf3");
    if (!added.ok) throw new Error("échec inattendu");

    const fens = computeFensIncremental(added.root, known);
    expect(fens.get(ids.e4)).toBe("VALEUR-EN-CACHE");
    expect(fens.get(added.nodeId)).toBeDefined(); // calculée pour le nouveau nœud
    expect(fens.size).toBe(1 + countNodes(added.root));
  });

  it("écarte toujours un coup illégal", () => {
    const root: TreeRoot = { children: [{ id: "bad", san: "Qh5", children: [] }] };
    expect(computeFensIncremental(root, new Map()).has("bad")).toBe(false);
  });
});