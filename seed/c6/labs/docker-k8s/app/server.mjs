// API mínima para os experimentos de contêineres: liveness, readiness e um contador persistido (PostgreSQL + Redis).
import express from 'express';
import pg from 'pg';
import Redis from 'ioredis';
const porta = Number(process.env.PORT || 3000);
const db = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 4 });
db.on('error', (e) => console.error('erro no pool do banco (a aplicação segue de pé):', e.message));   // sem este ouvinte um erro em conexão ociosa derruba o processo
const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', { lazyConnect: true, maxRetriesPerRequest: 1 });
redis.on('error', () => {});
const app = express();
app.get('/saude', (req, res) => res.json({ ok: true, versao: process.env.APP_VERSION || 'dev', host: process.env.HOSTNAME }));   // liveness: o processo responde
app.get('/pronto', async (req, res) => {                                                                                       // readiness: dependências acessíveis
  try { await db.query('select 1'); if (redis.status !== 'ready') await redis.connect().catch(() => {}); await redis.ping(); res.json({ pronto: true }); }
  catch (e) { res.status(503).json({ pronto: false, motivo: e.message.slice(0, 80) }); }
});
app.post('/visitas', async (req, res) => {
  await db.query('create table if not exists visitas (id serial primary key, quando timestamptz default now())');
  await db.query('insert into visitas default values');
  const n = await redis.incr('visitas'); res.status(201).json({ cache: n });
});
app.get('/visitas', async (req, res) => {
  await db.query('create table if not exists visitas (id serial primary key, quando timestamptz default now())');
  const r = await db.query('select count(*)::int as n from visitas'); res.json({ banco: r.rows[0].n });
});
const server = app.listen(porta, '0.0.0.0', () => console.log('ouvindo na porta ' + porta));
process.on('SIGTERM', () => { console.log('SIGTERM: encerrando'); server.close(async () => { await db.end(); redis.disconnect(); process.exit(0); }); });
