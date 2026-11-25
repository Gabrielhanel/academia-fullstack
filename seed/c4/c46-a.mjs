// C4.6 — Logs e observabilidade. Aulas 1 e 2 (logs estruturados; métricas e tracing com OpenTelemetry).
const R = String.raw;

export const REF = {
  pino: { title: 'Pino', url: 'https://getpino.io/', kind: 'doc' },
  twelveFactorLogs: { title: 'The Twelve-Factor App — Logs', url: 'https://12factor.net/logs', kind: 'doc' },
  owaspLogging: { title: 'OWASP — Logging Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html', kind: 'guia' },
  nodeAls: { title: 'Node.js — AsyncLocalStorage', url: 'https://nodejs.org/api/async_context.html', kind: 'doc' },
  promClient: { title: 'prom-client', url: 'https://github.com/siimon/prom-client', kind: 'doc' },
  promNaming: { title: 'Prometheus — Metric and label naming', url: 'https://prometheus.io/docs/practices/naming/', kind: 'doc' },
  promHistograms: { title: 'Prometheus — Histograms and summaries', url: 'https://prometheus.io/docs/practices/histograms/', kind: 'doc' },
  otelDocs: { title: 'OpenTelemetry — Documentation', url: 'https://opentelemetry.io/docs/', kind: 'doc' },
  otelJs: { title: 'OpenTelemetry — JavaScript', url: 'https://opentelemetry.io/docs/languages/js/', kind: 'doc' },
  otelSampling: { title: 'OpenTelemetry — Sampling', url: 'https://opentelemetry.io/docs/concepts/sampling/', kind: 'doc' },
  w3cTrace: { title: 'W3C — Trace Context', url: 'https://www.w3.org/TR/trace-context/', kind: 'especificação' }
};

