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
    │   └── SetupPage.vue    # Page d’attente actuelle
    ├── layouts/             # Futurs cadres public et admin ; README seulement
    ├── features/            # Futures fonctionnalités ; README seulement
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
    │       └── en.ts
    └── styles/
        ├── main.css        # Tailwind, thème et tokens communs
        └── shadcn.css      # Utilitaires CSS shadcn conservés localement
```

## Développement des fonctionnalités

Lors de leur réalisation, ajouter les dossiers suivants dans `features` :

- `cv` : lecture, affichage et édition du CV, réutilisés par le public et l’admin.
- `auth` : connexion et état de session administrateur.
- `linkedin` : import et aperçu des modifications avant validation.

Exemple de structure future pour le CV, à créer selon les besoins :

```text
features/cv/
├── components/
│   ├── CvPreview.vue
│   └── CvEditor.vue
├── composables/             # Seulement si de la logique réactive doit être partagée
├── stores/
│   └── cv.ts
├── api.ts                   # Appels HTTP propres au CV
└── types.ts                 # Types du domaine CV
```

Les fichiers `pages/PortfolioPage.vue`, `pages/LoginPage.vue` et
`pages/admin/CvEditorPage.vue` assembleront les composants métier et les layouts.
Vue Router et `app/router.ts` seront ajoutés à cette étape. Ils ne sont pas encore présents.

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
