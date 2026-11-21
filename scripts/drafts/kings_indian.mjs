// Brouillon de la Masterclass « Défense Est-Indienne » (côté Noirs) : 1.d4 Nf6 2.c4 g6.
// Répertoire : …Bg7, …d6, …O-O et …e5 contre les systèmes avec e4 (classique, Sämisch,
// Quatre pions, Averbakh, h3), …Nc6 et …a6 (Panno) contre le fianchetto.
// La Panno contre la Sämisch (6…Nc6) est présentée en grande théorie comme alternative.
// Les flèches du coup à jouer sont ajoutées par scripts/course-builder.mjs ; celles écrites ici
// illustrent une idée (cible, manœuvre, menace).
import { TRAPS } from "./kings_indian-traps.mjs";

const K = "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6";
const C = `${K} 5. Nf3 O-O 6. Be2 e5`;
const M = `${C} 7. O-O Nc6 8. d5 Ne7`;
const S = `${K} 5. f3 O-O 6. Be3`;

export default {
  id: "kings_indian",
  name: "Défense Est-Indienne",
  description:
    "1.d4 Nf6 2.c4 g6 : une défense de contre-attaque qui laisse le centre aux Blancs pour mieux le frapper. Un répertoire complet côté Noirs avec la classique et la Mar del Plata, la Bayonet, la Sämisch, le fianchetto Panno, les Quatre pions, l'Averbakh et h3, pièges et grandes lignes.",
  side: "black",
  eco: ["E61", "E62", "E63", "E71", "E75", "E77", "E84", "E87", "E88", "E90", "E92", "E97", "E99"],
  chapters: [
    // =====================================================================================
    {
      title: "Les fondations",
      summary:
        "Le schéma …Bg7, …d6, …O-O et …e5, la variante classique avec 9.Ne1, la Sämisch avec …Nh5 et le fianchetto Panno.",
      stage: "foundations",
      lessons: [
        {
          title: "Le schéma est-indien : fianchetto, roque et …e5",
          eco: "E90",
          kind: "concept",
          objectives: [
            "Installer le fou en g7 et roquer avant de toucher au centre",
            "Laisser les Blancs bâtir leur centre e4-d4-c4",
            "Frapper ce centre par la poussée …e5",
          ],
          pgn: `{L'Est-Indienne est une défense hypermoderne : vous laissez les Blancs occuper le centre avec trois pions, puis vous l'attaquez. Le fou g7 vise d4, le roque met le roi à l'abri, et …e5 conteste enfin le centre.}
1. d4 Nf6 2. c4
(2. Nf3 g6 {Le même schéma s'applique contre l'ordre de coups avec Nf3.})
2... g6 {Le pion libère la case g7 pour le fou. [%cal Gf8g7]}
3. Nc3
(3. Nf3 Bg7 4. g3 O-O {Contre le fianchetto, le roi se met à l'abri avant tout. [%cal Ge8g8]})
3... Bg7 {Le fou vise le pion d4 sur la grande diagonale. [%cal Gg7d4]}
4. e4 d6 {Le pion d6 empêche e5 et prépare votre propre poussée …e5. [%cal Gd6e5]}
5. Nf3
(5. f3 O-O {Contre la Sämisch, vous roquez aussi avant d'agir au centre.})
(5. f4 O-O {Contre les Quatre pions, le roque précède la poussée …c5.})
5... O-O 6. Be2 e5 {Le pion frappe d4 : les Blancs doivent choisir entre d5, dxe5 ou la tension. [%cal Ge5d4]}`,
          conclusion:
            "Le schéma est-indien est toujours le même : …Bg7, …d6, …O-O, puis …e5 ou …c5. Vous cédez l'espace pour attaquer le centre blanc ensuite.",
        },
        {
          legacyIds: ["kings_indian-m1"],
          title: "La classique : 7.O-O Nc6 8.d5 Ne7",
          eco: "E97",
          kind: "line",
          objectives: [
            "Provoquer d5 par …Nc6 pour fermer le centre",
            "Replier le cavalier en e7 puis d7 pour libérer le pion f",
            "Lancer …f5 et …f4 vers le roque blanc",
          ],
          pgn: `{Dans la classique, …Nc6 pousse les Blancs à fermer le centre par d5. Le centre bloqué, chaque camp attaque sur son aile : les Blancs à l'aile dame avec c5, vous à l'aile roi avec …f5, …f4 et …g5.}
${C} 7. O-O Nc6 {Le cavalier attaque d4 et force une décision. [%cal Gc6d4]}
8. d5 Ne7 {Le cavalier se replie vers l'aile roi, où se jouera votre attaque. [%cal Ge7g6]}
9. Ne1
(9. b4 Nh5 {Contre la Bayonet, le cavalier saute en h5 pour préparer …f5. [%cal Gf7f5]})
(9. Nd2 a5 {Le pion freine b4 et ralentit l'attaque à l'aile dame. [%cal Ga5b4]})
9... Nd7 {Le cavalier libère le pion f et surveille c5. [%cal Gf7f5]}
10. Be3
(10. Nd3 f5 {La même poussée : le pion f attaque e4. [%cal Gf5e4]})
10... f5 11. f3 f4 {Le pion chasse le fou e3 et gagne de l'espace à l'aile roi. [%cal Gf4e3]}
12. Bf2 g5 {Le pion g suit : …g4 viendra ouvrir des lignes vers le roi blanc. [%cal Gg5g4]}`,
          conclusion:
            "Après 8.d5, la partie se décide sur les ailes. Votre plan est clair : …Ne7, …Nd7, …f5, …f4 et …g5, avec une attaque de pions contre le roque blanc.",
        },
        {
          legacyIds: ["kings_indian-m3"],
          title: "La Sämisch : 5.f3 et 7…Nh5",
          eco: "E87",
          kind: "line",
          objectives: [
            "Jouer …e5 contre le pion f3 et le fou e3",
            "Profiter de la case h5 pour préparer …f5",
            "Attaquer le centre blanc par …f5 avant le grand roque",
          ],
          pgn: `{La Sämisch renforce e4 par f3 et prépare souvent le grand roque avec Be3 et Qd2. Votre réponse : …e5, puis après d5, le cavalier saute en h5 pour lancer …f5 contre le centre.}
${S} e5 {Le pion conteste d4 malgré le soutien du fou e3. [%cal Ge5d4]}
7. d5
(7. Nge2 c6 8. Qd2 Nbd7 {Vous gardez la tension et préparez …a6 et …b5.})
7... Nh5 {Le cavalier dégage le pion f : …f5 arrive. [%cal Gf7f5]}
8. Qd2 f5 {Le pion attaque e4 ; …Qh4+ était l'autre idée active.}
9. O-O-O Nd7 {Le cavalier d7 rejoint f6 pour remplacer celui de h5. [%cal Gd7f6]}
10. Bd3 Ndf6 11. Nge2 {Les deux camps ont fini leur développement : la lutte pour e4 commence.}`,
          conclusion:
            "Contre la Sämisch, …e5 suivi de …Nh5 et …f5 attaque directement e4. Le cavalier d7 vient ensuite en f6 pour soutenir la pression.",
        },
        {
          legacyIds: ["kings_indian-m2"],
          title: "Le fianchetto : la Panno 6…Nc6 7…a6",
          eco: "E63",
          kind: "line",
          objectives: [
            "Préparer …b5 par …a6 et …Rb8",
            "Répondre à d5 par …Na5 en visant c4",
            "Ouvrir la colonne b par …bxc4",
          ],
          pgn: `{Contre le fianchetto blanc, le fou g2 rend …e5 moins efficace. La Panno joue à l'aile dame : …Nc6, …a6, …Rb8 et …b5 ouvrent la colonne b et attaquent le pion c4.}
1. d4 Nf6 2. c4 g6 3. Nf3 Bg7 4. g3 O-O 5. Bg2 d6 6. O-O Nc6 7. Nc3 a6 {Le pion a6 prépare …b5. [%cal Gb7b5]}
8. d5
(8. h3 Rb8 {La tour soutient d'avance la poussée …b5. [%cal Gb8b5]})
(8. b3 Rb8 {Même idée : …b5 attaquera le pion c4.})
8... Na5 {Le cavalier vise le pion c4. [%cal Ga5c4]}
9. Nd2 c5 {Le pion soutient le cavalier a5 et gagne de l'espace. [%cal Gc5b4]}
10. Qc2 Rb8 11. b3 b5 {Le pion b5 attaque c4 et ouvre le jeu à l'aile dame. [%cal Gb5c4]}
12. Bb2 bxc4 13. bxc4 {La colonne b est ouverte : votre tour b8 fait face au fou b2. [%cal Gb8b2]}`,
          conclusion:
            "Dans la Panno, l'aile dame est votre terrain : …a6, …Rb8 et …b5 ouvrent la colonne b, où votre tour exerce une pression durable.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Plans typiques",
      summary:
        "La course aux ailes de la Mar del Plata, la Bayonet 9.b4, la variante Petrosian avec 7.d5 et la finale de l'échange.",
      stage: "plans",
      lessons: [
        {
          title: "Mar del Plata : la course …f5-f4-g5",
          eco: "E99",
          kind: "line",
          objectives: [
            "Lancer les pions f et g vers le roque blanc",
            "Placer le cavalier en g6 pour soutenir …g4",
            "Ignorer l'aile dame et défendre c7 au bon moment par …Rf7",
          ],
          pgn: `{La Mar del Plata est une course : les Blancs ouvrent la colonne c, vous lancez vos pions vers le roi. Le temps compte plus que les pions : chaque coup doit servir l'attaque.}
${M} 9. Ne1 Nd7 10. Nd3 f5 11. Bd2 Nf6 {Le cavalier revient en f6 pour soutenir …g5 et …g4. [%cal Gf6g4]}
12. f3 f4 13. c5 g5 {Votre attaque de pions est en route. [%cal Gg5g4]}
14. Rc1 Ng6 {Le cavalier soutient f4 et prépare …h5 et …g4. [%cal Gg6f4]}
15. cxd6
(15. Nb5 Rf7 {La tour protège c7 et pourra glisser vers g7. [%cal Gf7c7]})
15... cxd6 16. Nb5 Rf7 {La tour défend la septième rangée contre Nc7.}
17. Qc2 Ne8 {Le cavalier couvre c7 et d6 ; vos pions g et h repartent ensuite. [%cal Ge8c7]}
18. a4 h5 {Le pion h rejoint l'attaque : …g4 ouvrira le roque blanc. [%cal Gh5h4]}`,
          conclusion:
            "Dans la Mar del Plata, défendez l'aile dame avec le minimum (…Rf7, …Ne8) et consacrez tout le reste à l'attaque …g4.",
        },
        {
          title: "La Bayonet 9.b4 : …Nh5 et …f5",
          eco: "E97",
          kind: "line",
          objectives: [
            "Répondre à b4 par …Nh5 pour lancer …f5 sans délai",
            "Reprendre en f4 après Bxf4 et garder la case e5",
            "Jouer …c6 pour ouvrir le jeu à l'aile dame",
          ],
          pgn: `{La Bayonet 9.b4 accélère l'attaque blanche par c5. Vous ne pouvez pas perdre de temps : …Nh5 prépare …f5 immédiatement, et le cavalier peut aussi sauter en f4.}
${M} 9. b4 Nh5 {Le cavalier dégage le pion f et vise f4. [%cal Gh5f4]}
10. Re1
(10. c5 Nf4 11. Bxf4 exf4 {La case e5 est libre pour vos pièces et le fou g7 respire. [%cal Gg7c3]})
(10. g3 f5 {Le pion g3 retire f4 au cavalier, mais …f5 arrive quand même.})
10... f5 11. Ng5 Nf6 {Le cavalier revient défendre e4 et e6. [%cal Gf6e4]}
12. Bf3 c6 {Le pion conteste d5 : la colonne c pourra s'ouvrir. [%cal Gc6d5]}
13. Be3 h6 {Le pion chasse le cavalier g5 avant qu'il ne s'installe en e6. [%cal Gh6g5]}`,
          conclusion:
            "Contre la Bayonet, …Nh5 et …f5 gardent le rythme. Après …c6 et …h6, le jeu s'ouvre au centre, où vos pièces sont prêtes.",
        },
        {
          title: "La Petrosian 7.d5 : …a5, …Na6 et …Qe8",
          eco: "E92",
          kind: "line",
          objectives: [
            "Freiner l'expansion blanche par …a5",
            "Chasser le fou g5 par …h6 et se décrocher du clouage par …Qe8",
            "Préparer …f5 par …Nh7",
          ],
          pgn: `{Avec 7.d5, les Blancs ferment le centre tout de suite et clouent le cavalier f6 par Bg5. Votre plan : …a5 pour freiner b4, …h6 et …Qe8 pour défaire le clouage, puis …Nh7 et …f5.}
${C} 7. d5 a5 {Le pion empêche b4 et donne la case c5 au cavalier. [%cal Ga5b4]}
8. Bg5 h6 9. Bh4 Na6 {Le cavalier vise c5, sa meilleure case dans ce schéma. [%cal Ga6c5]}
10. Nd2 Qe8 {La dame quitte le clouage et soutient …f5. [%cal Ge8f7]}
11. O-O Nh7 {Le cavalier dégage le pion f. [%cal Gf7f5]}
12. a3 Bd7 13. b3 h5 {Le pion h5 empêche g4 et prépare …Bh6. [%cal Gh5g4]}
14. f3 {Le centre est figé : …Bh6 échangera le fou de cases noires.}`,
          conclusion:
            "Contre la Petrosian, ne laissez pas le clouage vous paralyser : …h6, …Qe8 et …Nh7 préparent …f5 et rendent leur liberté à vos pièces.",
        },
        {
          title: "L'échange 7.dxe5 : une finale sans danger",
          eco: "E92",
          kind: "line",
          objectives: [
            "Reprendre en e5 et accepter l'échange des dames",
            "Placer la tour en e8 pour soutenir e5",
            "Viser la case d4 avec le cavalier",
          ],
          pgn: `{L'échange 7.dxe5 vise une finale tranquille. Vous n'avez rien à craindre : le pion e5 est solide et la case d4 attend votre cavalier.}
${C} 7. dxe5 dxe5 8. Qxd8 Rxd8 9. Bg5
(9. Nxe5 Nxe4 {Le coup de fourchette : le pion e4 revient, et le fou g7 cloue le cavalier e5. [%cal Gg7e5]})
9... Re8 {La tour soutient e5 et libère d8 pour le fou ou le cavalier.}
10. Nd5 Nxd5 11. cxd5 c6 {Le pion attaque d5 pour ouvrir la colonne c. [%cal Gc6d5]}
12. Bc4 cxd5 13. Bxd5 Nd7 {Le cavalier vise c5 puis d3 ou b6. [%cal Gd7c5]}
14. Nd2 Nc5 {Le cavalier est actif ; la finale est équilibrée.}`,
          conclusion:
            "La finale de l'échange est égale : tour en e8, cavalier en c5 et colonne c ouverte vous donnent un jeu actif.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Réponses adverses",
      summary:
        "Les Quatre pions avec …c5, l'Averbakh 6.Bg5, le système Makogonov 5.h3 et la Gligoric 7.Be3.",
      stage: "responses",
      lessons: [
        {
          title: "Les Quatre pions : 5.f4 et …c5",
          eco: "E77",
          kind: "line",
          objectives: [
            "Attaquer le centre étendu par …c5 et …e6",
            "Ouvrir la colonne e par …exd5",
            "Échanger le fou g4 contre le cavalier qui soutient e5",
          ],
          pgn: `{Avec quatre pions au centre, les Blancs ont beaucoup d'espace mais peu de développement. Vous frappez tout de suite : …c5, puis …e6 pour ouvrir le jeu avant que leur centre ne devienne écrasant.}
${K} 5. f4 O-O 6. Nf3 c5 {Le pion attaque d4, le maillon le plus exposé. [%cal Gc5d4]}
7. d5 e6 {Le pion e6 ouvre la colonne e. [%cal Ge6d5]}
8. Be2
(8. dxe6 fxe6 9. Bd3 Nc6 {La colonne f est ouverte et d4 est pour vos cavaliers. [%cal Gc6d4]})
8... exd5 9. cxd5 Bg4 {Le fou vise le cavalier f3, qui soutient la poussée e5. [%cal Gg4f3]}
10. O-O Nbd7 11. h3
(11. Re1 Re8 {La tour bloque la colonne e en face du roi blanc.})
11... Bxf3 12. Bxf3 Re8 {La tour surveille e5 ; le cavalier d7 ira en e5 si la case se libère. [%cal Ge8e5]}`,
          conclusion:
            "Contre les Quatre pions, …c5 et …e6 ouvrent le jeu tôt. L'échange en f3 et la tour e8 empêchent la percée e5.",
        },
        {
          title: "L'Averbakh 6.Bg5 : …c5 et …h6",
          eco: "E75",
          kind: "line",
          objectives: [
            "Contrer le fou g5 par …c5 plutôt que par …e5",
            "Chasser le fou par …h6",
            "Ouvrir la colonne e par …e6 et …exd5",
          ],
          pgn: `{L'Averbakh place le fou en g5 pour gêner …e5. Vous changez de plan : …c5 frappe d4 depuis l'autre côté, puis …h6 et …e6 ouvrent le jeu.}
${K} 5. Be2 O-O 6. Bg5 c5 {Le pion attaque d4 ; …e5 est remplacé par cette poussée. [%cal Gc5d4]}
7. d5 h6 {Le pion interroge le fou g5. [%cal Gh6g5]}
8. Be3
(8. Bf4 e6 9. dxe6 Bxe6 {Le fou e6 attaque c4 ; le pion d6 est défendu par la dame.})
8... e6 9. Qd2 exd5 10. exd5 Kh7 {Le roi évite les échecs et protège h6. [%cal Gh7h6]}
11. h3 Re8 {La tour occupe la colonne e ouverte, face au fou e2. [%cal Ge8e2]}`,
          conclusion:
            "Contre l'Averbakh, …c5, …h6 et …e6 ouvrent la colonne e. La tour e8 met immédiatement les pièces blanches sous pression.",
        },
        {
          title: "Le système 5.h3 : …e5 et …a5",
          eco: "E71",
          kind: "line",
          objectives: [
            "Jouer …e5 malgré la préparation g4",
            "Freiner b4 par …a5 et préparer …Nc5",
            "Chasser le fou g5 au bon moment",
          ],
          pgn: `{Le système Makogonov 5.h3 empêche …Ng4 et prépare g4. Vous restez fidèle au schéma : …e5, puis …a5 et …Na6 pour installer un cavalier en c5.}
${K} 5. h3 O-O 6. Nf3
(6. Be3 e5 7. d5 Na6 8. g4 Nc5 {Le cavalier c5 frappe e4. [%cal Gc5e4]} 9. f3 a5 {Le pion soutient le cavalier c5.})
(6. Bg5 c5 7. d5 e6 {Le même plan qu'en Averbakh : la colonne e s'ouvrira.})
6... e5 7. d5 a5 {Le pion fixe l'aile dame et prépare …Na6-c5. [%cal Ga5b4]}
8. Bg5 Na6 9. Be2 h6 {Le pion chasse le fou avant de libérer le cavalier f6. [%cal Gh6g5]}
10. Be3 Nc5 {Le cavalier attaque e4 depuis sa case idéale. [%cal Gc5e4]}`,
          conclusion:
            "Contre 5.h3, le plan …e5, …a5, …Na6-c5 donne un cavalier très actif. …h6 règle le problème du fou g5.",
        },
        {
          title: "La Gligoric 7.Be3 : …Ng4 et …f6",
          eco: "E92",
          kind: "line",
          objectives: [
            "Chasser le fou e3 par …Ng4",
            "Contrer le clouage par …f6",
            "Préparer …f5 après d5 en repliant le cavalier en h6",
          ],
          pgn: `{La Gligoric 7.Be3 maintient la tension. Votre cavalier saute en g4 pour attaquer le fou, puis …f6 chasse le fou g5. Le centre se ferme ensuite et le cavalier rejoint f7.}
${C} 7. Be3 Ng4 {Le cavalier attaque le fou e3. [%cal Gg4e3]}
8. Bg5 f6 9. Bh4
(9. Bc1 Nc6 10. d5 Ne7 {Le cavalier g4 est hors jeu pour un temps, mais …f5 arrivera.})
9... Nc6 10. d5 Ne7 {Le cavalier e7 couvre g6 et soutient …f5. [%cal Ge7g6]}
11. Nd2 Nh6 {Le cavalier rentre par h6 pour aller en f7. [%cal Gh6f7]}
12. f3 c5 {Le pion verrouille l'aile dame ; l'attaque …f5 viendra ensuite. [%cal Gf6f5]}`,
          conclusion:
            "Dans la Gligoric, …Ng4 et …f6 neutralisent les fous blancs. Après d5, …Nh6-f7 et …f5 relancent le jeu à l'aile roi.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Pièges",
      summary:
        "La retraite 9.Bf4?? dans la Gligoric, 8.Ne1? et 8.b4? contre …Nc6, puis 9.Ba3? contre le fianchetto.",
      stage: "traps",
      lessons: TRAPS,
    },
    // =====================================================================================
    {
      title: "Grande théorie",
      summary:
        "La Sämisch avec 7…c6, la Panno contre la Sämisch, la Mar del Plata avec 10.Be3 et la Bayonet jusqu'à la finale.",
      stage: "theory",
      lessons: [
        {
          legacyIds: ["kings_indian-m4"],
          title: "Sämisch orthodoxe : 7.d5 c6",
          eco: "E88",
          kind: "line",
          objectives: [
            "Ouvrir la colonne c par …c6 et …cxd5",
            "Préparer …b5 par …a6",
            "Installer un cavalier en c5 soutenu par …a5",
          ],
          pgn: `{Dans la Sämisch, 7…c6 ouvre la colonne c au lieu de bloquer le centre. Votre cavalier s'installe en c5, soutenu par …a5, et la colonne c devient votre terrain.}
${S} e5 7. d5 c6 {Le pion attaque d5 pour ouvrir le jeu à l'aile dame. [%cal Gc6d5]}
8. Qd2
(8. Bd3 cxd5 9. cxd5 Nh5 {Le cavalier prépare …f5 ; f4 lui est aussi offert. [%cal Gh5f4]} 10. Nge2 f5 {Le pion conteste e4 sans attendre.})
8... cxd5 9. cxd5 a6 {Le pion prépare …b5. [%cal Gb7b5]}
10. Bd3 Nbd7 11. Nge2 Nc5 {Le cavalier attaque le fou d3 et vise e4. [%cal Gc5d3,Gc5e4]}
12. Bc2 a5 {Le pion soutient le cavalier c5, qu'aucun pion ne peut plus chasser. [%cal Ga5b4]}
13. O-O Bd7 {Le fou relie les tours ; …Rc8 viendra sur la colonne ouverte. [%cal Gd7a4]}`,
          conclusion:
            "Avec 7…c6, vous ouvrez la colonne c. Le cavalier c5 soutenu par …a5 et la tour en c8 donnent un jeu actif à l'aile dame, …f5 restant en réserve.",
        },
        {
          legacyIds: ["kings_indian-m5"],
          title: "La Panno contre la Sämisch : 6…Nc6",
          eco: "E84",
          kind: "line",
          objectives: [
            "Préparer …b5 par …Nc6, …a6 et …Rb8",
            "Freiner h5 par …h5 face au grand roque",
            "Échanger le fou g7 et reprendre e5 au bon moment",
          ],
          pgn: `{La Panno est une alternative à 6…e5 : vous visez l'aile dame, là où les Blancs roquent. …Nc6, …a6 et …Rb8 préparent …b5, et la course est souvent plus rapide de votre côté.}
${S} Nc6 {Le cavalier presse d4 et prépare …a6. [%cal Gc6d4]}
7. Nge2 a6 8. Qd2 Rb8 {La tour soutient …b5. [%cal Gb8b5]}
9. h4 h5 {Le pion bloque l'avance h5 qui ouvrirait la colonne h. [%cal Gh5h4]}
10. O-O-O
(10. Nc1 e5 11. d5 Nd4 {Le cavalier s'installe en d4, case conquise par …e5.} 12. Nb3 c5 {Le pion soutient d4.})
10... b5 {Le pion attaque c4 : la colonne b va s'ouvrir vers le roi blanc. [%cal Gb5c4]}
11. Bh6 e5 12. Bxg7 Kxg7 13. dxe5 Nxe5 {Le cavalier e5 est centralisé et vise c4. [%cal Ge5c4]}`,
          conclusion:
            "Contre la Sämisch, la Panno attaque le grand roque blanc par …b5. Après l'échange des fous noirs, …e5 et …Nxe5 donnent un jeu actif.",
        },
        {
          title: "Mar del Plata avec 10.Be3 : 13.b4 et c5",
          eco: "E99",
          kind: "line",
          objectives: [
            "Répondre à b4 et c5 par …Nf6 et …Ng6",
            "Lancer …h5 puis …g4",
            "Garder le tempo de l'attaque face à la colonne c",
          ],
          pgn: `{Avec 10.Be3 et f3, les Blancs bloquent votre pion f4 avant d'attaquer par b4 et c5. Les cavaliers reviennent en f6 et g6, et les pions g et h repartent.}
${M} 9. Ne1 Nd7 10. Be3 f5 11. f3 f4 12. Bf2 g5 13. b4
(13. Rc1 Ng6 {Le cavalier rejoint g6, poste idéal pour soutenir …g4. [%cal Gg6h4]})
13... Nf6 14. c5 Ng6 {Le cavalier soutient f4 et prépare …h5. [%cal Gg6f4]}
15. a4
(15. cxd6 cxd6 16. Rc1 Rf7 {La tour couvre c7, puis glissera en g7. [%cal Gf7g7]})
15... h5 16. c6 {Le pion blanc s'enfonce ; votre réponse reste …g4.}`,
          conclusion:
            "Dans la Mar del Plata, …Nf6, …Ng6 et …h5 préparent …g4. Ne répondez pas coup pour coup à l'aile dame : la vitesse de l'attaque décide.",
        },
        {
          title: "Bayonet : 14.Ne6 et la finale du pion e6",
          eco: "E97",
          kind: "line",
          objectives: [
            "Échanger le cavalier e6 et prendre en e4",
            "Libérer le jeu par …d5",
            "Isoler et gagner le pion e6",
          ],
          pgn: `{Dans la Bayonet, le saut Ne6 force l'échange du fou c8. Le pion e6 qui en résulte gêne vos pièces, mais il est isolé : …fxe4 et …d5 libèrent votre centre et le pion devient une cible.}
${M} 9. b4 Nh5 10. Re1 f5 11. Ng5 Nf6 12. Bf3 c6 13. Be3 h6 14. Ne6 Bxe6 15. dxe6 fxe4 {Le pion prend e4 et ouvre la colonne f. [%cal Gf8f2]}
16. Nxe4 Nxe4 17. Bxe4 d5 {Le pion chasse le fou e4 et prend le centre. [%cal Gd5e4]}
18. cxd5 cxd5 19. Bc2
(19. Bc5 dxe4 {Le pion prend le fou : la colonne d est ouverte devant le roi blanc.})
19... b6 {Le pion couvre c5 : le pion e6 reste isolé et tombera. [%cal Gb6c5]}`,
          conclusion:
            "Après 14.Ne6, …fxe4 et …d5 libèrent vos pièces. Le pion e6 isolé devient une faiblesse que vos pièces viendront gagner.",
        },
      ],
    },
  ],
};
