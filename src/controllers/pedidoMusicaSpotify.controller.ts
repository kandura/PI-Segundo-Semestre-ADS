// src/controllers/pedidoMusicaSpotify.controller.ts

import { Request, Response } from "express";
import prisma from "../database/prismaClient.js";
import { broadcastFila } from "../server.js";

export class PedidoMusicaSpotifyController {
  /**
   * Adiciona música na fila oficial do sistema
   * POST /pedido-musica/queue
   */
  static async adicionarFila(req: Request, res: Response) {
    try {
      const {
        spotifyId,
        spotifyUri,
        title,
        artists,
        album,
        coverUrl,
        mesaId,
        clienteNome
      } = req.body;

      if (!spotifyId || !spotifyUri || !mesaId || !clienteNome) {
        return res.status(400).json({
          error: "Dados incompletos para criar o pedido",
        });
      }

      // 1) Cliente
      let cliente = await prisma.cliente.findFirst({
        where: { nome: clienteNome },
      });

      if (!cliente) {
        cliente = await prisma.cliente.create({
          data: { nome: clienteNome },
        });
      }

      // 2) Música
      let music = await prisma.music.findUnique({
        where: { spotifyId },
      });

      if (!music) {
        music = await prisma.music.create({
          data: {
            spotifyId,
            titulo: title,
            artista: artists,
            album: album ?? null,
            coverUrl: coverUrl ?? null,
          },
        });
      }

      // 3) Criar Pedido de Música
      const pedido = await prisma.pedidoMusica.create({
        data: {
          clienteId: cliente.id,
          mesaId: Number(mesaId),
          musicId: music.id,
          status: "APROVADO", // pedido já entrou na fila
        },
      });

      // 4) Calcular a nova posição na fila
      const totalNaFila = await prisma.playbackQueue.count({
        where: { status: "NA_FILA" },
      });

      // 5) Criar entrada na PlaybackQueue
      const queue = await prisma.playbackQueue.create({
        data: {
          musicId: music.id,
          order: totalNaFila + 1,
          status: "NA_FILA",
        },
      });

      // 6) Atualizar pedido → vincular queueId
      await prisma.pedidoMusica.update({
        where: { id: pedido.id },
        data: { queueId: queue.id },
      });

      // 7) Buscar fila atualizada para enviar via WebSocket
      const filaAtualizada = await prisma.playbackQueue.findMany({
        where: { status: "NA_FILA" },
        orderBy: { order: "asc" },
        include: {
          music: true,
          pedido: {
            include: { cliente: true },
          },
        },
      });

      // 8) Broadcast da nova fila
      broadcastFila({
        tipo: "atualizar-fila",
        fila: filaAtualizada,
      });

      return res.json({
        sucesso: true,
        pedido,
        queue,
      });

    } catch (error) {
      console.error("❌ Erro ao adicionar música via Spotify:", error);
      return res.status(500).json({
        error: "Erro interno ao adicionar música",
      });
    }
  }
}
