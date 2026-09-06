import type { OpeningCourse, OpeningChapter, TutorialNode } from "./types";

// Kings Indian – Classique (E90) : 1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5
const kingsIndianRoot: TutorialNode = {
  explanation: "L'Est-Indienne. Laissez les Blancs dominer le centre pour mieux le contre-attaquer. Préparez-vous...",
  children: {
    d4: {
      move: "d4",
      explanation: "L'ordinateur ouvre par 1. d4. Développez votre cavalier en f6 de manière flexible, en contrôlant e4 sans engager vos pions centraux.",
      arrows: [["g8", "f6"]],
      children: {
        Nf6: {
          move: "Nf6",
          // Nœud fantôme (Coup du joueur)
          children: {
            c4: {
              move: "c4",
              explanation: "Les Blancs prennent de l'espace. Préparez la structure typique de l'Est-Indienne en jouant g6.",
              arrows: [["g7", "g6"]],
              children: {
                g6: {
                  move: "g6",
                  // Nœud fantôme
                  children: {
                    Nc3: {
                      move: "Nc3",
                      explanation: "Ils développent leur cavalier pour soutenir la poussée e4. Placez votre fou en fianchetto (Fg7) pour rayonner sur la grande diagonale noire.",
                      arrows: [["f8", "g7"]],
                      children: {
                        Bg7: {
                          move: "Bg7",
                          // Nœud fantôme
                          children: {
                            e4: {
                              move: "e4",
                              explanation: "Le fameux trio de pions central ! Les Blancs semblent tout écraser. Bloquez immédiatement l'avancée e5 en jouant d6.",
                              arrows: [["d7", "d6"]],
                              children: {
                                d6: {
                                  move: "d6",
                                  // Nœud fantôme
                                  children: {
                                    Nf3: {
                                      move: "Nf3",
                                      explanation: "Ils poursuivent un développement très classique. Mettez votre Roi en sécurité avec le petit roque (O-O) avant d'engager les hostilités.",
                                      arrows: [["e8", "g8"]],
                                      children: {
                                        "O-O": {
                                          move: "O-O",
                                          // Nœud fantôme
                                          children: {
                                            Be2: {
                                              move: "Be2",
                                              explanation: "Les Blancs préparent leur roque tranquillement. C'est le moment : déclenchez la rupture centrale typique de l'Est-Indienne avec e5 !",
                                              arrows: [["e7", "e5"]],
                                              children: {
                                                e5: {
                                                  move: "e5",
                                                  explanation: "Magnifique ! Vous avez atteint la position de base de la Variante Classique. Si les Blancs ferment le centre (d5), votre plan à long terme sera de replier le cavalier (Ch5 ou Ce8) et de lancer une violente marée de pions sur l'aile Roi avec f5.",
                                                  // Flèches prospectives : préparation de la poussée f5 (retrait du cavalier + poussée du pion)
                                                  arrows: [["f6", "h5"], ["f7", "f5"]]
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
            }
          }
        }
      }
    }
  }
};

export const kings_indianCourse: OpeningCourse = {
  id: "kings_indian",
  name: "Défense Est-Indienne",
  description: "Une arme hyper-agressive. Laissez le centre aux Blancs, fermez la position, et attaquez leur Roi sans pitié.",
  chapters: [
    {
      id: "kings_indian-e90",
      name: "Variante Classique (E90)",
      root: kingsIndianRoot,
    },
  ],
};