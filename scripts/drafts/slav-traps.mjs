// Chapitre « Pièges » de la Masterclass « Défense slave » (côté Noirs).
// Chaque piège a été vérifié avec Stockfish (scripts/opening-lab.mjs eval / traps).
export const TRAPS = [
  {
    title: "4.Qc2 : 10.Rd1? Bc2!",
    eco: "D11",
    kind: "trap",
    objectives: [
      "Viser la case c2 avec le fou f5",
      "Fourcher la tour d1 depuis c2",
      "Enfermer la dame c4 si la tour s'échappe",
    ],
    pgn: `{Dans la ligne 4.Qc2 dxc4 5.Qxc4 Bf5, la dame blanche a quitté c2. Si la tour va en d1 avant e3, le fou f5 entre en c2 et l'attaque.}
1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Qc2 dxc4 5. Qxc4 Bf5 6. g3 e6 7. Bg2 Nbd7 8. O-O Be7 9. Nc3 O-O 10. Rd1? Bc2 {Le fou attaque la tour d1, qui ne peut pas être protégée. [%cal Gc2d1]}
11. e3
(11. Rd2 Nb6 {Le cavalier chasse la dame, qui n'a plus de case : b3, d3 et a4 sont tenues par le fou c2. [%cal Gb6c4,Gc2b3]})
11... Bxd1 12. Nxd1 {Vous avez gagné la qualité contre un pion.}`,
    conclusion:
      "Quand la dame blanche quitte c2, la case devient un point d'entrée pour le fou f5. Rd1 avant e3 permet …Bc2 et le gain de la qualité.",
  },
  {
    title: "Anti-Meran : 10.Rd1? bxc4",
    eco: "D45",
    kind: "trap",
    objectives: [
      "Attaquer le fou c4 avec …b5",
      "Prendre le fou quand les Blancs l'oublient",
      "Garder la pièce de plus avec …Bb7 et …Be7",
    ],
    pgn: `{Dans l'anti-Meran, …b5 chasse le fou c4 avec gain de temps. Si les Blancs jouent un coup de développement au lieu de reculer, le fou tombe.}
1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. e3 e6 5. Nc3 Nbd7 6. Qc2 Bd6 7. Bd3 O-O 8. O-O dxc4 9. Bxc4 b5 10. Rd1? bxc4 {Le pion prend le fou : vous avez une pièce de plus. [%cal Gb5c4]}
11. b3 cxb3 12. axb3 {Les Blancs récupèrent un pion, mais vous gardez la pièce.}`,
    conclusion:
      "Le coup …b5 attaque le fou c4. Si les Blancs l'oublient, vous gagnez une pièce : regardez toujours si un fou blanc est en prise après vos poussées de pions.",
  },
  {
    title: "Échange : 6.Qb3? Nxd4!",
    eco: "D10",
    kind: "trap",
    objectives: [
      "Voir que Qb3 laisse le pion d4 sans défense",
      "Prendre en d4 avec le cavalier c6",
      "Revenir en c6 après l'échec Qa4+",
    ],
    pgn: `{Dans l'échange, le cavalier c6 attaque d4. Le coup Qb3 vise b7, mais la dame quitte la défense du pion d4.}
1. d4 d5 2. c4 c6 3. cxd5 cxd5 4. Nc3 Nf6 5. Bf4 Nc6 6. Qb3? Nxd4 {Le cavalier prend le pion et attaque la dame b3. [%cal Gd4b3]}
7. Qa4+ Nc6 {Le cavalier revient pour parer l'échec : vous avez gagné le pion d4.}
8. Nf3 Bd7 {Le fou se place derrière le cavalier c6 : un saut du cavalier découvrira une attaque sur la dame a4. [%cal Gd7a4]}`,
    conclusion:
      "Le pion d4 n'est défendu que par la dame d1. Si elle s'en va, …Nxd4 gagne un pion central avec gain de temps.",
  },
  {
    title: "5.e4 b5 6.e5 Nd5 7.Ng5 h6 8.Qh5? g6",
    eco: "D15",
    kind: "trap",
    objectives: [
      "Répondre à Qh5 par …g6 avec gain de temps",
      "Profiter de la dame partie loin de c2",
      "Attaquer c2 avec …Nb4 et …Bf5",
    ],
    pgn: `{Les Blancs attaquent f7 avec Ng5 et Qh5. Le pion g6 chasse la dame, et la case c2, qu'elle ne défend plus, devient votre cible.}
1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 dxc4 5. e4 b5 6. e5 Nd5 7. Ng5 h6 8. Qh5? g6 {Le pion chasse la dame, qui doit garder le cavalier g5. [%cal Gg6h5,Gh6g5]}
9. Qh4 Bg7 {Le fou vise le pion e5 et prépare le roque. [%cal Gg7e5]}
10. Nf3
(10. Nxf7 Kxf7 {Le sacrifice ne donne rien : vous avez une pièce de plus.})
10... Nb4 {Le cavalier menace Nc2+ avec fourchette du roi et de la tour a1. [%cal Gb4c2]}
11. Kd1 Bf5 {Le fou vise encore la case c2 : le roi blanc est coincé au centre. [%cal Gf5c2]}`,
    conclusion:
      "Une sortie de dame précoce laisse la case c2 sans défense. Après …g6, …Nb4 et …Bf5 attaquent c2 et le roi blanc doit rester au centre.",
  },
];
