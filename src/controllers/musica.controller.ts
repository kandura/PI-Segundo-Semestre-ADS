import type { Request, Response } from "express";
import { MusicRepository } from "../repositories/musica.repository.js";

export const MusicaController = {

  // GET /musicas — lista todas as músicas cadastradas
  async listar(req: Request, res: Response) {
    try {
      const musics = await MusicRepository.findAll();
      return res.json(musics);
    } catch (error) {
      console.error("Erro ao listar músicas:", error);
      return res.status(500).json({ message: "Erro ao listar músicas" });
    }
  },

  // POST /musicas — cria música manualmente (OPCIONAL)
  // OBS: No fluxo atual, músicas são criadas automaticamente via Spotify
  async criar(req: Request, res: Response) {
    try {
      const { spotifyId, titulo, artista, album, coverUrl } = req.body ?? {};

      if (!spotifyId || !titulo || !artista) {
        return res.status(400).json({
          message: "Campos obrigatórios: spotifyId, titulo, artista",
        });
      }

      const music = await MusicRepository.create({
        spotifyId,
        titulo,
        artista,
        album: album ?? null,
        coverUrl: coverUrl ?? null,
      });

      return res.status(201).json(music);

    } catch (error) {
      console.error("Erro ao criar música:", error);
      return res.status(500).json({ message: "Erro ao criar música" });
    }
  },

};
