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

  // BUSCA LIVRE (pesquisar-musica / telas gerais)

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

      const params = new URLSearchParams({
        q,
        type: "track",
        limit: "50", // 
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

  static async playlist(req: Request, res: Response) {
  try {
    const rawIds = req.params.id;

    if (!rawIds) {
      return res.status(400).json({ error: "Playlist ID é obrigatório" });
    }

    // Aceita "id1,id2,id3"
    const playlistIds = rawIds
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id.length > 0);

    if (playlistIds.length === 0) {
      return res.status(400).json({ error: "Nenhuma playlist válida informada" });
    }

    // token da conta logada 
    const accessToken = await spotify.getValidAccessToken();

    const limit = 100;           // quantas por página
    const maxPerPlaylist = 200; // hard-limit por playlist

    // Mapa pra remover duplicadas 
    const trackMap = new Map<string, any>();

    for (const playlistId of playlistIds) {
      let offset = 0;

      while (true) {
        const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`;

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const data = response.data;
        const items = data.items ?? [];

        if (!items.length) break;

        for (const item of items) {
          const t = item.track;
          if (!t || t.is_local) continue;

          const spotifyId = t.id;
          if (!spotifyId) continue;

          // se já veio essa música de outra playlist, ignora
          if (trackMap.has(spotifyId)) continue;

          trackMap.set(spotifyId, {
            title: t.name,
            artists: t.artists.map((a: any) => a.name).join(", "),
            album: t.album.name,
            coverUrl: t.album.images?.[0]?.url ?? "",
            spotifyUri: t.uri,
            spotifyId,
            durationMs: t.duration_ms,
          });
        }

        if (items.length < limit || offset + limit >= maxPerPlaylist) {
          break; // acabou a playlist ou bateu o limite
        }

        offset += limit;
      }
    }

    // Resultado final = todas as músicas únicas
    const results = Array.from(trackMap.values());
    return res.json(results);
  } catch (err: any) {
    console.error("Erro na playlist Spotify:", err?.response?.data ?? err);
    return res
      .status(500)
      .json({ error: "Erro ao carregar playlist do Spotify" });
  }
}


  static async getPlaylistTracks(req: Request, res: Response) {
    try {
      const playlistId = String(req.params.playlistId || "").trim();
      if (!playlistId) {
        return res.status(400).json({ error: "playlistId é obrigatório" });
      }

      const clientId = process.env.SPOTIFY_CLIENT_ID;
      const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        console.error("SPOTIFY_CLIENT_ID ou SPOTIFY_CLIENT_SECRET não definidos");
        return res.status(500).json({ error: "Spotify não configurado no servidor" });
      }

      const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

      // access_token via Client Credentials
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

      // Pega a playlist pra "quase inteira" (até 200 faixas)
      const allTracks: any[] = [];
      let offset = 0;
      const limit = 100; // Spotify permite até 100 por página
      const MAX_TRACKS = 200;

      while (true) {
        const { data } = await axios.get(
          `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            params: {
              limit,
              offset,
            },
          }
        );

        const items = data.items ?? [];
        if (!items.length) break;

        allTracks.push(...items);
        offset += limit;

        if (!data.next || allTracks.length >= MAX_TRACKS) {
          break;
        }
      }

      const results = allTracks
        .map((item: any) => item.track)
        .filter((t: any) => !!t)
        .map((t: any) => ({
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
      console.error("Erro ao carregar playlist Spotify:", err?.response?.data ?? err);
      return res.status(500).json({ error: "Erro ao carregar playlist Spotify" });
    }
  }
}

export const spotifyController = SpotifyController;