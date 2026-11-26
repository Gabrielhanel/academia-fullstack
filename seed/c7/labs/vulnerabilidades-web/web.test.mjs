import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { criarWeb, iniciar, criarInterno } from './web.mjs';
import { ipPrivado, validarUrl, seguroFetch } from './ssrf.mjs';

const V = criarWeb({ seguro: false }), S = criarWeb({ seguro: true }), I = criarInterno();
let bv, bs, bi;
before(async () => { bv = await iniciar(V); bs = await iniciar(S); bi = await I.iniciar(); S.origens = [bs]; });
after(() => { V.server.close(); S.server.close(); I.server.close(); });
const rq = async (base, path, { m = 'GET', body, tipo = 'json', cookie, headers = {} } = {}) => {
  const h = { ...(cookie ? { cookie } : {}), ...headers }; let corpo;
  if (body !== undefined) { if (tipo === 'json') { h['content-type'] = 'application/json'; corpo = JSON.stringify(body); } else { h['content-type'] = 'application/x-www-form-urlencoded'; corpo = new URLSearchParams(body).toString(); } }
  const res = await fetch(base + path, { method: m, headers: h, body: corpo, redirect: 'manual' });
  const t = await res.text(); let j; try { j = JSON.parse(t); } catch { j = t; } return { st: res.status, j, h: res.headers, t };
};
const entrar = async (base) => { const r = await rq(base, '/login', { m: 'POST', body: { email: 'ana@exemplo.test', senha: 'ana-senha-1' } }); return { cookie: r.h.get('set-cookie').split(';')[0], csrf: r.j.csrf, r }; };

