import prisma from "../database/prismaClient.js";
import { Prisma, PedidoStatus } from "@prisma/client";

export const PedidoMusicaRepository = {

  // Criar pedido
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
        ...(status ? { status: status as PedidoStatus } : {}),
      },
    });
  },

  // Listar pedidos (com filtro opcional por status)
  findAll(status?: string, mesaId?: number) {
    const where: Prisma.PedidoMusicaWhereInput = {};

    if (status) {
      where.status = { equals: status as PedidoStatus };
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

  // 🔥 Listar apenas pendentes (fila)
  findFila() {
    return prisma.pedidoMusica.findMany({
      where: {
        status: { equals: PedidoStatus.PENDENTE },
      },
      include: {
        music: true,
        cliente: true,
      },
      orderBy: { createdAt: "asc" },
    });
  },

  // Atualizar status
  updateStatus(id: number, status: string) {
    return prisma.pedidoMusica.update({
      where: { id },
      data: {
        status: status as PedidoStatus,
      },
    });
  },
};
