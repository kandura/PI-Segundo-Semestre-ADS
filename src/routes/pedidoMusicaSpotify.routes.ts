import { Router } from "express";
import { PedidoMusicaSpotifyController } from "../controllers/pedidoMusicaSpotify.controller.js";

const router = Router();

router.post("/spotify", PedidoMusicaSpotifyController.criarPedidoSpotify);

export default router;