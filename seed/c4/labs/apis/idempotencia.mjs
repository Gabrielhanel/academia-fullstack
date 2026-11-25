import express from 'express';
import crypto from 'node:crypto';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let cobrancas = 0;
const app = express(); app.use(express.json());
// sem chave
app.post('/ingenuo/pagamentos', async (req, res) => { await sleep(30); cobrancas++; res.status(201).json({ id: 'pg_' + cobrancas, valor: req.body.valor }); });
// com Idempotency-Key
const memoria = new Map();
const hash = (o) => crypto.createHash('sha256').update(JSON.stringify(o)).digest('hex').slice(0, 10);
app.post('/pagamentos', async (req, res) => {
  const chave = req.get('Idempotency-Key');
  if (!chave) return res.status(400).json({ erro: 'Idempotency-Key obrigatório' });
  const h = hash(req.body); const reg = memoria.get(chave);
  if (reg) {
    if (reg.hash !== h) return res.status(422).json({ erro: 'chave reutilizada com outro corpo' });
    if (reg.estado === 'em-andamento') return res.status(409).set('Retry-After', '1').json({ erro: 'requisição em andamento' });
    return res.status(reg.status).set('Idempotent-Replayed', 'true').json(reg.corpo);
  }
  memoria.set(chave, { hash: h, estado: 'em-andamento' });
  await sleep(30); cobrancas++;
  const corpo = { id: 'pg_' + cobrancas, valor: req.body.valor };
  memoria.set(chave, { hash: h, estado: 'concluido', status: 201, corpo });
  res.status(201).json(corpo);
});
const srv = await new Promise((ok) => { const s = app.listen(0, '127.0.0.1', () => ok(s)); }); const b = 'http://127.0.0.1:' + srv.address().port;
const post = async (p, corpo, chave) => { const r = await fetch(b + p, { method: 'POST', headers: { 'content-type': 'application/json', ...(chave ? { 'idempotency-key': chave } : {}) }, body: JSON.stringify(corpo) }); return { s: r.status, rep: r.headers.get('idempotent-replayed'), t: await r.text() }; };
console.log('== 1. retry sem chave de idempotência (o cliente não recebeu a resposta e repete)');
cobrancas = 0; await post('/ingenuo/pagamentos', { valor: 100 }); await post('/ingenuo/pagamentos', { valor: 100 });
console.log('duas tentativas do mesmo pagamento -> cobranças efetuadas:', cobrancas);
console.log('\n== 2. com Idempotency-Key');
cobrancas = 0; const a1 = await post('/pagamentos', { valor: 100 }, 'k-1'); const a2 = await post('/pagamentos', { valor: 100 }, 'k-1');
console.log('1ª:', a1.s, a1.t, '| 2ª (mesma chave e corpo):', a2.s, a2.t, '| replayed:', a2.rep, '| cobranças:', cobrancas);
const a3 = await post('/pagamentos', { valor: 999 }, 'k-1'); console.log('mesma chave com outro corpo:', a3.s, a3.t);
const a4 = await post('/pagamentos', { valor: 5 }); console.log('sem a chave:', a4.s, a4.t);
console.log('\n== 3. concorrência com a mesma chave (5 requisições simultâneas)');
cobrancas = 0; const rs = await Promise.all(Array.from({ length: 5 }, () => post('/pagamentos', { valor: 70 }, 'k-conc')));
console.log('status:', rs.map((r) => r.s).sort().join(' '), '| cobranças efetuadas:', cobrancas);
await sleep(100); const depois = await post('/pagamentos', { valor: 70 }, 'k-conc'); console.log('nova tentativa depois: ', depois.s, 'replayed:', depois.rep, '| cobranças:', cobrancas);
srv.close();

console.log('\n== 4. versionamento: URL x cabeçalho, e mudanças compatíveis x incompatíveis');
const api = express();
const v1 = (u) => ({ id: u.id, nome: u.nome }); const v2 = (u) => ({ id: u.id, nomeCompleto: u.nome + ' ' + u.sobrenome, nome: u.nome });
const usuario = { id: 1, nome: 'Ana', sobrenome: 'Silva' };
api.get('/v1/usuarios/1', (req, res) => { res.set('Deprecation', '@1767225600').set('Sunset', 'Wed, 01 Jul 2027 00:00:00 GMT').set('Link', '</v2/usuarios/1>; rel="successor-version"').json(v1(usuario)); });
api.get('/v2/usuarios/1', (req, res) => res.json(v2(usuario)));
api.get('/usuarios/1', (req, res) => { const v = /vnd\.exemplo\.v(\d+)\+json/.exec(req.get('accept') ?? '')?.[1] ?? '1'; res.set('Vary', 'Accept').set('Content-Type', 'application/vnd.exemplo.v' + v + '+json').send(JSON.stringify(v === '2' ? v2(usuario) : v1(usuario))); });
const s2 = await new Promise((ok) => { const s = api.listen(0, '127.0.0.1', () => ok(s)); }); const b2 = 'http://127.0.0.1:' + s2.address().port;
const g = async (p, h = {}) => { const r = await fetch(b2 + p, { headers: h }); return { s: r.status, h: r.headers, t: await r.text() }; };
let x = await g('/v1/usuarios/1'); console.log('/v1:', x.t, '| deprecation:', x.h.get('deprecation'), '| sunset:', x.h.get('sunset'), '| link:', x.h.get('link'));
x = await g('/v2/usuarios/1'); console.log('/v2:', x.t);
x = await g('/usuarios/1', { accept: 'application/vnd.exemplo.v2+json' }); console.log('Accept v2:', x.t, '| content-type:', x.h.get('content-type'), '| vary:', x.h.get('vary'));
x = await g('/usuarios/1'); console.log('sem Accept (padrão v1):', x.t);
const clienteAntigo = (corpo) => { const o = JSON.parse(corpo); return o.nome.toUpperCase(); };
console.log('cliente antigo lê a v2 (campo novo adicionado, nada removido):', clienteAntigo((await g('/v2/usuarios/1')).t), '→ compatível');
const v3SemNome = JSON.stringify({ id: 1, nomeCompleto: 'Ana Silva' });
try { clienteAntigo(v3SemNome); } catch (e) { console.log('cliente antigo lê uma versão que removeu "nome":', e.constructor.name + ': ' + e.message.slice(0, 60), '→ quebra'); }
s2.close();
