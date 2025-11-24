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


// ----------------- APP EXPRESS -----------------

// Cria a aplicação Express (HTTP)
const app = express();

// Libera CORS 
app.use(cors());

// Faz o parse automático de JSON no body das requisições
app.use(express.json());

// Servir arquivos estáticos do front (HTML / CSS / JS / sons)
app.use(express.static(path.join(process.cwd(), "src", "public")));

app.use("/api", musicaRouter);

// Rota raiz ("/") -> envia o login.html
app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "src", "public", "login.html"));
});

// ----------------- ROTAS REST (API) -----------------

app.use(clienteRoutes);
app.use(sessaoRoutes);
app.use(seedRoutes);

// ----------------- WEBSOCKET DO CHAT -----------------

// Cria o servidor HTTP a partir do app Express
const server = http.createServer(app);

// Cria o servidor WebSocket, reutilizando o mesmo servidor HTTP
const wss = new WebSocketServer({ server, path: "/chat" });

// Função auxiliar para transformar RawData em objeto
function parseMessage(raw: RawData): any {
  try {
    const text = raw.toString();
    const obj = JSON.parse(text);
    if (obj && typeof obj === "object") {
      return obj;
    }
  } catch {
    // Se não for JSON válido, cai aqui e retorna texto puro
  }
  return { text: raw.toString() };
}

// Tipo das mensagens trocadas no chat
type ChatMessage = {
  id: string;
  user: string;
  text: string;
  ts: number;
};

// Envia uma mensagem de chat para TODOS os clientes conectados
function broadcast(msg: ChatMessage) {
  const data = JSON.stringify(msg);
  wss.clients.forEach((client: any) => {
    if (client.readyState === client.OPEN) {
      client.send(data);
    }
  });
}

// Evento disparado sempre que um novo cliente WebSocket se conecta
wss.on("connection", (ws, req) => {
  try {
    // Pega sessionId, mesaId e nome vindos da URL:
    //  ws://host:3000/chat?sessionId=...&mesaId=...&nome=...
    // URL apenas para ler os parâmetros (query string).
    const baseUrl = `http://${req.headers.host ?? "localhost"}`;
    const url = new URL(req.url ?? "", baseUrl);

    const sessionId = url.searchParams.get("sessionId") ?? "";
    const mesaId = url.searchParams.get("mesaId") ?? "";
    const nome = url.searchParams.get("nome") ?? "Anônimo";

    // Monta o nome exibido no chat
    const displayUser =
      mesaId && mesaId !== "null" && mesaId !== "undefined"
        ? `${nome} (mesa ${mesaId})`
        : nome;

    console.log(
      `WebSocket: cliente conectado - ${displayUser} (sessão ${sessionId})`
    );

    // Mensagem de entrada no chat 
    const joinMsg: ChatMessage = {
      id: `sys-${Date.now()}`,
      user: "Sistema",
      text: `${displayUser} entrou no chat.`,
      ts: Date.now(),
    };
    broadcast(joinMsg);

    // Quando o cliente envia uma mensagem
    ws.on("message", (raw: RawData) => {
      try{

      const msg = parseMessage(raw);

      const texto =
        typeof msg.text === "string" ? msg.text.trim() : String(msg.text ?? "").trim();

      // bloqueia mensagens vazias
      if (texto.length === 0 ){ 
        return;
      }

      const out: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        user: msg.user?.toString().trim() || displayUser,
        text: texto,
        ts: Date.now(),

      };

      // Repassa a mensagem para todos os clientes conectados
      broadcast(out);
    } catch(err) {
      console.error("Erro ao processar mensagem do Websocket", err);
    }
    });

    // Quando o cliente desconecta
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

    // Tratamento de erro no WebSocket
    ws.on("error", (err) => {
      console.error("WebSocket error:", err);
    });
  } catch (err) {
    console.error("Erro na conexão WebSocket:", err);
    ws.close();
  }
});

// -------- PRA NÃO TER QUE SUBIR AS MESAS TODA VEZ ------//

async function ensureMesasSeeded() {
  try {
    const count = await prisma.mesa.count();

    // Se não tiver nenhuma mesa, cria as mesas padrão
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

// No Render, a porta vem de process.env.PORT
// Em desenvolvimento local, usamos 3000 por padrão.
const PORT = Number(process.env.PORT ?? 3000);

server.listen(PORT, () => {
  console.log(`Servidor HTTP/WS rodando na porta ${PORT}`);
  console.log(`Chat WebSocket em ws://localhost:${PORT}/chat (dev)`);

  ensureMesasSeeded();
});
