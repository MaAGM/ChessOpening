// Chapitre « Pièges » de la Masterclass « Défense Grünfeld » (côté Noirs).
// Chaque piège a été vérifié avec Stockfish (scripts/opening-lab.mjs eval / traps).
export const TRAPS = [
  {
    title: "Rb1 : 10.O-O? dxc3!",
    eco: "D85",
    kind: "trap",
    objectives: [
      "Voir que les Blancs n'ont pas repris en d4",
      "Avancer le pion en c3 au lieu de reculer",
      "Défendre le pion passé c3 avec …Nc6 et …Qa5",
    ],
    pgn: `{Dans la ligne Rb1, après …cxd4, les Blancs doivent reprendre avec cxd4. S'ils roquent d'abord, le pion d4 prend en c3.}
1. d4 Nf6 2. c4 g6 3. Nc3 d5 4. cxd5 Nxd5 5. e4 Nxc3 6. bxc3 Bg7 7. Nf3 c5 8. Rb1 O-O 9. Be2 cxd4 10. O-O? dxc3 {Le pion prend en c3 : vous avez deux pions de plus. [%cal Gd4c3]}
11. Qb3 Nc6 {Le cavalier défend le pion c3 et vise d4. [%cal Gc6d4]}
12. Be3 Qa5 {La dame protège c3 une deuxième fois. [%cal Ga5c3]}
13. h3 Be6 {Le fou chasse la dame b3 : votre pion c3 est solidement tenu. [%cal Ge6b3]}`,
    conclusion:
      "Après …cxd4, vérifiez toujours que les Blancs reprennent. Sinon, le pion avance en c3 et devient un pion passé protégé par le fou g7.",
  },
  {
    title: "Échange : 9.Bd3? cxd4!",
    eco: "D86",
    kind: "trap",
    objectives: [
      "Voir que le fou d3 coupe la dame d1 du pion d4",
      "Ouvrir la colonne c par l'échange en d4",
      "Gagner le pion d4 avec le cavalier c6",
    ],
    pgn: `{Le pion d4 est défendu par le cavalier e2 et la dame d1. Si le fou recule en d3, il coupe la dame de d4.}
1. d4 Nf6 2. c4 g6 3. Nc3 d5 4. cxd5 Nxd5 5. e4 Nxc3 6. bxc3 Bg7 7. Bc4 c5 8. Ne2 Nc6 9. Bd3? cxd4 {Le pion échange en d4 : seul le cavalier e2 défend encore le centre. [%cal Gd1d4]}
10. cxd4 O-O 11. O-O Nxd4 {Le cavalier prend le pion d4 : vous avez un pion de plus. [%cal Gc6d4]}
12. Rb1
(12. Nxd4 Bxd4 {Le fou reprend et attaque la tour a1. [%cal Gd4a1]})
12... b6 {Le pion protège a7 et prépare …Bb7 contre le pion e4. [%cal Gc8b7]}`,
    conclusion:
      "Dans l'échange, le pion d4 compte ses défenseurs. Quand le fou d3 bloque la dame, …cxd4 puis …Nxd4 gagnent un pion central.",
  },
  {
    title: "4.Bf4 : 10.O-O? Qxc4!",
    eco: "D82",
    kind: "trap",
    objectives: [
      "Voir que le fou c4 n'est défendu par aucune pièce",
      "Prendre le fou avec la dame c5",
      "Protéger c7 contre Nb5 avec …Na6",
    ],
    pgn: `{Dans la ligne 4.Bf4 c5, la dame reprend en c5 et attaque le fou c4. Les Blancs doivent le reculer en b3 ou e2.}
1. d4 Nf6 2. c4 g6 3. Nc3 d5 4. Bf4 Bg7 5. e3 O-O 6. Nf3 c5 7. dxc5 Qa5 8. Rc1 dxc4 9. Bxc4 Qxc5 {La dame reprend le pion et attaque le fou c4. [%cal Gc5c4]}
10. O-O? Qxc4 {La dame prend le fou : vous avez une pièce de plus. [%cal Gc5c4]}
11. Nd4 Na6 {Le cavalier défend c7, que visent le fou f4 et un futur Nb5. [%cal Ga6c7,Gf4c7]}`,
    conclusion:
      "Après …Qxc5, la dame attaque le fou c4. Les Blancs doivent le reculer : s'ils roquent, le fou tombe.",
  },
  {
    title: "3.f3 : 10.Bh6? Qxd4!",
    eco: "D70",
    kind: "trap",
    objectives: [
      "Voir que le fou e3 défendait le pion d4",
      "Prendre en d4 avec la dame",
      "Échanger les dames avant Bxg7",
    ],
    pgn: `{Contre 3.f3, la dame d6 et le cavalier c6 attaquent d4. Le fou e3 est un de ses défenseurs : s'il part en h6, le pion tombe.}
1. d4 Nf6 2. c4 g6 3. f3 d5 4. cxd5 Nxd5 5. e4 Nb6 6. Nc3 Bg7 7. Be3 O-O 8. Qd2 Nc6 9. O-O-O Qd6 10. Bh6? Qxd4 {La dame prend le pion d4, qui n'est plus défendu par le fou. [%cal Gd6d4]}
11. Bxg7 Qxd2+ {La dame s'échange avec échec avant que le fou g7 ne soit perdu. [%cal Gd4d2]}
12. Rxd2 Kxg7 {Le roi reprend le fou : vous avez un pion de plus dans la finale.}`,
    conclusion:
      "Le fou e3 défend d4. Quand les Blancs l'envoient en h6 pour échanger le fou g7, prenez d'abord en d4 puis échangez les dames.",
  },
];
