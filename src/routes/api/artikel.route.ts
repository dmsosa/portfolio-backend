import { NextFunction,  Response, Router } from 'express';
import { CustomRequest } from '../../interfaces/express';
import Artikel from '../../database/models/artikel.model';
import { CustomError, NotFoundError } from '../../helpers/customErrors';
import { authorization } from '../../middleware/authorization';
import { ArtikelDocument, ArtikelPopulatedDocument, IPopulatedArtikel } from '../../interfaces/artikel.interfaces';
import Benutzer from '../../database/models/benutzer.model';
import { Types } from 'mongoose';
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
        console.log(query);
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
            res.json({ artikelnAnzahl: artikelnAnzahl, artikeln: artikeln.map((art) => art.toJSONFor(benutzer))});
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
            console.log(auth, benutzer)
            next(new NotFoundError('Benutzer'));
        } else {
            Artikel.create({ title, body, description, tags, author: benutzer.id  })
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
artikel.put("/:slug",  authorization.required, (req: CustomRequest, res: Response, next: NextFunction) => {
    const { auth, artikel } = req;
    const { slug } = req.params;
    if (!artikel) {
        next(new NotFoundError('Artikel', `mit slug: '${slug}'`)); 
    } 
    console.log(auth);
    // if (auth!.id !== artikel!.author!._id.toString()) {
    //     next(new CustomError('Zugriff nur für Autoren beschränkt', 401, 'Unauthorized')); 
    // }
    const { title, body, description, tags } = req.body;
    const updated = artikel!.updateWith({ title, body, description, tags });
    updated!.save()
    .then(() => res.json(updated?.toJSONFor(null)))
    .catch(next);
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
            console.log(artikel?.isFavorite(benutzer!._id));
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
            console.log(artikel?.isFavorite(benutzer!._id));
            artikel!.removeFavorite(benutzer!._id)
            .then((artikel) => res.json(artikel?.toJSONFor(benutzer)));
        })
        .catch(next);
    }
})


export default artikel;