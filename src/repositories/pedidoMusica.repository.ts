import prisma from "../database/prismaClient.js";

export const PedidoMusicaRepository = {

    //criar pedido
    create(data: {clienteId : number; musicId: number; mesaId: number })
    {
        return prisma.pedidoMusica.create({
            data });
    },

    //listar todos os pedidos (com filtro por status opicional)
    findAll(status?: string, mesaId?: number){
        return prisma.pedidoMusica.findMany({
            where: {
                ...(status ? {status } : {}),
                ...(mesaId ? {mesaId} : {})
            },
            include: {
                music: true,
                cliente: true,
            },
            orderBy: { createdAt: "asc"},
        });
    },

    //att status
    updateStatus(id: number, status: string){
        return prisma.pedidoMusica.update({
            where: {id},
            data: {status},
        });
    },
};