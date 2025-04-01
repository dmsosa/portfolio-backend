import { Router } from "express";
import artikel from "./artikel.route";
import benutzer from "./benutzer.route";
import profiles from "./profiles.route";
import tags from "./tags.routes";

const router = Router();
router.use("/artikel", artikel);
router.use("/benutzer", benutzer);
router.use("/profiles", profiles);
router.use("/tags", tags);
export default router;