// Brouillon de la Masterclass « Défense Sicilienne » (côté Noirs) : 1.e4 c5, système Najdorf.
// Répertoire : 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6, avec …e5 contre 6.Be3, 6.Be2, 6.f4 et 6.h3,
// …e6 contre 6.Bg5 (Pion empoisonné) et 6.Bc4, plus les anti-Siciliennes 2.c3, 2.Nc3 et 3.Bb5+.
// La Dragon (5…g6) est présentée en grande théorie comme alternative.
// Les flèches du coup à jouer sont ajoutées par scripts/course-builder.mjs ; celles écrites ici
// illustrent une idée (cible, manœuvre, menace).
import { TRAPS } from "./sicilian-traps.mjs";

const OPEN = "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3";
const NAJDORF = `${OPEN} a6`;
const ENGLISH = `${NAJDORF} 6. Be3 e5 7. Nb3 Be6 8. f3 Be7 9. Qd2 O-O 10. O-O-O Nbd7`;
const RACE = `${ENGLISH} 11. g4 b5 12. g5 b4 13. Ne2 Ne8 14. f4 a5`;
const POISON = `${NAJDORF} 6. Bg5 e6 7. f4 Qb6 8. Qd2 Qxb2 9. Rb1 Qa3`;
const BE2 = `${NAJDORF} 6. Be2 e5 7. Nb3 Be7 8. O-O O-O 9. Be3 Be6`;
const SOZIN = `${NAJDORF} 6. Bc4 e6 7. Bb3 b5 8. O-O Be7 9. Qf3 Qc7 10. Qg3 O-O 11. Bh6 Ne8`;
const ALAPINE = "1. e4 c5 2. c3 Nf6 3. e5 Nd5 4. d4 cxd4 5. Nf3 Nc6 6. cxd4 d6";

