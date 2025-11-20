import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


export interface CreateSessionDTO {
  nomeCliente: string;
  mesaId: number;
  // importantes: aceitam string OU undefined
  ip?: string | undefined;
  userAgent?: string | undefined;
}

export class SessaoClienteRepository {
  async createSession({
    nomeCliente,
    mesaId,
    ip,
    userAgent,
  }: CreateSessionDTO) {
    return prisma.sessaoCliente.create({
      data: {
        nomeCliente,
        mesaId,
        // se vier undefined, mando null pro banco
        ip: ip ?? null,
        userAgent: userAgent ?? null,
        status: "ATIVA",
      },
    });
  }
}
