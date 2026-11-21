// Brouillon de la Masterclass « Défense Caro-Kann » (côté Noirs) : 1.e4 c6.
// Répertoire : 2.d4 d5 avec 3…dxe4 4…Bf5 (classique), …Bf5, …e6 et …c5 contre l'avance,
// …Nc6 et …Bg4 contre l'échange, …e6 et …Bb4 contre la Panov, plus 2.Nc3, 2.c4 et 3.f3.
// La Steinitz (4…Nd7) est présentée en grande théorie comme alternative.
// Les flèches du coup à jouer sont ajoutées par scripts/course-builder.mjs ; celles écrites ici
// illustrent une idée (cible, manœuvre, menace).
import { TRAPS } from "./caro_kann-traps.mjs";

const CK = "1. e4 c6 2. d4 d5";
const CLASS = `${CK} 3. Nc3 dxe4 4. Nxe4 Bf5 5. Ng3 Bg6 6. h4 h6 7. Nf3 Nd7 8. h5 Bh7 9. Bd3 Bxd3 10. Qxd3 e6`;
const CLASS_KB1 = `${CLASS} 11. Bd2 Ngf6 12. O-O-O Be7 13. Kb1 O-O`;
const SHORT = `${CK} 3. e5 Bf5 4. Nf3 e6 5. Be2 c5 6. Be3 cxd4 7. Nxd4 Ne7`;
const EXCH = `${CK} 3. exd5 cxd5 4. Bd3 Nc6 5. c3 Nf6 6. Bf4 Bg4 7. Qb3 Qd7 8. Nd2 e6 9. Ngf3 Bxf3 10. Nxf3 Bd6`;
const PANOV = `${CK} 3. exd5 cxd5 4. c4 Nf6 5. Nc3 e6 6. Nf3 Bb4 7. cxd5 Nxd5`;

