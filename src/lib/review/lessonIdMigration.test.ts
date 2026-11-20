import { describe, expect, it } from "vitest";

import { courseEntries, resolveLessonId } from "@/lib/data/openings/catalog";
import { migrateLessonIds } from "./lessonIdMigration";
import type { ReviewStoreState } from "./reviewStore";
import { diffStates, mergeAndMigrate } from "./reviewSync";

const state = (overrides: Partial<ReviewStoreState> = {}): ReviewStoreState => ({
  version: 2,
  reviewChapters: {},
  completedChapters: [],
  positions: {},
  ...overrides,
});

describe("resolveLessonId", () => {
  it("traduit chaque ancien identifiant du catalogue vers un cours unique", () => {
    const legacy = courseEntries.flatMap((c) => c.chapters.flatMap((ch) => ch.lessons.flatMap((l) => l.legacyIds)));
    expect(legacy.length).toBe(105);
    const targets = legacy.map(resolveLessonId);
    expect(new Set(targets).size).toBe(legacy.length);
    expect(targets.every((id, i) => id !== legacy[i])).toBe(true);
  });

  it("renvoie tel quel un identifiant actuel ou inconnu", () => {
    expect(resolveLessonId("french-c1-l1")).toBe("french-c1-l1");
    expect(resolveLessonId("inconnu")).toBe("inconnu");
  });
});

describe("migrateLessonIds", () => {
  it("renvoie le même objet quand il n'y a rien à migrer", () => {
    const input = state({ completedChapters: ["french-c1-l1"], reviewChapters: { x: { addedAt: 1 } } });
    expect(migrateLessonIds(input)).toBe(input);
  });

  it("migre les cours terminés et en révision, sans doublon", () => {
    const migrated = migrateLessonIds(
      state({
        // italian-m2 → italian-c1-l4 et italian-m1 → italian-c1-l2 : les entrées déjà migrées l'emportent.
        reviewChapters: { "italian-m2": { addedAt: 900 }, "italian-c1-l4": { addedAt: 400 }, "inconnu": { addedAt: 7 } },
        completedChapters: ["italian-m1", "italian-c1-l2", "inconnu"],
        positions: { k: { box: 1, due: 0, attempts: 1, failures: 0, lastSeen: 0, recent: [1] } },
      }),
    );
    expect(migrated.reviewChapters).toEqual({ "italian-c1-l4": { addedAt: 400 }, inconnu: { addedAt: 7 } });
    expect(migrated.completedChapters).toEqual(["italian-c1-l2", "inconnu"]);
    expect(Object.keys(migrated.positions)).toEqual(["k"]);
  });
});

describe("synchronisation d'un cloud aux anciens identifiants", () => {
  it("la fusion migre, puis le diff supprime les anciennes lignes et crée les nouvelles", () => {
    const remote = state({ reviewChapters: { "french-m2": { addedAt: 10 } }, completedChapters: ["french-m1"] });
    const merged = mergeAndMigrate(state(), remote);

    expect(merged.reviewChapters).toEqual({ "french-c2-l3": { addedAt: 10 } });
    expect(merged.completedChapters).toEqual(["french-c1-l2"]);

    const changes = diffStates(remote, merged);
    expect(changes.chaptersDelete.sort()).toEqual(["french-m1", "french-m2"]);
    expect(changes.chaptersReviewSet).toEqual({ "french-c2-l3": 10 });
    expect(changes.chaptersCompletedSet).toEqual(["french-c1-l2"]);

    // Une fois le cloud à jour, plus rien à envoyer.
    expect(diffStates(merged, mergeAndMigrate(merged, merged)).chaptersDelete).toEqual([]);
  });
});
