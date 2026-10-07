# Portfolio

Portfolio public de Claude Charles Valentin en français, anglais et coréen.
Vue 3 + Pinia + Vue I18n, API Node.js/Express et SQLite.
L’administration et l’import LinkedIn sont les prochaines fonctionnalités.

## Prérequis et démarrage

Node.js 22.12+ et npm. La version majeure de référence est dans `.nvmrc`.

```sh
npm ci
npm run dev
```

- Vue : http://127.0.0.1:5173
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
Aucun fichier `.env` n’est chargé pour le moment et aucun secret n’est nécessaire.

## Organisation

- `apps/web` : Vue 3, Vite et TypeScript.
- `apps/api` : Node.js, Express et TypeScript.
- `docs/architecture.md` : choix techniques et limites du socle.
- `docs/frontend.md` : arborescence, Pinia et composants shadcn-vue.
- `docs/i18n.md` : configuration et utilisation des traductions.
- `packages/contracts` : types publics partagés, sans code d’exécution.
- `docs/roadmap.md` : fonctionnalités réalisées et prochaines étapes.
- `AGENTS.md` : règles de travail pour les agents.
- `CONTRIBUTING.md` : conventions de contribution.

Un seul dépôt Git et un seul lockfile npm. Aucun déploiement configuré.
