// Brouillon de la Masterclass « Défense française » (côté Noirs).
// Les flèches du coup à jouer sont ajoutées automatiquement par build.mjs ; les flèches écrites
// ici illustrent une idée (cible, manœuvre, menace) et accompagnent le commentaire du coup noir.

const TARRASCH_BASIC = `{Contre 3.Nd2, le coup 3…c5 frappe d4 alors que le cavalier d2 ne peut plus soutenir le centre depuis c3. Après 4.exd5, la reprise de dame est possible : sans cavalier en c3, les Blancs ne peuvent pas la chasser avec gain de temps.}
1. e4 e6 2. d4 d5 3. Nd2 c5 {Le levier immédiat contre d4. [%cal Gc5d4]}
4. exd5 {Les Blancs ouvrent le jeu avant que vous ne preniez en d4.}
4... Qxd5 {La dame centralisée attaque d4 et g2 ; aucun cavalier blanc ne peut la déloger tout de suite. [%cal Gd5d4]}
5. Ngf3 {Le cavalier défend d4 et prépare Bc4 avec gain de temps sur votre dame.}
(5. Bc4? {Le fou chasse la dame trop tôt : le cavalier g1 ne protège pas encore g2.} 5... Qxg2 {Prenez le pion avec la dame : elle attaque la tour h1. [%cal Gd5g2,Gg2h1]} 6. Qf3 Qxf3 {Échangez les dames : vous restez avec un pion de plus et une structure saine, sans aucune compensation pour les Blancs.} 7. Ngxf3)
(5. dxc5 {Les Blancs rendent le centre pour gagner du temps.} 5... Bxc5 {Reprenez avec développement : le fou vise f2. [%cal Gc5f2]} 6. Ngf3 Nf6 7. Bc4 Qc6 {La dame reste active sur la grande diagonale et attaque g2 après le départ du cavalier f3. [%cal Gc6g2]} 8. Qe2 O-O 9. O-O a6 {Le pion prépare …b5 pour chasser le fou c4 et développer le fou c8 en b7. [%cal Ga6b5]})
5... cxd4 {Échangez d'abord : le pion d4 sera repris par une pièce, jamais par un pion.}
6. Bc4 {Le fou chasse la dame avec gain de temps.}
6... Qd6 {La meilleure retraite : la dame défend le pion d4 et contrôle la diagonale b8-h2. [%cal Gd6d4,Gd6h2]}
7. O-O Nf6 8. Nb3 {Le cavalier vise d4 pour récupérer le pion.}
8... Nc6 {Défendez d4 une fois de plus et développez : les Blancs devront échanger pour le récupérer. [%cal Gc6d4]}
9. Nbxd4 Nxd4 10. Nxd4 {Le matériel est rétabli ; la partie est ouverte et symétrique, avec un léger avantage de développement blanc.}
(10. Qxd4 {Les Blancs proposent l'échange des dames.} 10... Qxd4 11. Nxd4 Bd7 {Une finale égale : votre structure saine et la paire de fous compensent le temps de retard. [%cal Gd7c6]})
10... a6 {Coup indispensable : il interdit Nb5 et Bb5+, et prépare …b5 pour chasser le fou c4. [%cal Ga6b5]}`;

const TARRASCH_DEEP_OBJECTIVES = [
  "Développer …Qc7 et …Bd6 face au fou b3",
  "Connaître le sacrifice Nf5 et la réponse …Bxh2+",
  "Savoir roquer au bon moment face aux menaces sur g7",
];
const TARRASCH_DEEP = `{La position clé de la Tarrasch 3…c5 : structure symétrique, avantage de temps pour les Blancs, paire de fous et position solide pour vous. La ligne principale moderne commence par 11.Re1 et contient un sacrifice célèbre en f5.}
1. e4 e6 2. d4 d5 3. Nd2 c5 4. exd5 Qxd5 5. Ngf3 cxd4 6. Bc4 Qd6 7. O-O Nf6 8. Nb3 Nc6 9. Nbxd4 Nxd4 10. Nxd4 a6 11. Re1 {La tour s'installe sur la colonne e ouverte, face à votre roi encore au centre.}
11... Qc7 {La dame quitte d6, où un cavalier en f5 ou b5 la viserait, et contrôle h2 depuis c7. [%cal Gc7h2]}
12. Bb3 {Le fou se met à l'abri de …b5 et vise e6.}
(12. Qe2 {La dame appuie la colonne e.} 12... Bd6 13. Bg5 O-O {Votre roi est à l'abri ; le fou g5 ne gêne pas tant que le cavalier f6 peut être remplacé par …Nd7.})
(12. Bf1 {Le fou se replie pour défendre le roi.} 12... Be7 {Plus prudent : le fou couvre la colonne e et prépare le roque. [%cal Ge7f6]} 13. Qf3 O-O 14. Bf4 Bd6 {Neutralisez le fou f4 : l'échange vous débarrasse de la pression sur c7. [%cal Gd6f4]} 15. Bxd6 Qxd6 {Égalité complète : plus aucune pièce blanche ne vise votre roi.})
12... Bd6 {Le fou vise h2 en batterie avec la dame : les Blancs doivent surveiller leur roi. [%cal Gd6h2]}
13. Nf5 {Le sacrifice thématique : le cavalier vise g7 et d6.}
(13. h3 {Les Blancs suppriment l'idée …Bxh2+ et le clouage …Bg4.} 13... O-O 14. Bg5 Bh2+ {Un échec utile : le fou sort de la vue du cavalier d4. [%cal Gd6h2]} 15. Kh1 Bf4 {Le fou contre le fou g5 : les pièces actives vous permettent d'échanger les attaquants. [%cal Gf4g5]})
13... Bxh2+ {Prenez avec échec : le roi blanc est déplacé avant que le cavalier ne frappe. [%cal Gd6h2]}
14. Kh1 O-O {Le roi est à l'abri juste avant que les Blancs ne prennent en g7.}
15. Nxg7 Rd8 {Ne prenez pas en g7 : …Rd8 attaque la dame d1 avec gain de temps, et c'est votre attaque qui arrive la première. [%cal Gd8d1]}`;
const TARRASCH_DEEP_END =
  "Dans la Tarrasch 3…c5, vos pièces trouvent naturellement leurs cases : dame en c7, fou en d6, roi en g8. Contre le sacrifice Nf5, l'échec …Bxh2+ puis …Rd8 avec gain de temps renverse l'initiative.";

