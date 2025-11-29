import prisma from "../database/prismaClient.js";

export const MusicRepository = {
  /**
   * Buscar músicas cadastradas no banco
   * (usado somente para listagens internas)
   */
  findAll() {
    return prisma.music.findMany({
      orderBy: { titulo: "asc" }
    });
  },

  /**
   * Criar música — agora exige spotifyId,
   * pois o schema tem essa coluna obrigatória
   */
  create(data: {
    spotifyId: string;
    titulo: string;
    artista: string;
    album?: string | null;
    coverUrl?: string | null;
  }) {
    return prisma.music.create({
      data: {
        spotifyId: data.spotifyId,
        titulo: data.titulo,
        artista: data.artista,
        album: data.album ?? null,
        coverUrl: data.coverUrl ?? null
      }
    });
  }
};
