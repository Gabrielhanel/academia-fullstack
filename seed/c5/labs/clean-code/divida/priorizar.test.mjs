import test from 'node:test';
import assert from 'node:assert/strict';
import { priorizar } from './priorizar.mjs';
test('ordena por payback e trata juros zero', () => {
  const r = priorizar([{ id: 'a', esforcoDias: 1, mudancasPorMes: 4, minutosExtraPorMudanca: 30 }, { id: 'b', esforcoDias: 1, mudancasPorMes: 0, minutosExtraPorMudanca: 30 }, { id: 'c', esforcoDias: 2, mudancasPorMes: 20, minutosExtraPorMudanca: 30 }]);
  assert.deepEqual(r.map((x) => x.id), ['c', 'a', 'b']);
  assert.equal(r[0].jurosHorasMes, 10); assert.equal(r[0].paybackMeses, 1.6);
  assert.equal(r[2].paybackMeses, null);
});
