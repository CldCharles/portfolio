import { Router } from "express";
import { cvData } from "../data/cv.js";

const cvRouter = Router();

cvRouter.get("/", (_req, res) => {
  res.json({
    data: cvData,
    message: "CV principal recupere avec succes.",
  });
});

cvRouter.post("/", async (req, res) => {
  /*
    Exercice pour toi:

    Objectif:
    - recuperer les donnees envoyees par le client dans req.body
    - verifier au minimum que name et email existent
    - si une info manque, renvoyer un status 400 avec un message clair
    - sinon renvoyer un status 201 avec les donnees recues

    Ce qu'il faut comprendre:
    - req = la requete entrante
    - req.body = les donnees JSON envoyees par le frontend
    - res = la reponse que ton serveur renvoie
    - res.status(201).json(...) = reponse HTTP "cree avec succes"
  */

  res.status(501).json({
    message: "Route POST /api/cv a implementer par toi.",
    receivedBody: req.body,
  });
});

export { cvRouter };
