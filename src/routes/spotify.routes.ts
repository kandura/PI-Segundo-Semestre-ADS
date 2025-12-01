import { Router } from "express";
import { SpotifyController } from "../controllers/spotify.controller.js";

const router = Router();

// login / callback / token etc...
router.get("/spotify/login", SpotifyController.redirectToLogin);
router.get("/spotify/callback", SpotifyController.callback);
router.get("/spotify/token", SpotifyController.token);

// busca livre
router.get("/spotify/search", SpotifyController.search);

// buscar faixas de uma playlist específica
router.get("/spotify/playlist/:playlistId", SpotifyController.getPlaylistTracks);

export default router;
