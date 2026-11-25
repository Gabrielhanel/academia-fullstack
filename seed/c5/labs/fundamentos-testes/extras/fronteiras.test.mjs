// Testes que fecham os dois buracos revelados pela mutação (rodam só com: node mutacao-manual.mjs --com-extras).
import test from 'node:test';
import assert from 'node:assert/strict';
import { calcularTotal, validarCupom } from '../src/dominio.mjs';
test('cupom NATAL20 ainda vale no último dia', () => assert.equal(validarCupom('NATAL20', '2026-12-25').valido, true));
test('quantidade zero é inválida', () => assert.throws(() => calcularTotal([{ sku: 'A', preco: 1, qtd: 0 }]), /quantidade inválida: A/));
