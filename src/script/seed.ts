import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed da hamburgueria...");

  // Cria mesas 
  await prisma.mesa.createMany({
    data: [
      { codigo: "M01"},
      { codigo: "M02"},
      { codigo: "M03"},
      { codigo: "M04"},
      { codigo: "M05"},
      { codigo: "M06"},
      { codigo: "M07"},
      { codigo: "M08"},
      { codigo: "M09"},
      { codigo: "M10"},
    ],
  });

  console.log("Mesas garantidas com sucesso!");
}

main()
  .catch((err) => {
    console.error("Erro ao rodar seed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
