// Curso C1.4 da C1: Paradigmas de programação (disciplina: paradigms).
import { makeCourse } from '../courses/_lib.mjs';
import { REF, lessonsA } from './c14-a.mjs';
import { REF2, lessonsB } from './c14-b.mjs';
import { exsets, assessment, project } from './c14-ex.mjs';

const R = String.raw;
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA, ...lessonsB]);
const ex = dolar(exsets);

export const TOPICS = ['Programação orientada a objetos', 'Programação funcional', 'Concorrência e paralelismo'];
export const COVER = {
  'Programação orientada a objetos': ['par-01', 'par-02'],
  'Programação funcional': ['par-03', 'par-04'],
  'Concorrência e paralelismo': ['par-05', 'par-06']
};

const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'Paradigma', def: 'Estilo de organizar programas (objetos, funções, eventos), com seus conceitos e restrições.' },
  { term: 'Efeito colateral', def: 'Qualquer mudança observável fora do valor devolvido por uma função.' },
  { term: 'Estado mutável compartilhado', def: 'Dados alteráveis acessados por várias partes ou tarefas; principal fonte de bugs de concorrência.' },
  { term: 'Idempotência', def: 'Propriedade de uma operação que, repetida, produz o mesmo efeito que uma única execução.' },
  { term: 'Pool de tarefas', def: 'Mecanismo que limita quantas tarefas executam ao mesmo tempo.' },
  { term: 'Worker', def: 'Thread ou processo auxiliar que executa trabalho em segundo plano e se comunica por mensagens.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'paradigmas-programacao', disciplineId: 'paradigms', areaId: 'cs', requires: ['javascript-fundamentos'],
  title: 'Paradigmas de programação: objetos, funções e concorrência',
  description: 'Três formas de pensar o mesmo programa: orientação a objetos (encapsulamento, herança, composição, polimorfismo e injeção de dependência), programação funcional (funções puras, imutabilidade, closures, composição e recursão) e concorrência e paralelismo (processos, threads, event loop, condições de corrida, mutex, pools, atores e CSP). Todos os exemplos foram executados em Node.js 26, e o laboratório verifica seu código JavaScript com testes automáticos.',
  objectives: ['Projetar classes com encapsulamento, invariantes e interface pública mínima', 'Escolher entre herança e composição e aplicar polimorfismo e injeção de dependência', 'Escrever funções puras e transformar dados de forma imutável', 'Usar closures, composição, currying, memoização e recursão com segurança', 'Distinguir concorrência de paralelismo e escolher o modelo para tarefas de E/S e de CPU', 'Detectar e corrigir condições de corrida e deadlocks, com mutex, atômicos, pools e timeouts'],
  level: 'M', prereqs: ['JavaScript: funções, arrays, objetos, classes básicas e módulos', 'Noções de TypeScript (recomendado)', 'Para o módulo 3: conceitos de processos e threads do curso Linux, terminal e sistemas operacionais'], hours: 22,
  syllabus: 'Objetos, classes, encapsulamento e abstração; herança, composição, polimorfismo e injeção de dependência; funções puras, imutabilidade, map, filter e reduce; closures, composição, currying, memoização, recursão e Result; concorrência x paralelismo, processos, threads, event loop e Worker Threads; condições de corrida, atômicos, mutex, pools, AbortSignal, deadlock, atores e CSP.',
  versions: 'Node.js 26 (recursos usados desde o Node.js 22 LTS: campos privados, toSorted, with, Object.groupBy, structuredClone, AbortSignal.timeout, worker_threads, Atomics), JavaScript conforme ECMAScript 2025 e TypeScript 7 (para os exemplos de tipos). Medições de tempo dependem da máquina e do número de núcleos.',
  skills: ['Orientação a objetos', 'Composição e injeção de dependência', 'Programação funcional', 'Imutabilidade e funções puras', 'Concorrência e paralelismo', 'Sincronização e prevenção de corridas', 'Modelos de concorrência'],
  modules: [
    { id: 'm1', title: 'Orientação a objetos', lessons: ['par-01', 'par-02'] },
    { id: 'm2', title: 'Programação funcional', lessons: ['par-03', 'par-04'] },
    { id: 'm3', title: 'Concorrência e paralelismo', lessons: ['par-05', 'par-06'] }
  ],
  materials: [REF.mdnClasses, REF.mdnInherit, REF.mdnArray, REF2.mdnClosures, REF2.nodeWorkers, REF2.mdnEventLoop].map((r) => ({ ...r })),
  projectIds: ['pedidos-oop-vs-funcional'],
  supplement: {
    glossary,
    cheatsheet: R`### Orientação a objetos
Estado + comportamento · §#campo§ privado · getter sem setter · invariantes validadas nos métodos · "tell, don't ask" · objetos de valor imutáveis · composição > herança · polimorfismo por contrato (interface/duck typing) · injete dependências externas

### Herança x composição
é-um e substituível → herança; só reutilizar código → composição · hierarquia rasa · cuidado com classe base frágil (método do pai que chama método sobrescrito)

### Funcional
Pura: mesma entrada, mesma saída, sem efeitos · efeitos nas bordas · §map§ §filter§ §reduce(f, inicial)§ · não use §sort§/§reverse§ em dado compartilhado (use §toSorted§, §toReversed§, §with§) · §Object.freeze§ é raso · §structuredClone§ copia fundo

### Closures e composição
Closure = função + ambiente · §var§ em laço compartilha variável, §let§ não · §pipe§ esquerda→direita, §compose§ direita→esquerda · currying: §f(a)(b)§ · memoizar só funções puras · recursão: caso-base + passo; JS não garante TCO · falha esperada como valor (Result)

### Concorrência
Concorrência = estrutura; paralelismo = execução · E/S → async; CPU → Workers/processos · event loop: uma thread, run-to-completion · processo = memória própria; thread = memória compartilhada

### Sincronização
§x = x + 1§ não é atômico · §Atomics.add§ · mutex = fila de promises · check-then-act: torne atômico (UPDATE condicional, CAS) · pool com limite · §allSettled§ x §all§ · §AbortSignal.timeout(ms)§ · deadlock: ordem global de locks + timeout

### Modelos
Memória compartilhada com locks · atores (estado privado, mensagens) · CSP (canais) · async/await · concorrência estruturada`,
    mistakes: ['Expor todo o estado com getters e setters e chamar isso de encapsulamento.', 'Herdar apenas para reaproveitar código.', 'Alterar argumentos recebidos (sort, push) em funções que deveriam ser puras.', 'Capturar variável de laço com var em closures.', 'Usar threads para esperar rede, ou rodar cálculo pesado na thread principal.', 'Assumir que x++ é atômico e que await não permite corrida.', 'Disparar milhares de tarefas sem limite de concorrência nem timeout.', 'Adquirir locks em ordens diferentes.'],
    prereqMap: R`**Antes deste curso:** JavaScript (curso JavaScript: fundamentos, DOM e módulos) e noções de TypeScript. Para a aula 5, é útil ter visto processos e threads no curso Linux, terminal e sistemas operacionais.

| Este curso prepara para | Por quê |
|---|---|
| Clean Code, SOLID e Design Patterns | herança, composição, polimorfismo e DI são a base |
| Arquitetura de software | camadas, portas e adaptadores usam contratos e injeção |
| Java e Kotlin | orientação a objetos e concorrência (threads, coroutines) |
| JavaScript assíncrono | event loop e condições de corrida |
| Testes | funções puras e DI tornam o código testável |
| Estado em aplicações de interface | imutabilidade e funções puras (reducers) |

Ordem interna: aulas 1 e 2 (objetos) → 3 e 4 (funcional) → 5 e 6 (concorrência).`,
    officialRefs: [REF.mdnClasses, REF.mdnPrivate, REF.mdnInherit, REF.tsClasses, REF.mdnArray, REF.mdnFreeze, REF.mdnStructuredClone, REF2.mdnClosures, REF2.mdnEventLoop, REF2.nodeEventLoop, REF2.nodeWorkers, REF2.mdnAtomics, REF2.mdnPromise, REF2.mdnAbort, REF2.pikeConc, REF2.goSync],
    practice: ['Reescreva uma classe sua com campos privados e uma interface mínima, e escreva testes só pela interface pública.', 'Refatore uma hierarquia de três níveis para composição com um contrato comum.', 'Substitua uma cadeia de if por tipo por polimorfismo.', 'Pegue uma função impura sua e separe o cálculo puro dos efeitos.', 'Reproduza a armadilha do var em laço e corrija com let.', 'Meça uma tarefa de E/S e uma de CPU com e sem Workers e interprete o resultado.', 'Reproduza a corrida de saque duplo e corrija com mutex e, depois, com um UPDATE condicional em um banco.', 'Faça o projeto integrador: o sistema de pedidos em dois paradigmas.']
  }
};

export const COURSE = makeCourse({ course, lessons, exsets: ex, assessment, project });
