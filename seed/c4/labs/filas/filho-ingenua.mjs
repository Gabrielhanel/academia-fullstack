
import Redis from 'ioredis'; const r = new Redis({ host: '127.0.0.1', port: 57379 });
const modo = "ingenua";
for (let i = 0; i < 6; i++) {
  const job = modo === 'ingenua' ? (await r.brpop('fila', 1))?.[1] : await r.blmove('fila', 'processando', 'RIGHT', 'LEFT', 1);
  if (!job) break;
  if (i === 2) process.exit(1);                         // o trabalhador cai no meio do 3º job (depois de retirá-lo da fila)
  await r.lpush('feitos', job); if (modo === 'confiavel') await r.lrem('processando', 1, job);
}
process.exit(0);