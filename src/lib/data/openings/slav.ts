import type { OpeningCourse, OpeningChapter, TutorialNode } from "./types";

// Slav Defense – Ligne Principale (D10) : 1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 dxc4 5. a4
const slavRoot: TutorialNode = {
  explanation: "La Défense Slave. Un roc absolu contre le pion Dame. Préparez-vous, l'ordinateur va jouer avec les Blancs...",
  children: {
    d4: {
      move: "d4",
      explanation: "L'ordinateur ouvre par 1. d4. Bloquez immédiatement le centre avec d5.",
      arrows: [["d7", "d5"]],
      children: {
        d5: {
          move: "d5",
          // Nœud fantôme (Coup du joueur)
          children: {
            c4: {
              move: "c4",
              explanation: "Le Gambit Dame. Plutôt que de bloquer votre propre Fou avec e6, soutenez votre centre avec le pion c6 pour entrer dans la Slave.",
              arrows: [["c7", "c6"]],
              children: {
                c6: {
                  move: "c6",
                  // Nœud fantôme
                  children: {
                    Nf3: {
                      move: "Nf3",
                      explanation: "Les Blancs se développent de manière classique. Sortez votre cavalier en f6 pour maintenir la tension centrale.",
                      arrows: [["g8", "f6"]],
                      children: {
                        Nf6: {
                          move: "Nf6",
                          // Nœud fantôme
                          children: {
                            Nc3: {
                              move: "Nc3",
                              explanation: "Ils accentuent la pression. C'est l'heure de briser la symétrie : libérez la tension en capturant leur pion c4 !",
                              arrows: [["d5", "c4"]],
                              children: {
                                dxc4: {
                                  move: "dxc4",
                                  // Nœud fantôme
                                  children: {
                                    a4: {
                                      move: "a4",
                                      explanation: "Les Blancs jouent a4 pour vous empêcher de défendre votre butin avec b5. La position de base est atteinte ! Votre Fou de cases claires est totalement libre : sortez-le en f5, puis verrouillez définitivement votre structure avec e6.",
                                      // Flèches prospectives (Sortie du fou, consolidation e6, développement du cavalier)
                                      arrows: [["c8", "f5"], ["e7", "e6"], ["b8", "a6"]]
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
            }
          }
        }
      }
    }
  }
};

export const slavCourse: OpeningCourse = {
  id: "slav",
  name: "Défense Slave",
  description: "Une forteresse de pions impénétrable qui, contrairement à d'autres défenses, laisse respirer toutes vos pièces.",
  chapters: [
    {
      id: "slav-d10",
      name: "Ligne Principale (a4)",
      root: slavRoot,
    },
  ],
};