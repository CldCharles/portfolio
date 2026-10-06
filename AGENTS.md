# Instructions du projet

## Périmètre

Le travail actuellement autorisé est le setup uniquement. Ne pas implémenter le CV,
l’administration, la connexion, l’import LinkedIn ou le déploiement sans demande.
La roadmap décrit des intentions futures, pas une autorisation de les réaliser.

## Conventions

- Répondre et rédiger la documentation en français ; identifiants de code en anglais.
- Conserver le monorepo npm : `apps/web` et `apps/api`, un lockfile à la racine.
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
- Ne jamais versionner secrets, données personnelles réelles ou fichiers SQLite.
- Pour la future authentification : protéger les routes côté serveur, hacher les mots
  de passe, cookies HttpOnly et protections CSRF adaptées ; ne pas stocker de jeton
  d’administration dans localStorage.
- Pour LinkedIn : vérifier les accès officiels avant d’annoncer une capacité d’import.
  Ne pas implémenter de scraping ni collecter les identifiants LinkedIn.
- Maintenir la documentation à jour et vérifier `npm run typecheck` puis `npm run build`.
- Ajouter des tests de comportement quand les fonctionnalités sont développées ;
  éviter les tests qui recopient simplement la structure du setup.
- Ne pas pousser, publier ou déployer sans instruction utilisateur.