export default {
  id: "sicilian",
  name: "Défense Sicilienne",
  description:
    "1.e4 c5 : le combat déséquilibré par excellence. Un répertoire Najdorf complet côté Noirs avec …e5 contre l'attaque anglaise, 6.Be2 et 6.f4, le Pion empoisonné contre 6.Bg5, …e6 et …b5 contre 6.Bc4, les anti-Siciliennes 2.c3, 2.Nc3 et 3.Bb5+, la Dragon en alternative, pièges et grandes lignes.",
  side: "black",
  eco: ["B22", "B23", "B52", "B54", "B76", "B78", "B87", "B90", "B92", "B93", "B97"],
  chapters: [
    // =====================================================================================
    {
      title: "Les fondations",
      summary:
        "Pourquoi 1…c5 et 5…a6, la réponse …e5 contre 6.Be3 et 6.Be2, et la variante Alapine 2.c3.",
      stage: "foundations",
      lessons: [
        {
          title: "1…c5 et 5…a6 : l'idée Najdorf",
          eco: "B90",
          kind: "concept",
          objectives: [
            "Échanger un pion de côté contre le pion central d4",
            "Comprendre le rôle multiple du coup …a6",
            "Prendre de l'espace au centre par …e5 et …Be6",
          ],
          pgn: `{La Sicilienne crée un déséquilibre dès le premier coup : le pion c5 s'échange contre le pion d4, et les Noirs gardent deux pions centraux contre un. Le petit coup …a6 interdit Nb5 et Bb5, et prépare …e5 ou …b5 selon le plan blanc.}
1. e4 c5 {Le pion c5 contrôle d4 sans bloquer vos pièces. [%cal Gc5d4]}
2. Nf3
(2. c3 Nf6 {Contre l'Alapine, le cavalier attaque e4 tout de suite. [%cal Gf6e4]})
(2. Nc3 d6 {Contre 2.Nc3, le même pion d6 garde e5 en souplesse.})
2... d6 3. d4
(3. Bb5+ Bd7 {Le fou s'interpose et propose l'échange. [%cal Gd7b5]})
3... cxd4 4. Nxd4 Nf6 {Le cavalier attaque e4 et force Nc3. [%cal Gf6e4]}
5. Nc3 a6 {Le coup Najdorf : b5 est interdit aux pièces blanches. [%cal Ga6b5]}
6. Be3
(6. Bg5 e6 {Contre Bg5, le pion e6 protège la case d5 et le fou e7 pourra rompre le clouage.})
6... e5 {Le pion chasse le cavalier d4 et gagne de l'espace. [%cal Ge5d4]}
7. Nb3 Be6 {Le fou contrôle d5, la case clé de toute la structure. [%cal Ge6d5]}`,
          conclusion:
            "La Najdorf repose sur deux idées : …a6 tient b5 et les pièces blanches à distance, et …e5 gagne de l'espace avec le contrôle de d5 comme fil rouge.",
        },
        {
          legacyIds: ["sicilian-m3"],
          title: "6.Be3 e5 7.Nb3 : l'attaque anglaise",
          eco: "B90",
          kind: "line",
          objectives: [
            "Répondre à 6.Be3 par …e5 et …Be6",
            "Développer par …Be7, …O-O et …Nbd7",
            "Garder le contrôle de d5 face au plan f3, Qd2 et O-O-O",
          ],
          pgn: `{Contre 6.Be3, les Blancs préparent f3, Qd2, le grand roque et la poussée g4. Votre schéma est simple : …e5, …Be6, …Be7, petit roque et …Nbd7, puis la contre-attaque à l'aile dame.}
${NAJDORF} 6. Be3 e5 7. Nb3
(7. Nf3 Be7 {Le cavalier f3 est moins actif : développez sans crainte.})
(7. Nde2 Be7 {Même réponse : le fou e7 prépare le roque.})
7... Be6 8. f3
(8. Qd2 Nbd7 {Le cavalier rejoint c5 ou b6 et soutient …d5. [%cal Gd7b6]})
(8. Be2 Be7 {Contre le développement calme, le fou e7 suffit.})
8... Be7 9. Qd2 O-O 10. O-O-O Nbd7 {Les deux rois sont mis à l'abri sur des ailes opposées : la course aux attaques commence. [%cal Gb7b5]}`,
          conclusion:
            "Contre l'attaque anglaise, …e5, …Be6, …Be7 et …Nbd7 forment un bloc solide. Après le grand roque blanc, votre roi est en sécurité et l'aile dame vous appartient.",
        },
        {
          title: "6.Be2 e5 : la case d5 avant tout",
          eco: "B92",
          kind: "line",
          objectives: [
            "Répondre au développement classique par …e5",
            "Opposer le fou e6 au cavalier qui vise d5",
            "Roquer rapidement avant d'ouvrir le jeu",
          ],
          pgn: `{Contre 6.Be2, les Blancs jouent positionnel : ils visent la case d5, affaiblie par …e5. Votre réponse : le fou e6 et le cavalier d7 surveillent d5, et vous ne jouez …d5 qu'une fois bien préparé.}
${NAJDORF} 6. Be2 e5 7. Nb3
(7. Nf3 Be7 {Le cavalier f3 ne vise plus d5 aussi vite : le développement suit.})
7... Be7 8. O-O O-O 9. Be3
(9. Kh1 Be6 {Le fou prend sa diagonale, qu'importe le coup d'attente blanc. [%cal Ge6d5]})
9... Be6 {Le fou contrôle d5 et menace déjà …d5 dans certains cas. [%cal Ge6d5]}`,
          conclusion:
            "Contre 6.Be2, le cœur de la position est d5. Tant que le fou e6 et vos pièces contrôlent cette case, le pion d6 n'est pas faible.",
        },
        {
          legacyIds: ["sicilian-m1"],
          title: "2.c3 Nf6 : l'Alapine",
          eco: "B22",
          kind: "line",
          objectives: [
            "Attaquer e4 par 2…Nf6 pour forcer e5",
            "Contester le pion e5 par …d6 et …Nc6",
            "Répondre à Bb5 par …dxe5 et …Bd7",
          ],
          pgn: `{L'Alapine veut construire un grand centre par d4. 2…Nf6 attaque e4 tout de suite : après e5, le cavalier s'installe en d5, et …d6 avec …Nc6 sape le pion avancé.}
1. e4 c5 2. c3 Nf6 {Le cavalier attaque e4 avant que d4 ne le soutienne. [%cal Gf6e4]}
3. e5 Nd5 4. d4
(4. Nf3 Nc6 {Contre Nf3, le cavalier attaque e5. [%cal Gc6e5]} 5. Bc4 Nb6 6. Bb3 c4 {Le pion chasse le fou et gagne de l'espace. [%cal Gc4b3]} 7. Bc2 Qc7 8. Qe2 g5 {L'attaque du pion e5 par …g5-g4 : une idée originale et forte. [%cal Gg5g4]})
4... cxd4 5. Nf3
(5. cxd4 d6 6. Nf3 Nc6 {Même position, par un autre ordre de coups.})
5... Nc6 6. cxd4 d6 7. Bc4 Nb6 {Le cavalier recule en chassant le fou. [%cal Gb6c4]}
8. Bb5 dxe5 9. Nxe5 Bd7 10. Nxd7 Qxd7 {Les échanges soulagent les Noirs : le pion d4 isolé est une cible. [%cal Gd7d4]}`,
          conclusion:
            "Contre 2.c3, 2…Nf6 force e5, puis …d6 et …Nc6 sapent le centre. Le pion d4, souvent isolé, devient votre cible.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Plans typiques",
      summary:
        "La course …b5-b4 contre l'attaque anglaise, la case d5 contre 6.Be2, …b5 et …Qc7 contre le fou c4, et …e5 contre 6.f4.",
      stage: "plans",
      lessons: [
        {
          title: "La course : …b5, …b4 et …a5",
          eco: "B90",
          kind: "line",
          objectives: [
            "Lancer les pions de l'aile dame dès que les Blancs poussent g4",
            "Chasser le cavalier c3 par …b4",
            "Garder le roi en sécurité par …Ne8",
          ],
          pgn: `{Dans l'attaque anglaise, chaque tempo compte. Les Blancs poussent g4-g5 contre votre cavalier f6 ; vous répondez par …b5-b4 contre leur cavalier c3, puis …a5-a4 contre le roi blanc.}
${ENGLISH} 11. g4 b5 {Le pion b5 menace …b4 : la course est lancée. [%cal Gb5b4]}
12. g5 b4 {Le pion chasse le cavalier c3, défenseur de d5 et de e4. [%cal Gb4c3]}
13. Ne2 Ne8 {Le cavalier recule pour protéger g7 et c7, et libère le fou e7. [%cal Ge8c7]}
14. f4 a5 {Le pion a5 rejoint b4 : …a4 chassera le cavalier b3. [%cal Ga5a4]}`,
          conclusion:
            "Dans la course, les pions de l'aile dame sont vos attaquants. …b5-b4 chasse le cavalier c3, …a5-a4 fait reculer le cavalier b3, et le roi blanc se retrouve exposé.",
        },
        {
          title: "6.Be2 : la lutte pour d5",
          eco: "B92",
          kind: "line",
          objectives: [
            "Placer le cavalier d7 et la tour c8 contre la colonne c",
            "Répondre à a4-a5 par …Qc7",
            "Préparer …d5 avec les tours centrales",
          ],
          pgn: `{Dans la structure 6.Be2 e5, les Blancs gèlent l'aile dame par a4-a5 et visent d5. Votre plan : la tour en c8 sur la colonne semi-ouverte, la dame en c7, puis les tours centrales soutiennent la libération …d5.}
${BE2} 10. Qd2 Nbd7 {Le cavalier protège e5 et peut aller en b8-c6 ou en f6. [%cal Gd7f6]}
11. a4 Rc8 {La tour occupe la colonne semi-ouverte et vise c2. [%cal Gc8c2]}
12. a5 Qc7 {La dame libère d8 pour la tour et presse sur c2. [%cal Gc7c2]}
13. Rfd1 Rfd8 {La tour soutient d6 et prépare …d5 au bon moment. [%cal Gd8d5]}`,
          conclusion:
            "Contre 6.Be2, la colonne c et la préparation de …d5 rythment votre jeu. Si vous jouez …d5 sans perte, la position s'ouvre en votre faveur.",
        },
        {
          title: "6.Bc4 e6 : …b5 et la dame c7",
          eco: "B87",
          kind: "line",
          objectives: [
            "Fermer la diagonale du fou c4 par …e6",
            "Chasser le fou par …b5 et développer le fou f8",
            "Défendre g7 par …Ne8 face à Qg3 et Bh6",
          ],
          pgn: `{Le fou c4 vise e6 et f7. Contre lui, la structure …e6 est plus solide que …e5 : le pion e6 bloque la diagonale, …b5 chasse le fou et, plus tard, …b4 attaquera le cavalier c3.}
${NAJDORF} 6. Bc4 e6 {Le pion ferme la diagonale du fou c4. [%cal Ge6c4]}
7. Bb3 b5 {Le pion prend de l'espace et prépare …Bb7 ou …b4. [%cal Gb5b4]}
8. O-O
(8. Bg5 Be7 {Contre le clouage, le fou e7 met fin au problème.})
8... Be7 9. Qf3 Qc7 {La dame protège la colonne c et vise c3. [%cal Gc7c3]}
10. Qg3 O-O 11. Bh6 Ne8 {Le cavalier protège g7 : l'attaque blanche marque le pas. [%cal Ge8g7]}`,
          conclusion:
            "Contre le fou c4, …e6 ferme la diagonale, …b5 et …Qc7 activent l'aile dame, et …Ne8 répond calmement aux menaces sur g7.",
        },
        {
          title: "6.f4 e5 : frapper la base du pion f4",
          eco: "B93",
          kind: "line",
          objectives: [
            "Attaquer f4 et chasser le cavalier d4 par …e5",
            "Placer le cavalier en d7 pour garder e5",
            "Ouvrir le jeu par …exf4 au bon moment",
          ],
          pgn: `{6.f4 veut pousser f5 ou e5. Le coup …e5 attaque f4 tout de suite et chasse le cavalier : les Blancs doivent choisir entre la pression en f4 et la fermeture du centre.}
${NAJDORF} 6. f4 e5 {Le pion attaque f4 et chasse le cavalier d4. [%cal Ge5f4,Ge5d4]}
7. Nf3
(7. Nb3 Nbd7 {Même schéma : le cavalier d7 garde e5.})
7... Nbd7 8. a4
(8. Bd3 Be7 {Le développement continue : petit roque et …exf4 suivront.})
8... Be7 9. Bd3 O-O 10. O-O exf4 {La prise libère la case e5 pour votre cavalier. [%cal Gd7e5]}`,
          conclusion:
            "Contre 6.f4, …e5 met la base de la chaîne sous pression. Le cavalier d7 garde e5, puis …exf4 libère cette case pour vos pièces.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Réponses adverses",
      summary:
        "Le Pion empoisonné contre 6.Bg5, la variante Adams 6.h3, l'échec 3.Bb5+ et le Grand Prix 2.Nc3 avec f4.",
      stage: "responses",
      lessons: [
        {
          title: "6.Bg5 e6 7.f4 Qb6 : le Pion empoisonné",
          eco: "B97",
          kind: "line",
          objectives: [
            "Attaquer b2 et d4 par …Qb6",
            "Prendre le pion b2 et replier la dame en a3",
            "Développer par …Be7 et …Nbd7 après Be2",
          ],
          pgn: `{Contre 6.Bg5, la dame b6 attaque le pion b2 et le cavalier d4. Les Blancs peuvent offrir le pion par Qd2 : vous le prenez et la dame se replie en a3, d'où elle gêne le développement blanc.}
${NAJDORF} 6. Bg5 e6 7. f4 Qb6 {La dame attaque b2 et met la pression sur d4. [%cal Gb6b2,Gb6d4]}
8. Qd2
(8. Nb3 Be7 {Le cavalier a quitté d4 : développez et roquez.})
8... Qxb2 {Le pion empoisonné : risqué, mais solide avec une défense précise.}
9. Rb1 Qa3 {La dame se replie en a3 : elle surveille c3 et a2. [%cal Ga3c3]}
10. Be2 Be7 11. O-O Nbd7 {Les Noirs ont un pion de plus et une position compacte. [%cal Gd7c5]}`,
          conclusion:
            "Dans le Pion empoisonné, la dame prend b2 puis se replie en a3. Votre défense est précise mais saine : vous gardez le pion et développez tranquillement.",
        },
        {
          title: "6.h3 e5 : la variante Adams",
          eco: "B90",
          kind: "line",
          objectives: [
            "Répondre au projet g4 par …e5",
            "Freiner la poussée g4 par …h5",
            "Développer le fou c8 en e6",
          ],
          pgn: `{6.h3 prépare g4 pour chasser votre cavalier f6. Le pion …e5 chasse d'abord le cavalier d4, puis …h5 rend la poussée g4 difficile.}
${NAJDORF} 6. h3 e5 7. Nde2
(7. Nb3 Be6 {Le fou contrôle d5 : le schéma de l'attaque anglaise revient. [%cal Ge6d5]})
7... h5 {Le pion freine g4 : votre cavalier f6 reste en place. [%cal Gh5g4]}
8. g3 Be6 9. Bg2 Nbd7 {Le cavalier rejoint b6 ou c5 et surveille d5. [%cal Gd7b6]}`,
          conclusion:
            "Contre 6.h3, …e5 et …h5 neutralisent la poussée g4. Le fou e6 et le cavalier d7 se placent ensuite comme dans l'attaque anglaise.",
        },
        {
          title: "3.Bb5+ Bd7 : l'échange des fous",
          eco: "B52",
          kind: "line",
          objectives: [
            "Interposer le fou d7 et reprendre de la dame",
            "Placer les pions en e6 et d5 contre la structure c3-d4",
            "Activer le cavalier en e4 après e5",
          ],
          pgn: `{L'échec 3.Bb5+ échange les fous de cases blanches. Votre plan : reprendre de la dame, développer …Nc6 et …Nf6, puis jouer …e6 et …d5 pour contester le centre blanc.}
1. e4 c5 2. Nf3 d6 3. Bb5+ Bd7 4. Bxd7+ Qxd7 {La dame reprend : votre cavalier b8 peut aller en c6. [%cal Gb8c6]}
5. O-O
(5. c4 Nc6 {Contre la structure Maroczy, le cavalier vise d4. [%cal Gc6d4]})
5... Nc6 6. c3 Nf6 7. Re1 e6 8. d4 cxd4 9. cxd4 d5 {Le pion conteste e4 : la structure devient symétrique. [%cal Gd5e4]}
10. e5 Ne4 {Le cavalier s'installe en e4, d'où il est très fort. [%cal Ge4c3]}`,
          conclusion:
            "Contre 3.Bb5+, l'échange des fous vous soulage. …Nc6, …Nf6, …e6 et …d5 contestent le centre, et le cavalier e4 compense l'avance e5.",
        },
        {
          legacyIds: ["sicilian-m5"],
          title: "2.Nc3 d6 3.f4 : le Grand Prix",
          eco: "B23",
          kind: "line",
          objectives: [
            "Développer par …Nc6 et …g6 contre l'attaque f4",
            "Placer le fou en g7 sur la grande diagonale",
            "Répondre à Bb5 par …Bd7 et …a6",
          ],
          pgn: `{Dans le Grand Prix, les Blancs jouent f4 et préparent une attaque sur le roi. Votre fou g7 vise la grande diagonale : si les Blancs ouvrent par d4, il frappe directement leur aile dame.}
1. e4 c5 2. Nc3 d6 3. f4
(3. Nge2 Nf6 {Le cavalier attaque e4 : les Blancs vont jouer d4.})
3... Nc6 4. Nf3 g6 {Le fianchetto : le fou g7 visera la grande diagonale. [%cal Gf8g7]}
5. d4
(5. Bb5 Bd7 {Le fou s'interpose pour ne pas abîmer vos pions.} 6. O-O Bg7 7. d3 a6 {Le pion chasse le fou : …b5 suivra.})
5... cxd4 6. Nxd4 Bg7 {Le fou vise d4 et le cavalier c3. [%cal Gg7d4]}
7. Be3 Nf6 8. Be2 O-O 9. O-O {Les deux camps ont roqué : …Qb6 ou …Ng4 viseront le fou e3.}`,
          conclusion:
            "Contre le Grand Prix, …Nc6 et …g6 mettent le fou g7 en batterie sur la grande diagonale. L'ouverture du jeu par d4 profite à ce fou.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Pièges",
      summary:
        "Les erreurs blanches typiques : 5.Bg5? qui oublie e4, le pion empoisonné sans Rb1, le fou f4 laissé seul dans l'Alapine et le petit roque prématuré après 3.Bb5+.",
      stage: "traps",
      lessons: TRAPS,
    },
    // =====================================================================================
    {
      title: "Grande théorie",
      summary:
        "Les lignes profondes : le Pion empoisonné avec 10.f5, la Dragon yougoslave, la course de l'attaque anglaise et l'attaque Sozine.",
      stage: "theory",
      lessons: [
        {
          legacyIds: ["sicilian-m4"],
          title: "Pion empoisonné : 10.f5 et 13.e5",
          eco: "B97",
          kind: "line",
          objectives: [
            "Connaître la ligne forcée 10.f5 Nc6 11.fxe6 fxe6",
            "Rendre du matériel au bon moment pour sécuriser le roi",
            "Placer la dame en a4 et le fou en e7",
          ],
          pgn: `{Le Pion empoisonné principal est une suite forcée. Les Blancs sacrifient pour ouvrir votre roi ; vous rendez le matériel nécessaire, échangez les pièces actives, et votre dame revient en défense.}
${POISON} 10. f5 Nc6 {Le cavalier attaque d4 et prépare l'échange. [%cal Gc6d4]}
11. fxe6 fxe6 12. Nxc6 bxc6 13. e5 dxe5 14. Bxf6 gxf6 15. Ne4 Be7 {Le fou couvre la diagonale d8-h4. [%cal Ge7h4]}
16. Be2 h5 {Le pion empêche Bh5+ et prépare …Ra7. [%cal Gh5h4]}
17. Rb3 Qa4 {La dame vise e4 et revient vers le centre. [%cal Ga4e4]}
18. Nxf6+ Bxf6 19. c4 Bh4+ 20. g3 Be7 21. O-O h4 {Le pion h4 ouvre la colonne h : votre tour h8 entre en jeu. [%cal Gh4g3]}`,
          conclusion:
            "La ligne principale du Pion empoisonné demande de la mémoire, mais chaque coup noir a un sens : rendre du matériel, échanger les attaquants, puis contre-attaquer par …h4.",
        },
        {
          legacyIds: ["sicilian-m2"],
          title: "La Dragon yougoslave : 5…g6 et la colonne c",
          eco: "B78",
          kind: "line",
          objectives: [
            "Connaître l'alternative 5…g6 et le fianchetto",
            "Sacrifier la qualité en c3 ou installer la tour en c4",
            "Répondre au grand roque par …d5 sans attendre",
          ],
          pgn: `{La Dragon est une alternative à la Najdorf : le fou g7 vise la grande diagonale, et la colonne c ouverte conduit vos tours vers le roi blanc. Contre le grand roque immédiat, la poussée …d5 ouvre le centre.}
${OPEN} g6 6. Be3 Bg7 7. f3 O-O 8. Qd2 Nc6 9. Bc4
(9. O-O-O d5 {La rupture centrale : le roi blanc n'a pas le temps d'être attaqué. [%cal Gd5e4]} 10. exd5 Nxd5 11. Nxc6 bxc6 12. Bd4 Bxd4 13. Qxd4 Qb6 {La dame propose l'échange : la finale est équilibrée.})
9... Bd7 10. O-O-O Rc8 {La tour sur la colonne c vise c3 et c2. [%cal Gc8c3]}
11. Bb3 Ne5 {Le cavalier rejoint c4 pour échanger le fou b3. [%cal Ge5c4]}
12. Kb1 Nc4 13. Bxc4 Rxc4 {La tour c4 est active : …Qa5 et …b5 suivront. [%cal Gc4c3]}
14. g4 b5 {Le pion b5 lance l'attaque contre le roi b1. [%cal Gb5b4]}`,
          conclusion:
            "Dans la Dragon yougoslave, le fou g7 et la colonne c sont vos armes. La tour c4 et la poussée …b5 contre-attaquent pendant que les Blancs poussent à l'aile roi.",
        },
        {
          title: "Attaque anglaise : 15.f5 a4 et la percée …b3",
          eco: "B90",
          kind: "line",
          objectives: [
            "Pousser …a4 et …b3 pour ouvrir le roi blanc",
            "Échanger le fou e6 contre le pion a2 par …Bb3",
            "Ouvrir la colonne a pour la tour a8",
          ],
          pgn: `{Dans la course de l'attaque anglaise, la percée …b3 est la clé : elle ouvre une colonne devant le roi blanc. Le fou e6 se sacrifie en b3 pour que votre tour a8 entre en jeu.}
${RACE} 15. f5 a4 {Le pion chasse le cavalier b3. [%cal Ga4b3]}
16. Nbd4
(16. fxe6 axb3 17. cxb3 fxe6 {La colonne f s'ouvre pour votre tour, et le fou blanc reste à g2 ou h3.})
16... exd4 17. Nxd4 b3 {La percée : le pion ouvre la position du roi blanc. [%cal Gb3c2]}
18. Kb1 bxc2+ 19. Nxc2 Bb3 {Le fou se sacrifie pour ouvrir la colonne a. [%cal Gb3a2]}
20. axb3 axb3 21. Na3 {La tour a8 est maintenant sur une colonne ouverte face au roi blanc.}`,
          conclusion:
            "Dans l'attaque anglaise, …b3 est la percée thématique : vos pions ouvrent la colonne a et le roi blanc devient la cible principale de la partie.",
        },
        {
          title: "L'attaque Sozine : 12.Rad1 et f4-f5",
          eco: "B87",
          kind: "line",
          objectives: [
            "Échanger le cavalier d4 par …Nc6",
            "Opposer le fou c6 à la poussée f5",
            "Rendre la qualité ou le fou h6 pour éteindre l'attaque",
          ],
          pgn: `{Dans l'attaque Sozine, les Blancs lancent f4-f5 contre e6. Vous échangez le cavalier d4, mettez votre fou en c6 sur la grande diagonale et préparez …Kh8 pour neutraliser le fou h6.}
${SOZIN} 12. Rad1 Bd7 {Le fou prépare …Nc6 et …Bc6. [%cal Gd7c6]}
13. f4 Nc6 14. Nxc6 Bxc6 {Le fou c6 vise e4, la base de l'attaque blanche. [%cal Gc6e4]}
15. f5 Kh8 {Le roi évite les échecs et menace …gxh6. [%cal Gg7h6]}
16. f6 gxh6 17. fxe7 Qxe7 {Les Noirs ont gagné le fou h6 contre le fou e7 : la position est dynamiquement équilibrée.}`,
          conclusion:
            "Contre l'attaque Sozine, …Nc6, …Bc6 et …Kh8 vous préparent à la poussée f5. Après f6, vous prenez le fou h6 et gardez une position solide.",
        },
      ],
    },
  ],
};