test('SQLi: bypass de login com OR 1=1', async () => {
  const p = { email: "ana@exemplo.test' OR '1'='1' -- ", senha: 'qualquer' };
  const v = await rq(bv, '/login', { m: 'POST', body: p }), s = await rq(bs, '/login', { m: 'POST', body: p });
  assert.equal(v.st, 200); assert.equal(s.st, 401); console.log('  bypass de login: vulnerável', v.st, '| corrigida', s.st);
});
test('SQLi: UNION extrai e-mails e senhas', async () => {
  const c = encodeURIComponent("x' UNION SELECT id, email || ':' || senha, 0 FROM usuarios -- ");
  const v = await rq(bv, '/produtos?categoria=' + c), s = await rq(bs, '/produtos?categoria=' + c);
  assert.ok(JSON.stringify(v.j).includes('ana-senha-1')); assert.deepEqual(s.j, []);
  console.log('  UNION: vulnerável devolveu', v.j.length, 'linhas com credenciais | corrigida', s.j.length);
});
test('SQLi: ORDER BY não é parametrizável; vazamento por erro x lista de permissão', async () => {
  const v = await rq(bv, '/produtos?categoria=livros&ordem=coluna_inexistente'), s = await rq(bs, '/produtos?categoria=livros&ordem=coluna_inexistente');
  assert.equal(v.st, 500); assert.ok(String(v.j.erro).includes('coluna_inexistente')); assert.equal(s.st, 400);
  const ok = await rq(bs, '/produtos?categoria=livros&ordem=preco'); assert.equal(ok.st, 200);
  console.log('  ordem inválida: vulnerável', v.st, '(mensagem do banco:', JSON.stringify(v.j.erro) + ') | corrigida', s.st);
});
test('XSS refletido e armazenado: HTML cru x escapado + cabeçalhos', async () => {
  const x = '<script>alert(1)</script>';
  const v = await rq(bv, '/ola?nome=' + encodeURIComponent(x)), s = await rq(bs, '/ola?nome=' + encodeURIComponent(x));
  assert.ok(v.t.includes(x)); assert.ok(!s.t.includes(x)); assert.ok(s.t.includes('&lt;script&gt;'));
  assert.ok(s.h.get('content-security-policy').includes("script-src 'self'")); assert.equal(v.h.get('content-security-policy'), null);
  await rq(bv, '/comentarios', { m: 'POST', body: { autor: 'x', texto: '<img src=x onerror=alert(2)>' } }); await rq(bs, '/comentarios', { m: 'POST', body: { autor: 'x', texto: '<img src=x onerror=alert(2)>' } });
  const cv = await rq(bv, '/comentarios'), cs = await rq(bs, '/comentarios');
  assert.ok(cv.t.includes('<img src=x onerror')); assert.ok(!cs.t.includes('<img src=x'));
  console.log('  XSS: payload cru na vulnerável; escapado e com CSP na corrigida (script-src self; nosniff)');
});
test('Cookies: HttpOnly e SameSite', async () => {
  const v = await entrar(bv), s = await entrar(bs);
  const cv = v.r.h.get('set-cookie'), cs = s.r.h.get('set-cookie');
  assert.ok(!/HttpOnly/i.test(cv)); assert.ok(/HttpOnly/i.test(cs) && /SameSite=Strict/i.test(cs));
  console.log('  Set-Cookie vulnerável:', cv.replace(/sid=[a-f0-9]+/, 'sid=<…>'), '| corrigida:', cs.replace(/sid=[a-f0-9]+/, 'sid=<…>'));
});
test('CSRF: transferência sem token (formulário urlencoded) x token e JSON', async () => {
  const v = await entrar(bv), s = await entrar(bs);
  const a = await rq(bv, '/transferir', { m: 'POST', tipo: 'form', body: { para: 2, valor: 100 }, cookie: v.cookie });
  const b = await rq(bs, '/transferir', { m: 'POST', tipo: 'form', body: { para: 2, valor: 100 }, cookie: s.cookie });
  const c = await rq(bs, '/transferir', { m: 'POST', body: { para: 2, valor: 100 }, cookie: s.cookie });
  const d = await rq(bs, '/transferir', { m: 'POST', body: { para: 2, valor: 100 }, cookie: s.cookie, headers: { 'x-csrf-token': s.csrf, origin: 'http://evil.test' } });
  const e = await rq(bs, '/transferir', { m: 'POST', body: { para: 2, valor: 100 }, cookie: s.cookie, headers: { 'x-csrf-token': s.csrf } });
  assert.equal(a.st, 200); assert.equal(b.st, 415); assert.equal(c.st, 403); assert.equal(d.st, 403); assert.equal(e.st, 200);
  console.log('  CSRF: vulnerável', a.st, '| corrigida form', b.st, ', JSON sem token', c.st, ', token + Origin estranha', d.st, ', token legítimo', e.st);
});
test('CORS: origem arbitrária refletida com credenciais x lista de permissão', async () => {
  const v = await rq(bv, '/api/saldo', { headers: { origin: 'http://evil.test' } }), s = await rq(bs, '/api/saldo', { headers: { origin: 'http://evil.test' } }), ok = await rq(bs, '/api/saldo', { headers: { origin: bs } });
  assert.equal(v.h.get('access-control-allow-origin'), 'http://evil.test'); assert.equal(v.h.get('access-control-allow-credentials'), 'true');
  assert.equal(s.h.get('access-control-allow-origin'), null); assert.equal(ok.h.get('access-control-allow-origin'), bs);
  const pv = await rq(bv, '/transferir', { m: 'OPTIONS', headers: { origin: 'http://evil.test' } }), ps = await rq(bs, '/transferir', { m: 'OPTIONS', headers: { origin: 'http://evil.test' } });
  assert.ok(pv.h.get('access-control-allow-headers')); assert.equal(ps.h.get('access-control-allow-headers'), null);
  console.log('  CORS: vulnerável reflete', v.h.get('access-control-allow-origin'), 'com credenciais | corrigida: sem cabeçalho para origem estranha; própria origem permitida; preflight negado');
});
test('SSRF: preview busca serviço interno só na vulnerável', async () => {
  S.hostsPermitidos = ['exemplo.test'];
  const alvo = encodeURIComponent(bi + '/interno/segredo');
  const v = await rq(bv, '/preview?url=' + alvo), s = await rq(bs, '/preview?url=' + alvo);
  assert.equal(v.j.corpo, 'SEGREDO-SINTETICO-123'); assert.equal(s.st, 400); assert.equal(s.j.motivo, 'host fora da lista de permissão');
  const viaRedir = await rq(bv, '/preview?url=' + encodeURIComponent(bv + '/redir?to=' + bi + '/interno/segredo'));
  assert.equal(viaRedir.j.corpo, 'SEGREDO-SINTETICO-123');
  console.log('  SSRF: vulnerável leu o segredo interno (direto e via redirecionamento) | corrigida', s.st, '-', s.j.motivo);
});
test('SSRF: classificação de IPs', () => {
  const casos = { '127.0.0.1': true, '10.1.2.3': true, '172.16.0.1': true, '172.32.0.1': false, '192.168.1.1': true, '169.254.169.254': true, '100.64.0.1': true, '93.184.216.34': false, '::1': true, 'fd00::1': true, 'fe80::1': true, '::ffff:127.0.0.1': true, '2606:4700::1111': false };
  for (const [ip, esp] of Object.entries(casos)) assert.equal(ipPrivado(ip), esp, ip);
  console.log('  IPs classificados:', Object.keys(casos).length, 'casos corretos (loopback, RFC 1918, link-local, CGNAT, ULA, IPv4 mapeado)');
});
test('SSRF: formas ofuscadas e redirecionamento revalidado', async () => {
  const resolver = async (h) => (h === 'exemplo.test' ? ['93.184.216.34'] : h === 'rebind.test' ? ['127.0.0.1'] : []);
  const permitidos = ['exemplo.test', 'rebind.test'];
  const motivos = {};
  for (const u of ['http://2130706433/', 'http://0x7f.0.0.1/', 'http://127.1/', 'file:///etc/passwd', 'http://user:pw@exemplo.test/', 'http://exemplo.test.evil.test/', 'http://rebind.test/', 'http://[::1]/']) motivos[u] = (await validarUrl(u, { permitidos, resolver })).motivo;
  assert.equal(motivos['file:///etc/passwd'], 'protocolo não permitido'); assert.equal(motivos['http://rebind.test/'], 'endereço interno'); assert.equal(motivos['http://2130706433/'], 'host fora da lista de permissão');
  const fetchImpl = async (u) => (u.startsWith('http://exemplo.test/') ? { status: 302, headers: new Headers({ location: 'http://169.254.169.254/latest/meta-data/' }), text: async () => '' } : { status: 200, headers: new Headers(), text: async () => 'metadados' });
  const r = await seguroFetch('http://exemplo.test/a', { permitidos, resolver, fetchImpl });
  assert.equal(r.ok, false); assert.equal(r.motivo, 'host fora da lista de permissão');
  const ok = await seguroFetch('http://exemplo.test/b', { permitidos, resolver, fetchImpl: async () => ({ status: 200, headers: new Headers(), text: async () => 'ok' }) }); assert.equal(ok.corpo, 'ok');
  console.log('  formas ofuscadas e esquemas:', JSON.stringify(motivos)); console.log('  redirecionamento para 169.254.169.254 bloqueado na revalidação:', r.motivo);
});
