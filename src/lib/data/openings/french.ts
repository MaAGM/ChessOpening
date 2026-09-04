import { OpeningCourse, OpeningChapter, TutorialNode } from "./types";

// 1. Variante d'Avance (Ligne droite profonde)
const advanceRoot: TutorialNode = {
  children: {
    e5: {
      move: "e5",
      explanation: "La Variante d'Avance. Les Blancs ferment le centre et gagnent de l'espace à l'aile Roi.",
      arrows: [["e4", "e5"]],
      children: {
        c5: {
          move: "c5",
          explanation: "La réaction vitale de la Française. Le centre étant bloqué, les Noirs attaquent la base de la chaîne de pions adverse (d4).",
          arrows: [["c7", "c5"]],
          children: {
            c3: {
              move: "c3",
              explanation: "Les Blancs consolident d4. Si d4 tombe, c'est tout le centre blanc qui s'effondre.",
              children: {
                Nc6: {
                  move: "Nc6",
                  explanation: "Les Noirs augmentent la pression sur d4 tout en se développant.",
                  arrows: [["b8", "c6"]],
                }
              }
            }
          }
        }
      }
    },
  },
};

// 2. Variante Tarrasch (Test de l'embranchement avec 2 choix pour les Noirs)
const tarraschRoot: TutorialNode = {
  children: {
    Nd2: {
      move: "Nd2",
      explanation: "La Variante Tarrasch. Contrairement à Cc3, ce coup ne bloque pas le pion c2, ce qui permettra aux Blancs de jouer c3 pour soutenir d4.",
      arrows: [["b1", "d2"]],
      children: {
        // --- CHOIX 1 ---
        c5: {
          move: "c5",
          explanation: "Option A : La Tarrasch ouverte. Les Noirs contestent immédiatement le centre. La position va s'ouvrir.",
          arrows: [["c7", "c5"]],
        },
        // --- CHOIX 2 ---
        Nf6: {
          move: "Nf6",
          explanation: "Option B : La Tarrasch fermée. Les Noirs provoquent la poussée e5 pour bloquer le centre avant de contre-attaquer.",
          arrows: [["g8", "f6"]],
          children: {
            e5: {
              move: "e5",
              explanation: "Les Blancs gagnent de l'espace avec tempo sur le cavalier.",
              children: {
                Nfd7: { move: "Nfd7" }
              }
            }
          }
        }
      }
    },
  },
};

// 3. Variante Classique / Winawer (Test d'un autre embranchement)
const classicalRoot: TutorialNode = {
  children: {
    Nc3: {
      move: "Nc3",
      explanation: "Le coup le plus naturel. Les Blancs développent une pièce tout en défendant e4 et en mettant la pression sur d5.",
      arrows: [["b1", "c3"]],
      children: {
        Bb4: {
          move: "Bb4",
          explanation: "La fameuse Variante Winawer ! Les Noirs clouent le cavalier, menaçant indirectement de gagner le pion e4.",
          arrows: [["f8", "b4"]],
        },
        Nf6: {
          move: "Nf6",
          explanation: "La Variante Classique (Steinitz). Une pression directe et saine sur le pion e4.",
          arrows: [["g8", "f6"]],
        }
      }
    },
  },
};

// Helper pour injecter les coups de base de la Française
function buildRoot(chapterRoot: TutorialNode): TutorialNode {
  return {
    children: {
      e4: {
        move: "e4",
        children: {
          e6: {
            move: "e6",
            children: {
              d4: {
                move: "d4",
                children: {
                  d5: {
                    move: "d5",
                    children: chapterRoot.children,
                  },
                },
              },
            },
          },
        },
      },
    },
  };
}

export const frenchCourse: OpeningCourse = {
  id: "french",
  name: "Défense Française",
  description: "Structure solide et fermée. Maîtrisez les contre-attaques sur le centre blanc.",
  chapters: [
    {
      id: "french-advance",
      name: "Variante d'Avance (3. e5)",
      root: buildRoot(advanceRoot),
    },
    {
      id: "french-tarrasch",
      name: "Variante Tarrasch (3. Cd2)",
      root: buildRoot(tarraschRoot),
    },
    {
      id: "french-classical",
      name: "Classique & Winawer (3. Cc3)",
      root: buildRoot(classicalRoot),
    },
  ],
};