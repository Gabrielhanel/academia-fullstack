// Abre cada URL citada nos cursos da C1 (GET real) e registra status e <title>. Uso: node seed/c2/refs-check.mjs [--md]
import { loadC2 } from './index.mjs';
import { writeFileSync, existsSync, readFileSync } from 'node:fs';
const cache = existsSync(new URL('./refs-cache.json', import.meta.url)) ? JSON.parse(readFileSync(new URL('./refs-cache.json', import.meta.url))) : {};
const all = await loadC2(); const urls = new Map();
for (const { W, file } of all) {
  const add = (r, where) => { if (r && r.url) { const e = urls.get(r.url) || { title: r.title, uses: [] }; e.uses.push(where); urls.set(r.url, e); } };
  W.lessons.forEach((l) => l.refs.forEach((r) => add(r, l.id)));
  (W.course.supplement.officialRefs || []).forEach((r) => add(r, W.course.id));
  (W.course.materials || []).forEach((r) => add(r, W.course.id));
}
const today = new Date().toISOString().slice(0, 10);
let bad = 0;
await Promise.all([...urls.keys()].map(async (u) => {
  if (cache[u] && cache[u].status === 200) return;
  try { const r = await fetch(u, { redirect: 'follow', headers: { 'user-agent': 'academia-v2-ref-check/1.0' }, signal: AbortSignal.timeout(25000) }); const t = r.ok ? ((await r.text()).match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] : ''; cache[u] = { status: r.status, page: (t || '').replace(/\s+/g, ' ').trim().slice(0, 110), final: r.url === u ? '' : r.url, at: today }; }
  catch (e) { cache[u] = { status: 0, error: String(e.message || e).slice(0, 80), at: today }; }
}));
for (const [u, e] of urls) { const c = cache[u]; if (c.status !== 200) { bad++; console.log('✖', c.status, u, c.error || ''); } }
writeFileSync(new URL('./refs-cache.json', import.meta.url), JSON.stringify(cache, null, 1));
console.log(`${urls.size} URLs; ${urls.size - bad} abertas com HTTP 200; ${bad} com problema`);
