import { Router } from "express";
import { SpotifyController } from "../controllers/spotify.controller.js";

const router = Router();

router.get("/spotify/login",    SpotifyController.redirectToLogin);
router.get("/spotify/callback", SpotifyController.callback);
router.get("/spotify/token",    SpotifyController.token);
router.get("/spotify/search",   SpotifyController.search);
router.get("/spotify/playlist/:id", SpotifyController.playlist);

export default router;
