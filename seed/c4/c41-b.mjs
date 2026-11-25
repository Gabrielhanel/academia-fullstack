// C4.1 — Node.js e Express. Aulas 4 a 7 (middlewares; erros; streams e workers; profiling e produção).
import { REF } from './c41-a.mjs';
const R = String.raw;

export const REF2 = {
  streams: { title: 'Node.js — Stream', url: 'https://nodejs.org/api/stream.html', kind: 'doc' },
  streamsPipeline: { title: 'Node.js — stream/promises pipeline', url: 'https://nodejs.org/api/stream.html#streampipelinesource-transforms-destination-options', kind: 'doc' },
  buffer: { title: 'Node.js — Buffer', url: 'https://nodejs.org/api/buffer.html', kind: 'doc' },
  workers: { title: 'Node.js — Worker threads', url: 'https://nodejs.org/api/worker_threads.html', kind: 'doc' },
  perfHooks: { title: 'Node.js — Performance measurement APIs', url: 'https://nodejs.org/api/perf_hooks.html', kind: 'doc' },
  profiling: { title: 'Node.js — Profiling Node.js Applications', url: 'https://nodejs.org/en/learn/getting-started/profiling', kind: 'doc' },
  cliCpuProf: { title: 'Node.js — Command-line API', url: 'https://nodejs.org/api/cli.html', kind: 'doc' },
  http: { title: 'Node.js — HTTP', url: 'https://nodejs.org/api/http.html', kind: 'doc' },
  process: { title: 'Node.js — Process', url: 'https://nodejs.org/api/process.html', kind: 'doc' },
  expressSecurity: { title: 'Express — Production best practices: security', url: 'https://expressjs.com/en/advanced/best-practice-security.html', kind: 'doc' },
  expressPerformance: { title: 'Express — Production best practices: performance and reliability', url: 'https://expressjs.com/en/advanced/best-practice-performance.html', kind: 'doc' },
  expressShutdown: { title: 'Express — Health checks and graceful shutdown', url: 'https://expressjs.com/en/advanced/healthcheck-graceful-shutdown.html', kind: 'doc' },
  helmet: { title: 'Helmet', url: 'https://helmetjs.github.io/', kind: 'doc' },
  cors: { title: 'MDN — Cross-Origin Resource Sharing (CORS)', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS', kind: 'doc' },
  pino: { title: 'Pino', url: 'https://getpino.io/', kind: 'doc' },
  twelveFactor: { title: 'The Twelve-Factor App', url: 'https://12factor.net/', kind: 'doc' }
};

export const lessonsB = [
{
  id: 'nex-04', moduleId: 'm2', order: 4, minutes: 80, tags: ['middlewares', 'express.json', 'helmet', 'CORS', 'limites', 'ordem'],
  title: 'Middlewares: cadeia de requisição, parsers, segurança de cabeçalhos e CORS',
  objectives: ['Escrever middlewares e entender a ordem de execução e o papel de next()', 'Configurar parsers com limites e tratar corpo inválido ou grande', 'Aplicar helmet e CORS e interpretar os cabeçalhos resultantes', 'Distinguir middleware de aplicação, de rota e de roteador', 'Evitar armadilhas: ordem, next duplo e middlewares que não respondem'],
  intro: R`Um **middleware** é uma função §(req, res, next)§ que **participa** do ciclo da requisição: registra, autentica, valida, lê o corpo, **responde** ou **passa adiante** com §next()§. O Express é basicamente **uma cadeia de middlewares**. Aqui você **mede** a ordem, o limite de **100 KB** do §express.json()§ (resposta **413**), os cabeçalhos do **helmet** e o comportamento do **CORS**.`,
  theory: R`### O que é um middleware
§§§
app.use((req, res, next) => {
  req.inicio = Date.now();           // prepara informação
  res.on('finish', () => console.log(req.method, req.path, res.statusCode, Date.now() - req.inicio, 'ms'));
  next();                            // passa para o próximo
});
§§§
Um middleware **ou responde** (§res.json(...)§) **ou chama §next()§**; se nenhuma das duas coisas acontece, a requisição **fica pendurada**. Chamar §next(err)§ (com um argumento) **pula** para o **tratador de erros** (aula nex-05).

### Onde registrar
- §app.use(mw)§: **toda** requisição (aplicação).
- §app.use('/api', mw)§: requisições cujo caminho **começa** com §/api§.
- §app.get('/x', mw1, mw2, handler)§: **só** nessa rota (middlewares de rota).
- §router.use(mw)§: dentro de um Router.
**A ordem de registro é a ordem de execução.** Medido: a requisição passou por §mw1§ → §mw2§ → rota (o log registrou §mw1:/caminho§ e depois §mw2§).

### O ciclo típico
1. **Segurança de cabeçalhos** (helmet) e **CORS**;
2. **Log de requisição** e **identificador** (§x-request-id§);
3. **Parsers** (§express.json()§);
4. **Autenticação** e **autorização** (curso C4.4);
5. **Validação** de entrada;
6. **Rotas**;
7. **404** e **tratador de erros** por último.

### Parsers e limites
§express.json()§ lê corpos §application/json§; §express.urlencoded()§, formulários; §express.raw()§/§express.text()§. O **limite padrão é 100 KB**: medido, um JSON de **~200 KB** recebeu **413** (*request entity too large*), e um JSON **malformado** (§{a:1§) recebeu **400** com a mensagem de erro do parser (**vazaria detalhes internos se você a repassasse**: aula nex-05).
- Ajuste o limite por rota: §express.json({ limit: '10kb' })§ (corpo **pequeno** para rotas comuns; grande só onde precisa, como uploads em **stream**). **Cuidado com a ordem**: medido, uma rota com §express.json({ limit: '1mb' })§ registrada **depois** do parser global de **10 KB** ainda recebeu **413** com um corpo de 20 KB (o parser global rejeitou antes); registrada **antes** dele, a rota aceitou o corpo. Registre as **exceções primeiro** ou aplique o parser **por rota**.
- **Nunca confie no tamanho**: **limite** de corpo, de **cabeçalhos** e de **tempo** protege contra abuso.

### Segurança de cabeçalhos com helmet
Medido (§helmet 8.3.0§):
- **Sem helmet**: §x-powered-by: Express§ (revela a tecnologia), sem §x-content-type-options§ nem §content-security-policy§.
- **Com helmet()**: §x-powered-by§ **removido**; §x-content-type-options: nosniff§; §strict-transport-security: max-age=31536000; includeSubDomains§; §content-security-policy: default-src 'self'; ...§ (e outros).
O helmet **não substitui** validação nem autenticação: é **endurecimento** de cabeçalhos. Para APIs puras, uma CSP restritiva importa menos que em páginas HTML, mas é **barata**. Ajuste a CSP se servir páginas.

### CORS (compartilhamento entre origens)
O **navegador** bloqueia que um site em §https://app.exemplo.com§ leia respostas de **outra origem**, **a menos que o servidor autorize** via §Access-Control-Allow-Origin§. O pacote §cors 2.8.6§:
- Medido: com §cors({ origin: 'https://app.exemplo.com' })§, a requisição com §Origin§ igual recebeu §access-control-allow-origin: https://app.exemplo.com§. Uma origem **diferente** (§https://outro.com§) **ainda recebeu 200** e o cabeçalho **fixo** da origem configurada: **quem bloqueia é o navegador**, não o servidor (CORS **não é autenticação** nem protege contra clientes que não são navegadores).
- **Pré-voo** (*preflight*): o navegador envia §OPTIONS§ antes de métodos/cabeçalhos "não simples"; medido, §OPTIONS§ com §Access-Control-Request-Method: DELETE§ devolveu **204** e §access-control-allow-methods: GET,HEAD,PUT,PATCH,POST,DELETE§.
- **Evite §origin: '*'§** com credenciais (cookies); liste as **origens exatas** (ou uma função que confere uma lista) e §credentials: true§ só se precisar.

### Middlewares de terceiros úteis
§helmet§, §cors§, §compression§ (gzip; **mede** o ganho e o custo de CPU), §express-rate-limit§ (aula api-07), §morgan§ ou **pino-http** (logs), §cookie-parser§, §multer§ (uploads multipart).

### Escrevendo um bom middleware
- **Uma responsabilidade**; nomeie e **teste** isoladamente;
- Fábrica para configurar: §const limite = (n) => (req, res, next) => ...§;
- **Não bloqueie** o loop;
- **Não modifique** §req§ de forma surpreendente; use um **namespace** (§req.contexto§) e **tipos** (em TypeScript, estenda o tipo);
- Em assíncronos, **trate erros** (no Express 5, rejeições chegam ao tratador).

### Armadilhas
- **Esquecer §next()§** (requisição pendurada) ou **chamá-lo e também responder** (§ERR_HTTP_HEADERS_SENT§);
- **Registrar parsers depois das rotas** (§req.body§ vazio);
- **Colocar o 404 antes** das rotas;
- **Confiar em cabeçalhos** do cliente (§x-forwarded-for§) sem configurar *trust proxy*.`,
  concepts: [
    { term: 'Middleware', def: 'Função (req, res, next) que processa a requisição e responde ou chama next().' },
    { term: 'next()', def: 'Passa o controle ao próximo middleware; com argumento, pula para o tratador de erros.' },
    { term: 'Body parser', def: 'Middleware que interpreta o corpo (JSON, formulário) e preenche req.body.' },
    { term: 'Limite de corpo', def: 'Tamanho máximo aceito para o corpo da requisição (padrão do express.json: 100 KB).' },
    { term: 'Helmet', def: 'Conjunto de middlewares que define cabeçalhos HTTP de segurança.' },
    { term: 'CORS', def: 'Mecanismo pelo qual o servidor autoriza o navegador a ler respostas entre origens.' },
    { term: 'Pré-voo (preflight)', def: 'Requisição OPTIONS que o navegador envia antes de uma requisição cross-origin não simples.' },
    { term: 'Request ID', def: 'Identificador único de uma requisição, propagado nos logs.' },
    { term: 'Middleware de rota', def: 'Middleware aplicado apenas a uma rota específica.' },
    { term: 'x-powered-by', def: 'Cabeçalho que revela a tecnologia do servidor e deve ser removido.' }
  ],
  examples: R`**Analogia:** a requisição passa por uma **esteira de inspeção** num aeroporto: **segurança** (helmet), **cadastro** (log), **raio-X da bagagem** (parser e limite de tamanho), **conferência do passaporte** (autenticação), **balcão** (a rota). Cada posto **libera** (next) ou **barra** (responde). A **ordem das estações** é tudo: o raio-X depois do embarque não adianta. O **CORS** é a **política da outra companhia**: o servidor diz quem pode ler a bagagem, mas **quem para o passageiro é o navegador**.

**Exemplo 1: ordem.** mw1 → mw2 → rota.

**Exemplo 2: limites.** 200 KB → 413; JSON malformado → 400.

**Exemplo 3: helmet.** x-powered-by some; nosniff e HSTS aparecem.`,
  code: [
    { title: 'Pilha típica de middlewares (JavaScript, Express 5, helmet 8, cors 2)', lang: 'js', code: R`import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { randomUUID } from 'node:crypto';

const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: ['https://app.exemplo.com'] }));
app.use((req, res, next) => {                                  // id e log de cada requisição
  req.id = req.get('x-request-id') ?? randomUUID();
  res.set('x-request-id', req.id);
  const t0 = performance.now();
  res.on('finish', () => console.log(JSON.stringify({ id: req.id, m: req.method, p: req.path, s: res.statusCode, ms: Math.round(performance.now() - t0) })));
  next();
});
app.post('/uploads-json', express.json({ limit: '1mb' }), (req, res) => res.sendStatus(204));   // exceção explícita: ANTES do parser global
app.use(express.json({ limit: '10kb' }));                      // corpo pequeno por padrão para as demais rotas`, notes: [{ l: '7', t: 'helmet define cabeçalhos de segurança.' }, { l: '12', t: 'O id acompanha a requisição nos logs.' }, { l: '16', t: 'A rota com limite maior vem antes do parser global (se vier depois, o parser global recusa com 413 antes).' }] },
    { title: 'Fábrica de middleware e erro com next(err) (JavaScript)', lang: 'js', code: R`export const exigeJson = () => (req, res, next) => {
  if (!req.is('application/json')) return next(Object.assign(new Error('Content-Type deve ser application/json'), { status: 415 }));
  next();
};
app.post('/pedidos', exigeJson(), (req, res) => res.status(201).json({ ok: true }));`, notes: [{ l: '2', t: 'next(err) pula para o tratador de erros.' }, { l: '5', t: 'Middleware de rota aplicado só em POST /pedidos.' }] }
  ],
  bestPractices: ['Registre segurança, log e parsers antes das rotas; 404 e erro por último.', 'Defina limites de corpo pequenos por padrão.', 'Remova x-powered-by e use helmet.', 'Liste origens exatas no CORS e entenda que ele não autentica.', 'Dê um identificador a cada requisição e propague-o nos logs.', 'Escreva middlewares com uma responsabilidade e teste-os.'],
  mistakes: ['Esquecer next() ou responder e chamar next().', 'Registrar o parser depois das rotas.', 'Usar origin "*" com credenciais.', 'Achar que CORS protege a API contra clientes que não são navegadores.', 'Devolver ao cliente a mensagem de erro do parser.', 'Deixar o limite de corpo no padrão em rotas que não precisam de 100 KB.'],
  market: R`Configurar corretamente middlewares, limites e CORS evita uma classe inteira de incidentes (abuso de tamanho, vazamento de tecnologia, bloqueios inexplicáveis no navegador) e é cobrado em revisões de código e de segurança.`,
  summary: R`Middlewares formam a cadeia do Express e executam na ordem de registro; cada um responde ou chama next(). Medido: o express.json() recusou ~200 KB com 413 e o JSON malformado com 400; o helmet 8.3.0 removeu x-powered-by e acrescentou nosniff, HSTS e CSP; com cors 2.8.6 uma origem não listada ainda recebeu 200 (quem bloqueia é o navegador) e o pré-voo devolveu 204. Use limites pequenos, origens exatas e ordem correta.`,
  refs: [REF.expressMiddleware, REF.expressWriteMiddleware, REF2.helmet, REF2.cors, REF2.expressSecurity],
  cards: [
    { q: 'O que um middleware deve fazer?', a: 'Responder ou chamar next(); do contrário a requisição fica pendurada.' },
    { q: 'Qual o limite padrão do express.json()?', a: '100 KB (medido: corpo de ~200 KB recebeu 413).' },
    { q: 'O que o helmet faz?', a: 'Define cabeçalhos de segurança e remove x-powered-by (medido).' },
    { q: 'CORS protege a API?', a: 'Não: só instrui o navegador; quem não é navegador ignora (medido: origem não listada recebeu 200).' },
    { q: 'Por que a ordem importa?', a: 'Os middlewares executam na ordem de registro; parsers e segurança vêm antes das rotas.' }
  ]
},
{
  id: 'nex-05', moduleId: 'm2', order: 5, minutes: 80, tags: ['erros', 'tratamento de erros', 'status HTTP', 'unhandledRejection', 'validação', 'logs'],
  title: 'Tratamento de erros: middleware de erro, classes de erro, 404 e falhas do processo',
  objectives: ['Escrever o middleware de erro (4 argumentos) e centralizar as respostas', 'Criar classes de erro de domínio e mapeá-las para status HTTP sem vazar detalhes', 'Entender como o Express 5 trata erros síncronos e assíncronos', 'Diferenciar erros operacionais de bugs e reagir a unhandledRejection e uncaughtException', 'Padronizar o formato de erro da API'],
  intro: R`Em uma API, os erros **vão acontecer**: entrada inválida, registro inexistente, banco fora do ar, bug. O que diferencia um serviço profissional é **como** o erro chega ao cliente (**status e formato corretos, sem vazar segredos**) e ao **log** (com contexto). Aqui você **mede** o comportamento do Express 5 (erros síncronos e assíncronos → mesma resposta) e o que o **Node** faz com **rejeições não tratadas** (o processo **encerra com código 1**).`,
  theory: R`### O middleware de erro
Um middleware com **quatro** parâmetros §(err, req, res, next)§ é o **tratador de erros** e deve vir **por último**:
§§§
app.use((err, req, res, next) => {
  const status = err.status ?? 500;
  if (status >= 500) log.error({ err, id: req.id }, 'erro interno');          // detalhes só no log
  res.status(status).json({ erro: status >= 500 ? 'erro interno' : err.message, status });
});
§§§
O Express chama o tratador quando: um middleware/handler **lança** (síncrono), chama §next(err)§, **ou, no Express 5, uma promise é rejeitada** (handler §async§). Medido: o handler **síncrono** que lança **e** o §async§ que lança devolveram **a mesma resposta 500** (§{"erro":"erro interno","status":500}§) através do tratador (**4 erros** passaram por ele no experimento: async, sync, JSON malformado e corpo grande).

### Não vazar detalhes
O parser de JSON devolveu a mensagem **"Expected property name or '}' in JSON at position 1"** com status **400**. Para o cliente, uma mensagem de **validação** controlada é melhor que a do motor; para **500**, **nunca** envie §err.message§, **stack** ou dados de SQL. O **log** guarda tudo; a **resposta**, o mínimo (e um **id de requisição** para suporte achar o log).

### Classes de erro de domínio
§§§
export class ErroHttp extends Error { constructor(status, mensagem, detalhes) { super(mensagem); this.status = status; this.detalhes = detalhes; } }
export const naoEncontrado = (o) => new ErroHttp(404, o + ' não encontrado');
export const invalido = (d) => new ErroHttp(422, 'dados inválidos', d);
§§§
Camadas internas lançam **erros do domínio** (sem saber de HTTP, idealmente); uma camada de borda os **traduz** para status. O tratador diferencia **erros operacionais** (esperados: entrada inválida, não encontrado, conflito, indisponibilidade de dependência) de **bugs** (programação: §TypeError§): os primeiros viram **4xx/503** informativos; os segundos, **500** + log + alerta.

### Formato de erro padronizado
Defina **um formato** e use em todas as rotas, de preferência o **RFC 9457 (Problem Details)**: §{ "type", "title", "status", "detail", "instance" }§ com §Content-Type: application/problem+json§ (aula api-02). O essencial: **status**, **mensagem curta**, **código** estável para máquinas, **detalhes de validação** por campo e **id de requisição**.

### 404 e rotas inexistentes
O último middleware **antes** do tratador devolve **404** (medido: §{"erro":"não encontrado","caminho":"/nao-existe"}§). Cuidado para **não** refletir o caminho sem escapar em HTML.

### Validação de entrada
Valide **no limite** (params, query, body, headers) com uma biblioteca de esquemas (**Zod 4**, **Joi**, **Ajv**) e responda **422** (ou 400) **com os campos inválidos**; em NestJS, **pipes** (curso C4.2). Nunca confie na entrada.

### Erros do processo
- **Rejeição de promise sem tratamento**: medido no Node 26.13.1, **encerra o processo com código 1**; com §process.on('unhandledRejection', ...)§ o processo **continua** (**código 0** ao final) e o erro é só registrado.
- **Exceção não capturada** (§uncaughtException§): **encerra o processo com código 1**.
Estratégia recomendada: **registrar o erro**, **parar de aceitar** tráfego, **terminar** as requisições em andamento (aula nex-07) e **sair** para que o **supervisor** (Docker, systemd, Kubernetes) **reinicie** um processo **limpo**: depois de uma exceção desconhecida, o estado do processo **não é confiável**. Evite "engolir" o erro e continuar.

### Erros assíncronos fora do ciclo de requisição
- **Callbacks** e **EventEmitters** (§emitter.on('error')§ **sem ouvinte** lança e derruba o processo): sempre registre o ouvinte de §'error'§.
- **Tarefas em segundo plano** disparadas sem §await§ (*fire and forget*): adicione §.catch(log)§.
- **Streams**: use §pipeline§ (aula nex-06), que propaga o erro e fecha os recursos.

### Registro do erro
Log **estruturado** (aula obs-01; exemplo com **pino**, medido: o campo §senha§ e o cabeçalho §authorization§ saíram como **[Redacted]** com a opção §redact§): nível, mensagem, **id**, rota, usuário (sem segredos), **stack** no erro interno.

### Testes de erro
Teste **cada** código de status e o **formato** da resposta, **o vazamento** (a resposta 500 não contém a stack) e o que **vai ao log**.`,
  concepts: [
    { term: 'Middleware de erro', def: 'Função com quatro parâmetros (err, req, res, next) que centraliza as respostas de erro.' },
    { term: 'Erro operacional', def: 'Falha esperada em operação normal, como entrada inválida ou dependência indisponível.' },
    { term: 'Bug', def: 'Erro de programação inesperado, tratado como 500 e alvo de correção.' },
    { term: 'Classe de erro de domínio', def: 'Classe que representa uma falha de negócio e carrega um status ou código.' },
    { term: 'Problem Details (RFC 9457)', def: 'Formato padrão de erro HTTP em JSON com type, title, status, detail e instance.' },
    { term: 'unhandledRejection', def: 'Evento emitido quando uma promise é rejeitada sem tratamento; por padrão encerra o processo.' },
    { term: 'uncaughtException', def: 'Evento de exceção não capturada; o processo deve ser reiniciado.' },
    { term: 'Redação de campos (redact)', def: 'Substituição de campos sensíveis no log por um marcador.' },
    { term: 'Fire and forget', def: 'Disparar uma tarefa assíncrona sem aguardá-la nem tratar seu erro.' },
    { term: 'Supervisor de processos', def: 'Componente (Docker, systemd, Kubernetes) que reinicia o processo quando ele encerra.' }
  ],
  examples: R`**Analogia:** o tratador de erros é o **balcão de reclamações** do hotel: **qualquer** setor que falhe encaminha o problema para lá, onde um funcionário treinado dá **uma resposta padronizada e educada** ao hóspede (sem mostrar o diário interno de falhas) e **anota tudo no livro de ocorrências** (log). Um **bug** é **um incêndio**: não se tenta continuar a festa; **evacua-se** o prédio e **abre-se um novo** (reinício pelo supervisor).

**Exemplo 1: dois caminhos, uma resposta.** Erro síncrono e assíncrono: 500 igual.

**Exemplo 2: processo.** Rejeição sem tratamento: código 1; com listener: 0.

**Exemplo 3: log.** senha e authorization como [Redacted].`,
  code: [
    { title: 'Classes de erro e tratador central (JavaScript, Express 5)', lang: 'js', code: R`export class ErroHttp extends Error {
  constructor(status, mensagem, detalhes) { super(mensagem); this.status = status; this.detalhes = detalhes; }
}
app.get('/pedidos/:id', async (req, res) => {
  const p = await repo.buscar(req.params.id);
  if (!p) throw new ErroHttp(404, 'pedido não encontrado');            // Express 5 encaminha ao tratador
  res.json(p);
});
app.use((req, res) => res.status(404).json({ erro: 'não encontrado', caminho: req.path }));
app.use((err, req, res, next) => {
  const status = err.status ?? 500;
  if (status >= 500) console.error(JSON.stringify({ id: req.id, erro: err.message, stack: err.stack }));   // detalhes só no log
  res.status(status).json({ erro: status >= 500 ? 'erro interno' : err.message, status, id: req.id });
});`, notes: [{ l: '6', t: 'throw em handler async chega ao tratador no Express 5.' }, { l: '12', t: 'O cliente não recebe mensagem nem stack de erros 500.' }] },
    { title: 'Falhas do processo (JavaScript, códigos de saída medidos)', lang: 'js', code: R`// rejeição sem tratamento: o processo encerra com código 1
Promise.reject(new Error('x'));

// com um ouvinte, o processo continua (código 0), mas o erro só foi registrado
process.on('unhandledRejection', (e) => { console.error('registrado:', e.message); });

// estratégia recomendada para erros desconhecidos
process.on('uncaughtException', (e) => {
  console.error(JSON.stringify({ nivel: 'fatal', erro: e.message, stack: e.stack }));
  servidor.close(() => process.exit(1));            // drena e sai: o supervisor reinicia um processo limpo
  setTimeout(() => process.exit(1), 10000).unref();  // prazo máximo
});`, notes: [{ l: '5', t: 'Com ouvinte, o processo não encerra.' }, { l: '11', t: 'unref evita manter o processo vivo só pelo temporizador.' }] }
  ],
  bestPractices: ['Centralize as respostas de erro em um tratador no fim da cadeia.', 'Use classes de erro com status e mensagens controladas.', 'Nunca devolva stack nem mensagens internas em respostas 500.', 'Padronize o formato de erro (Problem Details) e inclua o id da requisição.', 'Redija campos sensíveis nos logs.', 'Em erros desconhecidos do processo: registre, drene e reinicie.'],
  mistakes: ['Engolir exceções e continuar com estado possivelmente corrompido.', 'Repassar err.message do parser ou do banco ao cliente.', 'Esquecer o ouvinte de error em EventEmitters e streams.', 'Disparar tarefas sem await e sem catch.', 'Não testar os caminhos de erro.', 'Registrar o erro sem contexto (id, rota).'],
  market: R`O comportamento diante de falhas separa serviços confiáveis de serviços frágeis. Entrevistas e revisões de código procuram tratamento central, formato padronizado, vazamento de informações e a política correta para erros do processo.`,
  summary: R`O tratador de erros (4 argumentos) centraliza as respostas; no Express 5, erros síncronos e assíncronos chegam a ele (medido: ambos 500, sem vazar detalhes). O erro do parser (400) expõe a mensagem do motor: controle o que vai ao cliente. No Node 26.13.1 uma rejeição sem tratamento encerra com código 1 (com ouvinte, continua); exceção não capturada também encerra com 1. Registre, drene e deixe o supervisor reiniciar; redija campos sensíveis nos logs (pino: [Redacted]).`,
  refs: [REF.expressErrors, REF2.process, REF2.pino],
  cards: [
    { q: 'Como o Express reconhece o tratador de erros?', a: 'Pelos quatro parâmetros (err, req, res, next).' },
    { q: 'O que o Express 5 faz com um throw em handler async?', a: 'Encaminha ao tratador de erros (medido: 500).' },
    { q: 'O que acontece com uma rejeição sem tratamento no Node 26?', a: 'O processo encerra com código 1 (com ouvinte de unhandledRejection, continua).' },
    { q: 'O que nunca devolver em um 500?', a: 'Mensagens internas, stack e dados de SQL; só um erro genérico e um id.' },
    { q: 'Qual a estratégia após uma exceção não capturada?', a: 'Registrar, drenar as requisições e sair para o supervisor reiniciar.' }
  ]
},
{
  id: 'nex-06', moduleId: 'm3', order: 6, minutes: 85, tags: ['streams', 'buffers', 'backpressure', 'pipeline', 'worker threads', 'memória'],
  title: 'Streams, buffers e worker threads: processar dados grandes e tarefas de CPU',
  objectives: ['Explicar Buffer, Stream e backpressure', 'Usar pipeline para encadear streams com tratamento de erros', 'Medir a diferença de memória entre ler um arquivo inteiro e usar stream', 'Usar worker threads para CPU e medir o ganho', 'Escolher entre stream, worker, processo filho e fila'],
  intro: R`Ler um arquivo de **200 MiB** com §readFile§ aloca **200 MiB** em memória; com **stream**, o Node processa **pedaços** e a memória permanece pequena. Já tarefas de **CPU** pedem **worker threads**. Esta aula **mede** os dois: **pico de memória** (**251 MiB** x **84 MiB**) e o ganho de **4 workers** em um cálculo pesado (**18,4 s → 6,3 s**, **2,9x** em 8 núcleos).`,
  theory: R`### Buffer
Um **Buffer** é um **bloco de bytes** fora do heap do V8 (§Buffer.from('texto')§, §Buffer.alloc(n)§). Dados binários (arquivos, rede, criptografia) passam por Buffers. §buf.toString('utf8')§ decodifica. Cuidado: **fatiar** (§subarray§) **compartilha** a memória; **concatenar** muitos buffers (§Buffer.concat§) copia.

### Stream: dados em pedaços
Um **stream** processa dados **em partes (chunks)**, sem carregar tudo. Quatro tipos:
- **Readable** (fonte: §fs.createReadStream§, requisição HTTP, §process.stdin§);
- **Writable** (destino: §fs.createWriteStream§, resposta HTTP);
- **Duplex** (os dois: socket TCP);
- **Transform** (modifica: compressão §zlib.createGzip()§, *parsers*).
Streams também podem ser **iterados com §for await§** e há a **API Web Streams** (§ReadableStream§), compatível com o navegador.

### Backpressure
Se o **produtor** é mais rápido que o **consumidor**, os dados **se acumulam na memória**. **Backpressure** é o mecanismo pelo qual o consumidor **sinaliza** "pare": §writable.write(chunk)§ devolve §false§ quando o buffer interno **enche**, e o produtor deve **esperar** o evento §'drain'§. Fazer isso à mão é fácil de errar; use **§pipe§** ou, melhor, **§stream/promises.pipeline§**.

### pipeline
§§§
import { pipeline } from 'node:stream/promises';
await pipeline(fs.createReadStream('grande.log'), zlib.createGzip(), fs.createWriteStream('grande.log.gz'));
§§§
O §pipeline§: **aplica backpressure**, **propaga erros** e **destrói** todos os streams ao final ou em erro (evitando vazamento de descritores). **Prefira-o ao §pipe§**, que não faz a limpeza em erro. Em uma API: §await pipeline(arquivo, res)§ para **servir arquivos grandes** sem encher a memória.

### Medido: 200 MiB, readFile x stream
Cada método em um **processo separado** (para a memória de um não contaminar o outro), calculando um SHA-256 de um arquivo de **200 MiB**:
| Método | RSS antes | **Pico de RSS** | Tempo |
|---|---|---|---|
| §readFile§ + hash | 49 MiB | **251 MiB** | 2.298 ms |
| stream + hash | 50 MiB | **84 MiB** | 2.863 ms |
Os hashes foram **idênticos**. O stream usou **~1/3 do pico** e foi **~25% mais lento** neste teste (uma execução): paga-se um pouco de tempo por **memória previsível**. Com **100 requisições simultâneas** lendo o arquivo, o §readFile§ exigiria **~20 GiB** (conta, **não medida**): **stream não é otimização prematura** em dados grandes.
(**Correção feita no laboratório**: a primeira versão rodava os dois métodos em um só processo, e o RSS do primeiro contaminou o segundo.)

### Quando streams
Arquivos e logs grandes, **uploads/downloads**, **proxies**, **ETL**, compressão, exportações (CSV de milhões de linhas direto do banco para a resposta). Para JSON pequeno, é exagero.

### Worker threads
Para **CPU**, o módulo §node:worker_threads§ cria **threads** com seu **próprio JavaScript e event loop**, que se comunicam por **mensagens** (§postMessage§, cópia estruturada; §SharedArrayBuffer§ compartilha memória).
Medido (cálculo recursivo pesado, **4 tarefas**, **8 núcleos**): **sequencial 18.403 ms**; **4 workers em paralelo 6.341 ms**: **2,9x** (não 4x: **custo de iniciar** os workers, **contenção** de CPU/memória, turbo do processador, e a tarefa mais longa limita o total).
Regras:
- **Pool de workers** (bibliotecas como §piscina§ ou §workerpool§) em vez de criar um por requisição (o worker custa **dezenas a centenas de ms** para iniciar: na aula nex-01, **913 ms** contra 600 ms do cálculo);
- **Não use workers para E/S** (o loop já cuida);
- **Número de workers ≤ núcleos disponíveis** (§os.availableParallelism()§);
- Mensagens **grandes** custam cópia: **transfira** ArrayBuffers (§transferList§) ou compartilhe.

### Outras opções para CPU
- **Processos filhos** (§child_process§: §fork§, §spawn§): isolamento total, útil para **programas externos** (ffmpeg, ImageMagick);
- **Cluster/vários processos** para multiplicar a capacidade;
- **Fila + trabalhadores** em outro serviço (curso de filas): **melhor** para tarefas longas, com **retry** e **observabilidade**;
- **Módulos nativos/WebAssembly** para algoritmos específicos.

### Decisão rápida
| Problema | Ferramenta |
|---|---|
| Dado grande, não cabe em memória | **stream** com §pipeline§ |
| Cálculo pesado curto e frequente | **pool de workers** |
| Tarefa longa, retentável | **fila** + trabalhadores |
| Programa externo | **processo filho** |
| Mais capacidade geral | **mais processos** (e instâncias) |`,
  concepts: [
    { term: 'Buffer', def: 'Bloco de bytes de tamanho fixo, usado para dados binários.' },
    { term: 'Stream', def: 'Abstração para processar dados em pedaços ao longo do tempo.' },
    { term: 'Backpressure', def: 'Sinalização do consumidor ao produtor para reduzir o ritmo e evitar acúmulo em memória.' },
    { term: 'pipeline', def: 'Função que encadeia streams aplicando backpressure, propagando erros e limpando recursos.' },
    { term: 'Transform', def: 'Stream que modifica os dados que passam por ele, como a compressão gzip.' },
    { term: 'Worker thread', def: 'Thread com JavaScript próprio que executa tarefas de CPU e se comunica por mensagens.' },
    { term: 'transferList', def: 'Lista de objetos transferidos (não copiados) em postMessage.' },
    { term: 'Pool de workers', def: 'Conjunto reutilizável de workers que evita o custo de criar um por tarefa.' },
    { term: 'RSS', def: 'Memória residente: total de memória física usada pelo processo.' },
    { term: 'Processo filho', def: 'Processo separado iniciado pelo Node, com isolamento total.' }
  ],
  examples: R`**Analogia:** um **stream** é **água em um cano**: você bebe conforme ela passa; o **readFile** é **encher uma piscina** para depois beber um copo. A **backpressure** é o **registro** que o consumidor fecha quando o cano está cheio; o **pipeline** é **instalar o encanamento certo**, com vedação. Um **worker** é **abrir uma segunda cozinha** para um prato que demora: custa **montar** a cozinha, então se **mantém aberta** (pool) em vez de montar uma por pedido.

**Exemplo 1: memória.** 251 MiB (readFile) x 84 MiB (stream) para 200 MiB.

**Exemplo 2: workers.** 18,4 s contra 6,3 s (2,9x) com 4 tarefas e 8 núcleos.

**Exemplo 3: servir arquivo.** await pipeline(arquivo, res).`,
  code: [
    { title: 'readFile x stream com hash (JavaScript, memória medida em processos separados)', lang: 'js', code: R`import fs from 'node:fs';
import crypto from 'node:crypto';
import { pipeline } from 'node:stream/promises';

// 200 MiB: pico de RSS 251 MiB
const h1 = crypto.createHash('sha256').update(await fs.promises.readFile('grande.bin')).digest('hex');

// 200 MiB: pico de RSS 84 MiB (pedaços de 64 KiB)
const h = crypto.createHash('sha256');
await pipeline(fs.createReadStream('grande.bin'), h);
const h2 = h.digest('hex');                                   // mesmo hash`, notes: [{ l: '6', t: 'O arquivo inteiro vai para a memória.' }, { l: '10', t: 'O pipeline processa em pedaços com backpressure.' }] },
    { title: 'Servir um arquivo grande e comprimir (JavaScript, Express)', lang: 'js', code: R`import { createReadStream } from 'node:fs';
import { createGzip } from 'node:zlib';
import { pipeline } from 'node:stream/promises';

app.get('/relatorio.csv.gz', async (req, res) => {
  res.set({ 'content-type': 'text/csv', 'content-encoding': 'gzip' });
  await pipeline(createReadStream('relatorio.csv'), createGzip(), res);   // erros e fechamento tratados
});`, notes: [{ l: '7', t: 'Memória constante, mesmo com arquivos enormes.' }] },
    { title: 'Workers em paralelo (JavaScript, 4 tarefas medidas)', lang: 'js', code: R`import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';
const fib = (n) => (n < 2 ? n : fib(n - 1) + fib(n - 2));
if (!isMainThread) { parentPort.postMessage(fib(workerData.n)); process.exit(0); }

const roda = (n) => new Promise((ok, no) => { const w = new Worker(fileURLToPath(import.meta.url), { workerData: { n } }); w.once('message', ok); w.once('error', no); });
await Promise.all([40, 40, 40, 40].map(roda));     // 6.341 ms em paralelo; sequencial: 18.403 ms`, notes: [{ l: '4', t: 'O mesmo arquivo é o código do worker.' }, { l: '7', t: 'Ganho de 2,9x com 4 workers e 8 núcleos.' }] }
  ],
  bestPractices: ['Use stream e pipeline para dados grandes.', 'Prefira pipeline a pipe.', 'Use pool de workers para CPU e limite ao número de núcleos.', 'Meça memória e tempo em processos separados.', 'Para tarefas longas e retentáveis, use fila.', 'Trate sempre o evento de erro dos streams.'],
  mistakes: ['Carregar arquivos grandes com readFile em handlers.', 'Ignorar a backpressure ao escrever em laço.', 'Criar um worker por requisição.', 'Usar workers para E/S.', 'Esperar ganho linear com o número de workers.', 'Medir dois métodos de memória no mesmo processo.'],
  market: R`Streams e workers resolvem problemas reais de memória e CPU em serviços Node. Saber medir e escolher entre stream, worker, processo e fila é um diferencial em entrevistas e em incidentes de produção.`,
  summary: R`Streams processam dados em pedaços com backpressure; pipeline propaga erros e limpa recursos. Medido (cada método em um processo): um arquivo de 200 MiB com readFile chegou a 251 MiB de RSS contra 84 MiB com stream (2.298 e 2.863 ms; hashes iguais). Workers: 4 tarefas pesadas levaram 18.403 ms sequenciais e 6.341 ms em 4 workers (2,9x, 8 núcleos). Use pool de workers, fila para tarefas longas e processos filhos para programas externos.`,
  refs: [REF2.streams, REF2.streamsPipeline, REF2.buffer, REF2.workers],
  cards: [
    { q: 'O que é backpressure?', a: 'O consumidor sinaliza ao produtor para reduzir o ritmo e evitar acúmulo de dados em memória.' },
    { q: 'Por que usar pipeline em vez de pipe?', a: 'O pipeline propaga erros e destrói os streams, evitando vazamentos.' },
    { q: 'Qual o pico de memória medido para 200 MiB?', a: 'readFile 251 MiB; stream 84 MiB.' },
    { q: 'Quando usar worker threads?', a: 'Para tarefas de CPU, de preferência em um pool; não para E/S.' },
    { q: 'Por que o ganho de 4 workers foi 2,9x e não 4x?', a: 'Custo de iniciar, contenção de recursos e a tarefa mais longa limitando o total.' }
  ]
},
{
  id: 'nex-07', moduleId: 'm3', order: 7, minutes: 90, tags: ['profiling', 'produção', 'graceful shutdown', 'health check', 'logs', 'configuração', 'projeto'],
  title: 'Profiling e Node.js em produção: diagnóstico, desligamento ordenado, saúde, configuração e o projeto',
  objectives: ['Gerar e ler um perfil de CPU com --cpu-prof', 'Implementar desligamento ordenado (SIGTERM) sem derrubar requisições em andamento', 'Expor verificações de saúde (liveness e readiness)', 'Configurar a aplicação por variáveis de ambiente e logs estruturados', 'Planejar o projeto integrador "API Express pronta para produção"'],
  intro: R`Uma API em produção precisa ser **diagnosticável** (onde gasta CPU?), **reiniciável sem prejuízo** (um deploy não pode derrubar requisições em andamento), **observável** (saúde, logs) e **configurável** sem mudar código. Esta aula **mede**: um perfil de CPU (**73,6%** do tempo em uma função), o **desligamento ordenado** (sem tratamento: requisição **cai**; ordenado: **200**, e **de 4,1 s para 1,1 s** ao fechar conexões ociosas) e fecha com o **projeto**.`,
  theory: R`### Profiling de CPU
Para saber **onde o tempo é gasto**:
- §node --cpu-prof arquivo.js§ gera um arquivo §.cpuprofile§ (JSON) ao fim; abra no **Chrome DevTools** (aba Performance/JavaScript Profiler) ou no VS Code (**não executado aqui**: abrimos o JSON por código).
- Medido: um script com três funções (§lento§: laço numérico; §ordenaTudo§: cópia e ordenação; §barato§) gerou um perfil com **3.297 amostras**. O **tempo próprio** (*self time*) foi: **§lento§ 73,6% (2.798 ms)**, **§ordenaTudo§ 15,9% (605 ms)**, anônimas 7,7%, ocioso 1,6%, GC 0,3%. Conclusão: **otimize §lento§ primeiro**; a **§barato§** nem aparece. **Meça antes de otimizar.**
- **Tempo próprio** (apenas a função) x **tempo total** (com o que ela chama): procure funções com **alto tempo próprio**.
- Outras ferramentas: §--inspect§ + DevTools (ao vivo), §clinic.js§, §0x§ (flame graphs), **traces** de produção (OpenTelemetry, curso C4.6). **Não executados** aqui.
- **Memória**: §process.memoryUsage()§, **heap snapshots**, §--heap-prof§; vazamentos mostram **crescimento contínuo** do heap (descrito, não executado).

### Métricas de saúde do runtime
- **Atraso do event loop** (aula nex-01: §monitorEventLoopDelay§);
- **Uso de heap e RSS**, **GC** (§perf_hooks§);
- **Requisições em andamento** e **latência** por rota;
- **Descritores abertos**, conexões ao banco.

### Desligamento ordenado (graceful shutdown)
Em **deploys**, **escalonamento** e **reinícios**, o orquestrador envia **SIGTERM** (e depois **SIGKILL** após um prazo). Se o processo apenas morre, **requisições em andamento caem**. Medido (requisição de **1 s** em andamento, SIGTERM aos 200 ms):
| Modo | Requisição em andamento | Nova requisição após o SIGTERM | Saída | Duração |
|---|---|---|---|---|
| **Sem tratamento** | **falhou** (§UND_ERR_SOCKET§) | recusada (§ECONNRESET§) | por sinal SIGTERM | **~0,4 s** |
| **Ordenado** (§server.close§) | **200 OK** | recusada (§ECONNREFUSED§) | código 0 | **~4,1 s** |
| **Ordenado + fechar conexões ociosas após cada resposta** | **200 OK** | recusada | código 0 | **~1,1 s** |
Receita:
§§§
let encerrando = false;
process.on('SIGTERM', () => {
  encerrando = true;                              // a saúde passa a devolver 503 (readiness)
  servidor.close(() => process.exit(0));          // para de aceitar; espera as conexões ativas
  servidor.closeIdleConnections();                // fecha as ociosas agora
  setTimeout(() => process.exit(1), 25000).unref();   // prazo máximo (antes do SIGKILL)
});
app.use((req, res, next) => { res.on('finish', () => { if (encerrando) setImmediate(() => servidor.closeIdleConnections()); }); next(); });
§§§
O segundo caso demorou ~4,1 s porque as conexões **keep-alive** continuavam **abertas** após a resposta (o cliente as fechou por *timeout*); fechar as ociosas **depois de cada resposta** durante o encerramento levou o total a **~1,1 s**. **Feche também** pools de banco, filas e fluxos antes de sair; defina o prazo menor que o do orquestrador (**§terminationGracePeriodSeconds§** no Kubernetes: 30 s por padrão, **descrito, não executado**).
Atenção: em **contêineres**, o processo deve receber o sinal (**PID 1**): rode §node§ diretamente (formato *exec*) ou use **§tini§**; scripts do npm podem **não repassar** sinais.

### Verificações de saúde
- **Liveness** (§/vivo§): "o processo está de pé?" — se falhar, o orquestrador **reinicia**; **não** verifique dependências aqui.
- **Readiness** (§/pronto§): "pode receber tráfego?" — verifica **banco, cache**, e devolve **503** durante o **encerramento**.
- Respostas **leves**, sem autenticação, sem dados sensíveis.

### Configuração (12 fatores)
Siga o **"The Twelve-Factor App"**: **configuração em variáveis de ambiente** (§PORT§, §DATABASE_URL§, §LOG_LEVEL§), **nada de segredos no código**, **mesmo artefato** em todos os ambientes, **logs em stdout** (o ambiente os coleta), **processos descartáveis** (início rápido, desligamento ordenado), **paridade** entre desenvolvimento e produção. **Valide a configuração na partida** (esquema Zod) e **falhe rápido** se faltar algo. Node 22+: §node --env-file=.env§ carrega um arquivo (**não** versione o §.env§).

### Logs estruturados
JSON por linha, com nível, **tempo**, **id da requisição** e **redação** de segredos. Medido com **pino 10.4.0**: a linha trouxe §level, time, pid, hostname, rota, ms, senha, req, msg§, com §senha§ e §req.headers.authorization§ **[Redacted]**; o nível §debug§ **não** foi emitido com §level: 'info'§. (O curso C4.6 aprofunda.)

### Segurança e desempenho (checklist)
- helmet, CORS restrito, **limites de corpo**, **timeouts** (§server.requestTimeout§, §headersTimeout§), **rate limiting** (curso C4.3), **validação** de entrada, dependências atualizadas, **usuário não root** no contêiner;
- **compressão**, **cache** (curso C3.8), **pool de conexões** ao banco, **sem chamadas síncronas** nos handlers;
- **NODE_ENV=production** (afeta o Express e bibliotecas), **um processo por núcleo** (ou réplicas).

### Projeto integrador: API Express pronta para produção
**Cenário**: uma API de **tarefas** (CRUD), com **PostgreSQL** (opcional) e **Express 5**.
**Entregáveis**: estrutura em camadas (rotas, serviços, repositórios); **validação** com Zod; **tratamento de erros** padronizado; **logs com pino** e **id de requisição**; **helmet, CORS e limites**; **/vivo** e **/pronto**; **desligamento ordenado** testado (requisição em andamento termina, **código 0**); **configuração por ambiente validada**; **um relatório pesado** servido por **stream** e um cálculo em **worker**; **medições** (perfil de CPU, atraso do event loop, memória) com **um gargalo corrigido** e comparado antes/depois; **testes** de integração.`,
  concepts: [
    { term: 'Perfil de CPU', def: 'Registro amostrado de onde o tempo de CPU é gasto, gerado com --cpu-prof.' },
    { term: 'Tempo próprio (self time)', def: 'Tempo gasto na própria função, excluindo o das funções que ela chama.' },
    { term: 'Desligamento ordenado', def: 'Parar de aceitar novas requisições e terminar as em andamento antes de encerrar.' },
    { term: 'SIGTERM', def: 'Sinal pedindo o encerramento do processo, enviado por orquestradores em deploys.' },
    { term: 'Liveness', def: 'Verificação de que o processo está vivo; falhas levam ao reinício.' },
    { term: 'Readiness', def: 'Verificação de que o serviço pode receber tráfego, incluindo dependências.' },
    { term: 'Keep-alive', def: 'Conexão HTTP mantida aberta para reutilização entre requisições.' },
    { term: 'Twelve-Factor App', def: 'Conjunto de práticas para aplicações de serviço, como configuração em variáveis de ambiente.' },
    { term: 'Falhar rápido', def: 'Validar a configuração na partida e encerrar se estiver incorreta.' },
    { term: 'Redação de segredos', def: 'Substituição de valores sensíveis nos logs por um marcador.' }
  ],
  examples: R`**Analogia:** o **perfil de CPU** é um **raio-X do gasto de tempo**: mostra qual "órgão" consome, em vez de adivinhar. O **desligamento ordenado** é **fechar um restaurante**: para de aceitar **novas mesas**, **termina de servir** quem já está comendo e **só então apaga as luzes**; sem isso, o cliente **sai com a refeição pela metade**. **Liveness** é "o garçom está acordado?"; **readiness** é "a cozinha pode receber pedidos agora?".

**Exemplo 1: perfil.** lento 73,6% do tempo próprio; barato nem aparece.

**Exemplo 2: shutdown.** Sem tratamento: a requisição cai; ordenado: 200, em 4,1 s ou 1,1 s.

**Exemplo 3: configuração.** Variáveis de ambiente validadas na partida.`,
  code: [
    { title: 'Perfil de CPU lido por código (JavaScript, saída medida)', lang: 'js', code: R`import { execFileSync } from 'node:child_process'; import fs from 'node:fs'; import os from 'node:os';
const dir = fs.mkdtempSync(os.tmpdir() + '/prof-');
execFileSync('node', ['--cpu-prof', '--cpu-prof-dir=' + dir, 'quente.mjs']);
const p = JSON.parse(fs.readFileSync(dir + '/' + fs.readdirSync(dir)[0]));
const porId = new Map(p.nodes.map((n) => [n.id, n])); const self = new Map();
p.samples.forEach((id, i) => { const nome = porId.get(id).callFrame.functionName || '(anônima)'; self.set(nome, (self.get(nome) || 0) + (p.timeDeltas[i] || 0)); });
// lento 73,6% | ordenaTudo 15,9% | (anônima) 7,7% | (idle) 1,6%`, notes: [{ l: '3', t: 'Gera o arquivo .cpuprofile ao final.' }, { l: '6', t: 'Soma o tempo próprio por função.' }] },
    { title: 'Desligamento ordenado e saúde (JavaScript, Express 5)', lang: 'js', code: R`let encerrando = false;
app.get('/vivo', (req, res) => res.json({ ok: true }));
app.get('/pronto', async (req, res) => {
  if (encerrando) return res.status(503).json({ ok: false, motivo: 'encerrando' });
  try { await pool.query('select 1'); res.json({ ok: true }); } catch { res.status(503).json({ ok: false, motivo: 'banco' }); }
});
const servidor = app.listen(Number(process.env.PORT ?? 3000));
app.use((req, res, next) => { res.on('finish', () => { if (encerrando) setImmediate(() => servidor.closeIdleConnections()); }); next(); });
process.on('SIGTERM', () => {
  encerrando = true;
  servidor.close(async () => { await pool.end(); process.exit(0); });
  servidor.closeIdleConnections();
  setTimeout(() => process.exit(1), 25000).unref();
});`, notes: [{ l: '4', t: 'A readiness falha durante o encerramento.' }, { l: '8', t: 'Fecha as conexões ociosas ao fim de cada resposta.' }, { l: '11', t: 'Fecha o pool antes de sair.' }] },
    { title: 'Configuração validada na partida (JavaScript, Zod)', lang: 'js', code: R`import { z } from 'zod';
const env = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development')
}).parse(process.env);          // lança na partida se algo estiver errado (falhar rápido)
export default env;`, notes: [{ l: '7', t: 'A aplicação nem sobe com configuração inválida.' }] }
  ],
  bestPractices: ['Meça com perfil antes de otimizar e ataque o maior tempo próprio.', 'Trate SIGTERM: pare de aceitar, drene, feche recursos e saia com prazo máximo.', 'Separe liveness de readiness e falhe a readiness ao encerrar.', 'Configure por variáveis de ambiente e valide na partida.', 'Escreva logs estruturados em stdout, com id e redação.', 'Garanta que o processo é o PID 1 recebendo sinais no contêiner.'],
  mistakes: ['Otimizar sem medir.', 'Deixar o processo morrer em deploys, derrubando requisições.', 'Checar dependências na liveness e causar reinícios em cascata.', 'Versionar o .env ou colocar segredos no código.', 'Esquecer as conexões keep-alive ociosas ao encerrar.', 'Rodar o app por um script que não repassa sinais.'],
  market: R`Diagnóstico de desempenho, desligamento ordenado, saúde e configuração por ambiente são exigências de qualquer plataforma moderna (Kubernetes, ECS, Cloud Run) e perguntas frequentes em entrevistas e passagens de produção.`,
  summary: R`O --cpu-prof revelou onde o tempo foi gasto (lento 73,6%, ordenaTudo 15,9%); meça antes de otimizar. No desligamento: sem tratamento a requisição em andamento caiu; com server.close ficou 200 mas levou ~4,1 s por causa do keep-alive; fechando as conexões ociosas após cada resposta, ~1,1 s. Separe liveness e readiness, configure por variáveis validadas na partida e registre logs estruturados com redação. O projeto reúne tudo em uma API Express pronta para produção.`,
  refs: [REF2.profiling, REF2.cliCpuProf, REF2.perfHooks, REF2.http, REF2.expressShutdown, REF2.expressPerformance, REF2.twelveFactor],
  cards: [
    { q: 'Como gerar um perfil de CPU?', a: 'Com node --cpu-prof, que grava um arquivo .cpuprofile ao final.' },
    { q: 'O que fazer ao receber SIGTERM?', a: 'Marcar o encerramento, parar de aceitar, drenar requisições, fechar recursos e sair com um prazo máximo.' },
    { q: 'Liveness x readiness?', a: 'Liveness diz se o processo está vivo (reinício); readiness diz se pode receber tráfego (inclui dependências).' },
    { q: 'Por que o encerramento ordenado levou ~4,1 s?', a: 'Conexões keep-alive ociosas continuaram abertas; fechá-las após cada resposta levou a ~1,1 s.' },
    { q: 'Onde ficam os segredos e a configuração?', a: 'Em variáveis de ambiente validadas na partida, nunca no código nem no repositório.' }
  ]
}
];
