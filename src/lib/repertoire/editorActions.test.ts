import { describe, expect, it } from "vitest";
import {
  branchSize,
  canMakeMainLine,
  canPromote,
  deleteCurrent,
  makeMainLineCurrent,
  navigate,
  playMove,
  promoteCurrent,
  type EditorState,
} from "./editorActions";
import { getChildren, getPathSans } from "./repertoireTree";
import { ROOT_ID, type RepertoireNode } from "./types";

const node = (id: string, san: string, children: RepertoireNode[] = []): RepertoireNode => ({
  id,
  san,
  children,
});

/**
 *   e4 ── e5 ── Nf3 ── Nc6
 *    │      └── (variante) c5 ── Nf3
 *   d4 ── d5
 */
const tree = (): RepertoireNode[] => [
  node("e4", "e4", [
    node("e5", "e5", [node("nf3", "Nf3", [node("nc6", "Nc6")])]),
    node("c5", "c5", [node("nf3b", "Nf3")]),
  ]),
  node("d4", "d4", [node("d5", "d5")]),
];

const at = (cursorId: string): EditorState => ({ children: tree(), cursorId });

describe("navigate", () => {
  it("recule d'un coup, jusqu'à la position initiale, puis s'arrête", () => {
    expect(navigate(at("nf3"), "back")).toBe("e5");
    expect(navigate(at("e4"), "back")).toBe(ROOT_ID);
    expect(navigate(at(ROOT_ID), "back")).toBe(ROOT_ID);
  });

  it("avance dans la ligne principale, ou reste à la fin", () => {
    expect(navigate(at(ROOT_ID), "forward")).toBe("e4");
    expect(navigate(at("e4"), "forward")).toBe("e5");
    expect(navigate(at("nc6"), "forward")).toBe("nc6");
  });

  it("passe d'une variante à l'autre sans boucler", () => {
    expect(navigate(at("e5"), "nextVariation")).toBe("c5");
    expect(navigate(at("c5"), "previousVariation")).toBe("e5");
    expect(navigate(at("e5"), "previousVariation")).toBe("e5");
    expect(navigate(at("c5"), "nextVariation")).toBe("c5");
    expect(navigate(at(ROOT_ID), "nextVariation")).toBe(ROOT_ID);
  });

  it("va au début ou à la fin de la ligne", () => {
    expect(navigate(at("nc6"), "start")).toBe(ROOT_ID);
    expect(navigate(at("e4"), "end")).toBe("nc6");
    expect(navigate(at("c5"), "end")).toBe("nf3b"); // fin de SA ligne
  });
});

describe("playMove", () => {
  it("crée une suite principale sous un nœud sans suite", () => {
    const result = playMove(at("nc6"), "Bb5");
    if (!result.ok) throw new Error("échec inattendu");
    expect(result.created).toBe(true);
    expect(getPathSans(result.state, result.state.cursorId)).toEqual(["e4", "e5", "Nf3", "Nc6", "Bb5"]);
  });

  it("crée une variante, sans toucher à la ligne principale, quand le nœud a déjà des suites", () => {
    // Retour au coup 1 : on joue une alternative aux Noirs sans rejouer 1.e4
    const result = playMove(at("e4"), "e6");
    if (!result.ok) throw new Error("échec inattendu");
    expect(result.created).toBe(true);
    expect(getChildren(result.state, "e4")!.map((n) => n.san)).toEqual(["e5", "c5", "e6"]);
    expect(navigate(at("e4"), "forward")).toBe("e5"); // la ligne principale reste e5
  });

  it("se place sur le coup s'il existe déjà, sans modifier l'arbre", () => {
    const state = at("e4");
    const result = playMove(state, "c5");
    if (!result.ok) throw new Error("échec inattendu");
    expect(result.created).toBe(false);
    expect(result.state.cursorId).toBe("c5");
    expect(result.state.children).toBe(state.children);
  });

  it("joue depuis la position initiale", () => {
    const result = playMove(at(ROOT_ID), "c4");
    if (!result.ok) throw new Error("échec inattendu");
    expect(result.state.children.map((n) => n.san)).toEqual(["e4", "d4", "c4"]);
  });

  it("signale la limite de coups", () => {
    expect(playMove(at("e4"), "Nf6", { maxNodes: 5 })).toEqual({ ok: false, error: "limit-reached" });
  });
});

describe("suppression", () => {
  it("calcule la taille d'une branche", () => {
    expect(branchSize(at("nc6"))).toBe(1);
    expect(branchSize(at("e5"))).toBe(3); // e5, Nf3, Nc6
    expect(branchSize(at("e4"))).toBe(6);
    expect(branchSize(at(ROOT_ID))).toBe(0);
  });

  it("supprime la branche et replace le curseur sur le parent", () => {
    const next = deleteCurrent(at("c5"))!;
    expect(next.cursorId).toBe("e4");
    expect(getChildren(next, "e4")!.map((n) => n.san)).toEqual(["e5"]);
  });

  it("replace sur la position initiale après suppression d'un premier coup", () => {
    expect(deleteCurrent(at("d4"))!.cursorId).toBe(ROOT_ID);
  });

  it("ne supprime rien à la position initiale", () => {
    expect(deleteCurrent(at(ROOT_ID))).toBeNull();
  });
});

describe("promotion", () => {
  it("n'est possible que pour une variante qui a un frère avant elle", () => {
    expect(canPromote(at("c5"))).toBe(true);
    expect(canPromote(at("e5"))).toBe(false);
    expect(canPromote(at(ROOT_ID))).toBe(false);
  });

  it("remonte la variante d'un rang et garde le curseur", () => {
    const next = promoteCurrent(at("c5"));
    expect(getChildren(next, "e4")!.map((n) => n.san)).toEqual(["c5", "e5"]);
    expect(next.cursorId).toBe("c5");
  });

  it("renvoie le même état quand il n'y a rien à promouvoir", () => {
    const state = at("e5");
    expect(promoteCurrent(state)).toBe(state);
  });

  it("fait de la ligne affichée la ligne principale", () => {
    expect(canMakeMainLine(at("nf3b"))).toBe(true);
    expect(canMakeMainLine(at("nc6"))).toBe(false); // déjà la ligne principale
    expect(canMakeMainLine(at(ROOT_ID))).toBe(false);

    const next = makeMainLineCurrent(at("nf3b"));
    expect(navigate(next, "end")).toBe("nf3b");
    expect(getChildren(next, "e4")!.map((n) => n.san)).toEqual(["c5", "e5"]);
  });
});
