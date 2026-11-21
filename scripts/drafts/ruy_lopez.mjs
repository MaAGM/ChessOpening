// Brouillon de la Masterclass « Partie Espagnole » (côté Blancs) : 1.e4 e5 2.Nf3 Nc6 3.Bb5.
// Répertoire principal : la Fermée 3…a6 4.Ba4 Nf6 5.O-O Be7 6.Re1 b5 7.Bb3 d6 8.c3 O-O 9.h3,
// 4.O-O contre la Berlinoise, 9.Nbd2 / 9.c3 contre l'Ouverte, 8.h3 contre la Marshall.
// Les flèches du coup à jouer sont ajoutées par scripts/course-builder.mjs ; celles écrites ici
// illustrent une idée (cible, manœuvre, menace).
import { TRAPS } from "./ruy_lopez-traps.mjs";

const RUY = "1. e4 e5 2. Nf3 Nc6 3. Bb5";
const MORPHY = `${RUY} a6 4. Ba4 Nf6 5. O-O`;
const CLOSED = `${MORPHY} Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3`;
const OPEN = `${MORPHY} Nxe4 6. d4 b5 7. Bb3 d5 8. dxe5 Be6`;
const BERLIN = `${RUY} Nf6 4. O-O Nxe4 5. d4`;

export default {
  id: "ruy_lopez",
  name: "Partie Espagnole",
  description:
    "1.e4 e5 2.Nf3 Nc6 3.Bb5 : la pression lente sur le défenseur de e5. Un répertoire complet côté Blancs avec l'Espagnole fermée (c3, h3, d4 et la manœuvre Nbd2-f1-g3), 4.O-O contre la Berlinoise, les réponses à l'Ouverte, à la Schliemann, à 3…Bc5 et à l'Arkhangelsk, pièges et grandes lignes Breyer, Dilworth et Rio.",
  side: "white",
  eco: ["C60", "C65", "C67", "C78", "C82", "C84", "C92", "C95"],
  chapters: [
    // =====================================================================================
    {
      title: "Les fondations",
      summary:
        "Pourquoi le fou va en b5 puis en a4, la mise en place Re1, Bb3, c3 et h3 avant d4, la finale berlinoise et la Steinitz moderne.",
      stage: "foundations",
      lessons: [
        {
          title: "3.Bb5 : viser le défenseur de e5",
          eco: "C60",
          kind: "concept",
          objectives: [
            "Comprendre que le fou b5 attaque le cavalier qui défend e5",
            "Reculer en a4 plutôt qu'échanger contre 3…a6",
            "Roquer avant de protéger e4, puis jouer Re1",
          ],
          pgn: `{L'Espagnole ne menace rien tout de suite : le fou b5 attaque le cavalier c6, qui est le seul défenseur du pion e5. Tant que votre pion e4 n'est pas protégé, Bxc6 suivi de Nxe5 ne gagne rien. Vous roquez, vous jouez Re1, et la menace devient réelle.}
1. e4 e5 2. Nf3 {Le cavalier attaque e5 dès le deuxième coup. [%cal Gf3e5]}
2... Nc6 3. Bb5 {Le fou attaque le défenseur du pion e5. [%cal Gb5c6,Gc6e5]}
3... a6 {Le coup de Morphy : les Noirs demandent tout de suite au fou de se décider.}
(3... Nf6 4. O-O {Le roque d'abord : le pion e4 paraît en prise, mais d4 et Re1 le récupéreront. [%cal Gg1h1]})
4. Ba4 {Le fou garde le contact avec c6. Après 4.Bxc6 dxc6 5.Nxe5?, …Qd4 récupérerait le pion aussitôt. [%cal Ga4c6]}
4... Nf6
(4... d6 5. c3 {Le pion prépare d4 et une retraite en c2 pour le fou. [%cal Gc3d4]})
5. O-O {Le roi se met à l'abri ; le pion e4 est protégé indirectement par la colonne e qui va s'ouvrir.}
5... Be7
(5... Nxe4 6. d4 {Le centre s'ouvre alors que le roi noir n'a pas roqué. [%cal Gd4e5]})
6. Re1 {La tour protège e4 : maintenant Bxc6 puis Nxe5 menace vraiment de gagner un pion. [%cal Ge1e4,Ga4c6]}`,
          conclusion:
            "Le fou b5 ne gagne pas e5 tout de suite : il prépare. Après Ba4, O-O et Re1, la menace Bxc6 et Nxe5 oblige les Noirs à jouer …b5, et c'est là que la vraie Espagnole commence.",
        },
        {
          legacyIds: ["ruy_lopez-m2"],
          title: "6…b5 7.Bb3 : c3 et h3 avant d4",
          eco: "C84",
          kind: "line",
          objectives: [
            "Placer le fou en b3 face au pion f7",
            "Préparer d4 par c3, qui offre aussi la case c2 au fou",
            "Jouer h3 pour interdire …Bg4 avant de pousser d4",
          ],
          pgn: `{Après 6…b5 7.Bb3, vous ne poussez pas d4 tout de suite. Le pion c3 le prépare et libère la case c2 pour le fou ; le petit coup h3 empêche …Bg4, qui clouerait le cavalier f3 au moment où il doit soutenir d4.}
${MORPHY} Be7 6. Re1 b5 7. Bb3 {Le fou se place sur la diagonale a2-g8, face au pion f7. [%cal Gb3f7]}
7... d6 {Le pion soutient e5 et libère le fou c8.}
(7... O-O 8. h3 {Le coup anti-Marshall : sans c3, le gambit …d5 n'a plus de sens. [%cal Gh3g4]} 8... Bb7 9. d3 {Le pion protège e4 calmement : vous gardez a4 en réserve.})
8. c3 {Le pion prépare d4 et réserve c2 pour le fou b3. [%cal Gc3d4,Gb3c2]}
8... O-O 9. h3 {Sans ce coup, …Bg4 clouerait le cavalier f3, défenseur de d4. [%cal Gh3g4]}
9... Na5
(9... Nb8 10. d4 {Le pion prend le centre : e4 et d4 côte à côte, l'idéal de l'Espagnole. [%cal Gd4e5]})
10. Bc2 {Le fou évite l'échange et reste dirigé vers l'aile roi noire. [%cal Gc2h7]}
10... c5 11. d4 {Le centre est en place : vos deux pions centraux contre le seul pion e5.}`,
          conclusion:
            "La Fermée se construit toujours dans le même ordre : Bb3, c3, h3, puis d4. Ce petit coup h3 n'est pas une perte de temps : il protège le futur pion d4 contre le clouage …Bg4.",
        },
        {
          legacyIds: ["ruy_lopez-m1"],
          title: "4.O-O contre la Berlinoise : la finale",
          eco: "C67",
          kind: "line",
          objectives: [
            "Laisser prendre e4 et répondre par 5.d4",
            "Échanger en c6 puis chasser le cavalier par dxe5",
            "Jouer la finale avec Nc3, h3 et Bf4 contre le roi noir au centre",
          ],
          pgn: `{Contre 3…Nf6, vous roquez et laissez prendre e4. Après 5.d4 Nd6 6.Bxc6 dxc6 7.dxe5, les dames s'échangent : les Noirs ont la paire de fous, mais leur roi ne roquera plus et votre majorité à l'aile roi est mobile.}
${RUY} Nf6 4. O-O {Le roque : la colonne e va s'ouvrir contre le roi noir. [%cal Gf1e1]}
4... Nxe4
(4... Bc5 5. c3 {Le pion prépare d4 avec gain de temps sur le fou c5. [%cal Gc3d4]})
5. d4 {Le pion attaque e5 et ouvre le jeu tant que le roi noir est au centre. [%cal Gd4e5]}
5... Nd6 6. Bxc6 dxc6 7. dxe5 {Le pion chasse le cavalier d6 : il n'a plus de case centrale.}
7... Nf5 8. Qxd8+ Kxd8 {Le roi noir a perdu le droit de roquer.}
9. Nc3 {Le cavalier se développe et surveille e4 et d5. [%cal Gc3e4]}
9... Ke8 10. h3 {Le pion contrôle g4 et prépare g4 pour chasser le cavalier f5. [%cal Gh3g4]}
10... h5 11. Bf4 {Le fou soutient le pion e5, cœur de votre plan : votre majorité e5-f4-g4 avancera. [%cal Gf4e5]}`,
          conclusion:
            "Dans la finale berlinoise, vos atouts sont le pion e5 et la majorité de pions à l'aile roi. Nc3, h3 et Bf4 les soutiennent avant de pousser g4 et f4.",
        },
        {
          title: "4…d6 : la Steinitz moderne",
          eco: "C76",
          kind: "line",
          objectives: [
            "Préparer d4 par c3 contre 4…d6",
            "Reprendre en f5 et roquer contre la Siesta 5…f5",
            "Garder la tension par Re1 contre …Bd7 et …Be7",
          ],
          pgn: `{Avec 4…d6, les Noirs défendent e5 par un pion et gardent leur fou c8 libre. Vous répondez par c3 et d4 : votre centre est plus large, et le fou a4 reste prêt à revenir en c2.}
${RUY} a6 4. Ba4 d6 5. c3 {Le pion prépare d4 et la retraite c2 du fou. [%cal Gc3d4]}
5... Bd7
(5... f5 6. exf5 Bxf5 {La Siesta : les Noirs ouvrent la colonne f.} 7. O-O {Le roi se met à l'abri avant d4 : la colonne e s'ouvrira pour la tour.})
6. d4 Nf6 7. O-O {Le roque d'abord : le pion e4 est défendu indirectement par la menace dxe5.}
7... Be7 8. Re1 {La tour protège e4 et prépare Nbd2-f1 : vous gardez la tension au centre. [%cal Ge1e4]}
8... O-O 9. Nbd2 {Le cavalier rejoint la manœuvre Nf1-g3, comme dans la Fermée. [%cal Gd2f1,Gf1g3]}`,
          conclusion:
            "Contre la Steinitz moderne, c3 et d4 vous donnent le centre. Gardez la tension avec Re1 et Nbd2 : c'est aux Noirs de décider quand échanger en d4.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Plans typiques",
      summary:
        "Les plans blancs dans la Fermée après 9.h3 : la colonne c contre la Tchigorine, la manœuvre Nbd2-f1-g3, la poussée a4 contre la Zaïtsev et le levier a4 contre la Karpov.",
      stage: "plans",
      lessons: [
        {
          title: "9…Na5 : la Tchigorine et la colonne c",
          eco: "C99",
          kind: "line",
          objectives: [
            "Construire Bc2, d4 et Nbd2 contre …Na5 et …c5",
            "Reprendre en d4 par le pion c pour ouvrir la colonne c",
            "Replacer le cavalier par Nb3-d2 et la tour en c1",
          ],
          pgn: `{Contre la Tchigorine, les Noirs ouvrent souvent la colonne c par …cxd4. Vous reprenez par le pion c, et la colonne ouverte devient votre terrain : le cavalier passe par b3 pour gêner …a5-a4, puis la tour vient en c1.}
${CLOSED} Na5 10. Bc2 c5 11. d4 Qc7 {La dame protège e5 et vise c2. [%cal Gc7c2]}
12. Nbd2 {Le cavalier soutient e4 et prépare Nf1 ou Nb3. [%cal Gd2b3]}
12... cxd4
(12... Nc6 13. d5 {Le pion gagne de l'espace et chasse le cavalier : le centre est fermé. [%cal Gd5c6]} 13... Nd8 14. a4 {Le pion ouvre un front à l'aile dame, où les Noirs sont étirés. [%cal Ga4b5]})
13. cxd4 Nc6 14. Nb3 {Le cavalier attaque c5 et retient …a5-a4 un temps. [%cal Gb3c5]}
14... a5 15. Be3 {Le fou protège d4 et b6. [%cal Ge3d4]}
15... a4 16. Nbd2 Bd7 17. Rc1 {La tour s'installe en face de la dame noire, sur la colonne ouverte. [%cal Gc1c7]}`,
          conclusion:
            "Quand les Noirs ouvrent la colonne c, reprenez par le pion et occupez-la. Nb3, Be3 et Rc1 mettent vos pièces en face de la dame c7.",
        },
        {
          title: "9…h6 : la manœuvre Nbd2-f1-g3",
          eco: "C93",
          kind: "line",
          objectives: [
            "Développer le cavalier b1 par d2, f1 puis g3",
            "Libérer la colonne d et le fou c1 grâce à cette manœuvre",
            "Fermer le centre par d5 quand le cavalier noir va en c6",
          ],
          pgn: `{Dans la Fermée, le cavalier b1 n'a pas de bonne case directe : c3 est occupé par un pion. Il passe donc par d2, f1 et g3, où il vise f5 et h5. Contre la Smyslov 9…h6, cette manœuvre est la colonne vertébrale de votre jeu.}
${CLOSED} h6 {Les Noirs préparent …Re8 et …Bf8 sans craindre Ng5.}
10. d4 Re8 11. Nbd2 Bf8 12. Nf1 {Le cavalier libère d2 pour le fou c1 et file vers g3. [%cal Gf1g3]}
12... Bd7 13. Ng3 {Le cavalier vise f5, une case magnifique devant le roi noir. [%cal Gg3f5]}
13... Na5 14. Bc2 c5 15. b3 {Le pion enlève la case c4 au cavalier a5. [%cal Gb3c4]}
15... Nc6 16. d5 {Le pion chasse le cavalier et ferme le centre : vous jouerez à l'aile roi. [%cal Gd5c6]}`,
          conclusion:
            "Nbd2-f1-g3 est la manœuvre à connaître par cœur. Le cavalier g3 soutient la future attaque Nf5 ou Nh5, et le fou c1 respire enfin.",
        },
        {
          title: "9…Bb7 : la Zaïtsev et la poussée a4",
          eco: "C92",
          kind: "line",
          objectives: [
            "Attaquer le pion b5 par a4 contre la Zaïtsev",
            "Reculer le fou en b1 quand le cavalier noir vient en b4",
            "Activer la tour a1 par Ra3 après d5",
          ],
          pgn: `{La Zaïtsev met le fou en b7 et la tour en e8 contre votre pion e4. Votre réponse est la poussée a4 : elle frappe le pion b5, que les Noirs doivent défendre, et la tour a1 pourra entrer en jeu par a3.}
${CLOSED} Bb7 10. d4 Re8 11. Nbd2 Bf8 12. a4 {Le pion attaque b5 : votre deuxième front est ouvert. [%cal Ga4b5]}
12... h6 13. Bc2 {Le fou protège e4 avant l'échange en d4. [%cal Gc2e4]}
13... exd4 14. cxd4 Nb4 15. Bb1 {Le fou recule mais garde e4 en vue.}
15... c5 16. d5 {Le pion ferme la diagonale du fou b7. [%cal Gd5b7]}
16... Nd7 17. Ra3 {La tour se lève : par a3, elle peut basculer vers l'aile roi. [%cal Ga3g3]}`,
          conclusion:
            "Contre la Zaïtsev, a4 donne une cible : le pion b5. Après d5, le fou b7 est enfermé, et Ra3 ajoute une tour à l'attaque.",
        },
        {
          title: "9…Nd7 : la Karpov et le levier a4",
          eco: "C96",
          kind: "line",
          objectives: [
            "Jouer d4 contre la manœuvre …Nd7-…Bf6",
            "Pousser a4 pour ouvrir l'aile dame",
            "Sortir le cavalier par a3 pour soutenir b5",
          ],
          pgn: `{Avec 9…Nd7, les Noirs placent leur fou en f6 pour peser sur d4. Vous jouez d4 quand même, puis a4 et Na3 : le cavalier rejoint l'aile dame, où le pion b5 devient une cible.}
${CLOSED} Nd7 10. d4 Bf6 {Le fou presse le pion d4. [%cal Gf6d4]}
11. a4 {Le levier attaque b5 et oblige les Noirs à se déterminer. [%cal Ga4b5]}
11... Bb7 12. Na3 {Le cavalier vise b5 par l'extérieur : la case d2 reste libre pour le fou. [%cal Ga3b5]}
12... exd4
(12... Nb6 13. axb5 {L'échange ouvre la colonne a pour votre tour. [%cal Ga1a6]})
13. cxd4 Re8 14. axb5 {L'échange d'abord : la colonne a s'ouvre et le pion b5 devient faible. [%cal Ga1a8]}
14... axb5 15. Bf4 {Le fou sort et vise d6, pendant que le cavalier a3 garde un œil sur b5. [%cal Gf4d6,Ga3b5]}`,
          conclusion:
            "Contre la Karpov, d4, a4 et Na3 mettent la pression sur b5. Après l'échange en d4, axb5 ouvre la colonne a avant que le fou c1 ne sorte en f4.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Réponses adverses",
      summary:
        "L'Espagnole ouverte avec 9.Nbd2, la Schliemann avec 4.d3, la Défense classique 3…Bc5 et les deux lignes rapides 5…b5 et 5…Bc5.",
      stage: "responses",
      lessons: [
        {
          title: "5…Nxe4 : l'Ouverte et 9.Nbd2",
          eco: "C80",
          kind: "line",
          objectives: [
            "Récupérer le pion par d4 et dxe5 contre l'Ouverte",
            "Défier le cavalier e4 par Nbd2",
            "Viser les cases d4 et c5 après l'échange en e6",
          ],
          pgn: `{Dans l'Ouverte, les Noirs prennent e4 et gardent leur cavalier au centre. Vous récupérez le pion e5, puis 9.Nbd2 défie ce cavalier : il doit s'échanger ou reculer en c5.}
${OPEN} {Les Noirs ont un cavalier actif en e4 et un pion d5 solide.}
9. Nbd2 {Le cavalier défie celui de e4. [%cal Gd2e4]}
9... Nc5
(9... Be7 10. c3 {Le pion protège d4 et offre c2 au fou. [%cal Gc3d4]})
10. c3 d4 {Le pion noir avance pour gagner de l'espace.}
11. Bxe6 Nxe6 12. cxd4 Ncxd4 13. a4 {Le pion attaque b5 : l'aile dame noire est fragile. [%cal Ga4b5]}`,
          conclusion:
            "Contre l'Ouverte, rendez le pion e4, reprenez e5 et défiez le cavalier par Nbd2. Après l'échange en e6, a4 attaque le pion b5.",
        },
        {
          title: "3…f5 : la Schliemann et 4.d3",
          eco: "C63",
          kind: "line",
          objectives: [
            "Répondre au gambit par le calme 4.d3",
            "Reprendre en e4 avec le pion pour garder le centre",
            "Échanger en c6 pour fragiliser e5",
          ],
          pgn: `{La Schliemann est un gambit agressif : 3…f5 attaque e4. Avec 4.d3, vous refusez les complications : le pion protège e4, et après …fxe4 dxe4, votre centre est solide alors que le roi noir a perdu un pion protecteur.}
${RUY} f5 4. d3 {Le pion protège e4 sans rien concéder. [%cal Gd3e4]}
4... fxe4 5. dxe4 Nf6 6. O-O {Le roi se met à l'abri : la colonne f ouverte ne vous gêne pas.}
6... Bc5
(6... d6 7. Nc3 {Le cavalier protège e4 et vise d5. [%cal Gc3d5]})
7. Bxc6 {L'échange enlève le défenseur de e5. [%cal Gb5c6]}
7... bxc6 8. Nxe5 {Le cavalier prend e5 : les Noirs ont des pions doublés pour leur pion de retard.}
8... O-O 9. Nc3 {Le cavalier protège e4 et vise a4, d'où il chassera le fou c5. [%cal Gc3a4]}`,
          conclusion:
            "Contre la Schliemann, 4.d3 évite toute théorie. Après …fxe4 dxe4, l'échange en c6 enlève le défenseur de e5 : Nxe5 prend le pion, et Nc3 tient le centre.",
        },
        {
          title: "3…Bc5 et 3…Nd4 : c3 et d4",
          eco: "C64",
          kind: "line",
          objectives: [
            "Préparer d4 par c3 contre la Défense classique",
            "Clouer le cavalier f6 par Bg5 après …Bb6",
            "Répondre à 3…Nd4 par l'échange Nxd4",
          ],
          pgn: `{Contre 3…Bc5, le fou noir vise f2. Vous préparez d4 par c3 : le fou c5 sera chassé avec gain de temps, et votre centre e4-d4 s'installera.}
${RUY} Bc5 {Le fou noir vise f2. [%cal Gc5f2]}
(3... Nd4 4. Nxd4 exd4 5. O-O {Le roque : le pion d4 noir est avancé et sera vite une cible. [%cal Gf1e1]})
4. c3 {Le pion prépare d4, qui chassera le fou c5. [%cal Gc3d4]}
4... Nf6 5. O-O O-O 6. d4 Bb6 7. Bg5 {Le fou cloue le cavalier f6, défenseur de e5 et du roi. [%cal Gg5f6,Gg5d8]}
7... h6 8. Bh4 d6 9. a4 {Le pion menace a5 contre le fou b6. [%cal Ga4a5]}`,
          conclusion:
            "Contre 3…Bc5, c3 et d4 chassent le fou noir. Bg5 cloue le cavalier f6, et a4 menace d'enfermer le fou b6.",
        },
        {
          title: "5…b5 et …Bc5 : l'Arkhangelsk et la Möller",
          eco: "C78",
          kind: "line",
          objectives: [
            "Reculer le fou en b3 contre 5…b5",
            "Pousser a4 contre …Bc5 pour gêner l'aile dame",
            "Gagner de l'espace avec a5 et h3 avant d4",
          ],
          pgn: `{Avec 5…b5 et …Bc5, les Noirs mettent leur fou sur la diagonale a7-g1, face à votre roi. Vous répondez par a4, qui attaque b5, puis c3 et d4 : le fou noir devient une cible.}
${MORPHY} b5 6. Bb3 Bc5 {Le fou vise f2. [%cal Gc5f2]}
(6... Bb7 7. Re1 Bc5 8. c3 d6 9. d4 Bb6 10. Be3 {Le fou défie celui de b6. [%cal Ge3b6]})
7. a4 {Le pion attaque b5 tout de suite. [%cal Ga4b5]}
7... Rb8 8. c3 d6 9. d4 Bb6 10. a5 {Le pion chasse le fou b6. [%cal Ga5b6]}
10... Ba7 11. h3 {Le pion contrôle g4 avant que …Bg4 ne cloue le cavalier f3.}`,
          conclusion:
            "Contre l'Arkhangelsk et la Möller, a4 frappe b5 et a5 chasse le fou. Avec c3, d4 et h3, vous retrouvez un centre fort.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Pièges",
      summary:
        "Les erreurs noires typiques contre l'Espagnole : le piège de Tarrasch dans la Steinitz, …d5? contre le cavalier cloué, la variante de Riga dans l'Ouverte et la mauvaise reprise dans la Schliemann.",
      stage: "traps",
      lessons: TRAPS,
    },
    // =====================================================================================
    {
      title: "Grande théorie",
      summary:
        "Les lignes profondes : la Breyer avec a4 et d5, la Dilworth dans l'Ouverte, la Rio de Janeiro contre la Berlinoise et l'anti-Marshall 8.h3.",
      stage: "theory",
      lessons: [
        {
          legacyIds: ["ruy_lopez-m3"],
          title: "La Breyer : Nf1-g3, a4 puis d5",
          eco: "C95",
          kind: "line",
          objectives: [
            "Jouer d4 et Nbd2 contre le repli 9…Nb8",
            "Achever la manœuvre Nf1-g3 contre …Bf8 et …g6",
            "Fermer le centre par d5 puis jouer Bg5 et Be3",
          ],
          pgn: `{La Breyer replace le cavalier c6 en d7 par b8. La position est lente : vous terminez la manœuvre Nf1-g3, puis a4 provoque …c5, et d5 ferme le centre. Le jeu se déplace alors à l'aile roi.}
${CLOSED} Nb8 10. d4 Nbd7 11. Nbd2 Bb7 12. Bc2 Re8 13. Nf1 Bf8 14. Ng3 g6 {Le fou noir ira en g7.}
15. a4 {Le pion demande à …c5 de venir. [%cal Ga4b5]}
15... c5 16. d5 {Le centre est fermé : le fou b7 est enfermé derrière ses pions. [%cal Gd5b7]}
16... c4 17. Bg5 {Le fou se place avant …h6 pour provoquer un affaiblissement. [%cal Gg5f6]}
17... h6 18. Be3 Nc5 19. Qd2 {La dame vise h6 : le pion g6 est fragile. [%cal Gd2h6]}
19... h5 {Les Noirs empêchent g4.}`,
          conclusion:
            "Dans la Breyer, l'ordre est Nf1-g3, a4, d5, puis Bg5 et Qd2. Le centre fermé et le fou b7 enfermé vous laissent l'initiative à l'aile roi.",
        },
        {
          legacyIds: ["ruy_lopez-m4"],
          title: "La Dilworth : 9.c3 Bc5 et le sacrifice en f2",
          eco: "C82",
          kind: "line",
          objectives: [
            "Répondre à 9…Bc5 par Nbd2",
            "Accepter le sacrifice …Nxf2 en reprenant avec la tour",
            "Ramener le roi et le cavalier par Nf1 et Be3",
          ],
          pgn: `{La Dilworth sacrifie deux pièces contre une tour et deux pions en f2. Il faut connaître la ligne : votre roi s'expose un temps, mais vos pièces mineures finissent par dominer.}
${OPEN} 9. c3 Bc5 10. Nbd2 O-O 11. Bc2 {Le fou vise h7 et quitte la diagonale de f7. [%cal Gc2h7]}
11... Nxf2 12. Rxf2 f6 13. exf6 Bxf2+ 14. Kxf2 Qxf6 {Les Noirs ont une tour et deux pions pour deux pièces.}
15. Nf1 {Le cavalier protège le roi et vise e3. [%cal Gf1e3]}
15... Ne5 16. Be3 {Le fou bloque la colonne e et défend le roi. [%cal Ge3c5]}
16... Rae8 17. Bc5 {Le fou attaque la tour f8 et quitte e3, où le cavalier f1 viendra. [%cal Gc5f8]}`,
          conclusion:
            "Contre la Dilworth, prenez les pièces et regroupez-vous : Nf1, Be3 et Bc5 couvrent le roi et attaquent. Deux pièces mineures valent plus qu'une tour dans ce milieu de partie.",
        },
        {
          legacyIds: ["ruy_lopez-m5"],
          title: "La Rio de Janeiro : 5…Be7 6.Qe2",
          eco: "C67",
          kind: "line",
          objectives: [
            "Attaquer le cavalier e4 par Qe2 contre 5…Be7",
            "Échanger en c6 pour doubler les pions noirs",
            "Recentrer le cavalier par Nd4 et le fou par Be3",
          ],
          pgn: `{Avec 5…Be7, les Noirs évitent la finale berlinoise. La dame e2 attaque le cavalier e4 sur la colonne ; après l'échange en c6, les pions noirs de l'aile dame sont doublés, et vos pièces occupent le centre.}
${BERLIN} Be7 6. Qe2 {La dame attaque le cavalier e4. [%cal Ge2e4]}
6... Nd6 7. Bxc6 bxc6 8. dxe5 Nb7 {Le cavalier recule sur le bord : il reviendra par c5.}
9. Nc3 O-O 10. Re1 Nc5 11. Nd4 {Le cavalier se centralise et vise f5 et c6. [%cal Gd4c6]}
11... Ne6 12. Be3 {Le fou soutient d4 : vous gardez la case centrale. [%cal Ge3d4]}
12... Nxd4 13. Bxd4 c5 {Les Noirs chassent le fou : il recule et vise g7.}`,
          conclusion:
            "Contre la Rio de Janeiro, Qe2 puis Bxc6 et dxe5 vous donnent un pion e5 fort et une meilleure structure. Nd4 et Be3 occupent les cases centrales.",
        },
        {
          title: "L'anti-Marshall : 8.h3 Bb7 9.d3 d5",
          eco: "C88",
          kind: "line",
          objectives: [
            "Éviter le gambit Marshall par 8.h3",
            "Protéger e4 par d3 avant c3",
            "Prendre en d5 et activer le cavalier par Nbd2",
          ],
          pgn: `{Contre 7…O-O, 8.c3 d5 permettrait le gambit Marshall. Avec 8.h3 puis d3, vous jouez une position solide : si les Noirs poussent quand même …d5, l'échange laisse un centre ouvert sans compensation pour eux.}
${MORPHY} Be7 6. Re1 b5 7. Bb3 O-O 8. h3 {Le pion empêche …Bg4 sans donner aux Noirs le temps de …d5 contre c3. [%cal Gh3g4]}
8... Bb7 9. d3 {Le pion protège e4. [%cal Gd3e4]}
9... d5
(9... d6 10. a3 {Le pion garde une case de retraite en a2 pour le fou. [%cal Gb3a2]})
10. exd5 Nxd5 11. Nbd2 {Le cavalier va en e4 ou en f1. [%cal Gd2e4]}
11... Qd7 12. Ne4 {Le cavalier se centralise et vise c5 et g5. [%cal Ge4c5]}`,
          conclusion:
            "Avec 8.h3 et d3, vous jouez l'Espagnole sans la théorie de la Marshall. Si …d5, l'échange et Nbd2-e4 donnent à vos pièces les cases centrales.",
        },
      ],
    },
  ],
};
