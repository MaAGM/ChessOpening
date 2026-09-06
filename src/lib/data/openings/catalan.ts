import type { OpeningCourse, OpeningChapter, TutorialNode } from "./types";

// Catalan – Ouverte (E04) : 1. d4 Nf6 2. c4 e6 3. g3 d5 4. Bg2 dxc4 5. Nf3 a6 6. O-O
const catalanRoot: TutorialNode = {
  // L'instruction de départ et la flèche sont maintenant gérées directement ici !
  explanation: "La Catalane. Ouvrez avec le pion Dame en d4 pour préparer un contrôle total du centre.",
  arrows: [["d2", "d4"]],
  children: {
    d4: {
      move: "d4",
      // Nœud fantôme (Coup du joueur)
      children: {
        Nf6: {
          move: "Nf6",
          explanation: "Les Noirs développent leur cavalier pour empêcher e4. Renforcez immédiatement votre emprise spatiale en jouant c4.",
          arrows: [["c2", "c4"]],
          children: {
            c4: {
              move: "c4",
              // Nœud fantôme
              children: {
                e6: {
                  move: "e6",
                  explanation: "Ils préparent une structure solide au centre. C'est le moment de lancer la marque de fabrique de la Catalane : préparez votre fianchetto avec g3.",
                  arrows: [["g2", "g3"]],
                  children: {
                    g3: {
                      move: "g3",
                      // Nœud fantôme
                      children: {
                        d5: {
                          move: "d5",
                          explanation: "Les Noirs frappent au centre et contestent votre pion c4. Terminez votre fianchetto en plaçant votre Fou en g2 pour rayonner sur la grande diagonale.",
                          arrows: [["f1", "g2"]],
                          children: {
                            Bg2: {
                              move: "Bg2",
                              // Nœud fantôme
                              children: {
                                dxc4: {
                                  move: "dxc4",
                                  explanation: "La Catalane Ouverte ! Ils acceptent le sacrifice tactique. Ne vous précipitez pas pour reprendre le pion : développez d'abord votre cavalier en f3 pour contrôler le centre.",
                                  arrows: [["g1", "f3"]],
                                  children: {
                                    Nf3: {
                                      move: "Nf3",
                                      // Nœud fantôme
                                      children: {
                                        a6: {
                                          move: "a6",
                                          explanation: "Ils consolident leur pion supplémentaire en préparant l'expansion b5. Mettez votre Roi en sécurité immédiate avec le petit roque (O-O).",
                                          arrows: [["e1", "g1"]],
                                          children: {
                                            "O-O": {
                                              move: "O-O",
                                              explanation: "Parfait ! Votre Roi est à l'abri et votre Fou g2 est un monstre absolu. Vos prochains plans : jouer a4 pour stopper l'expansion noire, ou sortir la Dame (Dc2 ou Da4) pour récupérer le pion c4.",
                                              // Flèches prospectives pour le plan de milieu de jeu
                                              arrows: [["a2", "a4"], ["d1", "c2"], ["d1", "a4"]]
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

export const catalanCourse: OpeningCourse = {
  id: "catalan",
  name: "Ouverture Catalane",
  description: "Un système positionnel hybride et empoisonné. Sacrifiez un pion pour transformer votre Fou en g2 en une arme létale.",
  chapters: [
    {
      id: "catalan-e04",
      name: "Catalane - Ouverte (E04)",
      root: catalanRoot,
    },
  ],
};