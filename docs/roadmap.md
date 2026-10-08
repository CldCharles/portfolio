# Roadmap

Réalisé dans la première fonctionnalité :

- CV public sobre : présentation, compétences, projet portfolio en cours.
- Français, anglais et coréen, préférence mémorisée et URL partageable.
- SQLite, validation des données, révisions des traductions et repli français.
- Administration : connexion unique, sessions, édition des rubriques FR/EN/KO,
  validation des traductions, brouillon persistant, aperçu et publication atomique.
- Import CSV LinkedIn : sélection, comparaison, correspondances et version française
  obligatoire pour les nouvelles rubriques ; textes EN/KO conservés à vérifier.
- Export PDF du CV publié en FR/EN/KO, police coréenne intégrée et pagination.
- Tests API/persistance/traductions, authentification, CSRF, conflits et stores.

Prochaines étapes, sur demande :

1. Compléter les expériences, formations, autres projets et coordonnées souhaitées.
2. Vérifier l’import avec un export réel du propriétaire ; ajouter les variantes
   de fichiers nécessaires et envisager les accès API officiels selon l’éligibilité.
3. Décider si un service de traduction assistée est utile ; validation humaine requise.
4. Choisir l’hébergement, HTTPS, volume SQLite persistant, sauvegardes et restauration.

Ce document ne déclenche aucune implémentation automatique.
