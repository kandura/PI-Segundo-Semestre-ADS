// src/server.ts
import express from "express";
import cors from "cors"; // 5k (gzipped: 2.1k)
import path from "path";
import seedRoutes from "./routes/seed.routes.js";

// rotas certas (ATUAL)
import clienteRoutes from "./routes/cliente.routes.js";
import { sessaoRoutes } from "./routes/sessao.routes.js";

// --- novas imports pro WS ---
import http from "http";
import { WebSocketServer, type RawData } from "ws";

const app = express();


app.use(cors());
app.use(express.json());


app.use(express.static(path.join(process.cwd(), "src", "public")));


app.use(clienteRoutes);
app.use(sessaoRoutes);
app.use(seedRoutes);

// ---------- INTEGRAÇÃO WS ----------

const server = http.createServer(app);


const wss = new WebSocketServer({ server });


function parseMessage(raw: RawData) {
  try {
    const text = raw.toString();
    const obj = JSON.parse(text);
    if (obj && typeof obj === "object") return obj;
    return { text };
  } catch {
    return { text: raw.toString() };
  }
}


function broadcast(obj: any) {
  const data = JSON.stringify(obj);
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) client.send(data);
  });
}

wss.on("connection", (ws) => {
  console.log("WebSocket: cliente conectado");

  
  broadcast({ id: `sys-${Date.now()}`, user: "Sistema", text: "Um usuário entrou no chat.", ts: Date.now() });

  ws.on("message", (raw) => {
    const msg = parseMessage(raw);

    const out = {
      id: Math.random().toString(36).slice(2),
      user: msg.user || "Anônimo",
      text: msg.text ?? "",
      ts: Date.now(),
      ...(msg.room ? { room: msg.room } : {}),
    };

    
    broadcast(out);
  });

  ws.on("close", () => {
    console.log("WebSocket: cliente desconectado");
    broadcast({ id: `sys-${Date.now()}`, user: "Sistema", text: "Um usuário saiu do chat.", ts: Date.now() });
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err);
  });
});

const PORT = Number(process.env.PORT ?? 3000);

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`WebSocket ativo em ws://localhost:${PORT}`);
});

