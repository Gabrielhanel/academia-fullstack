// Servidor estático para preview/dist (sem cache) + persistência do progresso do aluno em disco.
// Uso: node preview/serve.mjs [porta]
//   GET/PUT /__progress  →  preview/data/progress.json  (backups em preview/data/backups/, no máx. 1 a cada 10 min, últimos 30)
import { createServer } from 'node:http';
import { readFile, writeFile, rename, mkdir, readdir, rm, copyFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const dir = fileURLToPath(new URL('./dist/', import.meta.url));
const data = fileURLToPath(new URL('./data/', import.meta.url));
const FILE = data + 'progress.json', BK = data + 'backups/';
const port = Number(process.argv[2] || 8081);
const types = { '.html': 'text/html; charset=utf-8', '.json': 'application/json; charset=utf-8' };
const localOrigin = (req) => { const o = req.headers.origin; return !o || /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(o); };

async function saveProgress(body) {
  const o = JSON.parse(body); if (!o || o.v !== 2 || typeof o.courses !== 'object') throw new Error('estado inválido');
  await mkdir(BK, { recursive: true });
  try { const st = await stat(FILE); const last = (await readdir(BK)).sort().pop(); const lastT = last ? Number(last.replace(/\D/g, '')) : 0;
    if (Date.now() - lastT > 10 * 60 * 1000) { await copyFile(FILE, BK + 'progress-' + Date.now() + '.json'); const all = (await readdir(BK)).sort(); for (const f of all.slice(0, Math.max(0, all.length - 30))) await rm(BK + f); } } catch (e) { /* primeiro arquivo */ }
  await writeFile(FILE + '.tmp', body); await rename(FILE + '.tmp', FILE); // gravação atômica
}

createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p === '/__progress') {
    if (!localOrigin(req)) { res.writeHead(403).end(); return; }
    if (req.method === 'GET') { try { const b = await readFile(FILE); res.writeHead(200, { 'content-type': types['.json'], 'cache-control': 'no-store' }).end(b); } catch (e) { res.writeHead(404).end(); } return; }
    if (req.method === 'PUT') { let b = ''; let big = false; req.on('data', (c) => { b += c; if (b.length > 20e6) { big = true; req.destroy(); } }); req.on('end', async () => { if (big) return; try { await saveProgress(b); res.writeHead(204).end(); } catch (e) { res.writeHead(400).end(String(e.message)); } }); return; }
    res.writeHead(405).end(); return;
  }
  if (p === '/') p = '/index.html';
  if (p.includes('..')) { res.writeHead(400).end(); return; }
  try { const b = await readFile(dir + p.slice(1)); res.writeHead(200, { 'content-type': types[p.slice(p.lastIndexOf('.'))] || 'application/octet-stream', 'cache-control': 'no-store' }).end(b); }
  catch (e) { res.writeHead(404).end('não encontrado'); }
}).listen(port, '127.0.0.1', () => console.log('preview em http://127.0.0.1:' + port + ' | progresso em ' + FILE));
