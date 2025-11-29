import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";

const { Pool } = pkg;

// Render passa DATABASE_URL automaticamente
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL não encontrada no ambiente!");
}

// Criar pool do PostgreSQL
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false } // Render exige SSL
});

// Criar adapter Prisma 7
const adapter = new PrismaPg(pool);

// Criar PrismaClient usando o adapter
const prisma = new PrismaClient({
  adapter,
});

export default prisma;
