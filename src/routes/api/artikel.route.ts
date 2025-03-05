import { NextFunction,  Response, Router } from 'express';
import { CustomRequest } from '../../interfaces/express';
import Artikel from '../../database/models/artikel.model';
import { CustomError, NotFoundError } from '../../helpers/customErrors';
import { authorization } from '../../middleware/authorization';
import { ArtikelDocument, IPopulatedArtikel } from '../../interfaces/artikel.interfaces';
import Benutzer from '../../database/models/benutzer.model';
// import Benutzer from '../../database/models/benutzer.model';

const artikel = Router();

artikel.param("slug", (req: CustomRequest, res: Response, next: NextFunction, slug: string) => {
    Artikel.findOne({ slug })
    .populate<Pick<IPopulatedArtikel, 'author'>>('author')
    .then((artikel) => {
        if (!artikel) {
            next(new NotFoundError('Artikel', `mit slug: '${slug}'`)); 
        } else {
            req.artikel = artikel;
            next();
        }

    })
    .catch(next);
});

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
    // const auth = req.auth as JwtPayload;
    const artikel = req.artikel as ArtikelDocument;
    const { title, body, description, tags }: { title: string, body: string, description: string, tags: string} = req.body;
    Benutzer.findOne({ username: "root" })
    .then((benutzer) => {
        if (!benutzer) {
            throw new CustomError("Du bist nicht der Author dieses Artikel!", 403, "Unauthorized Error"); 
        } else {
            const updated = artikel!.updateWith({ title, body, description, tags });
            updated?.save().then(() => res.json(updated.toJSONFor(benutzer))).catch(next)
        }
    })
})
artikel.delete("/:slug",  authorization.optional, (req: CustomRequest, res: Response, next: NextFunction) => {
    const {  auth } = req;
    const artikel = req.artikel as ArtikelDocument;
    if (!auth) {
        throw new CustomError("Unauthorized", 403, "Unauthorized Error");
    } else {
        if (artikel!.author!.id !== auth!.id) {
            throw new CustomError("Du bist nicht der Author dieses Artikel!", 403, "Unauthorized Error"); 
        } else {
            artikel!.deleteOne()
            .then(() => res.sendStatus(204))
            .catch(next);
        }
    }
})

export default artikel;