import { WebSocketServer, WebSocket } from 'ws';
import http from 'node:http';
const med = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
const p95 = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length * 0.95)]; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const abrir = (porta, opts = {}, hdr = {}) => new Promise((ok, no) => { const w = new WebSocket('ws://127.0.0.1:' + porta, { headers: hdr, ...opts }); w.once('open', () => ok(w)); w.once('error', no); w.once('unexpected-response', (_q, r) => no(new Error('upgrade recusado: HTTP ' + r.statusCode))); });
console.log('ws', (await import('ws/package.json', { with: { type: 'json' } })).default.version);

console.log('== 1. autenticação no upgrade (verifyClient por token e Origin)');
const httpSrv = http.createServer(); let wss = new WebSocketServer({ server: httpSrv, verifyClient: (info, cb) => { const t = new URL(info.req.url, 'http://x').searchParams.get('token'); if (info.origin !== 'https://app.exemplo.com') return cb(false, 403, 'origem não permitida'); if (t !== 'segredo') return cb(false, 401, 'token inválido'); cb(true); } });
await new Promise((ok) => httpSrv.listen(0, '127.0.0.1', ok)); const porta1 = httpSrv.address().port;
const tenta = async (qs, origin) => { try { const w = await new Promise((ok, no) => { const c = new WebSocket('ws://127.0.0.1:' + porta1 + '/' + qs, { origin }); c.once('open', () => ok(c)); c.once('unexpected-response', (_q, r) => no(new Error('HTTP ' + r.statusCode))); c.once('error', no); }); w.close(); return 'aceito'; } catch (e) { return 'recusado: ' + e.message; } };
console.log('origem e token corretos:', await tenta('?token=segredo', 'https://app.exemplo.com'));
console.log('token errado:', await tenta('?token=x', 'https://app.exemplo.com'));
console.log('origem errada:', await tenta('?token=segredo', 'https://malvado.com'));
wss.close(); httpSrv.close();

console.log('\n== 2. limite de tamanho da mensagem (maxPayload 1 MiB)');
const errosServidor = []; wss = new WebSocketServer({ port: 0, host: '127.0.0.1', maxPayload: 1024 * 1024 }); await new Promise((r) => wss.on('listening', r)); const porta2 = wss.address().port;
wss.on('connection', (s) => { s.on('error', (e) => { errosServidor.push(e.code); }); s.on('message', (m) => s.send('recebi ' + m.length)); });
let c = await abrir(porta2); const fecho = new Promise((r) => c.once('close', (code, reason) => r({ code, reason: reason.toString() })));
c.send('a'.repeat(100)); await sleep(50);
c.send('b'.repeat(2 * 1024 * 1024)); console.log('mensagem de 2 MiB ->', JSON.stringify(await fecho), '| erro emitido no socket do servidor:', errosServidor.join(','), '(sem o ouvinte de \'error\', a primeira versão deste teste derrubou o processo com RangeError WS_ERR_UNSUPPORTED_MESSAGE_LENGTH)');
wss.close();

console.log('\n== 3. heartbeat: detectar cliente morto (ping a cada 150 ms, prazo de 1 ciclo)');
wss = new WebSocketServer({ port: 0, host: '127.0.0.1' }); await new Promise((r) => wss.on('listening', r)); const porta3 = wss.address().port;
const encerrados = []; wss.on('connection', (s) => { s.vivo = true; s.on('pong', () => { s.vivo = true; }); s.id = wss.clients.size; });
const timer = setInterval(() => { for (const s of wss.clients) { if (!s.vivo) { encerrados.push(s.id); s.terminate(); continue; } s.vivo = false; s.ping(); } }, 150);
const saudavel = await abrir(porta3); const morto = await abrir(porta3, { autoPong: false });
await sleep(700);
console.log('clientes conectados no servidor:', wss.clients.size, '| encerrados por falta de pong:', JSON.stringify(encerrados), '| saudável ainda aberto:', saudavel.readyState === WebSocket.OPEN);
clearInterval(timer); saudavel.close(); wss.close();

console.log('\n== 4. broadcast para 300 clientes (latência até o recebimento)');
wss = new WebSocketServer({ port: 0, host: '127.0.0.1' }); await new Promise((r) => wss.on('listening', r)); const porta4 = wss.address().port;
const clientes = await Promise.all(Array.from({ length: 300 }, () => abrir(porta4)));
const latencias = []; clientes.forEach((cl) => cl.on('message', (m) => { latencias.push(performance.now() - Number(m.toString())); }));
await sleep(100);
for (let rodada = 0; rodada < 5; rodada++) { const t = performance.now(); for (const s of wss.clients) s.send(String(t)); await sleep(100); }
console.log('mensagens entregues:', latencias.length, '(esperado 1500) | latência mediana:', med(latencias).toFixed(2), 'ms | p95:', p95(latencias).toFixed(2), 'ms');
clientes.forEach((cl) => cl.close()); wss.close();

console.log('\n== 5. consumidor lento: bufferedAmount cresce no servidor');
wss = new WebSocketServer({ port: 0, host: '127.0.0.1' }); await new Promise((r) => wss.on('listening', r)); const porta5 = wss.address().port;
let srvSocket; wss.on('connection', (s) => { srvSocket = s; });
const lento = await abrir(porta5); lento._socket.pause(); await sleep(50);
const bloco = 'x'.repeat(256 * 1024); let enviados = 0, maxBuf = 0;
for (let i = 0; i < 400; i++) { srvSocket.send(bloco); enviados++; maxBuf = Math.max(maxBuf, srvSocket.bufferedAmount); await sleep(1); }
console.log('enviados:', enviados, 'x 256 KiB (~' + (enviados * 256 / 1024).toFixed(0) + ' MiB) para um cliente que não lê | bufferedAmount máximo no servidor:', (maxBuf / 1048576).toFixed(0), 'MiB');
console.log('política possível: se bufferedAmount > limite, descartar mensagens ou fechar o socket (código 1013, "try again later")');
lento.terminate(); wss.close();
process.exit(0);
