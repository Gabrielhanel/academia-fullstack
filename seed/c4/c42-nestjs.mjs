// Curso C4.2 da C4: NestJS (disciplina: nest).
import { makeCourse } from '../courses/_lib.mjs';
import { REF, lessonsA } from './c42-a.mjs';
import { REF2, lessonsB } from './c42-b.mjs';
import { REF3, lessonsC } from './c42-c.mjs';
import { exsets, assessment, project } from './c42-ex.mjs';

const R = String.raw;
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA, ...lessonsB, ...lessonsC]);
const ex = dolar(exsets);

export const TOPICS = ['Módulos, controllers e providers', 'Injeção de dependências', 'Pipes e validação', 'Guards', 'Interceptors', 'Exception filters', 'Microsserviços com Nest', 'Filas com BullMQ', 'Testes no Nest', 'Arquitetura modular com Nest'];
export const COVER = {
  'Módulos, controllers e providers': ['nst-01'],
  'Injeção de dependências': ['nst-02'],
  'Pipes e validação': ['nst-03'],
  'Guards': ['nst-04'],
  'Interceptors': ['nst-05'],
  'Exception filters': ['nst-06'],
  'Microsserviços com Nest': ['nst-08'],
  'Filas com BullMQ': ['nst-08'],
  'Testes no Nest': ['nst-07'],
  'Arquitetura modular com Nest': ['nst-09']
};

