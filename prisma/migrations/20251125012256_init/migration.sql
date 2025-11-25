-- CreateEnum
CREATE TYPE "PedidoStatus" AS ENUM ('PENDENTE', 'APROVADO', 'REJEITADO');

-- CreateTable
CREATE TABLE "Cliente" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mesa" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nome" TEXT,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessaoCliente" (
    "id" SERIAL NOT NULL,
    "nomeCliente" TEXT NOT NULL,
    "mesaId" INTEGER NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ATIVA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "SessaoCliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpotifyAuth" (
    "id" SERIAL NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "tokenObtainedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpotifyAuth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Music" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "artista" TEXT NOT NULL,
    "genero" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Music_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PedidoMusica" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "musicId" INTEGER NOT NULL,
    "mesaId" INTEGER NOT NULL,
    "status" "PedidoStatus" NOT NULL DEFAULT 'PENDENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PedidoMusica_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Mesa_codigo_key" ON "Mesa"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "SpotifyAuth_refreshToken_key" ON "SpotifyAuth"("refreshToken");

-- AddForeignKey
ALTER TABLE "SessaoCliente" ADD CONSTRAINT "SessaoCliente_mesaId_fkey" FOREIGN KEY ("mesaId") REFERENCES "Mesa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoMusica" ADD CONSTRAINT "PedidoMusica_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoMusica" ADD CONSTRAINT "PedidoMusica_musicId_fkey" FOREIGN KEY ("musicId") REFERENCES "Music"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
