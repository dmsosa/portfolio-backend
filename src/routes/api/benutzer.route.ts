import { NextFunction, Request, Response, Router } from "express";
import { deleteBenutzer, getBenutzer, postBenutzer, putBenutzer } from "../../controller/benutzer.controller";
import { IBenutzer } from "../../model/benutzer.model";
import passport from "passport";

const benutzer = Router();
benutzer.use(( req: Request, res: Response, next: NextFunction) => {
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
benutzer.post("/", postBenutzer);
benutzer.get("/:user", getBenutzer);
benutzer.put("/:user", putBenutzer);
benutzer.delete("/:user", deleteBenutzer);

export default benutzer;