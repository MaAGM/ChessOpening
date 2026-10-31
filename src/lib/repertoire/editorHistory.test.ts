import { describe, expect, it } from "vitest";
import {
  EMPTY_HISTORY,
  HISTORY_LIMIT,
  canRedo,
  canUndo,
  recordEdit,
  redo,
  undo,
  type EditorSnapshot,
} from "./editorHistory";

const snap = (label: string): EditorSnapshot => ({
  children: [{ id: label, san: "e4", children: [] }],
  cursorId: label,
});

describe("editorHistory", () => {
  it("part d'un historique vide", () => {
    expect(canUndo(EMPTY_HISTORY)).toBe(false);
    expect(canRedo(EMPTY_HISTORY)).toBe(false);
    expect(undo(EMPTY_HISTORY, snap("now"))).toBeNull();
    expect(redo(EMPTY_HISTORY, snap("now"))).toBeNull();
  });

  it("annule puis rétablit en passant par l'état courant", () => {
    const before = snap("avant");
    const current = snap("apres");
    const history = recordEdit(EMPTY_HISTORY, before);
    expect(canUndo(history)).toBe(true);

    const undone = undo(history, current)!;
    expect(undone.snapshot).toBe(before);
    expect(canUndo(undone.history)).toBe(false);
    expect(canRedo(undone.history)).toBe(true);

    const redone = redo(undone.history, before)!;
    expect(redone.snapshot).toBe(current);
    expect(canRedo(redone.history)).toBe(false);
    expect(redone.history.past).toEqual([before]);
  });

  it("efface les « rétablir » dès qu'une nouvelle modification est faite", () => {
    const history = recordEdit(EMPTY_HISTORY, snap("a"));
    const undone = undo(history, snap("b"))!;
    expect(canRedo(undone.history)).toBe(true);

    const edited = recordEdit(undone.history, snap("c"));
    expect(canRedo(edited)).toBe(false);
  });

  it("enchaîne plusieurs annulations dans l'ordre inverse", () => {
    let history = recordEdit(EMPTY_HISTORY, snap("1"));
    history = recordEdit(history, snap("2"));
    history = recordEdit(history, snap("3"));

    const first = undo(history, snap("4"))!;
    const second = undo(first.history, first.snapshot)!;
    expect(first.snapshot.cursorId).toBe("3");
    expect(second.snapshot.cursorId).toBe("2");
  });

  it("borne la taille de l'historique en gardant les modifications les plus récentes", () => {
    let history = EMPTY_HISTORY;
    for (let i = 0; i < HISTORY_LIMIT + 25; i++) history = recordEdit(history, snap(String(i)));

    expect(history.past).toHaveLength(HISTORY_LIMIT);
    expect(history.past[0].cursorId).toBe("25");
    expect(history.past[HISTORY_LIMIT - 1].cursorId).toBe(String(HISTORY_LIMIT + 24));
  });

  it("ne mute pas l'historique d'origine", () => {
    const history = recordEdit(EMPTY_HISTORY, snap("a"));
    const copy = JSON.stringify(history);
    undo(history, snap("b"));
    recordEdit(history, snap("c"));
    expect(JSON.stringify(history)).toBe(copy);
  });
});
