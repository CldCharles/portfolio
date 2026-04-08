# Portfolio + CV Studio

Premiere base pour un portfolio React avec une premiere feature produit: un editeur de CV multilingue, local-first, avec export PDF via impression navigateur.

## Stack

- React + TypeScript + Vite
- `framer-motion` pour des transitions legeres
- `lucide-react` pour les icones
- Pas de backend pour cette V1

## Pourquoi sans backend ?

Pour ton besoin initial, ce choix est le plus simple et le plus rentable:

- hebergement gratuit facile sur Vercel, Netlify ou Cloudflare Pages
- zero cout serveur
- edition et sauvegarde locale via `localStorage`
- export PDF cote client avec la version imprimable
- structure prete a accueillir un backend Node.js plus tard si tu veux un compte, une synchro cloud ou une traduction automatique

## Fonctionnalites incluses

- landing page portfolio moderne
- editeur de CV
- variantes par langue: francais, anglais, espagnol
- duplication rapide du contenu FR vers une autre langue
- sauvegarde locale
- export/import JSON
- export PDF via `window.print()`

## Lancer le projet

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Hebergement gratuit recommande

### Option 1: Vercel

- connecte le repo GitHub
- framework: `Vite`
- build command: `npm run build`
- output directory: `dist`

### Option 2: Netlify

- build command: `npm run build`
- publish directory: `dist`

## Suite logique que je recommande

1. connecter le formulaire a un vrai systeme de templates de CV
2. ajouter une section projets / experiences sur la home
3. brancher une traduction automatique via API plus tard
4. ajouter une auth et une synchro si tu veux retrouver ton CV sur plusieurs appareils
