# Plan d’exécution — amélioration visuelle du CV

Statut : implémenté puis corrigé à la demande du propriétaire après revue visuelle.

Amendement du 8 octobre : regrouper nom et métier face à un portrait plus présent
(128 px ordinateur, 80 px mobile, 64 px sur très petit écran), nom 56 px ordinateur /
36 px mobile, actions PDF simplifiées avec label accessible masqué visuellement,
et retrait de la miniature textuelle jugée illisible. Ces décisions remplacent
les dimensions et la capture initialement proposées ci-dessous. Les compétences
visibles et la hiérarchie des expériences sont conservées.
Publication du portrait toujours en attente d’autorisation.
Date : 8 octobre 2026.
Projet : `/Users/ccharles/dev/portfolio`.

## Objectif et direction retenue

Conserver un CV sobre, clair et personnel. Rendre le métier et l’expérience professionnelle plus faciles à repérer, raccourcir l’introduction visuelle sur mobile et apporter une preuve visuelle du travail front-end.

Conserver : fond clair, accent bleu-vert actuel, titres avec empattements, sommaire à gauche sur ordinateur, navigation horizontale sur mobile, ordre Expériences → Projets → Compétences → Formation, portrait naturel aux coins arrondis.

Ne pas ajouter de dégradés, animations décoratives, ombres importantes, jauges de compétences, carrousel ou menu hamburger.

## 0. État de départ et précautions

- `main` contient la navigation latérale, commit `eeb4f51` / PR #9.
- La branche locale `feat/cv-portrait` contient le commit `2461ab6`, qui ajoute la photo et son cadrage. Cette branche n’a pas été poussée.
- Le push de la photo a été refusé par la vérification automatique d’approbation : sa publication dans le dépôt GitHub public attend l’accord explicite du propriétaire. Ce plan ne vaut pas cet accord. Le travail local peut continuer.
- `apps/web/src/pages/CvPage.vue` comporte des changements locaux préexistants : suppression du monogramme CCV et alignement de l’en-tête à droite. Les conserver, sans les intégrer automatiquement à une PR.
- `design-explorations/` est un dossier local préexistant à préserver.
- Lire `AGENTS.md` et `docs/frontend.md`, puis vérifier `git status` avant toute édition.
- Créer une branche `feat/cv-visual-refinement` depuis le travail local contenant le portrait. Si l’état a changé depuis la rédaction, vérifier les commits avant de choisir la base ; ne jamais réinitialiser le checkout.
- Garder les textes, les dates, les traductions, la base SQLite, l’API, l’import LinkedIn et la génération PDF inchangés.
- Aucune dépendance supplémentaire n’est nécessaire.

## 1. Compacter l’en-tête et équilibrer l’identité

Fichiers :
- `apps/web/src/pages/CvPage.vue`
- `apps/web/src/features/cv/components/CvHero.vue`
- `apps/web/src/features/cv/components/CvPdfExport.vue`

### Composition

Dans `CvHero.vue`, afficher d’abord le nom avec le portrait à droite. Placer le métier sous le nom, puis la présentation et les actions. Conserver le titre provenant des données : ne pas écrire un métier en dur dans le composant.

Sur mobile, le métier peut occuper toute la largeur sous le bloc nom/portrait. Ne pas forcer de saut de ligne dans le nom avec des `<br>` ou une découpe des mots : la mise en page doit accepter un autre nom et les autres langues.

### Valeurs de départ à appliquer

| Élément | Ordinateur >900 px | Mobile ≤600 px |
|---|---|---|
| Espacement vertical de l’en-tête des langues | 16 px | 8 px |
| Espacement vertical du hero | 32 px haut / 32 px bas | 20 px haut / 24 px bas |
| Nom | 52 px, interligne 1,08 | 34 px, interligne 1,12 |
| Métier | 16 px, interligne 1,5 | 15 px, interligne 1,45 |
| Portrait | 112 × 112 px | 64 × 64 px |
| Espace identité / portrait | 24 px | 12 px |
| Présentation | 16 px, interligne 1,65 | 16 px, interligne 1,5 |
| Espace avant présentation | 16 px | 12 px |
| Espace avant actions | 16 px | 12 px |

