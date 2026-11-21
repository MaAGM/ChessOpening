// Chapitre « Pièges » de la Masterclass « Gambit du roi » (côté Blancs).
// Chaque piège a été vérifié avec Stockfish (scripts/opening-lab.mjs eval / traps).
export const TRAPS = [
  {
    title: "Kieseritzky : 6…d6? 7.Nxf7!",
    eco: "C39",
    kind: "trap",
    objectives: [
      "Repérer que …d6 retire la défense naturelle de f7",
      "Prendre en f7 avec la fourchette dame-tour",
      "Gagner la tour h8 avant de sortir le cavalier",
    ],
    pgn: `{Après 6.Bc4, le pion f7 est attaqué deux fois. Le coup …d6 chasse le cavalier, mais trop tard : Nxf7 attaque la dame d8 et la tour h8.}
1. e4 e5 2. f4 exf4 3. Nf3 g5 4. h4 g4 5. Ne5 Nf6 6. Bc4 d6? 7. Nxf7 {Le cavalier fourche la dame d8 et la tour h8. [%cal Gf7d8,Gf7h8]}
7... Qe7 8. Nxh8 d5
(8... Nxe4 9. O-O {Le roi est à l'abri : vous gardez la tour gagnée. [%cal Gf1f4]})
9. Bb5+ {Le fou s'échappe avec échec avant que …dxc4 ne le prenne.}
9... c6 10. O-O {Vous avez une qualité de plus et le roque est fait. [%cal Gf1f4]}`,
    conclusion:
      "Dans le Kieseritzky, le pion f7 est la cible du cavalier e5 et du fou c4. Si les Noirs jouent …d6 sans …d5, Nxf7 gagne la tour h8.",
  },
  {
    title: "Kieseritzky : 8…c6? 9.Bxf4!",
    eco: "C39",
    kind: "trap",
    objectives: [
      "Reprendre le pion f4 quand les Noirs attaquent d5",
      "Donner l'échec en b5 après …cxd5",
      "Garder le cavalier e5 dominant",
    ],
    pgn: `{Dans la défense Anderssen, 8…Nh5 protège le pion f4. Le coup 8…c6 attaque d5 mais oublie ce pion : le fou c1 le prend et votre centre devient écrasant.}
1. e4 e5 2. f4 exf4 3. Nf3 g5 4. h4 g4 5. Ne5 Nf6 6. Bc4 d5 7. exd5 Bd6 8. d4 c6? 9. Bxf4 {Le fou reprend f4 et soutient le cavalier e5. [%cal Gf4e5]}
9... cxd5
(9... O-O 10. Nc3 cxd5 11. Bxd5 Nxd5 12. Nxd5 {Le cavalier d5 domine : vous avez récupéré le pion avec une position supérieure.})
10. Bb5+ {L'échec gêne le développement noir : le pion g4 tombera ensuite. [%cal Gb5e8]}`,
    conclusion:
      "Le pion f4 est le seul pion de plus des Noirs dans le Kieseritzky. S'ils oublient de le défendre, Bxf4 rétablit le matériel avec un grand avantage.",
  },
  {
    title: "Défense Fischer : 8…Bd7? 9.Nxf4!",
    eco: "C34",
    kind: "trap",
    objectives: [
      "Compter les défenseurs du pion f4",
      "Prendre en f4 grâce au fou c1",
      "Gagner la tour a8 par Nxc7+",
    ],
    pgn: `{Dans la défense Fischer avec …Qf6 et …Ne7, le pion f4 doit être défendu deux fois, par la dame et le fou h6. Après 8…Bd7, le cavalier e2 le prend : la dame ne peut pas reprendre à cause du fou c1.}
1. e4 e5 2. f4 exf4 3. Nf3 d6 4. d4 g5 5. h4 g4 6. Ng1 Qf6 7. Nc3 Ne7 8. Nge2 Bd7? 9. Nxf4 {Le cavalier prend : …Qxf4 perdrait la dame sur Bxf4. [%cal Gc1f4]}
9... Nbc6
(9... Bh6 10. Nfd5 {Le saut en d5 menace à la fois la dame f6 et la fourchette Nxc7+. [%cal Gd5f6,Gd5c7]})
10. Nfd5 Nxd5 11. Nxd5 Qxd4 12. Nxc7+ Kd8 13. Nxa8 {Le cavalier gagne la tour a8 : vous avez une qualité de plus.}`,
    conclusion:
      "Contre la défense Fischer, le pion f4 tombe dès qu'il n'a plus qu'un défenseur : Nxf4 puis Nd5 frappent la dame et le pion c7.",
  },
  {
    title: "Falkbeer : 7…Bf2+? 8.Kd1!",
    eco: "C31",
    kind: "trap",
    objectives: [
      "Garder la dame en e2 au lieu de prendre en f2",
      "Attaquer le cavalier e4, seul défenseur du fou f2",
      "Chasser la dame noire par c3",
    ],
    pgn: `{Dans le Falkbeer, l'échec …Bf2+ semble gagner du temps. Mais le fou f2 n'est tenu que par le cavalier e4 : après Kd1, vos cavaliers attaquent ce défenseur et le fou tombe.}
1. e4 e5 2. f4 d5 3. exd5 e4 4. d3 Nf6 5. dxe4 Nxe4 6. Nf3 Bc5 7. Qe2 Bf2+? 8. Kd1 {Le roi s'écarte : la dame attaque e4, défenseur du fou f2. [%cal Ge2e4,Ge4f2]}
8... Qxd5+
(8... f5 9. Nfd2 Bb6 10. Nxe4 fxe4 11. Qxe4+ {Vous reprenez le pion avec échec : le roi noir est exposé.})
9. Nfd2 {Le cavalier couvre l'échec et attaque e4. [%cal Gd2e4]}
9... f5 10. Nc3 Qd4 11. Nxe4 fxe4 12. c3 {Le pion chasse la dame : le fou f2 perd son dernier soutien. [%cal Gc3d4,Ge2f2]}`,
    conclusion:
      "Contre …Bf2+ dans le Falkbeer, Kd1 garde la dame sur e2. Le fou f2 dépend du cavalier e4 : attaquez ce défenseur et la pièce tombe.",
  },
];
