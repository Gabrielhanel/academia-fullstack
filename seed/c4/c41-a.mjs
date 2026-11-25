// C4.1 — Node.js e Express. Aulas 1 a 3 (runtime e event loop; módulos e npm; Express: roteamento e Express 5).
const R = String.raw;

export const REF = {
  eventLoop: { title: 'Node.js — The Node.js Event Loop', url: 'https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick', kind: 'doc' },
  dontBlock: { title: 'Node.js — Don\'t Block the Event Loop', url: 'https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop', kind: 'doc' },
  esm: { title: 'Node.js — ECMAScript modules', url: 'https://nodejs.org/api/esm.html', kind: 'doc' },
  modules: { title: 'Node.js — Modules: CommonJS modules', url: 'https://nodejs.org/api/modules.html', kind: 'doc' },
  packages: { title: 'Node.js — Modules: Packages', url: 'https://nodejs.org/api/packages.html', kind: 'doc' },
  packageJson: { title: 'npm — package.json', url: 'https://docs.npmjs.com/cli/v11/configuring-npm/package-json', kind: 'doc' },
  semver: { title: 'Semantic Versioning 2.0.0', url: 'https://semver.org/', kind: 'especificação' },
  npmCi: { title: 'npm — npm ci', url: 'https://docs.npmjs.com/cli/v11/commands/npm-ci', kind: 'doc' },
  expressRouting: { title: 'Express — Routing', url: 'https://expressjs.com/en/guide/routing.html', kind: 'doc' },
  expressMigrating5: { title: 'Express — Migrating to Express 5', url: 'https://expressjs.com/en/guide/migrating-5.html', kind: 'doc' },
  expressMiddleware: { title: 'Express — Using middleware', url: 'https://expressjs.com/en/guide/using-middleware.html', kind: 'doc' },
  expressWriteMiddleware: { title: 'Express — Writing middleware', url: 'https://expressjs.com/en/guide/writing-middleware.html', kind: 'doc' },
  expressErrors: { title: 'Express — Error handling', url: 'https://expressjs.com/en/guide/error-handling.html', kind: 'doc' },
  expressApi: { title: 'Express — API reference', url: 'https://expressjs.com/en/5x/api.html', kind: 'doc' }
};

