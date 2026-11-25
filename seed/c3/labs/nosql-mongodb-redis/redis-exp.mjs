import Redis from 'ioredis';
const r = new Redis({ host: '127.0.0.1', port: 56379 });
const med = async (rotulo, fn, reps = 5) => { await fn(); const t = []; for (let i = 0; i < reps; i++) { const t0 = performance.now(); await fn(); t.push(performance.now() - t0); } t.sort((a, b) => a - b); console.log(rotulo.padEnd(62), 'mediana ms:', t[Math.floor(reps / 2)].toFixed(1)); };
const info = await r.info('server');
console.log('Redis', /redis_version:(\S+)/.exec(info)[1], '| modo:', /redis_mode:(\S+)/.exec(info)[1]);
await r.flushall();

console.log('\n== strings, contadores e concorrência (1.000 operações simultâneas)');
await r.set('a', 0); await r.set('b', 0);
await Promise.all(Array.from({ length: 1000 }, () => r.incr('a')));
await Promise.all(Array.from({ length: 1000 }, async () => { const v = Number(await r.get('b')); await r.set('b', v + 1); }));
console.log('INCR atômico:', await r.get('a'), '| GET + SET (ler-modificar-gravar):', await r.get('b'));

console.log('\n== TTL e trava com SET NX EX');
await r.set('sessao:1', 'ana', 'EX', 100);
console.log('TTL da chave:', await r.ttl('sessao:1'), '| chave sem TTL:', await r.ttl('a'), '| inexistente:', await r.ttl('nao-existe'));
console.log('1ª tentativa de trava:', await r.set('trava:job', 'w1', 'EX', 30, 'NX'), '| 2ª:', await r.set('trava:job', 'w2', 'EX', 30, 'NX'), '| dono atual:', await r.get('trava:job'));
await r.set('curta', 'x', 'PX', 300); await new Promise((x) => setTimeout(x, 450));
console.log('chave com TTL de 300 ms depois de 450 ms:', await r.get('curta'));

console.log('\n== hash, lista, conjunto, conjunto ordenado');
await r.hset('cliente:1', { nome: 'Ana', cidade: 'POA', pontos: 10 });
console.log('HGETALL:', JSON.stringify(await r.hgetall('cliente:1')), '| HINCRBY pontos +5 ->', await r.hincrby('cliente:1', 'pontos', 5));
await r.rpush('fila', 't1', 't2', 't3');
console.log('fila: LPOP ->', await r.lpop('fila'), '| LRANGE ->', JSON.stringify(await r.lrange('fila', 0, -1)));
await r.sadd('tags:a', 'x', 'y', 'z'); await r.sadd('tags:b', 'y', 'z', 'w');
console.log('SINTER:', JSON.stringify((await r.sinter('tags:a', 'tags:b')).sort()), '| SUNION:', JSON.stringify((await r.sunion('tags:a', 'tags:b')).sort()));
await r.zadd('placar', 120, 'ana', 300, 'bia', 210, 'caio', 90, 'dani');
console.log('top 3:', JSON.stringify(await r.zrevrange('placar', 0, 2, 'WITHSCORES')), '| posição da ana (0 = primeiro):', await r.zrevrank('placar', 'ana'));
await r.pfadd('visitas', ...Array.from({ length: 10000 }, (_, i) => 'u' + i));
console.log('HyperLogLog: 10.000 elementos distintos -> estimativa', await r.pfcount('visitas'), '| memória:', await r.memory('USAGE', 'visitas'), 'bytes');

console.log('\n== transações, WATCH e pipeline');
const res = await r.multi().incr('c').incr('c').exec();
console.log('MULTI/EXEC:', JSON.stringify(res));
await r.set('saldo', 100);
const outro = new Redis({ host: '127.0.0.1', port: 56379 });
await r.watch('saldo');
await outro.set('saldo', 500);
const t = await r.multi().set('saldo', 1).exec();
console.log('WATCH com alteração concorrente: EXEC ->', JSON.stringify(t), '| saldo:', await r.get('saldo'));
await outro.quit();
await med('10.000 SET sequenciais (await em cada um)', async () => { for (let i = 0; i < 10000; i++) await r.set('k' + i, i); });
await med('10.000 SET em pipeline', async () => { const p = r.pipeline(); for (let i = 0; i < 10000; i++) p.set('k' + i, i); await p.exec(); });

