import type { OpeningCourse, OpeningChapter, TutorialNode } from "./types";

// French Defense – C02 (Variante d'Avance & Gambit Milner-Barry)
const frenchC02Root: TutorialNode = {
  explanation: "La Variante d'Avance. Les Blancs ferment le centre pour vous étouffer. Votre mission : détruire la base de leur chaîne de pions (d4) par tous les moyens.",
  children: {
    e4: {
      move: "e4",
      explanation: "L'ordinateur ouvre par 1. e4. Entrez dans la Française en préparant le blocage central avec e6.",
      arrows: [["e7", "e6"]],
      children: {
        e6: {
          move: "e6",
          children: {
            d4: {
              move: "d4",
              explanation: "Les Blancs prennent le centre. Frappez immédiatement avec d5.",
              arrows: [["d7", "d5"]],
              children: {
                d5: {
                  move: "d5",
                  children: {
                    e5: {
                      move: "e5",
                      explanation: "La Variante d'Avance (C02). Le centre est verrouillé. Ne perdez pas de temps : attaquez la base de la chaîne (d4) avec la rupture c5.",
                      arrows: [["c7", "c5"]],
                      children: {
                        c5: {
                          move: "c5",
                          children: {
                            c3: {
                              move: "c3",
                              explanation: "Les Blancs consolident d4. Accentuez la pression en développant votre cavalier en c6.",
                              arrows: [["b8", "c6"]],
                              children: {
                                Nc6: {
                                  move: "Nc6",
                                  children: {
                                    Nf3: {
                                      move: "Nf3",
                                      explanation: "Ils défendent encore d4. Sortez votre Dame en b6 pour créer une pression insoutenable sur d4 et b2.",
                                      arrows: [["d8", "b6"]],
                                      children: {
                                        Qb6: {
                                          move: "Qb6",
                                          children: {
                                            Bd3: {
                                              move: "Bd3",
                                              explanation: "Le fameux Gambit Milner-Barry ! Les Blancs vous laissent le pion d4. Acceptez l'échange avec cxd4 pour ouvrir la colonne 'c'.",
                                              arrows: [["c5", "d4"]],
                                              children: {
                                                cxd4: {
                                                  move: "cxd4",
                                                  children: {
                                                    cxd4: {
                                                      move: "cxd4",
                                                      explanation: "ATTENTION AU PIÈGE ! Ne prenez pas le pion d4 tout de suite (Cxd4 perd la Dame après Cxd4 Dxd4 Fb5+ !). Jouez plutôt Fd7 pour parer l'échec et préparer la capture en toute sécurité.",
                                                      arrows: [["c8", "d7"], ["c6", "d4"], ["a8", "c8"]],
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

// French Defense – C01 (Variante d'Échange)
const frenchC01Root: TutorialNode = {
  explanation: "La Variante d'Échange. Souvent choisie par les Blancs pour éviter la théorie, elle mène à des positions symétriques. Nous allons voir comment créer du déséquilibre.",
  children: {
    e4: {
      move: "e4",
      explanation: "L'ordinateur ouvre par 1. e4. Répondez avec e6.",
      arrows: [["e7", "e6"]],
      children: {
        e6: {
          move: "e6",
          children: {
            d4: {
              move: "d4",
              explanation: "Jouez d5 pour contester le centre.",
              arrows: [["d7", "d5"]],
              children: {
                d5: {
                  move: "d5",
                  children: {
                    exd5: {
                      move: "exd5",
                      explanation: "La Variante d'Échange (C01). Reprenez avec le pion e (exd5) pour libérer la diagonale de votre Fou de cases claires.",
                      arrows: [["e6", "d5"]],
                      children: {
                        exd5: {
                          move: "exd5",
                          children: {
                            Nc3: {
                              move: "Nc3",
                              explanation: "Les Blancs développent activement. Prenez l'initiative en clouant ce cavalier avec votre Fou (Fb4).",
                              arrows: [["f8", "b4"]],
                              children: {
                                Bb4: {
                                  move: "Bb4",
                                  children: {
                                    Bd3: {
                                      move: "Bd3",
                                      explanation: "Leur Fou se place sur la meilleure diagonale. Développez votre cavalier de manière flexible en e7 (Ne7). S'ils clouent votre cavalier avec Fg5, vous pourrez jouer c6 ou f6.",
                                      arrows: [["g8", "e7"], ["b8", "c6"], ["c8", "f5"]]
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

// French Defense – C00 (Attaque Est-Indienne - KIA)
const frenchC00Root: TutorialNode = {
  explanation: "L'Attaque Est-Indienne (C00). Les Blancs refusent la bataille immédiate au centre pour préparer une attaque sur le roque. Prenez tout l'espace qu'ils vous laissent.",
  children: {
    e4: {
      move: "e4",
      explanation: "1. e4. Entrez dans la Française avec e6.",
      arrows: [["e7", "e6"]],
      children: {
        e6: {
          move: "e6",
          children: {
            d3: {
              move: "d3",
              explanation: "Le signal de l'Attaque Est-Indienne (KIA). Les Blancs ne jouent pas d4. Occupez le centre quand même avec d5.",
              arrows: [["d7", "d5"]],
              children: {
                d5: {
                  move: "d5",
                  children: {
                    Nd2: {
                      move: "Nd2",
                      explanation: "Ils préparent leur développement (Cgf3, g3, Fg2). Sortez votre cavalier f6 pour contrôler e4.",
                      arrows: [["g8", "f6"]],
                      children: {
                        Nf6: {
                          move: "Nf6",
                          children: {
                            Ngf3: {
                              move: "Ngf3",
                              explanation: "Prenez de l'espace à l'aile Dame avec c5. Vous jouez virtuellement une défense Sicilienne inversée !",
                              arrows: [["c7", "c5"]],
                              children: {
                                c5: {
                                  move: "c5",
                                  children: {
                                    g3: {
                                      move: "g3",
                                      explanation: "Ils préparent le fianchetto. Continuez votre développement logique avec Nc6.",
                                      arrows: [["b8", "c6"]],
                                      children: {
                                        Nc6: {
                                          move: "Nc6",
                                          children: {
                                            Bg2: {
                                              move: "Bg2",
                                              explanation: "Le Fou est placé. Préparez le petit roque en sortant votre Fou en e7 (Be7).",
                                              arrows: [["f8", "e7"]],
                                              children: {
                                                Be7: {
                                                  move: "Be7",
                                                  children: {
                                                    O_O: {
                                                      move: "O-O",
                                                      explanation: "La position clé contre la KIA. Mettez votre Roi à l'abri avec le petit roque (O-O). Vos plans futurs : b5-b4 (attaque à l'aile Dame) pendant que les Blancs attaqueront à l'aile Roi.",
                                                      arrows: [["e8", "g8"], ["b7", "b5"], ["c8", "b7"]]
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

// French Defense – C03 to C09 (La Variante Tarrasch)
const frenchTarraschRoot: TutorialNode = {
  children: {
    e4: {
      move: "e4",
      explanation: "L'ordinateur ouvre par 1. e4. Préparez votre contrôle du centre avec e6.",
      arrows: [["e7", "e6"]],
      children: {
        e6: {
          move: "e6",
          children: {
            d4: {
              move: "d4",
              explanation: "Les Blancs prennent tout le centre. Frappez immédiatement avec d5 pour contester leur domination.",
              arrows: [["d7", "d5"]],
              children: {
                d5: {
                  move: "d5",
                  children: {
                    Nd2: {
                      move: "Nd2",
                      explanation: "La Variante Tarrasch ! L'ordinateur soutient d4 sans bloquer son pion c. Voici les 3 grandes réponses : c5 (Ouverte), Cf6 (Fermée) ou Cc6 (Guimard).",
                      arrows: [["c7", "c5"], ["g8", "f6"], ["b8", "c6"]],
                      children: {
                        
                        // 1. Variante Guimard
                        Nc6: {
                          move: "Nc6",
                          children: {
                            c3: {
                              move: "c3",
                              explanation: "Variante Guimard. L'ordinateur consolide son centre. Provoquez l'échange en prenant en e4.",
                              arrows: [["d5", "e4"]],
                              children: {
                                dxe4: {
                                  move: "dxe4",
                                  children: {
                                    Nxe4: {
                                      move: "Nxe4",
                                      explanation: "L'ordinateur reprend. Fin de la ligne Guimard : jouez Cf6 pour contester ce Cavalier centralisé.",
                                      arrows: [["g8", "f6"]],
                                      children: { 
                                        Nf6: { 
                                          move: "Nf6",
                                          explanation: "🎉 Variante terminée ! Le centre est semi-ouvert. Votre plan : développer le Fou e7, roquer, et exploiter la position du Cavalier d2 blanc." 
                                        } 
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        },
                        
                        // 2. Ligne d'attente avec Fe7
                        Be7: {
                          move: "Be7",
                          children: {
                            Bd3: {
                              move: "Bd3",
                              explanation: "Développement classique de l'ordinateur. Lancez maintenant la rupture avec c5.",
                              arrows: [["c7", "c5"]],
                              children: {
                                c5: {
                                  move: "c5",
                                  children: {
                                    dxc5: {
                                      move: "dxc5",
                                      explanation: "Il élimine la tension. Fin de la ligne d'attente : reprenez le pion avec Fxc5.",
                                      arrows: [["f8", "c5"]],
                                      children: { 
                                        Bxc5: { 
                                          move: "Bxc5",
                                          explanation: "🎉 Variante terminée ! Votre Fou est très actif. Vous reprenez sans avoir perdu de tempo avec le Cavalier f6." 
                                        } 
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        },

                        // 3. Tarrasch Fermée
                        Nf6: {
                          move: "Nf6",
                          children: {
                            e5: {
                              move: "e5",
                              explanation: "Tarrasch Fermée. L'ordinateur gagne de l'espace. Repliez le Cavalier en d7 pour préparer la rupture c5.",
                              arrows: [["f6", "d7"]],
                              children: {
                                Nfd7: {
                                  move: "Nfd7",
                                  children: {
                                    f4: {
                                      move: "f4",
                                      explanation: "L'ordinateur surprotège e5 pour attaquer. Attaquez immédiatement la base d4 avec c5.",
                                      arrows: [["c7", "c5"]],
                                      children: {
                                        c5: {
                                          move: "c5",
                                          children: {
                                            c3: {
                                              move: "c3",
                                              explanation: "Il consolide d4. Mettez plus de pression en sortant le Cavalier en c6.",
                                              arrows: [["b8", "c6"]],
                                              children: {
                                                Nc6: {
                                                  move: "Nc6",
                                                  children: {
                                                    Ndf3: {
                                                      move: "Ndf3",
                                                      explanation: "Il défend ardemment son pion. Sortez la Dame en b6 pour rendre la tension insoutenable.",
                                                      arrows: [["d8", "b6"]],
                                                      children: {
                                                        Qb6: {
                                                          move: "Qb6",
                                                          children: {
                                                            g3: { move: "g3", explanation: "Il prépare le Fou en g2. Prenez en d4 pour ouvrir la colonne c.", arrows: [["c5", "d4"]], children: { cxd4: { move: "cxd4", children: { cxd4: { move: "cxd4", explanation: "L'ordinateur a repris. Fin de la ligne : développez votre Fou en e7.", arrows: [["f8", "e7"]], children: { Be7: { move: "Be7", explanation: "🎉 Variante terminée ! Votre pression à l'aile Dame est énorme. Préparez le petit roque." }} }}}}},
                                                            h4: { move: "h4", explanation: "L'ordinateur lance une attaque à l'aile Roi. Prenez d'abord au centre avec cxd4.", arrows: [["c5", "d4"]], children: { cxd4: { move: "cxd4", children: { cxd4: { move: "cxd4", explanation: "L'ordinateur reprend. Fin de la ligne : bloquez ses attaques en jouant f6.", arrows: [["f7", "f6"]], children: { f6: { move: "f6", explanation: "🎉 Variante terminée ! Le levier f6 détruit le centre blanc et vous offre le contrôle." }} }}}}},
                                                            Ne2: { move: "Ne2", explanation: "Défense plus souple des Blancs. Détruisez la chaîne avec cxd4.", arrows: [["c5", "d4"]], children: { cxd4: { move: "cxd4", children: { cxd4: { move: "cxd4", explanation: "Fin de la ligne. Le centre s'ouvre, préparez le levier f6.", arrows: [["f7", "f6"]], children: { f6: { move: "f6", explanation: "🎉 Variante terminée ! La destruction de leur centre vous garantit une excellente position." }} }}}}}
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
                                    Bd3: {
                                      move: "Bd3",
                                      explanation: "Développement classique des Blancs. Comme toujours, frappez immédiatement avec c5.",
                                      arrows: [["c7", "c5"]],
                                      children: {
                                        c5: {
                                          move: "c5",
                                          children: {
                                            c3: {
                                              move: "c3",
                                              explanation: "Les Blancs maintiennent d4. Développez le Cavalier c6 pour menacer ce pion.",
                                              arrows: [["b8", "c6"]],
                                              children: {
                                                Nc6: {
                                                  move: "Nc6",
                                                  children: {
                                                    Ne2: {
                                                      move: "Ne2",
                                                      explanation: "Il garde la diagonale de son Fou libre. Prenez en d4 pour amorcer la contre-attaque.",
                                                      arrows: [["c5", "d4"]],
                                                      children: {
                                                        cxd4: {
                                                          move: "cxd4",
                                                          children: {
                                                            cxd4: {
                                                              move: "cxd4",
                                                              explanation: "L'ordinateur reprend. Jouez f6 pour détruire son bastion en e5.",
                                                              arrows: [["f7", "f6"]],
                                                              children: {
                                                                f6: {
                                                                  move: "f6",
                                                                  children: {
                                                                    exf6: {
                                                                      move: "exf6",
                                                                      explanation: "Il lâche le centre. Reprenez logiquement avec le Cavalier f6.",
                                                                      arrows: [["d7", "f6"]],
                                                                      children: {
                                                                        Nxf6: {
                                                                          move: "Nxf6",
                                                                          children: {
                                                                            "O-O": {
                                                                              move: "O-O",
                                                                              explanation: "L'ordinateur a roqué. Fin de la ligne : jouez Fd6 pour pointer vers son Roi.",
                                                                              arrows: [["f8", "d6"]],
                                                                              children: { 
                                                                                Bd6: { 
                                                                                  move: "Bd6",
                                                                                  explanation: "🎉 Variante terminée ! Le Fou vise h2 et vous avez un fort contrôle du centre."
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
                                                    Ngf3: {
                                                      move: "Ngf3",
                                                      explanation: "Alternative courante. Mettez la pression avec Db6 ou préparez le roque par Fe7.",
                                                      arrows: [["d8", "b6"], ["f8", "e7"]],
                                                      children: {
                                                        Qb6: { move: "Qb6", children: { "O-O": { move: "O-O", explanation: "Il roque. Fin de la ligne, développez votre Fou en e7.", arrows: [["f8", "e7"]], children: { Be7: { move: "Be7", explanation: "🎉 Variante terminée ! Maintenez la pression sur d4." }} }}},
                                                        Be7: { move: "Be7", children: { "O-O": { move: "O-O", explanation: "L'ordinateur s'est mis à l'abri, roquez à votre tour.", arrows: [["e8", "g8"]], children: { "O-O": { move: "O-O", explanation: "🎉 Variante terminée ! Une ligne extrêmement solide." }} }}}
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

                        // 4. Tarrasch Ouverte
                        c5: {
                          move: "c5",
                          children: {
                            exd5: {
                              move: "exd5",
                              explanation: "Tarrasch Ouverte. L'ordinateur élimine la tension centrale. Reprenez avec la Dame ou avec le pion e.",
                              arrows: [["d8", "d5"], ["e6", "d5"]],
                              children: {
                                // 4.1 Reprise avec la Dame
                                Qxd5: {
                                  move: "Qxd5",
                                  children: {
                                    Ngf3: {
                                      move: "Ngf3",
                                      explanation: "L'ordinateur développe son Cavalier. Échangez au centre en prenant d4.",
                                      arrows: [["c5", "d4"]],
                                      children: {
                                        cxd4: {
                                          move: "cxd4",
                                          children: {
                                            Bc4: {
                                              move: "Bc4",
                                              explanation: "Les Blancs attaquent votre Dame. Repliez-la sur la case idéale en d6.",
                                              arrows: [["d5", "d6"]],
                                              children: {
                                                Qd6: {
                                                  move: "Qd6",
                                                  children: {
                                                    "O-O": {
                                                      move: "O-O",
                                                      explanation: "Il met son Roi en sécurité. Développez le Cavalier f6.",
                                                      arrows: [["g8", "f6"]],
                                                      children: {
                                                        Nf6: {
                                                          move: "Nf6",
                                                          children: {
                                                            Nb3: {
                                                              move: "Nb3",
                                                              explanation: "Il menace de récupérer le pion d4. Développez Cc6 pour défendre.",
                                                              arrows: [["b8", "c6"]],
                                                              children: {
                                                                Nc6: {
                                                                  move: "Nc6",
                                                                  children: {
                                                                    Nbxd4: {
                                                                      move: "Nbxd4",
                                                                      explanation: "L'ordinateur récupère son pion. Échangez les Cavaliers en d4.",
                                                                      arrows: [["c6", "d4"]],
                                                                      children: {
                                                                        Nxd4: {
                                                                          move: "Nxd4",
                                                                          children: {
                                                                            // CORRECTION ICI : Le Fou doit sortir avant de pouvoir roquer !
                                                                            Nxd4: { 
                                                                              move: "Nxd4", 
                                                                              explanation: "Fin de la ligne. Le matériel est équilibré. Développez d'abord votre Fou en e7 pour préparer le roque.", 
                                                                              arrows: [["f8", "e7"]], 
                                                                              children: { 
                                                                                Be7: { 
                                                                                  move: "Be7", 
                                                                                  explanation: "🎉 Variante terminée ! La voie est libre, vous pourrez roquer sereinement au prochain coup." 
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
                                },
                                // 4.2 Reprise avec le Pion e (IQP)
                                exd5: {
                                  move: "exd5",
                                  children: {
                                    Ngf3: {
                                      move: "Ngf3",
                                      explanation: "Vous avez un Pion Dame Isolé. Sortez un Cavalier (Cc6 ou Cf6) pour activer vos pièces.",
                                      arrows: [["b8", "c6"], ["g8", "f6"]],
                                      children: {
                                        Nf6: {
                                          move: "Nf6",
                                          children: {
                                            "Bb5+": {
                                              move: "Bb5+",
                                              explanation: "Échec. Les Blancs veulent échanger votre Fou c8 pour vous affaiblir. Jouez Fd7.",
                                              arrows: [["c8", "d7"]],
                                              children: {
                                                Bd7: {
                                                  move: "Bd7",
                                                  children: {
                                                    "Bxd7+": {
                                                      move: "Bxd7+",
                                                      explanation: "Il prend votre Fou. Reprenez avec le Cavalier b8 pour ne pas déplacer votre Dame.",
                                                      arrows: [["b8", "d7"]],
                                                      children: {
                                                        Nbxd7: {
                                                          move: "Nbxd7",
                                                          children: {
                                                            "O-O": {
                                                              move: "O-O",
                                                              explanation: "Préparez votre roque en plaçant le Fou en e7.",
                                                              arrows: [["f8", "e7"]],
                                                              children: {
                                                                Be7: {
                                                                  move: "Be7",
                                                                  children: {
                                                                    dxc5: {
                                                                      move: "dxc5",
                                                                      explanation: "Fin de la ligne ! Il liquide la tension. Reprenez avec Cxc5.",
                                                                      arrows: [["d7", "c5"]],
                                                                      children: { 
                                                                        Nxc5: { 
                                                                          move: "Nxc5",
                                                                          explanation: "🎉 Variante terminée ! Utilisez vos Cavaliers centralisés pour harceler les défenses blanches."
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
                                        Nc6: {
                                          move: "Nc6",
                                          children: {
                                            Bb5: {
                                              move: "Bb5",
                                              explanation: "Il cloue votre Cavalier. Répondez en plaçant le Fou en d6, la case idéale.",
                                              arrows: [["f8", "d6"]],
                                              children: {
                                                Bd6: {
                                                  move: "Bd6",
                                                  children: {
                                                    "O-O": {
                                                      move: "O-O",
                                                      explanation: "Il met son Roi à l'abri. Développez le Cavalier roi en e7 pour soutenir d5.",
                                                      arrows: [["g8", "e7"]],
                                                      children: {
                                                        Ne7: {
                                                          move: "Ne7",
                                                          children: {
                                                            dxc5: {
                                                              move: "dxc5",
                                                              explanation: "Il détruit la tension. Reprenez avec votre Fou (Fxc5).",
                                                              arrows: [["d6", "c5"]],
                                                              children: {
                                                                Bxc5: {
                                                                  move: "Bxc5",
                                                                  children: {
                                                                    c3: {
                                                                      move: "c3",
                                                                      explanation: "Il consolide. Mettez votre Roi en sécurité avec le petit roque.",
                                                                      arrows: [["e8", "g8"]],
                                                                      children: {
                                                                        "O-O": {
                                                                          move: "O-O",
                                                                          children: {
                                                                            Nb3: { 
                                                                              move: "Nb3", 
                                                                              explanation: "Fin de la variante. L'ordinateur attaque votre Fou, reculez-le en d6.", 
                                                                              arrows: [["c5", "d6"]], 
                                                                              children: { 
                                                                                Bd6: { 
                                                                                  move: "Bd6", 
                                                                                  explanation: "🎉 Variante terminée ! L'activité de vos pièces compense largement le pion isolé." 
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
                                                            Nb3: {
                                                              move: "Nb3",
                                                              explanation: "Il prend le contrôle de c5. Gagnez de l'espace avec c4.",
                                                              arrows: [["c5", "c4"]],
                                                              children: {
                                                                c4: {
                                                                  move: "c4",
                                                                  children: {
                                                                    Nbd2: {
                                                                      move: "Nbd2",
                                                                      explanation: "Il recule. Fin de la ligne : roquez pour sécuriser définitivement la position.",
                                                                      arrows: [["e8", "g8"]],
                                                                      children: { 
                                                                        "O-O": { 
                                                                          move: "O-O",
                                                                          explanation: "🎉 Variante terminée ! Vos pions avancés offrent d'excellentes perspectives de manœuvres."
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

const frenchClassicalRoot: TutorialNode = {
  children: {
    e4: {
      move: "e4",
      explanation: "L'ordinateur ouvre par 1. e4. Mettez en place votre structure avec e6.",
      arrows: [["e7", "e6"]],
      children: {
        e6: {
          move: "e6",
          children: {
            d4: {
              move: "d4",
              explanation: "Les Blancs occupent le centre. Frappez immédiatement avec d5.",
              arrows: [["d7", "d5"]],
              children: {
                d5: {
                  move: "d5",
                  children: {
                    Nc3: {
                      move: "Nc3",
                      explanation: "La grande bifurcation (C10-C14) ! L'ordinateur sort son Cavalier pour défendre e4. Vous avez 4 choix : Cf6 (Classique), dxe4 (Rubinstein), a6 (Paulsen) ou Cc6.",
                      arrows: [["g8", "f6"], ["d5", "e4"], ["a7", "a6"], ["b8", "c6"]],
                      children: {

                        // ==========================================
                        // 1. Variante Hecht-Reefschläger (3... Nc6)
                        // ==========================================
                        Nc6: {
                          move: "Nc6",
                          children: {
                            Nf3: {
                              move: "Nf3",
                              explanation: "L'ordinateur développe son autre Cavalier. Sortez le vôtre en f6.",
                              arrows: [["g8", "f6"]],
                              children: {
                                Nf6: {
                                  move: "Nf6",
                                  explanation: "🎉 Variante terminée ! Une ligne rare (Hecht-Reefschläger) qui bloque le pion c mais vise un développement rapide des pièces."
                                }
                              }
                            }
                          }
                        },

                        // ==========================================
                        // 2. Variante Paulsen (3... a6)
                        // ==========================================
                        a6: {
                          move: "a6",
                          children: {
                            Nf3: {
                              move: "Nf3",
                              explanation: "Développement classique. Continuez par Cf6 pour provoquer la poussée centrale.",
                              arrows: [["g8", "f6"]],
                              children: {
                                Nf6: {
                                  move: "Nf6",
                                  children: {
                                    e5: {
                                      move: "e5",
                                      explanation: "L'ordinateur gagne de l'espace. Repliez votre Cavalier en d7.",
                                      arrows: [["f6", "d7"]],
                                      children: {
                                        Nfd7: {
                                          move: "Nfd7",
                                          explanation: "🎉 Variante terminée ! Le coup a6 vous sera très utile pour empêcher les sauts de Cavalier ou préparer b5."
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        },

                        // ==========================================
                        // 3. Variante Rubinstein (3... dxe4)
                        // ==========================================
                        dxe4: {
                          move: "dxe4",
                          children: {
                            Nxe4: {
                              move: "Nxe4",
                              explanation: "La Variante Rubinstein. Vous avez relâché la tension centrale. Développez le Cavalier d7 pour préparer la venue du deuxième Cavalier en f6.",
                              arrows: [["b8", "d7"]],
                              children: {
                                Nd7: {
                                  move: "Nd7",
                                  children: {
                                    Nf3: {
                                      move: "Nf3",
                                      explanation: "Les Blancs se développent. Sortez votre Cavalier en f6 pour défier le centre.",
                                      arrows: [["g8", "f6"]],
                                      children: {
                                        Ngf6: {
                                          move: "Ngf6",
                                          children: {
                                            "Nxf6+": {
                                              move: "Nxf6+",
                                              explanation: "Échec et échange central ! Reprenez avec le Cavalier d7 (Cxf6) pour ne pas abîmer votre structure de pions.",
                                              arrows: [["d7", "f6"]],
                                              children: {
                                                Nxf6: {
                                                  move: "Nxf6",
                                                  explanation: "🎉 Variante terminée ! Une ligne ultra-solide, souvent utilisée pour jouer la nulle ou contrer des attaquants agressifs."
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

                        // ==========================================
                        // 4. Lignes Principales : Variante Classique (3... Nf6)
                        // ==========================================
                        Nf6: {
                          move: "Nf6",
                          children: {

                            // 4.1 Variante d'Échange retardée
                            exd5: {
                              move: "exd5",
                              explanation: "Variante d'échange retardée. L'ordinateur refuse la tension. Reprenez avec le pion e.",
                              arrows: [["e6", "d5"]],
                              children: {
                                exd5: {
                                  move: "exd5",
                                  explanation: "🎉 Variante terminée ! La structure est symétrique, la partie se jouera sur des manœuvres de pièces subtiles."
                                }
                              }
                            },

                            // 4.2 Variante Steinitz (4. e5)
                            e5: {
                              move: "e5",
                              explanation: "La Variante Steinitz. L'ordinateur ferme le centre. Repliez-vous en d7 pour soutenir la poussée c5.",
                              arrows: [["f6", "d7"]],
                              children: {
                                Nfd7: {
                                  move: "Nfd7",
                                  children: {
                                    f4: {
                                      move: "f4",
                                      explanation: "Il consolide massivement e5. Frappez immédiatement la base de sa chaîne avec c5.",
                                      arrows: [["c7", "c5"]],
                                      children: {
                                        c5: {
                                          move: "c5",
                                          children: {
                                            Nf3: {
                                              move: "Nf3",
                                              explanation: "Développement classique. Sortez le Cavalier c6 pour augmenter la pression sur d4.",
                                              arrows: [["b8", "c6"]],
                                              children: {
                                                Nc6: {
                                                  move: "Nc6",
                                                  children: {
                                                    Be3: {
                                                      move: "Be3",
                                                      explanation: "Il défend d4 avec son Fou. Vous avez deux options typiques : échanger (cxd4) ou jouer a6 (Boleslavsky).",
                                                      arrows: [["c5", "d4"], ["a7", "a6"]],
                                                      children: {
                                                        cxd4: {
                                                          move: "cxd4",
                                                          children: {
                                                            Nxd4: {
                                                              move: "Nxd4",
                                                              explanation: "Il reprend. La tension centrale diminue. Développez vos pièces pour l'aile Roi (Fc5 ou Db6).",
                                                              arrows: [["f8", "c5"]],
                                                              children: { Bc5: { move: "Bc5", explanation: "🎉 Variante terminée ! Une lutte classique de la Française." } }
                                                            }
                                                          }
                                                        },
                                                        a6: {
                                                          move: "a6",
                                                          children: {
                                                            Qd2: {
                                                              move: "Qd2",
                                                              explanation: "Il prépare le grand roque. Jouez b5 ou Fe7 pour continuer votre développement.",
                                                              arrows: [["b7", "b5"]],
                                                              children: { b5: { move: "b5", explanation: "🎉 Variante terminée ! Vous lancez l'assaut sur l'aile Dame." } }
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            },
                                            dxc5: {
                                              move: "dxc5",
                                              explanation: "Il liquide la tension centrale. Reprenez l'initiative avec Cc6 avant de récupérer le pion.",
                                              arrows: [["b8", "c6"]],
                                              children: {
                                                Nc6: {
                                                  move: "Nc6",
                                                  children: {
                                                    a3: {
                                                      move: "a3",
                                                      explanation: "Il empêche un saut en b4. Récupérez le pion c5 avec votre Fou (Fxc5).",
                                                      arrows: [["f8", "c5"]],
                                                      children: {
                                                        Bxc5: {
                                                          move: "Bxc5",
                                                          children: {
                                                            Qg4: {
                                                              move: "Qg4",
                                                              explanation: "Attaque sur g7 ! Mettez votre Roi en sécurité avec le petit roque.",
                                                              arrows: [["e8", "g8"]],
                                                              children: {
                                                                "O-O": {
                                                                  move: "O-O",
                                                                  children: {
                                                                    Nf3: {
                                                                      move: "Nf3",
                                                                      explanation: "Il se développe. Vous devez détruire son centre en jouant f6.",
                                                                      arrows: [["f7", "f6"]],
                                                                      children: {
                                                                        f6: {
                                                                          move: "f6",
                                                                          explanation: "🎉 Variante terminée ! Le levier f6 est essentiel ici pour faire exploser le centre blanc."
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
                            },

                            // 4.3 Variante Principale (4. Bg5)
                            Bg5: {
                              move: "Bg5",
                              explanation: "L'ordinateur cloue le Cavalier f6. C'est la ligne reine de la Classique. 3 choix s'offrent à vous : Fe7 (Classique), dxe4 (Burn) ou Fb4 (MacCutcheon).",
                              arrows: [["f8", "e7"], ["d5", "e4"], ["f8", "b4"]],
                              children: {

                                // A) Variante Burn (dxe4)
                                dxe4: {
                                  move: "dxe4",
                                  children: {
                                    Nxe4: {
                                      move: "Nxe4",
                                      explanation: "La Variante Burn ! Les Blancs centralisent leur Cavalier. Déclouez votre Cavalier f6 en jouant Fe7 ou soutenez-le avec Cbd7.",
                                      arrows: [["f8", "e7"], ["b8", "d7"]],
                                      children: {
                                        Be7: {
                                          move: "Be7",
                                          children: {
                                            Bxf6: {
                                              move: "Bxf6",
                                              explanation: "Il détruit votre défenseur central. Reprenez avec le Fou (Fxf6).",
                                              arrows: [["e7", "f6"]],
                                              children: {
                                                Bxf6: {
                                                  move: "Bxf6",
                                                  children: {
                                                    Nf3: {
                                                      move: "Nf3",
                                                      explanation: "Il continue son développement. Mettez votre Roi à l'abri avec le roque.",
                                                      arrows: [["e8", "g8"]],
                                                      children: {
                                                        "O-O": {
                                                          move: "O-O",
                                                          explanation: "🎉 Variante terminée ! Position très solide avec la paire de Fous pour vous."
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        },
                                        Nbd7: {
                                          move: "Nbd7",
                                          children: {
                                            Nf3: {
                                              move: "Nf3",
                                              explanation: "Développement. Préparez le déclouage avec Fe7.",
                                              arrows: [["f8", "e7"]],
                                              children: {
                                                Be7: {
                                                  move: "Be7",
                                                  children: {
                                                    "Nxf6+": {
                                                      move: "Nxf6+",
                                                      explanation: "Échec au centre. Reprenez avec le Cavalier (Cxf6) pour rester actif.",
                                                      arrows: [["d7", "f6"]],
                                                      children: {
                                                        Nxf6: {
                                                          move: "Nxf6",
                                                          explanation: "🎉 Variante terminée ! La tension a disparu, place au milieu de jeu stratégique."
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

                                // B) Variante MacCutcheon (Fb4)
                                Bb4: {
                                  move: "Bb4",
                                  children: {
                                    exd5: {
                                      move: "exd5",
                                      explanation: "L'ordinateur liquide le centre. Reprenez avec la Dame (Dxd5).",
                                      arrows: [["d8", "d5"]],
                                      children: {
                                        Qxd5: {
                                          move: "Qxd5",
                                          children: {
                                            Bxf6: {
                                              move: "Bxf6",
                                              explanation: "Il casse votre structure. Reprenez avec le pion g (gxf6).",
                                              arrows: [["g7", "f6"]],
                                              children: {
                                                gxf6: {
                                                  move: "gxf6",
                                                  children: {
                                                    Qd2: {
                                                      move: "Qd2",
                                                      explanation: "Il protège le Cavalier c3 cloué. Sortez votre Cavalier c6 pour attaquer d4.",
                                                      arrows: [["b8", "c6"]],
                                                      children: {
                                                        Nc6: {
                                                          move: "Nc6",
                                                          explanation: "🎉 Variante terminée ! Bien que votre structure à l'aile Roi soit abîmée, la colonne g ouverte est un atout pour l'attaque."
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
                                    e5: {
                                      move: "e5",
                                      explanation: "L'ordinateur maintient la tension. Chassez immédiatement le Fou avec h6.",
                                      arrows: [["h7", "h6"]],
                                      children: {
                                        h6: {
                                          move: "h6",
                                          children: {
                                            Bd2: {
                                              move: "Bd2",
                                              explanation: "Il recule le Fou. Prenez le Cavalier c3 (Fxc3) pour abîmer sa structure de pions.",
                                              arrows: [["b4", "c3"]],
                                              children: {
                                                Bxc3: {
                                                  move: "Bxc3",
                                                  children: {
                                                    bxc3: {
                                                      move: "bxc3",
                                                      explanation: "Il reprend. Installez solidement votre Cavalier au centre en e4.",
                                                      arrows: [["f6", "e4"]],
                                                      children: {
                                                        Ne4: {
                                                          move: "Ne4",
                                                          children: {
                                                            Qg4: {
                                                              move: "Qg4",
                                                              explanation: "Il vise g7 ! Défendez avec g6.",
                                                              arrows: [["g7", "g6"]],
                                                              children: {
                                                                g6: {
                                                                  move: "g6",
                                                                  children: {
                                                                    Bd3: {
                                                                      move: "Bd3",
                                                                      explanation: "Il attaque votre Cavalier. Éliminez son Fou de cases noires en d2 (Cxd2).",
                                                                      arrows: [["e4", "d2"]],
                                                                      children: {
                                                                        Nxd2: {
                                                                          move: "Nxd2",
                                                                          children: {
                                                                            Kxd2: {
                                                                              move: "Kxd2",
                                                                              explanation: "Le Roi blanc est déroqué ! Lancez l'assaut sur son centre affaibli avec c5.",
                                                                              arrows: [["c7", "c5"]],
                                                                              children: {
                                                                                c5: {
                                                                                  move: "c5",
                                                                                  explanation: "🎉 Variante terminée ! Position asymétrique exceptionnelle de la MacCutcheon."
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
                                            exf6: {
                                              move: "exf6",
                                              explanation: "Le chaos de la MacCutcheon (Variante Tchigorine) ! Il sacrifie le Fou. Reprenez-le (hxg5).",
                                              arrows: [["h6", "g5"]],
                                              children: {
                                                hxg5: {
                                                  move: "hxg5",
                                                  children: {
                                                    fxg7: {
                                                      move: "fxg7",
                                                      explanation: "Son pion attaque votre Tour. Bougez-la en g8.",
                                                      arrows: [["h8", "g8"]],
                                                      children: {
                                                        Rg8: {
                                                          move: "Rg8",
                                                          children: {
                                                            h4: {
                                                              move: "h4",
                                                              explanation: "Il sacrifie h4 pour ouvrir les lignes. Acceptez le pion avec gxh4.",
                                                              arrows: [["g5", "h4"]],
                                                              children: {
                                                                gxh4: {
                                                                  move: "gxh4",
                                                                  explanation: "🎉 Variante terminée ! Bienvenue dans l'une des lignes les plus tranchantes de la Française. Chaque tempo compte."
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

                                // C) Variante Classique (Be7)
                                Be7: {
                                  move: "Be7",
                                  children: {
                                    Bxf6: {
                                      move: "Bxf6",
                                      explanation: "L'Attaque Richter ! Il élimine le défenseur central. Reprenez avec le Fou (Fxf6).",
                                      arrows: [["e7", "f6"]],
                                      children: {
                                        Bxf6: {
                                          move: "Bxf6",
                                          children: {
                                            e5: {
                                              move: "e5",
                                              explanation: "Il attaque votre Fou et gagne de l'espace. Repliez le Fou en e7.",
                                              arrows: [["f6", "e7"]],
                                              children: {
                                                Be7: {
                                                  move: "Be7",
                                                  explanation: "🎉 Variante terminée ! Les Blancs ont le centre mais vous possédez la paire de Fous."
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    },
                                    e5: {
                                      move: "e5",
                                      explanation: "La ligne critique. Il attaque le Cavalier. Repliez-le en d7.",
                                      arrows: [["f6", "d7"]],
                                      children: {
                                        Nfd7: {
                                          move: "Nfd7",
                                          children: {
                                            Bxe7: {
                                              move: "Bxe7",
                                              explanation: "Il échange les Fous de cases noires. Reprenez avec la Dame (Dxe7).",
                                              arrows: [["d8", "e7"]],
                                              children: {
                                                Qxe7: {
                                                  move: "Qxe7",
                                                  children: {
                                                    f4: {
                                                      move: "f4",
                                                      explanation: "Il verrouille e5. Vous avez le choix entre jouer a6 pour préparer b5, ou roquer.",
                                                      arrows: [["a7", "a6"], ["e8", "g8"]],
                                                      children: {
                                                        a6: {
                                                          move: "a6",
                                                          children: {
                                                            Nf3: {
                                                              move: "Nf3",
                                                              explanation: "Développement. Jouez la rupture vitale c5.",
                                                              arrows: [["c7", "c5"]],
                                                              children: { c5: { move: "c5", explanation: "🎉 Variante terminée ! L'attaque noire sur l'aile Dame commence." } }
                                                            }
                                                          }
                                                        },
                                                        "O-O": {
                                                          move: "O-O",
                                                          children: {
                                                            Nf3: {
                                                              move: "Nf3",
                                                              explanation: "Préparez la rupture centrale avec c5.",
                                                              arrows: [["c7", "c5"]],
                                                              children: {
                                                                c5: {
                                                                  move: "c5",
                                                                  children: {
                                                                    Qd2: {
                                                                      move: "Qd2",
                                                                      explanation: "Il prépare le grand roque. Sortez le Cavalier c6 pour attaquer d4.",
                                                                      arrows: [["b8", "c6"]],
                                                                      children: {
                                                                        Nc6: {
                                                                          move: "Nc6",
                                                                          children: {
                                                                            "O-O-O": {
                                                                              move: "O-O-O",
                                                                              explanation: "Les Rois sont opposés ! Lancez l'assaut avec a6 pour préparer b5.",
                                                                              arrows: [["a7", "a6"]],
                                                                              children: {
                                                                                a6: {
                                                                                  move: "a6",
                                                                                  explanation: "🎉 Variante terminée ! Une course d'attaque classique de roques opposés démarre."
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
                                            h4: {
                                              move: "h4",
                                              explanation: "L'Attaque Alekhine-Chatard ! L'ordinateur sacrifie un pion pour ouvrir la colonne h. Vous pouvez accepter avec Fxg5 ou refuser avec a6.",
                                              arrows: [["e7", "g5"], ["a7", "a6"]],
                                              children: {
                                                a6: {
                                                  move: "a6",
                                                  children: {
                                                    Qg4: {
                                                      move: "Qg4",
                                                      explanation: "Il crée de fortes menaces sur g7 et le roi. La défense exige de la précision (ex: Rf8).",
                                                      arrows: [["e8", "f8"]],
                                                      children: {
                                                        Kf8: {
                                                          move: "Kf8",
                                                          explanation: "🎉 Variante terminée ! Vous refusez le gambit et préparez la contre-attaque c5."
                                                        }
                                                      }
                                                    }
                                                  }
                                                },
                                                Bxg5: {
                                                  move: "Bxg5",
                                                  children: {
                                                    hxg5: {
                                                      move: "hxg5",
                                                      explanation: "La colonne s'ouvre. Acceptez le défi en prenant g5 avec la Dame (Dxg5).",
                                                      arrows: [["d8", "g5"]],
                                                      children: {
                                                        Qxg5: {
                                                          move: "Qxg5",
                                                          children: {
                                                            Nh3: {
                                                              move: "Nh3",
                                                              explanation: "Il attaque votre Dame avec gain de tempo. Repliez-la prudemment en e7.",
                                                              arrows: [["g5", "e7"]],
                                                              children: {
                                                                Qe7: {
                                                                  move: "Qe7",
                                                                  explanation: "🎉 Variante terminée ! Vous avez un pion d'avance, mais devrez jouer avec une grande précision défensive."
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

const frenchWinawerRoot: TutorialNode = {
  children: {
    e4: {
      move: "e4",
      explanation: "L'ordinateur ouvre par 1. e4. Mettez en place votre structure avec e6.",
      arrows: [["e7", "e6"]],
      children: {
        e6: {
          move: "e6",
          children: {
            d4: {
              move: "d4",
              explanation: "Les Blancs occupent le centre. Frappez immédiatement avec d5.",
              arrows: [["d7", "d5"]],
              children: {
                d5: {
                  move: "d5",
                  children: {
                    Nc3: {
                      move: "Nc3",
                      explanation: "L'ordinateur défend son pion central. C'est le moment d'entrer dans la Winawer en clouant ce Cavalier avec Fb4.",
                      arrows: [["f8", "b4"]],
                      children: {
                        Bb4: {
                          move: "Bb4",
                          children: {
                            // ==========================================
                            // 1. Les Lignes Secondaires (C15)
                            // ==========================================
                            Bd2: {
                              move: "Bd2",
                              explanation: "Une ligne secondaire solide. Les Blancs déclouent leur Cavalier. Vous pouvez jouer Ce7 ou déclencher les complications avec dxe4.",
                              arrows: [["g8", "e7"], ["d5", "e4"]],
                              children: {
                                Ne7: {
                                  move: "Ne7",
                                  explanation: "🎉 Variante terminée ! La ligne Fingerslip. Une approche très solide où vous préparez tranquillement votre développement."
                                },
                                dxe4: {
                                  move: "dxe4",
                                  children: {
                                    Qg4: {
                                      move: "Qg4",
                                      explanation: "Le Gambit Mueller-Zhuravlev ! Les Blancs attaquent g7. Défendez en développant le Cavalier f6.",
                                      arrows: [["g8", "f6"]],
                                      children: {
                                        Nf6: {
                                          move: "Nf6",
                                          children: {
                                            "Qxg7": {
                                              move: "Qxg7",
                                              explanation: "Ils prennent le pion ! Attaquez immédiatement la Dame avec Tg8.",
                                              arrows: [["h8", "g8"]],
                                              children: {
                                                Rg8: {
                                                  move: "Rg8",
                                                  explanation: "🎉 Variante terminée ! Une ligne tactique ultra-tendue où l'activité de vos pièces compense largement la structure."
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
                            exd5: {
                              move: "exd5",
                              explanation: "Variante d'Échange retardée. L'ordinateur simplifie le centre. Reprenez avec le pion e.",
                              arrows: [["e6", "d5"]],
                              children: {
                                exd5: {
                                  move: "exd5",
                                  children: {
                                    Bd3: {
                                      move: "Bd3",
                                      explanation: "Développement classique. Poursuivez logiquement avec Ce7 pour préparer le roque.",
                                      arrows: [["g8", "e7"]],
                                      children: {
                                        Ne7: {
                                          move: "Ne7",
                                          explanation: "🎉 Variante terminée ! Position symétrique et très saine."
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            },
                            Bd3: {
                              move: "Bd3",
                              explanation: "Une autre approche hybride. Le centre n'est pas figé, frappez immédiatement avec c5.",
                              arrows: [["c7", "c5"]],
                              children: {
                                c5: {
                                  move: "c5",
                                  children: {
                                    exd5: {
                                      move: "exd5",
                                      explanation: "Il prend d5. Reprenez avec la Dame (Dxd5) pour centraliser vos forces.",
                                      arrows: [["d8", "d5"]],
                                      children: {
                                        Qxd5: {
                                          move: "Qxd5",
                                          explanation: "🎉 Variante terminée ! La Dame noire est idéalement placée."
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            },
                            Ne2: {
                              move: "Ne2",
                              explanation: "Le Gambit Alekhine ! L'ordinateur sacrifie un pion pour éviter de doubler ses pions c. Prenez en e4.",
                              arrows: [["d5", "e4"]],
                              children: {
                                dxe4: {
                                  move: "dxe4",
                                  children: {
                                    a3: {
                                      move: "a3",
                                      explanation: "Il interroge votre Fou. Vous pouvez accepter le défi (Fxc3+) ou reculer (Fe7).",
                                      arrows: [["b4", "c3"], ["b4", "e7"]],
                                      children: {
                                        "Bxc3+": {
                                          move: "Bxc3+",
                                          children: {
                                            Nxc3: {
                                              move: "Nxc3",
                                              explanation: "🎉 Variante terminée ! Le Gambit est accepté, accrochez-vous à votre pion supplémentaire et développez-vous vite."
                                            }
                                          }
                                        },
                                        Be7: {
                                          move: "Be7",
                                          children: {
                                            Nxe4: {
                                              move: "Nxe4",
                                              explanation: "Il récupère le pion central. Sortez le Cavalier f6.",
                                              arrows: [["g8", "f6"]],
                                              children: {
                                                Nf6: {
                                                  move: "Nf6",
                                                  children: {
                                                    N2g3: {
                                                      move: "N2g3",
                                                      explanation: "Il consolide. Mettez votre Roi en sécurité (O-O).",
                                                      arrows: [["e8", "g8"]],
                                                      children: {
                                                        "O-O": {
                                                          move: "O-O",
                                                          children: {
                                                            Be2: {
                                                              move: "Be2",
                                                              explanation: "Il prépare son propre roque. Frappez la base avec c5.",
                                                              arrows: [["c7", "c5"]],
                                                              children: {
                                                                c5: {
                                                                  move: "c5",
                                                                  explanation: "🎉 Variante terminée ! L'approche prudente contre le Gambit Alekhine vous donne un jeu égal."
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

                            // ==========================================
                            // 2. La Ligne Principale (4. e5)
                            // ==========================================
                            e5: {
                              move: "e5",
                              explanation: "L'ordinateur ferme le centre, c'est la ligne principale de la Winawer. Attaquez immédiatement avec c5, ou optez pour b6/Ce7/Dd7.",
                              arrows: [["c7", "c5"], ["b7", "b6"], ["d8", "d7"], ["g8", "e7"]],
                              children: {
                                b6: {
                                  move: "b6",
                                  children: {
                                    Qg4: {
                                      move: "Qg4",
                                      explanation: "Attaque directe sur g7. Repliez temporairement votre Fou en f8 pour défendre.",
                                      arrows: [["b4", "f8"]],
                                      children: {
                                        Bf8: {
                                          move: "Bf8",
                                          explanation: "🎉 Variante terminée ! Une ligne hypermoderne où vous échangez du temps contre une structure sans faille."
                                        }
                                      }
                                    }
                                  }
                                },
                                Qd7: {
                                  move: "Qd7",
                                  children: {
                                    a3: {
                                      move: "a3",
                                      explanation: "La Variante Petrosian. Prenez le Cavalier (Fxc3+).",
                                      arrows: [["b4", "c3"]],
                                      children: {
                                        "Bxc3+": {
                                          move: "Bxc3+",
                                          children: {
                                            bxc3: {
                                              move: "bxc3",
                                              explanation: "🎉 Variante terminée ! Votre plan est de jouer b6, Fa6 pour échanger le bon Fou des Blancs, puis attaquer leurs pions doublés."
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                },
                                Ne7: {
                                  move: "Ne7",
                                  children: {
                                    a3: {
                                      move: "a3",
                                      explanation: "Il force l'échange. Prenez en c3 (Fxc3+).",
                                      arrows: [["b4", "c3"]],
                                      children: {
                                        "Bxc3+": {
                                          move: "Bxc3+",
                                          children: {
                                            bxc3: {
                                              move: "bxc3",
                                              explanation: "🎉 Variante terminée ! Ligne solide avant d'enchaîner avec le traditionnel c5."
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                },
                                c5: {
                                  move: "c5",
                                  children: {
                                    Qg4: {
                                      move: "Qg4",
                                      explanation: "La Variante de Moscou. Il ignore c5 et vise g7. Développez Ce7 pour préparer le sacrifice du pion g.",
                                      arrows: [["g8", "e7"]],
                                      children: {
                                        Ne7: {
                                          move: "Ne7",
                                          explanation: "🎉 Variante terminée ! Si les Blancs prennent en g7 (Dxg7), la Tour g8 deviendra extrêmement menaçante."
                                        }
                                      }
                                    },
                                    a3: {
                                      move: "a3",
                                      explanation: "La grande ligne. L'ordinateur questionne le Fou. Vous pouvez prendre le Cavalier ou jouer de façon provocatrice avec Fa5 / cxd4.",
                                      arrows: [["b4", "c3"], ["b4", "a5"], ["c5", "d4"]],
                                      children: {
                                        cxd4: {
                                          move: "cxd4",
                                          children: {
                                            axb4: {
                                              move: "axb4",
                                              explanation: "🎉 Variante terminée ! Une ligne complexe où vous laissez le Fou en échange d'un centre massif."
                                            }
                                          }
                                        },
                                        Ba5: {
                                          move: "Ba5",
                                          children: {
                                            b4: {
                                              move: "b4",
                                              explanation: "La Variante Suisse. Prenez en d4 (cxd4).",
                                              arrows: [["c5", "d4"]],
                                              children: {
                                                cxd4: {
                                                  move: "cxd4",
                                                  children: {
                                                    Nb5: {
                                                      move: "Nb5",
                                                      explanation: "Il s'infiltre. Repliez votre Fou en c7.",
                                                      arrows: [["a5", "c7"]],
                                                      children: {
                                                        Bc7: {
                                                          move: "Bc7",
                                                          explanation: "🎉 Variante terminée ! Tension extrême, les Blancs chercheront à exploiter les cases noires."
                                                        }
                                                      }
                                                    },
                                                    Qg4: {
                                                      move: "Qg4",
                                                      explanation: "Il attaque l'aile Roi. Défendez indirectement avec Ce7.",
                                                      arrows: [["g8", "e7"]],
                                                      children: {
                                                        Ne7: {
                                                          move: "Ne7",
                                                          explanation: "🎉 Variante terminée ! Position hautement dynamique et tactique."
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        },
                                        "Bxc3+": {
                                          move: "Bxc3+",
                                          children: {
                                            bxc3: {
                                              move: "bxc3",
                                              explanation: "Il reprend. La structure blanche est abîmée. Développez Ce7 pour fermer la diagonale et préparer Qc7.",
                                              arrows: [["g8", "e7"]],
                                              children: {
                                                Ne7: {
                                                  move: "Ne7",
                                                  children: {
                                                    Qg4: {
                                                      move: "Qg4",
                                                      explanation: "L'ordinateur vise g7 ! Sortez la Dame en c7, ignorant délibérément la menace. Bienvenue dans le Pion Empoisonné !",
                                                      arrows: [["d8", "c7"]],
                                                      children: {
                                                        Qc7: {
                                                          move: "Qc7",
                                                          children: {
                                                            "Qxg7": {
                                                              move: "Qxg7",
                                                              explanation: "Il accepte le pion empoisonné. La tour est attaquée, glissez-la en g8.",
                                                              arrows: [["h8", "g8"]],
                                                              children: {
                                                                Rg8: {
                                                                  move: "Rg8",
                                                                  children: {
                                                                    "Qxh7": {
                                                                      move: "Qxh7",
                                                                      explanation: "Il détruit votre aile Roi, mais vous dominez le centre. Prenez d4 (cxd4).",
                                                                      arrows: [["c5", "d4"]],
                                                                      children: {
                                                                        cxd4: {
                                                                          move: "cxd4",
                                                                          children: {
                                                                            Ne2: {
                                                                              move: "Ne2",
                                                                              explanation: "Il prépare son développement. Sortez le Cavalier c6 pour accentuer la pression.",
                                                                              arrows: [["b8", "c6"]],
                                                                              children: {
                                                                                Nbc6: {
                                                                                  move: "Nbc6",
                                                                                  children: {
                                                                                    f4: {
                                                                                      move: "f4",
                                                                                      explanation: "Il tente de verrouiller. Placez votre Fou en d7 pour soutenir le futur grand roque.",
                                                                                      arrows: [["c8", "d7"]],
                                                                                      children: {
                                                                                        Bd7: {
                                                                                          move: "Bd7",
                                                                                          children: {
                                                                                            Qd3: {
                                                                                              move: "Qd3",
                                                                                              explanation: "La Dame blanche s'enfuit. Mettez votre Roi à l'abri avec le grand roque (O-O-O).",
                                                                                              arrows: [["e8", "c8"]],
                                                                                              children: {
                                                                                                "O-O-O": {
                                                                                                  move: "O-O-O",
                                                                                                  explanation: "🎉 Variante terminée ! Le chef-d'œuvre de la Winawer. Les Blancs ont deux pions d'avance, mais votre attaque au centre et sur la colonne g est dévastatrice."
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
            }
          }
        }
      }
    }
  }
};

export const frenchCourse: OpeningCourse = {
  id: "french",
  name: "Défense Française",
  description: "Contrez 1.e4 avec une structure de pions en roc. Apprenez à bloquer le centre avant de lancer des contre-attaques foudroyantes.",
  chapters: [
    {
      id: "french-c02",
      name: "La Variante d'Avance",
      root: frenchC02Root,
    },
    {
      id: "french-c01",
      name: "La Variante d'Échange",
      root: frenchC01Root,
    },
    {
      id: "french-c00",
      name: "L'Attaque Est-Indienne",
      root: frenchC00Root,
    },
    {
      id: "french-tarrasch",
      name: "La Variante Tarrasch",
      root: frenchTarraschRoot,
    }, 
    {
      id: "french-classical",
      name: "La Variante Classique",
      root: frenchClassicalRoot,
    },
    {
      id: "french-winawer",
      name: "La Variante Winawer",
      root: frenchWinawerRoot,
    }
  ],
};