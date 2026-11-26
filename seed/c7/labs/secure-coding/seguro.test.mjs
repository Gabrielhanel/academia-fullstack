import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import * as S from './seguro.mjs';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lab-sec-'));
fs.mkdirSync(path.join(tmp, 'base')); fs.writeFileSync(path.join(tmp, 'base', 'ola.txt'), 'olá público'); fs.writeFileSync(path.join(tmp, 'segredo.txt'), 'SEGREDO-SINTETICO-FORA-DA-BASE');
fs.symlinkSync(path.join(tmp, 'segredo.txt'), path.join(tmp, 'base', 'atalho.txt'));
const base = path.join(tmp, 'base');

test('Path traversal: ../ e symlink', () => {
  assert.equal(S.lerVulneravel(base, 'ola.txt'), 'olá público');
  assert.equal(S.lerVulneravel(base, '../segredo.txt'), 'SEGREDO-SINTETICO-FORA-DA-BASE');
  assert.equal(S.lerSeguro(base, 'ola.txt'), 'olá público');
  assert.throws(() => S.lerSeguro(base, '../segredo.txt'), /fora do diretório permitido/);
  assert.throws(() => S.lerSeguro(base, 'atalho.txt'), /symlink/);
  assert.throws(() => S.lerSeguro(base, 'ola.txt\0.png'), /nome inválido/);
  console.log('  traversal: vulnerável leu ../segredo.txt; corrigida recusou ../, symlink e byte nulo');
});
test('Injeção de comando: ; echo INJETADO', async () => {
  const p = 'x; echo INJETADO';
  const v = await S.checarVulneravel(p); assert.ok(v.split('\n').includes('INJETADO'));
  await assert.rejects(S.checarSeguro(p), /host inválido/);
  assert.equal(await S.checarSeguro('servidor.exemplo.test'), 'checando servidor.exemplo.test');
  console.log('  comando: vulnerável executou o segundo comando (linha "INJETADO"); corrigida recusou o host e usa execFile com argumentos');
});
test('Prototype pollution', () => {
  const carga = JSON.parse('{"__proto__":{"admin":true}}');
  try {
    S.mesclarVulneravel({}, carga); assert.equal(({}).admin, true);            // poluiu TODOS os objetos
  } finally { delete Object.prototype.admin; }
  S.mesclarSeguro({}, carga); assert.equal(({}).admin, undefined);
  const ok = S.mesclarSeguro({ a: { b: 1 } }, { a: { c: 2 }, d: 3 }); assert.deepEqual(ok, { a: { b: 1, c: 2 }, d: 3 });
  console.log('  poluição: vulnerável fez ({}).admin === true em objetos novos; corrigida ignorou __proto__ (mesclagem normal preservada)');
});
test('eval x parser', () => {
  assert.equal(S.calcularVulneravel('2+3*4'), 14);
  globalThis.__marca = 0; S.calcularVulneravel('globalThis.__marca = 1'); assert.equal(globalThis.__marca, 1); delete globalThis.__marca;
  assert.equal(S.calcularSeguro('2+3*4'), 14); assert.equal(S.calcularSeguro('(1+2)*(3-1)/2'), 3); assert.equal(S.calcularSeguro('-2+5'), 3);
  assert.throws(() => S.calcularSeguro('globalThis.__marca = 1'), /expressão inválida/);
  assert.throws(() => S.calcularSeguro('2+'), /expressão inválida/);
  assert.equal(globalThis.__marca, undefined);
  console.log('  eval: vulnerável executou código arbitrário (variável global alterada); parser aceita só números e operadores');
});
test('Dinheiro: float x centavos', () => {
  assert.notEqual(S.somarFloat([0.1, 0.2]), 0.3); assert.equal(S.somarCentavos([10, 20]), 30);
  console.log('  0,1 + 0,2 em float =', S.somarFloat([0.1, 0.2]), '| em centavos 10 + 20 =', S.somarCentavos([10, 20]));
});
test('ReDoS: corretude (tempos em redos.mjs)', () => {
  assert.equal(S.emailVulneravel('ana@exemplo.test'), true); assert.equal(S.emailSeguro('ana@exemplo.test'), true);
  assert.equal(S.emailSeguro('a'.repeat(300) + '@exemplo.test'), false);
});
test.after(() => fs.rmSync(tmp, { recursive: true, force: true }));
