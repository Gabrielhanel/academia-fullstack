import { gravar } from '../infra/banco.mjs';   // VIOLAÇÃO: o domínio não pode depender da infraestrutura
export const criarPedido = (itens) => gravar({ itens });
