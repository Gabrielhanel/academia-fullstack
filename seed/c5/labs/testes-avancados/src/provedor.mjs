// API provedora (Express 5): clientes, saúde e um relatório intensivo em CPU para os testes de carga.
import express from 'express';
const CLIENTES = { 1: { id: 1, nome: 'Ana Souza', email: 'ana@exemplo.com', vip: true }, 2: { id: 2, nome: 'Bruno Lima', email: 'bruno@exemplo.com', vip: false } };
export function criarProvedor({ campoNome = 'nome' } = {}) {
  const app = express();
  app.get('/saude', (req, res) => res.json({ ok: true }));
  app.get('/clientes/:id', (req, res) => {
    const c = CLIENTES[req.params.id];
    if (!c) return res.status(404).json({ erro: 'cliente não encontrado' });
    const { nome, ...resto } = c;
    res.json({ ...resto, [campoNome]: nome });
  });
  app.get('/relatorio', (req, res) => {
    const n = Math.min(Number(req.query.n) || 200000, 5000000);
    let s = 0; for (let i = 1; i <= n; i++) s += Math.sqrt(i) * Math.sin(i);   // trabalho síncrono (bloqueia o event loop)
    res.json({ n, soma: Math.round(s * 1000) / 1000 });
  });
  return app;
}
