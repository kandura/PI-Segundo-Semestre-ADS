import { Router } from "express";
import { SpotifyController } from "../controllers/spotify.controller.js";

const router = Router();

// 🔐 LOGIN DO SPOTIFY
router.get("/login", SpotifyController.redirectToLogin);

// 🔄 CALLBACK DO SPOTIFY
router.get("/callback", SpotifyController.callback);

// 🔍 BUSCAR MÚSICAS
router.get("/search", SpotifyController.search);

// 🎵 ADICIONAR À FILA DO PLAYER
router.post("/queue", SpotifyController.addToQueue);

export default router;