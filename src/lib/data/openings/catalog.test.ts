import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { courseEntries, getCourseLessonIds, getLessonLocation, resolveLessonId } from "./catalog";
import { courseLoaders, getLoadedLesson, loadAllCourses, loadCourse } from "./loader";
import { COURSE_STAGES, type OpeningCourseData } from "./types";

const rawCourse = async (id: string) => (await courseLoaders[id]()).default as OpeningCourseData;

/** Même dérivation que scripts/build-course-index.mjs. */
const deriveIndexEntry = (course: OpeningCourseData) => ({
  id: course.id,
  name: course.name,
  description: course.description,
  side: course.side,
  eco: course.eco,
  chapters: course.chapters.map((chapter) => ({
    id: chapter.id,
    title: chapter.title,
    summary: chapter.summary,
    stage: chapter.stage,
    lessons: chapter.lessons.map((lesson) => ({ id: lesson.id, title: lesson.title, legacyIds: lesson.legacyIds ?? [] })),
  })),
});

describe("catalogue Masterclass : index et fichiers d'ouverture", () => {
  it("chaque ouverture de l'index a un chargeur, et inversement", () => {
    expect(Object.keys(courseLoaders).sort()).toEqual(courseEntries.map((c) => c.id).sort());
  });

  it("l'index est à jour (sinon : npm run courses:index)", async () => {
    for (const entry of courseEntries) {
      expect(deriveIndexEntry(await rawCourse(entry.id)), entry.id).toEqual(entry);
    }
  });

  it("l'ordre de l'index suit order.json", () => {
    const order = JSON.parse(
      readFileSync(new URL("./courses/order.json", import.meta.url), "utf8"),
    ) as string[];
    expect(courseEntries.map((c) => c.id)).toEqual(order);
  });

  it("les identifiants (ouvertures, chapitres, cours, anciens) sont uniques", () => {
    const all = courseEntries.flatMap((course) => [
      course.id,
      ...course.chapters.flatMap((chapter) => [
        chapter.id,
        ...chapter.lessons.flatMap((lesson) => [lesson.id, ...lesson.legacyIds]),
      ]),
    ]);
    expect(new Set(all).size).toBe(all.length);
  });

  it("structure valide : étapes connues, chapitres non vides", async () => {
    for (const entry of courseEntries) {
      const course = await rawCourse(entry.id);
      expect(course.chapters.length, entry.id).toBeGreaterThan(0);
      for (const chapter of course.chapters) {
        expect(COURSE_STAGES, chapter.id).toContain(chapter.stage);
        expect(chapter.lessons.length, chapter.id).toBeGreaterThan(0);
        for (const lesson of chapter.lessons) {
          expect(["mainline", "allBranches"], lesson.id).toContain(lesson.mustCover);
          expect(["concept", "line", "trap", "quiz"], lesson.id).toContain(lesson.kind);
          expect(Array.isArray(lesson.objectives), lesson.id).toBe(true);
        }
      }
    }
  });

  it("le catalogue converti garde ses 105 cours, chacun lié à son ancien identifiant", () => {
    const lessons = courseEntries.flatMap((c) => c.chapters.flatMap((ch) => ch.lessons));
    expect(lessons).toHaveLength(105);
    for (const lesson of lessons) {
      expect(lesson.legacyIds).toHaveLength(1);
      expect(resolveLessonId(lesson.legacyIds[0])).toBe(lesson.id);
    }
  });

  it("localise un cours sans rien charger", () => {
    expect(getLessonLocation("french-c2-l1")).toEqual({
      courseId: "french",
      chapterId: "french-c2",
      side: "black",
      order: 2,
    });
    expect(getLessonLocation("inconnu")).toBeNull();
    expect(getCourseLessonIds("french")).toHaveLength(5);
  });
});

describe("chargement à la demande", () => {
  it("construit tous les arbres à partir du PGN (coups légaux)", async () => {
    const courses = await loadAllCourses();
    expect(courses).toHaveLength(courseEntries.length);
    for (const course of courses) {
      for (const lesson of course.chapters.flatMap((c) => c.lessons)) {
        expect(Object.keys(lesson.root.children ?? {}).length, lesson.id).toBeGreaterThan(0);
        expect(lesson.side).toBe(course.side);
        expect(lesson.courseId).toBe(course.id);
      }
    }
  });

  it("met l'ouverture en cache : un second chargement renvoie le même objet", async () => {
    const first = await loadCourse("italian");
    expect(await loadCourse("italian")).toBe(first);
    expect(getLoadedLesson("italian-c1-l1")?.title).toBe(first.chapters[0].lessons[0].title);
  });

  it("refuse une ouverture inconnue", async () => {
    await expect(loadCourse("inconnue")).rejects.toThrow(/inconnue/);
  });
});
