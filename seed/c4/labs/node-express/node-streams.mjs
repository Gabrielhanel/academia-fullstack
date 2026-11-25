import os from 'node:os';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';
const fib = (n) => (n < 2 ? n : fib(n - 1) + fib(n - 2));
if (!isMainThread) { parentPort.postMessage(fib(workerData.n)); process.exit(0); }
const mb = (b) => (b / 1048576).toFixed(0);
console.log('Node', process.version, '| núcleos disponíveis:', os.availableParallelism());

console.log('\n== G. fib(40) x 4: sequencial x worker threads');
let t0 = performance.now(); for (let i = 0; i < 4; i++) fib(40); const seq = performance.now() - t0;
t0 = performance.now();
await Promise.all(Array.from({ length: 4 }, () => new Promise((ok, no) => { const w = new Worker(fileURLToPath(import.meta.url), { workerData: { n: 40 } }); w.once('message', ok); w.once('error', no); })));
const par = performance.now() - t0;
console.log('sequencial:', seq.toFixed(0), 'ms | 4 workers:', par.toFixed(0), 'ms | ganho:', (seq / par).toFixed(1) + 'x');
