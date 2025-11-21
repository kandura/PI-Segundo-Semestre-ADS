// src/server.ts
import express from "express";
import cors from "cors";
import path from "path";
import http from "http";
import { WebSocketServer, type RawData } from "ws";

import seedRoutes from "./routes/seed.routes.js";
import clienteRoutes from "./routes/cliente.routes.js";
import { sessaoRoutes } from "./routes/sessao.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// arquivos estáticos (HTML / CSS / JS do front)
app.use(express.static(path.join(process.cwd(), "src", "public")));

// rotas REST
app.use(clienteRoutes);
app.use(sessaoRoutes);
app.use(seedRoutes);

// ----------------- WEBSOCKET DO CHAT -----------------

// Servidor HTTP a partir do Express
const server = http.createServer(app);

// WebSocket em /chat
const wss = new WebSocketServer({ server, path: "/chat" });

function parseMessage(raw: RawData): any {
  try {
    const text = raw.toString();
    const obj = JSON.parse(text);
    if (obj && typeof obj === "object") {
      return obj;
    }
  } catch {
   
  }
  return { text: raw.toString() };
}

type ChatMessage = {
  id: string;
  user: string;
  text: string;
  ts: number;
};

function broadcast(msg: ChatMessage) {
  const data = JSON.stringify(msg);
  wss.clients.forEach((client: any) => {
    if (client.readyState === client.OPEN) {
      client.send(data);
    }
  });
}

wss.on("connection", (ws, req) => {
  try {
    // Pega sessionId, mesaId e nome vindos da URL:
    // ws://host:3000/chat?sessionId=...&mesaId=...&nome=...
    const url = new URL(req.url ?? "", `http://${req.headers.host}`);

    const sessionId = url.searchParams.get("sessionId") ?? "";
    const mesaId = url.searchParams.get("mesaId") ?? "";
    const nome = url.searchParams.get("nome") ?? "Anônimo";

    const displayUser =
      mesaId && mesaId !== "null" && mesaId !== "undefined"
        ? `${nome} (mesa ${mesaId})`
        : nome;

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
      const msg = parseMessage(raw);
      const texto =
        typeof msg.text === "string" ? msg.text.trim() : String(msg.text ?? "");

      if (!texto) return;

      const out: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        user: displayUser,
        text: texto,
        ts: Date.now(),
      };

      broadcast(out);
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

// ----------------- SUBIR SERVIDOR -----------------

const PORT = Number(process.env.PORT ?? 3000);

server.listen(PORT, () => {
  console.log(`Servidor HTTP/WS rodando na porta ${PORT}`);
  console.log(`Chat WebSocket em ws://localhost:${PORT}/chat`);
});
