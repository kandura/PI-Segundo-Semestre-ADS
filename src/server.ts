import express from "express";
import cors from "cors"; // 5k (gzipped: 2.1k)
import path from "path";
import seedRoutes from "./routes/seed.routes.js";


// rotas certas (ATUAL)
import clienteRoutes from "./routes/cliente.routes.js";
import { sessaoRoutes } from "./routes/sessao.routes.js";

const app = express();

// middlewares globais
app.use(cors());
app.use(express.json());

// serve arquivos estáticos da pasta src/public
app.use(express.static(path.join(process.cwd(), "src", "public")));

// registra as rotas da API
app.use(clienteRoutes);
app.use(sessaoRoutes);
app.use(seedRoutes);


const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

