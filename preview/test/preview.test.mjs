// Testes do gerador do pacote de visualização. Rodar: node --test preview/test/
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { buildPack, gate } from '../build-preview.mjs';

const R = new URL('../../', import.meta.url);
const require = createRequire(import.meta.url);
const E = require(new URL('src/engine.js', R).pathname);
const baseDocs = JSON.parse(readFileSync(new URL('seed/docs.json', R)));
const { loadC2 } = await import(new URL('seed/c2/index.mjs', R).href);
const c2 = await loadC2();
const wave2 = { n: 2, declared: c2.map((x) => x.file), entries: c2.map((x) => ({ file: x.file, W: x.W })) };

/* clona um curso com ids novos (simula curso de uma onda futura) */
const clone = (W, tag, disc) => {
  const c = W.course.id, p = W.project.id;
  let s = JSON.stringify(W).split('"' + c + '"').join('"' + c + tag + '"').split('"' + p + '"').join('"' + p + tag + '"').replace(/\brea-(\d\d)\b/g, 'rx' + tag.replace(/\W/g, '') + '-$1');
  const o = JSON.parse(s); if (disc) o.course.disciplineId = disc; return o;
};
const wave3 = (entries) => ({ n: 3, declared: entries.map((e) => e.file), entries });
const mk = (waves, prev) => buildPack({ E, baseDocs, waves, prev });
const paths = (docs) => docs.map((d) => d.path);

