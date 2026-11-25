class Dinheiro {
  #c;
  constructor(centavos) { if (!Number.isInteger(centavos) || centavos < 0) throw new RangeError('valor inválido'); this.#c = centavos; Object.freeze(this); }
  static de(reais) { return new Dinheiro(Math.round(reais * 100)); }
  somar(o) { return new Dinheiro(this.#c + o.#c); }
  vezes(n) { return new Dinheiro(this.#c * n); }
  igual(o) { return o instanceof Dinheiro && o.#c === this.#c; }
  get centavos() { return this.#c; }
  toString() { return 'R$ ' + (this.#c / 100).toFixed(2).replace('.', ','); }
}
class ItemPedido {
  constructor(produtoId, preco, qtd) { if (!Number.isInteger(qtd) || qtd < 1) throw new RangeError('quantidade inválida'); this.produtoId = produtoId; this.preco = preco; this.qtd = qtd; Object.freeze(this); }
  get total() { return this.preco.vezes(this.qtd); }
}
// Agregado: Pedido é a raiz; itens só mudam por ele
class Pedido {
  static LIMITE_ITENS = 3;
  #id; #itens = []; #status = 'ABERTO'; #eventos = [];
  constructor(id) { this.#id = id; }
  get id() { return this.#id; }
  get status() { return this.#status; }
  get itens() { return [...this.#itens]; }
  get total() { return this.#itens.reduce((s, i) => s.somar(i.total), new Dinheiro(0)); }
  adicionar(produtoId, preco, qtd) {
    if (this.#status !== 'ABERTO') throw new Error('pedido não está aberto');
    const ja = this.#itens.find((i) => i.produtoId === produtoId);
    if (ja) { this.#itens[this.#itens.indexOf(ja)] = new ItemPedido(produtoId, ja.preco, ja.qtd + qtd); }
    else { if (this.#itens.length >= Pedido.LIMITE_ITENS) throw new Error('limite de itens do pedido'); this.#itens.push(new ItemPedido(produtoId, preco, qtd)); }
    return this;
  }
  confirmar() {
    if (this.#status !== 'ABERTO') throw new Error('pedido não está aberto');
    if (this.#itens.length === 0) throw new Error('pedido vazio');
    this.#status = 'CONFIRMADO';
    this.#eventos.push({ tipo: 'PedidoConfirmado', pedidoId: this.#id, total: this.total.centavos });
    return this;
  }
  eventosPendentes() { const e = this.#eventos; this.#eventos = []; return e; }
}
class RepositorioPedidos { #m = new Map(); salvar(p) { this.#m.set(p.id, p); } obter(id) { const p = this.#m.get(id); if (!p) throw new Error('pedido não encontrado: ' + id); return p; } }

const repo = new RepositorioPedidos();
const p = new Pedido('P1').adicionar('caneta', Dinheiro.de(3.5), 2).adicionar('caderno', Dinheiro.de(15), 1).adicionar('caneta', Dinheiro.de(3.5), 1);
repo.salvar(p);
console.log(String(p.total), p.itens.map((i) => i.produtoId + ' x' + i.qtd).join(', '));
p.confirmar();
console.log(p.status, JSON.stringify(p.eventosPendentes()), p.eventosPendentes().length);
const tenta = (f) => { try { f(); return 'ok'; } catch (e) { return e.message; } };
console.log(tenta(() => p.adicionar('mouse', Dinheiro.de(40), 1)), '|', tenta(() => new Pedido('P2').confirmar()), '|', tenta(() => new Pedido('P3').adicionar('a', Dinheiro.de(1), 1).adicionar('b', Dinheiro.de(1), 1).adicionar('c', Dinheiro.de(1), 1).adicionar('d', Dinheiro.de(1), 1)));
const itens = p.itens; itens.pop(); console.log(p.itens.length);
console.log(Dinheiro.de(1).igual(new Dinheiro(100)), repo.obter('P1') === p, tenta(() => repo.obter('X')));
