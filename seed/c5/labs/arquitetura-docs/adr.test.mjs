import test from 'node:test';
import assert from 'node:assert/strict';
import { verificarDiretorio, verificarAdr, secao } from './adr-lint.mjs';

const base = (extra = {}) => ['# ADR-0001: Teste', '## Status', extra.status ?? 'Aceito', '## Data', extra.data ?? '2026-01-01', '## Contexto', 'c', '## Decisão', 'd', '## Alternativas consideradas', extra.alt ?? '- a\n- b', '## Consequências', extra.cons ?? 'Positiva: x. Negativa: y.'].map((l) => (l.startsWith('#') ? '\n' + l : l)).join('\n');
test('ADRs do exemplo são válidos e a cadeia de substituição é recíproca', () => {
  const r = verificarDiretorio(new URL('./adrs', import.meta.url).pathname);
  assert.equal(r.total, 0);
  assert.equal(r.adrs.length, 5);
  assert.deepEqual(r.adrs.map((a) => a.status), ['Aceito', 'Aceito', 'Substituído por ADR-0005', 'Rejeitado', 'Aceito']);
});
test('exemplos inválidos acumulam 9 problemas', () => {
  const r = verificarDiretorio(new URL('./exemplos-invalidos', import.meta.url).pathname);
  assert.equal(r.total, 9);
  assert.ok(r.globais.some((g) => /ADR-0099 inexistente/.test(g)));
});
test('regras individuais', () => {
  assert.deepEqual(verificarAdr('0001-teste.md', base()).erros, []);
  assert.match(verificarAdr('0001-teste.md', base({ status: 'Talvez' })).erros.join('|'), /status inválido/);
  assert.match(verificarAdr('0001-teste.md', base({ data: '1/2/2026' })).erros.join('|'), /data fora do formato/);
  assert.match(verificarAdr('0001-teste.md', base({ alt: '- só uma' })).erros.join('|'), /ao menos 2 alternativas/);
  assert.match(verificarAdr('0001-teste.md', base({ cons: 'Tudo ótimo.' })).erros.join('|'), /positivos e negativos/);
  assert.equal(verificarAdr('0001-teste.md', base({ status: 'Proposto', alt: '- só uma' })).erros.length, 0);
  assert.match(verificarAdr('adr1.md', base()).erros.join('|'), /nome do arquivo/);
  assert.match(verificarAdr('0002-teste.md', base()).erros.join('|'), /número do título/);
  assert.equal(secao('## A\nx\n## B\ny', 'B'), 'y');
});

import { gerarIndice } from './gerar-indice.mjs';
import { avaliar } from './matriz.mjs';
test('índice gerado a partir dos ADRs', () => {
  const md = gerarIndice(new URL('./adrs', import.meta.url).pathname);
  assert.equal(md.split('\n').length, 8);
  assert.match(md, /\| \[0003\]\(0003-cache-em-memoria\.md\) \| Cache em memória no processo da API \| Substituído por ADR-0005 \| 2026-03-16 \|/);
});
test('matriz de decisão: ranking, margem e validações', () => {
  const crit = [{ nome: 'operação', peso: 40 }, { nome: 'consistência', peso: 35 }, { nome: 'custo', peso: 25 }];
  const r = avaliar(crit, { monolito: { operação: 5, consistência: 5, custo: 4 }, microsservicos: { operação: 2, consistência: 3, custo: 2 }, hibrido: { operação: 4, consistência: 4, custo: 3 } });
  assert.deepEqual(r.ranking.map((x) => [x.nome, x.total]), [['monolito', 4.75], ['hibrido', 3.75], ['microsservicos', 2.35]]);
  assert.equal(r.margem, 1);
  assert.throws(() => avaliar([{ nome: 'a', peso: 50 }], { x: { a: 3 } }), /somar 100/);
  assert.throws(() => avaliar([{ nome: 'a', peso: 100 }], { x: { a: 6 } }), /nota inválida/);
});
