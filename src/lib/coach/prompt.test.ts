import { describe, expect, it } from "vitest";
import { buildCoachContext } from "./context";
import { buildCoachPrompt, formatPlayerScore, formatSequence } from "./prompt";
import type { CoachMistakeInput } from "./types";
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

const promptFor = (input: CoachMistakeInput) => {
  const context = buildCoachContext(input);
  if (!context) throw new Error("contexte invalide");
  return buildCoachPrompt(context);
};

describe("formatSequence", () => {
  it("numérote les coups à partir du demi-coup donné", () => {
    expect(formatSequence(0, ["e4", "e5", "Nf3"])).toBe("1. e4 e5 2. Nf3");
    expect(formatSequence(6, ["Nxg5", "d6", "Nf3"])).toBe("4. Nxg5 d6 5. Nf3");
    expect(formatSequence(5, ["Bc5", "c3"])).toBe("3… Bc5 4. c3");
    expect(formatSequence(3, [])).toBe("");
  });
});

describe("formatPlayerScore", () => {
  it("formate centipions et mats du point de vue du joueur", () => {
    expect(formatPlayerScore({ kind: "cp", cp: 34 })).toBe("+0.3");
    expect(formatPlayerScore({ kind: "cp", cp: -870 })).toBe("-8.7");
    expect(formatPlayerScore({ kind: "cp", cp: 4 })).toBe("0.0");
    expect(formatPlayerScore({ kind: "mate", moves: 2, winner: "player" })).toBe("mat en 2 pour vous");
    expect(formatPlayerScore({ kind: "mate", moves: 1, winner: "opponent" })).toBe(
      "mat en 1 pour l'adversaire",
    );
    expect(formatPlayerScore({ kind: "mate", moves: 0, winner: "player" })).toBe(
      "échec et mat (vous gagnez)",
    );
    expect(formatPlayerScore({ kind: "mate", moves: 0, winner: "opponent" })).toBe(
      "échec et mat (vous perdez)",
    );
  });
});

describe("buildCoachPrompt — structure", () => {
  it("est déterministe", () => {
    expect(promptFor(queenBlunder())).toEqual(promptFor(queenBlunder()));
  });

  it("contient les sections dans l'ordre et un message système commun", () => {
    const { system, user } = promptFor(queenBlunder());
    const headings = user.split("\n").filter((line) => line.startsWith("#"));
    expect(headings).toEqual([
      "# Écart au répertoire en révision",
      "## Situation",
      "## Annotations du répertoire",
      "## Analyse du moteur",
      "## Diagnostic",
      "## Ta mission",
    ]);
    expect(system).toContain("N'invente aucune variante");
    expect(system).toBe(promptFor(playableDeviation()).system);
  });

  it("décrit la situation : ouverture, camp, ligne jouée, coup joué et coups attendus", () => {
    const { user } = promptFor(queenBlunder());
    expect(user).toContain("- Ouverture : Italian Game");
    expect(user).toContain("- Camp du joueur : Noirs");
    expect(user).toContain("- Coups joués jusqu'ici : 1. e4 e5 2. Nf3 Nc6 3. Bc4");
    expect(user).toContain(`- Position avant le coup (FEN) : ${queenBlunder().fenBefore}`);
    expect(user).toContain("- Coup joué : 3… Qg5");
    expect(user).toContain(
      "  - 3… Bc5! (Bon coup) — ligne principale de « Mon répertoire » ; suite prévue : 4. c3 Nf6",
    );
  });

  it("gère l'absence d'ouverture, d'historique et de coups attendus", () => {
    const { user } = promptFor({
      fenBefore: fenAfter(["d4", "d5"]),
      playedSan: "Kd2",
      bookMoves: [],
    });
    expect(user).toContain("- Ouverture : non identifiée");
    expect(user).toContain("- Coups joués jusqu'ici : (non communiquée)");
    expect(user).toContain("- Coup(s) attendu(s) par le répertoire : (non communiqués)");
  });

  it("signale la position initiale quand l'erreur survient au premier coup", () => {
    const { user } = promptFor({
      fenBefore: fenAfter([]),
      playedSan: "a4",
      history: [],
      bookMoves: [book("e4")],
    });
    expect(user).toContain("- Coups joués jusqu'ici : (position initiale)");
    expect(user).toContain("- Coup joué : 1. a4");
  });
});

describe("buildCoachPrompt — annotations", () => {
  it("reprend commentaires, symboles et flèches du répertoire", () => {
    const { user } = promptFor({
      ...queenBlunder(),
      bookMoves: [book("Bc5", { symbol: "!", comment: "Le fou vise f2.", arrows: [["c5", "f2"]] })],
    });
    expect(user).toContain("- Après 3. Bc4 (« Mon répertoire ») : Les Blancs visent f7.");
    expect(user).toContain("- Sur 3… Bc5! (« Mon répertoire ») : Le fou vise f2. ; flèches : c5→f2");
    expect(user).toContain("Reprends l'idée des commentaires du répertoire");
  });

  it("indique explicitement l'absence d'annotations", () => {
    const { user } = promptFor({ ...queenBlunder(), bookMoves: [book("Bc5")], positionNotes: [] });
    expect(user).toContain("- Aucun commentaire ni annotation dans le répertoire pour cette position.");
    expect(user).not.toContain("Reprends l'idée des commentaires");
  });

  it("présente les variantes du répertoire comme telles", () => {
    const { user } = promptFor({
      ...playableDeviation(),
      bookMoves: [book("Nf3"), book("Bc4", { isMainLine: false, sourceName: "Italienne" })],
    });
    expect(user).toContain("  - 2. Bc4 — variante de « Italienne »");
  });
});

