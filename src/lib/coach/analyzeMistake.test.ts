import { describe, expect, it } from "vitest";
import { analyzeMistake, type CoachEngine } from "./analyzeMistake";
import type { AnnotatedSource } from "./bookMoves";
import { COACH_SYSTEM_PROMPT } from "./systemPrompt";
import { cp, fenAfter } from "./testFixtures";
import type { CoachEngineInput } from "./types";

// Noirs : 1.e4 e5 2.Nf3 Nc6 3.Bc4, le répertoire prévoit 3…Bc5 (ou 3…Nf6).
const italian: AnnotatedSource = {
  kind: "tutorial",
  id: "ch-italian",
  name: "Italienne",
  root: {
    children: {
      e4: {
        children: {
          e5: {
            children: {
              Nf3: {
                children: {
                  Nc6: {
                    children: {
                      Bc4: {
                        explanation: "Les Blancs visent f7.",
                        children: {
                          Bc5: { explanation: "Le fou vise f2.", children: { c3: {} } },
                          Nf6: {},
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

const FEN_BEFORE = fenAfter(["e4", "e5", "Nf3", "Nc6", "Bc4"]);

/** Moteur simulé : renvoie une analyse par FEN et enregistre l'ordre des recherches. */
function fakeEngine(byFen: Record<string, CoachEngineInput | null>) {
  const calls: { fen: string; depth?: number }[] = [];
  const engine: CoachEngine = {
    analyze: async (fen, options) => {
      calls.push({ fen, depth: options?.depth });
      return byFen[fen] ?? null;
    },
  };
  return { engine, calls };
}

const mistake = { fenBefore: FEN_BEFORE, playedSan: "Qg5", openingName: "Italian Game", sources: [italian] };

describe("analyzeMistake", () => {
  it("analyse avant, après le coup joué puis après chaque coup attendu, dans cet ordre", async () => {
    const afterPlayed = fenAfter(["e4", "e5", "Nf3", "Nc6", "Bc4", "Qg5"]);
    const afterBc5 = fenAfter(["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5"]);
    const afterNf6 = fenAfter(["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6"]);
    const { engine, calls } = fakeEngine({
      [FEN_BEFORE]: cp(-20, ["f8c5"]),
      [afterPlayed]: cp(900, ["f3g5", "d7d6", "g5f3"]),
      [afterBc5]: cp(30, ["c2c3"]),
      [afterNf6]: cp(40, ["f3g5"]),
    });

    const result = await analyzeMistake(mistake, engine, { depth: 10 });

    expect(calls.map((c) => c.fen)).toEqual([FEN_BEFORE, afterPlayed, afterBc5, afterNf6]);
    expect(calls.every((c) => c.depth === 10)).toBe(true);
    expect(result?.context.assessment.verdict).toBe("tactical_blunder");
    expect(result?.context.bookMoves.map((m) => m.san)).toEqual(["Bc5", "Nf6"]);
    expect(result?.prompt.system).toBe(COACH_SYSTEM_PROMPT);
    expect(result?.prompt.user).toContain("Le fou vise f2.");
    expect(result?.prompt.user).toContain("Italian Game");
  });

  it("limite le nombre de coups du répertoire analysés", async () => {
    const { engine, calls } = fakeEngine({});
    await analyzeMistake(mistake, engine, { maxBookMoves: 1 });
    expect(calls).toHaveLength(3); // avant, joué, Bc5
  });

  it("sans moteur, construit quand même un contexte « non évalué »", async () => {
    const result = await analyzeMistake(mistake, null);
    expect(result?.context.assessment.verdict).toBe("unevaluated");
    expect(result?.prompt.user).toContain("Aucune analyse moteur disponible.");
  });

  it("une recherche qui échoue est traitée comme une analyse manquante", async () => {
    const engine: CoachEngine = { analyze: async () => Promise.reject(new Error("crash")) };
    const result = await analyzeMistake(mistake, engine);
    expect(result?.context.assessment.verdict).toBe("unevaluated");
  });

  it("renvoie null si l'analyse est abandonnée, sans lancer de nouvelle recherche", async () => {
    const controller = new AbortController();
    const calls: string[] = [];
    const engine: CoachEngine = {
      analyze: async (fen) => {
        calls.push(fen);
        controller.abort(); // l'utilisateur rejoue pendant la première recherche
        return cp(0);
      },
    };
    const result = await analyzeMistake(mistake, engine, { signal: controller.signal });
    expect(result).toBeNull();
    expect(calls).toHaveLength(1);
  });

  it("renvoie null pour un coup illégal", async () => {
    const { engine, calls } = fakeEngine({});
    expect(await analyzeMistake({ ...mistake, playedSan: "Ke3" }, engine)).toBeNull();
    expect(calls).toHaveLength(0);
  });
});
