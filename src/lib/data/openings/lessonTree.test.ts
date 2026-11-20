import { describe, expect, it } from "vitest";

import { buildLessonTree, DEFAULT_LESSON_END } from "./lessonTree";

describe("buildLessonTree", () => {
  it("Blancs : la racine montre le premier coup, les coups de l'ordi portent le coup suivant", () => {
    const root = buildLessonTree(
      "{Bienvenue} 1. e4 {Le centre [%cal Ge2e4]} 1... e5 {Symétrie} 2. Nf3 {Attaque e5 [%cal Gg1f3]}",
      "white",
      "Fin !",
    );

    expect(root.explanation).toBe("Bienvenue\n\nLe centre");
    expect(root.arrows).toEqual([["e2", "e4"]]);

    const e4 = root.children!.e4;
    expect(e4.explanation).toBeUndefined(); // coup du joueur : rien à afficher
    const e5 = e4.children!.e5;
    expect(e5.explanation).toBe("Symétrie\n\nAttaque e5");
    expect(e5.arrows).toEqual([["g1", "f3"]]);
    expect(e5.children!.Nf3.explanation).toBe("Fin !"); // fin de variante sur un coup du joueur
  });

  it("Noirs : racine vide, l'ordi joue d'abord", () => {
    const root = buildLessonTree("1. e4 {Ouverture blanche} 1... c5 {La Sicilienne}", "black");
    expect(root.explanation).toBeUndefined();
    expect(root.children!.e4.explanation).toBe("Ouverture blanche\n\nLa Sicilienne");
    expect(root.children!.e4.children!.c5.explanation).toBe(DEFAULT_LESSON_END);
  });

  it("fin de variante sur un coup de l'ordi : commentaire + conclusion", () => {
    const root = buildLessonTree("1. e4 e5 {Réponse}", "white", "Bravo");
    expect(root.children!.e4.children!.e5.explanation).toBe("Réponse\n\nBravo");
  });

  it("garde les variantes, dans l'ordre (ligne principale d'abord)", () => {
    const root = buildLessonTree("1. e4 e5 (1... c5 2. Nf3) (1... e6) 2. Nf3", "white");
    expect(Object.keys(root.children!.e4.children!)).toEqual(["e5", "c5", "e6"]);
    expect(Object.keys(root.children!.e4.children!.c5.children!)).toEqual(["Nf3"]);
  });

  it("normalise la notation des coups avec chess.js", () => {
    const root = buildLessonTree("1. e4 e5 2. Ng1f3", "white");
    expect(Object.keys(root.children!.e4.children!.e5.children!)).toEqual(["Nf3"]);
  });

  it("refuse un coup illégal ou un PGN vide", () => {
    expect(() => buildLessonTree("1. e4 e4", "white")).toThrow(/illégal/);
    expect(() => buildLessonTree("", "white")).toThrow(/vide/);
  });
});
