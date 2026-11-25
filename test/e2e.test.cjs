// Testes de ponta a ponta da página (jsdom), com banco em memória e o professor IA indisponível.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');
const HTML = fs.readFileSync(path.join(__dirname, '../dist/index.html'), 'utf8');
const DOCS = JSON.parse(fs.readFileSync(path.join(__dirname, '../seed/docs.json'), 'utf8'));
process.on('unhandledRejection', () => {});
const WINDOWS = [];
test.after(() => WINDOWS.forEach((w) => w.close()));

function mockDB(docs) {
  const store = new Map(docs.map((d) => [d.path, JSON.parse(JSON.stringify(d.data))]));
  const writes = [];
  const snap = (p) => ({ id: p.split('/').pop(), exists: store.has(p), data: () => store.get(p), metadata: { fromCache: false } });
  const docRef = (p) => ({ path: p, get: async () => snap(p), set: async (d) => { writes.push(p); store.set(p, JSON.parse(JSON.stringify(d))); }, delete: async () => { store.delete(p); } });
  const col = (c, f = []) => ({ doc: (id) => docRef(c + '/' + id), where: (k, op, v) => col(c, [...f, [k, v]]), get: async () => { const n = c.split('/').length + 1; const docs = [...store.keys()].filter((k) => k.startsWith(c + '/') && k.split('/').length === n).filter((k) => f.every(([a, v]) => store.get(k)[a] === v)).map(snap); return { docs, size: docs.length, empty: !docs.length }; } });
  return { doc: docRef, collection: col, store, writes };
}
function boot({ owner = false, sample = null, docs = DOCS, seedFile = null, local = false } = {}) {
  const db = mockDB(docs);
  const calls = { ai: 0 };
  const blobs = new Map();
  const dom = new JSDOM(HTML, {
    runScripts: 'dangerously', url: 'https://academia.test/#inicio', pretendToBeVisual: true,
    beforeParse(w) {
      w.scrollTo = () => {};
      if (!local) w.claude = { use: async (n) => ({ db, user: { isOwner: () => owner, id: async () => 'aluno1' }, sample: sample ? Object.assign(async (...a) => { calls.ai++; return sample(...a); }, {}) : null, downloads: null })[n] || null };
      // Web Worker real não existe no jsdom: executa a fonte gerada em um contexto isolado do node (mesma fonte que o navegador usa).
      w.Blob = class { constructor(parts) { this.src = parts.join(''); } };
      w.URL.createObjectURL = (b) => { const id = 'blob:' + blobs.size; blobs.set(id, b.src); return id; };
      w.Worker = class { constructor(u) { const src = blobs.get(u); setTimeout(() => { try { vm.runInNewContext(src, { setTimeout, clearTimeout, queueMicrotask, Date, postMessage: (data) => this.onmessage && this.onmessage({ data }) }); } catch (e) { this.onerror && this.onerror({ message: e.message, preventDefault() {} }); } }, 0); } terminate() {} };
      w.import = undefined;
      w.fetch = async (u) => (seedFile && String(u).includes('seed-docs.json') ? { ok: true, json: async () => seedFile } : { ok: false, status: 404 });
    }
  });
  const w = dom.window;
  WINDOWS.push(w);
  const errors = []; w.addEventListener('error', (e) => errors.push(e.message));
  return { w, db, calls, errors, $: (s) => w.document.querySelector(s), $$: (s) => [...w.document.querySelectorAll(s)] };
}
const tick = (ms = 30) => new Promise((r) => setTimeout(r, ms));
async function go(ctx, hash) { ctx.w.location.hash = hash; ctx.w.dispatchEvent(new ctx.w.HashChangeEvent('hashchange')); await tick(10); }
async function ready(ctx) { for (let i = 0; i < 100; i++) { if (ctx.w.__academia && ctx.w.__academia.KB.loaded && Object.keys(ctx.w.__academia.KB.courses).length) return; await tick(20); } throw new Error('base não carregou'); }
function pick(ctx, exId, value) { const el = ctx.$(`input[type=radio][data-ex="${exId}"][data-v="${value}"]`); el.checked = true; el.dispatchEvent(new ctx.w.Event('change', { bubbles: true })); }
function click(ctx, sel) { const el = ctx.$(sel); assert.ok(el, 'elemento ausente: ' + sel); el.click(); }
async function answerCorrect(ctx, ex) {
  const w = ctx.w;
  if (ex.type === 'mc') pick(ctx, ex.id, ex.answer);
  else if (ex.type === 'tf') pick(ctx, ex.id, String(ex.answer));
  else if (ex.type === 'bug') click(ctx, `[data-act=bug-pick][data-ex="${ex.id}"][data-n="${ex.answer}"]`);
  else if (ex.type === 'fill') ex.answers.forEach((v, i) => { const el = ctx.$(`input[data-ex="${ex.id}"][data-i="${i}"]`); el.value = v[0]; el.dispatchEvent(new w.Event('input', { bubbles: true })); });
  else if (ex.type === 'trace') ex.steps.forEach((st, i) => { const el = ctx.$(`input[data-ex="${ex.id}"][data-i="${i}"]`); el.value = st.answers[0]; el.dispatchEvent(new w.Event('input', { bubbles: true })); });
  else if (ex.type === 'match') ex.pairs.forEach((p, i) => { const el = ctx.$(`select[data-ex="${ex.id}"][data-i="${i}"]`); el.value = p[1]; el.dispatchEvent(new w.Event('change', { bubbles: true })); });
  else if (ex.type === 'open') { const el = ctx.$(`textarea[data-ex="${ex.id}"]`); el.value = 'Minha resposta.'; el.dispatchEvent(new w.Event('input', { bubbles: true })); }
  await tick(5);
}
const seedItems = (lid) => DOCS.find((d) => d.path === 'kb_exsets/' + lid).data.items;
const assessItems = () => DOCS.find((d) => d.path === 'kb_assess/js-async').data.items;
const lessonIds = ['jsa-01', 'jsa-02', 'jsa-03', 'jsa-04', 'jsa-05', 'jsa-06', 'jsa-07'];

