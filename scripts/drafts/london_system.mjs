// Brouillon de la Masterclass « Système de Londres » (côté Blancs).
// Les flèches du coup à jouer sont ajoutées par scripts/course-builder.mjs ; celles écrites ici
// illustrent une idée (cible, manœuvre, menace).
import { TRAPS } from "./london_system-traps.mjs";

const MAIN = "1. d4 d5 2. Bf4 Nf6 3. e3 e6 4. Nf3 c5 5. c3 Nc6 6. Nbd2 Bd6 7. Bg3 O-O 8. Bd3";

export default {
  id: "london_system",
  name: "Système de Londres",
  description:
    "Le fou en f4 avant e3, puis la pyramide c3-d4-e3 : un système complet côté Blancs contre …d5 et contre les défenses indiennes. Plans Ne5-f4, Qe2-Rd1-e4, réponses à …Qb6, …Bf5, …c5 et …g6, pièges et lignes principales.",
  side: "white",
  eco: ["D00", "D02", "A45", "A46", "A47", "A48"],
  chapters: [
    // =====================================================================================
    {
      title: "Les fondations",
      summary:
        "L'ordre Bf4 puis e3, la pyramide c3-d4-e3, la retraite Bg3, la défense de b2 contre …Qb6 et les deux schémas noirs les plus fréquents : …g6 et …c6-…Bf5.",
      stage: "foundations",
      lessons: [
        {
          title: "Le schéma de Londres : Bf4 avant e3",
          eco: "D00",
          kind: "concept",
          objectives: [
            "Sortir le fou f4 avant de jouer e3",
            "Construire la pyramide c3-d4-e3",
            "Développer le cavalier en d2 et reculer le fou en g3 face à …Bd6",
          ],
          pgn: `{Le Système de Londres est un plan plus qu'une suite de coups : le fou de cases noires sort avant que e3 ne l'enferme, puis les pions forment une pyramide c3-d4-e3 que rien ne peut ébranler. Les mêmes cases conviennent contre presque toutes les défenses : c'est ce qui en fait une arme si économique.}
1. d4 d5 2. Bf4 {Le fou sort tout de suite : sur f4, il contrôle e5 et toute la diagonale h2-b8. [%cal Gf4e5,Gf4b8]}
2... Nf6 3. e3 {Maintenant seulement, e3 : le pion soutient d4 et ouvre la route au fou f1. [%cal Gf1d3]}
3... e6
(3... c5 {Les Noirs attaquent d4 tout de suite.} 4. c3 {Le pion c3 tient d4 : si …cxd4, exd4 garde un pion au centre et ouvre la colonne e. [%cal Gc3d4]})
4. Nf3 {Le cavalier surveille e5 et défend h2 contre les futures attaques sur le roque. [%cal Gf3e5]}
4... c5
(4... Bd6 {Les Noirs proposent tout de suite l'échange des fous de cases noires.} 5. Bg3 {Contre …Bd6, on recule : l'échange …Bxg3 hxg3 ouvrirait la colonne h à votre tour h1. [%cal Gh1h7]})
5. c3 {La pyramide c3-d4-e3 est en place : la pression de …c5 sur d4 ne mène à rien. [%cal Gc3d4,Ge3d4]}
5... Nc6 6. Nbd2 {Le cavalier va en d2 et non en c3, où il bloquerait le pion c ; d'ici, il prépare la poussée e4. [%cal Gd2e4]}
6... Bd6 7. Bg3 {Le fou évite l'échange et reste sur la diagonale b8-h2, qu'il dispute au fou d6.}
7... O-O 8. Bd3 {Le fou vise h7, le point le plus sensible du roque noir : le schéma complet est en place. [%cal Gd3h7]}`,
          conclusion:
            "Retenez l'ordre : Bf4 avant e3, puis Nf3, c3, Nbd2 et Bd3. Contre …Bd6, Bg3 garde votre fou, et si les Noirs l'échangent, la reprise hxg3 vous donne la colonne h.",
        },
        {
          legacyIds: ["london_system-m2"],
          title: "L'ordre 2.Nf3 et la défense de b2",
          eco: "D02",
          kind: "line",
          objectives: [
            "Jouer le schéma de Londres par l'ordre 2.Nf3",
            "Défendre b2 par Qc2 quand le fou est en d3",
            "Éviter Qb3 qui laisse le fou d3 se faire piéger",
          ],
          pgn: `{Avec 2.Nf3 puis 3.Bf4, on arrive au même schéma. Un détail change tout : quand le fou est déjà en d3, la riposte …Qb6 contre b2 ne se traite pas comme d'habitude, car Qb3 permettrait …c4 avec gain de temps sur le fou.}
1. d4 d5 2. Nf3 Nf6 3. Bf4 e6 4. e3 c5 5. c3 Nc6 6. Bd3 {Le fou se développe avant le cavalier b1 : il vise déjà h7. [%cal Gd3h7]}
6... Bd6
(6... Qb6 {La dame attaque b2, qui n'est plus défendu par le fou c1.} 7. Qc2 {La dame défend b2 et garde le contact avec e4 ; Qb3 serait une erreur, car …c4 chasserait votre dame et enfermerait le fou d3. Si …c4 arrive malgré tout, Be2 puis b3 mineront la chaîne c4-d5. [%cal Gc2b2]} 7... Bd7 8. Nbd2 {Le cavalier rejoint d2 : b2 est tenu et le schéma reste intact. [%cal Gd2e4]})
7. Bg3 {Le fou reste sur sa diagonale et laisse aux Noirs la décision d'échanger.}
7... O-O 8. Nbd2 {Le cavalier rejoint d2 : on retrouve la position modèle du Londres. [%cal Gd2e4]}
8... b6 9. Qe2 {La dame soutient e4 et libère d1 pour une tour. [%cal Ge2e4]}`,
          conclusion:
            "Par 2.Nf3, le schéma est le même, mais l'ordre change les réponses. Le fou en d3 interdit Qb3 contre …Qb6 : préférez Qc2, puis Be2 si …c4.",
        },
        {
          title: "Contre …g6 : Be2, h3 et le roque",
          eco: "A48",
          kind: "concept",
          objectives: [
            "Garder la même pyramide contre le fianchetto noir",
            "Préparer la retraite h2 du fou par h3",
            "Répondre à …c5 par c3 et non par dxc5",
          ],
          pgn: `{Contre l'Est-Indienne (…g6, …Bg7, …d6), le fou d3 frapperait dans le vide : le fou g7 et le pion g6 protègent le roque. Les Blancs placent donc le fou en e2 et préparent une retraite en h2, où le fou f4 échappe à …Nh5 et à …e5.}
1. d4 Nf6 2. Bf4 g6 3. e3 Bg7 4. Nf3 O-O 5. Be2 {Sur e2, le fou est modeste mais utile : il couvre g4 et h5, les cases des cavaliers noirs. [%cal Ge2g4,Ge2h5]}
5... d6 6. h3 {Le fou f4 aura une retraite en h2, et …Ng4 ou …Bg4 sont interdits. [%cal Gf4h2]}
6... c5
(6... Nbd7 {Les Noirs préparent …e5.} 7. O-O {Le roi d'abord : contre …e5, le fou se repliera en h2. [%cal Gf4h2]})
7. c3 {La pyramide encaisse …c5 : dxc5 rendrait le centre aux Noirs.}
7... b6 8. O-O {Le roque termine le développement ; votre plan sera Nbd2, a4 et Qb3 ou Qc2. [%cal Ga2a4]}
8... Bb7 9. a4 {Le pion gagne de l'espace et menace a5 contre la structure …b6. [%cal Ga4a5]}`,
          conclusion:
            "Contre le fianchetto noir, gardez la pyramide, mettez le fou en e2 et jouez h3 pour offrir la case h2 au fou f4. Ensuite, a4 et Nbd2 donnent du jeu à l'aile dame.",
        },
        {
          legacyIds: ["london_system-m1"],
          title: "Contre …c6 et …Bf5 : c4 et Qb3",
          eco: "D00",
          kind: "line",
          objectives: [
            "Profiter du fou f5 sorti pour attaquer b7",
            "Jouer c4 avant Qb3 pour ouvrir la diagonale",
            "Gagner de l'espace avec c5 après l'échange des dames",
          ],
          pgn: `{Quand les Noirs sortent leur fou en f5, la case b7 n'est plus défendue que par la dame. Les Blancs l'exploitent en ajoutant c4 au schéma : la dame en b3 attaquera b7 et d5 en même temps.}
1. d4 d5 2. Bf4 Nf6 3. e3 c6 4. Nf3 Bf5 5. c4 {Le pion frappe d5 : la dame pourra venir en b3 sur une diagonale ouverte. [%cal Gc4d5,Gd1b3]}
5... e6 6. Nc3 {Le cavalier ajoute une pression sur d5 avant que la dame ne rejoigne b3. [%cal Gc3d5]}
6... Nbd7 7. Qb3 {La dame attaque b7 et maintient d5 sous pression. [%cal Gb3b7]}
7... Qb6 8. c5 {Le pion chasse la dame avec gain d'espace : les Noirs doivent échanger. [%cal Gc5b6]}
8... Qxb3 9. axb3 {La reprise vers le centre ouvre la colonne a à la tour a1 ; vos pions b3 et c5 tiennent l'aile dame. [%cal Ga1a7]}`,
          conclusion:
            "Contre …c6 et …Bf5, ajoutez c4 et Qb3 : b7 est sous pression. Après …Qb6 c5 Qxb3 axb3, vous avez de l'espace et une colonne a semi-ouverte pour une finale agréable.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Plans typiques",
      summary:
        "L'étau Ne5-f4, la batterie Qe2-Rd1 avant e4, la prise en c5 contre …Qc7 et la gestion de la structure …cxd4-…Nh5.",
      stage: "plans",
      lessons: [
        {
          title: "Ne5 et f4 : l'étau sur e5",
          eco: "D02",
          kind: "line",
          objectives: [
            "Installer un cavalier en e5 soutenu par f4",
            "Former la batterie Qf3 contre l'aile roi",
            "Répondre à …Nf5 en gardant le fou g3",
          ],
          pgn: `{Quand les Noirs jouent …b6 et …Bb7, leur cavalier c6 ne contrôle plus e5 qu'avec difficulté. Les Blancs y installent un cavalier, le soutiennent par f4 et dirigent la dame vers l'aile roi : une structure de type Stonewall où l'attaque vient presque seule.}
${MAIN} 8... b6 9. Ne5 {Le cavalier s'installe sur la case que le fou g3 surveille déjà. [%cal Gg3e5]}
9... Bb7 10. f4 {Le pion soutient le cavalier : il ne pourra plus être chassé par …Nd7. [%cal Gf4e5]}
10... Ne7 {Le cavalier noir se dirige vers f5 pour attaquer le fou g3 et e3.}
11. Qf3 {La dame rejoint l'aile roi : elle vise h5 et soutient e4 si nécessaire. [%cal Gf3h5]}
11... Nf5 12. Bf2 {Le fou se replie en f2 : il défend e3 et reste en vie. [%cal Gf2e3]}
12... Be7 13. g4 {Le pion chasse le cavalier f5 et ouvre la voie à l'attaque. [%cal Gg4f5]}`,
          conclusion:
            "Ne5 suivi de f4 donne aux Blancs un avant-poste inébranlable. Avec Qf3 et g4, l'aile roi noire devient la cible ; gardez le fou en f2 pour protéger e3.",
        },
        {
          title: "Qe2, Rd1 puis e4",
          eco: "D02",
          kind: "line",
          objectives: [
            "Préparer e4 par Qe2 et Rd1",
            "Pousser e5 au bon moment pour gagner de l'espace",
            "Garder le roi au centre tant que la tension dure",
          ],
          pgn: `{La poussée e4 ouvre le jeu pour vos pièces, mais il faut la préparer. La dame en e2 soutient e4 et la tour en d1 se place en face de la dame noire, avant même le roque : la colonne d s'ouvrira tôt ou tard.}
${MAIN} 8... b6 9. Qe2 {La dame soutient la future poussée e4. [%cal Ge2e4]}
9... Bb7 10. Rd1 {La tour prend la colonne d : si le centre s'ouvre, elle fera face à la dame noire. [%cal Gd1d8]}
10... Re8
(10... Ne7 {Les Noirs proposent l'échange des fous par …Bxg3 ou dégagent leur cavalier.} 11. O-O {Le roi se met à l'abri ; e4 viendra au coup suivant. [%cal Ge3e4]})
11. e4 {La poussée : d5 est attaqué deux fois et le fou d3 s'ouvre la diagonale. [%cal Ge4d5]}
11... Be7 12. e5 {Le pion chasse le cavalier f6, meilleur défenseur de h7. [%cal Ge5f6]}
12... Nd7 13. a3 {Le pion prend la case b4 aux pièces noires : avant d'attaquer, on supprime le contre-jeu …Nb4. Viendront ensuite h4 et Ng5, la tour h1 étant encore à sa place. [%cal Ga3b4,Gh2h4]}`,
          conclusion:
            "Avec Qe2 et Rd1, vos pièces sont prêtes avant l'ouverture du centre. Après e4-e5, le cavalier f6 est chassé et le roi noir manque de défenseurs : h4 et Ng5 deviennent dangereux.",
        },
        {
          title: "Contre …Qc7 : dxc5 au bon moment",
          eco: "D02",
          kind: "line",
          objectives: [
            "Reconnaître le plan …Qc7 et …e5",
            "Prendre en c5 pour gagner un temps sur la dame",
            "Développer le fou en d3 avec le roque",
          ],
          pgn: `{Quand les Noirs jouent …Bd6 et …Qc7, ils préparent …e5 pour contester votre fou g3. Prendre en c5 au bon moment déplace la dame noire et vous donne la case d4 pour un cavalier.}
1. d4 d5 2. Bf4 Nf6 3. e3 e6 4. Nf3 Bd6 5. Bg3 O-O 6. Nbd2 c5 7. c3 Qc7 {La dame soutient la poussée …e5.}
8. dxc5 {La prise : le fou d6 doit reprendre ou la dame se déplacer, et …e5 n'est plus possible. [%cal Gd4c5]}
8... Qxc5 {Reprendre avec le fou serait impossible : Bxc7 gagnerait la dame.}
9. Bd3 {Le fou se développe en visant h7 ; la dame noire en c5 est exposée à Nb3 ou Rc1. [%cal Gd3h7]}
9... Nbd7 10. e4 {La poussée centrale : la dame noire en c5 n'empêche rien, et d5 est attaqué. [%cal Ge4d5]}
10... Bxg3
(10... dxe4 11. Nxe4 {Le cavalier reprend avec gain de temps sur la dame c5 et le fou d6. [%cal Ge4c5,Ge4d6]})
11. hxg3 {La reprise ouvre la colonne h, comme toujours après l'échange en g3. [%cal Gh1h7]}
11... dxe4 12. Nxe4 {Le cavalier centralisé attaque la dame : vos pièces sont plus actives et le roi peut encore choisir son côté. [%cal Ge4c5]}`,
          conclusion:
            "Contre …Qc7, la prise dxc5 désorganise le jeu noir : la dame doit reprendre sur une case exposée. Ensuite Bd3 et e4 ouvrent le centre au moment où vos pièces sont prêtes.",
        },
        {
          legacyIds: ["london_system-m3"],
          title: "…cxd4 et …Nh5 : la retraite Be3",
          eco: "D02",
          kind: "line",
          objectives: [
            "Reprendre exd4 pour ouvrir la colonne e",
            "Répondre à …Nh5 par Be3 plutôt que d'échanger",
            "Installer le cavalier en e5 dans la structure du pion d4",
          ],
          pgn: `{Si les Noirs prennent en d4, la structure change : votre pion d4 est soutenu par c3 et vous avez la colonne e. Les Noirs essaient alors de capturer votre fou par …Nh5 : il ne faut pas leur offrir la paire de fous à bas prix.}
1. d4 d5 2. Nf3 Nf6 3. Bf4 c5 4. e3 e6 5. c3 Nc6 6. Nbd2 cxd4 {Les Noirs fixent la structure.}
7. exd4 {La reprise vers le centre ouvre la colonne e ; le pion d4 reste solidement soutenu par c3. [%cal Ge1e8,Gc3d4]}
7... Nh5 {Le cavalier attaque le fou f4.}
8. Be3 {Le fou recule en e3, où il défend d4 et ne peut plus être pris. [%cal Ge3d4]}
8... Bd6 9. Ne5 {Le cavalier occupe e5, l'avant-poste que le pion d4 soutient. [%cal Gd4e5]}
9... g6 {Les Noirs empêchent Qxh5 et préparent …Nf6 ou …Ng7.}
10. g4 {Le pion chasse le cavalier h5 : sa seule case est g7, loin du centre. [%cal Gg4h5]}`,
          conclusion:
            "Après …cxd4 exd4, vous avez la colonne e et un avant-poste en e5. Contre …Nh5, Be3 garde le fou ; puis Ne5 et g4 repoussent le cavalier h5 vers g7.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Réponses adverses",
      summary:
        "Les défenses qui évitent la ligne principale : l'échange des fous par …Bf5, la contre-attaque 2…c5, la poussée …e5 de l'Est-Indienne et le schéma …b6 de l'Ouest-Indienne.",
      stage: "responses",
      lessons: [
        {
          legacyIds: ["london_system-m5"],
          title: "…Bf5 et …e6 : l'échange Bd3",
          eco: "D02",
          kind: "line",
          objectives: [
            "Proposer l'échange du fou f5 par Bd3",
            "Reprendre avec la dame pour viser b7 et e4",
            "Échanger le fou d6 pour garder un pion e4 jouable",
          ],
          pgn: `{Contre le Londres, beaucoup de joueurs sortent leur fou en f5 avant …e6 : c'est la pièce que le schéma noir a le plus de mal à développer. Le plus simple est de l'échanger : vous gardez un bon fou en f4, les Noirs n'ont plus leur meilleure pièce mineure.}
1. d4 d5 2. Nf3 Nf6 3. Bf4 Bf5 4. e3 e6 5. Bd3 {Le fou propose l'échange : après …Bxd3, la dame reprend en développant. [%cal Gd3f5]}
5... Bxd3 6. Qxd3 {La dame vise b5 et b7, et soutient e4. [%cal Gd3b5,Gd3e4]}
6... c6
(6... c5 7. c3 {La pyramide tient : votre dame en d3 couvre aussi e4 et c4.} 7... Nc6 8. Nbd2 {Le cavalier soutient e4 : les Blancs ont un développement souple et facile. [%cal Gd2e4]})
7. O-O {Le roque d'abord : vous déciderez ensuite entre Nbd2 et c4.}
7... Bd6 8. Bxd6 {Ici l'échange est bon : la dame noire reprend en d6 et ne peut plus aller en b6. [%cal Gf4d6]}
8... Qxd6 9. Nbd2 {Le cavalier soutient e4 : la poussée e4 libérera vos pièces. [%cal Ge3e4]}
9... Nbd7 10. e4 {Le centre s'ouvre en votre faveur : vous avez plus d'espace et un léger avantage de développement. [%cal Ge4d5]}`,
          conclusion:
            "Contre …Bf5, Bd3 retire aux Noirs leur fou actif. Avec la dame en d3, le roque puis Nbd2, la poussée e4 vient naturellement et donne un jeu central confortable.",
        },
        {
          title: "Contre 2…c5 : e3, c3 et Qb3",
          eco: "D00",
          kind: "line",
          objectives: [
            "Répondre à 2…c5 par e3 et c3",
            "Attaquer b7 par Qb3 quand le fou noir est en f5",
            "Échanger le fou f5 par Nh4 contre …Qb6",
          ],
          pgn: `{Le coup 2…c5 attaque d4 tout de suite et prépare …Qb6 contre b2. Les Blancs gardent leur calme : e3, c3 et Nd2, puis ils frappent b7 dès que le fou noir quitte c8.}
1. d4 d5 2. Bf4 c5 3. e3 {Le pion soutient d4 : …cxd4 sera repris par le pion e. [%cal Ge3d4]}
3... Nc6 4. c3 {La pyramide est formée. [%cal Gc3d4]}
4... Nf6
(4... Qb6 {Les Noirs attaquent b2 sans attendre.} 5. Qb3 {La dame protège b2 et propose l'échange ; ici, votre fou n'est pas encore en d3. [%cal Gb3b6]} 5... c4 6. Qc2 {La dame recule : la chaîne c4-d5 est figée, et e4 sera votre levier central. [%cal Ge3e4]})
5. Nd2 {Le cavalier va en d2 avant f3 : il pourra appuyer e4 ou rejoindre f3. [%cal Gd2e4]}
5... Bf5 6. Ngf3 Qb6 {La dame attaque b2.}
7. Nh4 {Le cavalier chasse le fou f5 : sans lui, b7 sera faible. [%cal Gh4f5]}
7... Bd7 8. Qb3 {La dame propose l'échange : après …Qxb3 axb3, la colonne a s'ouvre pour vous. [%cal Gb3b6,Ga1a7]}`,
          conclusion:
            "Contre 2…c5, e3, c3 et Nd2 tiennent d4. Si le fou noir sort en f5, chassez-le par Nh4 ; contre …Qb6, Qb3 défend b2 tant que votre fou n'est pas en d3.",
        },
        {
          title: "Contre l'Est-Indienne : …e5 et la retraite Bh2",
          eco: "A48",
          kind: "line",
          objectives: [
            "Anticiper …e5 en préparant la retraite h2",
            "Contester le centre noir par c4",
            "Garder le fou h2 en face du pion e5",
          ],
          pgn: `{Dans l'Est-Indienne, le plan noir est clair : …Nbd7, …Qe8 et …e5 pour chasser votre fou f4. Grâce à h3, le fou trouve refuge en h2, d'où il continue de presser e5.}
1. d4 Nf6 2. Bf4 g6 3. e3 Bg7 4. Nf3 O-O 5. Be2 d6 6. h3 Nbd7 7. O-O Qe8 {La dame soutient la poussée …e5.}
8. Bh2 {Le fou s'écarte de …e5 avant qu'elle n'arrive, et reste sur la diagonale b8-h2. [%cal Gh2e5]}
8... e5 9. c4 {Les Blancs gagnent de l'espace et préparent Nc3 : le pion d5 n'est plus possible pour les Noirs. [%cal Gc4d5]}
9... Ne4 {Le cavalier s'installe au centre.}
10. Nc3 {Le cavalier conteste e4 : vous gardez le contrôle des cases blanches centrales. [%cal Gc3e4]}
10... Nxc3 11. bxc3 {La reprise vers le centre renforce d4 et ouvre la colonne b. [%cal Gb1b7]}`,
          conclusion:
            "Contre l'Est-Indienne, h3 prépare la retraite Bh2 avant même …e5. Ensuite c4 et Nc3 donnent de l'espace : votre fou h2 reste braqué sur e5.",
        },
        {
          title: "Contre …e6 et …b6 : le schéma Ouest-Indien",
          eco: "A47",
          kind: "line",
          objectives: [
            "Jouer h3 pour garder le fou f4 face à …Nh5",
            "Reprendre exd4 pour garder un centre mobile",
            "Préparer Re1 et Ne5 contre le fianchetto dame",
          ],
          pgn: `{Avec …e6, …b6 et …Bb7, les Noirs visent e4 depuis b7. Les Blancs gardent leur pyramide, mais ajoutent h3 pour protéger le fou et préparent un jeu sur la colonne e.}
1. d4 Nf6 2. Bf4 e6 3. e3 b6 4. Nf3 Bb7 5. Nbd2 {Le cavalier contrôle e4, la case visée par le fou b7. [%cal Gd2e4]}
5... Be7 6. h3 {Le fou f4 aura une retraite en h2 contre …Nh5. [%cal Gf4h2]}
6... O-O 7. Bd3 {Le fou conteste e4 avec le cavalier d2. [%cal Gd3e4]}
7... c5 8. c3 cxd4 9. exd4 {Le pion d4 et la colonne e ouverte : les Blancs ont un jeu clair. [%cal Ge1e7]}
9... d6 10. O-O {Le roque prépare Re1 et Qe2 : la colonne e est votre chemin vers l'aile roi. [%cal Gf1e1]}`,
          conclusion:
            "Contre le schéma …b6, gardez la pyramide, protégez e4 par Nbd2 et Bd3, et jouez h3 pour le fou. Après …cxd4 exd4, la colonne e devient votre arme.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Pièges",
      summary:
        "Les pièges du Londres : ceux qui punissent la gourmandise noire sur b2 et ceux où une pièce noire se retrouve en prise face à la batterie blanche.",
      stage: "traps",
      lessons: TRAPS,
    },
    // =====================================================================================
    {
      title: "Grande théorie",
      summary:
        "Les lignes profondes : 8…Qe7 et 9.Ne5, la structure …cxd4 avec Qb3 et Nh4, l'attaque e4-e5 contre …Be7 et la ligne principale contre …Bf5 et …Qb6.",
      stage: "theory",
      lessons: [
        {
          legacyIds: ["london_system-m4"],
          title: "Ligne principale : 8…Qe7 et 9.Ne5",
          eco: "D02",
          kind: "line",
          objectives: [
            "Installer le cavalier e5 contre …Qe7",
            "Échanger en d7 puis en d6 au bon moment",
            "Jouer dxc5 pour ouvrir le jeu contre le pion isolé",
          ],
          pgn: `{Avec …Qe7, les Noirs préparent …e5 et la dame couvre c5. Les Blancs prennent les devants : le cavalier va en e5, et une série d'échanges laisse aux Noirs une structure à problèmes.}
1. d4 d5 2. Nf3 Nf6 3. Bf4 e6 4. e3 c5 5. c3 Nc6 6. Nbd2 Bd6 7. Bg3 O-O 8. Bd3 Qe7 9. Ne5 {Le cavalier s'installe avant que …e5 ne soit possible. [%cal Ge5c6]}
9... Nd7 {Les Noirs contestent tout de suite le cavalier.}
10. Nxd7 {L'échange : le fou c8 reprend ou la dame quitte e7.}
10... Qxd7
(10... Bxd7 11. Bxd6 {Le fou d6 disparaît : la dame doit reprendre sur une case moins active. [%cal Gg3d6]} 11... Qxd6 12. dxc5 {Le pion c5 est pris : les Noirs doivent le récupérer par …Qxc5. [%cal Gd4c5]})
11. Bxd6 Qxd6 12. dxc5 {La prise libère la case d4 pour vos pièces. [%cal Gd4c5]}
12... Qxc5 13. O-O {Le roque : vous jouerez e4 pour attaquer d5 ou Nb3 et Nd4. [%cal Ge3e4,Gd2b3]}
13... e5 14. e4 {La poussée bloque les pions noirs : d5 est attaqué et votre fou d3 regagne de l'activité. [%cal Ge4d5]}`,
          conclusion:
            "Contre …Qe7, Ne5 puis les échanges en d7 et en d6 simplifient en votre faveur. Après dxc5, vos pièces visent d5 et la case d4.",
        },
        {
          title: "2…c5 3.e3 cxd4 : Qb3 et Nh4",
          eco: "D00",
          kind: "line",
          objectives: [
            "Reprendre exd4 et soutenir le centre par c3",
            "Attaquer b7 avec Qb3",
            "Chasser le fou noir par Nh4 et g4",
          ],
          pgn: `{Après 2…c5 3.e3 cxd4 4.exd4, on obtient une structure Caro-Kann à couleurs inversées : vous avez un temps de plus. Le fou noir sort souvent en f5 ; vous allez le traquer pour affaiblir b7.}
1. d4 d5 2. Bf4 c5 3. e3 cxd4 4. exd4 {La colonne e s'ouvre et votre fou f1 voit d3. [%cal Gf1d3]}
4... Nc6 5. c3 Nf6 6. Nd2 Bf5 7. Ngf3 e6 8. Qb3 {La dame attaque b7, que plus aucune pièce noire ne défend facilement. [%cal Gb3b7]}
8... Qc8 9. Nh4 {Le cavalier chasse le fou f5 : il ne pourra plus défendre b7 depuis la diagonale. [%cal Gh4f5]}
9... Bg4 10. h3 Bh5 11. g4 {Le pion chasse encore le fou : il ira en g6, où Nxg6 l'échangera. [%cal Gg4h5]}
11... Bg6 12. Nxg6 {Vous gagnez la paire de fous ; les Noirs reprendront vers l'aile roi. [%cal Gh4g6]}
12... hxg6 13. Bg2 {Le fou prend la grande diagonale : d5 et b7 sont sous pression. [%cal Gg2d5]}`,
          conclusion:
            "Dans la structure exd4, Qb3 et Nh4 chassent le fou noir et vous donnent la paire de fous. Votre jeu se concentre ensuite sur d5 et b7.",
        },
        {
          title: "9.e4 : l'attaque e4-e5 contre …Be7",
          eco: "D02",
          kind: "line",
          objectives: [
            "Pousser e4 avant Qe2 pour gagner de l'espace",
            "Chasser le cavalier f6 par e5",
            "Punir …Nh5 par Ng5 et Qxh5",
          ],
          pgn: `{Au lieu de préparer e4 par Qe2, les Blancs peuvent le jouer tout de suite. Après …Be7 et e5, le cavalier noir doit aller en h5, où il menace votre fou ; la ligne est plus tranchante mais très logique.}
${MAIN} 8... b6 9. e4 {La poussée immédiate : d5 est attaqué deux fois. [%cal Ge4d5]}
9... Be7
(9... dxe4 10. Nxe4 {Le cavalier reprend au centre : il menace Nxf6+ et vise d6. [%cal Ge4d6]} 10... Be7 11. dxc5 {La prise ouvre la colonne d en votre faveur. [%cal Gd4c5]})
10. e5 {Le pion chasse le cavalier f6 et gagne de l'espace sur l'aile roi. [%cal Ge5f6]}
10... Nh5 11. Ng5 {Le cavalier dégage la diagonale de la dame vers h5 : le cavalier noir n'a plus de défenseur, et Bxh7+ menace aussi. [%cal Gd1h5,Gd3h7]}
11... Bxg5 12. Qxh5 {La dame récupère la pièce et frappe h7. [%cal Gh5h7]}
12... g6 13. Qe2 {La dame revient défendre : le fou g5 est isolé de son camp et h4 va le chasser. [%cal Gh2h4]}
13... cxd4 14. h4 {Le pion attaque le fou g5 et ouvre la colonne h pour la tour. [%cal Gh4g5,Gh1h7]}`,
          conclusion:
            "L'attaque directe 9.e4 gagne de l'espace : après e5 et …Nh5, Ng5 puis Qxh5 forcent les Noirs à affaiblir leur roque par …g6. Avec h4, la colonne h s'ouvre contre le roi noir.",
        },
        {
          title: "Contre …Bf5 et …Qb6 : la ligne principale",
          eco: "D00",
          kind: "line",
          objectives: [
            "Répondre à …Qb6 par Qb3 dans l'ordre Nd2",
            "Profiter de l'échange des dames pour jouer à l'aile dame",
            "Répondre à …Nh5 par Bg3 et ramener le cavalier en f3",
          ],
          pgn: `{Contre le schéma …c5, …Nc6, …Bf5 et …Qb6, les Noirs combinent la pression sur b2 et un développement actif. La ligne principale répond coup pour coup : Nh4 contre le fou, Qb3 contre la dame.}
1. d4 d5 2. Bf4 Nf6 3. e3 c5 4. c3 Nc6 5. Nd2 Bf5 6. Ngf3 Qb6 7. Nh4 {Le cavalier attaque le fou f5 avant que b2 ne soit pris. [%cal Gh4f5]}
7... Bd7 8. Qb3 {Contre …Qb6, Qb3 est possible ici : votre fou f1 n'est pas en d3, rien ne craint …c4. [%cal Gb3b6]}
8... Qxb3 9. axb3 {La structure doublée est solide : la colonne a et la case b5 seront utiles. [%cal Ga1a7]}
9... Nh5 10. Bg3 {Le fou recule sur la diagonale : si …Nxg3, la reprise hxg3 donne une colonne h. [%cal Gh1h7]}
10... e6
(10... Nxg3 11. hxg3 {La structure g2-g3 est solide et la tour h1 entre en jeu. [%cal Gh1h7]} 11... e6 12. Nhf3 {Le cavalier rentre au centre et vise e5. [%cal Gf3e5]})
11. Nhf3 {Le cavalier a rempli sa mission : il revient vers e5, où il sera plus fort que le fou d7. [%cal Gf3e5]}`,
          conclusion:
            "Contre …Bf5 et …Qb6, Nh4 puis Qb3 mènent à une finale solide. Votre colonne a et l'activité du fou compensent largement les pions doublés.",
        },
      ],
    },
  ],
};
