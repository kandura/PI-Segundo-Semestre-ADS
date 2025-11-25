import { Router } from "express";
import { ModeradorController } from "../controllers/moderador.controller.js";

const router = Router();

router.post("/register", ModeradorController.register);
router.post("/login", ModeradorController.login);

export default router;

