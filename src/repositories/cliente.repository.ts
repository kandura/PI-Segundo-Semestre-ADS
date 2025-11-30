import prisma from "../database/prismaClient.js";

class ClienteRepository {
  async create(data: { nome: string }) {
    return prisma.cliente.create({
      data: {
        nome: data.nome,
      },
    });
  }

  async update(id: number, data: { nome?: string }) {
    return prisma.cliente.update({
      where: { id },
      data: {
        nome: data.nome,
      },
    });
  }

  async findById(id: number) {
    return prisma.cliente.findUnique({ where: { id } });
  }

  async findByName(nome: string) {
    return prisma.cliente.findFirst({
      where: { nome },
    });
  }

  async findAll() {
    return prisma.cliente.findMany();
  }

  async remove(id: number) {
    return prisma.cliente.delete({
      where: { id },
    });
  }

}

const clienteRepository = new ClienteRepository();

export default clienteRepository;
