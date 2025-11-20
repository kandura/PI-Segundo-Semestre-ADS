import type { Request, Response } from "express";
import { SessaoService } from "../services/sessao.service.js";

const service = new SessaoService();

export class SessaoController {
  async create(req: Request, res: Response) {
    const { nome, mesaId } = req.body;

    if (!nome || !mesaId) {
      return res.status(400).json({ error: "Nome e mesa são obrigatórios" });
    }

    try {
      const sessao = await service.create({ nome, mesaId });

      return res.status(201).json({
        message: "Sessão criada!",
        sessionId: sessao.id,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}
