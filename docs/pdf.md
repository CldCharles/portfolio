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

Mise en page dédiée aux entreprises : nom et titre, présentation, expériences,
projets, compétences et formation. Les sections vides sont omises. Les textes sont
sélectionnables, les URL cliquables, les dates localisées et les pages numérotées.
Les textes longs passent sur plusieurs pages ; les titres de rubriques sont gardés
avec le début de leur contenu. Le PDF reste indépendant de la taille de l’écran.

L’API utilise PDFKit avec Noto Sans CJK KR Regular intégrée pour les accents et les
caractères coréens. Le fichier de police et sa licence sont dans `apps/api/assets/fonts`.
Ces fichiers doivent être inclus au déploiement à côté de `dist` ; aucun navigateur
headless ni dépendance système n’est nécessaire à la génération. Les PDF ne sont
pas stockés en SQLite ni écrits sur disque.

Un cache mémoire garde uniquement la dernière génération de chacune des trois
langues et mutualise les requêtes identiques en cours. Chaque demande relit le CV
publié ; une modification du contenu invalide sa génération. Une erreur n’est pas
conservée en cache. La réponse HTTP est `application/pdf`, en pièce jointe et
`Cache-Control: no-store` pour ne pas conserver une ancienne version côté client.

Validation : tests HTTP sur base temporaire, refus de langues invalides, brouillon
privé exclu, invalidation du cache après modification publiée, absence de pages
vides causées par le pied de page et export coréen long.
Le rendu est également vérifié avec Poppler et l’extraction de texte avec pypdf.
