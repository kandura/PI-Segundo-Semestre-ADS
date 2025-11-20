import type express from "express";
import * as clienteService from "../services/cliente.service.js";

export async function createCliente(
  req: express.Request,
  res: express.Response
) {
  const { nome, mesa } = req.body;

  const cliente = await clienteService.createCliente({ nome, mesa });
  return res.status(201).json(cliente);
}

export async function getAllClientes(
  req: express.Request,
  res: express.Response
) {
  const clientes = await clienteService.getAllClientes();
  return res.status(200).json(clientes);
}

export async function getClienteById(
  req: express.Request,
  res: express.Response
) {
  const { id } = req.params;

  const cliente = await clienteService.getClienteById(Number(id));
  if (!cliente) {
    return res.status(404).json({ message: "Cliente not found" });
  }

  return res.status(200).json(cliente);
}

export async function updateCliente(
  req: express.Request,
  res: express.Response
) {
  const { id } = req.params;
  const { nome, mesa } = req.body;

  const cliente = await clienteService.updateCliente(Number(id), {
    nome,
    mesa,
  });

  if (!cliente) {
    return res.status(404).json({ message: "Cliente not found" });
  }

  return res.status(200).json(cliente);
}

export async function deleteCliente(
  req: express.Request,
  res: express.Response
) {
  const { id } = req.params;

  const resultado = await clienteService.deleteCliente(Number(id));
  if (!resultado) {
    return res.status(404).json({ message: "Cliente not found" });
  }

  return res.status(204).send();
} //olá 