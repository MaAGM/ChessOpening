export type Shortcut = { keys: string; description: string };

/** Raccourcis clavier de l'éditeur : source unique de l'aide affichée à l'utilisateur. */
export const EDITOR_SHORTCUTS: Shortcut[] = [
  { keys: "← →", description: "Coup précédent / suivant" },
  { keys: "↑ ↓", description: "Variante précédente / suivante" },
  { keys: "Début / Fin", description: "Début de la partie / fin de la ligne affichée" },
  { keys: "Suppr", description: "Supprimer le coup affiché et ses suites" },
  { keys: "Entrée / Échap", description: "Confirmer / annuler une suppression" },
  { keys: "Ctrl+Z", description: "Annuler (⌘Z sur Mac)" },
  { keys: "Ctrl+Maj+Z", description: "Rétablir (⌘⇧Z sur Mac, ou Ctrl+Y)" },
];
