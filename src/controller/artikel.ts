import { NextFunction, Request, Response } from "express";
import Artikel from "../model/artikel";

export async function getArtikel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        res.json({hallo: "welt"})
    } catch( error: unknown ){
        next(error);
    }
}
export async function postArtikel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { body } = req;
        const artikel = await Artikel.create({...body, body:"ww"});
        await artikel.save();
        res.json(  Artikel.findOne({body: "bodyy"}))
    } catch( error: unknown ){
        next(error);
    }
}
