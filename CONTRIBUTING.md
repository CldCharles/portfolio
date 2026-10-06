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
La revue Codex automatique est activée sur `CldCharles/portfolio` pour les **PR de
l’équipe**, avec le déclencheur **À chaque push**. Ces paramètres sont gérés dans
les réglages Codex, pas dans un workflow GitHub Actions. L’option « Toutes les PR »
n’a pas pu être enregistrée ; les contributions externes ne sont donc pas couvertes
par cette configuration.

La revue respecte les quotas Codex. Elle ne fusionne pas les PR et ne remplace pas
les vérifications du projet. Aucune protection de branche GitHub n’est configurée.

Réglages : https://chatgpt.com/settings/code-review/repositories/github-1205033815
