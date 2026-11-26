// Receptor de webhook do Alertmanager (laboratório): imprime cada alerta recebido.
import http from 'node:http';
http.createServer((req, res) => {
  let b = ''; req.on('data', (c) => (b += c));
  req.on('end', () => {
    try { const j = JSON.parse(b); for (const a of j.alerts) console.log(`${new Date().toISOString()} ALERTA status=${a.status} alertname=${a.labels.alertname} severidade=${a.labels.severidade || '-'}`); } catch { console.log('corpo inválido'); }
    res.writeHead(200); res.end('ok');
  });
}).listen(9000, '0.0.0.0');
