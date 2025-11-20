import prisma from "../database/prismaClient.js";

interface CreateSessaoDTO {
  nome: string;
  mesaId: number;
}

export class SessaoService {
  async create({ nome, mesaId }: CreateSessaoDTO) {
    const sessao = await prisma.sessaoCliente.create({
      data: {
        nomeCliente: nome,
        mesaId,
      },
    });

    return sessao;
  }
}
