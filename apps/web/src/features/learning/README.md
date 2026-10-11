# Suivi d’apprentissage

Onglet privé de l’administration : `/admin/apprentissage`, accessible après connexion
(lien « Apprentissage » en haut de l’admin). Il suit le programme de 26 semaines, du
12 octobre 2026 au 10 avril 2027, une heure par jour du lundi au samedi.

## Ce que fait l’onglet

- **Prochaine leçon** (rythme libre) : la première leçon encore à faire dans l’ordre du
  programme, quelle que soit la date (objectif, exercice, ressources, boutons « Fait » et
  « Sauter »), le déroulé type d’une heure, puis les trois suivantes avec un lien vers
  leur semaine. Toute leçon peut être faite à tout moment depuis l’onglet Semaines ; les
  dates du programme ne sont qu’un rythme conseillé. Bilan une fois tout fait.
- **Indicateurs** : progression globale, phase de la prochaine leçon, série (jours
  consécutifs avec au moins une leçon faite), retard sur le rythme conseillé, heures cumulées.
- **Semaines** : les six séances d’une semaine, l’objectif de fin de phase, la règle IA
  et le jalon du projet fil rouge. La frise des 26 semaines, en bas, ouvre chaque semaine.
- **Rattrapage** : les séances passées encore à faire, les plus anciennes en premier.
- **Ressources** : la bibliothèque du programme et toutes les ressources des séances,
  dédupliquées par URL et filtrables par phase. Les liens s’ouvrent dans un nouvel onglet.

Chaque séance a deux zones de notes (« Ce que j’ai compris », « Ce qui reste flou ») et un
lien facultatif (commit, dépôt, démo), enregistrés avec le bouton « Enregistrer les notes ».
Cliquer à nouveau sur un statut actif (« Fait » ou « Sauter ») remet la séance à faire.

## Mettre à jour sa progression

Rien à faire côté fichiers : cocher et annoter depuis l’onglet suffit, sur ordinateur
comme sur téléphone. La progression est enregistrée dans SQLite (table
`learning_progress`, migration v4) via `GET /api/admin/learning` et
`PUT /api/admin/learning/:id`, derrière la session admin et le jeton CSRF. Elle fait partie
de la base sauvegardée par `deploy/backup.sh` ; rien n’est public ni dans le dépôt Git.

## Règles

- La date du jour est celle du navigateur (`localDate`), jamais l’heure UTC : à Séoul le
  jour ne change pas à 9 h. Elle est recalculée quand l’onglet revient au premier plan.
- Les séances `repos` ne comptent ni dans le total (153 séances), ni dans le retard. Une
  séance `skipped` compte comme non faite.
- Rythme libre : la prochaine leçon et la semaine affichée par défaut suivent la progression,
  pas le calendrier. Une leçon sautée compte comme décidée.
- La série compte les jours consécutifs (date de réalisation, fuseau du navigateur) avec au
  moins une leçon faite, depuis aujourd’hui, ou depuis hier tant que rien n’est fait aujourd’hui.

Les calculs sont des fonctions pures dans `lib/progress.ts`, testées dans
`apps/web/test/learning.test.ts` (avec l’intégrité du programme). L’API est testée dans
`apps/api/test/learning.test.ts`.

## Modifier le programme

`program.json` est la copie exacte de l’annexe de la spec et n’est jamais modifié par
l’interface. Les identifiants de séance (`w01-d1` … `w26-d6`) servent de clé en base :
ne pas les renommer. Après une modification, lancer `npm run test` (le test d’intégrité
vérifie 26 semaines de six séances, du lundi au samedi).

L’interface est en français seulement, comme le contenu du programme.
