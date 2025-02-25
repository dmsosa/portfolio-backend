import { NextFunction, Request, Response } from "express";
import Artikel, { ArtikelDocument } from "../model/artikel.model";
import { AlreadyExistsError, NotFoundError } from "../helpers/customErrors";
import Benutzer from "../model/benutzer.model";

export async function allArtikel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const artikeln = await Artikel.find();
        res.json(artikeln)
    } catch( error: unknown ){
        next(error);
    }
}
export async function postArtikel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { body } = req;
        const { title, description, content, author } = body

        const authorFound = await Benutzer.findOne({ username: author });
        if (!authorFound) {
            throw new NotFoundError("Author", " for article, and is a required field.");
        };
        const artikelExists = await Artikel.findOne({ title });
        if (artikelExists) {
            throw new AlreadyExistsError("Artikel", `with title: ${title}`);
        };

        const artikel = await Artikel.create({ title, description, content, author: authorFound._id });
        await artikel.save();
        res.json(  artikel)
    } catch( error: unknown ){
        next(error);
    }
}
export async function getArtikel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { slug } = req.params;

        const artikel = await Artikel.findOne({ slug });
        if (!artikel) {
            res.status(404).json(new NotFoundError("Artikel").message)
        };

        res.status(200).json(artikel);

    } catch( error: unknown ){
        next(error);
    }
}
export async function putArtikel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { slug } = req.params;

        const artikel = await Artikel.findOne<ArtikelDocument>({ slug });

        if (!artikel) {
            res.status(404).json(new NotFoundError("Artikel").message)
        };
        
        const { title, description, content } = req.body;

        if (title !== undefined ) {
            artikel!.title = title;
        }
        if (description !== undefined ) {
            artikel!.description = description;
        }
        if (content !== undefined ) {
            artikel!.content = content;
        }

        await artikel!.save({ validateModifiedOnly: true });
        res.json(artikel);

    } catch( error: unknown ){
        next(error);
    }
}
export async function deleteArtikel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { slug } = req.params;

        const artikel = await Artikel.findOne<ArtikelDocument>({ slug });

        if (!artikel) {
            res.status(404).json(new NotFoundError("Artikel").message)
        };
        
        await artikel!.deleteOne();
        res.sendStatus(204);
    } catch( error: unknown ){
        next(error);
    }
}
