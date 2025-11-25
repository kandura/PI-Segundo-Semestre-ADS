import { Request, Response } from "express";
import { FilaRepository } from "../repositories/fila.repository.js";

export const ModeradorController = {
  listarFila(req: Request, res: Response) {
    res.json(FilaRepository.getFila());
  },

  colocarNaFrente(req: Request, res: Response) {
    const id = Number(req.params.id);
    FilaRepository.colocarNaFrente(id);
    res.json({ ok: true });
  },

  removerMusica(req: Request, res: Response) {
    const id = Number(req.params.id);
    FilaRepository.remover(id);
    res.json({ ok: true });
  }
};


