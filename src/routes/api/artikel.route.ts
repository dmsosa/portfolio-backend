import { Router } from 'express';
import { allArtikel, deleteArtikel, getArtikel, postArtikel, putArtikel } from '../../controller/artikel.controller';

const artikel = Router();

artikel.get("/", allArtikel);
artikel.post("/", postArtikel)
artikel.get("/:slug", getArtikel)
artikel.put("/:slug", putArtikel)
artikel.delete("/:slug", deleteArtikel)

export default artikel;