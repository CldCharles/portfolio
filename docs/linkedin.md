# Import LinkedIn

## Accès retenu

La connexion standard [OpenID Connect](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2)
fournit un profil limité, pas le parcours complet. LinkedIn propose aussi un programme
de portabilité API pour les membres UE/EEE/Suisse ; son éligibilité et les accès de
l’application restent à vérifier avant une intégration. Cette version utilise
[l’export personnel officiel](https://www.linkedin.com/help/linkedin/answer/a1339364).
Elle ne récupère pas automatiquement un profil à partir de son URL.

Dans LinkedIn : Paramètres et confidentialité → Confidentialité des données →
Télécharger vos données. Demandez les catégories utiles, téléchargez et décompressez
l’archive. Dans l’admin, importez un CSV à la fois et choisissez sa catégorie et la
langue de ses textes. Aucun identifiant LinkedIn, OAuth ou scraping n’est utilisé.

## Formats pris en charge

CSV UTF-8, séparateur virgule, en-têtes anglais insensibles à la casse, BOM facultatif.
Champs entre guillemets, virgules et retours à la ligne dans les descriptions acceptés.
Limites : 512 Ko par fichier, 100 lignes de données, 100 colonnes, 100 rubriques au total.
Seuls les champs ci-dessous sont extraits ; les autres sont ignorés.

| Catégorie | En-têtes obligatoires | Champs supplémentaires lus |
| --- | --- | --- |
| Profile.csv | First Name, Last Name, Headline | Summary |
| Positions.csv | Company Name, Title | Description, Started On, Finished On |
| Education.csv | School Name, Degree Name | Notes, Activities, Start Date, End Date |
| Skills.csv | Name | — |

Le profil doit avoir une seule ligne. Si le diplôme est vide, le nom de l’établissement sert de titre, sans sous-titre dupliqué. Titres : 1–200 caractères ; sous-titres :
300 maximum ; descriptions : 5000 maximum. Les fichiers ZIP, PDF, les projets et
les fichiers de contacts/messages ne sont pas des formats d’import pris en charge.
Les variantes sans ces en-têtes sont refusées explicitement. Ces formats sont
testés avec des données synthétiques ; aucun export réel du propriétaire n’a encore
été fourni pour vérifier ses variantes. Les dates de précision variable sont
affichées, puis reportées manuellement dans l’éditeur ; les dates existantes restent
inchangées. L’éditeur accepte `AAAA`, `AAAA-MM` et `AAAA-MM-JJ` :
`2020` reste `2020` et `Mar 2024` se reporte comme `2024-03`. Le site et le PDF
respectent cette précision. Un import ne crée pas de jour arbitraire à partir d’une année ou d’un mois.

## Comparaison et validation

- Aucune ligne n’est cochée par défaut. Afficher la comparaison, choisir la
  destination puis cocher uniquement les rubriques souhaitées.
- Une correspondance unique de type, titre et sous-titre dans la langue importée
  propose une rubrique existante. Plusieurs correspondances imposent un choix ;
  sinon une nouvelle rubrique est proposée. Il est toujours possible de changer
  explicitement la destination. Une modification du titre peut nécessiter ce choix
  lors d’un nouvel import. La comparaison porte sur le brouillon, pas le CV publié.
- Plusieurs lignes sélectionnées visant la même rubrique ou ajoutant le même
  titre/sous-titre sont refusées. L’application est atomique : tout réussit ou le
  brouillon local reste inchangé. Aucune rubrique absente du fichier n’est supprimée.
- Le profil remplace son nom et les textes retenus. Les liens, technologies,
  dates, ordre et autres langues sont conservés dans les rubriques existantes.
- Le français reste la référence. Une ligne anglaise/coréenne nouvelle exige une
  version française saisie avant ajout ; pour une rubrique existante, le français
  est prérempli et peut être ajusté. Le texte importé dans sa langue devient une
  traduction à vérifier ; les autres traductions ne sont pas écrasées. Si le français
  change, leurs validations précédentes deviennent obsolètes automatiquement.

Le CSV est lu dans le navigateur, sans stockage du fichier ni envoi de l’archive.
L’ajout remplace uniquement le document local de l’éditeur. Les champs retenus sont
envoyés par la route de sauvegarde habituelle : session, CSRF, validation et révision
attendue. L’enregistrement persiste le brouillon privé. La publication nécessite
ensuite un aperçu et une confirmation, comme une édition manuelle.

Un import préparé déclenche la confirmation de sortie, d’annulation ou de
déconnexion, même si le brouillon enregistré est inchangé. Les dates affichées
conservent explicitement leur rôle de début ou de fin, même si une seule est fournie.

Les réglages de fichier, catégorie et langue sont verrouillés tant qu’un import
est préparé. Pour les changer, annulez cet import avec confirmation préalable.

Changer de destination préserve la version française si elle a déjà été modifiée.
Le préremplissage de la nouvelle destination ne remplace que les champs restés intacts.
