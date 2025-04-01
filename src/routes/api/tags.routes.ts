import { NextFunction, Request, Response, Router } from "express";
import Artikel from "../../database/models/artikel.model";

const tags = Router();

tags.get("/", (req: Request, res: Response, next: NextFunction) => {
    Artikel.find()
    .distinct('tags')
    .then((tagsArray: string[]) => res.json({ tags: tagsArray }))
    .catch(next);
})

export default tags;