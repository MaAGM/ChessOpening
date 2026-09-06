import type { OpeningCourse, OpeningChapter, TutorialNode } from "./types";

// Ruy Lopez – Berlin Defense (C65) : 1. e4 e5 2. Nf3 Nc6 3. Bb5 Nf6 4. O-O Nxe4 5. d4
const ruyLopezBerlinRoot: TutorialNode = {
  explanation: "L'Ouverture Espagnole (Ruy Lopez). Prenez le centre immédiatement avec d4 pour dicter le jeu.",
  arrows: [["e2", "e4"]],
  children: {
    e4: {
      move: "e4",
      // Nœud fantôme (Coup du joueur)
      children: {
        e5: {
          move: "e5",
          explanation: "Les Noirs répondent symétriquement. Développez votre cavalier avec tempo pour attaquer e5.",
          arrows: [["g1", "f3"]],
          children: {
            Nf3: {
              move: "Nf3",
              // Nœud fantôme
              children: {
                Nc6: {
                  move: "Nc6",
                  explanation: "Ils défendent. Sortez votre Fou sur la case la plus agressive (b5) pour menacer le défenseur de e5.",
                  arrows: [["f1", "b5"]],
                  children: {
                    Bb5: {
                      move: "Bb5",
                      // Nœud fantôme
                      children: {
                        Nf6: {
                          move: "Nf6",
                          explanation: "La fameuse Défense de Berlin ! Ils ignorent votre menace et contre-attaquent e4. Ne défendez pas le pion : mettez d'abord votre Roi à l'abri avec le petit roque.",
                          arrows: [["e1", "g1"]],
                          children: {
                            "O-O": {
                              move: "O-O",
                              // Nœud fantôme
                              children: {
                                Nxe4: {
                                  move: "Nxe4",
                                  explanation: "Ils capturent e4. Poursuivez l'initiative en dynamitant le centre avec d4 pour ouvrir les lignes sur leur Roi non roqué.",
                                  arrows: [["d2", "d4"]],
                                  children: {
                                    d4: {
                                      move: "d4",
                                      explanation: "C'est la position critique du 'Mur de Berlin'. Si les Noirs jouent Cd6 (pour chasser votre Fou), préparez-vous à récupérer votre pion et entrer dans une finale technique très réputée. Vos coups clés : Fxc6, dxe5 et Te1.",
                                      // Flèches prospectives du plan contre la Berlin
                                      arrows: [["b5", "c6"], ["d4", "e5"], ["f1", "e1"]]
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
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

// Ruy Lopez – Morphy Defense (C78) : 1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7
const ruyLopezMorphyRoot: TutorialNode = {
  explanation: "L'Ouverture Espagnole. Ouvrez avec e4.",
  arrows: [["e2", "e4"]],
  children: {
    e4: {
      move: "e4",
      // Nœud fantôme
      children: {
        e5: {
          move: "e5",
          explanation: "Développez le cavalier et attaquez e5.",
          arrows: [["g1", "f3"]],
          children: {
            Nf3: {
              move: "Nf3",
              // Nœud fantôme
              children: {
                Nc6: {
                  move: "Nc6",
                  explanation: "Placez votre Fou en b5 pour mettre la pression sur le cavalier noir.",
                  arrows: [["f1", "b5"]],
                  children: {
                    Bb5: {
                      move: "Bb5",
                      // Nœud fantôme
                      children: {
                        a6: {
                          move: "a6",
                          explanation: "La Défense Morphy. Ils forcent une décision pour votre Fou. Plutôt que de l'échanger, reculez-le en a4 pour maintenir la pression sur la diagonale.",
                          arrows: [["b5", "a4"]],
                          children: {
                            Ba4: {
                              move: "Ba4",
                              // Nœud fantôme
                              children: {
                                Nf6: {
                                  move: "Nf6",
                                  explanation: "Ils développent leur cavalier et attaquent e4. Comme dans la Berlin, sécurisez votre Roi avec le roque avant de réagir.",
                                  arrows: [["e1", "g1"]],
                                  children: {
                                    "O-O": {
                                      move: "O-O",
                                      // Nœud fantôme
                                      children: {
                                        Be7: {
                                          move: "Be7",
                                          explanation: "Les Noirs se préparent à roquer (L'Espagnole Fermée). L'ordinateur vient de jouer Fe7 et le chapitre s'achève ici. Votre plan à long terme : défendre e4 avec Te1, jouer c3 pour replier le Fou en c2, et pousser d4.",
                                          // Flèches prospectives pour la manœuvre espagnole classique
                                          arrows: [["f1", "e1"], ["c2", "c3"], ["d2", "d4"]]
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
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

export const ruyLopezCourse: OpeningCourse = {
  id: "ruy_lopez",
  name: "Ouverture Espagnole (Ruy Lopez)",
  description: "L'une des ouvertures les plus riches des échecs. Mettez une pression constante sur le centre noir.",
  chapters: [
    { 
      id: "ruy_lopez-c65", 
      name: "Défense de Berlin", 
      root: ruyLopezBerlinRoot 
    },
    { 
      id: "ruy_lopez-c78", 
      name: "Défense Morphy", 
      root: ruyLopezMorphyRoot 
    },
  ],
};