console.log('\n== KEYS x SCAN (110.000 chaves)');
const p2 = r.pipeline(); for (let i = 0; i < 100000; i++) p2.set('chave:' + i, i); await p2.exec();
console.log('DBSIZE:', await r.dbsize());
await med('KEYS chave:99* (bloqueia o servidor)', () => r.keys('chave:99*'), 3);
await med('SCAN com MATCH chave:99* (iterativo)', async () => { let c = '0'; const out = []; do { const [n, ks] = await r.scan(c, 'MATCH', 'chave:99*', 'COUNT', 1000); c = n; out.push(...ks); } while (c !== '0'); return out; }, 3);

console.log('\n== streams');
await r.xgroup('CREATE', 'pedidos:eventos', 'workers', '$', 'MKSTREAM');
for (let i = 1; i <= 5; i++) await r.xadd('pedidos:eventos', '*', 'pedido', String(i), 'valor', String(i * 10));
const lido = await r.xreadgroup('GROUP', 'workers', 'w1', 'COUNT', 3, 'STREAMS', 'pedidos:eventos', '>');
const ids = lido[0][1].map((e) => e[0]);
console.log('w1 leu', ids.length, 'mensagens; pendentes antes do XACK:', (await r.xpending('pedidos:eventos', 'workers'))[0]);
await r.xack('pedidos:eventos', 'workers', ids[0]);
console.log('pendentes depois de 1 XACK:', (await r.xpending('pedidos:eventos', 'workers'))[0], '| tamanho do stream:', await r.xlen('pedidos:eventos'));

console.log('\n== pub/sub não guarda mensagens');
const sub = new Redis({ host: '127.0.0.1', port: 56379 });
const recebidas = []; sub.on('message', (c, m) => recebidas.push(m));
await r.publish('canal', 'antes'); 
await sub.subscribe('canal'); await r.publish('canal', 'depois'); await new Promise((x) => setTimeout(x, 100));
console.log('mensagens recebidas pelo assinante:', JSON.stringify(recebidas), '(a publicada antes da assinatura se perdeu)');
await sub.quit();

console.log('\n== persistência e memória');
console.log('save =', JSON.stringify(await r.config('GET', 'save')), '| appendonly =', JSON.stringify(await r.config('GET', 'appendonly')), '| maxmemory-policy =', JSON.stringify(await r.config('GET', 'maxmemory-policy')), '| maxmemory =', JSON.stringify(await r.config('GET', 'maxmemory')));
await r.config('SET', 'maxmemory', '3mb'); await r.config('SET', 'maxmemory-policy', 'allkeys-lru');
const p3 = r.pipeline(); for (let i = 0; i < 100000; i++) p3.set('lru:' + i, 'x'.repeat(50)); await p3.exec();
const st = await r.info('stats');
console.log('com maxmemory 3mb e allkeys-lru: chaves =', await r.dbsize(), '| evicted_keys =', /evicted_keys:(\d+)/.exec(st)[1]);
await r.config('SET', 'maxmemory-policy', 'noeviction');
try { const p4 = r.pipeline(); for (let i = 0; i < 100000; i++) p4.set('nova:' + i, 'x'.repeat(50)); const e = await p4.exec(); console.log('noeviction: primeiro erro =', e.find((x) => x[0])?.[0]?.message?.slice(0, 80)); } catch (e) { console.log('noeviction erro:', e.message.slice(0, 80)); }
await r.config('SET', 'maxmemory', '0'); await r.config('SET', 'maxmemory-policy', 'noeviction');
console.log('BGSAVE:', await r.bgsave(), '| MEMORY USAGE (string 100 B):', await (async () => { await r.set('s100', 'x'.repeat(100)); return r.memory('USAGE', 's100'); })(), 'bytes');
await r.quit();
