// Chapitre « Pièges » de la Masterclass « Partie viennoise » (côté Blancs).
// Chaque piège a été vérifié avec Stockfish (scripts/opening-lab.mjs eval / traps).
export const TRAPS = [
  {
    title: "3.g3 d5 : 5…Nc6?? et le cavalier d5",
    eco: "C26",
    kind: "trap",
    objectives: [
      "Compter les attaquants et défenseurs du cavalier d5",
      "Prendre en d5 avec le fou g2",
      "Garder la pièce gagnée sans précipitation",
    ],
    pgn: `{Dans le fianchetto, le cavalier noir d5 est attaqué par le cavalier c3 et le fou g2. Seule la dame le défend : …Nc6 laisse une pièce en prise.}
1. e4 e5 2. Nc3 Nf6 3. g3 d5 4. exd5 Nxd5 5. Bg2 Nc6?? {Le cavalier d5 a deux attaquants pour un seul défenseur. [%cal Gc3d5,Gg2d5]}
6. Bxd5 {Le fou prend : si la dame reprend, Nxd5 gagne la dame.}
6... Bb4
(6... Bc5 7. d3 {Vous avez une pièce de plus ; les Noirs n'ont pas de compensation.})
7. Bg2 {Le fou rentre sur la grande diagonale : la pièce de plus est acquise. [%cal Gg2b7]}`,
    conclusion:
      "Contre 3.g3 d5, le cavalier d5 doit toujours être défendu deux fois. Sinon Bxd5 gagne une pièce.",
  },
  {
    title: "2…Bc5 3.Nf3 Nc6? 4.Nxe5!",
    eco: "C25",
    kind: "trap",
    objectives: [
      "Prendre le pion e5 grâce à la fourchette d4",
      "Accepter …Bxf2+ et reprendre avec le roi",
      "Punir …Qh4+ par g3 et Bf4",
    ],
    pgn: `{Contre 2…Bc5, le coup 3…Nc6 laisse e5 défendu une seule fois. 4.Nxe5 utilise la fourchette d4 : si …Nxe5, d4 attaque le fou et le cavalier.}
1. e4 e5 2. Nc3 Bc5 3. Nf3 Nc6? 4. Nxe5! {Le cavalier prend : d4 menace ensuite deux pièces noires. [%cal Gf3e5,Gd2d4]}
4... Bxf2+
(4... Nxe5 5. d4 Bb4 6. dxe5 {Vous avez gagné un pion et le centre.})
5. Kxf2 Nxe5 6. d4 Qh4+
(6... Qf6+ 7. Kg1 {Le roi se met à l'abri : le centre d4-e4 vous donne l'avantage.})
7. g3 Qf6+ 8. Bf4 {Le fou bloque l'échec et attaque le cavalier e5 cloué. [%cal Gf4e5,Gd4e5]}`,
    conclusion:
      "Contre …Bc5 et …Nc6, Nxe5 puis d4 forment une fourchette décisive : le sacrifice …Bxf2+ ne suffit pas.",
  },
  {
    title: "7.f5 : 7…Ng4? et Bxf7+",
    eco: "C28",
    kind: "trap",
    objectives: [
      "Prendre en f7 avec échec quand le cavalier g4 est en l'air",
      "Enchaîner Ng5+ pour chasser le roi",
      "Récupérer la pièce par Qxg4",
    ],
    pgn: `{Après 7.f5, le saut 7…Ng4 vise e3 et f2. Mais il laisse le pion f7 sans défense : Bxf7+ puis Ng5+ gagnent un pion et détruisent le roque noir.}
1. e4 e5 2. Nc3 Nf6 3. Bc4 Nc6 4. d3 Bc5 5. f4 d6 6. Nf3 a6 7. f5 Ng4? 8. Bxf7+! {Le fou prend avec échec : le roi doit répondre. [%cal Gc4f7]}
8... Kxf7
(8... Kf8 9. Bg5 {Le fou attaque la dame : le roi noir est coincé en f8. [%cal Gg5d8]})
9. Ng5+ Kg8 10. Qxg4 {La dame reprend la pièce : vous avez un pion de plus et le roi noir est exposé. [%cal Gg4g7]}`,
    conclusion:
      "Quand le cavalier noir quitte f6, le pion f7 perd sa défense : Bxf7+ et Ng5+ récupèrent la pièce avec un pion de plus.",
  },
  {
    title: "3.f4 Bb4? 4.fxe5 et le cavalier f6",
    eco: "C29",
    kind: "trap",
    objectives: [
      "Prendre en e5 pour chasser le cavalier f6",
      "Reprendre en e4 si le cavalier s'y installe",
      "Attaquer g7 par Qg4 après l'échange en c3",
    ],
    pgn: `{Contre le gambit viennois, 3…Bb4 est une erreur : après fxe5, le cavalier f6 n'a plus de bonne case. S'il va en e4, le cavalier c3 le prend.}
1. e4 e5 2. Nc3 Nf6 3. f4 Bb4? 4. fxe5 {Le pion attaque le cavalier f6. [%cal Ge5f6]}
4... Nxe4
(4... Bxc3 5. dxc3 Nxe4 6. Qg4 {La dame attaque g7 et le cavalier e4. [%cal Gg4g7,Gg4e4]} 6... d5 7. Qxg7 {La tour h8 est attaquée : le roi noir ne roquera plus.})
5. Nxe4 {Le cavalier e4 tombe : vous avez une pièce contre un pion.}
5... O-O 6. c3 Ba5 7. d4 {Le centre se renforce et le fou a5 est hors jeu. [%cal Gd4d5]}`,
    conclusion:
      "Dans le gambit viennois, …Bb4 ne défend pas e4 : après fxe5, le cavalier f6 n'a plus de case sûre.",
  },
];