test('IA indisponível: o aluno navega, estuda, faz exercícios, prova e acompanha o progresso', async () => {
  const ctx = boot({ sample: null });
  await ready(ctx);
  const A = ctx.w.__academia;
  // catálogo e curso
  await go(ctx, 'catalogo');
  assert.ok(ctx.$$('#cat-list h2').length >= 17, 'áreas do catálogo');
  await go(ctx, 'c-js-async');
  assert.match(ctx.$('#view').textContent, /Módulos e aulas/);
  assert.equal(ctx.$$('#view a.item').length, 7);
  // aula: conteúdo vem do banco, sem gerar nada
  await go(ctx, 'l-jsa-01');
  const t = ctx.$('#view').textContent;
  ['Objetivos da aula', 'Introdução', 'Explicação teórica', 'Conceitos fundamentais', 'Exemplos de código', 'Explicação linha por linha', 'Boas práticas', 'Erros comuns', 'Aplicações no mercado', 'Resumo', 'Exercícios', 'Referências'].forEach((s) => assert.ok(t.includes(s), 'seção ausente: ' + s));
  assert.match(t, /professor IA está indisponível/);
  // exercícios objetivos com correção automática
  const ex1 = seedItems('jsa-01');
  for (const ex of ex1.filter((x) => ['mc', 'tf', 'bug'].includes(x.type))) { await answerCorrect(ctx, ex); click(ctx, `[data-act=ex-check][data-ex="${ex.id}"]`); await tick(5); assert.equal(A.S.ex[ex.id].correct, true, ex.id); }
  // resposta errada é registrada como errada
  click(ctx, '[data-act=ex-retry][data-ex="jsa-01-e2"]'); pick(ctx, 'jsa-01-e2', 'true'); click(ctx, '[data-act=ex-check][data-ex="jsa-01-e2"]'); await tick(5);
  assert.equal(A.S.ex['jsa-01-e2'].tries, 2); assert.equal(A.S.ex['jsa-01-e2'].last, 0);
  // resposta aberta: modelo + autoavaliação
  const ta = ctx.$('textarea[data-ex="jsa-01-e4"]'); ta.value = 'O host faz a espera; o laço ocupa a pilha.'; ta.dispatchEvent(new ctx.w.Event('input', { bubbles: true }));
  click(ctx, '[data-act=open-reveal][data-ex="jsa-01-e4"]'); await tick(5);
  [0, 1, 2].forEach((i) => { const c = ctx.$(`input[type=checkbox][data-ex="jsa-01-e4"][data-ci="${i}"]`); c.checked = true; c.dispatchEvent(new ctx.w.Event('change', { bubbles: true })); });
  click(ctx, '[data-act=ex-check][data-ex="jsa-01-e4"]'); await tick(5);
  assert.equal(A.S.ex['jsa-01-e4'].best, 75); assert.equal(A.S.ex['jsa-01-e4'].self, true);
  click(ctx, '[data-act=lesson-done]'); await tick(5);
  assert.equal(A.S.courses['js-async'].lessons['jsa-01'].done, true);
  assert.equal(Object.keys(A.S.reviews).length, 3, 'cartões de revisão cadastrados na aula');
  // aula 2: preenchimento, associação e desafio de código com testes no ambiente isolado
  await go(ctx, 'l-jsa-02');
  for (const ex of seedItems('jsa-02').filter((x) => ['fill', 'match'].includes(x.type))) { await answerCorrect(ctx, ex); click(ctx, `[data-act=ex-check][data-ex="${ex.id}"]`); await tick(5); assert.equal(A.S.ex[ex.id].correct, true, ex.id); }
  const code = seedItems('jsa-02').find((x) => x.type === 'code');
  const ed = ctx.$(`textarea[data-ta="${code.id}"]`); assert.ok(ed, 'editor do desafio'); ed.value = code.solution; ed.dispatchEvent(new ctx.w.Event('input', { bubbles: true }));
  click(ctx, `[data-act=code-test][data-ex="${code.id}"]`);
  for (let i = 0; i < 50 && !(A.S.ex[code.id]); i++) await tick(20);
  assert.equal(A.S.ex[code.id].correct, true, 'desafio aprovado pelos testes');
  assert.match(ctx.$('#view').textContent, /✓ ordem final completa/);
  // conclui as demais aulas e faz a avaliação final
  lessonIds.forEach((id) => A.LMS.completeLesson(id));
  await go(ctx, 'prova-js-async');
  assert.ok(ctx.$('#exam-send').disabled, 'envio bloqueado até responder tudo');
  for (const ex of assessItems()) await answerCorrect(ctx, ex);
  assert.equal(ctx.$('#exam-send').disabled, false);
  click(ctx, '#exam-send'); await tick(10);
  const cp = A.S.courses['js-async'];
  assert.equal(cp.passed, true); assert.equal(cp.assess[0].pct, 100);
  // dashboard com dados reais
  await go(ctx, 'inicio');
  const d = ctx.$('#view').textContent;
  assert.match(d, /Cursos concluídos/); assert.match(d, /Event loop/); assert.match(d, /Notas de avaliações/); assert.match(d, /100%/);
  // revisão espaçada
  A.S.reviews['jsa-01_0'].due = '2000-01-01';
  await go(ctx, 'revisao'); click(ctx, '[data-act=rev-show]'); await tick(5); click(ctx, '[data-act=grade][data-g="5"]'); await tick(5);
  assert.ok(A.S.reviews['jsa-01_0'].due > '2026-01-01');
  // persistência no banco (estado privado do aluno)
  await tick(900);
  assert.ok(ctx.db.store.get('data/users/aluno1/state').v.courses['js-async'].passed, 'progresso salvo no banco');
  assert.deepEqual(ctx.errors, []);
  assert.equal(ctx.calls.ai, 0);
});

