import type { OpeningCourse, OpeningChapter, TutorialNode } from "./types";

// Scandinavian – B01 : 1. e4 d5 2. exd5 Qxd5 3. Nc3 Qa5
const scandinavianB01Root: TutorialNode = {
  explanation: "La Défense Scandinave. Provoquez l'adversaire et dictez le rythme dès le premier coup. Préparez-vous, l'ordinateur va jouer avec les Blancs...",
  children: {
    e4: {
      move: "e4",
      explanation: "L'ordinateur ouvre par 1. e4. Contestez immédiatement ce pion central en jetant votre propre pion en d5 !",
      arrows: [["d7", "d5"]],
      children: {
        d5: {
          move: "d5",
          // Nœud fantôme (Coup du joueur)
          children: {
            exd5: {
              move: "exd5",
              explanation: "Les Blancs acceptent le défi et capturent. Récupérez le pion en centralisant prématurément, mais puissamment, votre Dame.",
              arrows: [["d8", "d5"]],
              children: {
                Qxd5: {
                  move: "Qxd5",
                  // Nœud fantôme
                  children: {
                    Nc3: {
                      move: "Nc3",
                      explanation: "Ils développent leur cavalier avec gain de tempo en attaquant votre Dame. Repliez-la en sécurité sur la case stratégique a5.",
                      arrows: [["d5", "a5"]],
                      children: {
                        Qa5: {
                          move: "Qa5",
                          explanation: "Parfait ! La Dame est en sécurité en a5, gardant un œil sur le centre. Vos prochaines étapes : développer le cavalier (Cf6), jouer c6 pour offrir une case de repli à la Dame (c7 ou d8), et sortir votre Fou (Ff5 ou Fg4).",
                          // Flèches prospectives de développement scandinave
                          arrows: [["g8", "f6"], ["c7", "c6"], ["c8", "f5"]]
                        }
                      }
                    }
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

export const scandinavianCourse: OpeningCourse = {
  id: "scandinavian",
  name: "Défense Scandinave",
  description: "Sortez votre Dame très tôt pour forcer le jeu dans des schémas asymétriques et dynamiques.",
  chapters: [
    {
      id: "scandinavian-b01",
      name: "Ligne Principale (Qa5)",
      root: scandinavianB01Root,
    },
  ],
};