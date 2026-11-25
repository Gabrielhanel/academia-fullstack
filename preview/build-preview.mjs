// Gerador do PACOTE DE VISUALIZAÇÃO LOCAL (ondas C2–C11). Não toca em seed/, src/, dist/ nem no banco real.
//
// Como funciona (reaproveita o mecanismo existente, sem catálogo paralelo):
//   preview/dist/index.html        = cópia byte a byte de dist/index.html + um pequeno script que, no modo local,
//                                    chama o próprio ACT['kb-install'] do app (installSeed + seedPlan) quando faltam cursos.
//   preview/dist/seed-docs.json    = seed/docs.json (base, só leitura) + documentos dos cursos APROVADOS no portão.
//   preview/dist/preview-manifest.json = o que o script confere no navegador.
//   preview/state/                 = estado do gerador (revisões por documento, validadores, backups) → incremental/reversível.
//
// Uso:  node preview/build-preview.mjs [--waves c2,c3] [--no-validate] [--dry-run] [--rollback]
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync, readdirSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);
const sha = (s) => createHash('sha256').update(typeof s === 'string' ? s : JSON.stringify(s)).digest('hex').slice(0, 16);
const STAMP = '2026-11-25T00:00:00.000Z'; // carimbo fixo para documentos gerados aqui (mantém a geração determinística)
const PAGE_ID = 'producao-c2-c11';
export const BASE_REV = 3; // SEED_REV do app (somente leitura); revisões do pacote começam acima dele

/* ---------- Portão de disponibilização ---------- */
export function gate(E, W, catalog) {
  const p = []; const c = W && W.course;
  if (!c) return ['curso ausente'];
  ['id', 'title', 'description', 'disciplineId', 'areaId', 'level'].forEach((k) => { if (!String(c[k] || '').trim()) p.push('metadado ausente: ' + k); });
  E.validateCourse(c).forEach((m) => p.push('curso: ' + m));
  if (!Array.isArray(c.objectives) || !c.objectives.length) p.push('metadado ausente: objectives');
  if (c.status !== 'published') p.push('status do curso não é published');
  const discs = new Set(catalog.areas.flatMap((a) => a.disciplines.map((d) => d.id)));
  [c.disciplineId, ...(c.disciplineIds || [])].forEach((d) => { if (!discs.has(d)) p.push('disciplina inexistente no catálogo: ' + d); });
  const ids = E.courseLessonIds(c);
  if (!ids.length) p.push('curso sem aulas');
  if (ids.length !== new Set(ids).size) p.push('aula repetida nos módulos');
  const lessons = W.lessons || [];
  ids.forEach((id) => { if (!lessons.some((l) => l.id === id)) p.push('aula ausente: ' + id); if (!W.exsets || !W.exsets[id] || !(W.exsets[id].items || []).length) p.push('exercícios ausentes: ' + id); });
  lessons.forEach((l) => {
    if (!ids.includes(l.id)) p.push('aula fora dos módulos: ' + l.id);
    if (l.courseId !== c.id) p.push('courseId divergente: ' + l.id);
    E.validateLesson(l).forEach((m) => p.push('aula ' + l.id + ': ' + m));
    if (!Array.isArray(l.refs) || !l.refs.length) p.push('aula sem referências: ' + l.id);
  });
  Object.entries(W.exsets || {}).forEach(([lid, s]) => (s.items || []).forEach((x) => E.validateExercise(x).forEach((m) => p.push('exercício ' + lid + '/' + (x.id || '?') + ': ' + m))));
  const a = W.assessment;
  if (!a || a.id !== c.id || a.courseId !== c.id) p.push('prova final ausente ou com id/courseId divergente');
  else { if (!(a.items || []).length) p.push('prova final sem itens'); if (!(a.passPct > 0)); (a.items || []).forEach((x) => E.validateExercise(x).forEach((m) => p.push('prova ' + (x.id || '?') + ': ' + m))); }
  const pr = W.project;
  if (!pr || !pr.id || !pr.name || pr.courseId !== c.id) p.push('projeto integrador ausente ou incompleto');
  const s = c.supplement || {};
  if (!(s.glossary || []).length) p.push('glossário ausente');
  if (!(s.cheatsheet || []).length) p.push('cheatsheet ausente');
  if (!(s.officialRefs || []).length || s.officialRefs.some((r) => !r.title || !E.isUrl(r.url))) p.push('referências oficiais ausentes ou inválidas');
  return p;
}

