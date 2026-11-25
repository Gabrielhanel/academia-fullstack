// Prevenção de deadlock: travar as linhas sempre na mesma ordem.
const { Client } = require('pg');
const cfg = { host: '127.0.0.1', port: 55432, user: 'postgres', password: 'lab', database: 'postgres' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const saida = []; const log = (...a) => { const t = a.join(' '); saida.push(t); console.log(t); };
const sess = async () => { const c = new Client(cfg); await c.connect(); return c; };
async function transferir(c, de, para, valor, pausa) {
  await c.query('BEGIN');
  const [a, b] = [de, para].sort((m, n) => m - n);           // ordem consistente
  await c.query('SELECT id FROM tx.contas WHERE id IN ($1, $2) ORDER BY id FOR UPDATE', [a, b]);
  await sleep(pausa);
  await c.query('UPDATE tx.contas SET saldo = saldo - $1 WHERE id = $2', [valor, de]);
  await c.query('UPDATE tx.contas SET saldo = saldo + $1 WHERE id = $2', [valor, para]);
  await c.query('COMMIT');
}
(async () => {
  const admin = await sess();
  await admin.query("TRUNCATE tx.contas; INSERT INTO tx.contas VALUES (1,'Ana',100),(2,'Bruno',100)");
  const x = await sess(), y = await sess();
  const t0 = Date.now();
  const r = await Promise.allSettled([transferir(x, 1, 2, 10, 300), transferir(y, 2, 1, 5, 300)]);
  log('resultados:', JSON.stringify(r.map((p) => p.status)), '| ms:', Date.now() - t0);
  const s = (await admin.query('SELECT id, saldo FROM tx.contas ORDER BY id')).rows;
  log('saldos finais:', JSON.stringify(s), '| soma:', s.reduce((m, c) => m + Number(c.saldo), 0));
  await x.end(); await y.end(); await admin.end();
  require('fs').writeFileSync(__dirname + '/saida-pg-deadlock-ordem.txt', saida.join('\n') + '\n');
})().catch((e) => { console.error('FALHA', e); process.exit(1); });
