import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export class MesaRepository {
  async findByCodigo(codigo: string) {
    return prisma.mesa.findUnique({
      where: { codigo },
    });
  }
}
