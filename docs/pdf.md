# Export du CV en PDF

La page publique propose un choix de langue FR/EN/KO et un bouton de téléchargement.
La langue est initialisée sur celle du site ; le choix du PDF ne change pas la page.
Le téléchargement fonctionne sans compte et produit `cv-fr.pdf`, `cv-en.pdf` ou
`cv-ko.pdf`. Le lien de téléchargement utilise directement la réponse HTTP en
pièce jointe ; le navigateur gère le téléchargement sans URL blob ni clic simulé.

`GET /api/cv/pdf?lang=fr|en|ko` génère un fichier A4 à partir du **CV publié**, avec
la même résolution des traductions que `GET /api/cv`. Le brouillon admin n’est jamais
utilisé. Une traduction absente ou obsolète reste présentée en français, avec une
note dans la langue demandée. L’export ne traduit pas automatiquement les textes.
Une langue absente utilise le français ; une langue inconnue ou répétée reçoit 400,
un profil absent 404. Les erreurs de génération passent par le gestionnaire 500 générique.

Mise en page d’이력서 adaptée aux entreprises coréennes, identique en FR/EN/KO
(libellés traduits) :

1. **인적사항** : nom, métier, e-mail public (`PUBLIC_CONTACT_EMAIL`, lien `mailto:`),
   GitHub, pays (nom localisé par `Intl.DisplayNames`), langues parlées avec leur
   niveau et technologies principales ; photo au format 3:4 à droite, recadrée
   depuis le portrait du site (`apps/web/src/assets/portrait.jpg` ou `.png`) si présent.
2. **소개** : présentation du profil.
3. Tableaux à en-tête : **학력** (période, établissement, cursus), **경력** (période
   avec durée, entreprise, poste, missions et technologies), **프로젝트**, **보유 기술**
   et **어학** (langue, niveau, précisions). L’ordre suit l’usage coréen : formation
   avant expérience.

Les dates sont au format `2021.03` (ou l’année seule si le mois est inconnu). La durée
des expériences est comptée en mois inclus (`2021.03 – 2024.12` : 3 ans 10 mois),
uniquement quand les deux mois sont connus. Les sections vides sont omises. Les textes
sont sélectionnables, les URL cliquables et les pages numérotées. Un titre de rubrique
reste avec l’en-tête de son tableau et le début de sa première ligne. Une ligne commence
sur la page suivante (en-tête répété) si ses colonnes fixes et le début de sa dernière
colonne ne tiennent pas ; seule la dernière colonne, la description, continue sur
plusieurs pages. La photo est relue à chaque génération : l’ajouter, la remplacer ou la
retirer invalide le cache sans redémarrage.

L’API utilise PDFKit avec Noto Sans CJK KR Regular et Bold intégrées (sous-ensembles
des glyphes utilisés) pour le latin, les accents, le coréen et les caractères chinois.
Les polices et leur licence sont dans `apps/api/assets/fonts`. Ces fichiers doivent
être inclus au déploiement à côté de `dist`, de même que `apps/web/src/assets` pour la
photo ; aucun navigateur headless ni dépendance système n’est nécessaire à la génération.
Les PDF ne sont pas stockés en SQLite ni écrits sur disque.

Un cache mémoire garde uniquement la dernière génération de chacune des trois
langues et mutualise les requêtes identiques en cours. Chaque demande relit le CV
publié et l’e-mail public ; une modification de l’un ou de l’autre invalide sa génération. Une erreur n’est pas
conservée en cache. La réponse HTTP est `application/pdf`, en pièce jointe et
`Cache-Control: no-store` pour ne pas conserver une ancienne version côté client.

Validation : tests HTTP sur base temporaire, refus de langues invalides, brouillon
privé exclu, invalidation du cache après modification publiée, absence de pages
vides causées par le pied de page, export coréen long, et aucune page réduite à un
titre ou à un fragment de ligne (flux PDF non compressés analysés par page).
Le rendu est également vérifié avec Poppler et l’extraction de texte avec pypdf.
