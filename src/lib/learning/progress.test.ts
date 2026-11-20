import { describe, expect, it } from "vitest";

import type { CourseIndexEntry } from "@/lib/data/openings/types";
import { chapterProgress, courseProgress, firstUnfinishedLessonId, nextLessonId } from "./progress";

const lesson = (id: string) => ({ id, title: id, legacyIds: [] });

const course: CourseIndexEntry = {
  id: "demo",
  name: "Démo",
  description: "",
  side: "white",
  eco: [],
  chapters: [
    { id: "c1", title: "Un", summary: "", stage: "foundations", lessons: [lesson("a"), lesson("b")] },
    { id: "c2", title: "Deux", summary: "", stage: "theory", lessons: [lesson("c")] },
  ],
};

describe("progression", () => {
  it("compte les cours parcourus par chapitre et par ouverture", () => {
    const done = new Set(["a", "c", "ailleurs"]);
    expect(chapterProgress(course.chapters[0], done)).toEqual({ completed: 1, total: 2, ratio: 0.5 });
    expect(courseProgress(course, done)).toEqual({ completed: 2, total: 3, ratio: 2 / 3 });
    expect(chapterProgress({ ...course.chapters[0], lessons: [] }, done).ratio).toBe(0);
  });

  it("donne le cours suivant, en passant au chapitre suivant", () => {
    expect(nextLessonId(course, "a")).toBe("b");
    expect(nextLessonId(course, "b")).toBe("c");
    expect(nextLessonId(course, "c")).toBeNull();
    expect(nextLessonId(course, "inconnu")).toBeNull();
  });

  it("trouve le premier cours à faire", () => {
    expect(firstUnfinishedLessonId(course, new Set(["a"]))).toBe("b");
    expect(firstUnfinishedLessonId(course, new Set(["a", "b", "c"]))).toBeNull();
  });
});
