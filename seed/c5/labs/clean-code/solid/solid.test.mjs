import test from 'node:test';
import assert from 'node:assert/strict';
import * as S from './solid.mjs';

test('SRP: o monólito mistura cálculo, formato e armazenamento; as partes testam isoladas', () => {
  assert.equal(new S.RelatorioMonolito([10, 5.5]).gerar(), 'Total: R$ 15.50');
  assert.equal(S.somar([10, 5.5]), 15.5);
  assert.equal(S.formatarTotal(15.5), 'Total: R$ 15.50');
  const a = new S.ArmazemEmMemoria(); a.salvar('x'); assert.deepEqual(a.itens, ['x']);
});
test('OCP: o switch exige editar a função; o registro aceita regras novas sem alterar o código existente', () => {
  assert.equal(S.descontoSwitch('estudante', 100), 100);
  const d = S.criarDescontos({ vip: (v) => v * 0.8 });
  assert.equal(d.aplicar('estudante', 100), 100);
  d.registrar('estudante', (v) => v * 0.5);
  assert.equal(d.aplicar('estudante', 100), 50);
  assert.equal(d.aplicar('vip', 100), 80);
});
test('LSP: um Quadrado não pode substituir um Retangulo; formas imutáveis respeitam o contrato', () => {
  const usar = (r) => { r.setLargura(5); r.setAltura(4); return r.area(); };
  assert.equal(usar(new S.Retangulo(1, 1)), 20);
  assert.equal(usar(new S.Quadrado(1, 1)), 16);
  assert.equal(S.retangulo(5, 4).area(), 20);
  assert.equal(S.quadrado(4).area(), 16);
});
test('ISP: o robô com interface gorda quebra ao comer; interfaces pequenas evitam o método inútil', () => {
  assert.throws(() => S.comedor(new S.RoboGordo()), /robô não come/);
  assert.equal(S.funcionarioQueTrabalha(new S.Robo()), 'trabalhando');
  assert.equal(S.comedor(new S.Humano()), 'comendo');
});
test('DIP: com o relógio injetado o teste é determinístico', () => {
  const repo = { todos: () => [{ data: '2026-11-25', t: 'a' }, { data: '2026-11-26', t: 'b' }] };
  const s = new S.ServicoLembrete({ relogio: () => new Date('2026-11-25T10:00:00Z'), repositorio: repo });
  assert.deepEqual(s.deHoje().map((l) => l.t), ['a']);
  const acoplado = new S.LembreteAcoplado();
  const hoje = new Date().toISOString().slice(0, 10);
  assert.equal(acoplado.lembretesDeHoje([{ data: hoje }, { data: '1999-01-01' }]).length, 1);
});
