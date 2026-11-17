// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { Chess } from "chess.js";
import { useState } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import type { PanelMode } from "./useTrainerMode";
import { useRepertoireEditor } from "./useRepertoireEditor";
import { INITIAL_FEN } from "@/lib/repertoire/repertoireTree";
import {
  createRepertoire,
  getSnapshot,
  updateRepertoireTree,
} from "@/lib/repertoire/repertoireStore";
import { toPositionKey } from "@/lib/review/positionKey";

/**
 * Mini-échiquier : reproduit ce que fournit useChessGame (position, coup joué, sélection
 * par clic, affichage d'une position) pour tester le hook de l'éditeur sans l'interface.
 */
function useHarness(repertoireId: string | null, panelMode: PanelMode = "repertoire_editor") {
  const [fen, setFen] = useState(INITIAL_FEN);
  const [selected, setSelected] = useState<string | null>(null);

  const applyMove = (from: string, to: string): boolean => {
    const game = new Chess(fen);
    try {
      game.move({ from, to, promotion: "q" });
    } catch {
      return false;
    }
    setFen(game.fen());
    return true;
  };

  const onPieceDrop = (from: string, to: string | null) => (to ? applyMove(from, to) : false);

  const onSquareClick = (square: string) => {
    const game = new Chess(fen);
    const piece = game.get(square as never);
    const own = Boolean(piece) && piece?.color === game.turn();
    if (selected && selected !== square && !own) {
      applyMove(selected, square);
      setSelected(null);
    } else if (selected === square) {
      setSelected(null);
    } else if (own) {
      setSelected(square);
    }
  };

  const editor = useRepertoireEditor({
    repertoireId,
    panelMode,
    currentFen: fen,
    onPieceDrop,
    onSquareClick,
    loadPosition: setFen,
    clearSelection: () => setSelected(null),
  });

  return { editor, fen };
}

let counter = 0;
function newRepertoire(): string {
  const result = createRepertoire({ name: `Test ${++counter}`, side: "white" });
  if (!result.ok) throw new Error("création impossible");
  return result.value;
}

const keydown = (key: string, init: KeyboardEventInit = {}, target: EventTarget = window) =>
  act(() => {
    target.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, ...init }));
  });

const sansOf = (nodes: { san: string }[]) => nodes.map((n) => n.san);
const keyOf = (fen: string) => toPositionKey(fen);

beforeEach(() => {
  window.localStorage.clear();
});

