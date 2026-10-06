# Architecture

## Socle actuel

Monorepo npm avec deux applications indépendantes. Vue 3 + Vite pour le navigateur,
Express pour l’API Node.js, TypeScript strict partout. Le front dispose de Vue I18n,
Pinia et shadcn-vue avec Tailwind CSS 4 ; son organisation est décrite dans
`docs/frontend.md`. Vite transmet `/api` au serveur
local en développement, ce qui évite une configuration CORS inutile pour le setup.
Le seul endpoint est `GET /api/health`, qui retourne `{"status":"ok"}`.
Il confirme que le processus répond, pas la santé d’une future base de données.

TypeScript est fixé à la branche 5.9 : la version la plus récente testée provoquait
une incompatibilité avec vue-tsc (`ERR_PACKAGE_PATH_NOT_EXPORTED`). Réévaluer
ensemble ces deux outils lors d’une future mise à jour.

## Décisions prévues, non implémentées

- SQLite est le choix proposé pour la persistance, à confirmer avant développement.
  Il faudra un stockage persistant et des sauvegardes lors de l’hébergement.
- Un compte administrateur unique et des sessions côté serveur sont envisagés.
- Vue Router sera ajouté quand les pages publiques et administrateur seront créées.
- Le format du CV et les règles de validation seront définis avec les fonctionnalités.
- L’import LinkedIn nécessite une étude d’accès API. Un import de fichier exporté
  reste une alternative à étudier ; aucune récupération automatique n’est garantie.

## Production

Aucun hébergeur sélectionné. `npm run build` produit le front statique dans
`apps/web/dist` et l’API dans `apps/api/dist`. `npm start` ne sert que l’API.
Il faudra définir HTTPS, le routage front/API, les secrets et la persistance avant
mise en ligne. Le serveur écoute sur 127.0.0.1 par défaut ; `HOST` permet de le changer.
