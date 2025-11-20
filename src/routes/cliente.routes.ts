import { Router } from "express";
import * as clienteController from "../controllers/cliente.controller.js";

const router = Router();

router.post("/clientes", clienteController.createCliente);
router.get("/clientes", clienteController.getAllClientes);
router.get("/clientes/:id", clienteController.getClienteById);
router.put("/clientes/:id", clienteController.updateCliente);
router.delete("/clientes/:id", clienteController.deleteCliente);

export default router;
