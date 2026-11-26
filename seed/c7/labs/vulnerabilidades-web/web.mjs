// Aplicação de DEMONSTRAÇÃO do laboratório C7.2 (vulnerável x corrigida). Somente 127.0.0.1, dados sintéticos. Não reutilize o código vulnerável.
import http from 'node:http';
import crypto from 'node:crypto';
import dns from 'node:dns/promises';
import { DatabaseSync } from 'node:sqlite';
import { seguroFetch } from './ssrf.mjs';

export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const hash = (s) => { const salt = crypto.randomBytes(16).toString('hex'); return salt + ':' + crypto.scryptSync(s, salt, 32).toString('hex'); };
const confere = (s, h) => { const [salt, k] = h.split(':'); return crypto.timingSafeEqual(Buffer.from(k, 'hex'), crypto.scryptSync(s, salt, 32)); };

export function criarWeb({ seguro }) {
  const app = { origens: [], hostsPermitidos: [], resolver: async (h) => (await dns.lookup(h, { all: true })).map((x) => x.address) };
  const db = new DatabaseSync(':memory:'); app.db = db;
  db.exec("create table usuarios(id integer primary key, email text, senha text, nome text); create table produtos(id integer primary key, nome text, categoria text, preco real); create table contas(usuario_id integer primary key, saldo real); create table comentarios(id integer primary key, autor text, texto text);");
  const u = db.prepare('insert into usuarios(email,senha,nome) values (?,?,?)');
  u.run('ana@exemplo.test', seguro ? hash('ana-senha-1') : 'ana-senha-1', 'Ana'); u.run('bia@exemplo.test', seguro ? hash('bia-senha-2') : 'bia-senha-2', 'Bia');
  db.prepare('insert into contas values (1,1000),(2,1000)').run();
  const p = db.prepare('insert into produtos(nome,categoria,preco) values (?,?,?)');
  for (let i = 0; i < 12; i++) p.run('produto-' + i, i % 2 ? 'livros' : 'jogos', 10 + i);
  const sessoes = new Map();
  const sessao = (req) => { const m = /(?:^|; )sid=([a-f0-9]+)/.exec(req.headers.cookie || ''); return m ? sessoes.get(m[1]) : undefined; };

  app.server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x'); const path = url.pathname; const origin = req.headers.origin;
    const send = (st, corpo, tipo = 'application/json', extra = {}) => {
      const h = { 'content-type': tipo, ...extra };
      if (seguro) { h['content-security-policy'] = "default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'none'"; h['x-content-type-options'] = 'nosniff'; }
      if (origin && (!seguro || app.origens.includes(origin))) { h['access-control-allow-origin'] = origin; h['access-control-allow-credentials'] = 'true'; h.vary = 'Origin'; }
      res.writeHead(st, h); res.end(typeof corpo === 'string' ? corpo : JSON.stringify(corpo));
    };
    if (req.method === 'OPTIONS') { const h = (!seguro || app.origens.includes(origin)) ? { 'access-control-allow-methods': 'GET, POST', 'access-control-allow-headers': 'content-type, x-csrf-token' } : {}; return send(204, '', 'text/plain', h); }
    let corpo = {}; if (req.method === 'POST') {
      let b = ''; for await (const c of req) b += c; const tipo = req.headers['content-type'] || '';
      if (tipo.includes('json')) { try { corpo = JSON.parse(b || '{}'); } catch { return send(400, { erro: 'json inválido' }); } } else if (seguro && path === '/transferir') return send(415, { erro: 'somente application/json' }); else corpo = Object.fromEntries(new URLSearchParams(b));
    }
    try {
      if (path === '/saude') return send(200, 'ok', 'text/plain');
      if (path === '/produtos') {
        const cat = url.searchParams.get('categoria') || 'livros', ordem = url.searchParams.get('ordem');
        if (seguro) { if (ordem && !['nome', 'preco'].includes(ordem)) return send(400, { erro: 'ordem inválida' }); return send(200, db.prepare('select id,nome,preco from produtos where categoria=?' + (ordem ? ' order by ' + ordem : '')).all(cat)); }
        try { return send(200, db.prepare("select id,nome,preco from produtos where categoria='" + cat + "'" + (ordem ? ' order by ' + ordem : '')).all()); } catch (e) { return send(500, { erro: e.message }); }
      }
      if (path === '/login' && req.method === 'POST') {
        let user;
        if (seguro) { const r = db.prepare('select * from usuarios where email=?').get(corpo.email); user = r && confere(String(corpo.senha ?? ''), r.senha) ? r : null; }
        else { try { user = db.prepare("select * from usuarios where email='" + corpo.email + "' and senha='" + corpo.senha + "'").get(); } catch (e) { return send(500, { erro: e.message }); } }
        if (!user) return send(401, { erro: 'credenciais inválidas' });
        const sid = crypto.randomBytes(16).toString('hex'), csrf = crypto.randomBytes(16).toString('hex'); sessoes.set(sid, { userId: user.id, csrf });
        return send(200, seguro ? { ok: true, id: user.id, csrf } : { ok: true, id: user.id }, 'application/json', { 'set-cookie': seguro ? `sid=${sid}; Path=/; HttpOnly; SameSite=Strict` : `sid=${sid}; Path=/` });
      }
      if (path === '/ola') { const n = url.searchParams.get('nome') || 'mundo'; return send(200, '<!doctype html><h1>Olá, ' + (seguro ? esc(n) : n) + '</h1>', 'text/html; charset=utf-8'); }
      if (path === '/comentarios' && req.method === 'POST') { db.prepare('insert into comentarios(autor,texto) values (?,?)').run(String(corpo.autor ?? 'anon'), String(corpo.texto ?? '')); return send(201, { ok: true }); }
      if (path === '/comentarios') { const l = db.prepare('select * from comentarios').all(); return send(200, '<!doctype html><ul>' + l.map((c) => '<li><b>' + (seguro ? esc(c.autor) : c.autor) + '</b>: ' + (seguro ? esc(c.texto) : c.texto) + '</li>').join('') + '</ul>', 'text/html; charset=utf-8'); }
      if (path === '/redir') return send(302, '', 'text/plain', { location: url.searchParams.get('to') || '/' });
      if (path === '/preview') {
        const alvo = url.searchParams.get('url') || '';
        if (seguro) { const r = await seguroFetch(alvo, { permitidos: app.hostsPermitidos, resolver: app.resolver }); return r.ok ? send(200, { status: r.status, corpo: r.corpo }) : send(400, { erro: 'URL não permitida', motivo: r.motivo }); }
        try { const r = await fetch(alvo); return send(200, { status: r.status, corpo: (await r.text()).slice(0, 2000) }); } catch (e) { return send(502, { erro: e.message }); }
      }
      const s = sessao(req);
      if (path === '/api/saldo') { if (!s) return send(401, { erro: 'não autenticado' }); return send(200, db.prepare('select saldo from contas where usuario_id=?').get(s.userId)); }
      if (path === '/transferir' && req.method === 'POST') {
        if (!s) return send(401, { erro: 'não autenticado' });
        if (seguro && (req.headers['x-csrf-token'] !== s.csrf || (origin && !app.origens.includes(origin)))) return send(403, { erro: 'CSRF' });
        const v = Number(corpo.valor), para = Number(corpo.para);
        if (!(v > 0) || ![1, 2].includes(para)) return send(400, { erro: 'dados inválidos' });
        db.prepare('update contas set saldo=saldo-? where usuario_id=?').run(v, s.userId); db.prepare('update contas set saldo=saldo+? where usuario_id=?').run(v, para);
        return send(200, db.prepare('select saldo from contas where usuario_id=?').get(s.userId));
      }
      return send(404, { erro: 'rota' });
    } catch (e) { return send(500, { erro: seguro ? 'erro interno' : e.message }); }
  });
  return app;
}
export const iniciar = (app) => new Promise((r) => app.server.listen(0, '127.0.0.1', () => { app.base = 'http://127.0.0.1:' + app.server.address().port; r(app.base); }));
export function criarInterno() {
  const server = http.createServer((req, res) => { res.writeHead(200, { 'content-type': 'text/plain' }); res.end(req.url === '/interno/segredo' ? 'SEGREDO-SINTETICO-123' : 'interno'); });
  return { server, iniciar: () => new Promise((r) => server.listen(0, '127.0.0.1', () => r('http://127.0.0.1:' + server.address().port))) };
}
