// Chapitre « Pièges » de la Masterclass « Trompowsky ».
// Chaque piège a été vérifié avec Stockfish (scripts/opening-lab.mjs eval / traps).

export const TRAPS = [
  {
    title: "4…Qb6? 5.fxe4 : le cavalier sans retraite",
    eco: "A45",
    kind: "trap",
    objectives: [
      "Voir que le cavalier e4 n'a plus de case après f3",
      "Prendre le cavalier même si b2 tombe",
      "Développer par Nd2 et e3 contre la dame noire isolée",
    ],
    pgn: `{Après 2…Ne4 3.Bf4 c5 4.f3, le cavalier e4 doit reculer tout de suite. Les Noirs tentent parfois 4…Qb6 pour attaquer b2, en pensant que le cavalier peut attendre. Il ne peut pas : f3xe4 gagne une pièce entière.}
1. d4 Nf6 2. Bg5 Ne4 3. Bf4 c5 4. f3 {Le pion attaque le cavalier, dont les seules retraites sont f6, d6 et g5. [%cal Gf3e4]}
4... Qb6? {La dame vise b2, mais le cavalier e4 reste en prise.}
5. fxe4 {Une pièce de plus : la dame noire n'obtient que des pions en échange. [%cal Gf3e4]}
5... Qxb2
(5... cxd4 {Les Noirs ouvrent la colonne c et menacent toujours b2.} 6. Nd2 {Le cavalier sort : avec b1 et c1 libres, la dame d1 garde la tour a1. [%cal Gd1a1]} 6... Qxb2 7. e3 {Le pion ouvre la diagonale du fou f1 et attaque d4. [%cal Ge3d4]})
6. Nd2 {Le cavalier soutient e4 et libère la première rangée : la tour a1 est protégée par la dame. [%cal Gd2e4]}
6... Qxd4 7. e3 {Le pion chasse la dame de d4 et libère le fou f1 : vous êtes développés, les Noirs ont seulement une dame sortie. [%cal Ge3d4]}`,
    conclusion:
    "Après 4.f3, le cavalier e4 doit bouger immédiatement. 4…Qb6? perd une pièce sur fxe4 : les pions b2 et d4 ne compensent pas, car vos pièces sortent avec gain de temps.",
  },
  {
    title: "La dame en b4 : la chasse par Rb1",
    eco: "A45",
    kind: "trap",
    objectives: [
      "Poursuivre la dame noire par Rb1 dans le gambit Nc3",
      "Punir 6…Qd4? par Nb5 et la fourchette en c7",
      "Savoir que 5…Qb6 est la retraite la plus sûre",
    ],
    pgn: `{Dans le gambit 2…c5 3.d5 Qb6 4.Nc3 Qxb2 5.Bd2, la dame noire doit rentrer vite. La retraite …Qb6 tient ; …Qb4 laisse la dame sur la colonne b, où la tour blanche va la chasser case après case.}
1. d4 Nf6 2. Bg5 c5 3. d5 Qb6 4. Nc3 Qxb2 5. Bd2 {Le fou protège c3 : la tour a1 menace de venir en b1. [%cal Ga1b1]}
5... Qb4?
(5... Qb6 {La retraite correcte : la dame est hors de portée de la tour.} 6. e4 {Le pion prend le centre : le gambit vous donne l'espace et le développement. [%cal Ge4e5]} 6... e5 7. f4 {Le levier f4 ouvre la colonne f contre le roque noir. [%cal Gf4e5]} 7... d6)
6. Rb1 {La tour attaque la dame avec gain de temps. [%cal Gb1b4]}
6... Qa5
(6... Qd4? {La dame se centralise, mais c7 est sans défense.} 7. Nb5 {Le cavalier attaque la dame et menace Nc7+. [%cal Gb5c7]} 7... Qe4 8. Nc7+ {La fourchette roi-tour : la tour a8 tombe. [%cal Gc7a8]} 8... Kd8)
7. e4 {Le centre se construit : la dame noire en a5 est loin du roi noir. [%cal Ge4e5]}
7... d6 8. f4 {Le pion prépare e5 : vous avez déjà le pion de moins compensé par l'avance de développement. [%cal Gf4e5]}`,
    conclusion:
    "Dans le gambit 4.Nc3, chaque coup de la dame noire est une occasion de gagner un temps. Après 5…Qb4? Rb1, la dame fuit en a5 ; après 6…Qd4? Nb5 la fourchette Nc7+ gagne la tour.",
  },
  {
    title: "9…g6? 10.e5 : le mat en d8",
    eco: "A45",
    kind: "trap",
    objectives: [
      "Pousser e5 contre le cavalier f6 quand la tour est en d1",
      "Repérer le mat Qd8 si les Noirs prennent dxe5",
      "Gagner le pion d6 après …Nfd7",
    ],
    pgn: `{Dans la ligne 4…Nf6 5.dxc5, les Blancs ont roqué à l'aile dame et leur dame est en d2. Si les Noirs perdent un temps avec 9…g6, la poussée e5 frappe : le pion d6 ne peut pas prendre en e5 sans ouvrir la colonne d devant la dame blanche.}
1. d4 Nf6 2. Bg5 Ne4 3. Bf4 c5 4. f3 Nf6 5. dxc5 Qa5+ 6. Nc3 Qxc5 7. e4 d6 8. Qd2 a6 9. O-O-O {La tour d1 et la dame d2 sont alignées sur la colonne d. [%cal Gd1d6]}
9... g6? {Un fianchetto trop lent : le cavalier f6 et le pion d6 restent fragiles.}
10. e5 {Le pion attaque le cavalier f6 ; si …dxe5, la colonne d s'ouvre jusqu'à d8. [%cal Ge5f6,Gd2d8]}
10... Nfd7
(10... dxe5?? 11. Qd8# {La dame, soutenue par la tour d1, mate : le roi n'a aucune case.})
(10... Nh5 {Le cavalier fuit sur le bord.} 11. Be3 {Le fou attaque la dame c5 : le pion d6 tombe ensuite. [%cal Ge3c5]})
11. exd6 {Le pion d6 tombe, et votre pion menace déjà dxe7. [%cal Gd6e7]}
11... Nf6 12. Nge2 {Le cavalier se développe et protège c3 ; le pion d6 gêne tout le développement noir. [%cal Ge2c3]}`,
    conclusion:
    "Avec la tour en d1 et la dame en d2, la poussée e5 est une arme : 10…dxe5?? permet Qd8#, et 10…Nfd7 11.exd6 vous laisse un pion de plus qui étouffe la position noire.",
  },
  {
    title: "…g6? contre f4 : la fourchette Nxd6+",
    eco: "A45",
    kind: "trap",
    objectives: [
      "Jouer e5 quand le pion d6 n'est défendu que par le fou f8",
      "Préparer Ne4 pour attaquer d6",
      "Échanger en d6 pour garder un pion passé",
    ],
    pgn: `{Après 2…e6 3.e4 h6 4.Bxf6 Qxf6, les Noirs ont la paire de fous mais une dame exposée en f6. Si, après …c6 et f4, ils jouent …g6, la poussée e5 chasse la dame et le cavalier c3 rejoint e4, d'où il attaque d6.}
1. d4 Nf6 2. Bg5 e6 3. e4 h6 4. Bxf6 Qxf6 5. Nc3 d6 6. Qd2 c6 7. f4 {Le pion soutient e5 et enlève la case e5 au jeu noir. [%cal Gf4e5]}
7... g6?
(7... e5 {La riposte centrale : les Noirs contestent f4.} 8. dxe5 dxe5 9. f5 {Le pion f5 enferme le fou c8 : vous gardez un avantage d'espace. [%cal Gf5e6]})
8. e5 {Le pion chasse la dame et attaque d6. [%cal Ge5f6,Ge5d6]}
8... Qd8 9. Ne4 {Le cavalier vise d6 et f6 : le pion d6 est attaqué deux fois. [%cal Ge4d6]}
9... Nd7 10. Nxd6+ {Le cavalier prend d6 avec échec. [%cal Ge4d6]}
10... Bxd6 11. exd6 {Le pion d6 coupe le camp noir en deux : le fou c8 et la tour a8 restent enfermés. [%cal Gd6c7]}`,
    conclusion:
    "Après …Qxf6, la dame noire est une cible. Contre …g6?, la poussée e5 la chasse et Ne4 attaque d6 : l'échange Nxd6+ Bxd6 exd6 vous laisse un pion d6 très gênant.",
  },
];
