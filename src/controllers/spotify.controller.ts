import { Request, Response } from "express";
import { SpotifyService } from "../services/spotify.service.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const spotifyService = new SpotifyService();

export class SpotifyController {

  /**
   * 1) Redireciona o usuário para o login do Spotify
   */
  static async redirectToLogin(req: Request, res: Response) {
    const scope = [
      "user-read-playback-state",
      "user-modify-playback-state",
      "user-read-currently-playing",
      "playlist-read-private",
      "user-read-private",
      "user-library-read"
    ].join(" ");

    const redirectUrl =
      "https://accounts.spotify.com/authorize?" +
      new URLSearchParams({
        response_type: "code",
        client_id: process.env.SPOTIFY_CLIENT_ID!,
        scope,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
      }).toString();

    res.redirect(redirectUrl);
  }

  /**
   * 2) Callback do Spotify — troca o `code` pelos tokens
   */
  static async callback(req: Request, res: Response) {
    const code = req.query.code as string;

    try {
      const tokenData = await spotifyService.getTokensFromCode(code);

      await prisma.spotifyAuth.upsert({
        where: { id: 1 },
        update: {
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
          tokenObtainedAt: new Date(),
        },
        create: {
          id: 1,
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
          tokenObtainedAt: new Date(),
        },
      });

      res.send("Autorizado com sucesso! Agora você pode usar a API.");
    } catch (error) {
      console.error(error);
      res.status(500).send("Erro ao autenticar com o Spotify");
    }
  }

  /**
   * 3) Buscar músicas por nome (Spotify Search)
   */
  static async search(req: Request, res: Response) {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: "Missing query" });

    try {
      const musicas = await spotifyService.searchTracks(q.toString());
      res.json(musicas);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to search tracks" });
    }
  }

  /**
   * 4) Adicionar música à fila do Spotify
   */
  static async addToQueue(req: Request, res: Response) {
    const { uri } = req.body;

    if (!uri) return res.status(400).json({ error: "Missing track URI" });

    try {
      await spotifyService.addToQueue(uri);
      res.json({ message: "Track added to queue" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to add to queue" });
    }
  }
}

export const spotifyController = SpotifyController;