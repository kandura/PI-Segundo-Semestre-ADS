import { Router } from "express";
import { SessaoController } from "../controllers/sessao.controller.js";

const sessaoRoutes = Router();
const controller = new SessaoController();

sessaoRoutes.post("/api/sessions", (req, res) => controller.create(req, res));

export { sessaoRoutes };
