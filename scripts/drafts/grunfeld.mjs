// Brouillon de la Masterclass « Défense Grünfeld » (côté Noirs) : 1.d4 Nf6 2.c4 g6 3.Nc3 d5.
// Répertoire : la variante d'échange (7.Bc4 classique, 7.Nf3 avec Rb1, 7.Be3), le système
// 4.Nf3 (5.Bg5, système russe 5.Qb3, 5.Bf4), les fous précoces 4.Bf4 et 4.Bg5, 5.Bd2,
// la Néo-Grünfeld 3.g3 et l'anti-Grünfeld 3.f3.
// Les flèches du coup à jouer sont ajoutées par scripts/course-builder.mjs ; celles écrites ici
// illustrent une idée (cible, manœuvre, menace).
import { TRAPS } from "./grunfeld-traps.mjs";

const G = "1. d4 Nf6 2. c4 g6 3. Nc3 d5";
const EX = `${G} 4. cxd5 Nxd5 5. e4 Nxc3 6. bxc3 Bg7`;
const CL = `${EX} 7. Bc4 c5 8. Ne2 Nc6 9. Be3 O-O 10. O-O`;
const RB = `${EX} 7. Nf3 c5 8. Rb1 O-O 9. Be2 cxd4 10. cxd4 Qa5+ 11. Bd2 Qxa2 12. O-O`;
const RU = `${G} 4. Nf3 Bg7 5. Qb3 dxc4 6. Qxc4 O-O 7. e4 Na6 8. Be2 c5 9. d5 e6 10. O-O exd5 11. exd5 Bf5`;

