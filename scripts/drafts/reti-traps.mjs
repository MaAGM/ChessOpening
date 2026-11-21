// Chapitre « Pièges » de la Masterclass « Réti ».
// Chaque piège a été vérifié avec Stockfish (scripts/opening-lab.mjs eval / traps).

export const TRAPS = [
  {
    title: "…Bf5 et …dxe4 : la fourchette du pion e4",
    eco: "A07",
    kind: "trap",
    objectives: [
      "Reprendre dxe4 pour attaquer le fou f5",
      "Punir 9…Nxe4?? par Nxe4 qui gagne une pièce",
      "Savoir que le fou doit reculer en h7",
    ],
    pgn: `{Contre le schéma …c6, …Bf5 et …e6, la poussée e4 attaque d5. Si les Noirs échangent en e4, la reprise dxe4 touche le fou f5. La tentative de contre-attaque par …Nxe4 ne fonctionne pas : la dame e1 soutient le cavalier d2 sur la colonne e.}
1. Nf3 d5 2. g3 Nf6 3. Bg2 c6 4. O-O Bf5 5. d3 e6 6. Nbd2 h6 7. Qe1 {La dame prépare e4 et soutient la colonne e. [%cal Ge1e4]}
7... Be7 8. e4 {Le pion attaque d5 : la tension centrale commence. [%cal Ge4d5]}
8... dxe4 9. dxe4 {La reprise du pion d attaque le fou f5. [%cal Ge4f5]}
9... Nxe4??
(9... Bh7 {Le fou recule : c'est la seule bonne réponse.} 10. Ne5 {Le cavalier prend l'avant-poste e5 ; votre centre e4 est plus actif que le pion e6 noir. [%cal Gf3e5]})
10. Nxe4 {Le cavalier d2 reprend : e4 est défendu par la dame e1. [%cal Gd2e4]}
10... Bxe4
(10... O-O {Les Noirs renoncent à reprendre.} 11. Ne5 {Vous avez une pièce de plus et une position centralisée. [%cal Gf3e5]})
11. Qxe4 {La dame reprend le fou : vous avez gagné une pièce contre un pion. [%cal Ge1e4]}`,
    conclusion:
      "Après 8.e4 dxe4 9.dxe4, le fou f5 doit reculer en h7. 9…Nxe4?? perd une pièce, car la dame e1 soutient la reprise sur toute la colonne e.",
  },
  {
    title: "9…e5? contre c4 : le pion e5 sans défenseur",
    eco: "A07",
    kind: "trap",
    objectives: [
      "Vérifier qui défend e5 avant de laisser les Noirs pousser",
      "Prendre Nxe5 dès que le pion est sans soutien",
      "Garder le pion avec Re1 et le fou b2 sur la grande diagonale",
    ],
    pgn: `{Dans la version double fianchetto du Réti, avec b3 et Bb2, les Noirs veulent souvent jouer …e5. Sans cavalier en d7 ou c6, le pion e5 n'est défendu par rien : le cavalier f3 le prend sans contrepartie.}
1. Nf3 d5 2. g3 Nf6 3. Bg2 c6 4. O-O Bf5 5. d3 e6 6. Nbd2 h6 7. b3 {Le pion prépare le fianchetto de l'autre fou. [%cal Gc1b2]}
7... Be7 8. Bb2 O-O 9. c4 {Le pion attaque d5 : votre fou b2 vise e5 à travers le centre. [%cal Gc4d5,Gb2e5]}
9... e5?
(9... a5 {Les Noirs gagnent de l'espace à l'aile dame.} 10. Qc2 {La dame soutient e4 et relie les tours. [%cal Gc2e4]})
(9... Nbd7 {Le cavalier prépare …e5 en le protégeant d'avance.} 10. a3 {Le pion prépare b4 : vous gagnez de l'espace à l'aile dame. [%cal Ga3b4]})
10. Nxe5 {Le pion e5 tombe : ni le cavalier f6 ni la dame ne le protégeaient. [%cal Gf3e5]}
10... Bh7 11. Re1 {La tour soutient le cavalier e5 et prépare e4. [%cal Ge1e5]}`,
    conclusion:
      "Avant …e5, les Noirs doivent le préparer par …Nbd7. Sans ce soutien, Nxe5 gagne un pion net, et le fou b2 rend le cavalier e5 difficile à chasser.",
  },
  {
    title: "9…d4? : le centre fermé et l'attaque Nh4-f4",
    eco: "A07",
    kind: "trap",
    objectives: [
      "Profiter de la fermeture du centre pour jouer Nh4 et f4",
      "Contrôler f5 avec le cavalier h4",
      "Ouvrir la colonne f par f4 et gxf4",
    ],
    pgn: `{Dans la ligne Yougoslave avec …Bg4-h5, les Noirs ferment parfois le centre par …d4. Ils libèrent ainsi les Blancs de toute contre-attaque centrale : Nh4 puis f4 ouvrent l'aile roi, et le fou h5 se retrouve isolé de son camp.}
1. Nf3 d5 2. g3 Nf6 3. Bg2 c6 4. O-O Bg4 5. d3 Nbd7 6. Nbd2 e5 7. e4 Bd6 8. h3 Bh5 9. Qe1 {La dame prépare f4 en surveillant e5. [%cal Ge1e5]}
9... d4?
(9... O-O {Le roque garde la tension au centre.} 10. Nh4 {Le cavalier vise f5 : la partie reste équilibrée. [%cal Gh4f5]})
10. Nh4 {Le cavalier libère le pion f et vise la case f5. [%cal Gh4f5,Gf2f4]}
10... Bc7
(10... g6 {Les Noirs empêchent Nf5, mais affaiblissent les cases noires.} 11. Nc4 {Le cavalier attaque d6 et e5 : f4 suivra avec encore plus de force. [%cal Gc4e5]})
11. f4 {Le levier attaque e5 : la colonne f va s'ouvrir. [%cal Gf4e5]}
11... exf4 12. gxf4 {La reprise du pion g ouvre la colonne g et prépare e5 contre le cavalier f6. [%cal Ge4e5]}`,
    conclusion:
      "Le coup …d4 ferme le centre et supprime le contre-jeu noir. Avec Nh4 et f4, vos pièces passent à l'aile roi, là où le fou h5 n'est plus d'aucune aide.",
  },
  {
    title: "…Ndxe5? : le pion e5 défendu trois fois",
    eco: "A08",
    kind: "trap",
    objectives: [
      "Compter les attaquants et défenseurs du pion e5",
      "Utiliser la batterie Qe2-Re1 sur la colonne e",
      "Finir l'échange avec la tour pour gagner une pièce",
    ],
    pgn: `{Dans la ligne principale avec …Qc7, le pion e5 semble attaqué trois fois : cavaliers d7 et c6, dame c7. Mais il est défendu trois fois aussi : cavalier f3, dame e2 et tour e1 derrière elle. Celui qui prend en dernier gagne : ce sont les Blancs.}
1. Nf3 d5 2. g3 c5 3. Bg2 Nc6 4. O-O e6 5. d3 Nf6 6. Nbd2 Be7 7. e4 O-O 8. Re1 Qc7 9. e5 {Le pion chasse le cavalier f6 et gagne de l'espace. [%cal Ge5f6]}
9... Nd7 10. Qe2 {La dame se place devant la tour : e5 est défendu trois fois. [%cal Ge1e5,Gf3e5]}
10... Ndxe5?
(10... b5 {Le plan sain : les Noirs avancent à l'aile dame.} 11. Nf1 {Le cavalier prend le chemin de h2 et g4, vers le roi noir. [%cal Gf1h2]})
11. Nxe5 Nxe5 12. Qxe5 {La dame reprend, soutenue par la tour e1 : c'est le troisième défenseur qui fait la différence. [%cal Ge2e5]}
12... Qxe5
(12... Bd6 {La dame noire évite l'échange.} 13. Qh5 {La dame s'installe devant le roi noir avec une pièce de plus. [%cal Gh5h7]})
13. Rxe5 {La tour reprend : vous avez une pièce de plus. [%cal Ge1e5]}`,
    conclusion:
      "Avant de prendre un pion, comptez attaquants et défenseurs. Ici, la batterie Qe2-Re1 et le cavalier f3 défendent e5 trois fois : …Ndxe5? perd une pièce.",
  },
];
