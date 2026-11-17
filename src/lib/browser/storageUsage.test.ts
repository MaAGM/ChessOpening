import { describe, expect, it } from "vitest";
import { ASSUMED_QUOTA_BYTES, formatBytes, getLocalStorageUsageBytes, storageUsageRatio } from "./storageUsage";

function fakeStorage(entries: Record<string, string>) {
  const keys = Object.keys(entries);
  return {
    length: keys.length,
    key: (index: number) => keys[index] ?? null,
    getItem: (key: string) => entries[key] ?? null,
  };
}

describe("getLocalStorageUsageBytes", () => {
  it("compte 2 octets par caractère, clés comprises", () => {
    expect(getLocalStorageUsageBytes(fakeStorage({ ab: "cdef", x: "" }))).toBe((2 + 4 + 1 + 0) * 2);
  });

  it("vaut 0 pour un stockage vide ou indisponible", () => {
    expect(getLocalStorageUsageBytes(fakeStorage({}))).toBe(0);
    expect(
      getLocalStorageUsageBytes({
        length: 1,
        key: () => {
          throw new Error("accès refusé");
        },
        getItem: () => null,
      }),
    ).toBe(0);
    expect(getLocalStorageUsageBytes()).toBe(0); // pas de window dans cet environnement
  });
});

describe("storageUsageRatio", () => {
  it("donne la part du quota utilisée", () => {
    expect(storageUsageRatio(ASSUMED_QUOTA_BYTES / 2)).toBeCloseTo(0.5, 5);
    expect(storageUsageRatio(10, 0)).toBe(0);
  });
});

describe("formatBytes", () => {
  it("écrit en Ko puis en Mo", () => {
    expect(formatBytes(0)).toBe("1 Ko");
    expect(formatBytes(2048)).toBe("2 Ko");
    expect(formatBytes(1.5 * 1024 * 1024)).toBe("1,5 Mo");
  });
});
