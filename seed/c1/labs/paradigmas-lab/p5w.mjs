import { workerData } from 'node:worker_threads';
const a = new Int32Array(workerData.sab);
for (let i = 0; i < 100000; i++) { if (workerData.modo === 'atomic') Atomics.add(a, 0, 1); else a[0] = a[0] + 1; }
