/* Engine: regras puras da plataforma (sem DOM, sem rede, sem IA).
   Usado pela página e pelos testes automatizados (node). */
const Engine = (() => {
  const TYPES = ['mc', 'tf', 'open', 'match', 'fill', 'bug', 'trace', 'code', 'practice'];
  const TYPE_NAMES = { mc: 'Múltipla escolha', tf: 'Verdadeiro ou falso', open: 'Resposta aberta', match: 'Associação', fill: 'Preenchimento de código', bug: 'Identificação de erro', trace: 'Rastreamento de execução', code: 'Desafio de programação', practice: 'Exercício prático' };
  const LEVELS = ['I', 'M', 'A', 'E'];
  const STATUSES = ['draft', 'review', 'approved', 'published'];
  const norm = (s) => String(s ?? '').trim().replace(/\s+/g, ' ');
  const fold = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const isUrl = (u) => { try { const x = new URL(u); return x.protocol === 'https:' || x.protocol === 'http:'; } catch (e) { return false; } };

  /* ---------- Correção determinística ---------- */
  function grade(ex, resp) {
    const r = { score: 0, correct: false, detail: null, selfAssessed: false };
    if (resp == null) return r;
    switch (ex.type) {
      case 'mc': r.correct = resp === ex.answer; r.score = r.correct ? 1 : 0; break;
      case 'tf': r.correct = resp === ex.answer; r.score = r.correct ? 1 : 0; break;
      case 'bug': r.correct = Number(resp) === Number(ex.answer); r.score = r.correct ? 1 : 0; break;
      case 'match': {
        const ok = ex.pairs.map((p, i) => resp[i] === p[1]);
        r.detail = ok; r.score = ok.filter(Boolean).length / ex.pairs.length; r.correct = r.score === 1; break;
      }
      case 'fill': {
        const ok = ex.answers.map((vars, i) => vars.some((v) => norm(v) === norm(resp[i])));
        r.detail = ok; r.score = ok.filter(Boolean).length / ex.answers.length; r.correct = r.score === 1; break;
      }
      case 'trace': {
        const ok = ex.steps.map((st, i) => st.answers.some((v) => norm(v).toLowerCase() === norm(resp[i]).toLowerCase()));
        r.detail = ok; r.score = ok.filter(Boolean).length / ex.steps.length; r.correct = r.score === 1; break;
      }
      case 'open': case 'practice': {
        const list = ex.type === 'open' ? ex.rubric : ex.steps;
        const checks = (resp.checks || []).slice(0, list.length);
        r.score = list.length ? checks.filter(Boolean).length / list.length : 0; r.correct = r.score >= 0.7; r.selfAssessed = true; break;
      }
      case 'code': r.score = resp.total ? resp.passed / resp.total : 0; r.correct = resp.total > 0 && resp.passed === resp.total; r.detail = resp.results || null; break;
    }
    return r;
  }
  function gradeAll(items, answers) {
    let pts = 0, max = 0; const per = items.map((ex) => { const g = grade(ex, answers[ex.id]); const p = ex.points || 10; max += p; pts += p * g.score; return { id: ex.id, ...g }; });
    return { per, points: Math.round(pts * 10) / 10, max, pct: max ? Math.round((100 * pts) / max) : 0 };
  }

  /* ---------- Validação de conteúdo (CMS e importação) ---------- */
  function validateExercise(ex) {
    const e = [];
    if (!ex || typeof ex !== 'object') return ['exercício inválido'];
    if (!ex.id || !/^[A-Za-z0-9_.:@+~-]+$/.test(ex.id)) e.push('id ausente ou com caracteres inválidos');
    if (!TYPES.includes(ex.type)) e.push('type deve ser um de: ' + TYPES.join(', '));
    if (!ex.prompt) e.push('prompt (enunciado) é obrigatório');
    if (!ex.explanation) e.push('explanation (explicação da resposta) é obrigatória');
    if (ex.points != null && !(ex.points > 0)) e.push('points deve ser positivo');
    if (ex.difficulty != null && ![1, 2, 3].includes(ex.difficulty)) e.push('difficulty deve ser 1, 2 ou 3');
    switch (ex.type) {
      case 'mc': if (!Array.isArray(ex.options) || ex.options.length < 2) e.push('mc: options com 2+ itens'); if (!Number.isInteger(ex.answer) || !ex.options || ex.answer < 0 || ex.answer >= ex.options.length) e.push('mc: answer deve ser o índice da opção correta'); break;
      case 'tf': if (typeof ex.answer !== 'boolean') e.push('tf: answer deve ser true ou false'); break;
      case 'bug': { const n = String(ex.code || '').split('\n').length; if (!ex.code) e.push('bug: code obrigatório'); if (!Number.isInteger(ex.answer) || ex.answer < 1 || ex.answer > n) e.push('bug: answer deve ser o número da linha (1 a ' + n + ')'); break; }
      case 'match': if (!Array.isArray(ex.pairs) || ex.pairs.length < 2 || ex.pairs.some((p) => !Array.isArray(p) || p.length !== 2)) e.push('match: pairs como [[esquerda, direita], ...]'); else if (new Set(ex.pairs.map((p) => p[1])).size !== ex.pairs.length) e.push('match: os itens da direita devem ser únicos'); break;
      case 'fill': { const blanks = (String(ex.code || '').match(/\[\[(\d+)\]\]/g) || []).length; if (!Array.isArray(ex.answers) || ex.answers.length !== blanks || blanks === 0) e.push('fill: answers precisa ter uma lista de variantes para cada lacuna [[n]] do code'); break; }
      case 'trace': if (!ex.code) e.push('trace: code obrigatório'); if (!Array.isArray(ex.steps) || !ex.steps.length || ex.steps.some((st) => !st.q || !Array.isArray(st.answers) || !st.answers.length)) e.push('trace: steps como [{q, answers:[variantes]}]'); break;
      case 'open': if (!ex.model) e.push('open: model (resposta modelo) obrigatório'); if (!Array.isArray(ex.rubric) || !ex.rubric.length) e.push('open: rubric com critérios'); break;
      case 'practice': if (!Array.isArray(ex.steps) || !ex.steps.length) e.push('practice: steps obrigatórios'); break;
      case 'code': if (ex.lang !== 'javascript') e.push('code: apenas lang "javascript" é executável no laboratório'); if (!Array.isArray(ex.tests) || !ex.tests.length || ex.tests.some((t) => !t.name || !t.code)) e.push('code: tests com name e code'); if (!ex.solution) e.push('code: solution obrigatória'); break;
    }
    return e;
  }
  function validateLesson(l) {
    const e = [];
    if (!l.id || !/^[A-Za-z0-9_.-]+$/.test(l.id)) e.push('id inválido');
    if (!l.courseId) e.push('courseId obrigatório');
    if (!l.title) e.push('title obrigatório');
    ['intro', 'theory', 'summary'].forEach((k) => { if (!norm(l[k])) e.push(k + ' obrigatório'); });
    if (!Array.isArray(l.objectives) || !l.objectives.length) e.push('objectives: ao menos um objetivo');
    (l.refs || []).forEach((r, i) => { if (!r.title) e.push('refs[' + i + ']: título obrigatório'); if (r.url && !isUrl(r.url)) e.push('refs[' + i + ']: URL inválida'); if (!r.url && r.kind !== 'book') e.push('refs[' + i + ']: URL obrigatória (exceto livros)'); });
    (l.code || []).forEach((c, i) => { if (!c.code) e.push('code[' + i + ']: código vazio'); });
    return e;
  }
  function validateCourse(c) {
    const e = [];
    if (!c.id || !/^[A-Za-z0-9_.-]+$/.test(c.id)) e.push('id inválido');
    ['title', 'description', 'disciplineId'].forEach((k) => { if (!norm(c[k])) e.push(k + ' obrigatório'); });
    if (!LEVELS.includes(c.level)) e.push('level deve ser I, M, A ou E');
    if (!Array.isArray(c.modules) || !c.modules.length) e.push('modules: ao menos um módulo');
    else c.modules.forEach((m, i) => { if (!m.id || !m.title) e.push('modules[' + i + ']: id e title'); if (!Array.isArray(m.lessons)) e.push('modules[' + i + ']: lessons deve ser lista'); });
    return e;
  }
  /* ---------- Pacote de documentos ({path, data}), formato de seed-docs.json ---------- */
  const DOC_COLS = { kb_courses: 'curso', kb_lessons: 'aula', kb_exsets: 'conjunto de exercícios', kb_assess: 'avaliação', kb_projects: 'projeto', kb_pages: 'página', kb_refs: 'referência', kb_radar: 'radar' };
  const DOC_META = ['catalog', 'radarcfg'];
  /* Valida só a estrutura e os caminhos. Retorna {errors, docs:[{path,col,id,data}]}. Nada é aceito pela metade: qualquer erro rejeita o pacote. */
  function validateDocs(docs) {
    const errors = [], out = [], seen = new Set();
    if (!Array.isArray(docs)) return { errors: ['o pacote de documentos deve ser uma lista [{path, data}]'], docs: out };
    if (!docs.length) return { errors: ['pacote vazio: nenhum documento para importar'], docs: out };
    docs.forEach((d, i) => {
      const w = 'documento #' + (i + 1);
      if (!d || typeof d !== 'object' || Array.isArray(d)) { errors.push(w + ': não é um objeto {path, data}'); return; }
      if (typeof d.path !== 'string' || !d.path) { errors.push(w + ': "path" ausente'); return; }
      if (!d.data || typeof d.data !== 'object' || Array.isArray(d.data)) { errors.push(w + ' (' + d.path + '): "data" ausente ou não é um objeto'); return; }
      const m = /^(kb_[a-z]+)\/([A-Za-z0-9_.~-]+)$/.exec(d.path);
      if (!m) { errors.push(w + ': caminho malformado "' + d.path + '" (esperado coleção/id)'); return; }
      const col = m[1], id = m[2];
      if (col === 'kb_meta') { if (!DOC_META.includes(id)) { errors.push(w + ': documento de metadados desconhecido "' + d.path + '"'); return; } }
      else if (!DOC_COLS[col]) { errors.push(w + ': coleção desconhecida "' + d.path + '"'); return; }
      if (seen.has(d.path)) { errors.push(w + ': caminho duplicado "' + d.path + '"'); return; }
      seen.add(d.path);
      if (col !== 'kb_meta' && d.data.id != null && d.data.id !== id) { errors.push(w + ': id "' + d.data.id + '" não confere com o caminho "' + d.path + '"'); return; }
      if (col === 'kb_exsets' && d.data.lessonId != null && d.data.lessonId !== id) { errors.push(w + ': lessonId não confere com o caminho "' + d.path + '"'); return; }
      out.push({ path: d.path, col, id, data: d.data });
    });
    return { errors, docs: out };
  }
  /* Converte documentos validados para o pacote tradicional (courses, lessons, exsets…), respeitando a estrutura de cada coleção. */
  function docsToBundle(docs) {
    const b = { catalog: null, radarCfg: null, courses: [], lessons: [], exsets: {}, assessments: [], projects: [], pages: {}, refs: [], radar: [] };
    docs.forEach(({ col, id, data }) => {
      const withId = { ...data, id };
      if (col === 'kb_meta') { if (id === 'catalog') b.catalog = data; else b.radarCfg = data; }
      else if (col === 'kb_courses') b.courses.push(withId);
      else if (col === 'kb_lessons') b.lessons.push(withId);
      else if (col === 'kb_exsets') b.exsets[id] = data;
      else if (col === 'kb_assess') b.assessments.push(withId);
      else if (col === 'kb_projects') b.projects.push(withId);
      else if (col === 'kb_pages') b.pages[id] = withId;
      else if (col === 'kb_refs') b.refs.push(withId);
      else if (col === 'kb_radar') b.radar.push(withId);
    });
    return b;
  }
  function validateBundle(b) {
    const e = [];
    if (Array.isArray(b)) {
      const v = validateDocs(b);
      if (v.errors.length) return v.errors;
      return validateBundle(docsToBundle(v.docs));
    }
    if (!b || typeof b !== 'object') return ['arquivo não é um objeto JSON'];
    (b.courses || []).forEach((c) => validateCourse(c).forEach((x) => e.push('curso ' + (c.id || '?') + ': ' + x)));
    (b.lessons || []).forEach((l) => validateLesson(l).forEach((x) => e.push('aula ' + (l.id || '?') + ': ' + x)));
    Object.values(b.exsets || {}).forEach((s) => (s.items || []).forEach((x) => validateExercise(x).forEach((m) => e.push('exercício ' + (x.id || '?') + ': ' + m))));
    (b.assessments || []).forEach((a) => (a.items || []).forEach((x) => validateExercise(x).forEach((m) => e.push('avaliação ' + a.id + ' / ' + (x.id || '?') + ': ' + m))));
    return e;
  }

  /* ---------- Desafios de código: fonte do Worker isolado ---------- */
  function buildTestSource(userCode, tests) {
    const body = tests.map((t) => '{name:' + JSON.stringify(t.name) + ',fn:async()=>{\n' + t.code + '\n}}').join(',\n');
    return `"use strict";
const __logs=[];const __fmt=(a)=>a.map(x=>{if(typeof x==='string')return x;try{return JSON.stringify(x)}catch(e){return String(x)}}).join(' ');
console.log=(...a)=>{if(__logs.length<200)__logs.push(__fmt(a))};console.info=console.log;console.warn=(...a)=>console.log('Aviso:',...a);console.error=(...a)=>console.log('Erro:',...a);
const __show=(v)=>{try{return JSON.stringify(v)}catch(e){return String(v)}};
const assert={
 equal(a,b,m){if(!Object.is(a,b))throw new Error(m||('esperado '+__show(b)+', recebido '+__show(a)))},
 deepEqual(a,b,m){if(__show(a)!==__show(b))throw new Error(m||('esperado '+__show(b)+', recebido '+__show(a)))},
 ok(v,m){if(!v)throw new Error(m||'condição falsa')},
 async rejects(p,sub){try{await(typeof p==='function'?p():p)}catch(e){const msg=String(e&&e.message);if(sub&&!msg.includes(sub))throw new Error('rejeitou com "'+msg+'", esperado conter "'+sub+'"');return}throw new Error('esperava rejeição, mas a promise cumpriu')},
 throws(f,sub){try{f()}catch(e){if(sub&&!String(e&&e.message).includes(sub))throw new Error('lançou "'+e.message+'", esperado conter "'+sub+'"');return}throw new Error('esperava exceção')}
};
${userCode}
;const __tests=[${body}];
(async()=>{const res=[];for(const t of __tests){const t0=Date.now();try{await t.fn();res.push({name:t.name,ok:true,ms:Date.now()-t0})}catch(e){res.push({name:t.name,ok:false,error:String(e&&e.message||e),ms:Date.now()-t0})}}postMessage({res,logs:__logs})})();`;
  }
  function buildRunSource(userCode) {
    return `"use strict";
const __logs=[];const __fmt=(a)=>a.map(x=>{if(typeof x==='string')return x;try{return JSON.stringify(x)}catch(e){return String(x)}}).join(' ');
console.log=(...a)=>{if(__logs.length<500)__logs.push(__fmt(a))};console.info=console.log;console.warn=(...a)=>console.log('Aviso:',...a);console.error=(...a)=>console.log('Erro:',...a);
(async()=>{
${userCode}
})().then(()=>postMessage({logs:__logs}),(e)=>{__logs.push('Erro: '+(e&&e.message?e.message:e));postMessage({logs:__logs})});`;
  }

  /* ---------- Revisão espaçada (SM-2) ---------- */
  function addDays(s, n) { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
  function sm2(card, q, today) {
    const c = { ef: 2.5, iv: 0, reps: 0, ...card };
    if (q < 3) { c.reps = 0; c.iv = 1; } else { c.reps += 1; c.iv = c.reps === 1 ? 1 : c.reps === 2 ? 6 : Math.round(c.iv * c.ef); }
    c.ef = Math.max(1.3, c.ef + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    c.due = addDays(today, c.iv);
    return c;
  }

  /* ---------- Progresso ---------- */
  function courseLessonIds(course) { return (course.modules || []).flatMap((m) => m.lessons || []); }
  function courseProgress(course, cp) {
    const ids = courseLessonIds(course); const done = ids.filter((id) => cp && cp.lessons && cp.lessons[id] && cp.lessons[id].done);
    const mods = (course.modules || []).filter((m) => (m.lessons || []).length && m.lessons.every((id) => cp && cp.lessons && cp.lessons[id] && cp.lessons[id].done));
    const best = cp && cp.assess && cp.assess.length ? Math.max(...cp.assess.map((a) => a.pct)) : null;
    return { total: ids.length, done: done.length, pct: ids.length ? Math.round((100 * done.length) / ids.length) : 0, modulesDone: mods.length, modulesTotal: (course.modules || []).length, best, passed: !!(cp && cp.passed), started: !!cp };
  }

  /* ---------- Radar ---------- */
  const REL = ['informativa', 'media', 'alta', 'critica'];
  const REL_NAMES = { critica: 'Crítica', alta: 'Alta', media: 'Média', informativa: 'Informativa' };
  const UPDATE_TYPES = { versao: 'Nova versão', api: 'Mudança de API', recurso: 'Recurso novo', depreciacao: 'Depreciação / fim de suporte', breaking: 'Breaking change', seguranca: 'Correção de segurança', vulnerabilidade: 'Vulnerabilidade', pratica: 'Mudança de boa prática', ferramenta: 'Nova ferramenta', tendencia: 'Tendência' };
  function relFromCvss(score) { if (score == null || isNaN(score)) return 'informativa'; if (score >= 9) return 'critica'; if (score >= 7) return 'alta'; if (score >= 4) return 'media'; return 'informativa'; }
  function radarKey(e) { let host = ''; try { host = new URL(e.url).hostname.replace(/^www\./, ''); } catch (x) { host = 'manual'; } return [host, fold(e.tech), fold(e.type), fold(e.version || e.advisory || e.title)].join(':').replace(/[^a-z0-9:._-]+/g, '-'); }
  function dedupe(existing, entry) { const k = entry.key || radarKey(entry); return existing.some((x) => (x.key || radarKey(x)) === k); }
  function relAtLeast(r, min) { return REL.indexOf(r) >= REL.indexOf(min || 'informativa'); }
  function notifications(entries, prefs) {
    const p = prefs || {}; if (p.notify === false) return [];
    return entries.filter((e) => e.status !== 'archived' && relAtLeast(e.relevance, p.minRel) && (!p.watch || !p.watch.length || p.watch.includes(e.tech)) && (!p.cats || !p.cats.length || p.cats.includes(e.type)) && !(p.seen && p.seen[e.id]));
  }

  /* ---------- Busca local na base de conhecimento ---------- */
  function tokens(q) { return fold(q).split(/[^a-z0-9#+.]+/).filter((t) => t.length > 1); }
  function score(text, toks, w) { const t = fold(text); let s = 0; toks.forEach((k) => { if (t.includes(k)) s += w; }); return s; }
  function search(docs, q, filters) {
    const toks = tokens(q); const f = filters || {};
    return docs.filter((d) => (!f.cat || f.cat === 'all' || d.cat === f.cat) && (!f.tech || f.tech === 'all' || (d.tags || []).includes(f.tech)))
      .map((d) => { const s = toks.length ? score(d.title, toks, 5) + score(d.text, toks, 1) + score((d.tags || []).join(' '), toks, 3) : 1; const all = toks.length ? toks.every((k) => fold(d.title + ' ' + d.text + ' ' + (d.tags || []).join(' ')).includes(k)) : true; return { ...d, score: s + (all ? 4 : 0), all }; })
      .filter((d) => d.score > 0 && (d.all || toks.length > 2))
      .sort((a, b) => b.score - a.score);
  }
  function reliabilityFor(url) {
    let h = ''; try { h = new URL(url).hostname.replace(/^www\./, ''); } catch (e) { return 'desconhecida'; }
    const official = ['developer.mozilla.org', 'tc39.es', 'html.spec.whatwg.org', 'nodejs.org', 'react.dev', 'nextjs.org', 'typescriptlang.org', 'docs.flutter.dev', 'dart.dev', 'kotlinlang.org', 'developer.android.com', 'docs.oracle.com', 'openjdk.org', 'docs.nestjs.com', 'postgresql.org', 'redis.io', 'docs.docker.com', 'kubernetes.io', 'rabbitmq.com', 'kafka.apache.org', 'docs.aws.amazon.com', 'learn.microsoft.com', 'cloud.google.com', 'owasp.org', 'rfc-editor.org', 'datatracker.ietf.org', 'w3.org', 'reactnative.dev', 'docs.expo.dev', 'spring.io', 'jestjs.io', 'vitest.dev', 'playwright.dev', 'docs.cypress.io', 'prisma.io', 'docs.anthropic.com', 'platform.claude.com', 'modelcontextprotocol.io', 'osv.dev', 'nvd.nist.gov', 'docs.github.com', 'tailwindcss.com', 'git-scm.com'];
    if (official.some((d) => h === d || h.endsWith('.' + d))) return 'alta';
    if (h === 'github.com') return 'alta-repo';
    if (['aws.amazon.com', 'martinfowler.com', 'web.dev', 'endoflife.date', 'stackoverflow.com', 'en.wikipedia.org'].includes(h)) return 'media';
    return 'verificar';
  }


  /* ---------- Checklist de publicação ---------- */
  const filled = (v) => Array.isArray(v) ? v.length > 0 : !!norm(v);
  function lessonChecklist(l, items) {
    const it = items || [];
    const sections = ['intro', 'theory', 'examples', 'market', 'summary'].filter((k) => !filled(l[k]));
    if (!filled(l.concepts)) sections.push('concepts'); if (!filled(l.bestPractices)) sections.push('bestPractices'); if (!filled(l.mistakes)) sections.push('mistakes');
    const bad = it.map((x) => ({ id: x.id, e: validateExercise(x) })).filter((x) => x.e.length);
    const refsOk = filled(l.refs) && l.refs.every((r) => r.title && (r.url ? isUrl(r.url) : r.kind === 'book'));
    return [
      { k: 'objectives', label: 'Objetivos de aprendizagem', ok: filled(l.objectives) },
      { k: 'content', label: 'Conteúdo completo (introdução, teoria, conceitos, exemplos, boas práticas, erros comuns, aplicações, resumo)', ok: !sections.length && norm(l.theory).length >= 400, detail: sections.length ? 'faltam: ' + sections.join(', ') : norm(l.theory).length < 400 ? 'explicação teórica com menos de 400 caracteres' : '' },
      { k: 'exercises', label: 'Exercícios cadastrados', ok: it.length > 0, detail: it.length + ' exercício(s)' },
      { k: 'answers', label: 'Respostas, critérios de correção e explicações em todos os exercícios', ok: it.length > 0 && !bad.length, detail: bad.length ? bad.map((x) => x.id + ': ' + x.e[0]).join('; ') : '' },
      { k: 'refs', label: 'Referências com título e URL válida (livros sem URL)', ok: refsOk },
      { k: 'version', label: 'Versão das tecnologias registrada', ok: filled(l.techVersions) }
    ];
  }
  function courseChecklist(c, ctx) {
    const x = ctx || {}; const ids = courseLessonIds(c);
    return [
      { k: 'desc', label: 'Descrição e objetivos', ok: filled(c.description) && filled(c.objectives) },
      { k: 'prereqs', label: 'Pré-requisitos informados', ok: Array.isArray(c.prereqs) },
      { k: 'skills', label: 'Competências desenvolvidas', ok: filled(c.skills) },
      { k: 'modules', label: 'Módulos com aulas', ok: filled(c.modules) && c.modules.every((m) => filled(m.lessons)) },
      { k: 'lessons', label: 'Todas as aulas existem e estão publicadas', ok: ids.length > 0 && ids.every((id) => x.lessons && x.lessons[id] && x.lessons[id].status === 'published'), detail: ids.filter((id) => !(x.lessons && x.lessons[id] && x.lessons[id].status === 'published')).join(', ') },
      { k: 'assess', label: 'Prova final', ok: !!(x.assess && (x.assess.items || []).length) },
      { k: 'project', label: 'Projeto prático integrador', ok: filled(c.projectIds) },
      { k: 'refs', label: 'Referências técnicas', ok: filled(c.materials) },
      { k: 'version', label: 'Versão das tecnologias registrada', ok: filled(c.versions) }
    ];
  }
  function itemsChecklist(items) {
    const bad = (items || []).map((x) => ({ id: x.id, e: validateExercise(x) })).filter((x) => x.e.length);
    return [{ k: 'items', label: 'Ao menos um item', ok: (items || []).length > 0 }, { k: 'answers', label: 'Gabarito, critérios e explicação em todos os itens', ok: !bad.length, detail: bad.map((x) => x.id + ': ' + x.e[0]).join('; ') }];
  }
  const checklistOk = (list) => list.every((c) => c.ok);

  /* ---------- Relatório de cobertura ---------- */
  function coverage(kb) {
    const courses = Object.values(kb.courses || {}); const lessons = kb.lessons || {}; const exsets = kb.exsets || {}; const assess = kb.assess || {};
    const discs = ((kb.catalog && kb.catalog.areas) || []).flatMap((a) => a.disciplines.map((d) => ({ id: d.id, name: d.name, area: a.name })));
    const courseDiscs = (c) => [c.disciplineId, ...(c.disciplineIds || [])];
    const r = { disciplinesWithoutCourses: [], coursesWithoutModules: [], modulesWithoutLessons: [], lessonsWithoutExercises: [], missingLessons: [], exercisesWithoutKey: [], coursesWithoutAssessment: [], coursesWithoutProject: [], reviewOverdue: [] };
    discs.forEach((d) => { if (!courses.some((c) => courseDiscs(c).includes(d.id))) r.disciplinesWithoutCourses.push(d); });
    const today = new Date().toISOString().slice(0, 10);
    courses.forEach((c) => {
      if (!filled(c.modules)) r.coursesWithoutModules.push({ id: c.id, title: c.title });
      (c.modules || []).forEach((m) => { if (!filled(m.lessons)) r.modulesWithoutLessons.push({ courseId: c.id, id: m.id, title: m.title }); });
      courseLessonIds(c).forEach((lid) => {
        const l = lessons[lid]; if (!l) { r.missingLessons.push({ courseId: c.id, id: lid }); return; }
        const items = (exsets[lid] && exsets[lid].items) || [];
        if (!items.length) r.lessonsWithoutExercises.push({ courseId: c.id, id: lid, title: l.title });
        items.forEach((x) => { const e = validateExercise(x); if (e.length) r.exercisesWithoutKey.push({ lessonId: lid, id: x.id, error: e[0] }); });
        if (l.nextReviewAt && l.nextReviewAt.slice(0, 10) < today) r.reviewOverdue.push({ kind: 'lesson', id: lid, title: l.title, due: l.nextReviewAt.slice(0, 10) });
      });
      const a = assess[c.id];
      if (!a || !(a.items || []).length) r.coursesWithoutAssessment.push({ id: c.id, title: c.title });
      else a.items.forEach((x) => { const e = validateExercise(x); if (e.length) r.exercisesWithoutKey.push({ assessId: c.id, id: x.id, error: e[0] }); });
      if (!filled(c.projectIds)) r.coursesWithoutProject.push({ id: c.id, title: c.title });
    });
    r.totals = { disciplines: discs.length, disciplinesCovered: discs.length - r.disciplinesWithoutCourses.length, courses: courses.length, lessons: courses.reduce((s, c) => s + courseLessonIds(c).length, 0), exercises: courses.reduce((s, c) => s + courseLessonIds(c).reduce((t, id) => t + (((exsets[id] && exsets[id].items) || []).length), 0), 0) };
    r.issues = ['coursesWithoutModules', 'modulesWithoutLessons', 'lessonsWithoutExercises', 'missingLessons', 'exercisesWithoutKey', 'coursesWithoutAssessment', 'coursesWithoutProject'].reduce((s, k) => s + r[k].length, 0);
    return r;
  }

  /* ---------- Análise estatística dos itens ---------- */
  /* Cada aluno grava um resumo: { items: { [exId]: { f: nota da 1ª tentativa 0..100, c: escolha/partes da 1ª tentativa, t: tentativas, b: melhor nota } } }.
     A análise usa a 1ª tentativa, que mede a dificuldade antes do aprendizado por repetição. */
  const IA = { minN: 5, low: 0.3, high: 0.95, distractor: 0.35, part: 0.6, tries: 3 };
  function respSummary(ex, resp, g) {
    if (resp == null) return null;
    if (ex.type === 'mc') return resp; if (ex.type === 'tf') return resp ? 1 : 0; if (ex.type === 'bug') return Number(resp);
    if (['match', 'fill', 'trace'].includes(ex.type)) return (g && g.detail || []).map((ok, i) => (ok ? '' : i)).filter((x) => x !== '');
    if (ex.type === 'code') return ((g && g.detail) || []).filter((t) => !t.ok).map((t) => t.name);
    return null;
  }
  function itemAnalysis(items, statDocs, opts) {
    const o = { ...IA, ...(opts || {}) };
    return (items || []).map((ex) => {
      const rows = (statDocs || []).map((d) => d && d.items && d.items[ex.id]).filter((x) => x && typeof x.f === 'number');
      const n = rows.length; const p = n ? rows.reduce((s, x) => s + x.f / 100, 0) / n : null; const avgTries = n ? rows.reduce((s, x) => s + (x.t || 1), 0) / n : null;
      const flags = []; const dist = {};
      if (n >= o.minN) {
        if (p < o.low) flags.push({ k: 'baixa', t: 'Taxa de acerto muito baixa (' + Math.round(p * 100) + '%)' });
        if (p > o.high) flags.push({ k: 'alta', t: 'Taxa de acerto muito alta (' + Math.round(p * 100) + '%): a questão pode não discriminar' });
        if (avgTries >= o.tries) flags.push({ k: 'tentativas', t: 'Média de ' + avgTries.toFixed(1) + ' tentativas por aluno' });
        if (['mc', 'tf', 'bug'].includes(ex.type)) {
          rows.forEach((x) => { if (x.c != null) dist[x.c] = (dist[x.c] || 0) + 1; });
          const correct = ex.type === 'tf' ? (ex.answer ? 1 : 0) : ex.answer;
          const wrong = Object.entries(dist).filter(([k]) => String(k) !== String(correct)).sort((a, b) => b[1] - a[1])[0];
          if (wrong && wrong[1] / n >= o.distractor) flags.push({ k: 'ambigua', t: 'Possível ambiguidade: ' + Math.round((100 * wrong[1]) / n) + '% escolheram ' + (ex.type === 'mc' ? 'a opção ' + String.fromCharCode(65 + Number(wrong[0])) : ex.type === 'bug' ? 'a linha ' + wrong[0] : wrong[0] === '1' ? 'Verdadeiro' : 'Falso') });
        }
        if (['match', 'fill', 'trace', 'code'].includes(ex.type)) {
          rows.forEach((x) => (Array.isArray(x.c) ? x.c : []).forEach((k) => { dist[k] = (dist[k] || 0) + 1; }));
          Object.entries(dist).filter(([, v]) => v / n >= o.part).forEach(([k, v]) => flags.push({ k: 'recorrente', t: 'Erro recorrente (' + Math.round((100 * v) / n) + '%) em ' + (ex.type === 'code' ? 'teste "' + k + '"' : 'parte ' + (Number(k) + 1)) }));
        }
      }
      return { id: ex.id, type: ex.type, prompt: ex.prompt, n, p: p == null ? null : Math.round(p * 100), avgTries: avgTries == null ? null : Math.round(avgTries * 10) / 10, dist, flags, enough: n >= o.minN };
    });
  }

  /* ---------- Pré-requisitos entre cursos ---------- */
  function prereqStatus(course, courses, progress) {
    return (course.requires || []).map((id) => { const c = courses[id]; const cp = progress && progress[id]; return { id, title: c ? c.title : id, exists: !!c, passed: !!(cp && cp.passed), started: !!cp }; });
  }

  /* ---------- Atualização incremental do pacote ---------- */
  /* Decide o que gravar: cria o que falta; atualiza só o que veio do pacote e não foi editado (seedRev menor e updatedAt igual ao do pacote anterior). */
  function seedPlan(docs, existing, drafts) {
    return docs.map((d) => {
      const cur = existing[d.path]; const hasDraft = drafts && drafts[d.path];
      if (!cur) return { ...d, action: 'create' };
      if (d.path === 'kb_meta/catalog') return { ...d, action: (cur.seedRev || 0) < (d.data.seedRev || 0) ? 'merge' : 'skip' };
      const fromSeed = cur.seedRev != null && cur.seedStamp && cur.updatedAt === cur.seedStamp;
      if (fromSeed && !hasDraft && cur.seedRev < (d.data.seedRev || 0)) return { ...d, action: 'update' };
      return { ...d, action: 'skip' };
    });
  }
  function mergeCatalog(cur, seed) {
    const out = JSON.parse(JSON.stringify(cur));
    (seed.areas || []).forEach((sa) => {
      let a = out.areas.find((x) => x.id === sa.id); if (!a) { out.areas.push(JSON.parse(JSON.stringify(sa))); return; }
      sa.disciplines.forEach((sd) => { const d = a.disciplines.find((x) => x.id === sd.id); if (!d) a.disciplines.push(JSON.parse(JSON.stringify(sd))); else d.courses = [...new Set([...(d.courses || []), ...(sd.courses || [])])]; });
    });
    (seed.tracks || []).forEach((t) => { if (!out.tracks.some((x) => x.id === t.id)) out.tracks.push(t); });
    out.seedRev = seed.seedRev; return out;
  }

  return { lessonChecklist, courseChecklist, itemsChecklist, checklistOk, coverage, respSummary, itemAnalysis, IA, prereqStatus, seedPlan, mergeCatalog, validateDocs, docsToBundle, DOC_COLS, TYPES, TYPE_NAMES, LEVELS, STATUSES, REL, REL_NAMES, UPDATE_TYPES, norm, fold, isUrl, grade, gradeAll, validateExercise, validateLesson, validateCourse, validateBundle, buildTestSource, buildRunSource, sm2, addDays, courseLessonIds, courseProgress, relFromCvss, radarKey, dedupe, relAtLeast, notifications, tokens, search, reliabilityFor };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = Engine;
