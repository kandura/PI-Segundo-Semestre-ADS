import { Router } from "express";
import { PlayerController } from "../controllers/player.controller.js";

const router = Router();

router.post("/player/tocar-proxima", PlayerController.tocarProxima);

export default router;
