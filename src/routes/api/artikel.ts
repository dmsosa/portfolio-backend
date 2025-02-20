import { Router } from 'express';
import { getArtikel, postArtikel } from '../../controller/artikel';

const artikel = Router();

artikel.get("/", getArtikel);
artikel.post("/", postArtikel)

export default artikel;