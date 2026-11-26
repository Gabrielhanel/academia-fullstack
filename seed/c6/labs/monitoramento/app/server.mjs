// App do laboratório C6.6: métricas no formato de exposição do Prometheus (escrito à mão) e logs JSON.
import http from 'node:http';
import { performance } from 'node:perf_hooks';
const BUCKETS = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1];
const PADRAO_MS = [5, 8, 12, 20, 35, 50, 70, 90, 120, 300]; // latências determinísticas de /ok (ciclo de 10)
const contadores = new Map(); const hist = new Map(); let n = 0, ok = 0;
const inc = (rota, status) => contadores.set(rota + '|' + status, (contadores.get(rota + '|' + status) || 0) + 1);
function observar(rota, seg) {
  const h = hist.get(rota) || { b: BUCKETS.map(() => 0), soma: 0, cont: 0 };
  BUCKETS.forEach((le, i) => { if (seg <= le) h.b[i]++; });
  h.soma += seg; h.cont++; hist.set(rota, h);
}
function metricas() {
  const l = ['# HELP http_requests_total Total de requisições HTTP.', '# TYPE http_requests_total counter'];
  for (const [k, v] of contadores) { const [rota, status] = k.split('|'); l.push(`http_requests_total{rota="${rota}",status="${status}"} ${v}`); }
  l.push('# HELP http_request_duration_seconds Duração das requisições.', '# TYPE http_request_duration_seconds histogram');
  for (const [rota, h] of hist) {
    BUCKETS.forEach((le, i) => l.push(`http_request_duration_seconds_bucket{rota="${rota}",le="${le}"} ${h.b[i]}`));
    l.push(`http_request_duration_seconds_bucket{rota="${rota}",le="+Inf"} ${h.cont}`, `http_request_duration_seconds_sum{rota="${rota}"} ${h.soma}`, `http_request_duration_seconds_count{rota="${rota}"} ${h.cont}`);
  }
  return l.join('\n') + '\n';
}
function responder(req, res, rota, status, ms, corpo) {
  const t0 = performance.now();
  setTimeout(() => {
    const dur = ms / 1000 + (performance.now() - t0 - ms) / 1000; // inclui o atraso real do temporizador
    res.writeHead(status, { 'content-type': 'text/plain' }); res.end(corpo);
    inc(rota, status); observar(rota, dur);
    console.log(JSON.stringify({ ts: new Date().toISOString(), nivel: status >= 500 ? 'error' : 'info', rota, status, duracao_ms: +(dur * 1000).toFixed(3), id: ++n }));
  }, ms);
}
http.createServer((req, res) => {
  if (req.url === '/metrics') { res.writeHead(200, { 'content-type': 'text/plain; version=0.0.4' }); return res.end(metricas()); }
  if (req.url === '/ok') return responder(req, res, '/ok', 200, PADRAO_MS[ok++ % PADRAO_MS.length], 'ok');
  if (req.url === '/erro') return responder(req, res, '/erro', 500, 5, 'erro');
  res.writeHead(404); res.end();
}).listen(3000, '0.0.0.0');
