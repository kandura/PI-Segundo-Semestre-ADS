import { Request, Response } from "express";



export class ModeradorController {
  // Remove uma música da fila pelo id
  async removerMusica(req: Request, res: Response) {
    const { id } = req.params;

    // Aqui depois dá pra plugar na tabela de fila de músicas.
    
    return res.status(501).json({
      message: `Rota de moderador ainda não implementada. (removerMusica id=${id})`,
    });
  }

  // Mostra o histórico do chat
  async verHistorico(req: Request, res: Response) {
    // Futuro: buscar histórico no banco.
    return res.status(501).json({
      message: "Rota de moderador ainda não implementada. (verHistorico)",
    });
  }
}
