// C5.7 — Estruturas internas das linguagens. Aula 3 (garbage collection).
import { REF } from './c57-a.mjs';
const R = String.raw;

export const REF2 = {
  v8Trash: { title: 'V8 — Trash talk: the Orinoco garbage collector', url: 'https://v8.dev/blog/trash-talk', kind: 'artigo' },
  nodePerf: { title: 'Node.js — perf_hooks (entradas de GC)', url: 'https://nodejs.org/api/perf_hooks.html', kind: 'doc' },
  nodeMemory: { title: 'Node.js — Understanding and tuning memory', url: 'https://nodejs.org/en/learn/diagnostics/memory/understanding-and-tuning-memory', kind: 'guia' },
  pyGc: { title: 'Python — gc (interface do coletor de lixo)', url: 'https://docs.python.org/3/library/gc.html', kind: 'doc' },
  tracingGc: { title: 'Wikipedia — Tracing garbage collection', url: 'https://en.wikipedia.org/wiki/Tracing_garbage_collection', kind: 'referência' }
};

export const lessonsB = [
{
  id: 'int-03', moduleId: 'm2', order: 3, minutes: 85, tags: ['garbage collection', 'geracional', 'Scavenge', 'Mark-Compact', 'vazamentos', 'contagem de referências', 'CPython'],
  title: 'Garbage collection: contagem de referências, coleta por rastreamento, gerações e vazamentos medidos',
  objectives: ['Explicar contagem de referências e coleta por rastreamento (mark-sweep, mark-compact, copying) e seus trade-offs', 'Descrever a hipótese geracional e o GC do V8 (Scavenge, Mark-Compact, incremental e concorrente)', 'Medir coletas e pausas no Node com PerformanceObserver e --trace-gc', 'Reproduzir e corrigir um vazamento por cache sem limite com --max-old-space-size', 'Explicar o coletor de ciclos do CPython e o efeito de desligá-lo', 'Reconhecer causas comuns de vazamento e as práticas para evitá-las'],
  intro: R`**Coleta de lixo** libera **automaticamente** a memória de objetos **inalcançáveis**, mas **tem custo**: **pausas**, **memória extra** e **imprevisibilidade**. No laboratório: **3 milhões de objetos efêmeros** geraram **46 coletas menores** (Scavenge) com **91,6 ms** de pausa total e **heap de 3,9 → 6,6 MB**; quando **1/3 dos objetos sobreviveu**, as pausas subiram a **776,1 ms** e o heap a **175 MB**; um **cache sem limite** estourou o heap de **64 MB** (**§JavaScript heap out of memory§**) e a **versão com limite** terminou; e no **CPython**, **300.000 ciclos** com o coletor **desligado** reteve **50,4 MiB** (com o coletor, **0,1 MiB**).`,
  theory: R`### Por que existe e o que é "lixo"
Sem coleta, **o programador** libera memória (§malloc/free§ em **C**; ownership em **Rust**): **rápido e previsível**, mas **propenso a erros** (*use-after-free*, *double free*, **vazamentos**). **Linguagens com GC** (JavaScript, Python, Java, Go, C#) **liberam** o que o **programa não consegue mais alcançar**. **Lixo** = **objeto inalcançável** a partir das **raízes** (variáveis globais/locais da pilha, registradores, *handles* nativos). **Vazamento em linguagem com GC** = **objetos ainda alcançáveis** (por engano) **que nunca mais serão usados**: **o GC não os coleta** porque **não são lixo**.

### Duas famílias
**1. Contagem de referências (RC):** cada objeto guarda **quantas referências** apontam para ele; **zero → libera na hora**. **Prós:** **liberação imediata e previsível** (CPython, Swift/ARC, Objective-C, ponteiros inteligentes de C++/Rust §Rc§); **sem pausas longas**. **Contras:** **custo** de **atualizar contadores** (e **sincronização** entre threads), **não coleta ciclos** (A → B → A) sem **ajuda** (**coletor de ciclos**, **referências fracas**).
**2. Coleta por rastreamento (*tracing*):** **parte das raízes**, **marca** o que é **alcançável** e **recicla o resto**. **Variantes:** **mark-sweep** (marca e **varre**, **fragmenta**), **mark-compact** (marca e **compacta**: **move** objetos **sobreviventes**), **copying/semispace** (**copia** os **vivos** para outra região; **custo proporcional aos vivos**, **não** ao lixo). **Prós:** **coleta ciclos**, **alocação rápida** (ponteiro que **avança**). **Contras:** **pausas** (*stop-the-world*), **imprevisibilidade** do momento, **memória extra** (**folga** do heap), **custo ∝ objetos vivos**.

### Hipótese geracional e o GC do V8 (Orinoco)
**Observação empírica:** **a maioria dos objetos morre jovem**. **GC geracional** divide o heap em **geração jovem** (nova) e **velha**; **coleta a jovem com frequência** e **barato**, a **velha** raramente.
**V8:**
- **Geração jovem (*new space*, semispaces)**: **Scavenge** (**copying**, **paralelo**): **copia sobreviventes** para o **outro semispace**; **objetos que sobrevivem a 2 coletas** são **promovidos** à geração velha. **Pausas curtas** (**milissegundos**);
- **Geração velha (*old space*)**: **Mark-Compact** com **marcação incremental** (em **fatias**, **intercalada** com o JavaScript) e **concorrente/paralela** (outras **threads**), **varredura preguiçosa**, **compactação** quando necessário;
- **Barreiras de escrita (*write barriers*)** e **conjuntos lembrados** (*remembered sets*) rastreiam **referências da velha para a jovem** (**para** não **varrer** a velha a cada Scavenge).
**Orçamento de pausa** e **idle-time GC** (no navegador) **reduzem** *jank*.

### Medido: coletas e pausas no Node (§gc/alocacao.mjs§)
**3 milhões** de objetos (§{ id, nome, dados: [3 números] }§, ~100 bytes cada) em um laço; **PerformanceObserver** com entradas §'gc'§ (**tipo** e **duração** de cada coleta); §global.gc()§ **no início** (§--expose-gc§).
| Cenário | Tempo do laço | Coletas | Pausa total | Heap |
|---|---|---|---|---|
| **Tudo vira lixo** (nada retido) | **632 ms** | **46 Scavenge** + 1 Mark-Compact (**o §global.gc()§ forçado**) | **91,6 ms** | 3,9 → **6,6 MB** |
| **1/3 retido** (1.000.000 de objetos em um array) | **1.582 ms** | **30 Scavenge**, **3 Mark-Compact**, **2 incrementais** | **776,1 ms** | 3,9 → **175,0 MB** |
**Leituras:**
1. **Objetos efêmeros são baratos:** **46 coletas** de **~2 ms** em média (**91,6 ms** de pausa **para 632 ms** de laço: **~14%**); o **heap não cresce** (**6,6 MB**);
2. **Reter objetos encarece tudo:** **sobreviventes são copiados** e **promovidos**, **Mark-Compact** passa a **marcar** milhões de objetos: **pausa 8,5x maior** (**776 ms**), **laço 2,5x mais lento** (**1.582 ms**) e **heap de 175 MB**;
3. **O custo do GC acompanha os objetos vivos**, **não** a quantidade alocada: **por isso** **reduzir a retenção** (**cache limitado**, **streams** em vez de carregar tudo) **rende mais** do que **"alocar menos"**;
4. **§--trace-gc§** imprime **cada coleta**: §Scavenge 4.9 (6.1) -> 4.1 (6.1) MB, ... 1.25 / 0.00 ms ... allocation failure§ (**tipo**, **heap antes → depois**, **duração** e **motivo**; a **primeira** do laboratório: §Mark-Compact ... testing; GC in old space...§ = **o §gc()§ forçado**).
**Ressalva:** **uma máquina, uma execução**; **números de GC variam** (**tamanho do heap**, **versão do V8**, **CPUs**).

### Vazamentos: como acontecem (JavaScript)
| Causa | Exemplo | Correção |
|---|---|---|
| **Cache/Map sem limite** | §cache.set(chave nova)§ **sem nunca remover** | **LRU/TTL/limite** de tamanho |
| **Ouvintes não removidos** | §emitter.on(...)§ em laço/requisição (pat-03) | §off§ / **AbortSignal** |
| **Closures retendo contexto grande** | callback que **captura** um **buffer** gigante | **não capturar** o que **não usa** |
| **Variáveis globais/módulos** | arrays globais que **só crescem** | escopo **local**, **limpeza** |
| **Timers/intervalos** esquecidos | §setInterval§ **sem clear** | §clearInterval§, §unref§ |
| **Referências de DOM** (navegador) | nós **destacados** ainda **referenciados** | liberar referências |
**Medido (§gc/vazamento.mjs§, §--max-old-space-size=64§):** laço de **2 milhões** de entradas (**chave nova sempre**: **nunca** há acerto): **sem limite** o heap chegou a **77 MB** com **200.000 entradas** e o processo **morreu** com **§FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory§** (**GC** tentando **mais de uma vez** e **liberando quase nada**: **§Mark-Compact 70.0 -> 69.2 MB§**, **pausas de ~290 ms**, **"mu" = 0,06**: **utilização do mutador**: só **6%** do tempo era do **programa**). **Com limite de 5.000 entradas** (descarta a **mais antiga**): **terminou sem falha**, heap **oscilando entre 11 e 43 MB** (o **GC não corre a cada remoção**).
**Sintoma típico em produção:** **memória sobe** em **dente de serra crescente**; **pausas** **aumentam**; **latência** piora; **OOM kill**/reinício. **Investigação:** **§process.memoryUsage()§**, **§--trace-gc§**, **snapshots de heap** (Chrome DevTools, §node --inspect§, §v8.writeHeapSnapshot()§) e **comparação** entre **dois snapshots** (**"o que cresceu?"**): **não executados** neste laboratório.
**Limites de memória:** §--max-old-space-size=N§ (MB) **define o teto** da geração velha (**padrão depende** da **memória disponível**); **aumentá-lo** **adia** o problema e **aumenta pausas**; **em contêineres**, **alinhe** com o **limite do cgroup** (C6).

### CPython: contagem de referências + coletor de ciclos
O **CPython** usa **contagem de referências** (liberação **imediata**) e, **além disso**, um **coletor de ciclos** **geracional** (módulo §gc§: §gc.collect()§, §gc.get_threshold()§, §gc.get_stats()§). **Medido (§gc/ciclos.py§, Python 3.14.4, limiares §(2000, 10, 0)§):**
1. **Sem ciclo:** §a = No('a')§ → §sys.getrefcount(a) - 1 = 1§; **§del a§** → **§__del__ a§ imediatamente**;
2. **Com ciclo** (§x.outro = y; y.outro = x§) **e coletor desligado:** depois de §del x, y§ o objeto **continua vivo** (**a contagem não chega a zero**); **§gc.collect()§** **encontrou 147 objetos inalcançáveis** (**inclui outros objetos do interpretador**, **não só os dois**) e **só então** executou §__del__ x/y§;
3. **300.000 ciclos de listas** (§p.append(q); q.append(p)§): **coletor desligado** → **retidos 50,4 MiB** (**pico 50,4**) e **1.712 ms**; **ligado** → **0,1 MiB** retidos (**pico 1,4 MiB**), mas **2.025 ms** (**+18% de tempo** para **coletar ciclos**);
4. **estatísticas por geração:** §[(0, 0), (110, 598474), (5, 601673)]§ (**coletas** e **objetos coletados** nas **gerações**: **os ciclos** foram **recolhidos** nas **gerações 1 e 2**).
**Referências fracas** (§weakref§) **não contam** na **contagem**: **usadas** em **caches** e **observadores** para **evitar ciclos**/retenção. **§__del__§ (finalizadores):** **momento não garantido** em **ciclos** e **em outras implementações** (PyPy): **não dependa** deles para **liberar recursos**: use **§with§**/**gerenciadores de contexto** (C4.8).
**Em Python 3.14**, o **coletor** é **ajustável** (§gc.set_threshold§) e **a implementação evolui** (**incremental** em algumas versões): **consulte a documentação** da **sua** versão (**não medido** aqui).

### Outras linguagens (resumo; não executadas)
- **Java/JVM:** **G1** (**padrão**: regiões, **pausas alvo**), **ZGC** e **Shenandoah** (**pausas sub-milissegundo**, concorrentes), **Parallel**: **ajuste** por **latência x vazão** (C9);
- **Go:** **mark-sweep concorrente** **sem compactação**, **GOGC**/**GOMEMLIMIT**;
- **Rust/C/C++:** **sem GC**: **ownership** (Rust), **RAII**, **ponteiros inteligentes** e **liberação manual**;
- **Swift:** **ARC** (RC **automático**, **ciclos** com §weak§/§unowned§).

### Ajustando e evitando problemas
1. **Reduza a retenção** (**streams**, **paginação**, **caches com limite**), **antes** de mexer em **flags**;
2. **Reutilize** objetos **só** em **caminhos críticos** medidos (**pools** têm **custos** e **riscos**);
3. **Monitore** memória e **pausas** (§PerformanceObserver§, **métricas** de **heap** e **GC**: C4.6);
4. **Limites** (§--max-old-space-size§, **cgroup**) **coerentes**; **alerta** **antes** do OOM;
5. **Testes de vazamento**: **rodar** operações **repetidas** e **verificar** que o **heap estabiliza** (**após §gc()§**);
6. **WeakRef/FinalizationRegistry** (JS) **só** para **casos raros**: **não garantem** **quando** (nem **se**) rodam;
7. **Em Python**, **evite ciclos** com **objetos com finalizadores** e **use** §weakref§.

### Limites desta aula
**Executados:** **Node** (**perf_hooks**, **--trace-gc**, **OOM com --max-old-space-size**) e **CPython** (**gc**, **tracemalloc**). **Não executados:** **JVM** (G1/ZGC), **Go**, **Rust**, **heap snapshots**, **WeakRef/FinalizationRegistry**, **ajustes finos** de flags do V8.`,
  concepts: [
    { term: 'Garbage collection', def: 'Liberação automática da memória de objetos que o programa não consegue mais alcançar.' },
    { term: 'Contagem de referências', def: 'Técnica em que cada objeto guarda quantas referências o apontam e é liberado quando chega a zero.' },
    { term: 'Coleta por rastreamento', def: 'Técnica que parte das raízes, marca o que é alcançável e recicla o resto.' },
    { term: 'Hipótese geracional', def: 'Observação de que a maioria dos objetos morre jovem, justificando coletas frequentes da geração jovem.' },
    { term: 'Scavenge', def: 'Coleta copiadora e rápida da geração jovem do V8, que promove os sobreviventes.' },
    { term: 'Vazamento (em linguagem com GC)', def: 'Objetos ainda alcançáveis por engano que nunca mais serão usados e, portanto, não são coletados.' },
    { term: 'Referência fraca', def: 'Referência que não impede a coleta do objeto e não conta para mantê-lo vivo.' }
  ],
  examples: R`**Analogia:** o GC é a **equipe de limpeza de um escritório**: a **contagem de referências** recolhe um copo **assim que ninguém mais o usa**, mas **não percebe** dois copos que **um segura o outro**; a **coleta por rastreamento** **faz uma ronda** e **leva tudo o que ninguém está segurando**, **parando o escritório** por alguns instantes; o **vazamento** é **acumular caixas** que **ninguém usa mais**, mas que **continuam "em uso" no inventário**.

**Exemplo 1: efêmeros baratos.** 3 milhões de objetos que viram lixo: 46 Scavenges e 91,6 ms de pausa, heap em 6,6 MB.

**Exemplo 2: retenção encarece.** Com 1/3 retido, a pausa vai a 776 ms e o heap a 175 MB.

**Exemplo 3: vazamento.** Um cache sem limite derrubou o processo com 64 MB: "JavaScript heap out of memory".`,
  code: [
    { title: 'Medir coletas e pausas com PerformanceObserver (JavaScript; resultados medidos)', lang: 'js', code: R`import { PerformanceObserver, constants } from 'node:perf_hooks';
// node --expose-gc gc/alocacao.mjs curto|retido
const tipos = { [constants.NODE_PERFORMANCE_GC_MINOR]: 'menor (Scavenge)', [constants.NODE_PERFORMANCE_GC_MAJOR]: 'maior (Mark-Compact)', [constants.NODE_PERFORMANCE_GC_INCREMENTAL]: 'incremental' };
const cont = {}; let pausaTotal = 0;
new PerformanceObserver((lista) => { for (const e of lista.getEntries()) { const k = tipos[e.detail.kind] || String(e.detail.kind); cont[k] = (cont[k] || 0) + 1; pausaTotal += e.duration; } }).observe({ entryTypes: ['gc'] });

const retidos = [];
for (let i = 0; i < 3e6; i++) {
  const o = { id: i, nome: 'item-' + i, dados: [i, i + 1, i + 2] };
  if (process.argv[2] === 'retido' && i % 3 === 0) retidos.push(o);      // 1/3 sobrevive
}
// curto : 46 Scavenge (+1 Mark-Compact do gc() forçado) | pausa 91,6 ms | heap 3,9 -> 6,6 MB | laço 632 ms
// retido: 30 Scavenge, 3 Mark-Compact, 2 incrementais     | pausa 776,1 ms | heap 3,9 -> 175,0 MB | laço 1582 ms`, notes: [{ l: '5', t: 'Cada entrada gc traz o tipo e a duração da coleta.' }, { l: '10', t: 'Reter objetos faz as pausas e o heap crescerem muito.' }] },
    { title: 'Vazamento por cache sem limite e a correção (JavaScript; OOM medido com 64 MB)', lang: 'js', code: R`// node --max-old-space-size=64 gc/vazamento.mjs vaza|limitado
const cache = new Map();
const LIMITE = 5000;
for (let i = 0; i < 2e6; i++) {
  cache.set('req-' + i, { corpo: 'x'.repeat(200), i });                 // chave sempre nova: nunca há acerto
  if (process.argv[2] === 'limitado' && cache.size > LIMITE) cache.delete(cache.keys().next().value);   // descarta a mais antiga (FIFO)
}
// vaza    : i = 200000 -> 200001 entradas, 77 MB; depois
//           FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory
// limitado: termina; 5000 entradas; heap oscilando entre 11 e 43 MB`, notes: [{ l: '5', t: 'Sem remoção, as entradas continuam alcançáveis: o GC não pode coletá-las.' }, { l: '6', t: 'Um limite de tamanho (FIFO/LRU/TTL) mantém o heap estável.' }] },
    { title: 'Contagem de referências e coletor de ciclos do CPython (Python; resultados medidos)', lang: 'python', code: R`import gc, sys, weakref

class No:
    def __init__(self, nome): self.nome = nome; self.outro = None
    def __del__(self): print('  __del__', self.nome)

a = No('a'); print(sys.getrefcount(a) - 1)      # 1
del a                                           # __del__ a imediatamente: contagem chegou a zero

gc.disable()
x, y = No('x'), No('y'); x.outro, y.outro = y, x   # ciclo: x -> y -> x
w = weakref.ref(x)                                 # referência fraca: não segura x
del x, y
print(w() is not None)                             # True: o ciclo mantém os contadores acima de zero
print(gc.collect())                                # 147 inalcançáveis (inclui outros); só agora __del__ x e __del__ y
# 300.000 ciclos de listas: gc desligado retém 50,4 MiB; ligado, 0,1 MiB (porém +18% de tempo)`, notes: [{ l: '8', t: 'getrefcount conta a própria chamada, por isso o -1.' }, { l: '16', t: 'Referência fraca não conta para manter o objeto vivo.' }] }
  ],
  bestPractices: ['Reduza a retenção (streams, paginação, caches com limite) antes de mexer em flags do GC.', 'Dê limite (tamanho, TTL ou LRU) a todo cache e a toda coleção que cresce com a carga.', 'Remova ouvintes, timers e referências ao terminar de usar.', 'Monitore heap e pausas de GC e alerte antes do limite de memória; alinhe --max-old-space-size ao limite do contêiner.', 'Use referências fracas e gerenciadores de contexto em vez de depender de finalizadores.', 'Investigue vazamentos com snapshots de heap comparados, não por palpite.', 'Meça com aquecimento e repetição e lembre que o custo do GC acompanha os objetos vivos.'],
  mistakes: ['Cache ou Map sem limite.', 'Aumentar o limite de memória em vez de corrigir a retenção.', 'Depender de finalizadores (__del__, FinalizationRegistry) para liberar recursos.', 'Ouvintes e timers esquecidos.', 'Medir GC sem repetir ou sem notar o gc() forçado.', 'Achar que "tem GC" significa que não há vazamentos.'],
  market: R`**Diagnosticar vazamentos e pausas de GC** é **tarefa recorrente** de **SRE e backend** (serviços Node, Java e Python **reiniciando por OOM**); explicar **geracional, rastreamento x contagem** e **como investigar** é **pergunta clássica** de **entrevista**.`,
  summary: R`O GC libera objetos inalcançáveis: contagem de referências (imediata, mas não coleta ciclos) ou rastreamento (coleta ciclos, com pausas e custo proporcional aos objetos vivos), geralmente geracional. Medido (Node 26.13.1): 3 milhões de objetos efêmeros geraram 46 Scavenges, 91,6 ms de pausa e heap de 6,6 MB; com 1/3 retido, 776,1 ms e 175 MB; um cache sem limite estourou 64 MB (heap out of memory) e o limitado terminou. No CPython 3.14.4, o ciclo só foi liberado por gc.collect(), e 300.000 ciclos com o coletor desligado retiveram 50,4 MiB contra 0,1 MiB com ele ligado (+18% de tempo). Reduza a retenção, limite os caches e monitore o GC. JVM, Go, Rust e heap snapshots não foram executados.`,
  refs: [REF2.v8Trash, REF2.nodePerf, REF2.nodeMemory, REF2.pyGc, REF2.tracingGc, REF.v8Docs],
  cards: [
    { q: 'Qual a diferença entre contagem de referências e coleta por rastreamento?', a: 'A contagem libera quando o contador chega a zero (imediato, mas não coleta ciclos); o rastreamento parte das raízes e marca o alcançável (coleta ciclos, com pausas).' },
    { q: 'Por que reter objetos encarece o GC?', a: 'O custo acompanha os objetos vivos: sobreviventes são copiados, promovidos e marcados; no laboratório a pausa foi de 91,6 ms para 776,1 ms.' },
    { q: 'O que causou o "heap out of memory" do laboratório?', a: 'Um cache sem limite com chaves sempre novas: as entradas continuaram alcançáveis, e o GC não pôde liberá-las.' },
    { q: 'Por que o ciclo do CPython precisou de gc.collect()?', a: 'Com o coletor desligado, x e y se referenciam e os contadores não chegam a zero; o coletor de ciclos os encontra por rastreamento.' }
  ]
}
];
