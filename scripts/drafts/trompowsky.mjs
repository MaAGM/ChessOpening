// Brouillon de la Masterclass « Trompowsky » (côté Blancs) : 1.d4 Nf6 2.Bg5.
// Les flèches du coup à jouer sont ajoutées par scripts/course-builder.mjs ; celles écrites ici
// illustrent une idée (cible, manœuvre, menace).
import { TRAPS } from "./trompowsky-traps.mjs";

const NE4_C5 = "1. d4 Nf6 2. Bg5 Ne4 3. Bf4 c5 4. f3 Qa5+ 5. c3 Nf6 6. d5";

export default {
  id: "trompowsky",
  name: "Trompowsky",
  description:
    "1.d4 Nf6 2.Bg5 : le fou menace tout de suite de doubler les pions noirs. Un système complet côté Blancs contre 2…Ne4, 2…e6, 2…d5, 2…c5 et 2…g6, avec les plans f3-e4, Qd2-O-O-O et c4 contre les pions doublés, pièges et lignes principales.",
  side: "white",
  eco: ["A45", "D00"],
  chapters: [
    // =====================================================================================
    {
      title: "Les fondations",
      summary:
        "Ce que menace 2.Bg5, la retraite Bf4 contre 2…Ne4, le grand centre contre 2…e6 et la structure de pions doublés après 2…d5 3.Bxf6.",
      stage: "foundations",
      lessons: [
        {
          title: "2.Bg5 : la menace Bxf6",
          eco: "A45",
          kind: "concept",
          objectives: [
            "Comprendre que Bg5 menace de doubler les pions noirs",
            "Reculer en f4 contre 2…Ne4",
            "Construire le schéma e3, Bd3 et c3 contre …d5",
          ],
          pgn: `{La Trompowsky pose une question dès le deuxième coup : le fou g5 menace Bxf6, qui abîmerait la structure noire. Les Noirs doivent choisir : chasser le fou, protéger f6 ou accepter les pions doublés. Chaque réponse mène à un type de position différent.}
1. d4 Nf6 2. Bg5 {Le fou attaque le cavalier f6 : Bxf6 doublerait les pions noirs. [%cal Gg5f6]}
2... Ne4 {La réponse la plus fréquente : le cavalier évite l'échange et attaque le fou.}
(2... e6 {Les Noirs acceptent l'échange : la dame reprendra en f6.} 3. e4 {Le pion occupe le centre : le pion e6 ne peut plus empêcher e4. [%cal Ge4d5]})
(2... d5 {Les Noirs prennent le centre et laissent faire.} 3. Bxf6 {L'échange : les Noirs auront soit des pions doublés, soit un fou en moins sur l'aile roi. [%cal Gg5f6]})
3. Bf4 {Le fou recule sur une diagonale active, où il contrôle e5 et c7. [%cal Gf4e5,Gf4c7]}
3... d5 4. e3 {Le pion soutient d4 et ouvre la diagonale du fou f1. [%cal Gf1d3]}
4... c5
(4... e6 5. Bd3 {Le fou attaque le cavalier e4, qui n'a plus de soutien naturel. [%cal Gd3e4]})
5. Bd3 {Le fou conteste le cavalier e4 : il devra reculer ou être échangé. [%cal Gd3e4]}
5... Nf6 6. c3 {La pyramide c3-d4-e3 rappelle le Système de Londres : un centre solide pour un fou bien placé. [%cal Gc3d4]}`,
          conclusion:
            "Bg5 force les Noirs à se décider dès le deuxième coup. Contre 2…Ne4, la retraite Bf4 suivie de e3, Bd3 et c3 donne une structure solide où le fou est déjà sorti.",
        },
        {
          legacyIds: ["trompowsky-m1"],
          title: "2…Ne4 3.Bf4 c5 : f3, c3 et d5",
          eco: "A45",
          kind: "line",
          objectives: [
            "Chasser le cavalier e4 par f3",
            "Parer l'échec …Qa5+ par c3",
            "Gagner de l'espace par d5 et défendre b2 par Bc1",
          ],
          pgn: `{Avec 3…c5, les Noirs attaquent d4 et préparent …Qa5+ ou …Qb6. Les Blancs chassent le cavalier par f3, puis avancent le pion d en d5 : l'espace gagné compense le petit retard de développement.}
1. d4 Nf6 2. Bg5 Ne4 3. Bf4 c5 4. f3 {Le pion chasse le cavalier e4 et prépare e4. [%cal Gf3e4]}
4... Qa5+
(4... Nf6 5. dxc5 {Le pion c5 est pris : les Noirs doivent le récupérer par …Qa5+. [%cal Gd4c5]} 5... Qa5+ 6. Nc3 {Le cavalier pare l'échec en se développant. [%cal Gc3d5]})
5. c3 {Le pion pare l'échec et soutient d4. [%cal Gc3d4]}
5... Nf6 6. d5 {Le pion gagne de l'espace et coupe les pièces noires de l'aile roi. [%cal Gd5d6]}
6... Qb6
(6... e6 7. e4 {Le pion soutient d5 et construit un grand centre. [%cal Ge4d5]} 7... exd5 8. exd5 {La reprise garde un pion d5 qui gêne tout le camp noir. [%cal Gd5d6]})
7. Bc1 {Le fou revient défendre b2 : il ressortira plus tard en g5 ou e3. [%cal Gc1b2]}`,
          conclusion:
            "Contre 3…c5, f3 chasse le cavalier et c3 pare …Qa5+. Après d5, le fou revient en c1 pour défendre b2 : vos pions d5 et e4 vont dominer le centre.",
        },
        {
          title: "2…e6 3.e4 : le grand centre",
          eco: "A45",
          kind: "line",
          objectives: [
            "Occuper le centre par e4 contre 2…e6",
            "Échanger en f6 contre …h6 et développer avec Nc3",
            "Roquer à l'aile dame après Qd2",
          ],
          pgn: `{Contre 2…e6, les Blancs jouent e4 : le centre est à eux. Les Noirs obtiennent la paire de fous après …h6 et Bxf6, mais leur dame en f6 sera une cible pour les pièces blanches.}
1. d4 Nf6 2. Bg5 e6 3. e4 {Le pion prend le centre : il menace e5 contre le cavalier cloué. [%cal Ge4e5]}
3... h6 4. Bxf6 {Le fou s'échange plutôt que de reculer : vous gardez une avance de développement. [%cal Gg5f6]}
4... Qxf6 5. Nc3 {Le cavalier soutient e4 et vise d5 et b5. [%cal Gc3d5]}
5... d6
(5... Bb4 {Le fou cloue le cavalier c3.} 6. Qd2 {La dame protège c3 et prépare O-O-O. [%cal Gd2c3]} 6... d6 7. a3 {Le pion pose la question au fou b4. [%cal Ga3b4]})
6. Qd2 {La dame prépare O-O-O : vos pièces se développent plus vite que les pièces noires. [%cal Ge1c1]}
6... g5 7. O-O-O {Le grand roque met la tour en d1 et prépare e5 ou f4. [%cal Gd1d6]}
7... Bg7`,
          conclusion:
            "Contre 2…e6, e4 puis Bxf6 et Nc3 donnent aux Blancs le centre et l'avance de développement. Avec Qd2 et O-O-O, la tour d1 vise déjà d6.",
        },
        {
          title: "2…d5 3.Bxf6 : les pions doublés",
          eco: "D00",
          kind: "line",
          objectives: [
            "Doubler les pions noirs par Bxf6",
            "Jouer e3 et c4 contre la structure …exf6",
            "Développer le fou en c4 après …dxc4",
          ],
          pgn: `{Contre 2…d5, l'échange en f6 donne aux Noirs la paire de fous mais une structure de pions altérée. Les Blancs attaquent ensuite d5 par c4 : la majorité noire à l'aile roi est moins mobile.}
1. d4 Nf6 2. Bg5 d5 3. Bxf6 {L'échange : les pions noirs seront doublés en f6 et f7. [%cal Gg5f6]}
3... exf6 4. e3 {Le pion soutient d4 et prépare Bd3 ou Bc4. [%cal Gf1c4]}
4... Bd6
(4... c6 5. c4 {Le levier c4 attaque d5 : le centre noir est mis à l'épreuve. [%cal Gc4d5]} 5... dxc4 6. Bxc4 {Le fou se développe avec gain de temps : il vise f7. [%cal Gc4f7]})
5. c4 {Le pion attaque d5 : la majorité blanche à l'aile dame entre en jeu. [%cal Gc4d5]}
5... dxc4 6. Bxc4 {Le fou est actif en c4, sur la diagonale vers f7. [%cal Gc4f7]}
6... O-O 7. Nc3 {Le cavalier se développe et contrôle d5 et e4. [%cal Gc3d5,Gc3e4]}`,
          conclusion:
            "Après 2…d5 3.Bxf6 exf6, e3 et c4 activent vos pièces. Vous avez une majorité à l'aile dame ; les pions doublés noirs freinent leur jeu à l'aile roi.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Plans typiques",
      summary:
        "Les plans de la retraite 3.Bh4, l'attaque avec Qd2 et O-O-O, et la lutte contre le centre …e5 après 2…e6 3.e4 h6.",
      stage: "plans",
      lessons: [
        {
          legacyIds: ["trompowsky-m2"],
          title: "3.Bh4 c6 : Nd2, c3 et f3",
          eco: "A45",
          kind: "line",
          objectives: [
            "Garder le fou sur la diagonale h4-d8",
            "Échanger le cavalier e4 par Nd2",
            "Gagner de l'espace par f3 et g4",
          ],
          pgn: `{Avec 3.Bh4, le fou reste sur la diagonale de la dame noire. Contre …c6 et …Qa5, le cavalier d2 propose l'échange du cavalier e4, puis f3 et g4 gagnent de l'espace contre le fou c8.}
1. d4 Nf6 2. Bg5 Ne4 3. Bh4 {Le fou garde un œil sur e7 et d8. [%cal Gh4d8]}
3... c6 4. Nd2 {Le cavalier attaque e4 : l'échange simplifie votre développement. [%cal Gd2e4]}
4... Qa5
(4... Nxd2 5. Qxd2 {La dame reprend en se développant : elle soutient d4 et pourra aller en f4. [%cal Gd2f4]})
5. c3 {Le pion ferme la diagonale a5-e1 et soutient d4. [%cal Gc3d4]}
5... Nxd2 6. Qxd2 d5 7. f3 {Le pion prépare e4 et g4. [%cal Gf3e4]}
7... Bf5 8. g4 {Le pion chasse le fou f5 et gagne de l'espace à l'aile roi. [%cal Gg4f5]}`,
          conclusion:
            "Avec 3.Bh4, Nd2 neutralise le cavalier e4 et c3 bloque l'échec …Qa5+. Ensuite f3 et g4 chassent le fou noir et préparent e4.",
        },
        {
          legacyIds: ["trompowsky-m5"],
          title: "3.Bh4 d5 : f3 et Nc3",
          eco: "A45",
          kind: "line",
          objectives: [
            "Chasser le cavalier e4 par f3",
            "Développer le cavalier en c3 et préparer e4",
            "Roquer à l'aile dame après Qd2",
          ],
          pgn: `{Contre 3…d5, les Blancs ne gardent pas la pyramide : f3 chasse le cavalier et prépare e4, Nc3 soutient la poussée. C'est un plan ambitieux, avec roque à l'aile dame.}
1. d4 Nf6 2. Bg5 Ne4 3. Bh4 d5 4. f3 {Le pion chasse le cavalier et prépare e4. [%cal Gf3e4]}
4... Nf6
(4... Nd6 {Le cavalier va vers f5, d'où il attaquera le fou h4 et d4.} 5. Nc3 {Le cavalier contrôle e4 et d5. [%cal Gc3e4]} 5... Nf5 6. Bf2 {Le fou recule en f2, où il défend d4 et e3. [%cal Gf2d4]})
5. Nc3 {Le cavalier soutient la future poussée e4. [%cal Gc3e4]}
5... Bf5
(5... e6 6. e4 {Le centre est à vous : e4 attaque d5 et prépare e5. [%cal Ge4d5]} 6... Be7 7. Bf2 {Le fou e7 a levé le clouage : le fou blanc se replie en f2 pour protéger d4. [%cal Gf2d4]})
6. Qd2 {La dame prépare O-O-O et soutient e3. [%cal Ge1c1]}
6... e6 7. O-O-O {Le grand roque : vos pièces sont prêtes pour e4. [%cal Ge3e4]}`,
          conclusion:
            "Contre 3…d5, f3 et Nc3 préparent e4 ; Qd2 et O-O-O mettent la tour en d1 derrière votre centre. Le fou h4 continue de clouer le cavalier f6.",
        },
        {
          legacyIds: ["trompowsky-m3"],
          title: "3.Bh4 c5 : f3 et le sacrifice …g5",
          eco: "A45",
          kind: "line",
          objectives: [
            "Accepter …g5 en prenant le cavalier e4",
            "Protéger e3 par Qd3 contre le fou h6",
            "Chasser la dame noire par Na3 et Nc4",
          ],
          pgn: `{Contre 3.Bh4 c5 4.f3, les Noirs jouent souvent …g5 : le fou h4 est attaqué, mais le cavalier e4 aussi. On obtient une position déséquilibrée : un grand centre blanc contre la paire de fous noire.}
1. d4 Nf6 2. Bg5 Ne4 3. Bh4 c5 4. f3 {Le pion chasse le cavalier e4. [%cal Gf3e4]}
4... g5
(4... Qa5+ 5. c3 {Le pion pare l'échec et soutient d4. [%cal Gc3d4]} 5... Nf6 6. d5 {Le pion gagne de l'espace : votre fou h4 reste sur la diagonale de la dame. [%cal Gd5d6]})
5. fxe4 {Le cavalier est pris : les Noirs prendront le fou h4. [%cal Gf3e4]}
5... gxh4 6. e3 {Le pion soutient d4 et prépare Bd3 ou Nf3. [%cal Ge3d4]}
6... Bh6 7. Qd3 {La dame défend e3, attaqué par le fou h6, et soutient e4 : le roi peut rester en e1. [%cal Gd3e3]}
7... Qb6
(7... cxd4 8. exd4 {La reprise garde deux pions centraux côte à côte, d4 et e4. [%cal Gd4d5,Ge4e5]})
8. Na3 {Le cavalier se dirige vers c4 : si la dame prend b2, il la chassera avec gain de temps. [%cal Ga3c4]}
8... Nc6
(8... Qb4+ {L'échec force une décision.} 9. Kf2 {Maintenant seulement le roi va en f2, où il protège e3 et laisse la dame libre. [%cal Gf2e3]})
9. Nc4 {Le cavalier attaque la dame b6 et prépare dxc5. [%cal Gc4b6]}`,
          conclusion:
            "Après 3.Bh4 c5 4.f3 g5, la prise fxe4 donne un grand centre contre la paire de fous. Qd3 défend e3 sans déplacer le roi, puis Na3-c4 chasse la dame noire.",
        },
        {
          title: "Contre …h6 et …Qxf6 : c3 et Bd3",
          eco: "A45",
          kind: "line",
          objectives: [
            "Soutenir d4 par c3 avant de développer les cavaliers",
            "Placer le fou en d3 et le cavalier en e2",
            "Préparer le roque contre le centre …e5",
          ],
          pgn: `{Après 2…e6 3.e4 h6 4.Bxf6 Qxf6, le plan c3 est plus tranquille que Nc3 : le pion soutient d4, le fou va en d3 et le cavalier en e2, pour ne pas gêner le pion f.}
1. d4 Nf6 2. Bg5 e6 3. e4 h6 4. Bxf6 Qxf6 5. c3 {Le pion soutient d4 contre …e5 et …c5. [%cal Gc3d4]}
5... d6
(5... d5 6. Nd2 {Le cavalier soutient e4 : …dxe4 sera repris par le cavalier. [%cal Gd2e4]})
6. Bd3 {Le fou se développe et soutient e4. [%cal Gd3e4]}
6... e5
(6... g6 7. Ne2 {Le cavalier va en e2 : le pion f reste libre pour f4. [%cal Gf2f4]})
7. Ne2 {Le cavalier soutient d4 et laisse la voie libre au pion f. [%cal Ge2d4,Gf2f4]}`,
          conclusion:
            "Contre la paire de fous noire, c3, Bd3 et Ne2 forment un centre stable. Le pion f reste libre : f4 sera votre levier contre le pion e5.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Réponses adverses",
      summary:
        "Les réponses ambitieuses : 2…c5 avec la poussée d5 et le gambit b2, la prise en f6 contre 2…c5, la retraite Bc1 contre …Qb6, et le fianchetto 2…g6.",
      stage: "responses",
      lessons: [
        {
          title: "2…c5 3.d5 Qb6 : le gambit Nc3",
          eco: "A45",
          kind: "line",
          objectives: [
            "Pousser d5 contre 2…c5",
            "Sacrifier b2 par Nc3 pour l'avance de développement",
            "Ouvrir la colonne b par Rb1",
          ],
          pgn: `{Contre 2…c5 3.d5 Qb6, la ligne la plus active est le gambit 4.Nc3 : les Noirs gagnent b2 mais leur dame perd des temps. Les Blancs construisent un centre e4-f4 et utilisent la colonne b.}
1. d4 Nf6 2. Bg5 c5 3. d5 {Le pion gagne de l'espace : le cavalier f6 n'a plus la case d5. [%cal Gd5d6]}
3... Qb6 4. Nc3 {Le cavalier se développe et laisse b2 en prise. [%cal Gc3e4]}
4... Qxb2
(4... d6 5. e4 {Le pion forme un grand centre : vous gardez b2 et l'espace. [%cal Ge4e5]})
5. Bd2 {Le fou protège c3 et menace Rb1 contre la dame. [%cal Ga1b1]}
5... Qb6 6. e4 {Le pion construit un centre e4-d5 que les Noirs ne pourront pas ébranler facilement. [%cal Ge4e5]}
6... d6
(6... e5 7. f4 {Le levier f4 attaque e5 et ouvre la colonne f. [%cal Gf4e5]})
7. f4 {Le pion prépare e5 contre le cavalier f6. [%cal Gf4e5]}
7... e6 8. Rb1 {La tour chasse la dame sur la colonne b ouverte. [%cal Gb1b6]}`,
          conclusion:
            "Le gambit 4.Nc3 donne un pion contre le temps : Bd2, e4, f4 et Rb1 développent vos pièces avec gain de temps contre la dame noire.",
        },
        {
          title: "2…c5 3.Bxf6 : la dame en c1",
          eco: "A45",
          kind: "line",
          objectives: [
            "Prendre en f6 contre 2…c5",
            "Défendre b2 par Qc1 après …Qb6",
            "Développer par c4 et Nc3 contre le fou g7",
          ],
          pgn: `{La prise 3.Bxf6 détruit la structure noire tout de suite. Après …gxf6 et d5, la dame noire attaque b2 ; Qc1 la défend sans rien concéder.}
1. d4 Nf6 2. Bg5 c5 3. Bxf6 {L'échange immédiat : le pion noir reprendra en f6. [%cal Gg5f6]}
3... gxf6 4. d5 {Le pion d5 gagne de l'espace et fixe le pion c5. [%cal Gd5d6]}
4... Qb6 5. Qc1 {La dame défend b2 et garde un œil sur h6. [%cal Gc1b2,Gc1h6]}
5... f5
(5... Bh6 6. e3 {Le pion ferme la diagonale du fou h6 : la dame reste en c1. [%cal Ge3h6]})
6. c4 {Le pion soutient d5 et donne de l'espace à l'aile dame. [%cal Gc4d5]}
6... Bg7 7. Nc3 {Le cavalier soutient d5 et contrôle b5 et e4. [%cal Gc3b5,Gc3e4]}
7... d6 8. e3 {Le pion consolide d4 : le fou f1 se développera en d3 ou e2. [%cal Gf1d3]}`,
          conclusion:
            "Après 2…c5 3.Bxf6 gxf6 4.d5 Qb6, Qc1 défend b2. Avec c4, Nc3 et e3, vos pions d5 et c4 tiennent l'espace face à la paire de fous noire.",
        },
        {
          title: "2…c5 3.d5 Ne4 : Bf4, Bc1 et f3",
          eco: "A45",
          kind: "line",
          objectives: [
            "Garder le fou en f4 contre …Ne4",
            "Défendre b2 par Bc1 contre …Qb6",
            "Chasser le cavalier e4 par f3 puis jouer e4",
          ],
          pgn: `{Avec 3…Ne4, les Noirs combinent l'attaque du fou et la pression sur b2. Le fou revient en c1, puis f3 et e4 construisent un grand centre.}
1. d4 Nf6 2. Bg5 c5 3. d5 Ne4 4. Bf4 {Le fou évite l'attaque et vise b8. [%cal Gf4b8]}
4... Qb6 5. Bc1 {Le fou défend b2 : la manœuvre f4-c1 est fréquente dans la Trompowsky. [%cal Gc1b2]}
5... e6
(5... g6 6. f3 {Même idée : le cavalier e4 est chassé et la case e4 revient aux Blancs. [%cal Gf3e4]})
6. f3 {Le pion chasse le cavalier e4. [%cal Gf3e4]}
6... Nf6 7. e4 {Le pion soutient d5 et prend tout le centre. [%cal Ge4d5]}
7... exd5 8. exd5 {La reprise garde un pion d5 qui coupe le camp noir en deux. [%cal Gd5d6]}`,
          conclusion:
            "Contre 2…c5 3.d5 Ne4, Bf4 puis Bc1 tient b2. Avec f3 et e4, votre pion d5 devient un coin dans la position noire.",
        },
        {
          title: "2…g6 : Bxf6 et le fianchetto g3",
          eco: "A45",
          kind: "line",
          objectives: [
            "Doubler les pions noirs contre 2…g6",
            "Fianchetter le fou f1 contre la structure f6-f7",
            "Développer le cavalier en e2 pour garder le pion f libre",
          ],
          pgn: `{Contre 2…g6, Bxf6 laisse aux Noirs une structure f7-f6 et un fou g7 freiné par son propre pion. Les Blancs fianchettent à leur tour pour contrôler les cases blanches.}
1. d4 Nf6 2. Bg5 g6 3. Bxf6 {L'échange : le fou g7 aura un pion f6 devant lui. [%cal Gg5f6]}
3... exf6 4. e3 {Le pion soutient d4 et contrôle f4. [%cal Ge3f4]}
4... Bg7
(4... d5 5. c4 {Le pion attaque d5 : les Noirs ne peuvent pas soutenir leur centre longtemps. [%cal Gc4d5]} 5... dxc4 6. Bxc4 {Le fou reprend en visant f7. [%cal Gc4f7]})
5. g3 {Le pion prépare le fianchetto du fou f1. [%cal Gf1g2]}
5... O-O 6. Bg2 {Le fou contrôle la grande diagonale et les cases blanches centrales. [%cal Gg2b7]}
6... f5 7. Ne2 {Le cavalier va en e2 : il pourra rejoindre f4 ou c3. [%cal Ge2f4]}
7... d6 8. O-O {Le roque termine le développement : vous jouerez c4 et Nbc3. [%cal Gc2c4]}`,
          conclusion:
            "Contre 2…g6, Bxf6 freine le fou g7. Le fianchetto g3-Bg2 et le cavalier e2 vous donnent un jeu souple sur les cases blanches.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Pièges",
      summary:
        "Les erreurs noires typiques de la Trompowsky : la dame qui prend b2 au mauvais moment, le cavalier e4 laissé sans retraite, et le fianchetto prématuré.",
      stage: "traps",
      lessons: TRAPS,
    },
    // =====================================================================================
    {
      title: "Grande théorie",
      summary:
        "Les lignes profondes : la structure d5 avec Na3 après …Qb6 et Bc1, la prise dxc5 avec O-O-O, le clouage …Bb4 et la structure …gxf6 avec dxc5.",
      stage: "theory",
      lessons: [
        {
          legacyIds: ["trompowsky-m4"],
          title: "6.d5 Qb6 7.Bc1 : la structure d5 et Na3",
          eco: "A45",
          kind: "line",
          objectives: [
            "Construire le centre e4-d5 après …e6",
            "Développer le cavalier par a3 vers c4",
            "Répondre à …Re8+ en développant le fou",
          ],
          pgn: `{Dans la ligne principale de 3…c5 4.f3 Qa5+, les Blancs gagnent de l'espace avec d5 et e4. Leur cavalier b1 passe par a3 pour rejoindre c4, d'où il chassera la dame noire.}
${NE4_C5} Qb6 7. Bc1 e6 8. e4 {Le pion soutient d5 : le centre blanc est complet. [%cal Ge4d5]}
8... exd5 9. exd5 {La reprise maintient le pion d5, qui gêne le développement noir. [%cal Gd5d6]}
9... Bd6
(9... d6 10. c4 {Le pion soutient d5 : votre structure ressemble à une Benoni inversée, avec un temps de plus. [%cal Gc4d5]})
10. Na3 {Le cavalier rejoint c4 ou b5 : il chassera la dame et le fou d6. [%cal Ga3c4,Ga3b5]}
10... O-O 11. Bd3 {Le fou se développe et couvre e2 contre l'échec …Re8+. [%cal Gd3h7]}
11... Re8+ 12. Ne2 {Le cavalier pare l'échec et prépare le roque. [%cal Ge2d4]}`,
          conclusion:
            "Contre …Qb6 et …e6, e4 puis Na3 construisent un centre e4-d5 avec un cavalier prêt pour c4. Bd3 et Ne2 couvrent la colonne e avant le roque.",
        },
        {
          title: "4…Nf6 5.dxc5 : Qd2 et O-O-O",
          eco: "A45",
          kind: "line",
          objectives: [
            "Prendre en c5 contre 4…Nf6",
            "Construire le centre e4 après …Qxc5",
            "Roquer à l'aile dame avec Qd2",
          ],
          pgn: `{Contre 4…Nf6, la prise dxc5 force les Noirs à dépenser des temps pour récupérer le pion. Les Blancs en profitent pour jouer e4, Qd2 et O-O-O.}
1. d4 Nf6 2. Bg5 Ne4 3. Bf4 c5 4. f3 Nf6 5. dxc5 {Le pion c5 est pris : la dame noire va dépenser un temps pour le récupérer. [%cal Gd4c5]}
5... Qa5+ 6. Nc3 {Le cavalier pare l'échec et se développe. [%cal Gc3e4]}
6... Qxc5 7. e4 {Le pion occupe le centre et menace e5 contre le cavalier f6. [%cal Ge4e5]}
7... d6 8. Qd2 {La dame prépare O-O-O et soutient le fou f4. [%cal Ge1c1]}
8... a6 9. O-O-O {Le grand roque : la tour d1 fait face au pion d6. [%cal Gd1d6]}
9... Nbd7 10. Kb1 {Le roi s'écarte de la colonne c avant de lancer g4 et h4. [%cal Gg2g4]}`,
          conclusion:
            "Après 4…Nf6 5.dxc5, les Blancs ont un développement rapide : e4, Qd2 et O-O-O. La tour d1 vise d6 et les pions g et h sont prêts à avancer.",
        },
        {
          title: "5…Bb4 6.Qd2 : le clouage et a3",
          eco: "A45",
          kind: "line",
          objectives: [
            "Défendre c3 par Qd2 contre le clouage",
            "Poser la question au fou par a3",
            "Reprendre avec la dame si le fou prend en c3",
          ],
          pgn: `{Contre 2…e6 3.e4 h6 4.Bxf6 Qxf6 5.Nc3, les Noirs clouent le cavalier par …Bb4. Les Blancs défendent avec Qd2, puis chassent le fou par a3.}
1. d4 Nf6 2. Bg5 e6 3. e4 h6 4. Bxf6 Qxf6 5. Nc3 Bb4 6. Qd2 {La dame protège c3 et prépare O-O-O. [%cal Gd2c3]}
6... d6 7. a3 {Le pion attaque le fou b4 : il doit choisir entre a5 et l'échange en c3. [%cal Ga3b4]}
7... Ba5
(7... Bxc3 8. Qxc3 {La dame reprend : vous avez la paire de fous et la dame vise g7. [%cal Gc3g7]} 8... O-O 9. Nf3 {Le cavalier se développe vers la case centrale e5. [%cal Gf3e5]})
8. Nf3 {Le cavalier se développe et soutient d4 et e5. [%cal Gf3e5]}
8... O-O 9. Bd3 {Le fou soutient e4 et vise h7. [%cal Gd3h7]}`,
          conclusion:
            "Contre …Bb4, Qd2 protège c3 et a3 chasse le fou. Si …Bxc3, la dame reprend et vous gardez la paire de fous ; sinon Nf3 et Bd3 complètent le développement.",
        },
        {
          title: "2…d5 3.Bxf6 gxf6 : e3, dxc5 et Be2",
          eco: "D00",
          kind: "line",
          objectives: [
            "Jouer e3 contre la structure …gxf6",
            "Prendre en c5 pour gagner un temps sur le fou",
            "Développer le fou en e2 et roquer",
          ],
          pgn: `{Après 2…d5 3.Bxf6 gxf6, les Noirs ont un centre de pions et une colonne g ouverte. Les Blancs jouent e3 et c4 ou dxc5, puis roquent : la colonne g n'est dangereuse que si le roi blanc reste au centre.}
1. d4 Nf6 2. Bg5 d5 3. Bxf6 gxf6 4. e3 {Le pion soutient d4 et prépare le développement du fou f1. [%cal Gf1e2]}
4... c5 5. dxc5 {La prise : les Noirs devront reprendre avec le fou f8. [%cal Gd4c5]}
5... e6
(5... Nc6 6. Bb5 {Le fou cloue le cavalier c6 : les Noirs ne peuvent pas reprendre en c5 avec lui. [%cal Gb5c6]} 6... e6 7. c4 {Le pion attaque d5 : le centre noir est sous pression. [%cal Gc4d5]})
6. Nf3 {Le cavalier contrôle d4 et e5. [%cal Gf3d4,Gf3e5]}
6... Bxc5 7. Be2 {Le fou se développe pour préparer le roque. [%cal Ge1g1]}
7... Nc6 8. O-O {Le roi est en sécurité : la colonne g ne vous inquiète plus.}`,
          conclusion:
            "Contre 3…gxf6, e3, dxc5 et Be2 mènent à un roque rapide. Les Noirs ont un centre mobile, mais vous visez les faiblesses f5, h7 et la structure brisée.",
        },
      ],
    },
  ],
};
