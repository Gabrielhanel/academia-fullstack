import { Queue, Worker, QueueEvents } from 'bullmq';
const conn = { host: '127.0.0.1', port: 57379 };
const sleep = (ms) => new Promise((x) => setTimeout(x, ms));
const limpa = async (nome) => { const q = new Queue(nome, { connection: conn }); await q.obliterate({ force: true }); return q; };
console.log('BullMQ 6.7.10 | Redis 8.12.0');

console.log('== 1. intervalos entre tentativas: fixo x exponencial (attempts 5, delay 100 ms; o job falha 4 vezes e conclui na 5ª)');
for (const backoff of [{ type: 'fixed', delay: 100 }, { type: 'exponential', delay: 100 }]) {
  const nome = 'bk-' + backoff.type; const q = await limpa(nome); const marcas = [];
  const w = new Worker(nome, async (job) => { marcas.push(performance.now()); if (job.attemptsMade < 4) throw new Error('falha ' + (job.attemptsMade + 1)); return 'ok'; }, { connection: conn });
  await w.waitUntilReady(); await q.add('j', {}, { attempts: 5, backoff });
  while (marcas.length < 5) await sleep(20); await sleep(100);
  console.log(backoff.type.padEnd(12), 'intervalos entre tentativas (ms):', marcas.slice(1).map((m, i) => Math.round(m - marcas[i])).join(', '));
  await w.close(); await q.obliterate({ force: true }); await q.close();
}

console.log('\n== 2. backoff com jitter personalizado (strategy do worker)');
{
  const q = await limpa('jit'); const marcas = []; const atrasos = [];
  const w = new Worker('jit', async (job) => { marcas.push(performance.now()); throw new Error('sempre falha'); }, { connection: conn, settings: { backoffStrategy: (n) => { const base = 100 * 2 ** (n - 1); const atraso = Math.round(base / 2 + Math.random() * base / 2); atrasos.push(atraso); return atraso; } } });
  await w.waitUntilReady(); const job = await q.add('j', {}, { attempts: 4, backoff: { type: 'custom' } });
  while ((await job.getState()) !== 'failed') await sleep(50);
  console.log('atrasos sorteados (metade da base + aleatório até a base):', atrasos.join(', '), '| tentativas feitas:', marcas.length, '| estado final:', await job.getState());
  await w.close(); await q.obliterate({ force: true }); await q.close();
}

console.log('\n== 3. mensagem venenosa e fila de mensagens mortas (DLQ)');
{
  const q = await limpa('pedidos'), dlq = await limpa('pedidos-dlq'); const processadas = [];
  const w = new Worker('pedidos', async (job) => { if (job.data.corrompido) throw new Error('payload inválido'); processadas.push(job.data.id); }, { connection: conn, concurrency: 2 });
  w.on('failed', async (job, err) => { if (job && job.attemptsMade >= (job.opts.attempts ?? 1)) await dlq.add('morto', { origem: job.queueName, id: job.id, dados: job.data, motivo: err.message, tentativas: job.attemptsMade }); });
  await w.waitUntilReady();
  const opts = { attempts: 3, backoff: { type: 'fixed', delay: 50 }, removeOnFail: false };
  await q.add('p', { id: 1 }, opts); await q.add('p', { id: 2, corrompido: true }, opts); await q.add('p', { id: 3 }, opts); await q.add('p', { id: 4, corrompido: true }, opts); await q.add('p', { id: 5 }, opts);
  await sleep(1200);
  console.log('processados com sucesso:', processadas.sort().join(','), '| falharam na fila principal:', (await q.getJobCounts('failed')).failed, '| na DLQ:', (await dlq.getJobCounts('waiting')).waiting);
  const mortos = await dlq.getJobs(['waiting']); console.log('conteúdo da DLQ:', mortos.map((m) => JSON.stringify({ id: m.data.dados.id, motivo: m.data.motivo, tentativas: m.data.tentativas })).sort().join(' | '));
  const reprocessados = []; const w2 = new Worker('pedidos-dlq', async (job) => { reprocessados.push(job.data.dados.id); }, { connection: conn });
  await sleep(300); console.log('depois de corrigir o problema, a DLQ foi reprocessada:', reprocessados.sort().join(','));
  await w.close(); await w2.close(); await q.obliterate({ force: true }); await dlq.obliterate({ force: true }); await q.close(); await dlq.close();
}

console.log('\n== 4. job travado (stalled): o trabalhador bloqueia o event loop e perde a trava');
{
  const q = await limpa('stall'); let execucoes = 0; const eventos = new QueueEvents('stall', { connection: conn }); await eventos.waitUntilReady(); const stalled = []; eventos.on('stalled', ({ jobId }) => stalled.push(jobId));
  const w = new Worker('stall', async (job) => { execucoes++; if (execucoes === 1) { const t = Date.now(); while (Date.now() - t < 2500) {} } return 'ok'; }, { connection: conn, lockDuration: 500, stalledInterval: 500, maxStalledCount: 1 });
  const errosWorker = []; w.on('error', (e) => errosWorker.push(e.message));
  await w.waitUntilReady(); const job = await q.add('j', {}, {});
  await sleep(5000);
  console.log('execuções do mesmo job:', execucoes, '| evento stalled:', stalled.length, '| estado final:', await job.getState(), '| erros do worker:', [...new Set(errosWorker)].join(' / '), '(laço síncrono de 2,5 s com lockDuration 500 ms: a trava expirou, o job foi reentregue e a primeira execução não conseguiu finalizar)');
  await w.close(); await eventos.close(); await q.obliterate({ force: true }); await q.close();
}

console.log('\n== 5. idempotência do processador: o mesmo job executado duas vezes, um único efeito');
{
  const efeitos = new Map(); const efetuar = (chave) => { if (efeitos.has(chave)) return 'ignorado'; efeitos.set(chave, true); return 'aplicado'; };
  const q = await limpa('idem'); const log = [];
  const w = new Worker('idem', async (job) => { log.push(efetuar(job.data.chave)); }, { connection: conn });
  await w.waitUntilReady(); await q.add('j', { chave: 'pedido-7:email-confirmacao' }); await q.add('j', { chave: 'pedido-7:email-confirmacao' });
  await sleep(500); console.log('duas entregas do mesmo trabalho:', log.join(', '), '| efeitos distintos:', efeitos.size);
  await w.close(); await q.obliterate({ force: true }); await q.close();
}
process.exit(0);
