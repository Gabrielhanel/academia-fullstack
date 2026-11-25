// Executa os trechos de exemplo das aulas nex-04, nex-05 e nex-07 (com repositório e pool simulados).
import express from 'express'; import helmet from 'helmet'; import cors from 'cors'; import { randomUUID } from 'node:crypto'; import { z } from 'zod';
const linhas = [];
const app = express();
app.disable('x-powered-by'); app.use(helmet()); app.use(cors({ origin: ['https://app.exemplo.com'] }));
app.use((req, res, next) => { req.id = req.get('x-request-id') ?? randomUUID(); res.set('x-request-id', req.id); const t0 = performance.now(); res.on('finish', () => linhas.push(JSON.stringify({ id: req.id, m: req.method, p: req.path, s: res.statusCode, ms: Math.round(performance.now() - t0) }))); next(); });
app.post('/uploads-json', express.json({ limit: '1mb' }), (req, res) => res.sendStatus(204));
app.use(express.json({ limit: '10kb' }));
app.post('/uploads-depois', express.json({ limit: '1mb' }), (req, res) => res.sendStatus(204));
export class ErroHttp extends Error { constructor(status, mensagem, detalhes) { super(mensagem); this.status = status; this.detalhes = detalhes; } }
const exigeJson = () => (req, res, next) => { if (!req.is('application/json')) return next(Object.assign(new Error('Content-Type deve ser application/json'), { status: 415 })); next(); };
app.post('/pedidos', exigeJson(), (req, res) => res.status(201).json({ ok: true }));
const repo = { buscar: async (id) => (id === '1' ? { id: 1 } : null) };
app.get('/pedidos/:id', async (req, res) => { const p = await repo.buscar(req.params.id); if (!p) throw new ErroHttp(404, 'pedido não encontrado'); res.json(p); });
app.get('/bug', () => { null.x; });
app.use((req, res) => res.status(404).json({ erro: 'não encontrado', caminho: req.path }));
const logsErro = [];
app.use((err, req, res, next) => { const status = err.status ?? 500; if (status >= 500) logsErro.push(JSON.stringify({ id: req.id, erro: err.message, stack: err.stack })); res.status(status).json({ erro: status >= 500 ? 'erro interno' : err.message, status, id: req.id }); });
const s = await new Promise((ok) => { const x = app.listen(0, '127.0.0.1', () => ok(x)); }); const b = 'http://127.0.0.1:' + s.address().port;
const f = async (p, o) => { const r = await fetch(b + p, o); return r.status + ' ' + (await r.text()).slice(0, 110); };
console.log('GET /pedidos/1 ->', await f('/pedidos/1'));
console.log('GET /pedidos/9 ->', await f('/pedidos/9'));
console.log('GET /bug ->', await f('/bug'), '| log interno tem stack:', logsErro[0].includes('stack'), '| resposta tem "stack":', (await (await fetch(b + '/bug')).text()).includes('stack'));
console.log('POST /pedidos sem content-type JSON ->', await f('/pedidos', { method: 'POST', headers: { 'content-type': 'text/plain' }, body: 'x' }));
console.log('POST /pedidos JSON ->', await f('/pedidos', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' }));
console.log('POST JSON de 20 KB (limite global 10 KB) ->', await f('/pedidos', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ x: 'a'.repeat(20000) }) }));
console.log('POST JSON de 20 KB em /uploads-json (limite 1 MB) ->', await f('/uploads-json', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ x: 'a'.repeat(20000) }) }));
console.log('POST JSON de 20 KB em /uploads-depois (parser de 1 MB registrado DEPOIS do global) ->', await f('/uploads-depois', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ x: 'a'.repeat(20000) }) }));
console.log('linhas de log de requisição:', linhas.length, '| exemplo:', linhas[0].replace(/"id":"[^"]+"/, '"id":"<uuid>"').replace(/"ms":\d+/, '"ms":N'));
s.close();
const env = z.object({ PORT: z.coerce.number().int().positive().default(3000), DATABASE_URL: z.string().url(), LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info') });
console.log('config válida:', JSON.stringify(env.parse({ DATABASE_URL: 'postgres://u:p@localhost:5432/db' })));
try { env.parse({ PORT: 'abc' }); } catch (e) { console.log('config inválida lança', e.constructor.name, 'com', e.issues.length, 'problemas:', e.issues.map((i) => i.path.join('.')).join(', ')); }
