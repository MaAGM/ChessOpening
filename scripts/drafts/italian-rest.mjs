// Suite du brouillon « Partie italienne » : chapitres 3 à 5.

export const RESPONSES = [
  {
    title: "3…Nf6 4.d3 : les Deux Cavaliers tranquilles",
    eco: "C55",
    kind: "line",
    objectives: [
      "Répondre à 3…Nf6 sans entrer dans la théorie forcée",
      "Garder le fou c4 face à …Na5 grâce à a4 et Ba2",
      "Connaître les systèmes …h6 et …g6 des Noirs",
    ],
    pgn: `{Contre 3…Nf6, le coup 4.d3 protège e4 et garde la structure du Pianissimo. Les Noirs choisissent souvent un fou en e7, plus modeste qu'en c5 : votre plan reste le même, avec une attention particulière au fou c4.}
1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. d3 {Le pion soutient e4 : …Nxe4 n'est plus possible. [%cal Gd3e4]}
4... Be7 {Le fou reste à l'abri de d4 et de b4.}
(4... Bc5 {Les Noirs reviennent au Giuoco.} 5. c3 {Par interversion, vous retrouvez le Pianissimo des chapitres précédents. [%cal Gc3d4]})
(4... h6 {Les Noirs interdisent Ng5 et Bg5 avant de décider de la place de leur fou.} 5. O-O d6 6. c3 g6 {Le fou ira en g7, derrière le pion e5.} (6... g5 {Une expansion agressive : le pion veut chasser le cavalier f3 par …g4.} 7. Nbd2 Bg7 {Le roi noir restera au centre ; ouvrez le jeu avec d4 dès que possible. [%cal Gd3d4]}) 7. Re1 Bg7 8. Nbd2 {Le cavalier rejoint f1 : la route Nbd2-f1-g3 est la même que dans le Pianissimo. [%cal Gd2f1]})
5. O-O O-O 6. Re1 d6 7. a4 {Le pion prépare la retraite a2 pour le fou si …Na5 le chasse. [%cal Gc4a2]}
7... Na5 {Le cavalier chasse le fou c4.}
(7... Be6 {Les Noirs proposent l'échange des fous.} 8. Nbd2 {Si …Bxc4, le cavalier reprendra et visera e3 et d5. [%cal Gd2c4]} 8... Qd7 {La dame relie les tours ; le fou e6 attend.})
8. Ba2 {Le fou garde la diagonale a2-g8 : il vise toujours f7. [%cal Ga2f7]}
8... c5 {Les Noirs gagnent de l'espace et préparent …Nc6.}
9. c3 {Le pion prépare b4 contre le cavalier a5 et d4 au centre. [%cal Gc3d4]}`,
    conclusion:
      "Face à 3…Nf6, 4.d3 mène à un Pianissimo où le fou e7 noir est moins actif qu'en c5. Avec a4 puis Ba2, votre fou de cases blanches échappe à …Na5 sans quitter la diagonale de f7.",
  },
  {
    title: "La Défense hongroise 3…Be7",
    eco: "C50",
    kind: "line",
    objectives: [
      "Prendre le centre par d4 contre un fou passif",
      "Exploiter la dame en h5 pour gagner e5",
      "Empêcher le roque noir par Bh6",
    ],
    pgn: `{La Défense hongroise évite toute la théorie du Giuoco : le fou e7 se contente de défendre. Contre une réponse aussi passive, les Blancs ouvrent le centre et cherchent l'initiative.}
1. e4 e5 2. Nf3 Nc6 3. Bc4 Be7 4. d4 {La poussée centrale, sans préparation : le fou e7 ne gêne pas d4. [%cal Gd4e5]}
4... d6 {Les Noirs soutiennent e5.}
(4... exd4 5. Nxd4 {Reprenez avec le cavalier : il est centralisé et vise f5 et b5. [%cal Gd4f5]} 5... d6 6. O-O Nf6 7. Nc3 O-O 8. Re1 {Toutes vos pièces sont développées et la colonne e appuie e4 : les Noirs sont à l'étroit. [%cal Ge1e4]})
5. dxe5 {Ouvrez la colonne d et provoquez les échanges.}
5... Nxe5
(5... dxe5 6. Qxd8+ {L'échange des dames empêche les Noirs de roquer.} 6... Bxd8 7. Nc3 Nf6 8. Be3 {Une finale sans dames où votre développement supérieur vous donne l'initiative. [%cal Ge3c5]})
6. Nxe5 dxe5 7. Qh5 {La dame attaque e5 et f7 en même temps. [%cal Gh5e5,Gh5f7]}
7... g6 {Les Noirs défendent f7 mais abandonnent e5.}
8. Qxe5 Nf6 9. Bh6 {Le fou empêche le roque : le roi noir est cloué au centre, avec un pion de moins. [%cal Gh6f8]}`,
    conclusion:
      "Contre la Hongroise, ouvrez le centre : 4.d4 puis dxe5 provoque des échanges qui laissent le roi noir au centre. La dame en h5, qui frappe e5 et f7, est la clé de la ligne principale.",
  },
  {
    title: "Les coups rares : 3…d6 et 3…g6",
    eco: "C50",
    kind: "line",
    objectives: [
      "Prendre le centre contre les défenses passives",
      "Reprendre en d4 avec le cavalier",
      "Supprimer le clouage …Bg4 par h3",
    ],
    pgn: `{Contre 3…d6 ou 3…g6, les Noirs renoncent à contester le centre tout de suite. La réponse la plus nette est 4.d4 : vous obtenez plus d'espace et un développement plus rapide.}
1. e4 e5 2. Nf3 Nc6 3. Bc4 d6 {La Défense Semi-italienne : solide, mais elle enferme le fou f8.}
(3... g6 {Le fou ira en g7, mais f7 reste fragile.} 4. d4 exd4 5. Nxd4 Bg7 6. Be3 {Le fou protège d4 : vous avez un centre libre et une avance de développement. [%cal Ge3d4]})
4. d4 {Le centre s'ouvre pendant que le fou f8 est encore enfermé. [%cal Gd4e5]}
4... exd4
(4... Bg4 {Les Noirs clouent le cavalier qui défend d4.} 5. h3 {Posez la question au fou tout de suite. [%cal Gh3g4]} 5... Bxf3 6. Qxf3 {Vous avez la paire de fous et une dame active qui vise f7 et b7. [%cal Gf3f7]})
5. Nxd4 {Le cavalier centralisé contrôle e6, f5 et b5. [%cal Gd4f5,Gd4b5]}
5... Nf6 6. Nc3 Be7 7. O-O {Le roque : vous avez un avantage d'espace classique, les Noirs une position solide mais passive.}
7... O-O 8. Re1 {La tour soutient e4 avant toute rupture noire. [%cal Ge1e4]}
8... Nxd4 9. Qxd4 {La dame centralisée domine : les Noirs chercheront …Ng4 ou …c6 pour se libérer.}`,
    conclusion:
      "Contre les défenses qui retardent le jeu central, 4.d4 suffit : reprenez en d4 avec le cavalier, développez-vous et roquez. L'espace gagné est un avantage durable.",
  },
  {
    title: "Les déviations du 4e coup : 4…Qe7 et 4…d6",
    eco: "C53",
    kind: "line",
    objectives: [
      "Jouer d4 contre la défense …Qe7",
      "Soutenir le centre avec h3 et Re1",
      "Reconnaître l'interversion 4…Bb6",
    ],
    pgn: `{Après 4.c3, les Noirs ne jouent pas toujours 4…Nf6. Les coups 4…Qe7 et 4…d6 défendent e5 à l'avance : la poussée d4 reste possible, mais elle ne gagne plus rien de force. Les Blancs prennent alors l'espace.}
1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Qe7 {La dame soutient e5 : après d4, les Noirs garderont un pion en e5.}
(4... Bb6 {Le fou recule par anticipation.} 5. d4 Qe7 6. O-O {Par interversion, on rejoint la ligne de 4…Qe7. [%cal Gd4e5]})
(4... d6 {Une défense solide de e5.} 5. d4 exd4 6. cxd4 Bb6 {Le fou garde la diagonale contre f2.} 7. h3 {Le pion interdit …Bg4, qui clouerait le défenseur de d4. [%cal Gh3g4]} 7... Nf6 8. Nc3 O-O 9. O-O {Le centre e4-d4 est soutenu par toutes vos pièces : c'est l'idéal du Giuoco Piano.})
5. d4 Bb6 6. O-O d6 7. h3 {Le cavalier f3 ne sera jamais cloué. [%cal Gh3g4]}
7... Nf6 8. Re1 {La tour soutient e4 : vous maintenez la tension centrale, et Na3-c2 ou a4 suivront. [%cal Ge1e4]}`,
    conclusion:
      "Contre 4…Qe7 ou 4…d6, ne cherchez pas un gain immédiat : d4, h3 et Re1 donnent aux Blancs un centre solide et plus d'espace, sans jamais laisser le cavalier f3 se faire clouer.",
  },
];

