export interface SessaoCliente {
  id: number;
  nomeCliente: string;
  mesaId: number;
  status: string;
  createdAt: Date;
  lastActivity: Date;
  endedAt?: Date | null;
  ip?: string | null;
  userAgent?: string | null;
}
