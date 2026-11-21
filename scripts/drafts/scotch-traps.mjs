// Chapitre « Pièges » de la Masterclass « Partie écossaise » (côté Blancs).
// Chaque piège a été vérifié avec Stockfish (scripts/opening-lab.mjs eval / traps).
export const TRAPS = [
  {
    title: "Mieses : 7…Qe7? 8.cxd5!",
    eco: "C45",
    kind: "trap",
    objectives: [
      "Voir que le cavalier d5 n'a plus de case après c4",
      "Prendre le cavalier même si e5 tombe avec échec",
      "Échanger les dames pour garder la pièce de plus",
    ],
    pgn: `{Après 6…Nd5 7.c4, le cavalier noir doit reculer en b6. Le coup …Qe7 attaque e5 mais laisse le cavalier en prise : la menace de prendre e5 avec échec ne compense pas la pièce perdue.}
1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Nxd4 Nf6 5. Nxc6 bxc6 6. e5 Nd5 7. c4 Qe7? 8. cxd5 {Le pion prend le cavalier : les Noirs n'ont qu'un pion en échange. [%cal Gc4d5]}
8... Qxe5+ 9. Qe2 {La dame bloque l'échec et propose l'échange des dames. [%cal Ge2e5]}
9... Qxe2+ 10. Bxe2 cxd5 11. Nc3 {Vous avez une pièce contre un pion, et le pion d5 isolé est attaqué. [%cal Gc3d5]}`,
    conclusion:
      "Dans la Mieses, le cavalier d5 doit fuir dès que c4 le chasse. Si les Noirs l'oublient pour attaquer e5, cxd5 gagne une pièce.",
  },
  {
    title: "Classique : 10…Qb6? 11.Bxc5!",
    eco: "C45",
    kind: "trap",
    objectives: [
      "Échanger les fous pour attirer la dame en c5",
      "Proposer l'échange des dames en d4",
      "Utiliser le cavalier b5 contre c7 et la tour a8",
    ],
    pgn: `{Après 8…d5 9.O-O dxe4, le cavalier b5 vise c7. La dame noire qui va en b6 semble défendre le fou c5, mais elle se fait piéger par l'échange des fous puis Qd4.}
1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Nxd4 Bc5 5. Be3 Qf6 6. c3 Nge7 7. Bc4 Ne5 8. Be2 d5 9. O-O dxe4 10. Nb5 Qb6?
(10... Bb6 11. Bxb6 Qxb6 12. Qd4 {Même idée : la dame d4 attaque la dame b6, et le pion c7 tombera avec la tour a8. [%cal Gd4b6,Gb5c7]})
11. Bxc5 {Le fou c5 disparaît et la dame noire doit reprendre. [%cal Ge3c5]}
11... Qxc5 12. Qd4 {La dame propose l'échange : après cxd4, le pion attaque le cavalier e5. [%cal Gd4c5,Gd4e5]}
12... Qxd4 13. cxd4 Bg4 14. Nxc7+ {Échec : le cavalier attaque la tour a8. [%cal Gc7a8]}
14... Kd7 15. Bxg4+ Nxg4 16. Nxa8 {Vous avez gagné la qualité et un pion de plus.}`,
    conclusion:
      "Le cavalier b5 et la colonne d sont des armes réelles dans la variante classique. Quand la dame noire défend mal c7, l'échange des fous puis Qd4 gagne du matériel.",
  },
  {
    title: "Steinitz : 7…Qe5? 8.f4!",
    eco: "C45",
    kind: "trap",
    objectives: [
      "Voir que la dame e5 est la seule défense du pion c7",
      "Chasser la dame avec f4 pour libérer la case c7",
      "Prendre en c7 avec échec puis gagner la tour a8",
    ],
    pgn: `{Après 7.Be2, le roi noir doit aller en d8. Le recul …Qe5 semble couvrir c7 par la diagonale e5-c7, mais le pion f4 chasse la dame et le cavalier b5 entre en c7.}
1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Nxd4 Qh4 5. Nb5 Bb4+ 6. Bd2 Qxe4+ 7. Be2 Qe5? 8. f4 {Le pion attaque la dame, qui doit quitter la diagonale de c7. [%cal Gf4e5,Ge5c7]}
8... Bxd2+
(8... Qe4 9. Nxc7+ Kd8 10. Nxa8 {La dame e4 ne défend plus c7 : vous gagnez la tour a8. [%cal Gb5c7,Gc7a8]})
9. Nxd2 Qxf4 10. g3 {Le pion chasse la dame de f4 sans perdre de temps. [%cal Gg3f4]}
10... Qf5 11. Nxc7+ {Le cavalier fourche le roi e8 et la tour a8. [%cal Gc7e8,Gc7a8]}
11... Kd8 12. Nxa8 {Vous avez une tour de plus contre deux pions.}`,
    conclusion:
      "Dans la Steinitz, le pion c7 est la cible du cavalier b5. Quand la dame noire est sa seule défense, un coup de pion qui la chasse suffit à gagner la tour a8.",
  },
  {
    title: "Göring : 7…Bd7? 8.Bxf7+!",
    eco: "C44",
    kind: "trap",
    objectives: [
      "Exploiter la batterie dame b3 et fou c4 sur f7",
      "Profiter du roi e7 bloqué au centre",
      "Garder le fou f7 avec la dame sur la diagonale a2-f7",
    ],
    pgn: `{Dans le Göring, Qb3 vise f7 et b7. Le coup …Bd7 développe sans défendre f7 : le fou prend avec échec et le roi noir ne peut plus roquer.}
1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. c3 dxc3 5. Nxc3 d6 6. Bc4 Nf6 7. Qb3 Bd7? 8. Bxf7+ {Le fou prend avec échec : le roi doit avancer. [%cal Gc4f7]}
8... Ke7 9. a4 {Coup calme : le fou f7 reste en place, et la tour a1 pourra entrer en jeu par a3. [%cal Ga1a3]}
9... Na5 10. Qa2 {La dame garde le fou f7 sur la diagonale a2-f7. [%cal Ga2f7]}
10... Qc8 11. O-O {Vous avez gagné le pion f7 et le roi e7 ne peut plus roquer.}`,
    conclusion:
      "Dans le Göring, f7 est la cible de la dame et du fou. Si les Noirs développent sans le défendre, Bxf7+ gagne un pion et prive le roi du roque.",
  },
];