Entre 601 et 900 px, utiliser un nom de 44 px et une photo de 96 px. Conserver Georgia pour le nom et les titres de sections. Retirer la transformation en majuscules et le fort espacement des lettres du métier : cette information doit se lire comme une phrase importante.

Conserver le cadrage actuel du portrait et ses coins arrondis. Ne pas retoucher le visage ou réintroduire les métadonnées de l’original. Vérifier le rendu avec et sans portrait.

### Présentation et actions

- Conserver `splitIntroduction()` et le contenu du détail « En savoir plus » : aucune suppression ni réécriture de données.
- Le bouton PDF reste l’action principale ; GitHub devient un lien secondaire plus court dans l’interface : « GitHub » dans les trois langues.
- Conserver le sélecteur de langue PDF et son label lorsqu’ils sont affichés avec JavaScript. Ne pas gagner de place en supprimant une fonctionnalité existante.
- Réduire les espacements des contrôles, conserver des cibles d’au moins 44 px de haut.
- Autoriser le retour à la ligne des actions à 320 px et en coréen. Ne pas imposer une seule ligne au prix d’un débordement.

Critère visuel : à 390 × 844 px, en français, détails repliés et contenu publié actuel, le titre Expériences doit idéalement commencer avant y=740 px. Chercher à montrer le début de la première expérience avant le bas de l’écran. Ce repère ne justifie ni masquage de texte ni taille de texte inférieure à 16 px pour la présentation. Tester avec les contrôles PDF réellement actifs après hydratation, pas seulement le HTML sans JavaScript.

## 2. Renforcer la hiérarchie des expériences

Fichiers :
- `apps/web/src/features/cv/components/CvSection.vue`
- nouveau `apps/web/src/features/cv/lib/visual-presentation.ts`, seulement pour les identifiants de présentation et les associations de visuels

### Mise en avant ciblée

L’entrée publique vérifiée `sopra-2021-2024` est l’expérience principale. Conserver sa position chronologique après `sopra-freelance-2025`.

Définir une constante explicite `featuredExperienceId = 'sopra-2021-2024'` dans le module de présentation. Appliquer une classe de présentation uniquement quand `entry.kind === 'experience'` et l’identifiant correspond. Si cette entrée disparaît, aucune autre ne devient principale automatiquement. Ne pas reconnaître l’entreprise par son texte traduit, ne pas sélectionner la première entrée ou calculer un score de carrière.

Traitement de l’expérience principale :
- entreprise à 18 px / 600 ; poste à 16 px / 500 ;
- filet vertical de 2 px dans la couleur d’accent, sur le bloc de contenu ;
- retrait intérieur de 16 px après ce filet ;
- pas de grosse carte, pas d’ombre, pas de badge « expérience principale » ;
- description inchangée, avec les listes existantes clairement espacées.

Autres expériences : entreprise à 16 px, poste à 15 px, padding vertical de 16 px. L’expérience principale peut garder 24 px. Ne pas cacher les stages ni supprimer leurs descriptions.

Ne pas introduire de mots en gras automatiquement dans les textes traduits. La hiérarchie vient des titres, des listes et du contraste.

### Dates

Conserver les éléments `<time>` et le formatage localisé existant. Mettre chaque date complète dans un segment non sécable, mais permettre le retour à la ligne entre date de début et date de fin. Une année ne doit pas se retrouver seule sous son mois. Garder le traitement des dates annuelles seules, des dates de fin seules et des postes en cours.

Sur mobile, garder les dates au-dessus du contenu, sans colonne vide. Ne pas appliquer le traitement de l’expérience principale à Formation.

## 3. Donner une présence visuelle au projet

Fichiers :
- `apps/web/src/features/cv/components/CvSection.vue`
- `apps/web/src/features/cv/lib/visual-presentation.ts`
- nouveau `apps/web/src/assets/projects/portfolio-preview.png`
- traductions d’interface FR/EN/KO si une légende visible est ajoutée

L’entrée projet publique vérifiée porte l’identifiant `portfolio`.

