// Relatório 2 — Defasagem de versões: compara as versões declaradas em cada curso com as mais recentes (npm registry e endoflife.date).
// Só consultas GET públicas; nada é enviado. Cache de 24 h em preview/state/versions-cache.json.
// Escreve preview/state/reports/versoes.{md,json}. Uso: node preview/report-versions.mjs [--force]
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ROOT, loadPack, writeReport, table, today, pool, parseVer, cmpVer } from './lib.mjs';

const EOL = { 'node.js': 'nodejs', postgresql: 'postgresql', mysql: 'mysql', redis: 'redis', mongodb: 'mongodb', kubernetes: 'kubernetes' };
const NPM = { react: 'react', 'react dom': 'react-dom', 'next.js': 'next', nestjs: '@nestjs/core', 'tailwind css': 'tailwindcss', 'style dictionary': 'style-dictionary', turborepo: 'turbo', 'driver mongodb': 'mongodb', 'driver pg': 'pg' };

/* Extrai pares {name, version} do texto livre de `versions`. Só versões com ponto (ex.: 19.3.1, 17.12). */
export function parseDeclared(text) {
  const out = []; const re = /(\d+\.\d+(?:\.\d+)?)(?![\d.]*[\w-])/g; let m;
  while ((m = re.exec(text))) {
    let before = text.slice(Math.max(0, m.index - 45), m.index);
    before = before.split(/[,;()]|\s(?:e|com|em|ou|de|do|da)\s/).pop().replace(/^[\s:–-]+|[\s:–-]+$/g, '');
    if (!before || before.length > 40 || /\d{4}-\d{2}/.test(before)) continue;
    out.push({ name: before.toLowerCase(), label: before, version: m[1] });
  }
  return out;
}
export const target = (name) => (EOL[name] ? { kind: 'eol', id: EOL[name] } : NPM[name] ? { kind: 'npm', id: NPM[name] } : name.startsWith('@') ? { kind: 'npm', id: name } : /^[a-z0-9][a-z0-9._-]*$/.test(name) ? { kind: 'npm', id: name } : null);

/* Compara declarada × mais recente estável. 0.x: a minor conta como major. */
export function drift(declared, latest) {
  const D = parseVer(declared), L = parseVer(latest); if (!D || !L) return { level: 'indefinido', n: 0 };
  const dM = D[0] === 0 && L[0] === 0 ? D[1] : D[0], lM = D[0] === 0 && L[0] === 0 ? L[1] : L[0];
  if (lM > dM) return { level: 'major', n: lM - dM };
  if (L[1] > D[1] && !(D[0] === 0 && L[0] === 0)) return { level: 'minor', n: L[1] - D[1] };
  return { level: 'atual', n: 0 };
}
export const stableMax = (versions) => Object.keys(versions).filter((v) => /^\d+\.\d+\.\d+$/.test(v)).map((v) => [v, parseVer(v)]).sort((a, b) => cmpVer(b[1], a[1]))[0];

const CACHE = ROOT + 'preview/state/versions-cache.json';
async function lookup(t, cache, force) {
  const key = t.kind + ':' + t.id; const c = cache[key];
  if (!force && c && Date.now() - Date.parse(c.at) < 864e5 && !c.error) return c;
  try {
    if (t.kind === 'npm') {
      const r = await fetch('https://registry.npmjs.org/' + t.id.replace('/', '%2f'), { headers: { accept: 'application/vnd.npm.install-v1+json', 'user-agent': 'report-versions-local' }, signal: AbortSignal.timeout(30000) });
      if (r.status === 404) return (cache[key] = { at: new Date().toISOString(), notFound: true });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const j = await r.json(); const s = stableMax(j.versions || {});
      return (cache[key] = { at: new Date().toISOString(), latest: s && s[0], tag: j['dist-tags'] && j['dist-tags'].latest });
    }
    const r = await fetch('https://endoflife.date/api/v1/products/' + t.id, { headers: { accept: 'application/json', 'user-agent': 'report-versions-local' }, signal: AbortSignal.timeout(30000) });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const j = (await r.json()).result;
    return (cache[key] = { at: new Date().toISOString(), cycles: j.releases.map((x) => ({ name: x.name, latest: x.latest && x.latest.name, eolFrom: x.eolFrom, isEol: x.isEol })) });
  } catch (e) { return { error: e.message }; }
}