export const lessonsA = [
{
  id: 'nex-01', moduleId: 'm1', order: 1, minutes: 75, tags: ['Node.js', 'event loop', 'assincronia', 'nextTick', 'bloqueio', 'worker threads'],
  title: 'O runtime do Node.js e o event loop: o que roda quando, e o que nunca se deve bloquear',
  objectives: ['Explicar o modelo de uma thread de JavaScript com E/S assíncrona do Node.js', 'Prever a ordem entre código síncrono, nextTick, promises, timers e setImmediate', 'Medir o efeito de um laço síncrono em todas as outras requisições', 'Distinguir tarefas de CPU de tarefas de E/S e escolher onde executá-las', 'Detectar bloqueio com a medição do atraso do event loop'],
  intro: R`O Node.js executa seu JavaScript em **uma única thread** e, ainda assim, atende milhares de conexões: ele **delega a espera** (rede, disco, timers) ao sistema e **volta para o seu código** quando algo termina. Essa ideia, o **event loop**, explica por que o Node é ótimo para APIs (muita E/S, pouca CPU) e por que **um único laço pesado** deixa **todos** os usuários esperando. Aqui você **mede** os dois fatos no **Node.js 26.13.1**.`,
  theory: R`### O modelo
- **Uma thread de JavaScript** executa o seu código (a *call stack*). Enquanto ela está ocupada, **nada mais do seu código roda**.
- **E/S não bloqueante**: operações como ler um socket ou arquivo são entregues ao sistema operacional (e a uma pequena **thread pool** da libuv para o que não tem versão assíncrona nativa, como parte do sistema de arquivos e o DNS). Quando terminam, um **callback** é colocado em fila.
- O **event loop** é o laço que **pega callbacks prontos e os executa**, um de cada vez, **até o fim**. Não há preempção: **o código roda até terminar**.
Consequência: o Node escala em **conexões** (esperando E/S) e **não escala em CPU** dentro de uma thread.

### As fases (resumo)
O laço passa repetidamente por fases: **timers** (§setTimeout§/§setInterval§ vencidos), **callbacks de E/S pendentes**, **poll** (espera e processa E/S), **check** (§setImmediate§) e **close callbacks**. Entre as operações, o Node esvazia duas filas de **prioridade maior**: a de **§process.nextTick§** e a de **microtarefas** (promises, §queueMicrotask§).

### A ordem, medida
Em um módulo **CommonJS**, executando três vezes, o código imprimiu:
**código síncrono → nextTick → promise.then → (setTimeout 0 e setImmediate)**.
- **§nextTick§ vem antes de §promise.then§** em CommonJS. No **módulo ES (ESM)** da mesma experiência, a ordem foi **promise.then antes de nextTick**, porque o próprio código do módulo ESM já roda dentro de uma microtarefa.
- **§setTimeout(fn, 0)§ x §setImmediate§** no **módulo principal** é **não determinístico**: nas três execuções saíram duas ordens diferentes (**setImmediate → setTimeout** duas vezes e **setTimeout → setImmediate** uma vez), pois depende do tempo que o processo levou para entrar no laço.
- **Dentro de um callback de E/S**, a ordem é **determinística**: **§setImmediate§ sempre antes de §setTimeout 0§** (visto nas três execuções), porque a fase *check* vem logo depois do *poll*.
Moral: **não escreva código que dependa dessa ordem** (exceto o fato garantido: **síncrono, depois microtarefas, depois macrotarefas**), mas **entenda-a** para depurar.
Cuidado com **§nextTick§ recursivo**: ele **impede** o laço de avançar (fome de E/S). Prefira §setImmediate§ ou §queueMicrotask§ para ceder o controle.

### O bloqueio, medido
Servidor Express em um processo e **cliente em outro** (para o cliente não ser bloqueado junto). A rota §/bloqueia§ executa um **laço síncrono de 600 ms**.
- Com uma requisição lenta em andamento, uma requisição à rota **§/rapida§**, enviada 50 ms depois, **levou 558 ms** (esperou o laço terminar); o **atraso máximo do event loop** medido no servidor foi **605 ms**.
- Movendo o cálculo para uma **worker thread**, a §/rapida§ levou **5 ms** e o atraso máximo do loop foi **12 ms**. A requisição lenta levou **913 ms** (e não 600): **iniciar o worker** (carregar o módulo, Express incluído) custa tempo; para uso frequente use um **pool de workers** reutilizados.
(**Uma máquina, uma execução** por caso; a forma importa mais que os milissegundos.)

### Medir o atraso do event loop
§perf_hooks.monitorEventLoopDelay({ resolution: 10 })§ devolve um histograma do **atraso** dos timers: com o loop saudável fica em **poucos ms**; valores de **centenas de ms** denunciam código bloqueante. É uma **métrica de produção** essencial (aula nex-07).

### O que bloqueia
- **Laços longos** e cálculos (criptografia síncrona, §JSON.parse§/§JSON.stringify§ de **objetos enormes**, regex catastróficas, ordenação de milhões de itens).
- **APIs síncronas** do Node: §fs.readFileSync§, §crypto.pbkdf2Sync§, §child_process.execSync§ (aceitáveis **na inicialização**, **nunca** no caminho das requisições).
- **Loops de §await§** sobre tarefas independentes não bloqueiam o loop, mas **serializam** o trabalho (use §Promise.all§).

### O que fazer
- **Tarefa de E/S**: use as versões assíncronas e deixe o loop trabalhar.
- **Tarefa de CPU**: **worker threads** (aula nex-06), **processos filhos** ou **fila de jobs** em outro serviço (curso de filas), ou **dividir o trabalho** em pedaços cedendo o controle (§setImmediate§).
- **Escalar o servidor**: vários **processos** (um por núcleo, com *cluster* ou o orquestrador do contêiner) multiplicam a capacidade, mas **não consertam** um handler bloqueante.

### Modelos de concorrência: comparação rápida
Threads por requisição (Java clássico, PHP-FPM): isolam, **custam memória** e contexto. Event loop (Node, Nginx): **barato por conexão**, frágil a **CPU**. Corrotinas (Go, Kotlin): **leves**, preemptivas ou cooperativas conforme o runtime. A escolha do Node é ótima para **APIs de E/S**, **gateways**, **tempo real**; **inadequada** para processamento pesado **dentro do mesmo processo**.`,
  concepts: [
    { term: 'Event loop', def: 'Laço que executa callbacks prontos, um de cada vez, na thread de JavaScript.' },
    { term: 'E/S não bloqueante', def: 'Operação de entrada e saída delegada ao sistema, com callback quando termina.' },
    { term: 'Call stack', def: 'Pilha de chamadas da thread de JavaScript; enquanto está ocupada, nada mais roda.' },
    { term: 'Microtarefa', def: 'Callback de promise ou queueMicrotask, executado antes de voltar ao laço.' },
    { term: 'process.nextTick', def: 'Fila de maior prioridade, esvaziada antes das microtarefas em CommonJS.' },
    { term: 'setImmediate', def: 'Agenda um callback para a fase check do laço, logo após a E/S.' },
    { term: 'Thread pool da libuv', def: 'Pequeno conjunto de threads que executa operações sem versão assíncrona nativa.' },
    { term: 'Atraso do event loop', def: 'Tempo extra que um timer espera por o loop estar ocupado.' },
    { term: 'Worker thread', def: 'Thread adicional com seu próprio JavaScript, para tarefas de CPU.' },
    { term: 'Código bloqueante', def: 'Código síncrono demorado que impede o loop de atender outras tarefas.' }
  ],
  examples: R`**Analogia:** o Node é **um garçom muito rápido atendendo um salão inteiro**: ele anota o pedido, entrega à cozinha (E/S) e **segue para a próxima mesa**; quando o prato fica pronto, serve. Funciona porque ele **nunca fica parado esperando**. Um **laço síncrono de 600 ms** é o garçom **parar para descascar uma saca de batatas** no meio do salão: **todas as mesas** esperam. A **worker thread** é **chamar um ajudante na cozinha** para descascar.

**Exemplo 1: ordem.** Síncrono → nextTick → promise → timers/immediate (CommonJS).

**Exemplo 2: bloqueio.** A rota rápida esperou 558 ms; com o worker, 5 ms.

**Exemplo 3: monitor.** Atraso máximo do loop: 605 ms (bloqueado) e 12 ms (com worker).`,
  code: [
    { title: 'Ordem das tarefas (CommonJS, saída de três execuções)', lang: 'js', code: R`const a = [];
setTimeout(() => a.push('setTimeout 0'), 0);
setImmediate(() => a.push('setImmediate'));
process.nextTick(() => a.push('nextTick'));
Promise.resolve().then(() => a.push('promise.then'));
a.push('código síncrono');
setTimeout(() => console.log(a.join(' -> ')), 50);
// código síncrono -> nextTick -> promise.then -> setImmediate -> setTimeout 0   (ou setTimeout 0 -> setImmediate, conforme a execução)`, notes: [{ l: '4', t: 'nextTick tem prioridade sobre as promises em CommonJS.' }, { l: '8', t: 'No módulo principal, timer 0 x immediate não é determinístico.' }] },
    { title: 'Bloqueio e worker (JavaScript com Express e worker_threads)', lang: 'js', code: R`import express from 'express';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';
if (!isMainThread) { const t = Date.now(); while (Date.now() - t < workerData.ms) {} parentPort.postMessage(workerData.ms); process.exit(0); }

const app = express();
app.get('/rapida', (req, res) => res.json({ ok: true }));
app.get('/bloqueia', (req, res) => { const t = Date.now(); while (Date.now() - t < 600) {} res.json({ ok: true }); });   // trava o loop
app.get('/worker', async (req, res) => {
  await new Promise((ok, no) => { const w = new Worker(fileURLToPath(import.meta.url), { workerData: { ms: 600 } }); w.once('message', ok); w.once('error', no); });
  res.json({ ok: true });                                                                                                // o loop continua livre
});
app.listen(3000);`, notes: [{ l: '8', t: 'O laço síncrono ocupa a única thread de JavaScript.' }, { l: '10', t: 'O trabalho vai para outra thread; o loop atende outras requisições.' }] },
    { title: 'Medindo o atraso do event loop (JavaScript, perf_hooks)', lang: 'js', code: R`import { monitorEventLoopDelay } from 'node:perf_hooks';
const h = monitorEventLoopDelay({ resolution: 10 });
h.enable();
// ... tráfego ...
console.log('atraso máximo (ms):', h.max / 1e6, '| p99 (ms):', h.percentile(99) / 1e6);
h.reset();`, notes: [{ l: '2', t: 'Amostra o atraso de um timer a cada 10 ms.' }, { l: '5', t: 'Os valores vêm em nanossegundos.' }] }
  ],
  bestPractices: ['Mantenha as rotas livres de laços síncronos e de APIs ...Sync.', 'Mova tarefas de CPU para workers, filas ou outros serviços.', 'Meça o atraso do event loop em produção e alerte.', 'Use Promise.all para tarefas independentes.', 'Nunca escreva código que dependa da ordem entre setTimeout 0 e setImmediate no módulo principal.', 'Evite nextTick recursivo.'],
  mistakes: ['Achar que async/await torna o código de CPU não bloqueante.', 'Usar readFileSync ou pbkdf2Sync dentro de handlers.', 'Testar bloqueio com cliente e servidor no mesmo processo.', 'Criar um worker a cada requisição, pagando o custo de partida.', 'Escalar com mais processos sem consertar o handler bloqueante.', 'Depender da ordem timer x immediate.'],
  market: R`"Por que o Node é single-thread e ainda assim rápido?" e "como você evita bloquear o event loop?" são perguntas de entrevista recorrentes, e o bloqueio por CPU é uma causa clássica de lentidão e de quedas em produção.`,
  summary: R`O Node executa JavaScript em uma thread e delega a E/S; o event loop roda um callback de cada vez. Em CommonJS a ordem foi síncrono, nextTick, promise.then, depois timers/immediate (não determinístico no módulo principal; setImmediate primeiro dentro de E/S). Um laço de 600 ms atrasou a rota rápida em 558 ms (loop atrasado em 605 ms); com worker, 5 ms (12 ms). Meça com monitorEventLoopDelay e mova CPU para workers ou filas.`,
  refs: [REF.eventLoop, REF.dontBlock],
  cards: [
    { q: 'Quantas threads executam o seu JavaScript no Node?', a: 'Uma; a E/S é delegada ao sistema e às threads da libuv.' },
    { q: 'O que bloqueia o event loop?', a: 'Código síncrono demorado (laços, APIs ...Sync, JSON gigante, regex catastrófica).' },
    { q: 'Qual a ordem garantida?', a: 'Código síncrono, depois microtarefas (e nextTick), depois macrotarefas como timers e setImmediate.' },
    { q: 'Como detectar bloqueio?', a: 'Com monitorEventLoopDelay: atraso de centenas de ms indica bloqueio.' },
    { q: 'Como tratar uma tarefa de CPU?', a: 'Worker threads (de preferência em pool), processo filho ou fila de jobs em outro serviço.' }
  ]
},
{
  id: 'nex-02', moduleId: 'm1', order: 2, minutes: 70, tags: ['módulos', 'ESM', 'CommonJS', 'npm', 'package.json', 'semver', 'lockfile'],
  title: 'Módulos (ESM e CommonJS) e npm: package.json, versões e dependências reproduzíveis',
  objectives: ['Diferenciar ESM e CommonJS e escolher entre eles, com "type" e extensões', 'Usar require de módulos ESM, import() dinâmico e await no topo', 'Ler e escrever um package.json com scripts, exports e engines', 'Aplicar semver (^, ~) e o package-lock.json para instalações reproduzíveis', 'Reduzir riscos da cadeia de suprimentos de dependências'],
  intro: R`Todo projeto Node é, antes de tudo, **um conjunto de módulos e dependências**. Duas formas de módulo convivem (**CommonJS** e **ESM**), o **npm** instala pacotes por **versões** e o **package.json** define como o projeto se comporta. Executamos os cenários no **Node 26.13.1**: o que acontece com o mesmo §.js§ conforme o §"type"§, §require§ de ESM, e §__dirname§ no ESM.`,
  theory: R`### Dois sistemas de módulos
| | **CommonJS (CJS)** | **ESM (ES Modules)** |
|---|---|---|
| Sintaxe | §const x = require('x')§; §module.exports§ | §import x from 'x'§; §export§ |
| Carregamento | **síncrono**, em tempo de execução | **assíncrono**, análise estática |
| §await§ no topo | não | **sim** |
| §__dirname§/§__filename§ | existem | **não existem** (use §import.meta.url§) |
| Extensão obrigatória nos imports relativos | não | **sim** (§./lib.mjs§, §./lib.js§) |
O ESM é o padrão da linguagem (e dos navegadores); o CJS é o legado do Node, ainda onipresente.

### Como o Node decide: extensão e "type"
- §.mjs§ → sempre **ESM**; §.cjs§ → sempre **CJS**.
- §.js§ → depende do **§"type"§** do package.json mais próximo: ausente ou §"commonjs"§ = CJS; §"module"§ = ESM.
Medido: o **mesmo arquivo §.js§** foi tratado como **CommonJS** sem §"type"§ (§require§ definido) e como **ESM** com §"type": "module"§ (§require§ **não definido**).
Recomendação para projetos novos: **§"type": "module"§** (ESM), §.cjs§ para o que precisar ser CommonJS.

### Interoperabilidade (medida no Node 26.13.1)
- **§require()§ de um módulo ESM** (sem await no topo) **funciona**: devolveu o objeto com as exportações (§soma(2, 3)§ = **5**, §default§ = §'padrao'§). Em versões antigas do Node isso dava erro; **confirme a versão** do seu runtime.
- **§import()§ dinâmico** funciona em **CJS** e em ESM (devolve uma **promise**): §soma(1, 1)§ = **2**.
- **§await§ no topo** do módulo ESM: funcionou (**42**).
- **§__dirname§ no ESM**: **ReferenceError: __dirname is not defined**. Use §import.meta.dirname§ (Node recente) ou §fileURLToPath(new URL('.', import.meta.url))§.
- Em ESM, para usar §require§ (por exemplo, ler JSON): §createRequire(import.meta.url)§ (medido: devolveu uma função §require§ funcional) ou §import dados from './x.json' with { type: 'json' }§.

### package.json: o essencial
§§§
{
  "name": "api-pedidos", "version": "1.0.0", "private": true, "type": "module",
  "engines": { "node": ">=22" },
  "scripts": { "dev": "node --watch src/index.js", "start": "node src/index.js", "test": "node --test" },
  "dependencies": { "express": "5.3.0" },
  "devDependencies": { "supertest": "7.3.2" }
}
§§§
- §dependencies§ (precisa em produção) x §devDependencies§ (só para desenvolver/testar); §peerDependencies§ para plugins.
- §scripts§: §npm run <nome>§ (§start§ e §test§ têm atalhos: §npm start§, §npm test§).
- §engines§ **declara** a versão suportada (avisa, não impede por padrão).
- §exports§ define **o que o pacote expõe** (e restringe imports internos); §main§ é o legado.
- §private: true§ evita publicar por engano.

### Versões: semver e o lockfile
**Semantic Versioning**: §MAJOR.MINOR.PATCH§ (quebra, recurso compatível, correção). Intervalos: §^1.2.3§ aceita **1.x.x ≥ 1.2.3** (não muda o major); §~1.2.3§ aceita **1.2.x**; sem prefixo, **versão exata**. O **§package-lock.json§** grava a **árvore exata resolvida** (versão e hash de integridade de cada pacote): **commite-o**.
- §npm install§: respeita o lock, pode **atualizá-lo**; §npm ci§: instala **exatamente** o lock, **falha** se divergir do package.json e **apaga** §node_modules§ antes (ideal para **CI e Docker**).
- §npm update§ atualiza dentro dos intervalos; §npm outdated§ lista o que há de novo.
Neste curso, **os laboratórios fixam versões exatas** (por exemplo, Express **5.3.0**), pois o resultado medido depende delas.

### Cadeia de suprimentos
Cada dependência traz **código de terceiros** e as **dependências delas**:
- §npm audit§ consulta vulnerabilidades conhecidas (**não executado** neste laboratório);
- **menos dependências** = menos risco; prefira as **mantidas e populares**; leia o que instala;
- **scripts de instalação** (§postinstall§) executam código: considere §--ignore-scripts§ em CI quando possível;
- **fixe versões** e use **o lockfile**; revise as **atualizações automáticas** (Dependabot/Renovate);
- **nomes parecidos** (*typosquatting*) enganam: confira o nome e o autor.
(Descrito a partir da documentação; as proteções e a auditoria **não foram executadas** aqui.)

### Estrutura de projeto
§src/§ (código), §test/§, §package.json§, §package-lock.json§, §.gitignore§ (com §node_modules/§ e §.env§), §.env.example§ (sem segredos). Separe **configuração** (variáveis de ambiente) do código.`,
  concepts: [
    { term: 'CommonJS', def: 'Sistema de módulos original do Node, com require e module.exports, síncrono.' },
    { term: 'ES Modules (ESM)', def: 'Sistema de módulos padrão da linguagem, com import e export, assíncrono e estático.' },
    { term: '"type" no package.json', def: 'Campo que define se os arquivos .js do pacote são CommonJS ou ESM.' },
    { term: 'import() dinâmico', def: 'Expressão que carrega um módulo em tempo de execução e devolve uma promise.' },
    { term: 'package.json', def: 'Manifesto do projeto com nome, versão, scripts, dependências e configurações.' },
    { term: 'Semver', def: 'Convenção MAJOR.MINOR.PATCH para comunicar compatibilidade.' },
    { term: 'package-lock.json', def: 'Registro da árvore exata de dependências resolvidas, com hashes de integridade.' },
    { term: 'npm ci', def: 'Instalação limpa e reproduzível a partir do lockfile.' },
    { term: 'exports', def: 'Campo do package.json que define os pontos de entrada públicos de um pacote.' },
    { term: 'Typosquatting', def: 'Ataque que publica pacotes com nomes parecidos com os de pacotes populares.' }
  ],
  examples: R`**Analogia:** o **package.json** é a **lista de compras com receita** do projeto; o **package-lock.json** é o **recibo** que registra exatamente **quais marcas e lotes** foram comprados, para a cozinha de outra pessoa repetir **o mesmo prato**. O **semver** é o **rótulo de embalagem**: mudança de patch é "mesma receita, tampa nova"; de major é "mudamos a receita". CommonJS e ESM são **dois idiomas** que se entendem com **intérpretes** (import dinâmico, createRequire).

**Exemplo 1: o mesmo .js.** CommonJS sem "type"; ESM com "type": "module".

**Exemplo 2: interop.** require de ESM devolveu 5; import() em CJS devolveu 2.

**Exemplo 3: __dirname.** No ESM: ReferenceError.`,
  code: [
    { title: 'Interoperabilidade e __dirname (JavaScript, saída medida no Node 26.13.1)', lang: 'js', code: R`// lib.mjs
export const soma = (a, b) => a + b; export default 'padrao';

// usa-cjs.cjs
const m = require('./lib.mjs');                          // funciona se o módulo não usa await no topo
console.log(m.soma(2, 3), m.default);                    // 5 padrao
import('./lib.mjs').then((x) => console.log(x.soma(1, 1)));   // 2

// top.mjs
const x = await Promise.resolve(42);                     // await no topo: 42
try { console.log(__dirname); } catch (e) { console.log(e.name + ': ' + e.message); }   // ReferenceError: __dirname is not defined
console.log(import.meta.dirname);                        // alternativa no ESM`, notes: [{ l: '5', t: 'require() de ESM síncrono é aceito no Node recente.' }, { l: '9', t: 'await no topo só existe em ESM.' }, { l: '11', t: 'No ESM use import.meta.dirname ou import.meta.url.' }] },
    { title: 'Um package.json de API com scripts e engines (JSON)', lang: 'json', code: R`{
  "name": "api-pedidos",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "engines": { "node": ">=22" },
  "scripts": {
    "dev": "node --watch src/index.js",
    "start": "node src/index.js",
    "test": "node --test"
  },
  "dependencies": { "express": "5.3.0" }
}`, notes: [{ l: '5', t: 'Os arquivos .js são ESM.' }, { l: '8', t: 'node --watch reinicia ao salvar.' }] }
  ],
  bestPractices: ['Use "type": "module" em projetos novos.', 'Commite o package-lock.json e use npm ci em CI e Docker.', 'Declare engines e fixe a versão do Node no ambiente.', 'Mantenha poucas dependências e revise as atualizações.', 'Use createRequire ou import com type json em vez de adivinhar.', 'Mantenha segredos fora do repositório (.env no .gitignore).'],
  mistakes: ['Misturar require e import no mesmo arquivo sem entender o "type".', 'Esquecer a extensão nos imports relativos do ESM.', 'Usar __dirname em ESM.', 'Não commitar o lockfile.', 'Usar npm install em CI e obter versões diferentes das testadas.', 'Instalar pacotes sem verificar o nome e o autor.'],
  market: R`Entender módulos e o npm é pré-requisito de todo trabalho em Node: problemas de ESM x CJS, dependências divergentes e vulnerabilidades da cadeia de suprimentos consomem tempo de equipes inteiras.`,
  summary: R`CommonJS e ESM convivem; o "type" do package.json decide como o .js é tratado (medido: o mesmo arquivo foi CJS sem "type" e ESM com "module"). No Node 26.13.1, require de ESM síncrono funcionou (5), import() dinâmico em CJS funcionou (2), await no topo funcionou e __dirname no ESM deu ReferenceError. Use semver, commite o lockfile e npm ci para builds reproduzíveis e cuide da cadeia de suprimentos.`,
  refs: [REF.esm, REF.modules, REF.packages, REF.packageJson, REF.semver, REF.npmCi],
  cards: [
    { q: 'Como o Node decide se um .js é ESM ou CJS?', a: 'Pelo "type" do package.json mais próximo (ausente = CommonJS; "module" = ESM); .mjs e .cjs são fixos.' },
    { q: 'Como obter o diretório do arquivo no ESM?', a: 'import.meta.dirname ou fileURLToPath(new URL(".", import.meta.url)); __dirname não existe.' },
    { q: 'O que significa ^1.2.3?', a: 'Aceita versões 1.x.x maiores ou iguais a 1.2.3, sem mudar o major.' },
    { q: 'Para que serve npm ci?', a: 'Instalar exatamente o lockfile, de forma limpa e reproduzível (CI e Docker).' },
    { q: 'O que é typosquatting?', a: 'Publicar um pacote com nome parecido ao de um popular para enganar quem instala.' }
  ]
},
{
  id: 'nex-03', moduleId: 'm2', order: 3, minutes: 80, tags: ['Express', 'Express 5', 'rotas', 'req', 'res', 'params', 'query', 'body'],
  title: 'Express 5: roteamento, requisição e resposta, parâmetros e o que mudou da versão 4',
  objectives: ['Criar uma API com Express 5: rotas, métodos, parâmetros de rota, query string e corpo JSON', 'Organizar rotas com Router e montar sub-aplicações', 'Usar corretamente req e res (status, json, headers, redirecionamentos)', 'Aplicar as mudanças do Express 5 (sintaxe de curingas, handlers async, query parser)', 'Testar uma API com requisições reais'],
  intro: R`O **Express** é o framework web mais usado do Node: pequeno, **sem imposições**, baseado em **rotas** e **middlewares**. A versão **5** (estável há tempos, **5.3.0** no laboratório) traz mudanças importantes: **erros em handlers assíncronos** viram respostas de erro **sem código extra**, a **sintaxe de curingas** mudou, e o *query parser* padrão é simples. Aqui você as **testa** com requisições reais.`,
  theory: R`### O mínimo
§§§
import express from 'express';
const app = express();
app.use(express.json());                      // lê corpos JSON em req.body
app.get('/usuarios/:id', (req, res) => res.json({ id: req.params.id }));
app.listen(3000);
§§§
Uma **rota** = **método HTTP** + **caminho** + **handler(s)**: §app.get§, §app.post§, §app.put§, §app.patch§, §app.delete§, §app.all§.

### Requisição (§req§)
- §req.params§: **parâmetros de rota** (§/usuarios/:id§ → §req.params.id§, **sempre texto**).
- §req.query§: **query string** (§?filtro=a&n=1§). Medido no Express 5: §/usuarios/42?filtro=a&filtro=b&n=1§ → §{ "filtro": ["a","b"], "n": "1" }§: valores repetidos viram **array**; números continuam **texto**. **Valide e converta** (aula nex-05 e curso de NestJS).
- §req.body§: o corpo **depois** de um *body parser* (§express.json()§, §express.urlencoded()§). **No Express 5, §req.body§ é §undefined§ se nenhum parser leu o corpo** (medido: sem §express.json()§, §typeof req.body§ = §'undefined'§). Com o parser e um POST com §Content-Type: application/json§ **sem corpo**, §req.body§ **não** foi §undefined§ (§typeof§ = §'object'§), e um POST sem §Content-Type§ nem corpo devolveu §null§ no eco com §?? null§: **sempre valide** o corpo antes de usá-lo.
- §req.headers§, §req.get('x')§, §req.method§, §req.path§, §req.ip§ (cuidado com proxies: *trust proxy*).

### Resposta (§res§)
§res.status(201).json(obj)§ (já define §Content-Type§), §res.send()§, §res.sendStatus(204)§, §res.redirect()§, §res.set('Cache-Control', ...)§, §res.cookie()§, §res.download()§. **Uma resposta por requisição**: enviar duas vezes lança **ERR_HTTP_HEADERS_SENT**.
**Status certos** (aula api-02): §200§ OK, §201§ criado, §204§ sem conteúdo, §400§ requisição inválida, §401§/§403§, §404§, §409§, §422§, §500§.

### Router: organizar rotas
§§§
const usuarios = express.Router();
usuarios.get('/', listar);
usuarios.get('/:id', obter);
usuarios.post('/', criar);
app.use('/usuarios', usuarios);
§§§
Um Router é uma **mini-aplicação** com seus middlewares e rotas: separe por **recurso** (usuários, pedidos) e **versione** (§/v1§). §router.route('/:id').get(...).put(...)§ agrupa métodos do mesmo caminho.

### Express 5: o que mudou (medido)
1. **Handlers assíncronos que lançam erro** (ou devolvem uma promise rejeitada) **são encaminhados ao middleware de erro**: medido, o handler §async§ que lança devolveu **500** pelo tratador de erros (segundo a documentação, no Express 4 a rejeição ficava sem tratamento a menos que se usasse um *wrapper*; **o Express 4 não foi executado** aqui).
2. **Curingas**: §'/arquivos/*'§ **deixou de ser aceito**; o Node registrou **"Missing parameter name"**; use um **curinga nomeado** §'/arquivos/*caminho'§: medido, §/arquivos/a/b/c.txt§ → §req.params.caminho§ = **§["a","b","c.txt"]§** (**array** de segmentos). Parâmetros opcionais: §/:id{.:formato}§ (chaves), no lugar do §?§ antigo.
3. **§req.query§** passou a usar o *parser* **"simple"** por padrão (como visto: arrays para repetidos, sem objetos aninhados de §a[b]=c§ a menos que se configure §app.set('query parser', 'extended')§).
4. §req.body§ é §undefined§ por padrão sem parser (medido).
5. §res.status()§ aceita só **100–999**; §res.redirect('back')§ foi removido; vários métodos antigos (§req.param()§, §res.send(status)§) saíram (**descritos na documentação; não executados**).
(Lista oficial: "Migrating to Express 5".)

### Ordem importa
O Express percorre **middlewares e rotas na ordem de registro**; o primeiro que **responde** encerra o ciclo. Por isso: parsers e segurança **antes** das rotas; **404** e **tratador de erros** **depois** (aulas nex-04 e nex-05).

### Testando sem navegador
Suba o app em uma porta aleatória (§app.listen(0)§) e chame com §fetch§ (como os experimentos) ou com **Supertest** (curso de testes). Teste **status**, **corpo** e **cabeçalhos**, inclusive os **casos de erro**.

### Estilo de API
Mantenha **handlers finos**: **validar**, **chamar um serviço**, **responder**; a regra de negócio vai para **camadas** (serviços, repositórios), o que facilita testes e uma futura migração (por exemplo, para o NestJS, curso C4.2).`,
  concepts: [
    { term: 'Rota', def: 'Associação de um método HTTP e um caminho a um ou mais handlers.' },
    { term: 'req.params', def: 'Objeto com os parâmetros de rota, sempre em texto.' },
    { term: 'req.query', def: 'Objeto com os parâmetros da query string.' },
    { term: 'Body parser', def: 'Middleware que lê o corpo da requisição e preenche req.body.' },
    { term: 'Router', def: 'Mini-aplicação com rotas e middlewares montada sob um prefixo.' },
    { term: 'Curinga nomeado', def: 'Sintaxe do Express 5 para capturar o resto do caminho, como /*caminho.' },
    { term: 'ERR_HTTP_HEADERS_SENT', def: 'Erro ao tentar enviar uma resposta que já foi enviada.' },
    { term: 'trust proxy', def: 'Configuração que faz o Express confiar em cabeçalhos de proxies para o IP e o protocolo.' },
    { term: 'Handler fino', def: 'Handler que apenas valida, delega e responde, sem regra de negócio.' },
    { term: 'Query parser', def: 'Estratégia usada para transformar a query string em objeto (simple ou extended).' }
  ],
  examples: R`**Analogia:** o Express é uma **recepção de hotel com um quadro de ramais**: cada pedido (requisição) é encaminhado pelo **quadro de rotas** ao setor certo; o **Router** é **um andar inteiro** com sua própria recepção. No Express 5 a recepção passou a **pegar sozinha os recados de erro** que os atendentes assíncronos deixavam cair no chão. O **curinga nomeado** é um **cartão com o nome do assunto**: não se aceita mais um "qualquer coisa" sem etiqueta.

**Exemplo 1: query.** ?filtro=a&filtro=b&n=1 virou { filtro: ["a","b"], n: "1" }.

**Exemplo 2: curinga.** /arquivos/*caminho devolveu ["a","b","c.txt"]; /arquivos/* foi recusado.

**Exemplo 3: async.** O handler async que lança devolveu 500 pelo tratador de erros.`,
  code: [
    { title: 'Rotas, parâmetros, query, corpo e 404 (JavaScript, Express 5.3.0, saídas medidas)', lang: 'js', code: R`import express from 'express';
const app = express();
app.use(express.json());
app.get('/usuarios/:id', (req, res) => res.json({ id: req.params.id, query: req.query }));
// GET /usuarios/42?filtro=a&filtro=b&n=1 -> {"id":"42","query":{"filtro":["a","b"],"n":"1"}}
app.post('/eco', (req, res) => res.json({ recebido: req.body ?? null }));
// POST sem corpo -> {"recebido":null} | POST {"a":1} -> {"recebido":{"a":1}}
app.get('/arquivos/*caminho', (req, res) => res.json({ caminho: req.params.caminho }));
// GET /arquivos/a/b/c.txt -> {"caminho":["a","b","c.txt"]}
app.use((req, res) => res.status(404).json({ erro: 'não encontrado', caminho: req.path }));
app.listen(3000);`, notes: [{ l: '4', t: 'Params e query chegam como texto.' }, { l: '8', t: 'O curinga nomeado devolve um array de segmentos.' }, { l: '10', t: 'O último middleware sem rota responde 404.' }] },
    { title: 'Router por recurso (JavaScript)', lang: 'js', code: R`import { Router } from 'express';
export const usuarios = Router();
usuarios.get('/', (req, res) => res.json([]));
usuarios.route('/:id')
  .get((req, res) => res.json({ id: req.params.id }))
  .put((req, res) => res.sendStatus(204))
  .delete((req, res) => res.sendStatus(204));
// app.use('/v1/usuarios', usuarios);`, notes: [{ l: '4', t: 'route agrupa os métodos do mesmo caminho.' }, { l: '9', t: 'O prefixo é aplicado na montagem.' }] }
  ],
  bestPractices: ['Mantenha handlers finos e mova regras para serviços.', 'Valide e converta params, query e body antes de usar.', 'Use Router por recurso e versione as rotas.', 'Responda com o status correto e uma única vez.', 'Registre parsers e segurança antes das rotas; 404 e erro depois.', 'Teste com requisições reais, inclusive casos de erro.'],
  mistakes: ['Confiar em req.params e req.query como números.', 'Esquecer o express.json e achar que req.body existe.', 'Usar o curinga * sem nome no Express 5.', 'Enviar duas respostas na mesma requisição.', 'Colocar o 404 antes das rotas.', 'Concentrar toda a lógica nos handlers.'],
  market: R`Express continua presente em milhões de APIs, e a migração para a versão 5 é uma tarefa real de manutenção. Dominar rotas, req e res, e as mudanças da v5, é a base para frameworks como NestJS e Fastify.`,
  summary: R`O Express organiza uma API em rotas e middlewares. Medido no Express 5.3.0: a query repetida vira array e os números continuam texto; sem parser, req.body é undefined; handlers async que lançam resultam em 500 pelo tratador de erros; "/arquivos/*" foi recusado e "/arquivos/*caminho" devolveu um array de segmentos. Use Routers por recurso, handlers finos, status corretos e registre a ordem com cuidado (404 e erro por último).`,
  refs: [REF.expressRouting, REF.expressMigrating5, REF.expressApi],
  cards: [
    { q: 'O que mudou em handlers async no Express 5?', a: 'Erros e rejeições são encaminhados ao middleware de erro automaticamente (medido: 500).' },
    { q: 'Como capturar o resto do caminho no Express 5?', a: 'Com um curinga nomeado, como /arquivos/*caminho (devolve um array de segmentos).' },
    { q: 'Quando req.body é undefined?', a: 'Quando nenhum body parser leu o corpo (por exemplo, sem express.json()).' },
    { q: 'Qual o tipo de req.params.id?', a: 'Texto; converta e valide antes de usar.' },
    { q: 'Para que serve um Router?', a: 'Para agrupar rotas e middlewares por recurso e montá-los sob um prefixo.' }
  ]
}
];
