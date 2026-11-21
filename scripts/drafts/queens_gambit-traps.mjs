// Chapitre « Pièges » de la Masterclass « Gambit Dame ».
// Chaque piège a été vérifié avec Stockfish (scripts/opening-lab.mjs eval / traps).
const ORTHODOX = "1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Be7 5. e3 O-O 6. Nf3";

export const TRAPS = [
  {
    title: "Lasker : 8…Nxc3? et le fou qui prend tout",
    eco: "D56",
    kind: "trap",
    objectives: [
      "Prendre la dame d8 quand les Noirs prennent en c3 au lieu de reprendre en e7",
      "Jouer le coup intermédiaire Be7 pour sauver le fou",
      "Finir avec une pièce de plus après Bxf8",
    ],
    pgn: `{Dans la Lasker, après 8.Bxe7, les Noirs doivent reprendre par …Qxe7. S'ils prennent d'abord en c3, une série de prises s'enchaîne : votre fou prend la dame, se réfugie en e7 en attaquant la tour, puis la mange.}
${ORTHODOX} h6 7. Bh4 Ne4 8. Bxe7 Nxc3? {Le cavalier prend avant que la dame ne reprenne.}
9. Bxd8 {Le fou prend la dame : les Noirs vont prendre la vôtre. [%cal Ge7d8]}
9... Nxd1 10. Be7 {Le coup intermédiaire : le fou fuit en attaquant la tour f8. [%cal Ge7f8]}
10... Nxb2 11. Bxf8 Kxf8 12. Rb1 {La tour attaque le cavalier b2, enfermé : vous restez avec une pièce de plus. [%cal Gb1b2]}`,
    conclusion:
      "Dans une série d'échanges, comptez jusqu'au bout. Après 8…Nxc3?, Bxd8 puis Be7 gagne une pièce : le fou sauve sa peau en attaquant la tour.",
  },
  {
    title: "Contre-gambit Albin : 8…Bh3? 9.e6",
    eco: "D09",
    kind: "trap",
    objectives: [
      "Garder le fou g2 face à …Bh3",
      "Ouvrir la diagonale par le sacrifice e6",
      "Attaquer le roi noir sur l'aile dame par Ne5 et Qa4",
    ],
    pgn: `{Dans l'Albin, les Noirs roquent souvent à l'aile dame et veulent échanger votre fou g2 par …Bh3. Mais ce fou est votre meilleure pièce : vous le gardez et ouvrez la grande diagonale par la poussée e6, contre le roi noir.}
1. d4 d5 2. c4 e5 3. dxe5 d4 4. Nf3 Nc6 5. g3 Bg4 6. Bg2 Qd7 7. O-O O-O-O 8. Qb3 {La dame vise b7 et le roi noir. [%cal Gb3b7]}
8... Bh3? {Les Noirs veulent échanger votre fou g2.}
9. e6 {Le pion attaque la dame et ouvre la diagonale du fou g2 vers c6 et b7. [%cal Ge5e6,Gg2b7]}
9... Bxe6 10. Ne5 {Le cavalier attaque la dame et le cavalier c6. [%cal Ge5c6]}
10... Qd6 11. Nxc6 bxc6 12. Qa4 {La dame vise a7 et c6 : le roi noir est sans défense. [%cal Ga4a7,Ga4c6]}`,
    conclusion:
      "Contre l'Albin, votre fou g2 vaut plus qu'un pion. Contre …Bh3, la poussée e6 ouvre sa diagonale, et Ne5 puis Qa4 frappent le roi noir.",
  },
  {
    title: "Gambit Dame accepté : 9…b5? 10.d5",
    eco: "D27",
    kind: "trap",
    objectives: [
      "Laisser le fou c4 en prise pour pousser d5",
      "Prendre en c6 ou en e6 selon la réponse noire",
      "Récupérer la pièce avec un pion de plus et l'initiative",
    ],
    pgn: `{Dans le Gambit Dame accepté, quand les Noirs ont échangé en d4 et que votre tour est en d1, le pion d4 est soutenu par la tour. Si les Noirs chassent le fou par …b5, la poussée d5 est plus forte que la retraite : elle attaque le cavalier c6 et ouvre la colonne d.}
1. d4 d5 2. c4 dxc4 3. Nf3 Nf6 4. e3 e6 5. Bxc4 c5 6. O-O Nc6 7. Qe2 a6 8. Rd1 cxd4 9. exd4 b5? {Le pion attaque le fou, mais le centre noir est désorganisé.}
10. d5 {Le pion attaque le cavalier c6 : le fou c4 peut attendre. [%cal Gd5c6]}
10... bxc4
(10... Na5 11. dxe6 {Le pion menace exf7+ : le roi noir est pris au centre. [%cal Ge6f7]})
11. dxc6 Qc7 12. Qxc4 {La dame reprend : votre pion c6 est un os dans la gorge des Noirs. [%cal Gc6c7]}`,
    conclusion:
      "Quand votre tour est en d1 et le pion en d4, pensez à d5 avant de reculer le fou. Contre 9…b5?, d5 gagne du matériel ou ouvre le roi noir.",
  },
  {
    title: "Albin : 7…Bf5? et le pion b7",
    eco: "D09",
    kind: "trap",
    objectives: [
      "Attaquer b7 par Qb3 dès que le fou c8 quitte sa case",
      "Mettre la tour en d1 contre le pion d4",
      "Saper le pion d4 par e3 et gagner du matériel",
    ],
    pgn: `{Dans l'Albin, tout le jeu noir repose sur le pion d4. Quand le fou c8 sort en f5, il ne protège plus b7 : la dame b3 l'attaque, la tour d1 vise d4, et la poussée e3 fait tomber l'édifice.}
1. d4 d5 2. c4 e5 3. dxe5 d4 4. Nf3 Nc6 5. g3 Nge7 6. Bg2 Ng6 7. O-O Bf5? {Le fou sort, mais il abandonne b7.}
8. Qb3 {La dame attaque b7 et prépare Rd1. [%cal Gb3b7]}
8... Rb8 9. Rd1 {La tour vise le pion d4, que les Noirs ont du mal à soutenir. [%cal Gd1d4]}
9... Qd7 10. e3 {Le pion attaque d4 : la colonne d va s'ouvrir face à la dame noire. [%cal Ge3d4]}
10... d3
(10... dxe3 11. Rxd7 {La tour prend la dame, qui était sur la colonne ouverte.})
11. Nd4 {Le cavalier bloque et attaque le fou f5. [%cal Gd4f5]}
11... Nxd4 12. exd4 Qxd4 13. Be3 {Le fou chasse la dame avec gain de temps et vise a7 : le pion d3 tombera. [%cal Ge3a7,Ge3d4]}`,
    conclusion:
      "Dans l'Albin, le fou c8 protège b7 : dès qu'il sort, Qb3 l'attaque. Avec Rd1 et e3, le pion d4 cède, et vos pièces envahissent la position noire.",
  },
];
