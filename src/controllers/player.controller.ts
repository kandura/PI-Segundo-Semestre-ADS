import prisma from "../database/prismaClient.js";
import { Request, Response } from "express";
import axios from "axios";
import { SpotifyService } from "../services/spotify.service.js";
import { broadcastFila } from "../server.js";

const spotify = new SpotifyService();

// Device do moderador salvo via WebPlayback SDK
let moderadorDeviceId: string | null = null;

export class PlayerController {

  // ============================================================
  // GET /api/player/fila
  // ============================================================
  static async getFila(req: Request, res: Response) {
    try {
      const fila = await prisma.playbackQueue.findMany({
        where: { status: "NA_FILA" },
        orderBy: { order: "asc" },
        include: {
          music: true,
          pedido: { include: { cliente: true } }
        }
      });

      return res.json(fila);
    } catch (err) {
      console.error("Erro ao carregar fila:", err);
      return res.status(500).json({ error: "Erro ao carregar fila" });
    }
  }


  static async debugPrisma(req: Request, res: Response) {
    try {
      const fila = await prisma.playbackQueue.findMany();
      const player = await prisma.playerState.findMany();

      return res.json({
        fila,
        player,
      });
    } catch (err: any) {
      console.error("Erro no debugPrisma:", err);
      return res.status(500).json({ error: "Erro no debugPrisma", detalhes: String(err) });
    }
  }


