import { fechar } from './servico.mjs';   // CICLO: servico <-> notificacao
export const notificar = (p) => (p.itens.length ? p : fechar([]));