Après les étapes 1 et 2, capturer une vraie zone du site local avec l’outil navigateur : la section Expériences contenant l’entrée Sopra 2021–2024. Ne pas utiliser une capture de l’ensemble de la page, qui inclurait ensuite la capture elle-même. Ne pas capturer l’admin, les cookies, un brouillon, une barre d’adresse ou des données privées. Exclure le portrait de cette capture pour ne pas dupliquer le fichier personnel en attente d’autorisation de publication.

Associer explicitement le visuel à l’identifiant `portfolio` dans le module de présentation. Ne pas changer `CvEntry`, la base ou le formulaire admin pour ce seul visuel.

Présentation du projet :
- sur ordinateur, texte à gauche et aperçu à droite dans deux colonnes proches de 55 % / 45 %, gap 24 px ;
- sous 700 px, une colonne, texte puis aperçu ;
- cadre fin, coins de 8 px, fond clair et aucune ombre lourde ;
- image de largeur 100 %, hauteur automatique, dimensions intrinsèques renseignées, chargement différé ;
- capture choisie assez courte pour rester lisible ; ne pas couper arbitrairement le contenu avec une hauteur fixe ;
- lien « Voir le projet » conservé avec son nom accessible contextualisé.

Le visuel est illustratif et ne doit porter aucune information exclusive : `alt=""` est adapté si le texte adjacent explique déjà le projet. Une éventuelle légende « Aperçu de l’interface » doit être traduite. Aucun faux écran ni résultat chiffré inventé.

Si la capture navigateur est indisponible, terminer les autres étapes et signaler précisément ce visuel manquant. Ne pas remplacer par une image générique ou une capture étrangère au projet.

## 4. Afficher les compétences sans interaction obligatoire

Fichier : `apps/web/src/features/cv/components/CvSection.vue`.

Remplacer uniquement le `<details>` de la branche `entry.kind === 'skill'` par :
- un titre `<h3>` ;
- la description visible ;
- le message de traduction de repli lorsqu’il existe ;
- le lien éventuel existant.

Les groupes actuels sont Vue.js, React, TypeScript & Angular, Outils & collaboration. Conserver les titres et descriptions stockés, ainsi que l’ordre des entrées. Ne pas inventer de nouveaux groupes ou réaffecter des compétences dans la base.

Mise en page : grille de deux colonnes au-dessus de 600 px, une colonne en dessous ; gap 20 px ; titre 16 px / 600 ; description 15 px / interligne 1,6. Utiliser de simples blocs de texte sans contour de bouton. Si une seule compétence existe, elle ne doit pas être inutilement étirée dans une grande carte.

Conserver les descriptions multilignes. Retirer les styles `summary`, les flèches et les bordures de faux boutons devenus inutiles uniquement dans cette branche.

## 5. Harmoniser les détails

Fichiers :
- `apps/web/src/features/cv/components/CvSection.vue`
- `apps/web/src/features/cv/components/LanguageSwitcher.vue`
- éventuellement les locales pour le libellé GitHub

### Titres des sections

Placer le numéro et le titre sur une même ligne, alignés sur la ligne de base, avec un espace de 12 px. Numéro 12 px et couleur d’accent ; titre 32 px sur ordinateur, 28 px sur mobile. Conserver le numéro `aria-hidden` et les vrais titres h2.

Réduire l’espace entre le titre de section et sa première entrée à 16 px. Conserver les séparateurs fins et une respiration d’environ 32 px entre sections. Éviter de cumuler padding de section et padding de première entrée pour produire un vide excessif.

### Langues

Remplacer le fond noir de la langue active par un fond bleu-vert très pâle et un texte dans l’accent actuel. Proposition : fond `#e8f0f2`, texte `#24596a`. Ajouter une bordure ou un soulignement discret pour que l’état ne repose pas uniquement sur la couleur.

Conserver les vrais liens, `aria-current`, les noms accessibles Français / English / 한국어, le fonctionnement sans JavaScript, les focus visibles et les zones de 44 px. Ce composant est partagé : vérifier aussi les pages Confidentialité et Connexion après modification.

Ne pas changer les tokens globaux de tous les boutons pour cette modification locale.

## Fichiers à ne pas toucher

- `apps/api/**`, données SQLite et seeds ;
- `packages/contracts/**` ;
- logique des stores, authentification, publication, import ;
- moteur PDF et ses polices ;
- routage et rendu serveur, sauf bug directement causé par les changements et démontré ;
- `CvNavigation.vue`, sauf ajustement mineur indispensable de l’alignement avec le nouveau hero ;
- dossiers de maquettes préexistants.

