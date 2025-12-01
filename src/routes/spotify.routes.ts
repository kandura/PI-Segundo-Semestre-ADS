import { Router } from "express";
import { SpotifyController } from "../controllers/spotify.controller.js";

const router = Router();


router.get("/login",    SpotifyController.redirectToLogin);
router.get("/callback", SpotifyController.callback);
router.get("/token",    SpotifyController.token);
router.get("/search",   SpotifyController.search);
router.get("/playlist/:id", SpotifyController.playlist);

export default router;
