import { Router } from "express";
import { SessaoClienteController } from "../controllers/sessao.cliente.controller.js";

const sessaoRoutes = Router();
const controller = new SessaoClienteController();

// POST /sessions/entrar
sessaoRoutes.post("/sessions/entrar", (req, res) =>
  controller.abrirSessao(req, res)
);

export { sessaoRoutes };
