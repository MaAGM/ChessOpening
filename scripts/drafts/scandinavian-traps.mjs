// Chapitre « Pièges » de la Masterclass « Défense Scandinave ».
// Chaque piège a été vérifié avec Stockfish (scripts/opening-lab.mjs eval / traps).
const MAIN = "1. e4 d5 2. exd5 Qxd5 3. Nc3 Qa5 4. d4 Nf6 5. Nf3 Bf5 6. Bc4 e6 7. Bd2 c6";

export const TRAPS = [
  {
    title: "10.Nh4? Qxd4 : la double attaque sur d4 et c4",
    eco: "B01",
    kind: "trap",
    objectives: [
      "Voir que Nh4 retire le seul défenseur du pion d4",
      "Prendre en d4 pour attaquer aussi le fou c4",
      "Reprendre en c4 avec la dame, pas avec le pion e6",
    ],
    pgn: `{Après 8.Nd5 Qd8 9.Nxf6+ gxf6, les Blancs aimeraient chasser votre fou f5 par Nh4. Mais le cavalier f3 était le seul défenseur de d4 : la dame noire le prend, et frappe en même temps le fou c4.}
${MAIN} 8. Nd5 Qd8 9. Nxf6+ gxf6 10. Nh4? {Le cavalier attaque le fou f5, mais il abandonne d4.}
10... Qxd4 {La dame prend le pion et attaque le fou c4 et le pion b2.}
11. Nxf5 {Les Blancs prennent le fou : il faut maintenant choisir la bonne reprise.}
11... Qxc4 {La dame reprend le fou c4 : vous avez un pion de plus. Avec 11…exf5? 12.Qe2+, les Blancs auraient gagné du temps contre votre roi resté au centre.}
12. Ne3 Qe4 {La dame se centralise et attaque g2 : votre pion de plus est sain.}`,
    conclusion:
      "Dans la structure …gxf6, le pion d4 n'a souvent qu'un défenseur : le cavalier f3. Dès qu'il part en h4, …Qxd4 gagne un pion en attaquant aussi le fou c4.",
  },
  {
    title: "5.Qf3? Nc6 : la dame blanche sortie trop tôt",
    eco: "B01",
    kind: "trap",
    objectives: [
      "Attaquer d4 par …Nc6 quand la dame blanche quitte d1",
      "Gagner un temps par …Bg4 contre la dame f3",
      "Punir Bd2 par …Nxd4 qui attaque la dame",
    ],
    pgn: `{Avec 5.Qf3, les Blancs veulent attaquer b7 et préparer Bd2. Mais leur dame ne défend plus d4, et elle devient une cible pour votre fou c8 et votre cavalier b8.}
1. e4 d5 2. exd5 Qxd5 3. Nc3 Qa5 4. d4 Nf6 5. Qf3? {La dame sort trop tôt et lâche d4.}
5... Nc6 {Le cavalier attaque d4, qui n'est plus défendu par la dame.}
6. Bb5
(6. Be3 Bg4 {Le fou chasse la dame avec gain de temps : elle n'a plus de bonne case.})
(6. Bd2 Nxd4 {Le cavalier prend d4 et attaque la dame f3 : les Blancs perdent un pion central.})
6... Bd7 {Le fou rompt le clouage : d4 reste sous pression.}
7. Ne2 a6 {Le pion chasse le fou b5 : vos pièces se développent avec gain de temps.}
8. Bd3 Bg4 {Le fou attaque la dame, et le cavalier e2 est cloué : les Blancs ne peuvent plus roquer facilement.}`,
    conclusion:
      "Contre une sortie prématurée de la dame en f3, …Nc6 et …Bg4 gagnent des temps. Si les Blancs défendent mal d4, …Nxd4 tombe avec attaque sur la dame.",
  },
  {
    title: "10.Qe2? Nxe5 : le cavalier c3 cloué",
    eco: "B01",
    kind: "trap",
    objectives: [
      "Échanger le cavalier e5 dès que les Blancs ne peuvent plus bien reprendre",
      "Utiliser le clouage a5-e1 contre le cavalier c3",
      "Ne jamais laisser la dame blanche reprendre en e5 sans réfléchir",
    ],
    pgn: `{Dans l'attaque 6.Ne5 c6 7.Bc4 e6 8.g4, les Blancs jouent parfois 10.Qe2 au lieu de l'échange Nxd7. Ils oublient que leur cavalier c3 est cloué par votre dame a5 : après l'échange en e5, …Ne4 attaque c3 une deuxième fois.}
1. e4 d5 2. exd5 Qxd5 3. Nc3 Qa5 4. d4 Nf6 5. Nf3 Bf5 6. Ne5 c6 7. Bc4 e6 8. g4 Bg6 9. h4 Nbd7 10. Qe2? {La dame quitte d1 : le cavalier c3 reste cloué sur le roi.}
10... Nxe5 {Le cavalier échange le grand cavalier blanc.}
11. dxe5
(11. Qxe5?? Qxe5+ {La dame reprend avec échec : l'échange des dames est forcé.} 12. dxe5 Nxg4 {Le cavalier gagne le pion g4 : vous avez un pion de plus et une structure saine.})
11... Ne4 {Le cavalier attaque c3, déjà cloué par la dame a5.}
12. O-O Nxc3 13. bxc3 {Les Blancs gardent le matériel, mais leurs pions de l'aile dame sont détruits et g4-h4 sont des faiblesses.}`,
    conclusion:
      "Avec la dame en a5, le cavalier c3 est cloué tant que les Blancs n'ont pas joué Bd2. Après 10.Qe2? Nxe5 dxe5 Ne4, vous détruisez la structure blanche.",
  },
  {
    title: "10.Nh4? Bxc2 : le fou f5 prend avant de fuir",
    eco: "B01",
    kind: "trap",
    objectives: [
      "Prendre en c2 quand le fou f5 est attaqué",
      "Punir 11.axb4?? par …Qxa1+",
      "Échanger les dames avec un pion de plus",
    ],
    pgn: `{Dans la ligne 8.Qe2 Bb4 9.a3 Nbd7, le coup 10.Nh4 attaque votre fou f5. Plutôt que de reculer, le fou prend le pion c2 : les Blancs ne peuvent pas prendre en b4 à cause de l'échec en a1.}
${MAIN} 8. Qe2 Bb4 9. a3 Nbd7 10. Nh4? {Le cavalier attaque le fou f5, mais c2 n'est plus protégé par rien.}
10... Bxc2 {Le fou prend un pion ; votre fou b4 semble en prise, mais axb4 ouvrirait la colonne a.}
11. f4
(11. axb4?? Qxa1+ {La dame prend la tour avec échec : la colonne a s'est ouverte pour elle.} 12. Nd1 Bxd1 {Le fou élimine le défenseur : vous avez une tour de plus.})
(11. Bb5 cxb5 {Le pion prend le fou : le sacrifice blanc ne mène à rien.})
11... Bxc3 12. Bxc3 Qh5 {La dame propose l'échange : en finale, votre pion de plus comptera.}`,
    conclusion:
      "Quand votre fou f5 est attaqué, regardez s'il peut prendre quelque chose avant de reculer. Ici, …Bxc2 gagne un pion, et axb4?? perd la tour sur …Qxa1+.",
  },
];
