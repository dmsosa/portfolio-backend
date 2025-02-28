//BENUTZER ROUTER FUR: Login, Registrierung und Griffen des aktuell Benutzer

//LOGIN: Wenn POST Anfrag zu /login Endpunkt gunstig ist, dann BenutzerInfo mit JWT Token als Antwort zu geben.
//BenutzerInfo ist ein Interface der Benutzer aber mit ein JWT Token aber kein Followers oder Favorite Artikeln.

import { NextFunction, Request, Response, Router } from "express";
import { deleteBenutzer, getBenutzer, postBenutzer, putBenutzer } from "../../controller/benutzer.controller";

import passport from "passport";
import { FieldError } from "../../helpers/customErrors";
import { IBenutzer } from "../../interfaces/benutzer.interfaces";

const benutzer = Router();
benutzer.get("/", getBenutzer);
benutzer.post("/login", (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body;
    if (!username) {
        throw new FieldError("Benutzer", " username darf nicht null sein");
    }
    if (!password) {
        throw new FieldError("Benutzer", " password darf nicht null sein");
    }
    passport.authenticate('local', { session: false }, (err: Error, user: IBenutzer, info: object) => {
        if (err) {
          return next(err);
        }
    
        if (user) {
            req.user = user;
            next();
        } else {
          return res.status(422).json(info);
        }
      })(req, res, next);
});

benutzer.get("/:user", getBenutzer);


benutzer.post("/", postBenutzer);
benutzer.put("/:user", putBenutzer);
benutzer.delete("/:user", deleteBenutzer);

export default benutzer;