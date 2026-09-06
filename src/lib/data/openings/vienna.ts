import type { OpeningCourse, OpeningChapter, TutorialNode } from "./types";

// Vienna – C25 : 1. e4 e5 2. Nc3 Nf6 3. Bc4 Bc5
const viennaRoot: TutorialNode = {
  explanation: "La Partie Viennoise. Développez-vous solidement avant de lancer des attaques féroces. Prenez le centre avec e4.",
  arrows: [["e2", "e4"]],
  children: {
    e4: {
      move: "e4",
      // Nœud fantôme (Coup du joueur)
      children: {
        e5: {
          move: "e5",
          explanation: "Les Noirs répondent symétriquement. Au lieu du classique Cf3, développez votre cavalier Dame en c3 pour blinder e4 et garder f4 ouvert.",
          arrows: [["b1", "c3"]],
          children: {
            Nc3: {
              move: "Nc3",
              // Nœud fantôme
              children: {
                Nf6: {
                  move: "Nf6",
                  explanation: "Ils développent leur cavalier Roi. Poursuivez votre développement actif en braquant votre Fou de cases claires sur f7 (Fc4).",
                  arrows: [["f1", "c4"]],
                  children: {
                    Bc4: {
                      move: "Bc4",
                      // Nœud fantôme
                      children: {
                        Bc5: {
                          move: "Bc5",
                          explanation: "Les Noirs copient votre placement (Variante Symétrique). La position de base est atteinte ! Votre plan : solidifier avec d3, développer tranquillement (Cge2, O-O), ou lancer le terrible Gambit Viennois retardé avec f4.",
                          // Flèches prospectives de plan de jeu
                          arrows: [["d2", "d3"], ["f2", "f4"]]
                        }
                      }
                    }
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

export const viennaCourse: OpeningCourse = {
  id: "vienna",
  name: "Partie Viennoise",
  description: "Gardez la flexibilité de votre pion f et préparez des attaques surprises tout en conservant un centre impénétrable.",
  chapters: [
    {
      id: "vienna-c25",
      name: "Variante Symétrique",
      root: viennaRoot,
    },
  ],
};