import { Router } from "express";
import { allBenutzer, deleteBenutzer, getBenutzer, postBenutzer, putBenutzer } from "../../controller/benutzer.controller";

const benutzer = Router();

benutzer.get("/", allBenutzer);
benutzer.post("/", postBenutzer);
benutzer.get("/:user", getBenutzer);
benutzer.put("/:user", putBenutzer);
benutzer.delete("/:user", deleteBenutzer);

export default benutzer;