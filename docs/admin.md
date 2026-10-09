# Administration du CV

## Premier accès

Depuis la racine du projet :

```sh
npm ci
npm run admin:setup
npm run dev
```

La commande demande un identifiant (3 à 80 lettres, chiffres, points, tirets ou
underscores) et un mot de passe de 12 à 256 caractères, puis sa confirmation.
La saisie du mot de passe est masquée. Il n’existe aucun compte par défaut ni
inscription publique. Ouvrir ensuite http://127.0.0.1:5173/admin.

Pour remplacer les identifiants après un oubli :

```sh
npm run admin:setup -- --reset
```

Cette opération locale révoque toutes les sessions. Elle ne modifie pas le CV ni
le brouillon. Utiliser le même `DATABASE_PATH` pour la commande et le serveur.
Ne pas placer les mots de passe dans les arguments, dans Git ou dans le chat.
Le compte réel doit être choisi par le propriétaire ; les tests utilisent des bases
jetables et leurs comptes ne sont jamais ajoutés à la base du portfolio.

## Édition et publication

1. Choisir une rubrique dans la liste : présentation, compétence, projet,
   expérience ou formation. Ajouter, retirer et réordonner les entrées selon le besoin.
2. Modifier les données communes et les textes FR/EN/KO. La langue de l’interface
   (en haut) et la langue du texte en cours d’édition sont indépendantes.
3. Une traduction modifiée ou dont la source française a changé est « à vérifier ».
   Afficher la source française puis valider explicitement la traduction.
4. Enregistrer le brouillon. Les rubriques doivent avoir un titre français ; une
   traduction commencée doit aussi avoir un titre. Les liens doivent être HTTP(S).
5. Consulter l’aperçu dans la langue de l’interface. Il emploie les mêmes composants
   d’affichage et le même repli français que la page publique.
6. Publier, puis confirmer. Le CV public est remplacé dans une transaction unique.

Enregistrer ne publie pas. Recharger abandonne les modifications non enregistrées
après confirmation ; il recharge le brouillon serveur, pas la version publique.
Le passage vers une autre page ou la fermeture du navigateur avertit si des changements
ne sont pas enregistrés. Une expiration de session garde ces changements en mémoire
dans l’onglet pendant la reconnexion ; ils ne survivent pas à sa fermeture.

Un numéro de révision protège sauvegarde, aperçu et publication contre les conflits
entre onglets. Un conflit conserve les modifications locales et demande de recharger
avant de les reporter. Le brouillon initial est copié de la publication existante.
Il n’y a pas encore d’historique de versions, d’annulation après publication, de
récupération par e-mail, de MFA, ni de compte supplémentaire.

## Sécurité et configuration

- Hash du mot de passe : scrypt avec sel aléatoire, N=32768, r=8, p=3, sortie 64 octets.
- Sessions persistantes SQLite : identifiant aléatoire 256 bits, empreinte SHA-256
  stockée côté serveur, durée absolue de 8 heures, 10 sessions maximum.
- Cookie `portfolio_session` : HttpOnly, SameSite=Strict, chemin `/api/admin`, Secure
  en HTTPS et en production. Aucun jeton d’authentification dans localStorage.
- Écritures : origine exacte, JSON, en-tête spécifique et token CSRF de session.
  La connexion n’exige pas de session préalable, mais vérifie l’origine et l’en-tête.
- Limite persistante des connexions : 5 échecs par IP sur 15 minutes et 20 tentatives
  globales sur la même fenêtre. Succès : remise à zéro du compteur de cette IP.
- Les données privées sont servies avec `Cache-Control: no-store`. Les erreurs
  n’exposent ni hash, ni identifiant de session, ni trace serveur. Helmet ajoute les
  en-têtes HTTP de sécurité de l’API.

| Variable | Valeur locale / règle |
| --- | --- |
| `DATABASE_PATH` | Par défaut `apps/api/data/portfolio.sqlite` ; chemin absolu conseillé |
| `PUBLIC_ORIGIN` | `http://127.0.0.1:5173` en développement ; origine HTTPS explicite obligatoire en production, sans slash final |
| `NODE_ENV` | `production` active la contrainte HTTPS et les cookies Secure |
| `HOST`, `PORT` | `127.0.0.1`, `3000` |
| `TRUST_PROXY` | Vide par défaut (aucun proxy). Nombre de proxys de confiance (1 à 10) ou liste d’adresses, transmis à Express `trust proxy` |
| `API_PROXY_TARGET` | Cible du proxy **Vite en développement**, par défaut `http://127.0.0.1:3000` ; utile pour une API de test isolée |

Les fichiers `.env` ne sont pas chargés automatiquement. Exemple d’origine locale
différente : `PUBLIC_ORIGIN=http://localhost:5173 npm run dev`.

En production, servir front et API sur la même origine HTTPS et faire retomber les
routes SPA `/admin` et `/admin/login` sur `index.html`. La protection effective est
côté API ; le garde Vue Router ne remplace jamais les contrôles serveur.
Ne pas exposer le serveur de développement. Le choix de l’hébergeur, des en-têtes
du front statique et des sauvegardes reste à faire. Par défaut, le serveur ne fait
confiance à aucun proxy pour l’IP ; derrière un reverse proxy, toutes les connexions
partageraient alors l’adresse du proxy et sa limite de 5 échecs. Définir `TRUST_PROXY`
avec le nombre exact de proxys devant l’API (souvent `1`) ou leurs adresses. Ne pas
l’activer sans proxy : un client pourrait sinon choisir son IP via `X-Forwarded-For`.

## API privée

Toutes les routes sont sous `/api/admin`. Session et login sont les seules routes
accessibles sans connexion. Les autres vérifient la session ; les écritures vérifient
également le token CSRF.

| Méthode | Route | Action |
| --- | --- | --- |
| GET | `/session` | État du compte et de la session, token CSRF si connecté |
| POST | `/login` | Connexion et renouvellement du cookie |
| POST | `/logout` | Révocation de la session |
| GET | `/draft` | Brouillon et ses révisions |
| PUT | `/draft` | Validation et sauvegarde avec révision attendue |
| GET | `/preview?lang=fr&revision=…` | Aperçu du brouillon enregistré |
| POST | `/publish` | Publication atomique avec révision attendue |

Le profil accepte un pays facultatif (code ISO à deux lettres, par exemple `KR`),
affiché dans la langue de chaque version. Le type d’entrée « Langue » accepte un
titre (langue), un sous-titre (niveau) et une description (certification, école),
traduits comme les autres entrées. Un brouillon enregistré avant ces champs reste valide.

La migration v3 reconstruit `cv_items` pour autoriser le type `language`, en
conservant identifiants, révisions et traductions. Le code antérieur refuse une base v3.

La migration v2 ajoute `admin_account`, `admin_sessions`, `admin_login_attempts`
et `admin_draft`, sans remplacer les tables publiques. Le document du brouillon
est un JSON validé par Zod ; chaque traduction conserve la copie de sa source
approuvée. Lors de la publication, les données normalisées sont transférées dans
les tables publiques et les traductions non validées restent conservées mais non
utilisées par la lecture publique.

## Import LinkedIn

Le bouton « Importer LinkedIn » ouvre une comparaison dans l’éditeur. L’ajout modifie
uniquement le brouillon local de cet onglet et conserve les modifications déjà faites.
Il faut ensuite enregistrer, consulter l’aperçu et publier. Les conflits de révision
et la reconnexion conservent ces modifications comme pour une édition manuelle.
Voir `docs/linkedin.md` pour les formats pris en charge et les langues.
