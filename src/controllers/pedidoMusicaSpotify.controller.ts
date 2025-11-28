import { Request, Response } from "express";
import prisma from "../database/prismaClient.js";

// 🔥 IMPORTAR broadcastFila DO SERVER
import { broadcastFila } from "../server.js";

export class PedidoMusicaSpotifyController {
  static async criarPedidoSpotify(req: Request, res: Response) {
    try {
      const { spotifyUri, title, artists, album } = req.body;

      const clienteId = Number(req.headers["cliente-id"]);
      const mesaId = Number(req.headers["mesa-id"]);

      if (!clienteId || !mesaId) {
        return res.status(400).json({ error: "Sessão inválida" });
      }

      // 1) PROCURAR MÚSICA POR spotifyId
      let music = await prisma.music.findUnique({
        where: { spotifyId: spotifyUri },
      });

      // 2) SE NÃO EXISTE, CRIAR MÚSICA
      if (!music) {
        music = await prisma.music.create({
          data: {
            spotifyId: spotifyUri,
            titulo: title,
            artista: artists,
            album: album ?? null,
          },
        });
      }

      // 3) CRIAR PEDIDO
      const pedido = await prisma.pedidoMusica.create({
        data: {
          clienteId,
          mesaId,
          musicId: music.id,
        },
      });

      // 4) DEFINIR ORDEM NA FILA
      const totalNaFila = await prisma.playbackQueue.count();

      // 5) CRIAR ENTRADA NA FILA
      const queue = await prisma.playbackQueue.create({
        data: {
          musicId: music.id,
          order: totalNaFila + 1,
          status: "NA_FILA",
        },
      });

      // 6) VINCULAR PEDIDO → QUEUE
      await prisma.pedidoMusica.update({
        where: { id: pedido.id },
        data: { queueId: queue.id },
      });

      // 🔥 7) NOTIFICAR TODOS OS CLIENTES QUE A FILA MUDOU
      broadcastFila({
        tipo: "atualizar-fila",
      });

      return res.json({
        sucesso: true,
        pedido,
        queue,
      });

    } catch (error) {
      console.error("Erro ao criar pedido Spotify:", error);
      return res.status(500).json({ error: "Erro interno no servidor" });
    }
  }
}
