// Loja de DEMONSTRAÇÃO do laboratório C7.1. Versão vulnerável (seguro:false) x corrigida (seguro:true).
// Uso exclusivamente educacional, em 127.0.0.1, com dados sintéticos. Não reutilize este código vulnerável.
import http from 'node:http';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

const hashSenha = (s) => { const salt = crypto.randomBytes(16).toString('hex'); return salt + ':' + crypto.scryptSync(s, salt, 32).toString('hex'); };
const confere = (s, h) => { const [salt, k] = h.split(':'); return crypto.timingSafeEqual(Buffer.from(k, 'hex'), crypto.scryptSync(s, salt, 32)); };
const DUMMY = hashSenha('dummy');

export function criarApp({ seguro }) {
  const db = new DatabaseSync(':memory:');
  db.exec('create table usuarios(id integer primary key, nome text, email text unique, senha text, papel text); create table pedidos(id integer primary key, usuario_id integer, item text, valor real);');
  const sementes = [['Ana', 'ana@exemplo.test', 'ana-senha-fraca-1', 'usuario'], ['Bia', 'bia@exemplo.test', 'bia-senha-fraca-2', 'usuario'], ['Admin', 'admin@exemplo.test', 'admin-senha-3', 'admin']];
  const ins = db.prepare('insert into usuarios(nome,email,senha,papel) values (?,?,?,?)');
  for (const [n, e, s, p] of sementes) ins.run(n, e, seguro ? hashSenha(s) : s, p);
  const insP = db.prepare('insert into pedidos(usuario_id,item,valor) values (?,?,?)');
  for (let i = 0; i < 300; i++) insP.run((i % 2) + 1, 'item-' + i, 10 + (i % 7));
  const sessoes = new Map(); const falhas = []; const tentativas = new Map(); const logs = [];

  const usuarioAtual = (req) => {
    const m = /^Bearer (.+)$/.exec(req.headers.authorization || ''); if (!m) return null;
    let id = null;
    if (seguro) id = sessoes.get(m[1]) ?? null; else { const t = /^token-(\d+)$/.exec(m[1]); id = t ? Number(t[1]) : null; }
    return id ? db.prepare('select id,nome,email,papel from usuarios where id=?').get(id) : null;
  };
  const json = (res, st, obj, h = {}) => { const hd = { 'content-type': 'application/json', ...h }; if (!seguro) hd['x-powered-by'] = 'Express/4.17 (demo)'; res.writeHead(st, hd); res.end(JSON.stringify(obj)); };

  const server = http.createServer(async (req, res) => {
    const u = new URL(req.url, 'http://x'); const p = u.pathname;
    let corpo = {}; if (req.method !== 'GET') { let b = ''; for await (const c of req) b += c; try { corpo = JSON.parse(b || '{}'); } catch { return json(res, 400, { erro: 'json inválido' }); } }
    try {
      if (req.method === 'POST' && p === '/login') {
        const { email, senha } = corpo;
        if (seguro) {
          const t = tentativas.get(email) || []; const agora = Date.now(); const rec = t.filter((x) => agora - x < 60000);
          if (rec.length >= 5) { logs.push({ evento: 'bloqueio', email }); return json(res, 429, { erro: 'muitas tentativas' }); }
          const user = db.prepare('select * from usuarios where email=?').get(email);
          const ok = user ? confere(senha, user.senha) : (confere(senha ?? '', DUMMY), false);
          if (!ok) { rec.push(agora); tentativas.set(email, rec); logs.push({ evento: 'falha_login', email }); return json(res, 401, { erro: 'credenciais inválidas' }); }
          const tk = crypto.randomBytes(24).toString('hex'); sessoes.set(tk, user.id); return json(res, 200, { token: tk });
        }
        const user = db.prepare('select * from usuarios where email=?').get(email);
        if (!user) return json(res, 404, { erro: 'usuário não existe' });
        if (user.senha !== senha) return json(res, 401, { erro: 'senha incorreta' });
        return json(res, 200, { token: 'token-' + user.id });
      }
      if (p === '/erro') { try { JSON.parse('{'); } catch (e) { return seguro ? json(res, 500, { erro: 'erro interno', id: crypto.randomUUID() }) : json(res, 500, { erro: e.message, stack: e.stack }); } }
      const eu = usuarioAtual(req); if (!eu) return json(res, 401, { erro: 'não autenticado' });
      let m;
      if (req.method === 'GET' && (m = /^\/pedidos\/(\d+)$/.exec(p))) {
        const ped = db.prepare('select * from pedidos where id=?').get(Number(m[1]));
        if (!ped || (seguro && ped.usuario_id !== eu.id)) return json(res, 404, { erro: 'não encontrado' });
        return json(res, 200, ped);
      }
      if (req.method === 'GET' && p === '/pedidos') {
        let lim = Number(u.searchParams.get('limite') || 20); if (seguro) lim = Math.min(Math.max(1, lim | 0), 50);
        const rows = db.prepare('select * from pedidos ' + (seguro ? 'where usuario_id=' + Number(eu.id) + ' ' : '') + 'limit ' + (lim > 0 ? lim : 20)).all();
        return json(res, 200, { total: rows.length, pedidos: rows });
      }
      if (req.method === 'GET' && p === '/busca') {
        const q = u.searchParams.get('q') || '';
        const rows = seguro ? db.prepare('select id, item from pedidos where item like ? limit 20').all('%' + q + '%') : db.prepare("select id, item from pedidos where item like '%" + q + "%' limit 20").all();
        return json(res, 200, rows);
      }
      if (req.method === 'PATCH' && p === '/perfil') {
        const campos = seguro ? ['nome'] : Object.keys(corpo).filter((k) => ['nome', 'papel', 'email', 'senha'].includes(k));
        for (const c of campos) if (corpo[c] !== undefined) db.prepare('update usuarios set ' + c + '=? where id=?').run(corpo[c], eu.id);
        return json(res, 200, db.prepare('select id,nome,email,papel from usuarios where id=?').get(eu.id));
      }
      if (req.method === 'GET' && p === '/admin/usuarios') {
        if (seguro && eu.papel !== 'admin') return json(res, 403, { erro: 'proibido' });
        return json(res, 200, db.prepare(seguro ? 'select id,nome,email,papel from usuarios' : 'select * from usuarios').all());
      }
      return json(res, 404, { erro: 'rota' });
    } catch (e) { return seguro ? json(res, 500, { erro: 'erro interno' }) : json(res, 500, { erro: e.message }); }
  });
  return { server, logs, db };
}
export const iniciar = (app) => new Promise((r) => app.server.listen(0, '127.0.0.1', () => r('http://127.0.0.1:' + app.server.address().port)));