/* Documentos do curso, nos mesmos caminhos que seed/docs.mjs usa. */
export function courseDocs(W) {
  const d = [{ path: 'kb_courses/' + W.course.id, data: W.course }];
  W.lessons.forEach((l) => d.push({ path: 'kb_lessons/' + l.id, data: l }));
  Object.entries(W.exsets).forEach(([id, s]) => d.push({ path: 'kb_exsets/' + id, data: s }));
  d.push({ path: 'kb_assess/' + W.assessment.id, data: W.assessment });
  d.push({ path: 'kb_projects/' + W.project.id, data: W.project });
  return d;
}

/* ---------- Construção do pacote (pura: sem E/S) ---------- */
// waves: [{ n, declared:[arquivos], entries:[{file, W?, loadError?}] }]
// runValidator(entry, wave, hash, prevRecord) → {ok, at, detail} | null
export function buildPack({ E, baseDocs, waves, prev = null, radar = null, reports = [], runValidator = () => ({ ok: true, at: 'ignorado', detail: 'validadores externos não executados' }) }) {
  const baseCatalog = baseDocs.find((d) => d.path === 'kb_meta/catalog').data;
  const baseOthers = baseDocs.filter((d) => d.path !== 'kb_meta/catalog');
  const taken = new Set(baseOthers.map((d) => d.path)); // base nunca é sobrescrita
  const prevS = prev || { packRev: BASE_REV, courses: {}, docRevs: {} };
  const report = []; const courses = {}; const poolDocs = []; const available = [];
  for (const w of waves) {
    for (const e of w.entries) {
      const rec = { wave: 'c' + w.n, file: e.file, status: 'bloqueado', problems: [] };
      if (e.loadError) { rec.problems.push('não carregável: ' + e.loadError); courses[e.file] = rec; continue; }
      const W = e.W; rec.id = W && W.course && W.course.id; rec.disciplineId = W && W.course && W.course.disciplineId; rec.title = W && W.course && W.course.title;
      const problems = gate(E, W, baseCatalog);
      let docs = [];
      if (!problems.length) {
        docs = courseDocs(W);
        docs.forEach((d) => { if (taken.has(d.path)) problems.push('caminho já ocupado: ' + d.path); });
        if (new Set(docs.map((d) => d.path)).size !== docs.length) problems.push('caminho duplicado dentro do curso');
        const b = E.docsToBundle(E.validateDocs(docs.map((d) => ({ path: d.path, data: d.data }))).docs);
        E.validateBundle(b).forEach((m) => problems.push('validateBundle: ' + m));
      }
      if (!problems.length) {
        rec.hash = sha(docs); const pv = prevS.courses[e.file];
        const v = runValidator(e, w, rec.hash, pv && pv.hash === rec.hash ? pv.validated : null);
        rec.validated = v; if (!v || !v.ok) problems.push('validador reprovou: ' + (v && v.detail || 'sem resultado'));
      }
      rec.problems = problems;
      if (!problems.length) { rec.status = 'disponível'; rec.docs = docs.map((d) => d.path); docs.forEach((d) => taken.add(d.path)); poolDocs.push(...docs); available.push(W.course); }
      courses[e.file] = rec;
    }
  }
  /* catálogo: base + vínculo curso → disciplina (a UI usa course.disciplineId; o vínculo no catálogo mantém a coerência) */
  const catalog = JSON.parse(JSON.stringify(baseCatalog));
  available.forEach((c) => [c.disciplineId, ...(c.disciplineIds || [])].forEach((did) => catalog.areas.forEach((a) => a.disciplines.forEach((d) => { if (d.id === did && !d.courses.includes(c.id)) d.courses.push(c.id); }))));
  /* página de status de produção (vira documento comum do pacote) */
  const rows = []; waves.forEach((w) => { const known = new Set(w.entries.map((e) => e.file)); w.declared.forEach((f) => { if (!known.has(f)) rows.push(['C' + w.n, f, '⏳ não produzido', '']); }); w.entries.forEach((e) => { const r = courses[e.file]; rows.push(['C' + w.n, r.title ? r.title + ' (`' + r.id + '`)' : e.file, r.status === 'disponível' ? '✅ disponível' : '🚧 bloqueado', r.problems.slice(0, 3).join('; ')]); }); });
  const page = { id: PAGE_ID, title: 'Status de produção e disponibilização (C2–C11)', status: 'published', version: 1, updatedAt: STAMP, tags: ['producao', 'status'], md: 'Cursos aparecem no catálogo só quando passam no portão de disponibilização (metadados, módulos, aulas, exercícios com gabarito, prova, projeto, glossário, cheatsheet, referências e validadores). Esta página é gerada pelo pacote de visualização local.\n\n| Onda | Curso | Estado | Pendências |\n|---|---|---|---|\n' + rows.map((r) => '| ' + r.join(' | ').replace(/\n/g, ' ') + ' |').join('\n') };
  const all = [...poolDocs, { path: 'kb_pages/' + PAGE_ID, data: page }];
  /* relatórios de revisão (preview/state/reports/*.md, gerados pelos scripts report-*.mjs) viram páginas comuns do pacote */
  reports.forEach((r) => { const path = 'kb_pages/' + r.id; if (taken.has(path)) return; taken.add(path); all.push({ path, data: { id: r.id, title: r.title, status: 'published', version: 1, updatedAt: STAMP, tags: ['relatorio', 'revisao'], md: r.md.slice(0, 60000) } }); });
  /* radar atualizado (preview/state/radar.json, gerado por radar-update.mjs): itens novos + data da última checagem */
  let radarDropsBase = false;
  if (radar && Array.isArray(radar.items)) {
    radar.items.forEach((i) => { const path = 'kb_radar/' + i.id; if (taken.has(path)) return; taken.add(path); all.push({ path, data: { status: 'published', sourceKind: 'comunitaria', ...i } }); });
    const cfg = baseDocs.find((d) => d.path === 'kb_meta/radarcfg');
    if (cfg) { radarDropsBase = true; all.push({ path: 'kb_meta/radarcfg', data: { ...cfg.data, lastCheck: radar.checkedAt, lastCheckBy: 'preview/radar-update.mjs (endoflife.date)', updatedAt: radar.checkedAt + 'T00:00:00.000Z' } }); }
  }
  /* revisões incrementais por documento */
  const hashes = Object.fromEntries(all.map((d) => [d.path, sha(d.data)]));
  const prevPaths = Object.keys(prevS.docRevs);
  const changed = all.some((d) => !prevS.docRevs[d.path] || prevS.docRevs[d.path].hash !== hashes[d.path]) || prevPaths.some((p) => !hashes[p]);
  const packRev = changed ? prevS.packRev + 1 : prevS.packRev;
  const docRevs = {};
  const stamped = all.map((d) => { const pr = prevS.docRevs[d.path]; const rev = pr && pr.hash === hashes[d.path] ? pr.rev : packRev; docRevs[d.path] = { hash: hashes[d.path], rev }; const data = { ...d.data, updatedAt: d.data.updatedAt, seedRev: rev }; data.seedStamp = data.updatedAt; return { path: d.path, data }; });
  const catRev = available.length || prevPaths.length ? packRev : BASE_REV;
  catalog.seedRev = catRev;
  const catDoc = { path: 'kb_meta/catalog', data: { ...catalog, seedRev: catRev, seedStamp: catalog.updatedAt } };
  // mantém o catálogo (mesclado) na posição original e a base intacta
  const docs = [...baseDocs.filter((d) => !(radarDropsBase && d.path === 'kb_meta/radarcfg')).map((d) => (d.path === 'kb_meta/catalog' ? catDoc : d)), ...stamped];
  const v = E.validateDocs(docs); if (v.errors.length) throw new Error('pacote final inválido: ' + v.errors.slice(0, 3).join(' | '));
  const state = { packRev, courses, docRevs };
  const pub = { packRev: catRev, courses: available.map((c) => c.id), pageId: PAGE_ID, docs: docs.length };
  return { docs, state, pub, changed, available: available.map((c) => c.id), report };
}

