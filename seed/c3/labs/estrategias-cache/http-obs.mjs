import http from 'node:http';
import crypto from 'node:crypto';
import Redis from 'ioredis';
const corpo = JSON.stringify({ produtos: Array.from({ length: 200 }, (_, i) => ({ id: i, nome: 'produto ' + i, preco: i + 0.5 })) });
const etag = '"' + crypto.createHash('sha1').update(corpo).digest('hex').slice(0, 16) + '"';
let hits = 0;
const srv = http.createServer((req, res) => {
  hits++;
  if (req.url === '/semcache') { res.writeHead(200, { 'content-type': 'application/json' }); return res.end(corpo); }
  if (req.headers['if-none-match'] === etag) { res.writeHead(304, { etag, 'cache-control': 'max-age=0, must-revalidate' }); return res.end(); }
  res.writeHead(200, { 'content-type': 'application/json', etag, 'cache-control': 'max-age=0, must-revalidate' }); res.end(corpo);
});
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const base = 'http://127.0.0.1:' + srv.address().port;
console.log('== cabeçalhos HTTP: ETag e revalidação condicional (servidor Node local)');
const r1 = await fetch(base + '/catalogo'); const b1 = await r1.text();
console.log('1ª requisição:', r1.status, '| bytes do corpo:', Buffer.byteLength(b1), '| ETag:', r1.headers.get('etag'));
const r2 = await fetch(base + '/catalogo', { headers: { 'if-none-match': r1.headers.get('etag') } }); const b2 = await r2.text();
console.log('2ª com If-None-Match:', r2.status, '| bytes do corpo:', Buffer.byteLength(b2));
const r3 = await fetch(base + '/catalogo', { headers: { 'if-none-match': '"outro"' } }); await r3.text();
console.log('3ª com ETag diferente:', r3.status);
srv.close();
console.log('\n== métricas do Redis: keyspace_hits e keyspace_misses');
const r = new Redis({ host: '127.0.0.1', port: 56379 });
await r.flushall(); await r.config('RESETSTAT');
await r.set('a', '1'); for (let i = 0; i < 9; i++) await r.get('a'); for (let i = 0; i < 3; i++) await r.get('nao-existe');
const st = await r.info('stats');
const h = Number(/keyspace_hits:(\d+)/.exec(st)[1]), m = Number(/keyspace_misses:(\d+)/.exec(st)[1]);
console.log('keyspace_hits =', h, '| keyspace_misses =', m, '| taxa de acerto =', (h / (h + m) * 100).toFixed(1) + '%');
console.log('evicted_keys =', /evicted_keys:(\d+)/.exec(st)[1], '| expired_keys =', /expired_keys:(\d+)/.exec(st)[1]);
await r.flushall(); await r.quit();
