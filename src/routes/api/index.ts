import { Router } from "express";
import artikel from "./artikel.route";
import benutzer from "./benutzer.route";
import profiles from "./profiles.route";

const router = Router();
router.use("/artikel", artikel);
router.use("/benutzer", benutzer);
router.use("/profiles", profiles);
export default router;