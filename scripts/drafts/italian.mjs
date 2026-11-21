// Brouillon de la Masterclass « Partie italienne » (côté Blancs).
// Les flèches du coup à jouer sont ajoutées automatiquement par build.mjs ; les flèches écrites
// ici illustrent une idée (cible, manœuvre, menace) et accompagnent le commentaire du coup blanc.
import { RESPONSES, TRAPS, THEORY } from "./italian-rest.mjs";

export default {
  id: "italian",
  name: "Partie italienne",
  description:
    "Le fou c4 vise f7 dès le 3e coup. Répertoire complet côté Blancs : le Giuoco Pianissimo (c3, d3, Re1, h3) et ses plans de manœuvre, le Giuoco Piano c3-d4, l'attaque Møller, le gambit Evans, l'attaque Max Lange et les Deux Cavaliers 4.Ng5.",
  side: "white",
  eco: ["C50", "C51", "C52", "C53", "C54", "C55", "C57", "C58", "C59"],
  chapters: [
    // =====================================================================================
    {
      title: "Les fondations",
      summary:
        "Le fou c4 contre f7, le centre c3-d4, la mise en place du Pianissimo et l'attaque 4.Ng5 contre les Deux Cavaliers.",
      stage: "foundations",
      lessons: [
        {
          title: "3.Bc4 : le fou contre f7",
          eco: "C50",
          kind: "concept",
          objectives: [
            "Comprendre pourquoi f7 est la cible de l'Italienne",
            "Reconnaître les trois grandes réponses noires au 3e coup",
            "Préparer d4 par c3 contre 3…Bc5",
          ],
          pgn: `{La Partie italienne est l'une des plus anciennes ouvertures : le fou se place en c4, sur la diagonale qui mène à f7, la case que seul le roi noir défend au départ. Tout le reste découle d'une question : quand et comment ouvrir le centre ?}
1. e4 e5 2. Nf3 {Le cavalier attaque e5 et se développe vers le centre. [%cal Gf3e5]}
2... Nc6 3. Bc4 {Le fou vise f7 et contrôle d5, la case de la rupture …d5. [%cal Gc4f7,Gc4d5]}
3... Bc5 {Les Noirs répondent symétriquement : leur fou vise f2.}
(3... Nf6 {Les Deux Cavaliers : les Noirs contre-attaquent e4 au lieu de développer le fou.} 4. d3 {Le pion protège e4 calmement ; le jeu reste dans les eaux du Pianissimo. [%cal Gd3e4]})
(3... Be7 {La Défense hongroise : un fou passif qui ne vise rien.} 4. d4 {Contre un développement aussi modeste, prenez le centre tout de suite. [%cal Gd4e5]})
4. c3 {Le pion prépare d4 : deux pions côte à côte au centre chasseront le fou c5. [%cal Gc3d4,Gd4c5]}
4... Nf6 {Les Noirs attaquent e4 pour gêner d4.}
5. d3 {Le Pianissimo : e4 est défendu, d4 viendra plus tard, une fois le roque et Re1 joués. [%cal Gd3d4]}
5... d6 6. O-O O-O 7. Bb3 {Le fou recule de lui-même : …Na5 ou …d5 ne le chasseront pas avec gain de temps. [%cal Gb3f7]}
7... a6 8. Nbd2 Ba7 9. h3 {Le pion empêche …Bg4 et …Ng4 : la structure de base est en place. [%cal Gh3g4]}`,
          conclusion:
            "Vous connaissez le rôle du fou c4 et les trois grandes réponses noires. Avec c3, la poussée d4 est toujours dans l'air : la jouer tout de suite donne le Giuoco Piano, la préparer donne le Pianissimo.",
        },
        {
          legacyIds: ["italian-m1"],
          title: "Giuoco Piano : le centre c3-d4",
          eco: "C54",
          kind: "line",
          objectives: [
            "Jouer d4 avec le soutien du pion c3",
            "Répondre à l'échec …Bb4+ par Bd2",
            "Connaître le plan …d5 et la réponse Qb3",
          ],
          pgn: `{Avec 4.c3 puis 5.d4, les Blancs construisent le centre idéal. Les Noirs doivent réagir vite : prendre en d4 puis donner l'échec en b4, avant de frapper le centre par …d5.}
1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d4 {La poussée centrale : e5 et le fou c5 sont attaqués en même temps. [%cal Gd4e5,Gd4c5]}
5... exd4 6. cxd4 {Le centre e4-d4 est en place ; le fou c5 doit se décider.}
6... Bb4+ {Le seul échec utile : il retarde le développement blanc.}
7. Bd2 {L'interposition la plus solide : elle propose l'échange du fou noir.}
7... Bxd2+ 8. Nbxd2 {Le cavalier reprend et soutient e4 ; le fou c4 reste votre meilleure pièce.}
8... d5 {La rupture libératrice : les Noirs dissolvent votre centre.}
9. exd5 Nxd5 10. Qb3 {La dame attaque le cavalier d5 et vise b7 et f7. [%cal Gb3d5,Gb3b7]}
10... Nce7 {Le cavalier soutient d5 et prépare le roque.}
(10... Na5 {Les Noirs chassent la dame.} 11. Qa4+ {Avec échec : la dame garde un œil sur a5 et d5. [%cal Ga4a5]} 11... Nc6 12. Qb3 {Si les Noirs répètent par …Na5, la partie est nulle ; c'est la ligne la plus fréquente au haut niveau.})
11. O-O O-O 12. Rfe1 {La tour occupe la colonne e : la case e5 et le cavalier e7 sont sous pression. [%cal Ge1e7]}
12... c6 {Le cavalier d5 est solidement soutenu.}
13. a4 {Le pion gagne de l'espace à l'aile dame et prépare a5 ; votre pion isolé d4 vous donne en échange du jeu actif. [%cal Ga4a5]}`,
          conclusion:
            "Le Giuoco Piano donne aux Blancs un pion d4 isolé mais actif. Retenez l'enchaînement Bd2, Nbxd2, Qb3 puis Rfe1 : vos pièces visent d5, b7 et la colonne e.",
        },
        {
          title: "Le Pianissimo : roquer, Re1, h3",
          eco: "C54",
          kind: "concept",
          objectives: [
            "Mettre en place le schéma c3-d3, O-O, Re1, h3",
            "Comprendre le rôle du pion a4 contre …b5",
            "Préparer la manœuvre Nbd2-f1",
          ],
          pgn: `{Le Pianissimo est le système préféré des grands maîtres modernes : au lieu d'ouvrir le centre, les Blancs construisent patiemment. Chaque coup a un rôle précis, et l'ordre compte.}
1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d3 d6 6. O-O {Le roi à l'abri d'abord : la tour pourra rejoindre e1.}
6... O-O
(6... a6 {Les Noirs préparent …Ba7 pour garder leur fou à l'abri de d4 et b4.} 7. a4 {Le pion empêche …b5, qui chasserait votre fou c4. [%cal Ga4b5]})
7. Re1 {La tour soutient e4 : d4 pourra être joué sans craindre …Nxe4. [%cal Ge1e4]}
7... a6 {Le fou c5 aura une retraite en a7.}
(7... a5 {Les Noirs gagnent de l'espace et préparent …a4.} 8. h3 {Le pion interdit …Bg4 et …Ng4, deux pièces noires qui gêneraient votre cavalier f3. [%cal Gh3g4]})
8. a4 {Le même réflexe : …b5 ne doit pas chasser votre fou. [%cal Ga4b5]}
8... Ba7 9. h3 {La case g4 est interdite : votre cavalier f3 ne sera jamais cloué. [%cal Gh3g4]}
9... h6 {Les Noirs prennent la même précaution contre Bg5 et Ng5.}
10. Nbd2 {Le cavalier passe par d2 car c3 est occupé par le pion : sa route est d2-f1-g3. [%cal Gd2f1,Gf1g3]}`,
          conclusion:
            "Le schéma du Pianissimo : c3, d3, O-O, Re1, a4, h3 puis Nbd2-f1. Rien n'est forcé, mais chaque coup prive les Noirs d'une ressource avant de préparer d4 ou b4.",
        },
        {
          legacyIds: ["italian-m2"],
          title: "Deux Cavaliers : l'attaque 4.Ng5",
          eco: "C58",
          kind: "line",
          objectives: [
            "Attaquer f7 avec le cavalier et le fou",
            "Garder le pion de plus après 5…Na5",
            "Répondre à 5…Nxd5 par 6.d4",
          ],
          pgn: `{Contre 3…Nf6, le coup 4.Ng5 attaque directement f7 avec deux pièces. Les Noirs doivent jouer …d5 et sacrifier un pion : votre tâche est de le garder sans laisser vos pièces se faire chasser.}
1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. Ng5 {Le cavalier et le fou frappent f7 : la menace est Nxf7. [%cal Gg5f7,Gc4f7]}
4... d5 {La seule défense sérieuse : les Noirs coupent la diagonale du fou.}
5. exd5 {Le pion prend et maintient la diagonale fermée.}
5... Na5 {Les Noirs chassent le fou au prix d'un pion.}
(5... Nxd5 {Les Noirs reprennent, mais leur cavalier d5 est fragile.} 6. d4 {Plus fort que le sacrifice en f7 : le centre s'ouvre pendant que le roi noir est encore en e8. [%cal Gd4e5]})
6. Bb5+ {Avec échec : le fou garde la diagonale a4-e8 et la case c6. [%cal Gb5e8]}
6... c6 7. dxc6 bxc6 8. Bd3 {Le fou se place en d3, où il soutient e4 et ne peut pas être chassé par …e4 avec tempo sur le cavalier.}
8... Nd5 {Le cavalier centralisé prépare …Nf4 contre votre fou. [%cal Gd5f4]}
9. Nf3 {Le cavalier rentre, attaque e5 et protège h2. [%cal Gf3e5]}
9... Bd6 10. O-O {Le roque : votre pion de plus est sain, les Noirs ont de l'activité.}
10... Nf4 11. Re1 {La tour vise e5 et laisse f1 libre au fou.}
11... Nxd3 12. cxd3 {La structure d3 protège e4 et c4 ; vous gardez votre pion de plus.}
12... O-O 13. Nc3 {Développement : le cavalier contrôle e4 et d5. [%cal Gc3e4,Gc3d5]}`,
          conclusion:
            "Contre les Deux Cavaliers, 4.Ng5 gagne un pion : après …Na5, Bb5+ puis Bd3 et Nf3 le consolident. Vos adversaires ont de l'activité, mais vous avez un avantage matériel durable.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Plans typiques",
      summary:
        "Les manœuvres du Pianissimo : la route Nbd2-f1-g3, la poussée d4 au bon moment, l'expansion b4 et la structure après Bxe6.",
      stage: "plans",
      lessons: [
        {
          title: "La route Nbd2-f1-g3",
          eco: "C54",
          kind: "line",
          objectives: [
            "Conduire le cavalier b1 vers g3",
            "Savoir quand jouer Bb3 pour garder le fou",
            "Préparer Nf5 contre le roque noir",
          ],
          pgn: `{Dans le Pianissimo, le cavalier b1 n'a pas de case naturelle en c3. Sa route est longue mais précieuse : d2, f1 puis g3, d'où il visera f5 et h5, deux cases proches du roi noir.}
1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d3 d6 6. O-O O-O 7. Re1 a6 8. a4 Ba7 9. h3 h6 10. Nbd2 {Première étape de la manœuvre. [%cal Gd2f1]}
10... Ne7 {Les Noirs font le même voyage avec leur cavalier c6 : il ira en g6.}
11. Nf1 {Deuxième étape : le cavalier libère la diagonale du fou c1 et vise g3. [%cal Gf1g3]}
11... Ng6 12. Ng3 {Le cavalier est arrivé : il vise f5, d'où il frapperait h6 et g7. [%cal Gg3f5]}
12... c6 {Les Noirs préparent …d5 et …b5.}
13. Bb3 {Le fou se met à l'abri de …d5 et de …b5 et garde la diagonale vers f7. [%cal Gb3f7]}`,
          conclusion:
            "La manœuvre Nbd2-f1-g3 met une pièce de plus près du roi noir sans rien affaiblir. Avec Bb3, le fou c4 reste en vie face à …d5 et …b5.",
        },
        {
          title: "La poussée d4 au bon moment",
          eco: "C54",
          kind: "line",
          objectives: [
            "Jouer d4 quand le cavalier c6 a quitté la défense de e5",
            "Maintenir la tension centrale avec Nbd2",
            "Rediriger le fou vers c2",
          ],
          pgn: `{Le Pianissimo prépare d4 ; encore faut-il choisir le moment. Le bon signal : quand le cavalier noir quitte c6, la case e5 perd un défenseur et d4 devient fort.}
1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d3 d6 6. O-O O-O 7. Re1 a6 8. a4 Ba7 9. h3 Ne7 {Le cavalier part vers g6 : e5 n'a plus que le pion d6 pour défenseur.}
10. d4 {C'est le moment : le centre s'élargit et e5 est attaqué. [%cal Gd4e5]}
10... Ng6 11. Nbd2 {Le cavalier soutient e4 et laisse la tension se maintenir. [%cal Gd2e4]}
11... h6 {Les Noirs interdisent Bg5.}
(11... c6 {Les Noirs préparent …d5.} 12. Bf1 {Le fou se replie et soutient e4 indirectement ; la tension centrale reste en votre faveur. [%cal Gf1d3]})
12. Bb3 Re8 13. Bc2 {Le fou rejoint la diagonale b1-h7 : derrière e4, il vise le roque noir. [%cal Gc2g6]}`,
          conclusion:
            "Le bon moment pour d4 est celui où les Noirs relâchent leur contrôle de e5. Ensuite, Nbd2 et Bc2 soutiennent e4 et préparent une attaque sur l'aile roi.",
        },
        {
          title: "L'aile dame : a4 et b4",
          eco: "C54",
          kind: "line",
          objectives: [
            "Gagner de l'espace avec b4 face au fou a7",
            "Reprendre en e6 au bon moment",
            "Préparer la réponse à la rupture …d5",
          ],
          pgn: `{Quand le centre reste fermé, les Blancs peuvent aussi jouer à l'aile dame : avec a4 et b4, ils gagnent de l'espace et enferment le fou a7 derrière ses propres pions.}
1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d3 d6 6. O-O O-O 7. Re1 a6 8. a4 Ba7 9. h3 h6 10. Nbd2 Re8 11. b4 {L'aile dame avance : le pion prépare b5 contre le cavalier c6. [%cal Gb4b5]}
11... Be6 {Les Noirs proposent l'échange des fous de cases blanches.}
12. Bxe6 {Prenez : le fou c4 n'a pas de bonne retraite et l'échange vous donne la colonne e semi-ouverte après …Rxe6.}
12... Rxe6 13. Qc2 {La dame soutient e4 et prépare Nf1-e3. [%cal Gc2e4]}
13... Qd7 14. Nf1 {Le cavalier vise e3 et g3, et contrôle d5. [%cal Gf1e3]}
14... d5 {La rupture noire : le centre s'ouvre.}
15. Ng3 {Le cavalier soutient e4 et vise f5 : la tension se maintient sans rien céder. [%cal Gg3f5]}`,
          conclusion:
            "Avec a4 et b4, les Blancs gagnent de l'espace à l'aile dame et rendent le fou a7 inactif. Quand les Noirs rompent par …d5, vos pièces sont prêtes à soutenir e4.",
        },
        {
          title: "Après Bxe6 : jouer contre les pions doublés",
          eco: "C54",
          kind: "line",
          objectives: [
            "Comprendre la structure …fxe6",
            "Viser le pion e6 et la case d5",
            "Neutraliser la colonne f ouverte",
          ],
          pgn: `{Quand les Noirs jouent …Be6 et que vous échangez en e6, la reprise …fxe6 leur ouvre la colonne f mais affaiblit leur centre. Votre jeu : attaquer l'aile dame et contrôler d5.}
1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d3 d6 6. O-O O-O 7. Re1 a6 8. a4 Ba7 9. h3 h6 10. Nbd2 Be6 {Le fou propose l'échange.}
11. Bxe6 {Prenez : la reprise par le pion f doublera les pions noirs.}
11... fxe6 12. b4 {Le pion prend de l'espace et prépare b5 contre le cavalier c6. [%cal Gb4b5]}
12... Qe8 {La dame rejoint l'aile roi par g6 ou h5.}
(12... Nh5 {Le cavalier vise f4.} 13. Nf1 Qf6 {Les Noirs alignent dame et tour sur la colonne f.} 14. Ra2 {La tour couvre f2 par la deuxième rangée : une défense élégante. [%cal Ga2f2]})
(12... Ne7 13. Nf1 Ng6 14. Ra2 {La tour protège la deuxième rangée avant l'arrivée des pièces noires. [%cal Ga2f2]})
13. Nf1 Nh5 14. Ra2 {La tour défend f2 ; votre cavalier f1 pourra aller en e3, face à la case d5. [%cal Ga2f2,Gf1e3]}
14... Nf4 15. Kh2 {Le roi protège h3 et g3 : le sacrifice …Nxh3 ne marche plus, et Ng3 chassera bientôt le cavalier f4. [%cal Gf1g3]}`,
          conclusion:
            "Après Bxe6 fxe6, les Noirs ont la colonne f mais un centre figé. Défendez f2 par Ra2, centralisez le cavalier en e3, puis jouez sur l'aile dame avec b4-b5.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Réponses adverses",
      summary:
        "Ce que les Noirs jouent pour éviter le Giuoco : les Deux Cavaliers par 4.d3, la Défense hongroise, les coups rares et les déviations du 4e coup.",
      stage: "responses",
      lessons: RESPONSES,
    },
    // =====================================================================================
    {
      title: "Pièges",
      summary: "Les pièges classiques de l'Italienne : ceux qu'il faut éviter et ceux qui punissent un développement imprécis.",
      stage: "traps",
      lessons: TRAPS,
    },
    // =====================================================================================
    {
      title: "Grande théorie",
      summary:
        "Les lignes profondes : l'attaque Møller, le gambit Evans, l'attaque Max Lange et la ligne principale du Pianissimo.",
      stage: "theory",
      lessons: THEORY,
    },
  ],
};
