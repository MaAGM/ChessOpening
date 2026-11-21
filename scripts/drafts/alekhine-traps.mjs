// Chapitre « Pièges » de la Masterclass « Défense Alekhine ».
// Chaque piège a été vérifié avec Stockfish (scripts/opening-lab.mjs eval / traps).
const A = "1. e4 Nf6 2. e5 Nd5 3. d4 d6";

export const TRAPS = [
  {
    title: "5.Nc3? dxe5 : le centre blanc s'effondre",
    eco: "B03",
    kind: "trap",
    objectives: [
      "Prendre en e5 dès que les Blancs négligent le centre",
      "Calculer la séquence c5, exd4 et cxb6 jusqu'au bout",
      "Échanger les dames si les Blancs reprennent dxe5",
    ],
    pgn: `{Après 4.c4 Nb6, les Blancs doivent décider du sort du pion e5 : exd6 ou f4. Le développement naturel 5.Nc3 l'oublie : …dxe5 ouvre la colonne d, et la dame blanche n'a pas de bonne reprise.}
${A} 4. c4 Nb6 5. Nc3? {Le cavalier se développe, mais e5 et d4 restent sans soutien.}
5... dxe5 {La prise ouvre la colonne d face à la dame blanche. [%cal Gd8d1]}
6. c5
(6. dxe5 Qxd1+ {L'échange des dames : la structure blanche reste faible.} 7. Nxd1 Nc6 {Le cavalier attaque e5 : les Blancs doivent jouer f4.} 8. f4 Bf5 {Le fou se développe avec la case b1 en vue : votre avance de développement est nette.})
(6. d5 e6 {Le pion conteste d5 : le centre blanc est miné et votre cavalier b6 vise c4.})
6... exd4 {Le pion attaque le cavalier c3 au lieu de sauver le cavalier b6.}
7. cxb6 dxc3 8. Qxd8+ Kxd8 9. bxc7+ Kxc7 {Le roi reprend : vous avez un pion de plus, et le pion c3 menace encore b2.}`,
    conclusion:
      "Contre 4.c4 Nb6, le pion e5 doit être échangé ou soutenu immédiatement. Après 5.Nc3? dxe5, la colonne d s'ouvre et vous gagnez un pion dans toutes les lignes.",
  },
  {
    title: "5.Bf4? dxe5 : l'échange des dames qui coûte le roque",
    eco: "B03",
    kind: "trap",
    objectives: [
      "Prendre en e5 contre le fou f4 pour ouvrir la colonne d",
      "Échanger les dames avec échec si les Blancs reprennent du pion",
      "Gagner du temps contre le pion e5 isolé",
    ],
    pgn: `{Le coup 5.Bf4 semble protéger e5, mais après …dxe5, la reprise du pion d ouvre la colonne d : votre dame prend en d1 avec échec, et le roi blanc perd le droit de roquer.}
${A} 4. c4 Nb6 5. Bf4? {Le fou défend e5 une fois, mais le pion d4 reste derrière.}
5... dxe5 6. dxe5
(6. Bxe5 Nc6 {Le cavalier attaque le fou e5 et le pion d4. [%cal Gc6e5,Gc6d4]} 7. c5 Nd7 {Le cavalier attaque à nouveau le fou e5 : vous gagnez des temps.})
6... Qxd1+ {La dame échange avec échec : le roi blanc doit reprendre.}
7. Kxd1 Nc6 {Le cavalier attaque e5, qui n'a qu'un défenseur. [%cal Gc6e5]}
8. Ke1 Bf5 9. Nc3 e6 10. Nf3 O-O-O {Le grand roque met la tour sur la colonne d : le pion e5 et le roi blanc sont des cibles.}`,
    conclusion:
      "Le fou f4 ne suffit pas à tenir e5. Après 5…dxe5 6.dxe5 Qxd1+, le roi blanc ne peut plus roquer et le pion e5 reste faible.",
  },
  {
    title: "4.Qh5? g6 : la dame chassée et le pion c2",
    eco: "B03",
    kind: "trap",
    objectives: [
      "Chasser la dame blanche par …g6",
      "Prendre en e5 puis attaquer c2 avec le fou f5",
      "Développer avec gain de temps contre la dame",
    ],
    pgn: `{Après 3…d6, certains joueurs tentent 4.Qh5 pour attaquer f7. Le simple …g6 chasse la dame, et après l'échange en e5 votre fou f5 vise le pion c2, que la dame ne défend plus.}
${A} 4. Qh5? {La dame vise f7, mais elle sort trop tôt.}
4... g6 {Le pion chasse la dame : elle doit choisir entre f3 et h4.}
5. Qh4
(5. Qf3 dxe5 6. dxe5 Nc6 {Le cavalier attaque e5 : la dame f3 doit le défendre.})
5... dxe5 6. dxe5 Bf5 {Le fou se développe et attaque c2. [%cal Gf5c2]}
7. Nf3
(7. Bc4 Nc6 {Le cavalier attaque e5 et vous gardez la menace sur c2.})
7... Bxc2 {Le pion c2 tombe : vous avez un pion de plus et la dame blanche est hors jeu.}`,
    conclusion:
      "Une dame sortie tôt est une cible. Contre 4.Qh5, …g6 puis …dxe5 et …Bf5 gagnent du temps, et le pion c2 tombe si les Blancs ne le protègent pas.",
  },
  {
    title: "8.Qf3? Nc6 : la dame cible du cavalier",
    eco: "B03",
    kind: "trap",
    objectives: [
      "Attaquer d4 par …Nc6 quand la dame blanche est en f3",
      "Répondre à d5 par …Ne5 avec gain de temps",
      "Développer le fou f5 contre la dame f4",
    ],
    pgn: `{Dans la variante d'échange, la dame blanche sort parfois en f3 pour soutenir d4 et e4. Elle devient une cible : …Nc6 attaque d4, et la poussée d5 offre la case e5 à votre cavalier, qui attaque la dame.}
${A} 4. c4 Nb6 5. exd6 cxd6 6. Nc3 g6 7. Be3 Bg7 8. Qf3? {La dame se place sur la diagonale de votre fou et sur le chemin de vos cavaliers.}
8... Nc6 {Le cavalier attaque d4 avec le fou g7 : les Blancs doivent réagir. [%cal Gc6d4,Gg7d4]}
9. d5
(9. Qd1 O-O {La dame est revenue : vous avez gagné deux temps.})
(9. O-O-O O-O {Le roi blanc s'est placé en face de votre fou g7 et de vos pions a et b.})
9... Ne5 {Le cavalier attaque la dame avec gain de temps. [%cal Ge5f3]}
10. Qf4 Bf5 {Le fou se développe : la dame blanche est mal placée face au cavalier e5. [%cal Gf5b1]}`,
    conclusion:
      "Dans l'échange, la dame en f3 sert de cible. …Nc6 attaque d4, puis …Ne5 chasse la dame et …Bf5 achève le développement avec un net avantage.",
  },
];
