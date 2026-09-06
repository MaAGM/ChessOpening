import type { OpeningCourse, OpeningChapter, TutorialNode } from "./types";

// Queens Gambit – Accepted (D20) : 1. d4 d5 2. c4 dxc4 3. Nf3 Nf6 4. e3 e6 5. Bxc4
const queensGambitAcceptedRoot: TutorialNode = {
  explanation: "Le Gambit Dame. Prenez un contrôle fort du centre en ouvrant avec le pion d4.",
  arrows: [["d2", "d4"]],
  children: {
    d4: {
      move: "d4",
      // Nœud fantôme (Coup du joueur)
      children: {
        d5: {
          move: "d5",
          explanation: "Les Noirs répondent symétriquement. Proposez immédiatement le gambit en jouant c4 pour miner leur pion central.",
          arrows: [["c2", "c4"]],
          children: {
            c4: {
              move: "c4",
              // Nœud fantôme
              children: {
                dxc4: {
                  move: "dxc4",
                  explanation: "Le Gambit Dame Accepté ! Ils prennent le pion. Ne vous précipitez pas pour le récupérer : développez d'abord votre cavalier en f3 pour empêcher la poussée e5.",
                  arrows: [["g1", "f3"]],
                  children: {
                    Nf3: {
                      move: "Nf3",
                      // Nœud fantôme
                      children: {
                        Nf6: {
                          move: "Nf6",
                          explanation: "Ils développent leur cavalier vers le centre. Préparez la récupération de votre pion c4 en ouvrant la diagonale de votre Fou de cases claires avec e3.",
                          arrows: [["e2", "e3"]],
                          children: {
                            e3: {
                              move: "e3",
                              // Nœud fantôme
                              children: {
                                e6: {
                                  move: "e6",
                                  explanation: "Les Noirs consolident leur structure. C'est le moment : récupérez votre pion investi en capturant en c4 avec votre Fou.",
                                  arrows: [["f1", "c4"]],
                                  children: {
                                    Bxc4: {
                                      move: "Bxc4",
                                      explanation: "Excellent ! Vous avez récupéré votre pion tout en développant une pièce activement. Vos prochains plans : roquer (O-O), développer le cavalier (Cc3) et dominer le centre.",
                                      // Flèches prospectives de plan de jeu (Roque et développement)
                                      arrows: [["e1", "g1"], ["b1", "c3"]]
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
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

// Queens Gambit – Refused (D30) : 1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5
const queensGambitRefusedRoot: TutorialNode = {
  explanation: "Le Gambit Dame. Ouvrez avec d4 pour revendiquer l'espace central.",
  arrows: [["d2", "d4"]],
  children: {
    d4: {
      move: "d4",
      // Nœud fantôme
      children: {
        d5: {
          move: "d5",
          explanation: "Les Noirs contestent le centre. Attaquez immédiatement la base de leur structure avec le sacrifice temporaire c4.",
          arrows: [["c2", "c4"]],
          children: {
            c4: {
              move: "c4",
              // Nœud fantôme
              children: {
                e6: {
                  move: "e6",
                  explanation: "Le Gambit Dame Refusé. Les Noirs maintiennent une structure de pions solide en d5. Augmentez la pression sur ce point central en développant votre cavalier en c3.",
                  arrows: [["b1", "c3"]],
                  children: {
                    Nc3: {
                      move: "Nc3",
                      // Nœud fantôme
                      children: {
                        Nf6: {
                          move: "Nf6",
                          explanation: "Ils défendent d5 avec leur cavalier. Clouez immédiatement ce défenseur vital en sortant votre Fou en g5 pour créer des menaces indirectes.",
                          arrows: [["c1", "g5"]],
                          children: {
                            Bg5: {
                              move: "Bg5",
                              explanation: "Le clouage est en place ! La pression sur le centre noir est immense. Vos prochaines étapes : consolider avec e3, développer le cavalier g1 vers f3, puis accentuer la pression.",
                              // Flèches prospectives de développement
                              arrows: [["e2", "e3"], ["g1", "f3"]]
                            }
                          }
                        }
                      }
                    }
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

export const queens_gambitCourse: OpeningCourse = {
  id: "queens_gambit",
  name: "Gambit Dame",
  description: "L'ouverture classique par excellence. Dominez le centre en offrant un pion empoisonné sur l'aile Dame.",
  chapters: [
    { 
      id: "queens_gambit-d20", 
      name: "Gambit Dame Accepté", 
      root: queensGambitAcceptedRoot 
    },
    { 
      id: "queens_gambit-d30", 
      name: "Gambit Dame Refusé", 
      root: queensGambitRefusedRoot 
    },
  ],
};