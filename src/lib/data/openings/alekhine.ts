import type { OpeningCourse, OpeningChapter, TutorialNode } from "./types";

// Alekhine – B02: 1. e4 Nf6 2. e5 Nd5 3. d4 d6
const alekhineRoot: TutorialNode = {
  children: {
    e4: {
      move: "e4",
      explanation: "L'ordinateur ouvre par 1. e4. Entrez dans la Défense Alekhine, une ouverture hypermoderne provocatrice, en attaquant immédiatement le pion central !",
      arrows: [["g8", "f6"]],
      children: {
        Nf6: {
          move: "Nf6",
          // Nœud fantôme (coup du joueur, pas d'explication pour laisser l'auto-play agir)
          children: {
            e5: {
              move: "e5",
              explanation: "Les Blancs tombent dans le panneau et s'étendent pour chasser votre cavalier. Installez-le activement sur la case centrale d5.",
              arrows: [["f6", "d5"]],
              children: {
                Nd5: {
                  move: "Nd5",
                  // Nœud fantôme
                  children: {
                    d4: {
                      move: "d4",
                      explanation: "Ils construisent un large centre de pions. C'est exactement l'objectif de l'Alekhine : laissez-les s'étendre pour mieux s'effondrer. Sapez ce centre avec d6.",
                      arrows: [["d7", "d6"]],
                      children: {
                        d6: {
                          move: "d6",
                          explanation: "Excellent ! Vous contestez la chaîne de pions adverse. Ces pions avancés vont maintenant devenir des cibles. Prochaines étapes : clouer leur cavalier avec Fg4 et dynamiter avec c5.",
                          // Flèches prospectives de fin de chapitre
                          arrows: [["c8", "g4"], ["c7", "c5"]]
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

export const alekhineCourse: OpeningCourse = {
  id: "alekhine",
  name: "Défense Alekhine",
  description: "Attirez les pions blancs vers l'avant pour mieux les détruire. Une défense hypermoderne agressive.",
  chapters: [
    {
      id: "alekhine-b02",
      name: "Ligne Principale (B02)",
      root: alekhineRoot,
    },
  ],
};