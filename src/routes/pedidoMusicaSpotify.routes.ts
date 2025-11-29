import { Router } from "express";
import { PedidoMusicaSpotifyController } from "../controllers/pedidoMusicaSpotify.controller.js";

const router = Router();

// ROTA OFICIAL PARA ADICIONAR MÚSICA À FILA
// endpoint final → POST /pedido-musica/queue
router.post("/queue", PedidoMusicaSpotifyController.adicionarFila);

export default router;