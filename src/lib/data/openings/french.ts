import { OpeningCourse, OpeningChapter, TutorialNode } from "./types";

// 1. Variante d'Avance (Ligne droite profonde)
const advanceRoot: TutorialNode = {
  children: {
    e5: {
      move: "e5",
      explanation: "La Variante d'Avance. Les Blancs ferment le centre et gagnent de l'espace. Votre objectif vital est d'attaquer la base de leur chaîne de pions (d4) avec c5.",
      arrows: [["c7", "c5"]],
      children: {
        c5: {
          move: "c5",
          children: {
            c3: {
              move: "c3",
              explanation: "Ils consolident d4 avec le pion c3. Continuez d'accentuer la pression sur d4 en sortant votre Cavalier en c6.",
              arrows: [["b8", "c6"]],
              children: {
                Nc6: {
                  move: "Nc6",
                  explanation: "Parfait ! C'est la position de base de la Française d'Avance. Vos prochaines étapes : Db6, Cge7, et potentiellement f6 pour briser e5.",
                  // Flèches prospectives pour illustrer le plan futur
                  arrows: [["d8", "b6"], ["g8", "e7"], ["f7", "f6"]]
                }
              }
            }
          }
        }
      }
    },
  },
};

// 2. Variante Tarrasch (Embranchement avec 2 choix pour les Noirs)
const tarraschRoot: TutorialNode = {
  children: {
    Nd2: {
      move: "Nd2",
      explanation: "La Variante Tarrasch. Les Blancs protègent e4 sans bloquer leur pion c2. Vous avez deux options : dynamiter avec c5 (ouverte), ou fermer avec Cf6.",
      arrows: [["c7", "c5"], ["g8", "f6"]],
      children: {
        // --- CHOIX 1 ---
        c5: {
          move: "c5",
          explanation: "Excellent choix ! La Tarrasch ouverte va ouvrir la position rapidement, préparez-vous à un jeu dynamique et tactique.",
          // Indique le pion central adverse qui va sauter
          arrows: [["c5", "d4"]] 
        },
        // --- CHOIX 2 ---
        Nf6: {
          move: "Nf6",
          children: {
            e5: {
              move: "e5",
              explanation: "Les Blancs gagnent de l'espace avec tempo. Repliez votre cavalier en d7 pour préparer sereinement la contre-attaque c5 !",
              arrows: [["f6", "d7"]],
              children: {
                Nfd7: {
                  move: "Nfd7",
                  explanation: "Bien joué. Depuis d7, votre cavalier soutient la future rupture c5. La bataille de manœuvres commence.",
                  // Montre la future rupture soutenue par le cavalier
                  arrows: [["c7", "c5"]]
                }
              }
            }
          }
        }
      }
    },
  },
};

// 3. Variante Classique / Winawer (Embranchement au 3ème coup)
const classicalRoot: TutorialNode = {
  children: {
    Nc3: {
      move: "Nc3",
      explanation: "Le coup principal des Blancs. Vous pouvez soit clouer ce cavalier avec Fb4 (Winawer), soit mettre la pression sur e4 avec Cf6 (Classique).",
      arrows: [["f8", "b4"], ["g8", "f6"]],
      children: {
        Bb4: {
          move: "Bb4",
          explanation: "La redoutable Winawer ! Vous menacez indirectement le pion e4 en éliminant son défenseur et créez des déséquilibres complexes.",
          // Montre la menace de destruction du défenseur
          arrows: [["b4", "c3"]] 
        },
        Nf6: {
          move: "Nf6",
          explanation: "La Variante Classique (Steinitz). Une pression directe et saine sur le centre blanc.",
          // Montre la pression sur le pion central
          arrows: [["f6", "e4"]] 
        }
      }
    },
  },
};

// Helper repensé pour l'auto-play
function buildRoot(chapterRoot: TutorialNode): TutorialNode {
  return {
    children: {
      e4: {
        move: "e4",
        explanation: "Les blancs ouvre par 1. e4. Répondez avec e6 pour entrer dans la Défense Française !",
        arrows: [["e7", "e6"]],
        children: {
          e6: {
            move: "e6",
            children: {
              d4: {
                move: "d4",
                explanation: "Les Blancs s'emparent du centre. Frappez immédiatement au cœur de leur dispositif avec d5.",
                arrows: [["d7", "d5"]],
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