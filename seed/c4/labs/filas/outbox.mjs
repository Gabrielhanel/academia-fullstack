import pg from 'pg';
import { Queue, Worker } from 'bullmq';
const conn = { host: '127.0.0.1', port: 57379 };
const pool = new pg.Pool({ host: '127.0.0.1', port: 55433, user: 'postgres', password: 'lab', database: 'postgres', max: 6 });
const sleep = (ms) => new Promise((x) => setTimeout(x, ms));
console.log((await pool.query('select version()')).rows[0].version.split(' ').slice(0, 2).join(' '), '| BullMQ 6.7.10');
await pool.query('drop table if exists pedidos, outbox, processados cascade');
await pool.query('create table pedidos (id serial primary key, total numeric not null)');
await pool.query("create table outbox (id bigserial primary key, tipo text not null, payload jsonb not null, criado timestamptz default now(), publicado_em timestamptz)");
await pool.query('create table processados (msg_id text primary key)');
const fila = new Queue('eventos', { connection: conn }); await fila.obliterate({ force: true });

console.log('\n== 1. escrita dupla (banco e depois fila): falha entre os dois passos');
let falhaPublicar = false; const publicar = async (e) => { if (falhaPublicar) throw new Error('fila indisponível'); await fila.add(e.tipo, e.payload, { jobId: 'direto-' + e.payload.pedidoId }); };
let inconsistentes = 0;
for (let i = 1; i <= 20; i++) {
  falhaPublicar = i % 5 === 0;                                   // 4 de 20 pedidos: a fila falha DEPOIS do commit
  const { rows: [p] } = await pool.query('insert into pedidos (total) values ($1) returning id', [i * 10]);
  try { await publicar({ tipo: 'pedido.criado', payload: { pedidoId: p.id } }); } catch { inconsistentes++; }
}
console.log('pedidos gravados: 20 | eventos publicados:', (await fila.getJobCounts('waiting')).waiting, '| pedidos sem evento (inconsistência):', inconsistentes);
await fila.obliterate({ force: true }); await pool.query('truncate pedidos, outbox restart identity');

console.log('\n== 2. padrão outbox: pedido e evento na MESMA transação; um relay publica depois');
for (let i = 1; i <= 20; i++) { const c = await pool.connect(); try { await c.query('begin'); const { rows: [p] } = await c.query('insert into pedidos (total) values ($1) returning id', [i * 10]); await c.query("insert into outbox (tipo, payload) values ('pedido.criado', $1)", [{ pedidoId: p.id }]); await c.query('commit'); } finally { c.release(); } }
console.log('pedidos:', (await pool.query('select count(*)::int n from pedidos')).rows[0].n, '| linhas na outbox:', (await pool.query('select count(*)::int n from outbox')).rows[0].n, '(ambos gravados juntos)');
const c = await pool.connect(); try { await c.query('begin'); await c.query("insert into pedidos (total) values (999)"); await c.query("insert into outbox (tipo, payload) values ('pedido.criado', '{\"pedidoId\": 0}')"); await c.query('rollback'); } finally { c.release(); }
console.log('após um rollback: pedidos', (await pool.query('select count(*)::int n from pedidos')).rows[0].n, '| outbox', (await pool.query('select count(*)::int n from outbox')).rows[0].n, '(nada fica pela metade)');

console.log('\n== 3. relay (SKIP LOCKED) com falha entre publicar e marcar: entrega pelo menos uma vez');
let quebraUmaVez = true; let publicacoes = 0;
const relay = async (lote = 8) => {
  const cl = await pool.connect();
  try {
    await cl.query('begin');
    const { rows } = await cl.query('select id, tipo, payload from outbox where publicado_em is null order by id limit $1 for update skip locked', [lote]);
    for (const e of rows) { await fila.add(e.tipo, { ...e.payload, msgId: 'out-' + e.id }); publicacoes++; }
    if (rows.length && quebraUmaVez) { quebraUmaVez = false; throw new Error('o relay caiu depois de publicar e antes de marcar'); }
    if (rows.length) await cl.query('update outbox set publicado_em = now() where id = any($1)', [rows.map((r) => r.id)]);
    await cl.query('commit'); return rows.length;
  } catch (e) { await cl.query('rollback'); return -1; } finally { cl.release(); }
};
let n; let rodadas = 0; do { n = await relay(); rodadas++; } while (n !== 0 && rodadas < 10);
console.log('publicações na fila (com duplicatas):', publicacoes, '| outbox pendente:', (await pool.query('select count(*)::int n from outbox where publicado_em is null')).rows[0].n, '| rodadas do relay:', rodadas);

console.log('\n== 4. consumidor idempotente com tabela de mensagens processadas');
let efeitos = 0; const vistos = [];
const consumidor = new Worker('eventos', async (job) => {
  const r = await pool.query('insert into processados (msg_id) values ($1) on conflict do nothing', [job.data.msgId]);
  vistos.push(job.data.msgId);
  if (r.rowCount === 1) efeitos++;                                // o efeito só acontece na primeira vez
}, { connection: conn, concurrency: 4 });
await consumidor.waitUntilReady();
while ((await fila.getJobCounts('waiting', 'active')).waiting + (await fila.getJobCounts('active')).active > 0) await sleep(50); await sleep(200);
console.log('mensagens recebidas pelo consumidor:', vistos.length, '| msgIds distintos:', new Set(vistos).size, '| efeitos aplicados:', efeitos, '(os duplicados foram ignorados)');
await consumidor.close(); await fila.obliterate({ force: true }); await fila.close(); await pool.end(); process.exit(0);
