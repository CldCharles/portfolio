# Architecture du front

Le front reste une application Vue 3. Les pages assemblent les écrans et chaque
fonctionnalité regroupe sa propre logique. Pas de couche générique de services ou
repositories tant qu’un besoin concret ne la justifie.

## Arborescence actuelle

```text
apps/web/
├── components.json          # Configuration du registre shadcn-vue
├── vite.config.ts           # Vue, Tailwind et alias @ vers src
└── src/
    ├── main.ts              # Démarrage de Vue et installation des plugins
    ├── App.vue              # Racine de l’application
    ├── app/
    │   └── pinia.ts         # Instance Pinia commune à l’application
    ├── pages/
    │   └── CvPage.vue       # Assemblage du CV public
    ├── layouts/             # Futurs cadres public et admin ; README seulement
    ├── features/cv/         # Affichage du CV, api.ts et store Pinia
    ├── components/
    │   └── ui/              # Composants shadcn ajoutés au projet
    │       ├── button/
    │       ├── input/
    │       └── label/
    ├── composables/         # Future logique réactive partagée ; README seulement
    ├── lib/
    │   └── utils.ts         # Fonction cn : fusion de classes Tailwind
    ├── i18n/
    │   ├── index.ts
    │   └── locales/
    │       ├── fr.ts
    │       ├── en.ts
    │       └── ko.ts
    └── styles/
        ├── main.css        # Tailwind, thème et tokens communs
        └── shadcn.css      # Utilitaires CSS shadcn conservés localement
```

## Développement des fonctionnalités

Lors de leur réalisation, ajouter les dossiers suivants dans `features` :

- `cv` : lecture, affichage et édition du CV, réutilisés par le public et l’admin.
- `auth` : connexion et état de session administrateur.
- `linkedin` : import et aperçu des modifications avant validation.

Structure actuelle du CV :

```text
features/cv/
├── components/
│   ├── CvHero.vue           # Identité et présentation ; prop profile
│   ├── CvSection.vue        # Section typée ; props id, title, entries
│   └── LanguageSwitcher.vue # Choix de langue dans Vue I18n
├── lib/sections.ts          # Ordre et regroupement des sections, communs au CV et à l’aperçu
├── stores/cv.ts             # Chargement, erreurs et annulation des anciennes requêtes
└── api.ts                   # Lecture HTTP
```

`App.vue` monte `CvPage.vue`. La page assemble les composants ; le store porte
les effets réseau. Les contrats publics sont partagés dans `packages/contracts` et
importés avec `import type`. Pas de duplication des données CV dans les locales.
Vue Router (`app/router.ts`) charge les pages à la demande : `CvPage.vue`,
`admin/LoginPage.vue` et `admin/EditorPage.vue`. Le garde vérifie la session avant
d’afficher l’éditeur ; la sécurité repose sur l’API.

`features/auth` contient API HTTP, store session et formulaire de connexion.
`features/admin` contient le store du brouillon, `ItemEditor` (champs communs),
`TranslationEditor` (texte et validation par langue) et `DraftPreview` (réutilisation
des composants du CV public). Les éditeurs utilisent des contrats `v-model` typés ;
les actions réseau sont dans les stores. Les erreurs et expirations conservent les
modifications dans l’onglet. Aucun token de session ni brouillon privé dans localStorage.

## Règles de placement

- `pages` : assembler un écran et gérer ses paramètres de route. Garder les règles
  métier dans la fonctionnalité concernée.
- `layouts` : cadre partagé de plusieurs pages.
- `components/ui` : primitives visuelles réutilisables, sans appels API ni stores métier.
  Les composants shadcn sont du code local, personnalisable et maintenu dans le dépôt.
- `components` hors `ui` : éléments partagés de l’application, comme un futur sélecteur
  de langue. Un composant propre au CV reste dans `features/cv/components`.
- `features/<nom>/api.ts` : utiliser d’abord `fetch` et des URLs `/api/...`.
  Ajouter un utilitaire `lib/api.ts` seulement si plusieurs fonctionnalités partagent
  réellement la gestion des erreurs ou une configuration HTTP.
- `features/<nom>/stores` : état partagé Pinia, par exemple `useCvStore` ou
  `useAuthStore`. Les appels HTTP restent définis dans `api.ts` et sont appelés par
  les actions du store quand ils alimentent son état.
- État local d’une modale ou d’un champ : `ref` dans le composant, sans store.
- Langue : Vue I18n gère déjà son état ; ne pas le dupliquer dans Pinia.
- Ne pas conserver de secret ou de jeton de session admin dans un store persistant.
- `composables` à la racine : logique réactive réellement partagée entre fonctionnalités.
- `lib` : petits utilitaires transversaux, sans dépendance vers les pages ou fonctionnalités.
- Utiliser `@/` pour les imports depuis `src`. Les composants partagés ne dépendent
  jamais d’une fonctionnalité métier ; les fonctionnalités ne dépendent pas des pages.
- Ajouter les tests de comportement près de la logique testée quand elle existe.

## Composants et styles

shadcn-vue est configuré avec Tailwind CSS 4 et Reka UI. Les composants initiaux sont
Button, Input et Label. Les couleurs et rayons se règlent dans `styles/main.css`.
Le thème utilise une police système, sans téléchargement de police externe.

