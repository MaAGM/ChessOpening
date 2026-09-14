import type { OpeningCourse, TutorialNode } from "./types";

// ==========================================
// CHAPITRE 1 : Benoni Tchèque & Lignes Fermées (A56)
// ==========================================
const benoniCzechRoot: TutorialNode = {
  children: {
    d4: {
      move: "d4",
      explanation: "L'ordinateur ouvre par 1. d4. Développez votre Cavalier en f6.",
      arrows: [["g8", "f6"]],
      children: {
        Nf6: {
          move: "Nf6",
          children: {
            c4: {
              move: "c4",
              explanation: "Les Blancs prennent de l'espace. Attaquez immédiatement avec c5.",
              arrows: [["c7", "c5"]],
              children: {
                c5: {
                  move: "c5",
                  children: {
                    // Branche 1 : 3. e3 (Ligne calme)
                    e3: {
                      move: "e3",
                      explanation: "Les Blancs renforcent d4 sans avancer. Mettez votre Fou en fianchetto (g6).",
                      arrows: [["g7", "g6"]],
                      children: {
                        g6: {
                          move: "g6",
                          children: {
                            Nc3: {
                              move: "Nc3",
                              explanation: "Développement. Placez votre Fou en g7.",
                              arrows: [["f8", "g7"]],
                              children: {
                                Bg7: {
                                  move: "Bg7",
                                  children: {
                                    Nf3: {
                                      move: "Nf3",
                                      explanation: "Développement classique. Roquez en toute sécurité (O-O).",
                                      arrows: [["e8", "g8"]],
                                      children: {
                                        "O-O": {
                                          move: "O-O",
                                          children: {
                                            Be2: {
                                              move: "Be2",
                                              explanation: "Les Blancs préparent leur roque. Échangez en d4 (cxd4).",
                                              arrows: [["c5", "d4"]],
                                              children: {
                                                cxd4: {
                                                  move: "cxd4",
                                                  children: {
                                                    exd4: {
                                                      move: "exd4",
                                                      explanation: "Il reprend du pion. Frappez au centre avec d5.",
                                                      arrows: [["d7", "d5"]],
                                                      children: {
                                                        d5: {
                                                          move: "d5",
                                                          children: {
                                                            "O-O": {
                                                              move: "O-O",
                                                              explanation: "🎉 Variante terminée ! Position équilibrée et développement confortable pour les Noirs."
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
                    },

                    // Branche 2 : 3. d5 (Ligne fermée / Benoni Tchèque)
                    d5: {
                      move: "d5",
                      explanation: "La pousse critique d5. Choisissez entre la Tchèque (e5) ou le développement g6.",
                      arrows: [["e7", "e5"], ["g7", "g6"]],
                      children: {
                        e5: {
                          move: "e5",
                          children: {
                            Nc3: {
                              move: "Nc3",
                              explanation: "La Benoni Tchèque. Verrouillez le centre en jouant d6.",
                              arrows: [["d7", "d6"]],
                              children: {
                                d6: {
                                  move: "d6",
                                  children: {
                                    e4: {
                                      move: "e4",
                                      explanation: "🎉 Variante terminée ! Les Blancs occupent le centre, mais la position est un mur infranchissable."
                                    }
                                  }
                                }
                              }
                            }
                          }
                        },
                        g6: {
                          move: "g6",
                          children: {
                            Nc3: {
                              move: "Nc3",
                              explanation: "L'ordinateur se développe. Consolidez avec d6.",
                              arrows: [["d7", "d6"]],
                              children: {
                                d6: {
                                  move: "d6",
                                  children: {
                                    e4: {
                                      move: "e4",
                                      explanation: "🎉 Variante terminée ! Structure classique de fianchetto face au grand centre blanc."
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

// ==========================================
// CHAPITRE 2 : Gambit Benko Refusé (A57)
// ==========================================
const benkoDeclinedRoot: TutorialNode = {
  children: {
    d4: {
      move: "d4",
      explanation: "L'ordinateur ouvre par 1. d4. Répondez par Nf6.",
      arrows: [["g8", "f6"]],
      children: {
        Nf6: {
          move: "Nf6",
          children: {
            c4: {
              move: "c4",
              explanation: "Les Blancs prennent l'espace. Jouez c5 pour défier le centre.",
              arrows: [["c7", "c5"]],
              children: {
                c5: {
                  move: "c5",
                  children: {
                    d5: {
                      move: "d5",
                      explanation: "L'ordinateur gagne de l'espace avec d5. Lancez le Gambit Benko en poussant b5 !",
                      arrows: [["b7", "b5"]],
                      children: {
                        b5: {
                          move: "b5",
                          explanation: "Le pion b5 attaque le centre de flanc. L'ordinateur accepte de prendre le pion en b5 (cxb5).",
                          arrows: [["c4", "b5"]],
                          children: {
                            cxb5: {
                              move: "cxb5",
                              explanation: "Les Blancs prennent en b5. Sacrifiez le second pion avec a6 pour ouvrir les lignes !",
                              arrows: [["a7", "a6"]],
                              children: {
                                a6: {
                                  move: "a6",
                                  children: {
                                    // Refus 1 : 5. e3
                                    e3: {
                                      move: "e3",
                                      explanation: "Les Blancs refusent de capturer en a6 et renforcent leur structure. Préparez le fianchetto avec g6.",
                                      arrows: [["g7", "g6"]],
                                      children: {
                                        g6: {
                                          move: "g6",
                                          children: {
                                            Nc3: {
                                              move: "Nc3",
                                              explanation: "🎉 Variante terminée ! Sortez votre Fou en g7, vous aurez un excellent jeu dynamique sur l'aile Dame."
                                            }
                                          }
                                        }
                                      }
                                    },

                                    // Refus 2 : 5. Nc3 (Variante Zaitsev)
                                    Nc3: {
                                      move: "Nc3",
                                      explanation: "Attaque directe sur b5. Prenez le pion en b5 avec votre pion a (axb5).",
                                      arrows: [["a6", "b5"]],
                                      children: {
                                        axb5: {
                                          move: "axb5",
                                          children: {
                                            e4: {
                                              move: "e4",
                                              explanation: "Les Blancs occupent le centre. Chassez leur Cavalier en poussant b4 !",
                                              arrows: [["b5", "b4"]],
                                              children: {
                                                b4: {
                                                  move: "b4",
                                                  children: {
                                                    Nb5: {
                                                      move: "Nb5",
                                                      explanation: "Le Cavalier blanc s'infiltre en b5. Bloquez toute intrusion en jouant d6 solidement.",
                                                      arrows: [["d7", "d6"]],
                                                      children: {
                                                        d6: {
                                                          move: "d6",
                                                          children: {
                                                            Nf3: {
                                                              move: "Nf3",
                                                              explanation: "L'adversaire développe son autre Cavalier. Préparez votre fianchetto avec g6.",
                                                              arrows: [["g7", "g6"]],
                                                              children: {
                                                                g6: {
                                                                  move: "g6",
                                                                  explanation: "🎉 Variante terminée ! Le Cavalier blanc en b5 est hors-jeu et votre contre-jeu à l'aile Dame est total."
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
            }
          }
        }
      }
    }
  }
};

// ==========================================
// CHAPITRE 3 : Gambit Benko Accepté & Yougoslave (A58-A59)
// ==========================================
const benkoAcceptedRoot: TutorialNode = {
  children: {
    d4: {
      move: "d4",
      explanation: "L'ordinateur ouvre par 1. d4. Jouez Nf6.",
      arrows: [["g8", "f6"]],
      children: {
        Nf6: {
          move: "Nf6",
          children: {
            c4: {
              move: "c4",
              explanation: "Les Blancs jouent c4. Répondez par c5.",
              arrows: [["c7", "c5"]],
              children: {
                c5: {
                  move: "c5",
                  children: {
                    d5: {
                      move: "d5",
                      explanation: "L'ordinateur pousse d5. Lancez le Gambit Benko avec b5 !",
                      arrows: [["b7", "b5"]],
                      children: {
                        b5: {
                          move: "b5",
                          children: {
                            cxb5: {
                              move: "cxb5",
                              explanation: "Les Blancs prennent en b5. Offrez le second pion avec a6 !",
                              arrows: [["a7", "a6"]],
                              children: {
                                a6: {
                                  move: "a6",
                                  children: {
                                    bxa6: {
                                      move: "bxa6",
                                      explanation: "Les Blancs acceptent le gambit complet en prenant en a6 ! Reprenez immédiatement avec votre Fou (Bxa6).",
                                      arrows: [["c8", "a6"]],
                                      children: {
                                        Bxa6: {
                                          move: "Bxa6",
                                          children: {
                                            Nc3: {
                                              move: "Nc3",
                                              explanation: "Développement logique des Blancs. Fixez le centre avec d6.",
                                              arrows: [["d7", "d6"]],
                                              children: {
                                                d6: {
                                                  move: "d6",
                                                  children: {
                                                    // Branche A : 7. g3 (Variante du Fianchetto)
                                                    g3: {
                                                      move: "g3",
                                                      explanation: "Les Blancs préparent un fianchetto de leur Fou Roi. Préparez le vôtre avec g6.",
                                                      arrows: [["g7", "g6"]],
                                                      children: {
                                                        g6: {
                                                          move: "g6",
                                                          children: {
                                                            Bg2: {
                                                              move: "Bg2",
                                                              explanation: "L'ordinateur sort son Fou en g2. Développez votre Fou en g7 pour cibler le grand roque.",
                                                              arrows: [["f8", "g7"]],
                                                              children: {
                                                                Bg7: {
                                                                  move: "Bg7",
                                                                  children: {
                                                                    Nf3: {
                                                                      move: "Nf3",
                                                                      explanation: "Développement du Cavalier. Choisissez de roquer (O-O) ou de placer votre Cavalier en bd7.",
                                                                      arrows: [["e8", "g8"], ["b8", "d7"]],
                                                                      children: {
                                                                        "O-O": {
                                                                          move: "O-O",
                                                                          children: {
                                                                            "O-O": {
                                                                              move: "O-O",
                                                                              explanation: "🎉 Variante du Fianchetto terminée ! Vous exercez une pression monumentale le long des colonnes ouvertes a et b."
                                                                            }
                                                                          }
                                                                        },
                                                                        Nbd7: {
                                                                          move: "Nbd7",
                                                                          children: {
                                                                            "O-O": {
                                                                              move: "O-O",
                                                                              explanation: "🎉 Variante terminée ! Votre Cavalier est idéalement préparé pour transiter vers c5."
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

                                                    // Branche B : 7. Nf3 / 7. e4 (Variante Yougoslave)
                                                    Nf3: {
                                                      move: "Nf3",
                                                      explanation: "Les Blancs optent pour un jeu direct. Préparez votre fianchetto avec g6.",
                                                      arrows: [["g7", "g6"]],
                                                      children: {
                                                        g6: {
                                                          move: "g6",
                                                          children: {
                                                            e4: {
                                                              move: "e4",
                                                              explanation: "L'ordinateur prend tout le centre. Échangez votre Fou contre son défenseur en f1 (Bxf1).",
                                                              arrows: [["a6", "f1"]],
                                                              children: {
                                                                Bxf1: {
                                                                  move: "Bxf1",
                                                                  children: {
                                                                    Kxf1: {
                                                                      move: "Kxf1",
                                                                      explanation: "Le Roi blanc a dû capturer et a perdu le droit de roquer. Sortez votre Fou en g7.",
                                                                      arrows: [["f8", "g7"]],
                                                                      children: {
                                                                        Bg7: {
                                                                          move: "Bg7",
                                                                          children: {
                                                                            g3: {
                                                                              move: "g3",
                                                                              explanation: "Les Blancs essaient de mettre leur Roi en sécurité via g2. Roquez (O-O).",
                                                                              arrows: [["e8", "g8"]],
                                                                              children: {
                                                                                "O-O": {
                                                                                  children: {
                                                                                    Kg2: {
                                                                                      move: "Kg2",
                                                                                      explanation: "🎉 Variante Yougoslave terminée ! Le Roi blanc est totalement instable et l'activité de vos pièces compense largement le pion sacrifié."
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

// ==========================================
// EXPORT DU COURS COMPLET BENONI
// ==========================================
export const benoniCourse: OpeningCourse = {
  id: "benoni",
  name: "Défense Benoni & Gambit Benko",
  description: "Déséquilibrez la position dès les premiers coups pour imposer un jeu asymétrique, dynamique et le redoutable Gambit Benko.",
  chapters: [
    {
      id: "benoni-czech",
      name: "1. Benoni Tchèque & Lignes Fermées (A56)",
      root: benoniCzechRoot,
    },
    {
      id: "benko-declined",
      name: "2. Gambit Benko Refusé (A57)",
      root: benkoDeclinedRoot,
    },
    {
      id: "benko-accepted",
      name: "3. Gambit Benko Accepté & Yougoslave (A58-A59)",
      root: benkoAcceptedRoot,
    },
  ],
};