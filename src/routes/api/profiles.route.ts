import { Router } from "express";
import { allBenutzer, deleteBenutzer, getBenutzer, postBenutzer, putBenutzer } from "../../controller/benutzer.controller";
import passport from "passport";

const benutzer = Router();

benutzer.post("/login", passport.authenticate("local"));
benutzer.get("/", allBenutzer);
benutzer.post("/", postBenutzer);
benutzer.get("/:user", getBenutzer);
benutzer.put("/:user", putBenutzer);
benutzer.delete("/:user", deleteBenutzer);

export default benutzer;