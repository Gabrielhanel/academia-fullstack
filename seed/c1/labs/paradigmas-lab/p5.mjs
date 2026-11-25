import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { setTimeout as sleep } from 'node:timers/promises';
if (isMainThread) {
  // 1) concorrência com E/S: 3 esperas de 200 ms em ~200 ms
  let t = performance.now();
  await Promise.all([sleep(200), sleep(200), sleep(200)]);
  console.log('concorrente', Math.round((performance.now() - t) / 100) * 100, 'ms');
  t = performance.now();
  for (let i = 0; i < 3; i++) await sleep(200);
  console.log('sequencial', Math.round((performance.now() - t) / 100) * 100, 'ms');
  // 2) paralelismo real: Worker faz trabalho de CPU
  const cpu = (n) => { let s = 0; for (let i = 0; i < n; i++) s += i % 7; return s; };
  const N = 3e8;
  t = performance.now(); cpu(N); const um = performance.now() - t;
  t = performance.now();
  const rs = await Promise.all([1, 2].map(() => new Promise((res) => { const w = new Worker(new URL(import.meta.url), { workerData: N }); w.on('message', res); })));
  const dois = performance.now() - t;
  console.log('resultados iguais:', rs[0] === rs[1] && rs[0] === cpu(N));
  console.log('2 workers em paralelo levam menos que 2x uma execução:', dois < um * 1.8);
  // 3) corrida de dados com memória compartilhada
  const sab = new SharedArrayBuffer(4); const arr = new Int32Array(sab);
  const rodar = (modo) => Promise.all([1, 2, 3, 4].map(() => new Promise((res) => { const w = new Worker(new URL('./p5w.mjs', import.meta.url), { workerData: { sab, modo } }); w.on('exit', res); })));
  await rodar('naive'); const naive = arr[0]; arr[0] = 0; await rodar('atomic');
  console.log('esperado 400000; sem atomics:', naive < 400000 ? 'perdeu atualizações' : 'por sorte correto', '; com atomics:', arr[0]);
} else {
  const n = workerData; let s = 0; for (let i = 0; i < n; i++) s += i % 7; parentPort.postMessage(s);
}
