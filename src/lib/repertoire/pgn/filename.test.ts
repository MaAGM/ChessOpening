import { describe, expect, it } from "vitest";
import { slugifyFilename } from "./filename";

describe("slugifyFilename", () => {
  it("retire les accents et les caractères interdits dans un nom de fichier", () => {
    expect(slugifyFilename("Mon 1.e4 : Sicilienne")).toBe("mon-1-e4-sicilienne");
    expect(slugifyFilename("Défense Française / Winawer")).toBe("defense-francaise-winawer");
  });

  it("tombe sur un nom par défaut quand rien ne reste", () => {
    expect(slugifyFilename("♔♕ !!!")).toBe("repertoire");
    expect(slugifyFilename("")).toBe("repertoire");
    expect(slugifyFilename("???", "export")).toBe("export");
  });

  it("limite la longueur sans laisser de tiret final", () => {
    const slug = slugifyFilename(`${"a".repeat(59)} bbbb`);
    expect(slug.length).toBeLessThanOrEqual(60);
    expect(slug.endsWith("-")).toBe(false);
  });
});
