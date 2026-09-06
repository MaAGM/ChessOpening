import type { OpeningCourse, OpeningChapter, TutorialNode } from "./types";

// Trompowsky – A45 : 1. d4 Nf6 2. Bg5 Ne4 3. Bf4
const trompowskyA45Root: TutorialNode = {
  explanation: "L'Attaque Trompowsky. Surprenez votre adversaire en évitant les lourdes théories de l'Est-Indienne ou de la Grünfeld. Ouvrez avec d4.",
  arrows: [["d2", "d4"]],
  children: {
    d4: {
      move: "d4",
      // Nœud fantôme (Coup du joueur)
      children: {
        Nf6: {
          move: "Nf6",
          explanation: "Les Noirs développent classiquement leur cavalier. Sortez immédiatement des sentiers battus en agressant ce cavalier avec votre Fou en g5 !",
          arrows: [["c1", "g5"]],
          children: {
            Bg5: {
              move: "Bg5",
              // Nœud fantôme
              children: {
                Ne4: {
                  move: "Ne4",
                  explanation: "Ils choisissent la réponse la plus critique : ils contre-attaquent votre Fou tout en centralisant leur cavalier. Repliez sagement le Fou en f4.",
                  arrows: [["g5", "f4"]],
                  children: {
                    Bf4: {
                      move: "Bf4",
                      explanation: "La position de base est atteinte ! Votre Fou est actif et le cavalier noir en e4 peut vite devenir une cible. Vos prochains plans : consolider avec e3, développer le cavalier (Cd2), ou chasser l'intrus avec f3.",
                      // Flèches prospectives de plan de jeu (Développement et expulsion du cavalier)
                      arrows: [["e2", "e3"], ["b1", "d2"], ["f2", "f3"]]
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

export const trompowskyCourse: OpeningCourse = {
  id: "trompowsky",
  name: "Attaque Trompowsky",
  description: "Ciblez immédiatement le cavalier adverse au 2ème coup pour imposer votre propre type de position.",
  chapters: [
    {
      id: "trompowsky-a45",
      name: "Ligne Principale (Ne4)",
      root: trompowskyA45Root,
    },
  ],
};