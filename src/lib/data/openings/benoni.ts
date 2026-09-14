import type { OpeningCourse, OpeningChapter, TutorialNode } from "./types";

const benoniOldRoot: TutorialNode = {
  children: {
    d4: {
      move: "d4",
      explanation: "L'ordinateur ouvre par 1. d4. Répondez avec l'agressif c5 pour attaquer immédiatement le centre : c'est l'Ancienne Benoni.",
      arrows: [["c7", "c5"]],
      children: {
        c5: {
          move: "c5",
          children: {
            
            // ==========================================
            // CHOIX BLANC 1 : Ligne Secondaire (2. c4)
            // ==========================================
            c4: {
              move: "c4",
              explanation: "Les Blancs refusent d'avancer et maintiennent la tension. Prenez immédiatement le pion central (cxd4).",
              arrows: [["c5", "d4"]],
              children: {
                cxd4: {
                  move: "cxd4",
                  explanation: "🎉 Variante terminée ! Vous avez liquidé le centre blanc. La position va souvent transposer dans des schémas d'Ouverture Anglaise très confortables pour les Noirs."
                }
              }
            },

            // ==========================================
            // CHOIX BLANC 2 : Ligne Secondaire (2. Nf3)
            // ==========================================
            Nf3: {
              move: "Nf3",
              explanation: "Un développement souple des Blancs. Prenez simplement en d4 (cxd4).",
              arrows: [["c5", "d4"]],
              children: {
                cxd4: {
                  move: "cxd4",
                  explanation: "🎉 Variante terminée ! Les Blancs devront reprendre avec le Cavalier ou la Dame, vous laissant un développement facile sans pression centrale."
                }
              }
            },

            // ==========================================
            // CHOIX BLANC 3 : Ligne Principale (2. d5)
            // ==========================================
            d5: {
              move: "d5",
              explanation: "La réponse critique. L'ordinateur gagne de l'espace. Vous avez 3 grandes options : e6 (pour casser le centre), d6 (Variante Schmidt) ou e5 (Benoni Tchèque).",
              arrows: [["e7", "e6"], ["d7", "d6"], ["e7", "e5"]],
              children: {
                
                // A) Ancienne Benoni classique (2... e6)
                e6: {
                  move: "e6",
                  children: {
                    c4: {
                      move: "c4",
                      explanation: "L'ordinateur consolide son pion d5. Échangez en d5 (exd5) pour créer un déséquilibre central.",
                      arrows: [["e6", "d5"]],
                      children: {
                        exd5: {
                          move: "exd5",
                          children: {
                            cxd5: {
                              move: "cxd5",
                              explanation: "Il reprend du pion c. Fixez sa structure en jouant d6, préparant le développement de votre aile Roi.",
                              arrows: [["d7", "d6"]],
                              children: {
                                d6: {
                                  move: "d6",
                                  children: {
                                    Nc3: {
                                      move: "Nc3",
                                      explanation: "Développement logique. Préparez le fianchetto avec g6.",
                                      arrows: [["g7", "g6"]],
                                      children: {
                                        g6: {
                                          move: "g6",
                                          children: {
                                            e4: {
                                              move: "e4",
                                              explanation: "Il prend un grand centre. Sortez votre Fou en g7 pour attaquer la grande diagonale.",
                                              arrows: [["f8", "g7"]],
                                              children: {
                                                Bg7: {
                                                  move: "Bg7",
                                                  explanation: "🎉 Variante terminée ! C'est la position type de la Benoni Moderne. Vous allez roquer et chercher du contre-jeu à l'aile Dame."
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
                },

                // B) Variante Schmidt (2... d6)
                d6: {
                  move: "d6",
                  children: {
                    e4: {
                      move: "e4",
                      explanation: "L'ordinateur occupe tout le centre. Préparez le fianchetto avec g6 (Variante Schmidt).",
                      arrows: [["g7", "g6"]],
                      children: {
                        g6: {
                          move: "g6",
                          children: {
                            Nf3: {
                              move: "Nf3",
                              explanation: "Développement classique. Poursuivez votre plan avec Fg7.",
                              arrows: [["f8", "g7"]],
                              children: {
                                Bg7: {
                                  move: "Bg7",
                                  explanation: "🎉 Variante terminée ! Position solide. Vous allez roquer et manœuvrer patiemment derrière vos lignes."
                                }
                              }
                            },
                            Nc3: {
                              move: "Nc3",
                              explanation: "Développement orienté vers le contrôle du centre. Placez votre Fou en g7.",
                              arrows: [["f8", "g7"]],
                              children: {
                                Bg7: {
                                  move: "Bg7",
                                  explanation: "🎉 Variante terminée ! La structure de l'Ancienne Benoni est en place."
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },

                // C) Benoni Tchèque (2... e5)
                e5: {
                  move: "e5",
                  children: {
                    e4: {
                      move: "e4",
                      explanation: "La Benoni Tchèque ! Le centre est totalement verrouillé. Jouez d6 pour solidifier votre chaîne de pions.",
                      arrows: [["d7", "d6"]],
                      children: {
                        d6: {
                          move: "d6",
                          children: {
                            Nc3: {
                              move: "Nc3",
                              explanation: "L'ordinateur se développe. Empêchez toute intrusion (comme Cb5) en jouant a6.",
                              arrows: [["a7", "a6"]],
                              children: {
                                a6: {
                                  move: "a6",
                                  children: {
                                    a4: {
                                      move: "a4",
                                      explanation: "Il bloque votre expansion à l'aile Dame (b5). Développez tranquillement votre Fou en e7.",
                                      arrows: [["f8", "e7"]],
                                      children: {
                                        Be7: {
                                          move: "Be7",
                                          explanation: "🎉 Variante terminée ! La Benoni Tchèque est un véritable mur. Le jeu va consister en de longues manœuvres stratégiques de contournement."
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

export const benoniCourse: OpeningCourse = {
  id: "benoni",
  name: "Défense Benoni",
  description: "Déséquilibrez la position dès les premiers coups pour imposer un jeu asymétrique et dynamique.",
  chapters: [
    {
      id: "benoni-old",
      name: "Ancienne Benoni & Tchèque",
      root: benoniOldRoot,
    },
  ],
};