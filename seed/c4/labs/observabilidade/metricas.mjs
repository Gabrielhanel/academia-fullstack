import client from 'prom-client';
console.log('prom-client 15.1.3 | Node', process.version);
console.log('== 1. tipos de métrica e o formato de exposição');
const reg = new client.Registry();
const reqs = new client.Counter({ name: 'http_requests_total', help: 'Requisições HTTP', labelNames: ['rota', 'status'], registers: [reg] });
const emAndamento = new client.Gauge({ name: 'http_requests_in_flight', help: 'Em andamento', registers: [reg] });
const buckets = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1];
const dur = new client.Histogram({ name: 'http_request_duration_seconds', help: 'Duração', labelNames: ['rota'], buckets, registers: [reg] });
reqs.inc({ rota: '/pedidos', status: '200' }, 90); reqs.inc({ rota: '/pedidos', status: '500' }, 10); emAndamento.set(3);
const amostras = []; let s = 7; const rnd = () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
for (let i = 0; i < 1000; i++) { const v = 0.01 + (-Math.log(1 - rnd())) * 0.03; amostras.push(v); dur.observe({ rota: '/pedidos' }, v); }
const texto = await reg.metrics();
console.log(texto.split('\n').filter((l) => /^(http_requests_total|http_request_duration_seconds_(bucket\{.*le="(0.05|0.1|0.25|\+Inf)"|sum|count))/.test(l) || l.startsWith('# TYPE')).join('\n'));

console.log('\n== 2. percentil estimado pelos buckets x exato (1.000 observações)');
amostras.sort((a, b) => a - b); const exato = (q) => amostras[Math.floor(q * amostras.length)];
const cumul = buckets.map((b) => amostras.filter((v) => v <= b).length);
const estima = (q) => { const alvo = q * amostras.length; let i = cumul.findIndex((c) => c >= alvo); const ant = i === 0 ? 0 : cumul[i - 1], limInf = i === 0 ? 0 : buckets[i - 1]; return limInf + (buckets[i] - limInf) * ((alvo - ant) / (cumul[i] - ant)); };
for (const q of [0.5, 0.95, 0.99]) console.log('p' + q * 100, '| exato:', (exato(q) * 1000).toFixed(1), 'ms | estimado pelos buckets (interpolação linear, como o histogram_quantile):', (estima(q) * 1000).toFixed(1), 'ms');
console.log('(a precisão depende da escolha dos buckets: o erro cresce onde os buckets são largos)');

console.log('\n== 3. cardinalidade: labels com valores ilimitados (userId)');
for (const n of [100, 1000, 10000, 50000]) {
  const r2 = new client.Registry(); const c = new client.Counter({ name: 'acessos_total', help: 'x', labelNames: ['usuario'], registers: [r2] });
  const mem0 = process.memoryUsage().heapUsed; for (let i = 0; i < n; i++) c.inc({ usuario: 'u' + i });
  const t0 = performance.now(); const t = await r2.metrics(); const ms = performance.now() - t0;
  console.log(String(n).padStart(6), 'séries | resposta de /metrics:', (Buffer.byteLength(t) / 1024).toFixed(0).padStart(6), 'KiB | tempo para gerar:', ms.toFixed(1).padStart(7), 'ms | heap (aprox.):', ((process.memoryUsage().heapUsed - mem0) / 1048576).toFixed(1), 'MiB');
}
const h = new client.Histogram({ name: 'h', help: 'x', labelNames: ['rota'], buckets, registers: [new client.Registry()] });
console.log('\nséries de um histograma por valor de label: buckets (' + buckets.length + ' + Inf) + sum + count =', buckets.length + 1 + 2, 'séries por combinação de labels');
console.log('\n== 4. métricas padrão do processo (coletarDefault)');
const reg2 = new client.Registry(); client.collectDefaultMetrics({ register: reg2 });
const nomes = (await reg2.metrics()).split('\n').filter((l) => l.startsWith('# TYPE')).map((l) => l.split(' ')[2]);
console.log('quantidade:', nomes.length, '| exemplos:', nomes.filter((n) => /eventloop_lag_seconds|heap_size_used|cpu_user|open_handles|gc_duration|resident_memory/.test(n)).slice(0, 6).join(', '));