const WINAWER_H4_OBJECTIVES = [
  "Comprendre le rôle du pion h dans l'attaque blanche",
  "Bloquer le pion h par …h6 au bon moment",
  "Activer le fou c8 par …b6, puis …Ba6 ou …Ba4",
];
const WINAWER_H4 = `{Au lieu de prendre g7 tout de suite, les Blancs poussent leur pion h : il veut atteindre h6 pour affaiblir g7, tandis que la tour peut entrer en jeu par h3. Votre plan : figer ce pion, puis régler le problème du fou c8.}
1. e4 e6 2. d4 d5 3. Nc3 Bb4 4. e5 c5 5. a3 Bxc3+ 6. bxc3 Ne7 7. h4 {Le pion h part à l'assaut ; il gagne aussi de l'espace contre votre futur roque.}
7... Qc7 {Votre réponse habituelle : la dame frappe c3 et e5 sans attendre. [%cal Gc7c3,Gc7e5]}
8. Nf3 {Le développement d'abord ; le pion h avancera ensuite.}
(8. h5 {Le pion arrive en h5 et menace h6.} 8... h6 {Figez-le : en h5, il ne pourra plus jamais ouvrir de colonne contre votre roi. [%cal Gh6h5]} 9. Nf3 b6 {On retrouve la ligne principale par une autre route.})
(8. Rh3 {La tour lève par la troisième rangée pour rejoindre g3.} 8... Nbc6 {Développez et frappez d4 : la tour h3 ne participe pas à la défense du centre. [%cal Gc6d4]} 9. h5 h6 10. Nf3 Bd7 {Le fou prépare le grand roque, la case la plus sûre pour votre roi dans cette structure. [%cal Gd7c8]})
8... b6 {Le pion libère la diagonale a6-f1 : le fou c8 va chercher le fou f1, le meilleur défenseur des cases blanches. [%cal Gc8a6]}
9. h5 h6 {Le réflexe à retenir : le pion h5 est bloqué et la case g6 reste solide.}
10. Bb5+ {Les Blancs évitent l'échange en interposant d'abord leur fou.}
(10. a4 {Le pion prépare Ba3 et gagne de la place à l'aile dame.} 10... Ba6 {L'échange des fous de cases blanches est proposé sans perdre un temps. [%cal Ga6f1]} 11. Bb5+ Bxb5 12. axb5 a5 {Le pion a5 bloque l'aile dame : le pion b5 blanc devient une faiblesse fixe. [%cal Ga5a4]})
10... Bd7 {L'interposition naturelle ; le fou d7 n'est pas passif, il visera a4.}
11. Bd3 {Le fou évite l'échange et vise g6, mais c2 n'est plus protégé.}
11... Ba4 {Le fou s'installe en a4 : il attaque c2 et paralyse l'aile dame blanche. [%cal Ga4c2]}`;
const WINAWER_H4_END =
  "Contre 7.h4, la recette est claire : …Qc7 contre c3 et e5, …h6 pour figer le pion h5, puis …b6 pour activer le fou c8, en a6 ou en a4 selon la place du fou blanc.";

const ADVANCE_SIDELINES_OBJECTIVES = [
  "Prendre en d4 quand c3 n'est pas joué",
  "Viser e5 avec la manœuvre …Nge7-g6",
  "Récupérer le pion c5 puis frapper e5 par …f6",
];
const ADVANCE_SIDELINES = `{Tous les joueurs de l'Avance ne soutiennent pas d4 par c3. Sans ce pion, la chaîne perd sa base : vous pouvez prendre en d4 tout de suite et viser e5, désormais le seul point fort blanc.}
1. e4 e6 2. d4 d5 3. e5 c5 4. Nf3 {Le gambit Nimzowitsch-Keres : les Blancs développent et laissent tomber d4.}
(4. dxc5 {Les Blancs rendent la base de la chaîne pour garder e5.} 4... Nc6 {Le cavalier attaque e5 avant de reprendre le pion c5. [%cal Gc6e5]} 5. Nf3 Bxc5 {Le pion est récupéré et le fou vise f2. [%cal Gc5f2]} 6. Bd3 f6 {Frappez la tête de la chaîne : e5 est seul et plus aucun pion ne le soutient. [%cal Gf6e5]} 7. Qe2 {La dame défend e5 une fois de plus.} (7. exf6 Nxf6 {Vos pièces sortent librement, et le pion e6 contrôle d5 et f5.} 8. O-O O-O {Le roque, et la colonne f semi-ouverte est déjà à vous. [%cal Gf8f3]}) 7... fxe5 8. Nxe5 Nxe5 9. Qxe5 Nf6 {Le cavalier se développe avec tempo sur la case e4 ; votre centre d5-e6 est mobile. [%cal Gf6e4]})
4... cxd4 {Prenez tout de suite : d4 ne sera plus jamais soutenu par un pion. [%cal Gc5d4]}
5. Bd3 {Les Blancs préparent le roque et laissent le pion d4 de côté.}
5... Nc6 {Le cavalier soutient d4 et vise e5. [%cal Gc6e5]}
6. O-O Nge7 {Le cavalier g8 contourne la chaîne : depuis g6, il attaquera e5. [%cal Ge7g6,Gg6e5]}
7. Bf4 {Le fou soutient e5 avant qu'il ne tombe.}
7... Ng6 {Le cavalier défie le fou f4 et frappe e5 une deuxième fois. [%cal Gg6f4,Gg6e5]}
8. Bg3 Be7 {Développement calme : le pion d4 reste à vous et e5 reste une cible.}
9. Nbd2 O-O {Votre roi est à l'abri ; le plan suivant est …f6 pour faire sauter la tête de la chaîne.}`;
const ADVANCE_SIDELINES_END =
  "Sans le pion c3, la chaîne blanche n'a plus de base solide : prenez en d4, développez le cavalier par e7-g6 pour frapper e5, et récupérez toujours le pion c5 avec développement avant de jouer …f6.";

