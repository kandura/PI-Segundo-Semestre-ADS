import prisma from "../database/prismaClient.js";
import { Prisma, PedidoStatus } from "@prisma/client";

export const PedidoMusicaRepository = {
  // criar pedido
  create(data: {
    clienteId: number;
    musicId: number;
    mesaId: number;
    status?: string;
  }) {
    const { status, ...rest } = data;

    return prisma.pedidoMusica.create({
      data: {
        ...rest,
        // se vier status, converte para enum do Prisma
        ...(status ? { status: status as PedidoStatus } : {}),
      },
    });
  },

  // listar todos os pedidos (com filtro por status opcional)
  findAll(status?: string, mesaId?: number) {
    const where: Prisma.PedidoMusicaWhereInput = {};

    if (status) {
      // converte de string para enum PedidoStatus
      where.status = status as PedidoStatus;
    }

    if (typeof mesaId === "number") {
      where.mesaId = mesaId;
    }

    return prisma.pedidoMusica.findMany({
      where,
      include: {
        music: true,
        cliente: true,
      },
      orderBy: { createdAt: "asc" },
    });
  },

  // atualizar status
  updateStatus(id: number, status: string) {
    return prisma.pedidoMusica.update({
      where: { id },
      data: {
        status: status as PedidoStatus,
      },
    });
  },
};
