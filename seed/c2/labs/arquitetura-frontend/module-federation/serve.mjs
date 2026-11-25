import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const tipos = { '.js': 'text/javascript', '.html': 'text/html', '.json': 'application/json', '.css': 'text/css' };
function srv(dir, porta) { http.createServer((req, res) => { let p = req.url.split('?')[0]; if (p === '/') p = '/index.html'; const f = path.join(dir, p); res.setHeader('access-control-allow-origin', '*'); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.statusCode = 404; return res.end('x'); } res.setHeader('content-type', tipos[path.extname(f)] || 'application/octet-stream'); res.end(fs.readFileSync(f)); }).listen(porta); }
srv('remote/dist', 4174); srv('host/dist', 4173); console.log('servidores');
