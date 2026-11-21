// Brouillon de la Masterclass « Gambit du roi » (côté Blancs) : 1.e4 e5 2.f4.
// Répertoire : 3.Nf3 contre 2…exf4, avec le Kieseritzky 4.h4 g4 5.Ne5 comme arme principale
// contre 3…g5, les gambits Philidor, Muzio et Allgaier vus comme alternatives historiques,
// les défenses Fischer 3…d6 et moderne 3…d5, puis les refus 2…d5 et 2…Bc5.
// Les flèches du coup à jouer sont ajoutées par scripts/course-builder.mjs ; celles écrites ici
// illustrent une idée (cible, manœuvre, menace).
import { TRAPS } from "./kings_gambit-traps.mjs";

export default {
  id: "kings_gambit",
  name: "Gambit du roi",
  description:
    "1.e4 e5 2.f4 : le gambit romantique par excellence. Les Blancs offrent un pion pour ouvrir la colonne f et bâtir un grand centre. Un répertoire complet côté Blancs avec le Kieseritzky, les gambits Philidor, Muzio et Allgaier, les défenses Fischer et moderne, les contre-gambits Falkbeer et 2…Bc5, pièges et grandes lignes.",
  side: "white",
  eco: ["C30", "C31", "C33", "C34", "C35", "C36", "C37", "C38", "C39"],
  chapters: [
    // =====================================================================================
    {
      title: "Les fondations",
      summary:
        "Pourquoi 2.f4, la réponse 3.Nf3 contre l'acceptation, le Kieseritzky 4.h4 g4 5.Ne5 et les gambits Philidor et Muzio avec 4.Bc4.",
      stage: "foundations",
      lessons: [
        {
          legacyIds: ["kings_gambit-m1"],
          title: "2.f4 exf4 3.Nf3 : le gambit accepté",
          eco: "C33",
          kind: "concept",
          objectives: [
            "Offrir le pion f pour dévier le pion e5",
            "Empêcher …Qh4+ par 3.Nf3",
            "Attaquer la chaîne g5-f4 par h4",
          ],
          pgn: `{Le pion f4 propose un échange : si les Noirs prennent, le pion e5 quitte le centre et la colonne f s'ouvre. En échange, votre pion d4 pourra s'installer au centre.}
1. e4 e5 2. f4 {Le pion attaque e5 et prépare la colonne f. [%cal Gf4e5,Gf1f7]}
2... exf4
(2... d5 3. exd5 exf4 4. Nf3 {Après le contre-gambit, on retrouve la défense moderne.})
(2... Bc5 3. Nf3 d6 4. c3 {Le pion c3 prépare d4 pour chasser le fou c5. [%cal Gc3d4,Gd4c5]})
3. Nf3 {Le cavalier contrôle h4 : l'échec …Qh4+ n'est plus possible. [%cal Gf3h4]}
3... g5
(3... d6 4. d4 {Le centre e4-d4 est l'atout principal du gambit. [%cal Gd4e5]})
(3... d5 4. exd5 Nf6 5. Bc4 {Le fou vise f7 et protège le pion d5.})
4. h4 {Le pion h attaque g5 : la chaîne de pions noirs doit avancer ou céder. [%cal Gh4g5]}
4... g4 5. Ne5 {Le cavalier saute au centre et vise g4 et f7. [%cal Ge5g4,Ge5f7]}`,
          conclusion:
            "Le Gambit du roi échange un pion contre le centre et l'initiative. Le coup 3.Nf3 empêche …Qh4+ et h4 attaque aussitôt la chaîne g5-f4.",
        },
        {
          legacyIds: ["kings_gambit-m5"],
          title: "Kieseritzky : la défense Anderssen 5…Nf6 6.Bc4 d5",
          eco: "C39",
          kind: "line",
          objectives: [
            "Viser f7 par Bc4 après 5…Nf6",
            "Prendre en d5 et soutenir le pion par d4",
            "Roquer puis reprendre le pion g4",
          ],
          pgn: `{Contre 5…Nf6, le fou c4 attaque f7. Les Noirs répondent par le contre-coup …d5 pour couper la diagonale ; vous prenez puis jouez d4 pour bâtir le centre.}
1. e4 e5 2. f4 exf4 3. Nf3 g5 4. h4 g4 5. Ne5 Nf6 6. Bc4 {Le fou vise f7, attaqué aussi par le cavalier e5. [%cal Gc4f7,Ge5f7]}
6... d5 7. exd5 Bd6 {Le fou attaque le cavalier e5 et prépare le roque. [%cal Gd6e5]}
(7... Bg7 8. d4 {Le pion soutient le cavalier e5 et libère le fou c1.})
8. d4 {Le pion d4 défend le cavalier e5 et vise la case f4. [%cal Gd4e5,Gc1f4]}
8... Nh5 {Le cavalier défend le pion f4.}
9. O-O O-O 10. Nxg4 {Le cavalier prend le pion g4, qui bloquait votre aile roi. [%cal Ge5g4]}
10... Qxh4 11. Nh2 {Le cavalier rentre en h2 pour couvrir f1 et g4. [%cal Gh2g4]}`,
          conclusion:
            "Dans le Kieseritzky, le fou c4 et le pion d4 tiennent le centre. Après le roque, Nxg4 récupère le pion et la partie est équilibrée.",
        },
        {
          legacyIds: ["kings_gambit-m3"],
          title: "Gambit Philidor : 4.Bc4 Bg7 5.h4",
          eco: "C38",
          kind: "line",
          objectives: [
            "Attaquer la chaîne g5-f4 par h4 quand le fou noir est en g7",
            "Construire le centre d4-c3",
            "Roquer pour ouvrir la colonne f",
          ],
          pgn: `{Avec 4.Bc4, vous visez f7 tout de suite. Si les Noirs défendent g5 par …Bg7 et …h6, le centre d4-c3 et le roque vous rendent l'initiative.}
1. e4 e5 2. f4 exf4 3. Nf3 g5 4. Bc4 Bg7 5. h4 {Le pion attaque la chaîne : …h6 est presque obligatoire. [%cal Gh4g5]}
5... h6
(5... g4 6. Ng5 {Le cavalier attaque f7 avec le fou c4. [%cal Gg5f7,Gc4f7]})
6. d4 d6 7. c3 {Le pion c3 soutient d4 et prépare Qb3 contre f7 et b7. [%cal Gc3d4]}
7... Nc6 8. O-O {Le roque met la tour sur la colonne f, en face du pion f4. [%cal Gf1f4]}
8... Qe7
(8... g4 9. Ne1 {Le cavalier recule ; il reviendra en d3 pour attaquer f4. [%cal Ge1d3]})
9. b4 {Le pion b gagne de l'espace et prépare b5 contre le cavalier c6. [%cal Gb4b5]}`,
          conclusion:
            "Contre la défense Philidor, h4 oblige …h6, puis c3, d4 et le roque préparent la rupture contre la chaîne g5-f4.",
        },
        {
          legacyIds: ["kings_gambit-m2"],
          title: "Gambit Muzio : 4.Bc4 g4 5.O-O",
          eco: "C37",
          kind: "line",
          objectives: [
            "Sacrifier le cavalier f3 pour ouvrir la colonne f",
            "Pousser e5 pour ouvrir la diagonale de la dame",
            "Développer Nc3 et Bd2 avant Rae1",
          ],
          pgn: `{Le Muzio est le plus spectaculaire des gambits : après 4…g4, vous laissez le cavalier f3 en prise et roquez. La dame reprend en f3 et toutes vos pièces visent f7.}
1. e4 e5 2. f4 exf4 3. Nf3 g5 4. Bc4 g4 5. O-O {Le roque abandonne le cavalier f3 : la colonne f va s'ouvrir. [%cal Gf1f7]}
5... gxf3 6. Qxf3 Qf6 {La dame noire défend f7 et le pion f4. [%cal Gf6f7]}
7. e5 {Le pion se sacrifie pour détourner la dame noire de la colonne f. [%cal Ge5f6]}
7... Qxe5 8. d3 Bh6 {Le fou défend le pion f4 contre Bxf4.}
9. Nc3 Ne7 10. Bd2 Nbc6 11. Rae1 {Les deux tours visent e7 et f7 : la dame e5 est menacée. [%cal Ge1e5,Gf3f7]}
11... Qf5 12. Nd5 Kd8 13. Qe2 {La dame et la tour doublent sur la colonne e contre le cavalier e7. [%cal Ge2e7]}`,
          conclusion:
            "Dans le Muzio, la pièce sacrifiée achète un énorme retard de développement noir : Nc3, Bd2 et Rae1 mettent toutes vos pièces en jeu.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Les plans typiques",
      summary:
        "L'Allgaier et le sacrifice en f7, le Kieseritzky 5…d6, la défense Fischer 3…d6 avec 6.Ng1 et la défense moderne 3…d5.",
      stage: "plans",
      lessons: [
        {
          legacyIds: ["kings_gambit-m4"],
          title: "Allgaier : 5.Ng5 h6 6.Nxf7, attaque Thorold",
          eco: "C39",
          kind: "line",
          objectives: [
            "Sacrifier le cavalier en f7 pour exposer le roi",
            "Frapper le centre par d4 sans attendre",
            "Reprendre le pion f4 avec le fou c1",
          ],
          pgn: `{Dans l'Allgaier, le cavalier va en g5 au lieu de e5. Après …h6, il se sacrifie en f7 : le roi noir perd le roque et votre centre d4-e4 compense la pièce.}
1. e4 e5 2. f4 exf4 3. Nf3 g5 4. h4 g4 5. Ng5 h6 6. Nxf7 {Le cavalier se sacrifie : le roi noir doit le prendre. [%cal Gg5f7]}
6... Kxf7 7. d4 {Le pion libère le fou c1, qui va reprendre f4. [%cal Gc1f4]}
7... d5
(7... d6 8. Bxf4 {Le fou reprend le pion et vise la diagonale h2-b8.})
8. Bxf4 {Le pion f4 tombe : deux pions et l'attaque compensent la pièce.}
8... Nf6 9. Nc3 Bb4 10. Be2 {Le fou se développe et prépare le roque : la colonne f visera le roi noir. [%cal Ge1g1,Gf1f7]}`,
          conclusion:
            "L'Allgaier est un sacrifice de pièce : le roi noir perd le roque, et d4 puis Bxf4 vous rendent deux pions et une attaque durable.",
        },
        {
          title: "Kieseritzky : 5…d6 6.Nxg4",
          eco: "C39",
          kind: "line",
          objectives: [
            "Reprendre le pion g4 après 5…d6",
            "Échanger en f6 pour ouvrir le roi noir",
            "Installer un cavalier en d5",
          ],
          pgn: `{Contre 5…d6, le cavalier e5 n'a pas besoin de reculer : il reprend en g4 et le matériel est égal. La partie devient positionnelle, avec un cavalier fort en d5.}
1. e4 e5 2. f4 exf4 3. Nf3 g5 4. h4 g4 5. Ne5 d6 6. Nxg4 {Le cavalier reprend le pion : le matériel est égal. [%cal Ge5g4]}
6... Nf6
(6... Be7 7. d4 Bxh4+ 8. Nf2 {Le cavalier couvre l’échec ; la poussée g3 chassera ensuite le fou h4.})
7. Nxf6+ Qxf6 8. Nc3 {Le cavalier vise d5 et défend e4. [%cal Gc3d5]}
8... Nc6 9. Nd5 {Le cavalier attaque la dame et le pion c7. [%cal Gd5f6,Gd5c7]}
9... Qg6 10. d3 Qg3+ 11. Kd2 {Le roi s’abrite en d2 : la dame g3 est isolée et le cavalier d5 domine.}`,
          conclusion:
            "Contre …d6, Nxg4 rétablit l'égalité matérielle. Le cavalier d5 et la prise sur f4 vous donnent un jeu actif.",
        },
        {
          title: "Défense Fischer : 3…d6 4.d4 g5 5.h4 g4 6.Ng1",
          eco: "C34",
          kind: "line",
          objectives: [
            "Bâtir le centre par 4.d4 contre la défense Fischer",
            "Reculer le cavalier en g1 pour le replacer en e2",
            "Ouvrir la colonne g par g3",
          ],
          pgn: `{La défense Fischer 3…d6 enlève la case e5 au cavalier. Après 4.d4 g5 5.h4 g4, le cavalier recule en g1 : il reviendra en e2 pour soutenir la poussée g3.}
1. e4 e5 2. f4 exf4 3. Nf3 d6 4. d4 {Le centre d4-e4 compense le pion offert. [%cal Gd4e5,Ge4e5]}
4... g5 5. h4 g4 6. Ng1 {Le cavalier recule : il ira en e2, d'où il soutiendra g3. [%cal Gg1e2]}
6... Bh6 7. Nc3 c6 8. Nge2 Qf6 9. g3 {Le pion attaque f4 et ouvre la colonne g. [%cal Gg3f4]}
9... fxg3
(9... f3 10. Nf4 {Le cavalier s'installe en f4, à l'abri des pions noirs. [%cal Gf4h5]})
10. Nxg3 {Le cavalier reprend : le pion g4 est isolé et vos pièces sont actives. [%cal Gg3h5]}`,
          conclusion:
            "Contre la défense Fischer, d4 puis Ng1-e2 et g3 brisent la chaîne de pions noirs. Votre centre reste l'atout principal.",
        },
        {
          title: "Défense moderne : 3…d5 4.exd5 Nf6 5.Bc4",
          eco: "C36",
          kind: "line",
          objectives: [
            "Prendre en d5 puis développer le fou en c4",
            "Roquer avant de reprendre le pion f4",
            "Échanger en d5 pour gagner un temps sur la dame",
          ],
          pgn: `{La défense moderne rend le pion pour se développer vite. Votre plan : Bc4, le roque et d4, puis la reprise du pion f4 par le fou c1.}
1. e4 e5 2. f4 exf4 3. Nf3 d5 4. exd5 Nf6 5. Bc4 {Le fou protège d5 et vise f7. [%cal Gc4f7]}
5... Nxd5 6. O-O {Le roque prépare la tour sur la colonne f, en face de f4. [%cal Gf1f4]}
6... Be7
(6... Be6 7. Bb3 Be7 8. d4 {Le fou b3 garde la pression sur d5 et le centre est fort.})
7. d4 O-O
(7... Be6 8. Bxd5 Bxd5 9. Nc3 {Le cavalier chasse le fou d5 avec gain de temps.})
8. Bxd5 Qxd5 9. Nc3 {Le cavalier attaque la dame : vous gagnez un temps. [%cal Gc3d5]}
9... Qd8 10. Bxf4 {Le pion f4 est repris : le matériel est égal et vos pièces sont mieux placées.}`,
          conclusion:
            "Contre la défense moderne, Bc4, le roque et d4 précèdent la reprise du pion f4. Le temps gagné sur la dame noire vous laisse l'initiative.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Les réponses adverses",
      summary:
        "Le contre-gambit Falkbeer 2…d5 3.exd5 e4, la variante 3…c6, le refus classique 2…Bc5 et les défenses 3…Nf6 et 3…Be7.",
      stage: "responses",
      lessons: [
        {
          title: "Contre-gambit Falkbeer : 3…e4 4.d3",
          eco: "C31",
          kind: "line",
          objectives: [
            "Attaquer le pion avancé e4 par d3",
            "Clouer le cavalier e4 par Qe2",
            "Échanger les dames pour garder le pion d5",
          ],
          pgn: `{Dans le Falkbeer, les Noirs sacrifient un pion pour installer un pion en e4. Le coup d3 le défie immédiatement et votre pion d5 reste un pion de plus.}
1. e4 e5 2. f4 d5 3. exd5 e4 4. d3 {Le pion attaque e4 tout de suite. [%cal Gd3e4]}
4... Nf6 5. dxe4 Nxe4 6. Nf3 Bc5 7. Qe2 {La dame cloue le cavalier e4 contre le roi. [%cal Ge2e8]}
7... Bf5
(7... Qe7 8. Be3 {Le fou bloque la diagonale du fou c5 et prépare Nc3.})
8. Nc3 Qe7 9. Be3 Bxe3 10. Qxe3 Nxc3 11. Qxe7+ Kxe7 12. bxc3 {Les dames sont échangées : vous gardez le pion d5 de plus.}`,
          conclusion:
            "Contre le Falkbeer, d3 attaque le pion e4 et Qe2 cloue le cavalier. Après les échanges, le pion d5 de plus vous reste.",
        },
        {
          title: "Falkbeer : 3…c6 4.Nc3",
          eco: "C30",
          kind: "line",
          objectives: [
            "Garder le pion d5 par Nc3",
            "Prendre le centre par d4",
            "Ouvrir la colonne c par dxc6",
          ],
          pgn: `{Avec 3…c6, les Noirs veulent rouvrir le centre. Le cavalier c3 défend d5, puis le pion d4 occupe le centre pendant que le pion f4 noir reste isolé.}
1. e4 e5 2. f4 d5 3. exd5 c6 4. Nc3 {Le cavalier défend le pion d5. [%cal Gc3d5]}
4... exf4 5. Nf3 Bd6 6. d4 {Le pion prend le centre et libère le fou c1. [%cal Gd4e5,Gc1f4]}
6... Ne7
(6... Nf6 7. Bc4 {Le fou soutient d5 ; le roque suivra.})
7. dxc6 Nbxc6 8. d5 {Le pion chasse le cavalier c6 et gagne de l'espace. [%cal Gd5c6]}`,
          conclusion:
            "Contre 3…c6, Nc3 garde le pion d5 et d4 occupe le centre. Les Noirs n'ont pas le temps de reprendre f4 tranquillement.",
        },
        {
          title: "Refus classique : 2…Bc5 3.Nf3",
          eco: "C30",
          kind: "line",
          objectives: [
            "Préparer d4 par c3 contre le fou c5",
            "Couvrir l'échec en b4 avec le fou d2",
            "Développer le fou en d3 derrière le centre",
          ],
          pgn: `{Le fou c5 empêche le roque en visant g1. Le plan blanc est simple : c3 et d4 pour chasser le fou et prendre le centre.}
1. e4 e5 2. f4 Bc5 {Le fou vise g1 : le roque blanc est gêné. [%cal Gc5g1]}
3. Nf3 d6 4. c3 {Le pion prépare d4 contre le fou c5. [%cal Gc3d4]}
4... Nf6
(4... Bb6 5. d4 exd4 6. cxd4 {Votre centre de pions est complet.})
(4... Bg4 5. fxe5 dxe5 6. Qa4+ {L'échec force …Bd7 et la colonne f est déjà ouverte.} 6... Bd7 7. Qc2 {La dame se replace en c2, d'où elle soutient e4. [%cal Gc2e4]})
5. d4 exd4 6. cxd4 Bb4+ 7. Bd2 Bxd2+ 8. Nbxd2 O-O 9. Bd3 {Le fou soutient e4 : votre centre est solide. [%cal Gd3e4]}`,
          conclusion:
            "Contre 2…Bc5, c3 et d4 chassent le fou et bâtissent le centre. Après l'échange en d2, Bd3 et le roque complètent le développement.",
        },
        {
          title: "3…Nf6 et 3…Be7 : les défenses modestes",
          eco: "C36",
          kind: "line",
          objectives: [
            "Chasser le cavalier f6 par e5",
            "Soutenir e5 par d4",
            "Répondre à …Bh4+ par Kf1",
          ],
          pgn: `{Après 3…Nf6, le pion e5 chasse le cavalier vers h5, une case du bord. Contre 3…Be7, le fou c4 et la poussée e5 suivent le même plan.}
1. e4 e5 2. f4 exf4 3. Nf3 Nf6
(3... Be7 4. Bc4 Nf6 5. e5 {Le pion chasse le cavalier f6, qui part en g4.})
4. e5 {Le pion chasse le cavalier f6. [%cal Ge5f6]}
4... Nh5
(4... Ne4 5. d3 {Le pion chasse le cavalier e4 avec gain de temps.})
5. d4 {Le pion soutient e5 et libère le fou c1. [%cal Gd4e5]}
5... d5
(5... d6 6. Qe2 {La dame défend e5 et prépare la reprise du pion f4.})
6. Be2 {Le fou attaque le cavalier h5, qui défend le pion f4. [%cal Ge2h5]}
6... g6 7. O-O {Le roque met la tour en face de f4. [%cal Gf1f4]}`,
          conclusion:
            "Contre 3…Nf6, e5 et d4 gagnent de l'espace et chassent le cavalier au bord. Le pion f4 tombera après le roque.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Les pièges à connaître",
      summary:
        "Quatre pièges blancs : Nxf7 et Bxf4 dans le Kieseritzky, Nxf4 contre la défense Fischer, Kd1 contre …Bf2+ dans le Falkbeer.",
      stage: "traps",
      lessons: TRAPS,
    },
    // =====================================================================================
    {
      title: "La théorie approfondie",
      summary:
        "Le Kieseritzky avec 9…Qxh4, la défense Fischer avec 6…f5 et 6…Qf6, la défense moderne 6…Be6, et la défense 3…Ne7.",
      stage: "theory",
      lessons: [
        {
          title: "Kieseritzky : 9…Qxh4 10.Qe1",
          eco: "C39",
          kind: "line",
          objectives: [
            "Proposer l'échange des dames par Qe1",
            "Développer le cavalier b1 vers c3",
            "Viser le pion g4 après l'échange",
          ],
          pgn: `{Si les Noirs prennent h4 avant de roquer, la dame e1 force l'échange : sans dames, votre avance de développement compte davantage.}
1. e4 e5 2. f4 exf4 3. Nf3 g5 4. h4 g4 5. Ne5 Nf6 6. Bc4 d5 7. exd5 Bd6 8. d4 Nh5 9. O-O Qxh4 {La dame prend h4 et protège f4.}
10. Qe1 {La dame propose l'échange sur la colonne e. [%cal Ge1h4]}
10... Qxe1 11. Rxe1 O-O 12. Nc3 {Le cavalier soutient d5 ; la tour e1 vise e7. [%cal Gc3d5,Ge1e7]}`,
          conclusion:
            "Contre 9…Qxh4, Qe1 force l'échange des dames. Votre développement et le pion d5 compensent le pion de moins.",
        },
        {
          title: "Défense Fischer : 6…f5 et 6…Qf6",
          eco: "C34",
          kind: "line",
          objectives: [
            "Répondre à …f5 par Nc3",
            "Reprendre le pion f4 avec le fou c1",
            "Placer le cavalier g1 en e2 contre …Qf6",
          ],
          pgn: `{Après 6.Ng1, les Noirs ont d'autres plans que …Bh6. Contre …f5, le cavalier c3 attaque e4 indirectement ; contre …Qf6, le cavalier e2 protège f4 et d4.}
1. e4 e5 2. f4 exf4 3. Nf3 d6 4. d4 g5 5. h4 g4 6. Ng1 f5 {Le pion f attaque le centre blanc. [%cal Gf5e4]}
(6... Qf6 7. Nc3 Ne7 8. Nge2 {Le cavalier e2 défend d4 et attaque f4. [%cal Ge2f4]})
7. Nc3 Nf6 8. Bxf4 {Le fou reprend le pion f4 : votre centre est intact. [%cal Gf4d6]}
8... fxe4 {Les Noirs prennent e4, mais leur roi reste exposé sur la diagonale a2-g8. [%cal Gf1c4,Gc4g8]}`,
          conclusion:
            "Contre les variantes …f5 et …Qf6 de la défense Fischer, Nc3, Nge2 et Bxf4 récupèrent le pion tout en gardant le centre.",
        },
        {
          title: "Défense moderne : 5…Bd6 et 6…Be6",
          eco: "C36",
          kind: "line",
          objectives: [
            "Roquer vite contre …Bd6",
            "Reculer le fou en b3 contre …Be6",
            "Pousser c4 pour chasser le cavalier d5",
          ],
          pgn: `{Dans la défense moderne, les Noirs peuvent défendre f4 par …Bd6 ou soutenir d5 par …Be6. Le roque, puis Bb3 et c4, chassent le cavalier central.}
1. e4 e5 2. f4 exf4 3. Nf3 d5 4. exd5 Nf6 5. Bc4 Nxd5
(5... Bd6 6. O-O O-O {Le fou d6 défend f4 ; votre pion d5 reste un pion de plus.})
6. O-O Be6 7. Bb3 {Le fou garde la pression sur d5. [%cal Gb3d5]}
7... Be7
(7... c5 8. d4 {Le pion d4 ouvre la diagonale du fou c1 vers f4.})
8. c4 {Le pion chasse le cavalier d5. [%cal Gc4d5]}`,
          conclusion:
            "Contre …Be6 dans la défense moderne, Bb3 puis c4 chassent le cavalier d5. Le pion f4 reste une cible pour le fou c1.",
        },
        {
          title: "3…Ne7 : d4, Nc3 et Nxe4",
          eco: "C35",
          kind: "line",
          objectives: [
            "Prendre le centre par d4 contre …Ne7",
            "Recentraliser le cavalier par Nxe4",
            "Développer le fou en d3 vers h7",
          ],
          pgn: `{Le cavalier e7 prépare …d5 et …Ng6. Vous répondez par d4 puis Nc3, et votre cavalier reprend au centre en e4.}
1. e4 e5 2. f4 exf4 3. Nf3 Ne7 4. d4 d5
(4... Ng6 5. Bc4 {Le fou vise f7, que le cavalier g6 ne défend pas.})
5. Nc3 dxe4 6. Nxe4 Nd5
(6... Ng6 7. h4 {Le pion h menace h5 contre le cavalier g6. [%cal Gh4h5]})
7. Bd3 {Le fou vise h7 et soutient le cavalier e4. [%cal Gd3h7]}`,
          conclusion:
            "Contre 3…Ne7, d4 puis Nc3 et Nxe4 vous donnent un centre actif. Le fou d3 vise le roque noir.",
        },
      ],
    },
  ],
};
