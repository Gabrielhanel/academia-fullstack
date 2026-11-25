import express from 'express';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
console.log('Node', process.version, '| Express', require('express/package.json').version);

console.log('\n== A. ordem de execução no event loop');
const ordem = [];
setTimeout(() => ordem.push('setTimeout 0'), 0);
setImmediate(() => ordem.push('setImmediate'));
process.nextTick(() => ordem.push('nextTick'));
Promise.resolve().then(() => ordem.push('promise.then'));
ordem.push('código síncrono');
await new Promise((r) => setTimeout(r, 50));
console.log(ordem.join(' -> '));

console.log('\n== B. módulos: ESM x CJS');
console.log('typeof require no ESM:', typeof require, '(criado com createRequire) | typeof __dirname:', typeof __dirname, '| import.meta.url começa com file://:', import.meta.url.startsWith('file://'));
const cjs = require('node:path'); console.log('require de um módulo do núcleo funciona:', typeof cjs.join);

const app = express();
const log = [];
app.use((req, res, next) => { log.push('mw1:' + req.path); next(); });
app.use(express.json());
app.use((req, res, next) => { log.push('mw2'); next(); });
app.get('/rapida', (req, res) => res.json({ ok: true }));
app.get('/async-erro', async (req, res) => { await Promise.resolve(); throw new Error('falha async'); });
app.get('/sync-erro', () => { throw new Error('falha sync'); });
app.get('/usuarios/:id', (req, res) => res.json({ id: req.params.id, query: req.query }));
app.post('/eco', (req, res) => res.json({ recebido: req.body ?? null }));
app.use((req, res) => res.status(404).json({ erro: 'não encontrado', caminho: req.path }));
app.use((err, req, res, next) => { log.push('erro:' + err.message); res.status(err.status || 500).json({ erro: err.status ? err.message : 'erro interno', status: err.status || 500 }); });
const srv = await new Promise((ok) => { const s = app.listen(0, '127.0.0.1', () => ok(s)); });
const base = 'http://127.0.0.1:' + srv.address().port;
const get = async (p, o) => { const t0 = performance.now(); const r = await fetch(base + p, o); const txt = await r.text(); return { status: r.status, txt, ms: performance.now() - t0 }; };

console.log('\n== C. Express 5: erros em handlers, rotas e parâmetros');
let r = await get('/async-erro'); console.log('handler async que lança:', r.status, r.txt);
r = await get('/sync-erro'); console.log('handler síncrono que lança:', r.status, r.txt);
r = await get('/usuarios/42?filtro=a&filtro=b&n=1'); console.log('params e query:', r.txt);
r = await get('/nao-existe'); console.log('404:', r.status, r.txt);
r = await get('/eco', { method: 'POST' }); console.log('POST sem corpo, req.body:', r.txt);
r = await get('/eco', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"a":1}' }); console.log('POST JSON válido:', r.txt);

console.log('\n== D/E. corpo inválido e grande');
r = await get('/eco', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{a:1' }); console.log('JSON malformado:', r.status, r.txt);
r = await get('/eco', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ x: 'a'.repeat(200 * 1024) }) }); console.log('corpo de ~200 KB (limite padrão 100 KB):', r.status, r.txt);
console.log('ordem dos middlewares na primeira requisição:', log.slice(0, 2).join(' -> '), '| mensagens de erro registradas:', log.filter((x) => x.startsWith('erro:')).length);

console.log('\n== F. sintaxe de rotas do Express 5');
const app2 = express();
app2.get('/arquivos/*caminho', (req, res) => res.json({ caminho: req.params.caminho }));
const s2 = await new Promise((ok) => { const s = app2.listen(0, '127.0.0.1', () => ok(s)); });
r = await fetch('http://127.0.0.1:' + s2.address().port + '/arquivos/a/b/c.txt'); console.log('/arquivos/*caminho:', await r.text());
try { express().get('/arquivos/*', () => {}); console.log('"/arquivos/*" aceito'); } catch (e) { console.log('"/arquivos/*" recusado:', e.message.split('\n')[0]); }
srv.close(); s2.close();
