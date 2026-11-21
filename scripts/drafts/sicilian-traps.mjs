// Chapitre « Pièges » de la Masterclass « Défense Sicilienne » (côté Noirs).
// Chaque piège a été vérifié avec Stockfish (scripts/opening-lab.mjs eval / traps).
export const TRAPS = [
  {
    title: "5.Bg5? : le pion e4 oublié",
    eco: "B54",
    kind: "trap",
    objectives: [
      "Vérifier si le pion e4 est encore défendu avant Nc3",
      "Prendre en e4 en attaquant le fou g5",
      "Chasser les cavaliers blancs par …e5 et …a6",
    ],
    pgn: `{Après 4…Nf6, le pion e4 est attaqué : les Blancs doivent jouer Nc3 ou f3. S'ils sortent le fou en g5, votre cavalier prend e4 avec gain de temps, car le pion e7 protège la dame d8.}
1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Bg5? {Le fou oublie que le pion e4 n'est plus défendu.}
5... Nxe4 {Le cavalier prend e4 et attaque le fou g5. [%cal Ge4g5]}
6. Be3 e5 {Le fou e3 a reculé : le pion e5 repousse maintenant le cavalier central. [%cal Ge5d4]}
7. Nb5 a6 {Le pion repousse le cavalier, qui menaçait c7. [%cal Ga6b5]}
8. N5c3 Nxc3 9. Nxc3 {Vous avez un pion de plus et le centre.}`,
    conclusion:
      "Dans la Sicilienne ouverte, le cavalier f6 attaque e4 dès le quatrième coup. Tant que Nc3 n'est pas joué, comptez les défenseurs de e4 : souvent, il tombe.",
  },
  {
    title: "Pion empoisonné : 9.f5? Qxa1+",
    eco: "B97",
    kind: "trap",
    objectives: [
      "Repérer que la tour a1 est en prise une fois b2 pris",
      "Prendre la tour avec échec par …Qxa1+",
      "Ramener la dame en b2 en gardant la qualité",
    ],
    pgn: `{Après 8…Qxb2, la dame noire attaque la tour a1. Les Blancs doivent jouer Rb1 ou Nb3 : toute autre poussée offre la tour avec échec, car la première rangée est vide.}
1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Bg5 e6 7. f4 Qb6 8. Qd2 Qxb2 9. f5?
(9. e5? Qxa1+ {La même prise : la tour tombe avec échec.} 10. Ke2 dxe5 11. fxe5 Nd5 {Le cavalier bloque et échange : votre avantage matériel est décisif. [%cal Gd5c3]})
(9. Bxf6? Qxa1+ {Le coup intermédiaire avant de reprendre en f6.} 10. Kf2 Qb2 {La dame revient et attaque le cavalier c3. [%cal Gb2c3]})
9... Qxa1+ {La dame prend la tour avec échec. [%cal Ga1e1]}
10. Ke2 Be7 11. g4 Qb2 {La dame se replie : vous avez une tour de plus. [%cal Gb2c3]}`,
    conclusion:
      "Dans le Pion empoisonné, la tour a1 est votre première cible après …Qxb2. Si les Blancs oublient Rb1, …Qxa1+ gagne une tour entière.",
  },
  {
    title: "Alapine : 7.Bf4? et le fou sans défense",
    eco: "B22",
    kind: "trap",
    objectives: [
      "Prendre le fou f4 avec le cavalier d5",
      "Contrer la poussée d5 par …Nxd5",
      "Échanger les dames avec deux pions de plus",
    ],
    pgn: `{Dans l'Alapine, votre cavalier d5 contrôle f4. Si les Blancs y placent leur fou pour défendre e5, le cavalier le prend tout simplement.}
1. e4 c5 2. c3 Nf6 3. e5 Nd5 4. d4 cxd4 5. Nf3 Nc6 6. cxd4 d6 7. Bf4? {Le fou défend e5, mais il va sur une case que le cavalier contrôle.}
7... Nxf4 {Le cavalier prend le fou : une pièce de plus. [%cal Gd5f4]}
8. d5 Nxd5 {Le cavalier f4 revient en d5 et prend le pion. [%cal Gf4d5]}
9. Qxd5 dxe5 {Le pion d6 dégage la colonne : votre dame attaque la sienne. [%cal Gd8d5]}
10. Qxd8+ Kxd8 {Vous avez deux pions de plus en finale.}`,
    conclusion:
      "Le cavalier d5 de l'Alapine contrôle b4, c3, e3 et f4. Avant chaque coup blanc, regardez s'il ne va pas se poser sur une de ces cases.",
  },
  {
    title: "3.Bb5+ Bd7 4.O-O? Bxb5",
    eco: "B52",
    kind: "trap",
    objectives: [
      "Remarquer que le fou b5 n'est défendu par rien",
      "Prendre le fou et garder la pièce",
      "Développer par …e6 et …Nf6 face au gambit b4",
    ],
    pgn: `{Après 3.Bb5+ Bd7, le fou b5 est attaqué : les Blancs doivent l'échanger, le défendre par a4 ou c4, ou reculer. S'ils roquent, votre fou le prend sans contrepartie.}
1. e4 c5 2. Nf3 d6 3. Bb5+ Bd7 4. O-O? {Le roque oublie le fou b5.}
4... Bxb5 {Le fou prend : une pièce de plus. [%cal Gd7b5]}
5. Re1 e6 {Le pion soutient d5 et ouvre la diagonale du fou f8. [%cal Gf8e7]}
6. b4 cxb4 7. d4 Nf6 8. a3 d5 {Le centre est verrouillé : la pièce de plus fera la différence. [%cal Gd5e4]}`,
    conclusion:
      "Après 3.Bb5+ Bd7, vérifiez toujours si le fou b5 est protégé. Sans a4, c4 ou Nc3, il est en prise : …Bxb5 gagne une pièce.",
  },
];
