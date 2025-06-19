//BENUTZER ROUTER FUR: Login, Registrierung und Griffen des aktuell Benutzer

//LOGIN: Wenn POST Anfrag zu /login Endpunkt gunstig ist, dann BenutzerInfo mit JWT Token als Antwort zu geben.
//BenutzerInfo ist ein Interface der Benutzer aber mit ein JWT Token aber kein Followers oder Favorite Artikeln.

import { NextFunction, Request, Response, Router } from "express";

import passport from "passport";
import { CustomError, FieldError, NotFoundError } from "../../helpers/customErrors";
import Benutzer from "../../database/models/benutzer.model";
import { authorization } from "../../middleware/authorization";
import { CustomRequest } from "../../interfaces/express";
import { BenutzerDocument } from "../../interfaces/benutzer.interfaces";
const benutzer = Router();
benutzer.param('username', (req: CustomRequest, res: Response, next: NextFunction, username: string) => {
    Benutzer.findOne({ username })
    .then((benutzer) => {
        if (!benutzer) {
            next(new NotFoundError('Benutzer', `mit username: '${username}'`)); 
        } else {
            req.benutzer = benutzer as BenutzerDocument;
            next();
        }

    })
    .catch(next);
})
benutzer.get("/", authorization.required, (req: CustomRequest, res: Response, next: NextFunction) => {
    Benutzer.findOne({ _id: req.auth?.id })
    .then((benutzer) => {
      console.log(req.auth)
      res.json(benutzer?.toAuthJSON())})
    .catch(next);
});
benutzer.post("/login", (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    if (!email) {
        throw new FieldError("Benutzer", " email darf nicht null sein");
    }
    if (!password) {
        throw new FieldError("Benutzer", " password darf nicht null sein");
    }
    passport.authenticate('local', { session: false, failureMessage: 'Fehler Bei Authentifisierung' }, (err: Error, benutzer: BenutzerDocument, info: object) => {
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

benutzer.post("/logout", (req: Request, res: Response, next: NextFunction) => {
    //Ende der Session Logik
    res.json({ message: 'logged out'});
});

benutzer.post("/", authorization.optional, (req: CustomRequest, res: Response, next: NextFunction) => {
  const { username, email, password } = req.body;

  const benutzer: BenutzerDocument = new Benutzer();

  benutzer.username = username;
  benutzer.email    = email;
  benutzer.setPassword(password);


  return benutzer.save()
  .then((benutzer) => {
    res.json(benutzer.toAuthJSON());
  })
  .catch(next);
});

benutzer.put("/", authorization.required, async (req: CustomRequest, res: Response, next: NextFunction) => {
  const { auth } = req;
  if (!auth) {
    next(new CustomError('Zugriff nicht beschränkt', 401, 'Unauthorized')); 
  }
  try {
    const { username, email, bio, image } = req.body;
    const benutzer = await Benutzer.findOne({ _id: auth!.id });
    benutzer!.username = username;
    benutzer!.email = email;
    benutzer!.bio = bio;
    benutzer!.image = image;
    await benutzer!.save();
    res.send(benutzer?.toProfileFor(null))
  } catch (err) {
    console.log(err);
    next(err);
  }
});

benutzer.delete("/", authorization.required, (req: CustomRequest, res: Response, next: NextFunction) => {
  const { auth } = req;
  if (!auth) {
    next(new CustomError('Zugriff nicht beschränkt', 401, 'Unauthorized')); 
  }
  Benutzer.deleteOne({_id: auth!.id })
  .then(() => res.sendStatus(204))
  .catch(next);
});

export default benutzer;