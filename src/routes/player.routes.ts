// src/routes/player.routes.ts
import { Router } from "express";
import { PlayerController } from "../controllers/player.controller.js";

const router = Router();


router.get("/player/debug-prisma", PlayerController.debugPrisma);


router.get("/player/fila", PlayerController.getFila);
router.delete("/player/fila/:id", PlayerController.excluirMusica);

router.post("/player/register-device", PlayerController.registerDevice);
router.put("/player/play-current", PlayerController.playCurrent);
router.post("/player/tocar-proxima", PlayerController.tocarProxima);
router.put("/player/tocar-uri", PlayerController.tocarURI);

// rotas auxiliares (opcionais)
router.post("/player/fila/refresh", PlayerController.refreshFila);
router.post("/player/status-sync", PlayerController.statusSync);

export default router;
