// Relatório 3 — Links: testa todas as URLs de aulas, suplementos, materiais e referências do pacote.
// Só GET/HEAD públicos (User-Agent genérico), no máximo 2 conexões por site, cache de 7 dias em preview/state/links-cache.json.
// Escreve preview/state/reports/links.{md,json}. Uso: node preview/report-links.mjs [--force] [--limit N]
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ROOT, loadPack, writeReport, table, today, pool } from './lib.mjs';

const CACHE = ROOT + 'preview/state/links-cache.json';
const WEEK = 7 * 864e5;
const norm = (u) => u.replace(/#.*$/, '');

export function collect(docs) {
  const map = new Map();
  const add = (url, where) => { if (typeof url !== 'string' || !/^https?:\/\//.test(url)) return; const u = norm(url); if (!map.has(u)) map.set(u, new Set()); map.get(u).add(where); };
  docs.forEach(({ path, data: o }) => {
    const id = path.split('/').slice(-1)[0], kind = path.split('/')[0];
    (o.refs || []).forEach((r) => add(r && r.url, kind + ':' + id));
    ((o.supplement || {}).officialRefs || []).forEach((r) => add(r && r.url, kind + ':' + id));
    (o.materials || []).forEach((m) => add(m && m.url, kind + ':' + id));
    if (kind === 'kb_refs' || kind === 'kb_radar') add(o.url, kind + ':' + id);
  });
  return map;
}

/* Classifica a resposta: ok | redirecionado | bloqueado (inconclusivo) | quebrado */
export function classify(url, res) {
  if (res.error) return { result: 'quebrado', detail: res.error };
  const s = res.status;
  if (s >= 200 && s < 300) { const same = norm(res.final || url).replace(/\/$/, '') === url.replace(/\/$/, ''); return { result: same ? 'ok' : 'redirecionado', detail: same ? '' : 'vai para ' + res.final }; }
  if (s === 401 || s === 403 || s === 429 || s === 999) return { result: 'bloqueado', detail: 'HTTP ' + s + ' (o site recusa verificação automática; confira no navegador)' };
  return { result: 'quebrado', detail: 'HTTP ' + s };
}

const hostSlots = new Map();
async function slot(host, fn) { while ((hostSlots.get(host) || 0) >= 2) await new Promise((r) => setTimeout(r, 60)); hostSlots.set(host, (hostSlots.get(host) || 0) + 1); try { return await fn(); } finally { hostSlots.set(host, hostSlots.get(host) - 1); } }
async function probe(url) {
  const h = { 'user-agent': 'Mozilla/5.0 (compatible; academia-link-check-local)', accept: 'text/html,*/*' };
  const go = async (method) => { const r = await fetch(url, { method, headers: h, redirect: 'follow', signal: AbortSignal.timeout(20000) }); try { await r.body?.cancel(); } catch (e) { /* ignore */ } return { status: r.status, final: r.url }; };
  try { let r = await go('HEAD'); if (r.status >= 400) r = await go('GET'); return r; }
  catch (e) { try { return await go('GET'); } catch (e2) { return { error: String((e2.cause && e2.cause.code) || e2.message).slice(0, 80) }; } }
}

async function main() {
  const args = process.argv.slice(2); const force = args.includes('--force'); const li = args.indexOf('--limit'); const limit = li >= 0 ? Number(args[li + 1]) : Infinity;
  const { docs } = loadPack();
  const map = collect(docs); let urls = [...map.keys()].sort(); if (limit < urls.length) urls = urls.slice(0, limit);
  const cache = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, 'utf8')) : {};
  const fresh = (u) => { const c = cache[u]; return !force && c && Date.now() - Date.parse(c.at) < WEEK && c.result !== 'quebrado'; };
  const todo = urls.filter((u) => !fresh(u));
  console.log('Links: ' + urls.length + ' URLs únicas; ' + (urls.length - todo.length) + ' em cache (<7 dias); verificando ' + todo.length + '…');
  let done = 0;
  await pool(todo, 8, async (u) => { const r = await slot(new URL(u).host, () => probe(u)); cache[u] = { at: new Date().toISOString(), ...classify(u, r) }; if (++done % 100 === 0) console.log('  ' + done + '/' + todo.length); });
  mkdirSync(ROOT + 'preview/state', { recursive: true }); writeFileSync(CACHE, JSON.stringify(cache, null, 1));
  const rows = urls.map((u) => ({ url: u, ...cache[u], where: [...map.get(u)].sort() }));
  const cnt = {}; rows.forEach((r) => { cnt[r.result] = (cnt[r.result] || 0) + 1; });
  const show = (res) => rows.filter((r) => r.result === res);
  const w = (r) => r.where.slice(0, 3).join(', ') + (r.where.length > 3 ? ' +' + (r.where.length - 3) : '');
  let md = 'Verificação de todas as URLs do pacote em ' + today() + '. **Quebrado** exige correção; **redirecionado** funciona mas o endereço mudou (vale atualizar); **bloqueado** significa que o site recusa verificação automática, então confira no navegador.\n\n' + Object.entries(cnt).map(([k, v]) => '**' + v + '** ' + k).join(' · ') + '\n\n';
  if (show('quebrado').length) md += '## Quebrados\n\n' + table(['URL', 'Problema', 'Usado em'], show('quebrado').map((r) => [r.url, r.detail, w(r)])) + '\n';
  if (show('redirecionado').length) md += '## Redirecionados\n\n' + table(['URL', 'Novo endereço', 'Usado em'], show('redirecionado').slice(0, 60).map((r) => [r.url, r.detail.replace('vai para ', ''), w(r)])) + (show('redirecionado').length > 60 ? '\n… e mais ' + (show('redirecionado').length - 60) + ' (lista completa no JSON).\n' : '') + '\n';
  if (show('bloqueado').length) md += '## Bloqueados para verificação automática\n\n' + table(['URL', 'Resposta', 'Usado em'], show('bloqueado').slice(0, 40).map((r) => [r.url, r.detail.replace(/ \(.*/, ''), w(r)])) + '\n';
  if (!show('quebrado').length) md += 'Nenhum link quebrado.\n';
  writeReport('links', md, { generatedAt: today(), counts: cnt, rows });
  console.log('Resultado: ' + Object.entries(cnt).map(([k, v]) => v + ' ' + k).join(', '));
  show('quebrado').slice(0, 15).forEach((r) => console.log('  ✖ ' + r.url + ' — ' + r.detail + ' (' + w(r) + ')'));
  console.log('Relatório: preview/state/reports/links.md');
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main().catch((e) => { console.error('ERRO:', e.message); process.exit(1); });
