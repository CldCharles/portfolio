# Validation locale — 9 octobre 2026

Les corrections demandées après la revue visuelle sont implémentées sur
`feat/cv-visual-refinement`, depuis le portrait local `2461ab6`. Aucun push,
aucune modification des données, contrats ou API. Les changements préexistants
du propriétaire sont conservés.

## Corrections

- Nom et métier regroupés face au portrait ; tailles revues pour redonner de la présence.
- Actions PDF allégées : bouton court, choix de langue discret et label accessible.
- Miniature textuelle du projet supprimée, ainsi que son association et ses styles.
- Compétences visibles et hiérarchie des expériences conservées.
- CV sans sections : suppression de la colonne vide du sommaire sur ordinateur.

## Contrôles réalisés

- 37 tests réussis (16 API, 21 front), avec couverture SSR des compétences visibles,
  du repli et de sa langue, des dates et du titre principal.
- TypeScript, builds client/SSR et `git diff --check` réussis.
- Largeurs 1280, 1024, 768, 390 et 320 sans débordement horizontal ; FR/EN/KO
  à 390, coréen sur ordinateur ; aucun avertissement/erreur console observé.
- FR 390×844, contrôles PDF actifs : titre Expériences à y≈536 (contre ≈606
  dans la première version). Première expérience visible.
- Changement de langue du PDF : lien mis à jour, puis sélection resynchronisée
  lors du changement de langue du site. Téléchargement coréen vérifié avant
  la simplification visuelle ; moteur PDF inchangé et tests API toujours réussis.
- Fixtures SSR temporaires : CV vide, sans portrait, nom sans espace très long,
  titres longs, projet sans image, compétence sans lien et HTML sans JavaScript.
  Contrôles visuels à 320 et 1280 px ; aucun débordement. CV vide : bord gauche
  du contenu aligné sur celui de l’en-tête à 144 px sur ordinateur.
- Aperçu admin : composant réel rendu en fixture avec ses styles, aucun h1
  supplémentaire, un h2 pour l’identité ; pas de connexion à l’admin réel.
- Règles d’impression activées dans une fixture en largeur paysage : sommaire
  masqué, mise en page en bloc et contenu en pleine largeur.
- Pages Confidentialité et Connexion : contrôlées lors de la première passe,
  composant de langue inchangé depuis. Focus clavier visible sur les langues.
- Revue indépendante en lecture seule après corrections, puis relecture du cas
  sans navigation : aucun bug concret restant signalé. Tests et navigateur
  exécutés par l’auteur, pas par le reviewer.

Les fixtures ont été retirées avant la compilation finale. Les contrôles des
règles d’impression ne remplacent pas une vérification de pagination dans le
dialogue d’impression. Ces vérifications ne constituent pas un audit complet
d’accessibilité.

Captures locales : `desktop-corrected.png` et `mobile-corrected.png` dans le dossier
`cv-visual-refinement` des visualisations du chat. Publication du portrait dans
GitHub public toujours en attente de l’accord explicite du propriétaire.
