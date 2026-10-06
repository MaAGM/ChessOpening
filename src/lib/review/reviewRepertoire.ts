import { openingCourses } from "@/lib/data/openings";
import type { OpeningChapter } from "@/lib/data/openings";
import { buildReviewTree, type ReviewNode } from "./reviewTree";

export type Side = "white" | "black";

/**
 * Chapitres sauvegardés pour une couleur donnée.
 * Les IDs obsolètes (chapitre retiré d'eco-blueprints.json) sont ignorés
 * naturellement : on part des chapitres qui existent, pas des IDs.
 */
export function getReviewChapters(side: Side, chapterIds: string[]): OpeningChapter[] {
  const wanted = new Set(chapterIds);
  return openingCourses.flatMap((course) =>
    course.chapters.filter(
      (chapter) => wanted.has(chapter.id) && (chapter.side ?? course.side) === side,
    ),
  );
}

/** Arbre fusionné de tout le répertoire d'une couleur, ou null s'il est vide. */
export function buildReviewTreeForSide(side: Side, chapterIds: string[]): ReviewNode | null {
  const chapters = getReviewChapters(side, chapterIds);
  return chapters.length > 0 ? buildReviewTree(chapters) : null;
}

/** Nombre de chapitres sauvegardés par couleur (pour activer/désactiver Blancs / Noirs). */
export function countReviewChaptersBySide(chapterIds: string[]): Record<Side, number> {
  return {
    white: getReviewChapters("white", chapterIds).length,
    black: getReviewChapters("black", chapterIds).length,
  };
}