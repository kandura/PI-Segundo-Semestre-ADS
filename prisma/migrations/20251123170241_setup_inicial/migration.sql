/*
  Warnings:

  - You are about to drop the column `lastActivity` on the `SessaoCliente` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Cliente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "mesa" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SessaoCliente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nomeCliente" TEXT NOT NULL,
    "mesaId" INTEGER NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ATIVA',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActivityAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" DATETIME,
    CONSTRAINT "SessaoCliente_mesaId_fkey" FOREIGN KEY ("mesaId") REFERENCES "Mesa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SessaoCliente" ("createdAt", "endedAt", "id", "ip", "mesaId", "nomeCliente", "status", "userAgent") SELECT "createdAt", "endedAt", "id", "ip", "mesaId", "nomeCliente", "status", "userAgent" FROM "SessaoCliente";
DROP TABLE "SessaoCliente";
ALTER TABLE "new_SessaoCliente" RENAME TO "SessaoCliente";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
