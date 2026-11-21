// Brouillon de la Masterclass « Partie anglaise » (côté Blancs) : 1.c4.
// Répertoire : schéma g3-Bg2 contre 1…e5 (Quatre cavaliers, fermée, Botvinnik), contre 1…c5
// (symétrique, Hérisson) et contre les défenses indiennes (Botvinnik avec e4-Nge2),
// la Mikenas 3.e4 contre 1…Nf6 2.Nc3 e6, et le schéma Réti contre 1…e6.
// L'ordre 3.d4 contre la symétrique (Deux cavaliers, 6.Ndb5) est une alternative.
// Les flèches du coup à jouer sont ajoutées par scripts/course-builder.mjs ; celles écrites ici
// illustrent une idée (cible, manœuvre, menace).
import { TRAPS } from "./english-traps.mjs";

const SYM = "1. c4 c5 2. Nf3 Nf6 3. g3 g6 4. Bg2 Bg7 5. O-O O-O 6. Nc3 Nc6";
const FK = "1. c4 e5 2. Nc3 Nf6 3. Nf3 Nc6 4. g3";
const CL = "1. c4 e5 2. Nc3 Nc6 3. g3 g6 4. Bg2 Bg7 5. d3 d6";
const HEDGE = "1. c4 c5 2. Nf3 Nf6 3. g3 b6 4. Bg2 Bb7 5. O-O e6 6. Nc3 Be7 7. d4 cxd4 8. Qxd4 d6";

