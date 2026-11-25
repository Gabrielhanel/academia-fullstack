// Utilidades comuns dos relatórios do preview. Somente leitura sobre seed/ e preview/dist/; escreve só em preview/state/.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const ROOT = fileURLToPath(new URL('../', import.meta.url));
export const REPORTS = ROOT + 'preview/state/reports/';
export const today = () => new Date().toISOString().slice(0, 10);

export function loadPack() {
  const p = ROOT + 'preview/dist/seed-docs.json';
  if (!existsSync(p)) throw new Error('pacote ausente: rode antes  node preview/build-preview.mjs');
  const docs = JSON.parse(readFileSync(p, 'utf8'));
  const by = (pre) => docs.filter((d) => d.path.startsWith(pre)).map((d) => d.data);
  return { docs, courses: by('kb_courses/'), lessons: by('kb_lessons/'), radar: by('kb_radar/') };
}

export const cell = (s) => String(s == null ? '' : s).replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();
export const table = (head, rows) => '| ' + head.join(' | ') + ' |\n|' + head.map(() => '---').join('|') + '|\n' + rows.map((r) => '| ' + r.map(cell).join(' | ') + ' |').join('\n') + '\n';

export function writeReport(name, md, json) {
  mkdirSync(REPORTS, { recursive: true });
  writeFileSync(REPORTS + name + '.md', md);
  writeFileSync(REPORTS + name + '.json', JSON.stringify(json, null, 1) + '\n');
}

/* Executa tarefas assíncronas com concorrência limitada. */
export async function pool(items, n, fn) {
  const out = new Array(items.length); let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k], k); } }));
  return out;
}

/* semver mínimo: '1.2.3' → [1,2,3]; undefined se não for numérico. */
export const parseVer = (s) => { const m = /^(\d+)(?:\.(\d+))?(?:\.(\d+))?$/.exec(String(s).trim()); return m ? [Number(m[1]), Number(m[2] || 0), Number(m[3] || 0)] : null; };
export const cmpVer = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
