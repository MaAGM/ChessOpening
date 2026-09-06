import type { OpeningCourse, OpeningChapter, TutorialNode } from "./types";

// Pirc – B07 : 1. e4 d6 2. d4 Nf6 3. Nc3 g6
const pircB07Root: TutorialNode = {
  explanation: "La Défense Pirc. Une ouverture hypermoderne et provocatrice. Préparez-vous, l'ordinateur va jouer avec les Blancs...",
  children: {
    e4: {
      move: "e4",
      explanation: "L'ordinateur ouvre par 1. e4. Entrez dans la Pirc en jouant d6, préparant une structure solide et asymétrique.",
      arrows: [["d7", "d6"]],
      children: {
        d6: {
          move: "d6",
          // Nœud fantôme (Coup du joueur)
          children: {
            d4: {
              move: "d4",
              explanation: "Les Blancs s'emparent logiquement du centre. Développez votre cavalier en f6 pour attaquer immédiatement le pion e4 et forcer leur développement.",
              arrows: [["g8", "f6"]],
              children: {
                Nf6: {
                  move: "Nf6",
                  // Nœud fantôme
                  children: {
                    Nc3: {
                      move: "Nc3",
                      explanation: "Ils défendent e4 avec leur cavalier. Lancez la préparation de votre fianchetto en jouant g6 pour contester la grande diagonale.",
                      arrows: [["g7", "g6"]],
                      children: {
                        g6: {
                          move: "g6",
                          explanation: "Parfait ! La structure de la Pirc est en place. Votre plan : fianchetter le Fou (Fg7), mettre le Roi à l'abri (O-O), puis miner le centre blanc avec des ruptures comme c5 ou e5.",
                          // Flèches prospectives (Fianchetto, Roque, et rupture c5)
                          arrows: [["f8", "g7"], ["e8", "g8"], ["c7", "c5"]]
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

export const pircCourse: OpeningCourse = {
  id: "pirc",
  name: "Défense Pirc",
  description: "Laissez les Blancs s'installer au centre pour mieux les attaquer ensuite grâce à un redoutable Fou en fianchetto.",
  chapters: [
    {
      id: "pirc-b07",
      name: "Défense Pirc (Ligne Principale)",
      root: pircB07Root,
    },
  ],
};