import { test } from 'vitest';
import { strict as assert } from 'node:assert';
import { faixaDeDesconto, ehMaiorDeIdade, frete } from './calculos.mjs';
test('faixas de desconto', () => { assert.equal(faixaDeDesconto(2000), 0.15); assert.equal(faixaDeDesconto(700), 0.1); assert.equal(faixaDeDesconto(100), 0.05); assert.equal(faixaDeDesconto(0), 0); });
test('maioridade', () => { assert.equal(ehMaiorDeIdade(30), true); assert.equal(ehMaiorDeIdade(10), false); });
test('frete', () => { assert.equal(frete(3, false), 10); assert.equal(frete(10, false), 20); assert.equal(frete(3, true), 20); });

import { formatarMoeda } from './calculos.mjs';
test('fronteiras do desconto', () => { assert.equal(faixaDeDesconto(1000), 0.15); assert.equal(faixaDeDesconto(999.99), 0.1); assert.equal(faixaDeDesconto(500), 0.1); assert.equal(faixaDeDesconto(499.99), 0.05); assert.equal(faixaDeDesconto(0.01), 0.05); assert.equal(faixaDeDesconto(-1), 0); });
test('fronteira da maioridade', () => { assert.equal(ehMaiorDeIdade(18), true); assert.equal(ehMaiorDeIdade(17), false); });
test('fronteiras do frete', () => { assert.throws(() => frete(0, false), /peso inválido/); assert.throws(() => frete(-1, true), /peso inválido/); assert.equal(frete(5, false), 10); assert.equal(frete(6, false), 12); assert.equal(frete(0.5, true), 20); });
test('formatarMoeda', () => { assert.equal(formatarMoeda(1234.5), 'R$ 1234,50'); });
