// Validador da C1: estrutura, vínculos, exercícios, provas, checklists, cobertura de tópicos e execução dos desafios JS.
// Uso: node seed/c1/validate.mjs [arquivo-do-curso ...]
import { createRequire } from 'node:module';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { loadC1 } from './index.mjs';
const require = createRequire(import.meta.url);
const E = require('../../src/engine.js');
const wave1 = JSON.parse(readFileSync(new URL('../docs.json', import.meta.url)));
const taken = new Set(wave1.map((d) => d.path));
const only = process.argv.slice(2);
const run = (src, ms = 4000) => new Promise((res, rej) => { const t = setTimeout(() => rej(new Error('timeout')), ms); const ctx = { setTimeout, clearTimeout, queueMicrotask, structuredClone, console: {}, postMessage: (m) => { clearTimeout(t); res(m); }, Date }; try { vm.runInNewContext(src, ctx); } catch (e) { clearTimeout(t); rej(e); } });
process.on('unhandledRejection', () => {});
const everyone = await loadC1();
const all = everyone.filter((c) => !only.length || only.includes(c.file));
let fails = 0; const err = (c, m) => { fails++; console.log('  ✖', c, m); };
const seenPath = new Set(); const seenUrl = new Map();
for (const { file, W, cover, topics } of all) {
  const c = W.course; const id = c.id; console.log('\n== ' + file + ' (' + id + ')');
  const mk = (p) => { if (taken.has(p)) err(id, 'caminho já existe na Onda 1: ' + p); if (seenPath.has(p)) err(id, 'caminho duplicado: ' + p); seenPath.add(p); };
  mk('kb_courses/' + id); mk('kb_assess/' + id);
  const ids = E.courseLessonIds(c);
  if (ids.length !== new Set(ids).size) err(id, 'aula repetida nos módulos');
  E.validateCourse(c).forEach((m) => err(id, 'curso: ' + m));
  const lessons = Object.fromEntries(W.lessons.map((l) => [l.id, l]));
  W.lessons.forEach((l) => { mk('kb_lessons/' + l.id); mk('kb_exsets/' + l.id); if (!ids.includes(l.id)) err(id, 'aula fora dos módulos ' + l.id); if (l.courseId !== id) err(l.id, 'courseId'); E.validateLesson(l).forEach((m) => err(l.id, m)); });
  let nEx = 0, types = {}, pts = 0;
  for (const lid of ids) {
    const L = lessons[lid]; if (!L) { err(id, 'aula ausente ' + lid); continue; }
    const set = W.exsets[lid]; if (!set) { err(lid, 'sem exercícios'); continue; }
    if (set.lessonId !== lid) err(lid, 'lessonId do exset');
    const f = E.lessonChecklist(L, set.items).filter((k) => !k.ok); f.forEach((k) => err(lid, 'checklist ' + k.k + (k.detail ? ': ' + k.detail : '')));
    for (const k of ['intro', 'theory', 'examples', 'summary']) if (/[\r\x08\x0b\x0c\x00]/.test(L[k] || '')) err(lid, 'caractere de controle em ' + k + ' (provável \\r, \\b ou \\f sem escape)');
    for (const k of ['intro', 'theory', 'examples', 'summary', 'market']) if (((L[k] || '').match(/```/g) || []).length % 2) err(lid, 'cercas de código (```) desbalanceadas em ' + k);
    if ((L.theory || '').length < 3500) err(lid, 'teoria curta (' + (L.theory || '').length + ' chars)');
    if (!(L.cards && L.cards.length >= 3)) err(lid, 'cards de revisão (mín. 3)');
    const eids = new Set(); set.items.forEach((x) => { nEx++; types[x.type] = (types[x.type] || 0) + 1; if (eids.has(x.id)) err(lid, 'id repetido ' + x.id); eids.add(x.id); if (!x.id.startsWith(lid + '-')) err(lid, 'id fora do padrão ' + x.id); });
    if (set.items.length < 4) err(lid, 'menos de 4 exercícios');
    for (const x of set.items) if (x.type === 'code') {
      try { const r = await run(E.buildTestSource(x.solution, x.tests)); const bad = r.res.filter((t) => !t.ok); if (bad.length) err(x.id, 'solução falha: ' + bad.map((t) => t.name + ' → ' + t.error).join('; ')); const r2 = await run(E.buildTestSource(x.starter, x.tests)); if (r2.res.every((t) => t.ok)) err(x.id, 'o código inicial já passa em todos os testes'); } catch (e) { err(x.id, 'execução: ' + e.message); }
    }
  }
  const a = W.assessment; if (a.items.length !== 12) err(id, 'prova deve ter 12 itens: ' + a.items.length); if (a.passPct !== 70) err(id, 'passPct'); if (a.courseId !== id) err(id, 'assessment.courseId'); if (a.id !== id) err(id, 'assessment.id');
  const aids = new Set(); a.items.forEach((x) => { pts += x.points || 10; if (x.type === 'code') err(id, 'prova com item code ' + x.id); if (aids.has(x.id)) err(id, 'id repetido na prova ' + x.id); aids.add(x.id); if (!x.id.startsWith(id + '-p')) err(id, 'id da prova fora do padrão ' + x.id); E.validateExercise(x).forEach((m) => err(x.id, m)); });
  E.itemsChecklist(a.items).filter((k) => !k.ok).forEach((k) => err(id, 'prova ' + k.k + ' ' + (k.detail || '')));
  const P = W.project; mk('kb_projects/' + P.id); if (P.courseId !== id) err(P.id, 'courseId'); if (!(c.projectIds || []).includes(P.id)) err(id, 'projectIds não contém ' + P.id);
  ['name', 'desc', 'lv', 'stack'].forEach((k) => { if (!P[k]) err(P.id, 'campo ' + k); }); ['rf', 'rnf', 'ac', 'ch'].forEach((k) => { if (!Array.isArray(P[k]) || P[k].length < 3) err(P.id, 'lista ' + k + ' (mín. 3)'); });
  const cc = E.courseChecklist(c, { lessons, assess: a }).filter((k) => !k.ok); cc.forEach((k) => err(id, 'checklist do curso ' + k.k + ' ' + (k.detail || '')));
  const s = c.supplement; ['glossary', 'cheatsheet', 'mistakes', 'prereqMap', 'officialRefs', 'practice'].forEach((k) => { if (!s || !s[k] || !s[k].length) err(id, 'suplemento sem ' + k); });
  if (s) { (s.officialRefs || []).forEach((r) => { if (!r.title || !E.isUrl(r.url)) err(id, 'officialRef inválida'); }); if ((s.glossary || []).length < 15) err(id, 'glossário curto: ' + s.glossary.length); }
  (c.requires || []).forEach((r) => { if (!wave1.some((d) => d.path === 'kb_courses/' + r) && !everyone.some((x) => x.W.course.id === r)) err(id, 'requires inexistente ' + r); });
  // referências: toda URL tem de estar registrada com data de consulta
  W.lessons.forEach((l) => l.refs.forEach((r) => { if (r.url) { if (!E.isUrl(r.url)) err(l.id, 'url inválida ' + r.url); seenUrl.set(r.url, r.title); } }));
  // cobertura dos tópicos do catálogo
  if (topics) for (const t of topics) { const cv = (cover || {})[t]; if (!cv || !cv.length) err(id, 'tópico sem cobertura: ' + t); else cv.forEach((x) => { if (!ids.includes(x)) err(id, 'cobertura aponta aula inexistente: ' + x); }); }
  const mins = W.lessons.reduce((n, l) => n + l.minutes, 0);
  console.log(`  módulos ${c.modules.length} · aulas ${ids.length} · exercícios ${nEx} (${Object.entries(types).map(([k, v]) => k + ':' + v).join(' ')}) · prova ${a.items.length} itens/${pts} pts · projeto ${P.id} · glossário ${(s && s.glossary || []).length} · ${Math.round(mins / 60 * 10) / 10} h de aula · tópicos ${topics ? topics.length : '?'}`);
}
console.log('\nURLs únicas citadas:', seenUrl.size);
console.log(fails ? '\nFALHAS: ' + fails : '\nOK: sem falhas');
process.exit(fails ? 1 : 0);
