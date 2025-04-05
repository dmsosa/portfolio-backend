import { NextFunction, Response, Router } from "express";
import { authorization } from "../../middleware/authorization";
import Benutzer from "../../database/models/benutzer.model";
import { CustomRequest } from "../../interfaces/express";
import { NotFoundError } from "../../helpers/customErrors";
import { Types } from "mongoose";

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

profiles.get("/", authorization.optional, (req: CustomRequest, res: Response, next: NextFunction) => {
    const { auth, query } = req;
    const findQuery: {
        _id?: { $in: Array<Types.ObjectId> },
        following?: Types.ObjectId
    } = {};
    let limit = 3;
    let offset = 0;
    if (query.limit) {
        limit = parseInt(query.limit as string);
    }
    if (query.offset) {
        offset = parseInt(query.offset as string);
    }

    //following oder feed: return from ALL if ID included in benutzer.following
    //followers: return from ALL if following includes benutzer.id
    //query  bauen
    //1. bei follower (aba Feed) (Alle Benutzer deren, gefolgt bei X sind)
    //2. bei following  (Alle Benutzer deren, X folgen)
    //query = feed: string, following: string 
    //bei Id finden, query ist: Benutzer.find({ id }).then(res.json(benutzer.following.map(Benutzer.findById().then().toProfileFor(benutzer))))
    //author.getFollowers = return Benutzer.find({ followers }) ({ following: { $in: [id]}})
    //author.getFollowing = return this.populate.following
    // feed return 
    //queriedBenutzer = Benutzer.findOne({ username: query.feed or query.followers })
    //alleBenutzer.find({ id in queried.following OR following: queried.Id })
    
    Promise.all([
        Benutzer.findById(auth?.id),
        query.feed ? Benutzer.findOne({ username: query.feed }) : query.followers ? Benutzer.findOne({ username: query.followers }) : null
    ]).then((results) => {
        const loggedBenutzer = results[0];
        const queriedBenutzer = results[1];
        
        if (query.feed && queriedBenutzer) {
            findQuery._id = { $in: queriedBenutzer!.following ? queriedBenutzer!.following : [] };
        }
        if (query.followers && queriedBenutzer) {
            findQuery.following = queriedBenutzer!._id;
        }
        Promise.all([
            Benutzer.countDocuments(findQuery),
            Benutzer.find(findQuery).limit(limit).skip(offset)
        ])
        .then((results) => {
            const benutzerCount = results[0];
            const benutzerArray = results[1];
            res.json({ benutzerCount, benutzerArray: benutzerArray.map((b) => b.toProfileFor(loggedBenutzer ? loggedBenutzer : null))});
        })
    })
    .catch(next);
});
// profiles.get("/feed", authorization.optional, (req: CustomRequest, res: Response, next: NextFunction) => {
//     const { auth, query } = req;
//     //finden alle die Nutzern, die X folgt.
//     //Oder vielleicht alles finden, ob sein Id im  following ist?
//     let limit = 3;
//     let offset = 0;
//     if (query.limit) {
//         limit = parseInt(query.limit as string);
//     }
//     if (query.offset) {
//         offset = parseInt(query.offset as string);
//     }
//     Promise.all([
//         Benutzer.findById(auth?.id).populate("following"),
//         Benutzer.countDocuments(),
//     ]).then((results) => {
//         const benutzer = results[0];
//         const benutzerCount = results[1];
        
//         res.json({ benutzerCount, benutzerArray: benutzer!.following ? benutzer!.following.map((b) => b.toProfileFor(benutzer ? benutzer : null)) : []});
//     })
//     .catch(next);
// });


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