import type { OpeningCourse, OpeningChapter, TutorialNode } from "./types";

// Kings Gambit – C33 : 1. e4 e5 2. f4 exf4 3. Nf3 g5
const kingsGambitRoot: TutorialNode = {
  explanation: "Le légendaire Gambit du Roi ! Plongez l'adversaire dans le chaos dès le deuxième coup. Commencez par prendre le centre avec e4.",
  arrows: [["e2", "e4"]],
  children: {
    e4: {
      move: "e4",
      // Nœud fantôme (Coup du joueur)
      children: {
        e5: {
          move: "e5",
          explanation: "Les Noirs répondent classiquement. Déclenchez la tempête : sacrifiez immédiatement votre pion f4 pour miner leur centre et ouvrir la colonne f !",
          arrows: [["f2", "f4"]],
          children: {
            f4: {
              move: "f4",
              // Nœud fantôme
              children: {
                exf4: {
                  move: "exf4",
                  explanation: "Gambit accepté ! L'échiquier s'enflamme. Vous devez absolument empêcher l'échec mortel de la Dame noire en h4 (Dh4+). Sortez vite votre cavalier pour contrôler cette case.",
                  arrows: [["g1", "f3"]],
                  children: {
                    Nf3: {
                      move: "Nf3",
                      // Nœud fantôme
                      children: {
                        g5: {
                          move: "g5",
                          explanation: "Ils s'accrochent à leur pion de plus avec les dents et menacent de chasser votre cavalier (g4). La guerre est déclarée ! Vos prochaines armes : miner leur chaîne avec h4 ou pointer votre Fou sur f7 (Fc4).",
                          // Flèches prospectives de plan d'attaque
                          arrows: [["h2", "h4"], ["f1", "c4"]]
                        }
                      }
                    }
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

export const kings_gambitCourse: OpeningCourse = {
  id: "kings_gambit",
  name: "Gambit du Roi",
  description: "Sacrifiez un pion dès le 2ème coup pour obtenir une attaque dévastatrice et un centre massif.",
  chapters: [
    {
      id: "kings_gambit-c33",
      name: "Gambit Roi Accepté",
      root: kingsGambitRoot,
    },
  ],
};