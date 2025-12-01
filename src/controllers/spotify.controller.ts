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

      const clientId = process.env.SPOTIFY_CLIENT_ID;
      const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        console.error("SPOTIFY_CLIENT_ID ou SPOTIFY_CLIENT_SECRET não definidos");
        return res.status(500).json({ error: "Spotify não configurado no servidor" });
      }

      // 1) Pega um access_token via Client Credentials
      const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

      const tokenResp = await axios.post(
        "https://accounts.spotify.com/api/token",
        new URLSearchParams({ grant_type: "client_credentials" }).toString(),
        {
          headers: {
            Authorization: `Basic ${basic}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const accessToken = tokenResp.data.access_token as string;

      // 2) Usa esse token pra chamar o /search
      const params = new URLSearchParams({
        q,
        type: "track",
        limit: "10",
      });

      const { data } = await axios.get(
        `https://api.spotify.com/v1/search?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const items = data.tracks?.items ?? [];

      const results = items.map((t: any) => ({
        title: t.name,
        artists: t.artists.map((a: any) => a.name).join(", "),
        album: t.album.name,
        coverUrl: t.album.images?.[0]?.url ?? "",
        spotifyUri: t.uri,
        spotifyId: t.id,
        durationMs: t.duration_ms,
      }));

      return res.json(results);
    } catch (err: any) {
      console.error("Erro no search Spotify:", err?.response?.data ?? err);
      return res.status(500).json({ error: "Erro na busca Spotify" });
    }
  }
}

export const spotifyController = SpotifyController;
