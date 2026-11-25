import test from 'node:test';
import assert from 'node:assert/strict';
import fc from 'fast-check';
import { calcularTotal, validarCupom, arredondar } from '../src/dominio.mjs';

test('AAA: total simples com desconto', () => {
  // Arrange
  const itens = [{ sku: 'A', preco: 10, qtd: 2 }, { sku: 'B', preco: 5.5, qtd: 1 }];
  // Act
  const total = calcularTotal(itens, { desconto: 0.1 });
  // Assert
  assert.equal(total, 22.95);
});
for (const [nome, itens, opcoes, esperado] of [
  ['sem desconto', [{ sku: 'A', preco: 10, qtd: 3 }], {}, 30],
  ['desconto acima de 100% é limitado', [{ sku: 'A', preco: 10, qtd: 1 }], { desconto: 5 }, 0],
  ['desconto negativo é ignorado', [{ sku: 'A', preco: 10, qtd: 1 }], { desconto: -1 }, 10],
  ['arredondamento em centavos', [{ sku: 'A', preco: 0.1, qtd: 3 }], {}, 0.3]
]) test('parametrizado: ' + nome, () => assert.equal(calcularTotal(itens, opcoes), esperado));
for (const [nome, entrada, msg] of [
  ['lista vazia', [], /pedido sem itens/],
  ['preço negativo', [{ sku: 'X', preco: -1, qtd: 1 }], /preço inválido: X/],
  ['quantidade fracionada', [{ sku: 'Y', preco: 1, qtd: 1.5 }], /quantidade inválida: Y/]
]) test('erro: ' + nome, () => assert.throws(() => calcularTotal(entrada), msg));
test('cupom: válido, expirado e desconhecido', () => {
  assert.deepEqual(validarCupom('natal20', '2026-12-01'), { valido: true, desconto: 0.2 });
  assert.deepEqual(validarCupom('NATAL20', '2026-12-26'), { valido: false, motivo: 'cupom expirado' });
  assert.deepEqual(validarCupom('X', '2026-12-01'), { valido: false, motivo: 'cupom desconhecido' });
  assert.deepEqual(validarCupom(undefined, '2026-12-01'), { valido: false, motivo: 'cupom desconhecido' });
});
const item = fc.record({ sku: fc.string({ minLength: 1, maxLength: 3 }), preco: fc.integer({ min: 0, max: 100000 }).map((c) => c / 100), qtd: fc.integer({ min: 1, max: 20 }) });
test('propriedade: o total nunca é negativo nem maior que o bruto', () => {
  fc.assert(fc.property(fc.array(item, { minLength: 1, maxLength: 8 }), fc.double({ min: -2, max: 3, noNaN: true }), (itens, d) => {
    const bruto = arredondar(itens.reduce((s, i) => s + i.preco * i.qtd, 0));
    const t = calcularTotal(itens, { desconto: d });
    return t >= 0 && t <= bruto + 0.01;
  }), { numRuns: 500, seed: 42 });
});
test('propriedade: a ordem dos itens não altera o total (com tolerância de 1 centavo)', () => {
  fc.assert(fc.property(fc.array(item, { minLength: 1, maxLength: 8 }), (itens) => Math.abs(calcularTotal(itens) - calcularTotal([...itens].reverse())) <= 0.01), { numRuns: 500, seed: 42 });
});
test('propriedade que FALHA: soma de floats não é exata (contraexemplo reduzido pelo fast-check)', () => {
  let falhou = null;
  try { fc.assert(fc.property(fc.array(fc.double({ min: 0, max: 1, noNaN: true }), { minLength: 2, maxLength: 5 }), (xs) => xs.reduce((a, b) => a + b, 0) === [...xs].reverse().reduce((a, b) => a + b, 0)), { seed: 7, numRuns: 1000 }); }
  catch (e) { falhou = e; }
  assert.ok(falhou, 'esperava um contraexemplo');
  assert.match(String(falhou.message), /Property failed after \d+ tests/);
});
