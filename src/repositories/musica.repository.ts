import { prisma } from "../prismaClient.js";


export const MusicRepository = {
    findAll(genero?: string){
        return prisma.music.findMany({
            where: genero ? { genero } : undefined,
            orderBy: { titul: "asc"},
        });
    },


    create(data: { titulo:string ; artista:string; genero:string }) {
        return prisma.music.create({ data });
    },
};