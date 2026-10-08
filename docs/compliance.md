# Périmètre légal et audit technique

## Cas validé le 8 octobre 2026

Portfolio/CV personnel de Claude Charles Valentin, établi en Corée du Sud, visant
principalement des recruteurs coréens. Aucune vente, aucun salarié ni chiffre
d’affaires associé, aucun compte visiteur, contact par email uniquement, aucun
analytics ou contenu embarqué. Visibilité moteurs de recherche et agents IA souhaitée.
Contact public explicitement autorisé : claudecharles94@gmail.com.
Hébergeur, pays des serveurs et domaine public encore inconnus.

Ce rapport ne certifie ni la conformité juridique complète ni une conformité WCAG/RGAA.
Les mentions et le périmètre devront être actualisés si les usages changent.

## Décisions, dans l’ordre du questionnaire

| Point | Décision et justification |
| --- | --- |
| 1. Mentions légales LCEN | Obligation française non établie pour cet éditeur établi en Corée. Aucun modèle de société, SIRET ou adresse personnelle imposé. L’identité de l’éditeur apparaît dans la notice factuelle. Réexaminer le cadre territorial en cas de changement. |
| 2. Confidentialité | Notice factuelle FR/EN/KO fondée sur le code et les traitements techniques. L’applicabilité exacte de PIPA/RGPD, les bases juridiques et les transferts restent à finaliser selon le cas et l’hébergement ; aucune conformité déclarée. |
| 3. Cookies/traceurs | Cookie de session admin et préférence de langue seulement. Aucun traceur non nécessaire trouvé, donc aucun bandeau, consentement publicitaire, gestionnaire ou politique cookies séparée. Usages et durées expliqués dans la notice. |
| 4. CGV | Non applicable : aucune vente. Aucun paiement ni mécanisme d’acceptation créé. |
| 5. CGU | Aucun besoin de CGU publiques identifié : pas de comptes visiteurs, de contenu utilisateurs ou de service contractuel public. Un compte propriétaire pour éditer le CV. |
| 6. Médiateur | Non applicable : pas de vente aux consommateurs. Aucun médiateur fictif. |
| 7. Formulaires | Login, édition et import réservés au propriétaire. Information de traitement et lien vers la notice ; obligations explicites, labels conservés et erreurs du login associées aux champs. Aucune case de consentement inutile. Aucun champ personnel superflu à supprimer trouvé. |
| 8. Services tiers | Aucun chargement de scripts tiers en production. Liens GitHub, aide LinkedIn et PIPC ouvrent des sites distincts seulement après navigation. Polices système et police PDF locale sous OFL. Pas de remplacement requis. Hébergement à vérifier. |
| 9. Accessibilité | Corrections ciblées : focus des disclosures, contraste des contours de formulaires, erreurs associées, un seul h1 dans l’aperçu admin et langues déclarées. Contrôles clavier et responsive à vérifier dans le rapport de livraison. Pas de déclaration de conformité inventée ; obligation RGAA française non identifiée pour ce cas. |
| 10. Agents IA | SSR du CV publié et de la notice, liens de langue utilisables sans JS, title/description/Open Graph, canonical et alternates quand domaine connu, ProfilePage/Person, robots, sitemap et llms.txt. Pas de garantie d’indexation ni de citation. llms.txt est un format de découverte proposé, pas une obligation légale. |
| 11. Contenu | CV publié et seed examinés : pas d’avis clients, promesse chiffrée, comparaison commerciale ou offre gratuite trompeuse. Aucune photo ni logo tiers dans le site ; police PDF sous licence OFL conservée. Aucun passage à reformuler ni image à remplacer identifié. Exactitude du parcours et confidentialité des missions à relire par le propriétaire. |
| 12. Contact | Email fourni, lien mailto visible sur toutes les pages et dans la notice. Pied de page commun CV/login/admin/confidentialité. Pas de formulaire supplémentaire ni donnée commerciale inventée. L’existence et la réception réelle de la boîte ne sont pas vérifiables sans message de test, non envoyé. |
| 13. Autres risques | Purge automatique des IP de connexion et sessions expirées au démarrage puis chaque minute. Admin noindex/nofollow et absent du sitemap/llms. Robots n’est pas une protection : authentification et CSRF restent nécessaires et sont conservés. Stockage, logs et sauvegardes du futur hébergeur restent à vérifier. |

## Inventaire des traitements et conservations

