import axios, { AxiosInstance } from "axios";
import { PrismaClient } from "@prisma/client";
import * as querystring from "querystring";

const prisma = new PrismaClient();

interface SpotifyTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export class SpotifyService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly api: AxiosInstance;

  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID || "";
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET || "";
    this.redirectUri = process.env.SPOTIFY_REDIRECT_URI || "";

    // Client HTTP apontando pra API do Spotify
    this.api = axios.create({
      baseURL: "https://api.spotify.com/v1/",
    });

    // Antes de cada request a gente injeta um access token válido
    this.api.interceptors.request.use(async (config) => {
      const token = await this.getValidAccessToken();
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }

  // Busca um access token válido; se tiver expirado, faz refresh
  private async getValidAccessToken(): Promise<string> {
    const authData = await prisma.spotifyAuth.findFirst();

    if (!authData) {
      throw new Error("No Spotify authentication data found.");
    }

    // Usando expiresAt vindo do banco (não expiresIn)
    const expiresAt = authData.expiresAt;
    if (!expiresAt) {
    // Se por algum motivo não tiver data de expiração, força refresh
      return this.refreshToken(authData.refreshToken);
    }

    // Buffer de segurança de 5 minutos pra não ficar na beira da expiração
    const safetyBufferMs = 5 * 60 * 1000;
    const expirationTime = expiresAt.getTime() - safetyBufferMs;

    if (Date.now() < expirationTime) {
      // Ainda tá dentro da validade
      return authData.accessToken;
    }

    console.log("Access token expired. Refreshing token...");
    return this.refreshToken(authData.refreshToken);
  }

  // Faz o refresh do token no endpoint de token do Spotify
  private async refreshToken(refreshToken: string): Promise<string> {
    const authString = Buffer.from(
      `${this.clientId}:${this.clientSecret}`
    ).toString("base64");

    try {
      const response = await axios.post<SpotifyTokenResponse>(
        "https://accounts.spotify.com/api/token",
        querystring.stringify({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
        {
          headers: {
            Authorization: `Basic ${authString}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const newAccessToken = response.data.access_token;
      const expiresIn = response.data.expires_in;

      // Atualiza todos os registros que usam esse refreshToken
      await prisma.spotifyAuth.updateMany({
        where: { refreshToken },
        data: {
          accessToken: newAccessToken,
          expiresAt: new Date(Date.now() + expiresIn * 1000),
          tokenObtainedAt: new Date(),
        },
      });

      return newAccessToken;
    } catch (error: any) {
      // Se der erro aqui, loga o payload que o Spotify devolveu
      console.error(
        "Error refreshing Spotify token:",
        error?.response?.data ?? error
      );
      throw new Error("Failed to refresh Spotify token.");
    }
  }

  // Troca o "code" de autorização pelos tokens iniciais
  public async getTokensFromCode(
    code: string
  ): Promise<SpotifyTokenResponse> {
    const authString = Buffer.from(
      `${this.clientId}:${this.clientSecret}`
    ).toString("base64");

    const response = await axios.post<SpotifyTokenResponse>(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: this.redirectUri,
      }),
      {
        headers: {
          Authorization: `Basic ${authString}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data;
  }

  // Busca faixas no Spotify a partir de uma query
  public async searchTracks(query: string) {
    const response = await this.api.get("search", {
      params: {
        q: query,
        type: "track",
        limit: 10,
      },
    });

    // Normaliza o retorno pro resto do sistema
    return response.data.tracks.items.map((item: any) => ({
      spotifyUri: item.uri,
      title: item.name,
      artists: item.artists.map((artist: any) => artist.name).join(", "),
      album: item.album?.images?.[0]?.url ?? null,
    }));
  }

  // Adiciona uma faixa na fila de reprodução do usuário logado no Spotify
  public async addToQueue(spotifyUri: string) {
    try {
      await this.api.post("me/player/queue", null, {
        params: {
          uri: spotifyUri,
        },
      });
    } catch (error: any) {
      console.error(
        "Error adding track to queue:",
        error?.response?.data ?? error
      );
      throw new Error("Failed to add track to Spotify queue.");
    }
  }
}
