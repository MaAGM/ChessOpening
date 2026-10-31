// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Chess } from "chess.js";
import { createElement, useState } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MoveInspector } from "./MoveInspector";
import { useRepertoireEditor } from "@/hooks/useRepertoireEditor";
import { INITIAL_FEN } from "@/lib/repertoire/repertoireTree";
import { createRepertoire, getSnapshot } from "@/lib/repertoire/repertoireStore";

/**
 * Éditeur + panneau d'annotation assemblés comme dans l'application, sur un mini-échiquier.
 * `current` donne accès à l'éditeur depuis le test.
 */
let current: ReturnType<typeof useRepertoireEditor>;

function Harness({ repertoireId }: { repertoireId: string }) {
  const [fen, setFen] = useState(INITIAL_FEN);

  const editor = useRepertoireEditor({
    repertoireId,
    panelMode: "repertoire_editor",
    currentFen: fen,
    onPieceDrop: (from, to) => {
      if (!to) return false;
      const game = new Chess(fen);
      try {
        game.move({ from, to, promotion: "q" });
      } catch {
        return false;
      }
      setFen(game.fen());
      return true;
    },
    onSquareClick: () => {},
    loadPosition: setFen,
    clearSelection: () => {},
  });
  current = editor;

  return createElement(MoveInspector, {
    node: editor.currentNode,
    ply: editor.cursorPly,
    onToggleSymbol: editor.toggleSymbol,
    onSetComment: (nodeId: string, comment: string) => editor.annotate(nodeId, { comment }),
  });
}

let id: string;
const play = (from: string, to: string) =>
  act(() => {
    current.handlePieceDrop(from, to);
  });
const textarea = () => screen.getByLabelText("Commentaire du coup") as HTMLTextAreaElement;

beforeEach(() => {
  window.localStorage.clear();
  const created = createRepertoire({ name: "Test", side: "white" });
  if (!created.ok) throw new Error("création impossible");
  id = created.value;
});
afterEach(cleanup);

describe("annotation et édition ensemble", () => {
  it("écrit un commentaire et le retrouve dans le répertoire enregistré", () => {
    render(createElement(Harness, { repertoireId: id }));
    play("e2", "e4");

    fireEvent.change(textarea(), { target: { value: "Coup roi" } });
    fireEvent.blur(textarea());

    expect(getSnapshot().repertoires[id].children[0].comment).toBe("Coup roi");
  });

  it("ne perd pas le coup qu'on vient de jouer quand un brouillon de commentaire est en attente", () => {
    render(createElement(Harness, { repertoireId: id }));
    play("e2", "e4");

    // Brouillon tapé, champ encore actif : aucun enregistrement n'a eu lieu.
    fireEvent.change(textarea(), { target: { value: "À garder" } });
    expect(getSnapshot().repertoires[id].children[0].comment).toBeUndefined();

    // Un coup est joué sur l'échiquier : le champ de e4 se ferme et enregistre son brouillon
    // au moment même où le nouveau coup est ajouté.
    play("e7", "e5");

    const e4 = getSnapshot().repertoires[id].children[0];
    expect(e4.comment).toBe("À garder"); // le brouillon est enregistré…
    expect(e4.children.map((n) => n.san)).toEqual(["e5"]); // …sans écraser le coup ajouté
    expect(current.currentNode?.san).toBe("e5");
  });

  it("annule le commentaire, puis le coup, dans l'ordre", () => {
    render(createElement(Harness, { repertoireId: id }));
    play("e2", "e4");
    fireEvent.change(textarea(), { target: { value: "Note" } });
    fireEvent.blur(textarea());

    act(() => current.undo()); // annule le commentaire
    expect(getSnapshot().repertoires[id].children[0].comment).toBeUndefined();
    expect(textarea().value).toBe(""); // le champ suit

    act(() => current.undo()); // annule le coup
    expect(getSnapshot().repertoires[id].children).toHaveLength(0);
  });

  it("enregistre le brouillon quand on navigue vers un autre coup dans l'arbre", () => {
    render(createElement(Harness, { repertoireId: id }));
    play("e2", "e4");
    play("e7", "e5");

    fireEvent.change(textarea(), { target: { value: "Réponse symétrique" } });
    act(() => current.move("back")); // on revient sur e4 sans quitter le champ proprement

    const e4 = getSnapshot().repertoires[id].children[0];
    expect(e4.children[0].comment).toBe("Réponse symétrique");
    expect(current.currentNode?.san).toBe("e4");
  });
});