describe("buildCoachPrompt — gaffe tactique", () => {
  it("expose la réfutation, l'écart et la perte matérielle", () => {
    const { user, verdict } = promptFor(queenBlunder());
    expect(verdict).toBe("tactical_blunder");
    expect(user).toContain("Évaluations du point de vue du joueur (+ = avantage pour lui).");
    expect(user).toContain("- Coup du répertoire 3… Bc5 : -0.3 (profondeur 18) ; suite : 4. c3 Nf6");
    expect(user).toContain(
      "- Coup joué 3… Qg5 : -9.0 (profondeur 18) ; réponse attendue de l'adversaire : 4. Nxg5 d6 5. Nf3",
    );
    expect(user).toMatch(/- Écart par rapport à la référence : 8\.7 pion\(s\) ; \d+ point\(s\) de pourcentage/);
    expect(user).toContain("- Motifs : perte matérielle estimée : 9 pion(s)");
    expect(user).toContain("- Gravité : gaffe");
    expect(user).toContain("- Verdict : GAFFE TACTIQUE");
    expect(user).toContain("Explique concrètement la réfutation");
  });

  it("annonce le mat concédé sans écart en pions", () => {
    const { user, verdict } = promptFor(scholarsMate());
    expect(verdict).toBe("tactical_blunder");
    expect(user).toContain(
      "- Coup joué 3… Nf6 : mat en 1 pour l'adversaire (profondeur 18) ; réponse attendue de l'adversaire : 4. Qxf7#",
    );
    expect(user).toContain("le coup joué permet un mat forcé");
    expect(user).toMatch(/- Écart par rapport à la référence : \d+ point\(s\)/);
    expect(user).not.toContain("pion(s) ;");
  });

  it("annonce un mat raté", () => {
    const history = ["e4", "e5", "Bc4", "Nc6", "Qh5", "Nf6"];
    const { user } = promptFor({
      fenBefore: fenAfter(history),
      playedSan: "Qf3",
      history,
      bookMoves: [book("Qxf7#")],
      engine: { played: cp(50), expected: { "Qxf7#": mate(0) } },
    });
    expect(user).toContain("- Coup du répertoire 4. Qxf7# : échec et mat (vous gagnez)");
    expect(user).toContain("le coup joué laisse échapper un mat forcé");
  });
});

describe("buildCoachPrompt — écarts sans gaffe", () => {
  it("interdit de qualifier un coup jouable d'erreur", () => {
    const { user, verdict } = promptFor(playableDeviation());
    expect(verdict).toBe("playable_deviation");
    expect(user).toContain("- Gravité : négligeable");
    expect(user).toContain("- Verdict : ÉCART DE RÉPERTOIRE (coup jouable)");
    expect(user).toContain("Ne qualifie PAS le coup joué d'erreur ni de gaffe");
    expect(user).not.toContain("- Motifs :");
    expect(user).not.toContain("reconnais-le honnêtement");
  });

  it("demande de reconnaître un coup joué meilleur que le répertoire", () => {
    const { user } = promptFor(playableDeviation(80, 0));
    expect(user).toContain("le moteur préfère le coup joué au coup de référence");
    expect(user).toContain("reconnais-le honnêtement");
  });

  it("distingue imprécision et erreur stratégique", () => {
    const inaccuracy = promptFor(kingWalk(-30));
    expect(inaccuracy.user).toContain("- Verdict : IMPRÉCISION");
    expect(inaccuracy.user).toContain("Rassure le joueur");

    const strategic = promptFor(kingWalk(-150));
    expect(strategic.user).toContain("- Verdict : ERREUR STRATÉGIQUE");
    expect(strategic.user).toContain("Explique le problème positionnel");
  });
});

describe("buildCoachPrompt — données moteur", () => {
  it("se replie sur les annotations sans analyse moteur", () => {
    const { user, verdict } = promptFor({ ...queenBlunder(), engine: undefined });
    expect(verdict).toBe("unevaluated");
    expect(user).toContain("- Aucune analyse moteur disponible.");
    expect(user).not.toContain("- Gravité :");
    expect(user).toContain("- Verdict : NON ÉVALUÉ");
    expect(user).toContain("Ne te prononce pas sur la valeur objective du coup joué");
  });

  it("mentionne le meilleur coup du moteur quand il diffère du répertoire", () => {
    const input = queenBlunder();
    const { user } = promptFor({
      ...input,
      engine: { ...input.engine, before: cp(25, ["g8f6", "d2d3"]) },
    });
    expect(user).toContain("- Meilleur coup du moteur 3… Nf6 : -0.3 (profondeur 18) ; suite : 4. d3");
  });

  it("n'affiche pas deux fois le même coup quand le moteur confirme le répertoire", () => {
    const input = queenBlunder();
    const { user } = promptFor({
      ...input,
      engine: { ...input.engine, before: cp(30, ["f8c5", "c2c3"]) },
    });
    expect(user).not.toContain("Meilleur coup du moteur");
  });

  it("utilise le meilleur coup du moteur comme étalon faute d'évaluation du répertoire", () => {
    const input = queenBlunder();
    const { user } = promptFor({
      ...input,
      engine: { played: input.engine!.played, before: cp(25, ["g8f6"]) },
    });
    expect(user).toContain("- Meilleur coup du moteur 3… Nf6 : -0.3");
    expect(user).not.toContain("Coup du répertoire 3…");
  });

  it("indique un coup joué non évalué quand seule la référence est connue", () => {
    const input = queenBlunder();
    const { user } = promptFor({ ...input, engine: { expected: input.engine!.expected } });
    expect(user).toContain("- Coup joué 3… Qg5 : non évalué");
    expect(user).not.toContain("- Écart");
  });
});
