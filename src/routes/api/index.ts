import { Router } from "express";
import artikel from "./artikel.route";
import benutzer from "./benutzer.route";

const router = Router();
router.use("/artikel", artikel);
router.use("/benutzer", benutzer);
export default router;