import { Router } from "express";
import router from "./api";

const routes = Router();
routes.use("/api", router);

export default routes;