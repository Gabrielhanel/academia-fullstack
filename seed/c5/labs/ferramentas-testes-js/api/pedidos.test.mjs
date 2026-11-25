import { describe, test, expect } from 'vitest';
import request from 'supertest';
import { criarApp } from '../src/app.mjs';

const relogio = () => new Date('2026-11-25T10:00:00Z');
const corpo = (extra = {}) => ({ cliente: 'ana', itens: [{ sku: 'A', qtd: 2, preco: 10 }], ...extra });

describe('API de pedidos (Express 5 + Supertest, sem abrir porta manualmente)', () => {
  test('POST /pedidos cria, cobra e o GET devolve o pedido persistido', async () => {
    const cobrancas = [];
    const { app } = criarApp({ relogio, pagamento: { cobrar: async (c) => { cobrancas.push(c); return { aprovado: true }; } } });
    const r = await request(app).post('/pedidos').send(corpo({ cupom: 'bemvindo10' })).expect('Content-Type', /json/).expect(201);
    expect(r.body).toEqual({ id: 1, status: 'pago', total: 18 });
    expect(cobrancas).toEqual([{ pedidoId: 1, valor: 18 }]);
    const g = await request(app).get('/pedidos/1').expect(200);
    expect(g.body).toMatchObject({ id: 1, status: 'pago', cliente: 'ana' });
    expect(g.body.itens).toHaveLength(1);
  });
  test('validação: 422 com mensagem e 404 para inexistentes', async () => {
    const { app } = criarApp({ relogio });
    await request(app).post('/pedidos').send({ cliente: 'x', itens: [] }).expect(422, { erro: 'pedido sem itens' });
    await request(app).post('/pedidos').send(corpo({ cupom: 'INEXISTENTE' })).expect(422, { erro: 'cupom desconhecido' });
    await request(app).get('/pedidos/999').expect(404, { erro: 'pedido não encontrado' });
    await request(app).get('/nada').expect(404);
  });
  test('corpo JSON inválido vira 400 e payload grande vira 413 (limite de 10 kb)', async () => {
    const { app } = criarApp({ relogio });
    const ruim = await request(app).post('/pedidos').set('content-type', 'application/json').send('{"cliente": ');
    expect(ruim.status).toBe(400);
    expect(ruim.body).toEqual({ erro: 'JSON inválido' });
    const grande = await request(app).post('/pedidos').send({ cliente: 'x'.repeat(20000), itens: [] });
    expect(grande.status).toBe(413);
  });
  test('pagamento recusado mantém o pedido como novo', async () => {
    const { app, repo } = criarApp({ relogio, pagamento: { cobrar: async () => ({ aprovado: false }) } });
    const r = await request(app).post('/pedidos').send(corpo()).expect(201);
    expect(r.body).toEqual({ id: 1, status: 'novo', total: 20, motivo: 'pagamento recusado' });
    expect(repo.contarPorStatus()).toEqual({ novo: 1 });
  });
  test('várias requisições em paralelo mantêm ids distintos', async () => {
    const { app } = criarApp({ relogio });
    const rs = await Promise.all([1, 2, 3].map((n) => request(app).post('/pedidos').send(corpo({ cliente: 'c' + n }))));
    expect(rs.map((r) => r.body.id).sort()).toEqual([1, 2, 3]);
  });
});
