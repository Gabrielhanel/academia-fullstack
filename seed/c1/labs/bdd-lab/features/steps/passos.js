const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('node:assert/strict');
const { Carrinho } = require('../../src/carrinho.js');
const centavos = (txt) => Math.round(parseFloat(txt.replace('.', '').replace(',', '.')) * 100);

Given(/^um carrinho com (\d+) item "([^"]+)" de R\$ ([\d.,]+)$/, function (qtd, nome, preco) {
  this.carrinho = new Carrinho().adicionar(nome, centavos(preco), Number(qtd));
});
When('eu calculo o total', function () { this.total = this.carrinho.total(); });
When('eu calculo o total com o cupom {string}', function (cupom) { this.total = this.carrinho.total(cupom); });
Then(/^o frete é R\$ ([\d.,]+)$/, function (valor) { assert.equal(this.carrinho.frete(), centavos(valor)); });
Then(/^o total é R\$ ([\d.,]+)$/, function (valor) { assert.equal(this.total, centavos(valor)); });
