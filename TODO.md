# Tâches reportées

## Avant la mise en production (Convex + Better Auth)
- [ ] Créer le déploiement de prod : `npx convex deploy`.
- [ ] Sur le déploiement de prod : `npx convex env set` pour BETTER_AUTH_SECRET (nouveau secret),
      SITE_URL (URL publique de l'app), GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET.
- [ ] Google Cloud : ajouter l'URI de redirection `https://<domaine>/api/auth/callback/google`.
- [ ] Renseigner NEXT_PUBLIC_CONVEX_URL / NEXT_PUBLIC_CONVEX_SITE_URL (prod) chez l'hébergeur.
- [ ] Vérifier l'isolation entre deux comptes sur le déploiement de prod.
- [ ] Décommissionner le projet Supabase (owatqazpopcnwaxdniqp), qui n'est plus utilisé.

## Compte et synchronisation (plus tard)
- [ ] Propager les suppressions d'un appareil à l'autre (tombstones) : aujourd'hui,
      la fusion garde la version la plus récente.
- [ ] Connexion par mot de passe, suppression de compte dans l'interface.
- [ ] Bouton « Réinitialiser ma progression » (l'action resetStats existe déjà dans useReviewStore).
- [ ] Rendu serveur authentifié : `convexBetterAuthNextJs().preloadAuthQuery` si besoin.
- [ ] Répertoires > 900 Kio : découper `data` sur plusieurs documents (limite de 1 Mio par document Convex).

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