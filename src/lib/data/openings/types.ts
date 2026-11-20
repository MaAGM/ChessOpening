export type TutorialArrow = [startSquare: string, endSquare: string];
export type Arrow = [from: string, to: string];

export type Side = "white" | "black";

/** Nœud de l'arbre joué en mode Apprentissage (et lu par le moteur de révision). */
export interface TutorialNode {
  move?: string;
  /** Texte affiché quand ce nœud est la position courante. */
  explanation?: string;
  arrows?: Arrow[];
  children?: Record<string, TutorialNode>;
}

// ---------------------------------------------------------------------------
// Catalogue Masterclass : Ouverture → Chapitres → Cours (leçons)
// ---------------------------------------------------------------------------

/** Étape pédagogique d'un chapitre, de la plus simple à la plus théorique. */
export type CourseStage = "foundations" | "plans" | "responses" | "traps" | "theory";

export const COURSE_STAGES: readonly CourseStage[] = ["foundations", "plans", "responses", "traps", "theory"];

export type LessonKind = "concept" | "line" | "trap" | "quiz";

/**
 * Ce qu'il faut parcourir pour qu'un cours soit marqué « parcouru » :
 *  - mainline    : la ligne principale (premier coup de chaque bifurcation) ;
 *  - allBranches : toutes les fins de variante de l'arbre.
 */
export type MustCover = "mainline" | "allBranches";

/** Cours tel qu'il est écrit dans le fichier JSON d'une ouverture. */
export interface LessonData {
  /** Identifiant stable : persisté (progression, révisions, Convex `chapterId`). */
  id: string;
  /** Anciens identifiants du même cours, migrés automatiquement vers `id`. */
  legacyIds?: string[];
  title: string;
  eco?: string;
  kind: LessonKind;
  /** « À la fin de ce cours, tu sauras… » (peut être vide). */
  objectives: string[];
  /** PGN annoté : variantes entre parenthèses, {commentaires} et flèches [%cal Ge2e4]. */
  pgn: string;
  /** Texte affiché en fin de variante (sinon un message par défaut). */
  conclusion?: string;
  mustCover: MustCover;
  /** Le cours peut être ajouté aux révisions (répétition espacée). */
  reviewable: boolean;
}

export interface CourseChapterData {
  id: string;
  title: string;
  summary: string;
  stage: CourseStage;
  lessons: LessonData[];
}

/** Contenu complet d'un fichier d'ouverture (`courses/<id>.json`). */
export interface OpeningCourseData {
  id: string;
  name: string;
  description: string;
  side: Side;
  eco: string[];
  chapters: CourseChapterData[];
}

/** Cours prêt à être joué : son arbre est construit à partir du PGN. */
export interface Lesson extends LessonData {
  courseId: string;
  chapterId: string;
  side: Side;
  root: TutorialNode;
}

export interface CourseChapter extends Omit<CourseChapterData, "lessons"> {
  lessons: Lesson[];
}

export interface OpeningCourse extends Omit<OpeningCourseData, "chapters"> {
  chapters: CourseChapter[];
}

// ---------------------------------------------------------------------------
// Index léger (sans PGN) : sélecteur d'ouvertures, progression, migration
// ---------------------------------------------------------------------------
export interface LessonIndexEntry {
  id: string;
  title: string;
  legacyIds: string[];
}

export interface ChapterIndexEntry {
  id: string;
  title: string;
  summary: string;
  stage: CourseStage;
  lessons: LessonIndexEntry[];
}

export interface CourseIndexEntry {
  id: string;
  name: string;
  description: string;
  side: Side;
  eco: string[];
  chapters: ChapterIndexEntry[];
}

export interface CourseIndex {
  version: 1;
  courses: CourseIndexEntry[];
}
