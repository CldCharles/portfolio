# Normes de developpement

Ce projet privilegie la clarte, la vitesse d'iteration et la simplicite.

## Philosophie

- Faire simple avant de faire extensible.
- Eviter toute abstraction tant qu'un besoin reel ne se repete pas.
- Preferer du code lisible aujourd'hui a une architecture hypothetique pour demain.
- Chaque ajout doit avoir une valeur visible pour l'utilisateur ou pour la maintenance.

## Regles de base

- Une fonctionnalite = une intention claire.
- Un composant ne doit pas porter plusieurs responsabilites metier differentes.
- Eviter les patterns "enterprise" si une version directe tient en quelques lignes lisibles.
- Pas de couche backend, service, store global ou design pattern supplementaire sans besoin concret.
- Avant d'ajouter une librairie, verifier si React, le navigateur ou le code existant suffisent.

## React

- Preferer des composants simples et centres sur l'usage.
- Garder le state au plus proche de l'endroit ou il est utilise.
- Remonter le state seulement si plusieurs zones en ont vraiment besoin.
- Ne pas introduire `useMemo`, `useCallback` ou une optimisation prematuree sans probleme mesure.
- Extraire un composant seulement si cela clarifie vraiment le code ou evite une repetition nette.
- Eviter les hooks custom tant qu'il n'y a pas un vrai comportement partage.

## TypeScript

- Utiliser des types explicites quand ils apportent de la clarte.
- Eviter les generiques complexes si un type concret suffit.
- Preferer des modeles de donnees simples et stables.
- Ne pas sur-typer une zone qui reste locale et evidente.

## CSS et UI

- Construire des interfaces propres avant de chercher un systeme de design complet.
- Reutiliser les classes et variables existantes avant d'ajouter de nouvelles conventions.
- Eviter la multiplication de variantes visuelles si elles ne servent pas une vraie difference d'usage.
- Les animations doivent rester discretes, utiles et faciles a retirer.

## Structure du projet

- Organiser par usage reel, pas par obsession architecturale.
- Accepter une structure compacte tant que le projet reste petit.
- Ne creer un dossier, un module ou une couche supplementaire que si cela reduit vraiment la confusion.

## Donnees et logique

- Preferer des fonctions pures simples pour les transformations.
- Garder les formats de donnees proches des besoins UI.
- Eviter les adapters, factories, builders et mappers tant qu'ils ne resolvent pas une repetition reelle.

## Dependances

- Chaque dependance doit repondre a une question simple: "Qu'est-ce qu'elle nous evite concretement ?"
- Si une dependance ajoute plus de complexite qu'elle n'en retire, on ne la prend pas.
- Favoriser peu de dependances, mais bien choisies.

## Tests et verification

- On teste d'abord les parties qui cassent facilement ou portent une logique importante.
- Pas de surcouche de tests ceremoniels sur du code trivial.
- Avant chaque merge:
  - le projet build
  - la feature fonctionne manuellement
  - le code reste lisible sans explication orale

## Git et PR

- Commits petits, intentionnels, faciles a relire.
- Une PR doit porter une seule idee principale.
- Si une PR devient difficile a resumer, elle est probablement trop grosse.
- Interdire les gros commits sauf cas exceptionnel clairement assume.
- Preferer plusieurs petits commits structures plutot qu'un commit massif difficile a reviewer.
- Utiliser des messages de commit courts, directs et orientes action.
- Favoriser des verbes simples comme `add`, `update`, `fix`, `remove`, `move`, `refactor`.
- Un commit doit rester facile a comprendre sans explication supplementaire.
- Ne jamais versionner ni pousser de secrets, tokens, fichiers `.env`, cles, certificats, logs sensibles ou donnees personnelles inutiles.
- Avant chaque push, verifier explicitement le contenu du diff et la liste des fichiers suivis.

## Regle de decision

Avant une modification, on se pose ces questions:

1. Est-ce que la solution la plus simple fonctionne deja correctement ?
2. Est-ce que j'ajoute une abstraction pour un probleme reel ou imagine ?
3. Est-ce qu'un nouveau contributeur comprendrait ce code rapidement ?
4. Est-ce que cette decision reduit ou augmente la charge mentale du projet ?

Si le doute persiste, on choisit l'option la plus simple.
