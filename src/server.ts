import express from "express";
import cors from "cors";

// esses dois são default export
import userRoutes from "./routes/user.routes.js";
import clienteRoutes from "./routes/cliente.routes.js";

// esse é named export
import { sessaoRoutes } from "./routes/sessao.cliente.routes.js";

const app = express();

// habilita CORS para tudo (simples e funcional)
app.use(cors());

// habilita JSON
app.use(express.json());

// registra as rotas
app.use(userRoutes);
app.use(clienteRoutes);
app.use(sessaoRoutes);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
