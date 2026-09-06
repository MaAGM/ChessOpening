import type { OpeningCourse, OpeningChapter, TutorialNode } from "./types";

// Sicilian – B22 (Alapine) : 1. e4 c5 2. c3 Nf6 3. e5 Nd5
const sicilianB22Root: TutorialNode = {
  explanation: "La Défense Sicilienne. La réponse la plus agressive et populaire contre e4. Préparez-vous...",
  children: {
    e4: {
      move: "e4",
      explanation: "L'ordinateur ouvre par 1. e4. Créez immédiatement un déséquilibre asymétrique en attaquant le centre par le flanc avec c5.",
      arrows: [["c7", "c5"]],
      children: {
        c5: {
          move: "c5",
          // Nœud fantôme (Coup du joueur)
          children: {
            c3: {
              move: "c3",
              explanation: "La redoutable Variante Alapine. Les Blancs veulent pousser d4 en force. Cassez leur mécanique en attaquant tout de suite e4 avec votre cavalier.",
              arrows: [["g8", "f6"]],
              children: {
                Nf6: {
                  move: "Nf6",
                  // Nœud fantôme
                  children: {
                    e5: {
                      move: "e5",
                      explanation: "Ils vous chassent et gagnent de l'espace. Bondissez au centre et centralisez votre cavalier sur la case forte d5.",
                      arrows: [["f6", "d5"]],
                      children: {
                        Nd5: {
                          move: "Nd5",
                          explanation: "Parfait ! Ce cavalier centralisé est une épine dans le pied des Blancs. Vos prochains plans pour détruire leur centre : frapper avec d6 et développer votre second cavalier (Cc6).",
                          // Flèches prospectives pour casser le centre blanc
                          arrows: [["d7", "d6"], ["b8", "c6"]]
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

// Sicilian – B70 (Dragon) : 1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 g6 6. Be3 Bg7 7. f3
const sicilianB70Root: TutorialNode = {
  explanation: "Entrez dans l'arène du Dragon. Préparez-vous...",
  children: {
    e4: {
      move: "e4",
      explanation: "L'ordinateur ouvre avec e4. Répondez avec la Sicilienne (c5).",
      arrows: [["c7", "c5"]],
      children: {
        c5: {
          move: "c5",
          // Nœud fantôme
          children: {
            Nf3: {
              move: "Nf3",
              explanation: "Développement classique. Contrôlez le centre et préparez l'ouverture des lignes avec d6.",
              arrows: [["d7", "d6"]],
              children: {
                d6: {
                  move: "d6",
                  // Nœud fantôme
                  children: {
                    d4: {
                      move: "d4",
                      explanation: "Les Blancs veulent ouvrir le jeu. Acceptez l'échange pour ouvrir votre précieuse colonne 'c' (cxd4).",
                      arrows: [["c5", "d4"]],
                      children: {
                        cxd4: {
                          move: "cxd4",
                          // Nœud fantôme
                          children: {
                            Nxd4: {
                              move: "Nxd4",
                              explanation: "Ils reprennent. Sortez votre cavalier en f6 pour attaquer e4 et forcer leur développement.",
                              arrows: [["g8", "f6"]],
                              children: {
                                Nf6: {
                                  move: "Nf6",
                                  // Nœud fantôme
                                  children: {
                                    Nc3: {
                                      move: "Nc3",
                                      explanation: "Ils défendent e4. C'est l'heure : préparez le cracheur de feu en jouant g6 pour fianchetter votre Fou.",
                                      arrows: [["g7", "g6"]],
                                      children: {
                                        g6: {
                                          move: "g6",
                                          // Nœud fantôme
                                          children: {
                                            Be3: {
                                              move: "Be3",
                                              explanation: "Les Blancs solidifient le centre. Placez votre Fou en g7, la pièce maîtresse du Dragon.",
                                              arrows: [["f8", "g7"]],
                                              children: {
                                                Bg7: {
                                                  move: "Bg7",
                                                  // Nœud fantôme
                                                  children: {
                                                    f3: {
                                                      move: "f3",
                                                      explanation: "L'Attaque Yougoslave ! Les Blancs blindent e4 et s'apprêtent à vous envoyer une tempête de pions. Votre plan de survie et de contre-attaque : le petit roque immédiat (O-O) et lancer votre propre assaut sur l'aile Dame via la colonne c.",
                                                      // Flèches prospectives (Roque et développement de l'aile dame)
                                                      arrows: [["e8", "g8"], ["b8", "c6"], ["c8", "e6"]]
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
    }
  }
};

// Sicilian – B90 (Najdorf) : 1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Be3 e5
const sicilianB90Root: TutorialNode = {
  explanation: "La variante Najdorf, l'arme favorite de Kasparov et Fischer. Préparez-vous...",
  children: {
    e4: {
      move: "e4",
      explanation: "L'ordinateur joue e4. Déclenchez la Sicilienne avec c5.",
      arrows: [["c7", "c5"]],
      children: {
        c5: {
          move: "c5",
          // Nœud fantôme
          children: {
            Nf3: {
              move: "Nf3",
              explanation: "Jouez d6 pour tenir la case e5 et préparer votre structure.",
              arrows: [["d7", "d6"]],
              children: {
                d6: {
                  move: "d6",
                  // Nœud fantôme
                  children: {
                    d4: {
                      move: "d4",
                      explanation: "La Sicilienne Ouverte. Échangez votre pion de l'aile contre leur pion central (cxd4).",
                      arrows: [["c5", "d4"]],
                      children: {
                        cxd4: {
                          move: "cxd4",
                          // Nœud fantôme
                          children: {
                            Nxd4: {
                              move: "Nxd4",
                              explanation: "Ils reprennent. Attaquez e4 avec votre cavalier f6.",
                              arrows: [["g8", "f6"]],
                              children: {
                                Nf6: {
                                  move: "Nf6",
                                  // Nœud fantôme
                                  children: {
                                    Nc3: {
                                      move: "Nc3",
                                      explanation: "Ils défendent le pion. Voici le coup emblématique de la Najdorf : jouez a6 ! Un coup prophylactique génial qui empêche toute invasion en b5.",
                                      arrows: [["a7", "a6"]],
                                      children: {
                                        a6: {
                                          move: "a6",
                                          // Nœud fantôme
                                          children: {
                                            Be3: {
                                              move: "Be3",
                                              explanation: "L'Attaque Anglaise. Les Blancs préparent de grandes hostilités. N'ayez pas peur : chassez violemment leur cavalier centralisé en poussant e5 !",
                                              arrows: [["e7", "e5"]],
                                              children: {
                                                e5: {
                                                  move: "e5",
                                                  explanation: "Boum ! Vous prenez le contrôle du centre en expulsant leur meilleure pièce. Vos prochains plans : développer le fou (Fe6 ou Fe7), sortir le cavalier (Cbd7) et initier vos propres attaques !",
                                                  // Flèches prospectives de développement Najdorf
                                                  arrows: [["c8", "e6"], ["f8", "e7"], ["b8", "d7"]]
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

export const sicilianCourse: OpeningCourse = {
  id: "sicilian",
  name: "Défense Sicilienne",
  description: "Déséquilibrez le jeu dès le premier coup. Entrez dans des batailles tactiques sans merci.",
  chapters: [
    { id: "sicilian-b22", name: "Variante Alapine", root: sicilianB22Root },
    { id: "sicilian-b70", name: "Le Dragon", root: sicilianB70Root },
    { id: "sicilian-b90", name: "La Najdorf", root: sicilianB90Root },
  ],
};