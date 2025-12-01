import { Router } from "express";
import { PedidoMusicaController } from "../controllers/pedidoMusica.controller.js";

export const pedidoMusicaRouter = Router();

pedidoMusicaRouter.post("/pedidos", PedidoMusicaController.criar);
pedidoMusicaRouter.get("/pedidos", PedidoMusicaController.listar);
// pedidoMusicaRouter.get("/pedidos/fila", PedidoMusicaController.fila); ROTA REMOVIDA POR ENQUANTO
pedidoMusicaRouter.put("/pedidos/:id/status", PedidoMusicaController.atualizarStatus);

export default pedidoMusicaRouter;