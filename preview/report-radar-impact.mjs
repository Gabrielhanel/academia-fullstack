// Relatório 1 — Radar → aulas a revisar: cruza alertas de fim de vida (EOL) com aulas e cursos que citam a mesma tecnologia e versão.
// Lê preview/dist/seed-docs.json. Escreve preview/state/reports/radar-aulas.{md,json}. Não altera conteúdo.
// Uso: node preview/report-radar-impact.mjs
import { fileURLToPath } from 'node:url';
import { loadPack, writeReport, table, today } from './lib.mjs';

export const ALIAS = { nodejs: ['node.js', 'nodejs', 'node'], react: ['react'], nextjs: ['next.js', 'nextjs'], 'react-native': ['react native'], kotlin: ['kotlin'], nestjs: ['nestjs', 'nest.js'], postgresql: ['postgresql', 'postgres'], redis: ['redis'], docker: ['docker engine', 'docker'], kubernetes: ['kubernetes', 'k8s'], rabbitmq: ['rabbitmq'], kafka: ['apache kafka', 'kafka'] };
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function matcher(tech, cycle) {
  const al = ALIAS[tech]; if (!al) return null;
  return new RegExp('(?<![\\w.])(?:' + al.map(esc).join('|') + ')\\s*(?:v|versão|version)?\\s*' + esc(cycle) + '(?!\\d)', 'gi');
}
export const snippet = (text, idx, len) => { const a = Math.max(0, idx - 50), b = Math.min(text.length, idx + len + 60); return (a ? '…' : '') + text.slice(a, b).replace(/\s+/g, ' ') + (b < text.length ? '…' : ''); };
const SKIP = new Set(['refs', 'cards', 'techVersions', 'courseId', 'id', 'moduleId', 'tags', 'updatedAt', 'publishedAt', 'approvedAt', 'approvedBy', 'lastReviewedAt', 'nextReviewAt', 'status', 'seedStamp']);
const strings = (v, out = []) => { if (typeof v === 'string') out.push(v); else if (Array.isArray(v)) v.forEach((x) => strings(x, out)); else if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => { if (!SKIP.has(k)) strings(x, out); }); return out; };
const flat = (o) => strings(o).join('\n');

/* Função pura: devolve [{alert, hits:[{courseId, lessonId, where, snippet}]}] */
export function impact(radar, courses, lessons) {
  const alerts = radar.filter((r) => r.type === 'depreciacao' && r.relevance === 'alta' && ALIAS[r.tech] && /^endoflife:[^:]+:[^:]+:eol/.test(r.key || ''));
  return alerts.map((a) => {
    const cycle = a.key.split(':')[2]; const hits = [];
    const run = (text, courseId, lessonId, where) => { const re = matcher(a.tech, cycle); let m; if (!re) return; while ((m = re.exec(text))) { hits.push({ courseId, lessonId, where, snippet: snippet(text, m.index, m[0].length) }); if (hits.length > 400) return; } };
    courses.forEach((c) => run(String(c.versions || ''), c.id, null, 'versões do curso'));
    lessons.forEach((l) => run(flat(l), l.courseId, l.id, 'aula'));
    return { alert: { id: a.id, title: a.title, relevance: a.relevance, date: a.date, tech: a.tech, cycle }, hits };
  });
}

function main() {
  const { courses, lessons, radar } = loadPack();
  const title = Object.fromEntries(lessons.map((l) => [l.id, l.title]));
  const res = impact(radar, courses, lessons).sort((x, y) => (x.alert.relevance === y.alert.relevance ? (x.alert.date < y.alert.date ? -1 : 1) : x.alert.relevance === 'alta' ? -1 : 1));
  const withHits = res.filter((r) => r.hits.length), none = res.filter((r) => !r.hits.length);
  let md = 'Cruzamento entre alertas de fim de vida (EOL) do Radar e o texto dos cursos. Só entram alertas de relevância alta (já em EOL ou a até 180 dias). Cada linha é um trecho que cita a tecnologia **e** a versão do alerta; é uma sugestão de revisão, não uma correção automática. Gerado em ' + today() + '.\n\n';
  md += '**' + res.length + '** alertas de EOL analisados; **' + withHits.length + '** com trechos a revisar; **' + none.length + '** sem menção nos cursos.\n\n';
  withHits.forEach((r) => {
    md += '## ' + r.alert.title + ' (' + r.alert.relevance + ')\n\n' + r.hits.length + ' trecho(s) em ' + new Set(r.hits.map((h) => h.courseId)).size + ' curso(s).\n\n';
    md += table(['Curso', 'Onde', 'Trecho'], r.hits.slice(0, 25).map((h) => [h.courseId, h.lessonId ? h.lessonId + ' — ' + (title[h.lessonId] || '') : h.where, h.snippet]));
    if (r.hits.length > 25) md += '\n… e mais ' + (r.hits.length - 25) + ' trecho(s) (lista completa em `preview/state/reports/radar-aulas.json`).\n';
    md += '\n';
  });
  if (none.length) md += '## Sem menção nos cursos\n\n' + none.map((r) => '- ' + r.alert.title).join('\n') + '\n';
  writeReport('radar-aulas', md, { generatedAt: today(), alerts: res });
  console.log('Radar → aulas: ' + res.length + ' alertas; ' + withHits.length + ' com trechos a revisar (' + res.reduce((s, r) => s + r.hits.length, 0) + ' trechos); ' + none.length + ' sem menção.');
  withHits.slice(0, 8).forEach((r) => console.log('  • ' + r.alert.title + ': ' + r.hits.length));
  console.log('Relatório: preview/state/reports/radar-aulas.md');
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) { try { main(); } catch (e) { console.error('ERRO:', e.message); process.exit(1); } }
