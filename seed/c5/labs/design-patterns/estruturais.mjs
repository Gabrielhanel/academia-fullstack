// Padrões estruturais: Adapter, Decorator, Facade, Proxy e Composite.
export class GatewayAntigo { cobrarCentavos(valorCentavos, cartao) { return { ok: valorCentavos > 0, codigo: 'ANT-' + cartao.slice(-4) }; } }
export class AdaptadorPagamento { // a aplicação espera pagar({ valor, cartao }) em reais
  constructor(antigo) { this.antigo = antigo; }
  pagar({ valor, cartao }) { const r = this.antigo.cobrarCentavos(Math.round(valor * 100), cartao); return { aprovado: r.ok, id: r.codigo }; }
}

export const comRetry = (fn, tentativas) => async (...a) => {
  let ultimo;
  for (let i = 1; i <= tentativas; i++) { try { return await fn(...a); } catch (e) { ultimo = e; } }
  throw ultimo;
};
export const comCache = (fn) => { const m = new Map(); const f = async (k) => { if (!m.has(k)) m.set(k, await fn(k)); return m.get(k); }; f.tamanho = () => m.size; return f; };
export const comLog = (fn, log) => async (...a) => { log.push('chamou ' + JSON.stringify(a)); const r = await fn(...a); log.push('retornou ' + JSON.stringify(r)); return r; };

export class FachadaPedido { // esconde três subsistemas atrás de uma operação
  constructor({ estoque, pagamento, notificacao }) { Object.assign(this, { estoque, pagamento, notificacao }); }
  comprar(item, qtd, valor, cartao) {
    if (!this.estoque.reservar(item, qtd)) return { ok: false, motivo: 'sem estoque' };
    const p = this.pagamento.pagar({ valor, cartao });
    if (!p.aprovado) { this.estoque.liberar(item, qtd); return { ok: false, motivo: 'recusado' }; }
    this.notificacao.enviar('pedido ' + p.id);
    return { ok: true, id: p.id };
  }
}

export function comValidacao(objeto, regras) { // Proxy de validação
  return new Proxy(objeto, { set(alvo, chave, valor) { const r = regras[chave]; if (r && !r(valor)) throw new TypeError('valor inválido para ' + String(chave)); alvo[chave] = valor; return true; } });
}
export function carregamentoPreguicoso(criar) { // Proxy virtual: só cria quando usado
  let real = null; let criacoes = 0;
  const p = new Proxy({}, { get(_, k) { if (k === '__criacoes') return criacoes; if (!real) { real = criar(); criacoes++; } return real[k]; } });
  return p;
}

export class Arquivo { constructor(nome, tamanho) { this.nome = nome; this.tamanho = tamanho; } total() { return this.tamanho; } }
export class Pasta { constructor(nome, filhos = []) { this.nome = nome; this.filhos = filhos; } total() { return this.filhos.reduce((s, f) => s + f.total(), 0); } }
