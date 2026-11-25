// Cenários de concorrência no MySQL 8.4 (InnoDB) com sessões controladas por código.
const mysql = require('mysql2/promise');
const cfg = { host: '127.0.0.1', port: 53306, user: 'root', password: 'lab', charset: 'utf8mb4', multipleStatements: true };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const saida = [];
const log = (...a) => { const t = a.join(' '); saida.push(t); console.log(t); };
const novo = async () => mysql.createConnection(cfg);
const q = async (c, sql, p) => { try { const [r] = await c.query(sql, p); return r; } catch (e) { return { erro: (e.errno || e.code) + ' ' + e.message.split('\n')[0] }; } };
async function reset(a) { await a.query("DROP DATABASE IF EXISTS txlab; CREATE DATABASE txlab; USE txlab; CREATE TABLE contas (id INT PRIMARY KEY, dono VARCHAR(20), saldo DECIMAL(10,2) NOT NULL CHECK (saldo >= 0)) ENGINE=InnoDB; INSERT INTO contas VALUES (1,'Ana',100),(2,'Bruno',50);"); }
async function sess() { const c = await novo(); await c.query('USE txlab'); await c.query('SET SESSION innodb_lock_wait_timeout = 3'); return c; }
const saldo = async (c, id) => (await q(c, 'SELECT saldo FROM contas WHERE id = ?', [id]))[0]?.saldo;

