import type { OpeningCourse, OpeningChapter, TutorialNode } from "./types";

// Grunfeld – Défense Grünfeld (D80) : 1. d4 Nf6 2. c4 g6 3. Nc3 d5 4. cxd5 Nxd5 5. e4 Nxc3 6. bxc3
const grunfeldRoot: TutorialNode = {
  explanation: "La Défense Grünfeld. Préparez-vous, l'ordinateur va jouer avec les Blancs...",
  children: {
    d4: {
      move: "d4",
      explanation: "L'ordinateur ouvre par 1. d4. Développez votre cavalier en f6 pour empêcher e4 tout en gardant vos options ouvertes.",
      arrows: [["g8", "f6"]],
      children: {
        Nf6: {
          move: "Nf6",
          // Nœud fantôme (Coup du joueur)
          children: {
            c4: {
              move: "c4",
              explanation: "Les Blancs prennent de l'espace au centre. Préparez la structure hypermoderne de la Grünfeld en jouant g6.",
              arrows: [["g7", "g6"]],
              children: {
                g6: {
                  move: "g6",
                  // Nœud fantôme
                  children: {
                    Nc3: {
                      move: "Nc3",
                      explanation: "Ils développent leur cavalier pour soutenir la poussée e4. C'est le moment clé de la Grünfeld : frappez immédiatement le centre avec d5 !",
                      arrows: [["d7", "d5"]],
                      children: {
                        d5: {
                          move: "d5",
                          // Nœud fantôme
                          children: {
                            cxd5: {
                              move: "cxd5",
                              explanation: "Les Blancs échangent les pions pour ouvrir le centre. Reprenez avec votre cavalier (Cxd5).",
                              arrows: [["f6", "d5"]],
                              children: {
                                Nxd5: {
                                  move: "Nxd5",
                                  // Nœud fantôme
                                  children: {
                                    e4: {
                                      move: "e4",
                                      explanation: "L'attaque centrale ! Ils chassent votre cavalier tout en formant un centre de pions massif. Échangez votre cavalier en c3.",
                                      arrows: [["d5", "c3"]],
                                      children: {
                                        Nxc3: {
                                          move: "Nxc3",
                                          // Nœud fantôme
                                          children: {
                                            bxc3: {
                                              move: "bxc3",
                                              explanation: "La position classique de la Grünfeld ! Les Blancs ont un centre de pions parfait, mais il devient maintenant votre cible. Vos prochains coups : fianchetter le Fou (Fg7) puis détruire le centre avec c5.",
                                              // Flèches prospectives pour attaquer le centre blanc (Fianchetto + Rupture + Pression)
                                              arrows: [["f8", "g7"], ["c7", "c5"], ["b8", "c6"]]
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

export const grunfeldCourse: OpeningCourse = {
  id: "grunfeld",
  name: "Défense Grünfeld",
  description: "Laissez les Blancs construire un centre parfait, puis détruisez-le avec vos pièces depuis les flancs.",
  chapters: [
    {
      id: "grunfeld-d80",
      name: "Défense Grünfeld (Ligne Principale)",
      root: grunfeldRoot,
    },
  ],
};