// Reservas sem corrida: verificar-e-inserir (com corrida) x restrição EXCLUDE x trava consultiva; idempotência.
const { Client } = require('pg');
const cfg = { host: '127.0.0.1', port: 55432, user: 'postgres', password: 'lab', database: 'postgres' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const saida = []; const log = (...a) => { const t = a.join(' '); saida.push(t); console.log(t); };
const sess = async () => { const c = new Client(cfg); await c.connect(); return c; };
(async () => {
  const admin = await sess();
  await admin.query(`DROP SCHEMA IF EXISTS rs CASCADE; CREATE SCHEMA rs; CREATE EXTENSION IF NOT EXISTS btree_gist;
    CREATE TABLE rs.reservas_ingenua (id serial PRIMARY KEY, sala int, quem int, periodo tstzrange);
    CREATE TABLE rs.reservas (id serial PRIMARY KEY, sala int NOT NULL, quem int, periodo tstzrange NOT NULL, EXCLUDE USING gist (sala WITH =, periodo WITH &&));
    CREATE TABLE rs.pagamentos (chave_idempotencia text PRIMARY KEY, valor numeric(10,2) NOT NULL, criado timestamptz DEFAULT now());`);
  const N = 20;
  const periodo = "[2026-03-01 10:00,2026-03-01 11:00)";
  // 1) verificar e inserir (ingênuo)
  let ok1 = 0;
  await Promise.all(Array.from({ length: N }, async (_, i) => {
    const c = await sess();
    await c.query('BEGIN');
    const { rows } = await c.query("SELECT count(*)::int AS n FROM rs.reservas_ingenua WHERE sala = 1 AND periodo && $1::tstzrange", [periodo]);
    await sleep(30);
    if (rows[0].n === 0) { await c.query('INSERT INTO rs.reservas_ingenua (sala, quem, periodo) VALUES (1, $1, $2::tstzrange)', [i, periodo]); ok1++; }
    await c.query('COMMIT'); await c.end();
  }));
  log('verificar-e-inserir (' + N + ' tentativas simultâneas, READ COMMITTED): reservas gravadas =', (await admin.query('SELECT count(*)::int AS n FROM rs.reservas_ingenua')).rows[0].n);
  // 2) restrição EXCLUDE
  let ok2 = 0, rec2 = 0;
  await Promise.all(Array.from({ length: N }, async (_, i) => {
    const c = await sess();
    try { await c.query('INSERT INTO rs.reservas (sala, quem, periodo) VALUES (1, $1, $2::tstzrange)', [i, periodo]); ok2++; }
    catch (e) { rec2++; if (rec2 === 1) log('erro da recusa:', e.code, e.message.split('\n')[0]); }
    await c.end();
  }));
  log('restrição EXCLUDE (' + N + ' simultâneas): confirmadas =', ok2, '| recusadas =', rec2, '| no banco =', (await admin.query('SELECT count(*)::int AS n FROM rs.reservas')).rows[0].n);
  // 3) trava consultiva + verificação
  await admin.query('TRUNCATE rs.reservas_ingenua');
  let ok3 = 0;
  await Promise.all(Array.from({ length: N }, async (_, i) => {
    const c = await sess();
    await c.query('BEGIN');
    await c.query('SELECT pg_advisory_xact_lock(1)');          // serializa por sala
    const { rows } = await c.query("SELECT count(*)::int AS n FROM rs.reservas_ingenua WHERE sala = 1 AND periodo && $1::tstzrange", [periodo]);
    await sleep(10);
    if (rows[0].n === 0) { await c.query('INSERT INTO rs.reservas_ingenua (sala, quem, periodo) VALUES (1, $1, $2::tstzrange)', [i, periodo]); ok3++; }
    await c.query('COMMIT'); await c.end();
  }));
  log('verificar-e-inserir com pg_advisory_xact_lock: confirmadas =', ok3, '| no banco =', (await admin.query('SELECT count(*)::int AS n FROM rs.reservas_ingenua')).rows[0].n);
  // 4) idempotência
  let ins = 0, dup = 0;
  await Promise.all(Array.from({ length: N }, async () => {
    const c = await sess();
    const r = await c.query("INSERT INTO rs.pagamentos (chave_idempotencia, valor) VALUES ('pedido-77-tentativa', 59.90) ON CONFLICT (chave_idempotencia) DO NOTHING");
    if (r.rowCount === 1) ins++; else dup++;
    await c.end();
  }));
  log('idempotência (' + N + ' requisições repetidas): cobranças gravadas =', ins, '| ignoradas =', dup, '| linhas na tabela =', (await admin.query('SELECT count(*)::int AS n FROM rs.pagamentos')).rows[0].n);
  await admin.end();
  require('fs').writeFileSync(__dirname + '/saida-pg-reservas.txt', saida.join('\n') + '\n');
  process.exit(0);
})().catch((e) => { console.error('FALHA', e); process.exit(1); });
