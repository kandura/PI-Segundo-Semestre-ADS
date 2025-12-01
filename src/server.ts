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

app.use("/api", spotifyRoutes);

// Arquivos estáticos da pasta public
app.use(express.static(path.join(process.cwd(), "src", "public")));

// Rotas base (músicas e pedidos simples)
app.use("/api", musicaRouter);
app.use("/api", pedidoMusicaRouter);

app.use("/api/pedido-musica", pedidoMusicaSpotifyRouter);

// Página inicial → login do cliente
app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "src", "public", "login.html"));
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
 * SERVIDOR HTTP
 **************************************/
const server = http.createServer(app);

/**************************************
 * WEBSOCKET DO CHAT  (/chat)
 **************************************/

const wssChat = new WebSocketServer({ noServer: true });

type ChatMessage = {
  id: string;
  user: string;
  text: string;
  ts: number;
};

function broadcastChat(msg: any) {
  const data = JSON.stringify(msg);
  wssChat.clients.forEach((client: any) => {
    if (client.readyState === client.OPEN) {
      client.send(data);
    }
  });
}

wssChat.on("connection", (ws, req) => {
  try {
    const urlStr = req.url ?? ""; // ex.: "/chat?nome=Leo&mesaId=2..."
    const queryStr = urlStr.split("?")[1] ?? "";
    const params = new URLSearchParams(queryStr);

    const moderador = params.get("moderador") === "1";
    const nomeParam = params.get("nome") ?? "Anônimo";
    const sessionId = params.get("sessionId") ?? "";
    const mesaId = params.get("mesaId") ?? "";

    let displayUser = moderador
      ? `MOD | ${nomeParam}`
      : mesaId && mesaId !== "null"
        ? `${nomeParam} (mesa ${mesaId})`
        : nomeParam;

    // Mensagem de entrada no chat
    broadcastChat({
      id: `sys-${Date.now()}`,
      user: "Sistema",
      text: `${displayUser} entrou no chat.`,
      ts: Date.now(),
    });

    ws.on("message", (raw: RawData) => {
      let msg: any;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        msg = { text: raw.toString() };
      }

      // Apagar mensagens
      if (msg.type === "delete-message") {
        broadcastChat({ type: "delete-message", id: msg.id });
        return;
      }

      const texto =
        typeof msg.text === "string"
          ? msg.text.trim()
          : String(msg.text ?? "").trim();

      if (!texto) return;

      const chatMsg: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        user: (msg.user ?? displayUser).toString().trim() || displayUser,
        text: texto,
        ts: Date.now(),
      };

      broadcastChat(chatMsg);
    });

    ws.on("close", () => {
      broadcastChat({
        id: `sys-${Date.now()}`,
        user: "Sistema",
        text: `${displayUser} saiu do chat.`,
        ts: Date.now(),
      });
    });
  } catch (err) {
    console.error("Erro no WebSocket do chat:", err);
    try {
      ws.close();
    } catch {}
  }
});

/**************************************
 * WEBSOCKET DA FILA (/fila-ws)
 **************************************/

const wssFila = new WebSocketServer({ noServer: true });

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
 * ROUTER DE UPGRADE (CHAT x FILA)
 **************************************/

server.on("upgrade", (req, socket, head) => {
  try {
    const url = new URL(req.url ?? "", `http://${req.headers.host}`);
    const pathname = url.pathname;

    if (pathname === "/chat") {
      wssChat.handleUpgrade(req, socket, head, (ws) => {
        wssChat.emit("connection", ws, req);
      });
    } else if (pathname === "/fila-ws") {
      wssFila.handleUpgrade(req, socket, head, (ws) => {
        wssFila.emit("connection", ws, req);
      });
    } else {
      socket.destroy();
    }
  } catch (err) {
    console.error("Erro no upgrade de WebSocket:", err);
    socket.destroy();
  }
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
          { codigo: "M10" },
        ],
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
  console.log(`Fila WebSocket: ws://localhost:${PORT}/fila-ws`);
  ensureMesasSeeded();
});