const TRAPS = [
  {
    title: "Tarrasch fermée : le fou f4 tombe",
    eco: "C06",
    kind: "trap",
    objectives: [
      "Reconnaître la batterie …Qc7 et …Bd6 contre h2 et f4",
      "Compter les attaquants et défenseurs d'une case",
      "Gagner une pièce après 12.Bf4?",
    ],
    pgn: `{Dans la Tarrasch fermée, votre dame c7 et votre fou d6 visent ensemble la diagonale b8-h2. Un coup naturel en apparence, Bf4 pour échanger les fous, coûte alors une pièce aux Blancs.}
1. e4 e6 2. d4 d5 3. Nd2 Nf6 4. e5 Nfd7 5. Bd3 c5 6. c3 Nc6 7. Ne2 cxd4 8. cxd4 f6 9. exf6 Nxf6 10. Nf3 Bd6 11. O-O Qc7 {La dame et le fou sont en batterie : f4 est attaqué deux fois. [%cal Gc7f4,Gd6f4]}
12. Bf4? {Les Blancs veulent échanger votre bon fou, mais f4 n'est défendu qu'une fois.}
(12. Nc3 {La bonne idée : le cavalier vise b5 et e4.} 12... a6 {Interdisez Nb5, qui viserait votre dame et la case d6. [%cal Ga6b5]} 13. Bg5 O-O {Le roque : votre roi rejoint la sécurité et la tour f8 appuie la colonne f.})
12... Bxf4 {Prenez : le cavalier e2 doit reprendre, et votre dame est déjà là.}
13. Nxf4 Qxf4 {Une pièce de plus : f4 était attaqué deux fois et défendu une seule. [%cal Gc7f4]}`,
    conclusion:
      "Avant d'échanger une pièce sur une case, comptez : ici, f4 était attaqué par la dame et le fou mais défendu par le seul cavalier e2. La batterie …Qc7/…Bd6 punit toute imprécision sur la diagonale b8-h2.",
  },
  {
    title: "L'Avance : 11.a3? et la chute de d4",
    eco: "C02",
    kind: "trap",
    objectives: [
      "Repérer le défenseur surchargé du pion d4",
      "Échanger le fou d2 pour dévier un défenseur",
      "Garder la pression maximale avec …Nf5 et …Nc6",
    ],
    pgn: `{Avec le cavalier en f5, d4 est attaqué par trois pièces. Les Blancs ne le tiennent que grâce au cavalier f3 et au fou d2. Si l'un des deux disparaît, le pion tombe, souvent avec un gain bien plus important.}
1. e4 e6 2. d4 d5 3. e5 c5 4. c3 Nc6 5. Nf3 Qb6 6. Be2 cxd4 7. cxd4 Nh6 8. Nc3 Nf5 9. Na4 Qa5+ 10. Bd2 Bb4 {Le fou cloue le fou d2 : la dame a5 est toujours défendue. [%cal Gb4d2]}
11. a3? {Les Blancs chassent le fou, mais oublient que le fou d2 protège indirectement d4.}
(11. Bc3 {La défense correcte : le fou se dérobe au clouage.} 11... b5 {Le pion chasse le cavalier a4 de sa case. [%cal Gb5a4]} 12. Bxb4 Qxb4+ {Avec échec : la dame reprend et vise b2 et d4.} 13. Nc3 a6 {Le pion b5 est soutenu et votre aile dame est solide ; la pression sur d4 continue.})
11... Bxd2+ {Échangez avec échec : l'un des deux défenseurs de d4 doit reprendre.}
12. Nxd2 {Le cavalier f3 reprend, et d4 n'a plus de défenseur.}
(12. Qxd2 {La dame reprend, mais elle quitte d1.} 12... Qxa4 {Le cavalier a4 n'était défendu que par la dame d1 : vous gagnez une pièce entière. [%cal Ga5a4]})
12... Nfxd4 {Un pion de plus, et le cavalier d4 vise e2 et b3 ; e5 est le prochain sur la liste. [%cal Gd4e2]}
13. b4 Qc7 {La dame se retire en gardant un œil sur e5 : vous avez un pion de plus et une position dominante. [%cal Gc7e5]}`,
    conclusion:
      "Quand un pion n'est défendu que par des pièces, chaque échange peut supprimer un défenseur. Ici, …Bxd2+ dévie le cavalier f3 et le pion d4 tombe gratuitement.",
  },
  {
    title: "4.Qg4 : le pion e5 et la dame exposée",
    eco: "C02",
    kind: "trap",
    objectives: [
      "Attaquer e5 avec la dame et deux cavaliers",
      "Prendre e5 quand il n'est plus défendu",
      "Chasser la dame g4 avec le pion h",
    ],
    pgn: `{Le coup 4.Qg4 vise g7 avant même que les Blancs aient développé leurs pièces. Sans le pion d4, e5 n'est plus soutenu que par le cavalier f3 : votre jeu consiste à l'attaquer, tout en gardant un œil sur la dame blanche exposée.}
1. e4 e6 2. d4 d5 3. e5 c5 4. Qg4 {La dame vise g7 alors qu'aucune pièce mineure blanche n'est encore sortie.}
4... cxd4 {Prenez d'abord : d4 n'est plus soutenu par un pion. [%cal Gc5d4]}
5. Nf3 Nc6 6. Bd3 {Les Blancs sacrifient le pion d4 pour attaquer à l'aile roi.}
6... Qc7 {Deuxième attaquant contre e5, qui n'a qu'un défenseur. [%cal Gc7e5,Gc6e5]}
7. Bf4 {Le fou vient au secours de e5.}
(7. O-O? {Le roque oublie le pion e5.} 7... Nxe5 {Prenez : après 8.Nxe5 Qxe5, vous aurez deux pions de plus. [%cal Gc6e5]} 8. Nxe5 Qxe5 9. Bf4 Nf6 {Le cavalier se développe avec gain de temps sur la dame g4 ; votre avance matérielle est nette. [%cal Gf6g4]})
7... Nge7 8. O-O Ng6 {Le cavalier attaque le fou f4 et la case e5 une troisième fois. [%cal Gg6f4,Gg6e5]}
9. Bg3? {Le fou recule mais se place sur la route de votre pion h.}
(9. Bxg6 {La bonne décision : les Blancs cèdent la paire de fous pour garder e5.} 9... fxg6 {Reprenez vers le centre : la colonne f s'ouvre pour votre tour. [%cal Gf8f1]})
9... h5 {La dame est chassée, et …h4 menacera ensuite le fou g3. [%cal Gh5g4,Gh5h4]}
10. Qh3 Ngxe5 {Le pion e5 tombe enfin : la dame h3 ne défend rien au centre. [%cal Gg6e5]}
11. Nxe5 Nxe5 {Deux pions de plus et le fou g3 est toujours menacé par …h4.}`,
    conclusion:
      "Contre une dame sortie trop tôt et un pion e5 sans soutien, comptez les attaquants : …Qc7, …Nc6 et …Ng6 en mettent trois sur e5. Le pion h, lui, se charge de chasser la dame.",
  },
  {
    title: "Winawer : 5.Qg4 et le clouage …Qa5",
    eco: "C17",
    kind: "trap",
    objectives: [
      "Laisser g7 et h7 contre un gain de temps au centre",
      "Exploiter le clouage du cavalier c3",
      "Gagner la tour a1 après axb4",
    ],
    pgn: `{Dans la Winawer, votre fou b4 cloue le cavalier c3 contre le roi blanc. Si les Blancs prennent g7 et h7 trop tôt, ce clouage devient une arme : le pion c3 et la tour a1 deviennent des cibles.}
1. e4 e6 2. d4 d5 3. Nc3 Bb4 4. e5 c5 5. Qg4 {La dame attaque g7 dès le 5e coup.}
5... Ne7 {Développez sans défendre g7 : votre contre-jeu au centre sera plus rapide. [%cal Ge7f5]}
6. Qxg7 {La prise gourmande.}
(6. dxc5 {Plus prudent : les Blancs gardent leur pion d4 hors de portée.} 6... Nbc6 {Développement et pression sur e5. [%cal Gc6e5]} 7. Nf3 O-O {Votre roi est à l'abri : g7 est défendu par le roi et …f6 ou …f5 viendra contre e5.})
6... Rg8 7. Qxh7 cxd4 {Le pion d4 tombe et le cavalier c3 est toujours cloué. [%cal Gb4c3]}
8. a3 {Les Blancs veulent chasser le fou pour libérer le cavalier.}
8... Qa5 {Le clouage est renforcé : si le fou est pris, la tour a1 tombe. [%cal Ga5a1,Gb4c3]}
9. axb4 Qxa1 {La tour est gagnée ; la dame a1 vise aussi c1 et le cavalier c3 ne peut plus avancer.}
10. Nce2 Nbc6 {Développement avec la qualité de plus : vos pièces sont prêtes pour …Bd7 et le grand roque.}`,
    conclusion:
      "Le fou b4 de la Winawer ne cloue pas seulement un cavalier : il fige la position blanche. Tant que le cavalier c3 est cloué, chaque coup de pion blanc à l'aile dame peut ouvrir une diagonale vers a1.",
  },
];

