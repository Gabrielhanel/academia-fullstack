// Curso C6.6 da C6: Monitoramento (disciplina: monitor).
import { makeCourse } from '../courses/_lib.mjs';
import { REF, lessonsA } from './c66-a.mjs';
import { REF2, lessonsB } from './c66-b.mjs';
import { exsets, assessment, project } from './c66-ex.mjs';

const R = String.raw;
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA, ...lessonsB]);
const ex = dolar(exsets);

export const TOPICS = ['Logs e métricas', 'Prometheus', 'Grafana', 'Alertas e on-call'];
export const COVER = {
  'Logs e métricas': ['mon-01'],
  'Prometheus': ['mon-02'],
  'Grafana': ['mon-03'],
  'Alertas e on-call': ['mon-04']
};

const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'Exporter', def: 'Processo que expõe métricas de um sistema (como o host) no formato do Prometheus.' },
  { term: 'Pushgateway', def: 'Componente do Prometheus que recebe métricas de jobs efêmeros para serem raspadas.' },
  { term: 'Watchdog', def: 'Alerta que dispara sempre, usado para provar que o caminho de notificação funciona.' },
  { term: 'Orçamento de erro', def: 'Fração de falhas tolerada pelo SLO, igual a 1 menos o objetivo.' },
  { term: 'Toil', def: 'Trabalho operacional manual, repetitivo e automatizável, sem valor duradouro.' },
  { term: 'MTTR', def: 'Tempo médio de recuperação após uma falha.' },
  { term: 'Staleness', def: 'Marcação de que uma série deixou de existir porque o alvo parou de expô-la.' },
  { term: 'Remote write', def: 'Envio contínuo das amostras do Prometheus para um armazenamento de longo prazo.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'monitoramento', disciplineId: 'monitor', areaId: 'ops', requires: [],
  title: 'Monitoramento: logs e métricas, Prometheus, Grafana, alertas e on-call',
  description: 'Observar e operar sistemas com experimentos executados (Prometheus 3.16.0, Alertmanager 0.35.1, Grafana 13.3.2): logs estruturados e métricas (1.310 linhas JSON; p95 exato de 300,172 ms contra 0,375 s do histograma; razão de erros vazia antes do primeiro 500); Prometheus (scrape, up, PromQL, regras de gravação, 9,88 req/s com 10 rps; promtool check/test: SUCCESS, parse error e got: []); Grafana como código (datasource e dashboard provisionados: 1 dashboard, 3 painéis, saúde OK, consulta via Grafana igual à direta); e alertas de ponta a ponta até um webhook (TaxaDeErroAlta: pending +10 s, firing +25 s, webhook +30 s, resolved +30 s da recuperação; AppForaDoAr: pending +14 s, firing +24 s, webhook +30 s, resolved +9 s), mais SLOs, burn rate e práticas de on-call. Projeto: observabilidade operada. Traces, OpenTelemetry, Loki, node_exporter, receivers reais, inibição, silêncios, burn rate real e alertas do Grafana não foram executados.',
  objectives: ['Instrumentar aplicações com métricas e logs estruturados e escolher tipos e rótulos com atenção à cardinalidade', 'Consultar e testar regras no Prometheus com PromQL, regras de gravação e promtool', 'Provisionar e verificar dashboards do Grafana como código', 'Configurar alertas por sintoma com for e Alertmanager e medir o tempo até a notificação', 'Relacionar alertas a SLOs, burn rate e práticas de on-call'],
  level: 'M', prereqs: ['HTTP e Node.js (C4)', 'Docker (C6.1)', 'Docker 29 ou superior (o curso usa 29.9.3)'], hours: 6,
  syllabus: 'Logs e métricas; Prometheus; Grafana; alertas e on-call; projeto de observabilidade operada.',
  versions: 'Docker 29.9.3, Prometheus 3.16.0 e promtool 3.16.0, Alertmanager 0.35.1 e amtool, Grafana 13.3.2 (imagens oficiais) e Node 26.13.1 (app, receptor de webhook e gerador de carga), em 2026-11-25 e 26 (laboratório em seed/c6/labs/monitoramento/). Tráfego sintético em uma máquina; scrape e avaliação de 5 s são didáticos. Achados: p95 do histograma 0,375 s contra 300,172 ms exatos; a primeira versão do script medindo por polling era imprecisa e foi substituída por query_range; lacuna de ~34 min no relógio entre dois episódios (causa não investigada). O Grafana usou acesso anônimo Admin só no laboratório local. Os desafios de código são em JavaScript e modelam a lógica. Não executados: traces e OpenTelemetry, Loki/ELK, node_exporter/cAdvisor, Pushgateway, HA, remote write, receivers reais, inibição, silêncios, alertas de burn rate e do Grafana, renderização visual do dashboard.',
  skills: ['Instrumentação de métricas e logs', 'PromQL', 'Regras de gravação e alerta testadas', 'Dashboards como código', 'Alertmanager', 'SLOs e on-call'],
  modules: [
    { id: 'm1', title: 'Métricas e Prometheus', lessons: ['mon-01', 'mon-02'] },
    { id: 'm2', title: 'Grafana e alertas', lessons: ['mon-03', 'mon-04'] }
  ],
  materials: [REF.sreMonitoring, REF.promOverview, REF.promHistograms, REF2.grafanaProv, REF2.sreAlerting].map((r) => ({ ...r })),
  projectIds: ['observabilidade-operada'],
  supplement: {
    glossary,
    cheatsheet: R`### Sinais
Logs (o quê) · métricas (quanto) · traces (onde) · métrica avisa, trace localiza, log explica · logs JSON com correlação, sem dados pessoais · RED (taxa, erros, duração) · USE (utilização, saturação, erros) · quatro sinais dourados

### Métricas
counter (rate) · gauge · histogram (histogram_quantile com sum by (le)) · summary não agrega · rótulos com poucos valores (cardinalidade) · _total, _seconds, _bytes · histograma interpola dentro do bucket (erro: 0,375 s x 300 ms) · série ausente ≠ 0

### Prometheus
scrape + up · rate(x[janela >= 4 x scrape]) · sum by · recording rules nível:métrica:operação · promtool check config/rules · promtool test rules · TSDB local (retenção 15 d) · remote write para longo prazo

### Grafana
datasource por uid · dashboards como código (JSON) · provisionar por arquivos · verificar por API · RED + SLO · sem acesso anônimo em produção

### Alertas
sintoma, não causa · for · labels (severidade) + annotations (resumo, runbook) · Alertmanager: group_by, group_wait, group_interval, repeat_interval, rotas, inibição, silêncios · atraso = janela + scrape + avaliação + for + group_wait · burn rate = erro / (1 − SLO); 14,4 em 1 h = 2% · runbook, escalonamento, postmortem sem culpa`,
    mistakes: ['Logs em texto livre e sem correlação.', 'Rótulos de alta cardinalidade.', 'Valor bruto de counter e médias de latência.', 'histogram_quantile sem sum by (le).', 'Tratar série ausente como zero.', 'Alertas sobre causas, sem for e sem runbook.', 'Nunca testar regras nem o caminho de notificação.', 'Dashboards criados à mão e acesso anônimo fora do laboratório.'],
    prereqMap: R`**Antes deste curso:** Node.js e HTTP (C4) e Docker (C6.1).

| Este curso prepara para | Por quê |
|---|---|
| Segurança (C7) | detecção e resposta a incidentes |
| Arquitetura (C8) | observabilidade de sistemas distribuídos |
| IA e carreira (C11) | monitorar sistemas com IA e carreira em SRE |

Ordem interna: logs e métricas → Prometheus → Grafana → alertas e on-call → projeto.`,
    officialRefs: [REF.sreMonitoring, REF.otelSignals, REF.promOverview, REF.promTypes, REF.promNaming, REF.promHistograms, REF.promExposition, REF.promQuery, REF.promFunctions, REF.promRecording, REF.promConfig, REF.promInstrument, REF2.grafanaDocs, REF2.grafanaProv, REF2.grafanaDash, REF2.grafanaBest, REF2.grafanaHttp, REF2.promAlertRules, REF2.promUnitTest, REF2.amDocs, REF2.amConfig, REF2.promAlertPractices, REF2.sreAlerting, REF2.sreOncall, REF2.srePostmortem],
    practice: ['Instrumente uma rota com contador e histograma e registre logs JSON.', 'Escreva consultas de taxa, erro e p95 e uma regra de gravação.', 'Teste uma regra de alerta com promtool test rules (um caso que passa e um que falha).', 'Provisione um dashboard por arquivo e verifique-o pela API.', 'Meça o tempo entre o erro e a notificação e some os atrasos.', 'Calcule o burn rate de um SLO e desenhe os alertas multijanela.', 'Faça o projeto integrador: observabilidade operada.']
  }
};

export const COURSE = makeCourse({ course, lessons, exsets: ex, assessment, project });
