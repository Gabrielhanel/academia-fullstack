// C4.3 — APIs REST, GraphQL e WebSockets. Aulas 7 e 8 (idempotência e versionamento; gateways, contratos e projeto).
import { REF } from './c43-a.mjs';
const R = String.raw;

export const REF3 = {
  idemDraft: { title: 'IETF — The Idempotency-Key HTTP Header Field (draft)', url: 'https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/', kind: 'especificação' },
  stripeIdem: { title: 'Stripe — Idempotent requests', url: 'https://docs.stripe.com/api/idempotent_requests', kind: 'doc' },
  rfc9745: { title: 'RFC 9745 — The Deprecation HTTP Response Header Field', url: 'https://www.rfc-editor.org/rfc/rfc9745', kind: 'especificação' },
  rfc8594: { title: 'RFC 8594 — The Sunset HTTP Header Field', url: 'https://www.rfc-editor.org/rfc/rfc8594', kind: 'especificação' },
  semver: { title: 'Semantic Versioning 2.0.0', url: 'https://semver.org/', kind: 'especificação' },
  apiGateway: { title: 'microservices.io — API Gateway pattern', url: 'https://microservices.io/patterns/apigateway.html', kind: 'artigo' },
  bff: { title: 'Sam Newman — Backends For Frontends', url: 'https://samnewman.io/patterns/architectural/bff/', kind: 'artigo' },
  circuitBreaker: { title: 'Martin Fowler — Circuit Breaker', url: 'https://martinfowler.com/bliki/CircuitBreaker.html', kind: 'artigo' },
  tolerantReader: { title: 'Martin Fowler — Tolerant Reader', url: 'https://martinfowler.com/bliki/TolerantReader.html', kind: 'artigo' },
  pact: { title: 'Pact — Documentation', url: 'https://docs.pact.io/', kind: 'doc' }
};

