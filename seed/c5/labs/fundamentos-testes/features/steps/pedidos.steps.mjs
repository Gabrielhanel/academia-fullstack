import { Given, When, Then, Before } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { ServicoPedidos } from '../../src/servico.mjs';
import { RepositorioPedidos } from '../../src/repositorio.mjs';

const moeda = (txt) => Number(String(txt).replace(',', '.'));
Before(function () { this.hoje = '2026-11-25'; this.aprova = true; this.cobrancas = []; this.notificacoes = []; this.resultado = null; this.erro = null; });
Given('que hoje é {string}', function (data) { this.hoje = data; });
Given('o gateway de pagamento aprova as cobranças', function () { this.aprova = true; });
Given('o gateway de pagamento recusa as cobranças', function () { this.aprova = false; });
async function comprar(mundo, cliente, qtd, sku, preco, cupom) {
  const servico = new ServicoPedidos({ repo: new RepositorioPedidos(), relogio: () => new Date(mundo.hoje + 'T10:00:00Z'),
    pagamento: { cobrar: async (c) => { mundo.cobrancas.push(c); return { aprovado: mundo.aprova }; } },
    notificador: { enviar: async (para, msg) => { mundo.notificacoes.push({ para, msg }); } } });
  try { mundo.resultado = await servico.criar({ cliente, itens: [{ sku, qtd, preco }], cupom }); } catch (e) { mundo.erro = e.message; }
}
When('a cliente {string} compra {int} unidades de {string} a R$ {word}', async function (cliente, qtd, sku, preco) { await comprar(this, cliente, qtd, sku, moeda(preco)); });
When('a cliente {string} compra {int} unidades de {string} a R$ {word} com o cupom {string}', async function (cliente, qtd, sku, preco, cupom) { await comprar(this, cliente, qtd, sku, moeda(preco), cupom); });
Then('o pedido fica {string} com total de R$ {word}', function (status, total) { assert.equal(this.resultado.status, status); assert.equal(this.resultado.total, moeda(total)); });
Then('a cliente recebe a notificação {string}', function (msg) { assert.equal(this.notificacoes.at(-1).msg, msg); });
Then('a compra é recusada com a mensagem {string}', function (msg) { assert.equal(this.erro, msg); });
Then('nenhuma cobrança é feita', function () { assert.equal(this.cobrancas.length, 0); });
Then('nenhuma notificação é enviada', function () { assert.equal(this.notificacoes.length, 0); });
