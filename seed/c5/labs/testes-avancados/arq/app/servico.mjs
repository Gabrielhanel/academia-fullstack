import { criarPedido } from '../dominio/pedido.mjs';
import { notificar } from './notificacao.mjs';
export const fechar = (itens) => notificar(criarPedido(itens));
