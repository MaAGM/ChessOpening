import { openingCourses } from "@/lib/data/openings";
import type { OpeningChapter, TutorialNode } from "@/lib/data/openings";
import { toTutorialRoot } from "@/lib/repertoire/convert";
import type { Repertoire } from "@/lib/repertoire/types";
import { buildReviewGraph, type ReviewGraph } from "./reviewGraph";
import type { Side } from "./types";

export type { Side };

/** Ce qui alimente la révision : un chapitre Masterclass ou un répertoire de l'utilisateur. */
export type ReviewSource = {
  /** Identifiant unique (chapitre : son id ; répertoire : « repertoire:<id> »). */
  id: string;
  name: string;
  side: Side;
  root: TutorialNode;
};

export type SourceCount = { chapters: number; repertoires: number };

const REPERTOIRE_SOURCE_PREFIX = "repertoire:";

/** Identifiant sous lequel un répertoire apparaît dans le graphe de révision. */
export function repertoireSourceId(repertoireId: string): string {
  return `${REPERTOIRE_SOURCE_PREFIX}${repertoireId}`;
}

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

function getChapterSources(side: Side, chapterIds: string[]): ReviewSource[] {
  return getReviewChapters(side, chapterIds).map((chapter) => ({
    id: chapter.id,
    name: chapter.name,
    side,
    root: chapter.root,
  }));
}

/**
 * Répertoires proposés en révision pour une couleur : ceux dont l'interrupteur « en révision »
 * est activé et qui contiennent au moins un coup (un répertoire vide n'a aucune fiche).
 */
export function getRepertoireSources(side: Side, repertoires: Repertoire[]): ReviewSource[] {
  return repertoires
    .filter((r) => r.side === side && r.reviewEnabled && r.children.length > 0)
    .map((r) => ({
      id: repertoireSourceId(r.id),
      name: r.name,
      side,
      root: toTutorialRoot(r),
    }));
}

/** Toutes les sources d'une couleur : chapitres ajoutés aux révisions + répertoires activés. */
export function getReviewSources(
  side: Side,
  chapterIds: string[],
  repertoires: Repertoire[] = [],
): ReviewSource[] {
  return [...getChapterSources(side, chapterIds), ...getRepertoireSources(side, repertoires)];
}

/** Graphe de positions de la révision d'une couleur, ou null s'il n'y a aucune source. */
export function buildReviewGraphForSide(
  side: Side,
  chapterIds: string[],
  repertoires: Repertoire[] = [],
): ReviewGraph | null {
  const sources = getReviewSources(side, chapterIds, repertoires);
  return sources.length > 0 ? buildReviewGraph(sources) : null;
}

/** Nombre de chapitres sauvegardés par couleur (pour activer/désactiver Blancs / Noirs). */
export function countReviewChaptersBySide(chapterIds: string[]): Record<Side, number> {
  return {
    white: getReviewChapters("white", chapterIds).length,
    black: getReviewChapters("black", chapterIds).length,
  };
}

/** Nombre de sources de révision par couleur, chapitres et répertoires distingués. */
export function countReviewSourcesBySide(
  chapterIds: string[],
  repertoires: Repertoire[] = [],
): Record<Side, SourceCount> {
  const count = (side: Side): SourceCount => ({
    chapters: getReviewChapters(side, chapterIds).length,
    repertoires: getRepertoireSources(side, repertoires).length,
  });
  return { white: count("white"), black: count("black") };
}