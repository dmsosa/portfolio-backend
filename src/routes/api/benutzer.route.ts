//BENUTZER ROUTER FUR: Login, Registrierung und Griffen des aktuell Benutzer

//LOGIN: Wenn POST Anfrag zu /login Endpunkt gunstig ist, dann BenutzerInfo mit JWT Token als Antwort zu geben.
//BenutzerInfo ist ein Interface der Benutzer aber mit ein JWT Token aber kein Followers oder Favorite Artikeln.

import { NextFunction, Request, Response, Router } from "express";

import passport from "passport";
import { FieldError } from "../../helpers/customErrors";
import Benutzer, { BenutzerDocument } from "../../database/models/benutzer.model";
import { authorization } from "../../middleware/authorization";
import { CustomRequest } from "../../interfaces/express";
const benutzer = Router();
benutzer.get("/", authorization.required, (req: CustomRequest, res: Response, next: NextFunction) => {
    Benutzer.findOne({ _id: req.auth?.id })
    .then((benutzer) => res.json(benutzer))
    .catch(next);
});
benutzer.post("/login", (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body;
    if (!username) {
        throw new FieldError("Benutzer", " username darf nicht null sein");
    }
    if (!password) {
        throw new FieldError("Benutzer", " password darf nicht null sein");
    }
    passport.authenticate('local', { session: false }, (err: Error, benutzer: BenutzerDocument, info: object) => {
        if (err) {
          return next(err);
        }
        if (benutzer) {
          return res.json(benutzer.toAuthJSON());
        } else {
          return res.status(422).json(info);
        }
      })(req, res, next);
});

benutzer.post("/", authorization.optional, (req: CustomRequest, res: Response, next: NextFunction) => {
  const { username, email, password } = req.body;
  const bio = "Hallo, ich nutze Dmblog!";
  const image = "https://static.productionready.io/images/smiley-cyrus.jpg";

  const benutzer: BenutzerDocument = new Benutzer();

  benutzer.username = username;
  benutzer.email    = email;
  benutzer.bio   = bio;
  benutzer.image = image;
  benutzer.setPassword(password);


  return benutzer.save()
  .then((benutzer) => {
    res.json(benutzer.toAuthJSON());
  })
  .catch(next);
});
export default benutzer;