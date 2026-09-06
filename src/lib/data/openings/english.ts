import type { OpeningCourse, OpeningChapter, TutorialNode } from "./types";

// Anglaise – A20 (Sicilienne Inversée) : 1. c4 e5 2. Nc3 Nf6 3. g3
const englishA20Root: TutorialNode = {
  explanation: "L'Anglaise - Sicilienne Inversée. Démarrez en contrôlant le centre depuis le flanc avec c4.",
  arrows: [["c2", "c4"]],
  children: {
    c4: {
      move: "c4",
      // Nœud fantôme (Coup du joueur)
      children: {
        e5: {
          move: "e5",
          explanation: "Les Noirs répondent par e5, créant une structure de 'Sicilienne Inversée'. Solidifiez votre pion c4 et contrôlez la case d5 en développant votre cavalier en c3.",
          arrows: [["b1", "c3"]],
          children: {
            Nc3: {
              move: "Nc3",
              // Nœud fantôme
              children: {
                Nf6: {
                  move: "Nf6",
                  explanation: "Ils développent leur cavalier vers le centre. Continuez votre plan positionnel : préparez le fianchetto de votre Fou de cases claires avec g3.",
                  arrows: [["g2", "g3"]],
                  children: {
                    g3: {
                      move: "g3",
                      explanation: "Parfait ! La base de l'Anglaise est posée. Vos prochaines étapes : placer le Fou en g2, consolider avec d3, et initier des manœuvres de pression sur l'aile Dame.",
                      // Flèches prospectives de plan de jeu (Fianchetto et expansion)
                      arrows: [["f1", "g2"], ["d2", "d3"], ["b2", "b4"]]
                    }
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

// Anglaise – A30 (Symétrique) : 1. c4 c5 2. Nf3 Nf6 3. g3 g6
const englishA30Root: TutorialNode = {
  explanation: "L'Anglaise Symétrique. Prenez le contrôle de d5 tout en gardant une grande flexibilité de développement avec c4.",
  arrows: [["c2", "c4"]],
  children: {
    c4: {
      move: "c4",
      // Nœud fantôme
      children: {
        c5: {
          move: "c5",
          explanation: "Les Noirs optent pour l'Anglaise Symétrique. Gardez un jeu flexible et développez d'abord votre cavalier Roi en f3.",
          arrows: [["g1", "f3"]],
          children: {
            Nf3: {
              move: "Nf3",
              // Nœud fantôme
              children: {
                Nf6: {
                  move: "Nf6",
                  explanation: "La symétrie continue. Ne vous pressez pas au centre, commencez sereinement la préparation de votre fianchetto avec g3.",
                  arrows: [["g2", "g3"]],
                  children: {
                    g3: {
                      move: "g3",
                      // Nœud fantôme
                      children: {
                        g6: {
                          move: "g6",
                          explanation: "Ils copient votre stratégie de fianchetto. La tension centrale va s'accentuer. Terminez votre développement (Fg2, O-O) et préparez la poussée d4 pour briser la symétrie à votre avantage !",
                          // Flèches prospectives pour achever le développement et frapper au centre
                          arrows: [["f1", "g2"], ["e1", "g1"], ["d2", "d4"]]
                        }
                      }
                    }
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

export const englishCourse: OpeningCourse = {
  id: "english",
  name: "Ouverture Anglaise",
  description: "Contrôlez le centre par les flancs. Une ouverture flexible, positionnelle et hautement stratégique.",
  chapters: [
    {
      id: "english-a20",
      name: "Sicilienne Inversée",
      root: englishA20Root,
    },
    {
      id: "english-a30",
      name: "Anglaise Symétrique",
      root: englishA30Root,
    },
  ],
};