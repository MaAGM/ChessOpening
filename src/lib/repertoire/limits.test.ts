import { describe, expect, it } from "vitest";
import { REPERTOIRE_LIMITS, getLimitStatus } from "./limits";
import { EDITOR_SHORTCUTS } from "./shortcuts";

describe("getLimitStatus", () => {
  it("est confortable, proche à 90 %, puis atteinte", () => {
    expect(getLimitStatus(0, 100)).toBe("ok");
    expect(getLimitStatus(89, 100)).toBe("ok");
    expect(getLimitStatus(90, 100)).toBe("near");
    expect(getLimitStatus(99, 100)).toBe("near");
    expect(getLimitStatus(100, 100)).toBe("full");
    expect(getLimitStatus(150, 100)).toBe("full");
  });

  it("accepte un autre seuil", () => {
    expect(getLimitStatus(80, 100, 0.8)).toBe("near");
  });

  it("s'applique aux limites de l'éditeur", () => {
    expect(getLimitStatus(REPERTOIRE_LIMITS.maxNodes - 1, REPERTOIRE_LIMITS.maxNodes)).toBe("near");
  });
});

describe("EDITOR_SHORTCUTS", () => {
  it("documente les raccourcis implémentés par l'éditeur", () => {
    const keys = EDITOR_SHORTCUTS.map((s) => s.keys).join(" | ");
    for (const expected of ["←", "↑", "Début", "Suppr", "Entrée", "Ctrl+Z", "Ctrl+Maj+Z"]) {
      expect(keys).toContain(expected);
    }
    expect(EDITOR_SHORTCUTS.every((s) => s.description.length > 0)).toBe(true);
  });
});
