import Cliente from "../entities/cliente.entity.js";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


export async function create(data: { nome: string; mesa: string }) {
  return Cliente.create({ data });
}

export async function findAll() {
  return Cliente.findMany({
    orderBy: { id: "asc" },
  });
}

export async function findById(id: number) {
  return Cliente.findUnique({ where: { id } });
}

export async function update(
  id: number,
  data: { nome?: string; mesa?: string }
) {
  return Cliente.update({ where: { id }, data });
}

export async function remove(id: number) {
  return Cliente.delete({ where: { id } });
}