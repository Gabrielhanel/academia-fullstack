import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { criarApp, iniciar } from './app.mjs';

const V = criarApp({ seguro: false }), S = criarApp({ seguro: true });
let bv, bs;
before(async () => { bv = await iniciar(V); bs = await iniciar(S); });
after(() => { V.server.close(); S.server.close(); });
const r = async (base, path, { m = 'GET', body, token } = {}) => {
  const res = await fetch(base + path, { method: m, headers: { 'content-type': 'application/json', ...(token ? { authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const t = await res.text(); let j; try { j = JSON.parse(t); } catch { j = t; } return { st: res.status, j, h: res.headers };
};
const login = async (base, email, senha) => (await r(base, '/login', { m: 'POST', body: { email, senha } })).j.token;

test('A07 enumeração de usuários: vulnerável distingue, corrigida não', async () => {
  const a = await r(bv, '/login', { m: 'POST', body: { email: 'naoexiste@exemplo.test', senha: 'x' } });
  const b = await r(bv, '/login', { m: 'POST', body: { email: 'ana@exemplo.test', senha: 'errada' } });
  assert.notDeepEqual([a.st, a.j], [b.st, b.j]);
  const c = await r(bs, '/login', { m: 'POST', body: { email: 'naoexiste@exemplo.test', senha: 'x' } });
  const d = await r(bs, '/login', { m: 'POST', body: { email: 'ana@exemplo.test', senha: 'errada' } });
  assert.deepEqual([c.st, c.j], [d.st, d.j]);
  console.log(`  enumeração: vulnerável ${a.st}/${b.st} (mensagens distintas); corrigida ${c.st}/${d.st} (iguais)`);
});
test('A07 força bruta: sem limite x com bloqueio após 5 falhas', async () => {
  const cod = async (base) => { const o = []; for (let i = 0; i < 8; i++) o.push((await r(base, '/login', { m: 'POST', body: { email: 'bia@exemplo.test', senha: 'tent' + i } })).st); return o; };
  const v = await cod(bv), s = await cod(bs);
  assert.ok(v.every((x) => x === 401)); assert.ok(s.includes(429));
  console.log('  8 tentativas — vulnerável:', v.join(','), '| corrigida:', s.join(','), '| eventos registrados:', S.logs.length);
});
test('A07 token previsível (falha de autenticação): forjar token-3 vira administrador só na vulnerável', async () => {
  const forjado = await r(bv, '/admin/usuarios', { token: 'token-3' });
  assert.equal(forjado.st, 200); assert.ok(forjado.j.some((u) => u.senha === 'admin-senha-3'));
  const s = await r(bs, '/admin/usuarios', { token: 'token-3' }); assert.equal(s.st, 401);
  console.log('  token forjado: vulnerável', forjado.st, '(senhas em texto claro no retorno) | corrigida', s.st);
});
test('A01 / API1 BOLA: ler pedido de outra pessoa', async () => {
  const tv = await login(bv, 'ana@exemplo.test', 'ana-senha-fraca-1'), ts = await login(bs, 'ana@exemplo.test', 'ana-senha-fraca-1');
  const v = await r(bv, '/pedidos/2', { token: tv }); const s = await r(bs, '/pedidos/2', { token: ts }); const proprio = await r(bs, '/pedidos/1', { token: ts });
  assert.equal(v.st, 200); assert.equal(s.st, 404); assert.equal(proprio.st, 200);
  console.log('  pedido 2 (da Bia) lido pela Ana: vulnerável', v.st, '| corrigida', s.st, '| pedido 1 (da Ana):', proprio.st);
});
test('A05 injeção SQL: UNION vaza senhas na vulnerável', async () => {
  const q = encodeURIComponent("zzz' UNION SELECT id, senha FROM usuarios -- ");
  const tv = await login(bv, 'ana@exemplo.test', 'ana-senha-fraca-1'), ts = await login(bs, 'ana@exemplo.test', 'ana-senha-fraca-1');
  const v = await r(bv, '/busca?q=' + q, { token: tv }), s = await r(bs, '/busca?q=' + q, { token: ts });
  assert.ok(JSON.stringify(v.j).includes('admin-senha-3')); assert.deepEqual(s.j, []);
  console.log('  UNION: vulnerável devolveu', v.j.length, 'linhas incluindo senhas | corrigida devolveu', s.j.length);
});
test('API3 atribuição em massa: virar admin pelo perfil', async () => {
  const tv = await login(bv, 'ana@exemplo.test', 'ana-senha-fraca-1'), ts = await login(bs, 'ana@exemplo.test', 'ana-senha-fraca-1');
  const v = await r(bv, '/perfil', { m: 'PATCH', token: tv, body: { nome: 'Ana', papel: 'admin' } }), s = await r(bs, '/perfil', { m: 'PATCH', token: ts, body: { nome: 'Ana', papel: 'admin' } });
  assert.equal(v.j.papel, 'admin'); assert.equal(s.j.papel, 'usuario');
  console.log('  papel após PATCH com papel=admin: vulnerável', v.j.papel, '| corrigida', s.j.papel);
});
test('API5 / A01 função administrativa sem verificação de papel', async () => {
  const ts = (await r(bs, '/login', { m: 'POST', body: { email: 'ana@exemplo.test', senha: 'ana-senha-fraca-1' } })).j.token;
  const s = await r(bs, '/admin/usuarios', { token: ts }); assert.equal(s.st, 403);
  console.log('  usuário comum em /admin/usuarios (corrigida):', s.st, '(a vulnerável já foi vista nos testes anteriores)');
});
test('API4 consumo irrestrito: limite sem teto', async () => {
  const tv = await login(bv, 'ana@exemplo.test', 'ana-senha-fraca-1'), ts = await login(bs, 'ana@exemplo.test', 'ana-senha-fraca-1');
  const v = await r(bv, '/pedidos?limite=100000', { token: tv }), s = await r(bs, '/pedidos?limite=100000', { token: ts });
  assert.equal(v.j.total, 300); assert.equal(s.j.total, 50);
  console.log('  limite=100000: vulnerável devolveu', v.j.total, 'linhas | corrigida', s.j.total, '(teto 50 e só os próprios pedidos)');
});
test('A02 configuração insegura: stack e cabeçalho de tecnologia', async () => {
  const v = await r(bv, '/erro'), s = await r(bs, '/erro');
  assert.ok(v.j.stack.includes('at ')); assert.ok(v.h.get('x-powered-by')); assert.equal(s.j.stack, undefined); assert.equal(s.h.get('x-powered-by'), null);
  console.log('  /erro: vulnerável expõe stack (', v.j.stack.split('\n').length, 'linhas) e x-powered-by | corrigida só id de correlação');
});
