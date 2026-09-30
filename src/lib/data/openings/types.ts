export type TutorialArrow = [startSquare: string, endSquare: string];
export type Arrow = [from: string, to: string];

export interface TutorialNode {
  move?: string;
  explanation?: string;
  arrows?: Arrow[];
  children?: Record<string, TutorialNode>;
}

/** A single learning unit – a chapter of a course. */
export interface OpeningChapter {
  id: string;
  name: string;
  side?: "white" | "black"; // <-- Ajout ici (optionnel, hérite du cours par défaut)
  root: TutorialNode;
}

/** A collection of related chapters. */
export interface OpeningCourse {
  id: string;
  name: string;
  description: string;
  side: "white" | "black"; // <-- Ajout ici
  chapters: OpeningChapter[];
}