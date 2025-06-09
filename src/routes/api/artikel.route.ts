import { NextFunction,  Response, Router } from 'express';
import { CustomRequest } from '../../interfaces/express';
import Artikel from '../../database/models/artikel.model';
import { CustomError, NotFoundError } from '../../helpers/customErrors';
import { authorization } from '../../middleware/authorization';
import { ArtikelDocument, ArtikelPopulatedDocument, IPopulatedArtikel } from '../../interfaces/artikel.interfaces';
import Benutzer from '../../database/models/benutzer.model';
import { Types } from 'mongoose';
import Komment from '../../database/models/komment.model';
import { IPopulatedKomment, KommentPopulatedDocument } from '../../interfaces/komment.interfaces';
// import Benutzer from '../../database/models/benutzer.model';

const artikel = Router();

artikel.param("slug", (req: CustomRequest, res: Response, next: NextFunction, slug: string) => {
    Artikel.findOne({ slug })
    .populate<Pick<IPopulatedArtikel, 'author'>>('author')
    .then((artikel) => {
        if (!artikel) {
            next(new NotFoundError('Artikel', `mit slug: '${slug}'`)); 
        } else {
            req.artikel = artikel as ArtikelPopulatedDocument;
            next();
        }

    })
    .catch(next);
});
artikel.param("kommentId", (req: CustomRequest, res: Response, next: NextFunction, kommentId: string) => {
    Komment.findById(kommentId )
    .populate<Pick<IPopulatedArtikel, 'author'>>('author')
    .then((komment) => {
        if (!komment) {
            next(new NotFoundError('Komment', `mit id: '${kommentId}'`)); 
        } else {
            req.komment = komment as KommentPopulatedDocument;
            next();
        }

    })
    .catch(next);
});
artikel.get("/",  authorization.optional, (req: CustomRequest, res: Response, next: NextFunction) => {
    const { auth, query } = req;

    const findQuery: { 
        author?: Types.ObjectId, 
        _id?: { $in: Types.Array<Types.ObjectId> },
        tags?: { $all: string[] },
    } = {};
    let limit: number = 3;
    let offset: number = 0;
    if (query.limit) {
        limit = parseInt(query.limit as string);
    }
    if (query.offset) {
        offset = parseInt(query.offset as string) * limit;
    }
    if (query.tags) {
        const tags = query.tags as string;
        findQuery.tags = { $all: tags.split(",") };
    }

    Promise.all([
        query.author ? Benutzer.findOne({ username: query.author }) : null,
        query.favoriter ? Benutzer.findOne({ username: query.favoriter }) : null,
    ])
    .then((results) => {
        const author = results[0];
        const favoriter = results[1];

        if (author) {
            findQuery.author = author._id;
        }
        if (favoriter) {
            findQuery._id = {$in: favoriter.favorites! };
        }
        Promise.all([ 
            auth ? Benutzer.findOne({ _id: auth.id }) : null, 
            Artikel.countDocuments(findQuery), 
            Artikel.find(findQuery)
            .skip(offset)
            .limit(limit)
            .populate<Pick<IPopulatedArtikel, 'author'>>('author')
        ])
        .then((results) => {
            const benutzer = results[0];
            const artikelnAnzahl = results[1];
            const artikeln = results[2];
            res.json({ artikelnAnzahl: artikelnAnzahl, artikeln: artikeln.map((art) => art.toJSONFor(benutzer))});
        })
        .catch(next);
    })
    .catch(next);
    
})
artikel.get("/feed",  authorization.required, (req: CustomRequest, res: Response, next: NextFunction) => {
    const { auth, query } = req;

    const findQuery: { 
        author?: { $in: Types.Array<Types.ObjectId> }, 
        tags?: { $all: string[] },
    } = {};
    let limit: number = 3;
    let offset: number = 0;
    if (query.limit) {
        limit = parseInt(query.limit as string);
    }
    if (query.offset) {
        offset = parseInt(query.offset as string) * limit;
    }
    if (query.tags) {
        const tags = query.tags as string;
        findQuery.tags = { $all: tags.split(",") };
    }

    Promise.all([ 
        Benutzer.findOne({ _id: auth!.id }), 
        Artikel.countDocuments(findQuery)
    ])
    .then((results) => {
        const benutzer = results[0];
        const artikelnAnzahl = results[1];
        const following = benutzer?.following;
        findQuery.author = { $in: following! };
        Artikel.find(findQuery)
        .limit(limit)
        .skip(offset)
        .populate<Pick<IPopulatedArtikel, 'author'>>('author')
        .then((artikeln) => {
            res.json({ artikelnAnzahl, artikeln: artikeln.map((art) => art.toJSONFor(benutzer))});
        });
    })
    .catch(next);
})
artikel.post("/",  authorization.required, (req: CustomRequest, res: Response, next: NextFunction) => {
    const { auth } = req;
    if (!auth) {
        next(new CustomError('Zugriff nicht beschränkt', 401, 'Unauthorized')); 
    } 
    const { title, body, description, tags } = req.body;
    Benutzer.findById(auth!.id)
    .then((benutzer) => {
        if (!benutzer) {
            next(new NotFoundError('Benutzer'));
        } else {
            let tagsArray: string[] = [];
            if (tags) {
                const tagsString = tags as string;
                tagsArray = tagsString.split(',');
            }

            Artikel.create({ title, body, description, tags: tagsArray, author: benutzer.id  })
            .then((artikel) => {
                artikel.populate<Pick<IPopulatedArtikel, 'author'>>('author')
                .then((populatedArtikel) => res.json(populatedArtikel.toJSONFor(benutzer)));
            })
            .catch(next);
        }
        //erstellen mit author
        
    });
})
artikel.get("/:slug",  authorization.optional, (req: CustomRequest, res: Response, next: NextFunction) => {
    const {  auth } = req;
    const artikel = req.artikel as ArtikelDocument;
    if (!auth) {
        return res.json(artikel!.toJSONFor(null));
    } else {
        Benutzer.findOne({ _id: auth.id })
        .then((benutzer) => {
            return res.json(artikel!.toJSONFor(benutzer));
        })
        .catch(next);
    }
})
artikel.put("/:slug",  authorization.required, async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { auth, artikel } = req;
    const { slug } = req.params;
    if (!artikel) {
        next(new NotFoundError('Artikel', `mit slug: '${slug}'`)); 
    } 
    // if (auth!.id !== artikel!.author!._id.toString()) {
    //     next(new CustomError('Zugriff nur für Autoren beschränkt', 401, 'Unauthorized')); 
    // }
    try {
        const { title, body, description, tags } = req.body;
        // const updated =  await artikel!.updateOne({ title, body, description, tags });
        // console.log(updated)
        // res.json(updated);
        artikel!.title = title;
        artikel!.body = body;
        artikel!.description = description;
        artikel!.tags = tags;
        await artikel?.save();
        res.json(artikel?.toJSONFor(null));
    } catch (error) {
        next(error);
    }
    
})
artikel.delete("/:slug",  authorization.required, (req: CustomRequest, res: Response, next: NextFunction) => {
    const {  auth } = req;
    const artikel = req.artikel as ArtikelPopulatedDocument;
    if (!auth) {
        throw new CustomError("Unauthorized", 403, "Unauthorized Error");
    } else {
        if (artikel!.author!._id.toString() !== auth!.id) {
            throw new CustomError("Du bist nicht der Author dieses Artikel!", 403, "Unauthorized Error"); 
        } else {
            artikel!.deleteOne()
            .then(() => res.sendStatus(204))
            .catch(next);
        }
    }
})
artikel.post("/fav/:slug",  authorization.required, (req: CustomRequest, res: Response, next: NextFunction) => {
    const {  auth } = req;
    const artikel = req.artikel as ArtikelPopulatedDocument;
    if (!auth) {
        throw new CustomError("Unauthorized", 403, "Unauthorized Error");
    } else {
        Benutzer.findById(auth!.id)
        .then((benutzer) => {
            artikel!.addFavorite(benutzer!._id)
            .then((artikel) => res.json(artikel?.toJSONFor(benutzer)));
        })
        .catch(next);
    }
})
artikel.delete("/fav/:slug",  authorization.required, (req: CustomRequest, res: Response, next: NextFunction) => {
    const {  auth } = req;
    const artikel = req.artikel as ArtikelPopulatedDocument;
    if (!auth) {
        throw new CustomError("Unauthorized", 403, "Unauthorized Error");
    } else {
        Benutzer.findById(auth!.id)
        .then((benutzer) => {
            artikel!.removeFavorite(benutzer!._id)
            .then((artikel) => res.json(artikel?.toJSONFor(benutzer)));
        })
        .catch(next);
    }
})
artikel.get("/komment/:slug", authorization.optional, (req: CustomRequest, res: Response, next: NextFunction) => {
    const { auth } = req;
    const artikel = req.artikel as ArtikelPopulatedDocument;
    let limit: number = 0;
    let offset: number = 0;
    if (req.query.limit) {
        limit = parseInt(req.query.limit as string);
    }
    if (req.query.offset) {
        offset = parseInt(req.query.offset as string) * limit;
    }
    //Artikel greifen
    Promise.all([
        Benutzer.findById(auth?.id),
        Komment.find({ artikel: artikel!._id })
        .limit(limit).skip(offset)
        .sort({ createdAt: -1 })
        .populate("author")
    ]).then((results) => {
        const benutzer = results[0];
        const kommentArray = results[1];

        res.json({ kommentAnzahl: kommentArray.length, kommentArray: kommentArray.map((komment) => komment.toJSONFor(benutzer))})
    })
    .catch(next);
})
artikel.post("/komment/:slug", authorization.required, async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { auth } = req;
    const { body } = req.body;
    const artikel = req.artikel as ArtikelPopulatedDocument;
    try {
        const benutzer = await Benutzer.findById(auth?.id);
        if (!benutzer) {
            res.send(new CustomError("Unauthorisierung", 401))
        }
        const komment = new Komment({ artikel: artikel?._id, author: benutzer?.id, body: body });
        const populatedKomment = await komment.save().then((savedKomment) => savedKomment.populate<Pick<IPopulatedKomment, 'author'>>('author'));
        artikel?.kommentar.push(komment);
        artikel?.save();
        res.send(populatedKomment.toJSONFor(benutzer));

    } catch (error) {
        next(error);
    }
})
artikel.put("/komment/:slug/:kommentId", authorization.required, async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { auth } = req;
    const { body } = req.body;
    const komment = req.komment as KommentPopulatedDocument;
    try {
        const benutzer = await Benutzer.findById(auth?.id);
        if (!benutzer) {
            res.send(new CustomError("Unauthorisierung", 401))
        } else if (benutzer?.username !== komment?.author.username) {
            res.send(new CustomError("You must be the author of this article!", 403, "Forbidden Error"))
        }
        komment!.body = body;
        const populatedKomment = await komment!.save().then((savedKomment) => savedKomment.populate<Pick<IPopulatedKomment, 'author'>>('author'));
        res.json(populatedKomment.toJSONFor(benutzer))

    } catch (error) {
        next(error);
    }
})
artikel.delete("/komment/:slug/:kommentId", authorization.optional, async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { auth } = req;
    const { author } = req.body;
    const artikel = req.artikel as ArtikelPopulatedDocument;
    const komment = req.komment as KommentPopulatedDocument;

    try {
        const benutzer = await Benutzer.findById(auth?.id);
        if (!benutzer) {
            res.send(new CustomError("Unauthorisierung", 401))
        } else if (!benutzer?.username !== author) {
            res.send(new CustomError("You must be the author of this article!", 403, "Forbidden Error"))
        }
        komment!.deleteOne();
        artikel?.kommentar.remove(komment?.id);
        artikel?.save();
        res.status(204);

    } catch (error) {
        next(error);
    }
})

export default artikel;