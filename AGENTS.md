# Instructions du projet

## Périmètre

Le périmètre actuel couvre le CV public sobre et professionnel, les langues FR/EN/KO,
SQLite et le suivi des traductions. L’administration, la connexion, l’import LinkedIn
et le déploiement restent les étapes suivantes, à engager sur demande.
La roadmap décrit des intentions futures, pas une autorisation de les réaliser.

## Conventions

- Répondre et rédiger la documentation en français ; identifiants de code en anglais.
- Conserver le monorepo npm : `apps/web`, `apps/api` et les types partagés dans `packages/contracts`, un lockfile à la racine.
- Front : Vue 3, Composition API et `<script setup lang="ts">` si de la logique est nécessaire.
- Architecture front : suivre `docs/frontend.md` ; pages pour les écrans,
  `features/<nom>` pour composants métier, API, types et stores Pinia.
- UI : shadcn-vue dans `components/ui`, Tailwind CSS 4 et tokens dans `styles/main.css`.
  Ajouter uniquement les composants utiles avec le CLI ; ne pas installer une deuxième bibliothèque UI.
  Conserver le style des fichiers générés lors de modifications locales.
- Traductions d’interface : Vue I18n, clés dans `apps/web/src/i18n/locales`,
  français comme schéma et langue de repli ; utiliser `useI18n` dans les composants.
- Back : Node.js, Express, modules ESM et TypeScript strict.
- Préférer les solutions simples ; aucune couche, bibliothèque ou abstraction sans besoin réel.
- Installer les dépendances depuis la racine avec `npm install … -w @portfolio/web`
  ou `-w @portfolio/api`. Outils communs : `npm install -D …` à la racine.
- Ne pas changer de framework ou ajouter de service externe sans demande.
- Ne jamais versionner de secrets, de coordonnées privées ou de fichiers SQLite.
  Les seuls renseignements personnels du seed sont ceux autorisés pour le CV public
  par le propriétaire ; ne pas inventer de parcours, diplômes ou coordonnées.
- Pour la future authentification : protéger les routes côté serveur, hacher les mots
  de passe, cookies HttpOnly et protections CSRF adaptées ; ne pas stocker de jeton
  d’administration dans localStorage.
- Pour LinkedIn : vérifier les accès officiels avant d’annoncer une capacité d’import.
  Ne pas implémenter de scraping ni collecter les identifiants LinkedIn.
- Maintenir la documentation à jour et vérifier `npm run test`, `npm run typecheck` puis `npm run build`.
- Ajouter des tests de comportement quand les fonctionnalités sont développées ;
  éviter les tests qui recopient simplement la structure du setup.
- Ne pas pousser, publier ou déployer sans instruction utilisateur.

## Branches et revue

- `main` représente la base stable. Développer sur une branche au nom correspondant
  au travail : `feat/...`, `fix/...` ou `chore/...`.
- Livrer les changements dans une PR ciblant `main` ; éviter les pushes directs sur `main`.
- Avant la livraison d’une PR, déléguer une revue à un agent distinct, en lecture seule.
  Lui fournir la branche de base, le périmètre et les validations réalisées.
- Le reviewer examine bugs, régressions, sécurité, cohérence et respect du périmètre.
  Il signale uniquement les problèmes concrets avec fichier, ligne, impact et priorité.
- Corriger les problèmes bloquants et faire relire les corrections. Consigner le résultat
  et les limites de la revue dans la description de la PR.
- La revue par agent ne remplace pas les vérifications TypeScript et la compilation.
- Ne pas fusionner une PR sans instruction utilisateur explicite.
