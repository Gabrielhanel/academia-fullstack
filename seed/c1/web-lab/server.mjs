import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { WebSocketServer } from 'ws';
let down = false;
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain' };
const srv = http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname === '/__down') { down = u.searchParams.get('v') === '1'; res.end('down=' + down); return; }
  if (u.pathname.startsWith('/api/')) {
    if (down) { res.statusCode = 503; res.end('fora do ar'); return; }
    res.setHeader('content-type', 'application/json'); res.end(JSON.stringify({ path: u.pathname, t: Date.now() })); return;
  }
  if (u.pathname === '/sse') {
    res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive' });
    let id = Number(req.headers['last-event-id'] || 0);
    res.write('retry: 200\n\n');
    const iv = setInterval(() => { id++; res.write(`id: ${id}\nevent: tick\ndata: {"n":${id}}\n\n`); if (id % 5 === 0) { clearInterval(iv); res.end(); } }, 30);
    req.on('close', () => clearInterval(iv)); return;
  }
  let p = u.pathname === '/' ? '/lab.html' : u.pathname;
  try { const b = await readFile(new URL('.' + p, import.meta.url)); res.setHeader('content-type', types[p.slice(p.lastIndexOf('.'))] || 'text/plain'); res.end(b); } catch { res.statusCode = 404; res.end('404'); }
});
const wss = new WebSocketServer({ server: srv, path: '/ws' });
wss.on('connection', (ws) => { ws.on('message', (m, bin) => { const t = bin ? m : m.toString(); if (t === 'fechar') ws.close(4001, 'pedido do cliente'); else ws.send(bin ? m : 'eco:' + t, { binary: bin }); }); });
srv.listen(8765, '127.0.0.1', () => console.log('ok 8765'));
