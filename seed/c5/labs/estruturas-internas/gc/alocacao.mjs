// Mede coletas do V8 com PerformanceObserver. Uso: node --expose-gc gc/alocacao.mjs [curto|retido]
import { PerformanceObserver, constants } from 'node:perf_hooks';
const modo = process.argv[2] || 'curto';
const tipos = { [constants.NODE_PERFORMANCE_GC_MINOR]: 'menor (Scavenge)', [constants.NODE_PERFORMANCE_GC_MAJOR]: 'maior (Mark-Compact)', [constants.NODE_PERFORMANCE_GC_INCREMENTAL]: 'incremental', [constants.NODE_PERFORMANCE_GC_WEAKCB]: 'weak callbacks' };
const cont = {}; let pausaTotal = 0;
const obs = new PerformanceObserver((lista) => { for (const e of lista.getEntries()) { const k = tipos[e.detail.kind] || String(e.detail.kind); cont[k] = (cont[k] || 0) + 1; pausaTotal += e.duration; } });
obs.observe({ entryTypes: ['gc'] });
const MB = (n) => (n / 1048576).toFixed(1);
global.gc(); const h0 = process.memoryUsage().heapUsed; const t0 = performance.now();
const retidos = [];
for (let i = 0; i < 3e6; i++) {
  const o = { id: i, nome: 'item-' + i, dados: [i, i + 1, i + 2] };       // ~100 bytes por objeto
  if (modo === 'retido' && i % 3 === 0) retidos.push(o);               // 1/3 dos objetos sobrevive
}
const ms = performance.now() - t0; const pico = process.memoryUsage().heapUsed;
await new Promise((r) => setTimeout(r, 100));
console.log('modo', modo, '| 3 milhões de objetos em', ms.toFixed(0), 'ms | heap antes', MB(h0), 'MB, depois', MB(pico), 'MB');
console.log('coletas:', JSON.stringify(cont), '| pausa total', pausaTotal.toFixed(1), 'ms | objetos retidos:', retidos.length);
