import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed da hamburgueria...");

  // Cria mesas 
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
    skipDuplicates: true, 
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