Importer seulement les composants utilisés :

```ts
import { Button } from '@/components/ui/button';
```

Pour ajouter un composant depuis la racine du dépôt :

```sh
cd apps/web
npx shadcn-vue@2.8.2 add dialog
```

Inspecter les fichiers ajoutés et les éventuels changements de dépendances. Le CLI
est utilisé ponctuellement et n’est pas une dépendance permanente : sa version
2.8.2 introduisait des dépendances vulnérables et une contrainte Node supérieure
à celle du projet. Pour le réutiliser, employer Node 22.22.2+ ou une version compatible.
Les utilitaires CSS générés sont conservés localement dans `styles/shadcn.css`
(MIT, voir `styles/shadcn.LICENSE`). Si le CLI réintroduit un import
`shadcn-vue/tailwind.css`, remplacer cet import par `./shadcn.css` et actualiser
ce fichier si les nouveaux composants requièrent de nouveaux utilitaires.
Lancer ensuite `npm run typecheck` et `npm run build`.

Référence : https://www.shadcn-vue.com/docs/installation/vite

## Direction visuelle du CV

CV éditorial affirmé (maquette locale non versionnée) :
blanc cassé chaud, encre bleu-gris, accent bleu pétrole. Titres en Newsreader et
texte en Inter, hébergés dans le projet via `@fontsource-variable` (aucun service
de polices externe). Couleurs dans les tokens de `styles/main.css`.

L’en-tête présente le nom, le métier, la présentation et une ligne de repères :
pays (`profile.countryCode`, nom localisé par `Intl.DisplayNames`), technologies
(sous-titre du profil) et langues parlées (titres des entrées `language`). Actions :
télécharger le PDF, « Me contacter » (`PUBLIC_CONTACT_EMAIL`) et GitHub.
Expériences et formation en frise chronologique : dates en colonne sur grand écran,
au-dessus du texte sur mobile ; contributions en listes et technologies en pastilles.
Projets, compétences et langues en cartes, descriptions toujours visibles. Ordre
commun au public et à l’aperçu : expériences, projets, compétences, langues, formation.
Pas de numérotation des sections. Le pied de page comporte un lien discret
« Administration » vers `/admin/login`.
La mise en page conserve les textes et ne modifie pas les données publiées.
Les contrôles de langue et d’export PDF restent accessibles dans les trois langues.

Le pied de page commun est dans `features/legal/SiteFooter.vue` et la notice dans
`pages/PrivacyPage.vue`. La configuration publique est injectée par requête ;
aucun secret ni brouillon ne doit être ajouté au bootstrap.
`entry-server.ts` rend les mêmes composants Vue avec Pinia/Vue I18n/routeur isolés.
`server/document.ts` échappe les métadonnées et le JSON ; `public-pages.ts` raccorde
Vite au rendu en dev, et `apps/api/src/web.ts` sert le build en production.
Le bootstrap du CV est consommé uniquement au premier montage : un retour depuis
l’admin recharge le CV publié. Lors d’un changement de langue, le CV affiché reste
visible jusqu’à l’arrivée de la nouvelle version ; l’état de chargement plein écran
n’apparaît que s’il n’y a encore aucun CV. Les métadonnées suivent ensuite la route et la langue.

## Navigation du CV et portrait

`CvNavigation.vue` affiche les sections renseignées dans leur ordre de lecture.
À partir de 901 px, le sommaire occupe une colonne d’environ 150 px et reste visible
au défilement. En dessous, il devient une barre collée en haut, défilable
horizontalement. Les ancres fonctionnent sans JavaScript. Avec JavaScript, le
routeur intercepte les ancres : `scrollBehavior` défile vers la section (et non
en haut de page) en reprenant son `scroll-margin`, qui dégage la barre mobile.
Le repère de section en cours utilise `aria-current="location"` ; en bas de page,
la dernière section est marquée même si elle est trop courte pour atteindre le haut.

`CvHero.vue` accepte un portrait local facultatif : ajouter la photo autorisée
dans `apps/web/src/assets/portrait.webp` (ou `.jpg`, `.png`) puis reconstruire.
Préférer un carré déjà recadré et optimisé d’au moins 256 px de côté : le
composant n’applique aucun zoom. Le portrait actuel est un JPEG 384 × 384 sans
métadonnées (~31 Ko). Le fichier est public
une fois ajouté : utiliser une copie sans métadonnées privées. Sans photo,
aucun emplacement vide n’est affiché. Le portrait est décoratif, associé au
nom voisin. L’export PDF le reprend, recadré au format photo 3:4 (voir `docs/pdf.md`). La gestion du portrait via
l’administration n’est pas encore implémentée.

## Hiérarchie visuelle

`features/cv/lib/visual-presentation.ts` identifie l’expérience `sopra-2021-2024`
et la présente en carte dans la frise. Le nom et le métier forment un seul bloc face au portrait. Le téléchargement reste une action
principale, avec choix de langue accessible et discret. Les projets conservent
leur texte, leurs technologies et leur lien : la miniature textuelle a été retirée
après la revue visuelle du propriétaire. Aucune association d’image ni modification
de contrat ou de base n’est nécessaire.
