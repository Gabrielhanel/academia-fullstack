import test from 'node:test';
import assert from 'node:assert/strict';
import { criarServidor } from '../src/servidor.mjs';

async function comServidor(opcoes, fn) {
  const s = criarServidor(opcoes); const porta = await s.ouvir();
  try { await fn(`http://127.0.0.1:${porta}`, s); } finally { await s.fechar(); }
}
const post = (base, corpo) => fetch(base + '/pedidos', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(corpo) });
const relogioFixo = () => new Date('2026-11-25T10:00:00Z');

test('POST /pedidos cria, cobra e GET devolve o pedido persistido', async () => {
  const cobrancas = [];
  await comServidor({ relogio: relogioFixo, pagamento: { cobrar: async (c) => { cobrancas.push(c); return { aprovado: true }; } } }, async (base) => {
    const r = await post(base, { cliente: 'ana', itens: [{ sku: 'A', qtd: 2, preco: 10 }], cupom: 'bemvindo10' });
    assert.equal(r.status, 201);
    assert.deepEqual(await r.json(), { id: 1, status: 'pago', total: 18 });
    assert.deepEqual(cobrancas, [{ pedidoId: 1, valor: 18 }]);
    const g = await fetch(base + '/pedidos/1');
    assert.equal(g.status, 200);
    const p = await g.json();
    assert.equal(p.status, 'pago'); assert.equal(p.itens.length, 1);
  });
});
test('erros de validação viram 422 e rotas inexistentes 404', async () => {
  await comServidor({ relogio: relogioFixo }, async (base) => {
    const r1 = await post(base, { cliente: 'x', itens: [] });
    assert.equal(r1.status, 422); assert.deepEqual(await r1.json(), { erro: 'pedido sem itens' });
    const r2 = await post(base, { cliente: 'x', itens: [{ sku: 'A', qtd: 1, preco: 1 }], cupom: 'NATAL20' });
    assert.equal(r2.status, 201);
    const r3 = await post(base, { cliente: 'x', itens: [{ sku: 'A', qtd: 1, preco: 1 }], cupom: 'INEXISTENTE' });
    assert.deepEqual(await r3.json(), { erro: 'cupom desconhecido' });
    assert.equal((await fetch(base + '/pedidos/999')).status, 404);
    assert.equal((await fetch(base + '/nada')).status, 404);
  });
});
test('pagamento recusado mantém o pedido como novo', async () => {
  await comServidor({ relogio: relogioFixo, pagamento: { cobrar: async () => ({ aprovado: false }) } }, async (base, s) => {
    const r = await post(base, { cliente: 'x', itens: [{ sku: 'A', qtd: 1, preco: 5 }] });
    assert.deepEqual(await r.json(), { id: 1, status: 'novo', total: 5, motivo: 'pagamento recusado' });
    assert.deepEqual(s.repo.contarPorStatus(), { novo: 1 });
  });
});
