// Converte seed.json em documentos do banco (caminho + dados). Usado no pacote publicado e nos testes.
// seedRev e seedStamp permitem a atualização incremental: o app só atualiza documentos do pacote que não foram editados.
import { readFileSync, writeFileSync } from 'node:fs';
const seed = JSON.parse(readFileSync(new URL('./seed.json', import.meta.url)));
const NOW = '2026-11-17T22:00:00.000Z';
export const SEED_REV = 3;
const docs = [];
const put = (path, data) => { const d = { ...data, updatedAt: data.updatedAt || NOW }; d.seedRev = SEED_REV; d.seedStamp = d.updatedAt; docs.push({ path, data: d }); };
put('kb_meta/catalog', seed.catalog);
put('kb_meta/radarcfg', { ...seed.radarCfg, lastCheck: '2026-11-17', lastCheckBy: 'verificação manual (endoflife.date)' });
seed.courses.forEach((c) => put('kb_courses/' + c.id, c));
seed.lessons.forEach((l) => put('kb_lessons/' + l.id, l));
Object.entries(seed.exsets).forEach(([id, s]) => put('kb_exsets/' + id, { ...s, status: 'published', version: 1, updatedAt: s.updatedAt || NOW, lastReviewedAt: s.lastReviewedAt, nextReviewAt: s.nextReviewAt }));
seed.assessments.forEach((a) => put('kb_assess/' + a.id, { status: 'published', version: 1, ...a, updatedAt: a.updatedAt || NOW }));
seed.projects.forEach((p) => put('kb_projects/' + p.id, p));
Object.values(seed.pages).forEach((p) => put('kb_pages/' + p.id, p));
seed.refs.forEach((r) => put('kb_refs/' + r.id, r));
seed.radar.forEach((r) => put('kb_radar/' + r.id, { ...r, status: 'published' }));
// remove campos indefinidos
docs.forEach((d) => Object.keys(d.data).forEach((k) => d.data[k] === undefined && delete d.data[k]));
writeFileSync(new URL('./docs.json', import.meta.url), JSON.stringify(docs));
console.log(docs.length, 'documentos', 'maior:', Math.max(...docs.map((d) => JSON.stringify(d.data).length)), 'bytes');
