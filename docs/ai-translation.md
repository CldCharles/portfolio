# Traduction des sections du CV par IA

Dans l’éditeur admin, un bouton propose la traduction anglaise ou coréenne d’une
section, à partir de son texte français, avec l’API Claude d’Anthropic. Un second
bouton propose d’un coup toutes les traductions manquantes.

L’IA ne fait que **proposer** : la proposition arrive dans le brouillon comme une
traduction « à vérifier ». Elle n’est visible du public qu’une fois relue, validée,
enregistrée puis publiée, exactement comme une traduction saisie à la main.

## Parcours d’une demande

```
Éditeur (Vue)                     API Express                          API Claude
AiTranslateButton ─┐
AiTranslateMissing ┴─▶ store ─▶ POST /api/admin/translation ─▶ service ─▶ Claude translator ─▶ Anthropic
                       (Pinia)   session + CSRF + Zod             quota +      prompt fixe +
                                                                  validation   sortie structurée
◀── proposition écrite dans le brouillon, statut « à vérifier » ◀────────────────────────────────┘
```

| Couche | Fichier | Rôle |
| --- | --- | --- |
| Route HTTP | `apps/api/src/admin/routes.ts` | Mêmes contrôles que toute l’admin : session, origine, CSRF. Valide la requête avec Zod. |
| Règles métier | `apps/api/src/translation/service.ts` | Désactivé sans clé, quota quotidien, validation de la réponse. Ne connaît pas Anthropic. |
| Fournisseur IA | `apps/api/src/translation/claude-translator.ts` | Seul fichier qui parle à Claude : consignes, format de sortie, gestion des refus. |
| Secret | `apps/api/src/translation/api-key.ts` | Lit la clé depuis le credential systemd. |
| Interface | `apps/web/src/features/admin/translation.ts` et `components/AiTranslate*.vue` | Appelle l’API, écrit la proposition dans le brouillon, affiche l’état. |

Le service dépend d’une interface `Translator`. Les tests utilisent un faux
traducteur, et changer de fournisseur ne toucherait qu’un fichier.

## Sécurité

| Risque | Protection |
| --- | --- |
| Fuite de la clé API | La clé ne quitte jamais le serveur. Elle est stockée dans `/etc/portfolio/anthropic-api-key` (root, 600) et fournie au service par `LoadCredential` de systemd. Elle n’apparaît ni dans le dépôt, ni dans `portfolio.env`, ni dans l’environnement du processus, ni dans le navigateur, ni dans les journaux. |
| Usage par un visiteur | La route est derrière la session admin (cookie HttpOnly, SameSite=Strict) et le token CSRF. Sans session : 401. Requête forgée depuis un autre site : 403. |
| Facture qui s’emballe | Au plus 100 appels par jour (UTC), comptés dans SQLite **avant** l’appel, échecs compris. Le compteur survit aux redémarrages. En complément, une limite de dépense dans la console Anthropic. |
| Proxy ouvert vers Claude | Le navigateur n’envoie pas de prompt : seulement le texte de la section (titre, sous-titre, description, longueurs limitées) et la langue cible (`en` ou `ko`). Les consignes sont fixes, côté serveur. Tout champ en trop est refusé (Zod `strict`). |
| Injection de consignes dans le texte | Le texte est encadré par `<cv_entry>` et les consignes précisent qu’il s’agit de contenu à traduire, jamais d’instructions. Au pire, une mauvaise traduction : elle reste à relire et n’est jamais publiée sans validation. |
| Réponse invalide ou piégée | Claude doit répondre dans un schéma JSON imposé (sortie structurée). La réponse repasse ensuite par le même schéma Zod que l’éditeur : texte nettoyé, longueurs, titre obligatoire. Côté Vue, tout est affiché en texte, jamais en HTML. |
| Fuite de données dans les journaux | En cas d’échec, seul le motif est journalisé (code HTTP, raison d’arrêt). Ni le texte du CV ni la clé. |
| Écrasement d’un travail manuel | Le bouton par section demande confirmation avant de remplacer une traduction existante. Le bouton global ne remplit que les traductions **absentes**. |
| Confidentialité | Seul le texte du CV du propriétaire est envoyé, aucune donnée de visiteur. La notice de confidentialité (FR, EN, KO) le mentionne. |

## Choix techniques

- **Modèle** : Claude Opus 5.5 (`claude-opus-5-5`), avec un effort `low` : la
  traduction est une tâche simple, l’effort bas réduit le coût et l’attente.
- **Sortie structurée** (`output_config.format` avec un schéma Zod) : la réponse est
  directement un objet `{ title, subtitle, description }`, sans analyse de texte libre.
- **Repli en cas de refus** (`fallbacks: "default"`) : si le modèle refuse une demande
  par excès de prudence, l’API relance la requête sur un autre modèle.
- **Pas de streaming** : la réponse est courte et validée d’un bloc ; délai maximal de
  60 s, deux nouvelles tentatives automatiques en cas d’erreur réseau.

## Coût

Environ 1 à 2 centimes de dollar par section et par langue (tarif Claude Opus 5.5 :
4 $ par million de tokens en entrée, 20 $ en sortie). Traduire tout le CV en anglais
et en coréen coûte quelques dizaines de centimes. Le quota de 100 appels par jour
plafonne la dépense quotidienne à environ 2 $.

## Activer en production

1. Créer une clé API sur [console.anthropic.com](https://console.anthropic.com) et
   définir une limite de dépense mensuelle. L’abonnement claude.ai ne donne pas accès à l’API.
2. Déposer la clé sur le serveur. La saisie est masquée, et la clé n’apparaît ni dans
   l’historique du shell ni dans la liste des processus :

   ```sh
   ssh -t ubuntu@IP 'read -rsp "Clé API Anthropic : " key && echo && printf %s "$key" | sudo sh -c "umask 077 && cat > /etc/portfolio/anthropic-api-key" && sudo systemctl restart portfolio && echo "Clé enregistrée."'
   ```

3. Se reconnecter à l’admin : les boutons « Proposer une traduction (IA) » apparaissent.

Pour désactiver la fonctionnalité : `sudo rm /etc/portfolio/anthropic-api-key` puis
`sudo systemctl restart portfolio`. Pour changer de clé : relancer l’étape 2.

## En local

```sh
ANTHROPIC_API_KEY=… npm run dev
```

Sans clé, les boutons restent masqués et la route répond `503 TRANSLATION_UNAVAILABLE`.

## Tests

`apps/api/test/translation.test.ts` vérifie, sans appeler l’API payante :

- la fonctionnalité désactivée sans clé ;
- la validation et le nettoyage de la réponse, et les journaux sans contenu ;
- le quota (échecs comptés, blocage avant l’appel, remise à zéro le lendemain) ;
- la session et le CSRF obligatoires, et le refus des champs inconnus ;
- la lecture de la clé (credential systemd en production, variable en développement) ;
- la requête envoyée à Claude (consignes fixes, texte encadré, effort, format, repli)
  et le rejet d’un refus, avec un faux `fetch`.

`apps/web/test/ai-translation.test.ts` vérifie que la traduction globale ne cible que
les traductions absentes.
