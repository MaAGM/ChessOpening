import type { OpeningCourse, OpeningChapter, TutorialNode } from "./types";

// 1. Ancienne Benoni (Old Benoni) – A43: 1. d4 c5 2. d5 e5 3. e4 d6
const benoniA43Root: TutorialNode = {
  children: {
    d4: {
      move: "d4",
      explanation: "L'ordinateur ouvre par 1. d4. Répondez immédiatement par la rupture asymétrique c5 pour entrer dans la Benoni.",
      arrows: [["c7", "c5"]],
      children: {
        c5: {
          move: "c5",
          // Nœud fantôme (Coup du joueur)
          children: {
            d5: {
              move: "d5",
              explanation: "Les Blancs gagnent de l'espace. Bloquez le centre et revendiquez votre part du terrain avec e5.",
              arrows: [["e7", "e5"]],
              children: {
                e5: {
                  move: "e5",
                  // Nœud fantôme
                  children: {
                    e4: {
                      move: "e4",
                      explanation: "Ils consolident leur étau central. Solidifiez votre pion e5 et ouvrez la diagonale de votre fou avec d6.",
                      arrows: [["d7", "d6"]],
                      children: {
                        d6: {
                          move: "d6",
                          explanation: "Parfait ! La structure de l'Ancienne Benoni est fixée. Le centre est totalement bloqué. Préparez vos manœuvres : développez vos pièces mineures pour attaquer sur les ailes.",
                          // Flèches prospectives (plans de développement)
                          arrows: [["g8", "f6"], ["f8", "e7"], ["b8", "d7"]]
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

// 2. Gambit Benko (Volga) – A57: 1. d4 Nf6 2. c4 c5 3. d5 b5 4. cxb5 a6 5. bxa6 Bxa6
const benoniA57Root: TutorialNode = {
  children: {
    d4: {
      move: "d4",
      explanation: "L'ordinateur contrôle le centre. Commencez souplement par développer votre cavalier en f6.",
      arrows: [["g8", "f6"]],
      children: {
        Nf6: {
          move: "Nf6",
          // Nœud fantôme
          children: {
            c4: {
              move: "c4",
              explanation: "Les Blancs construisent un centre massif. C'est le moment de frapper avec c5 !",
              arrows: [["c7", "c5"]],
              children: {
                c5: {
                  move: "c5",
                  // Nœud fantôme
                  children: {
                    d5: {
                      move: "d5",
                      explanation: "Ils avancent. Déclenchez le Gambit Benko ! Sacrifiez votre pion b5 pour détruire leur structure et ouvrir les lignes à l'aile Dame.",
                      arrows: [["b7", "b5"]],
                      children: {
                        b5: {
                          move: "b5",
                          // Nœud fantôme
                          children: {
                            cxb5: {
                              move: "cxb5",
                              explanation: "Défi accepté, ils prennent le pion. Insistez en sacrifiant un deuxième pion avec a6 pour forcer l'ouverture des colonnes.",
                              arrows: [["a7", "a6"]],
                              children: {
                                a6: {
                                  move: "a6",
                                  // Nœud fantôme
                                  children: {
                                    bxa6: {
                                      move: "bxa6",
                                      explanation: "Ils capturent à nouveau. Récupérez le pion en développant votre Fou (Fxa6) de manière très active.",
                                      arrows: [["c8", "a6"]],
                                      children: {
                                        Bxa6: {
                                          move: "Bxa6",
                                          explanation: "Excellent. Vous avez un pion de moins, mais une pression monstrueuse à long terme sur l'aile Dame via les colonnes ouvertes 'a' et 'b'.",
                                          // Pression future sur l'aile dame et fianchetto
                                          arrows: [["g7", "g6"], ["f8", "g7"], ["d8", "a5"]]
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

// 3. Benoni Moderne – A60: 1. d4 Nf6 2. c4 c5 3. d5 e6 4. Nc3 exd5 5. cxd5 d6
const benoniA60Root: TutorialNode = {
  children: {
    d4: {
      move: "d4",
      explanation: "L'ordinateur ouvre par 1. d4. Développez le cavalier en f6 pour contrôler les cases centrales.",
      arrows: [["g8", "f6"]],
      children: {
        Nf6: {
          move: "Nf6",
          // Nœud fantôme
          children: {
            c4: {
              move: "c4",
              explanation: "Ils renforcent le centre. Contestez immédiatement cet espace avec c5.",
              arrows: [["c7", "c5"]],
              children: {
                c5: {
                  move: "c5",
                  // Nœud fantôme
                  children: {
                    d5: {
                      move: "d5",
                      explanation: "Les Blancs ferment le jeu. Attaquez la pointe de leur structure (d5) en jouant e6 pour créer de la tension.",
                      arrows: [["e7", "e6"]],
                      children: {
                        e6: {
                          move: "e6",
                          // Nœud fantôme
                          children: {
                            Nc3: {
                              move: "Nc3",
                              explanation: "Ils défendent d5 en développant leur cavalier. Échangez au centre avec exd5 pour créer un déséquilibre stratégique majeur.",
                              arrows: [["e6", "d5"]],
                              children: {
                                exd5: {
                                  move: "exd5",
                                  // Nœud fantôme
                                  children: {
                                    cxd5: {
                                      move: "cxd5",
                                      explanation: "Les Blancs reprennent du pion. Solidifiez votre pion c5 en jouant d6, verrouillant ainsi votre structure.",
                                      arrows: [["d7", "d6"]],
                                      children: {
                                        d6: {
                                          move: "d6",
                                          explanation: "La Benoni Moderne est en place ! Vous avez une majorité de pions à l'aile Dame. Le plan clé est de fianchetter votre Fou (g6 puis Fg7) pour rayonner sur la grande diagonale noire.",
                                          // Le fianchetto indispensable de la Benoni
                                          arrows: [["g7", "g6"], ["f8", "g7"]]
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
    { id: "benoni-a43", name: "Ancienne Benoni (Old Benoni)", root: benoniA43Root },
    { id: "benoni-a57", name: "Gambit Benko (Volga)", root: benoniA57Root },
    { id: "benoni-a60", name: "Benoni Moderne", root: benoniA60Root },
  ],
};