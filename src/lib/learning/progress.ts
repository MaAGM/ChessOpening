import type { ChapterIndexEntry, CourseIndexEntry } from "@/lib/data/openings/types";

export type Progress = { completed: number; total: number; ratio: number };

const progressOf = (ids: readonly string[], completed: ReadonlySet<string>): Progress => {
  const done = ids.filter((id) => completed.has(id)).length;
  return { completed: done, total: ids.length, ratio: ids.length > 0 ? done / ids.length : 0 };
};

export const chapterLessonIds = (chapter: ChapterIndexEntry): string[] => chapter.lessons.map((l) => l.id);

export const courseLessonIds = (course: CourseIndexEntry): string[] => course.chapters.flatMap(chapterLessonIds);

export function chapterProgress(chapter: ChapterIndexEntry, completed: ReadonlySet<string>): Progress {
  return progressOf(chapterLessonIds(chapter), completed);
}

export function courseProgress(course: CourseIndexEntry, completed: ReadonlySet<string>): Progress {
  return progressOf(courseLessonIds(course), completed);
}

/** Cours suivant dans l'ordre pédagogique (en passant au chapitre suivant), ou null. */
export function nextLessonId(course: CourseIndexEntry, lessonId: string): string | null {
  const ids = courseLessonIds(course);
  const index = ids.indexOf(lessonId);
  return index >= 0 && index < ids.length - 1 ? ids[index + 1] : null;
}

/** Premier cours pas encore parcouru (pour « Continuer »), ou null si tout est fait. */
export function firstUnfinishedLessonId(course: CourseIndexEntry, completed: ReadonlySet<string>): string | null {
  return courseLessonIds(course).find((id) => !completed.has(id)) ?? null;
}

/** Libellés des étapes pédagogiques. */
export const STAGE_LABELS: Record<ChapterIndexEntry["stage"], string> = {
  foundations: "Fondations",
  plans: "Plans typiques",
  responses: "Réponses adverses",
  traps: "Pièges",
  theory: "Théorie",
};
