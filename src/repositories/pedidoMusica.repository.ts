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
        ...(status ? { status: status as PedidoStatus } : {}),
      },
    });
  },

  // listar todos os pedidos (com filtro por status opcional)
  findAll(status?: string, mesaId?: number) {
    const where: Prisma.PedidoMusicaWhereInput = {};

    if (status) {
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

  // 🔥 LISTAR FILA (somente pendentes)
  findFila() {
    return prisma.pedidoMusica.findMany({
      where: {
        status: "PENDENTE" as PedidoStatus,
      },
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