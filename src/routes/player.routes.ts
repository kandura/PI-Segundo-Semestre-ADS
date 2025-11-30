// src/routes/player.routes.ts
import { Router } from "express";
import { PlayerController } from "../controllers/player.controller.js";

const router = Router();

/**
 * Rotas usadas pelo moderador-dashboard.html
 *
 * - GET  /api/player/fila               -> retorna a fila atual
 * - DELETE /api/player/fila/:id         -> exclui música da fila
 * - POST /api/player/register-device    -> registra device_id enviado pelo SDK do moderador
 * - PUT  /api/player/play-current       -> manda tocar a música atual (primeiro item da fila)
 * - POST /api/player/tocar-proxima      -> remove atual e toca a próxima da fila
 * - PUT  /api/player/tocar-uri          -> força tocar uma URI específica (obj: { uri })
 *
 * Rotas auxiliares opcionais (úteis para botões do footer):
 * - POST /api/player/fila/refresh       -> pedir backend para atualizar/recuperar fila (opcional)
 * - POST /api/player/status-sync        -> sincronizar status do player (opcional)
 *
 * OBS: garanta que PlayerController exporte os métodos estáticos abaixo:
 *  - getFila
 *  - excluirMusica
 *  - registerDevice
 *  - playCurrent
 *  - tocarProxima
 *  - tocarURI
 *  - (opcionais) refreshFila, statusSync
 */

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
