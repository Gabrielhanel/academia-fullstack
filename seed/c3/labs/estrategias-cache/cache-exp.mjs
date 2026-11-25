import Redis from 'ioredis';
import pg from 'pg';
const r = new Redis({ host: '127.0.0.1', port: 56379 });
const pub = new Redis({ host: '127.0.0.1', port: 56379 });
const sub = new Redis({ host: '127.0.0.1', port: 56379 });
const pool = new pg.Pool({ host: '127.0.0.1', port: 55432, user: 'postgres', password: 'lab', database: 'cachelab', max: 20 });
const sleep = (ms) => new Promise((x) => setTimeout(x, ms));
const med = async (rotulo, fn, reps = 7) => { await fn(); const t = []; for (let i = 0; i < reps; i++) { const t0 = performance.now(); await fn(); t.push(performance.now() - t0); } t.sort((a, b) => a - b); const m = t[Math.floor(reps / 2)]; console.log(rotulo.padEnd(64), 'mediana ms:', m.toFixed(3)); return m; };
let dbCalls = 0;
const q = async (sql, p) => { dbCalls++; return pool.query(sql, p); };
const ver = (await pool.query('select version()')).rows[0].version.split(' ').slice(0, 2).join(' ');
console.log(ver, '| Redis', /redis_version:(\S+)/.exec(await r.info('server'))[1]);
await r.flushall();

console.log('\n== preparação: 500.000 produtos');
await pool.query('drop table if exists produtos');
await pool.query('create table produtos (id int primary key, nome text not null, categoria int not null, preco numeric(10,2) not null)');
await pool.query("insert into produtos select g, 'produto ' || g, g % 50, (g % 997) + 0.5 from generate_series(1, 500000) g");
await pool.query('analyze produtos');
console.log('linhas:', (await pool.query('select count(*)::int n from produtos')).rows[0].n);

const relatorio = async () => (await q('select categoria, count(*)::int n, round(avg(preco),2)::float media from produtos group by categoria order by categoria')).rows;
const porId = async (id) => (await q('select id, nome, categoria, preco::float preco from produtos where id = $1', [id])).rows[0];

console.log('\n== A. latência: banco x Redis x memória do processo');
const rel = await relatorio();
await r.set('rel', JSON.stringify(rel));
const local = new Map([['rel', rel]]);
const tBD = await med('relatório agregado no PostgreSQL (500 mil linhas)', relatorio);
const tR = await med('relatório lido do Redis (GET + JSON.parse)', async () => JSON.parse(await r.get('rel')));
const tM = await med('relatório lido de um Map no processo', async () => local.get('rel'), 7);
await r.set('p:1234', JSON.stringify(await porId(1234)));
const tBD2 = await med('produto por chave primária no PostgreSQL', () => porId(1234));
const tR2 = await med('produto por chave primária lido do Redis', async () => JSON.parse(await r.get('p:1234')));
console.log('ganho do Redis sobre o banco: relatório', (tBD / tR).toFixed(0) + 'x', '| produto por PK', (tBD2 / tR2).toFixed(1) + 'x');

console.log('\n== B. cache-aside com 10.000 leituras (80% nos 20% mais populares de 1.000 produtos)');
const rnd = (() => { let s = 42; return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296; })();
const ids = Array.from({ length: 10000 }, () => (rnd() < 0.8 ? 1 + Math.floor(rnd() * 200) : 201 + Math.floor(rnd() * 800)));
dbCalls = 0; let t0 = performance.now();
for (const id of ids) await porId(id);
const semCache = performance.now() - t0; const dbSem = dbCalls;
await r.flushall(); dbCalls = 0; let hits = 0; t0 = performance.now();
for (const id of ids) {
  const c = await r.get('p:' + id);
  if (c) { hits++; JSON.parse(c); } else { const row = await porId(id); await r.set('p:' + id, JSON.stringify(row), 'EX', 300); }
}
const comCache = performance.now() - t0;
console.log('sem cache: consultas ao banco', dbSem, '| tempo ms', semCache.toFixed(0));
console.log('cache-aside: consultas ao banco', dbCalls, '| acertos', hits, '| taxa de acerto', (hits / ids.length * 100).toFixed(1) + '%', '| tempo ms', comCache.toFixed(0));

