import prisma from "../database/prismaClient.js";

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
        ...(status ? { status } : {}),
      },
    });
  },

  // Listar pedidos (com filtro opcional por status / mesa)
  findAll(status?: string, mesaId?: number) {
    const where: any = {};

    if (status) {
      where.status = status;
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

  // Listar apenas pendentes (fila)
  findFila() {
    return prisma.pedidoMusica.findMany({
      where: {
        status: "PENDENTE", // valor da enum no banco
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
        status,
      },
    });
  },
};
