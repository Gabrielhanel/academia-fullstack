// C4.3 — APIs REST, GraphQL e WebSockets. Aulas 4 a 6 (GraphQL; WebSockets; paginação, filtros e rate limiting).
import { REF } from './c43-a.mjs';
const R = String.raw;

export const REF2 = {
  graphqlLearn: { title: 'GraphQL — Learn', url: 'https://graphql.org/learn/', kind: 'doc' },
  graphqlSpec: { title: 'GraphQL Specification', url: 'https://spec.graphql.org/', kind: 'especificação' },
  graphqlJs: { title: 'GraphQL.js', url: 'https://www.graphql-js.org/', kind: 'doc' },
  graphqlOverHttp: { title: 'GraphQL over HTTP', url: 'https://graphql.github.io/graphql-over-http/', kind: 'especificação' },
  dataloader: { title: 'DataLoader', url: 'https://github.com/graphql/dataloader', kind: 'doc' },
  yoga: { title: 'GraphQL Yoga', url: 'https://the-guild.dev/graphql/yoga-server', kind: 'doc' },
  rfc6455: { title: 'RFC 6455 — The WebSocket Protocol', url: 'https://www.rfc-editor.org/rfc/rfc6455', kind: 'especificação' },
  mdnWs: { title: 'MDN — WebSockets API', url: 'https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API', kind: 'doc' },
  mdnSse: { title: 'MDN — Server-sent events', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events', kind: 'doc' },
  wsLib: { title: 'ws — WebSocket library for Node.js', url: 'https://github.com/websockets/ws', kind: 'doc' },
  noOffset: { title: 'Use The Index, Luke — Paging through results', url: 'https://use-the-index-luke.com/no-offset', kind: 'artigo' },
  rfc6585: { title: 'RFC 6585 — Additional HTTP Status Codes (429)', url: 'https://www.rfc-editor.org/rfc/rfc6585', kind: 'especificação' },
  rateLimitRepo: { title: 'express-rate-limit', url: 'https://github.com/express-rate-limit/express-rate-limit', kind: 'doc' },
  owaspApi: { title: 'OWASP API Security Top 10', url: 'https://owasp.org/API-Security/', kind: 'guia' }
};

export const lessonsB = [
{
  id: 'api-04', moduleId: 'm2', order: 4, minutes: 85, tags: ['GraphQL', 'schema', 'resolvers', 'DataLoader', 'N+1', 'profundidade', 'erros parciais'],
  title: 'GraphQL: schema, resolvers, N+1 com DataLoader, erros parciais e limites de custo',
  objectives: ['Escrever um schema GraphQL (tipos, queries, argumentos) e resolvers', 'Reconhecer e resolver o N+1 com DataLoader, medindo as consultas', 'Interpretar erros parciais e o status HTTP das respostas', 'Proteger a API contra consultas profundas e caras', 'Decidir entre REST e GraphQL'],
  intro: R`No **GraphQL** o cliente **descreve exatamente os dados** de que precisa em **uma consulta** a um **único endpoint**; o servidor devolve **só isso**. Isso resolve o *over/under-fetching* do REST, mas traz **novos riscos**: o **N+1** nos resolvers (medido: **50 consultas** contra **1** com DataLoader) e **consultas arbitrariamente caras** (a resposta cresceu de **2,9 KB** para **385 KB** com mais níveis).`,
  theory: R`### Schema e resolvers
O **schema** é **fortemente tipado** (SDL):
§§§
type Autor { id: ID! nome: String! posts: [Post!]! }
type Post  { id: ID! titulo: String! autor: Autor! }
type Query { posts(limite: Int = 10): [Post!]!  autor(id: ID!): Autor }
§§§
- **Query** (leitura), **Mutation** (escrita), **Subscription** (tempo real); **escalares** (§Int§, §String§, §ID§...), **objetos**, **enums**, **interfaces**, **unions**, **inputs**; §!§ = **não nulo**.
- **Resolvers**: função por **campo** §(pai, args, contexto)§. Campos sem resolver usam a **propriedade** do objeto pai. O executor percorre a consulta e chama os resolvers **campo a campo**.
- **Introspecção**: o schema é **consultável** (ferramentas, autocompletar). Medido: o schema de exemplo expôs 15 tipos (inclui os internos §__Schema§ etc.), entre eles §Autor§, §Post§ e §Query§. **Desative em produção** se a API não for pública.
Medido com **graphql 17.1.0** e **GraphQL Yoga 6.1.1**.

### O problema N+1
A consulta §{ posts(limite: 50) { titulo autor { nome } } }§ chama o resolver de §Post.autor§ **uma vez por post**: com um resolver ingênuo que consulta o autor, **1 + 50 = 51** idas ao banco (aqui, **50 consultas a autores**; os 50 posts vieram de memória). A solução é o **DataLoader**: **agrupa** (*batching*) as chamadas do **mesmo ciclo** em **uma** função de lote e **faz cache por requisição**:
§§§
const autores = new DataLoader(async (ids) => buscarAutoresPorIds(ids));   // 1 consulta com WHERE id IN (...)
Post: { autor: (p, _, ctx) => ctx.autores.load(p.autorId) }
§§§
Medido: **50 consultas** sem DataLoader × **1 consulta** com DataLoader, mesmos **50 posts**. **Crie um DataLoader por requisição** (o cache é por requisição: nunca global, para não vazar dados entre usuários nem servir dados antigos).

### Erros parciais e status HTTP
O GraphQL pode devolver **dados e erros juntos**: um campo que falha vira §null§ (e o erro aparece em §errors§ com o §path§), **sem derrubar** os demais campos (se o campo for §!§, o §null§ **propaga** ao pai). Medido (Yoga): uma consulta com um campo que lança devolveu **HTTP 200**, §errors[0].message = "Unexpected error."§ (o Yoga **mascara** erros inesperados por padrão, **protegendo** detalhes internos) e §path: ["falha"]§ com os outros dados presentes; uma consulta **inválida** (§Cannot query field "campoInexistente" on type "Post"§) também voltou **200** com o corpo §application/json§. Consequências: **monitoramento por status HTTP não vê os erros** — meça **erros no corpo**; clientes precisam checar §errors§. A especificação *GraphQL over HTTP* define o tipo §application/graphql-response+json§ com status **4xx** para erros de validação (**não executado** aqui). Para erros de negócio, use **extensões** (§extensions.code§) estáveis; **não** vaze detalhes.

### Custo e profundidade: proteja o servidor
Como o **cliente controla a consulta**, ele pode pedir **ciclos** (§autor { posts { autor { posts ... } } }§). Medido (20 posts, ciclos autor→posts):
| Níveis autor→posts | Profundidade | Tempo | Resposta |
|---|---|---|---|
| 1 | 4 | 6,8 ms | 2.903 bytes |
| 3 | 6 | 20,7 ms | 15.226 bytes |
| 5 | 8 | 49,5 ms | 76.841 bytes |
| 7 | 10 | **221,4 ms** | **384.916 bytes** |
Cada par de níveis multiplicou a resposta por **~5** (cada autor tem 5 posts): **crescimento exponencial** com dados maiores. Defesas:
- **limite de profundidade** (medido: uma regra de validação com limite 5 **recusou** a consulta de profundidade 8: "profundidade 8 excede o limite 5");
- **análise de custo/complexidade** (atribuir custo por campo/lista e rejeitar acima do orçamento);
- **limite de itens por lista** (§first ≤ 100§), **paginação obrigatória**;
- **timeout** e **limite de tamanho do corpo**;
- **consultas persistidas** (*persisted queries*): só consultas **pré-registradas** são aceitas (ótimo para **apps próprios**);
- **rate limiting por custo**;
- **desabilitar introspecção/GraphiQL** em produção;
- **autorização por campo/objeto** nos resolvers (não só na rota).

### Mutations e inputs
§mutation { criarPedido(input: { ... }) { id } }§: **uma** operação de escrita por vez (executadas **em série**); use **tipos input** e **payloads** de resultado (§{ pedido, erros }§) para **erros de negócio tipados**. A **idempotência** (aula api-07) vale igualmente.

### REST ou GraphQL?
| | REST | GraphQL |
|---|---|---|
| Busca de dados | endpoints fixos (excesso/falta) | o cliente escolhe os campos |
| Cache HTTP | **natural** (GET, URL) | difícil (POST único); *persisted queries/GET* ajudam |
| Versionamento | explícito | evolução por **depreciação** de campos |
| Ferramentas | maduras (OpenAPI) | tipagem forte, introspecção, geração de código |
| Riscos | N+1 do cliente, muitos endpoints | N+1 no servidor, **consultas caras**, complexidade |
| Melhor para | APIs públicas simples, CRUD, cache | **muitos clientes diferentes** (web, mobile), grafos de dados, BFF |
Não é "um ou outro": **REST nas bordas públicas** e **GraphQL como BFF** (*backend for frontend*) é comum. **Federação** (várias equipes compondo um supergrafo) é um tópico avançado (**não executado**).

### Boas práticas
Schema **orientado ao cliente**, nomes consistentes, **depreciação** em vez de remoção (§@deprecated§), **paginação por cursor** (conexões), **DataLoader por requisição**, limites de custo, **mascaramento** de erros internos, **testes** de resolvers e do schema, **monitoramento por operação** (nomeie as consultas).`,
  concepts: [
    { term: 'Schema GraphQL', def: 'Descrição fortemente tipada dos dados e operações disponíveis.' },
    { term: 'Resolver', def: 'Função que produz o valor de um campo do schema.' },
    { term: 'N+1 em resolvers', def: 'Uma consulta por item de uma lista ao resolver um campo relacionado.' },
    { term: 'DataLoader', def: 'Utilitário que agrupa e deduplica chamadas de carga no mesmo ciclo, com cache por requisição.' },
    { term: 'Erros parciais', def: 'Resposta com dados e erros juntos, em que campos com falha viram null.' },
    { term: 'Limite de profundidade', def: 'Regra que recusa consultas com aninhamento acima de um valor.' },
    { term: 'Análise de custo', def: 'Cálculo de um custo estimado da consulta para aceitá-la ou recusá-la.' },
    { term: 'Consulta persistida', def: 'Consulta pré-registrada identificada por um id, única aceita pelo servidor.' },
    { term: 'Introspecção', def: 'Capacidade de consultar o próprio schema.' },
    { term: 'BFF', def: 'Backend for Frontend: camada de API sob medida para um tipo de cliente.' }
  ],
  examples: R`**Analogia:** o REST é um **restaurante com pratos fixos** (você pode receber mais ou menos do que quer); o GraphQL é o **buffet com balança**: você monta o prato exato — mas **se pedir 7 camadas de tudo**, a cozinha trabalha demais, por isso há **limite de pratos e de camadas**. O **N+1** é o garçom que **vai à despensa uma vez para cada ingrediente**; o **DataLoader** é o garçom que **anota tudo e busca de uma vez**.

**Exemplo 1: N+1.** 50 consultas a autores sem DataLoader, 1 com.

**Exemplo 2: erro parcial.** 200 com data e errors e mensagem mascarada.

**Exemplo 3: profundidade.** De 2,9 KB para 385 KB com mais ciclos.`,
  code: [
    { title: 'Schema, resolvers e DataLoader (JavaScript, graphql 17.1.0 e Yoga; contagens medidas)', lang: 'js', code: R`import DataLoader from 'dataloader';
import { createSchema } from 'graphql-yoga';
import { execute, parse } from 'graphql';

const sdl = 'type Autor { id: ID! nome: String! posts: [Post!]! } type Post { id: ID! titulo: String! autor: Autor! } type Query { posts(limite: Int = 10): [Post!]! }';
let consultasAutor = 0;
const buscarAutores = async (ids) => { consultasAutor++; return ids.map((id) => autores.find((a) => a.id === Number(id))); };

const ingenuo = { Query: { posts: (_, { limite }) => posts.slice(0, limite) }, Post: { autor: (p) => buscarAutores([p.autorId]).then((r) => r[0]) } };
const comLoader = { Query: ingenuo.Query, Post: { autor: (p, _, ctx) => ctx.autores.load(p.autorId) } };

const consulta = '{ posts(limite: 50) { titulo autor { nome } } }';
await execute({ schema: createSchema({ typeDefs: sdl, resolvers: ingenuo }), document: parse(consulta), contextValue: {} });                                   // consultasAutor = 50
consultasAutor = 0;
await execute({ schema: createSchema({ typeDefs: sdl, resolvers: comLoader }), document: parse(consulta), contextValue: { autores: new DataLoader(buscarAutores) } });   // consultasAutor = 1`, notes: [{ l: '9', t: 'Sem lote: uma chamada por post.' }, { l: '14', t: 'DataLoader novo por requisição agrupa as chamadas em uma.' }] },
    { title: 'Regra de validação de profundidade (JavaScript, resultado medido)', lang: 'js', code: R`import { GraphQLError, parse, validate, specifiedRules } from 'graphql';
const profundidade = (doc) => { let max = 0; const visita = (sel, d) => { for (const s of sel.selectionSet?.selections ?? []) { max = Math.max(max, d + 1); visita(s, d + 1); } }; for (const def of doc.definitions) if (def.kind === 'OperationDefinition') visita(def, 0); return max; };
const limite = (n) => (ctx) => ({ OperationDefinition(node) { const p = profundidade({ definitions: [node] }); if (p > n) ctx.reportError(new GraphQLError('profundidade ' + p + ' excede o limite ' + n)); } });
validate(schema, parse(consultaCiclica), [...specifiedRules, limite(5)]);   // recusada: profundidade 8 excede o limite 5`, notes: [{ l: '3', t: 'A regra roda na validação, antes de qualquer resolver.' }] }
  ],
  bestPractices: ['Use DataLoader por requisição para campos relacionados.', 'Limite profundidade, custo, tamanho de listas e tempo.', 'Mascare erros internos e use códigos estáveis em extensions.', 'Monitore erros no corpo, não apenas o status HTTP.', 'Deprecie campos em vez de removê-los.', 'Considere consultas persistidas para apps próprios.'],
  mistakes: ['Resolvers que consultam o banco por item.', 'DataLoader global compartilhado entre requisições.', 'Aceitar consultas arbitrariamente profundas.', 'Deixar introspecção e GraphiQL abertos em produção.', 'Autorizar só na rota e não nos campos.', 'Achar que GraphQL substitui sempre o REST.'],
  market: R`GraphQL é comum em empresas com muitos clientes (web e mobile) e em camadas BFF; o N+1 e a proteção contra consultas caras são perguntas clássicas de entrevista.`,
  summary: R`O GraphQL tem schema tipado e resolvers por campo. Medido: 50 posts geraram 50 consultas a autores sem DataLoader e 1 com ele; erros parciais voltam com HTTP 200 e mensagem mascarada pelo Yoga; as respostas cresceram de 2,9 KB para 385 KB (6,8 → 221 ms) com mais ciclos e uma regra de profundidade recusou a consulta de profundidade 8. Proteja com limites de profundidade, custo e paginação e escolha GraphQL x REST conforme o cenário.`,
  refs: [REF2.graphqlLearn, REF2.graphqlSpec, REF2.graphqlJs, REF2.graphqlOverHttp, REF2.dataloader, REF2.yoga],
  cards: [
    { q: 'O que é o N+1 no GraphQL?', a: 'Um resolver de campo relacionado que consulta o banco uma vez por item da lista.' },
    { q: 'Como o DataLoader ajuda?', a: 'Agrupa as chamadas do mesmo ciclo em um lote e faz cache por requisição (medido: 50 → 1).' },
    { q: 'Por que o status HTTP é 200 com erros?', a: 'Porque o GraphQL devolve erros parciais no corpo; monitore o campo errors.' },
    { q: 'Como proteger contra consultas caras?', a: 'Limite de profundidade, análise de custo, paginação obrigatória, timeouts e consultas persistidas.' },
    { q: 'O DataLoader pode ser global?', a: 'Não: crie um por requisição para não vazar nem servir dados antigos.' }
  ]
},
{
  id: 'api-05', moduleId: 'm2', order: 5, minutes: 85, tags: ['WebSockets', 'tempo real', 'heartbeat', 'backpressure', 'autenticação', 'SSE', 'escala'],
  title: 'WebSockets: tempo real com ws, autenticação, heartbeat, limites e consumidores lentos',
  objectives: ['Explicar o protocolo (upgrade HTTP, mensagens, códigos de fechamento) e quando usar WebSockets, SSE ou polling', 'Autenticar e validar a origem no handshake', 'Limitar o tamanho das mensagens e tratar o erro do socket', 'Implementar heartbeat para detectar clientes mortos', 'Medir broadcast e o efeito de consumidores lentos'],
  intro: R`**WebSockets** abrem um **canal bidirecional persistente** sobre uma conexão HTTP "promovida" (*upgrade*). Servem para **chat, notificações, jogos, painéis ao vivo**. O custo é **estado no servidor** por conexão: é preciso cuidar de **autenticação**, **limites**, **clientes mortos** e **consumidores lentos**. Aqui você mede tudo com a biblioteca **ws 8.23.0**: **401/403** no handshake, fechamento **1009**, **heartbeat**, broadcast para **300 clientes** e **98 MiB** acumulados para um cliente que não lê.`,
  theory: R`### O protocolo em resumo (RFC 6455)
1. O cliente faz um **GET** com §Upgrade: websocket§ e §Sec-WebSocket-Key§; o servidor responde **101 Switching Protocols**.
2. A conexão TCP passa a trocar **frames** (texto, binário, **ping/pong**, **close**) **nos dois sentidos**, com **baixo overhead** por mensagem.
3. O fechamento carrega um **código**: **1000** normal; **1001** saindo; **1006** anormal (sem frame de close); **1008** violação de política; **1009** **mensagem grande demais**; **1011** erro interno; **1013** *try again later*.
No navegador: §new WebSocket(url)§; **não há cabeçalhos personalizados** no handshake (a autenticação usa **cookie**, **token na URL/subprotocolo** ou uma **mensagem inicial**).

### WebSocket, SSE ou polling?
| | Polling | **SSE** (Server-Sent Events) | **WebSocket** |
|---|---|---|---|
| Direção | cliente→servidor | **servidor→cliente** | **bidirecional** |
| Protocolo | HTTP normal | HTTP (text/event-stream), reconexão automática | upgrade para um protocolo próprio |
| Complexidade | mínima | baixa | **maior** (estado, heartbeat, escala) |
| Bom para | atualizações raras | **notificações, feeds, progresso** | **chat, jogos, colaboração, baixa latência nos dois sentidos** |
**Regra**: se só o **servidor** envia, **SSE** costuma bastar (e atravessa proxies melhor).

### Autenticação e origem no handshake (medido)
Com §verifyClient§ (ws): checar o **token** (§?token=§ ou cookie) e a **Origin**:
- origem permitida + token correto → **aceito**;
- token errado → **HTTP 401**;
- origem errada → **HTTP 403**.
**Por quê a Origin**: o navegador **envia cookies** automaticamente em um WebSocket para qualquer origem: sem checar a Origin, um site malicioso pode abrir um canal **como o usuário** (**CSWSH**, *Cross-Site WebSocket Hijacking*). **Cuidado com tokens na URL** (aparecem em logs e históricos): prefira **cookie com SameSite**, **ticket de uso único de vida curta** obtido por HTTP autenticado, ou **mensagem inicial de autenticação** com prazo. Use **wss://** (TLS) sempre.

### Limites e o erro do socket (medido)
- §maxPayload: 1 MiB§: ao receber uma mensagem de **2 MiB**, a conexão foi **fechada com o código 1009**. **Importante**: o socket do **servidor** emitiu o erro §WS_ERR_UNSUPPORTED_MESSAGE_LENGTH§; **sem um ouvinte de §error§**, a primeira versão do teste **derrubou o processo** com §RangeError§. **Sempre** faça §socket.on('error', ...)§.
- Valide **cada mensagem** (JSON + esquema, aula api-03); limite **taxa de mensagens por conexão** e **número de conexões por usuário/IP**; **tamanho de fila**.

### Heartbeat: detectar clientes mortos
Conexões podem **morrer sem aviso** (celular sem sinal, NAT que expira): o servidor continua achando que estão abertas. **Ping/pong** periódico resolve:
§§§
const t = setInterval(() => { for (const s of wss.clients) { if (!s.vivo) { s.terminate(); continue; } s.vivo = false; s.ping(); } }, 30000);
wss.on('connection', (s) => { s.vivo = true; s.on('pong', () => { s.vivo = true; }); s.on('error', console.error); });
§§§
Medido (ping a cada 150 ms, um cliente que **não responde** com §autoPong: false§): o servidor **encerrou o cliente morto** e manteve o saudável. Em produção, intervalos de **20–60 s** (menores que o *idle timeout* do balanceador).

### Broadcast e consumidores lentos (medido)
- **Broadcast para 300 clientes** (1.500 mensagens entregues, **cliente e servidor no mesmo processo**): latência **mediana 29,3 ms**, **p95 54,6 ms**: inclui a **competição pela mesma thread** (um teste com clientes em outros processos daria números menores).
- **Consumidor lento**: enviando **400 × 256 KiB (~100 MiB)** para um cliente que **não lia**, o §bufferedAmount§ no servidor chegou a **98 MiB** — **memória acumulada por conexão**. Política: **limite de buffer** (§if (s.bufferedAmount > LIMITE) { descarta ou fecha com 1013 }§), **descartar mensagens antigas** (estado mais recente basta, como cotações), **mensagens pequenas** e **compressão** com critério (**custo de CPU/memória**).

### Escala e arquitetura
- **Estado por conexão**: cada instância guarda os sockets dos **seus** clientes. Para falar com um usuário conectado em **outra instância**, use um **barramento** (Redis pub/sub, NATS, Kafka; aulas nsq-06 e cch-05) ou **roteamento por afinidade**.
- **Balanceador** com **sticky sessions** (ou não: a reconexão deve funcionar em **qualquer** instância); **idle timeout** compatível com o heartbeat.
- **Reconexão automática** no cliente com **backoff exponencial e jitter**, **retomada** (último id recebido) e **idempotência** das mensagens.
- **Deploys**: o **desligamento ordenado** (aula nex-07) deve **fechar com 1001** e o cliente reconectar.
- **Limites do SO**: descritores de arquivo por processo.
- **Socket.IO**: biblioteca com **salas, reconexão e fallback** (acrescenta protocolo próprio; **não executado**).

### Mensagens: contrato
Defina um **envelope**: §{ tipo, id, dados }§, **versão** do protocolo, **ack** quando necessário, **ordem** e **entrega** (*at-most-once* por padrão: **a mensagem pode se perder** se a conexão cair): para **garantias**, use **ids sequenciais, reenvio e confirmação** ou uma fila.`,
  concepts: [
    { term: 'WebSocket', def: 'Protocolo de comunicação bidirecional persistente iniciado por um upgrade de HTTP.' },
    { term: 'Upgrade (101)', def: 'Mecanismo pelo qual uma conexão HTTP passa a usar outro protocolo.' },
    { term: 'Código de fechamento', def: 'Número que indica o motivo do fim da conexão, como 1000 (normal) e 1009 (mensagem grande).' },
    { term: 'CSWSH', def: 'Sequestro de WebSocket entre sites, quando a origem não é verificada no handshake.' },
    { term: 'Heartbeat', def: 'Troca periódica de ping e pong para detectar conexões mortas.' },
    { term: 'maxPayload', def: 'Tamanho máximo aceito para uma mensagem em uma conexão.' },
    { term: 'bufferedAmount', def: 'Quantidade de bytes enfileirados para envio em um socket.' },
    { term: 'SSE', def: 'Server-Sent Events: fluxo unidirecional do servidor para o cliente sobre HTTP.' },
    { term: 'Broadcast', def: 'Envio da mesma mensagem a vários clientes conectados.' },
    { term: 'Consumidor lento', def: 'Cliente que lê mais devagar do que o servidor envia, acumulando dados em memória.' }
  ],
  examples: R`**Analogia:** o HTTP é **trocar cartas**; o WebSocket é **uma ligação telefônica aberta**: rápida nos dois sentidos, mas **cada linha ocupa uma telefonista** (memória). Perguntar "**quem está ligando?**" (autenticação e Origin) antes de atender evita trote. O **heartbeat** é **dizer "alô?" de vez em quando** para saber se o outro lado ainda está na linha. O **consumidor lento** é **alguém que não atende enquanto você fala sem parar**: as palavras se acumulam na central até **estourar a memória**.

**Exemplo 1: handshake.** Token errado: 401; origem errada: 403.

**Exemplo 2: limite.** 2 MiB com maxPayload de 1 MiB: fecho 1009.

**Exemplo 3: lentidão.** 98 MiB acumulados para um cliente que não lê.`,
  code: [
    { title: 'Servidor ws com autenticação, limites e heartbeat (JavaScript, ws 8.23.0)', lang: 'js', code: R`import { WebSocketServer } from 'ws';
import http from 'node:http';
const servidor = http.createServer();
const wss = new WebSocketServer({
  server: servidor, maxPayload: 1024 * 1024,
  verifyClient: (info, cb) => {
    const token = new URL(info.req.url, 'http://x').searchParams.get('token');
    if (info.origin !== 'https://app.exemplo.com') return cb(false, 403, 'origem não permitida');
    if (token !== 'segredo') return cb(false, 401, 'token inválido');
    cb(true);
  }
});
wss.on('connection', (s) => {
  s.vivo = true;
  s.on('pong', () => { s.vivo = true; });
  s.on('error', (e) => console.error('socket:', e.code));                 // obrigatório: sem isso o processo pode cair
  s.on('message', (m) => { /* valide o JSON e o esquema; limite a taxa */ });
});
setInterval(() => { for (const s of wss.clients) { if (!s.vivo) { s.terminate(); continue; } s.vivo = false; s.ping(); } }, 30000).unref();`, notes: [{ l: '7', t: 'A origem impede o sequestro entre sites.' }, { l: '16', t: 'O ouvinte de error evita derrubar o processo (medido).' }, { l: '19', t: 'Ping periódico detecta clientes mortos.' }] },
    { title: 'Proteção contra consumidor lento (JavaScript)', lang: 'js', code: R`const LIMITE = 5 * 1024 * 1024;       // 5 MiB por conexão
function enviar(socket, mensagem) {
  if (socket.readyState !== socket.OPEN) return;
  if (socket.bufferedAmount > LIMITE) { socket.close(1013, 'try again later'); return; }     // ou descarte mensagens antigas
  socket.send(mensagem);
}
// medido: sem o limite, 400 x 256 KiB enviados a um cliente que não lia acumularam 98 MiB no servidor`, notes: [{ l: '4', t: 'Fecha com 1013 quando o buffer passa do limite.' }] }
  ],
  bestPractices: ['Autentique no handshake e verifique a Origin; use wss.', 'Limite o tamanho e a taxa das mensagens e valide cada uma.', 'Sempre registre o ouvinte de error nos sockets.', 'Use heartbeat com intervalo menor que o idle timeout do balanceador.', 'Controle bufferedAmount e descarte ou feche consumidores lentos.', 'Prefira SSE quando só o servidor envia.'],
  mistakes: ['Não verificar a Origin (CSWSH).', 'Token na URL sem cuidado com logs.', 'Esquecer o ouvinte de error e derrubar o processo.', 'Não detectar clientes mortos.', 'Broadcast sem controle de memória.', 'Supor entrega garantida das mensagens.'],
  market: R`Tempo real aparece em chat, painéis, jogos e colaboração; o cuidado com autenticação, memória por conexão e escala horizontal é o que diferencia um protótipo de um serviço de produção.`,
  summary: R`WebSockets criam um canal bidirecional após um upgrade 101. Medido com ws 8.23.0: o handshake recusou token errado (401) e origem errada (403); uma mensagem de 2 MiB com maxPayload de 1 MiB fechou com 1009 (e exigiu o ouvinte de error); o heartbeat encerrou o cliente morto; o broadcast para 300 clientes teve mediana de 29,3 ms e p95 de 54,6 ms (mesmo processo); um cliente lento acumulou 98 MiB. Use SSE quando basta, limite buffers e planeje a escala com um barramento.`,
  refs: [REF2.rfc6455, REF2.mdnWs, REF2.mdnSse, REF2.wsLib, REF2.owaspApi],
  cards: [
    { q: 'Por que verificar a Origin no handshake?', a: 'Para evitar o sequestro de WebSocket entre sites (CSWSH), já que o navegador envia cookies.' },
    { q: 'O que significa o fechamento 1009?', a: 'Mensagem grande demais (medido com maxPayload de 1 MiB).' },
    { q: 'Para que serve o heartbeat?', a: 'Detectar conexões mortas com ping/pong e encerrá-las.' },
    { q: 'O que é bufferedAmount?', a: 'Bytes enfileirados para envio no socket; cresce com consumidores lentos (medido: 98 MiB).' },
    { q: 'SSE ou WebSocket?', a: 'SSE se só o servidor envia; WebSocket se a comunicação é bidirecional.' }
  ]
},
{
  id: 'api-06', moduleId: 'm2', order: 6, minutes: 85, tags: ['paginação', 'keyset', 'cursor', 'filtros', 'rate limiting', 'token bucket', '429'],
  title: 'Paginação, filtros e rate limiting: offset x cursor em 1 milhão de linhas e limites de taxa',
  objectives: ['Comparar paginação por OFFSET e por cursor (keyset) com medições', 'Projetar filtros, ordenação estável e limites de página', 'Explicar a inconsistência do OFFSET com dados que mudam', 'Implementar e medir limitação de taxa (janela fixa, balde de fichas) e os cabeçalhos 429', 'Aplicar limites por chave e escolher políticas'],
  intro: R`Toda coleção grande precisa de **paginação**, e toda API pública precisa de **limites de taxa**. A escolha ingênua (**OFFSET**) **degrada** com a profundidade: em **1 milhão de linhas** (PostgreSQL 17.12), a página **40.000** levou **~488 ms** contra **~2,1 ms** com **keyset** (**~234x**). E o limite de taxa mal escolhido (**janela fixa**) deixa passar **o dobro** na virada da janela.`,
  theory: R`### Paginação por OFFSET
§GET /eventos?pagina=40000&limite=20§ → §ORDER BY criado DESC, id DESC LIMIT 20 OFFSET 799980§. **Simples**, permite **pular** para qualquer página e mostrar "página X de N". Problemas:
- **Custo cresce com a profundidade**: o banco **lê e descarta** as linhas puladas. Medido (1 milhão de linhas, índice §(criado desc, id desc)§, medianas de 7): **página 1: 2,65 ms; página 1.000 (offset 19.980): 14,5 ms; página 40.000 (offset 799.980): 487,6 ms**;
- **Inconsistência**: se entram registros durante a navegação, as linhas **deslocam**. Medido: depois de inserir **5** eventos novos no topo, a página 2 por OFFSET **repetiu 5 ids** da página 1;
- **COUNT(*)** para o total custa: **~101 ms** para 1 milhão de linhas (aula sqe/pgm): evite ou **aproxime** (§reltuples§, cache), ou **não mostre** o total.

### Paginação por cursor (keyset)
Em vez de "pular N", diga "**a partir daqui**": o cursor é o **último item visto** (§criado, id§):
§§§
SELECT id, criado, texto FROM eventos
WHERE (criado, id) < ($1, $2)            -- comparação de linha (row value), usa o índice
ORDER BY criado DESC, id DESC LIMIT 20;
§§§
Medido: **~2,1 ms** **em qualquer profundidade** (a partir da linha 19.980: **2,14 ms**; da 799.980: **2,09 ms**) — **~234x** mais rápido que o OFFSET na página 40.000 — e as **mesmas linhas** da página 1.000 por OFFSET; **0 ids repetidos** após as inserções. Requisitos:
- **Ordenação total e estável**: inclua um **desempate único** (§id§) na ordem e no cursor;
- **Índice** que corresponda à ordem (§(criado desc, id desc)§);
- Cursor **opaco** para o cliente (base64 do JSON §{criado,id}§, **assinado** se quiser impedir adulteração) e §proximoCursor§ **nulo** no fim;
- **Sem "ir à página 500"**: é a troca. Para **navegação direta**, combine com **busca/filtros** ou use OFFSET **limitado** (primeiras páginas).
No **GraphQL**, o padrão é a **conexão** (§edges/node/cursor/pageInfo§). Em REST: §{ dados, proximoCursor }§ ou cabeçalho §Link: <...>; rel="next"§.

### Filtros, ordenação e limites
- **Lista de permissão** de campos filtráveis e ordenáveis (**nunca** coloque o nome de coluna do usuário no SQL; **parametrize** valores);
- **Índices** para os filtros comuns (curso C3); filtros **combinados** precisam de índices **compostos**;
- **Limite máximo** de página (§limite ≤ 100§) e **padrão** razoável;
- **Ordenação estável** sempre; **ordens configuráveis** só nas colunas indexadas;
- Para **exportações grandes**, use **streaming** (aula nex-06) ou **jobs** assíncronos, não páginas infinitas.

### Rate limiting: por que e como
**Objetivos**: proteger **disponibilidade** (abuso, bugs de clientes), **custos** e **justiça** entre clientes; mitigar **força bruta**. Resposta: **429 Too Many Requests** (RFC 6585) com §Retry-After§ e, de preferência, cabeçalhos §RateLimit§ (rascunho IETF).
Medido com **express-rate-limit 8.7.5** (§limit: 5§, janela de **2 s**): **8 requisições seguidas** → **200 200 200 200 200 429 429 429**; a 429 trouxe §ratelimit: limit=5, remaining=0, reset=2§, §ratelimit-policy: 5;w=2§ e §retry-after: 2§; **depois da janela**, **200**.

### Algoritmos
| Algoritmo | Ideia | Característica |
|---|---|---|
| **Janela fixa** | contador por janela de tempo | simples; **rajada de 2x na virada** |
| **Janela deslizante** | considera os últimos N segundos | mais justo; mais memória/cálculo |
| **Balde de fichas** (*token bucket*) | fichas repostas a taxa constante; cada requisição gasta uma | **permite rajadas controladas** (capacidade) e **taxa média** |
| **Balde furado** (*leaky bucket*) | fila que escoa a taxa constante | **suaviza** o tráfego |
| **Concorrência** | no máximo N em andamento | protege recursos caros |
Medido (limite de **10 por segundo**, 10 requisições nos últimos ~100 ms da janela 1 e 10 nos primeiros ~50 ms da janela 2): **janela fixa aceitou 20** em ~100 ms; **balde de fichas aceitou 11** (10 + 1 ficha reposta). A virada da janela fixa **dobra** a rajada.

### Por quem limitar
- **Por chave** (API key, usuário, tenant), **por IP** (cuidado: **NAT** compartilhado e *trust proxy*), **por rota** (login mais restrito), **por custo** (consulta cara pesa mais).
Medido: com cota **por chave** (3 por 5 s), a **chave A** (5 requisições) teve §200 200 200 429 429§ e a **chave B** (2 requisições) §200 200§: um cliente **não consome** a cota do outro.
- **Onde**: no **gateway/CDN** (aula api-08) e/ou na aplicação; para **várias instâncias**, o contador precisa ser **compartilhado** (Redis, aulas nsq-06 e cch-05; **não executado** aqui com várias instâncias) — um contador por processo permite **N × limite**.
- **Cliente educado**: respeitar §Retry-After§, **backoff exponencial com jitter**, não repetir sem pausa.
- **Segurança**: limite **login e recuperação de senha** por conta e por IP; **bloqueio gradual**; **CAPTCHA** em suspeitas (curso de segurança); registre e **alerte**.

### Boas práticas
Paginação por **cursor** como padrão; **limites máximos**; **índices** que acompanham filtros e ordem; **429 com Retry-After**; limites **por chave** e **por rota**; **testes** de borda (virada de janela, concorrência); documentar **limites** no OpenAPI.`,
  concepts: [
    { term: 'Paginação por OFFSET', def: 'Pula N linhas e devolve as seguintes; o custo cresce com a profundidade.' },
    { term: 'Paginação por cursor (keyset)', def: 'Usa o último item visto como ponto de partida, mantendo custo constante com índice.' },
    { term: 'Ordenação estável', def: 'Ordem total garantida por um desempate único, como o id.' },
    { term: 'Cursor opaco', def: 'Token que o cliente devolve sem interpretar para continuar a paginação.' },
    { term: 'Rate limiting', def: 'Controle da taxa de requisições que um cliente pode fazer.' },
    { term: '429 Too Many Requests', def: 'Status que indica excesso de requisições, com Retry-After.' },
    { term: 'Janela fixa', def: 'Algoritmo que conta requisições em janelas de tempo alinhadas, sujeito a rajadas na virada.' },
    { term: 'Balde de fichas', def: 'Algoritmo em que fichas são repostas a taxa constante e cada requisição consome uma.' },
    { term: 'Retry-After', def: 'Cabeçalho que informa quanto esperar antes de tentar de novo.' },
    { term: 'Limite por chave', def: 'Cota aplicada separadamente a cada cliente identificado.' }
  ],
  examples: R`**Analogia:** a paginação por **OFFSET** é **contar as páginas do começo do livro toda vez** para achar a 40.000ª; o **cursor** é **o marcador de página**: abre direto onde parou, mesmo que alguém tenha acrescentado capítulos no início (sem repetir páginas). O **rate limit** é a **catraca do metrô**: a **janela fixa** libera 10 passageiros no último segundo do relógio e 10 no primeiro do seguinte (20 em instantes); o **balde de fichas** libera **na cadência** das fichas repostas.

**Exemplo 1: custo.** 2,65 ms na página 1 e 487,6 ms na 40.000 (OFFSET) contra ~2,1 ms (keyset).

**Exemplo 2: consistência.** 5 ids repetidos por OFFSET e 0 por keyset.

**Exemplo 3: rajada.** 20 aceitas (janela fixa) contra 11 (balde).`,
  code: [
    { title: 'Keyset pagination em SQL e Node (pg 8.23.1; medidas)', lang: 'js', code: R`// OFFSET: página 40.000 -> ~488 ms
await pool.query('select id, criado, texto from eventos order by criado desc, id desc limit $1 offset $2', [20, 799980]);

// keyset: a partir do último item visto -> ~2,1 ms em qualquer profundidade
const cursor = JSON.parse(Buffer.from(req.query.cursor, 'base64url').toString());      // { criado, id }
const { rows } = await pool.query(
  'select id, criado, texto from eventos where (criado, id) < ($1, $2) order by criado desc, id desc limit $3',
  [cursor.criado, cursor.id, 21]);                                                       // pede 21 para saber se há próxima página
const temMais = rows.length > 20; const itens = rows.slice(0, 20);
const proximo = temMais ? Buffer.from(JSON.stringify({ criado: itens.at(-1).criado, id: itens.at(-1).id })).toString('base64url') : null;
// índice: CREATE INDEX ON eventos (criado DESC, id DESC)`, notes: [{ l: '5', t: 'Cursor opaco em base64url (assine se quiser impedir adulteração).' }, { l: '8', t: 'Buscar limite + 1 revela se há próxima página sem COUNT.' }] },
    { title: 'Balde de fichas e limite por chave (JavaScript)', lang: 'js', code: R`const baldes = new Map();
function permitir(chave, capacidade = 10, reposicaoPorSeg = 10, agora = Date.now()) {
  const b = baldes.get(chave) ?? { fichas: capacidade, ultimo: agora };
  b.fichas = Math.min(capacidade, b.fichas + ((agora - b.ultimo) / 1000) * reposicaoPorSeg); b.ultimo = agora;
  const ok = b.fichas >= 1; if (ok) b.fichas -= 1; baldes.set(chave, b);
  return { ok, restantes: Math.floor(b.fichas), esperaSeg: ok ? 0 : Math.ceil((1 - b.fichas) / reposicaoPorSeg) };
}
app.use((req, res, next) => {
  const r = permitir(req.get('x-api-key') ?? req.ip);
  res.set('RateLimit-Remaining', String(r.restantes));
  if (!r.ok) return res.status(429).set('Retry-After', String(r.esperaSeg)).json({ type: 'about:blank', title: 'Muitas requisições', status: 429 });
  next();
});`, notes: [{ l: '3', t: 'Repõe fichas conforme o tempo decorrido.' }, { l: '11', t: '429 com Retry-After, como na RFC 6585.' }] }
  ],
  bestPractices: ['Use cursor (keyset) com ordenação total e índice correspondente.', 'Imponha limites máximos de página e listas de permissão de filtros.', 'Evite COUNT exato em tabelas grandes ou aproxime-o.', 'Responda 429 com Retry-After e limite por chave e por rota.', 'Prefira balde de fichas ou janela deslizante à janela fixa.', 'Compartilhe os contadores entre instâncias.'],
  mistakes: ['OFFSET profundo em tabelas grandes.', 'Ordenar sem desempate e perder ou repetir itens.', 'Nome de coluna vindo do cliente no ORDER BY.', 'Limite por processo em um serviço com várias instâncias.', 'Limitar só por IP atrás de NAT.', 'Não documentar nem testar a virada da janela.'],
  market: R`Paginação eficiente e limites de taxa são requisitos de qualquer API em escala; a comparação OFFSET x keyset com números é uma resposta forte em entrevistas.`,
  summary: R`Em 1 milhão de linhas, o OFFSET custou 2,65 ms (página 1), 14,5 ms (1.000) e 487,6 ms (40.000), enquanto o keyset ficou em ~2,1 ms em qualquer posição (~234x), devolveu as mesmas linhas e não repetiu ids (o OFFSET repetiu 5 após inserções); o COUNT custou ~101 ms. O express-rate-limit devolveu 200x5 e 429x3 com Retry-After; a janela fixa aceitou 20 em ~100 ms contra 11 do balde de fichas; a cota por chave isolou os clientes.`,
  refs: [REF2.noOffset, REF2.rfc6585, REF2.rateLimitRepo, REF2.owaspApi, REF.rfc9110],
  cards: [
    { q: 'Por que o OFFSET degrada?', a: 'O banco lê e descarta as linhas puladas: medido 2,65 ms na página 1 e 487,6 ms na 40.000.' },
    { q: 'O que o keyset exige?', a: 'Ordenação total com desempate único, um índice correspondente e um cursor com o último item visto.' },
    { q: 'Qual o problema da janela fixa?', a: 'A rajada na virada da janela deixa passar até o dobro do limite (medido: 20 contra 11 do balde).' },
    { q: 'Como responder ao exceder o limite?', a: '429 com Retry-After e, de preferência, cabeçalhos RateLimit.' },
    { q: 'Como saber se há próxima página sem COUNT?', a: 'Buscar limite + 1 itens e conferir se veio o extra.' }
  ]
}
];
