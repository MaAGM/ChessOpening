import type { OpeningCourse, OpeningChapter, TutorialNode } from "./types";

// Scotch – C45 : 1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Nxd4 Nf6 5. Nxc6
const scotchRoot: TutorialNode = {
  explanation: "La Partie Écossaise. Fuyez la théorie de l'Espagnole ou de l'Italienne en dynamitant le centre dès le 3ème coup.",
  arrows: [["e2", "e4"]],
  children: {
    e4: {
      move: "e4",
      // Nœud fantôme (Coup du joueur)
      children: {
        e5: {
          move: "e5",
          explanation: "Les Noirs répondent classiquement. Développez votre cavalier Roi avec tempo sur le pion e5.",
          arrows: [["g1", "f3"]],
          children: {
            Nf3: {
              move: "Nf3",
              // Nœud fantôme
              children: {
                Nc6: {
                  move: "Nc6",
                  explanation: "Ils défendent. C'est ici que l'Écossaise se révèle : n'attendez pas et brisez immédiatement le centre avec d4 !",
                  arrows: [["d2", "d4"]],
                  children: {
                    d4: {
                      move: "d4",
                      // Nœud fantôme
                      children: {
                        exd4: {
                          move: "exd4",
                          explanation: "L'échange est quasiment forcé. Récupérez le pion en centralisant puissamment votre cavalier (Cxd4).",
                          arrows: [["f3", "d4"]],
                          children: {
                            Nxd4: {
                              move: "Nxd4",
                              // Nœud fantôme
                              children: {
                                Nf6: {
                                  move: "Nf6",
                                  explanation: "Les Noirs contre-attaquent votre pion e4. Détériorez leur structure en échangeant votre cavalier en c6.",
                                  arrows: [["d4", "c6"]],
                                  children: {
                                    Nxc6: {
                                      move: "Nxc6",
                                      explanation: "Boum ! Vous forcez les pions noirs à se doubler sur la colonne 'c'. Le jeu est ouvert. Vos prochaines armes : pousser agressivement e5 pour chasser leur cavalier, ou défendre e4 calmement (ex: Fd3 ou Fg5).",
                                      // Flèches prospectives de plan d'attaque et de développement
                                      arrows: [["e4", "e5"], ["f1", "d3"], ["c1", "g5"]]
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
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

export const scotchCourse: OpeningCourse = {
  id: "scotch",
  name: "Partie Écossaise",
  description: "Ouvrez la position de force dès le 3ème coup pour surprendre votre adversaire et créer des déséquilibres immédiats.",
  chapters: [
    {
      id: "scotch-c45",
      name: "Ligne Principale (C45)",
      root: scotchRoot,
    },
  ],
};