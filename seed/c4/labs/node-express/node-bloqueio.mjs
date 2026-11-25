import { fork } from 'node:child_process';
const filho = fork(new URL('./servidor-bloqueio.mjs', import.meta.url));
const port = await new Promise((ok) => filho.once('message', (m) => ok(m.port)));
const base = 'http://127.0.0.1:' + port;
const get = async (p) => { const t0 = performance.now(); const r = await fetch(base + p); await r.text(); return performance.now() - t0; };
await get('/rapida'); await get('/worker'); await fetch(base + '/atraso').then((r) => r.json());
for (const rota of ['/bloqueia', '/worker']) {
  const p1 = get(rota);
  await new Promise((r) => setTimeout(r, 50));
  const rapida = await get('/rapida');
  const total = await p1;
  const { maxMs } = await (await fetch(base + '/atraso')).json();
  console.log(rota.padEnd(10), '| a requisição lenta levou', total.toFixed(0), 'ms | /rapida (enviada 50 ms depois, por outro processo) levou', rapida.toFixed(0), 'ms | atraso máximo do event loop do servidor', maxMs, 'ms');
}
filho.kill();
