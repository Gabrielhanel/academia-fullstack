// C1.4 — Paradigmas de programação. Aulas 4 a 6 (funcional avançado e concorrência).
const R = String.raw;

export const REF2 = {
  mdnClosures: { title: 'MDN — Closures', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures', kind: 'doc' },
  mdnRecursion: { title: 'MDN — Recursion (glossário)', url: 'https://developer.mozilla.org/en-US/docs/Glossary/Recursion', kind: 'doc' },
  mdnEventLoop: { title: 'MDN — The event loop', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop', kind: 'doc' },
  nodeEventLoop: { title: 'Node.js — The Node.js Event Loop', url: 'https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick', kind: 'doc' },
  nodeWorkers: { title: 'Node.js — worker_threads', url: 'https://nodejs.org/api/worker_threads.html', kind: 'doc' },
  mdnAtomics: { title: 'MDN — Atomics', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics', kind: 'doc' },
  mdnSAB: { title: 'MDN — SharedArrayBuffer', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer', kind: 'doc' },
  mdnPromise: { title: 'MDN — Promise (all, allSettled, race)', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise', kind: 'doc' },
  mdnAbort: { title: 'MDN — AbortSignal (timeout e cancelamento)', url: 'https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal', kind: 'doc' },
  mdnWorkers: { title: 'MDN — Web Workers API', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API', kind: 'doc' },
  pikeConc: { title: 'Rob Pike — Concurrency is not Parallelism (palestra)', url: 'https://go.dev/blog/waza-talk', kind: 'article' },
  goSync: { title: 'Go — Share Memory By Communicating', url: 'https://go.dev/blog/codelab-share', kind: 'article' }
};

export const lessonsB = [
{
  id: 'par-04', moduleId: 'm2', order: 4, minutes: 60, tags: ['funcional', 'closures', 'composição', 'currying', 'recursão'],
  title: 'Funções de ordem superior, closures, composição e recursão',
  objectives: ['Explicar closures e usá-las para encapsular estado privado e criar funções configuráveis', 'Compor funções com pipe e compose e aplicar currying e aplicação parcial', 'Usar memoização para funções puras e reconhecer seus limites', 'Aplicar recursão com caso-base e identificar o risco de estouro de pilha', 'Representar falhas como valores (Result/Option) em vez de exceções em fluxos previsíveis'],
  intro: `Na aula anterior vimos dados e transformações. Aqui vemos o que dá poder ao estilo funcional: **funções são valores**. Podemos passá-las, devolvê-las e guardá-las. Isso permite **closures** (funções que lembram o ambiente onde nasceram), **composição** (montar funções maiores a partir de pequenas) e **recursão** (resolver problemas definindo-os em termos de versões menores). Todos os exemplos foram executados em Node.js 26.`,
  theory: `### Funções de ordem superior
Uma **função de ordem superior** recebe funções como argumento ou devolve uma função (§map§, §filter§, §addEventListener§, §setTimeout§). Isso é possível porque as funções são **cidadãs de primeira classe**: tratadas como qualquer outro valor.

### Closures
Uma **closure** é uma função junto com o **ambiente léxico** em que foi criada. Ela continua enxergando as variáveis desse ambiente mesmo depois de a função externa terminar. No exemplo, §contador()§ devolve §{ inc, valor }§ e cada chamada cria uma variável §n§ própria: dois contadores independentes resultaram em §2§ e §1§. A variável §n§ não pode ser alterada de fora: é **estado privado sem classes**.

Usos comuns: fábricas de funções (§criarDesconto(0.1)§), *callbacks* que lembram contexto, módulos com estado privado, memoização.

**Armadilha clássica:** com §var§ em um laço, todas as funções compartilham a **mesma** variável (resultado §[3, 3, 3]§); com §let§ cada iteração tem a sua (resultado §[0, 1, 2]§). Closures capturam **variáveis**, não valores.

### Composição
**Compor** é encadear funções para que a saída de uma seja a entrada da próxima:
- §pipe(f, g)(x)§ = §g(f(x))§ (esquerda para a direita);
- §compose(f, g)(x)§ = §f(g(x))§ (direita para a esquerda).
Com §soma1§ e §dobro§ e entrada 3, §pipe§ deu **8** e §compose§ deu **7**: a ordem importa. Funções pequenas, puras e com uma responsabilidade compõem bem; funções com muitos parâmetros e efeitos, não.

### Currying e aplicação parcial
**Currying** transforma §f(a, b, c)§ em §f(a)(b)(c)§; **aplicação parcial** fixa alguns argumentos e devolve uma função que espera o resto. No exemplo, §soma3(1)(2)(3)§ e §soma3(1, 2)(3)§ deram **6**. Ajuda a criar funções especializadas (§const taxaIva = multiplicar(1.2)§) e a encaixar funções no §map§, que passa um argumento por vez.

### Memoização
**Memoizar** é guardar o resultado de uma função **pura** por argumento. Chamar §quad(4)§ duas vezes e §quad(5)§ uma vez executou o cálculo só **2** vezes. A versão memoizada de Fibonacci calculou §fib(50)§ = **12586269025** instantaneamente (sem memo, a versão recursiva ingênua levaria um tempo inviável). Limites: só vale para funções puras; o cache cresce (use limite ou §WeakMap§ quando fizer sentido); chaves complexas exigem serialização.

### Recursão
**Recursão** é uma função que chama a si mesma. Precisa de:
1. um **caso-base** (quando para);
2. um **passo recursivo** que se aproxima do caso-base.
Ótima para estruturas recursivas (árvores, JSON aninhado, diretórios) e divisão e conquista. Risco: cada chamada usa a **pilha**; com 1 milhão de níveis a execução lançou **RangeError** (pilha estourada). Alternativas: transformar em laço, usar uma pilha explícita ou (em linguagens que otimizam *tail call*) recursão de cauda. **JavaScript não garante otimização de chamada em cauda** em motores de uso geral.

### Tratar erros como valores
Exceções são boas para falhas excepcionais. Em fluxos onde a falha é **esperada** (validar entrada, dividir por zero), é útil devolver um valor que representa sucesso ou erro: um **Result** (§{ ok, v }§ ou §{ ok: false, e }§). No exemplo, §mapR§ aplicou a função só no sucesso e deixou o erro passar, sem §try/catch§. TypeScript torna isso checável com uniões discriminadas. Em Rust, Kotlin (§Result§) e Swift isso é idiomático.

### Quando usar cada coisa
| Quero | Use |
|---|---|
| Estado privado simples | closure |
| Variar um parâmetro de uma função | aplicação parcial / fábrica |
| Pipeline de transformações | pipe |
| Evitar recalcular | memoização (função pura) |
| Percorrer árvore | recursão (ou pilha explícita se for profunda) |
| Falha esperada | Result/Option |`,
  concepts: [
    { term: 'Função de ordem superior', def: 'Função que recebe ou devolve outras funções.' },
    { term: 'Closure', def: 'Função que preserva acesso às variáveis do ambiente léxico em que foi criada.' },
    { term: 'Composição de funções', def: 'Encadear funções para que a saída de uma alimente a próxima.' },
    { term: 'Currying', def: 'Transformar uma função de vários parâmetros em uma cadeia de funções de um parâmetro.' },
    { term: 'Aplicação parcial', def: 'Fixar alguns argumentos de uma função e obter outra que espera os restantes.' },
    { term: 'Memoização', def: 'Guardar resultados de uma função pura para não recalculá-los.' },
    { term: 'Recursão', def: 'Técnica em que uma função chama a si mesma com um problema menor, até um caso-base.' },
    { term: 'Chamada em cauda', def: 'Chamada que é a última operação da função; pode ser otimizada em algumas linguagens.' },
    { term: 'Result', def: 'Valor que representa sucesso ou erro, tornando falhas esperadas parte do tipo.' }
  ],
  examples: R`**Analogia:** uma closure é uma **mochila**: a função leva consigo as variáveis do lugar onde nasceu. Composição é uma **linha de montagem**: cada estação faz uma transformação e passa adiante. Memoização é um **caderno de respostas**: se já calculou, só consulta.

**Caso 1: contadores independentes.** Dois contadores (§a§ chamado duas vezes, §b§ uma) imprimiram §2 1§: cada closure tem o seu §n§.

**Caso 2: ordem na composição.** Para a entrada 3 com §soma1§ e §dobro§: §pipe§ deu 8 ((3+1)*2) e §compose§ deu 7 (3*2+1).

**Caso 3: memoização.** §chamadas§ ficou em 2 depois de três chamadas, e §fib(50)§ devolveu 12586269025.

**Caso 4: recursão profunda.** §somaRec(1e6)§ lançou **RangeError**; para somar 1 milhão de itens use um laço ou §reduce§.

**Caso 5: Result.** §dividir(10, 2)§ virou §{ ok: true, v: 6 }§ após somar 1, e §dividir(1, 0)§ continuou como §{ ok: false, e: 'div0' }§ sem tratamento extra.`,
  code: [
    { title: 'Closures, composição, currying e memoização (executado com Node.js 26)', lang: 'javascript', code: R`const contador = () => { let n = 0; return { inc: () => ++n, valor: () => n }; };
const a = contador(), b = contador();
a.inc(); a.inc(); b.inc();
console.log(a.valor(), b.valor());              // 2 1

const compose = (...fs) => (x) => fs.reduceRight((acc, f) => f(acc), x);
const pipe = (...fs) => (x) => fs.reduce((acc, f) => f(acc), x);
const soma1 = (x) => x + 1, dobro = (x) => x * 2;
console.log(pipe(soma1, dobro)(3), compose(soma1, dobro)(3)); // 8 7

const curry = (f) => { const c = (...a) => (a.length >= f.length ? f(...a) : (...b) => c(...a, ...b)); return c; };
const soma3 = curry((x, y, z) => x + y + z);
console.log(soma3(1)(2)(3), soma3(1, 2)(3));    // 6 6

const memo = (f) => { const m = new Map(); return (x) => (m.has(x) ? m.get(x) : (m.set(x, f(x)), m.get(x))); };
let chamadas = 0;
const quad = memo((x) => { chamadas++; return x * x; });
quad(4); quad(4); quad(5);
console.log(chamadas);                          // 2
const fib = memo((n) => (n < 2 ? n : fib(n - 1) + fib(n - 2)));
console.log(fib(50));                           // 12586269025`, notes: [{ l: '1', t: 'n é privado: só inc e valor o enxergam.' }, { l: '5', t: 'reduceRight aplica as funções da direita para a esquerda.' }, { l: '10', t: 'curry usa f.length (número de parâmetros declarados).' }, { l: '15', t: 'Memoização só vale para funções puras.' }] },
    { title: 'Recursão, pilha e Result (executado)', lang: 'javascript', code: R`const somaRec = (n) => (n === 0 ? 0 : n + somaRec(n - 1));
try { somaRec(1e6); } catch (e) { console.log(e.constructor.name); }   // RangeError

const ok = (v) => ({ ok: true, v }), err = (e) => ({ ok: false, e });
const dividir = (a, b) => (b === 0 ? err('div0') : ok(a / b));
const mapR = (r, f) => (r.ok ? ok(f(r.v)) : r);
console.log(mapR(dividir(10, 2), (x) => x + 1), mapR(dividir(1, 0), (x) => x + 1));

const fs = []; for (var i = 0; i < 3; i++) fs.push(() => i);
const gs = []; for (let j = 0; j < 3; j++) gs.push(() => j);
console.log(fs.map((f) => f()), gs.map((f) => f()));  // [3,3,3] [0,1,2]`, notes: [{ l: '2', t: 'O limite da pilha depende do motor e das opções; com 1 milhão de níveis o erro ocorreu no Node.js 26.' }, { l: '6', t: 'O erro passa adiante sem exceção.' }, { l: '9', t: 'var tem escopo de função; let tem escopo de bloco por iteração.' }] }
  ],
  bestPractices: ['Use closures para encapsular estado simples e fábricas de funções.', 'Prefira funções pequenas e puras que componham bem; nomeie as etapas do pipeline.', 'Memoize apenas funções puras e limite o tamanho do cache.', 'Defina sempre o caso-base e verifique que o passo recursivo se aproxima dele.', 'Converta recursão profunda em laço ou pilha explícita.', 'Use Result ou Option para falhas esperadas e exceções para falhas excepcionais.'],
  mistakes: ['Capturar a variável de um laço com §var§ e esperar o valor de cada iteração.', 'Memoizar funções com efeitos colaterais ou dependentes do tempo.', 'Recursão sem caso-base ou sobre estruturas muito profundas.', 'Inverter a ordem em §compose§ e §pipe§.', 'Currying de funções com parâmetros opcionais ou variáveis, quebrando §f.length§.', 'Cache de memoização que cresce sem limite e vaza memória.'],
  market: `Closures aparecem em quase todo código JavaScript (callbacks, hooks de React, módulos) e em entrevistas técnicas. Composição e funções puras estão por trás de pipelines de dados, middlewares e bibliotecas de utilidades. Recursão e a escolha de estruturas para evitar estouro de pilha são perguntas clássicas em problemas de árvores e grafos.`,
  summary: `Funções são valores: de ordem superior, fábricas e callbacks. Closures guardam variáveis do ambiente (estado privado sem classes); com §let§ cada iteração captura a sua. Compor funções monta pipelines (a ordem importa); currying e aplicação parcial especializam funções. Memoize funções puras. Recursão precisa de caso-base e pode estourar a pilha. Falhas esperadas podem ser valores (Result).`,
  refs: [REF2.mdnClosures, REF2.mdnRecursion, { title: 'MDN — First-class Function (glossário)', url: 'https://developer.mozilla.org/en-US/docs/Glossary/First-class_Function', kind: 'doc' }],
  cards: [
    { q: 'O que é uma closure?', a: 'Uma função que mantém acesso às variáveis do ambiente léxico em que foi criada, mesmo depois que esse ambiente terminou.' },
    { q: 'Qual a diferença entre pipe e compose?', a: 'pipe aplica as funções da esquerda para a direita; compose, da direita para a esquerda.' },
    { q: 'Quando a memoização é segura?', a: 'Para funções puras: o mesmo argumento sempre dá o mesmo resultado e não há efeito colateral.' },
    { q: 'Por que a recursão pode falhar com RangeError?', a: 'Cada chamada ocupa a pilha; recursão muito profunda excede o limite do motor.' }
  ]
},
{
  id: 'par-05', moduleId: 'm3', order: 5, minutes: 60, tags: ['concorrência', 'paralelismo', 'threads', 'event loop', 'race condition'],
  title: 'Concorrência e paralelismo: threads, processos e event loop',
  objectives: ['Diferenciar concorrência (lidar com várias coisas) de paralelismo (executar várias ao mesmo tempo)', 'Distinguir tarefas limitadas por CPU e por E/S e escolher o modelo adequado', 'Explicar processos, threads e o modelo de thread única com event loop do JavaScript', 'Demonstrar e explicar uma condição de corrida e corrigi-la com operações atômicas', 'Usar Worker Threads para paralelizar trabalho de CPU'],
  intro: `**Concorrência** e **paralelismo** são usados como sinônimos, mas são ideias diferentes, e confundi-las leva a escolher a ferramenta errada (threads para esperar rede, ou promises para cálculos pesados). Nesta aula usamos o Node.js 26 para **medir** a diferença, mostrar uma **condição de corrida** de verdade e corrigi-la com **operações atômicas**. O módulo usa conceitos de processos e threads do curso de Linux e sistemas operacionais.`,
  theory: `### Duas ideias distintas
- **Concorrência**: estruturar o programa para **lidar com várias tarefas em progresso** ao mesmo tempo lógico, alternando entre elas (uma pessoa atendendo três clientes no balcão, passando de um a outro enquanto esperam).
- **Paralelismo**: **executar** várias tarefas **literalmente ao mesmo tempo**, em núcleos diferentes (três atendentes).
Concorrência é sobre **estrutura**; paralelismo, sobre **execução**. Dá para ter concorrência sem paralelismo (uma thread alternando tarefas) e paralelismo sem concorrência no sentido estrito (instruções vetorizadas).

### O que limita uma tarefa: E/S ou CPU
- **Limitada por E/S (I/O-bound)**: passa a maior parte do tempo **esperando** (rede, disco, banco). A solução é **concorrência**: enquanto uma espera, outra avança.
- **Limitada por CPU (CPU-bound)**: passa o tempo **calculando** (compressão, criptografia, processamento de imagem). A solução é **paralelismo** (mais núcleos).
Medimos no Node.js: três esperas de 200 ms em §Promise.all§ levaram **~200 ms**; em sequência, **~600 ms**. Já trabalho de CPU em duas threads (Worker Threads) terminou em menos de 1,8 vez o tempo de uma execução; uma única thread executando duas cargas levaria o dobro.

### Processos e threads
- **Processo**: programa em execução com **espaço de memória próprio**; isolamento forte, comunicação por IPC (pipes, sockets), criação mais cara.
- **Thread**: fluxo de execução **dentro** de um processo; **compartilha memória** com as outras threads do mesmo processo; mais leve, porém exige sincronização.
O sistema operacional **escalona** as threads nos núcleos (preempção). Quando há mais threads que núcleos, o SO alterna entre elas (**troca de contexto**, que tem custo).

### O modelo do JavaScript: uma thread e event loop
O código JavaScript de uma página ou de um processo Node.js executa em **uma única thread principal**. O **event loop** pega tarefas da fila (callbacks, promises resolvidas, eventos) e as executa **uma por vez, até o fim** (*run-to-completion*). Operações de E/S são delegadas ao sistema/libuv e avisam quando terminam. Consequências:
- não há duas funções JavaScript rodando ao mesmo tempo na mesma thread, então **não há corridas de dados** na memória comum;
- um laço longo **bloqueia** o event loop e congela tudo (servidor sem responder, página travada);
- para trabalho de CPU, use **Worker Threads** (Node.js) ou **Web Workers** (navegador), que têm memória própria e se comunicam por mensagens.

### Condição de corrida (race condition)
Ocorre quando o resultado depende da **ordem** em que operações concorrentes acontecem. Em memória compartilhada, §a[0] = a[0] + 1§ **não é atômica**: são três passos (ler, somar, escrever) e duas threads podem ler o mesmo valor. No experimento, 4 workers incrementaram 100 000 vezes cada um um contador compartilhado; o esperado era **400 000**; **sem atomics** o valor final foi menor (**perdeu atualizações**) e **com §Atomics.add§** deu exatamente **400 000**.

Corridas existem também **sem threads**: com §async/await§, outra tarefa pode rodar entre o §await§ e a continuação (aula 6).

### Ferramentas de sincronização
- **Operações atômicas** (§Atomics§, instruções do processador): incremento, comparação e troca.
- **Locks / mutex**: só uma tarefa por vez na seção crítica.
- **Semáforos**: limitam quantas tarefas usam um recurso.
- **Troca de mensagens** e **dados imutáveis**: evitam compartilhar estado mutável.
Cuidado: locks trazem **deadlock** (cada tarefa espera um recurso que a outra segura), **inanição** e perda de desempenho.

### Escolhendo
| Situação | Escolha |
|---|---|
| Muitas esperas de rede/disco | concorrência (async/await, event loop) |
| Cálculo pesado | paralelismo (Workers, processos, filas) |
| Isolar falhas / usar vários núcleos em servidor | vários processos (cluster, contêineres) |
| Estado compartilhado inevitável | atômicos ou lock, com testes |`,
  concepts: [
    { term: 'Concorrência', def: 'Estruturar o programa para lidar com várias tarefas em progresso, alternando entre elas.' },
    { term: 'Paralelismo', def: 'Executar várias tarefas ao mesmo tempo em núcleos diferentes.' },
    { term: 'I/O-bound', def: 'Tarefa cujo tempo é dominado por espera de entrada e saída (rede, disco).' },
    { term: 'CPU-bound', def: 'Tarefa cujo tempo é dominado por cálculo no processador.' },
    { term: 'Processo', def: 'Programa em execução com espaço de memória próprio.' },
    { term: 'Thread', def: 'Fluxo de execução dentro de um processo; compartilha a memória com as demais.' },
    { term: 'Event loop', def: 'Laço que executa as tarefas enfileiradas, uma por vez, na thread principal do JavaScript.' },
    { term: 'Condição de corrida', def: 'Defeito em que o resultado depende da ordem de execução de operações concorrentes.' },
    { term: 'Operação atômica', def: 'Operação indivisível: nenhuma outra tarefa observa um estado intermediário.' },
    { term: 'Deadlock', def: 'Impasse em que tarefas esperam umas pelas outras indefinidamente.' }
  ],
  examples: R`**Analogia:** uma cozinha. **Concorrência** é um único cozinheiro que coloca a água para ferver, enquanto ela esquenta corta a cebola e, quando ferve, volta à panela: tudo em andamento, uma mão por vez. **Paralelismo** é contratar mais um cozinheiro para cortar ao mesmo tempo. Se o gargalo é **esperar a água ferver** (E/S), o segundo cozinheiro não ajuda; se o gargalo é **cortar 50 kg de cebola** (CPU), ajuda muito.

**Medição 1 (concorrência):** três §sleep(200)§ em §Promise.all§ levaram ~200 ms; em sequência, ~600 ms.

**Medição 2 (paralelismo):** dois Workers calculando a mesma soma deram resultados iguais ao cálculo na thread principal e terminaram em menos de 1,8× o tempo de uma execução sozinha. O ganho depende do número de núcleos livres.

**Medição 3 (corrida):** quatro Workers incrementando 100 000 vezes cada um um inteiro compartilhado: sem atomics o total foi menor que 400 000; com §Atomics.add§, exatamente 400 000.`,
  code: [
    { title: 'Concorrência de E/S e paralelismo de CPU (executado com Node.js 26)', lang: 'javascript', code: R`import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { setTimeout as sleep } from 'node:timers/promises';

if (isMainThread) {
  let t = performance.now();
  await Promise.all([sleep(200), sleep(200), sleep(200)]);
  console.log('concorrente', Math.round((performance.now() - t) / 100) * 100, 'ms');   // ~200
  t = performance.now();
  for (let i = 0; i < 3; i++) await sleep(200);
  console.log('sequencial', Math.round((performance.now() - t) / 100) * 100, 'ms');    // ~600

  const cpu = (n) => { let s = 0; for (let i = 0; i < n; i++) s += i % 7; return s; };
  const N = 3e8;
  t = performance.now(); cpu(N); const um = performance.now() - t;
  t = performance.now();
  const rs = await Promise.all([1, 2].map(() => new Promise((res) => {
    const w = new Worker(new URL(import.meta.url), { workerData: N });
    w.on('message', res);
  })));
  const dois = performance.now() - t;
  console.log('resultados iguais:', rs[0] === rs[1] && rs[0] === cpu(N));
  console.log('2 workers em paralelo < 1,8x uma execução:', dois < um * 1.8);
} else {
  let s = 0; for (let i = 0; i < workerData; i++) s += i % 7;
  parentPort.postMessage(s);
}`, notes: [{ l: '5', t: 'Promise.all inicia as três esperas juntas: tempo total ≈ a maior espera.' }, { l: '16', t: 'Cada Worker roda em outra thread, com memória própria; o resultado volta por mensagem.' }, { l: '22', t: 'O mesmo arquivo serve de worker: isMainThread diferencia os papéis.' }, { l: '24', t: 'O ganho depende de núcleos disponíveis; a máquina de teste tinha mais de um núcleo livre.' }] },
    { title: 'Condição de corrida com memória compartilhada e correção com Atomics (executado)', lang: 'javascript', code: R`// principal.mjs
import { Worker } from 'node:worker_threads';
const sab = new SharedArrayBuffer(4);
const arr = new Int32Array(sab);
const rodar = (modo) => Promise.all([1, 2, 3, 4].map(() => new Promise((res) => {
  const w = new Worker(new URL('./worker.mjs', import.meta.url), { workerData: { sab, modo } });
  w.on('exit', res);
})));
await rodar('naive');  const naive = arr[0]; arr[0] = 0;
await rodar('atomic');
console.log('esperado 400000; sem atomics:', naive, '; com atomics:', arr[0]);

// worker.mjs
import { workerData } from 'node:worker_threads';
const a = new Int32Array(workerData.sab);
for (let i = 0; i < 100000; i++) {
  if (workerData.modo === 'atomic') Atomics.add(a, 0, 1);
  else a[0] = a[0] + 1;          // ler, somar, escrever: não é atômico
}`, notes: [{ l: '3', t: 'SharedArrayBuffer é a memória compartilhada entre threads.' }, { l: '9', t: 'Sem atomics o resultado varia a cada execução (sempre menor ou igual a 400000); com atomics, é sempre 400000.' }, { l: '18', t: 'Atomics.add faz o incremento de forma indivisível.' }] }
  ],
  bestPractices: ['Classifique a tarefa (E/S ou CPU) antes de escolher o modelo.', 'Nunca bloqueie o event loop com cálculo pesado: delegue a Workers ou a outro serviço.', 'Prefira trocar mensagens e dados imutáveis a compartilhar memória mutável.', 'Se compartilhar estado, use operações atômicas ou locks e escreva testes de estresse.', 'Limite o número de threads/processos ao número de núcleos para CPU-bound.', 'Meça: o ganho de paralelizar depende de núcleos, custo de comunicação e tamanho da tarefa.'],
  mistakes: ['Usar threads para esperar rede, quando concorrência assíncrona resolve.', 'Rodar cálculo pesado na thread principal e congelar a aplicação.', 'Assumir que §x = x + 1§ ou §x++§ é atômico em memória compartilhada.', 'Criar uma thread por requisição, sem limite.', 'Corrigir corrida com §sleep§ ou atrasos em vez de sincronizar.', 'Confundir paralelismo com velocidade garantida: a tarefa pode ser dominada por comunicação.'],
  market: `Servidores de alto tráfego, filas de processamento, pipelines de dados e aplicações de interface precisam combinar concorrência e paralelismo corretamente. Perguntas sobre event loop, condição de corrida e diferença entre processo e thread são comuns em entrevistas de backend; bugs de concorrência estão entre os mais caros de diagnosticar em produção.`,
  summary: `Concorrência estrutura várias tarefas em progresso; paralelismo as executa ao mesmo tempo. E/S pede concorrência; CPU pede paralelismo. Processos têm memória própria; threads compartilham e exigem sincronização. JavaScript tem uma thread com event loop (run-to-completion); use Workers para CPU. Corridas de dados são evitadas com atomics, locks ou, melhor, sem compartilhar estado mutável. Deadlock é o risco dos locks.`,
  refs: [REF2.mdnEventLoop, REF2.nodeEventLoop, REF2.nodeWorkers, REF2.mdnAtomics, REF2.mdnSAB, REF2.pikeConc],
  cards: [
    { q: 'Qual a diferença entre concorrência e paralelismo?', a: 'Concorrência é lidar com várias tarefas em progresso (estrutura); paralelismo é executá-las ao mesmo tempo em vários núcleos (execução).' },
    { q: 'Para tarefas de E/S, o que ajuda mais?', a: 'Concorrência assíncrona: enquanto uma espera, outra avança. Mais núcleos pouco ajudam.' },
    { q: 'Por que x = x + 1 em memória compartilhada é perigoso?', a: 'Não é atômico (ler, somar, escrever); threads podem ler o mesmo valor e perder atualizações.' },
    { q: 'O que bloquear o event loop causa?', a: 'Nenhuma outra tarefa roda até o laço terminar: a aplicação "congela" para todos.' }
  ]
},
{
  id: 'par-06', moduleId: 'm3', order: 6, minutes: 60, tags: ['async', 'mutex', 'deadlock', 'actors', 'CSP', 'backpressure'],
  title: 'Modelos de concorrência na prática: async, locks, mensagens e limites',
  objectives: ['Identificar corridas lógicas em código assíncrono (await entre leitura e escrita) e corrigi-las', 'Implementar um mutex assíncrono e um pool com limite de concorrência', 'Escolher entre Promise.all, allSettled e race e aplicar timeout e cancelamento com AbortSignal', 'Explicar e reproduzir um deadlock por ordem de aquisição de locks', 'Comparar memória compartilhada, atores e CSP (canais) e aplicar a regra de compartilhar comunicando'],
  intro: `Dominar a diferença entre concorrência e paralelismo é o início. Na prática, o trabalho é **escolher um modelo** e **evitar os defeitos clássicos**: corridas, impasses e sobrecarga. Esta aula mostra, com código executado em Node.js 26, corridas **em uma única thread**, um mutex, um pool de tarefas, timeouts e um deadlock, e compara os grandes modelos: memória compartilhada com locks, **atores** e **CSP** (canais).`,
  theory: `### Corrida lógica em código assíncrono
Mesmo com **uma thread**, §await§ devolve o controle ao event loop. Se uma função **lê** um valor, **espera** e só então **escreve** com base na leitura, outra tarefa pode ter mudado o valor no intervalo. No exemplo, dois saques de 80 com saldo 100 foram **ambos aprovados** (§aprovados 2§) porque os dois leram 100 antes de qualquer um escrever. É o padrão **verificar e depois agir** (*check-then-act*), um dos defeitos mais comuns.

**Correções:**
1. **Serializar** a seção crítica com um **mutex assíncrono** (fila de promises): com ele, só **1** saque foi aprovado;
2. tornar a operação **atômica** no armazenamento (um §UPDATE ... WHERE saldo >= 80§ no banco, ou transação com isolamento adequado);
3. usar **versão otimista**: ler com versão e gravar só se a versão não mudou (CAS, *compare-and-set*), tentando de novo em caso de conflito.

### Mutex assíncrono
Um **mutex** garante exclusão mútua. Em JavaScript, a forma simples é encadear tarefas: cada nova tarefa só começa quando a anterior termina (§this.#fila = p.catch(() => {})§ evita que uma falha trave a fila). Para vários processos ou máquinas, o mutex precisa estar em um serviço compartilhado (banco, Redis), com **expiração** para não prender o recurso se o dono morrer.

### Limitar a concorrência (pool)
Disparar mil requisições de uma vez esgota conexões, memória e a paciência do servidor remoto. Um **pool** limita quantas tarefas rodam juntas. No exemplo, 10 tarefas com limite 3 produziram os resultados na ordem certa e **no máximo 3 simultâneas**. Esse controle é a forma mais simples de **contrapressão** (*backpressure*): evitar que o produtor sobrecarregue o consumidor. Bibliotecas e filas gerenciam isso em produção.

### Combinadores de promises
| Combinador | Comportamento |
|---|---|
| §Promise.all§ | espera todas; **rejeita na primeira falha** (as outras continuam rodando) |
| §Promise.allSettled§ | espera todas e devolve o status de cada uma (§fulfilled§ ou §rejected§) |
| §Promise.race§ | resolve ou rejeita com a **primeira** que terminar |
| §Promise.any§ | primeira que **cumprir**; só rejeita se todas falharem |
Promise não é cancelável por si; use **§AbortSignal§** (§AbortSignal.timeout(ms)§) para **timeout e cancelamento**, repassando o sinal para §fetch§, temporizadores e consultas. No exemplo, um sleep de 500 ms com sinal de 50 ms falhou com **AbortError**.

### Deadlock
Ocorre quando duas tarefas seguram um recurso e esperam o do outro. No exemplo, a tarefa 1 pegou o lock A e pediu B, enquanto a 2 pegou B e pediu A: nenhuma terminou (o programa usou §race§ com um temporizador e imprimiu **"travou (deadlock)"**). Prevenção:
- **ordem global** de aquisição de locks (sempre A antes de B);
- **timeouts** ao adquirir;
- reduzir o número de locks ou evitar segurar um lock enquanto espera por outro.

### Os grandes modelos
- **Memória compartilhada com locks**: simples de entender, difícil de acertar em escala (Java, C++).
- **Atores**: cada ator tem estado privado e uma **caixa de mensagens**; só se comunica por mensagens, processando uma de cada vez (Erlang/Elixir, Akka). Isola falhas ("deixe falhar" e reinicie).
- **CSP (canais)**: tarefas leves (goroutines) comunicam por **canais** tipados (Go, Kotlin coroutines). Lema do Go: *"não comunique compartilhando memória; compartilhe memória comunicando"*.
- **Async/await com event loop**: modelo do JavaScript, Python (asyncio), C#; ótimo para E/S, sem paralelismo de CPU por padrão.
- **Estruturada**: tarefas filhas têm escopo e vida limitados ao pai, evitando tarefas "órfãs" (conceito de concorrência estruturada em Kotlin, Swift e Java recentes).

### Como decidir (resumo prático)
1. A tarefa é E/S? Use async/await com limite de concorrência e timeouts.
2. É CPU? Workers/processos/filas, com mensagens e dados imutáveis.
3. Preciso de estado compartilhado? Atômicos, mutex ou, melhor, um único dono do estado (ator) e transações no banco.
4. Sempre: **timeout, cancelamento, limite e observabilidade** (logs e métricas).`,
  concepts: [
    { term: 'Check-then-act', def: 'Padrão de verificar uma condição e agir depois; vulnerável a corrida se o estado mudar no intervalo.' },
    { term: 'Mutex', def: 'Mecanismo de exclusão mútua: só uma tarefa por vez na seção crítica.' },
    { term: 'Seção crítica', def: 'Trecho de código que acessa um recurso compartilhado e não pode ser executado concorrentemente.' },
    { term: 'Contrapressão (backpressure)', def: 'Mecanismo para que o consumidor freie o produtor e evite sobrecarga.' },
    { term: 'Compare-and-set', def: 'Atualização condicional: só grava se o valor ou a versão ainda for a esperada.' },
    { term: 'AbortSignal', def: 'Sinal usado para cancelar operações assíncronas ou impor timeout.' },
    { term: 'Deadlock', def: 'Impasse em que tarefas esperam, circularmente, recursos que as outras seguram.' },
    { term: 'Modelo de atores', def: 'Entidades com estado privado que se comunicam só por mensagens, processando uma por vez.' },
    { term: 'CSP', def: 'Communicating Sequential Processes: tarefas que se comunicam por canais.' },
    { term: 'Concorrência estruturada', def: 'Tarefas filhas têm escopo e tempo de vida ligados à tarefa que as criou.' }
  ],
  examples: R`**Analogia:** um **caixa eletrônico de agência** com dois clientes na fila e o mesmo extrato. Sem controle, os dois olham o saldo (100), cada um decide sacar 80 e a conta fica incoerente. O **mutex** é a regra "um cliente por vez no caixa". O **deadlock** são duas pessoas na porta giratória, cada uma esperando a outra sair primeiro.

**Resultados medidos (Node.js 26):**
- sem mutex: §aprovados 2 saldo 20§ (dois saques de 80 aprovados com saldo inicial 100: **erro de negócio**);
- com mutex: §aprovados 1 saldo 20§ (correto);
- pool: §0,2,4,...,18 máx simultâneas: 3§;
- §allSettled§: §[ 'fulfilled', 'rejected' ]§;
- §Promise.all§ com falha: mensagem §falhou§; timeout: §AbortError§;
- lock circular: §travou (deadlock)§ (o programa só termina por causa do temporizador do §race§).

**Em produção:** o mesmo defeito acontece em um endpoint "sacar" com duas requisições simultâneas. A correção correta é no banco: um §UPDATE contas SET saldo = saldo - 80 WHERE id = ? AND saldo >= 80§ (e checar o número de linhas afetadas), ou uma transação com bloqueio da linha.`,
  code: [
    { title: 'Corrida lógica, mutex assíncrono e pool com limite (executado com Node.js 26)', lang: 'javascript', code: R`import { setTimeout as sleep } from 'node:timers/promises';

let saldo = 100;
const sacar = async (v) => {
  const atual = saldo;              // ler
  await sleep(10);                  // outra tarefa roda aqui
  if (atual >= v) { saldo = atual - v; return true; }  // agir com base na leitura antiga
  return false;
};
let aprov = await Promise.all([sacar(80), sacar(80)]);
console.log('sem mutex: aprovados', aprov.filter(Boolean).length, 'saldo', saldo);

class Mutex {
  #fila = Promise.resolve();
  run(fn) { const p = this.#fila.then(fn); this.#fila = p.catch(() => {}); return p; }
}
saldo = 100;
const m = new Mutex();
const sacarSeguro = (v) => m.run(() => sacar(v));
aprov = await Promise.all([sacarSeguro(80), sacarSeguro(80)]);
console.log('com mutex: aprovados', aprov.filter(Boolean).length, 'saldo', saldo);

async function pool(tarefas, limite) {
  const out = new Array(tarefas.length); let prox = 0, ativos = 0, max = 0;
  const worker = async () => {
    while (prox < tarefas.length) { const i = prox++; ativos++; max = Math.max(max, ativos); out[i] = await tarefas[i](); ativos--; }
  };
  await Promise.all(Array.from({ length: limite }, worker));
  return { out, max };
}
const tarefas = Array.from({ length: 10 }, (_, i) => async () => { await sleep(20); return i * 2; });
const r = await pool(tarefas, 3);
console.log(r.out.join(','), 'máx simultâneas:', r.max);`, notes: [{ l: '5', t: 'Leitura antes do await: o valor pode estar velho quando a escrita ocorrer.' }, { l: '12', t: 'Saída observada: "sem mutex: aprovados 2 saldo 20".' }, { l: '16', t: 'O catch na fila evita que uma falha interrompa as tarefas seguintes.' }, { l: '31', t: 'Cada worker retira a próxima tarefa; no máximo "limite" executam juntas.' }] },
    { title: 'Combinadores, timeout e deadlock (executado)', lang: 'javascript', code: R`import { setTimeout as sleep } from 'node:timers/promises';
class Mutex {
  #fila = Promise.resolve();
  run(fn) { const p = this.#fila.then(fn); this.#fila = p.catch(() => {}); return p; }
}
console.log((await Promise.allSettled([sleep(1, 'a'), Promise.reject(new Error('x'))])).map((s) => s.status));
try { await Promise.all([sleep(1), Promise.reject(new Error('falhou'))]); } catch (e) { console.log(e.message); }
try { await sleep(500, null, { signal: AbortSignal.timeout(50) }); } catch (e) { console.log(e.name); }

const A = new Mutex(), B = new Mutex();
const t1 = A.run(async () => { await sleep(10); return B.run(async () => 't1'); });
const t2 = B.run(async () => { await sleep(10); return A.run(async () => 't2'); });
console.log(await Promise.race([Promise.all([t1, t2]), sleep(200, 'travou (deadlock)')]));`, notes: [{ l: '6', t: 'allSettled não rejeita: devolve o status de cada promise.' }, { l: '8', t: 'AbortSignal.timeout cancela a espera após 50 ms (AbortError).' }, { l: '13', t: 'A tarefa 1 segura A e pede B; a 2 segura B e pede A: impasse. Sem o race, o programa não terminaria sozinho.' }] }
  ],
  bestPractices: ['Evite check-then-act: faça a verificação e a ação de forma atômica (UPDATE condicional, transação, CAS).', 'Imponha timeout e cancelamento em toda operação assíncrona que cruza a rede.', 'Limite a concorrência e aplique contrapressão em vez de disparar tudo de uma vez.', 'Adquira múltiplos locks sempre na mesma ordem e por tempo mínimo.', 'Prefira um dono único do estado (ator, fila, banco) a compartilhar estado mutável.', 'Use §allSettled§ quando as falhas parciais forem aceitáveis e registre cada resultado.'],
  mistakes: ['Ler o estado, fazer um §await§ e escrever com base na leitura antiga.', 'Disparar milhares de promises sem limite e esgotar conexões.', 'Usar §Promise.all§ e esquecer que as demais continuam rodando após uma falha.', 'Adquirir locks em ordens diferentes em pontos diferentes do código.', 'Confiar em §sleep§ ou atrasos para "corrigir" uma corrida.', 'Mutex em memória em um serviço com várias instâncias (não protege entre processos).'],
  market: `Defeitos de concorrência (saldo negativo, estoque duplicado, pedido cobrado duas vezes) são incidentes clássicos de sistemas reais. Conhecer transações, locks, filas e idempotência é exigido em backend e arquitetura, e linguagens como Go, Kotlin, Elixir e Rust se destacam por seus modelos de concorrência. Entrevistas costumam pedir uma solução para "dois saques simultâneos".`,
  summary: `Mesmo com uma thread, await cria corridas lógicas (check-then-act). Corrija com seção crítica serializada (mutex), operação atômica no armazenamento ou controle otimista (CAS). Limite a concorrência (pool, contrapressão) e use timeouts e AbortSignal. Deadlock vem de ordem circular de locks: imponha ordem e timeouts. Modelos: memória compartilhada com locks, atores, CSP, async/await e concorrência estruturada; prefira um único dono do estado e comunicação por mensagens.`,
  refs: [REF2.mdnPromise, REF2.mdnAbort, REF2.goSync, REF2.mdnWorkers],
  cards: [
    { q: 'O que é check-then-act e por que é perigoso?', a: 'Verificar uma condição e agir depois; se o estado mudar entre as duas etapas (por exemplo, em um await), a decisão fica inválida.' },
    { q: 'Como evitar deadlock com dois locks?', a: 'Adquirir os locks sempre na mesma ordem global e usar timeouts na aquisição.' },
    { q: 'Qual a diferença entre Promise.all e Promise.allSettled?', a: 'all rejeita na primeira falha; allSettled espera todas e informa o status de cada uma.' },
    { q: 'Qual a ideia central do modelo de atores?', a: 'Estado privado por ator e comunicação apenas por mensagens, processadas uma por vez.' }
  ]
}
];