console.log('\n== C. cache stampede: 50 requisições simultâneas na chave fria do relatório');
await r.del('rel'); dbCalls = 0;
const ingenuo = async () => { const c = await r.get('rel'); if (c) return JSON.parse(c); const v = await relatorio(); await r.set('rel', JSON.stringify(v), 'EX', 60); return v; };
t0 = performance.now(); await Promise.all(Array.from({ length: 50 }, ingenuo));
console.log('sem proteção: execuções do relatório no banco =', dbCalls, '| tempo total ms', (performance.now() - t0).toFixed(0));
await r.del('rel'); dbCalls = 0;
const voando = new Map();
const unico = async () => { const c = await r.get('rel'); if (c) return JSON.parse(c); if (!voando.has('rel')) voando.set('rel', (async () => { const v = await relatorio(); await r.set('rel', JSON.stringify(v), 'EX', 60); voando.delete('rel'); return v; })()); return voando.get('rel'); };
t0 = performance.now(); await Promise.all(Array.from({ length: 50 }, unico));
console.log('single-flight no processo: execuções =', dbCalls, '| tempo total ms', (performance.now() - t0).toFixed(0));
await r.del('rel'); await r.del('trava:rel'); dbCalls = 0;
const comTrava = async () => {
  for (let i = 0; i < 200; i++) {
    const c = await r.get('rel'); if (c) return JSON.parse(c);
    if (await r.set('trava:rel', '1', 'EX', 10, 'NX')) { try { const v = await relatorio(); await r.set('rel', JSON.stringify(v), 'EX', 60); return v; } finally { await r.del('trava:rel'); } }
    await sleep(20);
  }
  throw new Error('tempo esgotado');
};
t0 = performance.now(); await Promise.all(Array.from({ length: 50 }, comTrava));
console.log('trava distribuída (SET NX EX): execuções =', dbCalls, '| tempo total ms', (performance.now() - t0).toFixed(0));

console.log('\n== D. dados obsoletos e invalidação');
await r.flushall();
await r.set('p:7', JSON.stringify(await porId(7)), 'EX', 60);
await pool.query('update produtos set preco = 999 where id = 7');
console.log('depois do UPDATE, sem invalidar: cache mostra', JSON.parse(await r.get('p:7')).preco, '| banco tem', (await porId(7)).preco);
await r.del('p:7');
console.log('depois de DEL (invalidação na escrita): releitura pelo cache-aside traz', (await porId(7)).preco);
// corrida determinística: leitor lê o banco antigo, escritor atualiza e invalida, leitor grava o valor antigo
await r.flushall(); await pool.query('update produtos set preco = 10 where id = 8');
const leitorLeu = (await porId(8)).preco;
await pool.query('update produtos set preco = 20 where id = 8'); await r.del('p:8');
await r.set('p:8', JSON.stringify({ id: 8, preco: leitorLeu }), 'EX', 60);
console.log('corrida leitor x escritor: banco =', (await porId(8)).preco, '| cache =', JSON.parse(await r.get('p:8')).preco, '(obsoleto até o TTL de', await r.ttl('p:8'), 's)');
// write-through: escreve no banco e atualiza o cache
await pool.query('update produtos set preco = 30 where id = 8'); await r.set('p:8', JSON.stringify(await porId(8)), 'EX', 60);
console.log('write-through (banco e depois SET): cache =', JSON.parse(await r.get('p:8')).preco);

console.log('\n== E. avalanche: expiração simultânea x TTL com variação (jitter)');
const contar = async (prefixo, n) => { const maxPorJanela = []; let anterior = n; let max = 0; for (let i = 0; i < 25; i++) { await sleep(100); const p = r.pipeline(); for (let k = 0; k < n; k++) p.exists(prefixo + k); const vivos = (await p.exec()).reduce((a, [, v]) => a + v, 0); max = Math.max(max, anterior - vivos); anterior = vivos; } return max; };
{ const p = r.pipeline(); for (let k = 0; k < 1000; k++) p.set('a:' + k, 'x', 'PX', 1000); await p.exec(); }
const maxFixo = await contar('a:', 1000);
{ const p = r.pipeline(); for (let k = 0; k < 1000; k++) p.set('b:' + k, 'x', 'PX', 1000 + Math.floor(rnd() * 1000)); await p.exec(); }
const maxJitter = await contar('b:', 1000);
console.log('máximo de chaves que expiraram em uma janela de ~100 ms: TTL fixo =', maxFixo, '| TTL com variação =', maxJitter);

