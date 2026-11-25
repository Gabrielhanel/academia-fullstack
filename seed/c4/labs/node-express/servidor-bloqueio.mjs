import express from 'express';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { monitorEventLoopDelay } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
if (!isMainThread) { const t = Date.now(); while (Date.now() - t < workerData.ms) {} parentPort.postMessage(workerData.ms); process.exit(0); }
const app = express();
const h = monitorEventLoopDelay({ resolution: 10 }); h.enable();
app.get('/rapida', (req, res) => res.json({ ok: true }));
app.get('/bloqueia', (req, res) => { const t = Date.now(); while (Date.now() - t < 600) {} res.json({ ok: true }); });
app.get('/worker', async (req, res) => {
  await new Promise((ok, no) => { const w = new Worker(fileURLToPath(import.meta.url), { workerData: { ms: 600 } }); w.once('message', ok); w.once('error', no); });
  res.json({ ok: true });
});
app.get('/atraso', (req, res) => { const max = h.max / 1e6; h.reset(); res.json({ maxMs: Math.round(max) }); });
const srv = app.listen(0, '127.0.0.1', () => process.send({ port: srv.address().port }));