export const TRAPS = [
  {
    title: "Le piège Blackburne-Shilling : 3…Nd4",
    eco: "C50",
    kind: "trap",
    objectives: [
      "Ne pas prendre le pion e5 après 3…Nd4",
      "Échanger le cavalier d4 puis attaquer le pion d4",
      "Punir 5…Bc5? par Bxf7+ et Qh5+",
    ],
    pgn: `{Le coup 3…Nd4 est un piège célèbre : si 4.Nxe5?, alors 4…Qg5! attaque e5 et g2, et la ligne 5.Nxf7?? Qxg2 6.Rf1 Qxe4+ 7.Be2 Nf3# se termine par un mat. La réponse saine est simple.}
1. e4 e5 2. Nf3 Nc6 3. Bc4 Nd4 {Le cavalier attaque f3 et laisse e5 en apparence sans défense.}
4. Nxd4 {Échangez : le pion e5 était un appât, le cavalier d4 était la vraie cible. [%cal Gf3d4]}
4... exd4 5. c3 {Attaquez le pion d4 : il est isolé loin de son camp. [%cal Gc3d4]}
5... Bc5? {Le fou défend d4, mais le roi noir est exposé.}
(5... dxc3 6. Nxc3 {Vous avez une avance de développement nette : le fou c4 et la dame visent f7. [%cal Gc4f7]} 6... d6 7. Qb3 {La dame attaque f7 et b7 : les Noirs ne peuvent pas tout défendre. [%cal Gb3f7,Gb3b7]})
6. Bxf7+ {Le sacrifice : le roi doit prendre et l'échec suivant fourchette le roi et le fou c5. [%cal Gc4f7]}
6... Kxf7 7. Qh5+ {La fourchette : la dame donne l'échec et attaque le fou c5. [%cal Gh5c5]}
7... g6 8. Qxc5 {Vous récupérez la pièce avec un pion de plus, et le roi noir a perdu le droit de roquer.}
8... Nf6 9. Qxd4 {Un deuxième pion tombe : la dame centralisée surveille aussi f6 et h8. [%cal Gd4f6]}
9... d5 10. e5 {Le pion chasse le cavalier : l'avantage blanc est décisif. [%cal Ge5f6]}`,
    conclusion:
      "Contre 3…Nd4, ne mordez jamais à l'appât e5 : 4.Nxd4 exd4 5.c3 donne un bon jeu. Et si le fou noir vient défendre d4 en c5, la fourchette Bxf7+ puis Qh5+ gagne un pion.",
  },
  {
    title: "4.Ng5 : quand les Noirs oublient f7",
    eco: "C57",
    kind: "trap",
    objectives: [
      "Identifier les coups qui ne défendent pas f7",
      "Gagner la qualité par Nxf7",
      "Sacrifier en f7 pour chasser le roi",
    ],
    pgn: `{Après 4.Ng5, seule la riposte …d5 défend correctement f7. Les autres coups, même naturels, laissent le pion f7 sous le feu du cavalier et du fou : il faut savoir en profiter immédiatement.}
1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. Ng5 {Deux pièces contre f7, défendu par le seul roi. [%cal Gg5f7,Gc4f7]}
4... h6? {Les Noirs chassent le cavalier, mais trop tard.}
(4... Na5? {Le cavalier attaque le fou, mais f7 tombe d'abord.} 5. Bxf7+ {Avec échec : le fou n'est plus en prise. [%cal Gc4f7]} 5... Ke7 6. d4 {Le centre s'ouvre devant un roi noir qui ne pourra plus roquer. [%cal Gd4e5]})
(4... Nxe4? {Les Noirs prennent un pion central au lieu de défendre.} 5. Bxf7+ {Le roi est chassé de sa case. [%cal Gc4f7]} 5... Ke7 6. d4 {Le pion d4 ouvre la diagonale du fou c1 vers g5 et attaque e5.})
(4... b5? {Un contre-gambit qui ne résout rien.} 5. Bxf7+ Ke7 6. Bb3 {Le fou se replie avec un pion de plus, et le roi noir est en plein centre. [%cal Gb3f7]})
5. Nxf7 {Le cavalier attaque la dame d8 et la tour h8 en même temps. [%cal Gf7d8,Gf7h8]}
5... Qe7 6. Nxh8 {La tour est gagnée : la qualité et un pion de plus.}
6... d5 7. exd5 {Le pion reprend en d5 : le cavalier h8 est piégé, mais il a déjà coûté une tour aux Noirs.}
7... Nd4 8. c3 {Le cavalier d4 est chassé : vous gardez un avantage matériel décisif. [%cal Gc3d4]}
8... Bg4 9. f3 {Le pion repousse le fou et ferme la diagonale vers la dame d1. [%cal Gf3g4]}
9... Nxf3+ 10. gxf3 {Le sacrifice noir ne donne rien : vous avez une tour de plus pour un cavalier.}`,
    conclusion:
      "Après 4.Ng5, seul …d5 défend f7. Contre toute autre réponse, cherchez Nxf7 ou Bxf7+ : la case f7 est le talon d'Achille du camp noir.",
  },
  {
    title: "Le piège de Légal",
    eco: "C50",
    kind: "trap",
    objectives: [
      "Exploiter un clouage qui n'en est pas un",
      "Sacrifier la dame contre un mat",
      "Gagner un pion quand les Noirs évitent le mat",
    ],
    pgn: `{Le piège de Légal date du XVIIIe siècle et reste efficace : le fou noir cloue le cavalier f3 contre la dame, mais ce clouage n'est pas absolu. Le cavalier peut bouger, et la dame peut être sacrifiée.}
1. e4 e5 2. Nf3 Nc6 3. Bc4 d6 4. Nc3 {Le cavalier contrôle d5, une case essentielle du mat à venir. [%cal Gc3d5]}
4... Bg4 {Le fou cloue le cavalier f3.}
5. h3 {Posez la question au fou.}
5... Bh5? {Le fou garde le clouage… qui n'en est pas un.}
6. Nxe5 {Le cavalier abandonne la dame : prendre en d1 coûtera le mat aux Noirs. [%cal Gf3e5]}
6... Nxe5 {La meilleure défense noire : le cavalier élimine le vôtre.}
(6... Bxd1?? 7. Bxf7+ {Le roi est chassé de e8.} 7... Ke7 8. Nd5# {Mat : le cavalier e5, le fou f7 et le cavalier d5 couvrent toutes les cases du roi.})
(6... dxe5 7. Qxh5 {La dame reprend le fou : vous avez un pion de plus et la dame vise f7. [%cal Gh5f7]})
7. Qxh5 {La dame reprend le fou et attaque le cavalier e5 et f7. [%cal Gh5e5,Gh5f7]}
7... Nxc4 8. Qb5+ {La fourchette : échec et attaque du cavalier c4. [%cal Gb5c4]}
8... c6 9. Qxc4 {La pièce est récupérée : vous avez un pion de plus et une meilleure structure.}`,
    conclusion:
      "Un clouage contre la dame n'est pas un clouage contre le roi : si la pièce clouée peut bouger avec une menace plus forte, faites-le. Le piège de Légal se termine par un mat ou par un pion gagné.",
  },
  {
    title: "Giuoco Piano : 7…Nxe4 et le coup Bxf7+",
    eco: "C54",
    kind: "trap",
    objectives: [
      "Répondre à 7…Nxe4 par l'échange en b4",
      "Récupérer la pièce par Bxf7+ et Qb3+",
      "Punir 8…d5? par le clouage Bb5",
    ],
    pgn: `{Après 6…Bb4+ 7.Bd2, les Noirs peuvent prendre e4 avec le cavalier. Ce gain de pion déclenche une petite combinaison : un sacrifice en f7 puis un échec en b3 rétablissent l'équilibre, et la moindre imprécision noire coûte une pièce.}
1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d4 exd4 6. cxd4 Bb4+ 7. Bd2 Nxe4 {Les Noirs prennent le pion central.}
8. Bxb4 {Éliminez le fou : le cavalier c6 devra reprendre et quitter la défense de e5 et d4. [%cal Gd2b4]}
8... d5? {Les Noirs attaquent le fou c4 au lieu de reprendre.}
(8... Nxb4 {La reprise naturelle.} 9. Bxf7+ {Le sacrifice déplace le roi et ouvre la diagonale b3-f7. [%cal Gc4f7]} 9... Kxf7 10. Qb3+ {La dame donne l'échec et attaque le cavalier b4 : la pièce est récupérée. [%cal Gb3b4]} 10... d5 11. Ne5+ {Le cavalier chasse le roi avant que la dame ne reprenne en b4.} 11... Ke6 12. Qxb4 {Le matériel est égal, et le roi noir en e6 reste une cible pour vos pièces. [%cal Gb4e7]})
9. Bb5 {Le fou échappe à l'attaque et cloue le cavalier c6 : les Noirs ont deux pièces en l'air. [%cal Gb5c6,Gb5e8]}
9... Qf6 10. O-O {Le roi se met à l'abri ; le fou b4 et le clouage en c6 vous laissent une pièce de plus.}`,
    conclusion:
      "Après 7…Nxe4, échangez en b4 puis cherchez Bxf7+ suivi de Qb3+ : la dame récupère le cavalier b4. Si les Noirs jouent …d5 au lieu de reprendre, Bb5 cloue le cavalier c6 et gagne une pièce.",
  },
];

