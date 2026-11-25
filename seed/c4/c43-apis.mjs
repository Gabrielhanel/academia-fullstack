// Curso C4.3 da C4: APIs REST, GraphQL e WebSockets (disciplina: apis).
import { makeCourse } from '../courses/_lib.mjs';
import { REF, lessonsA } from './c43-a.mjs';
import { REF2, lessonsB } from './c43-b.mjs';
import { REF3, lessonsC } from './c43-c.mjs';
import { exsets, assessment, project } from './c43-ex.mjs';

const R = String.raw;
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA, ...lessonsB, ...lessonsC]);
const ex = dolar(exsets);

export const TOPICS = ['HTTP e REST', 'Status codes e verbos', 'Design de APIs REST', 'OpenAPI', 'GraphQL: schema e resolvers', 'WebSockets', 'Paginação, filtros e rate limiting', 'Versionamento de APIs', 'Idempotência', 'API gateways e contratos'];
export const COVER = {
  'HTTP e REST': ['api-01'],
  'Status codes e verbos': ['api-01'],
  'Design de APIs REST': ['api-02'],
  'OpenAPI': ['api-03'],
  'GraphQL: schema e resolvers': ['api-04'],
  'WebSockets': ['api-05'],
  'Paginação, filtros e rate limiting': ['api-06'],
  'Versionamento de APIs': ['api-07'],
  'Idempotência': ['api-07'],
  'API gateways e contratos': ['api-08']
};

