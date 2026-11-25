// Curso C4.5 da C4: Filas e processamento assíncrono (disciplina: async-be).
import { makeCourse } from '../courses/_lib.mjs';
import { REF, lessonsA } from './c45-a.mjs';
import { REF2, lessonsB } from './c45-b.mjs';
import { exsets, assessment, project } from './c45-ex.mjs';

const R = String.raw;
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA, ...lessonsB]);
const ex = dolar(exsets);

export const TOPICS = ['Filas e jobs', 'BullMQ', 'Retry e backoff', 'Dead Letter Queue', 'Integrações entre sistemas'];
export const COVER = {
  'Filas e jobs': ['fil-01'],
  'BullMQ': ['fil-02'],
  'Retry e backoff': ['fil-03'],
  'Dead Letter Queue': ['fil-03'],
  'Integrações entre sistemas': ['fil-04']
};

const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'Broker', def: 'Sistema intermediário que recebe, guarda e entrega mensagens entre produtores e consumidores.' },
  { term: 'Produtor e consumidor', def: 'Quem coloca e quem retira mensagens ou jobs de uma fila.' },
  { term: 'Idempotência', def: 'Propriedade de uma operação que pode ser repetida sem mudar o efeito além da primeira vez.' },
  { term: 'Eventual consistency', def: 'Consistência eventual: os dados convergem com o tempo, não instantaneamente.' },
  { term: 'Particionamento por chave', def: 'Direcionar mensagens da mesma chave ao mesmo consumidor para preservar a ordem.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'filas-async', disciplineId: 'async-be', areaId: 'back', requires: ['node-express'],
  title: 'Filas e processamento assíncrono: BullMQ, retry com backoff, DLQ, idempotência e outbox',
  description: 'Processamento assíncrono confiável em Node.js com BullMQ 6.7.10 e Redis 8.12.0, com experimentos medidos: filas e jobs, semânticas de entrega (a perda de 1 job quando o trabalhador cai em uma lista ingênua contra BLMOVE), BullMQ na prática (concorrência 1/5/20 com 18, 89 e 273 jobs/s, prioridade, atraso, agendadores, limitador de taxa e retenção com 2.005 contra 4 chaves), retry com backoff fixo e exponencial (115, 303, 505 e 807 ms) e jitter, mensagens venenosas e dead letter queue com contexto e reprocessamento, jobs travados (stalled) executados duas vezes e idempotência, e integrações entre sistemas com o problema da escrita dupla (4 de 20 eventos perdidos), outbox transacional com relay SKIP LOCKED no PostgreSQL 17.12 (28 publicações para 20 eventos) e consumidor idempotente (20 efeitos), webhooks e sagas. RabbitMQ, SQS, Kafka, Redis em cluster, fluxos do BullMQ e CDC não foram executados.',
  objectives: ['Escolher entre chamada direta, evento e fila de jobs e entender as semânticas de entrega', 'Configurar BullMQ com concorrência, prioridades, limites e retenção adequados', 'Projetar retries com backoff exponencial e jitter e uma DLQ operada', 'Reconhecer e tratar jobs travados e duplicatas com processadores idempotentes', 'Evitar a escrita dupla com outbox transacional e relay', 'Operar filas com métricas, persistência e desligamento ordenado'],
  level: 'A', prereqs: ['Node.js e Express (curso C4.1)', 'NoSQL com MongoDB e Redis (curso C3.7, aulas de Redis)', 'SQL e transações (cursos C3.1 e C3.5)', 'Docker (para Redis e PostgreSQL)'], hours: 16,
  syllabus: 'Filas e jobs; BullMQ; retry, backoff e DLQ; integrações entre sistemas (outbox, idempotência, webhooks, sagas); projeto.',
  versions: 'Node.js 26.13.1, BullMQ 6.7.10, ioredis 6.1.0, pg 8.23.1, Redis 8.12.0 e PostgreSQL 17.12, em 2026-11-25 (laboratório em seed/c4/labs/filas/). Medidas de uma execução em uma máquina; os "trabalhadores que caem" foram simulados com process.exit e com um laço síncrono, não com falhas reais de máquina; Redis único sem persistência configurada nos testes. Correções feitas no laboratório: scripts-filho no mesmo diretório para resolver ioredis e captura dos erros "Missing lock" do worker. Não executados: Redis em cluster ou Sentinel com BullMQ, fluxos pai-filho, BullMQ Pro, RabbitMQ, Kafka, SQS, Debezium/CDC, métricas Prometheus e Bull Board.',
  skills: ['Modelagem de filas e jobs', 'BullMQ', 'Retry, backoff e jitter', 'DLQ e redrive', 'Idempotência', 'Outbox transacional', 'Webhooks e sagas', 'Operação de filas'],
  modules: [
    { id: 'm1', title: 'Filas e BullMQ', lessons: ['fil-01', 'fil-02'] },
    { id: 'm2', title: 'Falhas, DLQ e integrações', lessons: ['fil-03', 'fil-04'] }
  ],
  materials: [REF.bullmq, REF.bullmqRetry, REF.redisLmove, REF2.awsBackoff, REF2.outbox, REF2.idempotentConsumer].map((r) => ({ ...r })),
  projectIds: ['pipeline-de-jobs'],
  supplement: {
    glossary,
    cheatsheet: R`### Filas
at-most-once x at-least-once x exactly-once (= at-least-once + idempotência) · 202 + link de status · jobs pequenos (ids) · BRPOP perde (1) x BLMOVE mantém em "processando" · Redis: persistência + noeviction

### BullMQ
Queue/Worker/QueueEvents · concurrency (E/S): 18 → 89 → 273 jobs/s · priority (sem prioridade passa antes) · delay · upsertJobScheduler (id estável) · limiter · removeOnComplete/removeOnFail · worker.close() · ioredis exigido

### Retry
transitória x permanente · attempts + backoff fixed/exponential (115, 303, 505, 807 ms) · jitter (thundering herd) · UnrecoverableError · retry storm: um só nível

### DLQ
isolar mensagem venenosa com contexto · alerta se não vazia · redrive após corrigir

### Stalled
trava (lockDuration) · event loop bloqueado/queda → 2 execuções · idempotência obrigatória

### Integrações
escrita dupla perde eventos (4/20) · outbox na mesma transação · relay FOR UPDATE SKIP LOCKED · duplicatas (28 → 20) · consumidor idempotente (processados) · webhooks: assinatura, retry, dedup · sagas · CloudEvents/AsyncAPI`,
    mistakes: ['Tirar o job da fila antes de processá-lo.', 'Supor entrega exatamente uma vez.', 'Aumentar a concorrência para tarefas de CPU.', 'Deixar concluídos acumularem no Redis e usar o mesmo Redis do cache.', 'Repetir erros permanentes e DLQ sem alerta.', 'Backoff fixo e curto sem jitter.', 'Processadores que bloqueiam o event loop e não são idempotentes.', 'Escrita dupla em vez de outbox.', 'Consumidores sem registro de mensagens processadas.', 'Webhooks sem assinatura nem deduplicação.'],
    prereqMap: R`**Antes deste curso:** Node.js e Express (C4.1), Redis (C3.7) e SQL/transações (C3.1 e C3.5).

| Este curso prepara para | Por quê |
|---|---|
| Observabilidade (C4.6) | métricas de fila, tamanho, idade e DLQ |
| Microsserviços (C4.7) | eventos, sagas e consistência entre serviços |
| Arquitetura (C8) | desacoplamento, garantias de entrega e ADRs |
| Cloud e mensageria (C6/C8) | SQS, RabbitMQ, Kafka |

Ordem interna: aulas 1 e 2 (filas e BullMQ) → 3 (falhas, retry e DLQ) → 4 (integrações e projeto).`,
    officialRefs: [REF.bullmq, REF.bullmqQueues, REF.bullmqConcurrency, REF.bullmqRetry, REF.bullmqRate, REF.bullmqStalled, REF.redisLmove, REF.redisPersistence, REF.eip, REF.rabbitReliability, REF.sqsDlq, REF2.awsBackoff, REF2.outbox, REF2.idempotentConsumer, REF2.pgSelect, REF2.sagas, REF2.webhookGuide, REF2.cloudEvents, REF2.asyncapi],
    practice: ['Reproduza a perda de job com BRPOP e compare com BLMOVE.', 'Meça a vazão do BullMQ com concorrência 1, 5 e 20.', 'Teste prioridade, atraso, agendador, limitador e retenção.', 'Meça os intervalos de backoff fixo e exponencial e implemente jitter.', 'Monte uma DLQ com contexto e reprocesse-a.', 'Provoque um job travado e comprove a idempotência.', 'Mostre a falha da escrita dupla e resolva com outbox e relay.', 'Faça o projeto integrador: pipeline de jobs.']
  }
};

export const COURSE = makeCourse({ course, lessons, exsets: ex, assessment, project });