| Traitement | Données / finalité | Conservation effective / accès |
| --- | --- | --- |
| CV publié | Nom, carrière, compétences, formations, traductions, liens professionnels ; présentation aux recruteurs et PDF | SQLite, jusqu’à modification/suppression par le propriétaire ; public après publication explicite. Sauvegardes hébergeur inconnues. |
| Brouillon | Même contenu avant publication ; édition privée | SQLite jusqu’à remplacement/suppression ; propriétaire authentifié seulement. Jamais inclus dans SSR, JSON-LD ou fichiers de découverte. |
| Compte admin | Identifiant et hash scrypt ; contrôle d’accès | Tant que le compte sert à administrer le site, remplacement/suppression par le propriétaire ; aucun mot de passe en clair stocké. |
| Session | Cookie opaque, hash serveur, jeton CSRF et échéance ; authentification/sécurité | 8 heures, révocation à la déconnexion ; enregistrements expirés purgés chaque minute quand le serveur tourne et au redémarrage. |
| Limitation des connexions | IP et compteurs ; prévention d’abus sur le login | Fenêtre de 15 minutes, purge chaque minute quand le serveur tourne et au redémarrage ; pas de suivi d’audience. |
| Langue | Valeur fr/en/ko dans localStorage ; choix d’interface | Jusqu’à effacement des données navigateur, sans expiration automatique ; pas d’identifiant ni transfert à un tiers. |
| Import CSV | Fichier lu en mémoire navigateur ; choix de champs du CV | Fichier brut non envoyé/non stocké par l’application. Champs sélectionnés ajoutés au brouillon, envoyés seulement lors de son enregistrement. |
| Transport HTTP/hébergement | IP et données nécessaires aux requêtes ; fourniture du site | Pas de middleware de journalisation des visites dans l’app. Logs/retentions/sauvegardes/prestataires/transferts hébergeur à déterminer. |

Les finalités de fonctionnement, publication volontaire par le propriétaire et
sécurité sont décrites. Elles ne sont pas présentées comme des bases juridiques
art. 6 RGPD ou PIPA définitivement établies. Ne pas déduire l’exemption de toute
obligation simplement du statut « particulier ».

## Services et ressources externes

| Ressource | Chargée automatiquement ? | Verdict |
| --- | --- | --- |
| GitHub (profil et dépôt) | Non : simples liens | Pas de script/traceur tiers intégré. Confidentialité de GitHub après navigation. |
| Aide LinkedIn | Non : lien dans l’admin | Pas de fetch de profil ni scraping. Aucun identifiant LinkedIn collecté. |
| PIPC | Non : lien institutionnel de la notice | Aucun script externe. |
| Polices du site | Non : polices système | Pas de Google Fonts/CDN. |
| Police PDF Noto Sans CJK KR | Fichier local livré avec l’API | OFL conservée, pas de requête externe à l’exécution. |
| Hébergeur / reverse proxy | Non choisi | À identifier avant publication, avec logs et pays réels. |

## À FAIRE PAR UN HUMAIN avant mise en ligne

- Choisir l’hébergeur et le domaine. Vérifier le nom du prestataire, les pays où
  transitent/stationnent les données, ses sous-traitants, les journaux, leurs
  durées et les sauvegardes. Compléter les variables publiques documentées.
- Confirmer le cadre coréen applicable aux traitements réels et, si nécessaire,
  leurs bases juridiques, les droits/recours et garanties de transfert. La
  traduction anglaise de PIPA consultée ne remplace pas le texte coréen à jour.
  La PIPC signale une réforme entrée en vigueur le 11 septembre 2026.
- Vérifier la réception de claudecharles94@gmail.com. Aucun email de test n’a été
  envoyé. Un lien mailto ouvre la messagerie du recruteur ; l’application n’envoie
  ni ne stocke ses messages.
- Relire l’exactitude du CV et les obligations de confidentialité relatives aux
  missions décrites. Aucun nom de client confidentiel ne doit être ajouté.
- Relire la notice coréenne avec un locuteur compétent et vérifier clavier,
  lecteur d’écran, zoom et les PDF ; les PDF ne sont pas certifiés PDF/UA.
- Réexaminer le périmètre avant ajout d’analytics, formulaire, vente, comptes
  visiteurs ou ciblage européen. Si vente ou données sensibles à l’avenir,
  faire relire les textes et le fonctionnement par un avocat avant publication.

