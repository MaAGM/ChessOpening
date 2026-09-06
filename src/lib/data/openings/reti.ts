import type { OpeningCourse, OpeningChapter, TutorialNode } from "./types";

// Reti – A04 : 1. Nf3 d5 2. c4
const retiA04Root: TutorialNode = {
  explanation: "L'Ouverture Réti. Une approche hypermoderne et subtile. Contrôlez le centre à distance en développant d'abord votre cavalier.",
  arrows: [["g1", "f3"]],
  children: {
    Nf3: {
      move: "Nf3",
      // Nœud fantôme (Coup du joueur)
      children: {
        d5: {
          move: "d5",
          explanation: "Les Noirs occupent classiquement le centre avec un pion massif. Attaquez immédiatement cette base par le flanc en jouant c4.",
          arrows: [["c2", "c4"]],
          children: {
            c4: {
              move: "c4",
              explanation: "Excellent ! Vous mettez une forte pression asymétrique sur d5. La position est tendue. Vos prochains plans typiques de la Réti : fianchetter votre Fou pour rayonner sur la grande diagonale (g3 puis Fg2).",
              // Flèches prospectives de plan de jeu (Le fianchetto caractéristique)
              arrows: [["g2", "g3"], ["f1", "g2"]]
            }
          }
        }
      }
    }
  }
};

export const retiCourse: OpeningCourse = {
  id: "reti",
  name: "Ouverture Réti",
  description: "Une ouverture hypermoderne tout en souplesse. Attaquez le centre par les flancs sans vous y engager prématurément.",
  chapters: [
    {
      id: "reti-a04",
      name: "Ligne Principale (A04)",
      root: retiA04Root,
    },
  ],
};