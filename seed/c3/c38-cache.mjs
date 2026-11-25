// Curso C3.8 da C3: estratégias de cache (disciplina: cache).
import { makeCourse } from '../courses/_lib.mjs';
import { REF, lessonsA } from './c38-a.mjs';
import { lessonsB } from './c38-b.mjs';
import { exsets, assessment, project } from './c38-ex.mjs';

const R = String.raw;
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA, ...lessonsB]);
const ex = dolar(exsets);

export const TOPICS = ['Cache-aside', 'Write-through e write-behind', 'Invalidação de cache', 'Cache distribuído'];
export const COVER = {
  'Cache-aside': ['cch-01', 'cch-02'],
  'Write-through e write-behind': ['cch-03'],
  'Invalidação de cache': ['cch-04'],
  'Cache distribuído': ['cch-05', 'cch-06']
};

const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'Latência', def: 'Tempo entre o pedido e a resposta.' },
  { term: 'Throughput', def: 'Quantidade de operações atendidas por unidade de tempo.' },
  { term: 'Percentil (p95, p99)', def: 'Valor abaixo do qual está a proporção indicada das medições, usado para a latência de cauda.' },
  { term: 'Warm-up', def: 'Execuções iniciais descartadas na medição para não contar o custo de partida.' },
  { term: 'Consistência eventual', def: 'Garantia de que, sem novas escritas, as cópias convergem para o mesmo valor.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'estrategias-cache', disciplineId: 'cache', areaId: 'data', requires: ['javascript-fundamentos'],
  title: 'Estratégias de cache: cache-aside, write-through, invalidação e cache distribuído',
  description: 'Cache em aplicações reais, com PostgreSQL 17 e Redis 8 em experimentos medidos: quando cachear (relatório de 183 ms para 1 ms; consulta por chave primária só 1,8x) e a taxa de acerto; cache-aside, stampede (50 execuções contra 1 com single-flight ou trava), cache negativo e custo de memória; write-through, write-behind (com simulação de perda) e read-through; invalidação (TTL, delete on write, eventos, chaves versionadas), a corrida leitor x escritor e a avalanche com jitter; cache local e distribuído, pub/sub, particionamento, hot keys e dimensionamento; cache HTTP (ETag e 304), CDN, observabilidade, segurança, testes e o projeto Camada de cache para uma API. Redis Cluster, CDN real, navegador e failover não foram executados.',
  objectives: ['Decidir o que cachear com base em medições e em tolerância a dados antigos', 'Implementar cache-aside com TTL, cache negativo e proteção contra stampede', 'Comparar write-through, write-behind e read-through e seus riscos', 'Projetar a invalidação e testar a corrida e a avalanche', 'Combinar cache local, Redis e cabeçalhos HTTP', 'Medir, monitorar, proteger e documentar uma camada de cache'],
  level: 'M', prereqs: ['NoSQL com MongoDB e Redis (curso C3.7, principalmente as aulas de Redis)', 'SQL essencial (curso C3.1)', 'JavaScript e Node.js (Onda 1)', 'Docker (para praticar com PostgreSQL 17 e Redis 8)'], hours: 18,
  syllabus: 'Por que cachear e cache-aside; stampede, trava e cache negativo; write-through, write-behind e read-through; invalidação, corridas e avalanche; cache distribuído, pub/sub, particionamento e hot keys; cache HTTP, CDN, observabilidade, segurança e projeto.',
  versions: 'PostgreSQL 17.12, Redis 8.12.0, Node.js 26.13, ioredis 6.1.0 e pg 8.23.1, em 2026-11-25 (laboratório em seed/c3/labs/estrategias-cache/). Os experimentos usam 500.000 produtos e contêineres isolados em 127.0.0.1; as medianas (7 execuções após aquecimento) valem para a seção de latência, e os demais experimentos (cache-aside com 10.000 leituras, stampede, avalanche, escrita, pub/sub) são de uma única execução: a forma importa mais que os milissegundos. As duas instâncias do experimento de pub/sub são objetos no mesmo processo (simulação), e a perda do write-behind foi simulada com FLUSHALL. Não foram executados: Redis Cluster, Sentinel e failover, Memcached, CDN, o comportamento de navegadores, client-side caching do Redis, caches de segundo nível de ORMs e ambientes multi-região.',
  skills: ['Medição de cache', 'Cache-aside e proteção contra stampede', 'Estratégias de escrita', 'Invalidação e consistência', 'Cache distribuído', 'Cache HTTP', 'Observabilidade e testes de cache', 'Segurança de cache'],
  modules: [
    { id: 'm1', title: 'Cache-aside', lessons: ['cch-01', 'cch-02'] },
    { id: 'm2', title: 'Escrita e invalidação', lessons: ['cch-03', 'cch-04'] },
    { id: 'm3', title: 'Cache distribuído e operação', lessons: ['cch-05', 'cch-06'] }
  ],
  materials: [REF.httpCaching, REF.redisSet, REF.redisEviction, REF.redisPubsub, REF.cacheControl, REF.memcachePaper].map((r) => ({ ...r })),
  projectIds: ['camada-cache-api'],
  supplement: {
    glossary,
    cheatsheet: R`### Decidir
Cachear: leitura cara, repetida, que tolera atraso · não cachear: consulta barata, saldo/estoque no pagamento · meça antes e depois (relatório 183 ms → 1 ms; PK 1,8x)

### Cache-aside
ler cache → na falha, banco + SET com TTL · taxa de acerto = acertos / leituras (90,5% no lab) · TTL com jitter · cache negativo (TTL curto) · chaves com versão e tenant

### Stampede
50 requisições → 50 execuções · single-flight (um processo) · SET NX EX com finally (várias instâncias) · refresh-ahead · stale-while-revalidate

### Escrita
write-through (banco e cache, mais lento) · write-behind (rápido, risco de perda, fila durável, lotes e coalescência) · write-around · read-through

### Invalidação
banco primeiro, depois DEL · TTL como rede de segurança · eventos/CDC · chaves versionadas (INCR) · corrida leitor x escritor · avalanche: jitter

### Distribuído
L1 + L2 · pub/sub para invalidar instâncias (sem histórico: TTL curto) · hash consistente / 16.384 slots + hash tags · hot keys: cópias, fragmentos · allkeys-lru e evicted_keys

### HTTP e operação
Cache-Control (max-age, s-maxage, private, no-store, no-cache) · ETag e 304 · Vary · CDN · keyspace_hits/misses · alertas · testes de stampede, corrida, falha do Redis e isolamento entre usuários`,
    mistakes: ['Cachear tudo sem medir.', 'Esquecer o TTL ou usar TTL igual em massa.', 'Deixar uma chave quente expirar sem proteção contra stampede.', 'Usar write-behind com fila volátil para dados críticos.', 'Invalidar antes de gravar no banco.', 'Invalidar só uma instância quando há caches locais.', 'Chaves sem tenant ou usuário, vazando dados.', 'Não monitorar a taxa de acerto nem testar a falha do cache.'],
    prereqMap: R`**Antes deste curso:** NoSQL com MongoDB e Redis (C3.7, em especial as aulas de Redis), SQL essencial (C3.1) e JavaScript/Node.js (Onda 1).

| Este curso prepara para | Por quê |
|---|---|
| Backend com Node e NestJS (C4) | camada de cache em APIs, interceptors e cabeçalhos HTTP |
| Desempenho e observabilidade (C5, C8) | métricas de acerto, latência e carga no banco |
| Segurança (C7) | vazamento entre usuários, envenenamento de cache, exposição do Redis |
| Arquitetura (C8) | consistência, janelas de frescor e ADRs |

Ordem interna: aulas 1 e 2 (cache-aside) → 3 e 4 (escrita e invalidação) → 5 e 6 (distribuído, HTTP e projeto).`,
    officialRefs: [REF.httpCaching, REF.cacheControl, REF.rfc9111, REF.redisSet, REF.redisEviction, REF.redisLocks, REF.redisClientCache, REF.redisPubsub, REF.redisCluster, REF.memcachePaper, REF.pgStat],
    practice: ['Meça um relatório e uma consulta por chave primária no banco e no Redis.', 'Implemente cache-aside e calcule a taxa de acerto com uma distribuição 80/20.', 'Reproduza o stampede e resolva com single-flight e com SET NX EX.', 'Meça write-through e write-behind e simule a perda da fila.', 'Reproduza a corrida leitor x escritor e aplique uma mitigação.', 'Compare TTL fixo e com jitter.', 'Faça duas instâncias com cache local e invalide por pub/sub.', 'Faça o projeto integrador: a camada de cache de uma API com ADR.']
  }
};

export const COURSE = makeCourse({ course, lessons, exsets: ex, assessment, project });
