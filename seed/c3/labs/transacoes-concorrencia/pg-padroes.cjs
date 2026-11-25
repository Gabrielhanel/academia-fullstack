// Padrões de aplicação: savepoints, laço de nova tentativa, travas consultivas e observação de locks.
const { Client } = require('pg');
const cfg = { host: '127.0.0.1', port: 55432, user: 'postgres', password: 'lab', database: 'postgres' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const saida = [];
const log = (...a) => { const t = a.join(' '); saida.push(t); console.log(t); };
const sess = async () => { const c = new Client(cfg); await c.connect(); return c; };
const q = async (c, sql, p) => { try { return (await c.query(sql, p)).rows; } catch (e) { return { erro: e.code + ' ' + e.message.split('\n')[0] }; } };
(async () => {
  const admin = await sess();
  log('synchronous_commit =', (await q(admin, 'SHOW synchronous_commit'))[0].synchronous_commit, '| fsync =', (await q(admin, 'SHOW fsync'))[0].fsync, '| wal_level =', (await q(admin, 'SHOW wal_level'))[0].wal_level);
  await admin.query('DROP SCHEMA IF EXISTS tx2 CASCADE; CREATE SCHEMA tx2; CREATE TABLE tx2.contas (id int PRIMARY KEY, saldo numeric(10,2) NOT NULL CHECK (saldo >= 0)); INSERT INTO tx2.contas VALUES (1, 100)');

  log('\n== savepoints: desfazer só uma parte');
  const a = await sess();
  await a.query('BEGIN');
  await a.query('UPDATE tx2.contas SET saldo = saldo + 10 WHERE id = 1');
  await a.query('SAVEPOINT sp1');
  log('erro dentro do savepoint:', JSON.stringify(await q(a, 'UPDATE tx2.contas SET saldo = saldo - 500 WHERE id = 1')));
  await a.query('ROLLBACK TO SAVEPOINT sp1');
  await a.query('UPDATE tx2.contas SET saldo = saldo + 5 WHERE id = 1');
  await a.query('COMMIT');
  log('saldo final (100 + 10 + 5):', (await q(admin, 'SELECT saldo FROM tx2.contas WHERE id = 1'))[0].saldo);
  await a.end();

  log('\n== laço de nova tentativa sob REPEATABLE READ (10 trabalhadores somando 10)');
  await admin.query('UPDATE tx2.contas SET saldo = 100 WHERE id = 1');
  let tentativasTotais = 0, falhas = 0;
  async function trabalhador() {
    const c = await sess();
    for (let tent = 1; tent <= 50; tent++) {
      tentativasTotais++;
      try {
        await c.query('BEGIN ISOLATION LEVEL REPEATABLE READ');
        const s = Number((await c.query('SELECT saldo FROM tx2.contas WHERE id = 1')).rows[0].saldo);
        await sleep(20);
        await c.query('UPDATE tx2.contas SET saldo = $1 WHERE id = 1', [s + 10]);
        await c.query('COMMIT');
        await c.end();
        return;
      } catch (e) {
        await c.query('ROLLBACK').catch(() => {});
        if (e.code !== '40001' && e.code !== '40P01') throw e;
        falhas++;
        await sleep(5 + Math.random() * 20);
      }
    }
    await c.end();
    throw new Error('desistiu');
  }
  await Promise.all(Array.from({ length: 10 }, trabalhador));
  log('saldo final esperado 200 →', (await q(admin, 'SELECT saldo FROM tx2.contas WHERE id = 1'))[0].saldo, '| tentativas totais:', tentativasTotais, '| falhas 40001 repetidas:', falhas);

  log('\n== sem nova tentativa: os mesmos 10 trabalhadores, falhas descartadas');
  await admin.query('UPDATE tx2.contas SET saldo = 100 WHERE id = 1');
  let ok = 0, perdidas = 0;
  await Promise.all(Array.from({ length: 10 }, async () => {
    const c = await sess();
    try {
      await c.query('BEGIN ISOLATION LEVEL REPEATABLE READ');
      const s = Number((await c.query('SELECT saldo FROM tx2.contas WHERE id = 1')).rows[0].saldo);
      await sleep(20);
      await c.query('UPDATE tx2.contas SET saldo = $1 WHERE id = 1', [s + 10]);
      await c.query('COMMIT'); ok++;
    } catch (e) { await c.query('ROLLBACK').catch(() => {}); perdidas++; }
    await c.end();
  }));
  log('confirmadas:', ok, '| falharam (40001):', perdidas, '| saldo final:', (await q(admin, 'SELECT saldo FROM tx2.contas WHERE id = 1'))[0].saldo);

  log('\n== trava consultiva (advisory lock)');
  const x = await sess(), y = await sess();
  log('X pega a trava 42:', (await q(x, 'SELECT pg_try_advisory_lock(42) AS ok'))[0].ok);
  log('Y tenta a trava 42:', (await q(y, 'SELECT pg_try_advisory_lock(42) AS ok'))[0].ok);
  await q(x, 'SELECT pg_advisory_unlock(42)');
  log('depois de X liberar, Y tenta:', (await q(y, 'SELECT pg_try_advisory_lock(42) AS ok'))[0].ok);
  await q(y, 'SELECT pg_advisory_unlock(42)');

  log('\n== observando travas: pg_locks e quem bloqueia quem');
  await x.query('BEGIN'); await x.query('UPDATE tx2.contas SET saldo = saldo + 1 WHERE id = 1');
  await y.query("SET lock_timeout = '2s'"); const pY = q(y, 'UPDATE tx2.contas SET saldo = saldo + 1 WHERE id = 1');
  await sleep(300);
  const bloq = await q(admin, "SELECT count(*)::int AS esperando FROM pg_stat_activity WHERE wait_event_type = 'Lock' AND datname = 'postgres'");
  log('sessões esperando por trava (wait_event_type = Lock):', bloq[0].esperando);
  const quem = await q(admin, "SELECT array_length(pg_blocking_pids(pid), 1) AS bloqueadores FROM pg_stat_activity WHERE wait_event_type = 'Lock' AND datname = 'postgres'");
  log('bloqueadores por sessão em espera:', JSON.stringify(quem));
  await x.query('ROLLBACK'); log('Y depois que X desfez:', JSON.stringify(await pY));
  await x.end(); await y.end();

  log('\n== transações longas seguram a limpeza do VACUUM');
  await admin.query('DROP TABLE IF EXISTS tx2.v; CREATE TABLE tx2.v (id int PRIMARY KEY, x int); INSERT INTO tx2.v SELECT g, 0 FROM generate_series(1, 50000) g');
  const longa = await sess(); await longa.query('BEGIN ISOLATION LEVEL REPEATABLE READ'); await longa.query('SELECT count(*) FROM tx2.v');
  await admin.query('UPDATE tx2.v SET x = 1');
  await admin.query('VACUUM tx2.v');
  log('com transação longa aberta, após UPDATE e VACUUM: mortas =', (await q(admin, "SELECT n_dead_tup FROM pg_stat_user_tables WHERE relname = 'v' AND schemaname = 'tx2'"))[0].n_dead_tup);
  await longa.query('COMMIT'); await longa.end();
  await admin.query('VACUUM tx2.v');
  log('depois que a transação longa terminou e novo VACUUM: mortas =', (await q(admin, "SELECT n_dead_tup FROM pg_stat_user_tables WHERE relname = 'v' AND schemaname = 'tx2'"))[0].n_dead_tup);
  await admin.end();
  require('fs').writeFileSync(__dirname + '/saida-pg-padroes.txt', saida.join('\n') + '\n');
  process.exit(0);
})().catch((e) => { console.error('FALHA', e); process.exit(1); });
