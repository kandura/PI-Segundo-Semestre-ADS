import { Router } from "express";
import { PedidoMusicaSpotifyController } from "../controllers/pedidoMusicaSpotify.controller.js";

const router = Router();

router.post("/queue", PedidoMusicaSpotifyController.adicionarFila);

export default router;