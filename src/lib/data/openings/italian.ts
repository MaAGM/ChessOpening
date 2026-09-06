import type { OpeningCourse, OpeningChapter, TutorialNode } from "./types";

// Italienne – C53 (Giuoco Piano) : 1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 d6
const italianC53Root: TutorialNode = {
  explanation: "L'Ouverture Italienne. Prenez le contrôle du centre et ouvrez la diagonale de votre Fou.",
  arrows: [["e2", "e4"]],
  children: {
    e4: {
      move: "e4",
      // Nœud fantôme (Coup du joueur)
      children: {
        e5: {
          move: "e5",
          explanation: "Les Noirs répondent symétriquement. Développez votre cavalier avec tempo pour attaquer e5.",
          arrows: [["g1", "f3"]],
          children: {
            Nf3: {
              move: "Nf3",
              // Nœud fantôme
              children: {
                Nc6: {
                  move: "Nc6",
                  explanation: "Ils défendent leur pion. Sortez votre Fou sur la belle diagonale italienne (c4) pour cibler immédiatement la case faible f7.",
                  arrows: [["f1", "c4"]],
                  children: {
                    Bc4: {
                      move: "Bc4",
                      // Nœud fantôme
                      children: {
                        Bc5: {
                          move: "Bc5",
                          explanation: "Le Giuoco Piano (Partie Calme). Préparez la construction d'un centre de pions massif en jouant c3.",
                          arrows: [["c2", "c3"]],
                          children: {
                            c3: {
                              move: "c3",
                              // Nœud fantôme
                              children: {
                                d6: {
                                  move: "d6",
                                  explanation: "Les Noirs consolident. Vous avez atteint la position de base du Giuoco Piano. Votre plan : mettre votre Roi à l'abri (O-O), puis pousser d4 au moment opportun pour briser le centre.",
                                  // Flèches prospectives (Roque et poussée centrale)
                                  arrows: [["d2", "d4"], ["e1", "g1"]]
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

// Italienne – C55 (Deux Cavaliers) : 1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. Ng5
const italianC55Root: TutorialNode = {
  explanation: "L'Ouverture Italienne. Visez un développement rapide pour préparer des pièges tactiques.",
  arrows: [["e2", "e4"]],
  children: {
    e4: {
      move: "e4",
      // Nœud fantôme
      children: {
        e5: {
          move: "e5",
          explanation: "Développez votre cavalier pour mettre la pression sur le centre.",
          arrows: [["g1", "f3"]],
          children: {
            Nf3: {
              move: "Nf3",
              // Nœud fantôme
              children: {
                Nc6: {
                  move: "Nc6",
                  explanation: "Placez votre Fou en c4 pour braquer le roi adverse.",
                  arrows: [["f1", "c4"]],
                  children: {
                    Bc4: {
                      move: "Bc4",
                      // Nœud fantôme
                      children: {
                        Nf6: {
                          move: "Nf6",
                          explanation: "La Défense des Deux Cavaliers ! Ils ignorent votre fou et contre-attaquent e4. Punissez-les immédiatement en lançant l'attaque féroce sur f7 avec Cg5 !",
                          arrows: [["f3", "g5"]],
                          children: {
                            Ng5: {
                              move: "Ng5",
                              explanation: "Boum ! L'attaque est lancée. Vous menacez une fourchette dévastatrice sur f7 avec le Fou et le Cavalier. Les Noirs sont contraints de jouer d5, préparez-vous à une guerre tactique !",
                              // Menaces directes sur f7
                              arrows: [["g5", "f7"], ["c4", "f7"]]
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

export const italianCourse: OpeningCourse = {
  id: "italian",
  name: "Partie Italienne",
  description: "Ciblez la case f7 dès les premiers coups. Une ouverture classique, agressive et incontournable.",
  chapters: [
    {
      id: "italian-c53",
      name: "Giuoco Piano",
      root: italianC53Root,
    },
    {
      id: "italian-c55",
      name: "Défense des Deux Cavaliers",
      root: italianC55Root,
    },
  ],
};