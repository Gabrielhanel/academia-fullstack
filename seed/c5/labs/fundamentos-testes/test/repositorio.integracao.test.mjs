import test from 'node:test';
import assert from 'node:assert/strict';
import { RepositorioPedidos } from '../src/repositorio.mjs';

const pedido = (extra = {}) => ({ cliente: 'ana', itens: [{ sku: 'A', qtd: 2, preco: 10 }, { sku: 'B', qtd: 1, preco: 5 }], total: 25, criadoEm: '2026-11-25T10:00:00.000Z', ...extra });
test('salva e relê com os itens na ordem de inserção (SQLite real em memória)', () => {
  const repo = new RepositorioPedidos();
  const id = repo.salvar(pedido());
  assert.deepEqual(repo.buscar(id), { id, cliente: 'ana', total: 25, status: 'novo', criadoEm: '2026-11-25T10:00:00.000Z', itens: [{ sku: 'A', qtd: 2, preco: 10 }, { sku: 'B', qtd: 1, preco: 5 }] });
  assert.equal(repo.buscar(999), null);
});
test('transação: um item inválido desfaz o pedido inteiro (ROLLBACK)', () => {
  const repo = new RepositorioPedidos();
  assert.throws(() => repo.salvar(pedido({ itens: [{ sku: 'A', qtd: 1, preco: 1 }, { sku: 'B', qtd: 0, preco: 1 }] })), /CHECK constraint failed/);
  assert.deepEqual(repo.contarPorStatus(), {});
});
test('restrições do banco: total negativo e status inválido são recusados', () => {
  const repo = new RepositorioPedidos();
  assert.throws(() => repo.salvar(pedido({ total: -1 })), /CHECK constraint failed/);
  repo.salvar(pedido());
  assert.throws(() => repo.db.exec("UPDATE pedidos SET status = 'xyz'"), /CHECK constraint failed/);
});
test('marcarPago é idempotente e contarPorStatus agrega', () => {
  const repo = new RepositorioPedidos();
  const a = repo.salvar(pedido()); repo.salvar(pedido());
  assert.equal(repo.marcarPago(a), 1);
  assert.equal(repo.marcarPago(a), 0);
  assert.deepEqual(repo.contarPorStatus(), { novo: 1, pago: 1 });
});
test('cascata: apagar o pedido remove os itens', () => {
  const repo = new RepositorioPedidos();
  const id = repo.salvar(pedido());
  repo.db.prepare('DELETE FROM pedidos WHERE id = ?').run(id);
  assert.equal(Number(repo.db.prepare('SELECT COUNT(*) AS n FROM itens').get().n), 0);
});
