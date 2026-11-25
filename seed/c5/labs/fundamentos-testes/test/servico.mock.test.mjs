import test, { mock } from 'node:test';
import assert from 'node:assert/strict';
import { ServicoPedidos } from '../src/servico.mjs';

const itens = [{ sku: 'A', preco: 10, qtd: 2 }];
const relogio = () => new Date('2026-11-25T10:00:00Z');
const montar = (extra = {}) => {
  const repo = { salvar: mock.fn(() => 7), marcarPago: mock.fn(() => 1) };
  const pagamento = { cobrar: mock.fn(async () => ({ aprovado: true })) };
  const notificador = { enviar: mock.fn(async () => {}) };
  return { repo, pagamento, notificador, servico: new ServicoPedidos({ repo, pagamento, notificador, relogio, ...extra }) };
};
test('mock/spy: verifica as interações (cobra o valor com desconto e notifica)', async () => {
  const { servico, pagamento, notificador, repo } = montar();
  const r = await servico.criar({ cliente: 'ana', itens, cupom: 'BEMVINDO10' });
  assert.deepEqual(r, { id: 7, status: 'pago', total: 18 });
  assert.deepEqual(pagamento.cobrar.mock.calls[0].arguments[0], { pedidoId: 7, valor: 18 });
  assert.equal(notificador.enviar.mock.callCount(), 1);
  assert.equal(notificador.enviar.mock.calls[0].arguments[1], 'Pedido 7 pago: R$ 18.00');
  assert.equal(repo.marcarPago.mock.callCount(), 1);
});
test('stub: pagamento recusado não marca como pago nem notifica', async () => {
  const { servico, pagamento, notificador, repo } = montar();
  pagamento.cobrar.mock.mockImplementation(async () => ({ aprovado: false }));
  assert.deepEqual(await servico.criar({ cliente: 'ana', itens }), { id: 7, status: 'novo', total: 20, motivo: 'pagamento recusado' });
  assert.equal(repo.marcarPago.mock.callCount(), 0);
  assert.equal(notificador.enviar.mock.callCount(), 0);
});
test('cupom inválido interrompe antes de qualquer efeito colateral', async () => {
  const { servico: s2, repo: r2, pagamento: p2 } = montar({ relogio: () => new Date('2026-12-30T00:00:00Z') });
  await assert.rejects(s2.criar({ cliente: 'ana', itens, cupom: 'NATAL20' }), /cupom expirado/);
  assert.equal(r2.salvar.mock.callCount(), 0); assert.equal(p2.cobrar.mock.callCount(), 0);
});
test('mock.timers: controla o tempo sem esperar', async () => {
  mock.timers.enable({ apis: ['setTimeout'] });
  let chamou = false;
  setTimeout(() => { chamou = true; }, 60000);
  mock.timers.tick(59999); assert.equal(chamou, false);
  mock.timers.tick(1); assert.equal(chamou, true);
  mock.timers.reset();
});
test('fake em vez de mock: o repositório real em memória dá um teste de estado robusto', async () => {
  const { RepositorioPedidos } = await import('../src/repositorio.mjs');
  const repo = new RepositorioPedidos();
  const servico = new ServicoPedidos({ repo, pagamento: { cobrar: async () => ({ aprovado: true }) }, notificador: { enviar: async () => {} }, relogio });
  const r = await servico.criar({ cliente: 'ana', itens });
  assert.equal(repo.buscar(r.id).status, 'pago');
});