/* ---------- E/S ---------- */
const P = (p) => ROOT + p;
const readJSON = (p, d) => { try { return JSON.parse(readFileSync(p, 'utf8')); } catch (e) { return d; } };
const writeIfChanged = (p, s) => { if (existsSync(p) && readFileSync(p, 'utf8') === s) return false; mkdirSync(p.replace(/\/[^/]*$/, ''), { recursive: true }); writeFileSync(p, s); return true; };

const SHIM = `<script>/*preview-pack*/(function(){if(/[?&]nopack=1/.test(location.search))return;var t=0;function go(){var A=window.__academia;if(!A||!A.KB||!A.KB.loaded){if(++t<300)setTimeout(go,100);return}
fetch('preview-manifest.json',{cache:'no-store'}).then(function(r){return r.json()}).then(function(m){var KB=A.KB;var miss=m.courses.filter(function(id){return !KB.courses[id]});var cr=(KB.meta.catalog||{}).seedRev||0;var pg=m.pageId&&!KB.pages[m.pageId];
if(!miss.length&&!pg&&cr>=m.packRev)return;var before=Object.keys(KB.courses).length;
Promise.resolve(A.ACT['kb-install']()).then(function(){try{localStorage.setItem('afs2:preview-pack',JSON.stringify({packRev:m.packRev,at:new Date().toISOString(),coursesBefore:before,coursesAfter:Object.keys(KB.courses).length,added:miss}))}catch(e){}})}).catch(function(){})}
if(document.readyState==='complete')go();else addEventListener('load',go)})()</script>`;

