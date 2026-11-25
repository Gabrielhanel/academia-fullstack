import pino from 'pino';
import { Writable } from 'node:stream';
import { AsyncLocalStorage } from 'node:async_hooks';
import crypto from 'node:crypto';
console.log('pino 10.4.0 | Node', process.version);
const linhas = []; const dest = new Writable({ write(c, _e, cb) { linhas.push(c.toString()); cb(); } });

console.log('== 1. log estruturado: campos, níveis, redação e child logger');
const log = pino({ level: 'info', base: { servico: 'api-pedidos', versao: '1.4.2' }, redact: { paths: ['senha', '*.token', 'req.headers.authorization'], censor: '[REDIGIDO]' }, timestamp: pino.stdTimeFunctions.isoTime }, dest);
log.info({ pedidoId: 42, ms: 12 }, 'pedido criado'); log.debug('invisível em info'); log.warn({ tentativa: 2 }, 'retry'); log.error({ err: new Error('falha no banco') }, 'erro ao salvar');
log.info({ senha: 'abc', cliente: { token: 'xyz' }, req: { headers: { authorization: 'Bearer 1' } } }, 'dados sensíveis');
const o = linhas.map((l) => JSON.parse(l));
console.log('linhas emitidas:', linhas.length, '(debug não saiu) | campos da 1ª:', Object.keys(o[0]).join(', '));
console.log('níveis numéricos:', o.map((x) => x.level).join(','), '| erro serializado com stack:', typeof o[2].err?.stack === 'string', '| redação:', JSON.stringify({ senha: o[3].senha, token: o[3].cliente.token, authorization: o[3].req.headers.authorization }));
const filho = log.child({ pedidoId: 42 }); filho.info('dentro do child'); console.log('child logger herda o campo pedidoId:', JSON.parse(linhas.at(-1)).pedidoId === 42);

console.log('\n== 2. correlação: id da requisição em TODOS os logs com AsyncLocalStorage');
const als = new AsyncLocalStorage(); linhas.length = 0;
const logc = pino({ mixin: () => ({ reqId: als.getStore()?.reqId }) }, dest);
const servico = async () => { await new Promise((r) => setTimeout(r, 5)); logc.info('dentro do serviço'); };
const requisicao = (id) => als.run({ reqId: id }, async () => { logc.info('início'); await servico(); logc.info('fim'); });
await Promise.all([requisicao('r-1'), requisicao('r-2')]);
const porReq = {}; for (const l of linhas.map((x) => JSON.parse(x))) (porReq[l.reqId] ??= []).push(l.msg);
console.log('logs agrupados por reqId:', JSON.stringify(porReq));

console.log('\n== 3. custo: 200.000 linhas para um destino que descarta (mediana de 3)');
const nulo = new Writable({ write(_c, _e, cb) { cb(); } });
const med = async (fn) => { const t = []; for (let i = 0; i < 3; i++) { const t0 = performance.now(); await fn(); t.push(performance.now() - t0); } t.sort((a, b) => a - b); return t[1]; };
const lp = pino({ level: 'info' }, nulo);
const tPino = await med(async () => { for (let i = 0; i < 200000; i++) lp.info({ i, rota: '/pedidos', ms: 12 }, 'req'); });
const tJson = await med(async () => { for (let i = 0; i < 200000; i++) nulo.write(JSON.stringify({ level: 30, time: new Date().toISOString(), i, rota: '/pedidos', ms: 12, msg: 'req' }) + '\n'); });
const lpd = pino({ level: 'warn' }, nulo);
const tDesc = await med(async () => { for (let i = 0; i < 200000; i++) lpd.info({ i, rota: '/pedidos', ms: 12 }, 'req'); });
console.log('pino (nível info, grava):', tPino.toFixed(0), 'ms |', (200000 / tPino * 1000 / 1e6).toFixed(2), 'M linhas/s | JSON.stringify manual:', tJson.toFixed(0), 'ms | nível desligado (warn, descarta):', tDesc.toFixed(1), 'ms');
console.log('\n== 4. volume: tamanho médio de uma linha e projeção');
const amostra = JSON.stringify({ level: 30, time: new Date().toISOString(), pid: 1, hostname: 'api-1', servico: 'api-pedidos', reqId: crypto.randomUUID(), rota: '/pedidos/42', metodo: 'GET', status: 200, ms: 12, msg: 'requisição concluída' });
console.log('linha típica:', Buffer.byteLength(amostra), 'bytes | 1 linha por requisição a 200 req/s =', (Buffer.byteLength(amostra) * 200 * 86400 / 1e9).toFixed(1), 'GB por dia (cálculo)');
