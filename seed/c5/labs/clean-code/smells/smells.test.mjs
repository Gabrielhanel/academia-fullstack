import test from 'node:test';
import assert from 'node:assert/strict';
import * as A from './duplicado.mjs';
import * as B from './unificado.mjs';
const pedidos = [{ status: 'pago', valor: 10.1, frete: 2, imposto: 0.5 }, { status: 'cancelado', valor: 99, frete: 9, imposto: 9 }, { status: 'pago', valor: 20.2, frete: 3, imposto: 1.25 }];
for (const f of ['totalVendas', 'totalFretes', 'totalImpostos']) test('mesmo resultado: ' + f, () => assert.equal(B[f](pedidos), A[f](pedidos)));
test('valores', () => { assert.equal(B.totalVendas(pedidos), 30.3); assert.equal(B.totalImpostos(pedidos), 1.75); });