async function main() {
  const force = process.argv.includes('--force');
  const { courses } = loadPack();
  const cache = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, 'utf8')) : {};
  const rows = []; const seen = new Set();
  courses.forEach((c) => parseDeclared(String(c.versions || '')).forEach((p) => { const k = c.id + '|' + p.name + '|' + p.version; if (seen.has(k)) return; seen.add(k); const t = target(p.name); rows.push({ course: c.id, ...p, t }); }));
  const targets = [...new Map(rows.filter((r) => r.t).map((r) => [r.t.kind + ':' + r.t.id, r.t])).values()];
  console.log('Versões: ' + rows.length + ' declarações em ' + courses.length + ' cursos; consultando ' + targets.length + ' pacotes/produtos…');
  await pool(targets, 6, (t) => lookup(t, cache, force));
  mkdirSync(ROOT + 'preview/state', { recursive: true }); writeFileSync(CACHE, JSON.stringify(cache, null, 1));
  const res = rows.map((r) => {
    if (!r.t) return { ...r, status: 'não mapeado' };
    const c = cache[r.t.kind + ':' + r.t.id];
    if (!c || c.error) return { ...r, status: 'falha na consulta', note: c && c.error };
    if (c.notFound) return { ...r, status: 'não mapeado', note: 'pacote inexistente no npm' };
    if (r.t.kind === 'npm') { const d = drift(r.version, c.latest); return { ...r, latest: c.latest, status: d.level, n: d.n, note: c.tag && c.tag !== c.latest ? 'tag latest = ' + c.tag + ' (pré-lançamento ignorado)' : '' }; }
    const cyc = c.cycles; const declMaj = r.version.split('.')[0]; const own = cyc.find((x) => x.name === r.version || x.name === declMaj || x.name === r.version.split('.').slice(0, 2).join('.'));
    const newest = cyc[0]; const d = drift(r.version, newest.latest || newest.name);
    const status = own && own.isEol ? 'EOL' : own ? (d.level === 'atual' ? 'atual' : 'suportada') : 'indefinido';
    return { ...r, latest: newest.latest || newest.name, status, n: d.n, note: own ? 'linha ' + own.name + (own.isEol ? ' em EOL desde ' + own.eolFrom : ' mantida até ' + own.eolFrom) + (status === 'suportada' ? '; linha mais nova: ' + newest.name : '') : 'linha não encontrada' };
  });
  const order = { EOL: 0, major: 1, minor: 2, suportada: 3, 'falha na consulta': 4, 'não mapeado': 5, atual: 6, indefinido: 7 };
  res.sort((a, b) => order[a.status] - order[b.status] || (b.n || 0) - (a.n || 0) || (a.course < b.course ? -1 : 1));
  const cnt = {}; res.forEach((r) => { cnt[r.status] = (cnt[r.status] || 0) + 1; });
  const acts = res.filter((r) => ['EOL', 'major', 'minor'].includes(r.status));
  const sup = res.filter((r) => r.status === 'suportada');
  let md = 'Compara as versões declaradas no campo "versões" de cada curso com a mais recente **estável** (npm registry; endoflife.date para runtimes e bancos). Defasagem de *major* é a que mais exige revisão; *minor* costuma ser informativa. Gerado em ' + today() + '.\n\n';
  md += Object.entries(cnt).map(([k, v]) => '**' + v + '** ' + k).join(' · ') + '\n\n';
  if (acts.length) md += table(['Curso', 'Pacote/produto', 'Declarada', 'Mais recente', 'Situação', 'Observação'], acts.map((r) => [r.course, r.label, r.version, r.latest, r.status === 'major' ? 'major atrás (' + r.n + ')' : r.status === 'minor' ? 'minor atrás (' + r.n + ')' : r.status, r.note || '']));
  else md += 'Nenhuma defasagem encontrada.\n';
  if (sup.length) md += '\n## Em linha ainda suportada (informativo)\n\nRuntimes e bancos cuja versão declarada tem suporte, embora exista linha mais nova. Não exigem revisão agora; acompanhe a data de fim de suporte.\n\n' + table(['Curso', 'Produto', 'Declarada', 'Observação'], sup.map((r) => [r.course, r.label, r.version, r.note]));
  const nm = [...new Set(res.filter((r) => r.status === 'não mapeado').map((r) => r.label).filter((x) => /^[A-Za-z@][\w@/.+-]*( [\w@/.+-]+){0,2}$/.test(x) && x.length <= 25 && !/(exigem|usam|conforme|fixa|imagem|exige)/.test(x)))];
  if (nm.length) md += '\n## Não mapeados (sem pacote npm/produto correspondente)\n\n' + nm.join(', ') + '\n';
  writeReport('versoes', md, { generatedAt: today(), counts: cnt, rows: res.map(({ t, ...r }) => r) });
  console.log('Resultado: ' + Object.entries(cnt).map(([k, v]) => v + ' ' + k).join(', '));
  acts.slice(0, 10).forEach((r) => console.log('  • ' + r.course + ': ' + r.label + ' ' + r.version + ' → ' + r.latest + ' (' + r.status + (r.n ? ' ' + r.n : '') + ')'));
  console.log('Relatório: preview/state/reports/versoes.md');
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main().catch((e) => { console.error('ERRO:', e.message); process.exit(1); });
