// Brouillon de la Masterclass « Partie viennoise » (côté Blancs) : 1.e4 e5 2.Nc3.
// Répertoire : 3.Bc4 contre 2…Nf6 (…Nc6, …Bc5 et la Frankenstein-Dracula 3…Nxe4),
// les plans 3.g3 et le gambit viennois 3.f4 d5, et les réponses 2…Bc5, 2…Nc6 et 2…d6.
// Les gambits Pierce et Hamppe-Muzio (2…Nc6 3.f4 exf4 4.Nf3 g5) sont jugés trop risqués par
// Stockfish : leurs anciens cours sont rattachés aux lignes 2…Nc6 de ce répertoire.
// Les flèches du coup à jouer sont ajoutées par scripts/course-builder.mjs ; celles écrites ici
// illustrent une idée (cible, manœuvre, menace).
import { TRAPS } from "./vienna-traps.mjs";

export default {
  id: "vienna",
  name: "Partie viennoise",
  description:
    "1.e4 e5 2.Nc3 : une ouverture souple qui prépare f4 tout en gardant le choix entre jeu positionnel et attaque. Un répertoire complet côté Blancs avec 3.Bc4, le fianchetto 3.g3, le gambit viennois 3.f4 d5, les réponses 2…Bc5, 2…Nc6 et 2…d6, pièges et grandes lignes.",
  side: "white",
  eco: ["C25", "C26", "C27", "C28", "C29"],
  chapters: [
    // =====================================================================================
    {
      title: "Les fondations",
      summary:
        "Les idées de 2.Nc3, le système 3.Bc4 contre …Nc6, …Bc5 et la Frankenstein-Dracula, et la manœuvre …Na5 contre le fou c4.",
      stage: "foundations",
      lessons: [
        {
          title: "2.Nc3 : préparer f4 et contrôler d5",
          eco: "C28",
          kind: "concept",
          objectives: [
            "Développer le cavalier b1 avant le cavalier g1",
            "Garder la poussée f4 en réserve",
            "Répondre à …d5 en simplifiant au centre",
          ],
          pgn: `{La Viennoise développe d'abord le cavalier dame : il contrôle d5 et laisse le pion f libre d'avancer. Le fou c4 et la poussée d3 forment un centre solide.}
1. e4 e5 2. Nc3 {Le cavalier surveille d5 et e4 ; f4 reste possible. [%cal Gc3d5,Gf2f4]}
2... Nf6
(2... Nc6 3. Bc4 Nf6 4. d3 {Par interversion, la même position que la ligne principale.})
(2... Bc5 3. Nf3 d6 4. d4 {Contre …Bc5, la poussée d4 gagne du temps sur le fou. [%cal Gd4c5]})
3. Bc4 Nc6 4. d3 Bb4 {Le fou cloue le cavalier c3 et prépare …d5. [%cal Gb4c3]}
(4... Na5 5. Nge2 {Le cavalier e2 protège c3 : la paire de fous n'est pas un drame.})
5. Ne2 {Le cavalier g1 va en e2 pour défendre c3 et préparer f4. [%cal Ge2c3]}
5... d5 6. exd5 Nxd5 7. O-O Be6 8. Bxd5 Bxd5 9. f4 {La poussée ouvre la colonne f pour vos tours. [%cal Gf4e5,Gf1f8]}`,
          conclusion:
            "La Viennoise repose sur Nc3, Bc4, d3 et f4. Votre cavalier g1 va souvent en e2 pour laisser le pion f libre.",
        },
        {
          legacyIds: ["vienna-m1"],
          title: "3…Bc5 4.d3 d6 5.f4 : la chasse au fou",
          eco: "C28",
          kind: "line",
          objectives: [
            "Pousser f4 pour attaquer e5",
            "Échanger le fou c5 par Na4",
            "Roquer avec une colonne f semi-ouverte",
          ],
          pgn: `{Contre 3…Bc5, la poussée f4 crée une menace immédiate sur e5. Si les Noirs clouent le cavalier f3 par …Bg4, la manœuvre Na4 élimine le fou c5.}
1. e4 e5 2. Nc3 Nf6 3. Bc4 Bc5 4. d3 d6
(4... c6 5. Nf3 d6 {Les Noirs préparent …b5 ; le fou c4 reculera en b3.})
5. f4 {Le pion attaque e5 ; la colonne f s'ouvrira bientôt. [%cal Gf4e5]}
5... Nc6 6. Nf3 Bg4 7. Na4 {Le cavalier vise le fou c5, le plus dangereux des fous noirs. [%cal Ga4c5]}
7... Bb6 8. Nxb6 axb6 9. c3 {Le pion c3 contrôle d4 et prépare Qb3 contre b7 et f7. [%cal Gc3d4]}`,
          conclusion:
            "Contre …Bc5, le plan f4 et Na4 vous donne la paire de fous et une pression durable sur la colonne f.",
        },
        {
          legacyIds: ["vienna-m2"],
          title: "Frankenstein-Dracula : 3…Nxe4 4.Qh5",
          eco: "C27",
          kind: "line",
          objectives: [
            "Menacer mat en f7 par Qh5 après …Nxe4",
            "Reculer le fou en b3 contre …Nxc4",
            "Gagner la tour a8 dans la ligne principale",
          ],
          pgn: `{La prise 3…Nxe4 est un faux sacrifice : après 4.Qh5, la dame attaque f7 et e5. Les Noirs doivent jouer …Nd6, puis la partie devient très tactique.}
1. e4 e5 2. Nc3 Nf6 3. Bc4 Nxe4 4. Qh5 {La dame menace Qxf7 mat. [%cal Gh5f7,Gc4f7]}
4... Nd6 5. Bb3 {Le fou évite l'échange et garde la diagonale a2-g8. [%cal Gb3f7]}
5... Nc6
(5... Be7 6. Nf3 Nc6 7. Nxe5 {Vous récupérez le pion e5 avec une position active.})
6. Nb5 g6 7. Qf3 f5 8. Qd5 Qe7 9. Nxc7+ Kd8 10. Nxa8 b6 {Vous avez une tour de plus, mais le cavalier a8 est piégé et le roi blanc reste au centre.}`,
          conclusion:
            "Dans la Frankenstein-Dracula, vous gagnez la qualité en a8. Les Noirs obtiennent l'initiative : il faudra ensuite rapatrier le roi et sortir les pièces vite.",
        },
        {
          legacyIds: ["vienna-m3"],
          title: "3…Nc6 4.d3 Na5 : céder le fou c4",
          eco: "C28",
          kind: "line",
          objectives: [
            "Développer Nge2 face à …Na5",
            "Reprendre en c4 avec le pion d",
            "Utiliser la colonne d semi-ouverte pour la dame",
          ],
          pgn: `{La manœuvre …Na5 vise à échanger votre fou c4. Ne la craignez pas : après dxc4, vous contrôlez d5 et la colonne d s'ouvre pour votre dame.}
1. e4 e5 2. Nc3 Nf6 3. Bc4 Nc6 4. d3 Na5 5. Nge2 {Le cavalier protège c3 et prépare le roque. [%cal Ge2c3]}
5... Nxc4
(5... c6 6. O-O b5 7. Bb3 {Le fou se replie et garde la diagonale vers f7.})
6. dxc4 Bc5 7. O-O d6 8. Qd3 {La dame occupe la colonne d et surveille d5. [%cal Gd3d6]}`,
          conclusion:
            "Contre …Na5, cédez la paire de fous : la reprise dxc4 vous donne la case d5 et une colonne pour la dame.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Plans typiques",
      summary:
        "La poussée f5 contre …Bc5, le fianchetto 3.g3 avec Rb1, le gambit viennois 3.f4 d5 et le fianchetto contre …Bc5.",
      stage: "plans",
      lessons: [
        {
          title: "3.Bc4 Nc6 4.d3 Bc5 5.f4 : la poussée f5",
          eco: "C28",
          kind: "line",
          objectives: [
            "Pousser f4 puis f5 pour gagner de l'espace",
            "Enfermer le fou c8 derrière le pion e6",
            "Préparer g4-g5 contre le roque noir",
          ],
          pgn: `{Quand les Noirs gardent leur fou c8 à l'abri par …a6, la poussée f5 prend l'espace sur l'aile roi et enferme le fou c8.}
1. e4 e5 2. Nc3 Nf6 3. Bc4 Nc6 4. d3 Bc5 5. f4 d6 6. Nf3 a6 {Les Noirs préparent une retraite pour le fou c5 en a7.}
7. f5 {Le pion f5 enferme le fou c8 et prépare g4. [%cal Gf5g6,Gg2g4]}
7... h6 8. Qe2 {La dame relie les pièces et soutient la future avancée g4. [%cal Ge2h5]}`,
          conclusion:
            "La poussée f5 vous donne un avantage d'espace durable. Votre plan suivant est g4-g5 pour ouvrir l'aile roi.",
        },
        {
          title: "3.g3 d5 : le fianchetto et la colonne b",
          eco: "C26",
          kind: "line",
          objectives: [
            "Répondre à …d5 par exd5 et Bg2",
            "Reprendre bxc3 pour ouvrir la colonne b",
            "Placer la tour en b1 contre le pion b7",
          ],
          pgn: `{Avec 3.g3, votre fou g2 vise le centre et l'aile dame. Après l'échange des cavaliers en c3, la colonne b semi-ouverte devient votre arme.}
1. e4 e5 2. Nc3 Nf6 3. g3 d5 4. exd5 Nxd5 5. Bg2 Nxc3
(5... Be6 6. Nf3 {Le cavalier attaque e5 ; le fou g2 vise le cavalier d5. [%cal Gf3e5,Gg2d5]})
6. bxc3 {La reprise ouvre la colonne b et renforce d4. [%cal Gb1b7]}
6... Bd6 7. Nf3 O-O 8. O-O Nc6
(8... Nd7 9. d4 {Le centre blanc se renforce par c3 et d4.})
9. d3 Bg4 10. h3 Bh5 11. Rb1 {La tour presse b7 : …Rb8 est presque obligé. [%cal Gb1b7]}`,
          conclusion:
            "Contre 3.g3 d5, la structure c3-d3 et la tour en b1 donnent un jeu simple : pression sur b7 et fou g2 dominant.",
        },
        {
          title: "Gambit viennois : 3.f4 d5 4.fxe5",
          eco: "C29",
          kind: "line",
          objectives: [
            "Gagner de l'espace par fxe5 contre …d5",
            "Développer Nf3, d4 et Bd3 contre le cavalier e4",
            "Échanger le cavalier e4 après …f5",
          ],
          pgn: `{Le gambit viennois 3.f4 frappe e5 tout de suite. Après …d5 et fxe5, le cavalier noir s'installe en e4, mais votre centre d4-e5 est solide.}
1. e4 e5 2. Nc3 Nf6 3. f4 d5 4. fxe5 Nxe4 5. Nf3 {Le cavalier défend e5 et contrôle d4. [%cal Gf3e5,Gf3d4]}
5... Be7
(5... Bg4 6. Qe2 {La dame attaque le cavalier e4 et défend f3.})
6. d4 O-O 7. Bd3 f5 8. exf6 Bxf6 9. O-O Nc6 10. Nxe4 dxe4 11. Bxe4 {Vous avez gagné un pion du centre ; les Noirs ont une avance de développement.}`,
          conclusion:
            "Dans le gambit viennois, le pion e5 vous donne de l'espace. Si le cavalier e4 est soutenu par …f5, échangez-le au bon moment.",
        },
        {
          title: "3.g3 Bc5 : Nge2 et la poussée d4",
          eco: "C26",
          kind: "line",
          objectives: [
            "Développer Nge2 pour garder f4 et d4 libres",
            "Reprendre en d5 avec le pion e",
            "Frapper le centre noir par d4",
          ],
          pgn: `{Contre 3…Bc5, le cavalier g1 va en e2 : il prépare d4 qui chasse le fou c5 et ouvre le jeu pour le fou g2.}
1. e4 e5 2. Nc3 Nf6 3. g3 Bc5 4. Bg2 O-O
(4... d6 5. Nge2 {Le même schéma : d4 viendra plus tard.})
5. Nge2 c6 6. O-O d5 7. exd5 cxd5 8. d4 {La poussée attaque le fou c5 et le pion isolé. [%cal Gd4c5]}
8... exd4 9. Nxd4 {Le cavalier d4 bloque le pion isolé ; le fou g2 vise d5. [%cal Gg2d5]}`,
          conclusion:
            "Contre …Bc5 et …d5, la poussée d4 laisse les Noirs avec un pion isolé en d5 : le fou g2 et le cavalier d4 le visent.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Réponses adverses",
      summary:
        "Les réponses 2…Bc5, 2…Nc6 avec 3…Bc5 et 2…d6, et les déviations 5…Bg4 dans le gambit viennois.",
      stage: "responses",
      lessons: [
        {
          title: "2…Bc5 3.Nf3 d6 4.d4",
          eco: "C25",
          kind: "line",
          objectives: [
            "Attaquer le centre par Nf3 et d4",
            "Centraliser le cavalier en d4",
            "Clouer le cavalier f6 par Bg5",
          ],
          pgn: `{Contre 2…Bc5, la poussée d4 ouvre le centre au moment où le fou c5 vise f2. Après l'échange, votre cavalier d4 est très actif.}
1. e4 e5 2. Nc3 Bc5 3. Nf3 d6 4. d4 exd4 5. Nxd4 Nf6 6. Bg5 {Le fou cloue le cavalier f6 sur la dame. [%cal Gg5f6,Gf6d8]}
6... h6 7. Bh4 {Le fou maintient le clouage ; Qd2 et O-O-O suivront. [%cal Gh4d8]}`,
          conclusion:
            "Contre 2…Bc5, d4 et Bg5 donnent une position ouverte où vos pièces sont plus actives que les pièces noires.",
        },
        {
          legacyIds: ["vienna-m4"],
          title: "2…Nc6 3.Bc4 Bc5 4.Qg4",
          eco: "C25",
          kind: "line",
          objectives: [
            "Attaquer g7 par Qg4 contre …Bc5",
            "Forcer un affaiblissement par …g6 ou …Kf8",
            "Développer Nge2 en gardant f4 possible",
          ],
          pgn: `{Contre 2…Nc6 et 3…Bc5, la sortie de dame Qg4 attaque g7. Les Noirs doivent affaiblir leur aile roi ou perdre le roque.}
1. e4 e5 2. Nc3 Nc6 3. Bc4 Bc5 4. Qg4 {La dame attaque g7 ; le fou c4 vise f7. [%cal Gg4g7,Gc4f7]}
4... g6
(4... Kf8 5. Qf3 {La dame regarde f7 ; le roi noir ne roquera plus.})
(4... Qf6 5. Nd5 {Le cavalier attaque la dame et c7. [%cal Gd5c7]})
5. Qg3 d6 6. Nge2 {Le cavalier rejoint e2 : d3 et f4 suivront. [%cal Ge2f4]}`,
          conclusion:
            "Contre …Bc5, Qg4 crée des faiblesses sur les cases noires du roque noir. Vos pièces se développent ensuite tranquillement.",
        },
        {
          title: "2…d6 3.f4 exf4 4.Nf3",
          eco: "C25",
          kind: "line",
          objectives: [
            "Pousser f4 contre la défense passive …d6",
            "Reprendre le contrôle de d4 par Nf3 et d4",
            "Récupérer le pion f4 plus tard",
          ],
          pgn: `{Contre 2…d6, les Noirs renoncent à …d5. La poussée f4 devient très forte : après …exf4, votre centre e4-d4 s'installe.}
1. e4 e5 2. Nc3 d6 3. f4 {Le pion attaque e5 : les Noirs ne peuvent pas répondre par …d5. [%cal Gf4e5]}
3... exf4 4. Nf3 {Le cavalier empêche …Qh4+ et prépare d4. [%cal Gf3h4]}
4... g5 5. d4 {Le centre e4-d4 prend toute la place. [%cal Gd4d5,Ge4e5]}`,
          conclusion:
            "Contre la défense passive …d6, le centre e4-d4 et la colonne f compensent largement le pion f4.",
        },
        {
          legacyIds: ["vienna-m5"],
          title: "Gambit viennois : 5…Bg4 6.Qe2",
          eco: "C29",
          kind: "line",
          objectives: [
            "Attaquer le cavalier e4 par Qe2",
            "Reprendre dxc3 pour ouvrir la colonne d",
            "Profiter de la paire de fous",
          ],
          pgn: `{Dans le gambit viennois, 5…Bg4 cloue le cavalier f3. La réponse 6.Qe2 attaque le cavalier e4 et prépare d3 : la colonne d et la paire de fous vous favorisent.}
1. e4 e5 2. Nc3 Nf6 3. f4 d5 4. fxe5 Nxe4 5. Nf3 Bg4 6. Qe2 {La dame attaque le cavalier e4 et soutient le cavalier f3. [%cal Ge2e4]}
6... Nxc3 7. dxc3 {La reprise ouvre la diagonale du fou c1 et la colonne d. [%cal Gc1g5]}`,
          conclusion:
            "Contre 5…Bg4, Qe2 et dxc3 ouvrent les lignes pour vos fous : la paire de fous compense la structure abîmée.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Pièges",
      summary: "Quatre pièges blancs : Bxd5 contre …Nc6 dans le fianchetto, Nxe5 contre …Bc5 et …Nc6, Bxf7+ contre …Ng4, et fxe5 contre 3…Bb4.",
      stage: "traps",
      lessons: TRAPS,
    },
    // =====================================================================================
    {
      title: "Grande théorie",
      summary:
        "La Frankenstein-Dracula jusqu'à …Nd4, la variante 5…Be7 6.Nf3, le gambit 5…Bc5 6.d4 Bb4 et le fianchetto avec Rb1.",
      stage: "theory",
      lessons: [
        {
          title: "Frankenstein-Dracula : 11.d3 Bb7 12.h4",
          eco: "C27",
          kind: "line",
          objectives: [
            "Activer la tour h1 par h4",
            "Ramener la dame en g4 pour défendre",
            "Rendre la qualité au bon moment",
          ],
          pgn: `{Après 10…b6, les Noirs veulent capturer le cavalier a8. La poussée h4 prépare l'entrée de la tour h1 et la défense de la dame.}
1. e4 e5 2. Nc3 Nf6 3. Bc4 Nxe4 4. Qh5 Nd6 5. Bb3 Nc6 6. Nb5 g6 7. Qf3 f5 8. Qd5 Qe7 9. Nxc7+ Kd8 10. Nxa8 b6 11. d3 Bb7 12. h4 {Le pion h4 prépare Bg5 et l'entrée de la tour h1. [%cal Gh4h5,Gc1g5]}
12... f4 13. Qf3 Nd4 14. Qg4 {La dame défend g5 et garde l'œil sur f4. [%cal Gg4f4]}`,
          conclusion:
            "Dans la Frankenstein-Dracula, le cavalier a8 finira par tomber. Votre compensation : un pion de plus et une position solide après Qg4.",
        },
        {
          title: "Frankenstein-Dracula : 5…Be7 6.Nf3",
          eco: "C27",
          kind: "line",
          objectives: [
            "Récupérer le pion e5 par Nf3 et Nxe5",
            "Garder la dame active contre …Nd4",
            "Accepter l'échange du fou b3",
          ],
          pgn: `{La retraite 5…Be7 est plus sûre que 5…Nc6. Vous récupérez le pion e5 par Nxe5, et la partie devient positionnelle.}
1. e4 e5 2. Nc3 Nf6 3. Bc4 Nxe4 4. Qh5 Nd6 5. Bb3 Be7 6. Nf3 Nc6 7. Nxe5 g6 8. Qe2 Nd4 9. Qd3 Nxb3 10. axb3 {La reprise ouvre la colonne a pour votre tour. [%cal Ga1a7]}
10... Nf5 11. O-O {Le roi est à l'abri ; d4 et Re1 suivront.}`,
          conclusion:
            "Contre 5…Be7, Nf3 et Nxe5 rétablissent l'équilibre matériel : votre avance de développement et la colonne a compensent la paire de fous.",
        },
        {
          title: "Gambit viennois : 5…Bc5 6.d4 Bb4",
          eco: "C29",
          kind: "line",
          objectives: [
            "Chasser le fou c5 par d4",
            "Défendre c3 par Bd2",
            "Reprendre en d2 avec la dame",
          ],
          pgn: `{Contre 5…Bc5, la poussée d4 gagne du temps. Après …Bb4 et …c5, les Noirs attaquent votre centre : Bd3 et Qxd2 maintiennent l'équilibre.}
1. e4 e5 2. Nc3 Nf6 3. f4 d5 4. fxe5 Nxe4 5. Nf3 Bc5 6. d4 {Le pion chasse le fou et soutient e5. [%cal Gd4c5]}
6... Bb4 7. Bd2 {Le fou défend c3 contre le doublement des pions.}
7... c5 8. Bd3 Nxd2 9. Qxd2 {La dame reprend et relie les tours ; le roque est prêt. [%cal Gd2h6]}`,
          conclusion:
            "Contre 5…Bc5, d4 et Bd2 neutralisent la pression noire sur c3. Votre centre d4-e5 reste votre atout.",
        },
        {
          title: "3.g3 d5 : la tour b1 et le pion b7",
          eco: "C26",
          kind: "line",
          objectives: [
            "Forcer …Rb8 par la pression sur b7",
            "Préparer g4 pour chasser le fou h5",
            "Garder le fou g2 sur la grande diagonale",
          ],
          pgn: `{Dans le fianchetto, la pression sur b7 force les Noirs à placer une tour passive en b8. Vous pouvez ensuite préparer g4 et f4.}
1. e4 e5 2. Nc3 Nf6 3. g3 d5 4. exd5 Nxd5 5. Bg2 Nxc3 6. bxc3 Bd6 7. Nf3 O-O 8. O-O Nc6 9. d3 Bg4 10. h3 Bh5 11. Rb1 {La tour attaque b7 par la colonne ouverte.}
11... Rb8 {Les Noirs défendent b7 avec une tour sans activité.}
12. g4 {Le pion chasse le fou h5 vers g6. [%cal Gg4h5]}`,
          conclusion:
            "Dans le fianchetto, Rb1 force …Rb8 et g4 chasse le fou h5 : vos pièces gagnent de l'espace sur les deux ailes.",
        },
      ],
    },
  ],
};
