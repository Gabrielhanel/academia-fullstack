// C4.3 — APIs REST, GraphQL e WebSockets. Aulas 1 a 3 (HTTP e REST; design de APIs REST; OpenAPI e contratos).
const R = String.raw;

export const REF = {
  rfc9110: { title: 'RFC 9110 — HTTP Semantics', url: 'https://www.rfc-editor.org/rfc/rfc9110', kind: 'especificação' },
  mdnHttp: { title: 'MDN — HTTP', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP', kind: 'doc' },
  mdnMethods: { title: 'MDN — HTTP request methods', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods', kind: 'doc' },
  mdnStatus: { title: 'MDN — HTTP response status codes', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status', kind: 'doc' },
  mdnConditional: { title: 'MDN — HTTP conditional requests', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Conditional_requests', kind: 'doc' },
  mdnNegotiation: { title: 'MDN — Content negotiation', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Content_negotiation', kind: 'doc' },
  richardson: { title: 'Martin Fowler — Richardson Maturity Model', url: 'https://martinfowler.com/articles/richardsonMaturityModel.html', kind: 'artigo' },
  rfc9457: { title: 'RFC 9457 — Problem Details for HTTP APIs', url: 'https://www.rfc-editor.org/rfc/rfc9457', kind: 'especificação' },
  googleAip: { title: 'Google — API Improvement Proposals (AIP)', url: 'https://google.aip.dev/', kind: 'guia' },
  msGuidelines: { title: 'Microsoft — REST API Guidelines', url: 'https://github.com/microsoft/api-guidelines', kind: 'guia' },
  openapi31: { title: 'OpenAPI Specification v3.1.0', url: 'https://spec.openapis.org/oas/v3.1.0', kind: 'especificação' },
  jsonSchema: { title: 'JSON Schema', url: 'https://json-schema.org/', kind: 'especificação' },
  ajv: { title: 'Ajv — JSON schema validator', url: 'https://ajv.js.org/', kind: 'doc' },
  pact: { title: 'Pact — Consumer-driven contract testing', url: 'https://docs.pact.io/', kind: 'doc' }
};

export const lessonsA = [
{
  id: 'api-01', moduleId: 'm1', order: 1, minutes: 80, tags: ['HTTP', 'REST', 'verbos', 'status codes', 'idempotência', 'ETag', 'negociação de conteúdo'],
  title: 'HTTP e REST: verbos, status codes, cabeçalhos e requisições condicionais',
  objectives: ['Distinguir métodos seguros e idempotentes e escolher o verbo certo', 'Escolher o status code adequado (2xx, 3xx, 4xx, 5xx) com Location, Allow e Retry-After quando preciso', 'Usar ETag, If-None-Match e If-Match para cache e controle de concorrência otimista', 'Aplicar a negociação de conteúdo (Accept, 406)', 'Explicar REST como estilo e os níveis do modelo de Richardson'],
  intro: R`Uma API HTTP bem-feita é, antes de tudo, **bom uso do HTTP**: os **métodos** dizem a **intenção**, os **status** dizem o **resultado**, os **cabeçalhos** controlam **cache, concorrência e formato**. Aqui você **executa** (Express 5.3.0) cada comportamento: o **POST** que cria dois recursos, o **PUT idempotente** com **If-Match** (**428** e **412**), o **304**, o **406** e o **405** com **Allow**.`,
  theory: R`### REST em uma página
**REST** (*Representational State Transfer*) é um **estilo arquitetural** (Fielding) com restrições: **cliente-servidor**, **sem estado** no servidor entre requisições, **cacheável**, **interface uniforme** (recursos identificados por URI, manipulados por **representações**, mensagens **autodescritivas**, e HATEOAS), **sistema em camadas**. A maioria das "APIs REST" é na verdade **HTTP+JSON orientado a recursos** (nível 2 de Richardson): **recursos** (nível 1) e **verbos HTTP** (nível 2); o nível 3 adiciona **hipermídia** (links que dizem o que fazer a seguir). O pragmatismo funciona: o que importa é **usar a semântica do HTTP corretamente** (RFC 9110).

### Métodos: seguros e idempotentes
| Método | Uso | Seguro? | Idempotente? |
|---|---|---|---|
| **GET** | ler | sim | sim |
| **HEAD** | ler só os cabeçalhos | sim | sim |
| **OPTIONS** | capacidades (e pré-voo CORS) | sim | sim |
| **POST** | criar / ação não idempotente | não | **não** |
| **PUT** | **substituir** o recurso inteiro | não | **sim** |
| **PATCH** | alterar **parcialmente** | não | **não necessariamente** |
| **DELETE** | remover | não | **sim** |
**Seguro** = **não altera** estado (permite pré-busca e cache). **Idempotente** = **repetir** produz o **mesmo estado final** (importante para **retentativas** após falha de rede).
Medido (Express 5.3.0): **POST** duas vezes → **dois** recursos (ids 2 e 3) e **dois** §Location§; **DELETE** duas vezes → **204** e depois **404** (o **estado final** é o mesmo; a **resposta** pode diferir); **PUT** repetido com o mesmo conteúdo e o ETag atual → **mesma versão (2) e mesmo ETag**. Sem estratégia (aula api-07), um **POST repetido** (retry) **duplica** efeitos.

### Status codes: o que o cliente precisa saber
- **2xx**: **200** OK; **201** Created (+ §Location§ do novo recurso); **202** Accepted (aceito, processamento **assíncrono**); **204** No Content (sucesso sem corpo: DELETE, PUT sem retorno).
- **3xx**: **301/308** redirecionamento permanente; **302/307** temporário; **304** Not Modified (**cache válido**, sem corpo).
- **4xx** (erro do **cliente**): **400** requisição malformada; **401** não autenticado; **403** sem permissão; **404** não encontrado; **405** método não permitido (+ §Allow§); **406** não aceitável (Accept); **409** conflito de estado; **412** pré-condição falhou; **415** tipo de mídia não suportado; **422** entidade não processável (validação); **428** pré-condição obrigatória; **429** muitas requisições (+ §Retry-After§).
- **5xx** (erro do **servidor**): **500**; **502/504** (gateway/timeout); **503** indisponível (+ §Retry-After§).
Regras: **não use 200 com um campo "erro"**; **não use 500 para erro de entrada**; **401 x 403** (aula nst-04); **4xx não deve ser repetido sem mudar a requisição, 5xx/429/503 podem** (com backoff).

### Medido: respostas reais
- §GET /usuarios/1§ → **200** com §ETag: "602cf0a63079"§ e §Cache-Control: private, max-age=0, must-revalidate§;
- **GET** com §If-None-Match§ igual → **304** (sem corpo);
- **GET** com §Accept: application/xml§ → **406** §{"erro":"só application/json"}§;
- **GET** inexistente → **404**;
- **PATCH** em rota que só aceita GET/PUT/DELETE → **405** com §Allow: GET, PUT, DELETE§;
- **HEAD** → **200** sem corpo; **OPTIONS** → neste servidor caiu na rota genérica e devolveu **405** com §Allow§ (**configure OPTIONS/CORS** explicitamente: aula nex-04).

### Concorrência otimista: ETag e If-Match
O **ETag** identifica a **versão** do recurso. Para **evitar a perda de atualização** (*lost update*):
1. O cliente faz **GET** e guarda o **ETag**;
2. Envia **PUT/PATCH** com §If-Match: <etag>§;
3. O servidor **compara**: igual → aplica; diferente → **412 Precondition Failed**; ausente (se for obrigatório) → **428 Precondition Required**.
Medido: **PUT sem If-Match → 428**; **com o ETag correto → 200** (nova versão, novo ETag); **PUT repetido com o ETag antigo (outro cliente já alterou) → 412 "versão desatualizada"**. É a versão HTTP do bloqueio otimista do banco (aula trx-04).

### Negociação de conteúdo e cabeçalhos úteis
- §Accept§ / §Content-Type§ / §Accept-Language§ / §Accept-Encoding§; resposta **§Vary§** informa em que a resposta varia (essencial para caches);
- §Location§ (novo recurso), §Link§ (relações, paginação), §Retry-After§, §Allow§;
- §Cache-Control§, §ETag§, §Last-Modified§ (aula cch-06);
- §Idempotency-Key§ (aula api-07), §Sunset§/§Deprecation§ (aula api-07).

### Corpo: formatos
**JSON** é o padrão; defina **tipos claros** (datas em **ISO 8601** com fuso, dinheiro como **inteiro em centavos ou texto decimal**, nunca ponto flutuante), **nomes estáveis** (consistência: §camelCase§ ou §snake_case§, **um só**), **campos nulos** documentados, **ids opacos** (strings). Valide **a entrada** e **o contrato da saída** (aula api-03).

### Sem estado e escalabilidade
"Sem estado" significa que **cada requisição carrega tudo** de que o servidor precisa (credenciais, contexto); o servidor **não guarda sessão** da conversa (pode guardar **dados do recurso**). Isso permite **escalar horizontalmente** atrás de um balanceador e **cachear**.`,
  concepts: [
    { term: 'REST', def: 'Estilo arquitetural de sistemas distribuídos baseado em recursos, interface uniforme e ausência de estado no servidor.' },
    { term: 'Método seguro', def: 'Método que não altera o estado do servidor, como GET e HEAD.' },
    { term: 'Método idempotente', def: 'Método cuja repetição produz o mesmo estado final, como PUT e DELETE.' },
    { term: 'Status code', def: 'Código numérico de três dígitos que indica o resultado de uma requisição HTTP.' },
    { term: 'ETag', def: 'Identificador de versão de uma representação, usado em cache e controle de concorrência.' },
    { term: 'If-Match', def: 'Cabeçalho que torna a requisição condicional à igualdade do ETag, evitando perda de atualização.' },
    { term: '412 / 428', def: 'Pré-condição falhou / pré-condição obrigatória.' },
    { term: 'Negociação de conteúdo', def: 'Escolha da representação do recurso com base nos cabeçalhos Accept da requisição.' },
    { term: 'Modelo de Richardson', def: 'Escala de maturidade de APIs: recursos, verbos HTTP e hipermídia.' },
    { term: 'HATEOAS', def: 'Restrição REST em que as respostas trazem links para as próximas ações possíveis.' }
  ],
  examples: R`**Analogia:** o HTTP é um **serviço de correio com regras claras**: o **verbo** é o **tipo de carta** (consulta, pedido, substituição, cancelamento); o **status** é o **carimbo da resposta** ("recebido e criado", "endereço inexistente", "volte mais tarde"); o **ETag** é o **número da edição do documento** que você anexa à sua alteração — se alguém já mudou o documento, o correio **devolve a carta** (412) em vez de **sobrescrever o trabalho dele**. **Idempotente** é um **interruptor de "ligar"**: apertar duas vezes deixa a luz acesa do mesmo jeito; **POST** é a **campainha**: cada toque chama alguém.

**Exemplo 1: POST duas vezes.** Dois recursos criados (ids 2 e 3).

**Exemplo 2: lost update.** PUT com ETag antigo → 412.

**Exemplo 3: cache.** GET com If-None-Match → 304 sem corpo.`,
  code: [
    { title: 'Servidor com ETag, If-Match e status corretos (JavaScript, Express 5; saídas medidas)', lang: 'js', code: R`import express from 'express';
import crypto from 'node:crypto';
const app = express(); app.use(express.json());
const recursos = new Map([[1, { id: 1, nome: 'Ana', versao: 1 }]]);
const etagDe = (o) => '"' + crypto.createHash('sha1').update(JSON.stringify(o)).digest('hex').slice(0, 12) + '"';

app.get('/usuarios/:id', (req, res) => {
  const u = recursos.get(Number(req.params.id)); if (!u) return res.status(404).json({ erro: 'não encontrado' });
  const et = etagDe(u); res.set('ETag', et);
  if (req.get('If-None-Match') === et) return res.status(304).end();                       // 304 sem corpo
  if (req.accepts(['json', 'xml']) !== 'json') return res.status(406).json({ erro: 'só application/json' });
  res.json(u);
});
app.put('/usuarios/:id', (req, res) => {
  const id = Number(req.params.id); const atual = recursos.get(id);
  if (!req.get('If-Match')) return res.status(428).json({ erro: 'If-Match obrigatório' });      // 428
  if (atual && req.get('If-Match') !== etagDe(atual)) return res.status(412).json({ erro: 'versão desatualizada' });   // 412
  const mudou = !atual || atual.nome !== req.body.nome;
  const u = mudou ? { id, nome: req.body.nome, versao: (atual?.versao ?? 0) + 1 } : atual;       // PUT idempotente: sem mudança, mesmo estado
  recursos.set(id, u); res.set('ETag', etagDe(u)).json(u);
});
app.all('/usuarios/:id', (req, res) => res.status(405).set('Allow', 'GET, PUT, DELETE').json({ erro: 'método não permitido' }));`, notes: [{ l: '9', t: 'If-None-Match igual ao ETag atual → 304.' }, { l: '16', t: 'Sem If-Match, o servidor exige a pré-condição (428).' }, { l: '20', t: 'Repetir o mesmo PUT não muda a versão nem o ETag.' }] },
    { title: 'Cliente com tratamento por classe de status (JavaScript)', lang: 'js', code: R`async function chamar(url, opts = {}, tentativas = 3) {
  for (let i = 1; i <= tentativas; i++) {
    const r = await fetch(url, opts);
    if (r.status < 400) return r;
    if (r.status === 429 || r.status === 503) {                       // pode repetir, respeitando Retry-After
      const espera = Number(r.headers.get('retry-after') ?? 1) * 1000; await new Promise((x) => setTimeout(x, espera)); continue;
    }
    if (r.status >= 500) { await new Promise((x) => setTimeout(x, 2 ** i * 100)); continue; }   // backoff para 5xx
    throw Object.assign(new Error('HTTP ' + r.status), { status: r.status });                 // 4xx: repetir igual não adianta
  }
  throw new Error('esgotadas as tentativas');
}`, notes: [{ l: '4', t: '429 e 503 pedem espera e nova tentativa.' }, { l: '8', t: 'Erros 4xx exigem mudar a requisição.' }] }
  ],
  bestPractices: ['Use cada método com sua semântica e reserve POST para criação e ações não idempotentes.', 'Devolva o status mais específico e os cabeçalhos associados (Location, Allow, Retry-After).', 'Use ETag e If-Match para evitar perda de atualização.', 'Faça o PUT realmente idempotente.', 'Não devolva 200 com erro no corpo.', 'Documente formatos (datas, dinheiro) e mantenha nomes consistentes.'],
  mistakes: ['Usar POST para tudo.', 'Devolver 200 com {"erro": ...}.', 'Usar 500 para entrada inválida.', 'Esquecer o Location em 201.', 'PUT que não é idempotente.', 'Representar dinheiro com ponto flutuante.'],
  market: R`Dominar a semântica do HTTP separa APIs previsíveis de APIs que quebram clientes, caches e retentativas; é tema constante em revisões de design e entrevistas.`,
  summary: R`REST é um estilo; a prática é usar a semântica do HTTP: GET/HEAD/OPTIONS são seguros, GET/PUT/DELETE idempotentes, POST não. Medido no Express 5.3.0: POST duas vezes criou dois recursos; GET com If-None-Match devolveu 304; Accept xml → 406; PATCH sem rota → 405 com Allow; PUT sem If-Match → 428, com ETag antigo → 412, com o atual → 200, e repetir o mesmo conteúdo manteve versão e ETag. Escolha status específicos e cabeçalhos corretos.`,
  refs: [REF.rfc9110, REF.mdnMethods, REF.mdnStatus, REF.mdnConditional, REF.mdnNegotiation, REF.richardson],
  cards: [
    { q: 'Qual a diferença entre método seguro e idempotente?', a: 'Seguro não altera estado; idempotente produz o mesmo estado final ao repetir.' },
    { q: 'O que o 412 indica?', a: 'A pré-condição (If-Match) falhou: o recurso mudou desde que o cliente o leu.' },
    { q: 'Quando usar 201 e o cabeçalho Location?', a: 'Ao criar um recurso, apontando para a URI do novo recurso.' },
    { q: 'O que o 304 devolve?', a: 'Nenhum corpo: indica que a cópia em cache do cliente continua válida.' },
    { q: 'PUT ou PATCH?', a: 'PUT substitui o recurso inteiro e é idempotente; PATCH altera parcialmente e não é necessariamente idempotente.' }
  ]
},
{
  id: 'api-02', moduleId: 'm1', order: 2, minutes: 80, tags: ['design de API', 'recursos', 'URLs', 'erros', 'filtros', 'consistência', 'Problem Details'],
  title: 'Design de APIs REST: recursos, URLs, formatos, erros e consistência',
  objectives: ['Modelar recursos e relacionamentos e desenhar URLs consistentes', 'Escolher entre sub-recursos, filtros e ações personalizadas', 'Padronizar erros (Problem Details), campos e convenções de nomes', 'Projetar uma API a partir dos casos de uso (e não do banco)', 'Revisar uma API contra guias públicos (Google AIP, Microsoft)'],
  intro: R`Uma API é um **produto para desenvolvedores**: depois de publicada, **cada decisão vira compromisso**. O design começa pelos **casos de uso do cliente**, não pela estrutura das tabelas. Esta aula traz as **convenções** que tornam uma API **previsível**: recursos como **substantivos**, hierarquia modesta, **filtros por query**, ações com **verbos controlados**, **erros padronizados** e uma lista de **verificação** de design.`,
  theory: R`### Comece pelos casos de uso
Liste **o que o cliente quer fazer** ("fechar um pedido", "ver o histórico"), não "expor a tabela". Uma API **espelho do banco** expõe a estrutura interna, **acopla** os clientes ao esquema e **obriga múltiplas chamadas**. Desenhe os **recursos** que fazem sentido **para o cliente**, mesmo que combinem várias tabelas.

### Recursos e URLs
- **Substantivos no plural** para coleções: §/pedidos§, §/pedidos/42§; **sem verbos** na URL (o verbo é o método HTTP).
- **Hierarquia rasa**: §/pedidos/42/itens§ (sub-recurso **dependente**); evite mais de **dois níveis** (§/clientes/1/pedidos/2/itens/3§ vira §/itens/3§ ou filtro).
- **Minúsculas e hífens** (§/formas-de-pagamento§), **sem extensões** (§.json§); **ids opacos** (não exponha chaves sequenciais se isso for um risco: enumeração).
- **Coleção x item**: §GET /pedidos§ lista; §POST /pedidos§ cria; §GET/PUT/PATCH/DELETE /pedidos/42§ no item.
- **Singleton**: §/usuario§ (o usuário atual) ou §/me§.

### Ações que não são CRUD
Algumas operações são **processos**, não recursos: "cancelar um pedido", "reenviar um e-mail". Opções:
1. **Modelar como recurso**: §POST /pedidos/42/cancelamentos§ (cria um **cancelamento**, com histórico);
2. **Mudar um campo**: §PATCH /pedidos/42 { "status": "cancelado" }§ (quando a transição é simples; **valide** as transições permitidas);
3. **Ação** com verbo **controlado**: §POST /pedidos/42:cancelar§ (estilo Google AIP "custom methods") ou §POST /pedidos/42/cancelar§: **aceitável quando necessário**, mas **documente** e mantenha **poucas**.
Prefira (1) quando houver **estado/histórico** a registrar.

### Filtros, ordenação, campos
- **Filtros**: §GET /pedidos?status=aberto&cliente=7§ (query string); evite criar **endpoints por filtro**;
- **Ordenação**: §?ordem=-criado,total§ (prefixo para decrescente);
- **Campos** (seleção): §?campos=id,total§ para reduzir o payload (ou use GraphQL, aula api-04);
- **Busca**: §?q=texto§;
- **Paginação** (aula api-06) e **limites** máximos.

### Representações
- **Envelope ou não?** Devolver o **objeto/array direto** é mais simples; um **envelope** (§{ dados, meta, links }§) acomoda **paginação** e **metadados**. Escolha **um padrão** e use sempre.
- **Dados relacionados**: **ids** (cliente decide buscar) ou **expansão opcional** (§?expandir=cliente§) para evitar o **N+1 do lado do cliente**.
- **Campos calculados** documentados; **timestamps** em ISO 8601 (§2026-11-25T13:00:00Z§); **dinheiro** como §{ valor: 1990, moeda: "BRL" }§ (centavos inteiros) ou texto decimal.
- **Nulo x ausente**: documente a diferença (PATCH com §null§ pode significar "apagar").

### Erros: o contrato
Use **Problem Details (RFC 9457)**: §Content-Type: application/problem+json§ e §{ "type", "title", "status", "detail", "instance" }§ + extensões (§errors§ por campo, §requestId§). Para **validação**: §422§ (ou 400) com a **lista de campos** e **mensagens**; **códigos de erro estáveis** (§saldo-insuficiente§) para máquinas; **mensagens** para humanos e **sem vazar** detalhes internos (aulas nex-05 e nst-06).

### Consistência: a regra de ouro
Um mesmo conceito tem **o mesmo nome** em **toda** a API (não misture §criadoEm§, §created_at§, §dataCriacao§); mesma **paginação**, mesmo **formato de erro**, mesmos **status** para as mesmas situações. **Guias** ajudam: **Google AIP**, **Microsoft REST API Guidelines**, **JSON:API**, **Zalando**: adote um **guia de estilo** do time e **faça lint** (Spectral, aula api-03).

### Evolução sem quebrar
- **Compatível** (pode fazer sem nova versão): **adicionar** campos opcionais, endpoints, valores novos **se o contrato disse que podem surgir** (enums abertos), parâmetros **opcionais**;
- **Incompatível**: remover/renomear campos, mudar tipos ou semântica, tornar algo **obrigatório**, mudar status.
Os clientes devem ser **tolerantes** ("*tolerant reader*": ignoram campos desconhecidos). Medido na aula api-07: um cliente antigo leu a v2 com campo novo sem problema; ao **remover** o campo, **quebrou**.

### Segurança no design
- **Autorização por objeto** (BOLA/IDOR: o #1 do OWASP API Security): sempre verifique o **dono** (aula nst-04);
- **Expor só o necessário** (excesso de dados): DTOs de saída, **não** devolva entidades do banco;
- **Limites** (tamanho de página, de corpo, **taxa**) e **recursos caros** protegidos (aula api-06);
- **Mass assignment**: lista de campos **aceitos** (aula nst-03);
- **Ids não adivinháveis** ou **autorização** sempre.

### Lista de verificação de design
1. Casos de uso levantados e **recursos** nomeados; 2. URLs **consistentes**; 3. métodos e **status** corretos; 4. **erros** padronizados; 5. **paginação**, filtros e **limites**; 6. **autorização por objeto**; 7. **idempotência** de operações sensíveis; 8. **versionamento/depreciação** definidos; 9. **especificação OpenAPI** revisada; 10. **testes de contrato**.`,
  concepts: [
    { term: 'Recurso', def: 'Entidade de negócio identificada por uma URI e manipulada por representações.' },
    { term: 'Coleção e item', def: 'Padrão de URLs em que /pedidos lista e cria e /pedidos/42 opera sobre um item.' },
    { term: 'Ação personalizada', def: 'Operação que não se encaixa em CRUD, modelada como sub-recurso ou verbo controlado.' },
    { term: 'Envelope', def: 'Estrutura que embrulha os dados com metadados, como { dados, meta, links }.' },
    { term: 'Expansão', def: 'Parâmetro que pede para incluir dados relacionados na resposta.' },
    { term: 'Problem Details', def: 'Formato padrão (RFC 9457) para erros em JSON.' },
    { term: 'Tolerant reader', def: 'Cliente que ignora campos desconhecidos, tolerando evoluções compatíveis.' },
    { term: 'Mudança incompatível', def: 'Alteração que quebra clientes existentes, como remover um campo.' },
    { term: 'BOLA/IDOR', def: 'Falha em que um usuário acessa recursos de outro por falta de verificação de propriedade.' },
    { term: 'Guia de estilo de API', def: 'Conjunto de convenções de nomes, formatos e comportamentos adotado por uma organização.' }
  ],
  examples: R`**Analogia:** projetar uma API é **projetar um cardápio** para os clientes, não **abrir a cozinha**: pratos com **nomes claros** (recursos), **formas consistentes de pedir** (filtros, paginação), **avisos de alergênicos padronizados** (erros) e **promessa de não mudar a receita sem avisar** (versionamento). Expor as tabelas é **entregar a lista de ingredientes e a geladeira**; o cliente teria de **montar o prato**.

**Exemplo 1: ação.** POST /pedidos/42/cancelamentos cria um registro de cancelamento com motivo e data.

**Exemplo 2: filtros.** GET /pedidos?status=aberto&ordem=-criado em vez de /pedidos-abertos.

**Exemplo 3: erro.** 422 com Problem Details e lista de campos inválidos.`,
  code: [
    { title: 'Desenho de recursos e URLs (texto)', lang: 'text', code: R`GET    /pedidos?status=aberto&cliente=7&ordem=-criado&limite=20    lista com filtros, ordem e página
POST   /pedidos                                                    cria (201 + Location)
GET    /pedidos/42                                                 lê
PATCH  /pedidos/42                                                 altera campos (valida transições de status)
DELETE /pedidos/42                                                 remove (204)
GET    /pedidos/42/itens                                           sub-recurso dependente
POST   /pedidos/42/cancelamentos                                   ação modelada como recurso (histórico)
GET    /me                                                         o usuário autenticado

evitar: /getPedidos  /pedido/criar  /pedidos/42/itens/3/precos/9/historico  /pedidos-abertos`, notes: [{ l: '1', t: 'Filtros por query string, não por rotas novas.' }, { l: '7', t: 'A ação vira um recurso com estado próprio.' }] },
    { title: 'Erro de validação com Problem Details (JSON, RFC 9457)', lang: 'json', code: R`{
  "type": "https://api.exemplo.com/erros/validacao",
  "title": "Dados inválidos",
  "status": 422,
  "detail": "2 campos não passaram na validação.",
  "instance": "/pedidos",
  "requestId": "0fe42846-637a-45cb-a16c-b6cf95d7457b",
  "errors": [
    { "campo": "itens[0].sku", "codigo": "formato-invalido", "mensagem": "deve seguir o padrão AA-000" },
    { "campo": "itens[0].qtd", "codigo": "minimo", "mensagem": "deve ser maior ou igual a 1" }
  ]
}`, notes: [{ l: '3', t: 'O status do corpo repete o status HTTP.' }, { l: '8', t: 'Erros por campo com códigos estáveis para máquinas.' }] }
  ],
  bestPractices: ['Projete a partir dos casos de uso, não das tabelas.', 'Use substantivos, hierarquia rasa e filtros por query string.', 'Padronize erros, nomes, paginação e formatos.', 'Prefira mudanças compatíveis e clientes tolerantes.', 'Verifique a autorização por objeto e exponha só o necessário.', 'Adote e automatize um guia de estilo.'],
  mistakes: ['Espelhar o banco na API.', 'Verbos nas URLs e endpoints por filtro.', 'Hierarquias profundas.', 'Nomes e formatos inconsistentes.', 'Expor entidades inteiras com campos internos.', 'Remover campos sem processo de depreciação.'],
  market: R`APIs mal desenhadas geram retrabalho em todos os clientes; guias como o Google AIP e as diretrizes da Microsoft são referência em empresas, e revisões de design de API são uma prática sênior.`,
  summary: R`Desenhe a API pelos casos de uso: recursos no plural, hierarquia rasa, filtros por query string, ações como sub-recursos ou verbos controlados, erros em Problem Details e consistência total de nomes e formatos. Prefira mudanças compatíveis, clientes tolerantes e autorização por objeto; adote um guia de estilo e valide com OpenAPI (próxima aula).`,
  refs: [REF.googleAip, REF.msGuidelines, REF.rfc9457, REF.rfc9110],
  cards: [
    { q: 'Como modelar "cancelar pedido"?', a: 'Como sub-recurso (POST /pedidos/42/cancelamentos), mudança de campo validada ou ação controlada, preferindo o recurso quando há histórico.' },
    { q: 'Por que não espelhar o banco na API?', a: 'Acopla clientes ao esquema, expõe detalhes internos e exige múltiplas chamadas.' },
    { q: 'O que é uma mudança incompatível?', a: 'Remover/renomear campos, mudar tipos ou semântica, tornar algo obrigatório.' },
    { q: 'Qual o formato recomendado para erros?', a: 'Problem Details (RFC 9457) com extensões como errors por campo e requestId.' },
    { q: 'O que é BOLA/IDOR?', a: 'Acessar recursos de outro usuário por falta de verificação de propriedade do objeto.' }
  ]
},
{
  id: 'api-03', moduleId: 'm1', order: 3, minutes: 85, tags: ['OpenAPI', 'JSON Schema', 'contrato', 'Ajv', 'teste de contrato', 'lint', 'documentação'],
  title: 'OpenAPI e contratos: especificação, validação de requisições e testes de contrato',
  objectives: ['Escrever uma especificação OpenAPI 3.1 com paths, schemas e respostas', 'Validar a própria especificação e rejeitar referências quebradas', 'Validar requisições com Ajv a partir do schema e interpretar as mensagens', 'Escrever um teste de contrato que detecta a deriva da resposta', 'Escolher entre design-first e code-first'],
  intro: R`**OpenAPI** é o **contrato legível por máquina** de uma API HTTP: caminhos, parâmetros, corpos, respostas e esquemas (**JSON Schema**). A mesma especificação gera **documentação**, **clientes**, **mocks** e **testes**. Aqui você **executa** o ciclo completo: validar a especificação (**referência quebrada recusada**), validar **requisições** com **Ajv** e detectar **deriva do contrato** em três casos (**campo removido**, **tipo mudado**, **valor novo no enum**).`,
  theory: R`### O que é o OpenAPI
Uma especificação (YAML ou JSON) com:
- **info** (título, versão), **servers**;
- **paths** → operações (§get§, §post§...) com **parameters** (path, query, header), **requestBody**, **responses** (por status) e **operationId**;
- **components** → **schemas** reutilizáveis (§$ref§), parâmetros, respostas e **securitySchemes**.
A versão **3.1** alinha os schemas ao **JSON Schema 2020-12**. Exemplo mínimo usado no laboratório: §POST /pedidos§ (corpo §NovoPedido§ → **201** §Pedido§ ou **422**) e §GET /pedidos/{id}§.

### JSON Schema: as regras
§type§, §required§, §properties§, §additionalProperties: false§ (recusa campos extras: proteção contra mass assignment e **contrato estrito**), §minLength§, §pattern§, §minimum§/§maximum§, §enum§, §format§ (§email§, §date-time§, §uuid§, **exige** biblioteca de formatos), §minItems§/§maxItems§ (limite de listas), composição (§oneOf§, §anyOf§, §allOf§). **Limites** nos esquemas são **segurança**: **tamanho máximo** de textos e listas.

### Validar a especificação
Medido com **@apidevtools/swagger-parser 13.1.0**: a especificação de exemplo foi **aceita** (OpenAPI 3.1.0, caminhos §/pedidos§ e §/pedidos/{id}§); trocando um §$ref§ por um inexistente, a validação **recusou**: **Missing $ref pointer "#/components/schemas/NaoExiste". Token "NaoExiste" does not exist.** Faça isso no **CI**; adicione um **linter** (Spectral, **não executado** aqui) com regras do **guia de estilo**.

### Validar requisições a partir do schema (Ajv 8.20.0)
Compilando o §NovoPedido§ (§allErrors: true§), as respostas medidas:
| Corpo | Resultado |
|---|---|
| válido | válido |
| campo extra (§admin: true§) | **/ must NOT have additional properties** |
| sku e qtd inválidos | **/itens/0/sku must match pattern "^[A-Z]{2}-\d{3}$"** e **/itens/0/qtd must be >= 1** |
| e-mail inválido e itens vazios | **/email must match format "email"** e **/itens must NOT have fewer than 1 items** |
| sem cliente | **/ must have required property 'cliente'** |
Com §allErrors§ o cliente recebe **todos** os problemas de uma vez (traduza os caminhos §instancePath§ em §errors[]§ do Problem Details, aula api-02). Ajv **compila** o schema em função rápida; **compile uma vez** e reutilize. Cuidado com **ReDoS** em §pattern§ e com **schemas controlados pelo usuário**.

### Teste de contrato da resposta (deriva)
O **servidor** também precisa **cumprir** o contrato. Validando a **resposta** real contra o schema §Pedido§, medido:
- versão **boa**: respeita o contrato;
- **campo removido** (§total§): **VIOLA**: "/ must have required property 'total'";
- **tipo mudou** (§id§ numérico → texto): **VIOLA**: "/id must be integer";
- **valor novo** no enum (§status: "pendente"§): **VIOLA**: "/status must be equal to one of the allowed values".
Esse teste no **CI do provedor** impede que uma mudança "inocente" **quebre os clientes**. Para **consumidores** (front, outros serviços), os **testes de contrato dirigidos pelo consumidor** (Pact, **não executado**) verificam **o que cada um realmente usa**.

### Design-first ou code-first?
- **Design-first**: escreve-se o OpenAPI **antes** do código; revisa-se com **front/parceiros**, gera-se **mock** e **cliente** em paralelo; o servidor **implementa** o contrato. Melhor para **APIs públicas** e **equipes distintas**.
- **Code-first**: o código gera a especificação (decoradores do Nest: §@nestjs/swagger§, **não executado**): rápido, mas **o contrato pode derivar** do pretendido; **valide** o gerado e **trave** mudanças incompatíveis no CI (comparar versões: **oasdiff**, **não executado**).

### O que o OpenAPI habilita
- **Documentação** interativa (Swagger UI, Redoc);
- **Clientes e tipos** gerados (§openapi-typescript§, §openapi-generator§, **não executados**);
- **Mocks** a partir de exemplos; **testes** (Schemathesis, Dredd: **não executados**);
- **Gateways** que **validam** requisições na borda;
- **Governança**: catálogo de APIs e **lint**.

### Boas práticas
1. **Uma fonte da verdade** (a especificação) **versionada** no repositório;
2. **Exemplos** nas respostas; **descrições** claras; **operationId** únicos;
3. **additionalProperties: false** e limites nos esquemas de **entrada**; tolerância (aberto) nos de **saída** que você **consome** de terceiros;
4. **Validação no CI** (especificação + contrato + quebra de compatibilidade);
5. **Erros** descritos como respostas (**4xx/5xx** com Problem Details);
6. **Segurança** declarada (§securitySchemes§).`,
  concepts: [
    { term: 'OpenAPI', def: 'Especificação padrão para descrever APIs HTTP de forma legível por máquina.' },
    { term: 'JSON Schema', def: 'Linguagem para descrever e validar a estrutura de documentos JSON.' },
    { term: '$ref', def: 'Referência a um trecho reutilizável da especificação, como um schema em components.' },
    { term: 'operationId', def: 'Identificador único de uma operação, usado em geradores de código.' },
    { term: 'additionalProperties', def: 'Palavra-chave que controla se propriedades não declaradas são aceitas.' },
    { term: 'Ajv', def: 'Biblioteca que compila JSON Schema em funções de validação rápidas.' },
    { term: 'Teste de contrato', def: 'Teste que verifica se as respostas de um serviço cumprem o contrato acordado.' },
    { term: 'Deriva do contrato', def: 'Divergência gradual entre o comportamento real da API e sua especificação.' },
    { term: 'Design-first', def: 'Abordagem em que a especificação é escrita e revisada antes da implementação.' },
    { term: 'Contrato dirigido pelo consumidor', def: 'Modelo em que os consumidores declaram o que usam e o provedor é verificado contra isso.' }
  ],
  examples: R`**Analogia:** o OpenAPI é o **contrato de uma obra**: planta, materiais e prazos que **todos** (cliente, arquiteto, construtora) leem. A **validação da especificação** é o **revisor que confere se a planta não tem referências a andares inexistentes**; a **validação de requisições** é o **fiscal na portaria da obra** (só entra material conforme); o **teste de contrato** é a **vistoria final**: o prédio entregue **bate com a planta**? Sem vistoria, a obra **deriva** aos poucos.

**Exemplo 1: referência quebrada.** SwaggerParser recusa $ref inexistente.

**Exemplo 2: requisição.** Ajv lista sku, qtd, e-mail e itens de uma vez.

**Exemplo 3: deriva.** Campo removido, tipo mudado e valor novo no enum violam o contrato.`,
  code: [
    { title: 'Especificação mínima e validação (JavaScript, saídas medidas)', lang: 'js', code: R`import SwaggerParser from '@apidevtools/swagger-parser';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const doc = {
  openapi: '3.1.0', info: { title: 'API de Pedidos', version: '1.0.0' },
  paths: { '/pedidos': { post: { operationId: 'criarPedido',
    requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/NovoPedido' } } } },
    responses: { '201': { description: 'criado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Pedido' } } } }, '422': { description: 'inválido' } } } } },
  components: { schemas: {
    NovoPedido: { type: 'object', required: ['cliente', 'itens'], additionalProperties: false, properties: { cliente: { type: 'string', minLength: 3 }, email: { type: 'string', format: 'email' },
      itens: { type: 'array', minItems: 1, maxItems: 50, items: { type: 'object', required: ['sku', 'qtd'], additionalProperties: false, properties: { sku: { type: 'string', pattern: '^[A-Z]{2}-\\d{3}$' }, qtd: { type: 'integer', minimum: 1, maximum: 100 } } } } } },
    Pedido: { type: 'object', required: ['id', 'cliente', 'total', 'status'], properties: { id: { type: 'integer' }, cliente: { type: 'string' }, total: { type: 'number' }, status: { enum: ['aberto', 'pago', 'cancelado'] } } }
  } }
};
await SwaggerParser.validate(structuredClone(doc));                 // OpenAPI 3.1.0 válida

const ajv = new Ajv2020({ allErrors: true, strict: false }); addFormats(ajv);
ajv.addSchema({ $id: 'doc', components: doc.components });
const validaNovo = ajv.compile({ $ref: 'doc#/components/schemas/NovoPedido' });
validaNovo({ cliente: 'Ana', itens: [{ sku: 'x', qtd: 0 }] });
// erros: /itens/0/sku must match pattern "^[A-Z]{2}-\d{3}$" | /itens/0/qtd must be >= 1`, notes: [{ l: '16', t: 'O validador de especificações recusa referências quebradas.' }, { l: '19', t: 'allErrors devolve todos os problemas de uma vez.' }] },
    { title: 'Teste de contrato da resposta do provedor (JavaScript, resultados medidos)', lang: 'js', code: R`const validaPedido = ajv.compile({ $ref: 'doc#/components/schemas/Pedido' });
async function contrato(url) {
  const corpo = await (await fetch(url)).json();
  if (!validaPedido(corpo)) throw new Error('VIOLA o contrato: ' + validaPedido.errors.map((e) => (e.instancePath || '/') + ' ' + e.message).join(' | '));
}
// boa: respeita | campo removido: "/ must have required property 'total'"
// tipo mudou: "/id must be integer" | valor novo: "/status must be equal to one of the allowed values"`, notes: [{ l: '4', t: 'Executado no CI do provedor, impede quebras silenciosas.' }] }
  ],
  bestPractices: ['Mantenha a especificação versionada como fonte da verdade e valide-a no CI.', 'Valide requisições e testes de contrato das respostas.', 'Use additionalProperties false e limites nos esquemas de entrada.', 'Escolha design-first para APIs públicas ou equipes distintas.', 'Descreva erros como respostas e inclua exemplos.', 'Detecte mudanças incompatíveis entre versões da especificação.'],
  mistakes: ['Deixar a documentação divergir do comportamento.', 'Esquemas de entrada sem limites de tamanho.', 'Não validar o contrato da resposta.', 'Esquecer o ajv-formats e achar que format valida.', 'Gerar a especificação do código e nunca revisá-la.', 'Padrões regex vulneráveis a ReDoS.'],
  market: R`Contratos executáveis (OpenAPI, testes de contrato) reduzem integrações quebradas e são pilares de plataformas de API; muitas vagas sênior citam design-first e testes de contrato.`,
  summary: R`O OpenAPI 3.1 descreve a API com JSON Schema. Medido: o SwaggerParser aceitou a especificação e recusou uma $ref inexistente; o Ajv validou as requisições com mensagens por campo (campo extra, padrão do sku, qtd mínima, e-mail e itens); o teste de contrato da resposta detectou campo removido, tipo mudado e valor novo no enum. Mantenha a especificação versionada, valide no CI e escolha design-first ou code-first com disciplina.`,
  refs: [REF.openapi31, REF.jsonSchema, REF.ajv, REF.pact, REF.rfc9457],
  cards: [
    { q: 'O que o additionalProperties false faz?', a: 'Recusa propriedades não declaradas (medido: "must NOT have additional properties").' },
    { q: 'O que é deriva do contrato?', a: 'Divergência gradual entre o comportamento real da API e sua especificação; o teste de contrato a detecta.' },
    { q: 'Design-first ou code-first?', a: 'Design-first escreve o contrato antes; code-first gera do código e exige validação contra deriva.' },
    { q: 'Por que usar ajv-formats?', a: 'Porque o Ajv não valida formatos como email por padrão.' },
    { q: 'O que o allErrors faz no Ajv?', a: 'Devolve todos os erros de validação, não só o primeiro.' }
  ]
}
];
