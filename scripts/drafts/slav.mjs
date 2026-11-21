// Brouillon de la Masterclass « Défense slave » (côté Noirs) : 1.d4 d5 2.c4 c6.
// Répertoire : 3…Nf6 et 4…dxc4 avec 5…Bf5 contre 4.Nc3 (variante centrale 6.Ne5 e6 7.f3 Bb4,
// variante hollandaise 6.e3 e6 7.Bxc4 Bb4), la Semi-Slave Meran 4…e6 contre 4.e3,
// et les réponses aux échanges et aux sorties de dame.
// Les flèches du coup à jouer sont ajoutées par scripts/course-builder.mjs ; celles écrites ici
// illustrent une idée (cible, manœuvre, menace).
import { TRAPS } from "./slav-traps.mjs";

const S = "1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 dxc4 5. a4 Bf5";
const ME = "1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. e3 e6 5. Nc3 Nbd7";

export default {
  id: "slav",
  name: "Défense slave",
  description:
    "1.d4 d5 2.c4 c6 : les Noirs soutiennent d5 avec le pion c et gardent la diagonale du fou c8. Un répertoire complet côté Noirs avec la Slave 4…dxc4 5…Bf5, la Semi-Slave Meran contre 4.e3, les réponses à l'échange et aux sorties de dame, pièges et grandes lignes.",
  side: "black",
  eco: ["D10", "D11", "D15", "D16", "D17", "D18", "D19", "D45", "D47", "D48", "D49"],
  chapters: [
    // =====================================================================================
    {
      title: "Les fondations",
      summary:
        "Pourquoi 2…c6, la prise 4…dxc4 suivie de 5…Bf5, la variante centrale 6.Ne5, la hollandaise 6.e3 et la Meran contre 4.e3.",
      stage: "foundations",
      lessons: [
        {
          legacyIds: ["slav-m1"],
          title: "2…c6 et 4…dxc4 : le fou c8 avant …e6",
          eco: "D15",
          kind: "concept",
          objectives: [
            "Soutenir d5 avec le pion c sans enfermer le fou c8",
            "Prendre en c4 quand le cavalier c3 ne contrôle plus e4",
            "Développer le fou en f5 avant de jouer …e6",
          ],
          pgn: `{La Slave défend d5 avec le pion c : la diagonale du fou c8 reste ouverte. Après 4.Nc3, la prise en c4 oblige les Blancs à jouer a4 pour récupérer le pion.}
1. d4 d5 2. c4 c6 {Le pion c6 soutient d5 et laisse la diagonale c8-h3 libre. [%cal Gc6d5,Gc8h3]}
3. Nf3
(3. Nc3 Nf6 4. Nf3 dxc4 {Même position par une autre suite de coups.})
3... Nf6 4. Nc3 dxc4 {Le pion prend en c4 : les Blancs doivent prendre du temps pour le récupérer. [%cal Gd5c4]}
5. a4 {Le coup a4 empêche …b5, qui aurait gardé le pion c4. [%cal Ga4b5]}
5... Bf5 {Le fou sort avant que …e6 ne l'enferme. [%cal Gf5b1]}
6. e3 e6 7. Bxc4 Bb4 {Le fou cloue le cavalier c3 et prépare le roque. [%cal Gb4c3]}
8. O-O O-O {Les deux fous noirs sont actifs : la structure c6-e6 est solide.}`,
          conclusion:
            "La Slave règle le problème du fou c8 : il sort en f5 avant …e6. Le pion c4 est rendu, mais en échange les Blancs ont affaibli b4 avec a4.",
        },
        {
          legacyIds: ["slav-m2"],
          title: "Variante centrale : 6.Ne5 e6 7.f3 Bb4",
          eco: "D17",
          kind: "concept",
          objectives: [
            "Répondre à Ne5 par …e6 et …Bb4",
            "Sacrifier une pièce en e4 contre trois pions",
            "Mettre le roi blanc à découvert au centre",
          ],
          pgn: `{Avec Ne5 et f3, les Blancs préparent e4 pour chasser le fou f5. La réponse principale est un sacrifice de pièce en e4 qui met le roi blanc à nu.}
${S} 6. Ne5 e6 7. f3 Bb4 {Le fou cloue le cavalier c3 et prépare le sacrifice en e4. [%cal Gb4c3,Gb4e1]}
8. e4 Bxe4 {Le fou prend : le cavalier f6 suivra en e4. [%cal Gf5e4]}
9. fxe4 Nxe4 {Deux pions pour la pièce, et la menace …Qh4+ plane. [%cal Gd8h4]}
10. Bd2 Qxd4 {Troisième pion, et le cavalier e4 est défendu. [%cal Gd4f2]}
11. Nxe4 Qxe4+ 12. Qe2 Bxd2+ 13. Kxd2 Qd5+ {Échec : le roi blanc ne peut pas se cacher. [%cal Gd5d2]}
14. Kc2 Na6 {Le cavalier vise b4 et attaque la case c5. [%cal Ga6b4]}`,
          conclusion:
            "Dans la variante centrale, …Bxe4 et …Nxe4 donnent trois pions pour la pièce. Le roi blanc reste exposé et vos pions centraux avancent.",
        },
        {
          legacyIds: ["slav-m5"],
          title: "Variante hollandaise : 6.e3 e6 7.Bxc4 Bb4",
          eco: "D19",
          kind: "concept",
          objectives: [
            "Clouer le cavalier c3 avec …Bb4",
            "Retirer le fou en g6 avant Ne5 ou Nh4",
            "Reprendre de h7 pour ouvrir la colonne h",
          ],
          pgn: `{Dans la variante hollandaise, les Blancs récupèrent le pion c4 tout de suite. Votre fou b4 et votre fou f5 occupent leurs meilleures diagonales.}
${S} 6. e3 e6 7. Bxc4 Bb4 8. O-O O-O 9. Qe2 {La dame prépare e4 pour chasser le fou f5. [%cal Ge3e4]}
9... Bg6 {Le fou recule avant e4 et reste sur la diagonale b1-h7. [%cal Gg6b1]}
10. Ne5 Nbd7 {Le cavalier défie celui de e5. [%cal Gd7e5]}
11. Nxg6 hxg6 {La colonne h s'ouvre pour votre tour. [%cal Gh8h1]}
12. Rd1 Qa5 {La dame vise le cavalier c3 cloué et la case a4. [%cal Ga5c3,Ga5a4]}`,
          conclusion:
            "Dans la hollandaise, …Bb4 et …Bg6 placent vos fous à l'abri. La prise hxg6 renforce le roque et ouvre la colonne h.",
        },
        {
          legacyIds: ["slav-m3"],
          title: "Meran : 4.e3 e6 et 7…b5",
          eco: "D49",
          kind: "concept",
          objectives: [
            "Répondre à 4.e3 par la Semi-Slave …e6",
            "Prendre en c4 quand le fou blanc a bougé",
            "Gagner du temps avec …b5 sur le fou c4",
          ],
          pgn: `{Contre 4.e3, le fou c1 blanc est enfermé : vous pouvez jouer …e6 sans complexe. La Meran gagne de l'espace avec …b5 après la prise en c4.}
1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. e3 e6 {La structure c6-d5-e6 est un bloc solide. [%cal Gd5e4]}
5. Nc3 Nbd7 6. Bd3 dxc4 {Vous prenez au moment où le fou d3 doit reprendre : il perd un temps. [%cal Gd5c4]}
7. Bxc4 b5 {Le pion chasse le fou et gagne de l'espace à l'aile dame. [%cal Gb5c4]}
8. Bd3 Bb7 {Le fou rejoint la grande diagonale pour soutenir …c5. [%cal Gb7d5]}
9. O-O a6 10. e4 c5 {La poussée …c5 frappe le centre blanc. [%cal Gc5d4]}`,
          conclusion:
            "Dans la Meran, …dxc4 puis …b5 fait perdre un temps au fou blanc. Le fou b7 et la poussée …c5 frappent alors le centre.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Les plans",
      summary:
        "La Meran Wade 9.e4 b4 10.Na4 c5, la Meran 11.d5 Qc7, la centrale 8.Nxc4 O-O et la hollandaise 9.Nh4.",
      stage: "plans",
      lessons: [
        {
          legacyIds: ["slav-m4"],
          title: "Meran Wade : 9.e4 b4 10.Na4 c5",
          eco: "D47",
          kind: "line",
          objectives: [
            "Chasser le cavalier c3 avec …b4",
            "Frapper d4 avec …c5 et …cxd4",
            "Installer le cavalier en d5",
          ],
          pgn: `{Si les Blancs poussent e4 avant de roquer, …b4 chasse le cavalier c3 vers le bord. La poussée …c5 ouvre ensuite le centre.}
${ME} 6. Bd3 dxc4 7. Bxc4 b5 8. Bd3 Bb7 9. e4 b4 {Le pion chasse le cavalier qui défend e4. [%cal Gb4c3]}
10. Na4 c5 {Le pion frappe d4 et ouvre la diagonale du fou b7. [%cal Gc5d4]}
11. e5 Nd5 {Le cavalier s'installe sur la case libérée par le pion d5. [%cal Gd5b4]}
12. O-O cxd4 {Vous prenez le pion d4 : le centre blanc se disloque. [%cal Gc5d4]}
13. Re1 g6 {Le fou f8 ira en g7 pour viser le pion e5. [%cal Gf8g7]}`,
          conclusion:
            "Dans la Wade, …b4 chasse le cavalier c3 vers a4. Les poussées …c5 et …cxd4 donnent la case d5 à votre cavalier.",
        },
        {
          title: "Meran : 11.d5 Qc7 et la prise en e6",
          eco: "D48",
          kind: "line",
          objectives: [
            "Clouer le pion d5 avec la dame c7",
            "Reprendre en e6 avec le pion f",
            "Utiliser la colonne f à demi ouverte",
          ],
          pgn: `{Après 10.e4 c5, les Blancs avancent le pion en d5. La dame c7 soutient votre jeu au centre, et la reprise …fxe6 donne la colonne f.}
${ME} 6. Bd3 dxc4 7. Bxc4 b5 8. Bd3 Bb7 9. O-O a6 10. e4 c5 11. d5 Qc7 {La dame protège c5 et vise h2 par la diagonale. [%cal Gc7h2]}
12. dxe6 fxe6 {Le pion reprend vers le centre et ouvre la colonne f. [%cal Gf8f1]}
13. Bc2 c4 {Le pion gagne de l'espace et libère la case c5. [%cal Gc4d3]}`,
          conclusion:
            "Contre 11.d5, la dame c7 tient la position. Après dxe6 fxe6, votre majorité centrale et la colonne f compensent le pion e6 isolé.",
        },
        {
          title: "Centrale : 8.Nxc4 O-O 9.Kf2 c5",
          eco: "D17",
          kind: "line",
          objectives: [
            "Roquer quand les Blancs renoncent à e4",
            "Frapper le centre par …c5",
            "Profiter du roi blanc en f2",
          ],
          pgn: `{Si les Blancs reprennent en c4 au lieu de jouer e4, ils doivent encore régler la sécurité de leur roi. La poussée …c5 ouvre le jeu avant qu'il ne soit à l'abri.}
${S} 6. Ne5 e6 7. f3 Bb4 8. Nxc4 O-O 9. Kf2 {Le roi s'écarte du clouage en e1 pour préparer e4. [%cal Gf2e1]}
9... c5 {La poussée frappe d4 et ouvre la colonne c. [%cal Gc5d4]}
10. e4 Bg6 {Le fou recule et garde la diagonale b1-h7, face au roi f2. [%cal Gg6b1]}
11. Na2 Nc6 {Le cavalier attaque d4 et laisse le fou b4 s'échanger. [%cal Gc6d4]}
12. Nxb4 Nxb4 {Le cavalier b4 vise d3 et c2, et le pion d4 reste attaqué.}`,
          conclusion:
            "Si les Blancs évitent e4 avec 8.Nxc4, le roque et …c5 frappent le centre. Le roi blanc en f2 reste une cible.",
        },
        {
          title: "Hollandaise : 9.Nh4 Nbd7 10.Nxf5 exf5",
          eco: "D19",
          kind: "line",
          objectives: [
            "Laisser le cavalier prendre le fou f5",
            "Reprendre avec le pion e pour contrôler e4",
            "Placer un cavalier en e4 soutenu par f5",
          ],
          pgn: `{Le coup Nh4 gagne la paire de fous. En reprenant avec le pion e, vous obtenez un pion f5 qui contrôle e4 et une colonne e semi-ouverte.}
${S} 6. e3 e6 7. Bxc4 Bb4 8. O-O O-O 9. Nh4 Nbd7 10. Nxf5 exf5 {Le pion f5 contrôle e4 : vos cavaliers peuvent s'y installer. [%cal Gf5e4]}
11. Qc2 g6 {Le pion protège f5 et ferme la diagonale b1-h7. [%cal Gg6f5]}
12. f3 Nb6 {Le cavalier vise c4 et a4. [%cal Gb6c4,Gb6a4]}`,
          conclusion:
            "Contre Nh4, cédez le fou f5 et reprenez avec le pion e. Le contrôle de e4 compense la paire de fous.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Les réponses adverses",
      summary:
        "L'échange 3.cxd5, les sorties de dame 4.Qc2 et 4.Qb3, les poussées 5.e4 et 5.e3 contre 4…dxc4, et l'anti-Meran 6.Qc2.",
      stage: "responses",
      lessons: [
        {
          title: "Échange : 3.cxd5 cxd5 4.Nc3 Nf6 5.Bf4",
          eco: "D10",
          kind: "line",
          objectives: [
            "Reprendre en d5 avec le pion c",
            "Développer le fou en f5 avant …e6",
            "Répondre à Qb3 par …Na5 et …Bd7",
          ],
          pgn: `{L'échange rend la structure symétrique. Vos pièces se développent comme celles des Blancs : le fou c8 sort avant …e6.}
1. d4 d5 2. c4 c6 3. cxd5 cxd5 4. Nc3 Nf6 5. Bf4 Nc6 6. e3 Bf5 {Le fou sort avant …e6, comme dans toute la Slave. [%cal Gf5b1]}
7. Qb3 Na5 {Le cavalier attaque la dame et protège b7. [%cal Ga5b3]}
8. Qa4+ Bd7 9. Qc2 e6 {Le fou d7 et le pion e6 bouclent le centre. [%cal Ge6d5]}
10. Bd3 Rc8 {La tour s'installe sur la colonne c ouverte. [%cal Gc8c2]}`,
          conclusion:
            "Contre l'échange, sortez le fou en f5 puis jouez …e6. Contre Qb3, …Na5 protège b7 avec gain de temps.",
        },
        {
          title: "4.Qc2 et 4.Qb3 : …dxc4 et …Bf5",
          eco: "D11",
          kind: "line",
          objectives: [
            "Prendre en c4 pour développer avec gain de temps",
            "Attaquer la dame c4 avec le fou f5",
            "Compléter le développement avec …e6 et …Nbd7",
          ],
          pgn: `{Avec Qc2 ou Qb3, les Blancs protègent c4 avec la dame. La prise en c4 l'attire en c4, où …Bf5 et …e6 la gênent.}
1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Qc2
(4. Qb3 dxc4 5. Qxc4 Bf5 {Même position qu'après 4.Qc2 : la dame c4 est exposée.})
4... dxc4 5. Qxc4 Bf5 {Le fou sort avec gain de temps sur la case c2. [%cal Gf5c2]}
6. g3 e6 7. Bg2 Nbd7 {Le cavalier prépare …Nb6 ou …e5. [%cal Gd7b6]}
8. O-O Be7 {Vous roquez au prochain coup avec une position solide.}`,
          conclusion:
            "Contre les sorties de dame, prenez en c4 puis jouez …Bf5. La dame blanche devient une cible pour vos pièces.",
        },
        {
          title: "5.e4 b5 et 5.e3 b5",
          eco: "D15",
          kind: "line",
          objectives: [
            "Garder le pion c4 avec …b5 quand a4 n'est pas joué",
            "Placer le cavalier en d5 contre e5",
            "Répondre à a4 par …b4",
          ],
          pgn: `{Si les Blancs ne jouent pas a4, le pion c4 peut être gardé par …b5. Contre e4 et e5, le cavalier f6 se réfugie en d5.}
1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 dxc4 5. e4
(5. e3 b5 6. a4 b4 7. Na2 e6 8. Bxc4 Nbd7 {Le pion b4 gêne le cavalier a2 et vous gardez une structure saine.})
5... b5 6. e5 Nd5 {Le cavalier s'installe en d5, sa case naturelle. [%cal Gd5c3]}
7. a4 e6 {Le pion soutient le cavalier d5 et ouvre la diagonale du fou f8. [%cal Ge6d5]}
8. axb5 Nxc3 9. bxc3 cxb5 {Vous gardez le pion de plus et la structure blanche est abîmée.}`,
          conclusion:
            "Sans a4, …b5 garde le pion c4. Contre 5.e4, le cavalier d5 est solide et les pions blancs de l'aile dame sont abîmés.",
        },
        {
          title: "Anti-Meran : 6.Qc2 Bd6",
          eco: "D45",
          kind: "line",
          objectives: [
            "Développer le fou en d6 contre la dame c2",
            "Prendre en c4 après le roque blanc",
            "Gagner de l'espace avec …b5 et …Bb7",
          ],
          pgn: `{Avec 6.Qc2, les Blancs évitent la Meran et préparent e4. Le fou d6 contrôle e5 et soutient la poussée …e5.}
${ME} 6. Qc2 Bd6 {Le fou contrôle e5 et vise h2. [%cal Gd6h2]}
7. Bd3 O-O 8. O-O dxc4 {La prise en c4 tombe alors que le fou d3 a déjà bougé. [%cal Gd5c4]}
9. Bxc4 b5 10. Be2 Bb7 {Le fou rejoint la grande diagonale. [%cal Gb7f3]}
11. Rd1 Qc7 {La dame relie les tours et soutient …c5. [%cal Gc7c5]}`,
          conclusion:
            "Contre l'anti-Meran, le fou d6 et le roque précèdent la prise en c4. Le schéma …b5, …Bb7 et …c5 reste le même que dans la Meran.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Les pièges",
      summary: "Quatre pièges noirs : …Bc2 contre 10.Rd1? dans la ligne 4.Qc2, …bxc4 dans l'anti-Meran, …Nxd4 contre 6.Qb3? dans l'échange et …g6 contre la sortie Qh5.",
      stage: "traps",
      lessons: TRAPS,
    },
    // =====================================================================================
    {
      title: "La théorie approfondie",
      summary:
        "Les lignes de référence : la centrale jusqu'à 17…f6, 8.Bg5 et 10.Qf3, la hollandaise 12.Rd1 Qa5 et 6.Nh4 e6.",
      stage: "theory",
      lessons: [
        {
          title: "Centrale : 15.Nxc4 O-O 16.Qe5",
          eco: "D17",
          kind: "line",
          objectives: [
            "Roquer après avoir récupéré trois pions",
            "Opposer une tour à la dame blanche",
            "Avancer les pions de l'aile roi",
          ],
          pgn: `{Après le sacrifice en e4, les Blancs centralisent leur dame. Vos trois pions et la sécurité de votre roi équilibrent la pièce de moins.}
${S} 6. Ne5 e6 7. f3 Bb4 8. e4 Bxe4 9. fxe4 Nxe4 10. Bd2 Qxd4 11. Nxe4 Qxe4+ 12. Qe2 Bxd2+ 13. Kxd2 Qd5+ 14. Kc2 Na6 15. Nxc4 O-O
16. Qe5 Rab8 {La tour prépare …b5 pour ouvrir l'aile dame. [%cal Gb8b5]}
17. a5 f6 {Le pion chasse la dame et prépare …e5. [%cal Gf6e5]}`,
          conclusion:
            "Dans la centrale, le roque après Nxc4 met votre roi en sûreté. Les pions centraux …e5 et l'aile dame …b5 donnent du jeu actif.",
        },
        {
          title: "Centrale : 8.Bg5 h6 et 10.Qf3",
          eco: "D17",
          kind: "line",
          objectives: [
            "Chasser le fou g5 avant de jouer …c5",
            "Connaître la réponse à 10.Qf3 dans le sacrifice",
            "Sauver la tour h8 par l'échec …Qe3+ puis …Rf8",
          ],
          pgn: `{Les Blancs ont deux déviations importantes : 8.Bg5 et 10.Qf3 dans la ligne du sacrifice. Dans les deux cas, le centre noir reste actif.}
${S} 6. Ne5 e6 7. f3 Bb4 8. e4
(8. Bg5 h6 9. Bh4 c5 {La poussée frappe d4 pendant que le fou h4 est loin de l'aile dame. [%cal Gc5d4]})
8... Bxe4 9. fxe4 Nxe4 10. Qf3 Qxd4 {La dame prend le pion d4 et menace f2. [%cal Gd4f2]}
11. Qxf7+ Kd8 12. Bg5+ Nxg5 {Le cavalier prend le fou avec gain de matériel. [%cal Ge4g5]}
13. Qxg7 {La dame menace la tour h8 : l'échec …Qe3+ puis …Rf8 la met à l'abri, avec une position équilibrée.}`,
          conclusion:
            "Contre 8.Bg5, …h6 et …c5 ouvrent le centre. Contre 10.Qf3, …Qxd4 et …Kd8 tiennent la position.",
        },
        {
          title: "Hollandaise : 12.Rd1 Qa5 13.Bd2",
          eco: "D19",
          kind: "line",
          objectives: [
            "Doubler les tours sur la colonne d",
            "Répondre à Bd2 par …Rad8",
            "Préparer …e5 pour libérer le jeu",
          ],
          pgn: `{Après 12.Rd1 Qa5, le cavalier c3 est cloué et la tour d1 attend e4. Votre plan est de préparer …e5 avec …Rad8.}
${S} 6. e3 e6 7. Bxc4 Bb4 8. O-O O-O 9. Qe2 Bg6 10. Ne5 Nbd7 11. Nxg6 hxg6 12. Rd1 Qa5 13. Bd2 Rad8 {La tour soutient …e5 et s'oppose à la tour d1. [%cal Gd8d1]}
14. Be1 Nb6 {Le cavalier attaque le fou c4 et vise a4. [%cal Gb6c4,Gb6a4]}
15. Bb3 e5 {Le centre s'ouvre et vos pièces sont prêtes. [%cal Ge5d4]}`,
          conclusion:
            "Dans la hollandaise, …Rad8 et …e5 libèrent votre jeu. Les pièces noires sont bien placées pour l'ouverture du centre.",
        },
        {
          title: "6.Nh4 e6 7.Nxf5 exf5",
          eco: "D16",
          kind: "line",
          objectives: [
            "Accepter de rendre le fou f5 contre un pion f5",
            "Garder le pion c4 au moins un temps",
            "Développer le fou f8 en b4",
          ],
          pgn: `{Le coup Nh4 attaque le fou f5 tout de suite. Avec …e6, vous laissez le cavalier le prendre et reprenez avec le pion e.}
${S} 6. Nh4 e6 7. Nxf5 exf5 {Le pion f5 contrôle e4, et la colonne e s'ouvre. [%cal Gf5e4]}
8. e3 Bb4 {Le fou cloue le cavalier c3. [%cal Gb4c3]}
9. Bxc4 O-O {Vous avez roqué, et e4 reste difficile à jouer pour les Blancs.}`,
          conclusion:
            "Contre 6.Nh4, …e6 cède le fou f5 pour une structure solide. Le pion f5 contrôle e4 et le fou b4 cloue le cavalier c3.",
        },
      ],
    },
  ],
};
