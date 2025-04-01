import { NextFunction, Response, Router } from "express";
import { authorization } from "../../middleware/authorization";
import Benutzer from "../../database/models/benutzer.model";
import { CustomRequest } from "../../interfaces/express";
import { NotFoundError } from "../../helpers/customErrors";

const profiles = Router();

profiles.param("username",  (req: CustomRequest, res: Response, next: NextFunction, username: string) => {
    Benutzer.findOne({ username }).then((benutzer) => {
        if (!benutzer) {
            next(new NotFoundError('Benutzer', `mit username: '${username}'`)); 
        } else {
            req.profile = benutzer;
            next();
        }
    }).catch(next);
})

profiles.get("/:username", authorization.optional, (req: CustomRequest, res: Response, next: NextFunction) => {
    const { auth, profile } = req;
    if (auth) {
        Benutzer.findById(auth.id)
        .then((benutzer) => {
            return res.json(profile?.toProfileFor(benutzer));
        })
        .catch(next);
    } else {
        return res.json(profile?.toProfileFor(null));
    }
});
profiles.post("/:username/follow", authorization.required, (req: CustomRequest, res: Response, next: NextFunction) => {
    const { auth, profile } = req;
    Benutzer.findById(auth?.id)
        .then((benutzer) => {
            return benutzer?.follow(profile?.id).then(() => {
                return res.json(profile?.toProfileFor(benutzer));
            })
        })
        .catch(next);
});

profiles.delete("/:username/follow", authorization.required, (req: CustomRequest, res: Response, next: NextFunction) => {
    const { auth, profile } = req;
    Benutzer.findById(auth?.id)
        .then((benutzer) => {
            return benutzer?.unfollow(profile?.id).then(() => {
                return res.json(profile?.toProfileFor(benutzer));
            })
        })
        .catch(next);
});

export default profiles;