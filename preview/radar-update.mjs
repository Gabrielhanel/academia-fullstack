// Atualiza as entradas do Radar a partir do endoflife.date (API pública, somente GET, nenhum dado seu é enviado).
// Gera preview/state/radar.json; o gerador do pacote (build-preview.mjs) lê esse arquivo. Não toca em seed/, dist/ nem no banco real.
// Uso: node preview/radar-update.mjs [--dry-run]    depois: node preview/build-preview.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const OUT = ROOT + 'preview/state/radar.json';
const API = 'https://endoflife.date/api/v1/products/';
// tecnologias do radarCfg → produto no endoflife.date (sem fonte lá: typescript, flutter, dart, jest, vitest, playwright, cypress, java, aws, azure, gcp)
export const PRODUCTS = { react: 'react', nextjs: 'nextjs', 'react-native': 'react-native', kotlin: 'kotlin', nodejs: 'nodejs', nestjs: 'nestjs', postgresql: 'postgresql', redis: 'redis', docker: 'docker-engine', kubernetes: 'kubernetes', rabbitmq: 'rabbitmq', kafka: 'apache-kafka' };
const hash = (o) => createHash('sha256').update(JSON.stringify(o)).digest('hex').slice(0, 16);
const br = (d) => d.split('-').reverse().join('/');
const DAY = 864e5;

/* Função pura: produto da API → entradas de radar. `today` = 'AAAA-MM-DD'. */
export function itemsFor(tech, product, today) {
  const r = product.result, releases = r.releases || [], out = [], t0 = Date.parse(today);
  const url = (r.links && r.links.html) || 'https://endoflife.date/' + r.name;
  const nameOf = (c) => r.label + ' ' + c.name;
  const newest = releases[0];
  if (newest && newest.latest && newest.latest.name) {
    out.push({ id: tech + '-latest-' + newest.name, key: 'endoflife:' + tech + ':' + newest.name + ':' + newest.latest.name, tech, type: 'versao', relevance: 'media', title: nameOf({ name: newest.latest.name }) + (newest.isLts ? ' (LTS)' : ''), version: newest.latest.name, date: newest.latest.date, url, summary: 'Última versão da linha ' + newest.name + ', segundo endoflife.date (fonte comunitária; confirme no repositório ou site oficial do projeto).', lessonIds: [] });
  }
  releases.forEach((c) => {
    if (typeof c.eolFrom !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(c.eolFrom)) return;
    const diff = (Date.parse(c.eolFrom) - t0) / DAY;
    if (diff < -120 || diff > 365) return;
    const past = diff <= 0;
    out.push({ id: tech + '-eol-' + c.name, key: 'endoflife:' + tech + ':' + c.name + ':eol', tech, type: 'depreciacao', relevance: past || diff <= 180 ? 'alta' : 'media',
      title: nameOf(c) + (past ? ' chegou ao fim de vida (EOL) em ' : ' chega ao fim de vida (EOL) em ') + br(c.eolFrom), version: (c.latest && c.latest.name) || c.name, date: c.eolFrom, url,
      summary: 'Segundo endoflife.date (fonte comunitária; confirme no site oficial), a linha ' + c.name + ' ' + (past ? 'não recebe mais suporte' : 'deixa de receber suporte em ' + br(c.eolFrom)) + '. Planeje a migração para uma linha mantida.', lessonIds: [] });
  });
  return out;
}

/* Une ao resultado anterior preservando createdAt/verifiedAt de itens sem mudança. */
export function merge(prev, fresh, refreshedTechs, baseKeys, today) {
  const prevById = Object.fromEntries((prev ? prev.items : []).map((i) => [i.id, i]));
  const keep = (prev ? prev.items : []).filter((i) => !refreshedTechs.includes(i.tech));
  const items = [...keep];
  fresh.forEach((i) => {
    // não repete fato já presente na base oficial (mesma chave, ou qualquer aviso de EOL da mesma linha)
    if (baseKeys.has(i.key) || (i.type === 'depreciacao' && [...baseKeys].some((k) => k.startsWith(i.key)))) return;
    const body = { ...i, updatedAt: i.date + 'T00:00:00.000Z' };
    const p = prevById[i.id];
    const same = p && hash({ ...p, createdAt: 0, verifiedAt: 0 }) === hash({ ...body, createdAt: 0, verifiedAt: 0 });
    items.push({ ...body, createdAt: p ? p.createdAt : today, verifiedAt: same ? p.verifiedAt : today });
  });
  return items.sort((a, b) => (a.id < b.id ? -1 : 1));
}

async function main() {
  const dry = process.argv.includes('--dry-run');
  const today = new Date().toISOString().slice(0, 10);
  const base = JSON.parse(readFileSync(ROOT + 'seed/docs.json', 'utf8'));
  const baseKeys = new Set(base.filter((d) => d.path.startsWith('kb_radar/')).map((d) => d.data.key));
  const cfg = base.find((d) => d.path === 'kb_meta/radarcfg').data;
  const prev = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : null;
  const fresh = [], ok = [], fail = [];
  for (const t of cfg.techs) {
    const prod = PRODUCTS[t.id]; if (!prod) continue;
    try {
      const res = await fetch(API + prod, { headers: { accept: 'application/json', 'user-agent': 'radar-update-local' }, signal: AbortSignal.timeout(20000) });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      fresh.push(...itemsFor(t.id, await res.json(), today)); ok.push(t.id);
    } catch (e) { fail.push(t.id + ' (' + e.message + ')'); }
  }
  const items = merge(prev, fresh, ok, baseKeys, today);
  const semFonte = cfg.techs.filter((t) => !PRODUCTS[t.id]).map((t) => t.id);
  const out = { checkedAt: ok.length ? today : (prev && prev.checkedAt) || today, source: 'endoflife.date API v1', refreshed: ok, failed: fail, noSource: semFonte, items };
  console.log('Radar — consultadas: ' + ok.length + ' tecnologias; falhas: ' + (fail.join(', ') || 'nenhuma') + '; sem fonte automática: ' + semFonte.join(', '));
  const before = prev ? new Set(prev.items.map((i) => i.id)) : new Set();
  items.forEach((i) => console.log('  ' + (before.has(i.id) ? '=' : '+') + ' [' + i.relevance + '] ' + i.title));
  if (dry) { console.log('--dry-run: nada gravado.'); return; }
  if (!ok.length) { console.log('Nenhuma consulta funcionou; arquivo mantido.'); process.exit(1); }
  mkdirSync(ROOT + 'preview/state', { recursive: true });
  if (existsSync(OUT)) copyFileSync(OUT, OUT.replace('.json', '.prev.json'));
  writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
  console.log('Gravado em preview/state/radar.json. Agora rode: node preview/build-preview.mjs');
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main().catch((e) => { console.error('ERRO:', e.message); process.exit(1); });
