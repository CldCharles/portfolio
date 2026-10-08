# Portfolio

Portfolio public de Claude Charles Valentin en français, anglais et coréen.
Vue 3 + Pinia + Vue I18n, API Node.js/Express et SQLite.
L’administration permet de préparer un brouillon, vérifier les traductions et publier.
L’import CSV des données LinkedIn est disponible avec comparaison et sélection.
Un éventuel accès API LinkedIn reste à étudier selon les autorisations disponibles.

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
Le CV public est téléchargeable en PDF en français, anglais et coréen.
Voir [l’export PDF](docs/pdf.md), notamment les assets de police à inclure au déploiement.

## Confidentialité et pages publiques

La notice FR/EN/KO est accessible sur `/privacy`, avec un pied de page commun et
le contact email public autorisé. Le [rapport du chantier](docs/compliance.md)
décrit ce qui s’applique et les points à finaliser avant déploiement.

Le CV publié et la notice sont rendus en HTML par Vue côté serveur, aussi bien en
développement qu’en production. Le brouillon et les sessions ne sont jamais
transmis au rendu public. `npm run build` génère le client et `dist/server` ; ne
pas déployer uniquement le dossier statique du client si le CV doit rester à jour
sans JavaScript après publication depuis l’admin.

Pour vérifier le build local complet après compilation :

```sh
SERVE_WEB=1 PUBLIC_ORIGIN=http://127.0.0.1:3000 npm start
```

En production, l’API sert aussi les fichiers web ; `NODE_ENV=production` et une
origine HTTPS exacte `PUBLIC_ORIGIN` sont requis. Variables publiques facultatives :

- `SITE_URL` : origine HTTPS publique exacte, sans slash final ; sinon
  `PUBLIC_ORIGIN` en production. Jamais un domaine dev inventé.
- `PUBLIC_CONTACT_EMAIL` : adresse publique ; par défaut l’adresse autorisée du
  propriétaire. Une valeur vide désactive le lien email.
- `PUBLIC_HOST_NAME`, `PUBLIC_HOST_COUNTRY`, `PUBLIC_HOST_LOG_RETENTION` :
  informations d’hébergement vérifiées. Sans valeur, la notice affiche les champs
  à compléter.

`/robots.txt`, `/sitemap.xml` et `/llms.txt` sont produits à l’exécution. Sans
origine publique configurée, canonical/alternates absolus sont omis et le sitemap
répond 503 avec une explication. L’admin est exclu et noindex ; cela ne remplace
pas son authentification. Il n’existe pas de bandeau cookies ni de statistiques.
