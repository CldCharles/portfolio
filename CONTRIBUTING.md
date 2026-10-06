# Contribution

Installer avec `npm ci` à la racine puis lancer `npm run dev`.
Utiliser TypeScript strict, une indentation de deux espaces et des noms explicites.
Limiter les dépendances aux besoins réellement implémentés.

Avant livraison : `npm run typecheck` et `npm run build`, puis vérifier le comportement
concerné. Pour ce socle, vérifier `/api/health` directement et via le proxy Vite.
Aucun runner de tests ni outil de lint n’est installé à ce stade.
Ajouter les tests adaptés lors de l’implémentation des fonctionnalités.

Documenter toute nouvelle variable d’environnement et toute décision structurante.
Ne jamais committer de secrets ni de données de production.

## Livraison sur GitHub

Créer une branche descriptive depuis `main` (`feat/...`, `fix/...`, `chore/...`), puis
ouvrir une PR vers `main`. Un agent distinct relit les changements avant livraison.
Corriger ses observations bloquantes et indiquer dans la PR les vérifications et le
résultat de la revue. La fusion est une étape séparée, décidée par le propriétaire.
Cette convention est documentée ; aucune protection de branche GitHub ni revue
automatique à chaque push n’est configurée pour le moment.
