import { NextFunction, Request, Response } from "express";
import Benutzer, { BenutzerDocument } from "../database/models/benutzer.model";
import { NotFoundError } from "../helpers/customErrors";


export async function getBenutzer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { username } = await req.params;
        const benutzer = await Benutzer.findOne<BenutzerDocument>({ username });
        if (!benutzer) {
            throw new NotFoundError("Benutzer");
        }
        res.json(benutzer);
    } catch (error: unknown) {
        next(error);
    }
}
export async function postBenutzer(req: Request, res: Response, next: NextFunction): Promise<void> {

    try {
        const { username, email, password } = req.body;
        const user = await Benutzer.create({username, email, password});
        await user.setPassword(password);
        res.json({user});
    } catch (err: unknown) {
        next(err);
    }


}
export async function putBenutzer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { user } = req.params;
        const { username, email, password } = req.body;
        const benutzer = await Benutzer.findOne({ username: user });
        if (!benutzer) {
            res.status(404).json(new NotFoundError("Benutzer").message)
        };

        if (username !== undefined) {
            benutzer!.username = username;
        }
        if (email !== undefined) {
            benutzer!.email = email;
        }
        if (password !== undefined) {
            benutzer!.password = password;
        }

        res.json(benutzer);
    } catch (error: unknown) {
        next(error);
    }
}
export async function deleteBenutzer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { username } = req.params;
        const benutzer = await Benutzer.findOne({ username });

        if (!benutzer) {
            res.status(404).json(new NotFoundError("Benutzer").message)
        };
        
        await benutzer!.deleteOne();
        res.sendStatus(204);
    } catch (error: unknown) {
        next(error);
    }
}
