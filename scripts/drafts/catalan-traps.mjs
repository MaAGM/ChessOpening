// Chapitre « Pièges » de la Masterclass « Catalane » (côté Blancs).
// Chaque piège a été vérifié avec Stockfish (scripts/opening-lab.mjs eval / traps).
export const TRAPS = [
  {
    title: "Ouverte : 7…b6 8.Bg5 Bb7? 9.Bxf6!",
    eco: "E05",
    kind: "trap",
    objectives: [
      "Repérer la batterie dame c2 contre h7",
      "Éliminer le cavalier f6, défenseur de h7",
      "Dégager le fou g2 vers b7 avec Ng5",
    ],
    pgn: `{Le coup …b6 prépare …Bb7 pour opposer un fou au fou g2. Mais avec la dame en c2 et le fou en g5, le cavalier f6 défend seul la case h7.}
1. d4 Nf6 2. c4 e6 3. g3 d5 4. Bg2 Be7 5. Nf3 O-O 6. O-O dxc4 7. Qc2 b6 8. Bg5 Bb7? 9. Bxf6 {Le fou élimine le cavalier qui protège h7. [%cal Gg5f6,Gc2h7]}
9... Bxf6
(9... gxf6 10. Ng5 fxg5 11. Bxb7 Nd7 12. Bxa8 Qxa8 13. Qxc4 {Le roi noir est ouvert et vous avez gagné la qualité. [%cal Gc4g8]})
10. Ng5 {Double menace : Qxh7 mat et Bxb7, car le cavalier a dégagé la diagonale. [%cal Gc2h7,Gg2b7]}
10... Bxg5 11. Bxb7 Nd7 12. Bxa8 Qxa8 13. Qxc4 {Vous avez une tour contre un fou, et le pion c4 est récupéré.}`,
    conclusion:
      "Quand la dame c2 vise h7, le cavalier f6 est un défenseur clé. Bxf6 puis Ng5 crée deux menaces à la fois et gagne la qualité.",
  },
  {
    title: "Fermée : 10…c5? 11.Nxf6+!",
    eco: "E08",
    kind: "trap",
    objectives: [
      "Échanger le cavalier e4 pour abîmer le roque noir",
      "Sacrifier le cavalier en g5 pour ouvrir la diagonale",
      "Gagner la tour a8 avec le fou g2",
    ],
    pgn: `{Après 9.e4 dxe4 10.Nxe4, le coup …c5 attaque d4 mais oublie la grande diagonale : le fou b7 fait face au fou g2, que seuls vos deux cavaliers masquent.}
1. d4 Nf6 2. c4 e6 3. g3 d5 4. Bg2 Be7 5. Nf3 O-O 6. O-O c6 7. Qc2 b6 8. Nbd2 Bb7 9. e4 dxe4 10. Nxe4 c5? 11. Nxf6+ {L'échange en f6 retire un défenseur et menace de ruiner le roque. [%cal Ge4f6]}
11... gxf6
(11... Bxf6 12. Ng5 {Le cavalier dégage le fou g2 et menace Qxh7 mat. [%cal Gc2h7,Gg2b7]})
12. Ng5 {Le sacrifice ouvre la diagonale g2-b7 : si …fxg5, le fou prend en b7. [%cal Gg2b7]}
12... fxg5 13. Bxb7 Nd7 14. Bxa8 Qxa8 {Vous avez la qualité de plus et le roi noir a perdu ses pions.}`,
    conclusion:
      "Dans la Catalane fermée, le fou b7 est souvent face au fou g2. Si le cavalier f3 peut se dégager avec gain de temps, la diagonale s'ouvre et la tour a8 tombe.",
  },
  {
    title: "Fermée : 10…b6? 11.cxd5!",
    eco: "E08",
    kind: "trap",
    objectives: [
      "Ouvrir la colonne c vers c6",
      "Envahir en c6 avec la dame",
      "Gagner les pions e6 et d5",
    ],
    pgn: `{Contre le schéma Stonewall …Ne4, …Nd7 et …f5, le coup …b6 affaiblit la case c6. L'échange en d5 ouvre la colonne c vers cette case.}
1. d4 Nf6 2. c4 e6 3. g3 d5 4. Bg2 Be7 5. Nf3 O-O 6. O-O c6 7. Qc2 Ne4 8. b3 Nd7 9. Bb2 f5 10. Nbd2 b6? 11. cxd5 {L'échange ouvre la colonne c pour la dame. [%cal Gc2c6]}
11... cxd5
(11... exd5 12. Qxc6 {La dame prend le pion c6 et vise la tour a8. [%cal Gc6a8]})
12. Qc6 {La dame attaque la tour a8 et le pion e6. [%cal Gc6a8,Gc6e6]}
12... Rb8 13. Qxe6+ Kh8 14. Qxd5 {Vous avez gagné deux pions centraux.}`,
    conclusion:
      "Dans le Stonewall, la case c6 est fragile. Quand …b6 la laisse sans défense, cxd5 puis Qc6 gagne du matériel.",
  },
  {
    title: "Ouverte : 7…b5? 8.Ne5!",
    eco: "E04",
    kind: "trap",
    objectives: [
      "Démasquer le fou g2 sur le cavalier c6",
      "Gagner la tour a8 par la grande diagonale",
      "Garder le fou actif en c6 après Bxa8",
    ],
    pgn: `{Le coup …b5 protège le pion c4 mais oublie la grande diagonale : le cavalier c6 et la tour a8 sont alignés face au fou g2.}
1. d4 Nf6 2. c4 e6 3. g3 d5 4. Bg2 dxc4 5. Nf3 a6 6. O-O Nc6 7. e3 b5? 8. Ne5 {Le cavalier attaque c6 et démasque le fou g2. [%cal Ge5c6,Gg2c6]}
8... Nxe5
(8... Bd7 9. Nxc6 Bxc6 10. Bxc6+ {Le fou prend avec échec : vous gagnez une pièce. [%cal Gc6e8]})
9. Bxa8 {Le fou gagne la tour a8. [%cal Gg2a8]}
9... Ned7 10. Bc6 {Le fou revient en sécurité et bloque le pion c7. [%cal Gc6b5]}`,
    conclusion:
      "Quand un cavalier noir est en c6 avec la tour en a8, le fou g2 menace toujours la diagonale. Ne5 démasque ce fou et gagne la qualité.",
  },
];
