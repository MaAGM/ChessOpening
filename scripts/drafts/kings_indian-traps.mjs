// Chapitre « Pièges » de la Masterclass « Défense Est-Indienne » (côté Noirs).
// Chaque piège a été vérifié avec Stockfish (scripts/opening-lab.mjs eval / traps).
export const TRAPS = [
  {
    title: "Gligoric : 9.Bf4?? exf4",
    eco: "E92",
    kind: "trap",
    objectives: [
      "Repérer qu'une case de retraite du fou est contrôlée par le pion e5",
      "Prendre la pièce offerte par …exf4",
      "Ramener le cavalier g4 vers le jeu par …Nc6 et …g5",
    ],
    pgn: `{Après 7.Be3 Ng4 8.Bg5 f6, le fou g5 est attaqué et doit choisir sa retraite. Les bonnes cases sont h4, c1 ou d2. La case f4, elle, est surveillée par votre pion e5.}
1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. Be3 Ng4 8. Bg5 f6 9. Bf4? {Le fou recule sur une case attaquée par le pion e5. [%cal Re5f4]}
9... exf4 {Le pion prend : vous avez une pièce entière de plus. [%cal Ge5f4]}
10. h4 {Les Blancs cherchent à piéger le cavalier g4 par h5 et Nh4 ; il a pourtant une sortie.}
10... Nc6 {Le cavalier b8 se développe et presse le pion d4. [%cal Gc6d4]}
11. h5 g5 {Le pion g5 soutient f4 et protège le cavalier : la pièce de plus reste en vos mains. [%cal Gg5f4]}`,
    conclusion:
      "Dans la Gligoric, la retraite du fou g5 n'a que trois bonnes cases. Si les Blancs choisissent f4, le pion e5 la prend et vous gagnez une pièce.",
  },
  {
    title: "8.Ne1? exd4 et le pion e4",
    eco: "E92",
    kind: "trap",
    objectives: [
      "Prendre en d4 dès que le cavalier f3 quitte la défense",
      "Gagner le pion e4 par …Nxe4",
      "Activer la tour par …Re8 sur la colonne ouverte",
    ],
    pgn: `{Après 7.O-O Nc6, les Blancs doivent jouer d5 ou défendre d4. Le coup 8.Ne1?, joué trop tôt, retire le seul défenseur de d4 : …exd4 gagne un pion, puis le pion e4 tombe à son tour.}
1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. O-O Nc6 8. Ne1?
(8. h3 exd4 9. Nxd4 Nxe4 {Le cavalier prend : si 10.Nxe4, …Nxd4 rend la pièce avec une position confortable.} 10. Nxe4 Nxd4 {Votre fou g7 balaie la grande diagonale. [%cal Gg7b2]})
8... exd4 {Le pion prend : le cavalier c3 est attaqué. [%cal Gd4c3]}
9. Nb5
(9. Nd5 Nxe4 {Le cavalier e4 est installé au centre, un pion de plus. [%cal Ge4c3]})
9... Nxe4 {Le pion e4 n'est plus défendu par le cavalier c3. [%cal Gf6e4]}
10. Nc2 Re8 {La tour se place en face du fou e2 sur la colonne ouverte. [%cal Ge8e2]}
11. Nbxd4 Nxd4 12. Nxd4 Bd7 {Vous gardez le pion de plus et une position sans faiblesse.}`,
    conclusion:
      "Tant que d4 n'est pas défendu deux fois, retirer le cavalier f3 est une faute. …exd4 puis …Nxe4 gagne un pion net.",
  },
  {
    title: "8.b4? exd4 et la grande diagonale",
    eco: "E92",
    kind: "trap",
    objectives: [
      "Échanger les cavaliers en d4 pour attirer la dame",
      "Exploiter l'alignement de la dame d4 et du fou g7",
      "Gagner le pion e5 ou la tour a1",
    ],
    pgn: `{Le coup 8.b4? prépare c5 mais oublie le centre. Après …exd4 et l'échange en d4, la dame blanche se retrouve sur la diagonale de votre fou g7 : chaque coup du cavalier f6 devient une découverte.}
1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. O-O Nc6 8. b4? exd4 9. Nxd4 Nxd4 10. Qxd4 Re8 {La tour attaque e4 ; le cavalier f6 menace de bouger avec découverte. [%cal Ge8e4,Gg7d4]}
11. e5
(11. Qd3 Nxe4 {Le cavalier prend avec découverte : la tour a1 est en prise. [%cal Gg7a1]} 12. Nxe4 Bxa1 {Vous avez gagné la qualité et un pion.})
11... Ng4 {Le cavalier attaque e5, que la dame ne peut plus tenir. [%cal Gg4e5]}
12. Qd2 Nxe5 {Le pion e5 tombe : un pion de plus et le cavalier centralisé.}`,
    conclusion:
      "Quand la dame adverse se place sur la diagonale de votre fou g7, cherchez la découverte du cavalier f6 : elle gagne du matériel.",
  },
  {
    title: "Fianchetto : 9.Ba3? e4",
    eco: "E62",
    kind: "trap",
    objectives: [
      "Ignorer le clouage de la tour f8 pour gagner du temps",
      "Chasser le cavalier f3 par …e4",
      "Sacrifier la qualité contre un pion e3 dominant",
    ],
    pgn: `{Contre le fianchetto, après 7.b3 e5 8.dxe5 dxe5, le coup 9.Ba3 attaque la tour f8. Mais votre pion e5 avance avec gain de temps : …e4 chasse le cavalier f3, et la qualité rendue ne pèse pas lourd.}
1. d4 Nf6 2. c4 g6 3. Nf3 Bg7 4. g3 O-O 5. Bg2 d6 6. O-O Nc6 7. b3 e5 8. dxe5 dxe5 9. Ba3? e4 {Le pion attaque le cavalier f3. [%cal Ge4f3]}
10. Bxf8
(10. Ng5 h6 {Le pion chasse le cavalier, qui n'a plus de bonne case. [%cal Gh6g5]})
10... Qxf8 11. Ne1 e3 {Le pion s'enfonce et casse la structure blanche. [%cal Ge3f2]}
12. f4 Ng4 {Le cavalier soutient e3 et vise les cases noires. [%cal Gg4e3]}
13. Nc2 Bf5 {Toutes vos pièces jouent, et le pion e3 étouffe le camp blanc. [%cal Gf5c2]}`,
    conclusion:
      "Contre Ba3, ne défendez pas la tour : …e4 gagne un temps, et le pion e3 donne une compensation largement suffisante pour la qualité.",
  },
];
