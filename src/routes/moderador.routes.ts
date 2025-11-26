import { Router } from "express";
import { ModeradorController } from "../controllers/moderador.controller.js";

const router = Router();

// Login e registro
router.post("/register", ModeradorController.register);
router.post("/login", ModeradorController.login);

// Fila — funções do moderador
router.get("/fila", ModeradorController.listarFila);
router.put("/frente/:id", ModeradorController.colocarNaFrente);
router.delete("/remover/:id", ModeradorController.removerDaFila);

export default router;