const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'Decorador', def: 'Anotação (@Algo) que adiciona metadados ou comportamento a classes, métodos e parâmetros.' },
  { term: 'Reflect Metadata', def: 'API usada pelo Nest para ler os metadados emitidos pelo TypeScript.' },
  { term: 'RxJS', def: 'Biblioteca de programação reativa com Observables, usada em interceptors e microsserviços.' },
  { term: 'ESM', def: 'Sistema de módulos padrão da linguagem JavaScript.' },
  { term: 'Bola de lama', def: 'Arquitetura sem estrutura clara, com forte acoplamento entre as partes.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'nestjs', disciplineId: 'nest', areaId: 'back', requires: ['node-express', 'typescript-fundamentos'],
  title: 'NestJS 12: módulos, injeção de dependências, pipeline de requisição, testes, filas e arquitetura modular',
  description: 'APIs com NestJS 12.6.1 e TypeScript 7 em experimentos medidos: módulos, controllers, providers e encapsulamento (erro de resolução sem exports), requisitos do projeto (ESM, nodenext, metadados de decoradores), injeção de dependências (useValue, useClass, useFactory, useExisting, escopos com 1 singleton x 5 instâncias por requisição, dependência circular, ciclo de vida e desligamento), pipes e validação (ValidationPipe com lista branca, conversão de tipos, ParseIntPipe, ParseUUIDPipe), guards (403 e negar por padrão), a ordem da linha de processamento, interceptors (envelope, timeout de 100 ms com 408 em ~110 ms), exception filters (erros de domínio e Problem Details), testes com módulo de teste, overrideProvider e Supertest, microsserviço TCP (500 chamadas em 292 ms) e filas BullMQ com retry e backoff, módulos dinâmicos, configuração validada na partida e monólito modular, além do projeto API Nest modular. GraphQL, WebSockets, Swagger, Passport, CQRS e outros transportes não foram executados.',
  objectives: ['Estruturar uma aplicação Nest em módulos com fronteiras e exports mínimos', 'Usar injeção de dependências, providers customizados, escopos e ciclo de vida', 'Validar entrada, autorizar e padronizar erros com pipes, guards, interceptors e filtros', 'Escrever testes unitários e e2e com substituição de providers', 'Integrar microsserviços e filas com retry, backoff e idempotência', 'Configurar e organizar um monólito modular preparado para evoluir'],
  level: 'M', prereqs: ['Node.js e Express (curso C4.1)', 'TypeScript (Onda 1)', 'HTTP e REST básicos', 'Node.js 22 ou superior; Docker (apenas para a fila com Redis)'], hours: 25,
  syllabus: 'Módulos, controllers e providers; DI; pipes e validação; guards; interceptors; filtros; testes; microsserviços e filas com BullMQ; arquitetura modular e configuração; projeto.',
  versions: 'NestJS 12.6.1 (common, core, platform-express, testing, microservices), @nestjs/bullmq 12.0.2, @nestjs/config 12.1.1, BullMQ 6.7.10, ioredis 6.1.0, class-validator 0.15.1, class-transformer 0.5.1, rxjs 7.8.2, TypeScript 7.0.2, Supertest 7.3.2, Node.js 26.13.1 e Redis 8 (contêiner c4-redis), em 2026-11-25 (laboratório em seed/c4/labs/nestjs/). Achados do ambiente: o Nest 12 é ESM (projeto com nodenext); o TypeScript 7 removeu node10; o tsx/esbuild não emite metadados de DI; sem abortOnError false o NestFactory chama process.exit(1); o BullMQ 6 exige ioredis. Medidas de uma execução, em uma máquina; a forma importa mais que os milissegundos. Não executados: CLI do Nest, Swagger/OpenAPI, GraphQL, WebSockets, Fastify, Passport e @nestjs/jwt, CQRS, event-emitter, schedule, terminus, ORMs, transportes Redis/NATS/Kafka/gRPC, testes com banco real, erros de middlewares do Express fora do contexto do Nest, vários interceptors encadeados e o comportamento de enableImplicitConversion.',
  skills: ['Módulos e DI no Nest', 'Pipes e validação', 'Guards e autorização', 'Interceptors', 'Filtros e erros', 'Testes no Nest', 'Microsserviços e filas', 'Arquitetura modular'],
  modules: [
    { id: 'm1', title: 'Fundamentos: módulos, providers e DI', lessons: ['nst-01', 'nst-02'] },
    { id: 'm2', title: 'A linha de processamento da requisição', lessons: ['nst-03', 'nst-04', 'nst-05', 'nst-06'] },
    { id: 'm3', title: 'Testes, serviços distribuídos e arquitetura', lessons: ['nst-07', 'nst-08', 'nst-09'] }
  ],
  materials: [REF.nestFirst, REF.nestModules, REF.nestCustomProviders, REF2.nestLifecycleReq, REF3.nestTesting, REF3.nestQueues].map((r) => ({ ...r })),
  projectIds: ['api-nest-modular'],
  supplement: {
    glossary,
    cheatsheet: R`### Projeto Nest 12
ESM ("type": "module", nodenext) · TypeScript 7 sem node10 · experimentalDecorators + emitDecoratorMetadata · compilar com tsc (tsx não emite metadados) · abortOnError: false em testes

### Módulos e DI
providers (privados) · exports (públicos) · imports · @Global com moderação · useValue/useClass/useFactory/useExisting · Symbol como token · escopo REQUEST (1 x 5 instâncias; custo) · forwardRef = paliativo · hooks: onModuleInit → onApplicationBootstrap → onModuleDestroy → beforeApplicationShutdown → onApplicationShutdown

### Pipeline
middleware → guard → interceptor (antes) → pipe → handler → interceptor (depois) → filtro

### Validação e pipes
DTO = classe · ValidationPipe whitelist + forbidNonWhitelisted + transform · @Type(() => Number) · ParseIntPipe/ParseUUIDPipe/DefaultValuePipe · 400 com lista de mensagens

### Guards, interceptors e filtros
canActivate false = 403; 401 = não autenticado · APP_GUARD negando por padrão + @Public · verificar o dono (IDOR) · interceptor: tap/map/timeout (não cancela) · filtro: @Catch, Problem Details, 500 genérico sem stack, APP_FILTER

### Testes
Test.createTestingModule · overrideProvider · Supertest · node --test (compilar antes) · repetir pipes globais no teste · matriz papel × rota × resultado

### Microsserviços e filas
@MessagePattern x @EventPattern · TCP 500 chamadas em 292 ms · timeout e disjuntor · BullMQ: attempts 3 + backoff, instável conclui, quebrado fica failed · idempotência · ioredis exigido

### Arquitetura
Módulos dinâmicos forRoot/forRootAsync/forFeature · ConfigModule.validate (falha rápida) · organizar por domínio · fronteiras · monólito modular antes de microsserviços`,
    mistakes: ['Esquecer de exportar um provider ou listá-lo em providers.', 'Rodar o TypeScript com um transpilador que não emite metadados.', 'Controllers com regra de negócio.', 'Usar escopo de requisição sem necessidade.', 'Resolver circularidade sempre com forwardRef.', 'Papel vindo de um cabeçalho do cliente.', 'Confundir 401 e 403 e esquecer a verificação do dono.', 'Achar que o timeout cancela o trabalho.', 'Vazar stack em respostas 5xx.', 'Não repetir pipes globais nos testes e2e.', 'Processadores de fila não idempotentes.', 'Módulos acessando tabelas uns dos outros.'],
    prereqMap: R`**Antes deste curso:** Node.js e Express (C4.1) e TypeScript (Onda 1).

| Este curso prepara para | Por quê |
|---|---|
| APIs REST, GraphQL e WebSockets (C4.3) | design de API, OpenAPI, GraphQL e gateways no Nest |
| Autenticação e autorização (C4.4) | guards, estratégias e tokens |
| Filas e processamento assíncrono (C4.5) | BullMQ e padrões de jobs em profundidade |
| Observabilidade (C4.6) | interceptors, logs e métricas |
| Microsserviços (C4.7) | fronteiras, comunicação e sagas |
| Testes (C5) | testes de integração e e2e de APIs |

Ordem interna: aulas 1 e 2 (módulos e DI) → 3 a 6 (pipeline: pipes, guards, interceptors, filtros) → 7 a 9 (testes, microsserviços e filas, arquitetura).`,
    officialRefs: [REF.nestFirst, REF.nestControllers, REF.nestProviders, REF.nestModules, REF.nestCustomProviders, REF.nestScopes, REF.nestCircular, REF.nestLifecycle, REF.nestPipes, REF.nestValidation, REF.classValidator, REF2.nestGuards, REF2.nestInterceptors, REF2.nestFilters, REF2.nestLifecycleReq, REF2.nestExecContext, REF2.nestCustomDecorators, REF2.rxjs, REF2.rfc9457, REF2.owaspAuthz, REF3.nestTesting, REF3.nodeTest, REF3.supertest, REF3.nestMicroBasics, REF3.nestQueues, REF3.bullmq, REF3.bullmqRetry, REF3.nestDynamic, REF3.nestConfig, REF3.nestOpenapi, REF3.nestCqrs, REF3.fowlerMicro, REF3.fowlerMonolithFirst],
    practice: ['Monte o menor app Nest e meça o encapsulamento sem exports.', 'Reproduza as formas de provider e o escopo por requisição.', 'Valide um DTO e confira as mensagens e a lista branca.', 'Escreva um guard de papéis e uma matriz de testes.', 'Implemente envelope e timeout e confirme que o timeout não cancela o trabalho.', 'Crie um filtro de domínio e um filtro global de Problem Details.', 'Escreva testes unitário e e2e com overrideProvider.', 'Faça o projeto integrador: API Nest modular.']
  }
};

export const COURSE = makeCourse({ course, lessons, exsets: ex, assessment, project });
