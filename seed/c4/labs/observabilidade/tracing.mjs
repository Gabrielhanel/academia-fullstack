import express from 'express';
import { context, propagation, trace, SpanKind, SpanStatusCode } from '@opentelemetry/api';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { TracerProvider, SimpleSpanProcessor, InMemorySpanExporter, TraceIdRatioBasedSampler, ParentBasedSampler, AlwaysOnSampler } from '@opentelemetry/sdk-trace';
const sleep = (ms) => new Promise((x) => setTimeout(x, ms));
console.log('@opentelemetry/api 1.10.0 | sdk-trace 3.1.1 | context-async-hooks 3.1.1 | exportador em memória (sem backend externo)');
context.setGlobalContextManager(new AsyncLocalStorageContextManager().enable());
propagation.setGlobalPropagator(new W3CTraceContextPropagator());
let exportador = new InMemorySpanExporter();
const iniciaProvider = (sampler) => { exportador = new InMemorySpanExporter(); const p = new TracerProvider({ sampler, spanProcessors: [new SimpleSpanProcessor({ exporter: exportador })] }); trace.setGlobalTracerProvider(p); return p; };
let provider = iniciaProvider(new AlwaysOnSampler());
const tracer = (n) => trace.getTracer(n);

// serviço "estoque" e serviço "pedidos" (cada um é uma aplicação HTTP) e uma chamada do cliente
const servidor = (nome, handler) => { const a = express(); a.get('/x', async (req, res) => { const ctx = propagation.extract(context.active(), req.headers); const span = tracer(nome).startSpan('GET /x', { kind: SpanKind.SERVER, attributes: { 'http.route': '/x', 'servico': nome } }, ctx); await context.with(trace.setSpan(ctx, span), async () => { try { await handler(req, res); } catch (e) { span.recordException(e); span.setStatus({ code: SpanStatusCode.ERROR, message: e.message }); res.status(500).json({ erro: e.message }); } finally { span.end(); } }); }); return new Promise((ok) => { const s = a.listen(0, '127.0.0.1', () => ok({ s, b: 'http://127.0.0.1:' + s.address().port })); }); };
const chama = async (nome, url) => { const span = tracer(nome).startSpan('HTTP GET', { kind: SpanKind.CLIENT }); const h = {}; await context.with(trace.setSpan(context.active(), span), async () => { propagation.inject(context.active(), h); }); try { const r = await fetch(url, { headers: h }); span.setAttribute('http.status_code', r.status); return { r, cabecalho: h.traceparent }; } finally { span.end(); } };
const estoque = await servidor('estoque', async (req, res) => { await tracer('estoque').startActiveSpan('consulta SQL', async (s) => { await sleep(30); s.setAttribute('db.system', 'postgresql'); s.end(); }); res.json({ saldo: 5 }); });
const pedidos = await servidor('pedidos', async (req, res) => { await tracer('pedidos').startActiveSpan('validar', async (s) => { await sleep(5); s.end(); }); const { r } = await chama('pedidos', estoque.b + '/x'); await r.text(); res.json({ ok: true }); });
const id = (x) => x.slice(0, 8);

console.log('\n== 1. uma requisição atravessando 2 serviços: mesmo trace, spans em árvore');
await (await chama('cliente', pedidos.b + '/x')).r.text(); await sleep(100); exportador.reset();   // aquecimento (a primeira chamada paga a inicialização)
const { cabecalho } = await chama('cliente', pedidos.b + '/x'); await sleep(100);
const spans = exportador.getFinishedSpans();
const traceIds = new Set(spans.map((s) => s.spanContext().traceId));
console.log('cabeçalho traceparent enviado:', cabecalho.replace(/^(00-)(.{32})(-)(.{16})(-.*)$/, '$1<traceId 32 hex>$3<spanId 16 hex>$5'), '| formato versão-traceId-spanId-flags');
console.log('spans coletados:', spans.length, '| traceIds distintos:', traceIds.size);
const porId = Object.fromEntries(spans.map((s) => [s.spanContext().spanId, s]));
const profundidade = (s) => { let d = 0, p = s.parentSpanContext?.spanId; while (p && porId[p]) { d++; p = porId[p].parentSpanContext?.spanId; } return d; };
const raiz = spans.find((s) => !s.parentSpanContext);
const filhos = (id) => spans.filter((s) => s.parentSpanContext?.spanId === id).sort((a, b) => Number(BigInt(a.startTime[0]) * 1000000000n + BigInt(a.startTime[1]) - BigInt(b.startTime[0]) * 1000000000n - BigInt(b.startTime[1])));
const ms = (s) => (s.duration[0] * 1e3 + s.duration[1] / 1e6).toFixed(1);
const imprime = (s, n) => { console.log('  ' + '  '.repeat(n) + s.name, '| tipo:', ['INTERNAL', 'SERVER', 'CLIENT'][s.kind], '| duração:', ms(s), 'ms'); for (const f of filhos(s.spanContext().spanId)) imprime(f, n + 1); };
imprime(raiz, 0);
exportador.reset();

console.log('\n== 2. erro propagado como span com exceção');
const ruim = await servidor('quebrado', async () => { throw new Error('banco indisponível'); });
await chama('cliente', ruim.b + '/x'); await sleep(50);
const sp = exportador.getFinishedSpans().find((s) => s.status.code === SpanStatusCode.ERROR);
console.log('span em ERROR:', sp?.name, '| mensagem:', sp?.status.message, '| eventos registrados:', sp?.events.map((e) => e.name).join(','));
exportador.reset();

console.log('\n== 3. amostragem (sampling): 2.000 requisições com TraceIdRatioBasedSampler(0.1)');
// o registro global do provider só vale uma vez por processo (um segundo setGlobalTracerProvider é ignorado): aqui usamos um provider próprio
const exp2 = new InMemorySpanExporter(); const prov2 = new TracerProvider({ sampler: new ParentBasedSampler({ root: new TraceIdRatioBasedSampler(0.1) }), spanProcessors: [new SimpleSpanProcessor({ exporter: exp2 })] });
const t2 = prov2.getTracer('amostra');
for (let i = 0; i < 2000; i++) { const s = t2.startSpan('req'); s.end(); }
const gravados = exp2.getFinishedSpans().length;
console.log('spans registrados:', gravados, 'de 2000 (esperado ~200: 10%)');
exp2.reset(); let paisGravados = 0, filhosGravados = 0, filhosDePaisGravados = 0;
for (let i = 0; i < 500; i++) { const pai = t2.startSpan('pai'); const ctx = trace.setSpan(context.active(), pai); const f = t2.startSpan('filho', {}, ctx); if (pai.isRecording()) paisGravados++; if (f.isRecording()) filhosGravados++; if (pai.isRecording() && f.isRecording()) filhosDePaisGravados++; f.end(); pai.end(); }
console.log('em 500 pares pai-filho: pais gravados =', paisGravados, '| filhos gravados =', filhosGravados, '| filhos gravados cujo pai foi gravado =', filhosDePaisGravados, '(ParentBased: o filho segue a decisão do pai)');
estoque.s.close(); pedidos.s.close(); ruim.s.close();
