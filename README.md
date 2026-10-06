# Portfolio

Base de projet pour un CV public avec un futur espace administrateur et un import LinkedIn.
Seul le setup est réalisé : aucune authentification, donnée de CV ou intégration LinkedIn.

## Prérequis et démarrage

Node.js 22.12+ et npm. La version majeure de référence est dans `.nvmrc`.

```sh
npm ci
npm run dev
```

- Vue : http://127.0.0.1:5173
- API : http://127.0.0.1:3000/api/health
- Via le proxy Vite : http://127.0.0.1:5173/api/health

```sh
npm run typecheck
npm run build
npm start
```

`npm start` lance uniquement l’API compilée. Le front compilé se trouve dans
`apps/web/dist`. L’hébergement et le service des fichiers statiques restent à définir.
Le port API est configurable avec `PORT`, l’interface réseau avec `HOST` ; si le
port change en développement, adapter aussi la cible du proxy dans `apps/web/vite.config.ts`.
Aucun fichier `.env` n’est chargé pour le moment et aucun secret n’est nécessaire.

## Organisation

- `apps/web` : Vue 3, Vite et TypeScript.
- `apps/api` : Node.js, Express et TypeScript.
- `docs/architecture.md` : choix techniques et limites du socle.
- `docs/frontend.md` : arborescence, Pinia et composants shadcn-vue.
- `docs/i18n.md` : configuration et utilisation des traductions.
- `docs/roadmap.md` : fonctionnalités futures, hors setup.
- `AGENTS.md` : règles de travail pour les agents.
- `CONTRIBUTING.md` : conventions de contribution.

Un seul dépôt Git et un seul lockfile npm. Aucun déploiement configuré.