export default {
  id: "caro_kann",
  name: "Défense Caro-Kann",
  description:
    "1.e4 c6 : une défense solide qui conteste le centre sans enfermer le fou c8. Un répertoire complet côté Noirs avec la variante classique 4…Bf5, l'avance 3.e5, l'échange et la Panov, les Deux Cavaliers, la Fantaisie et 2.c4, la Steinitz en alternative, pièges et grandes lignes.",
  side: "black",
  eco: ["B10", "B11", "B12", "B13", "B14", "B15", "B17", "B18", "B19"],
  chapters: [
    // =====================================================================================
    {
      title: "Les fondations",
      summary:
        "L'idée de 1…c6 et 2…d5, la variante classique avec 4…Bf5, le système Short contre l'avance et la variante d'échange.",
      stage: "foundations",
      lessons: [
        {
          title: "1…c6 et 2…d5 : contester e4 sans enfermer le fou",
          eco: "B12",
          kind: "concept",
          objectives: [
            "Préparer …d5 par 1…c6 en gardant la diagonale du fou c8",
            "Prendre en e4 puis sortir le fou en f5",
            "Reconnaître les trois grandes réponses blanches",
          ],
          pgn: `{La Caro-Kann prépare …d5 par …c6 : contrairement à la Française, le pion e6 n'enferme pas le fou c8. Votre idée de base : prendre en e4, sortir le fou en f5, puis jouer …e6 et …Nd7 dans une position sans faiblesse.}
1. e4 c6 {Le pion soutient la future poussée …d5. [%cal Gc6d5]}
2. d4
(2. Nc3 d5 {Même idée : le pion conteste e4. [%cal Gd5e4]})
2... d5 {Le pion attaque e4 : les Blancs doivent choisir. [%cal Gd5e4]}
3. Nc3
(3. e5 Bf5 {Contre l'avance, le fou sort avant …e6. [%cal Gc8f5]})
(3. exd5 cxd5 {Contre l'échange, la reprise du pion c garde la symétrie.})
(3. Nd2 dxe4 4. Nxe4 Bf5 {Le même schéma qu'après 3.Nc3.})
3... dxe4 4. Nxe4 Bf5 {Le fou attaque le cavalier et se développe avec gain de temps. [%cal Gf5e4]}
5. Ng3 Bg6 {Le fou se replie sur la diagonale h7-b1, toujours actif. [%cal Gg6c2]}
6. h4 h6 {Le pion offre une case de retraite au fou en h7. [%cal Gg6h7]}`,
          conclusion:
            "La Caro-Kann repose sur …d5 soutenu par …c6. Votre fou c8 sort avant …e6, et votre structure reste saine dans toutes les variantes.",
        },
        {
          legacyIds: ["caro_kann-m4"],
          title: "4…Bf5 : la variante classique",
          eco: "B19",
          kind: "line",
          objectives: [
            "Répondre à h4-h5 par …h6 et la retraite …Bh7",
            "Échanger les fous de cases blanches en d3",
            "Développer par …e6, …Ngf6 et …Be7 puis roquer",
          ],
          pgn: `{Dans la classique, les Blancs gagnent de l'espace par h4-h5 et échangent les fous en d3. Vos pièces se placent ensuite d'elles-mêmes : …e6, …Ngf6, …Be7 et petit roque, ou grand roque selon le camp choisi par les Blancs.}
${CK} 3. Nc3 dxe4 4. Nxe4 Bf5 5. Ng3 Bg6 6. h4
(6. Nf3 Nd7 7. h4 h6 8. h5 Bh7 {Un autre ordre de coups vers la même position.})
6... h6 7. Nf3 Nd7 {Le cavalier contrôle e5 et empêche Ne5. [%cal Gd7e5]}
8. h5 Bh7 9. Bd3 Bxd3 {L'échange supprime le fou le plus dangereux des Blancs.}
10. Qxd3 e6 11. Bd2
(11. Bf4 Qa5+ {L'échec gêne le développement blanc. [%cal Ga5e1]} 12. Bd2 Qc7 {La dame revient sur la diagonale b8-h2. [%cal Gc7h2]})
11... Ngf6 12. O-O-O Be7 13. Kb1 O-O {Votre roi est en sécurité ; le pion h5 blanc est désormais une cible. [%cal Gf6h5]}`,
          conclusion:
            "Dans la classique, l'échange des fous en d3 vous soulage. …e6, …Ngf6, …Be7 et le roque donnent une position compacte, où le pion h5 avancé peut devenir faible.",
        },
        {
          legacyIds: ["caro_kann-m1"],
          title: "3.e5 Bf5 : le système Short",
          eco: "B12",
          kind: "line",
          objectives: [
            "Sortir le fou en f5 avant …e6",
            "Frapper la chaîne blanche par …c5",
            "Placer le cavalier en e7 vers c6 ou g6",
          ],
          pgn: `{Contre l'avance, la chaîne d4-e5 bloque vos pièces. Votre fou sort en f5 avant …e6, puis …c5 attaque la base de la chaîne. Le cavalier g8 passe par e7 pour rejoindre c6 ou g6.}
${CK} 3. e5 Bf5 {Le fou sort avant que …e6 ne l'enferme. [%cal Gf5b1]}
4. Nf3
(4. h4 h5 {Le pion bloque l'avance h5 : le fou garde sa case. [%cal Gh5h4]})
(4. Nc3 e6 {Le pion e6 soutient d5 ; …c5 viendra ensuite. [%cal Ge6d5]})
4... e6 5. Be2 c5 {Le pion attaque d4, la base de la chaîne blanche. [%cal Gc5d4]}
6. Be3
(6. O-O Nc6 {Le cavalier ajoute sa pression sur d4. [%cal Gc6d4]})
6... cxd4 7. Nxd4 Ne7 {Le cavalier vise c6 et g6 : il attaquera d4 ou e5. [%cal Ge7c6,Ge7g6]}`,
          conclusion:
            "Contre 3.e5, le fou f5 sort en premier, …c5 attaque la chaîne et le cavalier e7 cherche c6 ou g6. Le pion e5 avancé devient vite une cible.",
        },
        {
          legacyIds: ["caro_kann-m2"],
          title: "3.exd5 cxd5 4.Bd3 : la variante d'échange",
          eco: "B13",
          kind: "line",
          objectives: [
            "Développer par …Nc6 et …Nf6 contre la structure c3-d4",
            "Sortir le fou c8 en g4 avant …e6",
            "Échanger le fou de cases noires par …Bd6",
          ],
          pgn: `{Dans la variante d'échange, les Blancs ont une structure de Carlsbad inversée. Votre plan : sortir le fou en g4 avant …e6, l'échanger contre le cavalier f3, puis échanger les fous de cases noires par …Bd6.}
${CK} 3. exd5 cxd5 4. Bd3
(4. c4 Nf6 {Contre la Panov, le cavalier attaque d5 et e4. [%cal Gf6d5]})
4... Nc6 5. c3 Nf6 6. Bf4
(6. Nf3 Bg4 {Le fou cloue le cavalier : …e6 suivra. [%cal Gg4f3]})
6... Bg4 {Le fou sort avant …e6 et vise le cavalier f3. [%cal Gg4d1]}
7. Qb3 Qd7 {La dame protège b7 et garde le contact avec g4. [%cal Gd7b7]}
8. Nd2 e6 9. Ngf3 Bxf3 10. Nxf3 Bd6 11. Bxd6 Qxd6 12. O-O O-O {Les fous de cases noires sont échangés : la position est équilibrée.}`,
          conclusion:
            "Contre l'échange, …Bg4 avant …e6 et …Bd6 neutralisent les fous blancs. Le plan de minorité …b5-b4 suivra ensuite.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Plans typiques",
      summary:
        "La simplification …Nxe4 et …Qd5 dans la classique, le jeu contre e5 dans le système Short, l'attaque de minorité dans l'échange et le blocus du pion isolé de la Panov.",
      stage: "plans",
      lessons: [
        {
          title: "Classique : …Nxe4 et la dame en d5",
          eco: "B19",
          kind: "line",
          objectives: [
            "Échanger les cavaliers pour réduire la pression blanche",
            "Centraliser la dame en d5",
            "Proposer l'échange des dames par …Qe4",
          ],
          pgn: `{Après le roque des deux côtés, les Blancs veulent installer un cavalier en e4 ou e5. Vous échangez les cavaliers, centralisez la dame en d5 et proposez l'échange des dames : la finale est confortable pour vous.}
${CLASS_KB1} 14. Ne4 Nxe4 {L'échange supprime le cavalier le plus actif des Blancs.}
15. Qxe4 Nf6 {Le cavalier revient avec gain de temps sur la dame. [%cal Gf6e4]}
16. Qe2 Qd5 {La dame se centralise et vise a2 et g2. [%cal Gd5a2,Gd5g2]}
17. Ne5 Qe4 {La dame propose l'échange : sans dames, le pion h5 sera faible. [%cal Ge4e2]}`,
          conclusion:
            "Dans la classique, chaque échange vous rapproche d'une finale favorable. …Nxe4, …Qd5 et …Qe4 neutralisent l'initiative blanche.",
        },
        {
          title: "Système Short : …Nbc6 et …Be4",
          eco: "B12",
          kind: "line",
          objectives: [
            "Mettre les deux cavaliers en c6 et e7 contre d4",
            "Placer le fou en e4 pour contrôler la grande diagonale",
            "Préparer …Ng6 contre le pion e5",
          ],
          pgn: `{Après …cxd4, la structure est celle d'une Française avec votre fou dehors. Vos cavaliers visent e5 depuis c6 et g6, et votre fou e4 contrôle la diagonale centrale.}
${SHORT} 8. Nd2
(8. c4 Nbc6 {Le cavalier attaque d4 : les Blancs devront défendre. [%cal Gc6d4]})
8... Nbc6 {Le cavalier rejoint la pression sur d4 et e5. [%cal Gc6e5]}
9. N2f3 Be4 {Le fou s'installe au centre et contrôle f3 et d5. [%cal Ge4f3]}`,
          conclusion:
            "Dans le système Short, le pion e5 est la cible : vos cavaliers c6 et g6 l'attaquent, et votre fou e4 domine la diagonale centrale.",
        },
        {
          title: "Échange : l'attaque de minorité …b5-b4",
          eco: "B13",
          kind: "line",
          objectives: [
            "Mettre la tour en b8 pour soutenir …b5",
            "Avancer …b5-b4 contre le pion c3",
            "Créer une faiblesse en c3 ou sur la colonne c",
          ],
          pgn: `{Dans la Carlsbad inversée, c'est vous qui menez l'attaque de minorité. Vos pions a et b avancent contre les pions b2 et c3 des Blancs pour créer une faiblesse durable en c3.}
${EXCH} 11. Bxd6 Qxd6 12. O-O O-O 13. Rae1
(13. Rfe1 Rab8 {Même plan : la tour soutient …b5.})
13... Rab8 {La tour prépare …b5. [%cal Gb8b5]}
14. Ne5 b5 {Le pion avance : …b4 attaquera c3. [%cal Gb5b4]}
15. a3 a5 {Le pion a5 soutient …b4 malgré a3. [%cal Ga5b4]}`,
          conclusion:
            "Dans l'échange, l'attaque de minorité est votre plan. …Rab8, …b5 et …a5 préparent …b4, qui affaiblit c3 pour longtemps.",
        },
        {
          title: "Panov : bloquer le pion isolé",
          eco: "B14",
          kind: "line",
          objectives: [
            "Installer le cavalier en d5 devant le pion isolé",
            "Développer le fou e7 vers f6 pour presser d4",
            "Roquer et échanger les pièces actives",
          ],
          pgn: `{Dans la Panov, les Blancs ont un pion isolé en d4. Votre stratégie : bloquer la case d5 avec un cavalier, mettre la pression sur d4, et échanger les pièces pour atteindre une finale où ce pion sera faible.}
${PANOV} 8. Bd2
(8. Qc2 Nc6 {Contre la dame c2, le même cavalier vise d4 ; la suite est en grande théorie.})
8... Nc6 {Le cavalier attaque d4. [%cal Gc6d4]}
9. Bd3 O-O 10. O-O Be7 {Le fou recule pour se placer en f6 contre d4. [%cal Ge7f6]}
11. Re1 Bf6 {Le fou presse le pion isolé : d4 est attaqué trois fois. [%cal Gf6d4]}`,
          conclusion:
            "Contre le pion isolé, la case d5 et la pression sur d4 sont vos atouts. Chaque échange de pièces rend ce pion plus faible.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Réponses adverses",
      summary:
        "Les Deux Cavaliers 2.Nc3 et 3.Nf3, l'avance agressive 4.Nc3 et 5.g4, la Fantaisie 3.f3 et l'attaque 2.c4.",
      stage: "responses",
      lessons: [
        {
          title: "2.Nc3 d5 3.Nf3 : les Deux Cavaliers",
          eco: "B11",
          kind: "line",
          objectives: [
            "Clouer le cavalier f3 par …Bg4",
            "Échanger le fou contre le cavalier après h3",
            "Construire le centre …e6, …Nf6 et …Nbd7",
          ],
          pgn: `{Dans les Deux Cavaliers, les Blancs retardent d4. Votre fou cloue le cavalier f3 ; après h3, vous l'échangez et jouez …e6 : votre structure est solide et la dame f3 blanche n'a pas de cible.}
1. e4 c6 2. Nc3 d5 3. Nf3 Bg4 {Le fou cloue le cavalier f3. [%cal Gg4d1]}
4. h3 Bxf3 5. Qxf3 e6 {Le pion soutient d5 et ouvre la diagonale du fou f8. [%cal Gf8b4]}
6. d3
(6. d4 Nf6 {Le cavalier attaque e4 : …dxe4 suivra au bon moment. [%cal Gf6e4]})
(6. Be2 Nf6 {Même développement, quel que soit le coup blanc.})
6... Nf6 7. Bd2 Nbd7 {Le cavalier soutient …e5 ou …Bc5 selon la position. [%cal Gd7e5]}`,
          conclusion:
            "Contre les Deux Cavaliers, …Bg4 et …Bxf3 vous donnent un centre solide. Les Blancs ont la paire de fous mais pas de cible.",
        },
        {
          title: "3.e5 Bf5 4.Nc3 e6 5.g4 : l'attaque agressive",
          eco: "B12",
          kind: "line",
          objectives: [
            "Replier le fou en g6 puis en h7",
            "Contre-attaquer au centre par …c5 et …Nc6",
            "Répondre à h4 par …h5",
          ],
          pgn: `{Contre 4.Nc3 et 5.g4, les Blancs chassent votre fou à coups de pions. Le fou se replie, et vous contre-attaquez au centre par …c5 : les pions blancs avancés laissent des cases derrière eux.}
${CK} 3. e5 Bf5 4. Nc3 e6 5. g4 Bg6 6. Nge2 c5 {La contre-attaque au centre est la meilleure réponse aux pions g4 et h4. [%cal Gc5d4]}
7. h4
(7. Be3 Nc6 {Le cavalier ajoute sa pression sur d4. [%cal Gc6d4]})
7... h5 {Le pion bloque l'avance h5 et ouvre la colonne h. [%cal Gh5g4]}
8. Nf4 Bh7 9. Nxh5 Nc6 {Le cavalier développe et vise e5 et d4. [%cal Gc6e5]}
10. dxc5 Bxc5 {Le fou reprend et vise f2 : vos pièces sont actives. [%cal Gc5f2]}`,
          conclusion:
            "Contre l'attaque g4-h4, …c5 et …Nc6 frappent le centre. Les pions blancs avancés affaiblissent leur roi, et vos pièces prennent le dessus.",
        },
        {
          title: "3.f3 e6 : la Fantaisie",
          eco: "B12",
          kind: "line",
          objectives: [
            "Soutenir d5 par …e6 face au pion f3",
            "Clouer le cavalier c3 par …Bb4",
            "Développer le cavalier en e7",
          ],
          pgn: `{La Fantaisie soutient e4 par f3. La réponse …e6 garde la tension au centre ; le fou b4 cloue le cavalier c3, défenseur de e4.}
${CK} 3. f3 e6 4. Nc3 Bb4 {Le fou cloue le cavalier qui défend e4. [%cal Gb4c3]}
5. Bd2
(5. Bf4 Ne7 {Le cavalier se développe sans gêner le fou f8.})
5... Ne7 {Le cavalier soutient d5 et peut aller en g6. [%cal Ge7g6]}
6. a3 Bxc3 7. Bxc3 b6 {Le fou c8 ira en a6 pour échanger le fou f1. [%cal Gc8a6]}`,
          conclusion:
            "Contre la Fantaisie, …e6 et …Bb4 mettent la pression sur e4. Le fou c8 rejoint a6 pour échanger le meilleur fou blanc.",
        },
        {
          title: "2.c4 d5 : l'attaque Panov accélérée",
          eco: "B10",
          kind: "line",
          objectives: [
            "Reprendre en d5 avec le cavalier",
            "Développer …Nc6 et …e6 contre le pion isolé absent",
            "Répondre à Bb5+ par …Nbd7 et …a6",
          ],
          pgn: `{Avec 2.c4, les Blancs visent d5 sans jouer d4. Après les échanges, votre cavalier reprend en d5, et …Nc6 avec …e6 donnent un développement rapide.}
1. e4 c6 2. c4 d5 3. exd5 cxd5 4. cxd5
(4. d4 Nf6 5. Nc3 e6 {On retrouve la Panov classique.})
4... Nf6 5. Nc3
(5. Bb5+ Nbd7 {Le cavalier s'interpose et rejoindra b6 ou f6.} 6. Nc3 a6 {Le pion chasse le fou avant de reprendre en d5. [%cal Ga6b5]})
5... Nxd5 6. Nf3 Nc6 7. Bb5 e6 {Le pion soutient d5 : votre position est saine. [%cal Ge6d5]}`,
          conclusion:
            "Contre 2.c4, reprenez en d5 avec le cavalier et développez-vous vite. Sans pion d4, les Blancs n'ont pas de centre fort.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Pièges",
      summary: "Les erreurs blanches typiques : le cavalier e4 oublié après 4…Bf5, le cavalier c3 sans soutien dans la Panov, le pion e5 abandonné dans le système Short et le saut Nb5? dans l'attaque g4.",
      stage: "traps",
      lessons: TRAPS,
    },
    // =====================================================================================
    {
      title: "Grande théorie",
      summary:
        "Les lignes profondes : la classique avec 11.Bf4 Qa5+, la Steinitz 4…Nd7, le système Short avec …Ng6 et la Panov avec 8.Qc2.",
      stage: "theory",
      lessons: [
        {
          legacyIds: ["caro_kann-m3"],
          title: "Classique : 11.Bf4 Qa5+ et le grand roque",
          eco: "B19",
          kind: "line",
          objectives: [
            "Gêner le développement blanc par …Qa5+",
            "Roquer à l'aile dame et échanger en e4",
            "Contre-attaquer le centre par …c5",
          ],
          pgn: `{Contre 11.Bf4, l'échec …Qa5+ force Bd2, puis la dame revient en c7 contre le fou. Vous roquez à l'aile dame, échangez les cavaliers en e4, et frappez le centre par …c5.}
${CLASS} 11. Bf4 Qa5+ 12. Bd2 Qc7 13. O-O-O Ngf6 14. Ne4 O-O-O {Votre roi rejoint l'aile dame, loin du pion h5. [%cal Gc8b8]}
15. g3 Nxe4 16. Qxe4 Bd6 {Le fou prend la diagonale b8-h2. [%cal Gd6g3]}
17. c4 c5 {Le pion attaque d4 : le centre blanc vacille. [%cal Gc5d4]}
18. d5 Nf6 {Le cavalier attaque la dame et le pion d5. [%cal Gf6e4,Gf6d5]}`,
          conclusion:
            "Dans la classique avec 11.Bf4, …Qa5+ et le grand roque créent un jeu riche. …c5 et …Nf6 contre-attaquent dès que les Blancs poussent d5.",
        },
        {
          legacyIds: ["caro_kann-m5"],
          title: "4…Nd7 : la Steinitz moderne",
          eco: "B17",
          kind: "line",
          objectives: [
            "Préparer …Ngf6 sans abîmer vos pions",
            "Repousser le cavalier g5 par …h6",
            "Placer la dame en c7 et préparer …b6 et …Bb7",
          ],
          pgn: `{La Steinitz 4…Nd7 est une alternative à 4…Bf5 : le cavalier prépare …Ngf6 et, en cas d'échange, vous reprenez avec un cavalier. Attention au piège 5.Qe2 Ngf6?? 6.Nd6 mat : contre Qe2, il faut d'abord jouer …e6 ou …Ndf6.}
${CK} 3. Nc3 dxe4 4. Nxe4 Nd7 5. Ng5
(5. Bc4 Ngf6 6. Ng5 e6 7. Qe2 Nb6 {Le cavalier chasse le fou c4 : f7 est à l'abri. [%cal Gb6c4]})
(5. Nf3 Ngf6 6. Nxf6+ Nxf6 {Le cavalier reprend : votre structure est intacte.})
5... Ngf6 6. Bd3 e6 7. N1f3 Bd6 8. Qe2 h6 {Le pion chasse le cavalier g5. [%cal Gh6g5]}
9. Ne4 Nxe4 10. Qxe4 Nf6 11. Qe2 Qc7 12. Bd2 b6 {Le fou c8 ira en b7 sur la grande diagonale. [%cal Gc8b7]}`,
          conclusion:
            "La Steinitz donne une position solide : …Ngf6, …e6, …Bd6 et …Qc7, puis …b6 et …Bb7. Retenez le piège du mat en d6 si les Blancs jouent Qe2 tôt.",
        },
        {
          title: "Système Short : 10.O-O Ng6 et la paire de fous",
          eco: "B12",
          kind: "line",
          objectives: [
            "Attaquer e5 par …Ng6",
            "Reprendre …bxc6 pour renforcer le centre",
            "Échanger le fou e4 contre un cavalier en gardant le fou e7",
          ],
          pgn: `{Dans le système Short, …Ng6 attaque e5 et prépare …Be7. Après Nxc6 bxc6, votre structure devient compacte et la colonne b s'ouvre pour votre tour.}
${SHORT} 8. Nd2 Nbc6 9. N2f3 Be4 10. O-O Ng6 {Le cavalier attaque e5 pour la deuxième fois. [%cal Gg6e5]}
11. Nxc6 bxc6 {La reprise vers le centre renforce d5 et ouvre la colonne b. [%cal Gb8b2]}
12. Ng5 Be7 {Le fou attaque le cavalier g5. [%cal Ge7g5]}
13. Nxe4 dxe4 {Le pion e4 gêne les pièces blanches, et votre fou e7 reste le meilleur des deux.}`,
          conclusion:
            "Dans le système Short, …Ng6 et …Be7 mettent e5 sous pression. Après les échanges, votre pion e4 et la colonne b ouverte vous donnent un jeu actif.",
        },
        {
          title: "Panov : 8.Qc2 Nc6 et la prise en d4",
          eco: "B14",
          kind: "line",
          objectives: [
            "Clouer et attaquer le cavalier c3 par …Ba5",
            "Échanger en c3 puis prendre le pion d4",
            "Défendre par …Bd7 et …Qd5 après l'échec Bb5+",
          ],
          pgn: `{Contre 8.Qc2, vous attaquez le cavalier c3 jusqu'à l'échanger. Après bxc3, le pion d4 n'a plus de défenseur : vous le prenez, puis vous parez l'échec et centralisez la dame.}
${PANOV} 8. Qc2 Nc6 9. Bd3 Ba5 {Le fou recule en a5 en gardant le clouage. [%cal Ga5c3]}
10. a3 Nxc3 11. bxc3 Nxd4 {Le cavalier prend d4 : après Nxd4 Qxd4, le pion est gagné. [%cal Gc6d4]}
12. Nxd4 Qxd4 13. Bb5+ Bd7 14. O-O Qd5 {La dame se centralise : vous avez un pion de plus, les Blancs ont l'activité.}`,
          conclusion:
            "Dans la Panov avec 8.Qc2, …Ba5, …Nxc3 et …Nxd4 gagnent un pion. Il faut ensuite défendre avec précision : …Bd7 et …Qd5 tiennent la position.",
        },
      ],
    },
  ],
};
