// Cenários de concorrência no PostgreSQL com duas ou mais sessões controladas por código.
// Uso: NODE_PATH=<pasta com node_modules do pg> node pg-cenarios.cjs
const { Client } = require('pg');
const cfg = { host: '127.0.0.1', port: 55432, user: 'postgres', password: 'lab', database: 'postgres' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const saida = [];
const log = (...a) => { const t = a.join(' '); saida.push(t); console.log(t); };
async function sessao(nome) { const c = new Client(cfg); await c.connect(); c.nome = nome; return c; }
const q = async (c, sql, params) => { try { return (await c.query(sql, params)).rows; } catch (e) { return { erro: e.code + ' ' + e.message.split('\n')[0] }; } };
async function preparar(admin) {
  await admin.query('DROP SCHEMA IF EXISTS tx CASCADE; CREATE SCHEMA tx; SET search_path = tx');
  await admin.query("CREATE TABLE tx.contas (id int PRIMARY KEY, dono text, saldo numeric(10,2) NOT NULL CHECK (saldo >= 0))");
  await admin.query("INSERT INTO tx.contas VALUES (1,'Ana',100),(2,'Bruno',50)");
}
async function reset(admin) { await admin.query("TRUNCATE tx.contas; INSERT INTO tx.contas VALUES (1,'Ana',100),(2,'Bruno',50)"); }
const saldo = async (c, id) => (await q(c, 'SELECT saldo FROM tx.contas WHERE id = $1', [id]))[0]?.saldo;

(async () => {
  const admin = await sessao('admin');
  await preparar(admin);
  log('versão:', (await q(admin, 'SELECT version()'))[0].version.split(',')[0]);
  log('isolamento padrão:', (await q(admin, 'SHOW transaction_isolation'))[0].transaction_isolation);

  log('\n== 1. atomicidade: transferência que falha no meio');
  const a = await sessao('A');
  await a.query('BEGIN');
  await a.query('UPDATE tx.contas SET saldo = saldo + 70 WHERE id = 2');
  log('dentro da transação, Bruno =', await saldo(a, 2));
  log('erro ao debitar 130 de Ana:', JSON.stringify(await q(a, 'UPDATE tx.contas SET saldo = saldo - 130 WHERE id = 1')));
  log('próximo comando na transação abortada:', JSON.stringify(await q(a, 'SELECT 1')));
  await a.query('ROLLBACK');
  log('após ROLLBACK: Ana =', await saldo(admin, 1), '| Bruno =', await saldo(admin, 2));
  await a.end();

  async function par(iso, nome) { const x = await sessao('X'); const y = await sessao('Y'); return { x, y }; }

  log('\n== 2. leitura suja (dirty read) com READ UNCOMMITTED');
  await reset(admin);
  let { x, y } = await par();
  await x.query('BEGIN ISOLATION LEVEL READ UNCOMMITTED');
  await y.query('BEGIN');
  await y.query('UPDATE tx.contas SET saldo = 999 WHERE id = 1');
  log('X lê Ana (Y ainda não confirmou):', await saldo(x, 1));
  await y.query('ROLLBACK'); await x.query('ROLLBACK'); await x.end(); await y.end();

  log('\n== 3. leitura não repetível: READ COMMITTED x REPEATABLE READ');
  for (const nivel of ['READ COMMITTED', 'REPEATABLE READ']) {
    await reset(admin);
    ({ x, y } = await par());
    await x.query('BEGIN ISOLATION LEVEL ' + nivel);
    const antes = await saldo(x, 1);
    await y.query('UPDATE tx.contas SET saldo = 500 WHERE id = 1');
    const depois = await saldo(x, 1);
    log(nivel + ': X lê', antes, 'e depois', depois);
    await x.query('COMMIT'); await x.end(); await y.end();
  }

  log('\n== 4. fantasma: contagem de contas com saldo > 40');
  for (const nivel of ['READ COMMITTED', 'REPEATABLE READ']) {
    await reset(admin);
    ({ x, y } = await par());
    await x.query('BEGIN ISOLATION LEVEL ' + nivel);
    const c1 = (await q(x, 'SELECT count(*)::int AS n FROM tx.contas WHERE saldo > 40'))[0].n;
    await y.query("INSERT INTO tx.contas VALUES (3,'Carla',80)");
    const c2 = (await q(x, 'SELECT count(*)::int AS n FROM tx.contas WHERE saldo > 40'))[0].n;
    log(nivel + ': primeira contagem', c1, 'segunda contagem', c2);
    await x.query('COMMIT'); await x.end(); await y.end();
  }

  log('\n== 5. atualização perdida (lost update): ler, somar na aplicação, gravar');
  await reset(admin);
  ({ x, y } = await par());
  await x.query('BEGIN'); await y.query('BEGIN');
  const sx = Number(await saldo(x, 1)); const sy = Number(await saldo(y, 1));
  await x.query('UPDATE tx.contas SET saldo = $1 WHERE id = 1', [sx + 10]);
  const pY = y.query('UPDATE tx.contas SET saldo = $1 WHERE id = 1', [sy + 10]);
  await sleep(300);
  await x.query('COMMIT'); await pY; await y.query('COMMIT');
  log('Ana deveria ter 120; ficou com', await saldo(admin, 1));
  await x.end(); await y.end();

  log('\n-- correção A: UPDATE atômico (saldo = saldo + 10)');
  await reset(admin);
  ({ x, y } = await par());
  await x.query('BEGIN'); await y.query('BEGIN');
  await x.query('UPDATE tx.contas SET saldo = saldo + 10 WHERE id = 1');
  const pY2 = y.query('UPDATE tx.contas SET saldo = saldo + 10 WHERE id = 1');
  await sleep(300); await x.query('COMMIT'); await pY2; await y.query('COMMIT');
  log('Ana ficou com', await saldo(admin, 1));
  await x.end(); await y.end();

  log('\n-- correção B: SELECT ... FOR UPDATE');
  await reset(admin);
  ({ x, y } = await par());
  await x.query('BEGIN'); await y.query('BEGIN');
  const fx = Number((await q(x, 'SELECT saldo FROM tx.contas WHERE id = 1 FOR UPDATE'))[0].saldo);
  const pFY = q(y, 'SELECT saldo FROM tx.contas WHERE id = 1 FOR UPDATE');
  await sleep(300);
  await x.query('UPDATE tx.contas SET saldo = $1 WHERE id = 1', [fx + 10]); await x.query('COMMIT');
  const fy = Number((await pFY)[0].saldo);
  await y.query('UPDATE tx.contas SET saldo = $1 WHERE id = 1', [fy + 10]); await y.query('COMMIT');
  log('Y leu', fy, 'depois de esperar X; Ana ficou com', await saldo(admin, 1));
  await x.end(); await y.end();

  log('\n-- correção C: REPEATABLE READ (a segunda gravação falha)');
  await reset(admin);
  ({ x, y } = await par());
  await x.query('BEGIN ISOLATION LEVEL REPEATABLE READ'); await y.query('BEGIN ISOLATION LEVEL REPEATABLE READ');
  const rx = Number(await saldo(x, 1)); const ry = Number(await saldo(y, 1));
  await x.query('UPDATE tx.contas SET saldo = $1 WHERE id = 1', [rx + 10]);
  const pRY = q(y, 'UPDATE tx.contas SET saldo = $1 WHERE id = 1', [ry + 10]);
  await sleep(300); await x.query('COMMIT');
  log('Y recebeu:', JSON.stringify(await pRY));
  await y.query('ROLLBACK');
  log('Ana ficou com', await saldo(admin, 1));
  await x.end(); await y.end();

  log('\n== 6. write skew: duas pessoas de plantão saem ao mesmo tempo');
  await admin.query("DROP TABLE IF EXISTS tx.plantao; CREATE TABLE tx.plantao (pessoa text PRIMARY KEY, de_plantao boolean)");
  for (const nivel of ['REPEATABLE READ', 'SERIALIZABLE']) {
    await admin.query("TRUNCATE tx.plantao; INSERT INTO tx.plantao VALUES ('Ana', true), ('Bia', true)");
    ({ x, y } = await par());
    await x.query('BEGIN ISOLATION LEVEL ' + nivel); await y.query('BEGIN ISOLATION LEVEL ' + nivel);
    const nx = (await q(x, 'SELECT count(*)::int AS n FROM tx.plantao WHERE de_plantao'))[0].n;
    const ny = (await q(y, 'SELECT count(*)::int AS n FROM tx.plantao WHERE de_plantao'))[0].n;
    await x.query("UPDATE tx.plantao SET de_plantao = false WHERE pessoa = 'Ana'");
    await y.query("UPDATE tx.plantao SET de_plantao = false WHERE pessoa = 'Bia'");
    const cx = await q(x, 'COMMIT'); const cy = await q(y, 'COMMIT');
    const restantes = (await q(admin, 'SELECT count(*)::int AS n FROM tx.plantao WHERE de_plantao'))[0].n;
    log(nivel + ': ambos viram', nx + ' e ' + ny, '| commit X:', JSON.stringify(cx), '| commit Y:', JSON.stringify(cy), '| de plantão no final:', restantes);
    await x.end(); await y.end();
  }

  log('\n== 7. deadlock: duas sessões bloqueiam linhas em ordens opostas');
  await reset(admin);
  ({ x, y } = await par());
  await x.query('BEGIN'); await y.query('BEGIN');
  await x.query('UPDATE tx.contas SET saldo = saldo + 1 WHERE id = 1');
  await y.query('UPDATE tx.contas SET saldo = saldo + 1 WHERE id = 2');
  const t0 = Date.now();
  const px = q(x, 'UPDATE tx.contas SET saldo = saldo + 1 WHERE id = 2');
  await sleep(200);
  const py = q(y, 'UPDATE tx.contas SET saldo = saldo + 1 WHERE id = 1');
  const [rx2, ry2] = await Promise.all([px, py]);
  log('X:', JSON.stringify(rx2)); log('Y:', JSON.stringify(ry2));
  log('tempo até a detecção (ms, aproximado):', Date.now() - t0, '| deadlock_timeout =', (await q(admin, 'SHOW deadlock_timeout'))[0].deadlock_timeout);
  await x.query('ROLLBACK').catch(() => {}); await y.query('ROLLBACK').catch(() => {});
  await x.end(); await y.end();

  log('\n== 8. travas: FOR UPDATE, NOWAIT, SKIP LOCKED, lock_timeout');
  await admin.query("DROP TABLE IF EXISTS tx.fila; CREATE TABLE tx.fila (id int PRIMARY KEY, tarefa text, feita boolean DEFAULT false)");
  await admin.query("INSERT INTO tx.fila SELECT g, 'tarefa ' || g FROM generate_series(1, 5) g");
  ({ x, y } = await par());
  await x.query('BEGIN'); await y.query('BEGIN');
  const lx = await q(x, 'SELECT id FROM tx.fila ORDER BY id LIMIT 2 FOR UPDATE');
  log('X travou:', JSON.stringify(lx.map((r) => r.id)));
  log('Y com NOWAIT:', JSON.stringify(await q(y, 'SELECT id FROM tx.fila WHERE id = 1 FOR UPDATE NOWAIT')));
  await y.query('ROLLBACK'); await y.query('BEGIN');
  const ly = await q(y, 'SELECT id FROM tx.fila ORDER BY id LIMIT 2 FOR UPDATE SKIP LOCKED');
  log('Y com SKIP LOCKED pegou:', JSON.stringify(ly.map((r) => r.id)));
  await y.query("SET lock_timeout = '300ms'");
  log('Y com lock_timeout:', JSON.stringify(await q(y, 'UPDATE tx.fila SET feita = true WHERE id = 1')));
  await x.query('ROLLBACK'); await y.query('ROLLBACK'); await x.end(); await y.end();

  log('\n== 9. MVCC: versões de linha (xmin, xmax, ctid)');
  await reset(admin);
  log('antes:', JSON.stringify(await q(admin, 'SELECT ctid, xmin, xmax, saldo FROM tx.contas WHERE id = 1')));
  await admin.query('UPDATE tx.contas SET saldo = saldo + 1 WHERE id = 1');
  log('depois do UPDATE:', JSON.stringify(await q(admin, 'SELECT ctid, xmin, xmax, saldo FROM tx.contas WHERE id = 1')));
  ({ x, y } = await par());
  await x.query('BEGIN ISOLATION LEVEL REPEATABLE READ');
  log('X (snapshot) vê', await saldo(x, 1));
  await y.query('UPDATE tx.contas SET saldo = saldo + 1000 WHERE id = 1');
  log('X ainda vê', await saldo(x, 1), '| sessão nova vê', await saldo(admin, 1));
  await x.query('COMMIT'); await x.end(); await y.end();

  log('\n== 10. bloqueio otimista com coluna de versão');
  await admin.query("DROP TABLE IF EXISTS tx.docs; CREATE TABLE tx.docs (id int PRIMARY KEY, texto text, versao int NOT NULL DEFAULT 1)");
  await admin.query("INSERT INTO tx.docs VALUES (1, 'original', 1)");
  const lerV = async (c) => (await q(c, 'SELECT texto, versao FROM tx.docs WHERE id = 1'))[0];
  ({ x, y } = await par());
  const vx = await lerV(x); const vy = await lerV(y);
  const gravar = async (c, v, texto) => (await c.query('UPDATE tx.docs SET texto = $1, versao = versao + 1 WHERE id = 1 AND versao = $2', [texto, v.versao])).rowCount;
  log('X grava com a versão', vx.versao, '→ linhas afetadas:', await gravar(x, vx, 'edição do X'));
  log('Y grava com a versão', vy.versao, '→ linhas afetadas:', await gravar(y, vy, 'edição do Y'), '(0 = conflito detectado)');
  log('estado final:', JSON.stringify(await lerV(admin)));
  await x.end(); await y.end();

  await admin.end();
  require('fs').writeFileSync(__dirname + '/saida-pg.txt', saida.join('\n') + '\n');
})().catch((e) => { console.error('FALHA', e); process.exit(1); });
