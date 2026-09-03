export type TutorialArrow = [startSquare: string, endSquare: string];

export interface TutorialStep {
  fen: string;
  expectedMove: string;
  explanation: string;
  arrows?: TutorialArrow[];
}

export interface OpeningTutorial {
  id: string;
  name: string;
  initialSequence: string[];
  steps: TutorialStep[];
}

export const openingTutorials: OpeningTutorial[] = [
  {
    id: "french-defense",
    name: "French Defense",
    initialSequence: ["e4"],
    steps: [
      {
        fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
        expectedMove: "e6",
        explanation:
          "Black plays e6 to prepare ...d5, contesting the center with d5 next while keeping the pawn chain solid.",
        arrows: [["d7", "d5"]],
      },
    ],
  },
];

export const openingTutorialById: Record<string, OpeningTutorial> = openingTutorials.reduce(
  (acc, tutorial) => {
    acc[tutorial.id] = tutorial;
    return acc;
  },
  {} as Record<string, OpeningTutorial>,
);
