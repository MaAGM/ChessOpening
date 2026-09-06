import type { OpeningCourse, OpeningChapter, TutorialNode } from "./types";

// Caro-Kann – B12 (Variante d'Avance) : 1. e4 c6 2. d4 d5 3. e5 Bf5 4. Nf3 e6
const carokannB12Root: TutorialNode = {
  children: {
    e4: {
      move: "e4",
      explanation: "L'ordinateur ouvre par 1. e4. Préparez la solide Défense Caro-Kann en jouant c6 pour soutenir la poussée d5.",
      arrows: [["c7", "c6"]],
      children: {
        c6: {
          move: "c6",
          // Nœud fantôme (Coup du joueur)
          children: {
            d4: {
              move: "d4",
              explanation: "Les Blancs s'emparent logiquement du centre. Frappez immédiatement avec d5.",
              arrows: [["d7", "d5"]],
              children: {
                d5: {
                  move: "d5",
                  // Nœud fantôme
                  children: {
                    e5: {
                      move: "e5",
                      explanation: "La Variante d'Avance ! Les Blancs ferment le centre. C'est l'idée maîtresse de la Caro-Kann : sortez votre Fou de cases claires (Bf5) AVANT de jouer e6.",
                      arrows: [["c8", "f5"]],
                      children: {
                        Bf5: {
                          move: "Bf5",
                          // Nœud fantôme
                          children: {
                            Nf3: {
                              move: "Nf3",
                              explanation: "Ils développent leur cavalier. Votre fou étant sauvé à l'extérieur, vous pouvez maintenant fermer sereinement votre chaîne de pions avec e6.",
                              arrows: [["e7", "e6"]],
                              children: {
                                e6: {
                                  move: "e6",
                                  explanation: "Parfait ! Le fameux 'Fou de la Caro-Kann' est actif, contrairement à la Française. Prochaines étapes : saper leur centre avec c5 et développer le cavalier en e7 puis c6.",
                                  // Flèches prospectives de plans de milieu de jeu
                                  arrows: [["c6", "c5"], ["g8", "e7"], ["b8", "d7"]]
                                }
                              }
                            }
                          }
                        }
                      }
                    }
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

// Caro-Kann – B13 (Variante d'Échange) : 1. e4 c6 2. d4 d5 3. exd5 cxd5 4. Bd3 Nc6 5. c3
const carokannB13Root: TutorialNode = {
  children: {
    e4: {
      move: "e4",
      explanation: "L'ordinateur ouvre par 1. e4. Entrez dans la Caro-Kann avec c6.",
      arrows: [["c7", "c6"]],
      children: {
        c6: {
          move: "c6",
          // Nœud fantôme
          children: {
            d4: {
              move: "d4",
              explanation: "Les Blancs prennent le centre. Contestez ce contrôle avec d5.",
              arrows: [["d7", "d5"]],
              children: {
                d5: {
                  move: "d5",
                  // Nœud fantôme
                  children: {
                    exd5: {
                      move: "exd5",
                      explanation: "La Variante d'Échange ! L'ordinateur relâche la tension centrale. Reprenez du pion 'c' pour ouvrir la colonne c et maintenir une symétrie au centre.",
                      arrows: [["c6", "d5"]],
                      children: {
                        cxd5: {
                          move: "cxd5",
                          // Nœud fantôme
                          children: {
                            Bd3: {
                              move: "Bd3",
                              explanation: "Ils placent leur Fou sur une diagonale active pour vous empêcher de sortir votre Fou en f5. Développez votre Cavalier en c6 pour contrôler d4 et e5.",
                              arrows: [["b8", "c6"]],
                              children: {
                                Nc6: {
                                  move: "Nc6",
                                  // Nœud fantôme
                                  children: {
                                    c3: {
                                      move: "c3",
                                      explanation: "Les Blancs solidifient d4 et limitent votre cavalier. Vous avez atteint la position clé. Votre plan : sortir votre fou de cases claires en g4 et installer une structure solide.",
                                      // Flèches prospectives (Développement classique)
                                      arrows: [["g8", "f6"], ["c8", "g4"]]
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
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

export const carokannCourse: OpeningCourse = {
  id: "caro_kann",
  name: "Défense Caro-Kann",
  description: "Extrêmement solide. Développez intelligemment vos pièces avant de contre-attaquer la structure blanche.",
  chapters: [
    { id: "caro_kann-b12", name: "Variante d'Avance", root: carokannB12Root },
    { id: "caro_kann-b13", name: "Variante d'Échange", root: carokannB13Root },
  ],
};