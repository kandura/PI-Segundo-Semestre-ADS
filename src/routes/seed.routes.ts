
import { Router } from "express";
import prisma from "../database/prismaClient.js";

const router = Router();

/*
  Rota para criar mesas fixas da hamburgueria*/

router.post("/seed/mesas", async (req, res) => {
  try {
    await prisma.mesa.createMany({
  data: [
    { codigo: "M01", nome: "Mesa 1" },
    { codigo: "M02", nome: "Mesa 2" },
    { codigo: "M03", nome: "Mesa 3" },
    { codigo: "M04", nome: "Mesa 4" },
    { codigo: "M05", nome: "Mesa 5" },
    { codigo: "M06", nome: "Mesa 6" },
    { codigo: "M07", nome: "Mesa 7" },
    { codigo: "M08", nome: "Mesa 8" },
    { codigo: "M09", nome: "Mesa 9" },
    { codigo: "M10", nome: "Mesa 10" },
  ],
});


    return res.json({ message: "Mesas criadas com sucesso!" });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
