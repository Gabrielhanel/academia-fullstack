// Padrões comportamentais: Strategy, Observer, Command, State, Chain of Responsibility, Template Method e Iterator.
import { EventEmitter } from 'node:events';
export const estrategiasFrete = { normal: (kg) => 10 + kg * 2, expresso: (kg) => 25 + kg * 4, retirada: () => 0 };
export const calcularFrete = (tipo, kg, estrategias = estrategiasFrete) => { const s = estrategias[tipo]; if (!s) throw new Error('estratégia desconhecida: ' + tipo); return s(kg); };

export class Loja extends EventEmitter { vender(item) { this.emit('venda', item); return item; } }

export class Editor {
  constructor() { this.texto = ''; this.desfazer = []; }
  executar(cmd) { cmd.fazer(this); this.desfazer.push(cmd); }
  voltar() { const c = this.desfazer.pop(); if (c) c.desfazer(this); }
}
export const inserir = (t) => ({ fazer(e) { e.texto += t; }, desfazer(e) { e.texto = e.texto.slice(0, -t.length); } });

const TRANSICOES = { novo: ['pago', 'cancelado'], pago: ['enviado', 'cancelado'], enviado: ['entregue'], entregue: [], cancelado: [] };
export class PedidoEstado {
  constructor() { this.estado = 'novo'; }
  ir(para) { if (!TRANSICOES[this.estado].includes(para)) throw new Error('transição inválida: ' + this.estado + ' → ' + para); this.estado = para; return this; }
}

export const cadeia = (...mws) => (ctx) => { let i = -1; const prox = () => { i++; return mws[i] ? mws[i](ctx, prox) : ctx; }; return prox(); };

export class Relatorio { // Template Method
  gerar() { return [this.cabecalho(), ...this.linhas(), this.rodape()].join('\n'); }
  cabecalho() { return '== ' + this.titulo() + ' =='; }
  rodape() { return '-- fim --'; }
}
export function* naturais() { let n = 1; while (true) yield n++; }
export function* tomar(it, n) { let i = 0; for (const x of it) { if (i++ >= n) return; yield x; } }
