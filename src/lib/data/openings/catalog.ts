import indexData from "./courses/index.json";
import type { CourseIndex, CourseIndexEntry, Side } from "./types";

/**
 * Index léger du catalogue Masterclass (généré par `npm run courses:index`).
 * Il est inclus dans le bundle initial : aucun PGN, seulement la structure
 * Ouverture → Chapitres → Cours. Le contenu d'une ouverture est chargé à la demande
 * (voir `loader.ts`).
 */
export const courseIndex: CourseIndex = indexData as CourseIndex;

export const courseEntries: readonly CourseIndexEntry[] = courseIndex.courses;

export type LessonLocation = {
  courseId: string;
  chapterId: string;
  side: Side;
  /** Position du cours dans l'ouverture (tous chapitres confondus, à partir de 0). */
  order: number;
};

const locations = new Map<string, LessonLocation>();
const legacyToLesson = new Map<string, string>();

for (const course of courseEntries) {
  let order = 0;
  for (const chapter of course.chapters) {
    for (const lesson of chapter.lessons) {
      locations.set(lesson.id, { courseId: course.id, chapterId: chapter.id, side: course.side, order: order++ });
      for (const legacy of lesson.legacyIds) legacyToLesson.set(legacy, lesson.id);
    }
  }
}

export function getCourseEntry(courseId: string): CourseIndexEntry | null {
  return courseEntries.find((course) => course.id === courseId) ?? null;
}

/** Où se trouve un cours (ouverture, chapitre, camp), ou null s'il n'existe pas. */
export function getLessonLocation(lessonId: string): LessonLocation | null {
  return locations.get(lessonId) ?? null;
}

/** Identifiants de tous les cours d'une ouverture, dans l'ordre pédagogique. */
export function getCourseLessonIds(courseId: string): string[] {
  const course = getCourseEntry(courseId);
  return course ? course.chapters.flatMap((chapter) => chapter.lessons.map((lesson) => lesson.id)) : [];
}

/**
 * Identifiant actuel d'un cours : un ancien identifiant (`french-m1`) est traduit vers
 * le nouveau (`french-c1-l1`) ; tout autre identifiant est renvoyé tel quel.
 */
export function resolveLessonId(id: string): string {
  return legacyToLesson.get(id) ?? id;
}
