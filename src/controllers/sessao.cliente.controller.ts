import type { Request, Response } from "express";
import { AbrirSessaoClienteService } from "../services/abrir.sessao.cliente.service.js";

export class SessaoClienteController {
  async abrirSessao(req: Request, res: Response) {
    try {
      const { nomeCliente, codigoMesa } = req.body;

      if (!nomeCliente || !codigoMesa) {
        return res.status(400).json({
          success: false,
          message: "Nome do cliente e código da mesa são obrigatórios",
        });
      }

      const service = new AbrirSessaoClienteService();

      const ip = req.ip || (req.headers["x-forwarded-for"] as string | undefined);
      const userAgent = req.headers["user-agent"] as string | undefined;

      const result = await service.execute({
        nomeCliente,
        codigoMesa,
        ip,
        userAgent,
      });

      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Erro ao abrir sessão do cliente",
      });
    }
  }
}
