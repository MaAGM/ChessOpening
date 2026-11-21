// Brouillon de la Masterclass « Défense Pirc » (côté Noirs) : 1.e4 d6 2.d4 Nf6 3.Nc3 g6.
// Répertoire : la Classique 4.Nf3 (…Bg4 et …c6), l'Autrichienne 4.f4 (…O-O avec …Na6, …c5 et 6.e5),
// l'attaque 150 4.Be3 (…c6 et …b5), les systèmes 4.Bg5, 4.g3 et 4.Be2, et la défense Lion 3…Nbd7.
// Les flèches du coup à jouer sont ajoutées par scripts/course-builder.mjs ; celles écrites ici
// illustrent une idée (cible, manœuvre, menace).
import { TRAPS } from "./pirc-traps.mjs";

const P = "1. e4 d6 2. d4 Nf6 3. Nc3 g6";

export default {
  id: "pirc",
  name: "Défense Pirc",
  description:
    "1.e4 d6 2.d4 Nf6 3.Nc3 g6 : une défense hypermoderne qui laisse le centre aux Blancs pour mieux le contester. Un répertoire complet côté Noirs contre la Classique, l'Autrichienne, l'attaque 150 et les systèmes secondaires, avec la défense Lion, pièges et grandes lignes.",
  side: "black",
  eco: ["B07", "B08", "B09"],
  chapters: [
    // =====================================================================================
    {
      title: "Les fondations",
      summary:
        "Le schéma …d6, …Nf6, …g6, la Classique avec …Bg4, l'Autrichienne avec …Na6 et l'attaque 150 avec …c6 et …b5.",
      stage: "foundations",
      lessons: [
        {
          title: "Le schéma Pirc : …d6, …Nf6 et …g6",
          eco: "B07",
          kind: "concept",
          objectives: [
            "Attaquer e4 par …Nf6 avant de fianchetter",
            "Placer le fou f8 en g7 contre le centre blanc",
            "Reconnaître les quatre grands systèmes blancs",
          ],
          pgn: `{La Pirc laisse les Blancs construire le centre e4-d4. Vous développez vite le roi à l'abri, puis vous frappez ce centre par …c5, …e5 ou …c6 et …b5.}
1. e4 d6 2. d4
(2. Nc3 Nf6 3. d4 g6 {Le même schéma est atteint par interversion.})
2... Nf6 {Le cavalier attaque e4 et oblige les Blancs à le défendre. [%cal Gf6e4]}
3. Nc3 g6 {Le fou f8 ira en g7 pour viser le pion d4. [%cal Gf8g7]}
4. Nf3
(4. f4 Bg7 {Contre l'Autrichienne, le fou g7 surveille déjà la diagonale a1-h8.})
(4. Be3 c6 {Contre l'attaque 150, …c6 prépare …b5 avant de fixer le fou.})
(4. Bg5 Bg7 {Le fou blanc g5 ne gêne pas le fianchetto.})
4... Bg7 5. Be2 O-O {Le roi est en sécurité derrière le fou g7. [%cal Gg7d4]}
6. O-O {Les deux camps ont roqué : la lutte pour le centre commence.}`,
          conclusion:
            "La Pirc repose sur un ordre simple : …d6, …Nf6, …g6, …Bg7 et …O-O. Le choix de la poussée centrale dépend ensuite du système blanc.",
        },
        {
          legacyIds: ["pirc-m2"],
          title: "La Classique : 6…Bg4 et 7…Nc6",
          eco: "B08",
          kind: "line",
          objectives: [
            "Clouer le cavalier f3 par …Bg4 pour affaiblir d4",
            "Développer …Nc6 et préparer …e5",
            "Répondre à d5 en reculant le cavalier en e7",
          ],
          pgn: `{Contre la Classique, …Bg4 vise le cavalier f3, un des défenseurs de d4. Avec …Nc6 et …e5, la pression sur le centre devient sérieuse.}
${P} 4. Nf3 Bg7 5. Be2 O-O 6. O-O Bg4 {Le fou cloue le cavalier f3 sur le fou e2. [%cal Gg4f3,Gf3d4]}
7. Be3 Nc6 {Le cavalier ajoute une attaque sur d4. [%cal Gc6d4]}
8. Qd2
(8. d5 Bxf3 9. Bxf3 Ne5 {Le cavalier s'installe en e5 avec gain de temps. [%cal Ge5f3]} 10. Be2 c6 {Le pion c6 attaque d5 pour ouvrir la colonne c.})
8... e5 {La poussée libère votre jeu et frappe d4. [%cal Ge5d4]}
9. d5
(9. dxe5 dxe5 {Le centre est symétrique : vos pièces sont bien placées.})
9... Ne7 {Le cavalier recule pour préparer …Bd7 et une rupture à l'aile.}
10. Rad1 Bd7 {Le fou se replie : il soutiendra …b5 ou …f5 selon le plan choisi.}`,
          conclusion:
            "Le plan …Bg4, …Nc6 et …e5 frappe d4 trois fois. Si les Blancs ferment par d5, vous obtenez une structure d'Est-Indienne avec un jeu clair.",
        },
        {
          legacyIds: ["pirc-m4"],
          title: "L'Autrichienne : 6.Bd3 Na6 et …c5",
          eco: "B09",
          kind: "line",
          objectives: [
            "Développer …Na6 pour soutenir …c5",
            "Échanger le fou g4 contre le cavalier f3",
            "Prendre le fou d3 par …Nb4",
          ],
          pgn: `{Contre l'Autrichienne 4.f4, les Blancs ont un centre imposant. Après 6.Bd3, le cavalier va en a6 : il soutient …c5 et peut sauter en b4 contre le fou d3.}
${P} 4. f4 Bg7 5. Nf3 O-O 6. Bd3
(6. Be3 b6 {Le fou c8 rejoindra b7 contre e4, et …c5 suivra.})
6... Na6 {Le cavalier soutient …c5 et vise la case b4. [%cal Ga6b4,Ga6c5]}
7. O-O c5 {La poussée attaque d4 avant que les Blancs ne lancent e5. [%cal Gc5d4]}
8. d5 Bg4 {Le fou cloue le cavalier f3, qui protège la case e5. [%cal Gg4f3]}
9. h3 Bxf3 10. Qxf3 Nb4 {Le cavalier attaque le fou d3. [%cal Gb4d3]}
11. a3 Nxd3 12. cxd3 Nd7 {Vous avez la paire de fous contre deux cavaliers et la case e5 pour le cavalier.}`,
          conclusion:
            "Contre l'Autrichienne avec Bd3, …Na6, …c5 et …Nb4 neutralisent le fou d3 : les Blancs perdent leur pièce d'attaque.",
        },
        {
          legacyIds: ["pirc-m1"],
          title: "L'attaque 150 : 4.Be3 Bg7 5.Qd2 c6",
          eco: "B07",
          kind: "line",
          objectives: [
            "Préparer …b5 par …c6 contre le grand roque",
            "Développer le cavalier b8 en d7",
            "Accepter l'échange des fous noirs par Bh6",
          ],
          pgn: `{Avec Be3, Qd2 et f3, les Blancs veulent échanger votre fou g7 par Bh6 et attaquer sur l'aile roi. Votre réponse : …c6 et …b5 pour gagner de l'espace avant de roquer.}
${P} 4. Be3 Bg7 5. Qd2 c6 {Le pion c6 prépare …b5 et contrôle la case d5. [%cal Gc6d5]}
6. f3 b5 {Le pion b5 menace …b4 contre le cavalier c3. [%cal Gb5b4]}
7. Nge2
(7. g4 h5 {Le pion h5 freine l'avance g4-g5 avant qu'elle ne devienne dangereuse.})
7... Nbd7 8. Bh6 Bxh6 9. Qxh6 Bb7 {Le roi noir reste au centre ; le fou b7 vise e4. [%cal Gb7e4]}`,
          conclusion:
            "Contre l'attaque 150, retardez le roque : …c6, …b5 et …Nbd7 créent du contre-jeu à l'aile dame pendant que la dame blanche s'éloigne en h6.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Plans typiques",
      summary:
        "La Classique avec …c6 et …e5, l'attaque 150 avec …b5 et …e5, l'Autrichienne avec …c5 et la poussée 6.e5.",
      stage: "plans",
      lessons: [
        {
          title: "Classique : …c6, …Nbd7 et …e5",
          eco: "B08",
          kind: "line",
          objectives: [
            "Préparer …e5 par …c6 et …Nbd7",
            "Accepter la structure symétrique après dxe5",
            "Activer le cavalier par …Nh5 vers f4",
          ],
          pgn: `{Une alternative solide à …Bg4 : …c6 et …Nbd7 préparent …e5 sans céder la paire de fous. Si les Blancs échangent en e5, vous obtenez un centre stable.}
${P} 4. Nf3 Bg7 5. Be2 O-O 6. O-O c6 {Le pion c6 protège d5 et prépare …Qc7 ou …b5. [%cal Gc6d5]}
7. a4 Nbd7 {Le cavalier soutient la poussée …e5. [%cal Gd7e5]}
8. h3 e5 9. dxe5 dxe5 {Le centre est fixé : la case d4 et la case c5 sont à vous.}
10. Be3 Qe7 {La dame protège e5 et libère d8 pour une tour. [%cal Ge7e5]}
11. Qd3 Nh5 {Le cavalier vise la case f4, affaiblie par h3. [%cal Gh5f4]}`,
          conclusion:
            "Avec …c6, …Nbd7 et …e5, la Classique devient une partie de position où la case f4 et les colonnes d sont les enjeux principaux.",
        },
        {
          title: "Attaque 150 : 4…c6 5.Qd2 b5 6.Bd3",
          eco: "B07",
          kind: "line",
          objectives: [
            "Jouer …c6 et …b5 avant …Bg7",
            "Frapper le centre par …e5 après …Nbd7",
            "Placer le fou en b7 contre e4",
          ],
          pgn: `{En jouant …c6 et …b5 avant de fianchetter, vous gardez le fou f8 à l'abri de Bh6. Après 6.Bd3, la rupture …e5 vient au bon moment.}
${P} 4. Be3 c6 5. Qd2 b5 {Le pion menace …b4 et gagne de l'espace. [%cal Gb5b4]}
6. Bd3
(6. f3 Nbd7 7. g4 Nb6 {Le cavalier vise c4 et libère d7 pour l'autre cavalier. [%cal Gb6c4]})
6... Nbd7 7. Nf3 e5 {La poussée attaque d4 : le pion e4 perdra un défenseur s'il cède. [%cal Ge5d4]}
8. O-O Bb7 {Le fou soutient …b4 et vise e4. [%cal Gb7e4]}
9. dxe5 dxe5 {Le centre est stable ; votre fou f8 ira en e7 ou g7 selon les besoins.}`,
          conclusion:
            "Le plan …c6, …b5, …Nbd7 et …e5 garde la souplesse du fou f8 et crée de l'espace à l'aile dame contre l'attaque 150.",
        },
        {
          title: "Autrichienne : 5…c5 6.dxc5 Qa5",
          eco: "B09",
          kind: "line",
          objectives: [
            "Frapper d4 par …c5 avant le roque",
            "Reprendre en c5 avec la dame par …Qa5",
            "Développer le fou c8 en g4 après le roque",
          ],
          pgn: `{Contre l'Autrichienne, …c5 immédiat est une réponse énergique. Si les Blancs prennent en c5, la dame reprend le pion avec gain de temps.}
${P} 4. f4 Bg7 5. Nf3 c5 {Le pion attaque d4 et ouvre la diagonale de la dame. [%cal Gc5d4]}
6. dxc5
(6. Bb5+ Bd7 {La parade naturelle : la suite est étudiée dans la grande théorie.})
6... Qa5 {La dame cloue le cavalier c3 et attaque c5. [%cal Ga5c3,Ga5c5]}
7. Bd3 Qxc5 8. Qe2 O-O {Le roi est à l'abri ; la dame c5 surveille la diagonale g1-a7. [%cal Gc5g1]}
9. Be3 Qa5 10. O-O Bg4 {Le fou cloue le cavalier f3 et prépare …Nc6. [%cal Gg4f3]}`,
          conclusion:
            "Avec …c5 puis …Qa5, vous récupérez le pion et développez la dame activement : la structure blanche reste exposée à l'aile roi.",
        },
        {
          legacyIds: ["pirc-m5"],
          title: "Autrichienne : 6.e5 Nfd7 7.h4",
          eco: "B09",
          kind: "line",
          objectives: [
            "Reculer le cavalier en d7 contre e5",
            "Contre-attaquer le centre par …c5",
            "Ouvrir les lignes par …dxe5 et …e4",
          ],
          pgn: `{La poussée 6.e5 chasse votre cavalier et prépare h4-h5. Votre contre-jeu : …c5 immédiat, puis l'ouverture du centre avant que l'attaque blanche n'arrive.}
${P} 4. f4 Bg7 5. Nf3 O-O 6. e5 Nfd7 {Le cavalier recule mais vise e5 et c5. [%cal Gd7e5]}
7. h4 c5 {La rupture attaque d4 : le centre blanc est miné. [%cal Gc5d4]}
8. h5 cxd4 9. Qxd4 dxe5 10. Qf2 e4 {Le pion avance pour libérer e5 et gêner le cavalier f3. [%cal Ge4f3]}
11. Nxe4 Nf6 {Le cavalier revient en f6 et échange le cavalier e4 actif. [%cal Gf6e4]}`,
          conclusion:
            "Contre 6.e5 et h4, la vitesse compte : …c5, …cxd4 et …dxe5 ouvrent le centre et votre fou g7 retrouve la diagonale.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Réponses adverses",
      summary:
        "Les systèmes 4.Bg5, 4.g3 et 4.Be2 avec h4, et la défense Lion 3…Nbd7 contre l'Autrichienne.",
      stage: "responses",
      lessons: [
        {
          title: "4.Bg5 : …h6, …g5 et …Nh5",
          eco: "B07",
          kind: "line",
          objectives: [
            "Chasser le fou g5 par …h6 et …g5",
            "Gagner la paire de fous par …Nh5",
            "Développer …Nc6 et …Bd7 contre le grand roque",
          ],
          pgn: `{Avec 4.Bg5 et Qd2, les Blancs veulent échanger votre fou g7. Les coups …h6 et …g5 poussent le fou en g3, où …Nh5 l'attaque.}
${P} 4. Bg5 Bg7 5. Qd2 h6 {Le pion interroge le fou g5. [%cal Gh6g5]}
6. Bh4 g5 7. Bg3 Nh5 {Le cavalier vise le fou g3 : vous gagnerez la paire de fous. [%cal Gh5g3]}
8. O-O-O Nc6 {Le cavalier attaque d4 et prépare …Bd7. [%cal Gc6d4]}
9. Nge2 Bd7 {Le fou relie les tours : …Nxg3 viendra au moment choisi.}`,
          conclusion:
            "Contre 4.Bg5, les coups …h6, …g5 et …Nh5 obtiennent la paire de fous. L'aile roi un peu affaiblie est le prix à payer.",
        },
        {
          title: "4.g3 : …e5 contre le fianchetto",
          eco: "B07",
          kind: "line",
          objectives: [
            "Frapper d4 par …e5 face au fianchetto",
            "Contrôler la case b4 par …c6 et …a5",
            "Placer le cavalier en a6 vers b4 ou c7",
          ],
          pgn: `{Le fianchetto 4.g3 est un système tranquille. Votre réponse naturelle est …e5 : les Blancs n'ont pas le cavalier f3 pour soutenir d4.}
${P} 4. g3 Bg7 5. Bg2 O-O 6. Nge2 e5 {Le pion conteste d4 ; le cavalier e2 ne peut pas le défendre. [%cal Ge5d4]}
7. h3 c6 {Le pion prépare …b5 ou …Qb6 et contrôle d5. [%cal Gc6d5]}
8. a4 a5 {Le pion bloque l'avance a5 et vous donne la case b4. [%cal Ga5b4]}
9. O-O Na6 {Le cavalier rejoint b4 : il visera d3 et c2. [%cal Ga6b4]}`,
          conclusion:
            "Contre le fianchetto, …e5, …c6, …a5 et …Na6-b4 forment un plan simple et solide.",
        },
        {
          title: "4.Be2 Bg7 5.h4 : …h5 et …c6",
          eco: "B07",
          kind: "line",
          objectives: [
            "Stopper l'avance h4-h5 par …h5",
            "Différer le roque face à une attaque sur h",
            "Préparer …b5 par …c6",
          ],
          pgn: `{Le système 4.Be2 et 5.h4 vise votre roi avant même qu'il ne roque. Bloquez l'avance par …h5 : la case g4 devient alors votre point d'appui.}
${P} 4. Be2 Bg7 5. h4 h5 {Le pion arrête h5 et prend le contrôle de g4. [%cal Gh5g4]}
6. Nf3
(6. Bg5 c6 {Le pion c6 prépare …Qb6 contre b2 et …b5. [%cal Gc6b5]})
6... c6 7. Ng5 {Le cavalier vise f7 et e6 ; il faut rester vigilant.}`,
          conclusion:
            "Contre 5.h4, …h5 coupe l'attaque à la racine. Votre roi peut rester au centre pendant que …c6 et …b5 créent du contre-jeu.",
        },
        {
          legacyIds: ["pirc-m3"],
          title: "Défense Lion : 3…Nbd7 4.f4 e5",
          eco: "B07",
          kind: "line",
          objectives: [
            "Préparer …e5 par …Nbd7 au lieu de …g6",
            "Prendre en d4 et frapper la dame par …c6 et …d5",
            "Développer le fou en c5 avec gain de temps",
          ],
          pgn: `{La défense Lion remplace …g6 par …Nbd7 et …e5 : une structure de Philidor où la rupture …d5 libère le jeu. Contre 4.f4, il faut ouvrir le centre vite.}
1. e4 d6 2. d4 Nf6 3. Nc3 Nbd7 4. f4 e5 {Le pion frappe d4 et f4 en même temps. [%cal Ge5d4,Ge5f4]}
5. Nf3 exd4 6. Qxd4 c6 {Le pion prépare …d5 et la dame blanche est exposée. [%cal Gd6d5]}
7. Be3 d5 {La rupture libère votre fou f8 et attaque e4. [%cal Gd5e4]}
8. exd5
(8. e5 Ng4 {Le cavalier vise le fou e3 et la case e5. [%cal Gg4e3]})
8... Bc5 {Le fou attaque la dame d4, alignée avec le fou e3. [%cal Gc5d4]}`,
          conclusion:
            "Dans la défense Lion, la rupture …d5 est le coup clé : elle ouvre les diagonales et transforme la dame blanche en cible.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Pièges",
      summary: "Quatre pièges noirs : …b4 contre le cavalier c3, …Nc5 dans l’Autrichienne, …Nxe4 contre le fianchetto, …Bxf3 et …Qxd4+ contre Bg5-f4.",
      stage: "traps",
      lessons: TRAPS,
    },
    // =====================================================================================
    {
      title: "Grande théorie",
      summary:
        "L'échec perpétuel de 6.Bb5+ dans l'Autrichienne, la Classique avec d5 ou Qd2-Rad1, et l'attaque 150 avec g4-h4-g5.",
      stage: "theory",
      lessons: [
        {
          title: "Autrichienne 6.Bb5+ : la nulle forcée",
          eco: "B09",
          kind: "line",
          objectives: [
            "Connaître la séquence …Ng4, …fxe6 et …Bxb5",
            "Prendre d4 avec le fou pour menacer …Bf2+",
            "Obtenir l'échec perpétuel par …Be3+ et …Bf2+",
          ],
          pgn: `{La ligne la plus forcée de la Pirc : après 6.Bb5+ Bd7 7.e5 Ng4 8.e6, les Blancs sacrifient pour gagner la dame. Votre fou g7 répond par un échec perpétuel.}
${P} 4. f4 Bg7 5. Nf3 c5 6. Bb5+ Bd7 7. e5 Ng4 {Le cavalier attaque e5 et la case f2. [%cal Gg4e5,Gg4f2]}
8. e6
(8. Bxd7+ Qxd7 9. d5 dxe5 {Vous avez gagné un pion du centre.})
8... fxe6 9. Ng5 Bxb5 {Le fou prend : les Blancs menacent la dame. [%cal Gg5e6]}
10. Nxe6 Bxd4 {Le fou prend d4 et vise f2 : il y a un échec. [%cal Gd4f2]}
11. Nxd8 Bf2+ 12. Kd2 Be3+ {Le fou donne échec sur e3 et f2 sans interruption.}
13. Ke1 Bf2+ {Échec perpétuel : la nulle par répétition est inévitable.}`,
          conclusion:
            "La ligne 6.Bb5+ mène à une nulle forcée : connaître la séquence …Bxb5, …Bxd4 et les échecs …Bf2+ et …Be3+ suffit.",
        },
        {
          title: "Classique 8.d5 : …Bxf3 et …Ne5",
          eco: "B08",
          kind: "line",
          objectives: [
            "Échanger le fou g4 pour installer le cavalier en e5",
            "Ouvrir la colonne c par …c6",
            "Garder la structure …bxc6 contre le centre",
          ],
          pgn: `{Avec 8.d5, les Blancs chassent le cavalier c6. L'échange …Bxf3 lui donne la case e5, puis …c6 ouvre une colonne pour vos tours.}
${P} 4. Nf3 Bg7 5. Be2 O-O 6. O-O Bg4 7. Be3 Nc6 8. d5 Bxf3 9. Bxf3 Ne5 {Le cavalier attaque le fou f3 et domine e5. [%cal Ge5f3]}
10. Be2 c6 11. f4 Ned7 {Le cavalier recule en d7 : il vise c5 et b6.}
12. dxc6 bxc6 {La colonne b est ouverte pour votre tour. [%cal Gb8b2]}
13. Qd3 {Les Blancs visent le pion d6 ; votre dame ira en a5 ou b6.}`,
          conclusion:
            "Après 8.d5, l'échange en f3 et …c6 donnent aux Noirs une structure dynamique avec la colonne b ouverte et des cases noires solides.",
        },
        {
          title: "Classique Qd2 : 10.Rad1 Bd7 11.Ne1 b5",
          eco: "B08",
          kind: "line",
          objectives: [
            "Lancer …b5 et …a5 à l'aile dame",
            "Gagner de l'espace avant f4 des Blancs",
            "Garder le cavalier e7 pour défendre l'aile roi",
          ],
          pgn: `{Dans la structure fermée de la Classique, les Blancs préparent f4. Vous avez un temps pour avancer vos pions de l'aile dame.}
${P} 4. Nf3 Bg7 5. Be2 O-O 6. O-O Bg4 7. Be3 Nc6 8. Qd2 e5 9. d5 Ne7 10. Rad1 Bd7 11. Ne1 b5 {Le pion prépare …b4 pour chasser le cavalier c3, défenseur de e4. [%cal Gb5b4]}
12. a3 a5 {Le pion soutient …b4 : votre aile dame avance plus vite que l'aile roi blanche. [%cal Ga5b4]}`,
          conclusion:
            "Contre le plan Ne1 et f4, la course à l'aile dame avec …b5 et …a5 est votre meilleure arme.",
        },
        {
          title: "Attaque 150 : g4, h4 et g5",
          eco: "B07",
          kind: "line",
          objectives: [
            "Freiner l'avance blanche par …h5",
            "Placer le cavalier en e5 après d5",
            "Garder le contre-jeu …b4 contre le cavalier c3",
          ],
          pgn: `{L'attaque 150 la plus agressive : f3, g4, h4 et g5. Vous répondez par …Nb6 et …h5, puis le cavalier d7 s'installe en e5.}
${P} 4. Be3 c6 5. Qd2 b5 6. f3 Nbd7 7. g4 Nb6 8. h4 h5 {Le pion bloque h5 et force g5. [%cal Gh5g4]}
9. g5 Nfd7 10. d5 Ne5 {Le cavalier s'installe sur la case libérée par d5. [%cal Ge5f3]}
11. Bd4 {Le fou vise e5 ; vous défendez par …Bg7 ou …c5.}`,
          conclusion:
            "Contre g4-h4-g5, bloquez l'aile roi par …h5 et centralisez le cavalier en e5 : l'attaque blanche s'arrête.",
        },
      ],
    },
  ],
};
