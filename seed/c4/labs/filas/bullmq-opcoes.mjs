import { Queue, Worker, QueueEvents } from 'bullmq';
import Redis from 'ioredis';
const conn = { host: '127.0.0.1', port: 57379 };
const sleep = (ms) => new Promise((x) => setTimeout(x, ms));
const limpa = async (nome) => { const q = new Queue(nome, { connection: conn }); await q.obliterate({ force: true }); return q; };
console.log('BullMQ 6.7.10 | Redis 8.12.0');

console.log('\n== 1. concorrência: 100 jobs de 50 ms');
for (const c of [1, 5, 20]) {
  const q = await limpa('conc' + c); let feitos = 0;
  const w = new Worker('conc' + c, async () => { await sleep(50); feitos++; }, { connection: conn, concurrency: c });
  await w.waitUntilReady(); const t0 = performance.now();
  await q.addBulk(Array.from({ length: 100 }, (_, i) => ({ name: 'j', data: { i } })));
  while (feitos < 100) await sleep(10);
  console.log('concurrency', String(c).padStart(2), '| tempo total', (performance.now() - t0).toFixed(0), 'ms | vazão', (100 / ((performance.now() - t0) / 1000)).toFixed(0), 'jobs/s');
  await w.close(); await q.obliterate({ force: true }); await q.close();
}

console.log('\n== 2. prioridade (menor número = mais urgente) e ordem FIFO');
{
  const q = await limpa('prio'); const ordem = [];
  await q.add('baixa', { n: 1 }, { priority: 10 }); await q.add('normal-a', { n: 2 }); await q.add('alta', { n: 3 }, { priority: 1 }); await q.add('normal-b', { n: 4 }); await q.add('media', { n: 5 }, { priority: 5 });
  const w = new Worker('prio', async (job) => { ordem.push(job.name); }, { connection: conn, concurrency: 1 });
  while (ordem.length < 5) await sleep(20);
  console.log('ordem de execução:', ordem.join(' → ')); await w.close(); await q.obliterate({ force: true }); await q.close();
}

console.log('\n== 3. job com atraso (delay) e job repetido');
{
  const q = await limpa('atraso'); const t0 = performance.now(); const quando = {};
  const w = new Worker('atraso', async (job) => { quando[job.name] = (performance.now() - t0).toFixed(0); }, { connection: conn });
  await q.add('agora', {}); await q.add('em-500ms', {}, { delay: 500 });
  await sleep(900); console.log('executado aos (ms):', JSON.stringify(quando)); await w.close(); await q.obliterate({ force: true }); await q.close();
  const qr = await limpa('repete'); let n = 0; const tempos = [];
  const w2 = new Worker('repete', async () => { n++; tempos.push(Math.round(performance.now() - t0)); }, { connection: conn });
  const t1 = performance.now(); await qr.upsertJobScheduler('a-cada-200ms', { every: 200 }, { name: 'tique', data: {} });
  await sleep(1100); console.log('agendador a cada 200 ms durante ~1,1 s: execuções =', n);
  await w2.close(); await qr.obliterate({ force: true }); await qr.close();
}

console.log('\n== 4. limitador de taxa do worker (5 jobs por segundo)');
{
  const q = await limpa('lim'); let feitos = 0; const w = new Worker('lim', async () => { feitos++; }, { connection: conn, concurrency: 10, limiter: { max: 5, duration: 1000 } });
  await w.waitUntilReady(); const t0 = performance.now(); await q.addBulk(Array.from({ length: 15 }, () => ({ name: 'j', data: {} })));
  while (feitos < 15) await sleep(20); console.log('15 jobs com limite de 5/s levaram', (performance.now() - t0).toFixed(0), 'ms (sem limite seriam centenas de ms)');
  await w.close(); await q.obliterate({ force: true }); await q.close();
}

console.log('\n== 5. retenção: removeOnComplete e memória no Redis');
{
  const r = new Redis(conn);
  for (const [rotulo, opts] of [['guardar todos', {}], ['removeOnComplete: true', { removeOnComplete: true }], ['manter os últimos 10', { removeOnComplete: { count: 10 } }]]) {
    const q = await limpa('ret'); let feitos = 0; await r.flushall();
    const w = new Worker('ret', async () => { feitos++; }, { connection: conn, concurrency: 20 });
    await w.waitUntilReady(); await q.addBulk(Array.from({ length: 2000 }, (_, i) => ({ name: 'j', data: { i, texto: 'x'.repeat(200) }, opts })));
    while (feitos < 2000) await sleep(20); await sleep(200);
    const mem = /used_memory:(\d+)/.exec(await r.info('memory'))[1]; const chaves = await r.dbsize();
    console.log(rotulo.padEnd(26), '| chaves no Redis:', String(chaves).padStart(5), '| concluídos guardados:', (await q.getJobCounts('completed')).completed, '| used_memory:', (mem / 1048576).toFixed(1), 'MiB');
    await w.close(); await q.obliterate({ force: true }); await q.close();
  }
  await r.quit();
}
process.exit(0);
