// Curso C5.2 da C5: Design Patterns (disciplina: patterns).
import { makeCourse } from '../courses/_lib.mjs';
import { REF, lessonsA } from './c52-a.mjs';
import { REF2, lessonsB } from './c52-b.mjs';
import { REF3, lessonsC } from './c52-c.mjs';
import { exsets, assessment, project } from './c52-ex.mjs';

const R = String.raw;
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA, ...lessonsB, ...lessonsC]);
const ex = dolar(exsets);

export const TOPICS = ['Padrões criacionais', 'Padrões estruturais', 'Padrões comportamentais', 'Dependency Injection', 'Anti-patterns'];
export const COVER = {
  'Padrões criacionais': ['pat-01'],
  'Padrões estruturais': ['pat-02'],
  'Padrões comportamentais': ['pat-03'],
  'Dependency Injection': ['pat-04'],
  'Anti-patterns': ['pat-05']
};

const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'GoF', def: 'Gang of Four: autores do livro de 1994 que catalogou 23 padrões de projeto.' },
  { term: 'Fake', def: 'Dublê de teste com implementação funcional simplificada.' },
  { term: 'Stub', def: 'Dublê de teste que devolve respostas fixas.' },
  { term: 'Spy', def: 'Dublê que registra as chamadas recebidas para verificação posterior.' },
  { term: 'Idempotência', def: 'Propriedade de uma operação poder ser repetida com o mesmo efeito de uma única execução.' },
  { term: 'Backoff', def: 'Espera crescente entre tentativas de uma operação que falhou.' },
  { term: 'ADR', def: 'Architecture Decision Record: registro curto de uma decisão arquitetural, seu contexto e alternativas.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'design-patterns', disciplineId: 'patterns', areaId: 'arch', requires: [],
  title: 'Design Patterns: criacionais, estruturais, comportamentais, injeção de dependência e anti-patterns em JavaScript',
  description: 'Os padrões do GoF aplicados a JavaScript moderno, com código executado em Node.js 26.13.1 (22 testes sem dependências): padrões criacionais (Factory por tabela, Builder com campos privados e SQL parametrizado, Singleton de módulo e o estado global que faz o segundo teste receber 3), estruturais (Adapter, Decorators de retry, cache e log: 100 leituras de 524 ms para 52 ms; Facade com compensação; Proxy: 10 milhões de leituras 30,6 ms x 1.613,6 ms; Composite), comportamentais (Strategy, State, Observer com o aviso do 11º ouvinte e 100.000 ouvintes 4,0 → 117,2 → 4,1 MB, Command com desfazer, Chain of Responsibility, Template Method e geradores), Dependency Injection (injeção manual, raiz de composição, contêiner mínimo com ciclos de vida e circularidade, Service Locator como anti-padrão, NestJS conceitual) e anti-patterns (God Object: 6 dependências falsas x 0, Golden Hammer, Big Ball of Mud, Lava Flow, pattern-itis). Projeto: motor de regras de pedido. NestJS DI, InversifyJS, TSyringe, RxJS e XState não foram executados.',
  objectives: ['Reconhecer e aplicar os padrões criacionais, estruturais e comportamentais mais usados', 'Preferir a solução simples e usar padrões quando reduzem complexidade', 'Aplicar injeção de dependência com raiz de composição e testar com dublês', 'Medir custos e riscos dos padrões (cache, Proxy, ouvintes)', 'Identificar anti-patterns e propor saídas seguras'],
  level: 'M', prereqs: ['JavaScript moderno (classes, módulos, closures, async/await)', 'Clean Code e SOLID (C5.1)', 'Node.js 22 ou superior (o curso usa 26.13.1)'], hours: 10,
  syllabus: 'Padrões criacionais, estruturais e comportamentais; Dependency Injection; anti-patterns; projeto de motor de regras.',
  versions: 'Node.js 26.13.1 (node:test, node:events), sem dependências externas, em 2026-11-25 (laboratório em seed/c5/labs/design-patterns/). Medidas de duas execuções em uma máquina; os micro-benchmarks de Proxy variaram (18,2 ms x 1.036,7 ms na primeira execução; 30,6 ms x 1.613,6 ms na segunda) e o curso cita a segunda, registrando a variação. Os desafios de código são em JavaScript e modelam a lógica. Não executados: NestJS (DI e testing module, trecho conceitual), InversifyJS, TSyringe, RxJS, XState, Mediator, Memento, Visitor, Bridge e Flyweight.',
  skills: ['Padrões criacionais, estruturais e comportamentais', 'Injeção de dependência e raiz de composição', 'Decorators e composição de funções', 'Máquinas de estado e cadeias de responsabilidade', 'Identificação de anti-patterns', 'Testes com dublês'],
  modules: [
    { id: 'm1', title: 'Criacionais e estruturais', lessons: ['pat-01', 'pat-02'] },
    { id: 'm2', title: 'Comportamentais e injeção de dependência', lessons: ['pat-03', 'pat-04'] },
    { id: 'm3', title: 'Anti-patterns', lessons: ['pat-05'] }
  ],
  materials: [REF.gof, REF.guruCatalog, REF2.fowlerInjection, REF2.seemannRoot, REF3.antipatternWiki].map((r) => ({ ...r })),
  projectIds: ['motor-de-regras-patterns'],
  supplement: {
    glossary,
    cheatsheet: R`### Criacionais
Factory = tabela de construtores + erro explícito · Builder = campos privados + encadeamento + construir() validando · Singleton: módulo já é único por processo; o problema é o estado global (testes: 1, 2 e 3) → injete

### Estruturais
Adapter muda interface · Decorator = mesma interface + comportamento (retry, cache, log; cache por fora do retry; sem cachear erros) · Facade fina + compensação · Proxy controla acesso (custo: 30,6 ms x 1.613,6 ms em 10 M leituras) · Composite parte/todo

### Comportamentais
Strategy (cliente escolhe) x State (objeto muda; tabela de transições) · Observer: guarde a referência e use off (11º ouvinte avisa; 100.000 ouvintes 117,2 MB) · Command (fazer/desfazer) · Chain (next; curto-circuito) · Template Method · geradores

### DI
DIP princípio · DI técnica · IoC · contêiner opcional · construtor · raiz de composição · singleton/transiente/por requisição · captive dependency · Service Locator = dependência escondida · fakes e relógio injetado

### Anti-patterns
God Object (6 deps falsas) · spaghetti · copy-paste · magic strings · estado global · Service Locator · anêmico · otimização prematura · Golden Hammer · Big Ball of Mud · Lava Flow · pattern-itis (Yagni, regra dos três)`,
    mistakes: ['Implementar Singleton clássico em Node ignorando o cache de módulos.', 'Estado global mutável compartilhado entre testes.', 'Cachear erros ou repetir com retry operações não idempotentes.', 'Ouvintes registrados sem remoção e limite de listeners aumentado para esconder o aviso.', 'Service Locator e new de infraestrutura na regra de negócio.', 'Aplicar padrões por reflexo, sem variação real.', 'Usar Proxy em código quente sem medir.', 'Confundir State com Strategy.'],
    prereqMap: R`**Antes deste curso:** JavaScript moderno e Clean Code e SOLID (C5.1).

| Este curso prepara para | Por quê |
|---|---|
| NestJS (C4.2) e frameworks com DI | providers, módulos e escopos usam os conceitos de DI |
| Documentação arquitetural (C5.3) | ADRs registram a escolha (ou a recusa) de padrões |
| Fundamentos de testes (C5.4) | dublês e injeção tornam o código testável |
| Arquitetura e microsserviços (C8) | os mesmos padrões em escala de serviços (sagas, gateways, Strangler) |

Ordem interna: aulas 1 e 2 (criacionais e estruturais) → 3 e 4 (comportamentais e DI) → 5 (anti-patterns e projeto).`,
    officialRefs: [REF.gof, REF.guruCatalog, REF.guruSingleton, REF.guruBuilder, REF.guruFactory, REF.guruDecorator, REF.guruAdapter, REF.mdnProxy, REF.mdnPrivate, REF.nodeModulesCache, REF.nodeTest, REF2.nodeEvents, REF2.mdnGenerators, REF2.guruStrategy, REF2.guruObserver, REF2.guruCommand, REF2.guruState, REF2.guruChain, REF2.fowlerInjection, REF2.seemannRoot, REF2.nestProviders, REF2.nestCustomProviders, REF2.expressMiddleware, REF3.antipatternWiki, REF3.bigBall, REF3.fowlerAnemic, REF3.fowlerYagni],
    practice: ['Implemente uma Factory por tabela e um Builder com campos privados e teste ambos.', 'Reproduza o estado global do Singleton e corrija com injeção.', 'Componha retry, cache e log e meça o efeito do cache.', 'Meça o custo de um Proxy e discuta quando vale.', 'Modele um pedido com State e teste as transições inválidas.', 'Reproduza o aviso de 11 ouvintes e remova-os com off.', 'Monte uma raiz de composição e um contêiner mínimo com ciclos de vida.', 'Faça o projeto integrador: motor de regras de pedido.']
  }
};

export const COURSE = makeCourse({ course, lessons, exsets: ex, assessment, project });
