// Brouillon de la Masterclass « Catalane » (côté Blancs) : 1.d4 Nf6 2.c4 e6 3.g3.
// Répertoire : 4.Bg2 et Nf3, roque rapide ; Qc2 et a4 contre la Catalane ouverte 6…dxc4,
// Qc2 et Nbd2 avec la poussée e4 contre la Catalane fermée, Bd2 contre les échecs en b4,
// 4.Nf3 cxd4 5.Nxd4 contre 3…c5.
// Les flèches du coup à jouer sont ajoutées par scripts/course-builder.mjs ; celles écrites ici
// illustrent une idée (cible, manœuvre, menace).
import { TRAPS } from "./catalan-traps.mjs";

const P = "1. d4 Nf6 2. c4 e6 3. g3 d5 4. Bg2";
const CL = `${P} Be7 5. Nf3 O-O 6. O-O`;

export default {
  id: "catalan",
  name: "Catalane",
  description:
    "1.d4 Nf6 2.c4 e6 3.g3 : le fou blanc s'installe en g2 et pèse sur la grande diagonale pendant toute la partie. Un répertoire complet côté Blancs contre la Catalane ouverte et fermée, les échecs en b4, 3…c5, avec pièges et grandes lignes.",
  side: "white",
  eco: ["E00", "E01", "E02", "E03", "E04", "E05", "E06", "E07", "E08", "E09"],
  chapters: [
    // =====================================================================================
    {
      title: "Les fondations",
      summary:
        "Le fou g2 et la grande diagonale, la Catalane ouverte 4…dxc4, la Catalane fermée 4…Be7 avec e4, l'échec 3…Bb4+ et la variante classique 7.Qc2 a6 8.a4.",
      stage: "foundations",
      lessons: [
        {
          legacyIds: ["catalan-m1"],
          title: "Catalane ouverte : 4…dxc4 et le fou g2",
          eco: "E04",
          kind: "concept",
          objectives: [
            "Placer le fou en g2 sur la grande diagonale",
            "Ne pas se presser de reprendre le pion c4",
            "Miner la chaîne b5-c4 avec a4",
          ],
          pgn: `{La Catalane combine d4 et c4 avec le fianchetto du fou roi. Si les Noirs prennent en c4, vous laissez le pion de côté un moment : le fou g2 rend sa défense coûteuse.}
1. d4 Nf6 2. c4 e6 3. g3 {Le fou f1 ira en g2, sur la grande diagonale qui mène à a8. [%cal Gf1g2,Gg2a8]}
3... d5 4. Bg2 {Le fou presse déjà d5 et, plus loin, l'aile dame noire. [%cal Gg2d5]}
4... dxc4 5. Nf3 {Le cavalier se développe et prépare le roque : le pion c4 peut attendre. [%cal Gf3e5]}
5... a6 6. O-O {Le roi est à l'abri, et …b5 affaiblira la case c6 sous le feu du fou g2. [%cal Gg2c6]}
6... b5
(6... Nc6 7. e3 {Le pion e3 contrôle d4 et prépare Qe2 pour reprendre en c4. [%cal Gd1e2,Ge2c4]})
7. Ne5 {Le cavalier dégage la diagonale g2-a8 et vise c6. [%cal Gg2a8,Ge5c6]}
7... Nd5 8. a4 {Le pion attaque b5 : les Noirs ont du mal à garder leur pion de plus. [%cal Ga4b5]}`,
          conclusion:
            "Dans la Catalane ouverte, le pion c4 n'est qu'un prêt. Le fou g2, le cavalier e5 et la poussée a4 attaquent les pions noirs de l'aile dame qui le soutiennent.",
        },
        {
          legacyIds: ["catalan-m2"],
          title: "Catalane fermée : Qc2, Nbd2 et e4",
          eco: "E08",
          kind: "concept",
          objectives: [
            "Roquer avant de choisir son plan central",
            "Préparer e4 avec la dame c2 et le cavalier d2",
            "Gagner de l'espace quand les Noirs gardent d5",
          ],
          pgn: `{Quand les Noirs gardent leur pion d5 avec …Be7 et …c6, ils obtiennent une position solide mais passive. Votre plan est de préparer la poussée e4.}
${CL} {Les deux camps ont roqué : la bataille se joue autour de d5 et e4. [%cal Gg2d5]}
6... Nbd7
(6... dxc4 7. Qc2 {La dame reprendra le pion c4 dans quelques coups. [%cal Gc2c4]})
7. Qc2 {La dame contrôle e4 et surveille la case c4. [%cal Gc2e4]}
7... c6 8. Nbd2 {Le cavalier soutient e4 et peut reprendre en c4 si les Noirs y prennent. [%cal Gd2e4,Gd2c4]}
8... b6 9. e4 {Le pion attaque d5 et ouvre le centre au profit de vos pièces mieux placées. [%cal Ge4d5]}`,
          conclusion:
            "Contre la Catalane fermée, Qc2 et Nbd2 préparent e4. Les pièces blanches sont plus actives au moment où le centre s'ouvre.",
        },
        {
          title: "3…Bb4+ 4.Bd2 : la Bogo-catalane",
          eco: "E11",
          kind: "concept",
          objectives: [
            "Parer l'échec par Bd2 sans abîmer la structure",
            "Retrouver le schéma catalan après …Be7",
            "Activer le fou d2 en f4 puis le cavalier en e5",
          ],
          pgn: `{L'échec en b4 cherche à échanger le fou noir de cases noires ou à gêner votre développement. Le fou d2 s'interpose et reste utile.}
1. d4 Nf6 2. c4 e6 3. g3 Bb4+ 4. Bd2 {Le fou s'interpose et propose l'échange des fous. [%cal Gd2b4]}
4... Be7
(4... Qe7 5. Bg2 Nc6 6. Nf3 Bxd2+ 7. Nbxd2 {Le cavalier reprend vers le centre et pourra soutenir e4. [%cal Gd2e4]}
7... d6 8. O-O {Vous avez roqué et le cavalier d2 soutient déjà la poussée e4.})
5. Bg2 d5 6. Nf3 O-O 7. O-O c6 8. Qc2 {La dame contrôle e4 et laisse la colonne d à la tour. [%cal Gc2e4]}
8... Nbd7 9. Bf4 {Le fou d2 trouve la diagonale h2-b8, plus active. [%cal Gf4b8]}
9... b6 10. Rd1 Bb7 11. Ne5 {Le cavalier dégage le fou g2 et occupe une case forte. [%cal Gg2b7,Ge5c6]}`,
          conclusion:
            "Contre 3…Bb4+, Bd2 garde une structure saine. Après …Be7, la position ressemble à une Catalane fermée où votre fou de cases noires va en f4.",
        },
        {
          legacyIds: ["catalan-m4"],
          title: "Ouverte classique : 7.Qc2 a6 8.a4",
          eco: "E05",
          kind: "concept",
          objectives: [
            "Reprendre le pion c4 avec la dame",
            "Empêcher …b5 par la poussée a4",
            "Développer le fou c1 en g5 après Qxc4",
          ],
          pgn: `{La variante classique est la plus jouée au plus haut niveau. Les Noirs prennent en c4 après le roque, et vous récupérez le pion avec la dame.}
${CL} dxc4 7. Qc2 {La dame vise le pion c4, qui ne pourra pas être gardé longtemps. [%cal Gc2c4]}
7... a6
(7... b5 8. a4 {Le pion attaque b5 tout de suite, avant que les Noirs ne consolident. [%cal Ga4b5]}
8... b4 9. Nfd2 {Le cavalier va reprendre en c4 et dégage le fou g2. [%cal Gd2c4,Gg2a8]})
8. a4 {Le pion empêche …b5, qui aurait protégé c4. [%cal Ga4b5]}
8... Bd7 9. Qxc4 {Le matériel est rétabli et la dame est active. [%cal Gc4c7]}
9... Bc6 10. Bg5 {Le fou vise le cavalier f6, qui contrôle d5 et e4. [%cal Gg5f6]}`,
          conclusion:
            "Dans la Catalane ouverte classique, Qc2 et a4 récupèrent le pion c4. Les Noirs opposent leur fou c6 au fou g2 sur la grande diagonale.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Les plans",
      summary:
        "La Catalane fermée avec 9.e4 Bb7 10.b3, la classique 10.Bg5 Nbd7, la fermée 6…c6 7.Qc2 b6 et la Catalane ouverte 5…a6 6.O-O Nc6 7.e3.",
      stage: "plans",
      lessons: [
        {
          legacyIds: ["catalan-m3"],
          title: "Fermée : 9.e4 Bb7 10.b3",
          eco: "E09",
          kind: "line",
          objectives: [
            "Fianchetter le second fou en b2",
            "Ouvrir le centre par exd5 au bon moment",
            "Viser les pions noirs isolés ou pendants",
          ],
          pgn: `{Après 9.e4 Bb7, la tension centrale peut durer longtemps. Le coup b3 prépare Bb2 : vos deux fous visent alors les grandes diagonales.}
${CL} Nbd7 7. Qc2 c6 8. Nbd2 b6 9. e4 Bb7
(9... dxe4 10. Nxe4 Nxe4 11. Qxe4 {La dame e4 et le fou g2 forment une batterie sur la grande diagonale. [%cal Ge4c6,Gg2e4]})
10. b3 {Le pion soutient c4 et prépare le fianchetto du fou c1. [%cal Gc1b2]}
10... Rc8 11. Bb2 {Le fou rejoint la diagonale a1-h8 et soutient d4. [%cal Gb2d4]}
11... c5 12. exd5 exd5 13. dxc5 {Le centre s'ouvre : les pions noirs c et d deviennent des cibles pour vos tours. [%cal Gf1d1]}`,
          conclusion:
            "Dans la Catalane fermée, b3 et Bb2 complètent le développement avant l'ouverture du centre. Après exd5 et dxc5, les pions centraux noirs sont exposés.",
        },
        {
          title: "Ouverte classique : 10.Bg5 Nbd7 11.Nc3",
          eco: "E05",
          kind: "line",
          objectives: [
            "Échanger le fou g5 contre le cavalier f6",
            "Placer les tours sur la colonne d",
            "Installer le cavalier en e5 face au fou c6",
          ],
          pgn: `{Dans la classique, Bg5 puis Bxf6 cède la paire de fous. En échange, les Noirs perdent un défenseur de d5 et de e4, et vous gagnez du temps.}
${CL} dxc4 7. Qc2 a6 8. a4 Bd7 9. Qxc4 Bc6 10. Bg5 Nbd7 11. Nc3 {Le cavalier contrôle d5 et e4. [%cal Gc3d5,Gc3e4]}
11... h6 12. Bxf6 {Le fou prend : les Noirs doivent reprendre avec une pièce. [%cal Gg5f6]}
12... Nxf6 13. Rfd1 {La tour prend la colonne d et soutient d4. [%cal Gd1d4]}
13... a5 14. Ne5 {Le cavalier attaque le fou c6 et dégage le fou g2. [%cal Ge5c6,Gg2c6]}`,
          conclusion:
            "Dans la classique, l'échange en f6 donne la paire de fous aux Noirs, mais vous gagnez du temps pour Rfd1 et Ne5 avec une pression constante.",
        },
        {
          legacyIds: ["catalan-m5"],
          title: "Fermée : 6…c6 7.Qc2 b6 8.Nbd2",
          eco: "E08",
          kind: "line",
          objectives: [
            "Répondre à …b6 avec le même schéma Nbd2 et e4",
            "Contrôler la case b4 avec a3 contre …Na6",
            "Gagner de l'espace avec b4 après l'échange en c5",
          ],
          pgn: `{Avec …c6 et …b6, les Noirs préparent …Bb7 et …Na6 pour viser b4 et c5. Le plan blanc reste le même : Nbd2 et e4.}
${CL} c6 7. Qc2 b6
(7... Nbd7 8. Nbd2 {Même plan que contre 6…Nbd7 : le cavalier soutient e4. [%cal Gd2e4]})
8. Nbd2 Bb7 9. e4 Na6 10. a3 {Le pion contrôle b4 : le cavalier a6 ne pourra pas y sauter. [%cal Ga3b4]}
10... c5 11. exd5 exd5 12. dxc5 {L'échange laisse un pion d5 isolé. [%cal Gd2b3,Gb3d4]}
12... Nxc5 13. b4 {Le pion chasse le cavalier c5 et gagne de l'espace à l'aile dame. [%cal Gb4c5]}`,
          conclusion:
            "Contre …b6 et …Na6, le coup a3 enlève la case b4 au cavalier. Après l'échange en c5, b4 gagne de l'espace et le pion d5 reste faible.",
        },
        {
          title: "Ouverte : 5…a6 6.O-O Nc6 7.e3",
          eco: "E04",
          kind: "line",
          objectives: [
            "Reprendre le pion c4 avec la dame e2",
            "Casser la chaîne de pions par b3",
            "Utiliser la colonne a ouverte après axb3",
          ],
          pgn: `{Avec …a6 et …Nc6, les Noirs veulent jouer …b5 pour garder le pion. Le plan e3, Qe2 et b3 casse leur chaîne de pions.}
${P} dxc4 5. Nf3 a6 6. O-O Nc6 7. e3 {Le pion contrôle d4 et ouvre la case e2 à la dame. [%cal Gd1e2]}
7... Bd7
(7... Rb8 8. Nfd2 {Le cavalier dégage le fou g2 et prépare Nxc4. [%cal Gg2c6,Gd2c4]}
8... e5 9. Bxc6+ bxc6 10. dxe5 {Les pions c doublés et le pion e5 isolé compensent largement la paire de fous cédée.})
8. Qe2 {La dame vise c4 et soutient la poussée b3. [%cal Ge2c4]}
8... b5 9. b3 {Le pion attaque la chaîne b5-c4 par la base. [%cal Gb3c4]}
9... cxb3 10. axb3 {La tour a1 vise désormais le pion a6 sur la colonne ouverte. [%cal Ga1a6]}`,
          conclusion:
            "Quand les Noirs défendent c4 avec …b5, la poussée b3 casse leur chaîne. La colonne a s'ouvre pour votre tour.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Les réponses adverses",
      summary:
        "3…c5 avec 4.Nf3 cxd4 5.Nxd4, l'échec 4…Bb4+ 5.Bd2 avec …a5 ou …Bd6, et les Catalanes ouvertes 5…Nc6 et 5…c5.",
      stage: "responses",
      lessons: [
        {
          title: "3…c5 : 4.Nf3 cxd4 5.Nxd4",
          eco: "E00",
          kind: "line",
          objectives: [
            "Éviter le Benoni avec 4.Nf3",
            "Reprendre en d4 avec le cavalier",
            "Miner le pion d4 avancé par e3",
          ],
          pgn: `{Contre 3…c5, la poussée d5 mène au Benoni. Avec 4.Nf3, vous gardez un jeu catalan : le cavalier reprend en d4 et le fou g2 vise d5.}
1. d4 Nf6 2. c4 e6 3. g3 c5 4. Nf3 {Le cavalier soutient d4 et évite la structure Benoni. [%cal Gf3d4]}
4... cxd4 5. Nxd4 d5
(5... Qc7 6. Nc3 a6 7. Bg2 {Le fou rejoint g2 : la case d5 est déjà sous contrôle. [%cal Gg2d5,Gc3d5]})
(5... Nc6 6. Bg2 Qb6 7. Nb3 {Le cavalier recule et protège le pion b2 de la dame. [%cal Gb3d2]})
6. Bg2 {Le fou attaque d5 : la pression catalane commence tout de suite. [%cal Gg2d5]}
6... e5 7. Nf3 {Le cavalier recule en attaquant le pion e5. [%cal Gf3e5]}
7... d4 8. O-O Nc6 9. e3 {Le pion attaque d4 pour démanteler le centre noir avancé. [%cal Ge3d4]}
9... Be7 10. exd4 exd4 {Le pion d4 noir est isolé : vos pièces vont le bloquer et l'attaquer.}`,
          conclusion:
            "Contre 3…c5, 4.Nf3 cxd4 5.Nxd4 évite le Benoni. Si les Noirs avancent leurs pions centraux, e3 les démantèle et le pion d4 devient une cible.",
        },
        {
          title: "4…Bb4+ 5.Bd2 : …a5 et …Bd6",
          eco: "E06",
          kind: "line",
          objectives: [
            "Parer l'échec par Bd2 dans tous les cas",
            "Ouvrir la position par cxd5 contre …c5",
            "Garder le plan Qc2 contre les retraites du fou",
          ],
          pgn: `{Le fou noir donne l'échec puis cherche une case active. Contre …a5, il reste en b4 soutenu par le pion ; contre …Bd6, il vise e5.}
${P} Bb4+ 5. Bd2 a5
(5... Be7 6. Nf3 O-O 7. O-O c6 8. Qc2 {Le fou d2 a gagné un temps : la position est celle de la Bogo-catalane. [%cal Gc2e4]})
(5... Bd6 6. Nf3 c6 7. O-O Nbd7 8. Qc2 {La dame contrôle e4 et empêche la poussée libératrice …e5. [%cal Gc2e4]}
8... O-O)
6. Nf3 O-O 7. Qc2 {La dame contrôle e4 et vise h7. [%cal Gc2h7]}
7... c5 8. cxd5 cxd4 9. Nxd4 {Le cavalier reprend au centre et attaque la case e6. [%cal Gd4e6]}
9... Qb6 10. e3 {Le pion protège le cavalier d4 attaqué par la dame. [%cal Ge3d4]}
10... exd5 11. O-O Nc6 {Les Noirs ont un pion d5 isolé que vos pièces vont viser.}`,
          conclusion:
            "Contre 4…Bb4+, Bd2 suffit dans tous les cas. Si les Noirs jouent …c5, l'échange au centre leur laisse souvent un pion d5 isolé.",
        },
        {
          title: "Ouverte : 5…Nc6 6.Qa4",
          eco: "E04",
          kind: "line",
          objectives: [
            "Clouer le cavalier c6 avec Qa4",
            "Échanger les fous de cases noires en b4",
            "Récupérer le pion c4 après Qb5",
          ],
          pgn: `{Le coup …Nc6 défend c4 indirectement en préparant …Rb8 et …b5. La dame a4 cloue le cavalier et attaque le pion c4.}
${P} dxc4 5. Nf3 Nc6 6. Qa4 {La dame cloue le cavalier c6 et vise le pion c4. [%cal Ga4c6,Ga4c4]}
6... Bb4+
(6... Bd7 7. Qxc4 Na5 8. Qd3 c5 9. O-O Bc6 {Les Noirs ont libéré leur jeu, mais vous avez récupéré le pion avec un roque fait.})
7. Bd2 Nd5 8. Bxb4 {L'échange élimine le fou noir de cases noires. [%cal Gd2b4]}
8... Nxb4 9. O-O Rb8 10. Na3 {Le cavalier soutient c4 en vue de la reprise. [%cal Ga3c4]}
10... O-O 11. Qb5 {La dame attaque le pion c4 et le cavalier b4. [%cal Gb5c4,Gb5b4]}
11... b6 12. Qxc4 {Le pion est rendu : le fou g2 reste plus fort que le fou c8.}`,
          conclusion:
            "Contre 5…Nc6, Qa4 cloue le cavalier et attaque c4. Après l'échange en b4, la dame récupère le pion et le fou g2 domine la diagonale.",
        },
        {
          title: "Ouverte : 5…c5 6.O-O Nc6 7.Qa4",
          eco: "E04",
          kind: "line",
          objectives: [
            "Roquer avant de reprendre le pion c4",
            "Clouer le cavalier c6 avec la dame a4",
            "Chasser la dame noire avec la tour d1",
          ],
          pgn: `{Avec …c5, les Noirs attaquent d4 tout de suite. Le roque puis Qa4 met le cavalier c6 en difficulté sur la diagonale a4-e8.}
${P} dxc4 5. Nf3 c5
(5... Bb4+ 6. Bd2 a5 7. Qc2 Bxd2+ 8. Qxd2 c6 9. a4 {Le pion empêche …b5 : le pion c4 tombera. [%cal Ga4b5]})
6. O-O Nc6 7. Qa4 {La dame cloue le cavalier c6 et attaque c4. [%cal Ga4c6]}
7... Bd7
(7... cxd4 8. Nxd4 Qxd4 9. Bxc6+ Bd7 10. Rd1 {La tour attaque la dame d4, et le fou c6 cloue le fou d7. [%cal Gd1d4,Gc6e8]})
8. Qxc4 b5 9. Qd3 c4 10. Qd1 {La dame recule : le pion c4 avancé sera une cible pour b3. [%cal Gb2b3]}
10... Rc8 11. Bf4 {Le fou se développe et contrôle la case b8. [%cal Gf4b8]}`,
          conclusion:
            "Contre 5…c5, roquez puis jouez Qa4. Si les Noirs gagnent de l'espace avec …b5 et …c4, leurs pions avancés seront des cibles.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Les pièges",
      summary: "Quatre pièges blancs : Bxf6 et Ng5 contre h7 et b7, le sacrifice en g5 dans la fermée, cxd5 et Qc6 contre le Stonewall, et Ne5 qui démasque le fou g2.",
      stage: "traps",
      lessons: TRAPS,
    },
    // =====================================================================================
    {
      title: "La théorie approfondie",
      summary:
        "Les lignes de référence : la classique 10.Bg5 Bd5, 7…b5 8.a4 b4, la Catalane fermée 9…dxc4 et 9…Ba6, et 5…Bb4+ 6.Bd2 a5.",
      stage: "theory",
      lessons: [
        {
          title: "Ouverte classique : 10.Bg5 Bd5 et 10…a5",
          eco: "E05",
          kind: "line",
          objectives: [
            "Garder la dame active malgré les attaques du fou noir",
            "Échanger en f6 pour éliminer un défenseur central",
            "Jouer e4 avec les fous de couleurs opposées",
          ],
          pgn: `{Avec …Bd5 puis …Be4, les Noirs chassent votre dame et cherchent à échanger le fou g2. Vous gardez la paire de pièces la plus active.}
${CL} dxc4 7. Qc2 a6 8. a4 Bd7 9. Qxc4 Bc6 10. Bg5 Bd5
(10... a5 11. Nc3 Na6 12. Bxf6 Bxf6 13. e4 {Le pion e4 occupe le centre et coupe la diagonale du fou c6. [%cal Ge4d5]})
11. Qc2 {La dame recule sur la diagonale b1-h7 et garde la case e4. [%cal Gc2e4]}
11... Be4 12. Qc1 {La dame reste sur la diagonale c1-h6 et soutient le fou g5. [%cal Gc1g5]}
12... h6 13. Bxf6 Bxf6 14. Rd1 {La tour soutient d4 et prépare Nbd2 contre le fou e4. [%cal Gd1d4]}
14... a5 15. Nbd2 Bxf3 16. Bxf3 {Le fou f3 garde la grande diagonale et e4 suivra. [%cal Gf3b7]}`,
          conclusion:
            "Dans la classique avec …Bd5 et …Be4, la dame recule en c2 puis c1. Après les échanges, votre fou f3 et la poussée e4 donnent le meilleur centre.",
        },
        {
          title: "Ouverte classique : 7…b5 8.a4 b4",
          eco: "E05",
          kind: "line",
          objectives: [
            "Attaquer b5 avec a4 dès que les Noirs le jouent",
            "Reprendre en c4 avec le cavalier f3",
            "Gagner de l'espace avec e4 après …Bxc5",
          ],
          pgn: `{Le coup …b5 protège le pion c4 au prix d'une faiblesse en c6. Après a4 b4, le cavalier f3 va en d2 puis reprend en c4.}
${CL} dxc4 7. Qc2 b5 8. a4 b4 9. Nfd2 Nd5 10. Nxc4 {Le cavalier reprend le pion et dégage le fou g2. [%cal Gg2a8]}
10... c5 11. dxc5 Bxc5
(11... Ba6 12. Ne3 {Le cavalier e3 attaque le cavalier d5 et protège c4. [%cal Ge3d5]}
12... Nd7)
12. e4 {Le pion chasse le cavalier d5 et gagne le centre. [%cal Ge4d5]}
12... Nb6 {Les Noirs ont un pion b4 avancé que votre cavalier c4 et votre fou c1 peuvent viser.}`,
          conclusion:
            "Contre 7…b5, a4 b4 puis Nfd2 récupère le pion c4. Après …c5 dxc5 et e4, votre centre est le plus mobile.",
        },
        {
          title: "Fermée : 9…dxc4 et 9…Ba6",
          eco: "E09",
          kind: "line",
          objectives: [
            "Reprendre en c4 avec le cavalier d2",
            "Répondre à …Ba6 par b3 et Bb2",
            "Garder la colonne d pour la tour",
          ],
          pgn: `{Après 9.e4, les Noirs peuvent prendre en c4 ou clouer le pion c4 avec …Ba6. Dans les deux cas, vos pièces gardent l'initiative au centre.}
${CL} Nbd7 7. Qc2 c6 8. Nbd2 b6 9. e4 dxc4
(9... Ba6 10. b3 Rc8 11. Bb2 {Le fou soutient d4 et rejoint la grande diagonale noire. [%cal Gb2d4]})
10. Nxc4 {Le cavalier reprend et vise d6 et e5. [%cal Gc4d6,Gc4e5]}
10... Bb7 11. Rd1 {La tour se place derrière le pion d4 pour préparer d5. [%cal Gd1d5]}`,
          conclusion:
            "Contre 9…dxc4, Nxc4 et Rd1 préparent la poussée d5. Contre 9…Ba6, b3 et Bb2 complètent le développement.",
        },
        {
          title: "Ouverte : 5…Bb4+ 6.Bd2 a5 7.Qc2",
          eco: "E04",
          kind: "line",
          objectives: [
            "Viser le pion c4 avec la dame c2",
            "Empêcher …b5 par la poussée a4",
            "Chasser le cavalier e4 avec la dame",
          ],
          pgn: `{Avec …Bb4+ et …a5, les Noirs échangent les fous de cases noires puis gardent le pion c4. La dame et la poussée a4 l'attaquent.}
${P} dxc4 5. Nf3 Bb4+ 6. Bd2 a5 7. Qc2 {La dame vise c4 et le fou b4 est menacé d'échange. [%cal Gc2c4]}
7... Bxd2+ 8. Qxd2 c6 9. a4 Ne4
(9... b5 10. axb5 cxb5 {Les Noirs gardent leur pion, mais leurs pions de l'aile dame sont exposés.})
10. Qf4 {La dame attaque le cavalier e4 et évite …Nxd2. [%cal Gf4e4]}
10... Qb6 11. O-O {Le roque met le roi à l'abri ; le pion c4 tombera plus tard. [%cal Gf1d1]}`,
          conclusion:
            "Contre 5…Bb4+ 6.Bd2 a5, Qc2 et a4 attaquent c4. Le cavalier e4 est chassé par la dame, et vous récupérez le pion plus tard.",
        },
      ],
    },
  ],
};
