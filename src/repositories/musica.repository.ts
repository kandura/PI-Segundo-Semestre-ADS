import prisma from "../database/prismaClient.js";

export const MusicRepository = {
  findAll(genero?: string) {
    const query: any = {
      orderBy: { titulo: "asc" }
    };

    if (genero) {
      query.where = { genero };
    }

    return prisma.music.findMany(query);
  },

  create(data: { titulo: string; artista: string; genero: string }) {
    return prisma.music.create({ data });
  },
};
