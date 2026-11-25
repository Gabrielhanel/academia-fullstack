import express from 'express';
import crypto from 'node:crypto';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const med = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
const sobe = (app) => new Promise((ok) => { const s = app.listen(0, '127.0.0.1', () => ok({ s, b: 'http://127.0.0.1:' + s.address().port })); });
let chamadasUsuarios = 0, chamadasPedidos = 0, pedidosModo = 'ok';
const usuarios = express(); usuarios.get('/:id', (req, res) => { chamadasUsuarios++; res.json({ id: Number(req.params.id), nome: 'Ana', visto: req.get('x-request-id') }); });
const pedidos = express(); pedidos.get('/:id', async (req, res) => { chamadasPedidos++; if (pedidosModo === 'lento') await sleep(400); if (pedidosModo === 'erro') return res.status(500).json({ erro: 'falha' }); res.json({ id: Number(req.params.id), total: 10 }); });
const U = await sobe(usuarios), P = await sobe(pedidos);

// gateway com roteamento, autenticação na borda, timeout, disjuntor e propagação de x-request-id
const rotas = { '/api/usuarios': U.b, '/api/pedidos': P.b };
const disjuntor = new Map(); const LIMITE = 3, ABERTO_MS = 400;
const gw = express();
gw.use((req, res, next) => { req.id = req.get('x-request-id') ?? crypto.randomUUID(); res.set('x-request-id', req.id); next(); });
gw.use((req, res, next) => { if (req.get('authorization') !== 'Bearer ok') return res.status(401).json({ erro: 'não autenticado' }); next(); });
gw.use(async (req, res) => {
  const prefixo = Object.keys(rotas).find((p) => req.path.startsWith(p)); if (!prefixo) return res.status(404).json({ erro: 'rota desconhecida' });
  const d = disjuntor.get(prefixo) ?? { falhas: 0, abertoAte: 0 }; disjuntor.set(prefixo, d);
  if (Date.now() < d.abertoAte) return res.status(503).set('Retry-After', '1').json({ erro: 'disjuntor aberto', upstream: prefixo });
  try {
    const r = await fetch(rotas[prefixo] + req.path.slice(prefixo.length), { signal: AbortSignal.timeout(100), headers: { 'x-request-id': req.id } });
    if (r.status >= 500) throw new Error('upstream ' + r.status);
    d.falhas = 0; res.status(r.status).type('application/json').send(await r.text());
  } catch (e) {
    d.falhas++; if (d.falhas >= LIMITE) { d.abertoAte = Date.now() + ABERTO_MS; d.falhas = 0; }
    res.status(e.name === 'TimeoutError' ? 504 : 502).json({ erro: e.name === 'TimeoutError' ? 'tempo esgotado no upstream' : 'falha no upstream' });
  }
});
const G = await sobe(gw);
const aut = { headers: { authorization: 'Bearer ok' } };
const get = async (u, o = aut) => { const t0 = performance.now(); const r = await fetch(u, o); const t = await r.text(); return { s: r.status, t, ms: performance.now() - t0, id: r.headers.get('x-request-id') }; };
console.log('== 1. roteamento, autenticação na borda e propagação do id');
let r = await get(G.b + '/api/usuarios/7'); console.log('GET /api/usuarios/7:', r.s, r.t, '| id devolvido pelo gateway:', !!r.id, '| o serviço viu o mesmo id:', JSON.parse(r.t).visto === r.id);
r = await get(G.b + '/api/usuarios/7', {}); console.log('sem token:', r.s, r.t, '| chamadas ao serviço de usuários:', chamadasUsuarios);
r = await get(G.b + '/api/nada/1'); console.log('rota desconhecida:', r.s, r.t);
console.log('\n== 2. sobrecarga do gateway (200 requisições sequenciais, mediana)');
const medir = async (url, o) => { const a = []; for (let i = 0; i < 200; i++) a.push((await get(url, o)).ms); return med(a); };
const direto = await medir(U.b + '/7', {}); const via = await medir(G.b + '/api/usuarios/7');
console.log('direto ao serviço:', direto.toFixed(2), 'ms | via gateway:', via.toFixed(2), 'ms | custo do salto extra:', (via - direto).toFixed(2), 'ms');
console.log('\n== 3. timeout e disjuntor (timeout 100 ms, disjuntor após 3 falhas, aberto 400 ms)');
pedidosModo = 'lento'; chamadasPedidos = 0; const seq = [];
for (let i = 0; i < 6; i++) { const x = await get(G.b + '/api/pedidos/1'); seq.push(x.s + '(' + x.ms.toFixed(0) + 'ms)'); }
console.log('upstream lento (400 ms):', seq.join(' '), '| chamadas que chegaram ao upstream:', chamadasPedidos, 'de 6 tentativas');
pedidosModo = 'ok'; await sleep(450); chamadasPedidos = 0; r = await get(G.b + '/api/pedidos/1'); console.log('depois de 450 ms e com o upstream recuperado:', r.s, r.t, '| chamadas ao upstream:', chamadasPedidos);
console.log('\n== 4. teste de contrato do consumidor (o gateway espera id numérico e total numérico)');
const contrato = (o) => typeof o.id === 'number' && typeof o.total === 'number';
console.log('resposta atual do serviço de pedidos cumpre o contrato:', contrato(JSON.parse((await get(G.b + '/api/pedidos/1')).t)));
pedidosModo = 'ok'; const quebrado = { id: '1', total: '10.00' }; console.log('versão que passou a devolver textos cumpre o contrato:', contrato(quebrado), '→ o teste de contrato falharia no pipeline do provedor');
U.s.close(); P.s.close(); G.s.close();
