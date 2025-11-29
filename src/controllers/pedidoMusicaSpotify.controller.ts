import { Request, Response } from "express";
import prisma from "../database/prismaClient.js";
import { broadcastFila } from "../server.js";

export class PedidoMusicaSpotifyController {
  /**
   * Adiciona música na fila do sistema (pedido → queue)
   * Rota: POST /pedido-musica/queue
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

      // validações básicas
      if (!spotifyId || !spotifyUri || !mesaId || !clienteNome) {
        return res.status(400).json({ error: "Dados incompletos para criar o pedido" });
      }

      // 1) Encontrar ou criar CLIENTE (nome não é único, então usamos findFirst/create)
      let cliente = await prisma.cliente.findFirst({
        where: { nome: clienteNome }
      });

      if (!cliente) {
        cliente = await prisma.cliente.create({
          data: { nome: clienteNome }
        });
      }

      // 2) Criar ou encontrar MÚSICA (spotifyId é único no schema)
      let music = await prisma.music.findUnique({
        where: { spotifyId }
      });

      if (!music) {
        music = await prisma.music.create({
          data: {
            spotifyId,
            titulo: title,
            artista: artists,
            album: album ?? null,
            coverUrl: coverUrl ?? null
          }
        });
      }

      // 3) Criar PEDIDO
      const pedido = await prisma.pedidoMusica.create({
        data: {
          clienteId: cliente.id,
          mesaId: Number(mesaId),
          musicId: music.id
        }
      });

      // 4) Calcular próxima posição na fila (apenas NA_FILA)
      const totalNaFila = await prisma.playbackQueue.count({
        where: { status: "NA_FILA" }
      });

      // 5) Criar entrada na FILA
      const queue = await prisma.playbackQueue.create({
        data: {
          musicId: music.id,
          order: totalNaFila + 1,
          status: "NA_FILA"
        }
      });

      // 6) Vincular pedido → queue (1:1)
      await prisma.pedidoMusica.update({
        where: { id: pedido.id },
        data: { queueId: queue.id }
      });

      // 7) Buscar fila COMPLETA para enviar via WebSocket
      const filaCompleta = await prisma.playbackQueue.findMany({
        orderBy: { order: "asc" },
        include: {
          music: true,
          pedido: {
            include: { cliente: true }
          }
        }
      });

      // 8) Notificar todos os clientes (moderador / clientes) que a fila mudou
      broadcastFila({
        tipo: "atualizar-fila",
        fila: filaCompleta
      });

      return res.json({
        sucesso: true,
        pedido,
        queue
      });

    } catch (error) {
      console.error("❌ Erro ao adicionar música via Spotify:", error);
      return res.status(500).json({ error: "Erro interno ao adicionar música" });
    }
  }
}
