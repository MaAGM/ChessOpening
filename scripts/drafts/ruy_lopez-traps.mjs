// Chapitre « Pièges » de la Masterclass « Partie Espagnole ».
// Chaque piège a été vérifié avec Stockfish (scripts/opening-lab.mjs eval / traps).
const MORPHY = "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O";

export const TRAPS = [
  {
    title: "Le piège de Tarrasch : 7…O-O? dans la Steinitz",
    eco: "C66",
    kind: "trap",
    objectives: [
      "Échanger en c6 puis ouvrir le centre par dxe5 quand les Noirs roquent trop tôt",
      "Gagner le pion e5 après l'échange des dames",
      "Finir par la fourchette Be7 contre les deux tours",
    ],
    pgn: `{Dans la vieille Défense Steinitz, le pion e5 n'est défendu que par le pion d6 et le cavalier c6. Si les Noirs roquent avant de régler la tension, Bxc6 et dxe5 leur font perdre un pion, puis une qualité.}
1. e4 e5 2. Nf3 Nc6 3. Bb5 d6 4. d4 Bd7 5. Nc3 Nf6 6. O-O Be7 7. Re1 O-O? {Les Noirs roquent sans voir que e5 va tomber.}
8. Bxc6 {Le fou élimine le défenseur de e5. [%cal Gb5c6]}
8... Bxc6 9. dxe5 dxe5 10. Qxd8 Raxd8 11. Nxe5 {Le cavalier gagne le pion. [%cal Gf3e5]}
11... Bxe4 12. Nxe4 Nxe4 13. Nd3 {Le cavalier recule : la tour e1 cloue le cavalier e4 contre le fou e7. [%cal Ge1e4]}
13... f5 14. f3 Bc5+ 15. Nxc5 Nxc5 16. Bg5 {Le fou attaque la tour d8 avec gain de temps. [%cal Gg5d8]}
16... Rd5 17. Be7 {Le fou attaque les deux tours et le cavalier c5 à la fois. [%cal Ge7f8,Ge7c5]}
17... Re8 18. c4 {Le pion chasse la tour d5 : la qualité tombe.}`,
    conclusion:
      "Quand le pion e5 n'est défendu que par d6 et le cavalier c6, Bxc6 et dxe5 le gagnent. Le piège de Tarrasch se termine par Bg5 puis Be7, qui frappe deux tours.",
  },
  {
    title: "6…d5? : le cavalier c6 cloué",
    eco: "C84",
    kind: "trap",
    objectives: [
      "Reconnaître le clouage du fou a4 sur le cavalier c6",
      "Prendre en d5 puis gagner le pion e5",
      "Punir …Bd7 par le sacrifice Nxf7 et Qh5+",
    ],
    pgn: `{Après 6.Re1, les Noirs aiment frapper le centre par …d5. Mais tant que …b5 n'a pas été joué, votre fou a4 cloue le cavalier c6 sur le roi e8 : le pion e5 n'a donc plus de vrai défenseur.}
${MORPHY} Be7 6. Re1 d5? {Le pion attaque e4, mais le cavalier c6 est cloué.}
7. exd5 Nxd5
(7... Qxd5 8. Nxe5 {Le cavalier prend : …Nxe5 est impossible à cause du clouage. [%cal Ga4e8]})
8. Nxe5 {Le cavalier prend e5 : le cavalier c6 ne peut pas le reprendre. [%cal Ga4c6]}
8... Bd7 9. Nxf7 {Le sacrifice ouvre le roi noir. [%cal Ge5f7]}
9... Kxf7 10. Qh5+ g6 11. Qxd5+ {La dame reprend le cavalier avec échec : vous avez deux pions de plus et le roi noir est à découvert.}`,
    conclusion:
      "Tant que le fou a4 est en place et que …b5 n'a pas été joué, le cavalier c6 est cloué. Un pion e5 défendu par une pièce clouée est un pion en prise.",
  },
  {
    title: "6…exd4? : la variante de Riga",
    eco: "C80",
    kind: "trap",
    objectives: [
      "Clouer le cavalier e4 par Re1 quand les Noirs prennent en d4",
      "Reprendre d4 avec le cavalier et prendre en c6",
      "Rendre la qualité en e4 pour échanger les dames avec avantage",
    ],
    pgn: `{Dans l'Ouverte, 6…exd4 ouvre la colonne e alors que le roi noir n'a pas roqué. Après Re1, le cavalier e4 est cloué ; les Noirs tentent un sacrifice en h2, mais la suite forcée vous laisse deux pièces mineures contre une tour.}
${MORPHY} Nxe4 6. d4 exd4? {Les Noirs ouvrent la colonne e devant leur propre roi.}
7. Re1 {La tour cloue le cavalier e4. [%cal Ge1e4,Ge4e8]}
7... d5 8. Nxd4 {Le cavalier reprend et attaque c6. [%cal Gd4c6]}
8... Bd6 9. Nxc6 Bxh2+
(9... Qh4 10. g3 {Le pion chasse la dame et protège h2 : les Noirs ont perdu une pièce.})
10. Kh1 Qh4 11. Rxe4+ {La tour rend la qualité pour casser l'attaque. [%cal Ge1e4]}
11... dxe4 12. Qd8+ Qxd8 13. Nxd8+ Kxd8 14. Kxh2 {Le roi prend le fou : deux pièces mineures contre une tour, l'avantage est blanc.}`,
    conclusion:
      "Contre 6…exd4?, Re1 cloue le cavalier e4. Après le sacrifice en h2, Kh1, Rxe4+ et Qd8+ simplifient : vos pièces mineures dominent la finale.",
  },
  {
    title: "Schliemann : 7…dxc6? et l'échange des dames",
    eco: "C63",
    kind: "trap",
    objectives: [
      "Échanger en c6 contre …Bc5 dans la Schliemann",
      "Échanger les dames quand les Noirs reprennent avec le pion d",
      "Gagner le pion e5 après Qxd8+",
    ],
    pgn: `{Dans la Schliemann avec 4.d3, l'échange Bxc6 laisse un choix aux Noirs. La bonne reprise est …bxc6 ; avec …dxc6?, la colonne d s'ouvre entre les dames, et après leur échange le pion e5 n'a plus de défenseur.}
1. e4 e5 2. Nf3 Nc6 3. Bb5 f5 4. d3 fxe4 5. dxe4 Nf6 6. O-O Bc5 7. Bxc6 {Le fou enlève le défenseur de e5. [%cal Gb5c6]}
7... dxc6? {La mauvaise reprise : la colonne d s'ouvre.}
8. Qxd8+ {L'échange des dames enlève à la dame noire la défense de e5.}
8... Kxd8 9. Nxe5 {Le cavalier gagne le pion, et le roi noir ne peut plus roquer. [%cal Gf3e5]}
9... Bd6 10. Nf7+ {Le cavalier fourchette le roi et la tour h8. [%cal Gf7h8]}`,
    conclusion:
      "Contre la Schliemann, Bxc6 pose une question : après …dxc6?, Qxd8+ et Nxe5 gagnent un pion. Retenez que l'échange des dames supprime le dernier défenseur de e5.",
  },
];
