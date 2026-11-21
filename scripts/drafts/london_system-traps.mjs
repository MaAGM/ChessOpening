// Chapitre « Pièges » de la Masterclass « Système de Londres ».
// Chaque piège a été vérifié avec Stockfish (scripts/opening-lab.mjs eval / traps).
const MAIN = "1. d4 d5 2. Bf4 Nf6 3. e3 e6 4. Nf3 c5 5. c3 Nc6 6. Nbd2 Bd6 7. Bg3 O-O 8. Bd3";

export const TRAPS = [
  {
    title: "3…Qb6 4.Nc3 : le pion b2 empoisonné",
    eco: "D00",
    kind: "trap",
    objectives: [
      "Laisser b2 en prise contre 3…Qb6 en jouant Nc3",
      "Punir 4…Qxb2? par Nxd5 et la menace Bc7",
      "Répondre à 4…c4? par Nxd5 qui gagne un pion central",
    ],
    pgn: `{Après 2…c5 3.e3 Qb6, la plupart des joueurs défendent b2. Il existe une réponse plus ambitieuse : 4.Nc3, qui offre le pion. Si les Noirs le prennent, leur dame quitte la défense de c7 et de d5, et le cavalier blanc entre en d5 avec des menaces terribles.}
1. d4 d5 2. Bf4 c5 3. e3 Qb6 {La dame attaque b2.}
4. Nc3 {Le cavalier attaque d5 et laisse b2 sans défense : c'est un appât. [%cal Gc3d5]}
4... Qxb2?
(4... c4? {Les Noirs gagnent de l'espace mais lâchent le contrôle de d5.} 5. Nxd5 {Le pion d5 tombe, et le cavalier vise c7. [%cal Gd5c7]} 5... Qa5+ 6. Nc3 e5 7. Bxe5 {Un deuxième pion central : les Blancs ont gagné deux pions sans compensation. [%cal Gf4e5]})
(4... e6 {La réponse saine : d5 est soutenu.} 5. Nb5 {Le cavalier menace Nc7+, les Noirs doivent parer. [%cal Gb5c7]} 5... Na6 {Le pion b2 reste intact et le jeu est équilibré : les Noirs ont évité le pire.})
5. Nxd5 {Le cavalier menace Nc7+ qui fourchette roi et tour, et le fou f4 s'apprête à venir en c7. [%cal Gd5c7]}
5... Kd8
(5... cxd4 6. Nc7+ {La fourchette : le roi doit bouger et la tour a8 tombe. [%cal Gc7a8]} 6... Kd8 7. Qxd4+ {La dame reprend avec échec et force l'échange des dames, le cavalier c7 reste en vie.} 7... Qxd4 8. exd4 {La qualité est assurée : Nxa8 suivra.})
(5... Na6 6. Bxa6 {Le fou élimine le défenseur de c7 : Nc7+ redevient imparable. [%cal Gf1a6]})
6. Bc7+ {Le fou donne l'échec et chasse le roi de la défense de la dame. [%cal Gf4c7]}
6... Ke8 7. Rb1 {La tour attaque la dame noire, qui n'a plus que la case a2. [%cal Gb1b2]}
7... Qxa2 8. dxc5 {Le centre s'ouvre devant le roi noir resté en e8 : Nc7+ ou Bb5+ vont décider. [%cal Gf1b5]}`,
    conclusion:
      "Contre 3…Qb6, 4.Nc3 tend un piège : 4…Qxb2? 5.Nxd5 menace Nc7+ et Bc7+, et 4…c4? perd le pion d5. Seul 4…e6 tient, et vous gardez alors un jeu actif.",
  },
  {
    title: "…Bf5?? face à Qc2 : la dame croque le fou",
    eco: "D00",
    kind: "trap",
    objectives: [
      "Reconnaître la diagonale c2-f5 de la dame blanche",
      "Prendre le fou f5 même si b2 tombe ensuite",
      "Chasser la dame noire par Qb1 et Ne2",
    ],
    pgn: `{Dans la structure …c4, votre dame se replie en c2. Les Noirs aimeraient développer leur fou en f5 pour la chasser, mais rien ne défend f5 : le fou tombe, et la prise en b2 qui suit ne compense pas la pièce.}
1. d4 d5 2. Bf4 Nf6 3. e3 c5 4. c3 Nc6 5. Nd2 Qb6 6. Qb3 {La dame défend b2 et propose l'échange. [%cal Gb3b6]}
6... c4 7. Qc2 {La dame recule sur c2 : elle surveille toute la diagonale vers h7. [%cal Gc2h7]}
7... Bf5??
(7... e6 {Le coup modeste : la diagonale c8-h3 reste fermée, le jeu est normal.} 8. Ngf3 {Le cavalier prend sa case habituelle ; e4 sera votre levier. [%cal Ge3e4]})
8. Qxf5 {Le fou n'était défendu par personne. [%cal Gc2f5]}
8... Qxb2 {Les Noirs récupèrent un pion et attaquent la tour a1.}
9. Qb1 {La dame revient défendre a1 et propose l'échange. [%cal Gb1b2]}
9... Qxc3 10. Ne2 {Le cavalier chasse la dame avec gain de temps : vous avez une pièce contre deux pions. [%cal Ge2c3]}`,
    conclusion:
      "Quand votre dame est en c2, la case f5 est sous son contrôle. Après …Bf5?? Qxf5 Qxb2 Qb1, la pièce de plus vaut bien plus que les deux pions noirs.",
  },
  {
    title: "Ne5 et …Nxe5? : la fourchette du pion e5",
    eco: "D02",
    kind: "trap",
    objectives: [
      "Reprendre dxe5 pour fourchetter le fou d6 et le cavalier f6",
      "Répondre à …Bxe5 en échangeant les fous",
      "Savoir que …Bxe5 est la réponse saine à Ne5",
    ],
    pgn: `{Le cavalier e5 est très gênant pour les Noirs, qui ont envie de l'échanger. Avec le fou en d6 et le cavalier en f6, une seule prise est correcte : …Bxe5. Prendre avec le cavalier transforme le pion d4 en arme de double attaque.}
${MAIN} 8... Re8 9. Ne5 {L'avant-poste classique : le cavalier est soutenu par le pion d4 et le fou g3. [%cal Gd4e5,Gg3e5]}
9... Nxe5?
(9... Bxe5 {La bonne prise : le fou disparaît mais aucune pièce n'est en danger.} 10. dxe5 {Le pion chasse le cavalier et gagne de l'espace. [%cal Ge5f6]} 10... Nd7 11. f4 {Le pion soutient e5 : votre chaîne de pions bloque l'aile roi noire. [%cal Gf4e5]})
10. dxe5 {Le pion attaque à la fois le fou d6 et le cavalier f6. [%cal Ge5d6,Ge5f6]}
10... Bxe5
(10... Be7 11. exf6 {Le cavalier tombe : vous avez une pièce de plus. [%cal Ge5f6]} 11... Bxf6 12. O-O {Le roque termine le développement ; la pièce de plus sera décisive.})
11. Bxe5 {Le fou g3 reprend : les Noirs ont donné un fou contre un pion. [%cal Gg3e5]}
11... Nd7 12. Bg3 {Le fou se replie et reste sur la diagonale b8-h2 : l'avantage matériel est net. [%cal Gg3b8]}`,
    conclusion:
      "Contre Ne5, …Nxe5? permet dxe5 qui attaque deux pièces à la fois. Retenez le motif : un pion d4 derrière le cavalier e5 peut toujours fourchetter d6 et f6.",
  },
  {
    title: "Le sacrifice grec : Bxh7+ contre …Nd7",
    eco: "D02",
    kind: "trap",
    objectives: [
      "Repérer que h7 n'a plus de défenseur après …Nd7",
      "Enchaîner Bxh7+ et Qh5+ sur la diagonale libérée",
      "Garder le pion de plus si le roi noir fuit en f8",
    ],
    pgn: `{Dans l'étau Ne5-f4, le cavalier f6 est le seul défenseur de h7. Si les Noirs le déplacent en d7 pour contester e5, le fou d3 prend en h7 avec échec et la dame arrive en h5 par la diagonale que le cavalier f3 a libérée.}
${MAIN} 8... Re8 9. Ne5 Qc7 10. f4 {Le pion soutient le cavalier : l'avant-poste est verrouillé. [%cal Gf4e5]}
10... Nd7? {Le cavalier conteste e5, mais h7 n'est plus défendu.}
11. Bxh7+ {Le sacrifice : le pion h7 tombe avec échec. [%cal Gd3h7]}
11... Kxh7
(11... Kf8 {Le roi refuse le fou.} 12. Bd3 {Le fou se replie avec un pion de plus, et le roi noir a perdu le roque. [%cal Gh7d3]} 12... Nf6 13. Bh4 {Le fou cloue le cavalier f6 : la pression continue. [%cal Gh4f6]})
12. Qh5+ {La dame entre par d1-h5, une diagonale vide depuis que le cavalier a quitté f3. [%cal Gd1h5]}
12... Kg8 13. Qxf7+ {Le pion f7 tombe aussi : le cavalier e5 le visait. [%cal Ge5f7]}
13... Kh7 14. Qg6+ Kg8 15. Qxe8+ {La tour e8 tombe : deux pions et une qualité, l'attaque a payé. [%cal Gg6e8]}
15... Nf8`,
    conclusion:
      "Avec le fou en d3, la dame prête à venir en h5 et un cavalier en e5, le départ du cavalier f6 est toujours un signal : Bxh7+ suivi de Qh5+ gagne au moins du matériel.",
  },
];
