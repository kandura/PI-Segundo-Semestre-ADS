import { Request, Response } from "express";
import axios from "axios";
import { SpotifyService } from "../services/spotify.service.js";
import prisma from "../database/prismaClient.js";

const spotify = new SpotifyService();

export class SpotifyController {

  static async redirectToLogin(req: Request, res: Response) {
    const scope = [
      "user-read-playback-state",
      "user-modify-playback-state",
      "user-read-currently-playing",
      "playlist-read-private",
      "user-read-private",
      "user-library-read",
      "streaming"
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

  static async callback(req: Request, res: Response) {
    const code = req.query.code as string;

    try {
      const tokenData = await spotify.getTokensFromCode(code);

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

  static async token(req: Request, res: Response) {
    try {
      const token = await spotify.getValidAccessToken();
      return res.json({ access_token: token });
    } catch (err) {
      return res.status(500).json({ error: "Erro ao gerar token do Spotify" });
    }
  }

  static async search(req: Request, res: Response) {
    try {
      const q = String(req.query.q ?? "").trim();
      if (!q) return res.json([]);

      const token = await spotify.getValidAccessToken();

      const params = new URLSearchParams({
        q,
        type: "track",
        limit: "10"
      });

      const response = await axios.get(
        `https://api.spotify.com/v1/search?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const items = response.data.tracks.items || [];

      const results = items.map((t: any) => ({
        title: t.name,
        artists: t.artists.map((a: any) => a.name).join(", "),
        album: t.album.images?.[0]?.url || "",
        spotifyUri: t.uri,
        spotifyId: t.id,
        durationMs: t.duration_ms,
      }));

      return res.json(results);
    } catch (err) {
      console.error("Erro no search Spotify:", err);
      return res.status(500).json({ error: "Erro na busca Spotify" });
    }
  }
}

export const spotifyController = SpotifyController;