Aucune adhésion à un médiateur ni CGV/CGU à prévoir dans le périmètre présent.
Aucun sous-titre ou texte alternatif manquant identifié : aucune vidéo/image
porteuse de sens dans le site actuel.

## Sources officielles et références

- [CEPD — champ territorial du RGPD](https://www.cnil.fr/sites/default/files/atoms/files/lignes_directrices_du_cepd_sur_le_champ_dapplication_territorial_du_rgpd.pdf) : accès depuis l’UE ≠ application automatique ; ciblage et suivi à examiner.
- [CNIL — cookies et traceurs](https://cnil.fr/fr/cookies-et-autres-traceurs/que-dit-la-loi) : exemptions d’authentification et personnalisation intrinsèque de langue.
- [PIPA — traduction KLRI](https://elaw.klri.re.kr/eng_service/lawViewContent.do?hseq=71740) : notamment article 30, notice des traitements lorsque le texte s’applique.
- [PIPC — réforme 2026](https://pipc.go.kr/eng/user/ltn/new/noticeDetail.do?bbsId=BBSMSTR_000000000001&nttId=3005).
- [DesignGouv — cadre légal](https://design.numerique.gouv.fr/fr/accessibilite-numerique/cadre-legal/) et [kit RGAA](https://accessibilite.numerique.gouv.fr/ressources/kit-audit/) : ne pas déclarer une conformité sans évaluation.
- [Vue — SSR](https://vuejs.org/guide/scaling-up/ssr), [Vite — SSR](https://vite.dev/guide/ssr), [ProfilePage](https://developers.google.com/search/docs/appearance/structured-data/profile-page) et [proposition llms.txt](https://llmstxt.org/).

## Vérifications réalisées

- 37 tests réussis : 16 API et 21 front, dont purge des données expirées, SSR
  concurrent isolé FR/EN/KO, absence de contenu admin dans le rendu, échappement
  HTML/JSON et séquences dollar, rechargement du CV après retour depuis l’admin.
- `npm run typecheck`, `npm run build`, `git diff --check` réussis.
- Vérification HTTP du build sur base mémoire jetable : 6 pages HTML publiques,
  21 réponses CSS, 3 PDF, canonical/sitemap avec domaine de test uniquement,
  admin non indexable et brouillon marqué privé absent des réponses publiques.
- Navigateur : notice FR/EN/KO à 390 px sans débordement, langue et title à jour,
  préférence coréenne restaurée en visitant `/` sans `lang`, aucun avertissement
  d’hydratation trouvé. Login : labels, champs requis, lien de confidentialité,
  focus clavier et pied de page vérifiés. Pas de modification du CV réel pour
  une démonstration ni de message de test envoyé.
- Contrastes calculés sur les couleurs effectives : texte 13,33:1, texte
  secondaire 6,04:1, accent 7,46:1, bouton PDF 7,74:1 et bordure des champs 3,39:1.
- Revue indépendante : trois régressions corrigées (texte `$` dans metadata,
  préférence de langue et CV ancien au retour admin), relecture sans finding
  restant. La revue est statique ; les validations ci-dessus sont celles de
  l’auteur. Pas d’audit exhaustif RGAA, de test complet lecteur d’écran ou de
  certification juridique/PDF/UA.

## Fichiers créés ou modifiés

- `README.md` — Documente le build serveur, les variables publiques et les éléments à compléter.
- `apps/api/src/admin/routes.ts` — Marque les réponses admin noindex/nofollow sans changer les contrôles d’accès.
- `apps/api/src/admin/service.ts` — Expose la purge des sessions et IP de connexion expirées.
- `apps/api/src/app.ts` — Expose exclusivement la configuration publique via /api/site.
- `apps/api/src/public-config.ts` — Valide les données publiques et le domaine ; inclut le contact autorisé.
- `apps/api/src/server.ts` — Raccorde le serveur web et programme la purge au démarrage puis chaque minute.
- `apps/api/src/web.ts` — Sert le build, le CV HTML publié, la notice, les assets et les fichiers de découverte.
- `apps/api/test/admin.test.ts` — Vérifie la purge sans nouvelle connexion, sans supprimer les lignes actives.
- `apps/api/test/public-config.test.ts` — Vérifie l’absence de secrets et de domaine/ hébergement inventés.
- `apps/web/package.json` — Ajoute le build SSR et le manifeste client.
- `apps/web/public-pages.ts` — Raccorde le rendu public HTML au serveur Vite en développement.
- `apps/web/src/App.vue` — Ajoute le pied de page commun et les métadonnées suivant route/langue/contenu.
- `apps/web/src/app/router.ts` — Ajoute /privacy et une fabrique de routeur isolée pour le serveur.
- `apps/web/src/entry-server.ts` — Rend Vue avec instances Pinia/I18n/routeur propres à chaque requête.
- `apps/web/src/features/admin/components/DraftPreview.vue` — Utilise un h2 pour le profil dans l’aperçu qui possède déjà un h1.
- `apps/web/src/features/auth/LoginForm.vue` — Ajoute information, champs requis visibles et erreurs associées.
- `apps/web/src/features/cv/components/CvHero.vue` — Permet un niveau de titre adapté à l’aperçu admin.
- `apps/web/src/features/cv/components/CvPdfExport.vue` — Masque le sélecteur dépendant de JS sans JS ; conserve le téléchargement courant.
- `apps/web/src/features/cv/components/LanguageSwitcher.vue` — Fournit de vrais liens de langue, avec état courant accessible.
- `apps/web/src/features/cv/stores/cv.ts` — Hydrate une seule fois puis conserve les rechargements aux montages suivants.
- `apps/web/src/features/legal/SiteFooter.vue` — Fournit contact et confidentialité sur toutes les pages.
- `apps/web/src/features/legal/config.ts` — Lit le bootstrap public et injecte une configuration isolée.
- `apps/web/src/features/legal/metadata.ts` — Actualise les métadonnées du navigateur avec contenu échappé.
- `apps/web/src/features/linkedin/LinkedInImport.vue` — Explique la lecture locale et la transmission des seuls champs sélectionnés.
- `apps/web/src/i18n/index.ts` — Rend I18n compatible serveur et garde la langue HTML à jour.
- `apps/web/src/i18n/locales/en.ts` — Raccorde les clés de confidentialité au schéma de traduction existant.
- `apps/web/src/i18n/locales/fr.ts` — Raccorde les clés de confidentialité au schéma de traduction existant.
- `apps/web/src/i18n/locales/ko.ts` — Raccorde les clés de confidentialité au schéma de traduction existant.
- `apps/web/src/i18n/locales/legal-en.ts` — Traduit la notice, les informations de formulaires et le contact dans cette langue.
- `apps/web/src/i18n/locales/legal-fr.ts` — Traduit la notice, les informations de formulaires et le contact dans cette langue.
- `apps/web/src/i18n/locales/legal-ko.ts` — Traduit la notice, les informations de formulaires et le contact dans cette langue.
- `apps/web/src/main.ts` — Hydrate le HTML serveur et restaure la préférence implicite après hydratation.
- `apps/web/src/pages/CvPage.vue` — Réutilise le CV SSR puis recharge au retour client ; retire le footer local.
- `apps/web/src/pages/PrivacyPage.vue` — Présente la notice factuelle et les informations d’hébergement incomplètes.
- `apps/web/src/pages/admin/EditorPage.vue` — Explique les données du brouillon et la publication volontaire.
- `apps/web/src/server/document.ts` — Échappe HTML/JSON et génère metadata, robots, sitemap et llms.
- `apps/web/src/styles/main.css` — Renforce bordures de champs, focus des disclosures et lisibilité des formulaires.
- `apps/web/test/cv-store.test.ts` — Vérifie que le bootstrap ne bloque pas un futur rechargement après publication.
- `apps/web/test/document.test.ts` — Vérifie découverte publique et échappement des textes malveillants/spéciaux.
- `apps/web/test/server-rendering.test.ts` — Vérifie SSR multilingue concurrent et séparation public/admin.
- `apps/web/tsconfig.json` — Autorise les extensions TypeScript explicites du fichier de configuration Vite.
- `apps/web/vite.config.ts` — Active le middleware de rendu public.
- `docs/compliance.md` — Consigne l’audit, les décisions, les traitements, les sources et les tâches humaines.
- `docs/frontend.md` — Décrit le pied de page commun, le SSR et les précautions de bootstrap.
- `docs/i18n.md` — Précise l’ordre URL/préférence après hydratation et les liens sans JS.
- `packages/contracts/index.ts` — Ajoute les types de configuration et bootstrap publics sans code runtime.
