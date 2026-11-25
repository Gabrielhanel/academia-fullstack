// Curso piloto: JavaScript Assíncrono. "§" é trocado por crase no final (evita conflito com template literals).
const NOW = '2026-11-17T22:00:00.000Z';
const REF = {
  promise: { title: 'MDN — Promise', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise', kind: 'doc' },
  usingPromises: { title: 'MDN — Using promises', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises', kind: 'doc' },
  execModel: { title: 'MDN — JavaScript execution model', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model', kind: 'doc' },
  microtask: { title: 'MDN — Using microtasks in JavaScript with queueMicrotask()', url: 'https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide', kind: 'doc' },
  htmlLoop: { title: 'HTML Living Standard — Event loops', url: 'https://html.spec.whatwg.org/multipage/webappapis.html#event-loops', kind: 'spec' },
  ecma: { title: 'ECMAScript Language Specification (TC39)', url: 'https://tc39.es/ecma262/', kind: 'spec' },
  nodeLoop: { title: 'Node.js — The Node.js Event Loop', url: 'https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick', kind: 'doc' },
  nodeUtil: { title: 'Node.js — util.promisify', url: 'https://nodejs.org/api/util.html#utilpromisifyoriginal', kind: 'doc' },
  setTimeout: { title: 'MDN — setTimeout()', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout', kind: 'doc' },
  all: { title: 'MDN — Promise.all()', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all', kind: 'doc' },
  allSettled: { title: 'MDN — Promise.allSettled()', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled', kind: 'doc' },
  race: { title: 'MDN — Promise.race()', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race', kind: 'doc' },
  any: { title: 'MDN — Promise.any()', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/any', kind: 'doc' },
  asyncFn: { title: 'MDN — async function', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function', kind: 'doc' },
  await: { title: 'MDN — await', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await', kind: 'doc' },
  abort: { title: 'MDN — AbortController', url: 'https://developer.mozilla.org/en-US/docs/Web/API/AbortController', kind: 'doc' },
  abortTimeout: { title: 'MDN — AbortSignal.timeout()', url: 'https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout_static', kind: 'doc' },
  backoff: { title: 'AWS Architecture Blog — Exponential Backoff And Jitter', url: 'https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/', kind: 'article' },
  flanagan: { title: 'David Flanagan — JavaScript: The Definitive Guide, 7ª ed. (O\'Reilly, 2020), cap. 13 "Asynchronous JavaScript"', url: '', kind: 'book' }
};

const lessons = [
{
  id: 'jsa-01', moduleId: 'm1', order: 1, minutes: 50, tags: ['javascript', 'nodejs'],
  title: 'Síncrono, assíncrono e o modelo de execução do JavaScript',
  objectives: ['Diferenciar código síncrono e assíncrono', 'Explicar o que significa o JavaScript ser single-threaded', 'Identificar quem faz o trabalho de I/O: o motor JS ou o ambiente (host)', 'Reconhecer código que bloqueia a thread principal'],
  intro: `Quase tudo o que uma aplicação real faz envolve esperar: uma resposta de API, a leitura de um arquivo, um clique do usuário. Se o programa ficasse parado esperando, a interface congelaria e o servidor atenderia uma requisição por vez. Esta aula explica como o JavaScript lida com a espera sem travar, e por que isso molda a forma como escrevemos código em React, Node.js, Next.js e React Native.`,
  theory: `### Código síncrono
Código síncrono executa uma instrução depois da outra. A próxima linha só começa quando a anterior termina. Cada chamada de função entra na **pilha de chamadas** (*call stack*) e sai dela quando retorna.

### Single-threaded: o que isso realmente quer dizer
O seu código JavaScript roda em **uma única pilha de chamadas por agente** (uma aba, um worker, um processo Node). Enquanto uma função está executando, nenhuma outra função JavaScript daquele agente executa ao mesmo tempo. Isso é chamado de semântica *run-to-completion*: uma tarefa roda até o fim antes da próxima começar.

Isso **não** significa que o ambiente inteiro tem uma só thread. O navegador e o Node.js (o *host*) executam trabalho em paralelo por baixo: rede, disco, timers. O motor JavaScript (V8, SpiderMonkey, JavaScriptCore) só executa o seu código; as operações de espera são feitas pelo host.

### Assíncrono: delegar e ser avisado depois
Uma operação assíncrona é iniciada agora e termina depois. O seu código pede ao host para fazer algo (§setTimeout§, §fetch§, ler um arquivo) e registra o que deve acontecer quando terminar. Quando o resultado chega, o host coloca o seu código em uma **fila**. O **event loop** pega itens dessa fila e os executa quando a pilha está vazia. A próxima aula detalha esse ciclo.

### Bloquear a thread principal
Se uma função demora muito (um laço pesado, um JSON gigante, um cálculo intenso), nada mais roda: no navegador, cliques e renderização ficam parados; no Node.js, todas as requisições esperam. Esperar I/O de forma assíncrona não bloqueia. Calcular de forma síncrona por muito tempo bloqueia.

Para trabalho de CPU pesado, as saídas são dividir o trabalho em partes, usar **Web Workers** no navegador ou **worker_threads** no Node.js.`,
  concepts: [
    { term: 'Call stack', def: 'Pilha das funções em execução. A do topo é a que está rodando agora.' },
    { term: 'Host', def: 'Ambiente que executa o motor JS e oferece APIs como timers, rede e disco (navegador, Node.js, Deno).' },
    { term: 'Run-to-completion', def: 'Cada tarefa executa até o fim antes de outra começar no mesmo agente.' },
    { term: 'Operação assíncrona', def: 'Operação iniciada agora cujo resultado é entregue depois, por meio de callback, promise ou evento.' },
    { term: 'Bloqueio', def: 'Código síncrono demorado que impede o agente de processar qualquer outra coisa.' }
  ],
  examples: `**Analogia:** pense em um restaurante com **um único garçom** (a thread do seu código) e uma cozinha com vários cozinheiros (o host). O garçom anota o pedido, entrega à cozinha e vai atender outras mesas. Quando o prato fica pronto, a cozinha avisa e o garçom leva o prato assim que estiver livre. Se o garçom resolvesse cozinhar ele mesmo um prato demorado, todas as mesas ficariam esperando: isso é bloquear a thread.`,
  code: [
    { title: 'Síncrono vs. assíncrono', lang: 'javascript', code: "console.log('1: início');\n\nsetTimeout(() => {\n  console.log('3: timer');\n}, 0);\n\nconsole.log('2: fim');\n// Saída: 1: início, 2: fim, 3: timer",
      notes: [ { l: '1', t: 'Executa imediatamente: entra e sai da pilha.' }, { l: '3-5', t: 'Pede ao host um timer de 0 ms. O callback não roda agora; ele vai para a fila de tarefas quando o timer vencer.' }, { l: '7', t: 'Executa em seguida, ainda na mesma tarefa.' }, { l: '8', t: 'O callback do timer só roda depois que o código atual termina e a pilha esvazia.' } ] },
    { title: 'Código que bloqueia', lang: 'javascript', code: "function esperarOcupado(ms) {\n  const inicio = Date.now();\n  while (Date.now() - inicio < ms) {\n    // laço vazio: a thread fica presa aqui\n  }\n}\n\nsetTimeout(() => console.log('timer de 10 ms'), 10);\nesperarOcupado(2000);\nconsole.log('fim do bloqueio');\n// 'fim do bloqueio' aparece depois de ~2 s e só então o timer roda",
      notes: [ { l: '3-5', t: 'Laço síncrono: enquanto roda, nenhum callback, clique ou renderização acontece.' }, { l: '8', t: 'O timer vence em 10 ms, mas não há como executá-lo: a pilha está ocupada.' }, { l: '9', t: 'Só depois do bloqueio a pilha esvazia e o event loop executa o callback atrasado.' } ] }
  ],
  bestPractices: ['Mantenha funções síncronas curtas nos caminhos críticos (handlers de evento, rotas HTTP).', 'Use as versões assíncronas das APIs de I/O no Node.js (por exemplo, §fs/promises§) em servidores.', 'Mova cálculos pesados para Web Workers ou worker_threads.', 'Meça antes de otimizar: use o painel Performance do navegador ou o profiler do Node.js.'],
  mistakes: ['Achar que §setTimeout(fn, 0)§ executa imediatamente.', 'Usar APIs síncronas de arquivo (como §fs.readFileSync§) dentro de rotas de um servidor com muitas requisições.', 'Confundir "JavaScript é single-threaded" com "o navegador ou o Node.js têm uma só thread".'],
  market: `Em entrevistas, perguntas sobre a ordem de execução de §console.log§, §setTimeout§ e promises são clássicas. No dia a dia, entender bloqueio explica por que uma interface React trava ao processar listas enormes e por que um servidor Node.js lento afeta todos os usuários ao mesmo tempo.`,
  summary: `O seu código JavaScript roda em uma pilha por agente, uma tarefa por vez. O host faz a espera (rede, disco, timers) e devolve o resultado por meio de filas. Assíncrono não é paralelismo do seu código: é delegar a espera. Código síncrono demorado bloqueia tudo.`,
  refs: [REF.execModel, REF.htmlLoop, REF.setTimeout, REF.flanagan],
  cards: [
    { q: 'O que significa "run-to-completion" no JavaScript?', a: 'Uma tarefa executa até o fim antes de outra tarefa começar no mesmo agente.' },
    { q: 'Quem executa a espera de uma requisição de rede: o motor JS ou o host?', a: 'O host (navegador ou Node.js). O motor só executa o callback quando o resultado chega.' },
    { q: 'Por que um laço síncrono de 2 segundos atrasa um setTimeout de 10 ms?', a: 'Porque o callback do timer só pode rodar quando a pilha estiver vazia.' }
  ]
},
{
  id: 'jsa-02', moduleId: 'm1', order: 2, minutes: 70, tags: ['javascript', 'nodejs', 'navegador'],
  title: 'Event loop: tarefas, microtarefas e a ordem de execução',
  objectives: ['Descrever o ciclo do event loop no navegador', 'Diferenciar tarefas (macrotasks) de microtarefas', 'Prever a ordem de saída de código com timers e promises', 'Conhecer as fases do event loop do Node.js e o papel de process.nextTick'],
  intro: `Você já viu que o host devolve resultados por meio de filas. Agora vamos abrir a caixa: existem filas diferentes, com prioridades diferentes. Saber isso permite prever a ordem exata de execução e evitar bugs sutis de interface e de servidor.`,
  theory: `### O ciclo no navegador (HTML Living Standard)
De forma simplificada, cada volta do event loop faz:
1. Pega **uma tarefa** de uma fila de tarefas e a executa até o fim.
2. Executa o **checkpoint de microtarefas**: roda **todas** as microtarefas pendentes, inclusive as que forem criadas durante esse processo.
3. Se for o momento, atualiza a renderização (estilo, layout, pintura; callbacks de §requestAnimationFrame§ rodam nessa etapa).
4. Volta ao passo 1.

**Tarefas** (também chamadas de *macrotasks*) vêm de: execução de um script, callbacks de §setTimeout§/§setInterval§, eventos de interface (clique, teclado), mensagens (§postMessage§).

**Microtarefas** vêm de: reações de promises (§then§, §catch§, §finally§ e a continuação após §await§), §queueMicrotask()§ e §MutationObserver§.

Consequência importante: **depois de cada tarefa, a fila de microtarefas é esvaziada por completo** antes de qualquer timer ou renderização. Por isso uma cadeia infinita de microtarefas trava a página tanto quanto um laço infinito.

### Timers não são precisos
§setTimeout(fn, 100)§ garante **no mínimo** cerca de 100 ms, não exatamente 100 ms. O callback ainda precisa esperar a pilha esvaziar e as microtarefas terminarem. A especificação HTML também impõe um mínimo de 4 ms para timers aninhados a partir do quinto nível, e navegadores reduzem a frequência de timers em abas em segundo plano.

### O event loop do Node.js
O Node.js usa a biblioteca libuv e organiza o loop em **fases**: *timers* (callbacks de §setTimeout§/§setInterval§ vencidos), *pending callbacks*, *idle/prepare*, *poll* (espera e processa I/O), *check* (callbacks de §setImmediate§) e *close callbacks*.

Entre as operações, o Node.js esvazia duas filas especiais: a de §process.nextTick§ e a de microtarefas de promises. Em código **CommonJS**, a fila de §nextTick§ é processada antes das promises. Em **módulos ES**, o próprio módulo é avaliado de forma assíncrona, então a ordem entre essas duas filas pode se inverter no nível superior do arquivo. Não escreva código que dependa dessa diferença.

A ordem entre §setTimeout(fn, 0)§ e §setImmediate(fn)§ no módulo principal **não é garantida**: depende da performance do processo. Dentro de um callback de I/O, §setImmediate§ sempre roda antes.`,
  concepts: [
    { term: 'Tarefa (macrotask)', def: 'Unidade de trabalho agendada em uma fila de tarefas: script, timer, evento de UI, mensagem.' },
    { term: 'Microtarefa', def: 'Trabalho executado logo após a tarefa atual: reações de promises, queueMicrotask, MutationObserver.' },
    { term: 'Checkpoint de microtarefas', def: 'Momento em que todas as microtarefas pendentes são executadas, até a fila esvaziar.' },
    { term: 'process.nextTick', def: 'Fila do Node.js processada assim que a operação atual termina, antes de avançar o loop.' },
    { term: 'setImmediate', def: 'Agenda um callback para a fase check do loop do Node.js.' }
  ],
  examples: `**Analogia:** um caixa de banco atende um cliente da fila principal por vez (tarefas). Ao terminar cada atendimento, ele resolve **todas** as pendências rápidas daquele cliente que ficaram anotadas em um bloco de post-its (microtarefas), mesmo que novas pendências surjam no meio. Só então chama o próximo da fila. Se alguém ficar colando post-its sem parar, a fila principal nunca anda.`,
  code: [
    { title: 'Prevendo a ordem no navegador', lang: 'javascript', code: "console.log('A');\n\nsetTimeout(() => console.log('B'), 0);\n\nPromise.resolve().then(() => console.log('C'));\n\nqueueMicrotask(() => console.log('D'));\n\nconsole.log('E');\n// Saída: A, E, C, D, B",
      notes: [ { l: '1', t: 'Síncrono: parte da tarefa atual (o script).' }, { l: '3', t: 'Agenda uma nova tarefa (timer). Vai esperar o fim da tarefa atual e das microtarefas.' }, { l: '5', t: 'Agenda uma microtarefa (reação de promise já resolvida).' }, { l: '7', t: 'Agenda outra microtarefa, depois da anterior (ordem de chegada).' }, { l: '9', t: 'Síncrono. Depois dele o script termina e o checkpoint de microtarefas imprime C e D. Só então o timer imprime B.' } ] },
    { title: 'Microtarefas criadas durante o checkpoint', lang: 'javascript', code: "setTimeout(() => console.log('timer'), 0);\n\nPromise.resolve()\n  .then(() => {\n    console.log('micro 1');\n    queueMicrotask(() => console.log('micro 3'));\n  })\n  .then(() => console.log('micro 2'));\n// Saída: micro 1, micro 3, micro 2, timer",
      notes: [ { l: '4-7', t: 'Durante a primeira microtarefa, outra é agendada; ela entra no fim da fila de microtarefas.' }, { l: '8', t: 'O segundo then só é agendado quando a promise do primeiro then é resolvida, o que acontece ao fim de micro 1. Ele entra na fila depois de micro 3.' }, { l: '1', t: 'O timer só roda quando a fila de microtarefas está totalmente vazia.' } ] },
    { title: 'Node.js (CommonJS): nextTick, promises, timers e setImmediate', lang: 'javascript', code: "// arquivo ordem.cjs — execute com: node ordem.cjs\nsetTimeout(() => console.log('timeout'), 0);\nsetImmediate(() => console.log('immediate'));\nprocess.nextTick(() => console.log('nextTick'));\nPromise.resolve().then(() => console.log('promise'));\n// Saída: nextTick, promise, e depois timeout e immediate\n// (a ordem entre timeout e immediate não é garantida aqui)",
      notes: [ { l: '4', t: 'Em CommonJS, a fila de nextTick é processada primeiro, assim que o script termina.' }, { l: '5', t: 'Em seguida, as microtarefas de promises.' }, { l: '2-3', t: 'Fase timers e fase check: a ordem entre as duas no módulo principal depende do tempo de inicialização do processo.' } ] }
  ],
  bestPractices: ['Não dependa de ordem exata entre timers e setImmediate no Node.js.', 'Prefira §queueMicrotask§ a §Promise.resolve().then§ quando quiser apenas agendar uma microtarefa: a intenção fica explícita.', 'Evite recursão infinita de microtarefas ou de §process.nextTick§: elas impedem I/O e renderização.', 'Para animações no navegador, use §requestAnimationFrame§, não §setTimeout§.'],
  mistakes: ['Achar que §setTimeout(fn, 0)§ roda antes de um §then§ de promise já resolvida.', 'Usar §setTimeout§ como forma de "esperar o React renderizar".', 'Assumir que a ordem de nextTick e promises é a mesma em CommonJS e em módulos ES.'],
  market: `Bugs de "estado ainda não atualizado", testes instáveis (*flaky*) que dependem de timers e travamentos de interface quase sempre envolvem a ordem do event loop. Bibliotecas de teste como Jest e Vitest oferecem *fake timers* justamente para controlar essas filas nos testes.`,
  summary: `A cada volta do loop: uma tarefa, depois todas as microtarefas, depois (talvez) renderização. Promises e queueMicrotask são microtarefas; timers e eventos são tarefas. O Node.js tem fases próprias e as filas de nextTick e promises entre operações.`,
  refs: [REF.htmlLoop, REF.microtask, REF.execModel, REF.nodeLoop, REF.setTimeout],
  cards: [
    { q: 'O que o event loop faz logo depois de terminar uma tarefa?', a: 'Executa todas as microtarefas pendentes, até a fila esvaziar.' },
    { q: 'Cite três fontes de microtarefas.', a: 'Reações de promises (then/catch/finally e continuação de await), queueMicrotask e MutationObserver.' },
    { q: 'setTimeout(fn, 0) e setImmediate(fn) no módulo principal do Node.js: qual roda primeiro?', a: 'Não é garantido. Dentro de um callback de I/O, setImmediate roda primeiro.' }
  ]
},
{
  id: 'jsa-03', moduleId: 'm1', order: 3, minutes: 55, tags: ['javascript', 'nodejs'],
  title: 'Callbacks: o padrão original e seus limites',
  objectives: ['Escrever e consumir callbacks no estilo error-first', 'Explicar callback hell e inversão de controle', 'Converter APIs de callback em promises'],
  intro: `Antes das promises (ES2015), toda operação assíncrona em JavaScript era tratada com callbacks. Muitas APIs ainda usam esse estilo, especialmente no ecossistema Node.js. Entender seus limites explica por que promises e async/await existem.`,
  theory: `### O que é um callback
Callback é uma função passada como argumento para ser chamada depois. Nem todo callback é assíncrono: §array.map(fn)§ chama §fn§ de forma síncrona. Um callback é assíncrono quando a função que o recebe o agenda para depois, como §setTimeout§ ou §fs.readFile§.

### A convenção error-first do Node.js
APIs clássicas do Node.js chamam o callback com o **erro como primeiro argumento** e o resultado em seguida: §(err, resultado)§. Se não houve erro, §err§ é §null§. Essa convenção é o que permite a conversão automática para promises com §util.promisify§.

### Os problemas
1. **Callback hell (pirâmide da perdição):** operações dependentes geram aninhamento profundo, difícil de ler e de tratar erros.
2. **Tratamento de erros manual:** cada nível precisa checar §err§ e lembrar de interromper o fluxo com §return§. Um §try/catch§ ao redor não captura erros lançados dentro do callback, porque ele roda em outra tarefa.
3. **Inversão de controle:** você entrega a continuação do seu programa para código de terceiros. Nada garante que o callback será chamado **uma única vez**, nem que será chamado **sempre de forma assíncrona**. Uma API que às vezes chama o callback na hora e às vezes depois cria bugs difíceis (o problema conhecido como "Zalgo").

Promises resolvem esses pontos: uma promise só pode ser resolvida uma vez, suas reações são sempre assíncronas, e erros se propagam pela cadeia.`,
  concepts: [
    { term: 'Callback', def: 'Função passada como argumento para ser executada por outra função.' },
    { term: 'Error-first', def: 'Convenção do Node.js: callback(err, resultado), com err null em caso de sucesso.' },
    { term: 'Inversão de controle', def: 'Entregar a continuação do programa a um código que você não controla.' },
    { term: 'promisify', def: 'Conversão de uma função error-first em uma função que retorna promise.' }
  ],
  examples: `**Analogia:** um callback é deixar seu telefone com uma loja e pedir "me liga quando o conserto ficar pronto". Você depende de a loja ligar, ligar uma vez só e ligar para o número certo. Uma promise é um **comprovante** de retirada: ele representa o resultado, você decide quando consultá-lo, e ele só pode terminar em "pronto" ou "não deu para consertar", uma única vez.`,
  code: [
    { title: 'Error-first e o return esquecido', lang: 'javascript', code: "const fs = require('node:fs');\n\nfs.readFile('config.json', 'utf8', (err, texto) => {\n  if (err) {\n    console.error('Falha ao ler:', err.message);\n    return; // sem este return, o código abaixo roda com texto undefined\n  }\n  const config = JSON.parse(texto);\n  console.log('Porta:', config.port);\n});",
      notes: [ { l: '3', t: 'O callback recebe o erro primeiro e o conteúdo depois.' }, { l: '4-7', t: 'Checagem obrigatória do erro. O return interrompe o fluxo.' }, { l: '8', t: 'JSON.parse pode lançar exceção. Aqui ela não seria capturada por um try/catch externo à chamada de readFile.' } ] },
    { title: 'De callback para promise', lang: 'javascript', code: "const { promisify } = require('node:util');\nconst fs = require('node:fs');\n\nconst lerArquivo = promisify(fs.readFile);\n\nlerArquivo('config.json', 'utf8')\n  .then((texto) => JSON.parse(texto))\n  .then((config) => console.log('Porta:', config.port))\n  .catch((err) => console.error('Falha:', err.message));\n\n// Em código novo, prefira a API pronta: require('node:fs/promises')",
      notes: [ { l: '4', t: 'promisify cria uma versão da função que retorna promise, baseada na convenção error-first.' }, { l: '7', t: 'Se JSON.parse lançar, a promise é rejeitada e o erro chega ao catch.' }, { l: '9', t: 'Um único catch trata erros de leitura e de parsing.' }, { l: '11', t: 'O Node.js já oferece fs/promises, que dispensa o promisify.' } ] }
  ],
  bestPractices: ['Em APIs próprias, retorne promises em vez de aceitar callbacks.', 'Ao consumir APIs de callback do Node.js, use as variantes com promises (§fs/promises§, §timers/promises§) ou §util.promisify§.', 'Se precisar escrever uma função com callback, garanta que ele seja chamado exatamente uma vez e sempre de forma assíncrona.'],
  mistakes: ['Esquecer o §return§ depois de tratar o erro e chamar o callback duas vezes.', 'Envolver uma chamada com callback em try/catch esperando capturar erros que acontecem depois.', 'Chamar o callback de forma síncrona em alguns casos e assíncrona em outros.'],
  market: `Você ainda encontra callbacks em bibliotecas antigas, em SDKs, em eventos (§EventEmitter§) e em código legado. Migrar APIs de callback para promises é uma tarefa comum em projetos de manutenção.`,
  summary: `Callbacks funcionam, mas espalham o tratamento de erros, geram aninhamento e entregam o controle a terceiros. A convenção error-first do Node.js permite converter essas APIs para promises com util.promisify.`,
  refs: [REF.nodeUtil, REF.usingPromises, REF.flanagan],
  cards: [
    { q: 'Qual a assinatura de um callback error-first?', a: 'callback(err, resultado), com err igual a null quando não há erro.' },
    { q: 'Por que try/catch não captura erros lançados dentro de um callback assíncrono?', a: 'Porque o callback executa em outra tarefa, depois que o bloco try já terminou.' },
    { q: 'Que garantias uma promise oferece que um callback não oferece?', a: 'Resolve uma única vez, reações sempre assíncronas e propagação de erros pela cadeia.' }
  ]
},
{
  id: 'jsa-04', moduleId: 'm2', order: 4, minutes: 75, tags: ['javascript'],
  title: 'Promises: estados, encadeamento e tratamento de erros',
  objectives: ['Descrever os estados de uma promise', 'Encadear operações com then, catch e finally', 'Criar promises com o construtor quando necessário', 'Evitar os erros mais comuns de encadeamento'],
  intro: `Promise é um objeto que representa o resultado futuro de uma operação. Ela foi padronizada no ES2015 e é a base de async/await. Dominar promises é o que separa quem "faz funcionar" de quem entende o que acontece quando algo falha.`,
  theory: `### Estados
Uma promise está em um de três estados: **pending** (pendente), **fulfilled** (cumprida, com um valor) ou **rejected** (rejeitada, com um motivo). Quando sai de *pending*, dizemos que ela está **settled** (estabelecida) e o estado não muda mais.

### then, catch e finally
- §p.then(onFulfilled, onRejected)§ registra reações e **retorna uma nova promise**.
- §p.catch(fn)§ é o mesmo que §p.then(undefined, fn)§.
- §p.finally(fn)§ roda em sucesso ou falha, não recebe o valor e repassa o resultado original (a não ser que lance erro).

As reações **sempre** rodam como microtarefas, mesmo que a promise já esteja resolvida.

### Regras do encadeamento
A promise retornada por §then§ é resolvida com:
- o **valor retornado** pelo handler;
- o **resultado de outra promise**, se o handler retornar uma promise (ela é "seguida");
- uma **rejeição**, se o handler lançar uma exceção.

Por isso, um erro em qualquer ponto da cadeia pula os §then§ seguintes até encontrar um §catch§. Depois do §catch§, a cadeia continua normalmente com o valor que ele retornar.

### Criando promises
Use o construtor §new Promise((resolve, reject) => { ... })§ para **adaptar** APIs que não usam promises (timers, eventos, callbacks). Não use o construtor para envolver algo que já retorna promise: isso é o antipadrão do construtor explícito, que costuma perder erros.

Atalhos úteis: §Promise.resolve(valor)§, §Promise.reject(erro)§ e, desde o ES2024, §Promise.withResolvers()§, que devolve §{ promise, resolve, reject }§.

### Rejeições não tratadas
Uma promise rejeitada sem nenhum handler gera o evento *unhandledrejection* no navegador. No Node.js, desde a versão 15, o comportamento padrão é **encerrar o processo** com erro. Sempre trate ou propague rejeições.`,
  concepts: [
    { term: 'pending / fulfilled / rejected', def: 'Os três estados possíveis de uma promise.' },
    { term: 'settled', def: 'Promise que já foi cumprida ou rejeitada; o estado não muda mais.' },
    { term: 'Encadeamento', def: 'Cada then/catch/finally retorna uma nova promise, permitindo uma sequência linear de passos.' },
    { term: 'Antipadrão do construtor explícito', def: 'Envolver em new Promise algo que já é uma promise.' }
  ],
  examples: `**Analogia:** a senha de um pedido em uma lanchonete. Ela começa "em preparo" (pending) e termina em "pronto" (fulfilled) ou "acabou o ingrediente" (rejected). O resultado não muda depois de anunciado. Encadear é dizer: "quando ficar pronto, embrulhe para viagem; quando estiver embrulhado, leve ao carro".`,
  code: [
    { title: 'Adaptando setTimeout para promise', lang: 'javascript', code: "function esperar(ms, valor) {\n  return new Promise((resolve) => {\n    setTimeout(() => resolve(valor), ms);\n  });\n}\n\nesperar(500, 'ok').then((v) => console.log(v)); // 'ok' depois de ~500 ms",
      notes: [ { l: '2', t: 'O construtor recebe o executor, que roda imediatamente e recebe resolve e reject.' }, { l: '3', t: 'resolve é chamado depois, quando o timer vence. Esse é o uso legítimo do construtor: adaptar uma API de callback.' } ] },
    { title: 'Encadeamento e propagação de erro', lang: 'javascript', code: "function buscarUsuario(id) {\n  return id > 0\n    ? Promise.resolve({ id, nome: 'Ana' })\n    : Promise.reject(new Error('id inválido'));\n}\n\nbuscarUsuario(1)\n  .then((u) => {\n    return u.nome.toUpperCase();\n  })\n  .then((nome) => {\n    if (nome.length < 5) throw new Error('nome curto');\n    return nome;\n  })\n  .then((nome) => console.log('Nome:', nome))\n  .catch((err) => console.error('Erro:', err.message))\n  .finally(() => console.log('fim'));\n// Saída: Erro: nome curto, fim",
      notes: [ { l: '9', t: 'O valor retornado vira o valor da próxima promise da cadeia.' }, { l: '12', t: 'Lançar dentro de um then rejeita a promise seguinte.' }, { l: '15', t: 'Este then é pulado, porque a promise anterior foi rejeitada.' }, { l: '16', t: 'O catch recebe o erro de qualquer ponto anterior.' }, { l: '17', t: 'finally roda nos dois casos; útil para esconder um indicador de carregamento.' } ] }
  ],
  bestPractices: ['Sempre **retorne** a promise ou o valor dentro de um §then§.', 'Termine cadeias com §catch§ ou propague a promise para quem chamou.', 'Rejeite sempre com objetos §Error§, que carregam stack trace.', 'Use §finally§ para limpeza (fechar conexões, esconder loading).'],
  mistakes: ['Esquecer o §return§ dentro do §then§ e receber §undefined§ no passo seguinte.', 'Aninhar §then§ dentro de §then§ em vez de encadear.', 'Envolver uma função que já retorna promise em §new Promise§.', 'Deixar promises rejeitadas sem tratamento (no Node.js, isso derruba o processo por padrão).'],
  market: `Clientes HTTP (§fetch§, Axios), drivers de banco (pg, Prisma), SDKs de cloud e quase todas as bibliotecas modernas retornam promises. Saber ler e depurar cadeias é requisito básico em qualquer vaga JavaScript ou TypeScript.`,
  summary: `Uma promise vai de pending para fulfilled ou rejected uma única vez. then/catch/finally retornam novas promises; valores, promises e exceções definem o próximo passo. Erros pulam etapas até o primeiro catch. Trate sempre as rejeições.`,
  refs: [REF.promise, REF.usingPromises, REF.ecma],
  cards: [
    { q: 'Quais são os três estados de uma promise?', a: 'pending, fulfilled e rejected.' },
    { q: 'O que acontece se um handler then lançar uma exceção?', a: 'A promise retornada por esse then é rejeitada e o erro segue até o próximo catch.' },
    { q: 'Quando o construtor new Promise é apropriado?', a: 'Para adaptar APIs que não usam promises, como timers, eventos ou callbacks.' }
  ]
},
{
  id: 'jsa-05', moduleId: 'm2', order: 5, minutes: 60, tags: ['javascript'],
  title: 'Combinando promises: all, allSettled, race e any',
  objectives: ['Escolher o combinador certo para cada cenário', 'Executar operações independentes em paralelo', 'Tratar falhas parciais'],
  intro: `Aplicações reais disparam várias operações ao mesmo tempo: carregar perfil, pedidos e notificações de uma vez, ou consultar dois servidores e usar o mais rápido. Os combinadores de promises resolvem esses cenários sem código manual de contagem.`,
  theory: `Todos os combinadores recebem um **iterável** (normalmente um array) de promises ou valores e retornam **uma** promise. Valores que não são promises são tratados como já cumpridos.

| Combinador | Cumpre quando | Rejeita quando | Padrão |
|---|---|---|---|
| §Promise.all§ | todas cumprem (valores na ordem de entrada) | a **primeira** rejeitar | ES2015 |
| §Promise.allSettled§ | todas terminarem, sucesso ou falha | nunca | ES2020 |
| §Promise.race§ | a primeira a terminar cumprir | a primeira a terminar rejeitar | ES2015 |
| §Promise.any§ | a primeira **cumprir** | todas rejeitarem (com §AggregateError§) | ES2021 |

### Detalhes que importam
- **Ordem:** §all§ e §allSettled§ devolvem os resultados na ordem de entrada, não na ordem de término.
- **Cancelamento:** quando §all§ rejeita, as outras operações **continuam rodando**. Promise não tem cancelamento embutido. Para cancelar de verdade, use §AbortController§ (aula 7).
- **Array vazio:** §Promise.all([])§ cumpre com §[]§; §Promise.any([])§ rejeita com §AggregateError§; §Promise.race([])§ fica pendente para sempre.
- **allSettled** devolve objetos §{ status: 'fulfilled', value }§ ou §{ status: 'rejected', reason }§.

### Paralelo de verdade?
"Paralelo" aqui significa que as operações de I/O foram **iniciadas** juntas e o host espera por elas ao mesmo tempo. O seu código JavaScript continua rodando em uma pilha. As operações começam no momento em que você **chama** as funções, não quando passa as promises para o combinador.`,
  concepts: [
    { term: 'Promise.all', def: 'Tudo ou nada: cumpre com todos os valores ou rejeita na primeira falha.' },
    { term: 'Promise.allSettled', def: 'Espera todas terminarem e informa o status de cada uma.' },
    { term: 'Promise.race', def: 'Assume o resultado da primeira promise que terminar, seja sucesso ou falha.' },
    { term: 'Promise.any', def: 'Assume o primeiro sucesso; rejeita com AggregateError se todas falharem.' }
  ],
  examples: `**Analogia:** pedir orçamento a vários fornecedores. **all**: você só fecha a obra com todos os orçamentos; se um desistir, o projeto para. **allSettled**: você espera todos responderem e analisa quem aceitou e quem recusou. **race**: você aceita a primeira resposta, mesmo que seja uma recusa. **any**: você aceita o primeiro "sim".`,
  code: [
    { title: 'Dashboard com falhas parciais', lang: 'javascript', code: "async function carregarPainel(api) {\n  const [perfil, pedidos, avisos] = await Promise.allSettled([\n    api.perfil(),\n    api.pedidos(),\n    api.avisos(),\n  ]);\n\n  return {\n    perfil: perfil.status === 'fulfilled' ? perfil.value : null,\n    pedidos: pedidos.status === 'fulfilled' ? pedidos.value : [],\n    avisos: avisos.status === 'fulfilled' ? avisos.value : [],\n    erros: [perfil, pedidos, avisos]\n      .filter((r) => r.status === 'rejected')\n      .map((r) => r.reason.message),\n  };\n}",
      notes: [ { l: '2-6', t: 'As três chamadas começam juntas. allSettled espera todas, sem rejeitar.' }, { l: '9-11', t: 'Cada bloco da tela recebe um valor padrão quando sua fonte falhou.' }, { l: '12-14', t: 'Os erros são coletados para exibição ou log, sem derrubar o painel inteiro.' } ] },
    { title: 'Servidor espelho mais rápido com any', lang: 'javascript', code: "async function baixarDoMaisRapido(urls) {\n  try {\n    const resp = await Promise.any(urls.map((u) => fetch(u)));\n    return resp;\n  } catch (err) {\n    // err é um AggregateError: err.errors tem o motivo de cada falha\n    throw new Error('Todos os espelhos falharam: ' + err.errors.length);\n  }\n}",
      notes: [ { l: '3', t: 'Todas as requisições começam juntas; vence o primeiro sucesso.' }, { l: '6', t: 'AggregateError agrupa todos os erros quando nenhuma promise cumpre.' }, { l: '3', t: 'Atenção: fetch só rejeita em falhas de rede. Respostas HTTP 404 ou 500 cumprem a promise; verifique resp.ok quando isso importar.' } ] }
  ],
  bestPractices: ['Use §all§ quando o resultado só faz sentido com todas as partes.', 'Use §allSettled§ para telas e relatórios que toleram falha parcial.', 'Combine §race§ com um timer para implementar timeout, mas cancele a operação perdedora quando possível.', 'Limite a quantidade de operações simultâneas quando a lista for grande (aula 7).'],
  mistakes: ['Achar que §Promise.all§ cancela as demais operações quando uma falha.', 'Criar as promises dentro de um laço com §await§ e depois chamar §all§: elas já rodaram em sequência.', 'Usar §race§ esperando o primeiro **sucesso** (para isso existe §any§).', 'Disparar milhares de requisições de uma vez com §all§.'],
  market: `Agregação de dados de várias APIs (BFFs, dashboards), consultas paralelas ao banco e chamadas a microsserviços usam esses combinadores o tempo todo. Escolher entre all e allSettled é uma decisão de produto: o que acontece com a tela quando um serviço cai?`,
  summary: `all: tudo ou nada. allSettled: relatório completo. race: o primeiro a terminar. any: o primeiro sucesso. Nenhum deles cancela operações. As operações começam quando as funções são chamadas.`,
  refs: [REF.all, REF.allSettled, REF.race, REF.any],
  cards: [
    { q: 'Qual combinador nunca rejeita?', a: 'Promise.allSettled.' },
    { q: 'O que Promise.any faz quando todas as promises rejeitam?', a: 'Rejeita com um AggregateError, cujo campo errors traz todos os motivos.' },
    { q: 'Promise.all cancela as outras operações quando uma rejeita?', a: 'Não. Elas continuam rodando; promises não têm cancelamento embutido.' }
  ]
},
{
  id: 'jsa-06', moduleId: 'm3', order: 6, minutes: 70, tags: ['javascript', 'nodejs', 'typescript'],
  title: 'async/await: código assíncrono com cara de síncrono',
  objectives: ['Explicar o que async e await fazem por baixo', 'Tratar erros com try/catch/finally', 'Escolher entre execução sequencial e paralela', 'Evitar armadilhas com laços'],
  intro: `async/await (ES2017) é uma sintaxe sobre promises. Ela não cria um novo modelo de concorrência: apenas deixa o fluxo assíncrono legível como código sequencial. Por isso, tudo o que você aprendeu sobre promises e event loop continua valendo.`,
  theory: `### async
Uma função §async§ **sempre retorna uma promise**. Se ela retorna um valor, a promise cumpre com esse valor. Se lança uma exceção, a promise rejeita.

### await
§await expressão§ pausa **apenas a função async atual** até a promise terminar. Enquanto isso, a pilha fica livre e o event loop continua processando outras tarefas. A continuação depois do §await§ roda como microtarefa. Se a promise rejeitar, o §await§ **lança** o motivo, que pode ser capturado com §try/catch§.

§await§ pode ser usado dentro de funções §async§ e, desde o ES2022, no nível superior de **módulos ES** (*top-level await*).

### Sequencial vs. paralelo
Dois §await§ seguidos executam **em sequência**: o segundo só começa quando o primeiro termina. Se as operações forem independentes, inicie as duas e espere juntas com §Promise.all§. Use sequência quando uma operação depende da outra ou quando você precisa limitar a carga sobre um serviço.

### Laços
- §for...of§ com §await§ dentro processa **um item por vez**, em ordem.
- §array.forEach(async ...)§ **não espera** nada: §forEach§ ignora as promises retornadas. O código depois do §forEach§ roda antes dos itens terminarem e erros viram rejeições não tratadas.
- Para paralelo: §await Promise.all(itens.map(async (item) => ...))§.

### return await
Dentro de um bloco §try§, use §return await promise§ se quiser que o §catch§ daquela função capture a rejeição. Sem o §await§, a promise é devolvida sem passar pelo §catch§ local.`,
  concepts: [
    { term: 'async function', def: 'Função que sempre retorna uma promise.' },
    { term: 'await', def: 'Pausa a função async até a promise terminar, liberando a pilha.' },
    { term: 'Top-level await', def: 'Uso de await fora de funções, no nível superior de módulos ES (ES2022).' },
    { term: 'Execução sequencial', def: 'Cada operação começa só depois que a anterior termina.' }
  ],
  examples: `**Analogia:** uma receita com "deixe a massa descansar 30 minutos". Você (a função async) pausa aquela receita, mas a cozinha (o event loop) não para: outra pessoa pode usar o fogão nesse tempo. Se a receita manda ferver a água **e** cortar os legumes, fazer um depois do outro desperdiça tempo; inicie os dois e espere ambos (Promise.all).`,
  code: [
    { title: 'Sequencial vs. paralelo', lang: 'javascript', code: "const esperar = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));\n\nasync function sequencial() {\n  const a = await esperar(1000, 'a');\n  const b = await esperar(1000, 'b');\n  return [a, b]; // ~2 s\n}\n\nasync function paralelo() {\n  const [a, b] = await Promise.all([esperar(1000, 'a'), esperar(1000, 'b')]);\n  return [a, b]; // ~1 s\n}",
      notes: [ { l: '4-5', t: 'O segundo timer só é criado depois que o primeiro termina.' }, { l: '10', t: 'Os dois timers são criados juntos; Promise.all espera ambos.' } ] },
    { title: 'Tratamento de erros e o forEach que não espera', lang: 'javascript', code: "async function salvarTodos(itens, salvar) {\n  // ERRADO: forEach não espera as promises\n  // itens.forEach(async (item) => { await salvar(item); });\n\n  const falhas = [];\n  for (const item of itens) {\n    try {\n      await salvar(item);\n    } catch (err) {\n      falhas.push({ item, motivo: err.message });\n    }\n  }\n  return falhas;\n}",
      notes: [ { l: '3', t: 'forEach chama o callback e descarta a promise retornada: nada é aguardado.' }, { l: '6', t: 'for...of respeita o await: um item por vez, em ordem.' }, { l: '7-11', t: 'try/catch captura a rejeição do await. A falha de um item não interrompe os demais.' } ] }
  ],
  bestPractices: ['Inicie operações independentes juntas e use §Promise.all§ ou §allSettled§.', 'Use §for...of§ quando a ordem importa ou quando precisa limitar a carga.', 'Envolva em §try/catch§ apenas o trecho que pode falhar e que você sabe tratar; deixe o resto propagar.', 'Em TypeScript, tipe o retorno como §Promise<T>§ e habilite a regra de lint *no-floating-promises* (typescript-eslint) para detectar promises esquecidas.'],
  mistakes: ['Usar §forEach§ com callback §async§.', 'Colocar §await§ em sequência para operações independentes.', 'Esquecer o §await§ e tratar a promise como se fosse o valor.', 'Envolver a função inteira em um §try/catch§ genérico que esconde erros de programação.'],
  market: `async/await é o estilo padrão em Node.js, NestJS, Next.js (Server Components e Server Actions são async) e no código de testes. Revisões de código frequentemente apontam awaits sequenciais desnecessários como causa de lentidão em rotas de API.`,
  summary: `async retorna promise; await pausa só a função atual e lança em caso de rejeição. Sequência quando há dependência, Promise.all quando não há. forEach não espera; use for...of ou map + Promise.all.`,
  refs: [REF.asyncFn, REF.await, REF.usingPromises, REF.ecma],
  cards: [
    { q: 'O que uma função async sempre retorna?', a: 'Uma promise.' },
    { q: 'Por que array.forEach(async ...) não espera os itens?', a: 'forEach ignora o valor retornado pelo callback, então as promises não são aguardadas.' },
    { q: 'Duas chamadas independentes de 1 s com awaits seguidos levam quanto tempo? E com Promise.all?', a: 'Cerca de 2 s em sequência; cerca de 1 s com Promise.all.' }
  ]
},
{
  id: 'jsa-07', moduleId: 'm3', order: 7, minutes: 80, tags: ['javascript', 'nodejs', 'resiliencia'],
  title: 'Padrões de produção: timeout, cancelamento, retry e limite de concorrência',
  objectives: ['Aplicar timeout e cancelamento com AbortController', 'Implementar retry com backoff exponencial e jitter', 'Limitar a concorrência de operações assíncronas', 'Reconhecer quando repetir uma operação é seguro'],
  intro: `Em produção, redes falham, serviços ficam lentos e APIs impõem limites. Código assíncrono "que funciona" no seu computador precisa de quatro proteções para sobreviver ao mundo real: tempo máximo de espera, cancelamento, novas tentativas controladas e limite de operações simultâneas.`,
  theory: `### Timeout
Toda chamada externa precisa de um tempo máximo. Sem isso, uma dependência lenta prende conexões e memória até o sistema inteiro degradar.

Com §fetch§, use §AbortSignal.timeout(ms)§, disponível nos navegadores modernos e no Node.js (o §fetch§ é global no Node.js desde a versão 18). A requisição é abortada e a promise rejeita com um erro de nome §TimeoutError§.

Para uma função assíncrona genérica, uma solução de estudo é §Promise.race§ com um timer. Limitação: a operação original **continua rodando**; o race só para de esperar por ela.

### Cancelamento com AbortController
§AbortController§ cria um §signal§ que você passa para APIs que o aceitam (§fetch§, muitas APIs do Node.js e bibliotecas). Chamar §controller.abort()§ cancela a operação **do lado do cliente**. O servidor pode já ter processado o pedido: abortar não desfaz efeitos colaterais.

Casos de uso: o usuário sai da tela, digita uma nova busca (cancele a anterior) ou o componente React desmonta (cancele no *cleanup* do §useEffect§).

### Retry com backoff exponencial e jitter
Repetir imediatamente uma chamada que falhou costuma piorar o problema: todos os clientes repetem juntos e sobrecarregam o serviço. A estratégia recomendada é esperar cada vez mais entre tentativas (**backoff exponencial**: base × 2^tentativa, com um teto) e adicionar aleatoriedade (**jitter**) para espalhar as tentativas no tempo. O artigo da AWS sobre backoff e jitter mostra que o "full jitter" (espera aleatória entre 0 e o valor exponencial) reduz bastante a contenção.

Só repita o que é **seguro repetir**:
- Erros transitórios (timeout, HTTP 429, 502, 503, 504), não erros de validação (400) ou autorização (401/403).
- Operações **idempotentes** (GET, PUT bem desenhado) ou protegidas por uma **chave de idempotência**. Repetir um POST de pagamento sem isso pode cobrar duas vezes.

### Limite de concorrência
Processar 10.000 itens com §Promise.all§ dispara 10.000 operações de uma vez: estoura limites de taxa, conexões do banco e memória. Use um *pool*: no máximo N operações em andamento; quando uma termina, a próxima começa. Em produção, bibliotecas como §p-limit§ fazem isso; entender a implementação ajuda a usá-las bem.`,
  concepts: [
    { term: 'Timeout', def: 'Tempo máximo de espera por uma operação antes de desistir.' },
    { term: 'AbortController', def: 'Objeto que gera um signal para cancelar operações que o aceitam.' },
    { term: 'Backoff exponencial', def: 'Espera crescente entre tentativas: base × 2^tentativa, até um teto.' },
    { term: 'Jitter', def: 'Aleatoriedade adicionada à espera para evitar que clientes repitam ao mesmo tempo.' },
    { term: 'Idempotência', def: 'Propriedade de uma operação que pode ser repetida sem mudar o resultado além da primeira execução.' },
    { term: 'Limite de concorrência', def: 'Número máximo de operações assíncronas em andamento ao mesmo tempo.' }
  ],
  examples: `**Analogia:** ligar para uma central de atendimento congestionada. Timeout é desligar depois de 5 minutos de espera. Cancelar é desligar porque você resolveu o problema de outro jeito. Retry com backoff é tentar de novo em 1 minuto, depois em 2, depois em 4, e não a cada segundo. Jitter é não ligar exatamente na hora cheia, junto com todo mundo. Limite de concorrência é a central atender no máximo 10 ligações por vez e deixar as outras na fila.`,
  code: [
    { title: 'fetch com timeout e cancelamento', lang: 'javascript', code: "async function buscarJson(url, { timeoutMs = 5000, signal } = {}) {\n  const sinais = [AbortSignal.timeout(timeoutMs)];\n  if (signal) sinais.push(signal);\n\n  const resp = await fetch(url, { signal: AbortSignal.any(sinais) });\n  if (!resp.ok) {\n    const err = new Error('HTTP ' + resp.status);\n    err.status = resp.status;\n    throw err;\n  }\n  return resp.json();\n}\n\n// Uso: cancelar a busca anterior quando o usuário digita de novo\nlet controller;\nfunction pesquisar(termo) {\n  controller?.abort();\n  controller = new AbortController();\n  return buscarJson('/api/busca?q=' + encodeURIComponent(termo), { signal: controller.signal });\n}",
      notes: [ { l: '2', t: 'Sinal que aborta sozinho depois do tempo limite.' }, { l: '5', t: 'AbortSignal.any combina sinais: aborta quando qualquer um abortar. Requer navegador moderno ou Node.js 20+; em ambientes antigos, combine manualmente.' }, { l: '6-10', t: 'fetch não rejeita em respostas 4xx/5xx; transformamos em erro com o status, útil para decidir se vale repetir.' }, { l: '17', t: 'Aborta a busca anterior antes de iniciar a nova.' } ] },
    { title: 'Retry com backoff exponencial e full jitter', lang: 'javascript', code: "const esperar = (ms) => new Promise((r) => setTimeout(r, ms));\n\nfunction ehTransitorio(err) {\n  return err.name === 'TimeoutError' || [429, 502, 503, 504].includes(err.status);\n}\n\nasync function comRetry(fn, { tentativas = 3, baseMs = 200, tetoMs = 5000 } = {}) {\n  for (let i = 0; ; i++) {\n    try {\n      return await fn();\n    } catch (err) {\n      const ultima = i >= tentativas - 1;\n      if (ultima || !ehTransitorio(err)) throw err;\n      const limite = Math.min(tetoMs, baseMs * 2 ** i);\n      await esperar(Math.random() * limite);\n    }\n  }\n}",
      notes: [ { l: '3-5', t: 'Só erros transitórios merecem nova tentativa.' }, { l: '10', t: 'return await dentro do try garante que a rejeição caia no catch desta função.' }, { l: '12-13', t: 'Desiste na última tentativa ou se o erro não for transitório.' }, { l: '14-15', t: 'Full jitter: espera aleatória entre 0 e o limite exponencial, com teto.' } ] },
    { title: 'Pool com limite de concorrência', lang: 'javascript', code: "async function mapComLimite(itens, limite, fn) {\n  const resultados = new Array(itens.length);\n  let proximo = 0;\n\n  async function trabalhador() {\n    while (proximo < itens.length) {\n      const i = proximo++;\n      resultados[i] = await fn(itens[i], i);\n    }\n  }\n\n  const n = Math.min(limite, itens.length);\n  await Promise.all(Array.from({ length: n }, trabalhador));\n  return resultados;\n}",
      notes: [ { l: '2', t: 'Resultados guardados por índice para manter a ordem de entrada.' }, { l: '7', t: 'Ler e incrementar acontece na mesma tarefa síncrona; como o JS roda uma tarefa por vez, dois trabalhadores nunca pegam o mesmo índice.' }, { l: '12-13', t: 'Cria no máximo "limite" trabalhadores; cada um pega o próximo item quando termina o atual.' } ] }
  ],
  bestPractices: ['Defina timeout em toda chamada de rede, inclusive chamadas entre seus próprios serviços.', 'Repita apenas erros transitórios e operações idempotentes; registre cada tentativa em log.', 'Respeite o cabeçalho Retry-After quando a API enviar.', 'Em produção, prefira bibliotecas testadas (p-limit, p-retry) ou recursos do cliente HTTP, e entenda o que elas fazem.', 'Cancele requisições em componentes que desmontam.'],
  mistakes: ['Retry infinito ou sem espera.', 'Repetir requisições não idempotentes sem chave de idempotência.', 'Achar que abortar a requisição desfaz a operação no servidor.', 'Usar Promise.race como timeout e esquecer que a operação continua consumindo recursos.'],
  market: `Esses padrões aparecem em integrações de pagamento, chamadas a APIs de terceiros, filas de processamento e clientes mobile em redes instáveis. Em entrevistas de nível pleno e sênior, é comum pedir para implementar um limitador de concorrência ou explicar uma estratégia de retry.`,
  summary: `Timeout limita a espera; AbortController cancela do lado do cliente; retry com backoff exponencial e jitter só para erros transitórios e operações idempotentes; um pool limita quantas operações rodam ao mesmo tempo.`,
  refs: [REF.abort, REF.abortTimeout, REF.backoff, REF.race],
  cards: [
    { q: 'Abortar uma requisição com AbortController desfaz a operação no servidor?', a: 'Não. Cancela só do lado do cliente; o servidor pode já ter processado.' },
    { q: 'O que é jitter e por que usar?', a: 'Aleatoriedade na espera entre tentativas, para evitar que muitos clientes repitam ao mesmo tempo.' },
    { q: 'Quando é seguro repetir uma operação?', a: 'Em erros transitórios e quando a operação é idempotente ou usa chave de idempotência.' }
  ]
}
];

const H = (s) => s; // marcador visual
const exsets = {
'jsa-01': [
  { id: 'jsa-01-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'O que significa dizer que o JavaScript é single-threaded?', options: ['O navegador e o Node.js usam apenas uma thread para tudo, inclusive rede e disco', 'O seu código JavaScript executa em uma única pilha de chamadas por agente; o host pode fazer trabalho em paralelo', 'Só é possível ter uma operação assíncrona pendente por vez', 'Funções async rodam em outra thread'], answer: 1, explanation: 'O motor executa o seu código em uma pilha por agente (run-to-completion). Rede, disco e timers são tratados pelo host, que pode usar várias threads.' },
  { id: 'jsa-01-e2', type: 'tf', difficulty: 1, points: 5, prompt: '§setTimeout(fn, 0)§ executa §fn§ imediatamente, antes da próxima linha do código.', answer: false, explanation: 'O callback vira uma tarefa e só roda quando a pilha esvaziar e as microtarefas pendentes terminarem.' },
  { id: 'jsa-01-e3', type: 'bug', difficulty: 2, points: 10, prompt: 'Este handler deixa a página travada por alguns segundos a cada clique. Clique na linha que causa o problema.', code: "botao.addEventListener('click', () => {\n  status.textContent = 'Processando...';\n  const inicio = Date.now();\n  while (Date.now() - inicio < 3000) {}\n  status.textContent = 'Pronto';\n});", answer: 4, explanation: 'O laço while ocupa a thread por 3 s: nenhuma renderização acontece, então nem o texto "Processando..." aparece. Trabalho pesado deve ir para um Web Worker ou ser dividido.' },
  { id: 'jsa-01-e4', type: 'open', difficulty: 2, points: 10, prompt: 'Explique, com suas palavras e uma analogia, por que uma requisição de rede não bloqueia a thread principal, mas um laço de cálculo de 3 segundos bloqueia.', model: 'A requisição é delegada ao host (navegador ou Node.js), que espera a resposta fora da pilha do JavaScript; quando ela chega, um callback vai para a fila e roda quando a pilha estiver livre. O laço é código JavaScript síncrono: ele ocupa a própria pilha, então nada mais pode rodar até ele terminar. Analogia: o garçom entrega o pedido à cozinha (não bloqueia) versus o garçom cozinhar sozinho (bloqueia).', rubric: ['Diz que a espera da rede é feita pelo host, fora da pilha', 'Diz que o resultado volta por uma fila/event loop', 'Diz que o laço é código síncrono que ocupa a pilha', 'Usa uma analogia coerente'], explanation: 'Compare sua resposta com o modelo e marque os critérios que você atendeu.' }
],
'jsa-02': [
  { id: 'jsa-02-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual é a saída deste código no navegador?', code: "console.log(1);\nsetTimeout(() => console.log(2), 0);\nPromise.resolve().then(() => console.log(3));\nconsole.log(4);", options: ['1, 2, 3, 4', '1, 4, 2, 3', '1, 4, 3, 2', '1, 3, 4, 2'], answer: 2, explanation: '1 e 4 são síncronos. Ao fim do script, as microtarefas rodam (3). Só depois o timer (2).' },
  { id: 'jsa-02-e2', type: 'match', difficulty: 1, points: 10, prompt: 'Associe cada termo à sua descrição.', pairs: [['Call stack', 'Funções em execução no momento'], ['Fila de tarefas', 'Callbacks de timers e eventos de interface'], ['Fila de microtarefas', 'Esvaziada por completo após cada tarefa'], ['APIs do host', 'Executam timers e I/O fora da pilha']], explanation: 'Esses quatro componentes formam o modelo de execução descrito na aula.' },
  { id: 'jsa-02-e3', type: 'fill', difficulty: 1, points: 5, prompt: 'Complete para agendar uma microtarefa de forma explícita, sem criar uma promise.', code: "[[0]](() => {\n  console.log('rodei como microtarefa');\n});", answers: [['queueMicrotask']], explanation: 'queueMicrotask(fn) agenda fn na fila de microtarefas.' },
  { id: 'jsa-02-e4', type: 'tf', difficulty: 2, points: 5, prompt: 'No módulo principal de um script Node.js, §setTimeout(fn, 0)§ sempre executa antes de §setImmediate(fn)§.', answer: false, explanation: 'Nesse contexto a ordem depende da performance do processo. Dentro de um callback de I/O, setImmediate executa primeiro.' },
  { id: 'jsa-02-e5', type: 'code', difficulty: 2, points: 20, prompt: 'Implemente §executarEmOrdem(log)§. Ela deve agendar trabalho para que, ao final, §log§ contenha §["sync", "micro", "macro"]§: "sync" adicionado na hora, "micro" em uma microtarefa e "macro" em uma tarefa (timer).', lang: 'javascript', starter: "function executarEmOrdem(log) {\n  // seu código aqui\n}\n", tests: [
      { name: 'adiciona "sync" de forma síncrona', code: "const l = [];\nexecutarEmOrdem(l);\nassert.deepEqual(l, ['sync']);" },
      { name: 'microtarefa antes da tarefa', code: "const l = [];\nexecutarEmOrdem(l);\nawait Promise.resolve();\nassert.deepEqual(l, ['sync', 'micro']);" },
      { name: 'ordem final completa', code: "const l = [];\nexecutarEmOrdem(l);\nawait new Promise((r) => setTimeout(r, 20));\nassert.deepEqual(l, ['sync', 'micro', 'macro']);" }
    ], hints: ['Você precisa de três mecanismos: código direto, uma microtarefa e um timer.', 'queueMicrotask(fn) cria uma microtarefa; setTimeout(fn, 0) cria uma tarefa.', 'A ordem em que você agenda não muda a prioridade: microtarefas sempre rodam antes do próximo timer.'],
    solution: "function executarEmOrdem(log) {\n  setTimeout(() => log.push('macro'), 0);\n  queueMicrotask(() => log.push('micro'));\n  log.push('sync');\n}", explanation: 'Mesmo agendado primeiro, o timer roda por último, porque a fila de microtarefas é esvaziada antes da próxima tarefa.' }
],
'jsa-03': [
  { id: 'jsa-03-e1', type: 'tf', difficulty: 1, points: 5, prompt: 'Na convenção do Node.js, o primeiro argumento de um callback assíncrono é o erro (ou §null§).', answer: true, explanation: 'É a convenção error-first: callback(err, resultado).' },
  { id: 'jsa-03-e2', type: 'mc', difficulty: 2, points: 10, prompt: 'O que é "inversão de controle" no contexto de callbacks?', options: ['Chamar uma função antes de declará-la', 'Entregar a continuação do seu programa a um código que você não controla, sem garantia de quando ou quantas vezes ele chamará o callback', 'Usar try/catch em vez de if', 'Trocar a ordem dos argumentos do callback'], answer: 1, explanation: 'Você depende de o código de terceiros chamar seu callback corretamente: uma vez, de forma assíncrona e com os argumentos certos.' },
  { id: 'jsa-03-e3', type: 'bug', difficulty: 2, points: 10, prompt: 'Em caso de erro, este código chama §done§ duas vezes. Clique na linha que precisa ser corrigida.', code: "function lerConfig(caminho, done) {\n  fs.readFile(caminho, 'utf8', (err, texto) => {\n    if (err) {\n      done(err);\n    }\n    done(null, JSON.parse(texto));\n  });\n}", answer: 4, explanation: 'Falta "return" em done(err). Sem ele, a execução continua e chama done de novo com JSON.parse(undefined), que lança erro.' },
  { id: 'jsa-03-e4', type: 'code', difficulty: 3, points: 20, prompt: 'Implemente §promisify(fn)§: recebe uma função no estilo error-first (o último argumento é o callback) e retorna uma função que devolve uma promise.', lang: 'javascript', starter: "function promisify(fn) {\n  // seu código aqui\n}\n", tests: [
      { name: 'cumpre com o resultado', code: "const soma = (a, b, cb) => setTimeout(() => cb(null, a + b), 1);\nassert.equal(await promisify(soma)(2, 3), 5);" },
      { name: 'rejeita com o erro', code: "const falha = (cb) => setTimeout(() => cb(new Error('quebrou')), 1);\nawait assert.rejects(promisify(falha)(), 'quebrou');" },
      { name: 'retorna uma promise', code: "const f = promisify((cb) => cb(null, 1));\nassert.ok(f() instanceof Promise);" }
    ], hints: ['A função retornada deve aceitar qualquer número de argumentos: use (...args).', 'Dentro dela, crie e retorne new Promise((resolve, reject) => ...).', 'Chame fn(...args, callback), onde o callback decide entre reject(err) e resolve(valor).'],
    solution: "function promisify(fn) {\n  return (...args) =>\n    new Promise((resolve, reject) => {\n      fn(...args, (err, valor) => {\n        if (err) reject(err);\n        else resolve(valor);\n      });\n    });\n}", explanation: 'Este é um uso legítimo do construtor de Promise: adaptar uma API de callback. O Node.js oferece util.promisify, que também trata casos especiais.' }
],
'jsa-04': [
  { id: 'jsa-04-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'O que este código imprime?', code: "Promise.resolve(1)\n  .then((x) => { x + 1; })\n  .then((y) => console.log(y));", options: ['2', '1', 'undefined', 'Nada, a promise rejeita'], answer: 2, explanation: 'O primeiro handler usa chaves e não tem return, então retorna undefined.' },
  { id: 'jsa-04-e2', type: 'tf', difficulty: 2, points: 5, prompt: 'Um §then§ registrado em uma promise que já está cumprida executa seu handler de forma síncrona.', answer: false, explanation: 'Reações de promises sempre rodam como microtarefas, mesmo quando a promise já está estabelecida.' },
  { id: 'jsa-04-e3', type: 'fill', difficulty: 1, points: 5, prompt: 'Complete para que o §catch§ trate erros de qualquer etapa e o indicador de carregamento seja escondido em qualquer caso.', code: "carregar()\n  .then(processar)\n  .[[0]]((err) => mostrarErro(err))\n  .[[1]](() => esconderLoading());", answers: [['catch'], ['finally']], explanation: 'catch trata rejeições anteriores; finally roda em sucesso ou falha.' },
  { id: 'jsa-04-e4', type: 'bug', difficulty: 2, points: 10, prompt: 'A função abaixo às vezes "perde" erros e é mais complexa do que precisa. Clique na linha que introduz o antipadrão.', code: "function buscarPerfil(id) {\n  return new Promise((resolve) => {\n    api.get('/perfil/' + id).then((r) => resolve(r.data));\n  });\n}", answer: 2, explanation: 'Antipadrão do construtor explícito: api.get já retorna promise. Se ela rejeitar, ninguém chama reject e o erro se perde. Use: return api.get(...).then((r) => r.data).' },
  { id: 'jsa-04-e5', type: 'code', difficulty: 1, points: 15, prompt: 'Implemente §esperar(ms, valor)§: retorna uma promise que cumpre com §valor§ depois de §ms§ milissegundos.', lang: 'javascript', starter: "function esperar(ms, valor) {\n  // seu código aqui\n}\n", tests: [
      { name: 'cumpre com o valor', code: "assert.equal(await esperar(5, 'ok'), 'ok');" },
      { name: 'espera pelo menos ms', code: "const t = Date.now();\nawait esperar(30);\nassert.ok(Date.now() - t >= 25, 'esperou menos que o pedido');" },
      { name: 'é uma promise', code: "assert.ok(esperar(1) instanceof Promise);" }
    ], hints: ['Use o construtor new Promise.', 'Dentro do executor, chame setTimeout.', 'No callback do timer, chame resolve(valor).'],
    solution: "function esperar(ms, valor) {\n  return new Promise((resolve) => setTimeout(() => resolve(valor), ms));\n}", explanation: 'Adaptar setTimeout é o exemplo clássico de uso correto do construtor. O Node.js também oferece setTimeout em node:timers/promises.' }
],
'jsa-05': [
  { id: 'jsa-05-e1', type: 'match', difficulty: 1, points: 10, prompt: 'Associe cada combinador ao seu comportamento.', pairs: [['Promise.all', 'Rejeita na primeira falha'], ['Promise.allSettled', 'Nunca rejeita; informa o status de cada uma'], ['Promise.race', 'Assume o primeiro resultado, sucesso ou falha'], ['Promise.any', 'Assume o primeiro sucesso']], explanation: 'Veja a tabela da aula.' },
  { id: 'jsa-05-e2', type: 'mc', difficulty: 2, points: 10, prompt: 'Um painel mostra 5 widgets independentes. Se um serviço cair, os outros 4 devem continuar aparecendo. Qual combinador usar?', options: ['Promise.all', 'Promise.allSettled', 'Promise.race', 'Promise.any'], answer: 1, explanation: 'allSettled espera todas e informa sucesso ou falha de cada uma, permitindo exibir o que funcionou.' },
  { id: 'jsa-05-e3', type: 'tf', difficulty: 1, points: 5, prompt: '§Promise.any§ rejeita com um §AggregateError§ quando todas as promises rejeitam.', answer: true, explanation: 'O AggregateError traz o campo errors com todos os motivos.' },
  { id: 'jsa-05-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §meuPromiseAll(itens)§ sem usar §Promise.all§: cumpre com um array de valores **na ordem de entrada**, rejeita na primeira falha, aceita valores que não são promises e cumpre com §[]§ para lista vazia.', lang: 'javascript', starter: "function meuPromiseAll(itens) {\n  // seu código aqui (não use Promise.all)\n}\n", tests: [
      { name: 'mantém a ordem de entrada', code: "const esperar = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));\nassert.deepEqual(await meuPromiseAll([esperar(20, 'a'), esperar(5, 'b'), 'c']), ['a', 'b', 'c']);" },
      { name: 'rejeita na primeira falha', code: "const falha = Promise.reject(new Error('x'));\nfalha.catch(() => {}); // evita aviso de rejeição não tratada se a implementação ignorar a falha\nawait assert.rejects(meuPromiseAll([Promise.resolve(1), falha]), 'x');" },
      { name: 'lista vazia', code: "assert.deepEqual(await meuPromiseAll([]), []);" },
      { name: 'não usa Promise.all', code: "const original = Promise.all;\nPromise.all = () => { throw new Error('Promise.all foi usado'); };\ntry { assert.deepEqual(await meuPromiseAll([1, 2]), [1, 2]); } finally { Promise.all = original; }" }
    ], hints: ['Retorne new Promise((resolve, reject) => ...) e trate a lista vazia logo no início.', 'Use Promise.resolve(item) para tratar valores e promises do mesmo jeito.', 'Guarde cada valor pelo índice e conte quantas terminaram; resolva quando o contador chegar ao total.'],
    solution: "function meuPromiseAll(itens) {\n  return new Promise((resolve, reject) => {\n    const lista = Array.from(itens);\n    const resultados = new Array(lista.length);\n    let restantes = lista.length;\n    if (restantes === 0) return resolve([]);\n    lista.forEach((item, i) => {\n      Promise.resolve(item).then((valor) => {\n        resultados[i] = valor;\n        if (--restantes === 0) resolve(resultados);\n      }, reject);\n    });\n  });\n}", explanation: 'Guardar pelo índice preserva a ordem. Chamar reject mais de uma vez não tem efeito, porque uma promise só se estabelece uma vez.' }
],
'jsa-06': [
  { id: 'jsa-06-e1', type: 'mc', difficulty: 2, points: 10, prompt: '§buscarA()§ e §buscarB()§ são independentes e levam ~1 s cada. Quanto tempo leva o código abaixo?', code: "const a = await buscarA();\nconst b = await buscarB();", options: ['~1 s', '~2 s', '~0 s', 'Depende do número de núcleos da CPU'], answer: 1, explanation: 'buscarB só é chamada depois que buscarA termina. Para ~1 s, use Promise.all([buscarA(), buscarB()]).' },
  { id: 'jsa-06-e2', type: 'bug', difficulty: 2, points: 10, prompt: 'A função retorna antes de os e-mails serem enviados e falhas não são tratadas. Clique na linha do problema.', code: "async function notificar(usuarios) {\n  usuarios.forEach(async (u) => {\n    await enviarEmail(u.email);\n  });\n  return 'enviados';\n}", answer: 2, explanation: 'forEach ignora as promises retornadas pelo callback async. Use for...of com await ou await Promise.all(usuarios.map(...)).' },
  { id: 'jsa-06-e3', type: 'fill', difficulty: 1, points: 5, prompt: 'Complete para executar as duas buscas em paralelo.', code: "const [perfil, pedidos] = [[0]] Promise.[[1]]([buscarPerfil(), buscarPedidos()]);", answers: [['await'], ['all', 'allSettled']], explanation: 'await Promise.all(...) espera as duas; allSettled também é aceito se você quiser tolerar falhas.' },
  { id: 'jsa-06-e4', type: 'code', difficulty: 2, points: 20, prompt: 'Implemente §processarEmSerie(itens, fn)§: chama §fn(item)§ para cada item, **um de cada vez** (nunca dois ao mesmo tempo), e retorna um array com os resultados na ordem.', lang: 'javascript', starter: "async function processarEmSerie(itens, fn) {\n  // seu código aqui\n}\n", tests: [
      { name: 'resultados na ordem', code: "const r = await processarEmSerie([3, 1, 2], async (x) => x * 10);\nassert.deepEqual(r, [30, 10, 20]);" },
      { name: 'nunca executa em paralelo', code: "let ativos = 0, max = 0;\nawait processarEmSerie([1, 2, 3, 4], async () => {\n  ativos++; max = Math.max(max, ativos);\n  await new Promise((r) => setTimeout(r, 5));\n  ativos--;\n});\nassert.equal(max, 1, 'mais de uma execução simultânea');" },
      { name: 'propaga erros', code: "await assert.rejects(processarEmSerie([1], async () => { throw new Error('falhou'); }), 'falhou');" }
    ], hints: ['Use for...of.', 'Dentro do laço, use await fn(item) e guarde o resultado.', 'Não use forEach nem map com Promise.all: eles iniciam tudo junto.'],
    solution: "async function processarEmSerie(itens, fn) {\n  const resultados = [];\n  for (const item of itens) {\n    resultados.push(await fn(item));\n  }\n  return resultados;\n}", explanation: 'for...of com await garante uma execução por vez e preserva a ordem. Erros propagam naturalmente.' },
  { id: 'jsa-06-e5', type: 'open', difficulty: 2, points: 10, prompt: 'Dê um exemplo real em que você deve processar itens em sequência mesmo sendo mais lento que em paralelo. Justifique.', model: 'Exemplos válidos: migrações de banco que dependem da anterior; chamadas a uma API com limite de taxa baixo; operações em que a ordem importa (aplicar eventos de uma conta bancária); passos em que o resultado de um é entrada do próximo (criar usuário e depois criar o perfil com o id gerado).', rubric: ['Apresenta um cenário concreto', 'Justifica por dependência de dados, ordem ou limite de carga', 'Reconhece o custo de desempenho da escolha'], explanation: 'Sequência é escolha consciente: dependência, ordem ou proteção de um recurso.' }
],
'jsa-07': [
  { id: 'jsa-07-e1', type: 'tf', difficulty: 2, points: 5, prompt: 'Chamar §controller.abort()§ em uma requisição §fetch§ garante que o servidor não processou a operação.', answer: false, explanation: 'Abortar cancela do lado do cliente. O servidor pode já ter recebido e processado o pedido.' },
  { id: 'jsa-07-e2', type: 'mc', difficulty: 2, points: 10, prompt: 'Por que adicionar jitter ao backoff exponencial?', options: ['Para deixar o código mais difícil de prever por atacantes', 'Para espalhar as novas tentativas no tempo e evitar que muitos clientes repitam ao mesmo tempo', 'Para garantir que a segunda tentativa sempre funcione', 'Porque Math.random é mais rápido que potência de 2'], answer: 1, explanation: 'Sem jitter, clientes que falharam juntos repetem juntos e sobrecarregam o serviço de novo.' },
  { id: 'jsa-07-e3', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual destes erros NÃO deve disparar um retry automático?', options: ['HTTP 503 Service Unavailable', 'Timeout de rede', 'HTTP 400 Bad Request', 'HTTP 429 Too Many Requests'], answer: 2, explanation: '400 indica erro na requisição: repetir dará o mesmo resultado. Os outros são transitórios.' },
  { id: 'jsa-07-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §comRetry(fn, tentativas)§: chama §fn()§ (que retorna promise) até ela cumprir ou até esgotar §tentativas§ (total de chamadas). Se todas falharem, rejeita com o **último** erro. Use uma espera curta entre tentativas (até 10 ms, para os testes rodarem rápido).', lang: 'javascript', starter: "async function comRetry(fn, tentativas) {\n  // seu código aqui\n}\n", tests: [
      { name: 'sucesso depois de duas falhas', code: "let n = 0;\nconst fn = async () => { n++; if (n < 3) throw new Error('falha ' + n); return 'ok'; };\nassert.equal(await comRetry(fn, 3), 'ok');\nassert.equal(n, 3);" },
      { name: 'desiste e rejeita com o último erro', code: "let n = 0;\nconst fn = async () => { n++; throw new Error('falha ' + n); };\nawait assert.rejects(comRetry(fn, 2), 'falha 2');\nassert.equal(n, 2);" },
      { name: 'não repete quando a primeira dá certo', code: "let n = 0;\nawait comRetry(async () => { n++; return 1; }, 5);\nassert.equal(n, 1);" }
    ], hints: ['Um laço for de 0 até tentativas - 1 resolve.', 'Use try { return await fn(); } catch (err) { ... } dentro do laço.', 'Guarde o erro; se for a última tentativa, lance-o. Senão, espere um pouco (setTimeout em uma promise) e continue.'],
    solution: "async function comRetry(fn, tentativas) {\n  let ultimoErro;\n  for (let i = 0; i < tentativas; i++) {\n    try {\n      return await fn();\n    } catch (err) {\n      ultimoErro = err;\n      if (i < tentativas - 1) {\n        await new Promise((r) => setTimeout(r, Math.random() * Math.min(10, 2 ** i)));\n      }\n    }\n  }\n  throw ultimoErro;\n}", explanation: 'Em produção, adicione: filtro de erros transitórios, teto de espera, respeito a Retry-After e log de cada tentativa.' },
  { id: 'jsa-07-e5', type: 'practice', difficulty: 2, points: 15, prompt: 'Aplique os padrões da aula em um projeto seu (ou no projeto prático do curso).', steps: ['Encontre todas as chamadas de rede e confirme que cada uma tem timeout', 'Adicione cancelamento em buscas disparadas por digitação ou em componentes que desmontam', 'Classifique as operações em idempotentes ou não e só aplique retry nas seguras', 'Limite a concorrência de qualquer processamento em lote', 'Escreva um teste para o cenário de falha de cada dependência'], explanation: 'Exercício prático autoavaliado: marque cada passo concluído.' }
]
};

const assessment = {
  id: 'js-async', courseId: 'js-async', title: 'Avaliação final — JavaScript Assíncrono', passPct: 70, minutes: 40,
  items: [
    { id: 'jsa-av-01', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual a saída?', code: "setTimeout(() => console.log('t'), 0);\nqueueMicrotask(() => console.log('m'));\nconsole.log('s');", options: ['t, m, s', 's, t, m', 's, m, t', 'm, s, t'], answer: 2, explanation: 'Síncrono primeiro, depois microtarefas, depois a tarefa do timer.' },
    { id: 'jsa-av-02', type: 'tf', difficulty: 1, points: 5, prompt: 'Uma função §async§ sempre retorna uma promise.', answer: true, explanation: 'Mesmo que retorne um valor comum, ele é envolvido em uma promise.' },
    { id: 'jsa-av-03', type: 'mc', difficulty: 2, points: 10, prompt: 'Você precisa do primeiro servidor espelho que responder com **sucesso**, ignorando os que falharem. Qual combinador?', options: ['Promise.all', 'Promise.race', 'Promise.any', 'Promise.allSettled'], answer: 2, explanation: 'any assume o primeiro sucesso; race assumiria também a primeira falha.' },
    { id: 'jsa-av-04', type: 'bug', difficulty: 2, points: 10, prompt: 'Clique na linha que faz o próximo §then§ receber §undefined§.', code: "buscarPedido(id)\n  .then((pedido) => {\n    calcularTotal(pedido);\n  })\n  .then((total) => exibir(total));", answer: 3, explanation: 'Falta return calcularTotal(pedido).' },
    { id: 'jsa-av-05', type: 'fill', difficulty: 1, points: 5, prompt: 'Complete com a classe que permite cancelar um §fetch§.', code: "const c = new [[0]]();\nfetch(url, { signal: c.signal });\nc.abort();", answers: [['AbortController']], explanation: 'AbortController gera o signal aceito pelo fetch.' },
    { id: 'jsa-av-06', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a situação ao padrão adequado.', pairs: [['API instável com erros 503 ocasionais', 'Retry com backoff e jitter'], ['Usuário digita uma nova busca', 'Cancelar a requisição anterior'], ['Importar 50.000 registros chamando uma API', 'Limite de concorrência'], ['Dependência que às vezes demora minutos', 'Timeout']], explanation: 'Cada padrão resolve um tipo de falha diferente.' },
    { id: 'jsa-av-07', type: 'tf', difficulty: 2, points: 5, prompt: 'Quando §Promise.all§ rejeita, as demais operações em andamento são canceladas automaticamente.', answer: false, explanation: 'Elas continuam rodando; promises não têm cancelamento embutido.' },
    { id: 'jsa-av-08', type: 'mc', difficulty: 3, points: 10, prompt: 'Em um servidor Node.js, qual é a causa mais provável de todas as requisições ficarem lentas ao mesmo tempo quando um único usuário gera um relatório?', options: ['Falta de async/await na rota do relatório', 'Processamento síncrono pesado bloqueando o event loop', 'Uso de Promise.allSettled', 'Excesso de microtarefas de fetch'], answer: 1, explanation: 'Cálculo síncrono longo ocupa a única pilha do processo e impede o atendimento das outras requisições.' },
    { id: 'jsa-av-09', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual operação é segura para retry automático sem medidas extras?', options: ['POST que cria um pagamento', 'GET que lê o saldo', 'POST que envia um e-mail', 'DELETE sem verificação de estado em um sistema que reaproveita ids'], answer: 1, explanation: 'Leituras são idempotentes. As demais podem duplicar efeitos sem uma chave de idempotência.' },
    { id: 'jsa-av-10', type: 'tf', difficulty: 1, points: 5, prompt: '§array.forEach(async (x) => await f(x))§ espera todas as chamadas de §f§ terminarem antes de seguir.', answer: false, explanation: 'forEach ignora as promises retornadas.' }
  ]
};

const project = {
  id: 'agregador-cotacoes', name: 'Agregador de cotações resiliente', lv: 'M', courseId: 'js-async', stack: 'JavaScript (navegador ou Node.js 18+)', ds: ['js'],
  desc: 'Um serviço consulta várias fontes de cotação de moedas. Algumas são lentas, outras falham. O agregador precisa responder rápido, com o que conseguir, sem sobrecarregar as fontes.',
  rf: ['Receber uma lista de fontes (funções assíncronas que retornam { moeda, valor })', 'Consultar no máximo N fontes ao mesmo tempo', 'Aplicar timeout por fonte', 'Repetir fontes com falha até um número de tentativas', 'Retornar resultados válidos e a lista de falhas, na ordem das fontes'],
  rnf: ['Nunca rejeitar por falha de uma fonte isolada', 'Tempo total previsível (timeout × tentativas, com concorrência)', 'Código sem dependências externas', 'Funções pequenas e testáveis'],
  ac: ['Todos os testes automatizados do laboratório passam', 'Uma fonte lenta não atrasa o resultado além do timeout', 'Com concorrência 2, nunca há mais de 2 fontes em execução', 'Falhas aparecem em "falhas" com o índice e a mensagem'],
  ch: ['Combinar timeout com retry sem duplicar código', 'Manter a ordem dos resultados com execução concorrente', 'Extensão: em Node.js, trocar as fontes simuladas por APIs reais com fetch e AbortSignal.timeout'],
  lab: { lang: 'javascript',
    prompt: 'Implemente §agregarCotacoes(fontes, { concorrencia, timeoutMs, tentativas })§. Retorne §{ resultados, falhas }§, onde §resultados[i]§ é o valor da fonte i (ou §null§ se falhou) e §falhas§ é uma lista de §{ indice, erro }§ com a mensagem do último erro.',
    starter: "async function agregarCotacoes(fontes, { concorrencia = 2, timeoutMs = 100, tentativas = 2 } = {}) {\n  // dica: reaproveite as ideias de comRetry, timeout com Promise.race e o pool da aula 7\n}\n",
    tests: [
      { name: 'retorna resultados na ordem', code: "const f = (v, ms) => () => new Promise((r) => setTimeout(() => r(v), ms));\nconst { resultados, falhas } = await agregarCotacoes([f('USD', 20), f('EUR', 5)], { concorrencia: 2, timeoutMs: 100, tentativas: 1 });\nassert.deepEqual(resultados, ['USD', 'EUR']);\nassert.deepEqual(falhas, []);" },
      { name: 'aplica timeout por fonte', code: "const lenta = () => new Promise((r) => setTimeout(() => r('X'), 300));\nconst t = Date.now();\nconst { resultados, falhas } = await agregarCotacoes([lenta], { timeoutMs: 30, tentativas: 1 });\nassert.ok(Date.now() - t < 200, 'não respeitou o timeout');\nassert.deepEqual(resultados, [null]);\nassert.equal(falhas.length, 1);\nassert.equal(falhas[0].indice, 0);" },
      { name: 'repete fontes com falha', code: "let n = 0;\nconst instavel = async () => { n++; if (n < 2) throw new Error('instável'); return 'BRL'; };\nconst { resultados } = await agregarCotacoes([instavel], { tentativas: 3, timeoutMs: 50 });\nassert.deepEqual(resultados, ['BRL']);" },
      { name: 'respeita o limite de concorrência', code: "let ativos = 0, max = 0;\nconst f = () => async () => { ativos++; max = Math.max(max, ativos); await new Promise((r) => setTimeout(r, 10)); ativos--; return 1; };\nawait agregarCotacoes([f(), f(), f(), f(), f()], { concorrencia: 2, timeoutMs: 100, tentativas: 1 });\nassert.ok(max <= 2, 'máximo simultâneo: ' + max);" },
      { name: 'registra a mensagem do último erro', code: "let n = 0;\nconst ruim = async () => { n++; throw new Error('erro ' + n); };\nconst { falhas } = await agregarCotacoes([ruim], { tentativas: 2, timeoutMs: 50 });\nassert.equal(falhas[0].erro, 'erro 2');" }
    ] }
};

const course = {
  id: 'js-async', disciplineId: 'js', areaId: 'front', status: 'published', version: 1, updatedAt: NOW,
  title: 'JavaScript Assíncrono: do event loop aos padrões de produção',
  description: 'Curso completo sobre o modelo de execução do JavaScript, callbacks, promises, async/await e os padrões que tornam código assíncrono confiável em produção: timeout, cancelamento, retry e limite de concorrência. Vale para navegador, Node.js, React, Next.js e React Native.',
  objectives: ['Explicar o modelo de execução do JavaScript e prever a ordem de execução de código assíncrono', 'Escrever e encadear promises com tratamento de erros correto', 'Usar async/await com execução sequencial ou paralela conforme o caso', 'Aplicar timeout, cancelamento, retry e limite de concorrência em código de produção'],
  level: 'M', prereqs: ['Variáveis, funções, arrays e objetos em JavaScript', 'Noções de HTTP (requisição e resposta)'], hours: 14,
  syllabus: 'Modelo de execução e event loop (navegador e Node.js); tarefas e microtarefas; callbacks e a convenção error-first; promises: estados, encadeamento e erros; combinadores all, allSettled, race e any; async/await; padrões de produção: timeout, AbortController, retry com backoff e jitter, limite de concorrência.',
  versions: 'Recursos por versão da especificação ECMAScript: Promises (ES2015), async/await (ES2017), Promise.allSettled (ES2020), Promise.any e AggregateError (ES2021), top-level await (ES2022), Promise.withResolvers (ES2024). Exemplos de Node.js consideram a versão 18 ou superior; AbortSignal.any requer Node.js 20 ou superior.',
  skills: ['Event loop', 'Promises', 'async/await', 'Tratamento de erros assíncronos', 'Resiliência (timeout, retry, cancelamento)', 'Concorrência controlada'],
  modules: [
    { id: 'm1', title: 'Fundamentos da assincronia', lessons: ['jsa-01', 'jsa-02', 'jsa-03'] },
    { id: 'm2', title: 'Promises', lessons: ['jsa-04', 'jsa-05'] },
    { id: 'm3', title: 'async/await e produção', lessons: ['jsa-06', 'jsa-07'] }
  ],
  materials: [REF.flanagan, REF.usingPromises, REF.nodeLoop, REF.htmlLoop],
  projectIds: ['agregador-cotacoes'],
  supplement: {
    glossary: lessons.flatMap((l) => l.concepts || []).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i),
    cheatsheet: `### Ordem de execução
Código síncrono → microtarefas (callbacks de §then§/§catch§/§finally§, §await§, §queueMicrotask§) → tarefas (§setTimeout§, eventos, I/O).

### Promises
§new Promise((resolve, reject) => ...)§ · §p.then(ok).catch(erro).finally(limpeza)§ · todo §then§ devolve uma nova promise · um §throw§ dentro do §then§ vira rejeição · devolva a promise interna com §return§ para encadear.

### Combinadores
| Método | Resolve quando | Rejeita quando |
|---|---|---|
| §Promise.all§ | todas resolvem | a primeira rejeita |
| §Promise.allSettled§ | todas terminam | nunca |
| §Promise.race§ | a primeira termina (valor ou erro) | a primeira termina com erro |
| §Promise.any§ | a primeira resolve | todas rejeitam (§AggregateError§) |

### async/await
§async§ sempre devolve uma promise · §await§ pausa só a função, não a thread · paralelo: §await Promise.all([a(), b()])§ · série: §for (const x of l) await f(x)§ · erros: §try/catch§.

### Produção
Timeout: §AbortSignal.timeout(ms)§ · cancelamento: §AbortController§ · retry: backoff exponencial com jitter, só para erros transitórios · concorrência limitada: um pool com N operações ativas por vez.`,
    mistakes: ['Esquecer o return dentro do then e quebrar o encadeamento.', 'Criar promises sem catch e deixar rejeições não tratadas.', 'await dentro de forEach (o forEach não espera).', 'Usar await em série quando as chamadas são independentes.', 'Achar que setTimeout(fn, 0) executa na hora.', 'Fazer retry de erros permanentes (400, 404) ou sem backoff.', 'Achar que abort() desfaz o efeito no servidor.', 'Bloquear a thread principal com laço síncrono pesado.'],
    prereqMap: `**Antes deste curso:** variáveis, funções, arrays e objetos em JavaScript, e noções de HTTP (requisição e resposta). O curso JavaScript: fundamentos, DOM e módulos cobre a base.

| Este curso prepara para | Por quê |
|---|---|
| Node.js e APIs | todo I/O do servidor é assíncrono |
| React e Next.js | carregamento de dados, efeitos e cancelamento usam estes padrões |
| Testes automatizados | testar código assíncrono exige entender a ordem de execução |

Ordem interna: aulas 1 a 3 (modelo de execução, callbacks) → 4 e 5 (promises) → 6 e 7 (async/await e padrões de produção).`,
    officialRefs: [REF.execModel, REF.usingPromises, REF.microtask, REF.htmlLoop, REF.nodeLoop, REF.all, REF.allSettled, REF.asyncFn, REF.abort],
    practice: ['Preveja, antes de rodar, a ordem de saída de um script que mistura console.log, setTimeout, Promise e queueMicrotask.', 'Converta uma função com callback error-first em promise com util.promisify e depois à mão.', 'Busque três APIs públicas em paralelo com Promise.allSettled e mostre sucessos e falhas.', 'Escreva comRetry com backoff e jitter e teste com uma função que falha duas vezes.', 'No projeto Agregador de cotações, adicione cancelamento com AbortController.']
  }
};

function fix(o) { if (typeof o === 'string') return o.replace(/§/g, '`'); if (Array.isArray(o)) return o.map(fix); if (o && typeof o === 'object') { const r = {}; for (const k in o) r[k] = fix(o[k]); return r; } return o; }
export const PILOT = fix({
  course,
  lessons: lessons.map((l) => ({ techVersions: course.versions, ...l, courseId: 'js-async', status: 'published', version: 1, updatedAt: NOW })),
  exsets: Object.fromEntries(Object.entries(exsets).map(([k, v]) => [k, { lessonId: k, items: v }])),
  assessment, project
});