console.log('\n== F. cache negativo: 1.000 consultas a um id inexistente');
await r.flushall(); dbCalls = 0;
for (let i = 0; i < 1000; i++) await porId(-1);
const semNeg = dbCalls; dbCalls = 0;
for (let i = 0; i < 1000; i++) { const c = await r.get('p:-1'); if (c === null) { const row = await porId(-1); await r.set('p:-1', row ? JSON.stringify(row) : '__vazio__', 'EX', 30); } }
console.log('sem cache negativo: consultas ao banco =', semNeg, '| com cache negativo (TTL 30 s): consultas =', dbCalls);

console.log('\n== G. escrita: banco, write-through e write-behind (1.000 atualizações de preço)');
await r.flushall();
const upd = (i) => pool.query('update produtos set preco = $2 where id = $1', [1 + (i % 500), 100 + i]);
t0 = performance.now(); for (let i = 0; i < 1000; i++) await upd(i); const tBanco = performance.now() - t0;
t0 = performance.now(); for (let i = 0; i < 1000; i++) { await upd(i); await r.set('p:' + (1 + (i % 500)), JSON.stringify({ preco: 100 + i }), 'EX', 300); } const tWT = performance.now() - t0;
await r.del('fila:preco');
t0 = performance.now(); for (let i = 0; i < 1000; i++) { await r.set('p:' + (1 + (i % 500)), JSON.stringify({ preco: 200 + i }), 'EX', 300); await r.rpush('fila:preco', JSON.stringify([1 + (i % 500), 200 + i])); } const tWB = performance.now() - t0;
console.log('só banco ms:', tBanco.toFixed(0), '| write-through ms:', tWT.toFixed(0), '| write-behind (resposta ao cliente) ms:', tWB.toFixed(0));
const fila = (await r.lrange('fila:preco', 0, -1)).map((x) => JSON.parse(x));
t0 = performance.now();
const ultimo = new Map(fila); // a última escrita de cada id vence
await pool.query('update produtos p set preco = v.preco from (select unnest($1::int[]) id, unnest($2::numeric[]) preco) v where p.id = v.id', [[...ultimo.keys()], [...ultimo.values()]]);
console.log('descarga em lote do write-behind: itens na fila', fila.length, '| ids distintos', ultimo.size, '| 1 UPDATE em', (performance.now() - t0).toFixed(1), 'ms');
// simulação de perda: escritas só na fila, Redis esvaziado antes da descarga
await r.del('fila:preco'); await r.rpush('fila:preco', JSON.stringify([9, 5555])); await r.flushall();
console.log('simulação de perda (FLUSHALL antes da descarga): preço no banco do id 9 =', (await porId(9)).preco, '(a atualização 5555 foi perdida)');

console.log('\n== H. caches locais em duas instâncias e invalidação por pub/sub');
const mk = (nome) => ({ nome, c: new Map(), async ler(id) { if (this.c.has(id)) return this.c.get(id); const v = (await porId(id)).preco; this.c.set(id, v); return v; } });
const A = mk('A'), B = mk('B');
await pool.query('update produtos set preco = 1 where id = 11');
await A.ler(11); await B.ler(11);
await pool.query('update produtos set preco = 2 where id = 11'); A.c.delete(11);
console.log('A invalidou só a própria cópia: A lê', await A.ler(11), '| B lê', await B.ler(11), '(obsoleto)');
await sub.subscribe('invalida');
const recebido = new Promise((res) => sub.on('message', (_, m) => { B.c.delete(Number(m)); res(performance.now()); }));
const tEnvio = performance.now();
await pool.query('update produtos set preco = 3 where id = 11'); A.c.delete(11); await pub.publish('invalida', '11');
const tRec = await recebido;
console.log('com PUBLISH de invalidação: B lê', await B.ler(11), '| propagação ms', (tRec - tEnvio).toFixed(1));

console.log('\n== I. memória: 1.000 produtos em JSON x hash');
await r.flushall();
for (let i = 1; i <= 1000; i++) { const row = await porId(i); await r.set('j:' + i, JSON.stringify(row)); await r.hset('h:' + i, { id: row.id, nome: row.nome, categoria: row.categoria, preco: row.preco }); }
let mj = 0, mh = 0; for (let i = 1; i <= 1000; i++) { mj += await r.call('MEMORY', 'USAGE', 'j:' + i); mh += await r.call('MEMORY', 'USAGE', 'h:' + i); }
console.log('média por objeto: string JSON =', (mj / 1000).toFixed(0), 'B | hash =', (mh / 1000).toFixed(0), 'B');
await r.flushall();
await pub.quit(); await sub.quit(); await r.quit(); await pool.end();
