// C1.5 — APIs do navegador e Web Platform. Aulas 4 e 5 (Web Workers e Service Workers).
const R = String.raw;

export const REF2 = {
  mdnUsingWorkers: { title: 'MDN — Using Web Workers', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers', kind: 'doc' },
  mdnClone: { title: 'MDN — The structured clone algorithm', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm', kind: 'doc' },
  mdnTransferable: { title: 'MDN — Transferable objects', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects', kind: 'doc' },
  mdnSw: { title: 'MDN — Service Worker API', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API', kind: 'doc' },
  mdnUsingSw: { title: 'MDN — Using Service Workers', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers', kind: 'doc' },
  w3cSw: { title: 'W3C — Service Workers (especificação)', url: 'https://www.w3.org/TR/service-workers/', kind: 'spec' },
  webdevLifecycle: { title: 'web.dev — The service worker lifecycle', url: 'https://web.dev/articles/service-worker-lifecycle', kind: 'doc' },
  mdnFetchEvent: { title: 'MDN — FetchEvent.respondWith()', url: 'https://developer.mozilla.org/en-US/docs/Web/API/FetchEvent/respondWith', kind: 'doc' },
  webdevCaching: { title: 'web.dev — Estratégias de cache (Workbox)', url: 'https://web.dev/learn/pwa/caching', kind: 'doc' }
};

export const lessonsB = [
{
  id: 'web-04', moduleId: 'm2', order: 4, minutes: 60, tags: ['Web Workers', 'postMessage', 'structured clone', 'transferíveis', 'desempenho'],
  title: 'Web Workers: trabalho pesado fora da thread principal',
  objectives: ['Explicar por que um cálculo longo congela a página e como um Worker evita isso', 'Criar um Worker dedicado, trocar mensagens e tratar erros e encerramento', 'Descrever o algoritmo de clonagem estruturada e o que não pode ser enviado', 'Usar objetos transferíveis para mover grandes buffers sem cópia', 'Identificar o que existe e o que não existe dentro de um Worker e escolher quando usá-lo'],
  intro: `O JavaScript da página roda na mesma thread que **desenha a interface e processa cliques**. Um laço de 300 ms de cálculo significa 300 ms de página **congelada**: sem animação, sem resposta a toques. Os **Web Workers** executam JavaScript em **outra thread**, com memória e laço de eventos próprios, e se comunicam com a página por **mensagens**. É a ferramenta para processar imagens, analisar arquivos grandes, criptografar, indexar para busca ou executar o código do aluno no laboratório desta própria academia. Os resultados foram medidos no Chrome 157.`,
  theory: `### O problema: uma thread só
A thread principal executa o seu JavaScript, calcula estilos e layout e pinta a tela. Se uma tarefa leva mais de ~50 ms, o usuário percebe travamentos. No experimento, um laço de cálculo de 300 milhões de iterações na thread principal fez o **maior atraso de um temporizador de 10 ms passar de 100 ms** (a página ficou sem responder); executando o **mesmo cálculo em um Worker**, o maior atraso ficou **abaixo de 100 ms**, e a interface seguiu viva.

### Criando e conversando com um Worker
\`\`\`
// principal.js
const w = new Worker('worker.js');
w.onmessage = (e) => console.log(e.data);
w.postMessage({ tipo: 'soma', n: 1e6 });
// worker.js
self.onmessage = (e) => { /* calcula */ self.postMessage(resultado); };
\`\`\`
- §new Worker(url)§ (ou §{ type: 'module' }§ para usar §import§) cria o Worker; o script precisa ser da **mesma origem** (ou seguir regras de CORS) e pode ser criado de um **Blob** quando se quer código embutido;
- a comunicação é **assíncrona**, por §postMessage§ e o evento §message§ (nos dois lados);
- §worker.terminate()§ encerra à força; dentro do Worker, §self.close()§;
- erros não tratados disparam §worker.onerror§ (no teste: §Uncaught Error: falha no worker§); promises rejeitadas disparam §unhandledrejection§ no escopo do Worker.

### O que existe dentro de um Worker
Escopo global próprio (§self§, §DedicatedWorkerGlobalScope§), sem acesso à página. No teste, dentro do Worker:
- **não existem** §document§, §window§ e §localStorage§ (§undefined§);
- **existem** §fetch§, §indexedDB§, §setTimeout§, §crypto§, §WebSocket§, §importScripts§/módulos, §OffscreenCanvas§ (canvas fora da thread principal) e §navigator§ (parcial).
Logo, **o Worker não toca o DOM**: ele devolve **dados**, e a thread principal atualiza a tela.

### Clonagem estruturada (structured clone)
As mensagens são **copiadas** com o **algoritmo de clonagem estruturada**, que suporta tipos de dados ricos: objetos e arrays (inclusive com **ciclos**), §Date§, §Map§, §Set§, §RegExp§, §Blob§, §File§, §ArrayBuffer§, arrays tipados, §ImageData§, erros. No teste, Date, Map e Set chegaram ao Worker **com seus tipos**. **Não podem ser enviados:** **funções**, nós do DOM, propriedades de protótipos e §Symbol§: §postMessage({ f() {} })§ lançou **§DataCloneError§**. A cópia tem custo proporcional ao tamanho: mensagens enormes e frequentes podem anular o ganho do Worker.

### Objetos transferíveis
Para dados grandes, **transfira** em vez de copiar: §postMessage(dados, [buffer])§ **move** a propriedade do §ArrayBuffer§ (também §MessagePort§, §ImageBitmap§, §OffscreenCanvas§, streams). A transferência é praticamente instantânea, mas o remetente **perde o acesso**: no teste, o Worker viu **1024 bytes** e o buffer local passou a ter §byteLength§ **0**. Use para imagens, áudio, arquivos binários.

### Memória compartilhada (avançado)
§SharedArrayBuffer§ com §Atomics§ permite que threads compartilhem memória (como no Node.js na aula de concorrência). Em navegadores, exige a página em **isolamento de origem cruzada** (§Cross-Origin-Opener-Policy: same-origin§ e §Cross-Origin-Embedder-Policy: require-corp§), por razões de segurança. Prefira mensagens, a menos que haja necessidade comprovada.

### Tipos de Worker
| Tipo | Uso |
|---|---|
| **Dedicado** (§Worker§) | um dono; o caso comum |
| **Compartilhado** (§SharedWorker§) | várias abas da mesma origem compartilham uma instância (suporte desigual entre navegadores) |
| **Service Worker** | intermediário de rede e eventos em segundo plano (aula 5) |
| **Worklets** | pequenos trechos para áudio e pintura, em threads específicas |

### Padrão prático: chamada de procedimento remoto
Mensagens soltas viram confusão rapidamente. Um padrão simples: cada pedido recebe um **id**, o Worker responde com o mesmo id e a página resolve a **promise** correspondente (uma pequena camada "RPC"). Bibliotecas como **Comlink** fazem isso automaticamente. Inclua **timeout** e trate §onerror§ para não deixar promises pendentes.

### Quando usar (e quando não)
**Use** para cálculo pesado (compressão, parsing de arquivos grandes, criptografia, busca em índices, processamento de imagem), para executar código de terceiros isolado do DOM e para tarefas que não podem atrasar a interface. **Não use** para tarefas curtas (o custo de criar o Worker e copiar mensagens pesa), para E/S (§fetch§ já é assíncrono) ou para tocar o DOM. Reutilize Workers (*pool*) em vez de criar um por tarefa, e **termine** os que não servem mais.`,
  concepts: [
    { term: 'Web Worker', def: 'Script JavaScript executado em outra thread, sem acesso ao DOM, que se comunica por mensagens.' },
    { term: 'postMessage', def: 'Método que envia uma mensagem (copiada ou transferida) ao outro contexto.' },
    { term: 'Clonagem estruturada', def: 'Algoritmo que copia valores complexos entre contextos; não suporta funções nem nós do DOM.' },
    { term: 'DataCloneError', def: 'Erro lançado ao tentar enviar um valor que não pode ser clonado.' },
    { term: 'Objeto transferível', def: 'Objeto cuja propriedade é movida ao destino sem cópia (ArrayBuffer, MessagePort).' },
    { term: 'OffscreenCanvas', def: 'Canvas que pode ser desenhado fora da thread principal, inclusive em Workers.' },
    { term: 'SharedArrayBuffer', def: 'Memória compartilhada entre threads, exige isolamento de origem cruzada.' },
    { term: 'Pool de Workers', def: 'Conjunto reutilizável de Workers para executar várias tarefas.' },
    { term: 'RPC sobre mensagens', def: 'Padrão que associa pedidos e respostas por id, expondo chamadas como promises.' },
    { term: 'Tarefa longa', def: 'Tarefa de mais de ~50 ms na thread principal, que prejudica a responsividade.' }
  ],
  examples: R`**Analogia:** a thread principal é o **garçom** que atende o salão; um cálculo pesado é como pedir que ele **também cozinhe**: o salão para. O Worker é a **cozinha**: recebe a comanda (mensagem), prepara no fundo e devolve o prato (mensagem). A cozinha **não entra no salão** (não toca o DOM). Comandas complexas são **copiadas** (clonagem), mas um pallet inteiro de ingredientes é **entregue** em vez de duplicado (transferência).

**Resultados medidos (Chrome 157):**
- soma de 1 milhão de termos no Worker: §{"tipo":"resultado","s":2999997}§;
- transferência: Worker viu 1024 bytes; buffer local ficou com §byteLength§ 0;
- clonagem: Date, Map e Set chegaram com os tipos corretos; §postMessage({ f() {} })§ → **DataCloneError**;
- escopo do Worker: sem §document§, §window§, §localStorage§; com §fetch§ e §indexedDB§;
- atraso máximo de um timer de 10 ms durante um cálculo de 300 milhões de iterações: **≥ 100 ms na thread principal**; **< 100 ms** com o cálculo em Worker.

**Caso real:** um editor de imagens aplica filtros em fotos de 20 megapixels. A página envia o §ImageBitmap§ (transferido) ao Worker, que processa em um §OffscreenCanvas§ e devolve o resultado; o controle deslizante continua respondendo.`,
  code: [
    { title: 'Worker dedicado com mensagens, transferência e erros (executado em Chrome 157)', lang: 'javascript', code: R`// --- worker.js ---
self.onmessage = (e) => {
  const d = e.data;
  if (d.tipo === 'soma') { let s = 0; for (let i = 0; i < d.n; i++) s += i % 7; self.postMessage({ tipo: 'resultado', s }); }
  else if (d.tipo === 'buffer') self.postMessage({ tipo: 'tamanho', bytes: d.buf.byteLength }, [d.buf]);
  else if (d.tipo === 'erro') throw new Error('falha no worker');
};

// --- principal.js ---
const w = new Worker('worker.js');
const msg = (m, t = []) => new Promise((res) => { w.onmessage = (e) => res(e.data); w.postMessage(m, t); });

console.log(await msg({ tipo: 'soma', n: 1e6 }));              // { tipo: 'resultado', s: 2999997 }
const buf = new ArrayBuffer(1024);
const r = await msg({ tipo: 'buffer', buf }, [buf]);          // transfere o buffer
console.log(r.bytes, buf.byteLength);                           // 1024 0
try { w.postMessage({ f() {} }); } catch (e) { console.log(e.name); }   // DataCloneError

const falha = new Promise((res) => (w.onerror = (e) => { e.preventDefault(); res(e.message); }));
w.postMessage({ tipo: 'erro' });
console.log(await falha);                                       // Uncaught Error: falha no worker
w.terminate();`, notes: [{ l: '9', t: 'O Worker é carregado de um arquivo da mesma origem.' }, { l: '10', t: 'Cada chamada atribui onmessage de novo: é simples, mas só serve para um pedido por vez; veja a camada RPC abaixo.' }, { l: '15', t: 'O segundo argumento lista os objetos transferidos.' }, { l: '17', t: 'Funções não são clonáveis: DataCloneError.' }, { l: '23', t: 'terminate encerra o Worker imediatamente.' }] },
    { title: 'Camada RPC: promise por pedido, com id e timeout (padrão; a lógica foi testada com Worker simulado no laboratório de exercícios)', lang: 'javascript', code: R`function criarRpc(worker, { timeoutMs = 5000 } = {}) {
  let proximo = 1;
  const pendentes = new Map();
  worker.onmessage = (e) => {
    const { id, resultado, erro } = e.data;
    const p = pendentes.get(id);
    if (!p) return;                                  // resposta tardia (já expirou)
    pendentes.delete(id); clearTimeout(p.timer);
    erro ? p.rej(new Error(erro)) : p.res(resultado);
  };
  return {
    chamar(metodo, ...args) {
      const id = proximo++;
      return new Promise((res, rej) => {
        const timer = setTimeout(() => { pendentes.delete(id); rej(new Error('timeout')); }, timeoutMs);
        pendentes.set(id, { res, rej, timer });
        worker.postMessage({ id, metodo, args });
      });
    }
  };
}`, notes: [{ l: '2', t: 'O mapa associa cada pedido pendente ao seu id.' }, { l: '6', t: 'Respostas que chegam depois do timeout são ignoradas.' }, { l: '14', t: 'O timeout evita promises eternamente pendentes.' }, { l: '17', t: 'O Worker deve responder com o mesmo id: { id, resultado } ou { id, erro }.' }] }
  ],
  bestPractices: ['Mantenha tarefas da thread principal abaixo de ~50 ms; mova o resto para Workers.', 'Envie dados mínimos e use objetos transferíveis para buffers grandes.', 'Use uma camada de pedidos com id e timeout, ou uma biblioteca como Comlink.', 'Reaproveite Workers em um pool e chame §terminate()§ quando não forem mais necessários.', 'Trate §onerror§ e §onmessageerror§ e valide as mensagens recebidas.', 'Meça com o painel Performance antes e depois: o Worker deve resolver um problema real.'],
  mistakes: ['Criar um Worker novo para cada tarefa pequena.', 'Tentar acessar o DOM ou o §localStorage§ dentro do Worker.', 'Enviar objetos com funções e receber §DataCloneError§.', 'Continuar usando um buffer depois de transferi-lo.', 'Enviar mensagens enormes e frequentes por cópia.', 'Esquecer de tratar erros do Worker, deixando promises pendentes.'],
  market: `Aplicações web ricas (editores de imagem e vídeo, planilhas, IDEs no navegador, ferramentas de visualização e jogos) dependem de Workers para manter 60 quadros por segundo. Também é a base de WebAssembly em paralelo, de indexação offline e de ambientes de execução de código seguros, como o laboratório de exercícios desta academia, que roda o código do aluno em um Worker.`,
  summary: `Tarefas longas na thread principal congelam a página; Web Workers executam JavaScript em outra thread, sem DOM, comunicando por postMessage com cópia por clonagem estruturada (sem funções ou nós do DOM) ou transferência de objetos como ArrayBuffer (o remetente perde o acesso). Use para cálculo pesado, não para tarefas curtas nem E/S. Organize pedidos com id e timeout, reutilize Workers e trate erros.`,
  refs: [REF2.mdnUsingWorkers, REF2.mdnClone, REF2.mdnTransferable],
  cards: [
    { q: 'O que um Worker não consegue acessar?', a: 'O DOM e a window (e o localStorage); ele opera em escopo próprio e devolve dados por mensagens.' },
    { q: 'O que é enviado por postMessage?', a: 'Uma cópia feita pela clonagem estruturada, ou objetos transferidos (que passam a pertencer ao destino).' },
    { q: 'O que acontece com um ArrayBuffer transferido?', a: 'O remetente perde o acesso: byteLength passa a ser 0.' },
    { q: 'Quando não vale a pena usar um Worker?', a: 'Para tarefas curtas, para E/S assíncrona (fetch) e quando o custo de copiar as mensagens supera o ganho.' }
  ]
},
{
  id: 'web-05', moduleId: 'm3', order: 5, minutes: 70, tags: ['Service Worker', 'ciclo de vida', 'estratégias de cache', 'offline', 'fetch'],
  title: 'Service Workers: ciclo de vida, interceptação de rede e estratégias de cache',
  objectives: ['Explicar o que é um Service Worker, seu escopo e os requisitos (HTTPS ou localhost)', 'Descrever o ciclo de vida: registro, install, waiting, activate e controle das páginas', 'Implementar pré-cache no install e limpeza de versões antigas no activate', 'Implementar cache-first, network-first e stale-while-revalidate e escolher entre elas', 'Evitar armadilhas: respostas HTTP de erro não rejeitam, versões presas e atualização do próprio script'],
  intro: `Um **Service Worker** é um script que o navegador executa em segundo plano, **entre a página e a rede**. Ele pode interceptar cada requisição (§fetch§) feita pelas páginas sob o seu **escopo** e decidir: responder do cache, ir à rede ou combinar os dois. É o que permite **abrir um aplicativo sem internet**, carregar instantaneamente em visitas seguintes e, com outras APIs, receber notificações e sincronizar em segundo plano. Também é uma das APIs mais fáceis de errar: um worker mal escrito pode **prender os usuários em uma versão antiga** do site. Esta aula mostra o ciclo de vida e as estratégias com testes reais no Chrome 157.`,
  theory: `### O que é e quais são os requisitos
- é um tipo de Worker **orientado a eventos** (§install§, §activate§, §fetch§, §message§, §push§, §sync§), **sem DOM** e **sem acesso síncrono** a §localStorage§ (use IndexedDB e Cache API);
- só funciona em **contexto seguro**: **HTTPS** ou §localhost§;
- é **registrado** pela página (§navigator.serviceWorker.register('/sw.js', { scope: '/' })§);
- o navegador pode **encerrá-lo** quando está ocioso e **acordá-lo** quando há um evento: **não guarde estado em variáveis globais**.
O **escopo** define quais páginas ele controla: um script em §/app/sw.js§ controla por padrão §/app/§ e subcaminhos; para controlar §/§, o script precisa estar em §/§ (ou o servidor enviar o cabeçalho §Service-Worker-Allowed§).

### Ciclo de vida
1. **Registro**: a página chama §register§; o navegador baixa o script.
2. **Install**: dispara §install§ uma vez por versão do script. É o momento do **pré-cache** (§event.waitUntil(caches.open(...).then(c => c.addAll(lista)))§). Se falhar, a instalação falha.
3. **Waiting**: se já existe um worker ativo, o novo **espera** até que **todas** as abas controladas pelo antigo sejam fechadas (a menos que use §self.skipWaiting()§).
4. **Activate**: dispara §activate§. Aqui se **apagam caches antigos**. §clients.claim()§ faz o novo worker controlar já as páginas abertas.
5. **Controle**: a partir daí, os §fetch§ das páginas controladas passam por ele.
No teste, as transições observadas foram: §installing > installed > activating > activated§, com escopo §/§ e §controller§ presente após §skipWaiting§ e §clients.claim§. Sem eles, **a página que registrou o worker só é controlada depois de recarregar**.

### Interceptando requisições
\`\`\`
self.addEventListener('fetch', (event) => {
  event.respondWith(minhaEstrategia(event.request));
});
\`\`\`
Se você **não** chamar §respondWith§, a requisição segue normalmente para a rede. Cuidados:
- trate **apenas §GET§** do **mesmo domínio**, salvo motivo claro; não intercepte requisições de autenticação ou §POST§;
- §event.waitUntil(promise)§ mantém o worker vivo até a promise terminar (útil para atualizar cache em segundo plano);
- respostas **opacas** (CORS sem permissão) têm tamanho desconhecido e podem consumir cota demais.

### As estratégias de cache
| Estratégia | Como funciona | Bom para | Risco |
|---|---|---|---|
| **Cache-first** | busca no cache; se não achar, vai à rede | recursos versionados (JS e CSS com hash, fontes, imagens) | conteúdo velho se o nome não mudar |
| **Network-first** | tenta a rede; se falhar, usa o cache | dados que mudam (API, HTML) | lentidão com rede ruim (use timeout) |
| **Stale-while-revalidate** | devolve o cache **na hora** e atualiza em segundo plano | dados que toleram atraso (avatares, listas) | o usuário vê o dado da visita anterior |
| **Cache-only / network-only** | só um dos dois | pré-cache fixo / chamadas que nunca devem ser cacheadas | — |
No teste (servidor local alternando entre no ar e fora do ar):
- **cache-first** servia §/shell.txt§ do pré-cache;
- **network-first** com servidor fora do ar devolveu a **resposta guardada** (mesmo §t§ da última rede) e, para uma URL **nunca vista**, a resposta de contingência §503 offline§;
- **stale-while-revalidate** fora do ar devolveu o cache; com o servidor de volta, a **primeira** resposta ainda era a antiga e a **seguinte** já vinha atualizada.

### Armadilha importante: HTTP de erro não rejeita
§fetch§ **só rejeita** quando há falha de rede. Uma resposta **503** ou **404** é uma **promise resolvida**. Na primeira versão do nosso teste, o network-first **devolveu o 503** ao usuário, em vez de usar o cache, porque o código só tratava a rejeição. A correção: tratar §!res.ok§ como falha (§throw§) para cair no cache. Do mesmo modo, **não guarde no cache respostas de erro**.

### Versões, atualização e limpeza
- O navegador compara o **conteúdo do script §sw.js§** (byte a byte) a cada navegação e, no máximo, a cada 24 horas; mudou, instala uma nova versão. **Nunca deixe o próprio §sw.js§ em cache HTTP agressivo** (§Cache-Control: no-cache§).
- Nomeie os caches com **versão** (§app-v1§, §app-v2§) e apague os antigos no §activate§.
- Decida a política de atualização: aviso "nova versão disponível, atualizar?" (o novo worker em **waiting** recebe uma mensagem para chamar §skipWaiting§), ou atualização silenciosa na próxima visita.
- Para desinstalar durante o desenvolvimento: painel **Application** das DevTools, "Unregister" e "Clear storage".

### Comunicação com a página
§postMessage§ funciona nos dois sentidos (§client.postMessage§ no worker; §navigator.serviceWorker.controller.postMessage§ na página). No teste, a mensagem §'ping'§ foi respondida com §'pong de app-v1'§.

### Bibliotecas
**Workbox** implementa as estratégias, expiração de cache e pré-cache com manifesto gerado no build. Entender os mecanismos desta aula é o que permite configurá-la e depurá-la.

### Depuração
DevTools → **Application → Service Workers** (estado, "Update on reload", "Offline", "Bypass for network") e **Cache Storage**. O console do worker é separado do da página.`,
  concepts: [
    { term: 'Service Worker', def: 'Script em segundo plano que intercepta requisições e responde a eventos, sem DOM.' },
    { term: 'Escopo', def: 'Conjunto de URLs cujas páginas e requisições o Service Worker controla.' },
    { term: 'Ciclo de vida', def: 'Sequência install, waiting, activate e controle das páginas.' },
    { term: 'skipWaiting / clients.claim', def: 'Ativar a nova versão imediatamente e assumir as páginas já abertas.' },
    { term: 'Pré-cache', def: 'Guardar recursos essenciais durante o install para uso offline.' },
    { term: 'Cache-first', def: 'Estratégia que prefere o cache e só vai à rede se não houver resposta guardada.' },
    { term: 'Network-first', def: 'Estratégia que prefere a rede e usa o cache como contingência.' },
    { term: 'Stale-while-revalidate', def: 'Devolve o cache imediatamente e atualiza em segundo plano.' },
    { term: 'respondWith', def: 'Método do FetchEvent que define a resposta de uma requisição interceptada.' },
    { term: 'Workbox', def: 'Biblioteca que implementa estratégias de cache e pré-cache para Service Workers.' }
  ],
  examples: R`**Analogia:** o Service Worker é um **gerente de estoque na portaria** de um condomínio. Os pedidos dos moradores (requisições) passam por ele: se o item foi guardado, entrega na hora (cache-first); se é algo que muda, tenta buscar na rua e, se a rua estiver fechada, entrega a última versão que tinha (network-first); ou entrega o que tem e já manda alguém buscar a versão nova (stale-while-revalidate). O **ciclo de vida** é a troca de gerente: o novo só assume depois que o antigo termina o turno (ou é dispensado com skipWaiting).

**Resultados medidos (Chrome 157, servidor local):**
- estados: §installing > installed > activating > activated§; escopo §/§; mensagem §pong de app-v1§; pré-cache §/shell.txt§;
- network-first (versão com erro): com o servidor retornando 503, **serviu o 503**; (versão corrigida): serviu o cache; sem cache, §503 offline§;
- stale-while-revalidate: fora do ar devolveu o cache; de volta, primeira resposta velha e a seguinte atualizada;
- cache-first: §/shell.txt§ = "casca do app v1".

**Caso real:** um PWA de pedidos pré-cacheia a "casca" (HTML, JS, CSS), usa cache-first para arquivos com hash no nome, network-first com timeout de 3 s para a API de cardápio e stale-while-revalidate para as imagens dos pratos. Ao publicar uma nova versão, mostra uma faixa "Atualizar" que envia uma mensagem para o worker em espera chamar §skipWaiting§.`,
  code: [
    { title: 'sw.js: pré-cache, limpeza e as três estratégias (executado em Chrome 157)', lang: 'javascript', code: R`const V = 'app-v1';
const SHELL = ['/shell.txt'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(V).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k.startsWith('app-') && k !== V).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (u.origin !== location.origin || e.request.method !== 'GET') return;     // só GET do mesmo domínio

  if (u.pathname === '/shell.txt') {                                            // cache-first
    e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
    return;
  }
  if (u.pathname.startsWith('/api/net/')) {                                     // network-first
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          if (!res.ok) throw new Error('HTTP ' + res.status);                   // erro HTTP não rejeita sozinho!
          const copia = res.clone();
          caches.open(V).then((c) => c.put(e.request, copia));
          return res;
        })
        .catch(() => caches.match(e.request).then((r) => r || new Response('offline', { status: 503 })))
    );
    return;
  }
  if (u.pathname.startsWith('/api/swr/')) {                                     // stale-while-revalidate
    e.respondWith(caches.open(V).then(async (c) => {
      const velho = await c.match(e.request);
      const rede = fetch(e.request).then((res) => { if (res.ok) c.put(e.request, res.clone()); return res; }).catch(() => velho);
      return velho || rede;
    }));
  }
});`, notes: [{ l: '5', t: 'addAll falha se qualquer recurso falhar: a instalação inteira falha.' }, { l: '8', t: 'Remove caches de versões antigas e assume as páginas abertas.' }, { l: '16', t: 'Se não houver respondWith, a requisição segue para a rede.' }, { l: '26', t: 'Sem esta verificação, um 503 seria entregue ao usuário (comportamento observado no primeiro teste).' }, { l: '36', t: 'Atualiza o cache em segundo plano e devolve o velho imediatamente, se existir.' }] },
    { title: 'Registro e verificação na página (executado)', lang: 'javascript', code: R`const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
const sw = reg.installing || reg.waiting || reg.active;
const estados = [sw.state];
sw.addEventListener('statechange', () => estados.push(sw.state));
await navigator.serviceWorker.ready;
console.log(estados.join(' > '));                // installing > installed > activating > activated
console.log(!!navigator.serviceWorker.controller); // true (skipWaiting + clients.claim)

navigator.serviceWorker.addEventListener('message', (e) => console.log(e.data));
navigator.serviceWorker.controller.postMessage('ping');   // 'pong de app-v1'
await reg.update();                                        // procura uma nova versão do script
await reg.unregister();                                    // desinstala (útil em testes)`, notes: [{ l: '2', t: 'Um registro novo começa em installing.' }, { l: '5', t: 'ready resolve quando há um worker ativo para o escopo.' }, { l: '7', t: 'Sem skipWaiting e claim, a primeira carga não seria controlada.' }, { l: '11', t: 'update força a verificação do script no servidor.' }] }
  ],
  bestPractices: ['Registre o worker em HTTPS e mantenha §sw.js§ com §Cache-Control: no-cache§.', 'Pré-cache só o essencial (a casca) e versione os nomes dos caches.', 'Use cache-first para arquivos com hash, network-first para dados e stale-while-revalidate para o que tolera atraso.', 'Trate respostas não OK como falha e não as guarde no cache.', 'Informe ao usuário quando houver uma nova versão e deixe-o atualizar.', 'Teste offline, redes lentas e atualização de versão; use o painel Application das DevTools.'],
  mistakes: ['Guardar estado em variáveis globais do worker (ele é encerrado quando ocioso).', 'Assumir que fetch rejeita em respostas 404 ou 503.', 'Colocar o próprio §sw.js§ ou o HTML em cache-first sem versão, prendendo usuários em versões velhas.', 'Interceptar POST e requisições de autenticação.', 'Esquecer de apagar caches antigos e consumir cota.', 'Usar §skipWaiting§ sem pensar: páginas abertas passam a ser servidas por um worker diferente do que as carregou.'],
  market: `Service Workers são a base de PWAs, de carregamento instantâneo em visitas repetidas e de experiências offline, usadas por grandes sites de e-commerce, notícias e produtividade. Depurar um worker que "prendeu" uma versão antiga é uma habilidade rara e muito valorizada; Workbox é padrão em frameworks como Next.js (via plugins), Vite e Angular.`,
  summary: `O Service Worker intercepta a rede entre a página e o servidor, sob um escopo, em HTTPS ou localhost. O ciclo é registro, install (pré-cache), waiting, activate (limpeza e claim) e controle. As estratégias cache-first, network-first e stale-while-revalidate atendem a tipos diferentes de conteúdo. fetch só rejeita em falha de rede: trate !res.ok. Versione os caches, mantenha o sw.js fora de cache agressivo e planeje a atualização para o usuário.`,
  refs: [REF2.mdnSw, REF2.mdnUsingSw, REF2.w3cSw, REF2.webdevLifecycle, REF2.mdnFetchEvent, REF2.webdevCaching],
  cards: [
    { q: 'Em que momento se faz o pré-cache e a limpeza de versões antigas?', a: 'O pré-cache no evento install; a limpeza de caches antigos no evento activate.' },
    { q: 'O que o fetch faz com uma resposta 503?', a: 'Resolve a promise normalmente; só falhas de rede rejeitam. É preciso checar response.ok.' },
    { q: 'Qual estratégia devolve o cache na hora e atualiza em segundo plano?', a: 'Stale-while-revalidate.' },
    { q: 'Por que a página que registra o worker pode não ser controlada de imediato?', a: 'O novo worker só controla páginas após ativar, a menos que use skipWaiting e clients.claim; sem isso é preciso recarregar.' }
  ]
}
];
