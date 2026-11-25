// C4.3 — APIs REST, GraphQL e WebSockets: exercícios, avaliação final e projeto.
// Medições reais em Express 5.3.0, graphql 17.1.0, ws 8.23.0, Ajv 8.20.0, express-rate-limit 8.7.5 e PostgreSQL 17.12 (laboratório); os desafios "code" (JavaScript) modelam a lógica.
const R = String.raw;

export const exsets = {
'api-01': [
  { id: 'api-01-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual par de métodos é idempotente?', options: ['POST e PATCH', 'PUT e DELETE', 'POST e DELETE', 'PATCH e GET apenas'], answer: 1, explanation: 'PUT e DELETE (e GET) produzem o mesmo estado final ao serem repetidos; POST não.' },
  { id: 'api-01-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Medido: um PUT sem If-Match em um servidor que exige a pré-condição devolve 428.', answer: true, explanation: '428 Precondition Required; com ETag desatualizado, 412.' },
  { id: 'api-01-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o status à situação.', pairs: [['201', 'Recurso criado, com Location'], ['304', 'Cache do cliente ainda válido, sem corpo'], ['406', 'Accept pede um formato que o servidor não oferece'], ['405', 'Método não permitido, com Allow']], explanation: 'Respostas medidas no laboratório.' },
  { id: 'api-01-e4', type: 'trace', difficulty: 3, points: 10, prompt: 'Sequência medida.', code: 'POST /usuarios {nome:"Bia"} -> ?\nPOST /usuarios {nome:"Bia"} -> ?\nPUT com ETag antigo (outro cliente já alterou) -> ?', lang: 'text', steps: [{ q: 'Quantos recursos existem após os dois POSTs (considere só os criados)?', answers: ['2'] }, { q: 'Qual o status do PUT com ETag antigo?', answers: ['412'] }], explanation: 'POST não é idempotente; If-Match evita a perda de atualização.' },
  { id: 'api-01-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Explique a diferença entre método seguro e idempotente, dê exemplos e diga por que importa para retentativas.', model: 'Seguro não altera o estado do servidor (GET, HEAD, OPTIONS) e permite cache e pré-busca. Idempotente significa que repetir produz o mesmo estado final (GET, PUT, DELETE). Retentativas após timeouts são seguras para métodos idempotentes; POST pode duplicar efeitos e exige uma chave de idempotência.', rubric: ['Define seguro', 'Define idempotente', 'Cita exemplos corretos', 'Relaciona a retentativas e POST'], explanation: 'Base do HTTP.' },
  { id: 'api-01-e6', type: 'code', difficulty: 2, points: 25, prompt: 'Implemente §decidirPut(atual, ifMatch, nome)§. §atual§ é §null§ (não existe) ou §{ etag, nome }§. Regras na ordem: sem §ifMatch§ → §428§; §atual§ existe e §ifMatch !== atual.etag§ → §412§; §atual§ não existe → §201§; caso contrário → §200§.', lang: 'javascript', starter: 'function decidirPut(atual, ifMatch, nome) {\n  // seu código aqui\n}\n', hints: ['Verifique a ausência do cabeçalho primeiro.', 'Depois a comparação do ETag.'], tests: [{ name: 'pré-condições', code: R`assert.equal(decidirPut({ etag: 'a', nome: 'x' }, undefined, 'y'), 428);
assert.equal(decidirPut({ etag: 'a', nome: 'x' }, 'b', 'y'), 412);
assert.equal(decidirPut({ etag: 'a', nome: 'x' }, 'a', 'y'), 200);` }, { name: 'criação', code: R`assert.equal(decidirPut(null, '*', 'y'), 201);
assert.equal(decidirPut(null, undefined, 'y'), 428);` }], solution: R`function decidirPut(atual, ifMatch, nome) {
  if (!ifMatch) return 428;
  if (atual && ifMatch !== atual.etag) return 412;
  if (!atual) return 201;
  return 200;
}`, explanation: 'Controle de concorrência otimista com ETag.' }
],
'api-02': [
  { id: 'api-02-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual URL segue melhor as convenções REST para listar pedidos abertos de um cliente?', options: ['/getPedidosAbertos?cliente=7', '/pedidos?status=aberto&cliente=7', '/pedidos/abertos/cliente/7/listar', '/Pedido/ListarAbertos'], answer: 1, explanation: 'Substantivo no plural e filtros por query string.' },
  { id: 'api-02-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Adicionar um campo opcional à resposta é, em geral, uma mudança compatível.', answer: true, explanation: 'Clientes tolerantes ignoram campos desconhecidos; remover ou renomear quebra.' },
  { id: 'api-02-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o item ao tipo de mudança.', pairs: [['Adicionar um campo opcional', 'Compatível: clientes tolerantes ignoram'], ['Remover um campo', 'Incompatível: quebra quem o usa'], ['Mudar o tipo de id de número para texto', 'Incompatível: quebra a tipagem'], ['Adicionar um endpoint novo', 'Compatível: ninguém depende dele']], explanation: 'Critério de compatibilidade.' },
  { id: 'api-02-e4', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que viola as boas práticas de design de recursos.', code: 'GET    /pedidos\nPOST   /pedidos\nGET    /pedidos/42\nPOST   /pedidos/42/cancelarPedidoAgora?forcar=true&usuario=7', answer: 4, explanation: 'A ação deveria ser um sub-recurso (/cancelamentos) ou uma ação controlada, sem repetir o nome do recurso e com o usuário vindo da autenticação.' },
  { id: 'api-02-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Como modelar a operação "cancelar pedido" e por que não simplesmente espelhar as tabelas do banco na API?', model: 'Pode-se modelar como sub-recurso (POST /pedidos/42/cancelamentos) quando há histórico e motivo, como mudança de campo validada (PATCH status) ou como ação controlada (POST /pedidos/42:cancelar). Espelhar tabelas acopla os clientes ao esquema, expõe detalhes internos e força várias chamadas; a API deve refletir casos de uso do cliente.', rubric: ['Cita uma opção de modelagem', 'Cita outra opção', 'Explica o acoplamento ao banco', 'Cita casos de uso'], explanation: 'Design orientado ao cliente.' },
  { id: 'api-02-e6', type: 'code', difficulty: 2, points: 25, prompt: 'Implemente §construirQuery(params, permitidos)§: devolve a query string com os parâmetros cujas chaves estão em §permitidos§ e cujo valor não é §undefined§ nem §null§, em ordem alfabética das chaves, no formato §k=v§ unidos por §&§, com os valores passando por §encodeURIComponent§. Sem parâmetros válidos, devolva §""§.', lang: 'javascript', starter: 'function construirQuery(params, permitidos) {\n  // seu código aqui\n}\n', hints: ['Filtre as chaves permitidas e ordene.', 'Use encodeURIComponent no valor.'], tests: [{ name: 'ordem e filtro', code: R`assert.equal(construirQuery({ status: 'aberto', cliente: 7, admin: true }, ['status', 'cliente', 'ordem']), 'cliente=7&status=aberto');
assert.equal(construirQuery({ q: 'a b&c' }, ['q']), 'q=a%20b%26c');` }, { name: 'vazio', code: R`assert.equal(construirQuery({ a: null, b: undefined }, ['a', 'b']), '');
assert.equal(construirQuery({}, ['a']), '');` }], solution: R`function construirQuery(params, permitidos) {
  return Object.keys(params)
    .filter((k) => permitidos.includes(k) && params[k] !== undefined && params[k] !== null)
    .sort()
    .map((k) => k + '=' + encodeURIComponent(params[k]))
    .join('&');
}`, explanation: 'Lista de permissão de filtros e codificação correta.' }
],
'api-03': [
  { id: 'api-03-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'O que o SwaggerParser fez com uma $ref para um schema inexistente?', options: ['Aceitou e ignorou', 'Recusou com "Missing $ref pointer"', 'Criou o schema', 'Mudou para any'], answer: 1, explanation: 'Validar a especificação no CI evita referências quebradas.' },
  { id: 'api-03-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'additionalProperties: false faz o Ajv recusar campos não declarados.', answer: true, explanation: 'Medido: "must NOT have additional properties".' },
  { id: 'api-03-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a deriva ao erro medido.', pairs: [['Campo total removido', "must have required property 'total'"], ['id passou de número para texto', 'id must be integer'], ['status novo fora do enum', 'must be equal to one of the allowed values'], ['campo extra em uma requisição', 'must NOT have additional properties']], explanation: 'Resultados do teste de contrato e da validação.' },
  { id: 'api-03-e4', type: 'trace', difficulty: 3, points: 10, prompt: 'Corpo {cliente:"Ana", itens:[{sku:"x", qtd:0}]} validado com allErrors.', code: 'sku: pattern ^[A-Z]{2}-\\d{3}$\nqtd: minimum 1', lang: 'text', steps: [{ q: 'Quantos erros o Ajv devolve?', answers: ['2'] }, { q: 'Qual a opção que faz o Ajv devolver todos os erros?', answers: ['allErrors', 'allerrors'] }], explanation: 'Um erro de pattern no sku e outro de mínimo em qtd.' },
  { id: 'api-03-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Compare design-first e code-first para OpenAPI e diga como evitar a deriva do contrato.', model: 'Design-first escreve e revisa a especificação antes do código, permitindo mocks e clientes em paralelo e sendo melhor para APIs públicas; code-first gera a especificação do código (rápido), mas o contrato pode divergir. Evita-se a deriva validando a especificação no CI, testando as respostas do provedor contra os schemas, comparando versões para detectar mudanças incompatíveis e usando testes de contrato dos consumidores.', rubric: ['Descreve design-first', 'Descreve code-first', 'Cita teste de contrato', 'Cita validação no CI'], explanation: 'Contratos executáveis.' },
  { id: 'api-03-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §validar(obj, esquema)§, um mini JSON Schema. §esquema§: §{ required: [], properties: { campo: { type: "string" | "integer", minimum?, minLength? } }, additionalProperties?: false }§. Devolva a lista de erros (texto), nesta ordem: ausentes de §required§ (§"/ must have required property \'x\'"§); depois, para cada propriedade presente do esquema: tipo errado (§"/x must be string"§ ou §"/x must be integer"§), §minLength§ (§"/x must NOT have fewer than N characters"§), §minimum§ (§"/x must be >= N"§); por fim, com §additionalProperties: false§, §"/ must NOT have additional properties"§ (uma vez) se houver chaves fora do esquema.', lang: 'javascript', starter: 'function validar(obj, esquema) {\n  // seu código aqui\n}\n', hints: ['Percorra required, depois properties na ordem do esquema.', 'Só valide minimum/minLength se o tipo estiver correto.', 'Adicione o erro de campos extras uma única vez.'], tests: [{ name: 'obrigatórios e tipos', code: R`const esq = { required: ['nome', 'idade'], properties: { nome: { type: 'string', minLength: 3 }, idade: { type: 'integer', minimum: 18 } }, additionalProperties: false };
assert.equal(JSON.stringify(validar({ nome: 'Ana', idade: 20 }, esq)), '[]');
assert.equal(JSON.stringify(validar({ nome: 'Ana' }, esq)), '["/ must have required property \'idade\'"]');
assert.equal(JSON.stringify(validar({ nome: 5, idade: 1.5 }, esq)), '["/nome must be string","/idade must be integer"]');` }, { name: 'limites e extras', code: R`const esq = { required: ['nome', 'idade'], properties: { nome: { type: 'string', minLength: 3 }, idade: { type: 'integer', minimum: 18 } }, additionalProperties: false };
assert.equal(JSON.stringify(validar({ nome: 'A', idade: 10, admin: true }, esq)), '["/nome must NOT have fewer than 3 characters","/idade must be >= 18","/ must NOT have additional properties"]');
assert.equal(validar({ nome: 'Ana', idade: 20, extra: 1 }, { required: [], properties: { nome: { type: 'string' } } }).length, 0);` }], solution: R`function validar(obj, esquema) {
  const erros = [];
  for (const r of esquema.required || []) if (!(r in obj)) erros.push("/ must have required property '" + r + "'");
  for (const [k, p] of Object.entries(esquema.properties || {})) {
    if (!(k in obj)) continue;
    const v = obj[k];
    if (p.type === 'string') {
      if (typeof v !== 'string') { erros.push('/' + k + ' must be string'); continue; }
      if (p.minLength !== undefined && v.length < p.minLength) erros.push('/' + k + ' must NOT have fewer than ' + p.minLength + ' characters');
    } else if (p.type === 'integer') {
      if (!Number.isInteger(v)) { erros.push('/' + k + ' must be integer'); continue; }
      if (p.minimum !== undefined && v < p.minimum) erros.push('/' + k + ' must be >= ' + p.minimum);
    }
  }
  if (esquema.additionalProperties === false && Object.keys(obj).some((k) => !(k in (esquema.properties || {})))) erros.push('/ must NOT have additional properties');
  return erros;
}`, explanation: 'É o que o Ajv faz, em miniatura.' }
],
'api-04': [
  { id: 'api-04-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'No experimento com 50 posts e 20 autores, quantas consultas a autores houve com o DataLoader?', options: ['50', '20', '1', '0'], answer: 2, explanation: 'O DataLoader agrupou as chamadas em um único lote (sem DataLoader foram 50).' },
  { id: 'api-04-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Medido no Yoga: uma consulta com um campo que falha devolve status HTTP 500.', answer: false, explanation: 'O status foi 200, com errors e dados parciais; monitore o campo errors.' },
  { id: 'api-04-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a defesa ao risco.', pairs: [['Limite de profundidade', 'Consultas cíclicas que crescem exponencialmente'], ['DataLoader por requisição', 'N+1 nos resolvers'], ['Consultas persistidas', 'Consultas arbitrárias de clientes desconhecidos'], ['Mascarar erros', 'Vazamento de detalhes internos']], explanation: 'Proteções do GraphQL.' },
  { id: 'api-04-e4', type: 'trace', difficulty: 3, points: 10, prompt: 'Resposta medida por níveis autor→posts (20 posts).', code: 'níveis 1: 2.903 bytes\nníveis 3: 15.226 bytes\nníveis 5: 76.841 bytes\nníveis 7: 384.916 bytes', lang: 'text', steps: [{ q: 'A cada +2 níveis a resposta multiplicou por cerca de quanto?', answers: ['5'] }, { q: 'O crescimento é linear ou exponencial?', answers: ['exponencial'] }], explanation: 'Cada autor tem 5 posts, então cada par de níveis multiplica por ~5.' },
  { id: 'api-04-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Quando você escolheria GraphQL em vez de REST e que cuidados teria?', model: 'GraphQL é interessante quando há muitos clientes distintos (web, mobile) com necessidades de dados diferentes, grafos de dados e um BFF, pois o cliente escolhe os campos. Cuidados: N+1 com DataLoader, limites de profundidade e custo, paginação obrigatória, mascarar erros, desabilitar introspecção em produção, autorizar por campo e a perda do cache HTTP simples (usar persisted queries). REST segue melhor para APIs públicas simples e cache.', rubric: ['Cita quando GraphQL ajuda', 'Cita N+1/DataLoader', 'Cita limites de custo', 'Cita a desvantagem de cache ou o equilíbrio com REST'], explanation: 'Escolha por contexto.' },
  { id: 'api-04-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §carregarEmLote(ids, buscarLote)§, um DataLoader mínimo. §buscarLote(idsUnicos)§ recebe a lista de ids únicos (na ordem da primeira ocorrência) e devolve um objeto id → valor. Devolva §{ resultados, chamadas }§: §resultados§ na ordem de §ids§ (repetidos recebem o mesmo valor) e §chamadas§ = 1 (ou 0 se §ids§ for vazio).', lang: 'javascript', starter: 'function carregarEmLote(ids, buscarLote) {\n  // seu código aqui\n}\n', hints: ['Use um Set para ids únicos.', 'Não chame buscarLote se não houver ids.'], tests: [{ name: 'lote único', code: R`let recebidos = null;
const r = carregarEmLote([3, 1, 3, 2, 1], (u) => { recebidos = u; return { 1: 'a', 2: 'b', 3: 'c' }; });
assert.equal(JSON.stringify(recebidos), '[3,1,2]');
assert.equal(JSON.stringify(r), '{"resultados":["c","a","c","b","a"],"chamadas":1}');` }, { name: 'vazio', code: R`let n = 0;
const r = carregarEmLote([], () => { n++; return {}; });
assert.equal(n, 0);
assert.equal(JSON.stringify(r), '{"resultados":[],"chamadas":0}');` }], solution: R`function carregarEmLote(ids, buscarLote) {
  if (ids.length === 0) return { resultados: [], chamadas: 0 };
  const unicos = [...new Set(ids)];
  const mapa = buscarLote(unicos);
  return { resultados: ids.map((id) => mapa[id]), chamadas: 1 };
}`, explanation: 'Agrupar e deduplicar é a essência do DataLoader.' }
],
'api-05': [
  { id: 'api-05-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual o código de fechamento medido ao receber uma mensagem maior que o maxPayload?', options: ['1000', '1006', '1009', '1013'], answer: 2, explanation: '1009 = mensagem grande demais.' },
  { id: 'api-05-e2', type: 'tf', difficulty: 3, points: 10, prompt: 'Sem um ouvinte de error nos sockets do servidor ws, uma mensagem acima do maxPayload pode derrubar o processo.', answer: true, explanation: 'Medido: RangeError WS_ERR_UNSUPPORTED_MESSAGE_LENGTH sem tratamento derrubou o processo.' },
  { id: 'api-05-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a técnica ao problema.', pairs: [['Verificar a Origin no handshake', 'Sequestro de WebSocket entre sites'], ['Heartbeat', 'Clientes mortos que parecem conectados'], ['Limite de bufferedAmount', 'Consumidor lento acumulando memória'], ['maxPayload', 'Mensagens gigantes']], explanation: 'Proteções do servidor WebSocket.' },
  { id: 'api-05-e4', type: 'trace', difficulty: 3, points: 10, prompt: 'Handshake medido com verifyClient.', code: 'origem correta e token correto -> ?\ntoken errado -> ?\norigem errada -> ?', lang: 'text', steps: [{ q: 'Qual o status com o token errado?', answers: ['401'] }, { q: 'Qual o status com a origem errada?', answers: ['403'] }], explanation: '401 para token inválido e 403 para origem não permitida.' },
  { id: 'api-05-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Compare polling, SSE e WebSocket e diga como escalar WebSockets para várias instâncias.', model: 'Polling é simples e adequado a atualizações raras; SSE é unidirecional do servidor ao cliente sobre HTTP com reconexão automática, ótimo para notificações e feeds; WebSocket é bidirecional e de baixa latência, com mais estado e complexidade. Para várias instâncias, cada uma guarda os sockets dos seus clientes e usa um barramento (Redis pub/sub, NATS, Kafka) para distribuir mensagens, com reconexão com backoff, heartbeat compatível com o idle timeout do balanceador e desligamento ordenado.', rubric: ['Compara os três', 'Cita SSE para unidirecional', 'Cita um barramento entre instâncias', 'Cita heartbeat ou reconexão'], explanation: 'Escolha pela necessidade.' },
  { id: 'api-05-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §tickHeartbeat(clientes)§. §clientes§ é uma lista de §{ id, vivo }§. A cada tick: clientes com §vivo === false§ devem ser encerrados; os demais recebem ping e passam a §vivo = false§ (até responderem com pong). Devolva §{ encerrar, pingar, proximo }§: listas de ids e a nova lista de clientes (sem os encerrados, os pingados com §vivo: false§), preservando a ordem. Não altere a entrada.', lang: 'javascript', starter: 'function tickHeartbeat(clientes) {\n  // seu código aqui\n}\n', hints: ['Separe os clientes por vivo.', 'Crie novos objetos.'], tests: [{ name: 'tick', code: R`const c = [{ id: 1, vivo: true }, { id: 2, vivo: false }, { id: 3, vivo: true }];
const r = tickHeartbeat(c);
assert.equal(JSON.stringify(r), '{"encerrar":[2],"pingar":[1,3],"proximo":[{"id":1,"vivo":false},{"id":3,"vivo":false}]}');
assert.equal(c[0].vivo, true);` }, { name: 'ciclos', code: R`let c = [{ id: 1, vivo: true }, { id: 2, vivo: true }];
let r = tickHeartbeat(c);
c = r.proximo.map((x) => (x.id === 1 ? { ...x, vivo: true } : x));
r = tickHeartbeat(c);
assert.equal(JSON.stringify(r.encerrar), '[2]');
assert.equal(JSON.stringify(r.pingar), '[1]');` }], solution: R`function tickHeartbeat(clientes) {
  const encerrar = [], pingar = [], proximo = [];
  for (const c of clientes) {
    if (!c.vivo) { encerrar.push(c.id); continue; }
    pingar.push(c.id); proximo.push({ id: c.id, vivo: false });
  }
  return { encerrar, pingar, proximo };
}`, explanation: 'É o laço de ping/pong do servidor.' }
],
'api-06': [
  { id: 'api-06-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual o tempo medido da página 40.000 por OFFSET em 1 milhão de linhas?', options: ['~2 ms', '~15 ms', '~488 ms', '~5 s'], answer: 2, explanation: 'O keyset ficou em ~2,1 ms na mesma posição.' },
  { id: 'api-06-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Medido: depois de inserir 5 eventos novos no topo, a página 2 por OFFSET repetiu 5 ids da página 1.', answer: true, explanation: 'O keyset não repetiu nenhum.' },
  { id: 'api-06-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o algoritmo de limitação à característica.', pairs: [['Janela fixa', 'Rajada de até 2x na virada da janela'], ['Balde de fichas', 'Permite rajadas controladas e taxa média constante'], ['Balde furado', 'Suaviza o tráfego como uma fila que escoa'], ['Limite de concorrência', 'No máximo N requisições em andamento']], explanation: 'Escolha conforme o objetivo.' },
  { id: 'api-06-e4', type: 'trace', difficulty: 3, points: 10, prompt: 'Limite de 10 por segundo; 10 requisições no fim da janela 1 e 10 no começo da janela 2.', code: 'janela fixa: aceitas = ?\nbalde de fichas: aceitas = ?', lang: 'text', steps: [{ q: 'Quantas aceitou a janela fixa?', answers: ['20'] }, { q: 'Quantas aceitou o balde de fichas?', answers: ['11'] }], explanation: 'A janela fixa dobra na virada; o balde repôs só 1 ficha.' },
  { id: 'api-06-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Explique por que a paginação por cursor exige ordenação com desempate e índice, e o que se perde em relação ao OFFSET.', model: 'O cursor usa o último item visto (criado, id) como ponto de partida; sem um desempate único a ordem não é total e itens podem ser repetidos ou perdidos; o índice na mesma ordem permite achar o ponto sem ler as linhas anteriores, mantendo custo constante (~2,1 ms medido). Perde-se o pulo direto para a página N e o total barato (COUNT custou ~101 ms), compensando com busca e filtros.', rubric: ['Cita o desempate único', 'Cita o índice', 'Cita o custo constante', 'Cita a perda do acesso direto à página'], explanation: 'Troca típica do keyset.' },
  { id: 'api-06-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §proximaPagina(itens, cursor, limite)§. §itens§ é uma lista §{ id, criado }§ já em ordem decrescente por (§criado§, §id§). §cursor§ é §null§ ou §{ criado, id }§ (o último item visto): devolva só os itens estritamente anteriores a ele na ordem (§criado < c.criado§, ou igual com §id < c.id§). Devolva §{ itens, proximoCursor }§ com até §limite§ itens; §proximoCursor§ é o §{ criado, id }§ do último item devolvido se houver mais itens, senão §null§.', lang: 'javascript', starter: 'function proximaPagina(itens, cursor, limite) {\n  // seu código aqui\n}\n', hints: ['Filtre os itens depois do cursor.', 'Pegue limite + 1 para saber se há mais.'], tests: [{ name: 'páginas', code: R`const it = [{ id: 5, criado: 50 }, { id: 4, criado: 40 }, { id: 3, criado: 40 }, { id: 2, criado: 20 }, { id: 1, criado: 10 }];
let r = proximaPagina(it, null, 2);
assert.equal(JSON.stringify(r), '{"itens":[{"id":5,"criado":50},{"id":4,"criado":40}],"proximoCursor":{"criado":40,"id":4}}');
r = proximaPagina(it, r.proximoCursor, 2);
assert.equal(JSON.stringify(r.itens.map((x) => x.id)), '[3,2]');
assert.equal(JSON.stringify(r.proximoCursor), '{"criado":20,"id":2}');` }, { name: 'fim e inserção no topo', code: R`const it = [{ id: 9, criado: 90 }, { id: 5, criado: 50 }, { id: 4, criado: 40 }, { id: 3, criado: 30 }];
const r = proximaPagina(it, { criado: 40, id: 4 }, 5);
assert.equal(JSON.stringify(r), '{"itens":[{"id":3,"criado":30}],"proximoCursor":null}');
assert.equal(proximaPagina([], null, 3).proximoCursor, null);` }], solution: R`function proximaPagina(itens, cursor, limite) {
  const depois = cursor ? itens.filter((x) => x.criado < cursor.criado || (x.criado === cursor.criado && x.id < cursor.id)) : itens;
  const pagina = depois.slice(0, limite);
  const temMais = depois.length > limite;
  const ultimo = pagina[pagina.length - 1];
  return { itens: pagina, proximoCursor: temMais && ultimo ? { criado: ultimo.criado, id: ultimo.id } : null };
}`, explanation: 'Keyset: comparação de linha (criado, id) < cursor.' }
],
'api-07': [
  { id: 'api-07-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'O que o servidor deve fazer com a mesma Idempotency-Key e o mesmo corpo?', options: ['Executar de novo', 'Devolver a resposta guardada sem repetir o efeito', 'Responder 500', 'Ignorar a chave'], answer: 1, explanation: 'Replay: medido, a segunda tentativa devolveu o mesmo id e as cobranças continuaram 1.' },
  { id: 'api-07-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'O valor "true" é o formato correto do cabeçalho Deprecation segundo a RFC 9745.', answer: false, explanation: 'A RFC 9745 define uma data estruturada, como @1688169599; "true" vem de rascunhos antigos.' },
  { id: 'api-07-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a resposta à situação da chave de idempotência.', pairs: [['422', 'Mesma chave com outro corpo'], ['409', 'Mesma chave ainda em andamento'], ['400', 'Chave obrigatória ausente'], ['201 com replay', 'Mesma chave e corpo já concluídos']], explanation: 'Respostas medidas.' },
  { id: 'api-07-e4', type: 'trace', difficulty: 3, points: 10, prompt: '5 requisições simultâneas com a mesma chave.', code: 'status: 201 409 409 409 409\ncobranças efetuadas: 1', lang: 'text', steps: [{ q: 'Quantas requisições executaram o efeito?', answers: ['1'] }, { q: 'Quantos 409 foram devolvidos?', answers: ['4'] }], explanation: 'A reserva da chave antes de qualquer await evita a corrida.' },
  { id: 'api-07-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Como implementar a idempotência em produção com várias instâncias e quais cuidados ter?', model: 'Usar armazenamento compartilhado e durável: uma tabela com a chave como PRIMARY KEY e INSERT ... ON CONFLICT DO NOTHING na mesma transação do efeito, ou Redis com SET NX EX para o estado em andamento. Escopar a chave por cliente e operação, guardar o hash do corpo para detectar reutilização incorreta (422), tratar concorrência (409 ou espera), definir TTL e limpeza, e repassar a chave a serviços externos (idempotência ponta a ponta), com outbox para mensagens.', rubric: ['Armazenamento compartilhado e atômico', 'Hash do corpo e 422', 'Concorrência', 'TTL ou escopo da chave'], explanation: 'Resumo da aula.' },
  { id: 'api-07-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §processar(loja, chave, corpo, executar)§. §loja§ é um §Map§. Sem §chave§ → §{ status: 400 }§. Se a chave existe: corpo (JSON) diferente → §{ status: 422 }§; estado §"andamento"§ → §{ status: 409 }§; senão → §{ status: reg.status, corpo: reg.corpo, replay: true }§. Se não existe: grave §{ hash, estado: "andamento" }§, chame §executar(corpo)§ (síncrono), grave o resultado §{ hash, estado: "concluido", status: 201, corpo: resultado }§ e devolva §{ status: 201, corpo: resultado }§.', lang: 'javascript', starter: 'function processar(loja, chave, corpo, executar) {\n  // seu código aqui\n}\n', hints: ['Use JSON.stringify(corpo) como hash.', 'Grave "andamento" antes de executar.'], tests: [{ name: 'replay e conflito', code: R`const loja = new Map(); let efeitos = 0; const exec = (c) => { efeitos++; return { id: 'pg_' + efeitos, valor: c.valor }; };
const a = processar(loja, 'k1', { valor: 100 }, exec);
const b = processar(loja, 'k1', { valor: 100 }, exec);
assert.equal(JSON.stringify(a), '{"status":201,"corpo":{"id":"pg_1","valor":100}}');
assert.equal(JSON.stringify(b), '{"status":201,"corpo":{"id":"pg_1","valor":100},"replay":true}');
assert.equal(efeitos, 1);
assert.equal(processar(loja, 'k1', { valor: 5 }, exec).status, 422);` }, { name: 'sem chave e em andamento', code: R`const loja = new Map();
assert.equal(processar(loja, undefined, {}, () => 1).status, 400);
let interno;
processar(loja, 'k2', { v: 1 }, () => { interno = processar(loja, 'k2', { v: 1 }, () => 99); return { ok: 1 }; });
assert.equal(interno.status, 409);` }], solution: R`function processar(loja, chave, corpo, executar) {
  if (!chave) return { status: 400 };
  const hash = JSON.stringify(corpo);
  const reg = loja.get(chave);
  if (reg) {
    if (reg.hash !== hash) return { status: 422 };
    if (reg.estado === 'andamento') return { status: 409 };
    return { status: reg.status, corpo: reg.corpo, replay: true };
  }
  loja.set(chave, { hash, estado: 'andamento' });
  const resultado = executar(corpo);
  loja.set(chave, { hash, estado: 'concluido', status: 201, corpo: resultado });
  return { status: 201, corpo: resultado };
}`, explanation: 'Reservar a chave antes do efeito é o que impede a duplicação sob concorrência.' }
],
'api-08': [
  { id: 'api-08-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'No experimento do gateway, o que aconteceu depois de 3 timeouts seguidos?', options: ['Os próximos pedidos continuaram indo ao upstream', 'O disjuntor abriu e os próximos devolveram 503 em poucos ms', 'O gateway reiniciou', 'O upstream cancelou o trabalho'], answer: 1, explanation: 'Medido: 503 em 3–5 ms; só 3 chamadas chegaram ao upstream de 6.' },
  { id: 'api-08-e2', type: 'tf', difficulty: 3, points: 10, prompt: 'O timeout do gateway cancela o trabalho que o upstream já estava executando.', answer: false, explanation: 'O gateway só abandona a espera; o upstream precisa de seus próprios timeouts e cancelamento.' },
  { id: 'api-08-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o componente à função.', pairs: [['API gateway', 'Porta de entrada: roteamento, autenticação e limites'], ['BFF', 'Gateway sob medida para um tipo de cliente'], ['Disjuntor', 'Falha rápido quando o serviço está doente'], ['Teste de contrato', 'Verifica o acordo de interface entre serviços']], explanation: 'Papéis na arquitetura de APIs.' },
  { id: 'api-08-e4', type: 'trace', difficulty: 3, points: 10, prompt: 'Custo do gateway medido (mediana de 200 requisições).', code: 'direto: 2,72 ms\nvia gateway: 4,84 ms', lang: 'text', steps: [{ q: 'Quanto custou o salto extra, em ms (arredonde para uma casa; use ponto)?', answers: ['2.1', '2,1'] }, { q: 'O custo vale para localhost; em rede real soma-se a latência do segundo salto (sim ou não)?', answers: ['sim'] }], explanation: '4,84 - 2,72 ≈ 2,1 ms.' },
  { id: 'api-08-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Que responsabilidades devem e quais não devem ficar em um API gateway? Cite três riscos.', model: 'Devem ficar roteamento, autenticação na borda, rate limiting, TLS, CORS, correlação de requisições, timeouts, disjuntor e cache; não devem ficar regras de negócio. Riscos: ponto único de falha (exige alta disponibilidade), gargalo e latência extra, acúmulo de lógica no gateway e acoplamento; também a falsa sensação de segurança (os serviços internos ainda devem autorizar).', rubric: ['Cita responsabilidades adequadas', 'Cita que regra de negócio não fica no gateway', 'Cita três riscos', 'Cita defesa em profundidade'], explanation: 'Gateway enxuto.' },
  { id: 'api-08-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §criarDisjuntor(limite, abertoMs)§, que devolve §chamar(fn, agora)§. Estados: fechado (conta falhas consecutivas); ao atingir §limite§ falhas, abre até §agora + abertoMs§. Aberto e §agora < abertoAte§: não chama §fn§ e devolve §{ ok: false, rapido: true }§. Aberto e §agora >= abertoAte§: semiaberto: chama §fn§; sucesso fecha e zera as falhas; falha reabre por §abertoMs§. Retorno normal: §{ ok: true, valor }§ ou §{ ok: false, erro: mensagem }§. §fn§ falha ao lançar.', lang: 'javascript', starter: 'function criarDisjuntor(limite, abertoMs) {\n  // seu código aqui\n}\n', hints: ['Guarde falhas e abertoAte em variáveis.', 'No semiaberto, qualquer falha reabre.'], tests: [{ name: 'abre e falha rápido', code: R`const d = criarDisjuntor(3, 400); let chamadas = 0;
const ruim = () => { chamadas++; throw new Error('timeout'); };
const r = [d(ruim, 0), d(ruim, 10), d(ruim, 20), d(ruim, 30), d(ruim, 40)];
assert.equal(JSON.stringify(r.map((x) => x.ok)), '[false,false,false,false,false]');
assert.equal(r[3].rapido, true);
assert.equal(chamadas, 3);` }, { name: 'recuperação', code: R`const d = criarDisjuntor(2, 100);
const ruim = () => { throw new Error('x'); }; const bom = () => 'ok';
d(ruim, 0); d(ruim, 1);
assert.equal(d(bom, 50).rapido, true);
assert.equal(JSON.stringify(d(bom, 120)), '{"ok":true,"valor":"ok"}');
assert.equal(JSON.stringify(d(bom, 121)), '{"ok":true,"valor":"ok"}');
d(ruim, 130); d(ruim, 131);
assert.equal(d(ruim, 300).erro, 'x');
assert.equal(d(bom, 301).rapido, true);` }], solution: R`function criarDisjuntor(limite, abertoMs) {
  let falhas = 0, abertoAte = 0, aberto = false;
  return function chamar(fn, agora) {
    if (aberto && agora < abertoAte) return { ok: false, rapido: true };
    const semiaberto = aberto;
    try {
      const valor = fn();
      aberto = false; falhas = 0;
      return { ok: true, valor };
    } catch (e) {
      falhas++;
      if (semiaberto || falhas >= limite) { aberto = true; abertoAte = agora + abertoMs; falhas = 0; }
      return { ok: false, erro: e.message };
    }
  };
}`, explanation: 'O estado semiaberto testa a recuperação com uma chamada.' }
]
};

const P = 'apis-p';
export const assessment = {
  id: 'apis', title: 'Avaliação final — APIs REST, GraphQL e WebSockets', passPct: 70, minutes: 45,
  items: [
    { id: P + '1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual status indica que a pré-condição If-Match falhou?', options: ['400', '409', '412', '428'], answer: 2, explanation: '412 Precondition Failed; 428 indica que a pré-condição era obrigatória e não foi enviada.' },
    { id: P + '2', type: 'tf', difficulty: 2, points: 10, prompt: 'Erros parciais de uma consulta GraphQL aparecem com status HTTP 200 e um campo errors no corpo.', answer: true, explanation: 'Medido no Yoga; monitore o corpo.' },
    { id: P + '3', type: 'trace', difficulty: 3, points: 10, prompt: 'N+1 em GraphQL medido.', code: '50 posts de 20 autores\nsem DataLoader: ? consultas a autores\ncom DataLoader: ? consulta', lang: 'text', steps: [{ q: 'Sem DataLoader?', answers: ['50'] }, { q: 'Com DataLoader?', answers: ['1'] }], explanation: 'O DataLoader agrupa as chamadas.' },
    { id: P + '4', type: 'mc', difficulty: 3, points: 10, prompt: 'Por que verificar a Origin no handshake de um WebSocket?', options: ['Para melhorar a compressão', 'Para evitar o sequestro entre sites, pois o navegador envia cookies', 'Porque o protocolo exige', 'Para reduzir a latência'], answer: 1, explanation: 'CSWSH.' },
    { id: P + '5', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que grava a chave tarde demais, abrindo uma janela de corrida.', code: 'const reg = memoria.get(chave);\nif (reg) return responder(reg);\nconst corpo = await cobrar(req.body);\nmemoria.set(chave, { corpo });', answer: 4, explanation: 'A chave só é gravada depois do await: duas requisições passam pelo teste e cobram duas vezes; reserve a chave antes de executar.' },
    { id: P + '6', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete a consulta keyset.', code: 'SELECT id, criado FROM eventos WHERE (criado, id) [[0]] ($1, $2) ORDER BY criado DESC, id DESC LIMIT 20;', answers: [['<']], explanation: 'Na ordem decrescente, o próximo item é estritamente menor que o cursor.' },
    { id: P + '7', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a medição à lição.', pairs: [['OFFSET na página 40.000: ~488 ms; keyset: ~2,1 ms', 'Cursor mantém custo constante'], ['Janela fixa aceitou 20; balde aceitou 11', 'Janela fixa permite rajada na virada'], ['maxPayload excedido: fecho 1009', 'Limite de tamanho de mensagem'], ['Cliente antigo quebrou ao remover "nome"', 'Remover campo é mudança incompatível']], explanation: 'Experimentos das aulas 3 a 7.' },
    { id: P + '8', type: 'mc', difficulty: 3, points: 10, prompt: 'Qual cabeçalho comunica a data de desativação de uma versão da API?', options: ['Deprecation', 'Sunset', 'Retry-After', 'Vary'], answer: 1, explanation: 'Sunset (RFC 8594); o Deprecation (RFC 9745) indica a depreciação.' },
    { id: P + '9', type: 'tf', difficulty: 3, points: 10, prompt: 'Um disjuntor aberto continua chamando o upstream para medir sua recuperação em toda requisição.', answer: false, explanation: 'Aberto, ele falha rápido sem chamar; só no estado semiaberto deixa uma chamada de teste.' },
    { id: P + '10', type: 'mc', difficulty: 3, points: 10, prompt: 'Qual abordagem protege uma API GraphQL de consultas caras?', options: ['Aceitar qualquer consulta', 'Limites de profundidade e custo, paginação e consultas persistidas', 'Desligar o servidor', 'Usar apenas GET'], answer: 1, explanation: 'O cliente controla a consulta; é preciso limitá-la.' },
    { id: P + '11', type: 'open', difficulty: 3, points: 10, prompt: 'Projete a estratégia de contratos e evolução de uma API pública: especificação, testes, versionamento e depreciação.', model: 'Especificação OpenAPI como fonte da verdade (design-first), validada no CI com lint, com erros em Problem Details; validação de requisições com esquemas e testes de contrato das respostas do provedor, mais contratos dos consumidores (Pact); mudanças compatíveis na mesma versão major (adicionar campos, clientes tolerantes) e incompatíveis em nova versão por URL ou mídia; depreciação com Deprecation (data), Sunset e Link, medição do uso, prazos, brownouts e 410 no desligamento; idempotência com chave nos POSTs críticos; paginação por cursor e limites de taxa documentados.', rubric: ['OpenAPI e validação no CI', 'Testes de contrato', 'Versionamento e mudanças compatíveis', 'Deprecation, Sunset e processo de desligamento'], explanation: 'Resumo do projeto integrador.' },
    { id: P + '12', type: 'mc', difficulty: 3, points: 10, prompt: 'Quando preferir SSE a WebSocket?', options: ['Quando o cliente envia muitas mensagens', 'Quando só o servidor envia dados e se quer simplicidade e reconexão automática', 'Nunca', 'Para jogos multijogador'], answer: 1, explanation: 'SSE é unidirecional sobre HTTP.' }
  ]
};

export const project = {
  id: 'api-contratos-tempo-real', name: 'API com contratos e tempo real: OpenAPI, REST, GraphQL, WebSocket, idempotência, gateway e medições', lv: 'M', stack: 'Node.js, Express 5, OpenAPI 3.1, Ajv, graphql/Yoga, ws, PostgreSQL, Redis (opcional)', ds: ['apis'],
  desc: 'Construa uma **API de pedidos** com **REST** (CRUD), **GraphQL** (consultas do painel) e **WebSocket** (status ao vivo), com **OpenAPI como contrato**, **testes de contrato**, **paginação por cursor**, **Idempotency-Key**, **ETag/If-Match**, **versionamento e depreciação**, **rate limiting por chave** e um **gateway** com timeout e disjuntor. Meça e documente as decisões em um **ADR**.',
  rf: ['OpenAPI 3.1 design-first validada no CI, com erros em Problem Details', 'Validação de requisições (Ajv) e teste de contrato das respostas do provedor', 'Paginação por cursor, filtros com lista de permissão e limites máximos', 'Idempotency-Key nos POSTs críticos com teste de concorrência', 'ETag e If-Match nas atualizações (428 e 412)', 'Versionamento (/v1) com Deprecation, Sunset e Link para uma mudança planejada', 'GraphQL com DataLoader, limite de profundidade, paginação e erros mascarados', 'WebSocket com autenticação e Origin, maxPayload, heartbeat e política de consumidor lento', 'Gateway com roteamento, autenticação na borda, rate limiting por chave, timeout, disjuntor e id de correlação'],
  rnf: ['Versões fixas das bibliotecas e do banco registradas', 'Nenhum nome de coluna ou ordem vindo do cliente sem lista de permissão', 'README com medições, comandos e limitações', 'Testes automatizados dos caminhos de sucesso e de erro'],
  ac: ['Um contrato quebrado (campo removido) falha o CI do provedor', 'Retentativas concorrentes do mesmo POST produzem um único efeito', 'A paginação por cursor não repete nem perde itens com inserções durante a navegação', 'O disjuntor protege o upstream e a recuperação é demonstrada', 'O ADR justifica REST x GraphQL, cursor x OFFSET e a estratégia de versionamento com números medidos'],
  ch: ['Gerar um cliente tipado a partir do OpenAPI e usá-lo nos testes', 'Escalar o WebSocket a duas instâncias com Redis pub/sub', 'Adicionar consultas persistidas ao GraphQL', 'Substituir o gateway didático por Envoy, Kong ou NGINX', 'Implementar contratos dirigidos pelo consumidor com Pact']
};
