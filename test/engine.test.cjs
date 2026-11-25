// Testes automatizados: regras do Engine e integridade do conteúdo do seed (node --test)
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const E = require('../src/engine.js');
const seed = require('../seed/seed.json');
// O código inicial (incompleto) de alguns desafios deixa promises rejeitadas sem tratamento: esperado.
process.on('unhandledRejection', () => {});

function runInSandbox(src, timeout = 4000) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), timeout);
    const ctx = { setTimeout, clearTimeout, queueMicrotask, console: {}, postMessage: (m) => { clearTimeout(t); resolve(m); }, Date };
    try { vm.runInNewContext(src, ctx); } catch (e) { clearTimeout(t); reject(e); }
  });
}
const allItems = [...Object.values(seed.exsets).flatMap((s) => s.items), ...seed.assessments.flatMap((a) => a.items)];

test('correção: múltipla escolha, V/F e identificação de erro', () => {
  assert.equal(E.grade({ type: 'mc', answer: 2 }, 2).correct, true);
  assert.equal(E.grade({ type: 'mc', answer: 2 }, 1).score, 0);
  assert.equal(E.grade({ type: 'tf', answer: false }, false).correct, true);
  assert.equal(E.grade({ type: 'tf', answer: false }, true).correct, false);
  assert.equal(E.grade({ type: 'bug', answer: 4 }, '4').correct, true);
  assert.equal(E.grade({ type: 'mc', answer: 0 }, null).score, 0);
});
test('correção: associação e preenchimento com pontuação parcial', () => {
  const m = { type: 'match', pairs: [['a', '1'], ['b', '2'], ['c', '3'], ['d', '4']] };
  assert.equal(E.grade(m, ['1', '2', '3', '4']).correct, true);
  assert.equal(E.grade(m, ['1', '2', '4', '3']).score, 0.5);
  const f = { type: 'fill', answers: [['await'], ['all', 'allSettled']] };
  assert.equal(E.grade(f, ['await', ' allSettled ']).correct, true);
  assert.equal(E.grade(f, ['await', 'race']).score, 0.5);
});
test('correção: aberta e prática são autoavaliadas; código usa testes', () => {
  const o = E.grade({ type: 'open', rubric: ['a', 'b', 'c', 'd'] }, { checks: [true, true, true, false] });
  assert.equal(o.selfAssessed, true); assert.equal(o.score, 0.75); assert.equal(o.correct, true);
  assert.equal(E.grade({ type: 'code' }, { passed: 2, total: 3 }).correct, false);
  assert.equal(E.grade({ type: 'code' }, { passed: 3, total: 3 }).correct, true);
});
test('gradeAll pondera pelos pontos', () => {
  const items = [{ id: 'a', type: 'tf', answer: true, points: 10 }, { id: 'b', type: 'tf', answer: true, points: 30 }];
  assert.equal(E.gradeAll(items, { a: true, b: false }).pct, 25);
});
test('SM-2: erro volta para 1 dia; acertos aumentam o intervalo', () => {
  let c = E.sm2({}, 5, '2026-11-17'); assert.equal(c.iv, 1); assert.equal(c.due, '2026-11-18');
  c = E.sm2(c, 5, '2026-11-18'); assert.equal(c.iv, 6);
  c = E.sm2(c, 4, '2026-11-24'); assert.ok(c.iv > 6);
  c = E.sm2(c, 1, '2026-12-10'); assert.equal(c.iv, 1); assert.equal(c.reps, 0); assert.ok(c.ef >= 1.3);
});
test('radar: chave de deduplicação, CVSS e notificações sem duplicar', () => {
  const a = { url: 'https://endoflife.date/nodejs', tech: 'nodejs', type: 'versao', version: '26.13.1' };
  assert.equal(E.radarKey(a), 'endoflife.date:nodejs:versao:26.13.1');
  assert.equal(E.dedupe([a], { ...a }), true);
  assert.equal(E.dedupe([a], { ...a, version: '26.13.2' }), false);
  assert.deepEqual([9.8, 7.5, 5, 2, null].map(E.relFromCvss), ['critica', 'alta', 'media', 'informativa', 'informativa']);
  const es = [{ id: '1', tech: 'nodejs', type: 'versao', relevance: 'media' }, { id: '2', tech: 'react', type: 'versao', relevance: 'alta' }, { id: '3', tech: 'nodejs', type: 'vulnerabilidade', relevance: 'informativa' }];
  assert.deepEqual(E.notifications(es, { watch: ['nodejs'], minRel: 'media' }).map((x) => x.id), ['1']);
  assert.deepEqual(E.notifications(es, { watch: ['nodejs'], minRel: 'media', seen: { 1: 'x' } }), []);
  assert.deepEqual(E.notifications(es, { notify: false }), []);
});
test('busca local: acentos, pesos e filtros', () => {
  const docs = [{ id: 'a', cat: 'aula', title: 'Promises: encadeamento', text: 'then catch', tags: ['javascript'] }, { id: 'b', cat: 'ref', title: 'Kafka', text: 'mensageria distribuída', tags: ['kafka'] }];
  assert.equal(E.search(docs, 'promises')[0].id, 'a');
  assert.equal(E.search(docs, 'distribuida')[0].id, 'b');
  assert.equal(E.search(docs, 'promises', { cat: 'ref' }).length, 0);
  assert.equal(E.reliabilityFor('https://developer.mozilla.org/x'), 'alta');
  assert.equal(E.reliabilityFor('https://blog.qualquer.com'), 'verificar');
});
test('progresso de curso', () => {
  const c = { modules: [{ id: 'm1', lessons: ['a', 'b'] }, { id: 'm2', lessons: ['c'] }] };
  const p = E.courseProgress(c, { lessons: { a: { done: true }, b: { done: true } }, assess: [{ pct: 60 }, { pct: 80 }], passed: true });
  assert.deepEqual([p.done, p.total, p.pct, p.modulesDone, p.best, p.passed], [2, 3, 67, 1, 80, true]);
});
test('seed: curso, aulas, exercícios e avaliação passam na validação', () => {
  assert.deepEqual(E.validateBundle(seed), []);
  seed.courses.forEach((c) => E.courseLessonIds(c).forEach((id) => assert.ok(seed.lessons.find((l) => l.id === id), 'aula ausente ' + id)));
  const ids = allItems.map((x) => x.id); assert.equal(new Set(ids).size, ids.length, 'ids de exercício duplicados');
  const types = new Set(allItems.map((x) => x.type)); E.TYPES.forEach((t) => assert.ok(types.has(t), 'tipo sem exemplo na base: ' + t));
});
test('seed: toda referência tem URL válida ou é livro; nenhuma URL duplicada no radar', () => {
  seed.lessons.forEach((l) => l.refs.forEach((r) => assert.ok(r.kind === 'book' || E.isUrl(r.url), l.id + ' ' + r.title)));
  const keys = seed.radar.map((r) => r.key); assert.equal(new Set(keys).size, keys.length);
  seed.radar.forEach((r) => assert.ok(E.isUrl(r.url)));
});
const codeItems = [...allItems.filter((x) => x.type === 'code'), ...seed.projects.filter((p) => p.lab).map((p) => ({ id: p.id, tests: p.lab.tests, starter: p.lab.starter, solution: p.lab.solution || null }))];
for (const ex of codeItems.filter((x) => x.solution)) {
  test('desafio ' + ex.id + ': a solução de referência passa em todos os testes', async () => {
    const m = await runInSandbox(E.buildTestSource(ex.solution, ex.tests));
    m.res.forEach((r) => assert.ok(r.ok, r.name + ': ' + r.error));
  });
  test('desafio ' + ex.id + ': o código inicial NÃO passa (o teste é significativo)', async () => {
    const m = await runInSandbox(E.buildTestSource(ex.starter, ex.tests));
    assert.ok(m.res.some((r) => !r.ok));
  });
}
test('projeto agregador: uma implementação de referência passa nos testes do laboratório', async () => {
  const p = seed.projects.find((x) => x.id === 'agregador-cotacoes');
  const ref = `async function agregarCotacoes(fontes, { concorrencia = 2, timeoutMs = 100, tentativas = 2 } = {}) {
  const comTimeout = (fn) => Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), timeoutMs))]);
  async function tentar(fn) { let ultimo; for (let i = 0; i < tentativas; i++) { try { return await comTimeout(fn); } catch (e) { ultimo = e; } } throw ultimo; }
  const resultados = new Array(fontes.length).fill(null); const falhas = []; let prox = 0;
  async function trab() { while (prox < fontes.length) { const i = prox++; try { resultados[i] = await tentar(fontes[i]); } catch (e) { falhas.push({ indice: i, erro: e.message }); } } }
  await Promise.all(Array.from({ length: Math.min(concorrencia, fontes.length) }, trab));
  falhas.sort((a, b) => a.indice - b.indice); return { resultados, falhas };
}`;
  const m = await runInSandbox(E.buildTestSource(ref, p.lab.tests));
  m.res.forEach((r) => assert.ok(r.ok, r.name + ': ' + r.error));
});
test('sandbox: erro de sintaxe no código do aluno é reportado, não quebra o runner', async () => {
  await assert.rejects(runInSandbox(E.buildTestSource('function (', [{ name: 'x', code: 'assert.ok(true)' }])));
});

