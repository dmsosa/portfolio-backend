// import { NextFunction, Request, Response, Router } from "express";
// import { deleteBenutzer, putBenutzer } from "../../controller/benutzer.controller";
// import { authorization } from "../../middleware/authentication";
// import Benutzer from "../../database/models/benutzer.model";
// import { CustomRequest } from "../../interfaces/express";

// const benutzer = Router();

// benutzer.param("username",  (req: CustomRequest, res: Response, next: NextFunction, username: string) => {
//     Benutzer.findOne({ username }).then((benutzer) => {
//         req.profile = benutzer;
//         return next();
//     }).catch(next);
// })

// benutzer.get("/:username", authorization.optional, (req: Request, res: Response, next: NextFunction) => {
//     const { username, password } = req.body;
//     if (!username) {
//         throw new FieldError("Benutzer", " username darf nicht null sein");
//     }
//     if (!password) {
//         throw new FieldError("Benutzer", " password darf nicht null sein");
//     }
//     passport.authenticate('local', { session: false }, (err: Error, user: IBenutzer, info: object) => {
//         if (err) {
//           return next(err);
//         }
    
//         if (user) {
//             req.user = user;
//             next();
//         } else {
//           return res.status(422).json(info);
//         }
//       })(req, res, next);
// });
// benutzer.post("/:username/follow", putBenutzer);
// benutzer.delete("/:username/follow", deleteBenutzer);

// export default benutzer;