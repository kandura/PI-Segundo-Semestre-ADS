import { MesaRepository } from "../repositories/mesa.repository.js";
import { SessaoClienteRepository } from "../repositories/sessao.cliente.repository.js";

interface AbrirSessaoInput {
  nomeCliente: string;
  codigoMesa: string;
  ip: string | undefined;
  userAgent: string | undefined;
}


export class AbrirSessaoClienteService {
  private mesaRepository: MesaRepository;
  private sessaoRepository: SessaoClienteRepository;

  constructor() {
    this.mesaRepository = new MesaRepository();
    this.sessaoRepository = new SessaoClienteRepository();
  }

  async execute(input: AbrirSessaoInput) {
    const { nomeCliente, codigoMesa, ip, userAgent } = input;

    // 1. Validar se a mesa existe
    const mesa = await this.mesaRepository.findByCodigo(codigoMesa);
    if (!mesa || !mesa.ativa) {
      throw new Error("Mesa não encontrada ou inativa");
    }

    // 2. Criar sessão
    const sessao = await this.sessaoRepository.createSession({
      nomeCliente,
      mesaId: mesa.id,
      ip,
      userAgent,
    });

    // 3. Retornar só o que o front precisa por enquanto
    return {
      idSessao: sessao.id,
      nomeCliente: sessao.nomeCliente,
      mesa: {
        id: mesa.id,
        codigo: mesa.codigo,
        nome: mesa.nome,
      },
      status: sessao.status,
      createdAt: sessao.createdAt,
    };
  }
}
