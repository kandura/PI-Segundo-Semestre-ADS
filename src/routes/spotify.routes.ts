// src/routes/spotify.routes.ts
import { Router } from "express";
import { SpotifyController } from "../controllers/spotify.controller.js";

const router = Router();

/**
 * LOGIN SPOTIFY (para moderador)
 */
router.get("/login", SpotifyController.redirectToLogin);

/**
 * CALLBACK DO SPOTIFY
 */
router.get("/callback", SpotifyController.callback);

/**
 * TOKEN PARA WEB PLAYBACK SDK DO MODERADOR
 */
router.get("/token", SpotifyController.token);

/**
 * BUSCA SPOTIFY (cliente)
 */
router.get("/search", SpotifyController.search);

export default router;
