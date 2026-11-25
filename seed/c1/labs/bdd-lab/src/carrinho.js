class Carrinho {
  #itens = [];
  adicionar(nome, precoCentavos, qtd = 1) {
    if (!Number.isInteger(precoCentavos) || precoCentavos <= 0) throw new RangeError('preço inválido');
    if (!Number.isInteger(qtd) || qtd < 1) throw new RangeError('quantidade inválida');
    this.#itens.push({ nome, precoCentavos, qtd });
    return this;
  }
  get subtotal() { return this.#itens.reduce((s, i) => s + i.precoCentavos * i.qtd, 0); }
  frete() { return this.subtotal >= 20000 ? 0 : 1500; }
  total(cupom) {
    const desconto = cupom === 'PRIMEIRA10' ? Math.floor(this.subtotal * 0.10) : 0;
    return this.subtotal - desconto + this.frete();
  }
}
module.exports = { Carrinho };