export default {
  id: "english",
  name: "Partie anglaise",
  description:
    "1.c4 : une ouverture de flanc qui contrôle d5 et garde le centre en réserve. Un répertoire complet côté Blancs avec le schéma g3-Bg2, la Sicilienne inversée, la fermée et le système Botvinnik, la symétrique et le Hérisson, la Mikenas contre 1…Nf6, pièges et grandes lignes.",
  side: "white",
  eco: ["A16", "A17", "A18", "A21", "A22", "A26", "A29", "A30", "A33", "A38", "A39"],
  chapters: [
    // =====================================================================================
    {
      title: "Les fondations",
      summary:
        "L'idée de 1.c4 et du fianchetto g3-Bg2, la symétrique 1…c5, les Quatre cavaliers inversés et le système Botvinnik contre l'Est-Indienne.",
      stage: "foundations",
      lessons: [
        {
          title: "1.c4 : contrôler d5 et fianchetter le fou",
          eco: "A22",
          kind: "concept",
          objectives: [
            "Contrôler la case d5 avec le pion c4 et le cavalier c3",
            "Installer le fou en g2 sur la grande diagonale",
            "Reconnaître les quatre grandes réponses noires",
          ],
          pgn: `{La Partie anglaise attaque le centre par le côté : le pion c4 surveille d5, le cavalier c3 le renforce, et le fou g2 balaie la grande diagonale vers b7. Vous jouez une Sicilienne avec un temps de plus.}
1. c4 e5 {Les Noirs occupent le centre : c'est la Sicilienne inversée. [%cal Ge5d4]}
(1... c5 2. Nf3 {Contre la symétrique, le cavalier soutient la poussée d4. [%cal Gf3d4]})
(1... Nf6 2. Nc3 {Le cavalier contrôle d5 et e4. [%cal Gc3d5,Gc3e4]})
(1... e6 2. Nf3 {Contre …e6 et …d5, le schéma Réti avec g3 et b3 convient.})
2. Nc3 Nf6 3. Nf3 Nc6 4. g3 {Le pion prépare le fianchetto : le fou g2 visera d5 et b7. [%cal Gf1g2]}
4... d5 5. cxd5 Nxd5 6. Bg2 {Le fou attaque le cavalier d5 sur la grande diagonale. [%cal Gg2d5]}`,
          conclusion:
            "L'Anglaise repose sur le contrôle de d5 et la diagonale du fou g2. Le centre est attaqué de côté, et vos pièces se placent avant toute bataille directe.",
        },
        {
          legacyIds: ["english-m1"],
          title: "La symétrique 1…c5 : le schéma g3-Bg2",
          eco: "A30",
          kind: "line",
          objectives: [
            "Répondre à la symétrie par le fianchetto et le roque",
            "Préparer la poussée d4 avec le cavalier f3",
            "Centraliser la dame en d3 après les échanges en d4",
          ],
          pgn: `{Dans la symétrique, les Noirs copient vos coups. Vous gardez l'initiative grâce au trait : après le roque, la poussée d4 ouvre le centre au moment où vos pièces sont prêtes.}
1. c4 c5 2. Nf3 Nf6 3. g3 g6
(3... d5 4. cxd5 Nxd5 5. Bg2 {Le fou attaque d5 : le cavalier noir doit se déplacer. [%cal Gg2d5]})
(3... b6 4. Bg2 Bb7 {C'est le Hérisson, étudié plus loin.})
4. Bg2 Bg7 5. O-O O-O 6. Nc3 Nc6 7. d4 {La poussée centrale ouvre la colonne d. [%cal Gd4c5]}
7... cxd4 8. Nxd4 Nxd4 9. Qxd4 d6 10. Qd3 {La dame quitte la diagonale du fou g7 et surveille d6. [%cal Gd3d6]}`,
          conclusion:
            "Dans la symétrique, d4 au bon moment donne à vos pièces le centre. La dame en d3 évite les tactiques sur la grande diagonale.",
        },
        {
          title: "Les Quatre cavaliers inversés : 4.g3",
          eco: "A29",
          kind: "line",
          objectives: [
            "Fianchetter le fou contre …d5 pour attaquer d5",
            "Roquer puis lancer a3 et b4 à l'aile dame",
            "Contrer …Bb4 par le roque et Ng5",
          ],
          pgn: `{Contre les Quatre cavaliers, 4.g3 prépare Bg2. Si les Noirs jouent …d5, c'est une Sicilienne Dragon inversée : votre plan est l'expansion a3-b4 à l'aile dame.}
${FK} d5
(4... Bb4 5. Bg2 O-O 6. O-O e4 {Le pion chasse le cavalier f3.} 7. Ng5 {Le cavalier vise e4 et prépare f3. [%cal Gg5e4]})
5. cxd5 Nxd5 6. Bg2 Nb6 7. O-O Be7 8. a3 {Le pion prépare b4 et l'expansion à l'aile dame. [%cal Ga3b4]}
8... O-O 9. b4 Be6 10. Rb1 {La tour soutient l'avance b5. [%cal Gb1b5]}`,
          conclusion:
            "Contre les Quatre cavaliers, g3 et Bg2 visent d5. Après …d5, a3, b4 et Rb1 lancent une attaque de minorité à l'aile dame.",
        },
        {
          legacyIds: ["english-m5"],
          title: "Contre …g6 : le système Botvinnik",
          eco: "A16",
          kind: "line",
          objectives: [
            "Bâtir l'étau c4-e4 pour contrôler d5",
            "Développer le cavalier en e2 pour garder le pion f libre",
            "Préparer f4 après le roque",
          ],
          pgn: `{Contre un fianchetto noir, le système Botvinnik place les pions en c4 et e4 : la case d5 devient votre poste. Le cavalier va en e2 pour laisser le pion f partir en f4.}
1. c4 g6 2. Nc3 Bg7 3. g3 Nf6 4. Bg2 O-O 5. e4 {Les pions c4 et e4 verrouillent d5. [%cal Gc4d5,Ge4d5]}
5... d6 6. Nge2 e5
(6... c5 7. O-O Nc6 8. d3 {Le pion d3 complète l'étau ; f4 viendra ensuite. [%cal Gf2f4]})
7. O-O c6 8. d3 a6 9. h3 {Le pion prépare Be3 et f4 sans craindre …Ng4. [%cal Gh3g4]}`,
          conclusion:
            "Le système Botvinnik est un schéma : c4, e4, Nge2, d3, puis f4. La case d5 reste à vous, et le pion f ouvre le jeu à l'aile roi.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Plans typiques",
      summary:
        "Le système Botvinnik contre la fermée, l'attaque à l'aile dame des Quatre cavaliers, la finale des Deux cavaliers et l'étau du Hérisson.",
      stage: "plans",
      lessons: [
        {
          title: "La fermée : Botvinnik et la case d5",
          eco: "A26",
          kind: "line",
          objectives: [
            "Installer le cavalier en d5 face à la fermée",
            "Garder le cavalier e2 pour soutenir f4",
            "Échanger le fou e6 noir quand il conteste d5",
          ],
          pgn: `{Contre la fermée (…Nc6, …g6, …Bg7), vous construisez le même étau c4-e4 et sautez en d5. Les Noirs ne peuvent chasser ce cavalier qu'en jouant …c6, ce qui affaiblit d6.}
${CL} 6. e4 Nge7
(6... f5 7. Nge2 Nf6 8. O-O O-O 9. Nd5 {Le cavalier occupe d5 avant que …c6 ne soit possible. [%cal Gd5f6]})
7. Nge2 O-O 8. O-O Be6 9. Nd5 {Le cavalier s'installe en d5, soutenu par c4 et e4. [%cal Gd5e7]}
9... Qd7 10. Be3 {Le fou prépare Qd2 et la poussée f4. [%cal Gf2f4]}`,
          conclusion:
            "Contre la fermée, le cavalier d5 est votre meilleure pièce. Be3, Qd2 et f4 suivent, et les Noirs manquent d'espace.",
        },
        {
          title: "Dragon inversé : l'attaque a3-b4-b5",
          eco: "A29",
          kind: "line",
          objectives: [
            "Poursuivre l'expansion par b5 pour chasser le cavalier c6",
            "Répondre à …Nd4 en repliant le cavalier en d2",
            "Viser le pion e5 et la colonne c",
          ],
          pgn: `{Dans le Dragon inversé, votre trait de plus rend l'attaque b4-b5 très rapide. Le cavalier c6 est chassé, le pion e5 perd un défenseur et votre fou g2 vise b7.}
${FK} d5 5. cxd5 Nxd5 6. Bg2 Nb6 7. O-O Be7 8. a3 O-O 9. b4 Be6 10. Rb1 f6 {Le pion f6 soutient e5 contre Ng5 et Nxe5.}
11. d3 a5 12. b5 {Le pion chasse le cavalier c6. [%cal Gb5c6]}
12... Nd4 13. Nd2 {Le cavalier rejoint b3 ou e4 et ouvre la diagonale du fou g2. [%cal Gg2b7]}`,
          conclusion:
            "Dans le Dragon inversé, b4-b5 frappe l'aile dame avant que les Noirs n'attaquent. Le fou g2 sur la grande diagonale rend chaque ouverture favorable.",
        },
        {
          legacyIds: ["english-m2"],
          title: "Les Deux cavaliers : 6.Ndb5 d5 et la finale",
          eco: "A33",
          kind: "line",
          objectives: [
            "Viser d6 par Ndb5 après l'ouverture du centre par d4",
            "Jouer Bf4 pour contrôler c7 et d6",
            "Exploiter la structure noire dans la finale sans dames",
          ],
          pgn: `{L'ordre 3.d4 ouvre la symétrique tout de suite. Après …e6 et …Nc6, le cavalier saute en b5 pour viser d6. La suite forcée mène à une finale où les pions noirs doublés sont des cibles.}
1. c4 c5 2. Nf3 Nf6 3. d4 cxd4 4. Nxd4 e6
(4... e5 5. Nb5 d5 6. cxd5 Bc5 7. N5c3 {Le cavalier revient défendre et le pion d5 reste un pion de plus. [%cal Gc3d5]})
5. Nc3 Nc6 6. Ndb5 d5
(6... Bb4 7. a3 Bxc3+ 8. Nxc3 {Vous gardez la paire de fous.})
7. Bf4 e5 8. cxd5 exf4 9. dxc6 bxc6 10. Qxd8+ Kxd8 11. Rd1+ Bd7 12. Nd6 {Le cavalier attaque f7 et b7. [%cal Gd6f7,Gd6b7]}`,
          conclusion:
            "La ligne 6.Ndb5 d5 mène à une finale où les pions c6 et f4 sont isolés. Vos cavaliers et votre tour d1 en tirent un avantage durable.",
        },
        {
          legacyIds: ["english-m3"],
          title: "Le Hérisson : espace et poussée e4",
          eco: "A30",
          kind: "line",
          objectives: [
            "Prendre en d4 de la dame et la centraliser",
            "Placer la tour en d1 contre le pion d6",
            "Gagner de l'espace par e4 et surveiller …b5 et …d5",
          ],
          pgn: `{Le Hérisson est une défense d'attente : les Noirs restent sur trois rangées et guettent …b5 ou …d5. Vous prenez tout l'espace, mais chaque coup doit freiner ces deux ruptures.}
${HEDGE} 9. Rd1 {La tour fait face au pion d6, la faiblesse noire. [%cal Gd1d6]}
9... a6 10. b3 Nbd7 11. e4 {Le pion e4 contrôle d5 et freine …d5. [%cal Ge4d5]}
11... Qc7 12. Ba3 {Le fou vise d6 et ralentit …b5. [%cal Ga3d6]}`,
          conclusion:
            "Contre le Hérisson, prenez l'espace avec e4, la tour en d1 et le fou en a3. Le pion d6 reste la cible, et …b5 comme …d5 sont surveillés.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Réponses adverses",
      summary:
        "1…e6 avec le schéma Réti, la Mikenas 3.e4 contre 1…Nf6 2.Nc3 e6, la Kramnik-Shirov 2…Bb4 et l'Anglaise-Grünfeld 2…d5.",
      stage: "responses",
      lessons: [
        {
          title: "1…e6 : g3, b3 et Bb2",
          eco: "A13",
          kind: "line",
          objectives: [
            "Jouer le double fianchetto contre …d5",
            "Placer le fou en b2 face au roque noir",
            "Garder le centre souple avec e3",
          ],
          pgn: `{Contre 1…e6 et …d5, vous restez dans l'esprit Réti : fous en g2 et b2, centre souple. Les Noirs n'ont aucune cible, et vos fous croisent leur feu sur le roque.}
1. c4 e6 2. Nf3 d5 3. g3 Nf6 4. Bg2 Be7
(4... dxc4 5. Qa4+ Nbd7 6. Qxc4 a6 7. Qc2 {La dame récupère le pion et se met à l'abri.})
5. O-O O-O 6. b3 c5 7. Bb2 {Le deuxième fou vise le roque noir. [%cal Gb2g7]}
7... Nc6 8. e3 b6 9. Nc3 {Le cavalier rejoint le centre ; d4 ou d3 suivra selon la position.}`,
          conclusion:
            "Contre 1…e6, le double fianchetto place vos fous sur les deux grandes diagonales. Le centre reste souple et vos pièces visent le roque noir.",
        },
        {
          title: "La Mikenas : 1…Nf6 2.Nc3 e6 3.e4",
          eco: "A18",
          kind: "line",
          objectives: [
            "Prendre le centre par e4 contre …e6",
            "Gagner du temps par e5 contre le cavalier f6",
            "Reprendre en c3 et développer vite",
          ],
          pgn: `{Contre 2…e6, la poussée 3.e4 interdit la transposition en Nimzo-Indienne. Après …d5, e5 chasse le cavalier : la position s'ouvre et votre développement compte.}
1. c4 Nf6 2. Nc3 e6 3. e4 d5
(3... c5 4. e5 Ng8 5. Nf3 Nc6 6. d4 {Le centre s'ouvre ; le pion e5 gêne le cavalier g8.} 6... cxd4 7. Nxd4 Nxe5 8. Ndb5 {Le cavalier vise d6. [%cal Gb5d6]})
4. e5 d4 5. exf6 dxc3 6. bxc3 Qxf6 7. Nf3 {Le cavalier se développe et prépare d4. [%cal Gf3d4]}
7... e5 8. Bd3 {Le fou se développe avant le roque ; la dame ira en e2. [%cal Ge1g1]}`,
          conclusion:
            "Contre 2…e6, la Mikenas 3.e4 vous donne un jeu ouvert. Après les échanges, votre avance de développement compense la structure.",
        },
        {
          title: "La Kramnik-Shirov : 2…Bb4 3.Nd5",
          eco: "A21",
          kind: "line",
          objectives: [
            "Chasser le fou b4 par Nd5",
            "Gagner la paire de fous par Nxe7",
            "Occuper le centre par d4 et e4",
          ],
          pgn: `{Avec 2…Bb4, les Noirs veulent échanger en c3 pour doubler vos pions. 3.Nd5 attaque le fou et évite l'échange : vous gagnez du temps et la paire de fous.}
1. c4 e5 2. Nc3 Bb4 3. Nd5 Be7
(3... Bc5 4. Nf3 {Le cavalier attaque e5 et se développe. [%cal Gf3e5]})
(3... a5 4. Nf3 {Le développement passe avant tout : le fou b4 reste sans cible.})
4. d4 d6
(4... exd4 5. Qxd4 Nf6 6. Nxe7 {Le cavalier prend le fou : la paire de fous est à vous.})
5. e4 Nf6 6. Nxe7 Qxe7 {Vous avez la paire de fous et un centre e4-d4.}`,
          conclusion:
            "Contre 2…Bb4, Nd5 garde votre structure intacte. La paire de fous et le centre e4-d4 sont votre récompense.",
        },
        {
          title: "L'Anglaise-Grünfeld : 2…d5 3.cxd5",
          eco: "A16",
          kind: "line",
          objectives: [
            "Prendre en d5 et fianchetter le fou",
            "Reprendre en c3 avec le pion b",
            "Utiliser la colonne b avec Rb1",
          ],
          pgn: `{Contre 2…d5, vous prenez en d5 puis fianchettez : le fou g2 attaque le cavalier d5. Après l'échange en c3, la colonne b semi-ouverte donne à votre tour une cible en b7.}
1. c4 Nf6 2. Nc3 d5 3. cxd5 Nxd5 4. g3 g6
(4... e5 5. Bg2 {Le fou vise d5 et b7. [%cal Gg2b7]})
5. Bg2 Nxc3 6. bxc3 Bg7 7. Rb1 {La tour attaque b7 sur la colonne semi-ouverte. [%cal Gb1b7]}
7... Nd7 8. Nf3 {Le cavalier se développe ; le roque suivra.}`,
          conclusion:
            "Contre l'Anglaise-Grünfeld, la tour en b1 et le fou en g2 visent b7. Votre centre c3-d2 est souple et pourra s'étendre par d4.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Pièges",
      summary: "Quatre pièges blancs : Nxe5 contre …d5 prématuré, Ng5 et Nb5 contre le Hérisson, Nxe5 dans la symétrique.",
      stage: "traps",
      lessons: TRAPS,
    },
    // =====================================================================================
    {
      title: "Grande théorie",
      summary:
        "La symétrique avec 8…Ng4, la Sicilienne inversée avec 4…Bb4 et 7.Ng5, le Hérisson avec la percée e5 et le Botvinnik contre l'Est-Indienne.",
      stage: "theory",
      lessons: [
        {
          legacyIds: ["english-m4"],
          title: "Symétrique : 7.d4 cxd4 8.Nxd4 Ng4",
          eco: "A39",
          kind: "line",
          objectives: [
            "Répondre à …Ng4 par e3 pour protéger d4",
            "Reprendre en d4 du pion après l'échange des cavaliers",
            "Développer le fou en b2 et chasser le cavalier f5 par Nd5",
          ],
          pgn: `{Dans la symétrique pure, 8…Ng4 attaque d4 avec le cavalier et le fou g7. Vous défendez par e3, puis b3 et Bb2 : le pion d4 devient un atout au centre.}
1. c4 c5 2. Nc3 Nc6 3. g3 g6 4. Bg2 Bg7 5. Nf3 Nf6 6. O-O O-O 7. d4 cxd4 8. Nxd4 Ng4 9. e3 {Le pion e3 protège d4 contre le cavalier et le fou. [%cal Ge3d4]}
9... d6 10. b3 Nxd4 11. exd4 Nh6 12. Bb2 {Le fou soutient d4 et ferme la diagonale du fou g7. [%cal Gb2d4]}
12... Nf5 13. Nd5 {Le cavalier s'installe en d5 et ferme la diagonale du fou g7. [%cal Gd5e7]}`,
          conclusion:
            "Contre 8…Ng4, e3 et b3 consolident d4. Le pion devient un atout central, et le cavalier d5 domine la position.",
        },
        {
          title: "Sicilienne inversée : 4…Bb4 et 7.Ng5",
          eco: "A29",
          kind: "line",
          objectives: [
            "Répondre à …e4 par Ng5 et f3",
            "Accepter les pions doublés en échange du centre",
            "Ouvrir la colonne f après …exf3",
          ],
          pgn: `{Avec 4…Bb4 et 6…e4, les Noirs gagnent de l'espace. Votre réponse : Ng5 attaque e4, puis f3 ouvre le centre. Les pions doublés c3-c4 sont compensés par la colonne f et le centre d4.}
${FK} Bb4 5. Bg2 O-O 6. O-O e4 7. Ng5 Bxc3 8. bxc3 Re8 9. f3 {Le pion attaque e4 pour ouvrir le jeu. [%cal Gf3e4]}
9... exf3
(9... e3 10. d3 {Le pion e3 est isolé au milieu du camp blanc : il tombera tôt ou tard. [%cal Gc1e3]})
10. Nxf3 d5 11. d4 {Le pion d4 bâtit un centre solide. [%cal Gd4d5]}`,
          conclusion:
            "Dans la Sicilienne inversée avec …Bb4, f3 casse le pion e4. Votre centre c3-d4, la colonne f et le fou g2 compensent largement les pions doublés.",
        },
        {
          title: "Le Hérisson : 12.Ba3 Nc5 13.e5",
          eco: "A30",
          kind: "line",
          objectives: [
            "Répondre à …Nc5 par la percée e5",
            "Ouvrir la colonne d contre le roi noir resté au centre",
            "Échanger les dames et exploiter la finale",
          ],
          pgn: `{Avec 12.Ba3, le fou cloue presque le pion d6. Les Noirs répondent par …Nc5 pour attaquer e4 : la percée e5 ouvre alors la colonne d au moment où leur roi n'a pas roqué.}
${HEDGE} 9. Rd1 a6 10. b3 Nbd7 11. e4 Qc7 12. Ba3 Nc5 {Le cavalier attaque e4 et vise b3. [%cal Gc5e4]}
13. e5 {Le pion ouvre la position avant que les Noirs ne roquent. [%cal Ge5d6]}
13... dxe5 14. Qxe5 Rc8
(14... Qxe5 15. Nxe5 {Le fou g2 et le cavalier e5 attaquent b7 et f7. [%cal Gg2b7,Ge5f7]})
15. Qxc7 Rxc7 {Les dames ont disparu : votre tour d1 et votre fou a3 restent plus actifs. [%cal Gd1d8]}`,
          conclusion:
            "Contre …Nc5 dans le Hérisson, la percée e5 ouvre la colonne d. La finale qui suit vous laisse des pièces plus actives.",
        },
        {
          title: "Botvinnik contre l'Est-Indienne : 6…c5",
          eco: "A16",
          kind: "line",
          objectives: [
            "Répondre à …c5 par le roque et d3",
            "Préparer f4 contre …a6 et …b5",
            "Garder d5 sous contrôle",
          ],
          pgn: `{Avec 6…c5, les Noirs préparent …a6 et …b5 contre c4. Vous terminez l'étau par d3, puis h3, Be3 et Qd2 avant de pousser f4.}
1. c4 Nf6 2. Nc3 g6 3. g3 Bg7 4. Bg2 O-O 5. e4 d6 6. Nge2 c5 7. O-O Nc6 8. d3 a6 9. h3 {Le pion empêche …Ng4 et …Bg4. [%cal Gh3g4]}
9... Rb8 10. a4 {Le pion freine …b5 et gagne du temps pour l'aile roi. [%cal Ga4b5]}
10... Ne8 11. Be3 {Le fou vise c5 et prépare Qd2. [%cal Ge3c5]}
11... Nc7 12. d4 {La poussée ouvre le centre contre les pièces noires tournées vers l'aile dame. [%cal Gd4c5]}`,
          conclusion:
            "Contre …c5 dans le Botvinnik, d3, h3 et Be3 préparent f4. Les Noirs attaquent c4, mais d5 reste votre case.",
        },
      ],
    },
  ],
};
