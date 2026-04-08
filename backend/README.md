# Backend

Base backend minimale pour apprendre Node.js avec Express et TypeScript.

## Demarrage

Depuis la racine du projet:

```bash
npm run dev:backend
```

Ou depuis le dossier backend:

```bash
npm install
npm run dev
```

## Endpoints

- `GET /api/health`
- `GET /api/cv`
- `POST /api/cv` : exercice a terminer

## Parcours d'apprentissage conseille

1. lire `src/server.ts`
2. comprendre comment `app.get(...)` cree une route
3. lire `src/routes/cv.ts`
4. implementer toi-meme `POST /api/cv`
5. tester avec Bruno, Postman ou `curl`

## Ce que tu dois comprendre en premier

- `app.use(express.json())` permet de lire du JSON envoye par le client
- `Router()` permet de regrouper des routes par sujet
- `req` represente la requete recue
- `res` represente la reponse renvoyee
- `res.json(...)` renvoie du JSON
- `res.status(...).json(...)` permet de choisir le code HTTP