describe("useRepertoireEditor", () => {
  describe("échiquier -> arbre", () => {
    it("crée la branche du coup joué, place le curseur dessus et reste synchronisé avec l'échiquier", () => {
      const id = newRepertoire();
      const { result } = renderHook(() => useHarness(id));

      act(() => {
        result.current.editor.handlePieceDrop("e2", "e4");
      });

      const { editor, fen } = result.current;
      expect(sansOf(editor.repertoire!.children)).toEqual(["e4"]);
      expect(editor.currentNode?.san).toBe("e4");
      expect(keyOf(fen)).toBe(keyOf(editor.fens.get(editor.cursorId)!));
    });

    it("enregistre l'arbre dans le store dès le coup joué", () => {
      const id = newRepertoire();
      const { result } = renderHook(() => useHarness(id));
      act(() => {
        result.current.editor.handlePieceDrop("e2", "e4");
        // un second coup dans le même événement n'est pas possible : la position a changé
      });
      expect(sansOf(getSnapshot().repertoires[id].children)).toEqual(["e4"]);
    });

    it("refuse un coup illégal sans rien modifier", () => {
      const id = newRepertoire();
      const { result } = renderHook(() => useHarness(id));

      let accepted = true;
      act(() => {
        accepted = result.current.editor.handlePieceDrop("e2", "e5");
      });

      expect(accepted).toBe(false);
      expect(result.current.editor.repertoire!.children).toHaveLength(0);
      expect(result.current.fen).toBe(INITIAL_FEN);
    });

    it("joue au clic : sélection puis destination", () => {
      const id = newRepertoire();
      const { result } = renderHook(() => useHarness(id));

      act(() => result.current.editor.handleSquareClick("e2"));
      act(() => result.current.editor.handleSquareClick("e4"));

      expect(sansOf(result.current.editor.repertoire!.children)).toEqual(["e4"]);
      expect(result.current.editor.currentNode?.san).toBe("e4");
    });

    it("ne fait rien quand l'éditeur n'est pas affiché", () => {
      const id = newRepertoire();
      const { result } = renderHook(() => useHarness(id, "menu"));
      let accepted = true;
      act(() => {
        accepted = result.current.editor.handlePieceDrop("e2", "e4");
      });
      expect(accepted).toBe(false);
      expect(result.current.editor.repertoire!.children).toHaveLength(0);
    });
  });

  describe("arbre -> échiquier", () => {
    function playLine(result: { current: ReturnType<typeof useHarness> }, moves: [string, string][]) {
      for (const [from, to] of moves) {
        act(() => {
          result.current.editor.handlePieceDrop(from, to);
        });
      }
    }

    it("affiche la position d'un nœud quand on se déplace dans l'arbre", () => {
      const id = newRepertoire();
      const { result } = renderHook(() => useHarness(id));
      playLine(result, [["e2", "e4"], ["e7", "e5"], ["g1", "f3"]]);

      const e4Id = result.current.editor.repertoire!.children[0].id;
      act(() => result.current.editor.goTo(e4Id));

      expect(result.current.editor.cursorId).toBe(e4Id);
      expect(keyOf(result.current.fen)).toBe(keyOf(result.current.editor.fens.get(e4Id)!));
    });

    it("bifurque sans rejouer les premiers coups : retour au coup 1, alternative des Noirs", () => {
      const id = newRepertoire();
      const { result } = renderHook(() => useHarness(id));
      playLine(result, [["e2", "e4"], ["e7", "e5"], ["g1", "f3"]]);

      act(() => result.current.editor.move("back"));
      act(() => result.current.editor.move("back")); // après 1.e4
      playLine(result, [["c7", "c5"]]);

      const e4 = result.current.editor.repertoire!.children[0];
      expect(sansOf(e4.children)).toEqual(["e5", "c5"]); // variante ajoutée, ligne principale intacte
      expect(result.current.editor.currentNode?.san).toBe("c5");
    });

    it("rejouer un coup existant se place dessus sans dupliquer ni créer d'historique", () => {
      const id = newRepertoire();
      const { result } = renderHook(() => useHarness(id));
      playLine(result, [["e2", "e4"]]);
      act(() => result.current.editor.goTo("root"));
      playLine(result, [["e2", "e4"]]);

      expect(sansOf(result.current.editor.repertoire!.children)).toEqual(["e4"]);

      act(() => result.current.editor.undo()); // annule la création, la seule modification
      expect(result.current.editor.repertoire!.children).toHaveLength(0);
      expect(result.current.editor.canUndo).toBe(false);
    });

    it("ignore une navigation vers un nœud inconnu", () => {
      const id = newRepertoire();
      const { result } = renderHook(() => useHarness(id));
      playLine(result, [["e2", "e4"]]);
      const before = result.current.editor.cursorId;
      act(() => result.current.editor.goTo("inconnu"));
      expect(result.current.editor.cursorId).toBe(before);
    });
  });

  describe("annuler / rétablir", () => {
    it("annule et rétablit un coup, curseur et échiquier compris", () => {
      const id = newRepertoire();
      const { result } = renderHook(() => useHarness(id));
      act(() => {
        result.current.editor.handlePieceDrop("e2", "e4");
      });
      act(() => {
        result.current.editor.handlePieceDrop("e7", "e5");
      });

      act(() => result.current.editor.undo());
      expect(sansOf(result.current.editor.repertoire!.children[0].children)).toEqual([]);
      expect(result.current.editor.currentNode?.san).toBe("e4");
      expect(keyOf(result.current.fen)).toBe(
        keyOf(result.current.editor.fens.get(result.current.editor.cursorId)!),
      );

      act(() => result.current.editor.redo());
      expect(result.current.editor.currentNode?.san).toBe("e5");
      expect(result.current.editor.canRedo).toBe(false);
    });
  });

  describe("suppression", () => {
    it("supprime tout de suite un coup isolé", () => {
      const id = newRepertoire();
      const { result } = renderHook(() => useHarness(id));
      act(() => {
        result.current.editor.handlePieceDrop("e2", "e4");
      });

      act(() => result.current.editor.requestDelete());

      expect(result.current.editor.pendingDelete).toBeNull();
      expect(result.current.editor.repertoire!.children).toHaveLength(0);
      expect(result.current.editor.cursorId).toBe("root");
    });

    it("demande confirmation pour une branche, puis la supprime et remonte au parent", () => {
      const id = newRepertoire();
      const { result } = renderHook(() => useHarness(id));
      act(() => {
        result.current.editor.handlePieceDrop("e2", "e4");
      });
      act(() => {
        result.current.editor.handlePieceDrop("e7", "e5");
      });
      act(() => result.current.editor.move("back")); // sur e4 (qui a une suite)

      act(() => result.current.editor.requestDelete());
      expect(result.current.editor.pendingDelete).toMatchObject({ san: "e4", size: 2 });
      expect(result.current.editor.repertoire!.children).toHaveLength(1); // pas encore supprimé

      act(() => result.current.editor.confirmDelete());
      expect(result.current.editor.repertoire!.children).toHaveLength(0);
      expect(result.current.editor.cursorId).toBe("root");
      expect(result.current.editor.pendingDelete).toBeNull();

      act(() => result.current.editor.undo()); // la suppression est annulable
      expect(sansOf(result.current.editor.repertoire!.children)).toEqual(["e4"]);
    });

    it("annule la demande de suppression", () => {
      const id = newRepertoire();
      const { result } = renderHook(() => useHarness(id));
      act(() => {
        result.current.editor.handlePieceDrop("e2", "e4");
      });
      act(() => {
        result.current.editor.handlePieceDrop("e7", "e5");
      });
      act(() => result.current.editor.move("back"));
      act(() => result.current.editor.requestDelete());
      act(() => result.current.editor.cancelDelete());

      expect(result.current.editor.pendingDelete).toBeNull();
      expect(result.current.editor.repertoire!.children).toHaveLength(1);
    });
  });

  describe("promotion", () => {
    function twoVariations() {
      const id = newRepertoire();
      const hook = renderHook(() => useHarness(id));
      act(() => {
        hook.result.current.editor.handlePieceDrop("e2", "e4");
      });
      act(() => {
        hook.result.current.editor.handlePieceDrop("e7", "e5");
      });
      act(() => hook.result.current.editor.move("back"));
      act(() => {
        hook.result.current.editor.handlePieceDrop("c7", "c5");
      });
      return hook.result;
    }

    it("remonte une variante d'un rang", () => {
      const result = twoVariations();
      expect(result.current.editor.canPromote).toBe(true);

      act(() => result.current.editor.promote());

      expect(sansOf(result.current.editor.repertoire!.children[0].children)).toEqual(["c5", "e5"]);
      expect(result.current.editor.currentNode?.san).toBe("c5"); // le curseur suit
      expect(result.current.editor.canPromote).toBe(false);
    });

    it("fait de la variante la ligne principale", () => {
      const result = twoVariations();
      expect(result.current.editor.canMakeMainLine).toBe(true);

      act(() => result.current.editor.makeMainLine());

      expect(sansOf(result.current.editor.repertoire!.children[0].children)).toEqual(["c5", "e5"]);
      expect(result.current.editor.canMakeMainLine).toBe(false);
    });
  });

  describe("clavier", () => {
    function withLine() {
      const id = newRepertoire();
      const hook = renderHook(() => useHarness(id));
      act(() => {
        hook.result.current.editor.handlePieceDrop("e2", "e4");
      });
      act(() => {
        hook.result.current.editor.handlePieceDrop("e7", "e5");
      });
      return hook.result;
    }

    it("navigue avec les flèches", () => {
      const result = withLine();
      keydown("ArrowLeft");
      expect(result.current.editor.currentNode?.san).toBe("e4");
      keydown("ArrowRight");
      expect(result.current.editor.currentNode?.san).toBe("e5");
      keydown("Home");
      expect(result.current.editor.cursorId).toBe("root");
      keydown("End");
      expect(result.current.editor.currentNode?.san).toBe("e5");
    });

    it("annule avec Ctrl+Z et rétablit avec Ctrl+Maj+Z", () => {
      const result = withLine();
      keydown("z", { ctrlKey: true });
      expect(result.current.editor.currentNode?.san).toBe("e4");
      keydown("z", { ctrlKey: true, shiftKey: true });
      expect(result.current.editor.currentNode?.san).toBe("e5");
    });

    it("supprime avec Suppr, confirme avec Entrée et annule avec Échap", () => {
      const result = withLine();
      keydown("ArrowLeft"); // sur e4, qui a une suite
      keydown("Delete");
      expect(result.current.editor.pendingDelete).not.toBeNull();

      keydown("Escape");
      expect(result.current.editor.pendingDelete).toBeNull();
      expect(result.current.editor.repertoire!.children).toHaveLength(1);

      keydown("Delete");
      keydown("Enter");
      expect(result.current.editor.repertoire!.children).toHaveLength(0);
    });

    it("ignore les touches quand le focus est dans un champ de saisie", () => {
      const result = withLine();
      const input = document.createElement("input");
      document.body.appendChild(input);

      keydown("ArrowLeft", {}, input);
      keydown("Delete", {}, input);

      expect(result.current.editor.currentNode?.san).toBe("e5");
      expect(result.current.editor.pendingDelete).toBeNull();
      input.remove();
    });

    it("ne réagit plus quand l'éditeur n'est pas affiché", () => {
      const id = newRepertoire();
      const hook = renderHook(
        ({ mode }: { mode: PanelMode }) => useHarness(id, mode),
        { initialProps: { mode: "repertoire_editor" as PanelMode } },
      );
      act(() => {
        hook.result.current.editor.handlePieceDrop("e2", "e4");
      });
      hook.rerender({ mode: "menu" });

      keydown("ArrowLeft");
      expect(hook.result.current.editor.cursorId).not.toBe("root");
    });
  });

  describe("annotations", () => {
    function withLine() {
      const id = newRepertoire();
      const hook = renderHook(() => useHarness(id));
      act(() => {
        hook.result.current.editor.handlePieceDrop("e2", "e4");
      });
      act(() => {
        hook.result.current.editor.handlePieceDrop("e7", "e5");
      });
      return { id, ...hook };
    }

    it("pose un symbole sur le coup affiché, puis le retire en cliquant à nouveau", () => {
      const { result } = withLine();

      act(() => result.current.editor.toggleSymbol("!?"));
      expect(result.current.editor.currentNode?.symbol).toBe("!?");

      act(() => result.current.editor.toggleSymbol("!?"));
      expect(result.current.editor.currentNode?.symbol).toBeUndefined();
    });

    it("remplace un symbole par un autre", () => {
      const { result } = withLine();
      act(() => result.current.editor.toggleSymbol("!"));
      act(() => result.current.editor.toggleSymbol("??"));
      expect(result.current.editor.currentNode?.symbol).toBe("??");
    });

    it("enregistre un commentaire (nettoyé) dans le store sans déplacer le curseur", () => {
      const { id, result } = withLine();
      const cursor = result.current.editor.cursorId;

      act(() => result.current.editor.annotate(cursor, { comment: "  Plan : fianchetto  " }));

      expect(result.current.editor.currentNode?.comment).toBe("Plan : fianchetto");
      expect(result.current.editor.cursorId).toBe(cursor);
      expect(getSnapshot().repertoires[id].children[0].children[0].comment).toBe("Plan : fianchetto");
    });

    it("annote un autre nœud que celui affiché", () => {
      const { result } = withLine();
      const e4 = result.current.editor.repertoire!.children[0].id;

      act(() => result.current.editor.annotate(e4, { symbol: "!" }));

      expect(result.current.editor.repertoire!.children[0].symbol).toBe("!");
      expect(result.current.editor.currentNode?.san).toBe("e5"); // le curseur n'a pas bougé
    });

    it("est annulable, et le rétablissement remet l'annotation", () => {
      const { result } = withLine();
      act(() => result.current.editor.toggleSymbol("!"));

      act(() => result.current.editor.undo());
      expect(result.current.editor.currentNode?.symbol).toBeUndefined();

      act(() => result.current.editor.redo());
      expect(result.current.editor.currentNode?.symbol).toBe("!");
    });

    it("n'ajoute rien à l'historique quand rien ne change", () => {
      const { result } = withLine();
      const cursor = result.current.editor.cursorId;
      act(() => result.current.editor.annotate(cursor, { comment: "note" }));
      // Deux coups + une annotation = 3 annulations possibles, pas plus
      act(() => result.current.editor.annotate(cursor, { comment: " note " })); // identique après nettoyage
      act(() => result.current.editor.annotate(cursor, { symbol: undefined })); // déjà sans symbole

      let undone = 0;
      while (result.current.editor.canUndo) {
        act(() => result.current.editor.undo());
        undone += 1;
      }
      expect(undone).toBe(3);
    });

    it("garde la même fonction d'annotation d'un rendu à l'autre", () => {
      const { result, rerender } = withLine();
      const first = result.current.editor.annotate;
      rerender();
      act(() => result.current.editor.toggleSymbol("!"));
      expect(result.current.editor.annotate).toBe(first);
    });

    it("applique l'annotation à l'arbre le plus récent même si l'appelant date d'un rendu précédent", () => {
      const { result } = withLine();
      const staleAnnotate = result.current.editor.annotate; // ancienne référence
      const e5 = result.current.editor.cursorId;

      // Une modification intervient entre-temps
      act(() => result.current.editor.move("back"));
      act(() => {
        result.current.editor.handlePieceDrop("c7", "c5");
      });
      act(() => staleAnnotate(e5, { comment: "ajouté plus tard" }));

      const e4 = result.current.editor.repertoire!.children[0];
      expect(e4.children.map((n) => n.san)).toEqual(["e5", "c5"]); // la variante n'a pas été perdue
      expect(e4.children[0].comment).toBe("ajouté plus tard");
    });

    it("ne fait rien quand l'éditeur n'est pas affiché", () => {
      const id = newRepertoire();
      const { result } = renderHook(() => useHarness(id, "menu"));
      act(() => result.current.editor.toggleSymbol("!"));
      expect(result.current.editor.repertoire!.children).toHaveLength(0);
    });
  });

  describe("import de coups (PGN)", () => {
    const tree = (sans: string[]) => {
      let children: { id: string; san: string; children: never[] }[] = [];
      for (const san of [...sans].reverse()) children = [{ id: `n-${san}`, san, children: children as never[] }] as never;
      return children as never;
    };

    it("fusionne les coups importés et annule tout l'import d'un seul Ctrl+Z", () => {
      const id = newRepertoire();
      const { result } = renderHook(() => useHarness(id));
      act(() => {
        result.current.editor.handlePieceDrop("e2", "e4");
      });

      let outcome: { added: number; truncated: boolean } | null = null;
      act(() => {
        outcome = result.current.editor.importTree(tree(["e4", "e5", "Nf3", "Nc6"]));
      });

      expect(outcome).toEqual({ added: 3, truncated: false }); // e4 existait déjà
      expect(sansOf(result.current.editor.repertoire!.children)).toEqual(["e4"]);
      expect(result.current.editor.repertoire!.children[0].children[0].children[0].san).toBe("Nf3");

      act(() => result.current.editor.undo()); // un seul pas pour tout l'import
      expect(result.current.editor.repertoire!.children[0].children).toHaveLength(0);
    });

    it("ne change rien (ni historique) quand les coups figurent déjà", () => {
      const id = newRepertoire();
      const { result } = renderHook(() => useHarness(id));
      act(() => {
        result.current.editor.handlePieceDrop("e2", "e4");
      });
      const before = result.current.editor.repertoire!.children;

      let outcome: { added: number; truncated: boolean } | null = null;
      act(() => {
        outcome = result.current.editor.importTree(tree(["e4"]));
      });

      expect(outcome).toEqual({ added: 0, truncated: false });
      expect(result.current.editor.repertoire!.children).toBe(before);
      act(() => result.current.editor.undo()); // annule le coup joué, pas un import fantôme
      expect(result.current.editor.repertoire!.children).toHaveLength(0);
    });

    it("garde le curseur et ajoute les nouvelles branches comme variantes", () => {
      const id = newRepertoire();
      const { result } = renderHook(() => useHarness(id));
      act(() => {
        result.current.editor.handlePieceDrop("e2", "e4");
      });
      act(() => {
        result.current.editor.handlePieceDrop("e7", "e5");
      });
      const cursor = result.current.editor.cursorId;

      act(() => {
        result.current.editor.importTree(tree(["e4", "c5"]));
      });

      expect(result.current.editor.cursorId).toBe(cursor);
      expect(sansOf(result.current.editor.repertoire!.children[0].children)).toEqual(["e5", "c5"]);
    });
  });

  describe("transpositions et dernier coup", () => {
    const play = (result: { current: ReturnType<typeof useHarness> }, moves: [string, string][]) => {
      for (const [from, to] of moves) {
        act(() => {
          result.current.editor.handlePieceDrop(from, to);
        });
      }
    };

    it("repère les deux nœuds qui aboutissent à la même position", () => {
      const id = newRepertoire();
      const { result } = renderHook(() => useHarness(id));

      // 1.d4 Nf6 2.c4 e6 3.Nc3, puis, depuis le début, 1.c4 e6 2.Nc3 Nf6 3.d4
      play(result, [["d2", "d4"], ["g8", "f6"], ["c2", "c4"], ["e7", "e6"], ["b1", "c3"]]);
      expect(result.current.editor.transpositions.size).toBe(0);

      act(() => result.current.editor.goTo("root"));
      play(result, [["c2", "c4"], ["e7", "e6"], ["b1", "c3"], ["g8", "f6"], ["d2", "d4"]]);

      expect(result.current.editor.transpositions.size).toBe(2);
      const [a, b] = [...result.current.editor.transpositions.keys()];
      expect(result.current.editor.transpositions.get(a)).toEqual([b]);
    });

    it("surligne le dernier coup du nœud affiché, y compris après une navigation", () => {
      const id = newRepertoire();
      const { result } = renderHook(() => useHarness(id));
      expect(result.current.editor.lastMoveSquares).toEqual({}); // position initiale

      play(result, [["e2", "e4"], ["e7", "e5"]]);
      expect(Object.keys(result.current.editor.lastMoveSquares).sort()).toEqual(["e5", "e7"]);

      act(() => result.current.editor.move("back")); // l'échiquier est rechargé : on retrouve e2-e4
      expect(Object.keys(result.current.editor.lastMoveSquares).sort()).toEqual(["e2", "e4"]);

      act(() => result.current.editor.goTo("root"));
      expect(result.current.editor.lastMoveSquares).toEqual({});
    });

    it("surligne aussi le roque (roi de e1 à g1)", () => {
      const id = newRepertoire();
      const { result } = renderHook(() => useHarness(id));
      play(result, [["e2", "e4"], ["e7", "e5"], ["g1", "f3"], ["b8", "c6"], ["f1", "c4"], ["g8", "f6"], ["e1", "g1"]]);
      expect(Object.keys(result.current.editor.lastMoveSquares).sort()).toEqual(["e1", "g1"]);
    });
  });

  describe("session et robustesse", () => {
    it("remet le curseur et l'historique à zéro", () => {
      const id = newRepertoire();
      const { result } = renderHook(() => useHarness(id));
      act(() => {
        result.current.editor.handlePieceDrop("e2", "e4");
      });
      expect(result.current.editor.canUndo).toBe(true);

      act(() => result.current.editor.resetSession());

      expect(result.current.editor.cursorId).toBe("root");
      expect(result.current.editor.canUndo).toBe(false);
      expect(result.current.fen).toBe(INITIAL_FEN); // l'échiquier suit
      expect(sansOf(result.current.editor.repertoire!.children)).toEqual(["e4"]); // l'arbre est conservé
    });

    it("repart de la position initiale quand on ouvre un autre répertoire", () => {
      const first = newRepertoire();
      const second = newRepertoire();
      const hook = renderHook(({ id }: { id: string }) => useHarness(id), {
        initialProps: { id: first },
      });
      act(() => {
        hook.result.current.editor.handlePieceDrop("e2", "e4");
      });
      expect(hook.result.current.editor.cursorId).not.toBe("root");

      hook.rerender({ id: second });
      expect(hook.result.current.editor.cursorId).toBe("root");
      expect(hook.result.current.editor.canUndo).toBe(false);
    });

    it("revient à la position initiale si le nœud affiché a été supprimé ailleurs", () => {
      const id = newRepertoire();
      const { result } = renderHook(() => useHarness(id));
      act(() => {
        result.current.editor.handlePieceDrop("e2", "e4");
      });

      act(() => {
        updateRepertoireTree(id, []); // un autre onglet vide le répertoire
      });

      expect(result.current.editor.cursorId).toBe("root");
      expect(result.current.fen).toBe(INITIAL_FEN);
    });

    it("signale les coups illégaux d'un répertoire corrompu", () => {
      const id = newRepertoire();
      act(() => {
        updateRepertoireTree(id, [
          { id: "ok", san: "e4", children: [] },
          { id: "bad", san: "Qh5", children: [] },
        ]);
      });
      const { result } = renderHook(() => useHarness(id));
      expect(result.current.editor.invalidCount).toBe(1);
    });
  });
});