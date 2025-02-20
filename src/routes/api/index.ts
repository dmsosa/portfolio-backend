import { Router } from "express";
import artikel from "./artikel";

const router = Router();
router.use("/artikel", artikel)
export default router;