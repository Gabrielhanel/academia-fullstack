// App mínimo do laboratório C6.3: mostra o que o proxy repassou.
import http from 'node:http';
const NOME = process.env.NOME || 'app';
const ATRASO = Number(process.env.ATRASO || 0);
const grande = JSON.stringify({ instancia: NOME, itens: Array.from({ length: 400 }, (_, i) => ({ id: i, texto: 'linha de exemplo repetitiva ' + i % 7 })) });
http.createServer((req, res) => {
  const h = req.headers;
  const corpo = req.url.startsWith('/grande') ? grande : JSON.stringify({ instancia: NOME, host: h.host, xff: h['x-forwarded-for'] || null, xrealip: h['x-real-ip'] || null, xproto: h['x-forwarded-proto'] || null, remoto: req.socket.remoteAddress });
  const responder = () => { res.writeHead(200, { 'content-type': 'application/json' }); res.end(corpo); };
  if (req.url.startsWith('/saude')) { res.writeHead(200); return res.end('ok'); }
  (ATRASO && req.url.startsWith('/lento')) ? setTimeout(responder, ATRASO) : responder();
}).listen(3000, '0.0.0.0');
