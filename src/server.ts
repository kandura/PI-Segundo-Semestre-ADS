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

// ⭐ ROTAS DO SPOTIFY
import spotifyRoutes from "./routes/spotify.routes.js";

// ⭐ ROTAS DO PEDIDO DE MÚSICA VIA SPOTIFY
import pedidoMusicaSpotifyRouter from "./routes/pedidoMusicaSpotify.routes.js";

// ⭐ ROTAS DA FILA DE MÚSICAS
import filaRoutes from "./routes/fila.routes.js";


// ----------------- APP EXPRESS -----------------

const app = express();
app.use(cors());
app.use(express.json());

// Frontend estático
app.use(express.static(path.join(process.cwd(), "src", "public")));

// Rotas de música (existentes)
app.use("/api", musicaRouter);
app.use("/api", pedidoMusicaRouter);

// Página inicial → login.html
app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "src", "public", "login.html"));
});


// ----------------- ROTAS REST -----------------

app.use(clienteRoutes);
app.use(sessaoRoutes);
app.use(seedRoutes);

// Rotas do moderador
app.use("/api/moderador", moderadorRoutes);

// ⭐ ROTAS DO SPOTIFY
app.use("/api/spotify", spotifyRoutes);

// ⭐ ROTA DO PEDIDO DE MÚSICA VIA SPOTIFY
app.use("/pedido-musica", pedidoMusicaSpotifyRouter);

// ⭐ ROTA DA FILA DE MÚSICAS
app.use("/api", filaRoutes);


// ----------------- WEBSOCKET DO CHAT -----------------

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/chat" });

function parseMessage(raw: RawData): any {
  try {
    const text = raw.toString();
    const obj = JSON.parse(text);
    if (obj && typeof obj === "object") return obj;
  } catch {}
  return { text: raw.toString() };
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

    let displayUser = nomeParam;

    if (moderador) {
      displayUser = `MOD | ${nomeParam}`;
    } else if (mesaId && mesaId !== "null" && mesaId !== "undefined") {
      displayUser = `${nomeParam} (mesa ${mesaId})`;
    }

    console.log(
      `WebSocket: cliente conectado - ${displayUser} (sessão ${sessionId})`
    );

    const joinMsg: ChatMessage = {
      id: `sys-${Date.now()}`,
      user: "Sistema",
      text: `${displayUser} entrou no chat.`,
      ts: Date.now(),
    };
    broadcast(joinMsg);

    ws.on("message", (raw: RawData) => {
      try {
        const msg = parseMessage(raw);

        if (msg.type === "delete-message") {
          broadcast({
            type: "delete-message",
            id: msg.id,
          });
          return;
        }

        const texto =
          typeof msg.text === "string"
            ? msg.text.trim()
            : String(msg.text ?? "").trim();

        if (texto.length === 0) return;

        const out: ChatMessage = {
          id: `msg-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)}`,
          user: msg.user?.toString().trim() || displayUser,
          text: texto,
          ts: Date.now(),
        };

        broadcast(out);
      } catch (err) {
        console.error("Erro ao processar mensagem do Websocket", err);
      }
    });

    ws.on("close", () => {
      console.log("WebSocket: cliente desconectado");
      const leaveMsg: ChatMessage = {
        id: `sys-${Date.now()}`,
        user: "Sistema",
        text: `${displayUser} saiu do chat.`,
        ts: Date.now(),
      };
      broadcast(leaveMsg);
    });

    ws.on("error", (err) => {
      console.error("WebSocket error:", err);
    });
  } catch (err) {
    console.error("Erro na conexão WebSocket:", err);
    ws.close();
  }
});

// ----------------- WEBSOCKET DA FILA DE MÚSICAS -----------------

const wssFila = new WebSocketServer({ server, path: "/fila-ws" });

export function broadcastFila(data: any) {
  const json = JSON.stringify(data);
  wssFila.clients.forEach((client: any) => {
    if (client.readyState === client.OPEN) {
      client.send(json);
    }
  });
}

wssFila.on("connection", (ws) => {
  console.log("Cliente conectado ao WebSocket da Fila");

  ws.on("close", () => {
    console.log("Cliente saiu do WebSocket da Fila");
  });
});

// ----------------- SEED DAS MESAS -----------------

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
    } else {
      console.log(`[seed] Mesas já existem (${count}) – nada a fazer.`);
    }
  } catch (err) {
    console.error("[seed] Erro ao garantir mesas:", err);
  }
}


// ----------------- SUBIR SERVIDOR -----------------

const PORT = Number(process.env.PORT ?? 3000);

server.listen(PORT, () => {
  console.log(`Servidor HTTP/WS rodando na porta ${PORT}`);
  console.log(`Chat WebSocket em ws://localhost:${PORT}/chat (dev)`);

  ensureMesasSeeded();
});
