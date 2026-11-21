// Chapitre « Pièges » de la Masterclass « Défense Pirc » (côté Noirs).
// Chaque piège a été vérifié avec Stockfish (scripts/opening-lab.mjs eval / traps).
export const TRAPS = [
  {
    title: "4.Be3 c6 : 7.Nf3? b4 et …Nxe4",
    eco: "B07",
    kind: "trap",
    objectives: [
      "Chasser le cavalier c3 par …b4",
      "Prendre le pion e4 resté sans défenseur",
      "Ramener le cavalier en f6 après …Ng3",
    ],
    pgn: `{Avec h3 et f4, les Blancs ont un centre impressionnant mais un seul défenseur de e4 : le cavalier c3. Votre pion b5 va le chasser.}
1. e4 d6 2. d4 Nf6 3. Nc3 g6 4. Be3 c6 5. h3 Nbd7 6. f4 b5 7. Nf3? b4 {Le pion attaque le cavalier c3, seul protecteur de e4. [%cal Gb4c3,Rc3e4]}
8. Nb1
(8. Ne2 Nxe4 {Le pion tombe et votre cavalier est centralisé.})
8... Nxe4 {Un pion de plus et le cavalier e4 domine. [%cal Gf6e4]}
9. Bd3 Ng3 {Le cavalier attaque la tour h1 avant de revenir. [%cal Gg3h1]}
10. Rg1 Nf6 {Le cavalier rentre en f6 : vous gardez le pion et une position saine.}`,
    conclusion:
      "Dans l'attaque 150, le cavalier c3 défend souvent seul le pion e4. La poussée …b4 au bon moment gagne ce pion.",
  },
  {
    title: "Autrichienne : 8.Ne2? cxd4 et …Nc5",
    eco: "B09",
    kind: "trap",
    objectives: [
      "Prendre en d4 quand le cavalier c3 quitte le centre",
      "Sauter en c5 contre le fou d3 et le pion e4",
      "Obtenir la paire de fous par …Nxd3",
    ],
    pgn: `{Dans la variante …Na6 et …c5, le cavalier c3 doit rester en place. S'il part en e2, la prise en d4 ouvre la case c5 à votre cavalier a6.}
1. e4 d6 2. d4 Nf6 3. Nc3 g6 4. f4 Bg7 5. Nf3 O-O 6. Bd3 Na6 7. O-O
(7. Be3 c5 8. e5 Ng4 {Le cavalier attaque le fou e3 et le pion e5.} 9. Bg1 cxd4 10. Bxd4 dxe5 11. fxe5 Nc7 {Le pion e5 est faible : …Ne6 et …Nxe5 suivront. [%cal Gc7e6]})
7... c5 8. Ne2? cxd4 9. Nexd4 Nc5 {Le cavalier attaque le fou d3 et le pion e4. [%cal Gc5d3,Gc5e4]}
10. Qe2 e5 {La poussée chasse le cavalier d4 et ouvre la diagonale c8-h3. [%cal Ge5d4]}
11. Nb3 Nxd3 12. cxd3 {Vous avez la paire de fous et un centre plus souple.}`,
    conclusion:
      "Dans l'Autrichienne avec …Na6, le cavalier c3 retient le centre. Dès qu'il part, …cxd4 et …Nc5 frappent d3 et e4.",
  },
  {
    title: "4.g3 : 10.Qe2? Nxe4!",
    eco: "B07",
    kind: "trap",
    objectives: [
      "Repérer que le cavalier d4 n'est défendu que par le fou e3",
      "Prendre en e4 pour attirer le cavalier c3",
      "Gagner un pion par …Nxd4",
    ],
    pgn: `{Contre le fianchetto, …e5 et …exd4 ouvrent la diagonale de votre fou g7. Si la dame blanche quitte d1, le cavalier d4 perd un défenseur et le pion e4 tombe.}
1. e4 d6 2. d4 Nf6 3. Nc3 g6 4. g3 Bg7 5. Bg2 O-O 6. Nge2 e5 7. h3 Nc6 8. Be3 exd4 9. Nxd4 Bd7 10. Qe2? Nxe4! {Le cavalier prend : le fou g7 vise d4 derrière le cavalier c3. [%cal Gf6e4,Gg7d4]}
11. Nxe4
(11. Bxe4 Nxd4 {Le cavalier d4 tombe et votre fou g7 balaie la diagonale.})
11... Nxd4 {Le cavalier prend avec attaque sur la dame e2. [%cal Gd4e2]}
12. Qd3 Ne6 {Le cavalier se replie : vous avez un pion de plus.}`,
    conclusion:
      "Quand la dame blanche abandonne d1, le cavalier d4 n'est plus tenu que par le fou e3 : …Nxe4 et …Nxd4 gagnent un pion.",
  },
  {
    title: "4.Bg5 et f4 : 10.Qf2? Bxf3 et …Qxd4+",
    eco: "B07",
    kind: "trap",
    objectives: [
      "Clouer le cavalier f3 par …Bg4",
      "Viser d4 avec la dame b6 et le fou g7",
      "Échanger en f3 pour prendre d4 avec échec",
    ],
    pgn: `{Avec Bg5, f4 et Qd2, les Blancs construisent une attaque. Votre dame en b6 et le fou g7 visent d4 : si la dame blanche quitte d2 pour f2, le cavalier f3 est le dernier défenseur.}
1. e4 d6 2. d4 Nf6 3. Nc3 g6 4. Bg5 Bg7 5. f4 O-O 6. Qd2 c6 7. Nf3 b5 8. Bd3 Bg4 9. O-O Qb6 {La dame et le fou g7 visent d4. [%cal Gb6d4,Gg7d4]}
10. Qf2? Bxf3 {Le fou élimine le défenseur de d4. [%cal Gg4f3]}
11. Qxf3
(11. gxf3 Nxe4 {Le cavalier prend : le roi blanc est exposé et d4 tombera ensuite.})
11... Qxd4+ {Échec et un pion de plus. [%cal Gb6d4,Gd4g1]}
12. Kh1 Nbd7 {Le cavalier se développe : votre avantage est solide.}`,
    conclusion:
      "Quand la dame et le fou g7 visent d4, l'échange …Bxf3 élimine le défenseur : la dame entre en d4 avec échec.",
  },
];
