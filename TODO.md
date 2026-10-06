# Tâches reportées

## Mode Révision
- [ ] Répétition espacée : stats par position ou par chapitre (Leitner ou SM-2),
      pour faire remonter plus souvent les positions où l'on se trompe
      (aujourd'hui le tirage de l'ordinateur est uniforme).
      Le store prévoit déjà la place dans `ReviewChapterEntry` (`reviewStore.ts`).
- [ ] Bouton « Indice » avant de jouer (flèches vertes, à décider si ça compte comme erreur).
- [ ] Gérer les transpositions : l'arbre est indexé par SAN, pas par position (FEN).
- [ ] Passer du `localStorage` à une vraie base de données
      (seules les actions et `load/persist` de `reviewStore.ts` sont à remplacer).

## Données
- [ ] Purger les anciennes clés du `localStorage` (`chess-opening:completed-chapters-v2`,
      `chess-opening:saved-repertoire`) une fois la migration inutile.

## Technique
- [ ] Tests du hook `useReviewManager` (demande Testing Library).
- [ ] Faire le point sur `npm audit` (vulnérabilités signalées, sans `--force`).