const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'Payload', def: 'Conteúdo transportado no corpo de uma requisição ou resposta.' },
  { term: 'Endpoint', def: 'Combinação de método e URL pela qual uma operação da API é acessada.' },
  { term: 'Idempotente', def: 'Propriedade de uma operação que pode ser repetida sem alterar o resultado final.' },
  { term: 'CORS', def: 'Mecanismo que permite ao servidor autorizar o navegador a ler respostas de outra origem.' },
  { term: 'Backoff exponencial', def: 'Espera que dobra a cada nova tentativa, geralmente com variação aleatória.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'apis', disciplineId: 'apis', areaId: 'back', requires: ['node-express'],
  title: 'APIs REST, GraphQL e WebSockets: design, contratos, paginação, idempotência e gateways',
  description: 'Design e operação de APIs com experimentos medidos: a semântica do HTTP (métodos seguros e idempotentes, status, ETag, If-Match com 428 e 412, 304, 406 e 405); design de APIs REST (recursos, URLs, erros em Problem Details, compatibilidade); OpenAPI 3.1 com validação da especificação, validação de requisições com Ajv e testes de contrato (campo removido, tipo mudado e valor novo no enum); GraphQL (schema, resolvers, N+1 com 50 consultas contra 1 usando DataLoader, erros parciais e custo por profundidade de 2,9 KB a 385 KB); WebSockets com ws (autenticação e Origin no handshake, maxPayload e fechamento 1009, heartbeat, broadcast para 300 clientes e consumidores lentos com 98 MiB acumulados); paginação (OFFSET a 488 ms contra keyset a 2,1 ms em 1 milhão de linhas) e rate limiting (janela fixa x balde de fichas, 429 e Retry-After); idempotência com Idempotency-Key (1 cobrança com 5 requisições simultâneas) e versionamento com Deprecation, Sunset e Link; gateway com roteamento, timeout e disjuntor, contratos entre serviços e o projeto API com contratos e tempo real. Apollo/Federation, Socket.IO, SSE, gateways de produção e Pact não foram executados.',
  objectives: ['Usar a semântica do HTTP corretamente, inclusive requisições condicionais', 'Desenhar APIs REST consistentes e descrevê-las em OpenAPI com testes de contrato', 'Construir e proteger APIs GraphQL contra N+1 e consultas caras', 'Implementar WebSockets seguros, com heartbeat e controle de consumidores lentos', 'Paginar por cursor e limitar taxa com algoritmos adequados', 'Projetar idempotência, versionamento e depreciação, e um gateway resiliente'],
  level: 'M', prereqs: ['Node.js e Express (curso C4.1)', 'SQL essencial (curso C3.1) para a paginação', 'JavaScript e HTTP básico (Onda 1)', 'Docker (apenas para o experimento de paginação com PostgreSQL)'], hours: 22,
  syllabus: 'HTTP e REST; design de APIs; OpenAPI e contratos; GraphQL; WebSockets; paginação e rate limiting; idempotência e versionamento; gateways e contratos.',
  versions: 'Node.js 26.13.1, Express 5.3.0, graphql 17.1.0, graphql-yoga 6.1.1, DataLoader 2.2.3, ws 8.23.0, Ajv 8.20.0, ajv-formats 3.0.1, @apidevtools/swagger-parser 13.1.0, express-rate-limit 8.7.5, pg 8.23.1 e PostgreSQL 17.12, em 2026-11-25 (laboratório em seed/c4/labs/apis/). Medidas de uma execução (a paginação usa a mediana de 7); o broadcast mede cliente e servidor no mesmo processo; o consumidor lento foi simulado pausando o socket; o gateway é didático. Correções feitas no laboratório: PUT idempotente, ouvinte de error do socket ws, alinhamento das posições da paginação, relógio do balde de fichas e o formato do cabeçalho Deprecation (RFC 9745). Não executados: Apollo Server e Federation, subscriptions GraphQL, Socket.IO e SSE, escala horizontal de WebSockets, Kong/Envoy/NGINX, clientes gerados do OpenAPI, Pact, oasdiff e Spectral, e contadores de rate limit compartilhados entre instâncias.',
  skills: ['Semântica HTTP', 'Design de APIs REST', 'OpenAPI e testes de contrato', 'GraphQL seguro', 'WebSockets', 'Paginação e rate limiting', 'Idempotência e versionamento', 'Gateways e resiliência'],
  modules: [
    { id: 'm1', title: 'HTTP, REST e contratos', lessons: ['api-01', 'api-02', 'api-03'] },
    { id: 'm2', title: 'GraphQL, tempo real e escala de leitura', lessons: ['api-04', 'api-05', 'api-06'] },
    { id: 'm3', title: 'Evolução, resiliência e gateways', lessons: ['api-07', 'api-08'] }
  ],
  materials: [REF.rfc9110, REF.openapi31, REF2.graphqlLearn, REF2.rfc6455, REF3.rfc9745, REF3.apiGateway].map((r) => ({ ...r })),
  projectIds: ['api-contratos-tempo-real'],
  supplement: {
    glossary,
    cheatsheet: R`### HTTP
Seguro: GET/HEAD/OPTIONS · idempotente: GET/PUT/DELETE · POST não · 201+Location · 204 · 304 · 400/401/403/404/405/406/409/412/415/422/428/429 · ETag + If-Match (428 sem, 412 velho) · Accept → 406

### Design
substantivos no plural · hierarquia rasa · filtros por query · ação = sub-recurso · Problem Details (RFC 9457) · compatível: adicionar; incompatível: remover/mudar tipo · BOLA/IDOR

### OpenAPI
3.1 + JSON Schema · validar a especificação ($ref) · Ajv allErrors · additionalProperties false · teste de contrato da resposta · design-first x code-first

### GraphQL
schema + resolvers · N+1: 50 → 1 com DataLoader (por requisição) · erros parciais = HTTP 200 · profundidade/custo/paginação · introspecção off em produção

### WebSocket
upgrade 101 · verifyClient (token + Origin) · maxPayload (1009) · ouvinte de error · heartbeat · bufferedAmount (98 MiB) · SSE se for unidirecional

### Paginação e rate limit
OFFSET p40.000 488 ms x keyset 2,1 ms · desempate único + índice · limite+1 · 429 + Retry-After · janela fixa 20 x balde 11 · por chave

### Idempotência e versão
Idempotency-Key: replay, 422, 409, 400 · reservar antes do await · URL x Accept vnd + Vary · Deprecation @data (RFC 9745) · Sunset · Link successor-version · brownout · 410

### Gateway
roteamento, auth, id de correlação · salto ~2,1 ms · timeout 504 · disjuntor 503 rápido · retry só idempotente · contratos`,
    mistakes: ['POST para tudo e 200 com erro no corpo.', 'Espelhar o banco na API.', 'Não validar o contrato das respostas.', 'DataLoader global e consultas GraphQL sem limites.', 'WebSocket sem Origin, sem ouvinte de error e sem controle de buffer.', 'OFFSET profundo e ordenação sem desempate.', 'Janela fixa como única defesa de rate limit.', 'Chave de idempotência reservada depois do await.', 'Remover campos sem depreciação.', 'Gateway com regra de negócio e sem timeout.'],
    prereqMap: R`**Antes deste curso:** Node.js e Express (C4.1); SQL (C3.1) para a aula de paginação.

| Este curso prepara para | Por quê |
|---|---|
| Autenticação e autorização (C4.4) | tokens nas APIs, autorização por objeto e segurança na borda |
| Filas (C4.5) | operações assíncronas e idempotência |
| Observabilidade (C4.6) | ids de correlação, métricas por rota e SLOs |
| Microsserviços (C4.7) | gateways, contratos e resiliência |
| Segurança (C7) | OWASP API Security, CORS, rate limiting |
| Mobile (C10) | consumo de APIs e tempo real |

Ordem interna: aulas 1 a 3 (HTTP, design e OpenAPI) → 4 a 6 (GraphQL, WebSockets, paginação e rate limit) → 7 e 8 (idempotência, versionamento e gateways).`,
    officialRefs: [REF.rfc9110, REF.mdnHttp, REF.mdnMethods, REF.mdnStatus, REF.mdnConditional, REF.mdnNegotiation, REF.richardson, REF.rfc9457, REF.googleAip, REF.msGuidelines, REF.openapi31, REF.jsonSchema, REF.ajv, REF.pact, REF2.graphqlLearn, REF2.graphqlSpec, REF2.graphqlJs, REF2.graphqlOverHttp, REF2.dataloader, REF2.yoga, REF2.rfc6455, REF2.mdnWs, REF2.mdnSse, REF2.wsLib, REF2.noOffset, REF2.rfc6585, REF2.rateLimitRepo, REF2.owaspApi, REF3.idemDraft, REF3.stripeIdem, REF3.rfc9745, REF3.rfc8594, REF3.apiGateway, REF3.bff, REF3.circuitBreaker, REF3.tolerantReader],
    practice: ['Reproduza 428, 412, 304, 406 e 405 em um servidor Express.', 'Valide uma especificação OpenAPI e um teste de contrato que detecte deriva.', 'Meça o N+1 em GraphQL e resolva com DataLoader.', 'Sirva um WebSocket com Origin, maxPayload e heartbeat.', 'Compare OFFSET e keyset em uma tabela grande.', 'Compare janela fixa e balde de fichas.', 'Implemente Idempotency-Key e teste a concorrência.', 'Faça o projeto integrador: API com contratos e tempo real.']
  }
};

export const COURSE = makeCourse({ course, lessons, exsets: ex, assessment, project });
