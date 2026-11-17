import { describe, expect, it } from "vitest";
import { buildCoachContext } from "./context";
import {
  book,
  cp,
  fenAfter,
  kingWalk,
  mate,
  playableDeviation,
  queenBlunder,
  scholarsMate,
} from "./testFixtures";

describe("buildCoachContext — situation", () => {
  it("assemble la position, le camp, le demi-coup, l'ouverture et les annotations", () => {
    const input = queenBlunder();
    const context = buildCoachContext(input)!;

    expect(context.playerSide).toBe("black");
    expect(context.ply).toBe(5);
    expect(context.playedSan).toBe("Qg5");
    expect(context.fenAfter).toBe(fenAfter([...input.history!, "Qg5"]));
    expect(context.openingName).toBe("Italian Game");
    expect(context.history).toEqual(input.history);
    expect(context.bookMoves.map((m) => m.san)).toEqual(["Bc5"]);
    expect(context.positionNotes).toHaveLength(1);
  });

  it("normalise le SAN du coup joué et déduit le demi-coup de la FEN sans historique", () => {
    const context = buildCoachContext({
      fenBefore: fenAfter(["e4", "e5", "Nf3"]),
      playedSan: "Nc6",
      bookMoves: [],
    })!;
    expect(context.ply).toBe(3);
    expect(context.history).toEqual([]);
    expect(context.openingName).toBeNull();
    expect(context.positionNotes).toEqual([]);
  });

  it("renvoie null pour un coup illégal ou une FEN invalide", () => {
    expect(buildCoachContext({ ...queenBlunder(), playedSan: "Qd6" })).toBeNull();
    expect(buildCoachContext({ ...queenBlunder(), fenBefore: "n'importe quoi" })).toBeNull();
  });

  it("place les lignes principales du répertoire en tête", () => {
    const context = buildCoachContext({
      ...playableDeviation(),
      bookMoves: [book("Bc4", { isMainLine: false }), book("Nf3")],
    })!;
    expect(context.bookMoves.map((m) => m.san)).toEqual(["Nf3", "Bc4"]);
  });

  it("ne garde pas un nom d'ouverture vide", () => {
    expect(buildCoachContext({ ...queenBlunder(), openingName: "  " })!.openingName).toBeNull();
  });
});

describe("buildCoachContext — gaffe tactique", () => {
  it("détecte la dame perdue : gaffe, réfutation convertie en SAN, perte matérielle", () => {
    const { assessment } = buildCoachContext(queenBlunder())!;

    expect(assessment.verdict).toBe("tactical_blunder");
    expect(assessment.severity).toBe("blunder");
    expect(assessment.played).toMatchObject({
      san: "Qg5",
      score: { kind: "cp", cp: -900 },
      line: ["Nxg5", "d6", "Nf3"],
    });
    expect(assessment.reference).toMatchObject({
      origin: "book",
      san: "Bc5",
      score: { kind: "cp", cp: -30 },
      line: ["c3", "Nf6"],
    });
    expect(assessment.lossCp).toBe(870);
    expect(assessment.winChanceLoss).toBeGreaterThan(0.3);
    expect(assessment.motifs).toEqual({ allowsMate: false, missesMate: false, materialLoss: 9 });
    expect(assessment.playedIsBetter).toBe(false);
  });

  it("détecte un mat concédé même sans perte matérielle", () => {
    const { assessment } = buildCoachContext(scholarsMate())!;

    expect(assessment.verdict).toBe("tactical_blunder");
    expect(assessment.severity).toBe("blunder");
    expect(assessment.played?.score).toEqual({ kind: "mate", moves: 1, winner: "opponent" });
    expect(assessment.played?.line).toEqual(["Qxf7#"]);
    expect(assessment.lossCp).toBeNull();
    expect(assessment.motifs.allowsMate).toBe(true);
    expect(assessment.motifs.materialLoss).toBe(0);
  });

  it("conclut à la gaffe sur un mat concédé même sans évaluation de référence", () => {
    const { assessment } = buildCoachContext({ ...scholarsMate(), engine: { played: mate(1, ["h5f7"]) } })!;
    expect(assessment.reference).toBeNull();
    expect(assessment.verdict).toBe("tactical_blunder");
    expect(assessment.motifs.allowsMate).toBe(true);
  });

  it("détecte un mat raté (référence « mate 0 » après le coup du répertoire)", () => {
    const history = ["e4", "e5", "Bc4", "Nc6", "Qh5", "Nf6"];
    const { assessment } = buildCoachContext({
      fenBefore: fenAfter(history),
      playedSan: "Qf3",
      history,
      bookMoves: [book("Qxf7#")],
      engine: { played: cp(50), expected: { "Qxf7#": mate(0) } },
    })!;

    expect(assessment.reference?.score).toEqual({ kind: "mate", moves: 0, winner: "player" });
    expect(assessment.motifs.missesMate).toBe(true);
    expect(assessment.verdict).toBe("tactical_blunder");
  });

  it("respecte des seuils personnalisés", () => {
    const { assessment } = buildCoachContext({
      ...queenBlunder(),
      thresholds: { tacticalMaterial: 10 },
    })!;
    expect(assessment.verdict).toBe("strategic_error");
  });
});

