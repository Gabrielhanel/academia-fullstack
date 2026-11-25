// Testes dos relatórios de revisão (funções puras; sem rede).
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { matcher, impact } from '../report-radar-impact.mjs';
import { parseDeclared, target, drift, stableMax } from '../report-versions.mjs';
import { collect, classify } from '../report-links.mjs';
import { buildPack } from '../build-preview.mjs';

const R = new URL('../../', import.meta.url);
const require = createRequire(import.meta.url);
const E = require(new URL('src/engine.js', R).pathname);
const baseDocs = JSON.parse(readFileSync(new URL('seed/docs.json', R)));

test('radar×aulas: casa tecnologia + versão exata, sem falso positivo', () => {
  const m = (t, c, s) => { const re = matcher(t, c); return !!re && re.test(s); };
  assert.ok(m('nodejs', '20', 'Funciona em Node.js 20 ou superior'));
  assert.ok(m('nodejs', '20', 'requer node 20+'));
  assert.ok(!m('nodejs', '20', 'Node.js 200'));
  assert.ok(!m('nodejs', '20', 'Node.js 26.13.1'));
  assert.ok(m('kubernetes', '1.34', 'Kubernetes 1.34'));
  assert.ok(m('postgresql', '14', 'PostgreSQL 14 ou superior'));
  assert.ok(!m('react', '0.84', 'React Native 0.84'));
  assert.ok(m('react-native', '0.84', 'React Native 0.84'));
  assert.equal(matcher('typescript', '5'), null);
});

test('radar×aulas: só alertas de EOL com relevância alta; ignora techVersions duplicado por aula', () => {
  const radar = [
    { id: 'a', tech: 'nodejs', type: 'depreciacao', relevance: 'alta', key: 'endoflife:nodejs:20:eol', title: 'Node 20 EOL', date: '2026-04-30' },
    { id: 'b', tech: 'nodejs', type: 'depreciacao', relevance: 'media', key: 'endoflife:nodejs:24:eol', title: 'Node 24 EOL', date: '2028-04-30' },
    { id: 'c', tech: 'nodejs', type: 'versao', relevance: 'alta', key: 'endoflife:nodejs:26:26.1.0', title: 'v', date: 'x' }];
  const courses = [{ id: 'c1', versions: 'Node.js 20 ou superior' }];
  const lessons = [{ id: 'l1', courseId: 'c1', title: 't', techVersions: 'Node.js 20 ou superior', theory: 'Use Node.js 20 aqui. Node.js 24 também.' }];
  const r = impact(radar, courses, lessons);
  assert.equal(r.length, 1); assert.equal(r[0].alert.id, 'a');
  assert.deepEqual(r[0].hits.map((h) => h.where), ['versões do curso', 'aula']);
});

test('versões: extrai pares nome/versão do texto livre', () => {
  const t = 'React 19.3.1 e React DOM 19.3.1, TypeScript 7.0.2, @testing-library/react 16.3.3 e Zod 4.6.7, verificados com npm em 2026-11-18 (Node.js 26.13); Tailwind CSS 4.3.5 (@tailwindcss/cli), jest-axe 11.0.0 (axe-core 4.14.1), Google Chrome 157';
  const p = Object.fromEntries(parseDeclared(t).map((x) => [x.name, x.version]));
  assert.equal(p['react'], '19.3.1'); assert.equal(p['react dom'], '19.3.1'); assert.equal(p['typescript'], '7.0.2');
  assert.equal(p['@testing-library/react'], '16.3.3'); assert.equal(p['zod'], '4.6.7'); assert.equal(p['node.js'], '26.13');
  assert.equal(p['tailwind css'], '4.3.5'); assert.equal(p['jest-axe'], '11.0.0'); assert.equal(p['axe-core'], '4.14.1');
  assert.ok(!('google chrome' in p), 'versão sem ponto é ignorada');
  assert.deepEqual(target('react dom'), { kind: 'npm', id: 'react-dom' });
  assert.deepEqual(target('postgresql'), { kind: 'eol', id: 'postgresql' });
  assert.deepEqual(target('@reduxjs/toolkit'), { kind: 'npm', id: '@reduxjs/toolkit' });
  assert.equal(target('uma frase longa qualquer'), null);
});

test('versões: defasagem major/minor/atual, 0.x e pré-lançamento', () => {
  assert.deepEqual(drift('19.3.1', '19.3.1'), { level: 'atual', n: 0 });
  assert.deepEqual(drift('19.3.1', '19.3.9'), { level: 'atual', n: 0 });
  assert.deepEqual(drift('18.2.0', '19.3.1'), { level: 'major', n: 1 });
  assert.deepEqual(drift('5.1.0', '5.9.0'), { level: 'minor', n: 8 });
  assert.deepEqual(drift('0.7.1', '0.9.0'), { level: 'major', n: 2 });
  assert.equal(stableMax({ '1.0.0': 1, '2.0.0-rc.1': 1, '1.5.2': 1, '1.10.0': 1 })[0], '1.10.0');
});

test('links: coleta sem fragmento, classifica respostas', () => {
  const m = collect([{ path: 'kb_lessons/l1', data: { refs: [{ url: 'https://a.dev/x#sec' }, { url: 'https://a.dev/x' }, { url: 'mailto:x' }] } }, { path: 'kb_courses/c1', data: { supplement: { officialRefs: [{ url: 'https://b.dev/' }] }, materials: [{ url: 'https://a.dev/x' }] } }]);
  assert.deepEqual([...m.keys()].sort(), ['https://a.dev/x', 'https://b.dev/']);
  assert.deepEqual([...m.get('https://a.dev/x')].sort(), ['kb_courses:c1', 'kb_lessons:l1']);
  assert.equal(classify('https://a.dev/x', { status: 200, final: 'https://a.dev/x/' }).result, 'ok');
  assert.equal(classify('https://a.dev/x', { status: 200, final: 'https://a.dev/novo' }).result, 'redirecionado');
  assert.equal(classify('https://a.dev/x', { status: 404 }).result, 'quebrado');
  assert.equal(classify('https://a.dev/x', { status: 500 }).result, 'quebrado');
  assert.equal(classify('https://a.dev/x', { status: 403 }).result, 'bloqueado');
  assert.equal(classify('https://a.dev/x', { error: 'ENOTFOUND' }).result, 'quebrado');
});

test('pacote: relatórios viram páginas (base intacta, idempotente)', () => {
  const reports = [{ id: 'rel-links', title: 'Links', md: '# x' }];
  const a = buildPack({ E, baseDocs, waves: [], reports });
  assert.ok(a.docs.some((d) => d.path === 'kb_pages/rel-links' && d.data.status === 'published'));
  assert.equal(E.validateDocs(a.docs).errors.length, 0);
  const b = buildPack({ E, baseDocs, waves: [], reports, prev: a.state });
  assert.equal(b.changed, false);
  const c = buildPack({ E, baseDocs, waves: [], reports: [{ ...reports[0], md: '# y' }], prev: a.state });
  assert.equal(c.changed, true); assert.equal(c.docs.find((d) => d.path === 'kb_pages/rel-links').data.seedRev, c.state.packRev);
});
