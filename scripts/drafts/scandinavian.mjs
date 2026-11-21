// Brouillon de la Masterclass « Défense Scandinave » (côté Noirs) : 1.e4 d5 2.exd5 Qxd5.
// Répertoire principal : 3.Nc3 Qa5 avec …Nf6, …Bf5, …c6 et …e6. Alternative : 3…Qd6.
// Les flèches du coup à jouer sont ajoutées par scripts/course-builder.mjs ; celles écrites ici
// illustrent une idée (cible, manœuvre, menace).
import { TRAPS } from "./scandinavian-traps.mjs";

const QA5 = "1. e4 d5 2. exd5 Qxd5 3. Nc3 Qa5";
const MAIN = `${QA5} 4. d4 Nf6 5. Nf3 Bf5 6. Bc4 e6 7. Bd2 c6`;

export default {
  id: "scandinavian",
  name: "Défense Scandinave",
  description:
    "1.e4 d5 : les Noirs ouvrent le jeu tout de suite et sortent la dame en a5. Un répertoire complet côté Noirs avec …Nf6, …Bf5, …c6 et …e6, la structure …gxf6, les réponses à 3.Nf3 et 3.d4, l'alternative 3…Qd6, pièges et lignes principales.",
  side: "black",
  eco: ["B01"],
  chapters: [
    // =====================================================================================
    {
      title: "Les fondations",
      summary:
        "Pourquoi la dame va en a5, le schéma …Nf6, …Bf5, …c6 et …e6, et comment le garder contre 4.Bc4, 4.g3 et 4.Nf3.",
      stage: "foundations",
      lessons: [
        {
          title: "3…Qa5 : la dame hors de portée",
          eco: "B01",
          kind: "concept",
          objectives: [
            "Reprendre en d5 avec la dame dès le deuxième coup",
            "Placer la dame en a5 pour clouer le cavalier c3",
            "Construire la coquille …Nf6, …c6, …Bf5 et …e6",
          ],
          pgn: `{La Scandinave échange le pion e4 dès le premier coup. Votre dame reprend en d5, se fait chasser par Nc3, et s'installe en a5 : de là, elle cloue le cavalier c3 et ne peut plus être attaquée facilement. Vos autres pièces sortent ensuite derrière une structure c6-e6 très solide.}
1. e4 d5 {Le pion attaque e4 tout de suite : le centre blanc ne survivra pas.}
2. exd5 Qxd5 {La dame reprend : elle sera chassée, mais le pion e4 a disparu.}
3. Nc3 {Le cavalier attaque la dame avec gain de temps. [%cal Gc3d5]}
(3. Nf3 Bg4 {Sans Nc3, la dame reste en d5 : le fou cloue le cavalier f3. [%cal Gg4d1]})
(3. d4 Nf6 {Le cavalier défend la dame et prépare …Bg4 ou …Bf5. [%cal Gf6d5]})
3... Qa5 {La dame quitte la colonne d et cloue le cavalier c3 sur le roi e1. [%cal Ga5e1]}
4. d4
(4. Bc4 Nf6 {Le même développement : le fou c4 ne gêne pas votre plan.})
4... Nf6 {Le cavalier se développe et contrôle e4. [%cal Gf6e4]}
5. Nf3 c6 {Le pion offre la case c7 à la dame et contrôle b5 et d5. [%cal Gc6b5,Gc6d5]}
6. Bc4 Bf5 {Le fou sort avant …e6, sinon il serait enfermé derrière vos pions. [%cal Gf5b1]}
7. Bd2 e6 {La coquille est terminée : les pions c6 et e6 protègent d5, et le fou f5 est dehors.}`,
          conclusion:
            "Le schéma …Qa5, …Nf6, …c6, …Bf5 et …e6 vous donne une position sans faiblesse. La seule règle à retenir : le fou c8 sort avant le pion e6.",
        },
        {
          legacyIds: ["scandinavian-m5"],
          title: "5…Bf5 : le fou avant …e6",
          eco: "B01",
          kind: "line",
          objectives: [
            "Développer le fou c8 dès le cinquième coup",
            "Répondre à 8.Nd5 par …Qd8 et accepter …gxf6",
            "Savoir quoi jouer contre 6.Ne5 et 8.Qe2",
          ],
          pgn: `{La ligne principale commence par 5…Bf5 : vous sortez le fou avant tout le reste. Après 6.Bc4 e6 7.Bd2 c6, la dame a5 est menacée par une découverte du cavalier c3, et les Blancs ont trois grands plans : Nd5, Qe2 avec O-O-O, ou Ne4.}
${QA5} 4. d4 Nf6 5. Nf3 Bf5 {Le fou se place sur la diagonale b1-h7 avant …e6. [%cal Gf5c2]}
6. Bc4
(6. Ne5 c6 {Le pion prépare la case c7 pour la dame : le cavalier e5 ne vous gêne pas encore.} 7. Bc4 e6 {Le pion soutient d5 et ouvre la diagonale du fou f8. [%cal Gf8b4]})
6... e6 7. Bd2 {Le fou lève le clouage : le cavalier c3 peut maintenant bouger avec une découverte sur la dame. [%cal Gd2a5]}
7... c6 {La case c7 est prête : votre dame n'est jamais prise au piège.}
8. Nd5
(8. Qe2 Bb4 {Le fou recloue le cavalier c3 : vous préparez …Bxc3. [%cal Gb4c3]})
(8. Ne4 Qd8 {La dame recule : le cavalier e4 n'a plus de cible. [%cal Gd8a5]} 9. Ng3 Bg4 {Le fou change de diagonale et cloue le cavalier f3.})
8... Qd8 {La dame recule en d8 : elle défend f6 et c7.}
9. Nxf6+ gxf6 {La reprise du pion g ouvre la colonne g : vos pions doublés contrôlent e5 et g5. [%cal Gf6e5,Gg8g1]}`,
          conclusion:
            "Avec …Bf5 avant …e6, votre fou n'est jamais enfermé. Contre 8.Nd5, …Qd8 et …gxf6 donnent une structure saine, avec la colonne g pour plus tard.",
        },
        {
          title: "4.Bc4 : …Nf6, …c6 puis …Qc7",
          eco: "B01",
          kind: "line",
          objectives: [
            "Garder le schéma …Nf6 et …c6 contre 4.Bc4",
            "Replacer la dame en c7 quand Bd2 lève le clouage",
            "Développer le fou c8 en f5 malgré le pion d3",
          ],
          pgn: `{Avec 4.Bc4, les Blancs retardent d4 et jouent parfois d3. Vous gardez le même schéma ; quand le fou d2 menace une découverte sur votre dame, elle se replie en c7, où elle contrôle e5.}
${QA5} 4. Bc4 Nf6 5. d3
(5. Nf3 c6 {Le pion prépare la retraite c7. [%cal Ga5c7]} 6. d4 Bf5 {Le fou sort : on retrouve la ligne principale.})
5... c6 {Le pion protège b5 et d5. [%cal Gc6b5]}
6. Bd2 {Le fou lève le clouage et prépare Nd5 ou Nb5. [%cal Gd2a5]}
6... Qc7 {La dame quitte a5 avant la découverte et vise e5 et h2. [%cal Gc7h2]}
7. Qe2 Bf5 {Le fou se développe : votre structure c6-e6 suivra. [%cal Gf5d3]}`,
          conclusion:
            "Contre 4.Bc4 et d3, gardez …Nf6 et …c6. Quand Bd2 menace une découverte, la dame se replie en c7 : elle y est plus utile qu'en a5.",
        },
        {
          title: "4.g3 et 4.Nf3 : le même schéma",
          eco: "B01",
          kind: "line",
          objectives: [
            "Jouer …Nf6, …c6 et …Bf5 contre le fianchetto",
            "Placer le pion e en e6 pour fermer la grande diagonale",
            "Garder le schéma contre 4.Nf3 et Be2",
          ],
          pgn: `{Le fianchetto 4.g3 vise b7 par la grande diagonale. Vos pions c6 et e6 la bloquent, et votre fou f5 occupe la diagonale libre avant que les Blancs ne jouent d3.}
${QA5} 4. g3
(4. Nf3 Nf6 5. Be2 c6 {La structure est la même : le pion c6 protège d5. [%cal Gc6d5]} 6. O-O Bf5 {Le fou sort avant …e6, comme dans toutes les lignes.})
4... Nf6 5. Bg2 c6 {Le pion c6 ferme la grande diagonale vers b7. [%cal Gg2b7]}
6. Nge2 Bf5 {Le fou se développe hors de la chaîne de pions. [%cal Gf5d3]}
7. O-O e6 {Le pion soutient d5 et libère le fou f8. [%cal Gf8e7]}`,
          conclusion:
            "Contre g3 comme contre Nf3 et Be2, le schéma reste …Nf6, …c6, …Bf5 et …e6. Vous jouez la même position, quelle que soit la mise en place blanche.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Plans typiques",
      summary:
        "Les plans noirs contre les grands systèmes blancs : …Bb4 et …Bxc3 contre Qe2, le grand roque dans la structure …gxf6, …Qc7 contre Ne4 et …Bd6 contre le petit roque.",
      stage: "plans",
      lessons: [
        {
          title: "Contre Qe2 : …Bb4, …Bxc3 et …Qc7",
          eco: "B01",
          kind: "line",
          objectives: [
            "Clouer le cavalier c3 par …Bb4",
            "Échanger en c3 après a3 pour garder la structure",
            "Échanger le cavalier e5 avec …Nxe5 puis jouer …Nd5",
          ],
          pgn: `{Contre 8.Qe2, votre fou b4 cloue le cavalier c3. Après a3, vous échangez en c3 : les Blancs gardent la paire de fous, mais votre dame se replace en c7 et votre cavalier trouve la case d5.}
${MAIN} 8. Qe2 Bb4 {Le fou cloue le cavalier c3 sur le roi. [%cal Gb4e1]}
9. O-O-O
(9. a3 Nbd7 {Le cavalier se développe ; …Bxc3 suivra.} 10. O-O Bxc3 11. Bxc3 Qc7 {La dame recule en c7 : votre position est sans faiblesse. [%cal Gc7h2]})
9... Nbd7 10. a3 Bxc3 {L'échange : votre fou ne recule pas, il disparaît en emmenant le cavalier.}
11. Bxc3 Qc7 {La dame évite la découverte et surveille e5. [%cal Gc7e5]}
12. Ne5 Nxe5 13. dxe5 Nd5 {Le cavalier occupe la case d5 et attaque le fou c3. [%cal Gd5c3]}`,
          conclusion:
            "Contre Qe2 et O-O-O, …Bb4 puis …Bxc3 simplifient. Après Ne5, …Nxe5 dxe5 …Nd5 vous donne un cavalier parfait au centre.",
        },
        {
          title: "La structure …gxf6 : …Nd7, …Qc7 et O-O-O",
          eco: "B01",
          kind: "line",
          objectives: [
            "Développer le cavalier en d7 derrière la structure f6",
            "Mettre la dame en c7 et roquer à l'aile dame",
            "Replier le fou en g6 contre Nh4",
          ],
          pgn: `{Après 8.Nd5 Qd8 9.Nxf6+ gxf6, votre roi est plus en sécurité à l'aile dame. Le cavalier va en d7, la dame en c7, puis le grand roque : la colonne g ouverte servira à vos tours.}
${MAIN} 8. Nd5 Qd8 9. Nxf6+ gxf6 10. Bb3
(10. c3 Nd7 {Le cavalier se développe vers b6 ou f8. [%cal Gd7b6]})
10... Nd7 {Le cavalier contrôle e5 et prépare …Qc7. [%cal Gd7e5]}
11. Qe2 Qc7 {La dame vise h2 et libère d8 pour la tour. [%cal Gc7h2]}
12. O-O-O
(12. Nh4 Bg6 {Le fou recule : il est protégé par les pions f7 et h7.})
12... O-O-O {Le grand roque : votre roi est à l'abri derrière c6 et b7.}
13. Nh4 Bg6 {Le fou se replie en g6 : un échange en g6 ouvrirait la colonne h pour vous. [%cal Gh8h1]}`,
          conclusion:
            "Dans la structure …gxf6, …Nd7, …Qc7 et O-O-O mettent votre roi en sécurité. Contre Nh4, le fou recule en g6 : l'échange vous offrirait la colonne h.",
        },
        {
          title: "Contre 8.Ne4 : …Qc7 et la reprise …gxf6",
          eco: "B01",
          kind: "line",
          objectives: [
            "Mettre la dame en c7 contre la découverte Ne4",
            "Reprendre …gxf6 après l'échange en f6",
            "Roquer à l'aile dame après …Nd7",
          ],
          pgn: `{Avec 8.Ne4, le cavalier menace Nxf6+ avec découverte sur votre dame. La retraite …Qc7 la met à l'abri : après l'échange en f6, vous retrouvez la structure …gxf6 et le grand roque.}
${MAIN} 8. Ne4 Qc7 {La dame recule en c7 : le cavalier e4 ne la touche plus. [%cal Gc7e5]}
9. Nxf6+
(9. Ng3 Bg6 {Le fou recule face au cavalier g3 : il reste sur la diagonale b1-h7.})
9... gxf6 10. Qe2 Nd7 {Le cavalier prépare le grand roque et soutient f6. [%cal Gd7f6]}
11. O-O-O O-O-O {Votre roi rejoint l'aile dame : les deux camps ont roqué du même côté.}`,
          conclusion:
            "Contre 8.Ne4, la dame recule en c7 avant toute découverte. La structure …gxf6 et le grand roque vous donnent une position solide.",
        },
        {
          title: "Contre 8.O-O : …Qc7 et …Bd6",
          eco: "B01",
          kind: "line",
          objectives: [
            "Replier la dame en c7 contre le petit roque",
            "Développer le fou en d6 contre Re1",
            "Préparer …Nbd7 contre Ne5",
          ],
          pgn: `{Quand les Blancs roquent à l'aile roi, vous pouvez développer le fou f8 en d6, sur la diagonale du roi blanc. La dame c7 et le fou d6 visent ensemble h2.}
${MAIN} 8. O-O Qc7 {La dame évite les découvertes et vise h2. [%cal Gc7h2]}
9. Re1
(9. Qe2 Be7 {Le fou se développe prudemment : le roque suivra.})
9... Bd6 {Le fou s'aligne avec la dame vers h2. [%cal Gd6h2]}
10. Ne5 Nbd7 {Le cavalier conteste e5 : l'échange en d7 libère votre jeu.}`,
          conclusion:
            "Contre O-O, la batterie …Qc7-…Bd6 vise h2. Ensuite …Nbd7 conteste le cavalier e5 et vous pouvez roquer de chaque côté.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Réponses adverses",
      summary:
        "La riposte …e5 contre 4.d4, les réponses à 3.Nf3 et 3.d4, et le traitement de 5.Bc4 avec Nd5.",
      stage: "responses",
      lessons: [
        {
          legacyIds: ["scandinavian-m1"],
          title: "4.d4 e5 : la contre-attaque centrale",
          eco: "B01",
          kind: "line",
          objectives: [
            "Attaquer d4 tout de suite par …e5",
            "Récupérer le pion e5 par …Nc6 et …Bb4",
            "Occuper d4 avec le cavalier après a3",
          ],
          pgn: `{Une alternative ambitieuse à 4…Nf6 : 4…e5 attaque d4 immédiatement. Après dxe5, vous développez vos pièces avec gain de temps et récupérez le pion e5 plus tard.}
${QA5} 4. d4 e5 {Le pion frappe d4 : vous ne laissez pas les Blancs s'installer. [%cal Ge5d4]}
5. dxe5
(5. Nf3 Bg4 {Le fou cloue le cavalier qui défend d4. [%cal Gg4f3]} 6. Be2 Nc6 {Le cavalier attaque d4 une deuxième fois. [%cal Gc6d4]})
5... Nc6 {Le cavalier vise e5 et d4. [%cal Gc6e5]}
6. Nf3
(6. Bb5 Bd7 {Le fou rompt le clouage : le pion e5 reste fragile.})
6... Bb4 {Le fou cloue le cavalier c3 et accélère le développement. [%cal Gb4c3]}
7. Bd2 Bg4 {Le fou attaque le cavalier f3, qui défend e5. [%cal Gg4f3]}
8. a3 Nd4 {Le cavalier s'installe en d4 : il attaque f3 et c2. [%cal Gd4f3,Gd4c2]}`,
          conclusion:
            "Avec 4…e5, vous attaquez le centre blanc tout de suite. …Nc6, …Bb4 et …Bg4 développent vos pièces avec menaces, et …Nd4 met un cavalier au cœur du camp blanc.",
        },
        {
          title: "3.Nf3 Bg4 : …Nc6 et le grand roque",
          eco: "B01",
          kind: "line",
          objectives: [
            "Clouer le cavalier f3 par …Bg4",
            "Développer par …Nc6 et roquer à l'aile dame",
            "Contre-attaquer d4 par …e5 ou recentrer la dame en f5",
          ],
          pgn: `{Sans Nc3, votre dame reste en d5. Le fou cloue le cavalier f3, le cavalier sort en c6 et le grand roque met la tour sur la colonne d, face au pion d4.}
1. e4 d5 2. exd5 Qxd5 3. Nf3 Bg4 {Le fou cloue le cavalier f3 sur la dame. [%cal Gg4d1]}
4. Be2 Nc6 {Le cavalier soutient …e5 et vise d4. [%cal Gc6d4]}
5. d4
(5. O-O O-O-O {Le grand roque met la pression sur la colonne d.} 6. h3 Bh5 {Le fou garde le clouage. [%cal Gh5f3]})
(5. h3 Bxf3 {L'échange : vous ne perdez pas de temps avec le fou.})
5... O-O-O {Le grand roque : la tour d8 se place derrière la dame, face à d4. [%cal Gd8d4]}
6. Be3
(6. c4 Qf5 {La dame se replie en f5 : la diagonale vers b1 s'est ouverte avec c4. [%cal Gf5b1]})
6... e5 {Le levier central : d4 est attaqué par la dame, la tour, le cavalier et le pion. [%cal Ge5d4]}`,
          conclusion:
            "Contre 3.Nf3, …Bg4, …Nc6 et O-O-O mettent quatre pièces contre d4. Le levier …e5 ouvre alors le centre en votre faveur.",
        },
        {
          title: "3.d4 : …Nf6, …Bg4 et …e6",
          eco: "B01",
          kind: "line",
          objectives: [
            "Défendre la dame par …Nf6 contre 3.d4",
            "Clouer le cavalier f3 par …Bg4",
            "Construire …e6 et …Be7, puis reculer la dame en d8",
          ],
          pgn: `{Contre 3.d4, la dame reste en d5 et le cavalier f6 la soutient. Le fou cloue le cavalier f3, puis …e6 et …Be7 donnent une structure de Défense française sans le mauvais fou.}
1. e4 d5 2. exd5 Qxd5 3. d4 Nf6 {Le cavalier défend la dame et contrôle e4. [%cal Gf6e4]}
4. Nf3 Bg4 {Le fou sort avant …e6 et cloue le cavalier f3. [%cal Gg4f3]}
5. Be2 e6 {Le pion soutient la dame et libère le fou f8. [%cal Gf8e7]}
6. O-O Be7 {Le fou se développe ; le roque suivra.}
7. c4
(7. h3 Bh5 {Le fou garde le clouage sur la diagonale. [%cal Gh5f3]})
7... Qd8 {La dame recule face au pion c4 : elle reste en sécurité derrière vos pièces.}
8. Nc3 {Les Blancs ont plus d'espace, mais votre fou c8 est déjà sorti : c'est le gros avantage de la Scandinave.}`,
          conclusion:
            "Contre 3.d4, …Nf6, …Bg4 et …e6 donnent une structure solide où le fou c8 est actif. Quand c4 chasse la dame, elle revient en d8 sans perte.",
        },
        {
          title: "5.Bc4 c6 : …Bf5 contre Nd5",
          eco: "B01",
          kind: "line",
          objectives: [
            "Jouer …c6 et …Bf5 contre 5.Bc4",
            "Répondre à Nd5 par …Qd8 et …gxf6",
            "Garder le schéma contre Nge2 et Ng3",
          ],
          pgn: `{Avec 5.Bc4, les Blancs retardent Nf3. Votre schéma ne change pas : …c6, …Bf5, et …Qd8 si le cavalier va en d5.}
${QA5} 4. d4 Nf6 5. Bc4 c6 {Le pion protège d5 contre Nd5. [%cal Gc6d5]}
6. Bd2
(6. Nge2 Bf5 {Le fou sort avant que le cavalier ne vienne en g3. [%cal Gf5c2]} 7. O-O e6 8. Ng3 Bg6 {Le fou recule sur la même diagonale : il reste actif.})
6... Bf5 {Le fou se développe avec le gain de la case b1. [%cal Gf5b1]}
7. Nd5 Qd8 {Retour en d8 : de là, la dame couvre le cavalier f6 et la case c7. [%cal Gd8f6]}
8. Nxf6+ gxf6 {La colonne g s'ouvre pour vos tours.}
9. c3
(9. Nf3 e6 {Le pion e6 ferme la diagonale du fou c4 vers f7. [%cal Ge6f7]})
9... e6 {Le pion soutient d5 et libère le fou f8 : la structure est la même que dans la ligne principale.}`,
          conclusion:
            "Contre 5.Bc4, …c6 et …Bf5 vous ramènent au même schéma. Si Nd5, la dame recule en d8 et la structure …gxf6 vous donne la colonne g.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Pièges",
      summary:
        "Les erreurs blanches typiques contre la Scandinave : le pion d4 laissé sans défenseur, la dame sortie trop tôt, le cavalier c3 cloué et le fou f5 qui prend c2.",
      stage: "traps",
      lessons: TRAPS,
    },
    // =====================================================================================
    {
      title: "Grande théorie",
      summary:
        "Les lignes profondes : l'attaque g4-h4 contre 6.Ne5, la structure …gxf6 avec c3, et l'alternative 3…Qd6 contre g3 et contre Bc4-Nge2.",
      stage: "theory",
      lessons: [
        {
          legacyIds: ["scandinavian-m4"],
          title: "6.Ne5 c6 7.Bc4 e6 8.g4 : …Bg6 et …Be4",
          eco: "B01",
          kind: "line",
          objectives: [
            "Reculer le fou en g6 contre g4",
            "Échanger le cavalier e5 par …Nbd7",
            "Replacer le fou en e4 puis en d5 contre h5",
          ],
          pgn: `{L'attaque 8.g4 est la ligne la plus agressive contre 5…Bf5 : les pions g et h chassent votre fou. Vous échangez le cavalier e5, puis le fou trouve un refuge en e4 et en d5.}
${QA5} 4. d4 Nf6 5. Nf3 Bf5 6. Ne5 c6 7. Bc4 e6 8. g4
(8. O-O Nbd7 {Le cavalier conteste e5. [%cal Gd7e5]} 9. Qe2 Bb4 {Le fou cloue le cavalier c3 : la dame a5 et le fou b4 visent tous deux c3. [%cal Gb4c3]})
8... Bg6 {Le fou recule : il reste sur la diagonale b1-h7.}
9. h4 Nbd7 {Le cavalier conteste e5 : l'échange calme l'attaque. [%cal Gd7e5]}
10. Nxd7 Nxd7 11. h5 Be4 {Le fou évite h5 en se plaçant au centre : il attaque la tour h1. [%cal Ge4h1]}
12. O-O
(12. Rh3 Bd5 {Le fou propose l'échange du fou c4. [%cal Gd5c4]} 13. Bd3 O-O-O {Le grand roque : vos pièces sont prêtes à contre-attaquer au centre.})
12... Bd5 {Le fou attaque le fou c4 et protège la case b7. [%cal Gd5c4]}
13. Nxd5 cxd5 14. Bd3 Bd6 {Le fou se place sur la diagonale du roi blanc, affaibli par g4 et h5. [%cal Gd6h2]}`,
          conclusion:
            "Contre 8.g4, …Bg6, …Nbd7 et …Be4 neutralisent l'attaque. Après …Bd5 et …Bd6, ce sont les pions g4 et h5 qui deviennent des faiblesses.",
        },
        {
          title: "9.Nxf6+ gxf6 10.c3 : …Nd7, …Bg6 et …Nb6",
          eco: "B01",
          kind: "line",
          objectives: [
            "Développer le cavalier en d7 contre 10.c3",
            "Replier le fou en g6 contre Nh4",
            "Chasser le fou c4 par …Nb6",
          ],
          pgn: `{Avec 10.c3, les Blancs gardent leur fou en c4 et soutiennent d4. Votre cavalier passe par d7 vers b6, d'où il chasse le fou c4 et contrôle d5.}
${MAIN} 8. Nd5 Qd8 9. Nxf6+ gxf6 10. c3 Nd7 {Le cavalier se dirige vers b6. [%cal Gd7b6]}
11. Nh4
(11. Qe2 Qc7 {La dame prépare le grand roque et vise h2. [%cal Gc7h2]})
11... Bg6 {Le fou recule : un échange en g6 ouvrirait la colonne h.}
12. Qe2 Nb6 {Le cavalier attaque le fou c4 et contrôle d5. [%cal Gb6c4,Gb6d5]}`,
          conclusion:
            "Contre 10.c3, la manœuvre …Nd7-b6 chasse le fou c4. Votre fou g6 est solide, et l'échange Nxg6 vous donnerait la colonne h.",
        },
        {
          legacyIds: ["scandinavian-m2"],
          title: "3…Qd6 : …a6, …Bg4 et O-O-O contre g3",
          eco: "B01",
          kind: "line",
          objectives: [
            "Placer la dame en d6 et jouer …a6 contre Nb5",
            "Clouer le cavalier f3 par …Bg4 et roquer à l'aile dame",
            "Répondre à d5 par …Ne5",
          ],
          pgn: `{L'alternative 3…Qd6 place la dame au centre. Le petit coup …a6 empêche Nb5 et Bb5 ; ensuite …Bg4, …Nc6 et O-O-O mettent toutes vos pièces contre le pion d4.}
1. e4 d5 2. exd5 Qxd5 3. Nc3 Qd6 {La dame se place en d6, sur la diagonale du roi blanc. [%cal Gd6h2]}
4. d4 Nf6 5. Nf3 a6 {Le pion contrôle b5 : ni le cavalier ni le fou blanc ne viendront y attaquer. [%cal Ga6b5]}
6. g3 Bg4 {Le fou cloue le cavalier f3 avant que le fou g2 ne le protège. [%cal Gg4f3]}
7. Bg2 Nc6 {Le cavalier rejoint la dame et le fou g4 dans la pression sur d4. [%cal Gc6d4]}
8. O-O
(8. h3 Bh5 {Le fou garde le clouage sur f3.} 9. O-O O-O-O 10. Bf4 Qb4 {La dame évite le fou f4 et attaque b2. [%cal Gb4b2]})
8... O-O-O {Le grand roque : la tour d8 vise le pion d4. [%cal Gd8d4]}
9. d5 Ne5 {Le cavalier se centralise et attaque f3. [%cal Ge5f3]}`,
          conclusion:
            "Avec 3…Qd6, …a6 protège b5 et …Bg4, …Nc6, O-O-O visent d4. Si les Blancs avancent d5, le cavalier trouve la case e5.",
        },
        {
          legacyIds: ["scandinavian-m3"],
          title: "3…Qd6 contre Bc4 et Nge2 : …c6, …Bf5 et …Qb4",
          eco: "B01",
          kind: "line",
          objectives: [
            "Jouer …c6 et …Bf5 contre Bc4 et Nge2",
            "Répondre à Bf4 par …Qb4",
            "Reculer le fou en g6 contre Ng3",
          ],
          pgn: `{Contre Bc4 et Nge2, vous gardez le schéma …c6 et …Bf5. Quand le fou f4 attaque votre dame, elle va en b4, où elle cloue le cavalier c3 et attaque b2.}
1. e4 d5 2. exd5 Qxd5 3. Nc3 Qd6 4. d4 Nf6 5. Bc4 c6 {Le pion ferme la diagonale a4-e8 et soutient …b5. [%cal Gc6b5]}
6. Nge2 Bf5 {Le fou sort avant que les Blancs ne contrôlent f5. [%cal Gf5c2]}
7. Bf4
(7. Ng3 Bg6 {Le fou recule face au cavalier g3.})
7... Qb4 {La dame évite le fou f4 et attaque b2 et c4 à la fois. [%cal Gb4b2,Gb4c4]}
8. Bb3 e6 {Le pion soutient d5 et prépare …Nbd7 et …Be7 : votre position est solide.}`,
          conclusion:
            "Contre Bc4 et Nge2, …c6 et …Bf5 gardent votre schéma. Contre Bf4, …Qb4 attaque deux pions et oblige les Blancs à défendre.",
        },
      ],
    },
  ],
};