export const lessonsA = [
{
  id: 'obs-01', moduleId: 'm1', order: 1, minutes: 80, tags: ['logs', 'logs estruturados', 'pino', 'correlação', 'AsyncLocalStorage', 'redação', 'níveis'],
  title: 'Logs estruturados: campos, níveis, correlação por requisição, redação de segredos e custo',
  objectives: ['Distinguir logs, métricas e traces e o papel de cada um na observabilidade', 'Emitir logs estruturados com pino e escolher níveis e campos úteis', 'Propagar o id da requisição a todos os logs com AsyncLocalStorage', 'Redigir segredos e dados pessoais nos logs', 'Estimar o custo e o volume de logs'],
  intro: R`**Monitorar** é saber **se** algo está errado; **observar** é conseguir descobrir **por quê**, mesmo para problemas que você nunca previu. Os três pilares são **logs** (eventos discretos), **métricas** (números agregados no tempo) e **traces** (o caminho de uma requisição). Esta aula trata dos **logs**: com **pino 10.4.0** você mede o **formato estruturado**, a **redação** de segredos, a **correlação por requisição** (todos os logs de uma requisição, mesmo entre funções assíncronas), o **custo** e o **volume**.`,
  theory: R`### Observabilidade em uma página
| Pilar | Responde | Forma | Custo |
|---|---|---|---|
| **Logs** | **o que aconteceu** neste caso | eventos com contexto | **alto volume** |
| **Métricas** | **quanto/quão rápido**, tendências, alertas | séries numéricas agregadas | **baixo e previsível** (cuidado com cardinalidade) |
| **Traces** | **onde** a requisição gastou tempo/falhou entre serviços | árvore de *spans* | médio (use amostragem) |
Usados **juntos**: a **métrica** dispara o alerta, o **trace** localiza o serviço lento e o **log** explica a causa. Um **id de correlação** (§traceId§/§reqId§) liga os três.

### Logs estruturados
**Texto livre** ("Pedido 42 criado em 12 ms") é ruim de **filtrar e agregar**. **Estruturado** = **um objeto JSON por linha**, com **campos** pesquisáveis:
§§§
{"level":30,"time":"2026-11-25T13:00:00.000Z","servico":"api-pedidos","versao":"1.4.2","pedidoId":42,"ms":12,"msg":"pedido criado"}
§§§
Medido (pino 10.4.0): a primeira linha trouxe **level, time, servico, versao, pedidoId, ms, msg**; o nível §debug§ **não saiu** com o nível §info§ (4 linhas emitidas de 5 chamadas); os níveis numéricos saíram **30 (info), 40 (warn), 50 (error), 30**; o **erro** foi serializado **com a stack** (§err.stack§). **Boas práticas**: **stdout** (a plataforma coleta: **12 fatores**), **uma linha por evento**, **campos estáveis e tipados**, **mensagem curta e constante** (o que varia vai em **campos**, para **agrupar**), **timestamp ISO/UTC**, **serviço e versão** em toda linha.

### Níveis
§fatal§ (o processo vai cair), §error§ (a operação falhou; **requer atenção**), §warn§ (anormal, **recuperado**), §info§ (marcos de negócio e ciclo de vida), §debug§/§trace§ (diagnóstico; **desligado em produção**, ligável **por serviço/rota** quando necessário). **Evite** "error" para **erros do cliente** (4xx esperados): vira ruído e **alertas falsos**. Medido: com o nível **warn** configurado, **200 mil** chamadas §info§ levaram só **6,5 ms** no total (**custo quase nulo** de chamadas desligadas).

### Contexto: child loggers e correlação
- **Child logger**: §log.child({ pedidoId: 42 })§ **herda** campos (medido: **true**).
- **Correlação por requisição**: sem passar o logger por todas as funções, use **§AsyncLocalStorage§** (aula nex-01 sobre contexto assíncrono) e o **§mixin§** do pino para **injetar o id** em **toda** linha. Medido: duas requisições **concorrentes** (§r-1§, §r-2§) com um serviço assíncrono no meio produziram, **agrupadas por reqId**: §["início","dentro do serviço","fim"]§ **para cada uma**, sem mistura. Gere (ou **aceite** do cabeçalho §x-request-id§/§traceparent§) o id na entrada e **devolva-o** na resposta; **propague-o** às chamadas a outros serviços (aulas api-08 e obs-02).

### Segurança: o que NÃO logar
- **Senhas, tokens, chaves, cartões, dados de saúde**; **dados pessoais** além do necessário (LGPD/GDPR: **minimização**), **corpos de requisição** inteiros;
- **Redação** na fonte: medido, com §redact: ['senha', '*.token', 'req.headers.authorization']§ e censura §[REDIGIDO]§, os três campos saíram **[REDIGIDO]**;
- **Injeção em logs** (*log forging*): estruturado em JSON **escapa** quebras de linha (outra vantagem sobre texto);
- **Acesso aos logs** controlado; **retenção** definida (prazo legal e custo); **imutabilidade** para auditoria.
(OWASP *Logging Cheat Sheet*.)

### Custo e volume (medidas desta máquina)
- **200 mil linhas** a um destino §Writable§ do Node: **pino ~1.430 ms** (~0,14 M linhas/s) × **JSON.stringify manual ~1.262 ms**: **o custo é dominado pelo stream**, não pelo formato; o pino **brilha** com destinos assíncronos (§sonic-boom§/§pino.transport§) e em **menos alocações** — **não generalize** este número;
- **Tamanho**: uma linha típica de requisição tem **~233 bytes**; **1 linha por requisição a 200 req/s** = **~4,0 GB por dia** (**cálculo**): logs **custam armazenamento e dinheiro**; **amostre** logs de sucesso de alto volume, **mantenha todos os erros**, **reduza campos**, defina **retenção** curta para debug e longa para auditoria.
- **Nunca** deixe o log **bloquear** a requisição: escreva em **stdout** de forma assíncrona e deixe o agente (Fluent Bit, Vector, Promtail) **enviar**.

### O que registrar numa API
**Uma linha por requisição** (§método, rota-padrão, status, duração, tamanho, usuário/tenant, reqId§), **eventos de negócio** importantes (pedido criado, pagamento recusado), **erros** com **contexto** (e a stack), **ciclo de vida** (início, parada, configuração **sem segredos**), **tentativas de autenticação** e **decisões de autorização negadas** (aulas aut-01 e aut-05), **jobs** (iniciou, concluiu, falhou, tentativa n) e **chamadas externas lentas**.
**Rota padronizada** (§/pedidos/:id§), **não** a URL com o id (alta cardinalidade ao agregar).

### Pilha de logs
**Coletor** (Fluent Bit/Vector) → **armazenamento/indexação** (Loki, Elasticsearch/OpenSearch, CloudWatch, Datadog) → **consulta e alertas**. **Loki** indexa **rótulos**, não o texto (mais barato); **ELK** indexa o texto (mais flexível, mais caro). (**Não executados** aqui.)`,
  concepts: [
    { term: 'Observabilidade', def: 'Capacidade de entender o estado interno de um sistema a partir de seus logs, métricas e traces.' },
    { term: 'Log estruturado', def: 'Registro em formato de dados (por exemplo JSON) com campos pesquisáveis.' },
    { term: 'Nível de log', def: 'Classificação de gravidade, como debug, info, warn, error e fatal.' },
    { term: 'Child logger', def: 'Logger derivado que herda campos de contexto do logger pai.' },
    { term: 'ID de correlação', def: 'Identificador que acompanha uma requisição e liga seus logs, métricas e traces.' },
    { term: 'AsyncLocalStorage', def: 'Mecanismo do Node para manter um contexto através de chamadas assíncronas.' },
    { term: 'Redação (redact)', def: 'Substituição de campos sensíveis nos logs por um marcador antes da escrita.' },
    { term: 'Log forging', def: 'Injeção de linhas falsas em logs de texto por meio de quebras de linha na entrada.' },
    { term: 'Retenção', def: 'Prazo durante o qual os logs são guardados antes de serem descartados.' },
    { term: 'Cardinalidade', def: 'Quantidade de valores distintos de um campo ou rótulo.' }
  ],
  examples: R`**Analogia:** o **log** é o **diário de bordo do navio**: cada evento anotado com **hora, posição e responsável**. O **estruturado** é o diário em **colunas** (você filtra "todas as ocorrências da rota X com atraso > 10 s"), o de texto livre é um **romance**. O **id de correlação** é o **número da viagem** escrito em **todas as páginas** de todos os cadernos (casa de máquinas, ponte, cozinha) — sem ele, ninguém liga o que aconteceu em cada setor. A **redação** é **tarjar o cartão de crédito do passageiro** antes de arquivar o recibo.

**Exemplo 1: redação.** senha, token e authorization saíram como [REDIGIDO].

**Exemplo 2: correlação.** Duas requisições concorrentes: logs agrupados corretamente por reqId.

**Exemplo 3: volume.** 233 B por linha a 200 req/s ≈ 4 GB/dia.`,
  code: [
    { title: 'Logger com redação, mixin de correlação e AsyncLocalStorage (JavaScript, pino 10.4.0; saídas medidas)', lang: 'js', code: R`import pino from 'pino';
import { AsyncLocalStorage } from 'node:async_hooks';
import crypto from 'node:crypto';

const als = new AsyncLocalStorage();
export const log = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  base: { servico: 'api-pedidos', versao: process.env.VERSAO },
  redact: { paths: ['senha', '*.token', 'req.headers.authorization'], censor: '[REDIGIDO]' },
  timestamp: pino.stdTimeFunctions.isoTime,
  mixin: () => ({ reqId: als.getStore()?.reqId })                      // injeta o id em TODA linha, em qualquer função
});

app.use((req, res, next) => {
  const reqId = req.get('x-request-id') ?? crypto.randomUUID();
  res.set('x-request-id', reqId);
  const t0 = performance.now();
  res.on('finish', () => log.info({ metodo: req.method, rota: req.route?.path ?? req.path, status: res.statusCode, ms: Math.round(performance.now() - t0) }, 'requisição concluída'));
  als.run({ reqId }, next);                                            // todo o restante roda neste contexto
});`, notes: [{ l: '11', t: 'O mixin lê o contexto assíncrono a cada linha.' }, { l: '19', t: 'als.run mantém o id através de awaits e callbacks.' }] },
    { title: 'Logando erros e eventos de negócio (JavaScript)', lang: 'js', code: R`try {
  await cobrar(pedido);
  log.info({ pedidoId: pedido.id, valor: pedido.total }, 'pagamento aprovado');            // mensagem constante; o que varia vai em campos
} catch (err) {
  log.error({ err, pedidoId: pedido.id }, 'falha ao cobrar');                              // err serializado com message e stack
  throw err;
}
// evite: log.info('Pedido ' + pedido.id + ' pago');  e logar o corpo inteiro da requisição`, notes: [{ l: '5', t: 'A chave err faz o pino serializar a stack.' }, { l: '8', t: 'Mensagens variáveis impedem agrupar eventos iguais.' }] }
  ],
  bestPractices: ['Emita JSON por linha em stdout com serviço, versão e id de correlação.', 'Mantenha a mensagem constante e coloque o que varia em campos.', 'Redija segredos e dados pessoais na fonte e minimize o que é logado.', 'Use níveis com critério e não registre erros do cliente como error.', 'Amostre logs de sucesso de alto volume e mantenha todos os erros.', 'Defina retenção e controle de acesso aos logs.'],
  mistakes: ['Logs em texto livre impossíveis de agregar.', 'Registrar senhas, tokens ou corpos inteiros.', 'Sem id de correlação entre as linhas de uma requisição.', 'Usar a URL com o id como rota nas métricas e logs agregados.', 'Deixar debug ligado em produção.', 'Bloquear a requisição ao escrever logs.'],
  market: R`Logs estruturados e correlação são a base de qualquer plantão e de investigações pós-incidente; vazamento de segredos em logs é um achado comum de auditorias.`,
  summary: R`Logs, métricas e traces se complementam e se ligam por um id de correlação. Medido com o pino 10.4.0: JSON com serviço, versão e campos; debug omitido no nível info; redação de senha, token e authorization; child logger herdando campos; duas requisições concorrentes com logs corretamente agrupados via AsyncLocalStorage; chamadas desligadas custaram 6,5 ms por 200 mil; ~233 bytes por linha (~4 GB/dia a 200 req/s, cálculo). Registre estruturado, sem segredos, com retenção e amostragem.`,
  refs: [REF.pino, REF.twelveFactorLogs, REF.owaspLogging, REF.nodeAls],
  cards: [
    { q: 'Qual a diferença entre logs, métricas e traces?', a: 'Logs são eventos com contexto; métricas, números agregados; traces, o caminho de uma requisição entre serviços.' },
    { q: 'Como correlacionar todos os logs de uma requisição?', a: 'Com um id gerado na entrada, mantido por AsyncLocalStorage e injetado em cada linha (mixin).' },
    { q: 'Por que manter a mensagem constante?', a: 'Para agrupar eventos iguais; o que varia vai em campos.' },
    { q: 'O que nunca logar?', a: 'Senhas, tokens, chaves, cartões e dados pessoais desnecessários.' },
    { q: 'Quanto custam os logs em volume?', a: 'Medido: ~233 bytes por linha; a 200 req/s, ~4 GB/dia (cálculo); amostre e defina retenção.' }
  ]
},
{
  id: 'obs-02', moduleId: 'm1', order: 2, minutes: 90, tags: ['métricas', 'tracing', 'OpenTelemetry', 'prom-client', 'histogramas', 'cardinalidade', 'traceparent', 'amostragem'],
  title: 'Métricas e tracing: tipos de métrica, histogramas, cardinalidade e OpenTelemetry com propagação de contexto',
  objectives: ['Escolher entre Counter, Gauge e Histogram e expor métricas no formato do Prometheus', 'Entender como percentis são estimados por buckets e o efeito da escolha deles', 'Medir a explosão de cardinalidade de labels sem limite', 'Criar spans, propagar o traceparent entre serviços e ler a árvore do trace', 'Aplicar amostragem de traces'],
  intro: R`**Métricas** são números agregados no tempo: baratos, ideais para **alertas e tendências**. **Traces** mostram **o caminho** de **uma** requisição por vários serviços. Aqui, com **prom-client 15.1.3** e **OpenTelemetry (API 1.10.0, SDK de traces 3.1.1)**, você mede a **estimativa de percentis por buckets** (p99: **221 ms** estimado × **164 ms** exato), a **cardinalidade** (de **3 KiB** a **1,6 MiB** em /metrics) e **propaga um trace** por dois serviços (**6 spans, 1 trace**).`,
  theory: R`### Tipos de métrica (modelo do Prometheus)
- **Counter**: valor que **só aumenta** (§http_requests_total§, erros); consulta-se a **taxa** (§rate()§), nunca o valor bruto;
- **Gauge**: valor que **sobe e desce** (§em andamento§, memória, tamanho da fila);
- **Histogram**: **distribuição** (latência) em **buckets** acumulados + §_sum§ + §_count§; permite **percentis** agregáveis entre instâncias;
- **Summary**: percentis calculados **no cliente** (**não agregáveis** entre instâncias).
Convenções de nome: **unidade no nome** (§_seconds§, §_bytes§), **§_total§** em counters, **minúsculas com sublinhado** (§http_request_duration_seconds§).

### Formato de exposição (medido, prom-client 15.1.3)
§§§
# TYPE http_requests_total counter
http_requests_total{rota="/pedidos",status="200"} 90
http_requests_total{rota="/pedidos",status="500"} 10
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{le="0.05",rota="/pedidos"} 741
http_request_duration_seconds_bucket{le="0.1",rota="/pedidos"} 948
http_request_duration_seconds_bucket{le="+Inf",rota="/pedidos"} 1000
http_request_duration_seconds_sum{rota="/pedidos"} 39.77...
http_request_duration_seconds_count{rota="/pedidos"} 1000
§§§
Os **buckets são acumulados** (§le§ = "menor ou igual a"). **Métricas padrão** do processo: **31** séries medidas (CPU, memória residente, heap, **§nodejs_eventloop_lag_seconds§**, GC...), ligadas com §collectDefaultMetrics()§.

### Percentis e a escolha dos buckets (medido)
O Prometheus **estima** o percentil por **interpolação linear dentro do bucket**. Com 1.000 observações:
| Percentil | Exato | Estimado pelos buckets |
|---|---|---|
| p50 | 29,7 ms | 31,4 ms |
| p95 | 101,6 ms | 105,8 ms |
| **p99** | **164,1 ms** | **221,2 ms** |
O erro **cresce onde os buckets são largos** (entre 0,1 e 0,25 s): para um SLO de p99 < 200 ms, **coloque buckets em volta de 0,2 s** (§..., 0.1, 0.15, 0.2, 0.25, ...§). **Médias escondem** a cauda: use **percentis** (p95, p99). **Não** calcule média de percentis; **agregue buckets** e depois estime.

### Cardinalidade: o assassino silencioso
Cada **combinação de valores de labels** é uma **série temporal** (que o Prometheus **guarda em memória** e **indexa**). Medido (um Counter com label §usuario§):
| Séries | Tamanho de /metrics | Tempo para gerar | Heap (aprox.) |
|---|---|---|---|
| 100 | 3 KiB | 2,5 ms | ~0 |
| 1.000 | 31 KiB | 18,5 ms | 0,9 MiB |
| 10.000 | 321 KiB | 91,7 ms | 7,1 MiB |
| **50.000** | **1.649 KiB** | **426 ms** | **23,9 MiB** |
Um **histograma** com 8 buckets gera **11 séries por combinação de labels** (9 buckets incl. +Inf, sum e count): labels **multiplicam** (rotas × status × método...). **Regras**: **nunca** use como label **ids de usuário, e-mails, URLs completas, ids de requisição**; use a **rota padronizada** (§/pedidos/:id§), **status** em classes quando possível; **limite** o conjunto de valores; **detalhe por exemplar/trace/log**, não por label.

### O que medir: RED e USE
- **RED** (serviços): **R**ate (requisições/s), **E**rrors (taxa de erros), **D**uration (latência p50/p95/p99);
- **USE** (recursos): **U**tilization, **S**aturation, **E**rrors (CPU, memória, disco, filas);
- **Os quatro sinais de ouro** (Google SRE): latência, tráfego, erros e **saturação** (tamanho de filas, atraso do event loop: aula nex-01).
**Negócio**: pedidos criados, pagamentos aprovados, jobs na fila e **idade do mais antigo** (aula fil-01).

### Tracing distribuído com OpenTelemetry
- **Trace** = a **árvore de spans** de **uma** requisição; **span** = uma operação com **início, duração, atributos, eventos e status**; **spans** têm **traceId** (compartilhado), **spanId** e **parentSpanId**.
- **Propagação**: o cliente injeta o cabeçalho **W3C §traceparent§** (§00-<traceId 32 hex>-<spanId 16 hex>-01§: versão, traceId, spanId, flags) e o servidor o **extrai** e cria um span **filho**.
Medido (dois serviços HTTP: **pedidos** → **estoque**, exportador em memória; **a primeira chamada pagou a inicialização e foi descartada**): **6 spans, 1 único traceId**, em árvore:
§§§
HTTP GET (CLIENT)                54,1 ms
 └ GET /x (SERVER, pedidos)       47,3 ms
    ├ validar (INTERNAL)           5,7 ms
    └ HTTP GET (CLIENT)           38,7 ms
       └ GET /x (SERVER, estoque)  32,3 ms
          └ consulta SQL (INTERNAL)  30,0 ms
§§§
**Leitura**: dos **54 ms** totais, **~30 ms** estão na **consulta SQL do estoque**: o trace **localiza o gargalo** que a métrica sozinha só indicaria como "lento".
**Erros**: um handler que lançou **"banco indisponível"** gerou um span com **status ERROR** e o **evento §exception§** (§span.recordException§) — medido.

### Amostragem (sampling)
Guardar **todos** os traces é caro. **Head-based**: decide **no início** (§TraceIdRatioBasedSampler(0.1)§): medido, **203 de 2.000** traces registrados (~10%); **§ParentBasedSampler§** faz o **filho seguir a decisão do pai**, mantendo traces **completos**: medido, em **500** pares pai-filho, **60** pais gravados, **60** filhos gravados e **60** filhos de pais gravados (**coerente**). **Tail-based** (decidir **depois**, guardando **erros e lentos**) exige um **coletor** (OpenTelemetry Collector; **não executado**). Combine: **amostragem baixa** do normal + **100% de erros**.

### OpenTelemetry na prática
**API** (instrumentação estável: §@opentelemetry/api§) separada do **SDK** (implementação) e de **exportadores** (OTLP → Collector → Jaeger/Tempo/Datadog). **Auto-instrumentação** (HTTP, Express, pg, ioredis, BullMQ...; **não executada** aqui) cria spans automaticamente. **Convenções semânticas** (§http.route§, §db.system§...) padronizam atributos. **Versões**: o SDK 3.x mudou classes e opções (por exemplo, §SimpleSpanProcessor({ exporter })§, **registro global do provider uma só vez** por processo): **fixe versões** e leia o guia da versão.

### Ligando os pilares
Coloque o **§traceId§** nos **logs** (mixin da aula obs-01) e nos **exemplars** das métricas: do alerta ao trace e ao log **em um clique**.`,
  concepts: [
    { term: 'Counter', def: 'Métrica que só aumenta; consulta-se sua taxa de variação.' },
    { term: 'Gauge', def: 'Métrica que pode subir e descer, como itens em andamento.' },
    { term: 'Histogram', def: 'Métrica que conta observações em buckets acumulados, permitindo estimar percentis.' },
    { term: 'Bucket', def: 'Faixa de valores de um histograma; os buckets são acumulados (le = menor ou igual).' },
    { term: 'Cardinalidade de séries', def: 'Número de combinações distintas de valores de labels de uma métrica.' },
    { term: 'RED', def: 'Método de monitoramento de serviços: Rate, Errors, Duration.' },
    { term: 'Span', def: 'Unidade de trabalho de um trace, com início, duração, atributos e status.' },
    { term: 'traceparent', def: 'Cabeçalho W3C que propaga o traceId e o spanId entre serviços.' },
    { term: 'Amostragem head-based', def: 'Decisão de gravar ou não um trace tomada no início da requisição.' },
    { term: 'Exemplar', def: 'Ponteiro de uma amostra de métrica para o trace correspondente.' }
  ],
  examples: R`**Analogia:** a **métrica** é o **painel do carro** (velocidade, temperatura): barato, instantâneo, ótimo para **alertar** ("a temperatura subiu"). O **histograma** é um **gráfico de quantos carros passaram em cada faixa de velocidade** — com faixas largas demais, o **radar** confunde 140 e 220 km/h. A **cardinalidade** é **instalar um painel para cada passageiro**: o carro não aguenta. O **trace** é o **GPS do trajeto de uma entrega**: mostra que dos 54 minutos, **30 foram no trânsito do estoque**. A **amostragem** é **rastrear só 1 em cada 10 entregas** (e todas as que se atrasaram).

**Exemplo 1: p99.** 164 ms exato; 221 ms estimado por buckets largos.

**Exemplo 2: cardinalidade.** 50 mil séries: 1,6 MiB por coleta e 426 ms para gerar.

**Exemplo 3: trace.** 6 spans em 1 trace; o gargalo está na consulta SQL (30 ms de 54).`,
  code: [
    { title: 'Métricas HTTP com prom-client (JavaScript, formato medido)', lang: 'js', code: R`import client from 'prom-client';
const reg = new client.Registry(); client.collectDefaultMetrics({ register: reg });
const reqs = new client.Counter({ name: 'http_requests_total', help: 'Requisições HTTP', labelNames: ['rota', 'status'], registers: [reg] });
const dur = new client.Histogram({ name: 'http_request_duration_seconds', help: 'Duração', labelNames: ['rota'], registers: [reg],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.15, 0.2, 0.25, 0.5, 1] });             // buckets densos perto do SLO de 200 ms

app.use((req, res, next) => {
  const fim = dur.startTimer();
  res.on('finish', () => {
    const rota = req.route?.path ?? 'desconhecida';                                  // rota padronizada, nunca a URL com ids
    reqs.inc({ rota, status: String(res.statusCode) }); fim({ rota });
  });
  next();
});
app.get('/metrics', async (req, res) => { res.set('Content-Type', reg.contentType); res.end(await reg.metrics()); });`, notes: [{ l: '10', t: 'Rota padronizada evita explosão de cardinalidade.' }, { l: '6', t: 'startTimer mede a duração em segundos.' }] },
    { title: 'Spans e propagação do traceparent (JavaScript, @opentelemetry/api 1.10.0 e sdk-trace 3.1.1; resultado medido)', lang: 'js', code: R`import { context, propagation, trace, SpanKind } from '@opentelemetry/api';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { TracerProvider, SimpleSpanProcessor, InMemorySpanExporter, AlwaysOnSampler } from '@opentelemetry/sdk-trace';

context.setGlobalContextManager(new AsyncLocalStorageContextManager().enable());
propagation.setGlobalPropagator(new W3CTraceContextPropagator());
trace.setGlobalTracerProvider(new TracerProvider({ sampler: new AlwaysOnSampler(), spanProcessors: [new SimpleSpanProcessor({ exporter: new InMemorySpanExporter() })] }));

// cliente: injeta o traceparent
const span = trace.getTracer('pedidos').startSpan('HTTP GET', { kind: SpanKind.CLIENT });
const headers = {}; context.with(trace.setSpan(context.active(), span), () => propagation.inject(context.active(), headers));
await fetch(urlEstoque, { headers }); span.end();

// servidor: extrai o contexto e cria um span filho
const ctx = propagation.extract(context.active(), req.headers);
const srv = trace.getTracer('estoque').startSpan('GET /x', { kind: SpanKind.SERVER }, ctx);
// ... srv.recordException(e); srv.setStatus({ code: 2, message: e.message }); srv.end();`, notes: [{ l: '6', t: 'O contexto assíncrono mantém o span ativo entre awaits.' }, { l: '12', t: 'inject coloca o traceparent nos cabeçalhos.' }, { l: '16', t: 'extract recria o contexto no servidor.' }] }
  ],
  bestPractices: ['Meça RED nos serviços e USE nos recursos, com percentis e buckets bem escolhidos.', 'Nunca use ids ilimitados como labels; padronize rotas.', 'Prefira histogramas a summaries quando precisar agregar entre instâncias.', 'Propague o traceparent em todas as chamadas e coloque o traceId nos logs.', 'Amostre traces e guarde todos os erros.', 'Fixe as versões do OpenTelemetry e leia o guia da versão.'],
  mistakes: ['Label com userId ou URL completa.', 'Média de latência em vez de percentis.', 'Buckets largos onde está o SLO.', 'Esquecer de propagar o contexto entre serviços e filas.', 'Guardar 100% dos traces sem necessidade.', 'Registrar o provider global do OpenTelemetry duas vezes.'],
  market: R`Métricas com percentis e tracing distribuído são o que permite operar sistemas com muitos serviços; OpenTelemetry é o padrão aberto adotado pelo mercado.`,
  summary: R`Counter, Gauge e Histogram são os tipos centrais; o histograma estima percentis por buckets (medido: p99 de 221 ms estimado contra 164 ms exato com buckets largos). A cardinalidade explode com labels ilimitadas (50 mil séries: 1,6 MiB e 426 ms por coleta). Com OpenTelemetry, o traceparent propaga o contexto: 6 spans em 1 trace por 2 serviços mostraram ~30 ms na consulta SQL de 54 ms totais; um erro virou span ERROR com exceção; a amostragem de 10% registrou 203 de 2.000 e o ParentBased manteve os traces completos.`,
  refs: [REF.promClient, REF.promNaming, REF.promHistograms, REF.otelDocs, REF.otelJs, REF.otelSampling, REF.w3cTrace],
  cards: [
    { q: 'Quando usar Counter, Gauge e Histogram?', a: 'Counter para o que só cresce, Gauge para valores que sobem e descem, Histogram para distribuições como a latência.' },
    { q: 'Por que a cardinalidade importa?', a: 'Cada combinação de labels é uma série em memória: 50 mil séries geraram 1,6 MiB e 426 ms por coleta (medido).' },
    { q: 'Por que escolher bem os buckets?', a: 'A estimativa de percentil interpola dentro do bucket; medido: p99 estimado 221 ms contra 164 ms exato.' },
    { q: 'O que o traceparent faz?', a: 'Propaga o traceId e o spanId entre serviços para formar uma única árvore de spans.' },
    { q: 'O que o ParentBasedSampler garante?', a: 'Que filhos seguem a decisão do pai, mantendo os traces completos.' }
  ]
}
];
