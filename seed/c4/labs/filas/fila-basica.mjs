import Redis from 'ioredis';
import { fork } from 'node:child_process';
import { writeFileSync } from 'node:fs';
const r = new Redis({ host: '127.0.0.1', port: 57379 });
const sleep = (ms) => new Promise((x) => setTimeout(x, ms));
console.log('Redis', /redis_version:(\S+)/.exec(await r.info('server'))[1]);
await r.flushall();
const filho = (modo) => `
import Redis from 'ioredis'; const r = new Redis({ host: '127.0.0.1', port: 57379 });
const modo = ${JSON.stringify(modo)};
for (let i = 0; i < 6; i++) {
  const job = modo === 'ingenua' ? (await r.brpop('fila', 1))?.[1] : await r.blmove('fila', 'processando', 'RIGHT', 'LEFT', 1);
  if (!job) break;
  if (i === 2) process.exit(1);                         // o trabalhador cai no meio do 3º job (depois de retirá-lo da fila)
  await r.lpush('feitos', job); if (modo === 'confiavel') await r.lrem('processando', 1, job);
}
process.exit(0);`;
const rodar = (modo) => new Promise((ok) => { const f = new URL('./filho-' + modo + '.mjs', import.meta.url).pathname; writeFileSync(f, filho(modo)); const p = fork(f, [], { cwd: process.cwd() }); p.on('exit', (c) => ok(c)); });
for (const modo of ['ingenua', 'confiavel']) {
  await r.flushall(); for (let i = 1; i <= 6; i++) await r.lpush('fila', 'job' + i);
  const codigo = await rodar(modo);
  const feitos = await r.llen('feitos'), naFila = await r.llen('fila'), emProc = await r.llen('processando');
  console.log((modo === 'ingenua' ? 'lista + BRPOP (ingênua)' : 'lista + BLMOVE para "processando"').padEnd(36), '| o trabalhador caiu (código', codigo + ') | concluídos:', feitos, '| ainda na fila:', naFila, '| presos em "processando":', emProc, '| perdidos:', 6 - feitos - naFila - emProc);
}
console.log('(com BLMOVE o job do trabalhador morto fica visível em "processando", mas ALGUÉM precisa devolvê-lo à fila: é o que o BullMQ faz com travas e detecção de jobs travados)');
await r.quit();
