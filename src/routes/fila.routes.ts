import { Router } from "express";
import prisma from "../database/prismaClient.js";

const router = Router();

/**
 * Retorna a fila ordenada de músicas
 * agrupando: PedidoMusica + Music + Cliente
 */
router.get("/pedidos/fila", async (req, res) => {
  try {
    const pedidos = await prisma.pedidoMusica.findMany({
      where: {
        status: "PENDENTE"
      },
      orderBy: {
        createdAt: "asc"
      },
      include: {
        music: true,
        cliente: {
          select: { nome: true }
        }
      }
    });

    return res.json(pedidos);
  } catch (err) {
    console.error("Erro ao buscar fila:", err);
    return res.status(500).json({ error: "Erro ao buscar fila" });
  }
});

export default router;
