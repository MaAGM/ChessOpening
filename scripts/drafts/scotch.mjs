// Brouillon de la Masterclass « Partie écossaise » (côté Blancs) : 1.e4 e5 2.Nf3 Nc6 3.d4.
// Répertoire : 4.Nxd4 avec la variante Mieses 5.Nxc6 contre 4…Nf6, 5.Be3 contre la classique
// 4…Bc5, 5.Nb5 contre la Steinitz 4…Qh4, et le gambit Göring 4.c3 comme arme de surprise.
// Les flèches du coup à jouer sont ajoutées par scripts/course-builder.mjs ; celles écrites ici
// illustrent une idée (cible, manœuvre, menace).
import { TRAPS } from "./scotch-traps.mjs";

const P = "1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Nxd4";

export default {
  id: "scotch",
  name: "Partie écossaise",
  description:
    "1.e4 e5 2.Nf3 Nc6 3.d4 : les Blancs ouvrent le centre dès le troisième coup et obtiennent un jeu clair et actif. Un répertoire complet côté Blancs avec la variante Mieses, la classique 4…Bc5, la Steinitz 4…Qh4, le gambit Göring, les réponses secondaires, pièges et grandes lignes.",
  side: "white",
  eco: ["C44", "C45"],
  chapters: [
    // =====================================================================================
    {
      title: "Les fondations",
      summary:
        "Pourquoi 3.d4, la variante Mieses 5.Nxc6 bxc6 6.e5 avec ses deux réponses 8…Ba6 et 8…Nb6, et la classique 4…Bc5 5.Be3.",
      stage: "foundations",
      lessons: [
        {
          legacyIds: ["scotch-m1"],
          title: "3.d4 exd4 4.Nxd4 : ouvrir le centre",
          eco: "C45",
          kind: "concept",
          objectives: [
            "Échanger le pion d contre le pion e noir",
            "Centraliser le cavalier en d4",
            "Gagner de l'espace par e5 contre …Nf6",
          ],
          pgn: `{L'Écossaise règle la question du centre tout de suite : après l'échange en d4, votre pion e4 reste seul au centre et vos pièces se développent librement.}
1. e4 e5 2. Nf3 Nc6 3. d4 {Le pion attaque e5 et ouvre la diagonale du fou c1. [%cal Gd4e5,Gc1h6]}
3... exd4 4. Nxd4 {Le cavalier reprend et domine le centre. [%cal Gd4c6,Gd4f5]}
4... Nf6
(4... Bc5 5. Be3 {Le fou neutralise le fou c5 et soutient le cavalier d4. [%cal Ge3c5]})
5. Nxc6 bxc6 6. e5 {Le pion chasse le cavalier f6 et gagne de l'espace. [%cal Ge5f6]}
6... Qe7 7. Qe2 {La dame défend e5 et cloue le pion e7 sur la colonne. [%cal Ge2e5]}
7... Nd5 8. c4 {Le pion chasse le cavalier d5 du centre. [%cal Gc4d5]}`,
          conclusion:
            "L'Écossaise ouvre le centre dès 3.d4. Contre 4…Nf6, l'échange en c6 puis e5 et c4 chassent le cavalier noir et vous donnent l'espace.",
        },
        {
          title: "Mieses : 8…Ba6 9.b3 et le fianchetto",
          eco: "C45",
          kind: "line",
          objectives: [
            "Défendre c4 par b3 contre le fou a6",
            "Fianchotter les deux fous",
            "Simplifier en finale par cxd5",
          ],
          pgn: `{Après 8…Ba6, le fou cloue le pion c4 contre votre dame. Le coup b3 le soutient, puis vos deux fous se placent en fianchetto pour viser le roque noir et le pion e5.}
${P} Nf6 5. Nxc6 bxc6 6. e5 Qe7 7. Qe2 Nd5 8. c4 Ba6 {Le fou cloue le pion c4 contre la dame e2. [%cal Ga6c4,Gc4e2]}
9. b3 {Le pion soutient c4 : le cavalier d5 doit bouger. [%cal Gb3c4]}
9... g6 10. g3 Bg7 11. Bb2 O-O 12. Bg2 {Le fou g2 vise le cavalier d5 et le pion c6. [%cal Gg2c6]}
12... Rae8 13. O-O Bxe5 {Les Noirs récupèrent le pion e5 par une combinaison.}
14. Bxe5 Qxe5 15. Qxe5 Rxe5 16. cxd5 Bxf1 17. Kxf1 {Après la cascade d’échanges, vous avez deux pièces mineures contre une tour et un pion : la finale est équilibrée.}`,
          conclusion:
            "Contre 8…Ba6, b3 et le double fianchetto mettent la pression sur d5 et e5. La ligne principale mène à une finale où votre fou g2 vaut la qualité.",
        },
        {
          title: "Mieses : 8…Nb6 9.Nc3 Qe6 10.Qe4",
          eco: "C45",
          kind: "line",
          objectives: [
            "Développer le cavalier c3 contre …Nb6",
            "Centraliser la dame en e4",
            "Soutenir e5 par f4",
          ],
          pgn: `{Avec 8…Nb6, le cavalier noir recule mais vise c4. Votre cavalier c3 et la dame e4 gardent le pion e5, puis la poussée f4 le soutient durablement.}
${P} Nf6 5. Nxc6 bxc6 6. e5 Qe7 7. Qe2 Nd5 8. c4 Nb6 9. Nc3 {Le cavalier contrôle d5 et e4. [%cal Gc3d5]}
9... Qe6
(9... a5 10. Qe4 {La dame se centralise et vise c6. [%cal Ge4c6]})
(9... Bb7 10. Bd2 {Le fou prépare le grand roque et libère la colonne d.})
10. Qe4 {La dame défend e5 et attaque c6. [%cal Ge4e5,Ge4c6]}
10... g6 11. Bd3 Bg7 12. f4 {Le pion f soutient e5 contre la pression du fou g7. [%cal Gf4e5,Gg7e5]}
12... O-O 13. O-O {Les deux roques sont faits : vous gardez plus d'espace grâce à e5.}`,
          conclusion:
            "Contre 8…Nb6, Nc3, Qe4 et f4 tiennent le pion e5. Votre avance d'espace donne un jeu agréable.",
        },
        {
          legacyIds: ["scotch-m2"],
          title: "Classique : 4…Bc5 5.Be3 Qf6 6.c3",
          eco: "C45",
          kind: "line",
          objectives: [
            "Protéger le cavalier d4 par Be3 et c3",
            "Développer le fou en c4 puis e2",
            "Jouer f3 pour bloquer le fou g4",
          ],
          pgn: `{Contre 4…Bc5, les Noirs attaquent votre cavalier d4. Be3 et c3 le soutiennent solidement ; le roque et f3 consolident ensuite votre centre.}
${P} Bc5 5. Be3 Qf6 {La dame attaque le cavalier d4 une deuxième fois. [%cal Gf6d4,Gc5d4]}
6. c3 {Le pion c3 défend d4 une troisième fois. [%cal Gc3d4]}
6... Nge7
(6... Qg6 7. Nd2 {Le cavalier couvre e4 et prépare Nf3. [%cal Gd2f3]})
7. Bc4 Ne5 8. Be2 {Le fou recule devant le cavalier e5 et laisse la case f3 libre. [%cal Ge2f3]}
8... Qg6 9. O-O d6 10. f3 {Le pion f3 protège e4 et enlève la case g4 au fou c8. [%cal Gf3e4,Gf3g4]}
10... O-O 11. Nd2 d5 12. Kh1 {Le roi quitte la diagonale du fou c5. [%cal Gc5g1]}`,
          conclusion:
            "Contre la classique, Be3 et c3 neutralisent la pression sur d4. Après f3 et Kh1, votre position est solide et prête pour l'expansion à l'aile dame.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Les plans typiques",
      summary:
        "Les autres idées noires dans la Mieses, la classique avec 7…O-O et 7…b6, et le gambit Göring 4.c3.",
      stage: "plans",
      lessons: [
        {
          title: "Mieses : 9…O-O-O, 9…Qh4 et 9…g5",
          eco: "C45",
          kind: "line",
          objectives: [
            "Garder le plan g3 et Bb2 contre le grand roque",
            "Répondre à …Qh4 par a3",
            "Ne pas céder le pion e5",
          ],
          pgn: `{Après 9.b3, les Noirs ont d'autres plans que …g6. Votre structure ne change pas : g3, Bb2 et Bg2 visent le cavalier d5 et le roi noir.}
${P} Nf6 5. Nxc6 bxc6 6. e5 Qe7 7. Qe2 Nd5 8. c4 Ba6 9. b3 O-O-O {Le roi noir part à l'aile dame et la tour vise d2. [%cal Gd8d2]}
(9... Qh4 10. a3 {Le pion a3 enlève la case b4 à la dame et au fou f8. [%cal Ga3b4]})
(9... g5 10. g3 Bg7 11. Bb2 {Le fou défend e5 contre le fou g7. [%cal Gb2e5]})
10. g3 g5 11. Bb2 {Le fou b2 soutient e5 et vise h8. [%cal Gb2h8]}`,
          conclusion:
            "Quelle que soit la réponse noire après 9.b3, g3 et Bb2 gardent le pion e5 et préparent Bg2 contre le cavalier d5.",
        },
        {
          title: "Classique : 7…O-O 8.O-O Bb6 9.Na3",
          eco: "C45",
          kind: "line",
          objectives: [
            "Développer le cavalier b1 par a3",
            "Sauter en b5 pour attaquer c7 et d6",
            "Prendre en d6 quand le pion est faible",
          ],
          pgn: `{Si les Noirs roquent au lieu de jouer …Ne5, votre cavalier b1 passe par a3 : il ira en c2 ou en b5, où il attaque les cases faibles c7 et d6.}
${P} Bc5 5. Be3 Qf6 6. c3 Nge7 7. Bc4 O-O 8. O-O Bb6 {Le fou garde la diagonale a7-g1. [%cal Gb6g1]}
9. Na3 {Le cavalier vise b5 et c2. [%cal Ga3b5,Ga3c2]}
9... d6 10. Ndb5 {Le cavalier d4 saute en b5 : il attaque d6 et c7. [%cal Gb5d6,Gb5c7]}
10... a6 11. Nxd6 {Le cavalier prend d6 : …cxd6 laisserait le fou b6 sans défense. [%cal Ge3b6]}`,
          conclusion:
            "Contre 7…O-O, Na3 et Ndb5 visent le pion d6. Quand il manque de défenseurs, Nxd6 gagne un pion.",
        },
        {
          title: "Classique : 7…b6 et 7…d6",
          eco: "C45",
          kind: "line",
          objectives: [
            "Pousser f4 quand le fou noir est en b7",
            "Échanger en c6 contre …d6",
            "Garder le fou c5 en vue",
          ],
          pgn: `{Avec 7…b6, les Noirs préparent …Bb7 et le grand roque. La poussée f4 gagne alors de l'espace au centre et menace e5.}
${P} Bc5 5. Be3 Qf6 6. c3 Nge7 7. Bc4 b6
(7... d6 8. O-O O-O 9. Nxc6 Nxc6 10. Bxc5 {Après …dxc5, les Noirs auront des pions doublés sur la colonne c.})
8. O-O Bb7 9. f4 {Le pion menace e5 contre la dame f6. [%cal Gf4e5,Ge5f6]}
9... O-O-O 10. Qd2 {La dame relie les tours et prépare b4 contre le roi noir. [%cal Gb2b4]}`,
          conclusion:
            "Contre 7…b6, f4 gagne du terrain au centre. Si le roi noir part à l'aile dame, b4 et a4 ouvrent des lignes contre lui.",
        },
        {
          legacyIds: ["scotch-m4"],
          title: "Gambit Göring : 4.c3 dxc3 5.Nxc3",
          eco: "C44",
          kind: "line",
          objectives: [
            "Sacrifier le pion c pour un développement rapide",
            "Viser f7 avec le fou c4 et la dame b3",
            "Attaquer le cavalier e5 par f4",
          ],
          pgn: `{Le gambit Göring offre un pion : après …dxc3 Nxc3, vos pièces sont toutes développées pendant que les Noirs doivent défendre f7.}
1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. c3 {Le pion c s'offre pour accélérer le développement. [%cal Gc3d4]}
4... dxc3 5. Nxc3 d6
(5... Bb4 6. Bc4 d6 7. O-O Bxc3 8. bxc3 {La paire de fous et la colonne b compensent le pion.})
6. Bc4 Nf6
(6... Be6 7. Bxe6 fxe6 8. Qb3 {La dame attaque e6 et b7 en même temps. [%cal Gb3e6,Gb3b7]})
7. Qb3 {La dame et le fou visent f7. [%cal Gb3f7,Gc4f7]}
7... Qd7 8. Ng5 Ne5 9. Bb5 {Le fou attaque la dame d7 et oblige les Noirs à jouer …c6. [%cal Gb5d7]}
9... c6 10. f4 {Le pion chasse le cavalier e5, défenseur de f7. [%cal Gf4e5]}`,
          conclusion:
            "Le Göring échange un pion contre l'initiative. Qb3, Ng5 et f4 harcèlent la case f7 et le cavalier e5.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Les réponses adverses",
      summary:
        "La Steinitz 4…Qh4, l'échec 4…Bb4+, les échanges 4…Nxd4 et 4…Qf6, et les fianchettos 4…g6 et 4…d6.",
      stage: "responses",
      lessons: [
        {
          legacyIds: ["scotch-m3"],
          title: "Steinitz : 4…Qh4 5.Nb5",
          eco: "C45",
          kind: "line",
          objectives: [
            "Menacer Nxc7+ par Nb5",
            "Répondre à …Bb4+ par Bd2",
            "Donner le pion e4 pour gagner du temps",
          ],
          pgn: `{La dame h4 attaque e4. Au lieu de le défendre, vous sautez en b5 : la menace Nxc7+ oblige les Noirs à réagir.}
${P} Qh4 5. Nb5 {Le cavalier menace la fourchette en c7. [%cal Gb5c7]}
5... Bb4+
(5... Bc5 6. Qe2 {La dame défend e4 et f2. [%cal Ge2e4]})
(5... Qxe4+ 6. Be2 Kd8 7. O-O {Le roi noir ne peut plus roquer : votre développement compense le pion.})
6. Bd2 Qxe4+ 7. Be2 Kd8 8. O-O {Vous avez donné un pion, mais le roi noir est bloqué au centre. [%cal Gf1e1]}
8... Bxd2 9. Nxd2 {Le cavalier reprend et menace Nc4 ou Re1 contre la dame. [%cal Gd2c4]}`,
          conclusion:
            "Contre la Steinitz, Nb5 et Bd2 cèdent le pion e4 contre un grand retard de développement noir et un roi resté en d8.",
        },
        {
          title: "4…Bb4+ 5.c3",
          eco: "C45",
          kind: "line",
          objectives: [
            "Chasser le fou par c3",
            "Sauter en f5 contre …Bb6",
            "Échanger en c6 puis e5 contre …Be7",
          ],
          pgn: `{L'échec 4…Bb4+ perd du temps : après c3, le fou doit reculer. Contre …Bc5, votre Be3 et le saut Nf5 reprennent l'initiative.}
${P} Bb4+ 5. c3 Bc5
(5... Be7 6. Bc4 Nf6 7. Nxc6 bxc6 8. e5 {Le pion chasse le cavalier f6. [%cal Ge5f6]})
6. Be3 Bb6 7. Nf5 {Le cavalier attaque g7 et vise d6. [%cal Gf5g7,Gf5d6]}
7... Bxe3
(7... g6 8. Bxb6 axb6 9. Ne3 {Le cavalier rentre en e3, d'où il contrôle d5.})
8. Nxe3 Nf6 9. f3 {Le pion f3 protège e4 : votre centre reste solide. [%cal Gf3e4]}`,
          conclusion:
            "Contre 4…Bb4+, c3 gagne un temps. Le saut Nf5 provoque des échanges qui vous laissent un centre stable.",
        },
        {
          title: "4…Nxd4 et 4…Qf6",
          eco: "C45",
          kind: "line",
          objectives: [
            "Reprendre en d4 avec la dame",
            "Pousser e5 contre la dame f6",
            "Transposer dans la classique contre 4…Qf6",
          ],
          pgn: `{L'échange 4…Nxd4 amène votre dame au centre. Après …Qf6, la poussée e5 la chasse et vous gardez l'avantage d'espace.}
${P} Nxd4
(4... Qf6 5. Be3 Bc5 6. c3 {Par interversion, on retrouve la classique. [%cal Gc3d4]})
5. Qxd4 Qf6
(5... Ne7 6. Bc4 Nc6 7. Qd5 {La dame attaque f7 avec le fou c4. [%cal Gd5f7,Gc4f7]})
6. e5 {Le pion chasse la dame f6. [%cal Ge5f6]}
6... Qb6 7. Qxb6 axb6 8. Nc3 {Le cavalier vise b5 et d5 : votre pion e5 donne de l'espace en finale. [%cal Gc3b5,Gc3d5]}`,
          conclusion:
            "Contre 4…Nxd4, la dame d4 domine le centre. Contre 4…Qf6, Be3 et c3 transposent dans la classique.",
        },
        {
          title: "4…g6 et 4…d6 : les réponses lentes",
          eco: "C45",
          kind: "line",
          objectives: [
            "Développer Nc3 et Be3 contre le fianchetto",
            "Échanger en c6 puis pousser e5",
            "Clouer le cavalier c6 par Bb5 contre …d6",
          ],
          pgn: `{Contre 4…g6, le fou g7 vise d4. Échangez en c6, puis e5 repousse le cavalier f6 et coupe la diagonale du fou.}
${P} g6
(4... d6 5. Nc3 Nf6 6. Bb5 Bd7 7. O-O Be7 8. Re1 {La tour soutient e4 : vous gardez plus d'espace. [%cal Ge1e4]})
5. Nc3 Bg7 6. Be3 Nf6 7. Nxc6 bxc6 8. e5 {Le pion chasse le cavalier et ferme la diagonale du fou g7. [%cal Ge5f6,Gg7e5]}
8... Ng8 9. f4 {Le pion f soutient e5 : le fou g7 reste muré. [%cal Gf4e5]}`,
          conclusion:
            "Contre les réponses lentes, Nc3 et Be3 suffisent. Contre le fianchetto, e5 et f4 enferment le fou g7.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Les pièges à connaître",
      summary: "Quatre pièges blancs : cxd5 contre 7…Qe7? dans la Mieses, Bxc5 et Qd4 contre 10…Qb6?, f4 contre 7…Qe5? dans la Steinitz, Bxf7+ dans le Göring.",
      stage: "traps",
      lessons: TRAPS,
    },
    // =====================================================================================
    {
      title: "La théorie approfondie",
      summary:
        "La Steinitz avec 7…Qxg2, les déviations 6…Nd5 et 6…Ne4 de la Mieses, la classique après 12.Kh1 et la Mieses 8…Nb6 avec 10…d5 et 10…Bb4.",
      stage: "theory",
      lessons: [
        {
          legacyIds: ["scotch-m5"],
          title: "Steinitz : 7…Qxg2 8.Bf3",
          eco: "C45",
          kind: "line",
          objectives: [
            "Attaquer la dame g2 par Bf3",
            "Prendre en c7 avec échec",
            "Chasser la tour a8 ou la dame",
          ],
          pgn: `{Si la dame noire mange aussi g2, elle s'expose : Bf3 la chasse avec gain de temps, puis Nxc7+ gagne la tour a8.}
${P} Qh4 5. Nb5 Bb4+ 6. Bd2 Qxe4+ 7. Be2 Qxg2 {La dame prend un deuxième pion et attaque h1. [%cal Gg2h1]}
8. Bf3 {Le fou attaque la dame et protège la tour h1. [%cal Gf3g2]}
8... Qg5 9. Nxc7+ {Le cavalier prend avec échec et fourche la tour a8. [%cal Gc7a8,Gc7e8]}
9... Kd8 10. Nxa8 {Vous gagnez la tour : le cavalier a8 sortira par b6 ou c7.}`,
          conclusion:
            "Dans la Steinitz, …Qxg2 est trop gourmand : Bf3 chasse la dame et Nxc7+ gagne la tour a8.",
        },
        {
          title: "Mieses : 6…Nd5 et 6…Ne4",
          eco: "C45",
          kind: "line",
          objectives: [
            "Chasser le cavalier d5 par c4",
            "Attaquer f7 et c6 par Qf3 contre …Ne4",
            "Garder le pion e5 sans la dame e2",
          ],
          pgn: `{Sans …Qe7, les Noirs placent leur cavalier en d5 ou e4. Vous gagnez du temps contre lui avant de protéger le pion e5.}
${P} Nf6 5. Nxc6 bxc6 6. e5 Nd5
(6... Ne4 7. Qf3 {La dame attaque le cavalier e4 et le pion f7. [%cal Gf3e4,Gf3f7]} 7... Ng5 8. Qg3 {La dame chasse encore le cavalier en visant g7.})
7. c4 Nb6 8. Bd3 {Le fou se développe et vise h7. [%cal Gd3h7]}`,
          conclusion:
            "Contre 6…Nd5 ou 6…Ne4, chaque coup de cavalier noir vous laisse développer une pièce avec gain de temps.",
        },
        {
          title: "Classique : 12.Kh1 dxe4 13.fxe4",
          eco: "C45",
          kind: "line",
          objectives: [
            "Reprendre en e4 avec le pion f",
            "Chasser le fou g4 par Bf4",
            "Répondre à 8…d5 par le roque puis f4",
          ],
          pgn: `{Après 12.Kh1 dxe4, la reprise fxe4 ouvre la colonne f pour votre tour. Le fou e3 va en f4 pour viser le cavalier e5.}
${P} Bc5 5. Be3 Qf6 6. c3 Nge7 7. Bc4 Ne5 8. Be2 Qg6
(8... d5 9. O-O O-O 10. f4 {Le pion chasse le cavalier e5. [%cal Gf4e5]} 10... N5c6 11. e5 {Le pion gagne de l'espace et ferme la diagonale de la dame.})
9. O-O d6 10. f3 O-O 11. Nd2 d5 12. Kh1 dxe4 13. fxe4 Bg4 14. Bf4 {Le fou attaque le cavalier e5 et quitte la diagonale du fou c5. [%cal Gf4e5]}`,
          conclusion:
            "Dans la classique, fxe4 ouvre la colonne f et Bf4 frappe le cavalier e5. Votre centre e4 et la tour f1 vous donnent l'initiative.",
        },
        {
          title: "Mieses 8…Nb6 : 10…d5, 10…Bb4 et 10…Ba6",
          eco: "C45",
          kind: "line",
          objectives: [
            "Prendre en passant contre …d5",
            "Répondre à …Bb4 par Bd2",
            "Défendre c4 par b3 contre …Ba6",
          ],
          pgn: `{Après 10.Qe4, les Noirs peuvent attaquer le centre par …d5, clouer par …Bb4 ou viser c4 par …Ba6. Chacune a sa réponse précise.}
${P} Nf6 5. Nxc6 bxc6 6. e5 Qe7 7. Qe2 Nd5 8. c4 Nb6 9. Nc3 Qe6 10. Qe4 d5
(10... Bb4 11. Bd2 {Le fou défait le clouage du cavalier c3.})
(10... Ba6 11. b3 {Le pion soutient c4 contre le fou a6. [%cal Gb3c4]})
11. exd6 cxd6 12. Bd3 {Le fou se développe avec une menace sur h7 ; le pion d6 est isolé. [%cal Gd3h7]}`,
          conclusion:
            "Contre les déviations du 10e coup, exd6, Bd2 ou b3 suffisent : vous gardez une structure saine et des cibles en c6 et d6.",
        },
      ],
    },
  ],
};
