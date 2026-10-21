# Tâches reportées

## Avant la mise en production (Phase 2)
- [ ] Ajouter l'URL de production dans Supabase > Authentication > URL Configuration
      (Site URL + Redirect URLs).
- [ ] Renseigner NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY chez l'hébergeur
      (jamais la clé service_role dans une variable NEXT_PUBLIC_).
- [ ] Configurer un SMTP personnalisé (le service d'e-mail intégré est limité, prévu pour les tests).
- [ ] Régénérer database.types.ts : npx supabase gen types typescript --project-id owatqazpopcnwaxdniqp
- [ ] Vérifier l'isolation entre deux comptes + Dashboard > Advisors (sécurité).

## Compte et synchronisation (plus tard)
- [ ] Propager les suppressions d'un appareil à l'autre (tombstones) : aujourd'hui,
      la fusion garde la version la plus récente.
- [ ] Connexion par mot de passe, suppression de compte dans l'interface.
- [ ] Bouton « Réinitialiser ma progression » (l'action resetStats existe déjà dans useReviewStore).
- [ ] Passer à @supabase/ssr si du rendu serveur authentifié est ajouté.

## Mode Révision
- [ ] Bouton « Indice » avant de jouer (flèches vertes ; à décider si ça compte comme erreur).
- [ ] Réviser à partir des positions « à réviser » plutôt que toujours depuis le premier coup.
- [ ] Ajuster les coefficients du Leitner (SRS_CONFIG dans srs.ts) après usage réel.
- [ ] Passer éventuellement à SM-2 (le modèle de données le permet).

## Données
- [ ] Scandinave : scandinavianCourse n'est pas dans openingCourses (src/lib/data/openings/index.ts).
- [ ] Doublons dans les chapitres (par exemple trompowsky-m2 / m3) et noms de chapitres
      plus profonds que les coups enseignés.
- [ ] Fautes dans les gabarits de commentaires (« le dame », « le tour »).
- [ ] Purger les anciennes clés du localStorage (chess-opening:saved-repertoire).

## Technique
- [ ] Tests du hook useReviewManager (demande Testing Library).
- [ ] Renommer vitest.config.ts en vitest.config.mts (avertissement ESM).
- [ ] Faire le point sur npm audit (sans --force).