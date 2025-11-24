import { Router } from "express";
import { ModeradorController } from "../controllers/moderador.controller";

const router = Router();
const controller = new ModeradorController();

// remover música da fila
router.delete("/fila/:id", controller.removerMusica);

// histórico do chat
router.get("/chat/historico", controller.verHistorico);

export { router as moderadorRoutes };