test('Professor IA presente: nenhuma chamada nas funções principais; só quando o aluno pede', async () => {
  const ctx = boot({ sample: async () => ({ text: 'Segundo a aula [Promises](#l-jsa-04) e [inventada](#l-nao-existe).' }) });
  await ready(ctx);
  const A = ctx.w.__academia;
  for (const id of lessonIds) await go(ctx, 'l-' + id);
  await go(ctx, 'l-jsa-04');
  for (const ex of seedItems('jsa-04').filter((x) => ['mc', 'tf', 'fill', 'bug'].includes(x.type))) { await answerCorrect(ctx, ex); click(ctx, `[data-act=ex-check][data-ex="${ex.id}"]`); await tick(5); }
  await go(ctx, 'prova-js-async'); await go(ctx, 'inicio'); await go(ctx, 'radar'); await go(ctx, 'pesquisa'); await go(ctx, 'relatorios');
  assert.equal(ctx.calls.ai, 0, 'nenhuma chamada de IA em navegação, aulas, exercícios, prova, dashboard, radar e pesquisa');
  await go(ctx, 'l-jsa-04');
  click(ctx, '[data-act=ai-lesson][data-mode="outra"]');
  for (let i = 0; i < 30 && ctx.calls.ai === 0; i++) await tick(10);
  await tick(20);
  assert.equal(ctx.calls.ai, 1);
  const html = ctx.$('#ai-lesson').innerHTML;
  assert.match(html, /href="#l-jsa-04"/, 'link para aula existente mantido');
  assert.doesNotMatch(html, /#l-nao-existe/, 'link para aula inexistente removido');
  // desligar a IA nas configurações
  A.S.profile.aiOff = true; await go(ctx, 'professor');
  assert.match(ctx.$('#view').textContent, /indisponível/);
});

test('Radar: notificações sem duplicar, filtros por relevância e recomendações', async () => {
  const ctx = boot();
  await ready(ctx);
  const A = ctx.w.__academia;
  A.S.radar.watch = ['nodejs', 'nextjs', 'react']; A.S.radar.minRel = 'media';
  assert.equal(A.Radar.notifs().length, 5, 'react 19.3.1 é informativa e fica de fora');
  await go(ctx, 'radar');
  assert.match(ctx.$('#view').textContent, /Alertas importantes/);
  click(ctx, '[data-act=radar-seen]'); await tick(5);
  assert.equal(A.Radar.notifs().length, 0, 'depois de vistas, nada é notificado de novo');
  A.S.radar.minRel = 'critica'; assert.equal(A.Radar.notifs().length, 0);
  // estudar uma novidade leva à aula relacionada
  click(ctx, '[data-act=radar-study][data-id="nodejs-eol-20"]'); await tick(20);
  assert.equal(ctx.w.location.hash, '#l-jsa-07');
  // lacuna de conhecimento: acompanha Flutter sem ter estudado
  A.S.radar.watch = ['flutter'];
  assert.ok(A.Radar.recs().some((r) => r.kind === 'lacuna' && r.h === '#d-flutter'));
});

test('Pesquisa técnica: busca na base, filtros, biblioteca e histórico', async () => {
  const ctx = boot();
  await ready(ctx);
  const A = ctx.w.__academia;
  await go(ctx, 'pesquisa');
  ctx.$('#sq').value = 'microtarefas'; ctx.$('#sform').dispatchEvent(new ctx.w.Event('submit', { bubbles: true, cancelable: true })); await tick(10);
  const v = ctx.$('#view').innerHTML;
  assert.match(v, /href="#l-jsa-02"/); assert.match(v, /developer\.mozilla\.org\/en-US\/search\?q=microtarefas/);
  assert.equal(A.S.searches.length, 1);
  click(ctx, '[data-act=stab][data-t="biblioteca"]'); await tick(5);
  ctx.$('#r-title').value = 'MDN — queueMicrotask()'; ctx.$('#r-url').value = 'notaurl'; click(ctx, '[data-act=ref-save]'); await tick(5);
  assert.equal(A.S.library.length, 0, 'URL inválida é recusada');
  ctx.$('#r-url').value = 'https://developer.mozilla.org/en-US/docs/Web/API/Window/queueMicrotask'; click(ctx, '[data-act=ref-save]'); await tick(5);
  assert.equal(A.S.library.length, 1);
});

test('CMS: rascunho não altera o publicado; publicar versiona; aluno não vê rascunhos', async () => {
  const ctx = boot({ owner: true });
  await ready(ctx);
  const A = ctx.w.__academia;
  await go(ctx, 'cms');
  assert.match(ctx.$('#view').textContent, /Gestão de conteúdo/);
  await go(ctx, 'cms-l-jsa-01');
  ctx.$('#l-title').value = 'Síncrono e assíncrono (revisada)';
  click(ctx, '[data-act=cms-save]'); await tick(30);
  assert.equal(A.KB.lessons['jsa-01'].title, 'Síncrono, assíncrono e o modelo de execução do JavaScript', 'publicado intacto');
  assert.ok(ctx.db.store.get('kb_drafts/lesson~jsa-01'));
  // fluxo editorial: sem aprovação a publicação é recusada
  const r0 = await A.KB.publish('lesson', 'jsa-01');
  assert.equal(r0.ok, false); assert.equal(A.KB.lessons['jsa-01'].version, 1);
  await A.KB.setReview('lesson', 'jsa-01');
  const ap = await A.KB.approve('lesson', 'jsa-01', 6); assert.equal(ap.ok, true);
  const r1 = await A.KB.publish('lesson', 'jsa-01'); assert.equal(r1.ok, true, r1.msg); await tick(40);
  assert.equal(A.KB.lessons['jsa-01'].version, 2);
  assert.ok(A.KB.lessons['jsa-01'].nextReviewAt > A.KB.lessons['jsa-01'].lastReviewedAt.slice(0, 10), 'próxima revisão registrada');
  const audit = [...ctx.db.store.entries()].filter(([k, v]) => k.startsWith('kb_audit/') && v.ref === 'lesson~jsa-01').map(([, v]) => v.action);
  ['save', 'review', 'approve', 'publish'].forEach((x) => assert.ok(audit.includes(x), 'histórico sem ' + x));
  assert.equal(A.KB.lessons['jsa-01'].title, 'Síncrono e assíncrono (revisada)');
  assert.ok(ctx.db.store.get('kb_versions/lesson~jsa-01~v1'), 'versão anterior arquivada');
  assert.ok(!ctx.db.store.get('kb_drafts/lesson~jsa-01'));
  // validação impede salvar exercício inválido
  await go(ctx, 'cms-x-jsa-01');
  ctx.$('#x-json').value = JSON.stringify([{ id: 'x1', type: 'mc', prompt: 'p', options: ['a'], answer: 3, explanation: 'e' }]);
  click(ctx, '[data-act=cms-save]'); await tick(10);
  assert.match(ctx.$('#cms-err').textContent, /options com 2\+ itens/);
  // importação em lote valida antes de gravar
  await go(ctx, 'cms-io');
  ctx.$('#io-json').value = JSON.stringify({ courses: [{ id: 'x', title: '', modules: [] }] }); click(ctx, '[data-act=kb-import]'); await tick(10);
  assert.match(ctx.$('#io-out').textContent, /problema/);
  // aluno (não administrador) não vê o rascunho de um item novo
  const ctx2 = boot({ docs: [...DOCS, { path: 'kb_lessons/rasc', data: { id: 'rasc', courseId: 'js-async', title: 'Rascunho', status: 'draft' } }] });
  await ready(ctx2);
  assert.equal(ctx2.w.__academia.KB.lesson('rasc'), null);
});

test('Migração da v1: perfil, minutos, revisões, projetos e histórico preservados', async () => {
  const ctx = boot();
  await ready(ctx);
  const A = ctx.w.__academia;
  const v1 = { v: 1, profile: { name: 'Ana', goal: 'Full Stack', weekly: 10 }, disc: { js: { start: 'M', mods: {} } }, attempts: [{ t: 'aval', label: 'Promises', s: 80, at: '2026-11-10T10:00:00Z' }], reviews: { c1: { id: 'c1', q: 'O que é?', a: 'Isso.', ef: 2.5, iv: 1, reps: 1, due: '2026-11-20' } }, projects: { tasks: { status: 'doing', checks: [true], notes: 'repo' } }, minutes: { '2026-11-10': 40 }, log: [{ t: 'x', txt: 'algo', at: '2026-11-10T10:00:00Z' }], chats: [], track: 'fs-ts' };
  await go(ctx, 'ajustes');
  ctx.$('#imp').value = JSON.stringify(v1); click(ctx, '[data-act=import-me]'); await tick(5); click(ctx, '[data-act=modal-yes]'); await tick(10);
  assert.equal(A.S.profile.name, 'Ana'); assert.equal(A.S.minutes['2026-11-10'], 40); assert.ok(A.S.reviews.v1_c1); assert.equal(A.S.projects.tasks.status, 'doing'); assert.equal(A.S.legacy.attempts.length, 1); assert.equal(A.S.track, 'fs-ts');
  await go(ctx, 'historico'); assert.match(ctx.$('#view').textContent, /Histórico importado da v1/);
});

test('todas as telas renderizam sem erro', async () => {
  const ctx = boot({ owner: true });
  await ready(ctx);
  const routes = ['inicio', 'catalogo', 'trilhas', 'lab', 'lab-jsa-03-e4', 'lab-agregador-cotacoes', 'revisao', 'projetos', 'p-agregador-cotacoes', 'p-tasks', 'pesquisa', 'radar', 'professor', 'relatorios', 'historico', 'pg-comparar-mobile', 'pg-arquitetura', 'ajustes', 'd-js', 'd-flutter', 'c-js-async', 'prova-js-async', 'cms', 'cms-c-js-async', 'cms-c-new', 'cms-l-new', 'cms-x-jsa-02', 'cms-a-js-async', 'cms-p-tasks', 'cms-pg-arquitetura', 'cms-cat', 'cms-io', 'cms-cov', 'cms-qa', 'c-logica-algoritmos', 'l-log-07', 'prova-logica-algoritmos', 'p-planejador-entregas', 'lab-planejador-entregas', 'cms-c-logica-algoritmos', 'cms-x-log-08', 'd-logic', 'c-git-github', 'l-git-05', 'prova-git-github', 'p-gerador-release', 'lab-gerador-release', 'cms-c-git-github', 'd-git', 'c-html-css-a11y', 'l-htm-07', 'prova-html-css-a11y', 'p-auditor-acessibilidade', 'lab-auditor-acessibilidade', 'd-html', 'd-css', 'd-a11y', 'c-javascript-fundamentos', 'l-js-05', 'prova-javascript-fundamentos', 'p-mini-store', 'lab-mini-store', 'd-js', 'c-typescript-fundamentos', 'l-ts-05', 'prova-typescript-fundamentos', 'p-validador-tipado', 'lab-validador-tipado', 'd-ts'];
  for (const r of routes) { await go(ctx, r); const v = ctx.$('#view').innerHTML; assert.ok(v.length > 80, r + ' vazio: ' + v.slice(0, 200)); assert.doesNotMatch(v, /Erro ao exibir/, r + ': ' + v.slice(0, 300)); }
  assert.deepEqual(ctx.errors, []);
});

test('primeira visita do administrador com banco vazio instala o pacote inicial', async () => {
  const ctx = boot({ owner: true, docs: [], seedFile: DOCS });
  await ready(ctx);
  assert.equal(ctx.db.store.size >= DOCS.length, true);
  assert.equal(ctx.w.__academia.KB.lessons['jsa-07'].title.startsWith('Padrões de produção'), true);
  const ctx2 = boot({ owner: false, docs: [] });
  for (let i = 0; i < 20; i++) { await tick(20); }
  assert.equal(ctx2.db.store.size, 0, 'aluno não grava conteúdo na base');
  assert.match(ctx2.$('#view').textContent, /vazia/);
});

/* ---------------------------- Onda 1 ---------------------------- */
const W1 = { id: 'logica-algoritmos', lessons: ['log-01', 'log-02', 'log-03', 'log-04', 'log-05', 'log-06', 'log-07', 'log-08', 'log-09'] };
const docOf = (p) => DOCS.find((d) => d.path === p).data;

test('Onda 1 / Lógica: curso completo navegável, exercícios corrigidos, prova aprovada, material de apoio, sem IA', async () => {
  const ctx = boot({ sample: null });
  await ready(ctx);
  const A = ctx.w.__academia;
  await go(ctx, 'd-logic'); assert.match(ctx.$('#view').textContent, /Lógica de programação, algoritmos/);
  await go(ctx, 'd-bigo'); assert.match(ctx.$('#view').textContent, /Lógica de programação, algoritmos/, 'curso também aparece em Big O');
  await go(ctx, 'c-' + W1.id);
  const ct = ctx.$('#view').textContent;
  assert.equal(ctx.$$('#view a.item').length, 9);
  ['Material de apoio', 'Glossário', 'Cheatsheet', 'Erros comuns', 'Mapa de pré-requisitos', 'Referências oficiais', 'Sugestões de prática', 'Avaliação final', 'Planejador de entregas'].forEach((s) => assert.ok(ct.includes(s), 'curso sem: ' + s));
  let objective = 0;
  for (const lid of W1.lessons) {
    await go(ctx, 'l-' + lid);
    const t = ctx.$('#view').textContent;
    ['Objetivos da aula', 'Introdução', 'Explicação teórica', 'Conceitos fundamentais', 'Exemplos práticos', 'Exemplos de código', 'Boas práticas', 'Erros comuns', 'Aplicações no mercado', 'Resumo', 'Exercícios', 'Referências', 'Versões consideradas'].forEach((s) => assert.ok(t.includes(s), lid + ' sem seção: ' + s));
    for (const ex of seedItems(lid).filter((x) => ['mc', 'tf', 'bug', 'fill', 'match', 'trace'].includes(x.type))) {
      await answerCorrect(ctx, ex); click(ctx, `[data-act=ex-check][data-ex="${ex.id}"]`); await tick(5);
      assert.equal(A.S.ex[ex.id].correct, true, ex.id); objective++;
      assert.match(ctx.$('#exw-' + ex.id).textContent, /Critério de correção/);
    }
  }
  assert.ok(objective >= 24, 'exercícios objetivos: ' + objective);
  // desafio de código pela interface (Worker isolado)
  await go(ctx, 'l-log-09');
  const code = seedItems('log-09').find((x) => x.id === 'log-09-e4');
  const ta = ctx.$('#ed-log-09-e4 textarea') || ctx.$('[data-code-for="log-09-e4"] textarea');
  if (ta) { ta.value = code.solution; ta.dispatchEvent(new ctx.w.Event('input', { bubbles: true })); }
  // prova final
  await go(ctx, 'prova-' + W1.id);
  for (const ex of docOf('kb_assess/' + W1.id).items) await answerCorrect(ctx, ex);
  click(ctx, '[data-act=exam-submit]'); await tick(20);
  assert.equal(A.S.courses[W1.id].passed, true);
  assert.equal(ctx.calls.ai, 0);
  assert.deepEqual(ctx.errors, []);
  // resumo anônimo das primeiras tentativas foi gravado para a análise de itens
  await tick(1700);
  const st = ctx.db.store.get('kb_stats/aluno1');
  assert.ok(st && st.items['log-01-e1'] && st.items['log-01-e1'].f === 100 && st.items['log-av-01'], 'kb_stats gravado');
});

const G = { id: 'git-github', lessons: ['git-01', 'git-02', 'git-03', 'git-04', 'git-05', 'git-06', 'git-07'] };
test('Onda 1 / Git e GitHub: curso completo navegável, exercícios corrigidos, prova aprovada, sem IA', async () => {
  const ctx = boot({ sample: null });
  await ready(ctx);
  const A = ctx.w.__academia;
  await go(ctx, 'd-git'); assert.match(ctx.$('#view').textContent, /Git e GitHub na prática/);
  await go(ctx, 'c-' + G.id);
  const ct = ctx.$('#view').textContent;
  assert.equal(ctx.$$('#view a.item').length, 7);
  ['Material de apoio', 'Glossário', 'Cheatsheet', 'Erros comuns', 'Mapa de pré-requisitos', 'Referências oficiais', 'Sugestões de prática', 'Avaliação final', 'Gerador de release'].forEach((s) => assert.ok(ct.includes(s), 'curso sem: ' + s));
  let objective = 0;
  for (const lid of G.lessons) {
    await go(ctx, 'l-' + lid);
    const t = ctx.$('#view').textContent;
    ['Objetivos da aula', 'Introdução', 'Explicação teórica', 'Conceitos fundamentais', 'Exemplos práticos', 'Exemplos de código', 'Boas práticas', 'Erros comuns', 'Aplicações no mercado', 'Resumo', 'Exercícios', 'Referências'].forEach((s) => assert.ok(t.includes(s), lid + ' sem seção: ' + s));
    for (const ex of seedItems(lid).filter((x) => ['mc', 'tf', 'bug', 'fill', 'match', 'trace'].includes(x.type))) {
      await answerCorrect(ctx, ex); click(ctx, `[data-act=ex-check][data-ex="${ex.id}"]`); await tick(5);
      assert.equal(A.S.ex[ex.id].correct, true, ex.id); objective++;
    }
  }
  assert.ok(objective >= 22, 'exercícios objetivos: ' + objective);
  await go(ctx, 'prova-' + G.id);
  for (const ex of docOf('kb_assess/' + G.id).items) await answerCorrect(ctx, ex);
  click(ctx, '[data-act=exam-submit]'); await tick(20);
  assert.equal(A.S.courses[G.id].passed, true);
  assert.equal(ctx.calls.ai, 0);
  assert.deepEqual(ctx.errors, []);
});

const H = { id: 'html-css-a11y', lessons: ['htm-01', 'htm-02', 'htm-03', 'htm-04', 'htm-05', 'htm-06', 'htm-07'] };
test('Onda 1 / HTML, CSS e acessibilidade: curso completo navegável, exercícios corrigidos, prova aprovada, sem IA', async () => {
  const ctx = boot({ sample: null });
  await ready(ctx);
  const A = ctx.w.__academia;
  for (const d of ['d-html', 'd-css', 'd-a11y']) { await go(ctx, d); assert.match(ctx.$('#view').textContent, /HTML, CSS e acessibilidade/, d); }
  await go(ctx, 'c-' + H.id);
  const ct = ctx.$('#view').textContent;
  assert.equal(ctx.$$('#view a.item').length, 7);
  ['Material de apoio', 'Glossário', 'Cheatsheet', 'Erros comuns', 'Mapa de pré-requisitos', 'Referências oficiais', 'Sugestões de prática', 'Avaliação final', 'Auditor de acessibilidade'].forEach((s) => assert.ok(ct.includes(s), 'curso sem: ' + s));
  let objective = 0;
  for (const lid of H.lessons) {
    await go(ctx, 'l-' + lid);
    const t = ctx.$('#view').textContent;
    ['Objetivos da aula', 'Introdução', 'Explicação teórica', 'Conceitos fundamentais', 'Exemplos práticos', 'Exemplos de código', 'Boas práticas', 'Erros comuns', 'Aplicações no mercado', 'Resumo', 'Exercícios', 'Referências'].forEach((s) => assert.ok(t.includes(s), lid + ' sem seção: ' + s));
    for (const ex of seedItems(lid).filter((x) => ['mc', 'tf', 'bug', 'fill', 'match', 'trace'].includes(x.type))) {
      await answerCorrect(ctx, ex); click(ctx, `[data-act=ex-check][data-ex="${ex.id}"]`); await tick(5);
      assert.equal(A.S.ex[ex.id].correct, true, ex.id); objective++;
    }
  }
  assert.ok(objective >= 20, 'exercícios objetivos: ' + objective);
  await go(ctx, 'prova-' + H.id);
  for (const ex of docOf('kb_assess/' + H.id).items) await answerCorrect(ctx, ex);
  click(ctx, '[data-act=exam-submit]'); await tick(20);
  assert.equal(A.S.courses[H.id].passed, true);
  assert.equal(ctx.calls.ai, 0);
  assert.deepEqual(ctx.errors, []);
});

const J = { id: 'javascript-fundamentos', lessons: ['js-01', 'js-02', 'js-03', 'js-04', 'js-05', 'js-06', 'js-07'] };
test('Onda 1 / JavaScript: curso completo navegável, exercícios corrigidos, prova aprovada, sem IA', async () => {
  const ctx = boot({ sample: null });
  await ready(ctx);
  const A = ctx.w.__academia;
  await go(ctx, 'd-js'); assert.match(ctx.$('#view').textContent, /JavaScript: fundamentos, DOM e módulos/);
  await go(ctx, 'c-' + J.id);
  const ct = ctx.$('#view').textContent;
  assert.equal(ctx.$$('#view a.item').length, 7);
  ['Material de apoio', 'Glossário', 'Cheatsheet', 'Erros comuns', 'Mapa de pré-requisitos', 'Referências oficiais', 'Sugestões de prática', 'Avaliação final', 'Mini-store'].forEach((s) => assert.ok(ct.includes(s), 'curso sem: ' + s));
  let objective = 0;
  for (const lid of J.lessons) {
    await go(ctx, 'l-' + lid);
    const t = ctx.$('#view').textContent;
    ['Objetivos da aula', 'Introdução', 'Explicação teórica', 'Conceitos fundamentais', 'Exemplos práticos', 'Exemplos de código', 'Boas práticas', 'Erros comuns', 'Aplicações no mercado', 'Resumo', 'Exercícios', 'Referências'].forEach((s) => assert.ok(t.includes(s), lid + ' sem seção: ' + s));
    assert.ok(!t.includes('DOLAR{'), lid + ' com marcador não convertido');
    for (const ex of seedItems(lid).filter((x) => ['mc', 'tf', 'bug', 'fill', 'match', 'trace'].includes(x.type))) {
      await answerCorrect(ctx, ex); click(ctx, `[data-act=ex-check][data-ex="${ex.id}"]`); await tick(5);
      assert.equal(A.S.ex[ex.id].correct, true, ex.id); objective++;
    }
  }
  assert.ok(objective >= 25, 'exercícios objetivos: ' + objective);
  await go(ctx, 'prova-' + J.id);
  for (const ex of docOf('kb_assess/' + J.id).items) await answerCorrect(ctx, ex);
  click(ctx, '[data-act=exam-submit]'); await tick(20);
  assert.equal(A.S.courses[J.id].passed, true);
  assert.equal(ctx.calls.ai, 0);
  assert.deepEqual(ctx.errors, []);
});

const T = { id: 'typescript-fundamentos', lessons: ['ts-01', 'ts-02', 'ts-03', 'ts-04', 'ts-05', 'ts-06', 'ts-07'] };
test('Onda 1 / TypeScript: curso completo navegável, exercícios corrigidos, prova aprovada, sem IA', async () => {
  const ctx = boot({ sample: null });
  await ready(ctx);
  const A = ctx.w.__academia;
  await go(ctx, 'd-ts'); assert.match(ctx.$('#view').textContent, /TypeScript: fundamentos e recursos avançados/);
  await go(ctx, 'c-' + T.id);
  const ct = ctx.$('#view').textContent;
  assert.equal(ctx.$$('#view a.item').length, 7);
  ['Material de apoio', 'Glossário', 'Cheatsheet', 'Erros comuns', 'Mapa de pré-requisitos', 'Referências oficiais', 'Sugestões de prática', 'Avaliação final', 'Validador de dados com tipos inferidos'].forEach((s) => assert.ok(ct.includes(s), 'curso sem: ' + s));
  let objective = 0;
  for (const lid of T.lessons) {
    await go(ctx, 'l-' + lid);
    const t = ctx.$('#view').textContent;
    ['Objetivos da aula', 'Introdução', 'Explicação teórica', 'Conceitos fundamentais', 'Exemplos práticos', 'Exemplos de código', 'Boas práticas', 'Erros comuns', 'Aplicações no mercado', 'Resumo', 'Exercícios', 'Referências'].forEach((s) => assert.ok(t.includes(s), lid + ' sem seção: ' + s));
    assert.ok(!t.includes('DOLAR{') && !t.includes('§'), lid + ' com marcador não convertido');
    for (const ex of seedItems(lid).filter((x) => ['mc', 'tf', 'bug', 'fill', 'match', 'trace'].includes(x.type))) {
      await answerCorrect(ctx, ex); click(ctx, `[data-act=ex-check][data-ex="${ex.id}"]`); await tick(5);
      assert.equal(A.S.ex[ex.id].correct, true, ex.id); objective++;
    }
  }
  assert.ok(objective >= 25, 'exercícios objetivos: ' + objective);
  await go(ctx, 'prova-' + T.id);
  for (const ex of docOf('kb_assess/' + T.id).items) await answerCorrect(ctx, ex);
  click(ctx, '[data-act=exam-submit]'); await tick(20);
  assert.equal(A.S.courses[T.id].passed, true);
  assert.equal(ctx.calls.ai, 0);
  assert.deepEqual(ctx.errors, []);
});

test('Onda 1 / pacote incremental: base existente recebe o curso novo sem sobrescrever o que foi editado', async () => {
  const isW1 = (p) => /log-|logica-algoritmos|planejador-entregas|git-|gerador-release|htm-|html-css-a11y|auditor-acessibilidade|js-0|js-av|javascript-fundamentos|mini-store|ts-0|ts-av|typescript-fundamentos|validador-tipado/.test(p);
  const strip = (d) => { const x = JSON.parse(JSON.stringify(d)); delete x.seedRev; delete x.seedStamp; return x; };
  const old = DOCS.filter((d) => !isW1(d.path)).map((d) => ({ path: d.path, data: strip(d.data) }));
  const cat = old.find((d) => d.path === 'kb_meta/catalog').data;
  cat.areas.forEach((a) => a.disciplines.forEach((d) => { d.courses = d.courses.filter((c) => c !== W1.id && c !== 'git-github' && c !== 'html-css-a11y' && c !== 'javascript-fundamentos' && c !== 'typescript-fundamentos'); if (d.id === 'logic') d.name = 'Lógica (nome editado)'; }));
  old.find((d) => d.path === 'kb_lessons/jsa-01').data.title = 'Título editado pelo administrador';
  const ctx = boot({ owner: true, docs: old, seedFile: DOCS });
  for (let i = 0; i < 150 && !ctx.db.store.get('kb_meta/seedinfo'); i++) await tick(20);
  await ready(ctx);
  const A = ctx.w.__academia;
  assert.ok(A.KB.courses[W1.id], 'curso novo instalado'); assert.ok(A.KB.courses['git-github'], 'curso Git instalado'); assert.ok(A.KB.courses['html-css-a11y'], 'curso HTML/CSS instalado'); assert.ok(A.KB.courses['javascript-fundamentos'], 'curso JS instalado'); assert.ok(A.KB.courses['typescript-fundamentos'], 'curso TypeScript instalado');
  W1.lessons.forEach((id) => assert.ok(ctx.db.store.get('kb_lessons/' + id), 'aula ' + id));
  assert.equal(ctx.db.store.get('kb_lessons/jsa-01').title, 'Título editado pelo administrador', 'edição preservada');
  const c2 = ctx.db.store.get('kb_meta/catalog');
  const logic = c2.areas.flatMap((a) => a.disciplines).find((d) => d.id === 'logic');
  assert.equal(logic.name, 'Lógica (nome editado)'); assert.ok(logic.courses.includes(W1.id));
  assert.equal(ctx.db.store.get('kb_meta/seedinfo').rev, 3);
  // segunda visita: nada a gravar
  const ctx2 = boot({ owner: true, docs: [...ctx.db.store.entries()].map(([path, data]) => ({ path, data })), seedFile: DOCS });
  await ready(ctx2); await tick(100);
  assert.equal(ctx2.db.writes.filter((p) => p.startsWith('kb_courses/') || p.startsWith('kb_lessons/')).length, 0);
});

test('Onda 1 / qualidade: cobertura, análise de itens, fila de revisão e checklist bloqueando publicação', async () => {
  const stats = [...Array(6)].map((_, i) => ({ path: 'kb_stats/u' + i, data: { items: { 'log-04-e1': { f: 0, c: 0, t: 1 }, 'log-01-e2': { f: 100, c: [], t: 1 } } } }));
  const ctx = boot({ owner: true, docs: [...DOCS, ...stats] });
  await ready(ctx);
  const A = ctx.w.__academia;
  await go(ctx, 'cms-cov');
  const cov = ctx.$('#view').textContent;
  ['Relatório de cobertura', 'Disciplinas sem cursos', 'Cursos sem prova', 'Aulas sem exercícios', 'Exercícios sem gabarito'].forEach((s) => assert.ok(cov.includes(s), s));
  await go(ctx, 'cms-qa');
  const qa = ctx.$('#view').textContent;
  assert.match(qa, /Taxa de acerto muito baixa/); assert.match(qa, /Possível ambiguidade: 100% escolheram a opção A/); assert.match(qa, /muito alta/);
  click(ctx, '[data-act=qa-flag]'); await tick(30);
  const revs = Object.values(A.KB.reviews).filter((r) => r.kind === 'qualidade-questao');
  assert.equal(revs.length, 2);
  click(ctx, '[data-act=qa-flag]'); await tick(30);
  assert.equal(Object.values(A.KB.reviews).filter((r) => r.kind === 'qualidade-questao').length, 2, 'não duplica');
  assert.equal(JSON.stringify(A.KB.exsets['log-04'].items), JSON.stringify(docOf('kb_exsets/log-04').items), 'nada alterado automaticamente');
  // aula nova sem exercícios nem referências: aprovada, mas o checklist bloqueia a publicação
  await A.KB.save('lesson', 'nova', { id: 'nova', courseId: W1.id, title: 'Nova', objectives: ['x'], intro: 'i', theory: 't', summary: 's' });
  await A.KB.setReview('lesson', 'nova'); await A.KB.approve('lesson', 'nova', 6);
  const r = await A.KB.publish('lesson', 'nova');
  assert.equal(r.ok, false); assert.match(r.msg, /Checklist/);
  await go(ctx, 'cms-l-nova'); assert.match(ctx.$('#view').textContent, /Checklist de publicação/);
  assert.ok(ctx.$('[data-act=cms-publish][disabled]'), 'botão Publicar desabilitado');
  assert.deepEqual(ctx.errors, []);
});

test('Upgrade rev 2 → 3: banco real só com o curso 1 (e o piloto) recebe os cursos 2 a 5, sem perder dados, e é idempotente', async () => {
  const NEW = /^kb_\w+\/(git-|gerador-release|htm-|html-css-a11y|auditor-acessibilidade|js-0|js-av|javascript-fundamentos|mini-store|ts-0|ts-av|typescript-fundamentos|validador-tipado)/;
  const NEW_COURSES = ['git-github', 'html-css-a11y', 'javascript-fundamentos', 'typescript-fundamentos'];
  // estado do banco real antes da correção: tudo carimbado como rev 2, marcador seedinfo.rev = 2, sem os cursos 2-5
  const old = DOCS.filter((d) => !NEW.test(d.path) && d.path !== 'kb_meta/seedinfo').map((d) => { const x = JSON.parse(JSON.stringify(d.data)); x.seedRev = 2; x.seedStamp = x.updatedAt; return { path: d.path, data: x }; });
  const cat = old.find((d) => d.path === 'kb_meta/catalog').data; cat.seedRev = 2;
  cat.areas.forEach((a) => a.disciplines.forEach((d) => { d.courses = d.courses.filter((c) => !NEW_COURSES.includes(c)); if (d.id === 'logic') d.name = 'Lógica (nome editado)'; }));
  const oldPilot = old.find((d) => d.path === 'kb_courses/js-async').data; delete oldPilot.supplement;
  old.find((d) => d.path === 'kb_lessons/jsa-01').data.updatedAt = '2026-11-18T10:00:00.000Z'; // editada pelo admin (updatedAt != seedStamp)
  old.find((d) => d.path === 'kb_lessons/jsa-01').data.title = 'Título editado pelo administrador';
  old.push({ path: 'kb_meta/seedinfo', data: { rev: 2, at: '2026-11-17T22:00:00.000Z', written: old.length } });
  // dados de alunos e de uso que nunca podem mudar
  const user = [
    { path: 'data/users/aluno1/state', data: { v: { v: 2, courses: { 'logica-algoritmos': { passed: true, score: 88 } }, ex: { 'log-01-e1': { correct: true } } } } },
    { path: 'kb_stats/u1', data: { items: { 'log-04-e1': { f: 0, c: 0, t: 1 } } } }
  ];
  assert.equal(old.some((d) => NEW.test(d.path)), false, 'banco de partida não tem cursos 2-5');
  assert.equal(old.some((d) => d.path === 'kb_courses/logica-algoritmos'), true);
  const before = new Map([...old, ...user].map((d) => [d.path, JSON.stringify(d.data)]));
  const ctx = boot({ owner: true, docs: [...old, ...user], seedFile: DOCS });
  for (let i = 0; i < 200 && ctx.db.store.get('kb_meta/seedinfo').rev !== 3; i++) await tick(20);
  await ready(ctx);
  assert.equal(ctx.db.store.get('kb_meta/seedinfo').rev, 3, 'marcador subiu para 3');
  // cursos 2-5 e tudo o que pertence a eles estão no banco, relidos do store
  const seedNew = DOCS.filter((d) => NEW.test(d.path));
  assert.ok(seedNew.length > 50, 'pacote novo tem conteúdo: ' + seedNew.length);
  seedNew.forEach((d) => assert.ok(ctx.db.store.has(d.path), 'instalado: ' + d.path));
  NEW_COURSES.forEach((id) => { const c = ctx.db.store.get('kb_courses/' + id); assert.ok(c, id); c.modules.flatMap((m) => m.lessons).forEach((lid) => { assert.ok(ctx.db.store.get('kb_lessons/' + lid), lid); assert.ok(ctx.db.store.get('kb_exsets/' + lid).items.length, 'exercícios ' + lid); }); assert.ok(ctx.db.store.get('kb_assess/' + id), 'prova ' + id); (c.projectIds || []).forEach((p) => assert.ok(ctx.db.store.get('kb_projects/' + p), 'projeto ' + p)); });
  // catálogo: vínculos novos, edição do admin preservada
  const c2 = ctx.db.store.get('kb_meta/catalog');
  const allCourses = c2.areas.flatMap((a) => a.disciplines.flatMap((d) => d.courses));
  NEW_COURSES.forEach((id) => assert.ok(allCourses.includes(id), 'vinculado: ' + id));
  c2.areas.forEach((a) => a.disciplines.forEach((d) => assert.equal(d.courses.length, new Set(d.courses).size, 'sem vínculo repetido em ' + d.id)));
  assert.equal(c2.areas.flatMap((a) => a.disciplines).length, DOCS.find((d) => d.path === 'kb_meta/catalog').data.areas.flatMap((a) => a.disciplines).length, 'mesmo nº de disciplinas');
  assert.equal(c2.areas.flatMap((a) => a.disciplines).find((d) => d.id === 'logic').name, 'Lógica (nome editado)');
  assert.equal(c2.seedRev, 3);
  // preservação: edição do admin e dados de alunos idênticos byte a byte; nada apagado
  assert.equal(ctx.db.store.get('kb_lessons/jsa-01').title, 'Título editado pelo administrador');
  user.forEach((d) => assert.equal(JSON.stringify(ctx.db.store.get(d.path)), before.get(d.path), 'intocado: ' + d.path));
  for (const [p] of before) if (p !== 'kb_meta/seedinfo') assert.ok(ctx.db.store.has(p), 'não apagado: ' + p);
  assert.ok(!ctx.db.writes.some((p) => p.startsWith('data/users/') || p.startsWith('kb_stats/')), 'nenhuma escrita em dados de usuários');
  // o piloto (não editado, rev 2) recebeu o suplemento novo
  assert.ok(ctx.db.store.get('kb_courses/js-async').supplement, 'suplemento do piloto instalado');
  // idempotência: segunda visita sobre o banco já atualizado não grava nada nem duplica
  const snapshot = [...ctx.db.store.entries()].map(([path, data]) => ({ path, data }));
  const ctx2 = boot({ owner: true, docs: snapshot, seedFile: DOCS });
  await ready(ctx2); await tick(150);
  assert.deepEqual(ctx2.db.writes, [], 'segunda execução não grava nada');
  assert.equal(ctx2.db.store.size, ctx.db.store.size);
  assert.deepEqual(ctx2.errors, []); assert.deepEqual(ctx.errors, []);
  // forçando nova instalação manual (botão do CMS): ainda sem duplicar nem sobrescrever
  const n = ctx2.db.store.size;
  await ctx2.w.__academia.ACT['kb-install'](); await tick(100);
  assert.equal(ctx2.db.store.size, n); assert.equal(ctx2.db.store.get('kb_lessons/jsa-01').title, 'Título editado pelo administrador');
});

// ---------- Importação e instalação da base (formatos A e B; modo local e conectado) ----------
const importJSON = async (ctx, v) => { ctx.$('#io-json').value = typeof v === 'string' ? v : JSON.stringify(v); click(ctx, '[data-act=kb-import]'); await tick(150); return ctx.$('#io-out').textContent; };
const bootLocal = async (extra = {}) => { const ctx = boot({ local: true, seedFile: DOCS, ...extra }); for (let i = 0; i < 50 && !(ctx.w.__academia && ctx.w.__academia.KB.loaded); i++) await tick(20); return ctx; };
const openIO = async (ctx) => { await go(ctx, '#cms-io'); if (!ctx.$('#io-json')) await go(ctx, '#cms'); };
const lsKB = (ctx) => JSON.parse(ctx.w.localStorage.getItem('afs2:kb') || 'null');

test('importador: JSON inválido, vazio, sem path/data e caminho desconhecido são rejeitados', async () => {
  const ctx = await bootLocal(); await openIO(ctx); assert.ok(ctx.$('#io-json'), 'tela do importador');
  assert.match(await importJSON(ctx, '{nao e json'), /JSON inválido/);
  assert.match(await importJSON(ctx, []), /pacote vazio/);
  assert.match(await importJSON(ctx, [{ data: {} }]), /"path" ausente/);
  assert.match(await importJSON(ctx, [{ path: 'kb_courses/x' }]), /"data" ausente/);
  assert.match(await importJSON(ctx, [{ path: 'kb_coisa/x', data: {} }]), /coleção desconhecida/);
  assert.match(await importJSON(ctx, [{ path: 'kb_meta/outro', data: {} }]), /metadados desconhecido/);
  assert.match(await importJSON(ctx, {}), /Nenhum item foi importado/);
  assert.equal(Object.keys(ctx.w.__academia.KB.courses).length, 0, 'nada gravado');
});

test('importador: pacote {path,data} entra como rascunho, é reconhecido pela UI e reimportar não duplica', async () => {
  const ctx = await bootLocal(); await openIO(ctx);
  const out = await importJSON(ctx, DOCS);
  assert.match(out, /item\(ns\) importado\(s\) como rascunho/);
  const KB = ctx.w.__academia.KB;
  assert.equal(Object.keys(KB.courses).length, DOCS.filter((d) => d.path.startsWith('kb_courses/')).length);
  assert.equal(Object.keys(KB.lessons).length, DOCS.filter((d) => d.path.startsWith('kb_lessons/')).length);
  assert.ok(KB.exsets['jsa-01'].items.length, 'exercícios preservados');
  assert.ok(KB.catalog().areas.length, 'catálogo aplicado');
  assert.ok(Object.keys(lsKB(ctx).courses).length, 'persistido no localStorage');
  const n = Object.keys(KB.lessons).length;
  const again = await importJSON(ctx, DOCS);
  assert.match(again, /ignorado\(s\) por já existirem/);
  assert.equal(Object.keys(KB.lessons).length, n);
});

test('importador: pacote tradicional continua funcionando', async () => {
  const ctx = await bootLocal(); await openIO(ctx);
  const c = DOCS.find((d) => d.path === 'kb_courses/' + DOCS.find((x) => x.path.startsWith('kb_courses/')).path.split('/')[1]).data;
  const out = await importJSON(ctx, { courses: [c] });
  assert.match(out, /1 item\(ns\) importado/);
  assert.ok(ctx.w.__academia.KB.courses[c.id]);
});

test('instalação local: instala sem banco, persiste, não duplica e preserva conteúdo editado', async () => {
  const ctx = await bootLocal(); const A = ctx.w.__academia;
  await A.ACT['kb-install'](); await tick(100);
  assert.equal(Object.keys(A.KB.courses).length, DOCS.filter((d) => d.path.startsWith('kb_courses/')).length);
  assert.equal(A.KB.meta.seedinfo.rev, 3);
  assert.ok(lsKB(ctx).lessons['jsa-01'], 'no localStorage');
  assert.ok(ctx.$('#view').textContent.length > 0);
  // edição do usuário + reinstalação
  A.KB.lessons['jsa-01'].title = 'MEU TÍTULO'; A.KB.lessons['jsa-01'].updatedAt = '2030-01-01T00:00:00.000Z';
  const cnt = Object.keys(A.KB.lessons).length;
  await A.ACT['kb-install'](); await tick(100);
  assert.equal(A.KB.lessons['jsa-01'].title, 'MEU TÍTULO');
  assert.equal(Object.keys(A.KB.lessons).length, cnt);
  assert.equal(Object.keys(A.KB.exsets).length, DOCS.filter((d) => d.path.startsWith('kb_exsets/')).length);
});

test('instalação local preserva curso do usuário e rejeita pacote malformado', async () => {
  const ctx = await bootLocal(); const A = ctx.w.__academia;
  A.KB.courses['meu-curso'] = { id: 'meu-curso', title: 'Meu', status: 'draft' };
  await A.ACT['kb-install'](); await tick(100);
  assert.equal(A.KB.courses['meu-curso'].title, 'Meu');
  const bad = await bootLocal({ seedFile: [{ path: 'kb_x/y', data: {} }] });
  await bad.w.__academia.ACT['kb-install'](); await tick(100);
  assert.equal(Object.keys(bad.w.__academia.KB.courses).length, 0);
});

test('instalação conectada continua gravando no banco e reinstalar não regrava', async () => {
  const ctx = boot({ owner: true, docs: [], seedFile: DOCS });
  for (let i = 0; i < 150 && !ctx.db.store.get('kb_meta/seedinfo'); i++) await tick(20);
  assert.equal(ctx.db.store.get('kb_meta/seedinfo').rev, 3);
  const w0 = ctx.db.writes.length;
  await ctx.w.__academia.ACT['kb-install'](); await tick(100);
  assert.ok(ctx.db.store.has('kb_courses/' + DOCS.find((d) => d.path.startsWith('kb_courses/')).path.split('/')[1]));
  assert.equal(ctx.db.writes.filter((p) => p.startsWith('kb_lessons/')).length, DOCS.filter((d) => d.path.startsWith('kb_lessons/')).length, 'sem regravação de aulas');
  assert.ok(ctx.db.writes.length >= w0);
});
