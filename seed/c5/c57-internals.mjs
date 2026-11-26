// Curso C5.7 da C5: Estruturas internas das linguagens (disciplina: internals).
import { makeCourse } from '../courses/_lib.mjs';
import { REF, lessonsA } from './c57-a.mjs';
import { REF2, lessonsB } from './c57-b.mjs';
import { exsets, assessment, project } from './c57-ex.mjs';

const R = String.raw;
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA, ...lessonsB]);
const ex = dolar(exsets);

export const TOPICS = ['Compiladores e interpretadores', 'Garbage collection'];
export const COVER = {
  'Compiladores e interpretadores': ['int-01', 'int-02'],
  'Garbage collection': ['int-03']
};

const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'Escape analysis', def: 'Otimização que verifica se um objeto escapa de uma função para alocá-lo na pilha ou eliminá-lo.' },
  { term: 'Inlining', def: 'Otimização que substitui uma chamada de função pelo corpo da função.' },
  { term: 'Stop-the-world', def: 'Pausa em que o programa é suspenso enquanto o coletor trabalha.' },
  { term: 'Raiz do GC', def: 'Referência de partida (pilha, globais, registradores) a partir da qual se determina o que é alcançável.' },
  { term: 'Backpatching', def: 'Preenchimento posterior do endereço de um salto cujo destino ainda não era conhecido.' },
  { term: 'Transpilador', def: 'Compilador que traduz de uma linguagem de alto nível para outra de nível semelhante.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'estruturas-internas', disciplineId: 'internals', areaId: 'cs', requires: [],
  title: 'Estruturas internas das linguagens: compiladores, interpretadores, JIT e garbage collection',
  description: 'Como as linguagens executam programas e gerenciam memória, com uma mini linguagem construída e medida e experimentos no V8 e no CPython: lexer, parser por descida recursiva, AST, interpretador de árvore e compilador para bytecode com VM (5 testes; mesmo laço de 1 milhão de iterações: árvore 2.149 ms, VM 1.012 ms, JavaScript com JIT 34,5 ms, C 11,6 ms, Python 698 ms), execução no V8 (Ignition, Maglev, desotimização "not a Smi", bytecode de x*2+1, formas de objeto 35,5 x 148,8 ms, --jitless 7x mais lento) e garbage collection (Scavenge e Mark-Compact: 46 coletas e 91,6 ms com lixo efêmero contra 776,1 ms e 175 MB com 1/3 retido; vazamento por cache sem limite com OOM em 64 MB; contagem de referências e coletor de ciclos do CPython: 50,4 MiB retidos sem o coletor). Projeto: mini linguagem. LLVM, GraalVM, PyPy, JVM, Go, Rust, WebAssembly e heap snapshots não foram executados.',
  objectives: ['Descrever as fases de um compilador ou interpretador e construir um simples', 'Comparar estratégias de execução (AST, bytecode, JIT, AOT) com medições', 'Observar a otimização e a desotimização do V8 e escrever código amigável ao JIT', 'Explicar contagem de referências, coleta por rastreamento e gerações', 'Diagnosticar e corrigir vazamentos de memória'],
  level: 'A', prereqs: ['JavaScript e Node.js', 'Noções de estruturas de dados (árvores e grafos)', 'Python 3 e gcc para os comparativos (opcional)'], hours: 8,
  syllabus: 'Compiladores e interpretadores; execução e JIT; garbage collection; projeto de mini linguagem.',
  versions: 'Node.js 26.13.1 (V8 14.6.202), Python 3.14.4 e gcc do sistema (Linux), sem dependências externas, em 2026-11-25 (laboratório em seed/c5/labs/estruturas-internas/). Tempos de uma máquina e uma execução (medianas de 5 quando indicado); as flags do V8 (--print-bytecode, --trace-opt, --trace-deopt, --trace-gc, --jitless) são de diagnóstico e mudam entre versões. Achados: o C empatou em -O0 e -O2 por causa da variável volatile; a VM do laboratório é mais lenta que o CPython; um gc() forçado aparece como um Mark-Compact nas medições. Os desafios de código são em JavaScript e modelam a lógica. Não executados: LLVM/Clang e IR, GraalVM, PyPy, JVM (G1/ZGC), Go, Rust, WebAssembly, WeakRef/FinalizationRegistry, heap snapshots e o JIT experimental do CPython.',
  skills: ['Lexer, parser e AST', 'Interpretadores e máquinas virtuais', 'JIT e desotimização', 'Garbage collection', 'Diagnóstico de vazamentos', 'Medição de desempenho'],
  modules: [
    { id: 'm1', title: 'Compilação, interpretação e execução', lessons: ['int-01', 'int-02'] },
    { id: 'm2', title: 'Gerenciamento automático de memória', lessons: ['int-03'] }
  ],
  materials: [REF.crafting, REF.v8Ignition, REF.v8Maglev, REF2.v8Trash, REF2.nodeMemory, REF.pyDis].map((r) => ({ ...r })),
  projectIds: ['mini-linguagem'],
  supplement: {
    glossary,
    cheatsheet: R`### Fases
léxica (tokens) → sintática (AST) → semântica → IR/otimização → geração (código de máquina, bytecode ou outra linguagem) → execução (CPU, VM, interpretador) · front-end x back-end

### Estratégias de execução
AOT (C, Rust, Go) · interpretador de AST (simples, lento) · bytecode + VM (CPython, JVM inicial) · JIT (V8, HotSpot, PyPy) · híbridos são a regra · medido: árvore 2.149 ms, VM 1.012, CPython 698, JS/JIT 34,5, C 11,6 (laço de 1M)

### V8
parser → Ignition (bytecode + feedback) → Maglev → TurboFan · deopt ("not a Smi") · formas de objeto e inline cache (1 forma 35,5 ms x 5 formas 148,8 ms) · --jitless 7x mais lento · flags: --print-bytecode, --trace-opt, --trace-deopt, --trace-gc · tipos e formas estáveis, arrays homogêneos · aquecer e repetir

### GC
refcount (imediato, não coleta ciclos) x rastreamento (mark-sweep/compact/copying) · hipótese geracional · V8: Scavenge (jovem), Mark-Compact incremental/concorrente · custo ∝ objetos vivos (91,6 ms x 776,1 ms) · vazamento = alcançável e inútil (cache sem limite → OOM) · CPython: refcount + coletor de ciclos (50,4 MiB x 0,1 MiB) · weakref, with · limite de heap alinhado ao contêiner`,
    mistakes: ['Dizer que uma linguagem "é interpretada" e logo lenta.', 'Confiar em microbenchmarks sem aquecimento, repetição e verificação do resultado.', 'Misturar formas de objeto e tipos em código quente.', 'Cache ou coleção sem limite.', 'Depender de finalizadores para liberar recursos.', 'Aumentar o limite de memória em vez de corrigir a retenção.', 'Usar eval com entrada do usuário.'],
    prereqMap: R`**Antes deste curso:** JavaScript, Node.js e noções de árvores e grafos.

| Este curso prepara para | Por quê |
|---|---|
| Qualidade e manutenção (C5.8) | métricas, desempenho e confiabilidade |
| Observabilidade (C4.6) e SRE | métricas de heap e GC em produção |
| JVM (C9) | JIT em camadas e coletores G1/ZGC |
| IA e carreira (C11) | desempenho de runtimes de modelos e custo de inferência |

Ordem interna: aulas 1 e 2 (compilação e execução) → 3 (GC).`,
    officialRefs: [REF.crafting, REF.cs6120, REF.pyDis, REF.pyAst, REF.v8Ignition, REF.v8Maglev, REF.v8Docs, REF.shapes, REF.gccOpt, REF2.v8Trash, REF2.nodePerf, REF2.nodeMemory, REF2.pyGc, REF2.tracingGc],
    practice: ['Implemente um lexer e um parser de expressões aritméticas com precedência.', 'Execute a AST de duas formas e compare os tempos.', 'Observe um deopt com --trace-deopt mudando o tipo de um argumento.', 'Meça objetos com 1 e 5 formas.', 'Meça coletas com PerformanceObserver e compare lixo efêmero com objetos retidos.', 'Reproduza e corrija um vazamento por cache sem limite com --max-old-space-size.', 'Reproduza um ciclo no CPython com o coletor desligado.', 'Faça o projeto integrador: mini linguagem.']
  }
};

export const COURSE = makeCourse({ course, lessons, exsets: ex, assessment, project });
