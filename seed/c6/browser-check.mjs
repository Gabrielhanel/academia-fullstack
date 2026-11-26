// Executa TODOS os desafios "code" da C6 em um Web Worker de um navegador real (Chrome), do mesmo modo que o laboratório do app
// (Blob + Worker + E.buildTestSource, tempo limite de 6 s). Confere: a solução passa em todos os testes e o código inicial não passa em todos.
// Uso: node seed/c6/browser-check.mjs   (requer puppeteer-core e Google Chrome; veja labs/README.md)
import { createRequire } from 'node:module';
import { loadC6 } from './index.mjs';
const require = createRequire(import.meta.url);
const E = require('../../src/engine.js');
const { default: puppeteer } = await import(process.env.PUPPETEER_PATH || 'puppeteer-core');
const jobs = [];
for (const { file, W } of await loadC6()) for (const set of Object.values(W.exsets)) for (const x of set.items) if (x.type === 'code') {
  jobs.push({ file, id: x.id, tipo: 'solução', src: E.buildTestSource(x.solution, x.tests), esperado: 'todos passam' });
  jobs.push({ file, id: x.id, tipo: 'inicial', src: E.buildTestSource(x.starter, x.tests), esperado: 'algum falha' });
}
const b = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
const p = await b.newPage();
await p.goto(process.env.PAGE_URL || 'http://127.0.0.1:8765/manifest2.html');
const results = await p.evaluate(async (jobs) => {
  const run = (src, ms) => new Promise((res) => {
    const w = new Worker(URL.createObjectURL(new Blob([src], { type: 'text/javascript' })));
    const t = setTimeout(() => { w.terminate(); res({ error: 'timeout' }); }, ms);
    w.onmessage = (e) => { clearTimeout(t); w.terminate(); res(e.data); };
    w.onerror = (e) => { clearTimeout(t); w.terminate(); res({ error: 'erro: ' + e.message }); };
  });
  const out = [];
  for (const j of jobs) { const r = await run(j.src, 6000); out.push({ id: j.id, tipo: j.tipo, file: j.file, r }); }
  return out;
}, jobs);
console.log(await b.version());
let falhas = 0; const porCurso = {};
for (const x of results) {
  const res = x.r.res || []; const ok = res.length > 0 && res.every((t) => t.ok);
  const bom = x.tipo === 'solução' ? ok : !ok;
  porCurso[x.file] = porCurso[x.file] || { 'soluções': 0, 'iniciais': 0 }; if (bom) porCurso[x.file][x.tipo === 'solução' ? 'soluções' : 'iniciais']++;
  if (!bom) { falhas++; console.log('✖', x.id, x.tipo, x.r.error || JSON.stringify(res.filter((t) => !t.ok).slice(0, 2))); }
}
console.log(porCurso);
console.log(falhas ? 'FALHAS: ' + falhas : 'OK: ' + results.length / 2 + ' desafios; todas as soluções passam e nenhum código inicial passa em todos os testes (Worker no Chrome)');
await b.close();
process.exit(falhas ? 1 : 0);
