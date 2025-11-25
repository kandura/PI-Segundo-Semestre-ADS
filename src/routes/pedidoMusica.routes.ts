import { Router } from "express";
import { PedidoMusicaController } from "../controllers/pedidoMusica.controller.js";

export const pedidoMusicaRouter = Router();

// Criar os pedidos
pedidoMusicaRouter.post("/pedidos", PedidoMusicaController.criar);

// Listar os pedidos 

pedidoMusicaRouter.get("/pedidos", PedidoMusicaController.listar);

// Atualiza status dos pedidos
pedidoMusicaRouter.put(
  "/pedidos/:id/status",
  PedidoMusicaController.atualizarStatus
);

export default pedidoMusicaRouter;
