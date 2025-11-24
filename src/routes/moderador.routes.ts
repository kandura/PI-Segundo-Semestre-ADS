import { Router } from "express";
import { ModeradorController } from "../controllers/moderador.controller.js";

const router = Router();

router.get("/fila", ModeradorController.listarFila);
router.put("/fila/:id/frente", ModeradorController.colocarNaFrente);
router.delete("/fila/:id", ModeradorController.removerMusica);

export default router;