export const THEORY = [
  {
    legacyIds: ["italian-m3"],
    title: "L'attaque Møller : 7.Nc3 Nxe4 8.O-O",
    eco: "C54",
    kind: "line",
    objectives: [
      "Sacrifier le pion e4 pour l'initiative",
      "Jouer 9.d5 pour gagner du temps contre les pièces noires",
      "Connaître la ligne forcée jusqu'au double clouage en e7",
    ],
    pgn: `{L'attaque Møller est la réponse la plus ambitieuse à 6…Bb4+ : les Blancs donnent un pion, puis le cavalier c3, pour ouvrir la colonne e et chasser les pièces noires avec le pion d.}
1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d4 exd4 6. cxd4 Bb4+ 7. Nc3 {Le cavalier s'interpose et laisse e4 sans défense.}
7... Nxe4 8. O-O {Le gambit : le roi se met à l'abri, la tour rejoint la colonne e.}
8... Bxc3 9. d5 {Le cœur de l'attaque : le pion chasse le cavalier c6 au lieu de reprendre en c3. [%cal Gd4d5]}
9... Bf6 {Le fou se replie vers la défense de l'aile roi.}
(9... Ne5 {Le cavalier va au centre.} 10. bxc3 Nxc4 11. Qd4 {La dame attaque les deux cavaliers et g7 : les Noirs doivent rendre du matériel. [%cal Gd4c4,Gd4e4,Gd4g7]} 11... O-O 12. Qxe4 {Vous récupérez une pièce, et les Noirs doivent encore développer leur aile dame.})
10. Re1 Ne7 11. Rxe4 d6 12. Bg5 {Échangez le défenseur noir de l'aile roi. [%cal Gg5f6]}
12... Bxg5 13. Nxg5 h6 {Les Noirs chassent le cavalier.}
(13... O-O 14. Nxh7 {Le sacrifice classique : la diagonale vers h7 et la colonne h s'ouvrent. [%cal Gg5h7]} 14... Kxh7 15. Qh5+ {La dame entre avec échec ; la tour suivra par h4. [%cal Ge4h4]})
14. Qe2 {Le clouage sur la colonne e : le cavalier e7 ne peut pas bouger. [%cal Ge2e7]}
14... hxg5 15. Re1 {La deuxième tour s'ajoute au clouage : les Noirs doivent rendre du matériel pour débloquer le cavalier e7. [%cal Ge1e7]}`,
    conclusion:
      "L'attaque Møller échange du matériel contre du temps : 9.d5, Re1, Bg5 puis le clouage Qe2 forcent les Noirs à rendre ce qu'ils ont pris. La suite habituelle 15…Be6 16.dxe6 f6 17.Re3 mène à une position dynamiquement équilibrée.",
  },
  {
    legacyIds: ["italian-m5"],
    title: "Le gambit Evans 4.b4",
    eco: "C51",
    kind: "line",
    objectives: [
      "Sacrifier le pion b4 pour gagner du temps",
      "Construire le centre c3-d4 avec tempo",
      "Viser f7 et b7 avec Qb3",
    ],
    pgn: `{Le gambit Evans sacrifie un pion pour une idée simple : chasser le fou c5 avec gain de temps, puis jouer c3 et d4. Les Blancs obtiennent un centre et une avance de développement.}
1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. b4 {Le pion est offert pour dévier le fou de la diagonale g1-a7. [%cal Gb4c5]}
4... Bxb4
(4... Bb6 {Les Noirs déclinent le gambit.} 5. a4 {Le pion menace a5, qui piégerait le fou. [%cal Ga4a5]} 5... a6 6. Nc3 Nf6 7. Nd5 {Le cavalier centralisé échange le fou b6 ou le cavalier f6 : votre jeu est actif. [%cal Gd5b6]})
5. c3 {Le pion chasse le fou avec gain de temps et prépare d4. [%cal Gc3b4]}
5... Ba5
(5... Be7 {Une retraite plus défensive.} 6. d4 Na5 7. Be2 {Le fou évite l'échange contre le cavalier a5.} 7... exd4 8. Qxd4 {La dame centralisée vise g7. [%cal Gd4g7]} 8... d6 9. Qxg7 Bf6 10. Qg3 {Le pion g7 est gagné et vous retrouvez l'équilibre matériel.})
6. d4 {Le centre idéal, construit avec gain de temps. [%cal Gd4e5]}
6... d6
(6... exd4 7. O-O {Le gambit continue : le développement prime sur le matériel.} 7... Nge7 8. Ng5 {Deux pièces contre f7. [%cal Gg5f7]} 8... d5 9. exd5 Ne5 10. Qxd4 {La dame reprend avec une attaque double sur e5 et g7.} 10... f6 11. Re1 Bb6 12. Qh4 {La dame se replace sur l'aile roi et cloue presque le jeu noir. [%cal Gh4e7]})
7. Qb3 {La dame attaque f7 et b7. [%cal Gb3f7,Gb3b7]}
7... Qd7 8. O-O {Le roque d'abord : la tension en e5 reste en votre faveur.}
8... Bb6 9. Nbd2 Na5 {Le cavalier attaque la dame et le fou.}
10. Qc2 {La dame garde un œil sur e4 et le fou c4 reste en place. [%cal Gc2e4]}
10... Ne7 11. dxe5 Ng6 12. exd6 Qxd6 {Le centre est ouvert : votre avance de développement compense le pion. [%cal Gc4f7]}`,
    conclusion:
      "Le gambit Evans échange un pion contre deux temps : c3 et d4 viennent avec menace. Avec Qb3, le roque et Nbd2, vos pièces sont prêtes avant que les Noirs ne coordonnent les leurs.",
  },
  {
    legacyIds: ["italian-m4"],
    title: "L'attaque Max Lange",
    eco: "C55",
    kind: "line",
    objectives: [
      "Ouvrir le jeu par 4.d4 et 5.O-O contre les Deux Cavaliers",
      "Connaître la ligne 6.e5 d5 7.exf6",
      "Répondre à 5…Nxe4 par 6.Re1",
    ],
    pgn: `{Contre 3…Nf6, une autre voie que 4.d3 : ouvrir immédiatement le centre par 4.d4 et sacrifier un pion par le roque. L'attaque Max Lange conduit à des positions très tactiques où chaque coup est forcé.}
1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. d4 {Le centre s'ouvre alors que le roi noir est encore en e8. [%cal Gd4e5]}
4... exd4 5. O-O {Le roque : la tour vise la colonne e.}
5... Bc5
(5... Nxe4 {Les Noirs prennent le pion central.} 6. Re1 {La tour cloue le cavalier e4 contre le roi. [%cal Ge1e4]} 6... d5 7. Bxd5 Qxd5 8. Nc3 {Le cavalier attaque la dame et le cavalier e4 en même temps. [%cal Gc3d5,Gc3e4]} 8... Qa5 9. Nxe4 Be6 10. Neg5 O-O-O 11. Nxe6 fxe6 12. Rxe6 {Le pion e6 est récupéré : le matériel est égal et les Noirs ont le pion d4 à défendre.})
6. e5 {Le pion chasse le cavalier f6. [%cal Ge5f6]}
6... d5 7. exf6 dxc4 8. Re1+ {L'échec force le fou à s'interposer en e6.}
8... Be6 9. Ng5 {Le cavalier attaque le fou e6, cloué sur la colonne e. [%cal Gg5e6]}
9... Qd5 10. Nc3 {Le cavalier attaque la dame avec gain de temps. [%cal Gc3d5]}
10... Qf5 11. Nce4 {Le cavalier rejoint le centre et soutient la pression sur e6. [%cal Ge4c5]}
11... O-O-O 12. g4 {Le pion chasse la dame de la diagonale h3-c8.}
12... Qe5 13. Nxe6 {Les Blancs éliminent le fou ; la position reste explosive, avec le pion f6 contre le pion de plus noir.}
13... fxe6`,
    conclusion:
      "L'attaque Max Lange est une course : 6.e5, 8.Re1+ et 9.Ng5 maintiennent l'initiative, mais les Noirs ont des ressources. Contre 5…Nxe4, 6.Re1 et 8.Nc3 récupèrent le pion avec un jeu confortable.",
  },
  {
    title: "Pianissimo : la ligne …a5 et …Qa7",
    eco: "C54",
    kind: "line",
    objectives: [
      "Répondre à …a5 par h3 et Nbd2",
      "Utiliser Bb5 et Be3 contre la diagonale noire",
      "Mener une partie de manœuvres à 28 demi-coups",
    ],
    pgn: `{La grande ligne moderne du Pianissimo, jouée des centaines de fois au plus haut niveau : les Noirs gagnent de l'espace par …a5 et placent leur dame en a7, en batterie avec le fou c5 contre f2.}
1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d3 d6 6. O-O O-O 7. Re1 a5 {Les Noirs prennent l'espace à l'aile dame et préparent …a4.}
8. h3 h6 9. Nbd2 Be6 {Le fou défie le vôtre.}
10. Bb5 {Le fou évite l'échange et cloue le cavalier c6 contre rien : il menace de le prendre pour affaiblir e5. [%cal Gb5c6]}
10... Qb8
(10... Nd7 {Le cavalier prépare …f5 ou …d5.} 11. Nf1 {La manœuvre habituelle : le cavalier vise g3 ou e3. [%cal Gf1e3]} 11... d5 12. Ne3 {Le cavalier e3 frappe d5 et f5, les deux cases de rupture noires. [%cal Ge3d5,Ge3f5]})
11. Nf1 Qa7 {La batterie : dame et fou visent f2. [%cal Ga7f2]}
12. Be3 {Le fou s'oppose à la batterie : l'échange en e3 rapproche votre cavalier du centre. [%cal Ge3c5]}
12... Bxe3 13. Nxe3 Ne7 {Le cavalier rejoint g6, où il surveillera f4.}
14. a4 {Le pion bloque l'aile dame et fixe le pion a5. [%cal Ga4a5]}
14... Ng6 {Position équilibrée et riche : vos prochains coups sont d4 ou Bc4 selon le placement noir.}`,
    conclusion:
      "Dans la grande ligne du Pianissimo, les Blancs neutralisent la batterie …Qa7/…Bc5 par Be3, puis bloquent l'aile dame par a4. Le jeu se décidera par la poussée d4 au bon moment.",
  },
];
