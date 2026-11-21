// Chapitre « Pièges » de la Masterclass « Défense Benoni » (côté Noirs).
// Chaque piège a été vérifié avec Stockfish (scripts/opening-lab.mjs eval / traps).
export const TRAPS = [
  {
    title: "9.Bg5 Re8 10.Nd2?? Nxe4!",
    eco: "A70",
    kind: "trap",
    objectives: [
      "Voir que la tour e8 et le roi e1 sont sur la même colonne",
      "Prendre en e4 pour démasquer la dame contre le fou g5",
      "Exploiter le clouage du cavalier e4",
    ],
    pgn: `{Avec 9.Bg5 Re8, votre tour vise déjà le pion e4 et, derrière lui, le roi blanc resté en e1. Le coup 10.Nd2?? retire un défenseur : …Nxe4 ouvre la diagonale d8-g5 et la colonne e d'un seul coup.}
1. d4 Nf6 2. c4 c5 3. d5 e6 4. Nc3 exd5 5. cxd5 d6 6. e4 g6 7. Nf3 Bg7 8. h3 O-O 9. Bg5 Re8 10. Nd2?? Nxe4! {Le cavalier prend : votre dame attaque désormais le fou g5. [%cal Gd8g5,Ge8e1]}
11. Ncxe4
(11. Bxd8 Nxc3+ {Échec à la découverte par la tour e8 : la dame blanche tombe ensuite.} 12. Be2 Nxd1 13. Rxd1 Rxd8 {Vous sortez de l'opération avec une pièce de plus.})
(11. Ndxe4 Qxg5 {Le fou tombe : le cavalier e4 est cloué et ne peut reprendre.})
11... Qxg5 {Le cavalier e4 est cloué sur le roi : il ne peut pas prendre votre dame. [%cal Ge8e1,Rd2e4]}
12. Bb5 Nc6 13. O-O Qxd5 {Vous avez gagné une pièce et un pion du centre.}`,
    conclusion:
      "Quand le roi blanc est encore en e1 face à votre tour e8, chaque défenseur de e4 compte : un seul relâchement et …Nxe4 gagne une pièce.",
  },
  {
    title: "9.Bb5? Nxe4! et l'échec en a5",
    eco: "A70",
    kind: "trap",
    objectives: [
      "Prendre le pion e4 quand le fou b5 est sans protection",
      "Utiliser l'échec …Qa5+ pour attaquer deux pièces",
      "Récupérer le fou b5 avec un pion de plus",
    ],
    pgn: `{Le coup 9.Bb5 paraît actif, mais ce fou n'est défendu par rien. Le cavalier f6 prend en e4, puis …Qa5+ fait à la fois échec et attaque le fou : les Blancs perdent un pion.}
1. d4 Nf6 2. c4 c5 3. d5 e6 4. Nc3 exd5 5. cxd5 d6 6. e4 g6 7. Nf3 Bg7 8. h3 O-O 9. Bb5? Nxe4! {Le pion e4 tombe : votre fou g7 vise aussi le cavalier c3. [%cal Gf6e4,Gg7c3]}
10. Nxe4
(10. O-O Nxc3 11. bxc3 {Les pions c blancs sont doublés et vous avez un pion de plus.})
10... Qa5+ {Échec, et la dame vise le fou b5 sans défenseur. [%cal Ga5b5,Ga5e1]}
11. Nc3
(11. Qd2 Qxb5 {Le fou est pris sans compensation.})
(11. Nfd2 Qxb5 12. Nxd6 Qd7 {La dame défend c8 de loin et vise le pion d5.} 13. Nxc8 Re8+ {L'échec sur la colonne e oblige le roi à bouger.} 14. Kf1 Qxd5 {Le pion d5 tombe et le cavalier c8 n'a plus de sortie : …Rxc8 suivra.})
11... Bxc3+ 12. bxc3 Qxb5 {Un pion de plus et la structure blanche est abîmée.}`,
    conclusion:
      "Un fou blanc en b5 sans défenseur est une cible pour …Qa5+. Si e4 tombe d'abord, l'échec ramasse le fou.",
  },
  {
    title: "Benko : 9.e4? et la case d3",
    eco: "A59",
    kind: "trap",
    objectives: [
      "Repérer la case d3 affaiblie par la poussée e4",
      "Mener le cavalier par d7 et e5 jusqu'en d3",
      "Gagner la paire de fous ou plus si les Blancs tardent",
    ],
    pgn: `{Dans la Benko avec fianchetto, 9.e4? ferme la diagonale du fou g2 et laisse la case d3 sans gardien. Votre fou a6 la contrôle déjà : le cavalier b8 va s'y installer.}
1. d4 Nf6 2. c4 c5 3. d5 b5 4. cxb5 a6 5. bxa6 Bxa6 6. Nc3 d6 7. g3 g6 8. Bg2 Bg7 9. e4? Nbd7 {Le cavalier prend le chemin de e5 puis d3. [%cal Gd7e5,Ge5d3]}
10. Nge2 Ne5 11. O-O
(11. b3 Nd3+ {Échec : le roi blanc ne peut plus roquer.} 12. Kf1 Ng4 {Le second cavalier vise f2 : la tour h1 est perdue.})
11... Nd3 {Le cavalier s'installe sous la protection du fou a6. [%cal Ga6d3,Gd3c1]}
12. Qc2 Nxc1 13. Rfxc1 O-O {Vous avez la paire de fous et la pression sur l'aile dame.}`,
    conclusion:
      "Dans la Benko, la poussée e4 sans Bf1 crée un trou en d3 que votre fou a6 tient déjà : un cavalier noir s'y installe.",
  },
  {
    title: "4.Nf3 g6 5.a4 bxc4 6.Nbd2? Nxd5",
    eco: "A57",
    kind: "trap",
    objectives: [
      "Prendre en c4 pour gagner du temps contre a4",
      "Voir que Nbd2 retire la défense du pion d5",
      "Garder les deux pions avec …Nb4",
    ],
    pgn: `{Le coup 5.a4 vise à fixer votre pion b5. Après …bxc4, le pion d5 n'est défendu que par la dame : si le cavalier b1 va en d2, il bloque cette défense.}
1. d4 Nf6 2. c4 c5 3. d5 b5 4. Nf3 g6 5. a4 bxc4 6. Nbd2? Nxd5 {Le cavalier d2 coupe la dame d1 du pion d5 : il tombe. [%cal Gf6d5,Rd2d1]}
7. e4
(7. Nxc4 Nb4 8. e4 Bg7 {Un pion de plus et le cavalier b4 attaque c2. [%cal Gb4c2]})
7... Nb4 {Le cavalier évite l'échange et vise d3. [%cal Gb4d3]}
8. Bxc4 Bg7 {Vous restez avec un pion de plus et la diagonale a1-h8 ouverte.}`,
    conclusion:
      "Contre la Benko refusée par 4.Nf3, le pion d5 blanc dépend de la dame : tout coup qui coupe la colonne d le laisse sans défense.",
  },
];
