// Chapitre « Pièges » de la Masterclass « Défense Caro-Kann » (côté Noirs).
// Chaque piège a été vérifié avec Stockfish (scripts/opening-lab.mjs eval / traps).
export const TRAPS = [
  {
    title: "5.Nf3?? : le cavalier e4 en prise",
    eco: "B18",
    kind: "trap",
    objectives: [
      "Vérifier que le cavalier e4 est toujours attaqué par le fou f5",
      "Prendre la pièce sans hésiter",
      "Défendre le fou e4 par …Nd7 et …Ngf6",
    ],
    pgn: `{Après 4…Bf5, votre fou attaque le cavalier e4. Les Blancs doivent le déplacer, en général par Ng3. S'ils jouent un coup de développement comme Nf3 ou h4, le cavalier tombe.}
1. e4 c6 2. d4 d5 3. Nc3 dxe4 4. Nxe4 Bf5 5. Nf3?
(5. h4? Bxe4 {La même erreur : le cavalier n'était défendu par rien.})
5... Bxe4 {Le fou prend : une pièce de plus. [%cal Gf5e4]}
6. Ne5 Nd7 {Le cavalier conteste e5 et prépare …Ngf6. [%cal Gd7e5]}
7. Qe2 Ngf6 {Le cavalier défend le fou e4, attaqué par la dame. [%cal Gf6e4]}`,
    conclusion:
      "Après 4…Bf5, comptez toujours : le cavalier e4 est attaqué. Si les Blancs l'oublient, …Bxe4 gagne une pièce entière.",
  },
  {
    title: "Panov : 8.Bd3? Nxc3 et la tour a1",
    eco: "B14",
    kind: "trap",
    objectives: [
      "Échanger en c3 quand le fou b4 vise la diagonale a5-e1",
      "Prendre en c3 avec échec puis la tour a1",
      "Garder la qualité de plus et roquer",
    ],
    pgn: `{Dans la Panov avec 6…Bb4, le cavalier c3 est cloué. Si les Blancs jouent Bd3 au lieu de protéger c3, l'échange en c3 ouvre la diagonale du fou b4 jusqu'à la tour a1.}
1. e4 c6 2. d4 d5 3. exd5 cxd5 4. c4 Nf6 5. Nc3 e6 6. Nf3 Bb4 7. cxd5 Nxd5 8. Bd3? {Le fou se développe, mais le cavalier c3 n'est plus soutenu.}
8... Nxc3 9. bxc3 Bxc3+ {Le fou prend avec échec et attaque la tour a1. [%cal Gc3a1]}
10. Bd2 Bxa1 11. Qxa1 O-O {Vous avez gagné la qualité et un pion.}`,
    conclusion:
      "Dans la Panov, le clouage …Bb4 rend le cavalier c3 vulnérable. Si rien ne le protège, …Nxc3 suivi de …Bxc3+ gagne la tour a1.",
  },
  {
    title: "Système Short : 9.Na3? et le pion e5",
    eco: "B12",
    kind: "trap",
    objectives: [
      "Échanger le cavalier d4 quand il n'a plus de soutien",
      "Attaquer le fou d4 et le pion e5 par …Nc6",
      "Ouvrir le jeu pour gagner le pion d6",
    ],
    pgn: `{Dans le système Short, le cavalier d4 et le pion e5 sont les piliers blancs. Après 9.Na3?, le cavalier part de la défense : …Nxd4 puis …Nc6 attaquent e5 et le fou d4.}
1. e4 c6 2. d4 d5 3. e5 Bf5 4. Nf3 e6 5. Be2 c5 6. Be3 cxd4 7. Nxd4 Ne7 8. c4 Nbc6 9. Na3? {Le cavalier va en a3, loin de la défense de e5.}
9... Nxd4 10. Bxd4
(10. Qxd4 Nc6 {Le cavalier attaque la dame, qui doit quitter la défense de e5.} 11. Qf4 d4 {Le pion chasse le fou e3 : e5 est perdu. [%cal Gd4e3]})
10... Nc6 {Le cavalier attaque le fou d4 et le pion e5. [%cal Gc6d4,Gc6e5]}
11. Nb5 a6 12. cxd5 exd5 13. Nd6+ Bxd6 14. exd6 Qxd6 {Le pion d6 tombe : vous avez un pion de plus.}`,
    conclusion:
      "Dans le système Short, comptez les défenseurs de e5. Quand le cavalier d4 disparaît, …Nc6 attaque e5 et le pion tombe.",
  },
  {
    title: "Attaque 5.g4 : 8.Nb5? a6",
    eco: "B12",
    kind: "trap",
    objectives: [
      "Chasser le cavalier b5 par …a6",
      "Ouvrir la diagonale du fou f8 par …cxd4",
      "Doubler l'attaque sur b2 par …Bb4+ et …Qb6",
    ],
    pgn: `{Contre l'attaque g4, les Blancs ont avancé tous leurs pions. Si le cavalier saute en b5 pour viser d6, …a6 le renvoie, et le centre blanc s'effondre.}
1. e4 c6 2. d4 d5 3. e5 Bf5 4. Nc3 e6 5. g4 Bg6 6. Nge2 c5 7. Nf4 Nc6 8. Nb5? {Le cavalier vise d6, mais il laisse d4 sans défense.}
8... a6 {Le pion chasse le cavalier. [%cal Ga6b5]}
9. Nc3
(9. Nd6+ Bxd6 10. exd6 Be4 {Le fou attaque la tour h1 ; le pion d6 tombera ensuite. [%cal Ge4h1]})
9... cxd4 10. Nce2 Bb4+ {L'échec gagne un temps et dégage la diagonale de la dame. [%cal Gb4e1]}
11. Bd2 Qb6 {La dame vise b2 et soutient le pion d4. [%cal Gb6b2]}
12. Bg2 Bxd2+ 13. Qxd2 Qxb2 {Vous avez gagné un pion, et le pion d4 coupe le jeu blanc en deux.}`,
    conclusion:
      "Contre l'attaque g4, ne craignez pas les sauts de cavalier. …a6, …cxd4 et …Qb6 frappent le centre et gagnent du matériel.",
  },
];
