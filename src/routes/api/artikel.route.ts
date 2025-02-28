import { NextFunction, Request, Response, Router } from 'express';
import {  deleteArtikel, getArtikel, postArtikel, putArtikel } from '../../controller/artikel.controller';
import { authentication } from '../../middleware/authentication';
import Benutzer from '../../database/models/benutzer.model';

const artikel = Router();

artikel.get("/", authentication.optional, async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.authInfo);
    const benutzer = await Benutzer.find({});
    res.json(benutzer);
    next();

});
artikel.post("/", postArtikel)
artikel.get("/:slug", getArtikel)
artikel.put("/:slug", putArtikel)
artikel.delete("/:slug", deleteArtikel)

export default artikel;