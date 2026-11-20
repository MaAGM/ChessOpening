import { courseEntries, getLessonLocation } from "./catalog";
import { buildLessonTree } from "./lessonTree";
import type { Lesson, OpeningCourse, OpeningCourseData } from "./types";

type CourseModule = { default: unknown };

/**
 * Un import() par ouverture : chaque fichier devient un morceau du bundle chargé
 * seulement quand l'ouverture est ouverte (ou révisée). La liste doit couvrir
 * exactement les ouvertures de l'index (vérifié par les tests).
 */
export const courseLoaders: Record<string, () => Promise<CourseModule>> = {
  alekhine: () => import("./courses/alekhine.json"),
  benoni: () => import("./courses/benoni.json"),
  caro_kann: () => import("./courses/caro_kann.json"),
  catalan: () => import("./courses/catalan.json"),
  english: () => import("./courses/english.json"),
  french: () => import("./courses/french.json"),
  grunfeld: () => import("./courses/grunfeld.json"),
  italian: () => import("./courses/italian.json"),
  kings_gambit: () => import("./courses/kings_gambit.json"),
  kings_indian: () => import("./courses/kings_indian.json"),
  london_system: () => import("./courses/london_system.json"),
  pirc: () => import("./courses/pirc.json"),
  queens_gambit: () => import("./courses/queens_gambit.json"),
  reti: () => import("./courses/reti.json"),
  ruy_lopez: () => import("./courses/ruy_lopez.json"),
  scandinavian: () => import("./courses/scandinavian.json"),
  scotch: () => import("./courses/scotch.json"),
  sicilian: () => import("./courses/sicilian.json"),
  slav: () => import("./courses/slav.json"),
  trompowsky: () => import("./courses/trompowsky.json"),
  vienna: () => import("./courses/vienna.json"),
};

/** Construit les arbres de tous les cours d'une ouverture à partir de leur PGN. */
export function buildCourse(data: OpeningCourseData): OpeningCourse {
  return {
    ...data,
    chapters: data.chapters.map((chapter) => ({
      ...chapter,
      lessons: chapter.lessons.map((lesson): Lesson => {
        try {
          return {
            ...lesson,
            courseId: data.id,
            chapterId: chapter.id,
            side: data.side,
            root: buildLessonTree(lesson.pgn, data.side, lesson.conclusion),
          };
        } catch (error) {
          throw new Error(`[Masterclass] Cours « ${lesson.id} » : ${(error as Error).message}`);
        }
      }),
    })),
  };
}

const loaded = new Map<string, OpeningCourse>();
const pending = new Map<string, Promise<OpeningCourse>>();

/** Charge une ouverture (une seule fois : les appels suivants réutilisent le résultat). */
export function loadCourse(courseId: string): Promise<OpeningCourse> {
  const cached = loaded.get(courseId);
  if (cached) return Promise.resolve(cached);

  const inFlight = pending.get(courseId);
  if (inFlight) return inFlight;

  const loader = courseLoaders[courseId];
  if (!loader) return Promise.reject(new Error(`[Masterclass] Ouverture inconnue : « ${courseId} ».`));

  const promise = loader()
    .then((module) => {
      const course = buildCourse(module.default as OpeningCourseData);
      loaded.set(courseId, course);
      return course;
    })
    .finally(() => pending.delete(courseId));
  pending.set(courseId, promise);
  return promise;
}

/** Ouverture déjà chargée, sans rien charger (null sinon). */
export function getLoadedCourse(courseId: string): OpeningCourse | null {
  return loaded.get(courseId) ?? null;
}

/** Cours déjà chargé, sans rien charger (null s'il est inconnu ou pas encore chargé). */
export function getLoadedLesson(lessonId: string): Lesson | null {
  const location = getLessonLocation(lessonId);
  if (!location) return null;
  const course = loaded.get(location.courseId);
  if (!course) return null;
  for (const chapter of course.chapters) {
    const lesson = chapter.lessons.find((l) => l.id === lessonId);
    if (lesson) return lesson;
  }
  return null;
}

/** Charge les ouvertures qui contiennent ces cours (les identifiants inconnus sont ignorés). */
export async function loadCoursesForLessons(lessonIds: readonly string[]): Promise<OpeningCourse[]> {
  const courseIds = new Set<string>();
  for (const id of lessonIds) {
    const location = getLessonLocation(id);
    if (location) courseIds.add(location.courseId);
  }
  return Promise.all([...courseIds].map(loadCourse));
}

/** Charge tout le catalogue (tests, outils). */
export function loadAllCourses(): Promise<OpeningCourse[]> {
  return Promise.all(courseEntries.map((course) => loadCourse(course.id)));
}

/** Vrai si toutes les ouvertures de ces cours sont déjà chargées. */
export function areLessonsLoaded(lessonIds: readonly string[]): boolean {
  return lessonIds.every((id) => {
    const location = getLessonLocation(id);
    return !location || loaded.has(location.courseId);
  });
}
