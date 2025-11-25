import { Request, Response } from "express";
import prisma  from "../database/prismaClient";
import bcrypt from "bcryptjs";

export const ModeradorController = {
  
  async register(req: Request, res: Response) {
    try {
      const { nome, email, senha } = req.body;

      const existe = await prisma.moderador.findUnique({ where: { email }});
      if (existe) return res.status(400).json({ error: "Email já cadastrado" });

      const hash = await bcrypt.hash(senha, 10);

      await prisma.moderador.create({
        data: { nome, email, senha: hash }
      });

      return res.json({ ok: true });

    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Erro ao cadastrar" });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, senha } = req.body;

      const user = await prisma.moderador.findUnique({ where: { email }});
      if (!user) return res.status(400).json({ error: "Usuário não encontrado" });

      const ok = await bcrypt.compare(senha, user.senha);
      if (!ok) return res.status(400).json({ error: "Senha inválida" });

      return res.json({ ok: true, moderadorId: user.id });

    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Erro ao logar" });
    }
  }

};