export default {
  id: "grunfeld",
  name: "Défense Grünfeld",
  description:
    "1.d4 Nf6 2.c4 g6 3.Nc3 d5 : les Noirs laissent les Blancs bâtir un grand centre pour l'attaquer ensuite avec le fou g7, le pion c5 et le cavalier c6. Un répertoire complet côté Noirs contre l'échange, le système russe, les sorties de fou, la Néo-Grünfeld et 3.f3, avec pièges et grandes lignes.",
  side: "black",
  eco: ["D70", "D76", "D80", "D82", "D85", "D86", "D87", "D91", "D92", "D97"],
  chapters: [
    // =====================================================================================
    {
      title: "Les fondations",
      summary:
        "Le défi 3…d5, la variante d'échange et ses deux plans (7.Bc4 et 7.Nf3), la sortie 5.Bg5 et le système russe 5.Qb3.",
      stage: "foundations",
      lessons: [
        {
          legacyIds: ["grunfeld-m1"],
          title: "3…d5 et l'échange : le centre comme cible",
          eco: "D86",
          kind: "concept",
          objectives: [
            "Défier le pion c4 dès le troisième coup",
            "Échanger le cavalier d5 avant qu'il soit chassé",
            "Attaquer le pion d4 avec …c5, …Nc6 et le fou g7",
          ],
          pgn: `{La Grünfeld laisse les Blancs bâtir un grand centre avec e4, pour l'attaquer ensuite avec le fou g7 et le pion c5.}
${G} {Le pion d5 défie aussitôt le pion c4 : c'est le coup qui définit la Grünfeld. [%cal Gd5c4]}
4. cxd5 Nxd5 5. e4 Nxc3 {Le cavalier s'échange avant d'être chassé : les Blancs gagnent un pion c3 au centre. [%cal Gd5c3]}
6. bxc3 Bg7 {Le fou vise la grande diagonale, où se trouvent c3 et la tour a1. [%cal Gg7c3,Gg7a1]}
7. Bc4
(7. Nf3 c5 {Même réponse : le pion c5 attaque la base du centre sans attendre.})
7... c5 {Le pion frappe d4, le pion qui tient tout le centre blanc. [%cal Gc5d4]}
8. Ne2 {Le cavalier va en e2 pour éviter le clouage …Bg4 et soutenir d4.}
8... Nc6 {Troisième attaque sur d4 : cavalier, fou et pion c5. [%cal Gc6d4,Gg7d4]}
9. Be3 O-O 10. O-O {Les deux rois sont à l'abri : toute la partie tourne autour du pion d4.}`,
          conclusion:
            "La Grünfeld n'occupe pas le centre, elle l'attaque. Après l'échange en c3, le fou g7, le pion c5 et le cavalier c6 visent tous le pion d4.",
        },
        {
          legacyIds: ["grunfeld-m2"],
          title: "Échange classique : 10…Bg4 11.f3 Na5",
          eco: "D87",
          kind: "concept",
          objectives: [
            "Chasser le défenseur e2 avec …Bg4",
            "Attaquer le fou c4 avec …Na5",
            "Gagner la qualité après d5 avec …Bxa1",
          ],
          pgn: `{Le cavalier e2 défend d4. Le fou g4 le vise, puis le cavalier a5 chasse le fou c4 et ouvre la grande diagonale.}
${CL} Bg4 {Le fou attaque le cavalier e2, un défenseur de d4. [%cal Gg4e2]}
11. f3 Na5 {Le cavalier attaque le fou c4 et dégage la diagonale du fou g7. [%cal Ga5c4,Gg7d4]}
12. Bd3 cxd4 13. cxd4 Be6 {Le fou se replie et vise le pion a2 et la case d5. [%cal Ge6a2]}
14. d5
(14. Rc1 Bxa2 {Le pion a2 tombe. Après Qa4, le fou revient en e6 ou en b3.})
14... Bxa1 {Le fou prend la tour : vous gagnez la qualité, mais les cases noires autour du roi s'affaiblissent.}
15. Qxa1 f6 {Le pion f6 coupe la grande diagonale de la dame a1 vers g7 et h8. [%cal Ga1f6]}`,
          conclusion:
            "Dans l'échange classique, …Bg4 et …Na5 attaquent les défenseurs du centre. Si les Blancs avancent d5, vous prenez la tour a1 et fermez la diagonale avec …f6.",
        },
        {
          legacyIds: ["grunfeld-m3"],
          title: "4.Nf3 Bg7 5.Bg5 Ne4",
          eco: "D91",
          kind: "concept",
          objectives: [
            "Attaquer le fou g5 avec …Ne4",
            "Reprendre le pion d5 avec …e6",
            "Fermer la colonne f avec …Bf6 et abriter le roi en g7",
          ],
          pgn: `{Le fou g5 vise le cavalier f6, défenseur de d5. Le coup …Ne4 l'attaque tout de suite et obtient la paire de fous.}
${G} 4. Nf3 Bg7 5. Bg5 Ne4 {Le cavalier attaque le fou g5 et le cavalier c3. [%cal Ge4g5,Ge4c3]}
6. cxd5 Nxg5 7. Nxg5 e6 {Le pion attaque d5 et ouvre la diagonale de la dame vers g5. [%cal Ge6d5,Gd8g5]}
8. Qd2
(8. Nf3 exd5 {Vous récupérez le pion : la paire de fous compense le léger retard.})
8... exd5 9. Qe3+ Kf8 {Le roi va en f8 : le roque n'est plus possible, mais le roi reste en sécurité.}
10. Qf4 Bf6 {Le fou bloque la colonne f : la dame ne peut plus viser f7. [%cal Gf6f4]}
11. h4 h6 {Le pion chasse le cavalier g5. [%cal Gh6g5]}
12. Nf3 Kg7 {Le roi se place en g7 et relie les tours.}`,
          conclusion:
            "Contre 5.Bg5, …Ne4 donne la paire de fous. Le roi passe par f8 puis g7 : un roque artificiel qui garde la structure intacte.",
        },
        {
          legacyIds: ["grunfeld-m4"],
          title: "Système russe : 5.Qb3 dxc4 et 7…Na6",
          eco: "D97",
          kind: "concept",
          objectives: [
            "Prendre en c4 pour attirer la dame blanche",
            "Préparer …c5 avec le cavalier a6",
            "Ouvrir le centre avec …e6 contre d5",
          ],
          pgn: `{Avec Qb3, les Blancs attaquent d5. Vous prenez en c4 : la dame reprend, puis les Blancs construisent le centre e4-d4.}
${G} 4. Nf3 Bg7 5. Qb3 dxc4 {Le pion prend : la dame doit reprendre et s'exposera aux attaques. [%cal Gd5c4]}
6. Qxc4 O-O 7. e4 Na6 {Le cavalier prépare …c5 et vise la case b4. [%cal Ga6c5,Ga6b4]}
8. Be2 c5 {Le pion attaque d4 : les Blancs avancent pour garder l'espace. [%cal Gc5d4]}
9. d5 e6 {Le pion e6 attaque d5 pour ouvrir les lignes. [%cal Ge6d5]}
10. O-O exd5 11. exd5 Bf5 {Le fou sort sur la diagonale b1-h7 et contrôle les cases d3 et e4. [%cal Gf5b1]}`,
          conclusion:
            "Dans le système russe, …dxc4 attire la dame, …Na6 prépare …c5, et …e6 ouvre le centre. Le pion d5 devient une cible pour vos pièces.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Les plans typiques",
      summary:
        "Les plans noirs dans l'échange avec Rb1, avec 7.Be3 et Qd2, dans le sacrifice Bxf7+ de la classique et contre la sortie 4.Bf4.",
      stage: "plans",
      lessons: [
        {
          title: "Échange 8.Rb1 : …Qa5+ et …Qxa2",
          eco: "D85",
          kind: "line",
          objectives: [
            "Gagner un temps avec l'échec …Qa5+",
            "Prendre le pion a2 pour créer un pion passé",
            "Attaquer le cavalier f3 avec …Bg4",
          ],
          pgn: `{Avec Rb1, la tour quitte la diagonale du fou g7 et vise b7. En échange, le pion a2 n'est plus défendu par la tour.}
${EX} 7. Nf3 c5 8. Rb1 {La tour quitte la grande diagonale et vise le pion b7. [%cal Gb1b7]}
8... O-O 9. Be2 cxd4 10. cxd4 Qa5+ {L'échec gagne un temps : les Blancs doivent interposer une pièce. [%cal Ga5e1]}
11. Bd2
(11. Qd2 Qxd2+ 12. Bxd2 b6 {La finale est égale : …Bb7 attaquera le pion e4.})
11... Qxa2 {La dame prend le pion a2 : votre pion a deviendra un pion passé. [%cal Ga7a1]}
12. O-O Bg4 {Le fou attaque le cavalier f3, un défenseur de d4. [%cal Gg4f3]}
13. Bg5 h6 {Le pion chasse le fou g5 avant qu'il ne s'installe. [%cal Gh6g5]}`,
          conclusion:
            "Contre Rb1, l'échec …Qa5+ et la prise …Qxa2 vous donnent un pion passé sur l'aile dame. Les Blancs ont l'initiative au centre en échange.",
        },
        {
          title: "Échange 7.Be3 : …Qa5 et la finale",
          eco: "D85",
          kind: "line",
          objectives: [
            "Clouer le pion c3 avec …Qa5",
            "Échanger les dames après …cxd4",
            "Attaquer d4 avec la tour d8 et le cavalier c6",
          ],
          pgn: `{Avec Be3 et Qd2, les Blancs protègent d4 et c3. La dame a5 force l'échange des dames : la finale vous convient.}
${EX} 7. Be3 c5 8. Qd2 Qa5 {La dame cloue le pion c3 et attaque a2. [%cal Ga5c3,Ga5a2]}
9. Rc1 cxd4 10. cxd4 Qxd2+ 11. Kxd2 O-O {Le roi blanc reste au centre, mais sans dames il ne risque rien.}
12. Nf3 Rd8 {La tour attaque d4 : le roi blanc se trouve sur la même colonne. [%cal Gd8d2]}
13. Bb5 Nc6 14. Bxc6 bxc6 {Le pion reprend vers le centre et ouvre la colonne b pour votre tour a8. [%cal Ga8b8]}`,
          conclusion:
            "Contre 7.Be3, la dame a5 provoque l'échange des dames. Dans la finale, votre tour d8 et le fou g7 pèsent sur le pion d4.",
        },
        {
          title: "Classique : 12.Bxf7+ Rxf7 13.fxg4",
          eco: "D87",
          kind: "line",
          objectives: [
            "Accepter le sacrifice en f7 et échanger les tours",
            "Placer la dame en e6 contre c4 et g4",
            "Échanger les dames contre les pions g doublés",
          ],
          pgn: `{Après …Na5, les Blancs peuvent prendre en f7 puis en g4. Ils gagnent un pion, mais leurs pions g sont doublés et le roi est découvert.}
${CL} Bg4 11. f3 Na5 12. Bxf7+ Rxf7 13. fxg4 Rxf1+ 14. Kxf1 {Bilan : les Blancs ont un pion de plus, mais deux pions sur la colonne g.}
14... Qd6 {La dame vise h2 et se prépare à passer en e6. [%cal Gd6h2]}
15. Kg1
(15. e5 Qd5 {La dame se centralise et attaque les pions a2 et g2. [%cal Gd5a2,Gd5g2]})
15... Qe6 {La dame attaque les pions c4 et g4. [%cal Ge6g4,Ge6c4]}
16. Qd3 Qc4 {La dame propose l'échange : sans les dames, le pion g4 doublé sera faible.}
17. Qxc4+ Nxc4 {Le cavalier reprend et attaque le fou e3. [%cal Gc4e3]}`,
          conclusion:
            "Le sacrifice Bxf7+ donne un pion aux Blancs, mais abîme leur structure. Échangez les dames : vos pièces actives compensent largement le pion.",
        },
        {
          title: "4.Bf4 Bg7 5.e3 c5 : la riposte au centre",
          eco: "D82",
          kind: "line",
          objectives: [
            "Attaquer d4 avec …c5 contre 5.e3",
            "Clouer le cavalier c3 avec …Qa5",
            "Récupérer le pion c5 avec la dame",
          ],
          pgn: `{Le fou f4 sort avant e3. Le pion c5 attaque le centre tout de suite : si les Blancs prennent, la dame reprend le pion.}
${G} 4. Bf4 Bg7 5. e3 c5 {Le pion attaque d4 avant que les Blancs ne finissent leur développement. [%cal Gc5d4]}
6. dxc5 Qa5 {La dame cloue le cavalier c3 et prépare la reprise en c5. [%cal Ga5c3,Ga5c5]}
7. Rc1 dxc4 8. Bxc4 O-O 9. Nf3 Qxc5 {Le pion est récupéré : la position est égale et votre fou g7 est actif.}
10. Bb3 Nc6 11. O-O Qa5 {La dame quitte c5, où Na4 ou Nb5-c7 pourraient la gêner.}`,
          conclusion:
            "Contre 4.Bf4 et 5.e3, …c5 suivi de …Qa5 récupère le pion avec un jeu actif. Vos pièces se développent vite pendant que les Blancs terminent leur roque.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Répondre aux alternatives blanches",
      summary:
        "La Néo-Grünfeld 3.g3, la sortie 4.Bg5 Ne4, le coup 5.Bd2 dans l'échange et le système 5.Bf4 avec Rc1.",
      stage: "responses",
      lessons: [
        {
          legacyIds: ["grunfeld-m5"],
          title: "Néo-Grünfeld : 3.g3 Bg7 4.Bg2 d5",
          eco: "D76",
          kind: "line",
          objectives: [
            "Jouer …d5 même sans cavalier c3",
            "Reculer en b6 et attaquer d4 avec …Nc6",
            "Préparer …e5 avec la tour e8",
          ],
          pgn: `{Sans Nc3, les Blancs comptent sur le fou g2 pour peser sur d5. Le cavalier d5 se replie en b6 et vous attaquez d4.}
1. d4 Nf6 2. c4 g6 3. g3 {Le fou g2 viendra viser la grande diagonale vers b7. [%cal Gf1g2]}
3... Bg7 4. Bg2 d5 5. cxd5 Nxd5 6. Nf3
(6. e4 Nb6 7. Ne2 c5 8. d5 e6 9. O-O O-O {Le pion e6 attaque d5 : …exd5 ouvrira le centre.})
6... O-O 7. O-O Nb6 {Le cavalier quitte d5 avant d'être attaqué et vise c4. [%cal Gb6c4]}
8. Nc3 Nc6 {Le cavalier attaque d4 avec le fou g7. [%cal Gc6d4,Gg7d4]}
9. e3 Re8 {La tour prépare …e5 pour casser le centre. [%cal Ge8e5]}`,
          conclusion:
            "Dans la Néo-Grünfeld, le cavalier recule en b6 et …Nc6 attaque d4. La poussée …e5, préparée par la tour e8, libère votre jeu.",
        },
        {
          title: "4.Bg5 Ne4 5.Bh4 Nxc3",
          eco: "D80",
          kind: "line",
          objectives: [
            "Chasser le fou g5 avec …Ne4",
            "Doubler les pions c après …Nxc3",
            "Garder le pion c4 avec …Be6",
          ],
          pgn: `{Le fou g5 vise e7 et f6. Le cavalier e4 le chasse et s'échange en c3 : la structure blanche est abîmée.}
${G} 4. Bg5 Ne4 {Le cavalier attaque le fou g5. [%cal Ge4g5]}
5. Bh4 Nxc3 6. bxc3 dxc4 {Le pion prend : avec un pion c3, les Blancs auront du mal à récupérer c4. [%cal Gd5c4]}
7. e3 Be6 {Le fou défend c4 et prépare …Bg7 et le roque. [%cal Ge6c4]}
8. Nf3 Bg7 9. Be2 O-O 10. O-O c5 {Le pion attaque d4 : …Nc6 et …Qa5 suivront. [%cal Gc5d4]}`,
          conclusion:
            "Contre 4.Bg5, …Ne4 et …Nxc3 donnent des pions c doublés aux Blancs. Le pion c4 se défend avec …Be6, puis …c5 attaque d4.",
        },
        {
          title: "Échange 5.Bd2 : …Nb6 et …e5",
          eco: "D85",
          kind: "line",
          objectives: [
            "Comprendre pourquoi Bd2 évite les pions doublés",
            "Reculer en b6 contre e4",
            "Frapper le centre avec …e5",
          ],
          pgn: `{Avec Bd2, les Blancs pourront reprendre en c3 avec le fou si vous échangez. Le cavalier recule en b6 et vous frappez avec …e5.}
${G} 4. cxd5 Nxd5 5. Bd2 {Si …Nxc3, le fou reprend : la structure blanche reste saine. [%cal Gd2c3]}
5... Bg7 6. e4 Nb6 {Le cavalier recule en b6, d'où il vise c4 et d5. [%cal Gb6c4,Gb6d5]}
7. Be3 O-O 8. h3 {Le coup h3 empêche …Bg4, qui attaquerait le cavalier f3 à venir.}
8... e5 {Le pion frappe d4 avant que les Blancs n'aient fini leur développement. [%cal Ge5d4]}`,
          conclusion:
            "Contre 5.Bd2, gardez le cavalier : …Nb6 puis …e5 attaquent le centre avant que les Blancs ne soient développés.",
        },
        {
          title: "4.Nf3 Bg7 5.Bf4 O-O 6.Rc1 dxc4",
          eco: "D92",
          kind: "line",
          objectives: [
            "Prendre en c4 quand la tour quitte a1",
            "Clouer le cavalier f3 avec …Bg4",
            "Chasser le fou f4 avec …Nh5",
          ],
          pgn: `{Avec Bf4 et Rc1, les Blancs visent c7. Vous prenez en c4 et attaquez le centre avec vos fous.}
${G} 4. Nf3 Bg7 5. Bf4 O-O 6. Rc1 dxc4 {Le pion prend : le fou f1 devra perdre un temps pour le récupérer. [%cal Gd5c4]}
7. e4 Bg4 {Le fou cloue le cavalier f3, défenseur de d4. [%cal Gg4f3,Gg4d1]}
8. Bxc4 Nh5 {Le cavalier attaque le fou f4. [%cal Gh5f4]}
9. Be3 Bxf3 {Le fou prend le cavalier : le pion d4 perd un défenseur. [%cal Gg7d4]}`,
          conclusion:
            "Contre 5.Bf4 et Rc1, …dxc4, …Bg4 et …Nh5 désorganisent le développement blanc. Le fou g7 garde l'œil sur d4.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Les pièges",
      summary: "Quatre pièges blancs à punir : 10.O-O? dans la ligne Rb1, 9.Bd3? dans l'échange, le roque qui oublie le fou c4 contre 4.Bf4 et Bh6? contre 3.f3.",
      stage: "traps",
      lessons: TRAPS,
    },
    // =====================================================================================
    {
      title: "La théorie approfondie",
      summary:
        "Les suites principales de l'échange classique avec 14.d5, de la ligne Rb1 avec …Qxa2, du système russe 12.Be3 et de l'anti-Grünfeld 3.f3.",
      stage: "theory",
      lessons: [
        {
          title: "Classique : 14.d5 Bxa1 15.Qxa1 f6 16.Bh6",
          eco: "D87",
          kind: "line",
          objectives: [
            "Défendre le roi après la perte du fou g7",
            "Couvrir la case f8 avec la tour e8",
            "Activer la tour c8 et le fou d7",
          ],
          pgn: `{Après …Bxa1, vous avez la qualité de plus. Les Blancs attaquent les cases noires avec Bh6 : votre défense doit être précise.}
${CL} Bg4 11. f3 Na5 12. Bd3 cxd4 13. cxd4 Be6 14. d5 Bxa1 15. Qxa1 f6 16. Bh6 {Le fou attaque la tour f8. [%cal Gh6f8]}
16... Re8 {La tour quitte f8 et défend la case e7. [%cal Ge8e7]}
17. Kh1 Rc8 {La tour prend la colonne c ouverte. [%cal Gc8c1]}
18. Nf4 Bd7 {Le fou recule : la case e6 était attaquée par le cavalier et le pion d5. [%cal Gf4e6]}`,
          conclusion:
            "Après la prise de la tour a1, les Blancs attaquent vos cases noires. La tour e8 défend, la tour c8 prend la colonne ouverte : la qualité finit par compter.",
        },
        {
          title: "Rb1 : 15.d5 Bxf3 16.Bxf3 Ne5 17.Rxb7 a5",
          eco: "D85",
          kind: "line",
          objectives: [
            "Prendre le cavalier f3 quand d5 attaque c6",
            "Centraliser le cavalier en e5",
            "Pousser le pion a passé",
          ],
          pgn: `{Dans la ligne Rb1, les Blancs poussent d5 pour chasser le cavalier c6. Vous échangez le fou g4 et lancez le pion a.}
${RB} Bg4 13. Bg5 h6 14. Be3 Nc6 15. d5 Bxf3 {Le fou prend avant que le cavalier c6 ne soit chassé. [%cal Gg4f3]}
16. Bxf3 Ne5 {Le cavalier attaque le fou f3 et se centralise. [%cal Ge5f3]}
17. Rxb7 a5 {Le pion a avance : c'est votre atout principal. [%cal Ga5a1]}`,
          conclusion:
            "Dans la ligne Rb1, le pion passé a compense l'activité blanche. Centralisez le cavalier en e5 et poussez le pion a.",
        },
        {
          title: "Système russe : 12.Be3 Qb6 13.b3 Rfe8",
          eco: "D97",
          kind: "line",
          objectives: [
            "Attaquer le fou e3 avec la dame b6",
            "Placer la tour sur la colonne e",
            "Doubler la pression sur d5 avec la tour d8",
          ],
          pgn: `{Le pion d5 est avancé mais isolé. Vos tours prennent les colonnes e et d, et la dame b6 vise e3.}
${G} 4. Nf3 Bg7 5. Qb3 dxc4 6. Qxc4 O-O 7. e4 Na6 8. Be2 c5 9. d5 e6 10. O-O exd5 11. exd5 Bf5 12. Be3 Qb6 {La dame attaque b2 et met la pression sur le fou e3. [%cal Gb6b2,Gb6e3]}
13. b3 Rfe8 {La tour vise le fou e3 et la colonne e. [%cal Ge8e3]}
14. Rad1 Rad8 {La deuxième tour vient soutenir la pression sur d5. [%cal Gd8d5]}`,
          conclusion:
            "Dans le système russe, vos tours prennent les colonnes e et d. Le pion d5 avancé demande aux Blancs une défense constante.",
        },
        {
          title: "Anti-Grünfeld 3.f3 d5 : …Nb6 et …Nc6",
          eco: "D70",
          kind: "line",
          objectives: [
            "Jouer …d5 même contre 3.f3",
            "Reculer en b6 et attaquer d4 avec …Nc6",
            "Répondre au grand roque par …Qd6",
          ],
          pgn: `{Avec 3.f3, les Blancs préparent e4 sans Nc3. Vous jouez quand même …d5, puis le cavalier recule en b6 et vous attaquez d4.}
1. d4 Nf6 2. c4 g6 3. f3 d5 {Le pion d5 frappe c4 avant que e4 ne soit joué. [%cal Gd5c4]}
4. cxd5 Nxd5 5. e4 Nb6 {Le cavalier recule en b6 et vise c4. [%cal Gb6c4]}
6. Nc3 Bg7 7. Be3 O-O 8. Qd2 Nc6 {Le cavalier attaque d4 avec le fou g7. [%cal Gc6d4]}
9. O-O-O Qd6 {La dame attaque d4 et peut passer en b4 contre le roi blanc. [%cal Gd6d4,Gd6b4]}`,
          conclusion:
            "Contre 3.f3, …d5 puis …Nb6 et …Nc6 visent d4. Si les Blancs roquent du grand côté, la dame d6 prépare l'attaque sur leur roi.",
        },
      ],
    },
  ],
};