export const lessonsC = [
{
  id: 'api-07', moduleId: 'm3', order: 7, minutes: 85, tags: ['idempotência', 'Idempotency-Key', 'versionamento', 'depreciação', 'Sunset', 'compatibilidade'],
  title: 'Idempotência e versionamento: retentativas seguras, depreciação e evolução sem quebrar',
  objectives: ['Implementar Idempotency-Key com replay, conflito de corpo e proteção contra concorrência', 'Medir o efeito de retentativas com e sem chave', 'Comparar estratégias de versionamento (URL, cabeçalho de mídia) e usar Deprecation, Sunset e Link', 'Distinguir mudanças compatíveis de incompatíveis', 'Definir uma política de depreciação'],
  intro: R`Redes falham: o cliente envia um pagamento, **não recebe a resposta** e **tenta de novo**. Sem cuidado, o cliente é **cobrado duas vezes** (medido: **2 cobranças**). A **chave de idempotência** resolve (medido: **1 cobrança**, mesmo com **5 requisições simultâneas**). E, com o tempo, a API **precisa mudar**: o **versionamento** e a **depreciação** comunicam isso sem **quebrar** os clientes.`,
  theory: R`### O problema das retentativas
**Timeout**, queda de conexão, **502/504** e **reenvios automáticos** (bibliotecas, filas, usuários que clicam duas vezes) fazem a **mesma operação chegar mais de uma vez**. Métodos **idempotentes** (GET, PUT, DELETE) são seguros de repetir **se implementados direito** (aula api-01); **POST** não. Medido: dois POSTs do mesmo pagamento em uma rota ingênua → **2 cobranças**.

### Idempotency-Key
O cliente envia um **identificador único** por **operação lógica** (§Idempotency-Key: k-1§, normalmente um **UUID v4**), **reutilizado nas retentativas**. O servidor:
1. **Sem chave** → **400** (para operações que a exigem);
2. **Primeira vez**: registra a chave como **em andamento**, **executa**, **guarda a resposta** (status e corpo) com um **hash do corpo da requisição**;
3. **Mesma chave e mesmo corpo**: **devolve a resposta guardada** (**replay**), **sem repetir o efeito** (marque §Idempotent-Replayed: true§);
4. **Mesma chave e corpo diferente** → **422** (uso incorreto da chave);
5. **Mesma chave em andamento** (concorrência) → **409** com §Retry-After§ (ou espere pelo resultado).
Medido (Express 5.3.0, pagamento de 30 ms):
- **1ª**: **201** §{"id":"pg_1","valor":100}§; **2ª** (mesma chave e corpo): **201** com o **mesmo** §id§, **replayed: true**, **cobranças: 1**;
- **mesma chave com outro corpo**: **422** "chave reutilizada com outro corpo"; **sem chave**: **400**;
- **5 requisições simultâneas com a mesma chave**: **um 201 e quatro 409**, **1 cobrança**; uma nova tentativa depois: **201 replayed**, ainda **1** cobrança.
Isso é o formato usado por provedores de pagamento (**Stripe**) e descrito num **rascunho do IETF** (*Idempotency-Key header*).

### Implementação de produção
O Map em memória do exemplo **não serve**: use **armazenamento compartilhado e durável** com **atomicidade**:
- **Banco**: tabela §idempotencia(chave PRIMARY KEY, hash, estado, status, corpo, criado_em)§; inserir com **§INSERT ... ON CONFLICT DO NOTHING§** (aulas sqe e trx) **na mesma transação** do efeito, para que "**registrar a chave e aplicar o efeito**" seja **atômico** (se o servidor cair no meio, nada fica pela metade);
- **Redis** com §SET chave valor NX EX§ (aula nsq-06) para o estado "em andamento" (**sem** garantia transacional com o banco);
- **Escopo da chave**: por **cliente/tenant** e **operação** (evita colisões e vazamento);
- **TTL** (24 h a alguns dias) e **limpeza**;
- **Processadores de fila**: a **chave** é o **id da mensagem/negócio** (aula nst-08).
**Efeitos externos** (e-mail, cobrança em outro sistema): repasse a **mesma chave** ao serviço externo (**idempotência ponta a ponta**) e use o padrão **outbox** (curso de microsserviços).

### Versionamento: estratégias
| Estratégia | Exemplo | Prós | Contras |
|---|---|---|---|
| **URL** | §/v1/usuarios§, §/v2/usuarios§ | **visível**, fácil de rotear e cachear | URLs "mudam"; duplica rotas |
| **Cabeçalho de mídia** | §Accept: application/vnd.exemplo.v2+json§ | URLs estáveis, **negociação de conteúdo** | menos visível; precisa de §Vary: Accept§ |
| **Parâmetro** | §?versao=2§ | simples | polui a URL e o cache |
| **Evolução sem versão** (aditiva) | só adicionar campos | **sem quebra** | exige disciplina; não resolve remoções |
Medido: §/v1/usuarios/1§ → §{"id":1,"nome":"Ana"}§; §/v2/usuarios/1§ → §{"id":1,"nomeCompleto":"Ana Silva","nome":"Ana"}§; §GET /usuarios/1§ com §Accept: application/vnd.exemplo.v2+json§ → a v2, com §Content-Type§ da versão e §Vary: Accept§; **sem** §Accept§ → a **v1 (padrão)**.
**Versione o contrato, não o código**: poucas versões **maiores** (v1, v2), **mudanças compatíveis** continuam na mesma versão; **semver** vale para **bibliotecas/SDKs**; em APIs HTTP, costuma-se expor só a **major**.

### Compatível ou incompatível?
**Compatível**: adicionar **campos** na resposta, endpoints novos, parâmetros **opcionais**, novos valores de enum **se o contrato avisou que são abertos**. **Incompatível**: remover/renomear campos, mudar **tipo** ou **semântica**, tornar algo **obrigatório**, mudar **status** ou o formato de erro, **apertar** validações.
Medido: um cliente antigo que lê §nome§ **continuou funcionando** com a v2 (campo novo adicionado, nada removido): **ANA**; com uma versão que **removeu** §nome§, **quebrou**: **TypeError: Cannot read properties of undefined (reading 'toUpperCase')**. O **leitor tolerante** (*tolerant reader*) ignora o que não conhece e **depende só do necessário**; **teste de contrato** (aula api-03) verifica isso.

### Depreciação e descontinuação
Comunique com **cabeçalhos** padronizados:
- **§Deprecation§** (RFC 9745): **data estruturada** em que o recurso foi/será depreciado (§Deprecation: @1767225600§; o valor **§true§** de rascunhos antigos **não é** o formato da RFC);
- **§Sunset§** (RFC 8594): **data** em que **deixará de funcionar** (§Sunset: Wed, 01 Jul 2027 00:00:00 GMT§);
- **§Link§** com §rel="successor-version"§ (a versão nova) e §rel="deprecation"§ (documentação).
Medido: a v1 devolveu os três: §deprecation: @1767225600§, §sunset: Wed, 01 Jul 2027 00:00:00 GMT§, §link: </v2/usuarios/1>; rel="successor-version"§.
**Processo**: 1) **anunciar** (changelog, e-mail, cabeçalhos); 2) **medir o uso** da versão antiga (por cliente/chave); 3) **apoiar** a migração (guia, SDKs); 4) **prazo** realista (meses); 5) **brownout** (desligamentos curtos e planejados para revelar dependências); 6) **desligar** com **410 Gone** e mensagem; 7) **registrar** no **ADR**.

### GraphQL e eventos
No **GraphQL**, evolua por **adição** e **§@deprecated(reason:)§**, medindo o uso de cada campo antes de remover. Em **eventos/filas**, versione o **esquema da mensagem** (campo §versao§ e **registro de esquemas**) e mantenha consumidores **tolerantes**.`,
  concepts: [
    { term: 'Idempotency-Key', def: 'Cabeçalho com um identificador único por operação, permitindo repetir requisições sem repetir efeitos.' },
    { term: 'Replay', def: 'Devolução da resposta guardada de uma requisição já executada com a mesma chave.' },
    { term: 'Outbox', def: 'Padrão que grava o efeito e a mensagem na mesma transação para publicação posterior.' },
    { term: 'Versionamento por URL', def: 'Estratégia que coloca a versão no caminho, como /v2.' },
    { term: 'Versionamento por mídia', def: 'Estratégia que usa o Accept com um tipo de mídia versionado.' },
    { term: 'Mudança compatível', def: 'Alteração que não quebra clientes existentes, como adicionar um campo opcional.' },
    { term: 'Deprecation', def: 'Cabeçalho (RFC 9745) que sinaliza que um recurso foi ou será depreciado.' },
    { term: 'Sunset', def: 'Cabeçalho (RFC 8594) que indica a data de desativação de um recurso.' },
    { term: 'Brownout', def: 'Desligamento curto e planejado de uma versão antiga para identificar quem ainda a usa.' },
    { term: '410 Gone', def: 'Status que indica que o recurso foi removido permanentemente.' }
  ],
  examples: R`**Analogia:** a **chave de idempotência** é o **número do pedido no balcão**: se você volta dizendo "o pedido 123, não recebi", o atendente **entrega o mesmo pedido** em vez de **cozinhar outro**; se você diz "pedido 123, mas agora quero outra coisa", ele **recusa** (422); se duas pessoas gritam "123" ao mesmo tempo, **uma é atendida e a outra espera** (409). O **versionamento com depreciação** é **avisar nos corredores do prédio** que o **elevador antigo será desativado** em tal data (Sunset), indicando **o novo elevador** (successor-version), em vez de **trancá-lo de surpresa**.

**Exemplo 1: sem chave.** Duas tentativas, duas cobranças.

**Exemplo 2: com chave.** Cinco simultâneas: um 201, quatro 409, uma cobrança.

**Exemplo 3: depreciação.** v1 com Deprecation, Sunset e Link para a v2.`,
  code: [
    { title: 'Idempotency-Key com replay, conflito e concorrência (JavaScript, Express 5; resultados medidos)', lang: 'js', code: R`import crypto from 'node:crypto';
const memoria = new Map();                          // em produção: tabela com PRIMARY KEY (chave) ou Redis SET NX EX
const hash = (o) => crypto.createHash('sha256').update(JSON.stringify(o)).digest('hex').slice(0, 10);

app.post('/pagamentos', async (req, res) => {
  const chave = req.get('Idempotency-Key');
  if (!chave) return res.status(400).json({ erro: 'Idempotency-Key obrigatório' });
  const h = hash(req.body); const reg = memoria.get(chave);
  if (reg) {
    if (reg.hash !== h) return res.status(422).json({ erro: 'chave reutilizada com outro corpo' });
    if (reg.estado === 'em-andamento') return res.status(409).set('Retry-After', '1').json({ erro: 'requisição em andamento' });
    return res.status(reg.status).set('Idempotent-Replayed', 'true').json(reg.corpo);        // replay
  }
  memoria.set(chave, { hash: h, estado: 'em-andamento' });                                   // síncrono: reserva a chave antes de qualquer await
  const corpo = await cobrar(req.body);                                                      // o efeito acontece uma vez
  memoria.set(chave, { hash: h, estado: 'concluido', status: 201, corpo });
  res.status(201).json(corpo);
});
// 5 requisições simultâneas: 1 x 201 e 4 x 409; cobranças = 1`, notes: [{ l: '14', t: 'A reserva da chave acontece antes do await: sem isso, duas requisições passariam.' }, { l: '10', t: 'Corpo diferente com a mesma chave é uso incorreto (422).' }] },
    { title: 'Versionamento por URL e por mídia, com depreciação (JavaScript, cabeçalhos medidos)', lang: 'js', code: R`api.get('/v1/usuarios/1', (req, res) => {
  res.set('Deprecation', '@1767225600')                                        // RFC 9745: data estruturada
     .set('Sunset', 'Wed, 01 Jul 2027 00:00:00 GMT')                           // RFC 8594
     .set('Link', '</v2/usuarios/1>; rel="successor-version"')
     .json({ id: 1, nome: 'Ana' });
});
api.get('/v2/usuarios/1', (req, res) => res.json({ id: 1, nomeCompleto: 'Ana Silva', nome: 'Ana' }));   // adiciona sem remover

api.get('/usuarios/1', (req, res) => {
  const v = /vnd\.exemplo\.v(\d+)\+json/.exec(req.get('accept') ?? '')?.[1] ?? '1';   // padrão: v1
  res.set('Vary', 'Accept').set('Content-Type', 'application/vnd.exemplo.v' + v + '+json').send(JSON.stringify(v === '2' ? v2 : v1));
});`, notes: [{ l: '2', t: 'Deprecation usa a data estruturada da RFC 9745, não "true".' }, { l: '11', t: 'Vary: Accept evita que caches misturem versões.' }] }
  ],
  bestPractices: ['Exija Idempotency-Key em operações criadoras sensíveis e escope a chave por cliente.', 'Registre a chave e aplique o efeito atomicamente, com armazenamento durável e compartilhado.', 'Prefira mudanças compatíveis e clientes tolerantes.', 'Comunique depreciações com Deprecation, Sunset e Link e meça o uso.', 'Use Vary: Accept ao versionar por mídia.', 'Defina prazos, brownouts e o desligamento com 410.'],
  mistakes: ['Confiar que o cliente nunca repete.', 'Memória local como armazenamento de chaves em um serviço com várias instâncias.', 'Reservar a chave depois de um await e abrir uma janela de corrida.', 'Mudar o contrato sem versão nem aviso.', 'Usar o valor "true" em Deprecation.', 'Remover campos sem medir quem os usa.'],
  market: R`Idempotência é requisito em pagamentos e integrações; versionamento e depreciação disciplinados são o que mantém ecossistemas de API saudáveis e são tema recorrente de design de sistemas.`,
  summary: R`Retentativas duplicam efeitos em POST: sem chave, 2 cobranças. Com Idempotency-Key, medido: replay com o mesmo id, 422 para outro corpo, 400 sem chave, e entre 5 requisições simultâneas um 201 e quatro 409 com 1 cobrança. Em produção, registre chave e efeito atomicamente em armazenamento compartilhado. Versione por URL ou por mídia (Vary: Accept), prefira mudanças compatíveis (o cliente antigo funcionou com o campo novo e quebrou com a remoção) e comunique depreciações com Deprecation (@data), Sunset e Link.`,
  refs: [REF3.idemDraft, REF3.stripeIdem, REF3.rfc9745, REF3.rfc8594, REF3.tolerantReader],
  cards: [
    { q: 'O que o servidor faz com a mesma chave e o mesmo corpo?', a: 'Devolve a resposta guardada (replay) sem repetir o efeito.' },
    { q: 'E com a mesma chave e corpo diferente?', a: 'Recusa com 422: uso incorreto da chave.' },
    { q: 'O que é uma mudança incompatível?', a: 'Remover/renomear campos, mudar tipos ou semântica; medido: o cliente antigo quebrou ao faltar "nome".' },
    { q: 'Qual o formato correto do cabeçalho Deprecation?', a: 'Data estruturada da RFC 9745, como @1767225600; "true" vem de rascunhos antigos.' },
    { q: 'Por que usar Vary: Accept?', a: 'Para caches não misturarem versões negociadas por mídia.' }
  ]
},
{
  id: 'api-08', moduleId: 'm3', order: 8, minutes: 90, tags: ['API gateway', 'BFF', 'disjuntor', 'timeout', 'contratos', 'Pact', 'projeto'],
  title: 'API gateways e contratos: roteamento, autenticação na borda, timeouts, disjuntor e o projeto',
  objectives: ['Explicar o papel de um API gateway e do BFF e seus riscos', 'Implementar roteamento, autenticação na borda, propagação de id, timeout e disjuntor', 'Medir o custo do salto extra e o comportamento diante de um upstream lento', 'Aplicar testes de contrato entre consumidor e provedor', 'Planejar o projeto integrador "API com contratos e tempo real"'],
  intro: R`Com vários serviços e clientes, um **API gateway** vira a **porta de entrada**: **roteia**, **autentica**, **limita taxa**, **traduz** protocolos e **protege** os serviços. Aqui você **constrói e mede** um gateway didático: **roteamento** e **autenticação na borda** (401), **propagação do id** da requisição, **custo do salto extra (~2,1 ms)**, **timeout de 100 ms** (504) e **disjuntor** (503 em poucos ms, **3 chamadas** ao upstream em **6** tentativas).`,
  theory: R`### O que um gateway faz
- **Roteamento**: §/api/usuarios/*§ → serviço de usuários; §/api/pedidos/*§ → serviço de pedidos (**um endereço** para os clientes);
- **Autenticação e autorização grossa** na **borda** (validar o token uma vez; repassar a identidade);
- **Rate limiting** e **quotas** (aula api-06), **WAF**, **CORS**, **TLS**;
- **Observabilidade**: **id de correlação**, métricas, logs de acesso;
- **Resiliência**: **timeout**, **retry** controlado, **disjuntor**, **balanceamento**;
- **Transformação**: agregação de respostas, tradução de protocolos (REST ↔ gRPC), **cache**.
Exemplos reais: **Kong**, **Envoy/Istio**, **NGINX**, **AWS API Gateway**, **Apigee**, **Traefik** (**não executados** aqui; o gateway do laboratório é **didático**).
**Riscos**: **ponto único de falha** (precisa de **alta disponibilidade**), **gargalo**, **acúmulo de lógica de negócio** (gateway **burro** é melhor: lógica nos serviços), **acoplamento** e **latência** extra.

### BFF (Backend for Frontend)
Um **gateway por tipo de cliente** (web, mobile, parceiros) que **compõe** chamadas e entrega **o formato certo** a cada um. Reduz **múltiplas idas** e **sobrecarga de dados** nos clientes. **Custo**: **mais serviços** para manter; evite **duplicar** regra de negócio (ela fica nos serviços de domínio). **GraphQL** é um candidato natural a BFF (aula api-04).

### Medido: o gateway do laboratório
Dois serviços (§usuarios§, §pedidos§) e um gateway (Express 5.3.0, §fetch§ com §AbortSignal.timeout§):
1. **Roteamento e id**: §GET /api/usuarios/7§ → **200**; o gateway criou o §x-request-id§ (UUID), **devolveu-o** ao cliente e o **serviço viu o mesmo id**; **sem token** → **401** (o serviço **não foi chamado**: 1 chamada total); rota desconhecida → **404**.
2. **Custo do salto** (200 requisições sequenciais, mediana): **direto 2,72 ms** × **via gateway 4,84 ms**: **~2,1 ms** a mais por requisição, em **localhost** (em rede real soma-se a latência do segundo salto).
3. **Timeout e disjuntor** (timeout **100 ms**; disjuntor abre após **3 falhas** por **400 ms**; upstream que leva **400 ms**): as 6 respostas foram **504 (119 ms), 504 (113 ms), 504 (107 ms), 503 (5 ms), 503 (3 ms), 503 (3 ms)**; **só 3 chamadas chegaram ao upstream** (as outras 3 foram **recusadas** pelo disjuntor em **3–5 ms**). Depois de **450 ms** com o upstream recuperado: **200**, com **1** chamada.
**Observação importante**: o timeout do gateway **abandona a espera**, mas **o upstream continuou trabalhando** nas 3 requisições (as chamadas foram **contadas** no upstream): para **economizar** de verdade, o **upstream** também precisa de **timeouts** e de **cancelamento** (§AbortSignal§).

### Disjuntor (circuit breaker)
Três estados: **fechado** (chamadas normais; conta falhas), **aberto** (**falha rápido**, sem chamar o upstream, por um tempo) e **semiaberto** (deixa **uma** chamada de teste; se passar, **fecha**; se falhar, **reabre**). Benefícios: **evita acumular requisições** em um serviço doente, **dá tempo para recuperar** e **protege** quem chama (threads, conexões). Defina **limites** (taxa de falhas ou contagem), **tempo aberto**, **o que conta como falha** (timeout, 5xx; **não** 4xx) e **plano B** (cache, valor padrão, mensagem clara). **Retry** só para **operações idempotentes**, com **backoff e jitter** e **limite** (senão amplifica a carga: *retry storm*).

### Contratos entre serviços
- **Provedor**: valida **suas respostas** contra o OpenAPI (aula api-03) no CI;
- **Consumidor**: declara em testes o **que usa** (campos, tipos, status) e gera um **contrato** (Pact, **não executado**); o provedor **verifica** esses contratos antes de publicar (**contract testing dirigido pelo consumidor**);
- Medido: o gateway espera §id§ e §total§ **numéricos**; a resposta atual **cumpre** o contrato; uma versão que passou a devolver **textos** (§"1"§, §"10.00"§) **não cumpriria**, e o teste **falharia no pipeline do provedor**, **antes** de quebrar produção.
- **Compatibilidade**: o provedor roda os contratos de **todas** as versões de consumidores **ativos**; **detecte** mudanças incompatíveis na especificação (§oasdiff§, **não executado**).
- **Ambientes**: contratos substituem boa parte dos **testes de integração ponta a ponta** frágeis e lentos.

### Segurança na borda
Termine **TLS** no gateway, **valide tokens** (assinatura, expiração, audiência: curso C4.4), **não confie** em cabeçalhos de identidade vindos de fora (**remova-os** na entrada e **injete** os verificados), aplique **rate limiting** por chave, **limite tamanhos**, **registre** e **alerte**. Os serviços internos **ainda** devem **autorizar** (defesa em profundidade; **não** assuma que "só o gateway chama").

### Projeto integrador: API com contratos e tempo real
**Cenário**: uma **API de pedidos** com **REST** (CRUD), **GraphQL** (consultas de leitura para o painel) e **WebSocket** (status do pedido ao vivo), atrás de um **gateway**.
**Entregáveis**:
1. **OpenAPI 3.1** como fonte da verdade (design-first), validada no CI, com **erros em Problem Details**;
2. **Validação de requisições** (Ajv) e **teste de contrato** das respostas;
3. **Paginação por cursor**, filtros com lista de permissão e **limites**;
4. **Idempotency-Key** nos POSTs críticos (com teste de **concorrência**);
5. **ETag/If-Match** nas atualizações; **versionamento** (§/v1§) e **Deprecation/Sunset** para a mudança planejada;
6. **GraphQL** com **DataLoader**, **limite de profundidade** e erros mascarados;
7. **WebSocket** com autenticação/Origin, **maxPayload**, **heartbeat** e **política de consumidor lento**;
8. **Gateway** (didático ou real) com roteamento, autenticação, **rate limiting por chave**, **timeout** e **disjuntor**; **propagação de id**;
9. **Medições**: OFFSET x keyset, N+1 x DataLoader, custo do salto, comportamento sob falha; **ADR** com decisões e limitações.
**Critérios**: nenhum **POST** duplica efeitos sob retentativa; um **contrato quebrado** falha o CI; o disjuntor protege o upstream; números medidos documentados.`,
  concepts: [
    { term: 'API gateway', def: 'Ponto de entrada que roteia, autentica, limita taxa e protege os serviços internos.' },
    { term: 'BFF', def: 'Gateway dedicado a um tipo de cliente, que compõe chamadas e adapta o formato.' },
    { term: 'Disjuntor (circuit breaker)', def: 'Mecanismo que interrompe chamadas a um serviço com falhas e testa a recuperação depois.' },
    { term: 'Estado semiaberto', def: 'Estado do disjuntor em que uma chamada de teste decide se o circuito fecha.' },
    { term: 'Timeout', def: 'Prazo máximo de espera por uma resposta, após o qual a chamada é abandonada.' },
    { term: 'Retry storm', def: 'Amplificação de carga causada por retentativas excessivas durante uma falha.' },
    { term: 'Teste de contrato', def: 'Teste que verifica o acordo de interface entre consumidor e provedor.' },
    { term: 'Contrato dirigido pelo consumidor', def: 'Abordagem em que consumidores declaram o que usam e o provedor é verificado contra isso.' },
    { term: 'ID de correlação', def: 'Identificador que acompanha uma requisição por todos os serviços para rastreamento.' },
    { term: 'Defesa em profundidade', def: 'Aplicação de controles de segurança em várias camadas, sem confiar em uma só.' }
  ],
  examples: R`**Analogia:** o gateway é a **portaria do condomínio**: confere **quem entra** (autenticação), **anuncia o visitante** ao apartamento certo (roteamento), **limita quantas visitas por vez** (rate limit) e **desiste de ligar** para um apartamento que **não atende** (timeout). O **disjuntor** é o **quadro de energia**: se um circuito dá curto, **desarma** para não queimar a casa, e **tenta religar** depois. O **teste de contrato** é a **cláusula** que diz "o interfone sempre tocará assim": se o fabricante muda o som sem avisar, **o teste reclama antes da mudança chegar aos moradores**.

**Exemplo 1: borda.** Sem token, 401 sem chamar o serviço.

**Exemplo 2: disjuntor.** 504, 504, 504 e depois 503 em 3–5 ms: só 3 chamadas ao upstream.

**Exemplo 3: contrato.** Id e total viraram texto: o teste do provedor falha antes de produção.`,
  code: [
    { title: 'Gateway didático com autenticação, timeout e disjuntor (JavaScript, Express 5; medidas reais)', lang: 'js', code: R`import express from 'express';
import crypto from 'node:crypto';
const rotas = { '/api/usuarios': 'http://usuarios:3001', '/api/pedidos': 'http://pedidos:3002' };
const disjuntor = new Map(); const LIMITE = 3, ABERTO_MS = 400;

const gw = express();
gw.use((req, res, next) => { req.id = req.get('x-request-id') ?? crypto.randomUUID(); res.set('x-request-id', req.id); next(); });
gw.use((req, res, next) => { if (req.get('authorization') !== 'Bearer ok') return res.status(401).json({ erro: 'não autenticado' }); next(); });   // didático
gw.use(async (req, res) => {
  const prefixo = Object.keys(rotas).find((p) => req.path.startsWith(p)); if (!prefixo) return res.status(404).json({ erro: 'rota desconhecida' });
  const d = disjuntor.get(prefixo) ?? { falhas: 0, abertoAte: 0 }; disjuntor.set(prefixo, d);
  if (Date.now() < d.abertoAte) return res.status(503).set('Retry-After', '1').json({ erro: 'disjuntor aberto' });      // falha rápido
  try {
    const r = await fetch(rotas[prefixo] + req.path.slice(prefixo.length), { signal: AbortSignal.timeout(100), headers: { 'x-request-id': req.id } });
    if (r.status >= 500) throw new Error('upstream ' + r.status);
    d.falhas = 0; res.status(r.status).type('application/json').send(await r.text());
  } catch (e) {
    d.falhas++; if (d.falhas >= LIMITE) { d.abertoAte = Date.now() + ABERTO_MS; d.falhas = 0; }
    res.status(e.name === 'TimeoutError' ? 504 : 502).json({ erro: e.name === 'TimeoutError' ? 'tempo esgotado no upstream' : 'falha no upstream' });
  }
});`, notes: [{ l: '10', t: 'Com o circuito aberto, a resposta sai sem chamar o upstream.' }, { l: '12', t: 'AbortSignal.timeout abandona a espera após 100 ms.' }] },
    { title: 'Teste de contrato do consumidor (JavaScript, resultado medido)', lang: 'js', code: R`const contrato = (o) => typeof o.id === 'number' && typeof o.total === 'number';   // o que o consumidor realmente usa
console.log(contrato({ id: 1, total: 10 }));            // true
console.log(contrato({ id: '1', total: '10.00' }));      // false: o pipeline do provedor reprova a mudança`, notes: [{ l: '1', t: 'O consumidor declara só os campos e tipos que usa.' }] }
  ],
  bestPractices: ['Mantenha o gateway enxuto: roteamento, segurança e resiliência, sem regra de negócio.', 'Use timeouts em todas as chamadas e disjuntor com falha rápida e plano B.', 'Propague o id de correlação e remova cabeçalhos de identidade vindos de fora.', 'Faça retry só em operações idempotentes, com backoff e jitter.', 'Verifique contratos no CI do provedor, inclusive dos consumidores.', 'Mantenha a autorização também nos serviços internos.'],
  mistakes: ['Colocar regra de negócio no gateway.', 'Gateway como ponto único de falha sem alta disponibilidade.', 'Retry sem limite amplificando a carga.', 'Confiar em cabeçalhos de identidade recebidos do cliente.', 'Achar que o timeout cancela o trabalho do upstream.', 'Não testar contratos e descobrir quebras em produção.'],
  market: R`Gateways, BFFs, disjuntores e testes de contrato são rotina em plataformas com muitos serviços; saber medir o custo e o comportamento sob falha é um diferencial em entrevistas de arquitetura.`,
  summary: R`O gateway centraliza roteamento, autenticação na borda, propagação de id, timeout e disjuntor. Medido: 401 sem chamar o serviço; o serviço viu o mesmo x-request-id; salto extra de ~2,1 ms (2,72 → 4,84 ms); com timeout de 100 ms: 504 x3 e depois 503 em 3–5 ms, só 3 chamadas ao upstream de 6 tentativas, recuperação em 450 ms (o upstream continuou trabalhando nos timeouts); o teste de contrato reprovou a versão que devolveu textos. O projeto integra REST, GraphQL, WebSocket e contratos.`,
  refs: [REF3.apiGateway, REF3.bff, REF3.circuitBreaker, REF3.pact, REF.openapi31],
  cards: [
    { q: 'Quais os três estados do disjuntor?', a: 'Fechado, aberto (falha rápido) e semiaberto (chamada de teste).' },
    { q: 'O que o timeout do gateway não faz?', a: 'Cancelar o trabalho do upstream (medido: as 3 chamadas continuaram).' },
    { q: 'Quando fazer retry?', a: 'Só em operações idempotentes, com backoff e jitter e limite.' },
    { q: 'O que é um BFF?', a: 'Um gateway por tipo de cliente que compõe chamadas e adapta o formato.' },
    { q: 'Como o teste de contrato protege?', a: 'Reprova no CI do provedor mudanças que quebram o que o consumidor usa, antes da produção.' }
  ]
}
];
