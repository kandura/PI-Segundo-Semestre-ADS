import prisma from "../database/prismaClient.js";
import { Request, Response } from "express";
import axios from "axios";
import { SpotifyService } from "../services/spotify.service.js";

const spotify = new SpotifyService();

export class PlayerController {
  static async tocarProxima(req: Request, res: Response) {
    try {
      // 1) Buscar próxima música na fila
      const next = await prisma.playbackQueue.findFirst({
        where: { status: "NA_FILA" },
        orderBy: { order: "asc" },
        include: { music: true }
      });

      if (!next) {
        return res.json({ sucesso: false, mensagem: "Fila vazia" });
      }

      const music = next.music;

      // 2) Obter token válido do Spotify
      const token = await spotify.getValidAccessToken();

      // 3) Enviar para tocar no Spotify do MODERADOR
      await axios.put(
        "https://api.spotify.com/v1/me/player/play",
        {
          uris: [music.spotifyId]
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // 4) Marcar como tocando
      await prisma.playbackQueue.update({
        where: { id: next.id },
        data: { status: "TOCANDO" }
      });

      // 5) Atualizar PlayerState
      await prisma.playerState.upsert({
        where: { id: 1 },
        update: { currentQueueId: next.id, isPlaying: true },
        create: { id: 1, currentQueueId: next.id }
      });

      return res.json({
        sucesso: true,
        tocandoAgora: music
      });

    } catch (err: any) {
      console.error("Erro ao enviar música para Spotify:", err.response?.data || err);
      return res.status(500).json({ error: "Erro ao tocar no dispositivo da hamburgueria" });
    }
  }
}
