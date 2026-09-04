export type TutorialArrow = [startSquare: string, endSquare: string];

export interface TutorialNode {
  /** SAN move that led to this node. Omitted only for the root node. */
  move?: string;
  explanation?: string;
  arrows?: TutorialArrow[];
  /** Branching children, keyed by the SAN move that leads to each. */
  children?: Record<string, TutorialNode>;
}

/** A single learning unit – a chapter of a course. */
export interface OpeningChapter {
  id: string;
  name: string;
  root: TutorialNode;
}

/** A collection of related chapters. */
export interface OpeningCourse {
  id: string;
  name: string;
  description: string;
  chapters: OpeningChapter[];
}

