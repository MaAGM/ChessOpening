import type { OpeningCourse, OpeningChapter, TutorialNode } from "./types";

// London System – Classical (D02) : 1. d4 d5 2. Bf4 Nf6 3. e3 c6 4. Nf3
const londonSystemRoot: TutorialNode = {
  explanation: "Le Système de Londres. Une ouverture ultra-solide et redoutable. Commencez par prendre le centre avec d4.",
  arrows: [["d2", "d4"]],
  children: {
    d4: {
      move: "d4",
      // Nœud fantôme (Coup du joueur)
      children: {
        d5: {
          move: "d5",
          explanation: "Les Noirs répondent symétriquement. C'est le moment de définir le système : sortez immédiatement votre Fou en f4, en dehors de votre future chaîne de pions.",
          arrows: [["c1", "f4"]],
          children: {
            Bf4: {
              move: "Bf4",
              // Nœud fantôme
              children: {
                Nf6: {
                  move: "Nf6",
                  explanation: "Ils développent logiquement leur cavalier. Maintenant que votre Fou est à l'extérieur, verrouillez votre structure centrale avec e3.",
                  arrows: [["e2", "e3"]],
                  children: {
                    e3: {
                      move: "e3",
                      // Nœud fantôme
                      children: {
                        c6: {
                          move: "c6",
                          explanation: "Les Noirs consolident d5 (structure de type Slave). Poursuivez votre développement naturel en sortant votre cavalier en f3.",
                          arrows: [["g1", "f3"]],
                          children: {
                            Nf3: {
                              move: "Nf3",
                              explanation: "Parfait ! La base du Système de Londres est posée. Vos prochaines étapes : compléter la fameuse 'pyramide' avec c3, développer le Fou en d3 et le Cavalier en d2, puis roquer.",
                              // Flèches prospectives de la structure en pyramide du Londres
                              arrows: [["c2", "c3"], ["f1", "d3"], ["b1", "d2"]]
                            }
                          }
                        }
                      }
                    }
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

export const londonSystemCourse: OpeningCourse = {
  id: "london_system",
  name: "Système de Londres",
  description: "Bâtissez une forteresse infranchissable au centre et étouffez lentement votre adversaire.",
  chapters: [
    {
      id: "london_system-d02",
      name: "Système de Londres (Classique)",
      root: londonSystemRoot,
    },
  ],
};