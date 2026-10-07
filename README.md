# Portfolio

Portfolio public de Claude Charles Valentin en français, anglais et coréen.
Vue 3 + Pinia + Vue I18n, API Node.js/Express et SQLite.
L’administration permet de préparer un brouillon, vérifier les traductions et publier.
L’import LinkedIn reste une prochaine fonctionnalité.

## Prérequis et démarrage

Node.js 22.12+ et npm. La version majeure de référence est dans `.nvmrc`.

```sh
npm ci
npm run dev
```

- Vue : http://127.0.0.1:5173
- Admin : http://127.0.0.1:5173/admin (créer le compte avec `npm run admin:setup`)
- CV : http://127.0.0.1:5173/?lang=fr (`en` et `ko` disponibles)
- API : http://127.0.0.1:3000/api/cv?lang=fr
- Via le proxy Vite : http://127.0.0.1:5173/api/health

```sh
npm run test
npm run typecheck
npm run build
npm start
```

`npm start` lance uniquement l’API compilée. Le front compilé se trouve dans
`apps/web/dist`. L’hébergement et le service des fichiers statiques restent à définir.
Le port API est configurable avec `PORT`, l’interface réseau avec `HOST` ; si le
port change en développement, adapter aussi la cible du proxy dans `apps/web/vite.config.ts`.
SQLite est initialisé au démarrage dans `apps/api/data/portfolio.sqlite`. Le seed
ne remplace pas les modifications existantes. `DATABASE_PATH` permet un autre chemin.
Aucun fichier `.env` n’est chargé automatiquement. Le compte administrateur est créé
localement avec `npm run admin:setup`, avec mot de passe masqué et haché. Voir
[le guide admin](docs/admin.md) pour la configuration, la réinitialisation et la publication.

## Organisation

- `apps/web` : Vue 3, Vite et TypeScript.
- `apps/api` : Node.js, Express et TypeScript.
- `docs/admin.md` : compte unique, brouillons, publication et configuration.
- `docs/architecture.md` : choix techniques et limites du socle.
- `docs/frontend.md` : arborescence, Pinia et composants shadcn-vue.
- `docs/i18n.md` : configuration et utilisation des traductions.
- `packages/contracts` : types publics partagés, sans code d’exécution.
- `docs/roadmap.md` : fonctionnalités réalisées et prochaines étapes.
- `AGENTS.md` : règles de travail pour les agents.
- `CONTRIBUTING.md` : conventions de contribution.

Un seul dépôt Git et un seul lockfile npm. Aucun déploiement configuré.

L’admin propose aussi un import des fichiers CSV de votre export LinkedIn, avec
sélection avant ajout au brouillon. Voir [les formats et limites](docs/linkedin.md).
