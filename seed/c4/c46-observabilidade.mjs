// Curso C4.6 da C4: Logs e observabilidade (disciplina: obs).
import { makeCourse } from '../courses/_lib.mjs';
import { REF, lessonsA } from './c46-a.mjs';
import { REF2, lessonsB } from './c46-b.mjs';
import { exsets, assessment, project } from './c46-ex.mjs';

const R = String.raw;
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA, ...lessonsB]);
const ex = dolar(exsets);

export const TOPICS = ['Logs estruturados', 'Métricas e tracing (OpenTelemetry)', 'Prometheus e Grafana', 'SLI, SLO e alertas'];
export const COVER = {
  'Logs estruturados': ['obs-01'],
  'Métricas e tracing (OpenTelemetry)': ['obs-02'],
  'Prometheus e Grafana': ['obs-03'],
  'SLI, SLO e alertas': ['obs-04']
};

const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'Telemetria', def: 'Dados de logs, métricas e traces emitidos por um sistema para observação.' },
  { term: 'Série temporal', def: 'Sequência de valores de uma métrica ao longo do tempo, identificada por nome e labels.' },
  { term: 'Dashboard', def: 'Painel que reúne gráficos e indicadores de um sistema.' },
  { term: 'Runbook', def: 'Roteiro operacional com os passos de diagnóstico e resolução de um problema.' },
  { term: 'Incidente', def: 'Evento que degrada ou interrompe um serviço e exige resposta.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'observabilidade', disciplineId: 'obs', areaId: 'back', requires: ['node-express'],
  title: 'Logs e observabilidade: logs estruturados, métricas, traces, Prometheus e SLOs',
  description: 'Observabilidade de APIs Node.js com experimentos medidos: logs estruturados com pino 10.4.0 (campos, níveis, redação, correlação por AsyncLocalStorage, custo e volume); métricas com prom-client 15.1.3 (Counter, Gauge, Histogram, percentis estimados por buckets com p99 de 221 ms contra 164 ms exato, cardinalidade de 3 KiB a 1,6 MiB em /metrics, métricas padrão); tracing com OpenTelemetry (API 1.10.0, sdk-trace 3.1.1: 6 spans em 1 trace por 2 serviços, traceparent, erro com exceção, amostragem de 10% e ParentBased); Prometheus 3.16.0 real em contêiner (scrape de 1 s, PromQL com rate e histogram_quantile, regra de gravação e alerta TaxaDeErrosAlta disparando e resolvendo em um incidente de 31,4% de erros); e SLI, SLO, orçamento de erro, burn rate e alertas de múltiplas janelas em uma simulação, além do projeto Observabilidade de uma API. Grafana, Alertmanager, Collector e backends de traces e logs não foram executados.',
  objectives: ['Distinguir e combinar logs, métricas e traces com um id de correlação', 'Instrumentar uma API com logs estruturados, métricas RED e traces OpenTelemetry', 'Controlar custo e cardinalidade da telemetria', 'Coletar métricas com o Prometheus, escrever PromQL, regras e alertas', 'Definir SLIs e SLOs, calcular orçamento de erro e burn rate e projetar alertas de múltiplas janelas', 'Operar incidentes com runbooks e post-mortems sem culpados'],
  level: 'A', prereqs: ['Node.js e Express (curso C4.1)', 'APIs REST (curso C4.3)', 'Docker (para o Prometheus do laboratório)'], hours: 16,
  syllabus: 'Logs estruturados; métricas e tracing; Prometheus e Grafana; SLI, SLO e alertas; incidentes; projeto.',
  versions: 'Node.js 26.13.1, pino 10.4.0, prom-client 15.1.3, Express 5.3.0, @opentelemetry/api 1.10.0, @opentelemetry/sdk-node 0.301.2 (com sdk-trace, context-async-hooks e core 3.1.1) e Prometheus 3.16.0 (contêiner oficial), em 2026-11-25 (laboratório em seed/c4/labs/observabilidade/). Medidas de uma execução em uma máquina; o pino foi medido contra um Writable do Node (o custo é do stream); a carga do Prometheus ficou em ~74 req/s; o experimento de SLO é uma simulação determinística. Correções feitas no laboratório: opções do SimpleSpanProcessor 3.x, exportador em memória parado após shutdown, registro global único do provider, ordenação de spans com BigInt e aquecimento antes da medição. Não executados: Grafana, Alertmanager, OpenTelemetry Collector, Jaeger/Tempo, Loki/ELK, auto-instrumentação, exemplars, tail-based sampling e remote write.',
  skills: ['Logs estruturados', 'Métricas e cardinalidade', 'Tracing distribuído', 'Prometheus e PromQL', 'Alertas acionáveis', 'SLI, SLO e orçamento de erro', 'Burn rate', 'Resposta a incidentes'],
  modules: [
    { id: 'm1', title: 'Logs, métricas e traces', lessons: ['obs-01', 'obs-02'] },
    { id: 'm2', title: 'Prometheus, alertas e SLOs', lessons: ['obs-03', 'obs-04'] }
  ],
  materials: [REF.pino, REF.otelDocs, REF2.promOverview, REF2.promQuerying, REF2.sreSlo, REF2.sreWorkbookAlerting].map((r) => ({ ...r })),
  projectIds: ['observabilidade-api'],
  supplement: {
    glossary,
    cheatsheet: R`### Logs
JSON por linha · serviço + versão + reqId (AsyncLocalStorage + mixin) · mensagem constante, dados em campos · redact · nível por ambiente · ~233 B/linha (4 GB/dia a 200 req/s) · amostrar sucesso, manter erros · retenção e acesso

### Métricas
Counter (rate) · Gauge · Histogram (buckets perto do SLO; p99 221 x 164 ms) · RED + USE + 4 sinais de ouro · rota padronizada · cardinalidade: 50 mil séries = 1,6 MiB e 426 ms · histograma = buckets + 2 séries

### Traces
traceparent W3C · span: início, duração, atributos, status, exceção · 6 spans/1 trace · amostragem 10% (203/2.000) + ParentBased + 100% de erros · traceId nos logs · API x SDK x exportadores · fixar versões

### Prometheus
pull + scrape · rate() em counters · histogram_quantile(sum by (le) (rate(bucket))) · regras de gravação · alertas com for · estados inactive/pending/firing · Alertmanager · Grafana RED · acumulado mascara incidente

### SLO
SLI/SLO/SLA · orçamento = 1 − SLO (99,9% = 43,2 min/30 dias) · burn rate = erro obs ÷ permitido · 14,4x por 1 h = 2% do orçamento · alerta de múltiplas janelas (rápido + lento) · runbook · post-mortem sem culpados`,
    mistakes: ['Logs em texto livre e sem id de correlação.', 'Segredos e corpos inteiros nos logs.', 'Labels com ids de usuário ou URLs completas.', 'Média de latência em vez de percentis e buckets largos no SLO.', 'Consultar o valor bruto de um counter.', 'Alertas de causas e sem runbook, gerando fadiga.', 'Prometer 100% e não calcular o orçamento de erro.', 'Registrar o provider global do OpenTelemetry duas vezes.', 'Expor /metrics à internet.', 'Guardar 100% dos traces e logs sem retenção.'],
    prereqMap: R`**Antes deste curso:** Node.js e Express (C4.1) e APIs (C4.3).

| Este curso prepara para | Por quê |
|---|---|
| Microsserviços (C4.7) | tracing distribuído e SLOs entre serviços |
| Segurança (C7) | auditoria e detecção de anomalias |
| DevOps e SRE (C6) | Prometheus, alertas, incidentes e confiabilidade |
| Arquitetura (C8) | requisitos não funcionais e SLOs |

Ordem interna: aulas 1 e 2 (logs, métricas e traces) → 3 (Prometheus e alertas) → 4 (SLOs, burn rate e projeto).`,
    officialRefs: [REF.pino, REF.twelveFactorLogs, REF.owaspLogging, REF.nodeAls, REF.promClient, REF.promNaming, REF.promHistograms, REF.otelDocs, REF.otelJs, REF.otelSampling, REF.w3cTrace, REF2.promOverview, REF2.promQuerying, REF2.promRules, REF2.promAlerting, REF2.alertmanager, REF2.promApi, REF2.grafanaDocs, REF2.sreSlo, REF2.sreWorkbookAlerting, REF2.sreMonitoring, REF2.sreEmbracing],
    practice: ['Emita logs estruturados com redação e reqId por AsyncLocalStorage.', 'Meça a cardinalidade de uma métrica com label ilimitado.', 'Compare o percentil exato com o estimado por buckets.', 'Propague o traceparent entre dois serviços e leia a árvore de spans.', 'Suba um Prometheus em contêiner, colete sua API e escreva rate e histogram_quantile.', 'Crie uma regra de alerta com for e provoque um incidente.', 'Calcule o orçamento de erro e o burn rate de um SLO.', 'Faça o projeto integrador: observabilidade de uma API.']
  }
};

export const COURSE = makeCourse({ course, lessons, exsets: ex, assessment, project });
