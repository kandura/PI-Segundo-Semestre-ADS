import clienteRepository from "../repositories/cliente.repository.js";

export async function createCliente(data: { nome: string; mesa: string }) {
  return await clienteRepository.create({nome: data.nome});
}

export async function getAllClientes() {
  return await clienteRepository.findAll();
}

export async function getClienteById(id: number) {
  return await clienteRepository.findById(id);
}

export async function updateCliente(id: number,data: { nome?: string; mesa?: string }) {
  return await clienteRepository.update(id, {nome: data.nome});

}

export async function deleteCliente(id: number) {
  return await clienteRepository.remove(id);
}