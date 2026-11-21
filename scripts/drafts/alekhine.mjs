// Brouillon de la Masterclass « Défense Alekhine » (côté Noirs) : 1.e4 Nf6.
// Répertoire : 2.e5 Nd5 3.d4 d6, avec …Bg4-…e6 contre 4.Nf3, …cxd6 et …g6 contre l'échange,
// …dxe5 et …Nc6/…Bf5 contre les Quatre Pions.
// Les flèches du coup à jouer sont ajoutées par scripts/course-builder.mjs ; celles écrites ici
// illustrent une idée (cible, manœuvre, menace).
import { TRAPS } from "./alekhine-traps.mjs";

const A = "1. e4 Nf6 2. e5 Nd5 3. d4 d6";
const MODERN = `${A} 4. Nf3 Bg4 5. Be2 e6 6. O-O Be7`;
const EXCH = `${A} 4. c4 Nb6 5. exd6 cxd6`;
const FOUR = `${A} 4. c4 Nb6 5. f4 dxe5 6. fxe5`;

export default {
  id: "alekhine",
  name: "Défense Alekhine",
  description:
    "1.e4 Nf6 : le cavalier provoque l'avance des pions blancs pour mieux les attaquer ensuite. Un répertoire complet côté Noirs contre la variante moderne 4.Nf3, l'échange 5.exd6, les Quatre Pions et les déviations 2.Nc3, 3.c4, 3.Nc3 et 3.Bc4, avec pièges et lignes principales.",
  side: "black",
  eco: ["B02", "B03", "B04", "B05"],
  chapters: [
    // =====================================================================================
    {
      title: "Les fondations",
      summary:
        "L'idée de 1…Nf6, la variante moderne avec …Bg4 et …e6, la reprise …cxd6 contre l'échange et la réponse classique à 2.Nc3.",
      stage: "foundations",
      lessons: [
        {
          title: "1…Nf6 : inviter les pions blancs",
          eco: "B02",
          kind: "concept",
          objectives: [
            "Comprendre pourquoi le cavalier provoque e5",
            "Attaquer le pion e5 par …d6",
            "Développer le fou c8 avant …e6",
          ],
          pgn: `{L'Alekhine laisse les Blancs prendre de l'espace pour mieux attaquer leurs pions. Le cavalier f6 est chassé en d5, mais chaque pion qui avance laisse des cases derrière lui. Votre premier objectif : attaquer e5 par …d6, puis sortir le fou c8 avant …e6.}
1. e4 Nf6 {Le cavalier attaque e4 : les Blancs doivent le défendre ou avancer. [%cal Gf6e4]}
2. e5
(2. Nc3 d5 {Le pion conteste e4 : la position ressemble à une Scandinave. [%cal Gd5e4]})
2... Nd5 {Le cavalier se centralise : il ne craint pas encore c4. [%cal Gd5c3]}
3. d4
(3. c4 Nb6 {Le cavalier recule en b6, d'où il vise c4 et d5. [%cal Gb6c4]})
3... d6 {Le pion attaque e5 : la base de la chaîne blanche est mise à l'épreuve. [%cal Gd6e5]}
4. Nf3 Bg4 {Le fou sort avant …e6 et cloue le cavalier qui défend e5. [%cal Gg4f3]}
5. Be2 e6 {Le pion e6 soutient le cavalier d5 et ouvre la diagonale du fou f8. [%cal Gf8e7]}`,
          conclusion:
            "Dans l'Alekhine, chaque avance blanche crée une cible. …d6 attaque e5, …Bg4 cloue son défenseur, et …e6 donne une structure solide.",
        },
        {
          legacyIds: ["alekhine-m1"],
          title: "4.Nf3 Bg4 : la variante moderne",
          eco: "B05",
          kind: "line",
          objectives: [
            "Clouer le cavalier f3 par …Bg4",
            "Placer le cavalier en b6 contre c4",
            "Répondre à Be3 par …Nc6 et reprendre …cxd6",
          ],
          pgn: `{Contre 4.Nf3, le système …Bg4, …e6, …Be7 et le petit roque est le plus solide. Après c4, le cavalier recule en b6 ; …Nc6 met ensuite la pression sur d4.}
${A} 4. Nf3 Bg4 5. Be2
(5. h3 Bxf3 {L'échange : le pion e5 perd son défenseur principal. [%cal Gg4f3]} 6. Qxf3 dxe5 7. dxe5 {Le pion e5 est isolé ; …Nc6 l'attaquera.})
5... e6 6. O-O
(6. h3 Bh5 {Le fou garde le clouage. [%cal Gh5f3]} 7. O-O Be7 {Le développement continue : le petit roque suivra.})
6... Be7 7. c4 Nb6 {Le cavalier recule en b6 : il vise c4 et d5. [%cal Gb6c4]}
8. Nc3 O-O 9. Be3 Nc6 {Le cavalier attaque d4 et e5. [%cal Gc6d4,Gc6e5]}
10. exd6 cxd6 {La reprise du pion c ouvre la colonne c : vous jouerez …d5 ou …Bf6.}`,
          conclusion:
            "Contre la variante moderne, …Bg4, …e6, …Be7 et O-O forment une position solide. Le cavalier b6 et …Nc6 mettent ensuite la pression sur d4.",
        },
        {
          legacyIds: ["alekhine-m3"],
          title: "5.exd6 cxd6 6.Nf3 : …g6 et …Bg7",
          eco: "B03",
          kind: "line",
          objectives: [
            "Reprendre …cxd6 pour garder un pion central",
            "Fianchetter le fou f8 contre d4",
            "Développer par …Nc6 et …Bg4",
          ],
          pgn: `{Dans l'échange, les Blancs gardent un centre c4-d4. Vous reprenez du pion c, puis le fianchetto …g6-…Bg7 met le fou sur la diagonale du pion d4.}
${EXCH} 6. Nf3 g6 {Le pion prépare le fianchetto. [%cal Gf8g7]}
7. Be2 Bg7 {Le fou vise d4 sur la grande diagonale. [%cal Gg7d4]}
8. O-O O-O 9. Nc3
(9. h3 Nc6 {Le cavalier attaque d4 une deuxième fois.})
9... Nc6 {Le cavalier ajoute sa pression sur d4. [%cal Gc6d4]}
10. Be3 Bg4 {Le fou attaque le cavalier f3, défenseur de d4. [%cal Gg4f3]}
11. b3 d5 {Le levier central attaque c4 : votre cavalier b6 vise la case c4. [%cal Gd5c4]}`,
          conclusion:
            "Contre l'échange avec Nf3, …g6, …Bg7, …Nc6 et …Bg4 accumulent la pression sur d4. Le levier …d5 conteste ensuite le centre.",
        },
        {
          title: "2.Nc3 d5 : …Nxd5 et …Nb6",
          eco: "B02",
          kind: "line",
          objectives: [
            "Répondre à 2.Nc3 par …d5",
            "Reprendre …Nxd5 et reculer en b6 contre Bc4",
            "Développer par …Nc6 et …Bf5",
          ],
          pgn: `{Contre 2.Nc3, …d5 est la réponse la plus directe : vous contestez e4 et la position rappelle une Scandinave avec le cavalier en d5 à la place de la dame.}
1. e4 Nf6 2. Nc3 d5 {Le pion conteste e4. [%cal Gd5e4]}
3. exd5
(3. e5 Nfd7 {Le cavalier recule en d7 : vous jouerez …e6 et …c5 comme dans une Française.} 4. d4 e6 {On retrouve une structure de Défense française.})
3... Nxd5 4. Bc4 Nb6 {Le cavalier attaque le fou c4 et quitte la case d5. [%cal Gb6c4]}
5. Bb3 Nc6 {Le cavalier se développe vers d4 et e5. [%cal Gc6d4]}
6. Nf3 Bf5 {Le fou sort sur la diagonale b1-h7 : vos pièces sont actives. [%cal Gf5c2]}`,
          conclusion:
            "Contre 2.Nc3, …d5 et …Nxd5 mènent à un jeu ouvert. Après …Nb6, …Nc6 et …Bf5, vos pièces sont aussi actives que les blanches.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Plans typiques",
      summary:
        "Les plans noirs : …d5 et …Nc8 contre c5 dans la variante moderne, …e5 dans l'échange, la rupture …f6 dans les Quatre Pions et le jeu sur les cases blanches contre h3.",
      stage: "plans",
      lessons: [
        {
          title: "La moderne : …d5, …Bxf3 et …Nc8",
          eco: "B05",
          kind: "line",
          objectives: [
            "Bloquer le centre par …d5 contre Be3",
            "Échanger en f3 contre c5 pour abîmer l'aile roi",
            "Replacer le cavalier par c8 et …Nc6",
          ],
          pgn: `{Avec …d5, vous fermez le centre. Quand le pion c5 chasse votre cavalier, …Bxf3 doublent les pions blancs, et le cavalier revient par c8 avant de rejoindre c6.}
${MODERN} 7. c4 Nb6 8. Nc3 O-O 9. Be3 d5 {Le pion bloque le centre : la chaîne blanche c4-d4-e5 est figée. [%cal Gd5c4]}
10. c5 Bxf3 {L'échange double les pions blancs avant que le cavalier ne recule. [%cal Gg4f3]}
11. gxf3
(11. Bxf3 Nc4 {Le cavalier s'installe en c4 et attaque le fou e3. [%cal Gc4e3]})
11... Nc8 {Le cavalier recule en c8, d'où il ira en c6 ou e7.}
12. f4
(12. b4 Nc6 {Le cavalier attaque b4 et d4 à la fois. [%cal Gc6b4]})
12... Nc6 {Le cavalier attaque d4 : votre jeu se fait sur les cases blanches. [%cal Gc6d4]}`,
          conclusion:
            "Avec …d5, …Bxf3 et …Nc8-c6, vous fixez le centre blanc et visez les pions doublés de l'aile roi. Le cavalier c6 attaque d4 et b4.",
        },
        {
          legacyIds: ["alekhine-m4"],
          title: "L'échange : …g6, …Bg7 et …e5",
          eco: "B03",
          kind: "line",
          objectives: [
            "Fianchetter contre 6.Nc3 et 7.Be3",
            "Jouer le levier …e5 contre b3",
            "Entrer en finale par …dxe5 et …N6d7",
          ],
          pgn: `{Contre 6.Nc3 et 7.Be3, le levier …e5 est la réponse la plus directe : il échange le pion d4 et ouvre la diagonale de votre fou g7. La finale qui suit est saine pour les Noirs.}
${EXCH} 6. Nc3 g6 7. Be3 Bg7 8. Rc1
(8. Nf3 O-O 9. Be2 Nc6 {Le cavalier vise d4. [%cal Gc6d4]} 10. O-O Bg4 {Le fou attaque le cavalier qui défend d4.})
8... O-O 9. b3 e5 {Le levier : d4 est attaqué par le pion et le fou g7. [%cal Ge5d4]}
10. dxe5 dxe5 {La reprise ouvre la colonne d : la finale arrive.}
11. Qxd8 Rxd8 12. c5 N6d7 {Le cavalier recule en d7 et vise c5. [%cal Gd7c5]}`,
          conclusion:
            "Contre la mise en place Nc3, Be3 et Rc1, …e5 libère votre fou g7. Après les échanges, le cavalier d7 attaque c5 et vous avez une finale active.",
        },
        {
          legacyIds: ["alekhine-m2"],
          title: "Quatre Pions : …dxe5, …Nc6 et …f6",
          eco: "B03",
          kind: "line",
          objectives: [
            "Prendre en e5 et attaquer le pion avec …Nc6",
            "Développer le fou en f5 et roquer",
            "Briser le centre par …f6",
          ],
          pgn: `{Contre les Quatre Pions, vous prenez en e5, puis vos pièces attaquent le pion e5 et le pion d4. Après le roque, la rupture …f6 ouvre la colonne f pour votre tour.}
${FOUR} Nc6 {Le cavalier attaque e5 et d4. [%cal Gc6e5,Gc6d4]}
7. Be3 Bf5 {Le fou sort avant …e6. [%cal Gf5b1]}
8. Nc3 e6 9. Nf3 Be7 10. Be2 O-O 11. O-O f6 {La rupture : le pion e5 est attaqué une troisième fois. [%cal Gf6e5]}
12. exf6 Bxf6 {Le fou reprend et vise d4 : la colonne f est ouverte pour votre tour. [%cal Gf6d4,Gf8f1]}
13. Qd2 Qe7 {La dame relie les tours et prépare …Rad8 contre d4.}`,
          conclusion:
            "Dans les Quatre Pions, …dxe5, …Nc6 et …Bf5 attaquent le centre. La rupture …f6 ouvre la colonne f et votre fou f6 vise d4.",
        },
        {
          title: "Contre h3 : …Nc6, …Bf5 et …d5",
          eco: "B03",
          kind: "line",
          objectives: [
            "Développer le fou en f5 quand h3 empêche …Bg4",
            "Bloquer le centre par …d5",
            "Installer le cavalier en c4 après c5",
          ],
          pgn: `{Si les Blancs jouent h3 pour empêcher …Bg4, votre fou va en f5. Ensuite …d5 bloque le centre : après c5, le cavalier b6 saute en c4.}
${EXCH} 6. Nc3 g6 7. h3 Bg7 8. Nf3 O-O 9. Be2 Nc6 {Le cavalier attaque d4. [%cal Gc6d4]}
10. O-O Bf5 {Le fou se développe sur la diagonale b1-h7. [%cal Gf5b1]}
11. Be3
(11. Bf4 h6 {Le pion contrôle g5 et prépare …g5 ou …e5.})
11... d5 {Le pion fixe le centre : c4 est attaqué. [%cal Gd5c4]}
12. c5 Nc4 {Le cavalier s'installe en c4, où il attaque le fou e3 et le pion b2. [%cal Gc4e3,Gc4b2]}`,
          conclusion:
            "Contre h3, …Bf5 développe le fou sans perdre de temps. Après …d5 et c5, le cavalier c4 devient une pièce très forte.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Réponses adverses",
      summary:
        "Les déviations blanches : la chasse 3.c4 Nb6 4.c5, l'échange 3.Nc3, le fou 3.Bc4 et la variante 6…Bf5 des Quatre Pions.",
      stage: "responses",
      lessons: [
        {
          title: "3.c4 Nb6 4.c5 : la chasse au cavalier",
          eco: "B02",
          kind: "line",
          objectives: [
            "Revenir en d5 quand c5 chasse le cavalier",
            "Jouer …e6 pour soutenir le cavalier d5",
            "Attaquer le pion c5 par …d6",
          ],
          pgn: `{Avec 3.c4 Nb6 4.c5, les Blancs chassent votre cavalier une deuxième fois. Il revient en d5, et …e6 le soutient. Le pion c5 est désormais loin de ses bases.}
1. e4 Nf6 2. e5 Nd5 3. c4 Nb6 4. c5 Nd5 {Le cavalier revient au centre : le pion c5 est en l'air.}
5. Nc3
(5. Bc4 e6 {Le pion soutient le cavalier d5. [%cal Ge6d5]} 6. Nc3 Nxc3 {L'échange : vous éliminez le cavalier qui attaquait d5.})
5... e6 6. d4
(6. Nxd5 exd5 {La reprise donne un pion d5 solide et ouvre la diagonale du fou f8. [%cal Gf8c5]} 7. d4 d6 {Le pion attaque c5 et e5.})
6... d6 {Le pion attaque c5 et e5 : la chaîne blanche est trop longue. [%cal Gd6c5,Gd6e5]}
7. cxd6 {La prise ouvre le jeu : votre cavalier d5 reste bien placé.}`,
          conclusion:
            "Contre 4.c5, le cavalier revient en d5 et …e6 le soutient. Le pion c5 est une cible : …d6 l'attaque tout de suite.",
        },
        {
          title: "3.Nc3 Nxc3 : l'échange en c3",
          eco: "B02",
          kind: "line",
          objectives: [
            "Échanger le cavalier contre 3.Nc3",
            "Attaquer e5 par …d6 et …Nc6",
            "Développer le fou en d7 contre Bb5",
          ],
          pgn: `{Contre 3.Nc3, l'échange …Nxc3 simplifie : les Blancs reprennent du pion d ou b, et votre plan reste d'attaquer e5 par …d6 et …Nc6.}
1. e4 Nf6 2. e5 Nd5 3. Nc3 Nxc3 {L'échange : le cavalier c3 disparaît avant de gêner. [%cal Gd5c3]}
4. dxc3
(4. bxc3 d6 {Le pion attaque e5 : les pions doublés blancs ne contrôlent pas d4.})
4... d6 {Le pion attaque e5 : la colonne d ouverte vous servira. [%cal Gd6e5]}
5. Nf3 Nc6 {Le cavalier attaque e5 une deuxième fois. [%cal Gc6e5]}
6. Bb5 Bd7 {Le fou rompt le clouage : le pion e5 reste attaqué.}`,
          conclusion:
            "Contre 3.Nc3, l'échange …Nxc3 puis …d6 et …Nc6 attaquent e5. Le fou d7 rompt le clouage Bb5.",
        },
        {
          title: "3.Bc4 Nb6 4.Bb3 : …d6 et …Nc6",
          eco: "B02",
          kind: "line",
          objectives: [
            "Chasser le fou c4 par …Nb6",
            "Attaquer e5 par …d6",
            "Reprendre …cxd6 pour ouvrir la colonne c",
          ],
          pgn: `{Avec 3.Bc4, les Blancs visent f7. Le cavalier recule en b6 avec gain de temps, puis …d6 attaque e5 : le fou b3 reste actif, mais votre centre est solide.}
1. e4 Nf6 2. e5 Nd5 3. Bc4 Nb6 {Le cavalier attaque le fou c4. [%cal Gb6c4]}
4. Bb3 d6 5. Nf3
(5. exd6 cxd6 {La reprise du pion c ouvre la colonne c.})
5... Nc6 {Le cavalier attaque e5. [%cal Gc6e5]}
6. exd6 cxd6 {La reprise : vous avez un pion central de plus et la colonne c.}`,
          conclusion:
            "Contre 3.Bc4, …Nb6 gagne un temps sur le fou. …d6 et …Nc6 attaquent e5, et la reprise …cxd6 vous donne la majorité centrale.",
        },
        {
          legacyIds: ["alekhine-m5"],
          title: "Quatre Pions : 6…Bf5 7.Nc3",
          eco: "B03",
          kind: "line",
          objectives: [
            "Développer le fou en f5 avant …Nc6",
            "Clouer le cavalier c3 par …Bb4",
            "Attaquer le centre par …c5",
          ],
          pgn: `{Une alternative à 6…Nc6 : 6…Bf5 sort le fou tout de suite. Après …e6, le fou f8 va en b4 pour clouer le cavalier c3, et …c5 attaque d4.}
${FOUR} Bf5 7. Nc3 e6 8. Be3
(8. Nf3 Nc6 {Le cavalier attaque e5 et d4. [%cal Gc6e5]} 9. Be3 Be7 {Le fou se développe : on retrouve la ligne principale.})
8... Bb4 {Le fou cloue le cavalier c3. [%cal Gb4c3]}
9. Nf3 c5 {Le levier attaque d4 : le pion e5 perd son soutien. [%cal Gc5d4]}`,
          conclusion:
            "Avec 6…Bf5, vous gardez la souplesse : …Bb4 cloue le cavalier c3 et …c5 attaque d4, la base du centre blanc.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Pièges",
      summary:
        "Les erreurs blanches typiques contre l'Alekhine : le centre laissé sans soutien par Nc3 ou Bf4, la dame sortie trop tôt et la dame f3 dans l'échange.",
      stage: "traps",
      lessons: TRAPS,
    },
    // =====================================================================================
    {
      title: "Grande théorie",
      summary:
        "Les lignes profondes : la moderne avec h3 et …Nc4, la poussée d5 dans les Quatre Pions, la structure …Ne5 dans l'échange et la ligne …Nc6 avec d5 dans la moderne.",
      stage: "theory",
      lessons: [
        {
          title: "La moderne avec h3 : …Bh5, …d5 et …Nc4",
          eco: "B05",
          kind: "line",
          objectives: [
            "Garder le clouage par …Bh5 contre h3",
            "Échanger en f3 contre c5",
            "Installer le cavalier en c4 après Bxf3",
          ],
          pgn: `{Si les Blancs insèrent h3, votre fou recule en h5. Le plan reste …d5 ; après c5 et …Bxf3, la reprise du fou laisse la case c4 à votre cavalier.}
${MODERN} 7. h3 Bh5 8. c4 Nb6 9. Nc3 O-O 10. Be3 d5 11. c5 Bxf3 {L'échange avant le recul du cavalier. [%cal Gh5f3]}
12. Bxf3
(12. gxf3 Nc8 {Le cavalier recule : les pions f doublés seront une cible.})
12... Nc4 {Le cavalier attaque le fou e3 et b2. [%cal Gc4e3,Gc4b2]}
13. Bf4 Nc6 {Le cavalier attaque d4 : vos deux cavaliers dominent l'aile dame. [%cal Gc6d4]}`,
          conclusion:
            "Avec h3, le fou recule en h5 mais le plan reste …d5. Après Bxf3, le cavalier c4 et le cavalier c6 attaquent la chaîne blanche.",
        },
        {
          title: "Quatre Pions : 10.d5 exd5 11.cxd5 Nb4",
          eco: "B03",
          kind: "line",
          objectives: [
            "Prendre en d5 et sauter en b4",
            "Reculer le fou en d7 contre Nd4",
            "Reprendre …fxe6 et défendre par …Bc6",
          ],
          pgn: `{La ligne la plus aiguë des Quatre Pions : 10.d5 attaque votre cavalier c6. Vous prenez en d5, le cavalier va en b4, et après e6 vous rendez le pion pour centraliser le fou en c6.}
${FOUR} Nc6 7. Be3 Bf5 8. Nc3 e6 9. Nf3 Be7 10. d5 exd5 11. cxd5 Nb4 {Le cavalier vise d3 et c2. [%cal Gb4c2,Gb4d3]}
12. Nd4 Bd7 {Le fou recule et garde un œil sur e6. [%cal Gd7e6]}
13. e6
(13. Qf3 c5 {Le levier attaque le cavalier d4.})
13... fxe6 14. dxe6 Bc6 {Le fou se centralise et attaque g2 : le pion e6 sera une cible. [%cal Gc6g2]}`,
          conclusion:
            "Contre 10.d5, …exd5 et …Nb4 contre-attaquent. Après e6, …fxe6 et …Bc6 placent le fou sur la grande diagonale.",
        },
        {
          title: "L'échange : 9.b3 Nc6 10.d5 Ne5",
          eco: "B03",
          kind: "line",
          objectives: [
            "Attaquer d4 par …Nc6 contre Rc1 et b3",
            "Centraliser le cavalier en e5 contre d5",
            "Jouer …f5 pour gagner de l'espace",
          ],
          pgn: `{Une alternative à 9…e5 : 9…Nc6 attaque d4. Après d5, le cavalier se centralise en e5, et …f5 gagne de l'espace à l'aile roi.}
${EXCH} 6. Nc3 g6 7. Be3 Bg7 8. Rc1 O-O 9. b3 Nc6 {Le cavalier attaque d4 avec le fou g7. [%cal Gc6d4]}
10. d5 Ne5 {Le cavalier s'installe en e5 : il ne peut plus être chassé par un pion d. [%cal Ge5c4]}
11. Be2 f5 {Le pion f gagne de l'espace et prépare …f4. [%cal Gf5f4]}
12. f4 {Le pion chasse le cavalier, qui recule en d7 ou en f7.}`,
          conclusion:
            "Contre d5, le cavalier e5 est votre pièce clé. Avec …f5, vous gagnez de l'espace ; f4 chasse le cavalier mais affaiblit e4.",
        },
        {
          title: "La moderne : …Nc6, exd6 et d5",
          eco: "B05",
          kind: "line",
          objectives: [
            "Attaquer d4 par …Nc6 contre Be3",
            "Reprendre …exd5 contre d5",
            "Jouer …d5 et …Nc8 contre b3 et c5",
          ],
          pgn: `{Avec 9…Nc6, vous mettez la pression sur d4 avant de bloquer le centre. Après exd6 cxd6, les Blancs choisissent entre d5, qui ouvre la colonne e, et b3, qui prépare c5.}
${MODERN} 7. c4 Nb6 8. Nc3 O-O 9. Be3 Nc6 10. exd6 cxd6 11. b3
(11. d5 exd5 {La prise ouvre la colonne e et libère la case e6 pour vos pièces.} 12. Nxd5 {Le cavalier s'installe en d5, mais votre fou g4 reste actif.})
11... d5 {Le pion fixe le centre : c4 est attaqué. [%cal Gd5c4]}
12. c5 Nc8 {Le cavalier recule pour revenir par e7 ou a7.}`,
          conclusion:
            "Avec …Nc6 et …cxd6, vous gardez un centre souple. Contre b3 et c5, …d5 et …Nc8 reprennent le schéma de blocage.",
        },
      ],
    },
  ],
};
