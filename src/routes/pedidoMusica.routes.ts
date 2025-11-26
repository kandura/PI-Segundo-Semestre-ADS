import { Router } from "express";
import { PedidoMusicaController } from "../controllers/pedidoMusica.controller.js";

export const pedidoMusicaRouter = Router();

/*
   MAPEAMENTO PARA OS NOVOS NOMES DE ROTAS
   ---------------------------------------
   /pedir          → criar pedido
   /fila           → listar pedidos
   /tocarProxima   → atualizar status da próxima música
*/

// 1️⃣ Criar pedido (POST /pedir)
pedidoMusicaRouter.post(
  "/pedir",
  PedidoMusicaController.criar
);

// 2️⃣ Listar fila (GET /fila)
pedidoMusicaRouter.get(
  "/fila",
  PedidoMusicaController.listar
);

// 3️⃣ Tocar próxima música (PUT /tocarProxima)
pedidoMusicaRouter.put(
  "/tocarProxima",
  async (req, res) => {
    try {
     
      // Criamos objetos falsos para interceptar o JSON do controller.listar
      let fila: any[] = [];

      const fakeReq = {} as any;
      const fakeRes = {
        json(data: any) {
          fila = data;
          return data;
        }
      } as any;

      // Chama o listar e pega a fila
      await PedidoMusicaController.listar(fakeReq, fakeRes);

      if (!fila.length) {
        return res.status(400).json({ mensagem: "Fila vazia" });
      }

      // Pega a primeira música da fila
      const proximaMusica = fila[0];

      // Atualiza status desta música
      req.params = { id: String(proximaMusica.id) };
      req.body = { status: "tocando" };

      await PedidoMusicaController.atualizarStatus(req, res);

    } catch (error) {
      console.error(error);
      res.status(500).json({ erro: "Erro ao tocar a próxima música" });
    }
  }
);

export default pedidoMusicaRouter;