test('1-4: C2 gera 8 cursos, 162 documentos de curso, sem duplicados, disciplinas válidas', () => {
  const r = mk([wave2]);
  assert.equal(r.available.length, 8);
  const cdocs = r.docs.filter((d) => /^kb_(courses|lessons|exsets|assess|projects)\//.test(d.path) && !baseDocs.some((b) => b.path === d.path));
  assert.equal(cdocs.length, 162);
  assert.equal(new Set(paths(r.docs)).size, r.docs.length, 'sem caminhos duplicados');
  assert.equal(E.validateDocs(r.docs).errors.length, 0);
  assert.equal(E.validateBundle(r.docs).length, 0);
  const cat = r.docs.find((d) => d.path === 'kb_meta/catalog').data;
  const disc = Object.fromEntries(cat.areas.flatMap((a) => a.disciplines.map((d) => [d.id, d])));
  c2.forEach((x) => assert.ok(disc[x.W.course.disciplineId].courses.includes(x.W.course.id), x.W.course.id));
  Object.values(disc).forEach((d) => assert.equal(d.courses.length, new Set(d.courses).size, 'vínculo repetido em ' + d.id));
});

test('base (seed/docs.json) preservada: nenhum documento da base muda, exceto o catálogo mesclado', () => {
  const r = mk([wave2]);
  baseDocs.filter((b) => b.path !== 'kb_meta/catalog').forEach((b, i) => assert.deepEqual(r.docs.find((d) => d.path === b.path), b));
  const bc = baseDocs.find((b) => b.path === 'kb_meta/catalog').data, nc = r.docs.find((d) => d.path === 'kb_meta/catalog').data;
  assert.equal(nc.areas.length, bc.areas.length); assert.equal(nc.tracks.length, bc.tracks.length);
  assert.ok(nc.seedRev > bc.seedRev);
});

test('11: reexecução é idempotente (mesmo conteúdo, mesma revisão, sem mudança)', () => {
  const a = mk([wave2]); const b = mk([wave2], a.state);
  assert.equal(b.changed, false); assert.equal(b.state.packRev, a.state.packRev);
  assert.equal(JSON.stringify(b.docs), JSON.stringify(a.docs));
});

test('10: nova onda é incremental — documentos antigos mantêm a revisão, só os novos recebem a nova', () => {
  const a = mk([wave2]);
  const W = clone(c2[0].W, '-x');
  const b = mk([wave2, wave3([{ file: 'c3x', W }])], a.state);
  assert.equal(b.changed, true); assert.equal(b.state.packRev, a.state.packRev + 1);
  assert.ok(b.available.includes(W.course.id));
  a.docs.filter((d) => a.state.docRevs[d.path] && d.path !== 'kb_pages/producao-c2-c11').forEach((d) => assert.equal(b.docs.find((x) => x.path === d.path).data.seedRev, d.data.seedRev, d.path));
  const novos = b.docs.filter((d) => !a.docs.some((x) => x.path === d.path));
  assert.ok(novos.length >= 12); novos.forEach((d) => assert.equal(d.data.seedRev, b.state.packRev));
  assert.equal(new Set(paths(b.docs)).size, b.docs.length);
});

test('portão: curso incompleto não é disponibilizado', () => {
  const cat = baseDocs.find((d) => d.path === 'kb_meta/catalog').data;
  const faltas = {
    'sem cheatsheet': (W) => { W.course.supplement.cheatsheet = []; },
    'sem glossário': (W) => { W.course.supplement.glossary = []; },
    'sem referências oficiais': (W) => { W.course.supplement.officialRefs = []; },
    'sem prova': (W) => { W.assessment = null; },
    'sem projeto': (W) => { W.project = null; },
    'aula sem exercícios': (W) => { delete W.exsets[W.lessons[0].id]; },
    'disciplina inexistente': (W) => { W.course.disciplineId = 'nao-existe'; },
    'sem módulos': (W) => { W.course.modules = []; }
  };
  assert.deepEqual(gate(E, c2[0].W, cat), [], 'curso íntegro passa');
  Object.entries(faltas).forEach(([nome, f]) => { const W = clone(c2[0].W, '-y'); f(W); assert.ok(gate(E, W, cat).length > 0, nome); });
  const W = clone(c2[0].W, '-y'); W.course.supplement.cheatsheet = [];
  const r = mk([wave2, wave3([{ file: 'inc', W }])]);
  assert.ok(!r.available.includes(W.course.id)); assert.equal(r.state.courses.inc.status, 'bloqueado');
  assert.ok(!r.docs.some((d) => d.path === 'kb_courses/' + W.course.id));
});

test('portão: id duplicado (colisão com a base ou com outra onda) bloqueia o curso', () => {
  const dupBase = JSON.parse(JSON.stringify(c2[0].W)); dupBase.course.id = 'js-async';
  const r1 = mk([wave3([{ file: 'dup1', W: dupBase }])]);
  assert.equal(r1.state.courses.dup1.status, 'bloqueado');
  const r2 = mk([wave2, wave3([{ file: 'dup2', W: JSON.parse(JSON.stringify(c2[0].W)) }])]);
  assert.equal(r2.state.courses.dup2.status, 'bloqueado');
  assert.ok(r2.state.courses.dup2.problems.some((p) => /ocupado/.test(p)));
  assert.equal(new Set(paths(r2.docs)).size, r2.docs.length);
});

test('validador reprovado impede a disponibilização; erro de carga também', () => {
  const r = buildPack({ E, baseDocs, waves: [wave2], runValidator: () => ({ ok: false, detail: 'falhou' }) });
  assert.equal(r.available.length, 0);
  const r2 = mk([wave3([{ file: 'quebrado', loadError: 'SyntaxError' }])]);
  assert.equal(r2.state.courses.quebrado.status, 'bloqueado');
});

test('5/12: seedPlan do app — cria o novo, preserva edições e registros do usuário, não duplica ao reaplicar', () => {
  const a = mk([wave2]);
  // "banco local" após a 1ª instalação (mesmo critério do installSeed: mapa path → data)
  const store = {}; baseDocs.forEach((d) => { store[d.path] = d.data; });
  const apply = (plan) => plan.filter((d) => d.action !== 'skip').forEach((d) => { store[d.path] = d.action === 'merge' ? E.mergeCatalog(store[d.path], d.data) : d.data; });
  apply(E.seedPlan(a.docs, store, {}));
  assert.ok(store['kb_courses/react-essencial']);
  // dados do usuário: curso próprio e edição de uma aula do pacote
  store['kb_courses/meu-curso'] = { id: 'meu-curso', title: 'Meu', status: 'draft', updatedAt: '2026-11-30T00:00:00.000Z' };
  const lid = 'rea-01'; store['kb_lessons/' + lid] = { ...store['kb_lessons/' + lid], title: 'EDITADA PELO USUÁRIO', updatedAt: '2026-12-01T00:00:00.000Z' };
  const nCourses = () => Object.keys(store).filter((p) => p.startsWith('kb_courses/')).length;
  const antes = nCourses();
  // reaplicar o mesmo pacote: nada muda
  const p0 = E.seedPlan(a.docs, store, {}); assert.equal(p0.filter((d) => d.action !== 'skip').length, 0, 'reaplicação não escreve nada');
  // nova onda + alteração na aula editada pelo usuário
  const W = clone(c2[0].W, '-z');
  const w2 = { ...wave2, entries: wave2.entries.map((e) => (e.file === c2[0].file ? { ...e, W: JSON.parse(JSON.stringify(e.W).replace('"' + lid + '"', '"' + lid + '"')) } : e)) };
  w2.entries[0].W.lessons[0].intro = 'texto novo da produção';
  w2.entries[0].W.lessons[2].intro = 'texto novo (aula não editada)';
  const b = mk([w2, wave3([{ file: 'z', W }])], a.state);
  const plan = E.seedPlan(b.docs, store, {});
  const act = (p) => plan.find((d) => d.path === p).action;
  assert.equal(act('kb_lessons/' + lid), 'skip', 'edição do usuário preservada');
  assert.equal(act('kb_courses/' + W.course.id), 'create');
  assert.equal(act('kb_meta/catalog'), 'merge');
  assert.equal(plan.some((d) => d.path === 'kb_courses/meu-curso'), false);
  apply(plan);
  assert.equal(store['kb_lessons/' + lid].title, 'EDITADA PELO USUÁRIO');
  assert.equal(store['kb_courses/meu-curso'].title, 'Meu');
  assert.equal(nCourses(), antes + 1);
  assert.equal(E.seedPlan(b.docs, store, {}).filter((d) => d.action !== 'skip').length, 0, 'segunda aplicação não duplica nem reescreve');
  const cat = store['kb_meta/catalog']; cat.areas.forEach((ar) => ar.disciplines.forEach((d) => assert.equal(d.courses.length, new Set(d.courses).size)));
  // aula do pacote NÃO editada, mas com conteúdo novo, é atualizada
  assert.equal(act('kb_lessons/' + c2[0].W.lessons[1].id), 'skip', 'sem mudança: ignora');
  assert.equal(act('kb_lessons/' + c2[0].W.lessons[2].id), 'update', 'conteúdo novo e não editado: atualiza');
});

test('radar: entradas e radarcfg entram no pacote, base preservada, idempotente', () => {
  const item = { id: 'nodejs-eol-25', key: 'endoflife:nodejs:25:eol', tech: 'nodejs', type: 'depreciacao', relevance: 'alta', title: 'Node.js 25 chegou ao fim de vida (EOL) em 01/06/2026', version: '25.9.0', date: '2026-06-01', url: 'https://endoflife.date/nodejs', summary: 's', lessonIds: [], createdAt: '2026-11-25', verifiedAt: '2026-11-25', updatedAt: '2026-06-01T00:00:00.000Z' };
  const radar = { checkedAt: '2026-11-25', items: [item, { ...item, id: 'nodejs-eol-20' }] };
  const a = buildPack({ E, baseDocs, waves: [wave2], radar });
  assert.ok(a.docs.some((d) => d.path === 'kb_radar/nodejs-eol-25'));
  assert.equal(a.docs.filter((d) => d.path === 'kb_radar/nodejs-eol-20').length, 1, 'id da base não é sobrescrito');
  assert.equal(a.docs.find((d) => d.path === 'kb_radar/nodejs-eol-20').data.title.includes('2026-04'), false);
  assert.equal(a.docs.find((d) => d.path === 'kb_meta/radarcfg').data.lastCheck, '2026-11-25');
  assert.equal(new Set(paths(a.docs)).size, a.docs.length);
  assert.equal(E.validateDocs(a.docs).errors.length, 0);
  const b = buildPack({ E, baseDocs, waves: [wave2], radar, prev: a.state });
  assert.equal(b.changed, false);
  const base20 = baseDocs.find((d) => d.path === 'kb_radar/nodejs-eol-20');
  assert.deepEqual(a.docs.find((d) => d.path === 'kb_radar/nodejs-eol-20'), base20);
});
