import clienteRepository from "../repositories/cliente.repository.js";

export async function createCliente(data: { nome: string; mesa: string }) {
  return await clienteRepository.create(data);
}

export async function getAllClientes() {
  return await clienteRepository.findAll();
}

export async function getClienteById(id: number) {
  return await clienteRepository.findById(id);
}

export async function updateCliente(
  id: number,
  data: { nome?: string; mesa?: string }
) {
  const cliente = await clienteRepository.findById(id);
  if (!cliente) {
    return null;
  }

  return await clienteRepository.update(id, data);
}

export async function deleteCliente(id: number) {
  const cliente = await clienteRepository.findById(id);
  if (!cliente) {
    return null;
  }

  return await clienteRepository.remove(id);
}
