import prisma from "../database/prismaClient.js";

export async function create(data: { nome: string; mesa: string }) {
  return prisma.cliente.create({ data });
}

export async function findAll() {
  return prisma.cliente.findMany({
    orderBy: { id: "asc" },
  });
}

export async function findById(id: number) {
  return prisma.cliente.findUnique({ where: { id } });
}

export async function update(
  id: number,
  data: { nome?: string; mesa?: string }
) {
  return prisma.cliente.update({ where: { id }, data });
}

export async function remove(id: number) {
  return prisma.cliente.delete({ where: { id } });
}