const RESTORE = `<script>/*preview-progress-restore*/(function(){try{var K='afs2:u:state',cur=localStorage.getItem(K),fresh=!cur;if(cur){try{var o=JSON.parse(cur);var v=o&&o.v;fresh=!(o&&(Object.keys(o.courses||{}).length||Object.keys(o.ex||{}).length||(o.log||[]).length||(o.profile&&o.profile.onb)))}catch(e){fresh=true}}
if(!fresh)return;var x=new XMLHttpRequest();x.open('GET','__progress',false);x.send();if(x.status===200&&x.responseText){var s=JSON.parse(x.responseText);if(s&&s.v===2){localStorage.setItem(K,JSON.stringify(s));try{localStorage.setItem('afs2:preview-restored',new Date().toISOString())}catch(e){}}}}catch(e){}})()</script>`;
const PUSH = `<script>/*preview-progress-push*/(function(){var K='afs2:u:state',last=null,busy=false;function push(){try{var cur=localStorage.getItem(K);if(!cur||cur===last||busy)return;var o=JSON.parse(cur);if(!o||o.v!==2)return;busy=true;fetch('__progress',{method:'PUT',headers:{'content-type':'application/json'},body:cur,keepalive:cur.length<60000}).then(function(r){if(r.ok)last=cur}).catch(function(){}).then(function(){busy=false})}catch(e){}}
setInterval(push,2000);addEventListener('pagehide',push);document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden')push()})})()</script>`;

function loadState() { return readJSON(P('preview/state/manifest.json'), null); }

async function loadWaves(only) {
  const waves = [];
  for (let n = 2; n <= 11; n++) {
    if (only && !only.includes('c' + n)) continue;
    const idx = P('seed/c' + n + '/index.mjs'); if (!existsSync(idx)) continue;
    const m = await import(pathToFileURL(idx).href);
    const declared = m['C' + n + '_FILES'] || []; const entries = [];
    for (const f of declared) {
      const file = P('seed/c' + n + '/' + f + '.mjs'); if (!existsSync(file)) continue;
      try { const mod = await import(pathToFileURL(file).href); entries.push({ file: f, W: mod.COURSE }); } catch (e) { entries.push({ file: f, loadError: String(e.message).slice(0, 160) }); }
    }
    waves.push({ n, declared, entries });
  }
  return waves;
}

function validatorRunner(enabled) {
  return (entry, wave, hash, prevRec) => {
    if (!enabled) return { ok: true, at: 'ignorado', detail: '--no-validate' };
    if (prevRec && prevRec.ok && prevRec.hash === hash) return prevRec; // incremental: conteúdo idêntico já validado
    const script = P('seed/c' + wave.n + '/validate.mjs');
    if (!existsSync(script)) return { ok: false, detail: 'validate.mjs ausente na onda c' + wave.n, hash };
    const r = spawnSync(process.execPath, [script, entry.file], { cwd: ROOT, encoding: 'utf8', timeout: 20 * 60 * 1000, maxBuffer: 64 * 1024 * 1024 });
    const tail = (r.stdout || '').trim().split('\n').slice(-1)[0];
    return { ok: r.status === 0, at: new Date().toISOString(), hash, detail: 'validate.mjs c' + wave.n + ' ' + entry.file + ': ' + (r.status === 0 ? 'OK' : 'código ' + r.status + ' — ' + tail) };
  };
}