export default {
  id: "french",
  name: "Défense française",
  description:
    "Une défense solide et combative : …e6 et …d5 contestent e4, puis …c5 et …f6 attaquent la chaîne de pions blanche. Répertoire complet : Winawer, Tarrasch 3…c5, Avance, Échange et attaque est-indienne.",
  side: "black",
  eco: ["C00", "C01", "C02", "C03", "C05", "C06", "C07", "C08", "C09", "C15", "C16", "C17", "C18", "C19"],
  chapters: [
    // =====================================================================================
    {
      title: "Les fondations",
      summary:
        "La structure e6-d5, les quatre grandes réponses blanches, la chaîne de pions, le « mauvais fou » et la rupture …f6.",
      stage: "foundations",
      lessons: [
        {
          title: "Défier e4 : la structure française",
          eco: "C00",
          kind: "concept",
          objectives: [
            "Comprendre pourquoi …e6 prépare …d5",
            "Reconnaître les quatre réponses blanches au 3e coup",
            "Connaître le premier coup du répertoire contre chacune",
          ],
          pgn: `{La Défense française repose sur une idée simple : préparer …d5 par …e6 pour contester e4 sans jamais accepter un pion isolé. Le prix à payer est connu d'avance : le fou c8 reste enfermé derrière le pion e6.}
1. e4 {Le pion central ouvre la diagonale du fou f1 et la dame.}
1... e6 {Un petit pas qui contrôle d5 et f5 : il ne menace rien, il prépare la poussée …d5. [%cal Ge6d5]}
2. d4 {Les Blancs installent le centre idéal, deux pions côte à côte.}
2... d5 {La frappe : e4 est attaqué. Les Blancs doivent choisir entre le défendre, l'avancer ou l'échanger ; toute la Française découle de ce choix. [%cal Gd5e4]}
3. Nc3 {La défense la plus ambitieuse : une pièce protège e4 et se développe.}
(3. Nd2 {La Tarrasch : le cavalier défend e4 sans pouvoir être cloué par …Bb4, et le pion c reste libre d'aller en c3.} 3... c5 {Frappez d4 tout de suite : avec le cavalier en d2 au lieu de c3, le centre blanc est moins bien soutenu. [%cal Gc5d4]})
(3. e5 {L'Avance : les Blancs prennent de l'espace et fixent une chaîne de pions d4-e5.} 3... c5 {Attaquez la base de la chaîne : si d4 tombe, e5 deviendra un pion faible. [%cal Gc5d4]})
(3. exd5 {L'Échange : position symétrique et calme, mais elle ouvre la diagonale de votre fou c8.} 3... exd5 {Reprenez du pion e : votre « mauvais fou » respire enfin et vise g4 ou f5. [%cal Gc8g4]})
3... Bb4 {La Winawer : le fou cloue le cavalier c3, qui ne défend plus vraiment e4 ; …dxe4 devient une menace. [%cal Gb4c3,Gd5e4]}`,
          conclusion:
            "Vous connaissez les quatre grandes réponses blanches au 3e coup et votre premier coup contre chacune. Les chapitres suivants approfondissent ces positions une à une.",
        },
        {
          legacyIds: ["french-m1"],
          title: "L'Avance : attaquer la base de la chaîne",
          eco: "C02",
          kind: "concept",
          objectives: [
            "Appliquer la règle de Nimzowitsch : viser la base d4",
            "Coordonner …c5, …Nc6 et …Qb6 contre d4",
            "Éviter le piège Bb5+ avant de prendre en d4",
          ],
          pgn: `{Après 3.e5, les Blancs disposent d'une chaîne de pions d4-e5 qui prive votre cavalier g8 de la case f6. Le plan noir est classique : attaquer la base de la chaîne, d4, avec le plus de pièces possible.}
1. e4 e6 2. d4 d5 3. e5 {La chaîne d4-e5 gagne de l'espace à l'aile roi.}
3... c5 {Le levier contre d4 : on attaque la chaîne là où elle est la plus difficile à défendre. [%cal Gc5d4]}
4. c3 {Le pion c3 soutient d4 : après …cxd4, cxd4 maintiendra la chaîne.}
4... Nc6 {Deuxième attaquant contre d4. [%cal Gc6d4]}
5. Nf3 {Le cavalier défend d4 à son tour.}
5... Qb6 {La dame ajoute un troisième attaquant et vise b2 : le fou c1 ne peut plus sortir sans abandonner ce pion. [%cal Gb6d4,Gb6b2]}
6. Bd3 {Les Blancs développent et préparent le roque, quitte à sacrifier d4.}
(6. a3 {Les Blancs préparent b4 pour gagner de l'espace et développer le fou par b2.} 6... c4 {Fermez l'aile dame : b4 sera contré par …cxb3 en passant, et la case b3 devient un avant-poste pour votre cavalier via a5. [%cal Gc6a5,Ga5b3]})
(6. Be2 {Plus prudent : le fou ne gêne pas la défense de d4 par la dame.} 6... cxd4 7. cxd4 Nh6 {Le cavalier passe par h6 pour rejoindre f5, d'où il frappe d4 sans être chassé par un pion. [%cal Gh6f5,Gf5d4]})
6... cxd4 7. cxd4 {d4 n'est plus défendu que par le cavalier f3 et la dame d1.}
7... Bd7 {Pas encore …Nxd4 : après 7…Nxd4? 8.Nxd4 Qxd4??, le coup 9.Bb5+ découvre la dame d1 sur la vôtre. Le fou contrôle d'abord la case b5. [%cal Gd7b5,Gd1d4]}`,
          conclusion:
            "Retenez la règle de l'Avance : on vise la base d4 avec …c5, …Nc6 et …Qb6, et l'on vérifie toujours la parade Bb5+ avant de prendre ce pion.",
        },
        {
          title: "Le « mauvais fou » : l'échanger par b5",
          eco: "C02",
          kind: "concept",
          objectives: [
            "Identifier le fou c8 comme le problème stratégique de la Française",
            "Connaître la manœuvre …Bd7-b5",
            "Savoir pourquoi l'échange des fous de cases blanches vous soulage",
          ],
          pgn: `{Avec des pions sur e6 et d5, votre fou c8 manque d'air : c'est le « mauvais fou » de la Française. Contre l'Avance, une idée élégante le règle d'un coup : l'échanger contre le bon fou blanc par la route d7-b5.}
1. e4 e6 2. d4 d5 3. e5 c5 4. c3 Qb6 {La dame attaque d4 et b2 avant même la sortie du cavalier c6. [%cal Gb6d4,Gb6b2]}
5. Nf3 {d4 est défendu et le cavalier se développe.}
5... Bd7 {Le fou prend la route d7-b5 : il cherche le fou f1, la meilleure pièce mineure blanche. [%cal Gd7b5]}
6. Be2 {Un développement sobre, qui ne s'oppose pas au plan noir.}
(6. Bd3 {Le fou vise h7 mais se place sur la route du vôtre.} 6... Bb5 {Proposez l'échange : sans son fou de cases blanches, l'attaque blanche sur h7 perd sa pièce maîtresse. [%cal Gb5d3]})
(6. a3 {Les Blancs préparent b4.} 6... Bb5 {Même idée, même case : le fou f1 n'est pas encore sorti, l'échange se fera en b5. [%cal Gb5f1]} 7. Bxb5+ Qxb5 {La dame reprend et s'installe sur les cases blanches de l'aile dame, que plus aucun fou blanc ne peut contester.})
6... Bb5 {Le fou est arrivé : il défie directement le fou e2. [%cal Gb5e2]}
7. O-O Bxe2 {Mission accomplie : il vous reste le fou f8, que vos pions ne gênent pas.}
8. Qxe2 Qa6 {Proposez l'échange des dames : sans elles, les cases blanches affaiblies du camp blanc et votre structure solide parlent pour vous. [%cal Ga6e2]}`,
          conclusion:
            "Le fou c8 n'est « mauvais » que s'il reste passif. Échangé en b5, il emporte avec lui le meilleur atout des Blancs pour l'attaque sur l'aile roi.",
        },
        {
          legacyIds: ["french-m4"],
          title: "La rupture …f6 : frapper la tête de la chaîne",
          eco: "C06",
          kind: "concept",
          objectives: [
            "Combiner les ruptures …c5 et …f6",
            "Savoir reprendre en f6 avec le cavalier",
            "Contrôler la case e5 avec …Bd6 et …Qc7",
          ],
          pgn: `{Contre 3.Nd2, le coup 3…Nf6 provoque e5 pour attaquer ensuite la chaîne des deux côtés : …c5 contre la base, …f6 contre la tête. C'est la Tarrasch fermée, le meilleur laboratoire pour comprendre la rupture …f6.}
1. e4 e6 2. d4 d5 3. Nd2 Nf6 {Attaquez e4 : le cavalier d2 ne le défend qu'une fois, les Blancs vont devoir avancer. [%cal Gf6e4]}
4. e5 {Le cavalier est chassé, la chaîne d4-e5 est en place.}
4... Nfd7 {Le cavalier recule en d7, d'où il soutiendra …c5 puis …f6. [%cal Gd7e5]}
5. Bd3 {Le fou vise h7 ; le cavalier g1 ira en e2 pour soutenir d4.}
(5. f4 {Les Blancs soutiennent e5 avec un pion : la chaîne est solide mais leur développement prend du retard.} 5... c5 6. c3 Nc6 7. Ndf3 Qb6 {Trois pièces contre d4 : le pion f4 renforce e5, pas la base de la chaîne. [%cal Gb6d4,Gc6d4,Gc5d4]})
5... c5 6. c3 Nc6 7. Ne2 {De e2, le cavalier protège d4 et laisse f3 libre pour l'autre cavalier.}
(7. Ngf3 {Plus naturel, mais d4 manquera d'un défenseur.} 7... Qb6 {Pression immédiate : d4 est attaqué trois fois. [%cal Gb6d4]} 8. O-O cxd4 9. cxd4 Nxd4 {Le pion tombe : les Blancs le sacrifient contre une avance de développement.} 10. Nxd4 Qxd4 11. Nf3 Qb6 {La dame se met à l'abri. Un pion de plus, à condition de terminer le développement sans précipitation. [%cal Gd4b6]})
7... cxd4 8. cxd4 f6 {La rupture : on attaque la tête de la chaîne. Après exf6, le cavalier reprend en f6 et votre centre redevient mobile. [%cal Gf6e5]}
9. exf6 Nxf6 {Le pion e6 est un peu isolé, mais vos pièces sont actives et d4 devient la cible. [%cal Gf6e4]}
10. Nf3 Bd6 {Le fou contrôle e5, la case clé : tant que les Blancs ne peuvent pas s'y installer, e6 n'est pas en danger. [%cal Gd6e5,Gd6h2]}
11. O-O Qc7 {Deuxième pièce sur e5, et la diagonale c7-h2 menace déjà le roi blanc. [%cal Gc7h2]}
12. Bg5 O-O 13. Bh4 Nh5 {Un coup de maître fréquent : le cavalier quitte f6, où le fou h4 le visait, et prépare …Nf4 contre le fou d3. [%cal Gh5f4]}`,
          conclusion:
            "La recette de la Tarrasch fermée : …c5 contre la base, …f6 contre la tête, puis une coordination des pièces autour de la case e5 pour soutenir le pion e6.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Plans typiques",
      summary:
        "Les manœuvres qui reviennent partout : le cavalier f5 contre d4, le verrou …c4, les cases noires de la Winawer et le jeu actif de la Tarrasch 3…c5.",
      stage: "plans",
      lessons: [
        {
          title: "Le cavalier en f5 : pression maximale sur d4",
          eco: "C02",
          kind: "line",
          objectives: [
            "Connaître la route …Nh6-f5",
            "Exploiter le clouage …Qa5+ et …Bb4",
            "Gagner de l'espace à l'aile dame avec …b5-b4",
          ],
          pgn: `{Quand d4 n'est plus soutenu par un pion c3, il devient la cible numéro un. Votre cavalier g8, gêné par le pion e5, emprunte la route h6-f5 : de là, il frappe d4 sans pouvoir être chassé par un pion.}
1. e4 e6 2. d4 d5 3. e5 c5 4. c3 Nc6 5. Nf3 Qb6 6. Be2 cxd4 7. cxd4 Nh6 {Le cavalier passe par h6 car f6 lui est interdit : sa destination est f5. [%cal Gh6f5]}
8. Nc3 {Développement naturel : le cavalier prépare Na4 contre votre dame.}
(8. Bxh6 {Les Blancs éliminent le cavalier avant qu'il n'arrive en f5.} 8... Qxb2 {Ne reprenez pas tout de suite : la dame prend b2 en attaquant la tour a1, et le fou h6 ne s'enfuira pas. [%cal Gb2a1]} 9. Nbd2 gxh6 {Vous récupérez la pièce avec un pion de plus. La structure de l'aile roi est abîmée, mais la colonne g ouverte et la paire de fous compensent largement. [%cal Gg8g2]})
8... Nf5 {Quatrième attaquant sur d4 : la pression est maximale. [%cal Gf5d4]}
9. Na4 {Le cavalier chasse la dame de la diagonale b6-d4.}
9... Qa5+ {Avec échec : la dame garde la diagonale a5-e1 et vise le cavalier a4. [%cal Ga5e1]}
10. Bd2 {Le fou s'interpose et affronte votre dame.}
(10. Nc3 {Les Blancs proposent la répétition.} 10... Qb6 {La dame revient en b6 : si 11.Na4 Qa5+, la position se répète. Une nulle bien connue que vous pouvez accepter.})
10... Bb4 {Le fou cloue le fou d2 et entre dans la bataille avec tempo. [%cal Gb4d2]}
11. Bc3 b5 {Le pion chasse le cavalier a4 : sur l'aile dame, toutes les pièces blanches sont mal placées. [%cal Gb5a4]}
12. a3 Bxc3+ 13. Nxc3 b4 {L'aile dame avance avec gain de temps sur le cavalier c3. [%cal Gb4c3]}
14. axb4 Qxb4 {La dame reprend et vise b2 et d4 à la fois : les Noirs ont un jeu très confortable. [%cal Gb4b2,Gb4d4]}`,
          conclusion:
            "Le duo …Nh6-f5 et …Qb6 transforme d4 en cible permanente. Quand les Blancs chassent la dame, …Qa5+ suivi de …Bb4 et …b5 renverse la vapeur à l'aile dame.",
        },
        {
          title: "Le verrou …c4 et la case b3",
          eco: "C02",
          kind: "line",
          objectives: [
            "Savoir quand fermer l'aile dame par …c4",
            "Installer le cavalier en a5 et viser b3",
            "Mettre le roi à l'abri par le grand roque",
          ],
          pgn: `{Contre 6.a3, qui prépare b4, on ferme l'aile dame par …c4. Le jeu devient stratégique : vos pièces visent les cases blanches b3 et c4, les Blancs cherchent un jeu à l'aile roi.}
1. e4 e6 2. d4 d5 3. e5 c5 4. c3 Nc6 5. Nf3 Qb6 6. a3 c4 {On bloque : b4 se heurtera à la prise en passant …cxb3, et la case b3 devient un trou dans le camp blanc. [%cal Gc4b3]}
7. Nbd2 {Le cavalier surveille b3 et c4, les cases que vos pièces convoitent.}
7... Na5 {Le cavalier s'installe en a5 : il vise b3 et soutient le pion c4. [%cal Ga5b3]}
8. Be2 {Développement sobre, le roque suivra.}
8... Bd7 {Le fou couvre b5 et libère la case c8 pour la manœuvre de votre autre cavalier. [%cal Gd7b5]}
9. O-O Ne7 {Le cavalier g8 se développe enfin : sa route favorite est c8-b6, vers les cases blanches de l'aile dame. [%cal Ge7c8,Gc8b6]}
10. Re1 {La tour soutient e5 et prépare Nf1-g3.}
(10. Rb1 {La tour prépare b4 malgré tout.} 10... Qc7 {La dame quitte la colonne b et libère b6 pour le cavalier. [%cal Gc7e5]} 11. Re1 Nc8 12. Nf1 Nb6 {Le cavalier a rejoint b6 : il contrôle a4, c4 et d5, et rend b4 encore plus difficile. [%cal Gb6a4]} 13. Bf4 h6 {Un petit coup utile qui prive le cavalier blanc de g5 avant de décider où ira le roi.})
10... h6 {Coup prophylactique : il interdit Ng5 et prépare le grand roque. [%cal Gh6g5]}
11. Rb1 O-O-O {Le roi se réfugie à l'aile dame, que la structure bloquée rend très sûre.}`,
          conclusion:
            "Avec …c4, vous figez l'aile dame : le cavalier en a5 ou b6, le fou en d7 et le roi en c8 forment un bloc très solide face au manque de ruptures blanches.",
        },
        {
          legacyIds: ["french-m2"],
          title: "La Winawer : pions doublés et cases noires",
          eco: "C18",
          kind: "line",
          objectives: [
            "Comprendre l'échange …Bxc3+ et ses conséquences",
            "Viser les pions c3 et a3 avec …Qa5 et …Bd7",
            "Préparer la rupture …f6 dans la Winawer",
          ],
          pgn: `{Dans la Winawer, vous échangez votre bon fou contre le cavalier c3 pour doubler les pions blancs. Les Blancs obtiennent la paire de fous et visent vos cases noires ; vous obtenez une structure saine et des cibles fixes en c3 et a3.}
1. e4 e6 2. d4 d5 3. Nc3 Bb4 4. e5 {La chaîne se ferme ; votre fou b4 garde son clouage.}
4... c5 {Le levier habituel contre d4, soutenu par le clouage du cavalier c3. [%cal Gc5d4]}
5. a3 {Les Blancs posent la question au fou.}
5... Bxc3+ {On cède le fou : les pions c doublés seront une faiblesse durable. [%cal Gb4c3]}
6. bxc3 Ne7 {Le cavalier va en e7 et non en f6 : il ne gêne pas le pion f et peut rejoindre f5 ou c6. [%cal Ge7f5]}
7. Nf3 {Le plan positionnel : développer, puis ouvrir le jeu avec a4 et Ba3.}
7... Bd7 {Le fou prépare …Qa5 et …Ba4 : on vise les pions c3 et c2. [%cal Gd7a4]}
8. a4 {Les Blancs empêchent …Ba4 et préparent Ba3, qui viserait votre roi.}
8... Qa5 {La dame cloue c3 et l'attaque : les Blancs doivent consacrer une pièce à sa défense. [%cal Ga5c3]}
9. Qd2 {Une défense solide, qui libère d1 et prépare Bd3.}
(9. Bd2 {Le fou défend c3 mais devient passif.} 9... Nbc6 {Développement avec une nouvelle attaque contre d4. [%cal Gc6d4]} 10. Be2 f6 {La rupture …f6 : on frappe e5 avant que les Blancs ne consolident. [%cal Gf6e5]})
9... Nbc6 10. Bd3 f6 {Toujours la même logique : …c5 contre la base, …f6 contre la tête. Votre roi restera au centre ou ira à l'aile dame selon l'ouverture des lignes. [%cal Gf6e5]}`,
          conclusion:
            "Dans la Winawer positionnelle, les pions c3-c2 et la rupture …f6 sont vos deux leviers ; les cases noires affaiblies, elles, sont le prix à surveiller.",
        },
        {
          legacyIds: ["french-m5"],
          title: "Tarrasch 3…c5 : le jeu actif contre 3.Nd2",
          eco: "C07",
          kind: "line",
          objectives: [
            "Jouer …c5 et …Qxd5 sans craindre la dame au centre",
            "Comprendre pourquoi …Qd6 est la bonne retraite",
            "Liquider d4 pour un jeu égal et actif",
          ],
          pgn: TARRASCH_BASIC,
          conclusion:
            "Contre 3.Nd2, 3…c5 et 4…Qxd5 donnent une position ouverte où vos pièces se développent librement : la dame en d6, le cavalier en f6 et le pion a6 suffisent à neutraliser l'avance blanche.",
        },
      ],
    },
    // =====================================================================================
    {
      title: "Réponses adverses",
      summary:
        "Ce que les Blancs jouent pour éviter vos lignes : l'Échange, l'attaque est-indienne, les déviations de la Winawer et de l'Avance.",
      stage: "responses",
      lessons: [
        {
          title: "La variante d'échange 3.exd5",
          eco: "C01",
          kind: "line",
          objectives: [
            "Jouer la structure symétrique sans passivité",
            "Développer le cavalier en e7 plutôt qu'en f6",
            "Répondre à 4.c4 en visant le pion isolé",
          ],
          pgn: `{L'Échange paraît inoffensif, mais il demande de la précision : la structure est symétrique et c'est le développement qui fera la différence. Bonne nouvelle : votre fou c8 n'est plus enfermé.}
1. e4 e6 2. d4 d5 3. exd5 exd5 {Reprenez du pion e : la diagonale c8-h3 s'ouvre. [%cal Gc8g4]}
4. Bd3 {Le fou vise h7 et empêche …Bf5.}
(4. c4 {Les Blancs déséquilibrent : après un échange en c4, ils auront un pion isolé en d4.} 4... Nf6 {Développement et pression sur d5. [%cal Gf6d5]} 5. Nc3 Be7 6. Nf3 O-O 7. Be2 dxc4 {On prend au bon moment : le fou a déjà bougé, il doit dépenser un temps pour reprendre. [%cal Gd5c4]} 8. Bxc4 Bg4 {Le clouage du cavalier f3 met la pression sur d4, le pion isolé. [%cal Gg4f3,Gf3d4]})
4... Bd6 {Le coup miroir : votre fou contrôle les mêmes diagonales que le sien. [%cal Gd6h2]}
5. Nf3 {Développement simple.}
(5. Qf3 {La dame vise d5 et f7 et empêche …Bg4.} 5... c6 {d5 est solidement soutenu et la dame blanche n'a plus de cible. [%cal Gc6d5]})
5... Ne7 {En e7, le cavalier ne peut pas être cloué par Bg5 et laisse le pion f libre ; il soutient aussi …Bf5. [%cal Ge7f5]}
6. O-O O-O {Les deux camps ont roqué : la partie se jouera sur l'activité des pièces et l'occupation des cases e4 et e5.}`,
          conclusion:
            "Dans l'Échange, ne cherchez pas à copier indéfiniment : Bd6, Ne7 et le roque donnent une base saine, puis …Bf5 ou …Bg4 activent le fou que la Française enferme d'habitude.",
        },
        {
          title: "L'attaque est-indienne et les coups secondaires",
          eco: "C00",
          kind: "line",
          objectives: [
            "Reconnaître le système 2.d3 / Nd2 / g3",
            "Placer le fou c8 sur la grande diagonale par …b6",
            "Répondre sobrement à 2.Qe2 et 2.Nf3",
          ],
          pgn: `{Certains adversaires évitent la théorie dès le 2e coup. Contre ces systèmes, gardez la logique française : occuper le centre, puis développer chaque pièce sur sa meilleure case.}
1. e4 e6 2. d3 {L'attaque est-indienne : les Blancs préparent Nd2, g3 et Bg2, puis e5 et une attaque sur l'aile roi.}
(2. Qe2 {La dame soutient e4 et prépare un système fermé avec d3, g3 et Bg2 ; après …d5 et exd5, la colonne e s'ouvrirait vers votre roi.} 2... c5 {Prenez de l'espace autrement : …c5 contrôle d4 et prépare …Nc6. [%cal Gc5d4]} 3. Nf3 Nc6 {Le cavalier rejoint d4 et e5 ; vous obtenez une Sicilienne fermée confortable. [%cal Gc6d4]})
(2. Nf3 {Un ordre de coups souple qui attend votre …d5.} 2... d5 3. Nc3 Nf6 {Attaquez e4 tout de suite : le cavalier c3 est seul à le défendre. [%cal Gf6e4]} 4. e5 Nfd7 5. d4 c5 {On retrouve les plans connus : …c5 contre la base de la chaîne. [%cal Gc5d4]})
2... d5 3. Nd2 Nf6 4. Ngf3 b6 {Le fou c8 ira en b7 : dans ce système, il devient une excellente pièce sur la grande diagonale. [%cal Gc8b7,Gb7e4]}
5. g3 dxe4 {L'échange ouvre la diagonale de votre futur fou b7. [%cal Gd5e4]}
6. dxe4 Bb7 {Le fou frappe e4 immédiatement. [%cal Gb7e4]}
7. Qe2 Nc6 {Le cavalier pèse sur d4 et e5 et prépare …Bc5, actif et naturel. [%cal Gc6d4]}`,
          conclusion:
            "Face aux systèmes fermés, la clé est le fou c8 : par …b6 et …Bb7, il prend la grande diagonale que les Blancs laissent sans défenseur.",
        },
        {
          title: "Winawer : les déviations au 4e et 5e coup",
          eco: "C15",
          kind: "line",
          objectives: [
            "Répondre à 4.Ne2 et 4.exd5",
            "Gérer 5.Bd2 et l'incursion Nb5",
            "Ne pas céder le fou sans raison",
          ],
          pgn: `{Tous les adversaires ne suivent pas la ligne principale 4.e5 c5 5.a3. Chaque déviation a sa réponse simple ; l'essentiel est de savoir quand garder votre fou b4 et quand le céder.}
1. e4 e6 2. d4 d5 3. Nc3 Bb4 4. e5 {La ligne principale, mais le 5e coup blanc réserve une surprise.}
(4. Ne2 {Le cavalier libère c3 du clouage, mais e4 n'est plus défendu.} 4... dxe4 {Prenez : e4 n'est plus protégé. [%cal Gd5e4]} 5. a3 Be7 {Le fou recule : il n'y a aucune raison de céder la paire de fous ici. [%cal Gb4e7]} 6. Nxe4 Nf6 {Le cavalier défie le cavalier e4 : on obtient une position solide, très proche de la Rubinstein. [%cal Gf6e4]} 7. N2g3 O-O)
(4. exd5 {L'échange, mais avec votre fou déjà actif en b4.} 4... exd5 5. Bd3 Nc6 {Le cavalier pèse sur d4 et peut sauter en b4 contre le fou d3. [%cal Gc6d4,Gc6b4]} 6. a3 Bxc3+ 7. bxc3 Nge7 {Le cavalier couvre f5 et prépare le roque.} 8. Qh5 Be6 {Le fou c8 sort sans entrave et contrôle f5 ; votre roi sera bientôt à l'abri. [%cal Ge6f5]})
4... c5 5. Bd2 {Les Blancs évitent les pions doublés : le fou couvre c3.}
5... Ne7 {Développement d'abord : le cavalier est prêt pour f5 ou c6. [%cal Ge7f5]}
6. Nb5 {Le cavalier menace d6 si votre fou disparaît.}
6... Bxd2+ {Échangez maintenant : le fou d2 ne pourra plus soutenir l'incursion. [%cal Gb4d2]}
7. Qxd2 O-O {Le roque, puis …a6 chassera le cavalier b5.}
8. dxc5 {Les Blancs prennent le pion pour garder la case d4.}
(8. f4 {e5 est consolidé et l'aile roi se met en mouvement.} 8... a6 {Le cavalier b5 doit reculer, et …Nbc6 suivra. [%cal Ga6b5]})
8... Nd7 {Le cavalier reprend c5 au coup suivant et frappe e5 en même temps. [%cal Gd7c5]}`,
          conclusion:
            "Contre les déviations de la Winawer, gardez la logique : on prend e4 quand il est lâché, on conserve le fou quand rien ne force l'échange, et on le donne dès qu'il gêne une incursion.",
        },
        {
          title: "L'Avance : 4.Nf3 et 4.dxc5",
          eco: "C02",
          kind: "line",
          objectives: ADVANCE_SIDELINES_OBJECTIVES,
          pgn: ADVANCE_SIDELINES,
          conclusion: ADVANCE_SIDELINES_END,
        },
      ],
    },
    // =====================================================================================
    {
      title: "Pièges",
      summary: "Les pièges à éviter et ceux à tendre : quand une erreur de développement coûte une pièce ou la partie.",
      stage: "traps",
      lessons: TRAPS,
    },
    // =====================================================================================
    {
      title: "Grande théorie",
      summary:
        "Les lignes profondes qu'un joueur de Française doit connaître : le pion empoisonné, l'attaque 7.h4, la Tarrasch 3…c5 et le gambit Milner-Barry.",
      stage: "theory",
      lessons: [
        {
          legacyIds: ["french-m3"],
          title: "Winawer : le pion empoisonné 7.Qg4 Qc7",
          eco: "C18",
          kind: "line",
          objectives: [
            "Laisser g7 et h7 pour frapper c3 et d4",
            "Coordonner …Nbc6, …Bd7 et le grand roque",
            "Connaître les deux reprises 13.Qxc3 et 13.Nxc3",
          ],
          pgn: `{La ligne la plus tranchante de la Winawer. Les Blancs prennent g7 et h7 ; vous ripostez au centre contre c3 et d4, et votre roi trouvera refuge à l'aile dame. Chaque coup compte.}
1. e4 e6 2. d4 d5 3. Nc3 Bb4 4. e5 c5 5. a3 Bxc3+ 6. bxc3 Ne7 7. Qg4 {La dame attaque g7, que votre fou ne défend plus.}
7... Qc7 {Contre-attaque immédiate : vous abandonnez g7 et frappez c3 et e5. [%cal Gc7c3,Gc7e5]}
8. Qxg7 Rg8 {La tour chasse la dame et s'installe sur la colonne g ouverte. [%cal Gg8g2]}
9. Qxh7 cxd4 {Deux pions contre un centre démoli : d4 tombe et c3 est menacé. [%cal Gd4c3]}
10. Ne2 {Le cavalier protège c3 et prépare f4 pour soutenir e5.}
10... Nbc6 {Développement avec pression sur e5. [%cal Gc6e5]}
11. f4 {e5 est consolidé ; le pion h devient l'arme des Blancs.}
11... Bd7 {Le fou prépare le grand roque : votre roi sera à l'abri à l'aile dame. [%cal Gd7c8]}
12. Qd3 dxc3 {Le pion c3 tombe : la partie est rééquilibrée sur le plan matériel.}
13. Qxc3 {La dame reprend et vise votre roi sur la colonne c.}
(13. Nxc3 {Le cavalier reprend et vise les cases b5 et d5.} 13... a6 {Interdisez b5 avant tout : le cavalier blanc ne doit pas y sauter. [%cal Ga6b5]} 14. Rb1 Na5 {Le cavalier vise c4, case idéale face aux pions blancs affaiblis. [%cal Ga5c4]} 15. h4 Nf5 16. Rh3 O-O-O {Le roi rejoint l'aile dame et les tours sont reliées.})
13... Nf5 {Le cavalier rejoint f5, d'où il bloque l'aile roi et vise d4. [%cal Gf5d4]}
14. Rb1 d4 {Le pion d ouvre la diagonale du fou d7 et chasse la dame. [%cal Gd5d4]}
15. Qd3 O-O-O {Le roi est à l'abri et la tour d8 soutient le pion d4.}
16. Rg1 Na5 {Le cavalier vise c4 et b3 : votre jeu se déroule à l'aile dame. [%cal Ga5c4]}`,
          conclusion:
            "Le pion empoisonné est un échange de faiblesses : vous perdez l'aile roi, les Blancs perdent leur centre. Votre roi en c8 et vos pièces sur c4, f5 et d4 doivent aller plus vite que le pion h blanc.",
        },
        {
          title: "Winawer : l'attaque 7.h4",
          eco: "C18",
          kind: "line",
          objectives: WINAWER_H4_OBJECTIVES,
          pgn: WINAWER_H4,
          conclusion: WINAWER_H4_END,
        },
        {
          title: "Tarrasch 3…c5 : la grande ligne 4.exd5 Qxd5",
          eco: "C07",
          kind: "line",
          objectives: TARRASCH_DEEP_OBJECTIVES,
          pgn: TARRASCH_DEEP,
          conclusion: TARRASCH_DEEP_END,
        },
        {
          title: "L'Avance : le gambit Milner-Barry",
          eco: "C02",
          kind: "line",
          objectives: [
            "Accepter le pion d4 au bon moment",
            "Interdire b5 et neutraliser le fou d3",
            "Rendre du matériel pour désamorcer l'initiative",
          ],
          pgn: `{Le gambit Milner-Barry est le prolongement direct du piège Bb5+ : une fois le fou en d7, les Blancs offrent vraiment le pion d4 contre une avance de développement. Il faut savoir le prendre, puis survivre aux premiers coups.}
1. e4 e6 2. d4 d5 3. e5 c5 4. c3 Nc6 5. Nf3 Qb6 6. Bd3 cxd4 7. cxd4 Bd7 8. O-O {Le gambit : d4 est offert.}
8... Nxd4 {Maintenant c'est sans risque : avec le fou en d7, Bb5+ ne gagne plus rien. [%cal Gc6d4]}
9. Nxd4 Qxd4 10. Nc3 {Le cavalier menace Nb5, qui viserait d6 et c7.}
10... a6 {Indispensable : la case b5 est interdite au cavalier. [%cal Ga6b5]}
11. Qe2 {La dame quitte la colonne d et prépare Rd1 contre votre dame.}
(11. Re1 {La tour soutient e5 et prépare Be3 avec tempo.} 11... Ne7 12. Be3 Qxe5 {Un deuxième pion : le fou e3 a quitté la défense de e5. Il faudra roquer rapidement, mais deux pions de plus valent ce risque. [%cal Gd4e5]})
11... Ne7 {Le cavalier rejoint c6 par e7 : il défendra la dame et la case e5. [%cal Ge7c6]}
12. Kh1 {Le roi quitte la diagonale a7-g1 avant f4.}
12... Nc6 13. f4 {e5 est consolidé ; les Blancs veulent f5 pour ouvrir la position.}
13... Nb4 {Le cavalier attaque le fou d3, la meilleure pièce d'attaque blanche. [%cal Gb4d3]}
14. Rd1 Nxd3 15. Rxd3 Qb6 {La dame recule avec un pion de plus. Les Blancs gardent de l'initiative, mais sans le fou d3 elle a perdu beaucoup de mordant. [%cal Gd4b6]}`,
          conclusion:
            "Contre le Milner-Barry : …Bd7 d'abord, …Nxd4 ensuite, …a6 pour interdire b5 et …Nb4 pour échanger le fou d3. Le pion de plus compte moins que la neutralisation de l'attaque.",
        },
      ],
    },
  ],
};
