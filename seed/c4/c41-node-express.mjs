// Curso C4.1 da C4: Node.js e Express (disciplina: node).
import { makeCourse } from '../courses/_lib.mjs';
import { REF, lessonsA } from './c41-a.mjs';
import { REF2, lessonsB } from './c41-b.mjs';
import { exsets, assessment, project } from './c41-ex.mjs';

const R = String.raw;
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA, ...lessonsB]);
const ex = dolar(exsets);

export const TOPICS = ['Runtime e event loop do Node', 'Módulos e npm', 'Express', 'Middlewares', 'Tratamento de erros', 'Streams e buffers', 'Worker threads', 'Profiling no Node', 'Node.js em produção'];
export const COVER = {
  'Runtime e event loop do Node': ['nex-01'],
  'Módulos e npm': ['nex-02'],
  'Express': ['nex-03'],
  'Middlewares': ['nex-04'],
  'Tratamento de erros': ['nex-05'],
  'Streams e buffers': ['nex-06'],
  'Worker threads': ['nex-06'],
  'Profiling no Node': ['nex-07'],
  'Node.js em produção': ['nex-07']
};

const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'libuv', def: 'Biblioteca de E/S assíncrona e do event loop usada pelo Node.js.' },
  { term: 'V8', def: 'Motor de JavaScript usado pelo Node.js e pelo Chrome.' },
  { term: 'LTS', def: 'Versão de suporte de longo prazo do Node.js, recomendada para produção.' },
  { term: 'npx', def: 'Executa binários de pacotes do npm sem instalá-los globalmente.' },
  { term: 'Heap', def: 'Região de memória onde o V8 aloca objetos de JavaScript.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'node-express', disciplineId: 'node', areaId: 'back', requires: ['javascript-fundamentos'],
  title: 'Node.js e Express 5: event loop, módulos, middlewares, erros, streams e produção',
  description: 'Backend com Node.js 26 e Express 5.3, com experimentos medidos: o event loop (ordem de execução e o efeito de um laço de 600 ms, com e sem worker thread), módulos ESM e CommonJS (require de ESM, import() dinâmico, "type"), npm, semver e lockfile; Express 5 (rotas, params, query, body, curingas nomeados, handlers assíncronos), middlewares (ordem, limites do express.json, helmet, CORS e pré-voo), tratamento de erros (middleware de erro, classes de domínio, formato padronizado, rejeições e exceções do processo), streams, buffers e backpressure (200 MiB: pico de 251 MiB com readFile x 84 MiB com stream), worker threads (2,9x com 4 workers), profiling com --cpu-prof, desligamento ordenado (4,1 s x 1,1 s), health checks, configuração e logs estruturados, e o projeto API Express pronta para produção. Cluster, PM2, contêineres, HTTP/2 e flame graphs não foram executados.',
  objectives: ['Explicar o event loop e evitar o bloqueio da thread de JavaScript', 'Escolher e configurar módulos ESM ou CommonJS e gerenciar dependências com semver e lockfile', 'Construir APIs com Express 5, middlewares, validação e tratamento central de erros', 'Processar dados grandes com streams e tarefas de CPU com workers', 'Diagnosticar com perfil de CPU e métricas do loop', 'Operar a aplicação em produção: saúde, configuração, logs e desligamento ordenado'],
  level: 'M', prereqs: ['JavaScript e TypeScript (Onda 1)', 'HTTP básico (Onda 1)', 'Node.js 22 ou superior instalado'], hours: 22,
  syllabus: 'Event loop e runtime; módulos e npm; Express 5: rotas, middlewares e erros; streams e workers; profiling; produção: saúde, configuração, logs e shutdown.',
  versions: 'Node.js 26.13.1, Express 5.3.0, helmet 8.3.0, cors 2.8.6, pino 10.4.0 e zod 4.6.7, em 2026-11-25 (laboratório em seed/c4/labs/node-express/). Os tempos são de uma máquina de 8 núcleos e, salvo indicação, de uma execução; a forma importa mais que os milissegundos. Correções feitas durante o laboratório: cliente e servidor no mesmo processo (refeito com processos separados), dois métodos de memória no mesmo processo (refeito com um processo por método), parser global registrado antes de uma exceção de limite (exemplo corrigido e verificado). Não executados: Express 4 (comparações vêm da documentação), cluster, PM2, contêineres e PID 1, HTTP/2, proxy reverso, npm audit, Chrome DevTools, flame graphs e clinic.js, heap snapshots e o comportamento de navegadores com CORS.',
  skills: ['Event loop', 'Módulos e npm', 'Express 5', 'Middlewares e segurança de cabeçalhos', 'Tratamento de erros', 'Streams e workers', 'Profiling', 'Operação em produção'],
  modules: [
    { id: 'm1', title: 'Runtime, módulos e npm', lessons: ['nex-01', 'nex-02'] },
    { id: 'm2', title: 'Express: rotas, middlewares e erros', lessons: ['nex-03', 'nex-04', 'nex-05'] },
    { id: 'm3', title: 'Dados grandes, CPU e produção', lessons: ['nex-06', 'nex-07'] }
  ],
  materials: [REF.eventLoop, REF.expressRouting, REF.expressMigrating5, REF.expressErrors, REF2.streams, REF2.expressShutdown].map((r) => ({ ...r })),
  projectIds: ['api-express-producao'],
  supplement: {
    glossary,
    cheatsheet: R`### Event loop
Uma thread de JS · E/S delegada · síncrono → nextTick/microtarefas → timers/immediate · timer 0 x immediate (módulo principal: não determinístico; em E/S: immediate primeiro) · laço de 600 ms: rota rápida 558 ms · worker: 5 ms · monitorEventLoopDelay

### Módulos e npm
"type": "module" · .mjs/.cjs · require(ESM) ok no Node 26 · import() dinâmico · __dirname não existe no ESM (import.meta.dirname) · semver ^ ~ · lockfile + npm ci · poucas dependências

### Express 5
Router por recurso · req.params/query/body · "*caminho" (array) · handler async → erro vai ao tratador · req.body undefined sem parser · 404 e erro por último

### Middlewares
ordem = execução · next() ou responder · express.json limit (100 KB; 413) · exceções antes do parser global · helmet · CORS (origens exatas; não autentica; pré-voo 204)

### Erros
(err, req, res, next) · classes de domínio · sem stack no cliente · Problem Details · rejeição sem tratamento = código 1 · registrar, drenar, reiniciar

### Streams e CPU
pipeline (backpressure + erros) · 200 MiB: 251 MiB x 84 MiB · worker pool · 4 workers = 2,9x · fila para tarefas longas

### Produção
--cpu-prof (self time) · SIGTERM: server.close + closeIdleConnections · liveness x readiness · 12 fatores: env validado (Zod) · logs pino com redação · PID 1 recebe sinais`,
    mistakes: ['Bloquear o event loop com laços ou APIs ...Sync nos handlers.', 'Depender da ordem entre setTimeout 0 e setImmediate.', 'Usar __dirname em ESM ou esquecer a extensão nos imports.', 'Não commitar o lockfile e instalar com npm install em CI.', 'Esquecer next() ou registrar parsers depois das rotas.', 'Registrar uma rota com limite maior depois do parser global.', 'Devolver stack e mensagens internas em respostas 500.', 'Encerrar o processo sem drenar as requisições.'],
    prereqMap: R`**Antes deste curso:** JavaScript e TypeScript e HTTP básico (Onda 1).

| Este curso prepara para | Por quê |
|---|---|
| NestJS (C4.2) | os mesmos conceitos de HTTP, middlewares e erros com injeção de dependências |
| APIs REST, GraphQL e WebSockets (C4.3) | design de API sobre o Express |
| Autenticação (C4.4) | middlewares de autenticação, cookies e cabeçalhos |
| Filas (C4.5) | tarefas de CPU e longas fora do handler |
| Observabilidade (C4.6) | logs, métricas do loop e health checks |
| Testes (C5) | testes de integração de rotas e de erros |

Ordem interna: aulas 1 e 2 (runtime e módulos) → 3, 4 e 5 (Express, middlewares e erros) → 6 e 7 (streams, workers, diagnóstico e produção).`,
    officialRefs: [REF.eventLoop, REF.dontBlock, REF.esm, REF.modules, REF.packages, REF.packageJson, REF.semver, REF.npmCi, REF.expressRouting, REF.expressMigrating5, REF.expressMiddleware, REF.expressWriteMiddleware, REF.expressErrors, REF.expressApi, REF2.streams, REF2.streamsPipeline, REF2.buffer, REF2.workers, REF2.perfHooks, REF2.profiling, REF2.cliCpuProf, REF2.http, REF2.process, REF2.expressSecurity, REF2.expressPerformance, REF2.expressShutdown, REF2.helmet, REF2.cors, REF2.pino, REF2.twelveFactor],
    practice: ['Reproduza a ordem das tarefas em CommonJS e em um callback de E/S.', 'Bloqueie o event loop e meça o atraso com e sem worker.', 'Teste o mesmo .js com e sem "type": "module" e use require de um ESM.', 'Reproduza o 413, o 400 e a ordem do parser global.', 'Compare erros síncronos e assíncronos no Express 5.', 'Meça readFile x stream em 200 MiB, cada um em um processo.', 'Gere e leia um perfil com --cpu-prof.', 'Faça o projeto integrador: API Express pronta para produção.']
  }
};

export const COURSE = makeCourse({ course, lessons, exsets: ex, assessment, project });
