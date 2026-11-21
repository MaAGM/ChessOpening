import type { CoachLessonContext } from "./chatProtocol";

/** Ce que le mode Apprentissage expose au Coach (sous-ensemble structurel du tutoriel). */
export type LessonCoachSource = {
  course: { name: string } | null;
  activeChapter: { title: string } | null;
  activeLesson: { title: string; objectives: readonly string[] } | null;
  activeNode: { explanation?: string; children?: Record<string, unknown> } | null;
};

/**
 * Contexte de cours envoyé au Coach : titres, objectifs, commentaire affiché pour la
 * position courante et coups prévus par le cours depuis cette position (null hors cours).
 */
export function buildLessonContext({ course, activeChapter, activeLesson, activeNode }: LessonCoachSource): CoachLessonContext | null {
  if (!course || !activeChapter || !activeLesson || !activeNode) return null;
  return {
    courseName: course.name,
    chapterTitle: activeChapter.title,
    lessonTitle: activeLesson.title,
    objectives: [...activeLesson.objectives],
    comment: activeNode.explanation?.trim() || null,
    expectedMoves: Object.keys(activeNode.children ?? {}),
  };
}
