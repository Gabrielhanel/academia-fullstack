// Testes de caracterização: registram o que o código FAZ (não o que deveria fazer) e rodam contra as duas versões.
import test from 'node:test';
import assert from 'node:assert/strict';
import { proc as legado } from './legado/pedido.mjs';
import { proc as novo, subtotalDosItens, calcularFrete, aplicarDescontoFixo, calcularTotal } from './refatorado/pedido.mjs';

const it = (p, q) => ({ p, q });
const casos = [
  ['sem itens (undefined)', [undefined, 0, false, 'SP', 0], 0],
  ['lista vazia', [[], 0, false, 'SP', 0], 0],
  ['preço normal', [[it(100, 2)], 0, false, 'SP', 0], 200],
  ['perfil 1 (10%)', [[it(100, 2)], 1, false, 'SP', 0], 180],
  ['perfil 2 (20%)', [[it(100, 2)], 2, false, 'SP', 0], 160],
  ['perfil como texto "1" (quirk do ==)', [[it(100, 2)], '1', false, 'SP', 0], 180],
  ['quantidade zero ou negativa é ignorada', [[it(100, 0), it(50, -3), it(10, 1)], 0, false, 'SP', 0], 10],
  ['desconto fixo acima de 500', [[it(300, 2)], 0, false, 'SP', 0], 575],
  ['exatamente 500 não desconta', [[it(500, 1)], 0, false, 'SP', 0], 500],
  ['frete SP', [[it(100, 1)], 0, true, 'SP', 0], 110],
  ['frete RJ', [[it(100, 1)], 0, true, 'RJ', 0], 115],
  ['frete outros estados', [[it(100, 1)], 0, true, 'MG', 0], 130],
  ['frete grátis acima de 1000', [[it(1100, 1)], 0, true, 'MG', 0], 1075],
  ['frete só com true estrito ("true" é ignorado)', [[it(100, 1)], 0, 'true', 'SP', 0], 100],
  ['cupom', [[it(100, 1)], 0, false, 'SP', 30], 70],
  ['cupom maior que o total zera', [[it(100, 1)], 0, false, 'SP', 500], 0],
  ['arredondamento', [[it(0.1, 3)], 1, false, 'SP', 0], 0.27]
];
for (const [nome, args, esperado] of casos) {
  test('legado: ' + nome, () => assert.equal(legado(...args), esperado));
  test('refatorado (mesmo comportamento): ' + nome, () => assert.equal(novo(...args), esperado));
}
test('unidades novas: subtotal, desconto fixo e frete', () => {
  assert.equal(subtotalDosItens([it(10, 2), it(5, 0)], 2), 16);
  assert.equal(aplicarDescontoFixo(501), 476);
  assert.equal(calcularFrete(1000, 'SP'), 10);
  assert.equal(calcularFrete(1000.01, 'SP'), 0);
});
test('API nova com objeto nomeado', () => {
  assert.equal(calcularTotal({ itens: [it(100, 1)], perfil: 1, comFrete: true, uf: 'RJ', cupom: 5 }), 100);
});
