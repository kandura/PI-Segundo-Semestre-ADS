
import { Router } from "express";
import prisma from "../database/prismaClient.js";

const router = Router();

/*
  Rota para criar mesas fixas da hamburgueria*/

router.post("/seed/mesas", async (req, res) => {
  try {
    await prisma.mesa.createMany({
  data: [
    { codigo: "M01",},
    { codigo: "M02",},
    { codigo: "M03",},
    { codigo: "M04",},
    { codigo: "M05",},
    { codigo: "M06",},
    { codigo: "M07"},
    { codigo: "M08"},
    { codigo: "M09"},
    { codigo: "M10" }
  ],
});


    return res.json({ message: "Mesas criadas com sucesso!" });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