(async () => {
  const admin = await novo(); await reset(admin);
  log('versão:', (await q(admin, 'SELECT VERSION() AS v'))[0].v, '| isolamento padrão:', (await q(admin, 'SELECT @@transaction_isolation AS i'))[0].i);
  let x, y;

  log('\n== 2. leitura suja com READ UNCOMMITTED');
  x = await sess(); y = await sess();
  await x.query('SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED'); await x.query('START TRANSACTION');
  await y.query('START TRANSACTION'); await y.query('UPDATE contas SET saldo = 999 WHERE id = 1');
  log('X lê Ana (Y não confirmou):', await saldo(x, 1));
  await y.query('ROLLBACK'); await x.query('ROLLBACK'); await x.end(); await y.end();

  log('\n== 3. leitura não repetível: READ COMMITTED x REPEATABLE READ');
  for (const nivel of ['READ COMMITTED', 'REPEATABLE READ']) {
    await reset(admin); x = await sess(); y = await sess();
    await x.query('SET SESSION TRANSACTION ISOLATION LEVEL ' + nivel); await x.query('START TRANSACTION');
    const a1 = await saldo(x, 1); await y.query('UPDATE contas SET saldo = 500 WHERE id = 1'); const a2 = await saldo(x, 1);
    log(nivel + ': X lê', a1, 'e depois', a2); await x.query('COMMIT'); await x.end(); await y.end();
  }

  log('\n== 4. fantasma em REPEATABLE READ: leitura consistente x leitura com trava');
  await reset(admin); x = await sess(); y = await sess();
  await x.query('START TRANSACTION');
  const c1 = (await q(x, 'SELECT COUNT(*) AS n FROM contas WHERE saldo > 40'))[0].n;
  await y.query("INSERT INTO contas VALUES (3,'Carla',80)");
  const c2 = (await q(x, 'SELECT COUNT(*) AS n FROM contas WHERE saldo > 40'))[0].n;
  const c3 = (await q(x, 'SELECT COUNT(*) AS n FROM contas WHERE saldo > 40 FOR UPDATE'))[0].n;
  log('SELECT comum:', c1, 'depois', c2, '| SELECT ... FOR UPDATE (leitura atual):', c3);
  await x.query('COMMIT'); await x.end(); await y.end();

  log('\n== 5. atualização perdida em REPEATABLE READ e correções');
  await reset(admin); x = await sess(); y = await sess();
  await x.query('START TRANSACTION'); await y.query('START TRANSACTION');
  const sx = Number(await saldo(x, 1)); const sy = Number(await saldo(y, 1));
  await x.query('UPDATE contas SET saldo = ? WHERE id = 1', [sx + 10]);
  const pY = q(y, 'UPDATE contas SET saldo = ? WHERE id = 1', [sy + 10]);
  await sleep(300); await x.query('COMMIT'); await pY; await y.query('COMMIT');
  log('Ana deveria ter 120; ficou com', await saldo(admin, 1));
  await x.end(); await y.end();

  log('\n== 6. write skew em REPEATABLE READ e em SERIALIZABLE');
  await admin.query('USE txlab');
  await admin.query('DROP TABLE IF EXISTS plantao; CREATE TABLE plantao (pessoa VARCHAR(10) PRIMARY KEY, de_plantao BOOLEAN) ENGINE=InnoDB');
  for (const nivel of ['REPEATABLE READ', 'SERIALIZABLE']) {
    await admin.query("TRUNCATE plantao; INSERT INTO plantao VALUES ('Ana', 1), ('Bia', 1)");
    x = await sess(); y = await sess();
    await x.query('SET SESSION TRANSACTION ISOLATION LEVEL ' + nivel); await y.query('SET SESSION TRANSACTION ISOLATION LEVEL ' + nivel);
    await x.query('START TRANSACTION'); await y.query('START TRANSACTION');
    const nx = (await q(x, 'SELECT COUNT(*) AS n FROM plantao WHERE de_plantao'))[0].n;
    const ny = (await q(y, 'SELECT COUNT(*) AS n FROM plantao WHERE de_plantao'))[0].n;
    const rx = await q(x, "UPDATE plantao SET de_plantao = 0 WHERE pessoa = 'Ana'");
    const ry = q(y, "UPDATE plantao SET de_plantao = 0 WHERE pessoa = 'Bia'");
    await sleep(500);
    const cx = await q(x, 'COMMIT'); const ryr = await ry; const cy = await q(y, 'COMMIT');
    const restantes = (await q(admin, 'SELECT COUNT(*) AS n FROM plantao WHERE de_plantao'))[0].n;
    log(nivel + ': ambos viram', nx + ' e ' + ny, '| UPDATE X:', rx.erro || 'ok', '| UPDATE Y:', ryr.erro || 'ok', '| de plantão no final:', restantes);
    await x.end(); await y.end();
  }

  log('\n== 7. deadlock');
  await reset(admin); x = await sess(); y = await sess();
  await x.query('START TRANSACTION'); await y.query('START TRANSACTION');
  await x.query('UPDATE contas SET saldo = saldo + 1 WHERE id = 1'); await y.query('UPDATE contas SET saldo = saldo + 1 WHERE id = 2');
  const t0 = Date.now();
  const px = q(x, 'UPDATE contas SET saldo = saldo + 1 WHERE id = 2'); await sleep(200);
  const py = q(y, 'UPDATE contas SET saldo = saldo + 1 WHERE id = 1');
  const [r1, r2] = await Promise.all([px, py]);
  log('X:', JSON.stringify(r1.erro ? r1 : 'ok'), '| Y:', JSON.stringify(r2.erro ? r2 : 'ok'), '| ms:', Date.now() - t0);
  await x.query('ROLLBACK').catch(() => {}); await y.query('ROLLBACK').catch(() => {}); await x.end(); await y.end();

  log('\n== 8. travas: NOWAIT, SKIP LOCKED, tempo limite e bloqueio de intervalo (gap lock)');
  await admin.query("DROP TABLE IF EXISTS fila; CREATE TABLE fila (id INT PRIMARY KEY, tarefa VARCHAR(20)) ENGINE=InnoDB; INSERT INTO fila VALUES (1,'t1'),(2,'t2'),(3,'t3'),(4,'t4'),(10,'t10')");
  x = await sess(); y = await sess();
  await x.query('START TRANSACTION'); await y.query('START TRANSACTION');
  log('X travou:', JSON.stringify((await q(x, 'SELECT id FROM fila ORDER BY id LIMIT 2 FOR UPDATE')).map((r) => r.id)));
  log('Y NOWAIT:', JSON.stringify(await q(y, 'SELECT id FROM fila WHERE id = 1 FOR UPDATE NOWAIT')));
  log('Y SKIP LOCKED:', JSON.stringify((await q(y, 'SELECT id FROM fila ORDER BY id LIMIT 2 FOR UPDATE SKIP LOCKED')).map((r) => r.id)));
  const t1 = Date.now(); const lt = await q(y, 'UPDATE fila SET tarefa = "x" WHERE id = 1');
  log('Y UPDATE bloqueado:', JSON.stringify(lt), '| ms:', Date.now() - t1);
  await x.query('ROLLBACK'); await y.query('ROLLBACK');
  await x.query('START TRANSACTION'); await x.query('SELECT * FROM fila WHERE id BETWEEN 5 AND 9 FOR UPDATE');
  const ti = Date.now(); const ins = await q(y, 'INSERT INTO fila VALUES (7, "novo")');
  log('X travou o intervalo 5..9 (sem linhas) com FOR UPDATE; Y INSERT id 7:', JSON.stringify(ins.erro ? ins : 'ok'), '| ms:', Date.now() - ti);
  await x.query('ROLLBACK'); await x.end(); await y.end();
  await admin.end();
  require('fs').writeFileSync(__dirname + '/saida-mysql.txt', saida.join('\n') + '\n');
  process.exit(0);
})().catch((e) => { console.error('FALHA', e); process.exit(1); });
