import type { Request, Response } from "express";
import { PedidoMusicaRepository } from "../repositories/pedidoMusica.repository.js";

export const PedidoMusicaController = {
  // Criar pedido
  async criar(req: Request, res: Response) {
    try {
      const { clienteId, musicId, mesaId } = req.body ?? {};

      if (!clienteId || !musicId || !mesaId) {
        return res.status(400).json({
          message: "Campos obrigatórios: clienteId, musicId, mesaId",
        });
      }

      const pedido = await PedidoMusicaRepository.create({
        clienteId: Number(clienteId),
        musicId: Number(musicId),
        mesaId: Number(mesaId),
      });

      return res.status(201).json(pedido);
    } catch (error) {
      console.error("Erro ao criar pedido", error);
      return res.status(500).json({ message: "Erro ao criar pedido" });
    }
  },

  // Listar pedidos
  async listar(req: Request, res: Response) {
    try {
      const status =
        typeof req.query.status === "string" ? req.query.status : undefined;

      const mesaId =
        typeof req.query.mesaId === "string"
          ? Number(req.query.mesaId)
          : undefined;

      const pedidos = await PedidoMusicaRepository.findAll(status, mesaId);
      return res.json(pedidos);
    } catch (error) {
      console.error("Erro ao listar pedidos:", error);
      return res.status(500).json({ message: "Erro ao listar pedidos" });
    }
  },

  // Fila (aqui você implementa depois)
  async fila(req: Request, res: Response) {
    try {
      const fila = await PedidoMusicaRepository.findFila();
      return res.json(fila);
    } catch (error) {
      console.error("Erro ao listar fila:", error);
      return res.status(500).json({ message: "Erro ao listar fila" });
    }
  },

  // Atualizar status
  async atualizarStatus(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { status } = req.body ?? {};

      if (!status) {
        return res.status(400).json({
          message: "Campo obrigatório: status",
        });
      }

      const pedido = await PedidoMusicaRepository.updateStatus(id, status);
      return res.json(pedido);
    } catch (error) {
      console.error("Erro ao atualizar pedido:", error);
      return res.status(500).json({ message: "Erro ao atualizar pedido" });
    }
  },
};