# Architecture

Monorepo npm : `apps/web` (Vue 3 + Vite), `apps/api` (Express + Node.js),
`packages/contracts` (types TypeScript publics uniquement, sans code d’exécution).
TypeScript strict, Vue I18n, Pinia, shadcn-vue et Tailwind CSS 4.
TypeScript reste en 5.9 pour sa compatibilité testée avec vue-tsc.

## Lecture du CV

Le store Pinia charge `GET /api/cv?lang=fr|en|ko` via `features/cv/api.ts`.
La route valide la langue avec Zod et retourne seulement les données publiques.
Langue absente : français. Valeur invalide ou répétée : HTTP 400. Profil absent :
404. Erreur interne : 500 sans détails techniques. `GET /api/health` confirme
uniquement que le processus répond. Aucune route d’écriture ni authentification.

Le repository CV valide les champs, y compris les URL HTTP(S) et les dates, avant
écriture. SQL paramétré, transactions, clés étrangères et WAL. La migration initiale
est versionnée avec `PRAGMA user_version` ; une version future inconnue est refusée.
Les deux tables et le suivi des révisions sont détaillés dans `docs/i18n.md`.

## SQLite

`better-sqlite3` crée `apps/api/data/portfolio.sqlite` au démarrage de l’API,
indépendamment du dossier courant pour le chemin par défaut. `DATABASE_PATH`
permet d’utiliser un autre fichier (préférer un chemin absolu).
Le seed est transactionnel et ne s’exécute que si le profil est absent ; redémarrer
ne remet pas à zéro les textes modifiés. Les fichiers SQLite ne sont pas versionnés.
Le seed contient uniquement l’identité publique autorisée et le projet en cours ;
aucune expérience, formation, adresse ou disponibilité n’est inventée.

Le fichier et ses données doivent être conservés sur un volume persistant à
l’hébergement. Prévoir des sauvegardes cohérentes avec WAL et tester leur restauration.
Ne pas copier uniquement le fichier principal pendant que des écritures ont lieu.

## Front

Voir `docs/frontend.md`. La page compose les composants du CV ; Pinia gère la
requête, l’annulation et les états de chargement/erreur. Les traductions d’interface
restent dans Vue I18n. Aucun HTML utilisateur n’est interprété.

## Production et prochaines étapes

`npm run build` produit `apps/web/dist` et `apps/api/dist`. `npm start` ne sert
que l’API, sur 127.0.0.1 par défaut (`HOST` et `PORT` configurables).
Vite transmet `/api` au port 3000 en développement. L’hébergement devra configurer
le routage front/API, HTTPS, le stockage et les sauvegardes.

Admin unique avec sessions serveur, brouillons et aperçu avant publication à venir.
Vue Router sera ajouté avec les pages de connexion/administration. LinkedIn et
traduction automatique ne sont pas intégrés ; limites et parcours prévu dans i18n.md.
