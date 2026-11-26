import test from 'node:test';
import assert from 'node:assert/strict';
import { faixaDeDesconto, ehMaiorDeIdade, frete } from './calculos.mjs';
test('faixas de desconto', () => { assert.equal(faixaDeDesconto(2000), 0.15); assert.equal(faixaDeDesconto(700), 0.1); assert.equal(faixaDeDesconto(100), 0.05); assert.equal(faixaDeDesconto(0), 0); });
test('maioridade', () => { assert.equal(ehMaiorDeIdade(30), true); assert.equal(ehMaiorDeIdade(10), false); });
test('frete', () => { assert.equal(frete(3, false), 10); assert.equal(frete(10, false), 20); assert.equal(frete(3, true), 20); });
