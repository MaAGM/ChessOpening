import { describe, expect, it } from "vitest";

import { LruCache, analysisKey } from "./analysisCache";

describe("analysisKey", () => {
  it("ignore les compteurs de coups mais garde la case en passant", () => {
    const a = "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2";
    const b = "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 3 9";
    const c = "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2";
    expect(analysisKey(a)).toBe(analysisKey(b));
    expect(analysisKey(a)).not.toBe(analysisKey(c));
  });

  it("complète une FEN tronquée", () => {
    expect(analysisKey("8/8/8/8/8/8/8/K6k")).toBe("8/8/8/8/8/8/8/K6k w - -");
  });
});

describe("LruCache", () => {
  it("évince l'entrée la moins récemment utilisée", () => {
    const cache = new LruCache<number>(2);
    cache.set("a", 1);
    cache.set("b", 2);
    expect(cache.get("a")).toBe(1); // « a » redevient la plus récente
    cache.set("c", 3);
    expect(cache.get("b")).toBeUndefined();
    expect(cache.get("a")).toBe(1);
    expect(cache.get("c")).toBe(3);
    expect(cache.size).toBe(2);
  });

  it("remplace une valeur existante sans grossir", () => {
    const cache = new LruCache<number>(2);
    cache.set("a", 1);
    cache.set("a", 2);
    expect(cache.size).toBe(1);
    expect(cache.get("a")).toBe(2);
    cache.clear();
    expect(cache.size).toBe(0);
  });

  it("refuse une capacité invalide", () => {
    expect(() => new LruCache(0)).toThrow(RangeError);
  });
});