Ne pas diviser tout `CvSection.vue` en une nouvelle architecture. Garder les changements ciblés. `CvHero` et `CvSection` sont aussi utilisés par l’aperçu admin : leur comportement doit y rester cohérent, notamment `headingTag="h2"`.

## 6. Vérifications et critères de fin

### Visuelles

Examiner le rendu réel, pas uniquement le code :
- 1280 × 900 : nom, métier et photo équilibrés ; expérience visible tôt ; sommaire discret ;
- 1024 px : aucune collision entre nom et portrait, dates lisibles ;
- 768 px : navigation horizontale, aucune colonne vide ;
- 390 × 844 : nom actuel sur deux lignes si possible, titre Expériences proche de l’objectif y=740 ;
- 320 px : aucun débordement horizontal, tous les liens restent utilisables ;
- trois langues à 390 px, coréen également sur ordinateur ;
- sans portrait et sans entrées : aucune zone vide imposée, pas de contenu coincé dans la colonne du sommaire ;
- une entrée avec titre long, projet sans visuel et compétence sans lien : rendu normal. Utiliser des fixtures temporaires, jamais la vraie base pour une démonstration.

### Fonctionnelles et accessibilité

- JavaScript actif : changement de langue, repère du sommaire, contrôle de langue PDF et bouton PDF fonctionnent ; absence d’erreur d’hydratation.
- HTML sans JavaScript : CV lisible, ancres et liens de langue disponibles, compétences visibles, image présente si disponible.
- Clavier : focus visible et ordre logique ; aucun piège ni contrôle devenu inaccessible.
- Vérifier un seul h1 sur la page publique ; aperçu admin sans h1 supplémentaire.
- Impression navigateur : sommaire masqué et contenu en pleine largeur, y compris paysage ; export PDF API inchangé.
- Ne pas annoncer une conformité d’accessibilité complète sur la base de ces contrôles ciblés.

### Commandes

Exécuter depuis la racine :
1. `npm run test`
2. `npm run typecheck`
3. `npm run build`
4. `git diff --check`

La base actuelle comporte 37 tests. Les tests HTTP ont besoin de ports locaux ; si le sandbox les bloque, demander l’exécution appropriée plutôt que modifier les tests.

Ne pas créer de tests qui vérifient seulement des valeurs CSS. Si le rendu de compétences, l’association du projet ou le SSR nécessite une couverture, étendre les tests existants (`apps/web/test/server-rendering.test.ts`, `presentation.test.ts`) avec un comportement utile : contenu visible dans le HTML, association de visuel limitée au bon identifiant, texte de repli conservé.

### Livraison

- Faire deux captures finales : ordinateur et mobile.
- Mettre `docs/frontend.md` à jour pour l’association locale du visuel et les compétences désormais visibles.
- Faire relire le diff par un agent distinct en lecture seule, conformément à AGENTS.md ; corriger puis faire relire les problèmes bloquants.
- Présenter les changements et les validations réelles, avec les limites éventuelles.
- Ne pas pousser cette branche ni créer une PR publique contenant le portrait tant que l’accord explicite de publication de la photo n’a pas été reçu. Après cet accord, suivre le workflow PR vers main et revue du projet. Aucun déploiement d’hébergement dans ce chantier.

## Prompt de passation au modèle d’implémentation

> Lis AGENTS.md puis docs/plans/cv-visual-refinement.md dans /Users/ccharles/dev/portfolio. Implémente ce plan visuel dans l’ordre, avec les fichiers, dimensions et limites indiqués. Ne relance pas une recherche de direction graphique. Préserve les changements locaux du propriétaire, les textes FR/EN/KO, les données et les fonctionnalités existantes. Commence par vérifier l’état Git et la présence du commit de portrait. Valide le rendu ordinateur/mobile, le fonctionnement avec et sans JavaScript, puis les tests, TypeScript et build. Fais effectuer la revue indépendante prévue par AGENTS.md. Livre un résultat local avec captures. La publication GitHub du portrait attend une autorisation explicite : ne fais aucun push la contenant sans cet accord.
