// src/server.ts

import express from "express";
import cors from "cors";
import path from "path";
import http from "http";
import { WebSocketServer, type RawData } from "ws";

import seedRoutes from "./routes/seed.routes.js";
import clienteRoutes from "./routes/cliente.routes.js";
import { sessaoRoutes } from "./routes/sessao.routes.js";
import musicaRouter from "./routes/musica.routes.js";
import prisma from "./database/prismaClient.js";
import pedidoMusicaRouter from "./routes/pedidoMusica.routes.js";
import moderadorRoutes from "./routes/moderador.routes.js";

import spotifyRoutes from "./routes/spotify.routes.js";
import pedidoMusicaSpotifyRouter from "./routes/pedidoMusicaSpotify.routes.js";
import filaRoutes from "./routes/fila.routes.js";
import playerRoutes from "./routes/player.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

// Arquivos estáticos da pasta public
app.use(express.static(path.join(process.cwd(), "src", "public")));

// Rotas base
app.use("/api", musicaRouter);
app.use("/api", pedidoMusicaRouter);

// Rota inicial
app.get("/", (req, res) => {
  res.sendFile(
    path.join(process.cwd(), "src", "public", "login.html")
  );
});

/**************************************
 * ROTA CORRETA DO DASHBOARD DO MODERADOR
 * URL: /moderador-dashboard.html
 **************************************/
app.get("/moderador-dashboard.html", (req, res) => {
  res.sendFile(
    path.join(
      process.cwd(),
      "src",
      "public",
      "moderador",
      "moderador-dashboard.html"
    )
  );
});

/**************************************
 * ROTAS REST
 **************************************/
app.use(clienteRoutes);
app.use(sessaoRoutes);
app.use(seedRoutes);

// Rotas do moderador
app.use("/api/moderador", moderadorRoutes);

// Spotify
app.use("/api/spotify", spotifyRoutes);

// Pedido via Spotify
app.use("/pedido-musica", pedidoMusicaSpotifyRouter);

// Fila de músicas
app.use("/api", filaRoutes);

// Player
app.use("/api", playerRoutes);

/**************************************
 * WEBSOCKET DO CHAT
 **************************************/
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/chat" });

function parseMessage(raw: RawData): any {
  try {
    return JSON.parse(raw.toString());
  } catch {
    return { text: raw.toString() };
  }
}

type ChatMessage = {
  id: string;
  user: string;
  text: string;
  ts: number;
};

function broadcast(msg: any) {
  const data = JSON.stringify(msg);
  wss.clients.forEach((client: any) => {
    if (client.readyState === client.OPEN) {
      client.send(data);
    }
  });
}

wss.on("connection", (ws, req) => {
  try {
    const baseUrl = `http://${req.headers.host ?? "localhost"}`;
    const url = new URL(req.url ?? "", baseUrl);

    const moderador = url.searchParams.get("moderador") === "1";
    const nomeParam = url.searchParams.get("nome") ?? "Anônimo";
    const sessionId = url.searchParams.get("sessionId") ?? "";
    const mesaId = url.searchParams.get("mesaId") ?? "";

    let displayUser = moderador
      ? `MOD | ${nomeParam}`
      : mesaId && mesaId !== "null"
        ? `${nomeParam} (mesa ${mesaId})`
        : nomeParam;

    console.log(
      `WS: cliente conectado — ${displayUser} (sessão ${sessionId})`
    );

    broadcast({
      id: `sys-${Date.now()}`,
      user: "Sistema",
      text: `${displayUser} entrou no chat.`,
      ts: Date.now()
    });

    ws.on("message", (raw: RawData) => {
      const msg = parseMessage(raw);

      if (msg.type === "delete-message") {
        broadcast({ type: "delete-message", id: msg.id });
        return;
      }

      const texto =
        typeof msg.text === "string"
          ? msg.text.trim()
          : String(msg.text ?? "").trim();

      if (!texto) return;

      broadcast({
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        user: msg.user?.toString().trim() || displayUser,
        text: texto,
        ts: Date.now()
      });
    });

    ws.on("close", () => {
      broadcast({
        id: `sys-${Date.now()}`,
        user: "Sistema",
        text: `${displayUser} saiu do chat.`,
        ts: Date.now()
      });
    });

  } catch (err) {
    console.error("Erro no WebSocket:", err);
    ws.close();
  }
});

/**************************************
 * WEBSOCKET DA FILA
 **************************************/
const wssFila = new WebSocketServer({ server, path: "/fila-ws" });

export function broadcastFila(data: any) {
  const json = JSON.stringify(data);
  wssFila.clients.forEach((client: any) => {
    if (client.readyState === client.OPEN) {
      client.send(json);
    }
  });
}

wssFila.on("connection", () => {
  console.log("Cliente conectado ao WS da Fila");
});

/**************************************
 * SEED DAS MESAS
 **************************************/
async function ensureMesasSeeded() {
  try {
    const count = await prisma.mesa.count();

    if (count === 0) {
      await prisma.mesa.createMany({
        data: [
          { codigo: "M01" },
          { codigo: "M02" },
          { codigo: "M03" },
          { codigo: "M04" },
          { codigo: "M05" },
          { codigo: "M06" },
          { codigo: "M07" },
          { codigo: "M08" },
          { codigo: "M09" },
          { codigo: "M10" }
        ]
      });
      console.log("[seed] Mesas criadas automaticamente.");
    }
  } catch (err) {
    console.error("[seed] Erro ao criar mesas:", err);
  }
}

/**************************************
 * INICIAR SERVIDOR
 **************************************/
const PORT = Number(process.env.PORT ?? 3000);

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Chat WebSocket: ws://localhost:${PORT}/chat`);
  ensureMesasSeeded();
});
