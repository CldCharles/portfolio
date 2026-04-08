# Portfolio & CV Studio

Application web construite avec React, TypeScript et Vite.

Le projet combine:

- une landing page portfolio sobre et modulaire
- un espace `CV Studio` accessible par routing
- une base backend Node.js/Express separee pour les evolutions futures

## Apercu

Le frontend est organise comme une application classique:

- `front/src/app` pour le routing
- `front/src/components` pour les elements partages
- `front/src/pages` pour les ecrans
- `front/src/features/cv` pour la fonctionnalite CV

Le backend est contenu dans `backend/` et expose une base d'API minimaliste pour l'apprentissage et l'evolution du produit.

## Fonctionnalites

- landing page portfolio
- navigation avec routing
- page dediee au `CV Studio`
- edition locale du CV
- variantes multilingues
- import/export JSON
- export PDF via impression navigateur
- backend Express avec routes `GET /api/health` et `GET /api/cv`

## Stack

### Frontend

- React
- TypeScript
- Vite
- Framer Motion
- React Router
- Lucide React

### Backend

- Node.js
- Express
- TypeScript

## Demarrage

### Frontend

```bash
cd front
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm run dev
```

### Depuis la racine

```bash
npm run dev:front
npm run dev:backend
```

## Build

### Frontend

```bash
npm run build:front
```

### Backend

```bash
npm run build:backend
```

## Structure

```text
portfolio/
├── backend/
├── front/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   └── pages/
│   └── package.json
├── DEVELOPMENT.md
└── package.json
```

## Hebergement

Le frontend peut etre deploye sur une plateforme statique comme Vercel, Netlify ou Cloudflare Pages.

Le backend peut rester local pendant la phase d'apprentissage, puis etre deplace plus tard vers un hebergement Node.js si necessaire.
