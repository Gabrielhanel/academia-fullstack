// Curso C4.7 da C4: Microsserviços (disciplina: micro).
import { makeCourse } from '../courses/_lib.mjs';
import { REF, lessonsA } from './c47-a.mjs';
import { REF2, lessonsB } from './c47-b.mjs';
import { exsets, assessment, project } from './c47-ex.mjs';

const R = String.raw;
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA, ...lessonsB]);
const ex = dolar(exsets);

export const TOPICS = ['Decomposição de serviços', 'Comunicação síncrona vs assíncrona', 'Sagas e consistência', 'Service mesh'];
export const COVER = {
  'Decomposição de serviços': ['mic-01'],
  'Comunicação síncrona vs assíncrona': ['mic-02'],
  'Sagas e consistência': ['mic-03'],
  'Service mesh': ['mic-04']
};

const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'Domínio', def: 'Área de conhecimento e de negócio que o software modela.' },
  { term: 'DDD', def: 'Domain-Driven Design: abordagem que organiza o software em torno do domínio e de contextos delimitados.' },
  { term: 'Resiliência', def: 'Capacidade de um sistema continuar funcionando, possivelmente degradado, diante de falhas.' },
  { term: 'Idempotência', def: 'Propriedade de uma operação que pode ser repetida sem mudar o efeito além da primeira vez.' },
  { term: 'Plano de plataforma', def: 'Conjunto de ferramentas e serviços compartilhados que dá suporte às equipes de produto.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'microsservicos', disciplineId: 'micro', areaId: 'back', requires: ['node-express'],
  title: 'Microsserviços: decomposição, comunicação, sagas e service mesh',
  description: 'Arquitetura de microsserviços com experimentos medidos: decomposição (chamada de função 0,026 µs contra HTTP 4,1 ms; o N+1 entre serviços de 129,8 ms em sequência, 70,2 ms em paralelo e 2,4 ms em lote; disponibilidade composta de 5 serviços de 99,9% = 99,5%); comunicação síncrona e assíncrona (retentativas em cadeia com 9 chamadas ao serviço doente, o acoplamento temporal com o e-mail fora do ar: 50 de 50 falhas no modelo síncrono contra 50 de 50 aceitos e enviados em 0,2 s com fila); sagas com compensações (2.000 pedidos com falhas injetadas: 293 pedidos cancelados com estoque preso sem saga, 0 inconsistências com saga orquestrada, 46 quedas retomadas pelo log); e service mesh com o Envoy 1.34.14 como sidecar (retentativas 47,8% → 95,3%, o limite de retentativas simultâneas com 209 overflows, timeout por tentativa e detecção de outliers), além do projeto Decomposição com sagas. Istio, Linkerd, mTLS, Kubernetes, Temporal e Kafka não foram executados.',
  objectives: ['Decidir entre monólito modular e microsserviços e definir fronteiras por contexto e propriedade de dados', 'Escolher entre comunicação síncrona e assíncrona e conter a amplificação de retentativas', 'Projetar e testar sagas com compensações idempotentes e retomada', 'Explicar e configurar as funções de uma malha de serviços e seus limites', 'Calcular a disponibilidade composta e medir o custo da rede', 'Planejar a decomposição de um sistema com contratos, outbox e resiliência'],
  level: 'A', prereqs: ['Node.js e Express (curso C4.1)', 'APIs REST (curso C4.3)', 'Filas e processamento assíncrono (curso C4.5)', 'Logs e observabilidade (curso C4.6)'], hours: 16,
  syllabus: 'Decomposição e fronteiras; comunicação síncrona e assíncrona; sagas e consistência; service mesh; projeto.',
  versions: 'Node.js 26.13.1, Express 5.3.0, BullMQ 6.7.10, ioredis 6.1.0, Redis 8.12.0 e Envoy 1.34.14 (contêiner oficial), em 2026-11-25 (laboratório em seed/c4/labs/microsservicos/). Medidas de uma execução em uma máquina; as sagas e as quedas são um modelo em memória (sem broker, banco ou falhas reais de máquina); o Envoy foi usado como sidecar didático em localhost, sem plano de controle, mTLS ou descoberta de serviços. Achado do laboratório: o circuit breaker padrão do cluster do Envoy limita as retentativas simultâneas (max_retries 3) e a medição inicial com 10 requisições simultâneas deu 56,6% em vez de ~93,75%. Não executados: Istio, Linkerd, Consul, Kubernetes, mTLS e SPIFFE, Temporal, Step Functions, Kafka, RabbitMQ, gRPC, CQRS e Event Sourcing.',
  skills: ['Fronteiras de serviços', 'Custos da rede', 'Comunicação assíncrona', 'Resiliência em cadeia', 'Sagas e compensações', 'Verificação de invariantes', 'Service mesh e Envoy', 'ADRs de decomposição'],
  modules: [
    { id: 'm1', title: 'Decomposição e comunicação', lessons: ['mic-01', 'mic-02'] },
    { id: 'm2', title: 'Consistência e malha de serviços', lessons: ['mic-03', 'mic-04'] }
  ],
  materials: [REF.fowlerMicro, REF.monolithFirst, REF.awsRetries, REF2.saga, REF2.helland, REF2.envoyDocs].map((r) => ({ ...r })),
  projectIds: ['decomposicao-sagas'],
  supplement: {
    glossary,
    cheatsheet: R`### Decomposição
monólito modular primeiro · contextos delimitados + propriedade de dados + equipes · função 0,026 µs x HTTP 4,1 ms · N+1: 129,8 ms (seq) / 70,2 (par) / 2,4 (lote) · 5 x 99,9% = 99,5% · anti-padrões: monólito distribuído, banco compartilhado, nanoserviços

### Comunicação
síncrono (consulta agora) x assíncrono (efeitos não essenciais) · comando x evento x consulta · e-mail fora: 50/50 falhas x 50/50 aceitos e enviados em 0,2 s · retry em cadeia 3x3 = 9 (borda: 3) · timeouts decrescentes · prazo propagado

### Sagas
transações locais + compensações (ordem inversa) · orquestração x coreografia · passos e compensações idempotentes · log para retomar · sem saga: 293 estoque preso / 166 cobrados sem estorno · com saga: 0 inconsistências, 46 quedas retomadas · ordem: difícil de compensar por último

### Service mesh
sidecar (plano de dados) + plano de controle · Envoy: retry 47,8% → 95,3% (seq), 56,6% (10 simultâneos, 209 overflows: max_retries 3) · per_try_timeout 0,2 s → 504 em 632 ms · outlier_detection ejeta a instância ruim · não resolve idempotência, consistência, contratos · mTLS/SPIFFE (conceito)`,
    mistakes: ['Dividir cedo demais sem escala, equipes ou domínio claro.', 'Banco compartilhado e monólito distribuído.', 'Chamadas por item entre serviços.', 'Retry em todas as camadas e sem timeouts decrescentes.', 'Tornar o pedido dependente de um serviço secundário.', 'Cancelar sem compensar passos já confirmados.', 'Compensações e passos não idempotentes e sem log.', 'Esperar que a malha resolva consistência e idempotência.', 'Ignorar os limites padrão do proxy.', 'Adotar uma malha sem necessidade.'],
    prereqMap: R`**Antes deste curso:** Node.js e Express (C4.1), APIs (C4.3), filas (C4.5) e observabilidade (C4.6).

| Este curso prepara para | Por quê |
|---|---|
| Arquitetura (C8) | ADRs, fronteiras, consistência e resiliência |
| DevOps e Kubernetes (C6) | implantação independente, malhas e gateways |
| Segurança (C7) | zero trust, mTLS e identidades de serviços |
| Mensageria e dados (C3/C8) | Kafka, CQRS e event sourcing |

Ordem interna: aulas 1 e 2 (decomposição e comunicação) → 3 (sagas e consistência) → 4 (malha de serviços e projeto).`,
    officialRefs: [REF.fowlerMicro, REF.monolithFirst, REF.boundedContext, REF.microservicesIo, REF.strangler, REF.conway, REF.fallacies, REF.circuitBreaker, REF.awsRetries, REF.eipMessaging, REF.grpc, REF.asyncapi, REF2.saga, REF2.gardenSagas, REF2.outbox, REF2.eventSourcing, REF2.cqrs, REF2.helland, REF2.envoyDocs, REF2.envoyRetries, REF2.envoyOutlier, REF2.envoyCircuit, REF2.istio, REF2.linkerd, REF2.spiffe],
    practice: ['Meça o custo de uma chamada de rede e o N+1 entre serviços.', 'Calcule a disponibilidade composta de uma cadeia.', 'Reproduza a amplificação de retentativas e o acoplamento temporal.', 'Implemente uma saga com compensações e verifique invariantes com falhas injetadas.', 'Simule a queda do orquestrador e retome pelo log.', 'Configure o Envoy com retry, per_try_timeout e outlier detection e leia as estatísticas.', 'Escreva o ADR de decomposição de um sistema.', 'Faça o projeto integrador: decomposição com sagas.']
  }
};

export const COURSE = makeCourse({ course, lessons, exsets: ex, assessment, project });
