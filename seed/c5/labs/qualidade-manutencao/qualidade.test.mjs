import test from 'node:test';
import assert from 'node:assert/strict';
import { calcularDora } from './dora.mjs';
import { orcamentoEmMinutos, taxaDeQueima, avaliarAlertas, orcamentoConsumidoPct } from './slo.mjs';
import { tamanhoDoPr, recomendacao } from './pr-tamanho.mjs';
import { complexidade, lerHistorico, ranking } from './hotspots.mjs';

test('DORA: valores simples', () => {
  const impl = [{ commit: '2026-01-05T00:00:00Z', implantadoEm: '2026-01-05T10:00:00Z', falhou: false }, { commit: '2026-01-06T00:00:00Z', implantadoEm: '2026-01-06T02:00:00Z', falhou: true }];
  const r = calcularDora(impl, [{ inicio: '2026-01-06T03:00:00Z', restaurado: '2026-01-06T04:30:00Z' }], '2026-01-05', '2026-01-12');
  assert.deepEqual(r, { frequenciaPorSemana: 2, leadTimeMedianoHoras: 6, taxaDeFalhaPct: 50, tempoMedianoDeRestauracaoHoras: 1.5 });
  assert.equal(calcularDora([], [], '2026-01-05', '2026-01-12').taxaDeFalhaPct, null);
});
test('SLO: orçamento e taxa de queima', () => {
  assert.equal(orcamentoEmMinutos(0.999, 30), 43.2);
  assert.equal(orcamentoEmMinutos(0.99, 30), 432);
  assert.equal(taxaDeQueima(1, 1000, 0.999), 1);
  assert.equal(Math.round(taxaDeQueima(144, 10000, 0.999) * 10) / 10, 14.4);
  assert.equal(taxaDeQueima(0, 0, 0.999), 0);
  assert.equal(orcamentoConsumidoPct(14.4, 1, 30), 2);
  assert.equal(orcamentoConsumidoPct(6, 6, 30), 5);
});
test('SLO: alertas de múltiplas janelas', () => {
  const j = (e, t) => ({ erros: e, total: t });
  assert.equal(avaliarAlertas({ h1: j(150, 10000), m5: j(20, 1000), h6: j(10, 10000), m30: j(1, 1000) }, 0.999).filas, 'pagina agora');
  assert.equal(avaliarAlertas({ h1: j(10, 10000), m5: j(1, 1000), h6: j(70, 10000), m30: j(7, 1000) }, 0.999).filas, 'abre chamado urgente');
  assert.equal(avaliarAlertas({ h1: j(150, 10000), m5: j(1, 1000), h6: j(10, 10000), m30: j(1, 1000) }, 0.999).filas, 'ok');
});
test('tamanho do PR', () => {
  assert.deepEqual(tamanhoDoPr(5, 3), { total: 8, tamanho: 'XS' });
  assert.equal(tamanhoDoPr(100, 100).tamanho, 'M');
  assert.equal(tamanhoDoPr(400, 101).tamanho, 'XL');
  assert.equal(recomendacao('L'), 'considere dividir');
});
test('hotspots: complexidade, leitura do histórico e ranking', () => {
  assert.equal(complexidade('if (a) { } else if (b && c) { }'), 4);
  const log = '@@Ana\n3\t1\tsrc/a.js\n@@Bia\n2\t0\tsrc/a.js\n1\t1\tsrc/b.js\n@@Ana\n-\t-\timg.png';
  const arq = lerHistorico(log);
  assert.equal(arq['src/a.js'].commits, 2); assert.equal(arq['src/a.js'].linhas, 6); assert.deepEqual(Object.keys(arq['src/a.js'].autores).sort(), ['Ana', 'Bia']);
  const r = ranking(arq, { 'src/a.js': 5, 'src/b.js': 20 });
  assert.deepEqual(r.map((x) => [x.nome, x.pontuacao]), [['src/b.js', 20], ['src/a.js', 10], ['img.png', 1]]);
  assert.equal(r[1].concentracao, 50);
});