describe("buildCoachContext — écarts sans gaffe", () => {
  it("qualifie un coup jouable hors répertoire d'écart de répertoire", () => {
    const { assessment } = buildCoachContext(playableDeviation())!;
    expect(assessment.verdict).toBe("playable_deviation");
    expect(assessment.severity).toBe("none");
    expect(assessment.lossCp).toBe(5);
    expect(assessment.playedIsBetter).toBe(false);
  });

  it("signale quand le moteur préfère le coup joué", () => {
    const { assessment } = buildCoachContext(playableDeviation(80, 0))!;
    expect(assessment.verdict).toBe("playable_deviation");
    expect(assessment.winChanceLoss).toBeLessThan(0);
    expect(assessment.playedIsBetter).toBe(true);
  });

  it("classe une petite perte en imprécision", () => {
    const { assessment } = buildCoachContext(kingWalk(-30))!;
    expect(assessment.verdict).toBe("inaccuracy");
    expect(assessment.severity).toBe("inaccuracy");
  });

  it("classe une grosse perte sans matériel en erreur stratégique", () => {
    const { assessment } = buildCoachContext(kingWalk(-150))!;
    expect(assessment.severity).toBe("blunder");
    expect(assessment.verdict).toBe("strategic_error");
    expect(assessment.motifs).toEqual({ allowsMate: false, missesMate: false, materialLoss: 0 });
  });

  it("retient le meilleur coup du répertoire évalué comme étalon", () => {
    const input = playableDeviation(25, 30);
    const { assessment } = buildCoachContext({
      ...input,
      bookMoves: [book("Nf3"), book("Bc4", { isMainLine: false })],
      engine: { ...input.engine, expected: { Nf3: cp(30), Bc4: cp(45) } },
    })!;
    expect(assessment.reference?.san).toBe("Bc4");
    expect(assessment.lossCp).toBe(20);
  });
});

describe("buildCoachContext — données moteur incomplètes", () => {
  it("reste non évalué sans analyse moteur", () => {
    const { assessment } = buildCoachContext({ ...queenBlunder(), engine: undefined })!;
    expect(assessment).toMatchObject({
      played: null,
      reference: null,
      engineBest: null,
      verdict: "unevaluated",
      severity: "none",
      lossCp: null,
      winChanceLoss: null,
    });
  });

  it("reste non évalué si le moteur n'a pas donné de score", () => {
    const { assessment } = buildCoachContext({
      ...queenBlunder(),
      engine: { played: { score: null, depth: 0, pv: [] } },
    })!;
    expect(assessment.verdict).toBe("unevaluated");
  });

  it("prend le meilleur coup du moteur comme étalon faute d'évaluation du répertoire", () => {
    const input = queenBlunder();
    const { assessment } = buildCoachContext({
      ...input,
      engine: { played: input.engine!.played, before: cp(25, ["g8f6", "d2d3"]) },
    })!;

    expect(assessment.engineBest).toMatchObject({ san: "Nf6", line: ["d3"], score: { kind: "cp", cp: -25 } });
    expect(assessment.reference).toMatchObject({ origin: "engine", san: "Nf6" });
    expect(assessment.verdict).toBe("tactical_blunder");
    expect(assessment.motifs.materialLoss).toBe(9);
  });

  it("ignore les coups du répertoire illégaux dans la position", () => {
    const { assessment } = buildCoachContext({
      ...playableDeviation(),
      bookMoves: [book("Ke3"), book("Nf3")],
      engine: { played: cp(25), expected: { Ke3: cp(500), Nf3: cp(30) } },
    })!;
    expect(assessment.reference?.san).toBe("Nf3");
  });

  it("mesure le matériel sur le seul coup quand le moteur ne donne aucune variante", () => {
    const { assessment } = buildCoachContext({
      ...kingWalk(),
      bookMoves: [book("c4")],
      engine: { played: cp(-150), expected: { c4: cp(30) } },
    })!;
    // Le coup lui-même est rejoué : la variation matérielle reste mesurable (0).
    expect(assessment.motifs.materialLoss).toBe(0);
  });
});
