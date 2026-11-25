// Curso C3.7 da C3: NoSQL com MongoDB e Redis (disciplina: nosql).
import { makeCourse } from '../courses/_lib.mjs';
import { REF, lessonsA } from './c37-a.mjs';
import { REF2, lessonsB } from './c37-b.mjs';
import { REF3, lessonsC } from './c37-c.mjs';
import { exsetsA } from './c37-ex-a.mjs';
import { exsetsB, assessment, project } from './c37-ex-b.mjs';

const R = String.raw;
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA, ...lessonsB, ...lessonsC]);
const ex = dolar({ ...exsetsA, ...exsetsB });

export const TOPICS = ['Tipos de bancos NoSQL', 'MongoDB', 'Modelagem orientada a documentos', 'Redis: estruturas de dados', 'Agregações no MongoDB', 'Teorema CAP'];
export const COVER = {
  'Tipos de bancos NoSQL': ['nsq-01'],
  'MongoDB': ['nsq-02', 'nsq-03'],
  'Modelagem orientada a documentos': ['nsq-04'],
  'Redis: estruturas de dados': ['nsq-06', 'nsq-07'],
  'Agregações no MongoDB': ['nsq-05'],
  'Teorema CAP': ['nsq-08', 'nsq-09']
};

const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'BSON', def: 'Formato binário de documentos do MongoDB, com mais tipos que o JSON.' },
  { term: 'Replica set', def: 'Grupo de nós MongoDB que mantêm cópias dos mesmos dados, com um primário.' },
  { term: 'Sharding', def: 'Particionamento horizontal dos dados entre vários servidores.' },
  { term: 'Working set', def: 'Parte dos dados e índices usada com frequência, que deve caber na memória.' },
  { term: 'Eviction', def: 'Remoção de chaves para liberar memória quando o limite é atingido.' },
  { term: 'Expiração passiva e ativa', def: 'Formas de o Redis remover chaves expiradas: ao acessá-las e por varreduras periódicas.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'nosql-mongodb-redis', disciplineId: 'nosql', areaId: 'data', requires: ['javascript-fundamentos'],
  title: 'NoSQL na prática: MongoDB, Redis, modelagem de documentos e consistência',
  description: 'Bancos NoSQL com experimentos reais: os tipos (documento, chave-valor, colunar, grafo) e quando escolher cada um; MongoDB 8 (documentos e BSON, CRUD, validação, atomicidade, índices, explain, índices compostos, TTL), modelagem orientada a documentos (embutir x referenciar, padrões, limite de 16 MiB, transações), agregações (pipeline, $lookup, $facet, servidor x cliente); Redis 8 (estruturas, atomicidade, TTL, travas, HyperLogLog, pipeline, SCAN, transações com WATCH, streams, pub/sub, persistência e eviction); consistência, replicação e o teorema CAP (PACELC, write e read concern); e operação (backup restaurado, segurança, monitoramento) com o projeto Feed de eventos. Tudo foi executado em MongoDB 8.3.17 e Redis 8.12.0 em contêineres oficiais; partições de rede, sharding, TLS e autenticação não foram executados.',
  objectives: ['Escolher o tipo de banco NoSQL a partir do padrão de acesso e dos requisitos de consistência', 'Modelar documentos (embutir x referenciar) e indexar com base em explain', 'Escrever pipelines de agregação e saber quando agregar no servidor', 'Usar as estruturas do Redis com atomicidade, TTL, pipelines e streams', 'Configurar persistência e eviction conforme o papel do Redis', 'Raciocinar sobre CAP, PACELC e concerns, e planejar segurança e backup testado'],
  level: 'M', prereqs: ['SQL essencial (curso C3.1)', 'Modelagem de dados (curso C3.4)', 'JavaScript (Onda 1)', 'Docker (para praticar com MongoDB 8 e Redis 8)'], hours: 22,
  syllabus: 'Tipos de NoSQL; MongoDB: CRUD, validação, atomicidade, índices e explain; modelagem de documentos; agregações; Redis: estruturas, TTL, pipelines, transações, streams, persistência e eviction; consistência e CAP; operação, segurança, backup e projeto.',
  versions: 'MongoDB 8.3.17 (replica set de nó único para as transações), driver mongodb 7.9.1, Redis 8.12.0, ioredis 6.1.0 e Node.js 26.13, em 2026-11-25 (laboratório em seed/c3/labs/nosql-mongodb-redis/). As medições (medianas de 7 execuções após aquecimento, onde indicado) vêm de uma máquina e contêineres isolados em 127.0.0.1, com 100.000 pedidos e 10.000 clientes; a ordem de grandeza vale mais que os milissegundos. Não foram executados: sharding, eleições e failover com vários nós, partições de rede, Redis Cluster e Sentinel, Lua, módulos do Redis, autenticação e TLS (descritos a partir da documentação), índices de texto e geoespaciais, change streams, Atlas Search, Cassandra, Neo4j e demais bancos NoSQL. Foi anotado que a interpretação dos valores 3 e 2 da conferência de índices da restauração não foi detalhada.',
  skills: ['Escolha de banco NoSQL', 'Modelagem de documentos', 'Índices e explain no MongoDB', 'Pipeline de agregação', 'Estruturas e atomicidade do Redis', 'Filas com streams', 'Consistência e concerns', 'Backup, segurança e operação'],
  modules: [
    { id: 'm1', title: 'NoSQL e MongoDB', lessons: ['nsq-01', 'nsq-02', 'nsq-03'] },
    { id: 'm2', title: 'Documentos e agregações', lessons: ['nsq-04', 'nsq-05'] },
    { id: 'm3', title: 'Redis', lessons: ['nsq-06', 'nsq-07'] },
    { id: 'm4', title: 'Consistência e operação', lessons: ['nsq-08', 'nsq-09'] }
  ],
  materials: [REF.mongoCrud, REF2.mongoModeling, REF2.mongoAggregation, REF2.redisTypes, REF3.redisPersistence, REF3.mongoBackup].map((r) => ({ ...r })),
  projectIds: ['feed-de-eventos'],
  supplement: {
    glossary,
    cheatsheet: R`### Escolha
Documento (agregados flexíveis) · chave-valor (cache, sessões, contadores) · colunar (séries e análise) · grafo (relacionamentos profundos) · relacional (transações entre entidades)

### MongoDB
insertOne/find/updateOne ($set, $inc) · validação $jsonSchema (erro 121) · único (11000) · atomicidade por documento · índices (COLLSCAN x IXSCAN), composto: igualdade, ordenação, faixa · TTL · explain executionStats

### Modelagem
Embutir (poucos, lidos juntos) · referenciar (crescimento livre, compartilhado) · 16 MiB (erro 10334) · padrões: subconjunto, balde, referência estendida, versão do esquema · transações só em replica set

### Agregação
$match cedo · $group · $unwind · $lookup (indexe o foreignField) · $facet · agregar no servidor (147 ms x 1.159 ms)

### Redis
INCR atômico · TTL (-1 sem, -2 inexistente) · SET NX EX · hash, lista, conjunto, sorted set, HyperLogLog · pipeline · SCAN (nunca KEYS) · MULTI/WATCH · streams com XACK · pub/sub sem histórico · RDB e AOF · allkeys-lru (cache) x noeviction

### Consistência e operação
CAP (partição: C ou A) · PACELC · w majority · readConcern · idempotência · restaurar o backup e conferir · autenticação, ACLs, rede, TLS · monitorar memória e lag`,
    mistakes: ['Escolher NoSQL por moda ou por "escala".', 'Normalizar tudo e fazer junções na aplicação (ou embutir tudo e estourar 16 MiB).', 'Consultar sem índice e sem olhar o explain.', 'Somar no JavaScript o que o pipeline faz no servidor.', 'Ler, calcular e gravar um contador no Redis.', 'Usar KEYS em produção.', 'Usar pub/sub quando perder mensagens é inaceitável.', 'Deixar MongoDB e Redis sem senha em redes alcançáveis ou confiar em backups nunca restaurados.'],
    prereqMap: R`**Antes deste curso:** SQL essencial (C3.1), modelagem de dados (C3.4) e transações (C3.5, recomendado); JavaScript (Onda 1).

| Este curso prepara para | Por quê |
|---|---|
| Estratégias de cache (C3.8) | Redis como cache, expiração e eviction |
| Backend com Node e NestJS (C4) | persistência de documentos, filas e sessões |
| Mensageria e eventos (C4) | streams, idempotência e entrega pelo menos uma vez |
| Segurança (C7) | autenticação de bancos, ACLs, exposição de serviços |
| Arquitetura (C8) | consistência, CAP e escolha de bancos |

Ordem interna: aulas 1 a 3 (NoSQL e MongoDB) → 4 e 5 (documentos e agregações) → 6 e 7 (Redis) → 8 e 9 (consistência e operação).`,
    officialRefs: [REF.mongoCrud, REF.mongoBson, REF.mongoValidation, REF.mongoAtomicity, REF.mongoIndexes, REF.mongoExplain, REF.mongoTtl, REF.mongoLimits, REF2.mongoModeling, REF2.mongoEmbed, REF2.mongoPatterns, REF2.mongoAggregation, REF2.mongoPipeline, REF2.mongoLookup, REF2.mongoOptimization, REF2.redisTypes, REF2.redisCommands, REF2.redisExpire, REF2.redisPipelining, REF2.redisScan, REF2.redisHll, REF2.redisKeys, REF3.redisTx, REF3.redisStreams, REF3.redisPubsub, REF3.redisPersistence, REF3.redisEviction, REF3.redisSecurity, REF3.mongoConcerns, REF3.mongoWriteConcern, REF3.mongoReplication, REF3.mongoBackup, REF3.mongoSecurity, REF3.cap],
    practice: ['Suba MongoDB e Redis em contêineres e carregue 100 mil pedidos.', 'Compare COLLSCAN e IXSCAN e leia o explain de um índice composto.', 'Meça embutir x referenciar com 10 mil clientes.', 'Escreva um pipeline com $match, $unwind e $group e compare com somar no cliente.', 'Prove a diferença entre INCR e GET mais SET com 1.000 operações simultâneas.', 'Meça o pipeline do Redis e a diferença entre KEYS e SCAN.', 'Reproduza o allkeys-lru e o noeviction com maxmemory pequeno.', 'Faça o projeto integrador: o Feed de eventos.']
  }
};

export const COURSE = makeCourse({ course, lessons, exsets: ex, assessment, project });
