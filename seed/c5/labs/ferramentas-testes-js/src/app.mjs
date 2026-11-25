// API Express 5 (sem listen) para testes com Supertest.
import express from 'express';
import { ServicoPedidos } from './servico.mjs';
import { RepositorioPedidos } from './repositorio.mjs';
export function criarApp({ pagamento = { cobrar: async () => ({ aprovado: true }) }, notificador = { enviar: async () => {} }, relogio = () => new Date(), repo = new RepositorioPedidos() } = {}) {
  const servico = new ServicoPedidos({ repo, pagamento, notificador, relogio });
  const app = express();
  app.use(express.json({ limit: '10kb' }));
  app.post('/pedidos', async (req, res) => {
    try { res.status(201).json(await servico.criar(req.body)); } catch (e) { res.status(422).json({ erro: e.message }); }
  });
  app.get('/pedidos/:id', (req, res) => {
    const p = repo.buscar(Number(req.params.id));
    if (!p) return res.status(404).json({ erro: 'pedido não encontrado' });
    res.json(p);
  });
  app.use((err, req, res, next) => res.status(err.status || 500).json({ erro: err.type === 'entity.parse.failed' ? 'JSON inválido' : err.message }));
  return { app, repo, servico };
}
