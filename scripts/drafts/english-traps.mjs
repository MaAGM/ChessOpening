// Chapitre « Pièges » de la Masterclass « Partie anglaise » (côté Blancs).
// Chaque piège a été vérifié avec Stockfish (scripts/opening-lab.mjs eval / traps).
export const TRAPS = [
  {
    title: "Quatre Cavaliers : 6…d5? et Nxe5",
    eco: "A29",
    kind: "trap",
    objectives: [
      "Voir que le pion e5 n'a plus de défenseur sûr après …Nxd5",
      "Prendre en e5 pour ouvrir la diagonale du fou g2",
      "Gagner le fou b4 resté sans protection",
    ],
    pgn: `{Dans les Quatre Cavaliers avec …Bb4, la poussée …d5 semble naturelle. Jouée trop tôt, elle laisse le cavalier d5 et le fou b4 en l'air : le fou g2 et le cavalier f3 se chargent du reste.}
1. c4 e5 2. Nc3 Nf6 3. Nf3 Nc6 4. g3 Bb4 5. Bg2 O-O 6. O-O d5? 7. cxd5 Nxd5 8. Nxe5! {Le cavalier prend : le fou g2 vise désormais le cavalier d5 et la tour a8 au-delà. [%cal Gg2d5,Ge5c6]}
8... Nxc3
(8... Nxe5 9. Nxd5 {Votre cavalier d5 attaque le fou b4, qui doit fuir. [%cal Gd5b4]} 9... Ba5 10. d4 Ng6 11. b4 {Le pion chasse le fou : il n'a plus de case sûre. [%cal Gb4a5]})
9. bxc3 Nxe5 10. cxb4 {Bilan : vous avez gagné une pièce contre un pion. [%cal Gb4a5]}
10... c6 11. a4 {Le pion a4 soutient b5 et met votre aile dame en mouvement.}`,
    conclusion:
      "Contre …Bb4, la poussée …d5 sans préparation laisse e5 et le fou b4 sans défense : Nxe5 gagne une pièce.",
  },
  {
    title: "Hérisson : Ng5 et le fou b7",
    eco: "A30",
    kind: "trap",
    objectives: [
      "Repérer que le fou b7 n'a aucun défenseur",
      "Démasquer le fou g2 par le saut Ng5",
      "Punir …Be7? par Bxb7",
    ],
    pgn: `{Dans le Hérisson, votre cavalier f3 masque la grande diagonale. En sautant en g5, il démasque le fou g2 contre le fou b7, qu'aucune pièce noire ne protège.}
1. c4 c5 2. Nf3 Nf6 3. g3 b6 4. Bg2 Bb7 5. O-O e6 6. Nc3 a6 7. d4 cxd4 8. Qxd4 d6 9. Rd1 Nbd7 10. Ng5! {Le fou g2 voit maintenant b7, que rien ne défend plus. [%cal Gg2b7,Gg5e4]}
10... Be7?
(10... Bxg2 {La bonne défense : les fous s'échangent.} 11. Kxg2 Rc8 12. Nge4 {Le cavalier pèse sur d6 : la position reste agréable. [%cal Ge4d6]})
11. Bxb7 {Le fou prend et attaque la tour a8. [%cal Gb7a8]}
11... Ra7 12. Bg2 {Une pièce de plus : le Hérisson a perdu son meilleur fou.}`,
    conclusion:
      "Quand le fou b7 n'a pas de défenseur, cherchez Ng5 : le fou g2 se démasque et b7 tombe si les Noirs n'échangent pas.",
  },
  {
    title: "Hérisson : 8…Nbd7? Nb5!",
    eco: "A30",
    kind: "trap",
    objectives: [
      "Sauter en b5 pour viser d6, c7 et a7",
      "Répondre à …d5 par Bf4 contre la case c7",
      "Exploiter …Ne5? en ouvrant la colonne d",
    ],
    pgn: `{Avec …d6 joué avant …a6, la case b5 est libre. Si les Noirs développent le cavalier b8 en d7, Nb5 attaque d6 et menace Bf4 : il n'y a pas de bonne défense.}
1. c4 c5 2. Nf3 Nf6 3. g3 b6 4. Bg2 Bb7 5. O-O e6 6. Nc3 d6 7. d4 cxd4 8. Qxd4 Nbd7? 9. Nb5! {Le cavalier vise d6, et Bf4 viendra appuyer la pression. [%cal Gb5d6,Gb5c7]}
9... d5
(9... Ne5 10. Nxe5 Bxg2 11. Kxg2 dxe5 12. Qxe5 {La colonne d est ouverte : votre dame et le cavalier b5 dominent. [%cal Gd1d8]})
10. Bf4 {Le fou vise c7 : la tour a8 et la case d6 sont menacées. [%cal Gf4c7]}
10... Rc8 11. cxd5 Bxd5 12. Nxa7 {Le cavalier ramasse le pion a7 et attaque la tour c8. [%cal Ga7c8]}`,
    conclusion:
      "Contre le Hérisson sans …a6, la case b5 est un tremplin : Nb5 puis Bf4 met d6 et c7 sous un feu impossible à tenir.",
  },
  {
    title: "Symétrique : 6…e5? et Nxe5",
    eco: "A34",
    kind: "trap",
    objectives: [
      "Voir que le cavalier d5 cloue la défense de e5",
      "Prendre le pion e5 grâce à l'alignement g2-c6",
      "Gagner du matériel si les Noirs reprennent mal",
    ],
    pgn: `{Dans l'Anglaise symétrique, …e5 après …Nxd5 paraît naturel. Mais le cavalier c6 est cloué sur la diagonale du fou g2 : il ne défend pas vraiment le pion e5.}
1. c4 c5 2. Nf3 Nf6 3. g3 Nc6 4. Bg2 d5 5. cxd5 Nxd5 6. Nc3 e5? 7. Nxe5! {Le cavalier c6 ne peut pas reprendre sans laisser le cavalier d5 sans défense. [%cal Gg2c6,Gc3d5]}
7... Nxe5
(7... Nxc3 8. Nxc6 {Le cavalier attaque la dame d8 et menace de prendre en c3. [%cal Gc6d8]} 8... Qd7 9. bxc3 {Vous avez une pièce de plus.})
8. Nxd5 {Le pion e5 est gagné et le cavalier d5 domine le centre. [%cal Gd5c7]}
8... Nc6 9. O-O {Un pion de plus, sans aucune faiblesse.}`,
    conclusion:
      "Dans la symétrique, tant que le fou g2 vise c6, les pions e5 et d5 noirs sont fragiles : Nxe5 gagne au moins un pion.",
  },
];