  // ===============================
  // DELETE /api/player/fila/:id
  // ===============================
  static async excluirMusica(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      // Remove o vínculo de PedidoMusica -> PlaybackQueue
      await prisma.pedidoMusica.updateMany({
        where: { queueId: id },
        data: {
          queueId: null,
          status: "REJEITADO",
        },
      });

      // Remove a entrada da fila
      await prisma.playbackQueue.delete({
        where: { id },
      });

      // Recarrega a fila que ainda está NA_FILA
      const novaFila = await prisma.playbackQueue.findMany({
        where: { status: "NA_FILA" },
        orderBy: { order: "asc" },
        include: {
          music: true,
          pedido: {
            include: {
              cliente: true,
            },
          },
        },
      });

      // Notifica geral via WebSocket
      broadcastFila({ tipo: "atualizar-fila", fila: novaFila });

      return res.json({ sucesso: true });
    } catch (err) {
      console.error("Erro ao excluir música da fila:", err);
      return res.status(500).json({ error: "Erro ao excluir música" });
    }
  }


  // ============================================================
  // POST /api/player/register-device
  // ============================================================
  static async registerDevice(req: Request, res: Response) {
    try {
      const { device_id } = req.body;

      if (!device_id)
        return res.status(400).json({ error: "device_id é obrigatório" });

      moderadorDeviceId = device_id;

      console.log("🎧 Device registrado:", device_id);

      return res.json({ sucesso: true });
    } catch (err) {
      console.error("Erro register device:", err);
      return res.status(500).json({ error: "Erro ao registrar device" });
    }
  }

  // ============================================================
  // PUT /api/player/play-current
  // ============================================================
  static async playCurrent(req: Request, res: Response) {
    try {
      if (!moderadorDeviceId)
        return res.status(400).json({ error: "Device não registrado" });

      const fila = await prisma.playbackQueue.findMany({
        where: { status: "NA_FILA" },
        orderBy: { order: "asc" },
        include: { music: true }
      });

      if (!fila.length)
        return res.status(404).json({ error: "Fila vazia" });

      // pega o item *antes* de qualquer await para evitar perda de narrowing
      const next = fila[0];
      if (!next) return res.status(404).json({ error: "Fila vazia (inconsistente)" });

      const nextId = next.id;
      const uri = `spotify:track:${next.music.spotifyId}`;

      // agora faz os awaits com segurança
      const token = await spotify.getValidAccessToken();

      await axios.put(
        `https://api.spotify.com/v1/me/player/play?device_id=${moderadorDeviceId}`,
        { uris: [uri] },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await prisma.playbackQueue.update({
        where: { id: nextId },
        data: { status: "TOCANDO", playedAt: new Date() }
      });

      await prisma.playerState.upsert({
        where: { id: 1 },
        update: { currentQueueId: nextId, isPlaying: true },
        create: { id: 1, currentQueueId: nextId }
      });

      // 🔥 Atualiza a fila no painel do moderador
      const filaAtual = await prisma.playbackQueue.findMany({
        where: { status: "NA_FILA" },
        orderBy: { order: "asc" },
        include: { music: true, pedido: { include: { cliente: true } } }
      });

      broadcastFila({ tipo: "atualizar-fila", fila: filaAtual });

      return res.json({ sucesso: true, tocando: next.music });

    } catch (err: any) {
      console.error("Erro playCurrent:", err.response?.data || err);
      return res.status(500).json({ error: "Erro ao tocar música" });
    }
  }

  // ============================================================
  // POST /api/player/tocar-proxima
  // ============================================================
  static async tocarProxima(req: Request, res: Response) {
    try {
      if (!moderadorDeviceId)
        return res.status(400).json({ error: "Device não registrado" });

      // pega a próxima música (findFirst pode retornar null)
      const next = await prisma.playbackQueue.findFirst({
        where: { status: "NA_FILA" },
        orderBy: { order: "asc" },
        include: { music: true, pedido: { include: { cliente: true } } }
      });

      if (!next)
        return res.json({ sucesso: false, mensagem: "Fila vazia" });

      // capture valores necessários imediatamente
      const nextId = next.id;
      const uri = `spotify:track:${next.music.spotifyId}`;

      const token = await spotify.getValidAccessToken();

      await axios.put(
        `https://api.spotify.com/v1/me/player/play?device_id=${moderadorDeviceId}`,
        { uris: [uri] },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // marca como tocando e registra playedAt
      await prisma.playbackQueue.update({
        where: { id: nextId },
        data: { status: "TOCANDO", playedAt: new Date() }
      });

      // marca outros que estavam como TOCANDO como TOCADA (se fizer sentido)
      await prisma.playbackQueue.updateMany({
        where: { status: "TOCANDO", id: { not: nextId } },
        data: { status: "TOCADA" }
      });

      // atualiza player state
      await prisma.playerState.upsert({
        where: { id: 1 },
        update: { currentQueueId: nextId, isPlaying: true },
        create: { id: 1, currentQueueId: nextId }
      });

      // busca fila atualizada e broadcast
      const filaAtual = await prisma.playbackQueue.findMany({
        where: { status: "NA_FILA" },
        orderBy: { order: "asc" },
        include: { music: true, pedido: { include: { cliente: true } } }
      });

      broadcastFila({ tipo: "atualizar-fila", fila: filaAtual });

      return res.json({ sucesso: true, tocandoAgora: next.music });
    } catch (err: any) {
      console.error("Erro tocarProxima:", err.response?.data || err);
      return res.status(500).json({ error: "Erro ao tocar próxima" });
    }
  }

  // ============================================================
  // PUT /api/player/tocar-uri
  // ============================================================
  static async tocarURI(req: Request, res: Response) {
    try {
      const { uri } = req.body;

      if (!uri)
        return res.status(400).json({ error: "uri é obrigatória" });

      if (!moderadorDeviceId)
        return res.status(400).json({ error: "Device não registrado" });

      const token = await spotify.getValidAccessToken();

      await axios.put(
        `https://api.spotify.com/v1/me/player/play?device_id=${moderadorDeviceId}`,
        { uris: [uri] },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return res.json({ sucesso: true });
    } catch (err: any) {
      console.error("Erro tocarURI:", err.response?.data || err);
      return res.status(500).json({ error: "Erro ao tocar URI" });
    }
  }

  // ============================================================
  // POST /api/player/fila/refresh
  // ============================================================
  static async refreshFila(req: Request, res: Response) {
    try {
      const fila = await prisma.playbackQueue.findMany({
        where: { status: "NA_FILA" },
        orderBy: { order: "asc" },
        include: { music: true, pedido: { include: { cliente: true } } }
      });

      broadcastFila({ tipo: "atualizar-fila", fila });
      return res.json({ sucesso: true });
    } catch (err) {
      console.error("Erro refreshFila:", err);
      return res.status(500).json({ error: "Erro ao sincronizar fila" });
    }
  }

  // ============================================================
  // POST /api/player/status-sync
  // ============================================================
  static async statusSync(req: Request, res: Response) {
    try {
      const estado = await prisma.playerState.findUnique({ where: { id: 1 } });
      return res.json({ sucesso: true, estado });
    } catch (err) {
      console.error("Erro statusSync:", err);
      return res.status(500).json({ error: "Erro ao sincronizar player" });
    }
  }
}