/* ---------- Onda 1: checklist, cobertura, análise de itens, rastreamento, pacote incremental ---------- */
test('rastreamento de execução: correção determinística por etapa', () => {
  const ex = { id: 't1', type: 'trace', prompt: 'p', explanation: 'e', code: 'let x=1', steps: [{ q: 'x', answers: ['3'] }, { q: 'y', answers: ['true', 'verdadeiro'] }] };
  assert.deepEqual(E.validateExercise(ex), []);
  const g = E.grade(ex, [' 3 ', 'Verdadeiro']); assert.equal(g.correct, true);
  const h = E.grade(ex, ['3', 'false']); assert.equal(h.score, 0.5); assert.deepEqual(h.detail, [true, false]);
  assert.ok(E.validateExercise({ ...ex, steps: [{ q: 'x' }] }).length);
});
test('checklist de publicação bloqueia aula incompleta', () => {
  const l = { id: 'a', courseId: 'c', title: 't', objectives: ['o'], intro: 'i', theory: 'x'.repeat(500), concepts: [{ term: 'a', def: 'b' }], examples: 'e', bestPractices: ['b'], mistakes: ['m'], market: 'm', summary: 's', refs: [{ title: 'MDN', url: 'https://developer.mozilla.org', kind: 'doc' }], techVersions: 'ES2023' };
  const items = [{ id: 'e1', type: 'tf', prompt: 'p', answer: true, explanation: 'e' }];
  assert.equal(E.checklistOk(E.lessonChecklist(l, items)), true);
  const miss = (o, it) => E.lessonChecklist(o, it).filter((c) => !c.ok).map((c) => c.k);
  assert.deepEqual(miss({ ...l, objectives: [] }, items), ['objectives']);
  assert.deepEqual(miss({ ...l, mistakes: [] }, items), ['content']);
  assert.deepEqual(miss(l, []), ['exercises', 'answers']);
  assert.deepEqual(miss(l, [{ id: 'e1', type: 'tf', prompt: 'p', explanation: 'e' }]), ['answers']);
  assert.deepEqual(miss({ ...l, refs: [] }, items), ['refs']);
  assert.deepEqual(miss({ ...l, techVersions: '' }, items), ['version']);
});
test('relatório de cobertura identifica lacunas', () => {
  const kb = { catalog: { areas: [{ name: 'A', disciplines: [{ id: 'd1', name: 'D1' }, { id: 'd2', name: 'D2' }, { id: 'd3', name: 'D3' }] }] },
    courses: { c1: { id: 'c1', title: 'C1', disciplineId: 'd1', disciplineIds: ['d3'], modules: [{ id: 'm1', title: 'M1', lessons: ['l1', 'l2'] }, { id: 'm2', title: 'M2', lessons: [] }], projectIds: [] } },
    lessons: { l1: { id: 'l1', title: 'L1' } }, exsets: { l1: { items: [{ id: 'x', type: 'mc', prompt: 'p', options: ['a', 'b'], explanation: 'e' }] } }, assess: {} };
  const r = E.coverage(kb);
  assert.deepEqual(r.disciplinesWithoutCourses.map((d) => d.id), ['d2']);
  assert.equal(r.modulesWithoutLessons.length, 1); assert.deepEqual(r.missingLessons.map((x) => x.id), ['l2']);
  assert.equal(r.exercisesWithoutKey.length, 1); assert.equal(r.coursesWithoutAssessment.length, 1); assert.equal(r.coursesWithoutProject.length, 1);
});
test('análise de itens sinaliza acerto baixo, alto, ambiguidade e erro recorrente', () => {
  const mc = { id: 'q1', type: 'mc', options: ['a', 'b', 'c'], answer: 0 };
  const easy = { id: 'q2', type: 'tf', answer: true };
  const code = { id: 'q3', type: 'code' };
  const docs = [...Array(6)].map((_, i) => ({ items: { q1: { f: i === 0 ? 100 : 0, c: i === 0 ? 0 : 2, t: 1 }, q2: { f: 100, c: 1, t: 1 }, q3: { f: 50, c: ['lida com vazio'], t: 4 } } }));
  const [a1, a2, a3] = E.itemAnalysis([mc, easy, code], docs);
  assert.ok(a1.flags.some((f) => f.k === 'baixa')); assert.ok(a1.flags.some((f) => f.k === 'ambigua' && /opção C/.test(f.t)));
  assert.ok(a2.flags.some((f) => f.k === 'alta'));
  assert.ok(a3.flags.some((f) => f.k === 'recorrente' && /lida com vazio/.test(f.t))); assert.ok(a3.flags.some((f) => f.k === 'tentativas'));
  const few = E.itemAnalysis([mc], docs.slice(0, 3))[0]; assert.equal(few.flags.length, 0, 'amostra pequena não sinaliza');
  assert.deepEqual(E.respSummary({ type: 'fill' }, ['a', 'b'], { detail: [true, false] }), [1]);
});
test('pacote incremental: cria, atualiza só o não editado e mescla catálogo', () => {
  const docs = [{ path: 'kb_courses/a', data: { seedRev: 2 } }, { path: 'kb_courses/b', data: { seedRev: 2 } }, { path: 'kb_courses/c', data: { seedRev: 2 } }, { path: 'kb_courses/d', data: { seedRev: 2 } }, { path: 'kb_meta/catalog', data: { seedRev: 2 } }];
  const ex = { 'kb_courses/b': { seedRev: 1, seedStamp: 't0', updatedAt: 't0' }, 'kb_courses/c': { seedRev: 1, seedStamp: 't0', updatedAt: 't1' }, 'kb_courses/d': { title: 'piloto' }, 'kb_meta/catalog': {} };
  assert.deepEqual(E.seedPlan(docs, ex, {}).map((d) => d.action), ['create', 'update', 'skip', 'skip', 'merge']);
  assert.equal(E.seedPlan(docs, ex, { 'kb_courses/b': true })[1].action, 'skip', 'rascunho pendente protege');
  const cur = { areas: [{ id: 'x', disciplines: [{ id: 'd', name: 'Minha', courses: ['p'] }] }], tracks: [{ id: 't' }] };
  const m = E.mergeCatalog(cur, { seedRev: 2, areas: [{ id: 'x', disciplines: [{ id: 'd', name: 'Outro', courses: ['n'] }, { id: 'e', courses: [] }] }], tracks: [{ id: 't' }, { id: 'u' }] });
  assert.deepEqual(m.areas[0].disciplines[0].courses, ['p', 'n']); assert.equal(m.areas[0].disciplines[0].name, 'Minha'); assert.equal(m.areas[0].disciplines.length, 2); assert.equal(m.tracks.length, 2);
});

test('validateDocs/validateBundle: formato {path,data}', () => {
  const E = require('../src/engine.js');
  const docs = require('../seed/docs.json');
  assert.deepEqual(E.validateBundle(docs), []);
  assert.match(E.validateBundle([])[0], /vazio/);
  assert.match(E.validateBundle([{ path: 'kb_courses/a' }])[0], /data/);
  assert.match(E.validateBundle([{ data: {} }])[0], /path/);
  assert.match(E.validateBundle([{ path: 'kb_zzz/a', data: {} }])[0], /desconhecida/);
  assert.match(E.validateBundle([{ path: 'kb_courses/a', data: { id: 'b' } }])[0], /não confere/);
  const b = E.docsToBundle(E.validateDocs(docs).docs);
  assert.equal(b.courses.length, 6); assert.equal(b.lessons.length, 44); assert.ok(b.catalog.areas);
});
