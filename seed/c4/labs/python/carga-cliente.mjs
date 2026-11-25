// cliente de carga em Node (fora do processo Python): 200 requisições, 20 simultâneas
const base = 'http://127.0.0.1:59301';
const sleep = (ms) => new Promise((x) => setTimeout(x, ms));
for (let i = 0; i < 80; i++) { try { await fetch(base + '/openapi.json'); break; } catch { await sleep(250); } }
console.log('cliente de carga: Node', process.version, '(processo separado do servidor Python) | 200 requisições por rota, 20 simultâneas');
for (const rota of ['/espera/async-correta', '/espera/sync', '/espera/async-bloqueante']) {
  const lat = []; let i = 0; const t0 = performance.now();
  await Promise.all(Array.from({ length: 20 }, async () => { while (i++ < 200) { const t = performance.now(); const r = await fetch(base + rota); await r.text(); lat.push(performance.now() - t); } }));
  const total = (performance.now() - t0) / 1000; lat.sort((a, b) => a - b);
  console.log(rota.padEnd(26), 'tempo total', total.toFixed(2).padStart(6), 's |', (200 / total).toFixed(1).padStart(6), 'req/s | latência p50', lat[100].toFixed(0).padStart(5), 'ms | p95', lat[190].toFixed(0).padStart(5), 'ms');
}
const bloqueando = fetch(base + '/espera/async-bloqueante').then((r) => r.text()); await sleep(10);
const t = performance.now(); await (await fetch(base + '/busca?q=ab')).text(); console.log('/busca (instantânea) enquanto UMA rota async-bloqueante roda: levou', (performance.now() - t).toFixed(0), 'ms (sem bloqueio levaria ~2 ms)'); await bloqueando;
const t2 = performance.now(); await (await fetch(base + '/busca?q=ab')).text(); console.log('/busca com o servidor ocioso:', (performance.now() - t2).toFixed(0), 'ms');