async function main() {
  const args = process.argv.slice(2); const flag = (f) => args.includes(f);
  const wi = args.indexOf('--waves'); const only = wi >= 0 ? args[wi + 1].split(',') : null;
  const OUT = P('preview/dist/'); const BK = P('preview/state/backups/');
  if (flag('--rollback')) {
    const dirs = existsSync(BK) ? readdirSync(BK).sort() : []; if (!dirs.length) { console.log('Nada para reverter: sem backups.'); return; }
    const last = BK + dirs[dirs.length - 1] + '/';
    ['seed-docs.json', 'preview-manifest.json', 'index.html'].forEach((f) => { if (existsSync(last + f)) copyFileSync(last + f, OUT + f); else if (existsSync(OUT + f)) rmSync(OUT + f); });
    if (existsSync(last + 'state.json')) copyFileSync(last + 'state.json', P('preview/state/manifest.json')); else rmSync(P('preview/state/manifest.json'), { force: true });
    rmSync(last, { recursive: true }); console.log('Revertido para o estado anterior (' + dirs[dirs.length - 1] + ').'); return;
  }
  const E = require(P('src/engine.js'));
  const baseDocs = JSON.parse(readFileSync(P('seed/docs.json'), 'utf8'));
  const prev = loadState(); const waves = await loadWaves(only);
  const radar = readJSON(P('preview/state/radar.json'), null);
  const REPS = [['radar-aulas', 'rel-radar-aulas', 'Revisão sugerida: alertas do Radar × aulas'], ['versoes', 'rel-versoes', 'Revisão sugerida: defasagem de versões dos cursos'], ['links', 'rel-links', 'Revisão sugerida: verificação de links']];
  const reports = REPS.filter(([f]) => existsSync(P('preview/state/reports/' + f + '.md'))).map(([f, id, title]) => ({ id, title, md: readFileSync(P('preview/state/reports/' + f + '.md'), 'utf8') }));
  const res = buildPack({ E, baseDocs, waves, prev, radar, reports, runValidator: validatorRunner(!flag('--no-validate')) });
  const docsJson = JSON.stringify(res.docs); const pubJson = JSON.stringify(res.pub, null, 1) + '\n';
  const dist = readFileSync(P('dist/index.html'), 'utf8'); if (!dist.includes('</body>')) throw new Error('dist/index.html sem </body>');
  const html = dist.replace('</head>', () => RESTORE + '\n</head>').replace(/<\/body>\s*<\/html>\s*$/, () => SHIM + '\n' + PUSH + '\n</body>\n</html>\n');
  const stateJson = JSON.stringify({ ...res.state, generatedBy: 'preview/build-preview.mjs' }, null, 1) + '\n';
  // resumo
  const per = Object.values(res.state.courses);
  console.log('Pacote de visualização — packRev ' + res.state.packRev + (res.changed ? ' (alterado)' : ' (sem mudanças)'));
  per.forEach((r) => console.log('  ' + (r.status === 'disponível' ? '✔' : '✖') + ' ' + r.wave + ' ' + r.file + (r.id ? ' → ' + r.id + ' / ' + r.disciplineId : '') + (r.problems.length ? ' | ' + r.problems.slice(0, 3).join('; ') : '') + (r.validated ? ' | ' + r.validated.detail : '')));
  if (radar) console.log('radar: ' + radar.items.length + ' entradas novas (checado em ' + radar.checkedAt + ')');
  console.log('documentos: ' + res.docs.length + ' (base ' + baseDocs.length + ' + ' + (res.docs.length - baseDocs.length) + ')  cursos disponíveis: ' + res.available.length);
  if (flag('--dry-run')) { console.log('--dry-run: nada gravado.'); return; }
  const will = res.changed || !existsSync(OUT + 'seed-docs.json') || readFileSync(OUT + 'index.html', 'utf8') !== html;
  if (will && existsSync(OUT + 'seed-docs.json')) { // backup antes de sobrescrever
    const b = BK + String(Date.now()) + '/'; mkdirSync(b, { recursive: true });
    ['seed-docs.json', 'preview-manifest.json', 'index.html'].forEach((f) => { if (existsSync(OUT + f)) copyFileSync(OUT + f, b + f); });
    if (existsSync(P('preview/state/manifest.json'))) copyFileSync(P('preview/state/manifest.json'), b + 'state.json');
  }
  const w = [writeIfChanged(OUT + 'seed-docs.json', docsJson), writeIfChanged(OUT + 'preview-manifest.json', pubJson), writeIfChanged(OUT + 'index.html', html), writeIfChanged(P('preview/state/manifest.json'), stateJson)];
  console.log(w.some(Boolean) ? 'Arquivos atualizados em preview/dist/ e preview/state/.' : 'Nenhum arquivo precisou mudar (idempotente).');
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main().catch((e) => { console.error('ERRO:', e.message); process.exit(1); });
