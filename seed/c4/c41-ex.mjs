// C4.1 — Node.js e Express: exercícios, avaliação final e projeto.
// Medições reais em Node.js 26.13.1 e Express 5.3.0 (laboratório); os desafios "code" (JavaScript) modelam a lógica.
const R = String.raw;

export const exsets = {
'nex-01': [
  { id: 'nex-01-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'O que acontece com as outras requisições enquanto um handler executa um laço síncrono de 600 ms no Node?', options: ['São atendidas em paralelo por outras threads', 'Esperam o laço terminar', 'São descartadas', 'São atendidas pelo thread pool da libuv'], answer: 1, explanation: 'Medido: a rota rápida levou 558 ms e o atraso do event loop foi de 605 ms.' },
  { id: 'nex-01-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Dentro de um callback de E/S, setImmediate sempre executa antes de setTimeout com 0 ms.', answer: true, explanation: 'Medido nas três execuções: setImmediate -> setTimeout 0. No módulo principal a ordem não é determinística.' },
  { id: 'nex-01-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o recurso ao seu papel.', pairs: [['process.nextTick', 'Fila de maior prioridade em CommonJS'], ['Promise.then', 'Microtarefa'], ['setImmediate', 'Fase check do laço, após a E/S'], ['monitorEventLoopDelay', 'Mede o atraso causado por bloqueio']], explanation: 'Vocabulário do event loop.' },
  { id: 'nex-01-e4', type: 'trace', difficulty: 3, points: 10, prompt: 'Resultados medidos com um laço de 600 ms.', code: 'Bloqueante: /rapida levou 558 ms; atraso do loop 605 ms\nWorker thread: /rapida levou 5 ms; atraso do loop 12 ms; a requisição lenta levou 913 ms', lang: 'text', steps: [{ q: 'Por que a requisição com worker levou 913 ms e não 600 ms?', answers: ['custo de iniciar o worker', 'iniciar o worker', 'inicialização do worker', 'carregar o módulo no worker'] }, { q: 'Qual a ordem esperada em CommonJS: nextTick antes ou depois de promise.then?', answers: ['antes'] }], explanation: 'Iniciar um worker carrega o módulo e custa tempo; use um pool. Em CommonJS, nextTick vem antes.' },
  { id: 'nex-01-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Explique por que o Node atende bem muitas conexões com uma thread de JavaScript e por que ele é frágil a tarefas de CPU. Dê duas soluções.', model: 'O Node delega a espera de E/S ao sistema e executa um callback de cada vez quando algo termina; esperar não consome a thread, então milhares de conexões cabem. Mas qualquer código síncrono demorado ocupa a única thread e atrasa todas as outras requisições (medido: 558 ms para uma rota rápida). Soluções: worker threads (de preferência em pool), processos filhos, fila de jobs em outro serviço, dividir o trabalho cedendo o controle e escalar com mais processos (sem consertar o handler).', rubric: ['Explica a delegação da E/S', 'Explica o bloqueio pela única thread', 'Cita duas soluções', 'Cita medição ou a métrica de atraso do loop'], explanation: 'Resumo da aula.' },
  { id: 'nex-01-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §ordemDeExecucao(tarefas)§, que recebe uma lista de objetos §{ nome, tipo }§ na ordem em que foram agendadas e devolve a lista de nomes na ordem de execução. Prioridade dos tipos: §sync§, §nextTick§, §microtask§, §timer§, §immediate§. Dentro do mesmo tipo, mantenha a ordem de agendamento.', lang: 'javascript', starter: 'function ordemDeExecucao(tarefas) {\n  // seu código aqui\n}\n', hints: ['Defina a ordem dos tipos em uma lista.', 'Use sort estável (o sort do JavaScript atual é estável).'], tests: [{ name: 'prioridades', code: R`const t = [{ nome: 'timer', tipo: 'timer' }, { nome: 'imediato', tipo: 'immediate' }, { nome: 'tick', tipo: 'nextTick' }, { nome: 'promise', tipo: 'microtask' }, { nome: 'sincrono', tipo: 'sync' }];
assert.equal(JSON.stringify(ordemDeExecucao(t)), '["sincrono","tick","promise","timer","imediato"]');` }, { name: 'estabilidade', code: R`const t = [{ nome: 'a', tipo: 'microtask' }, { nome: 'b', tipo: 'sync' }, { nome: 'c', tipo: 'microtask' }, { nome: 'd', tipo: 'sync' }];
assert.equal(JSON.stringify(ordemDeExecucao(t)), '["b","d","a","c"]');
assert.equal(JSON.stringify(ordemDeExecucao([])), '[]');` }], solution: R`function ordemDeExecucao(tarefas) {
  const prioridade = ['sync', 'nextTick', 'microtask', 'timer', 'immediate'];
  return [...tarefas].sort((a, b) => prioridade.indexOf(a.tipo) - prioridade.indexOf(b.tipo)).map((t) => t.nome);
}`, explanation: 'Modelo simplificado: o real tem fases, mas a regra síncrono, microtarefas e depois macrotarefas é a garantida.' }
],
'nex-02': [
  { id: 'nex-02-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'O que define se um arquivo .js é tratado como ESM ou CommonJS?', options: ['A extensão apenas', 'O campo "type" do package.json mais próximo', 'A versão do npm', 'O nome do arquivo'], answer: 1, explanation: 'Medido: o mesmo .js foi CommonJS sem "type" e ESM com "type": "module". Já .mjs e .cjs são fixos.' },
  { id: 'nex-02-e2', type: 'tf', difficulty: 2, points: 10, prompt: '__dirname existe em módulos ESM.', answer: false, explanation: 'Medido: ReferenceError. Use import.meta.dirname ou import.meta.url.' },
  { id: 'nex-02-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o comando ao efeito.', pairs: [['npm ci', 'Instala exatamente o lockfile, de forma limpa'], ['npm install', 'Instala e pode atualizar o lockfile'], ['npm outdated', 'Lista pacotes com versões novas'], ['npm run dev', 'Executa o script "dev" do package.json']], explanation: 'Comandos usados no dia a dia.' },
  { id: 'nex-02-e4', type: 'trace', difficulty: 3, points: 10, prompt: 'Interoperabilidade medida no Node 26.13.1.', code: "lib.mjs: export const soma = (a, b) => a + b; export default 'padrao';\nusa-cjs.cjs: const m = require('./lib.mjs'); m.soma(2, 3); import('./lib.mjs').then(x => x.soma(1, 1))", lang: 'text', steps: [{ q: 'Quanto vale m.soma(2, 3)?', answers: ['5'] }, { q: 'Quanto devolve x.soma(1, 1)?', answers: ['2'] }], explanation: 'Neste runtime, require() de ESM síncrono funciona e import() dinâmico também.' },
  { id: 'nex-02-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Por que commitar o package-lock.json e usar npm ci no CI? Cite dois riscos da cadeia de suprimentos e uma mitigação para cada.', model: 'O lockfile registra a árvore exata e os hashes; npm ci instala exatamente isso e falha se divergir, garantindo builds reproduzíveis e iguais aos testados. Riscos: pacotes maliciosos por typosquatting (mitigação: conferir nome e autor, poucas dependências) e scripts de instalação que executam código (mitigação: --ignore-scripts em CI quando possível, revisar atualizações); também vulnerabilidades conhecidas (npm audit, Dependabot/Renovate).', rubric: ['Explica a reprodutibilidade', 'Cita dois riscos', 'Cita mitigações', 'Menciona o lockfile ou o npm ci'], explanation: 'Descrito a partir da documentação; auditoria não executada no laboratório.' },
  { id: 'nex-02-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §satisfaz(versao, intervalo)§ para versões §"x.y.z"§ (números). §intervalo§ pode ser §"^x.y.z"§ (mesmo major, versão maior ou igual; para major 0, mesmo minor, conforme o semver do npm: §^0.2.3§ aceita §0.2.x≥3§ e §^0.0.3§ aceita só §0.0.3§), §"~x.y.z"§ (mesmo major e minor, patch maior ou igual) ou uma versão exata.', lang: 'javascript', starter: 'function satisfaz(versao, intervalo) {\n  // seu código aqui\n}\n', hints: ['Converta as versões em listas de números.', 'Compare listas posição por posição.', 'Trate o caso de major 0 no caret.'], tests: [{ name: 'caret e til', code: R`assert.equal(satisfaz('1.4.2', '^1.2.3'), true);
assert.equal(satisfaz('2.0.0', '^1.2.3'), false);
assert.equal(satisfaz('1.2.2', '^1.2.3'), false);
assert.equal(satisfaz('1.2.9', '~1.2.3'), true);
assert.equal(satisfaz('1.3.0', '~1.2.3'), false);` }, { name: 'major zero e exata', code: R`assert.equal(satisfaz('0.2.9', '^0.2.3'), true);
assert.equal(satisfaz('0.3.0', '^0.2.3'), false);
assert.equal(satisfaz('0.0.3', '^0.0.3'), true);
assert.equal(satisfaz('0.0.4', '^0.0.3'), false);
assert.equal(satisfaz('5.0.1', '5.0.1'), true);
assert.equal(satisfaz('5.0.2', '5.0.1'), false);` }], solution: R`function satisfaz(versao, intervalo) {
  const num = (s) => s.split('.').map(Number);
  const cmp = (a, b) => { for (let i = 0; i < 3; i++) { if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1; } return 0; };
  const v = num(versao);
  if (intervalo[0] === '^' || intervalo[0] === '~') {
    const base = num(intervalo.slice(1));
    if (cmp(v, base) < 0) return false;
    if (intervalo[0] === '~') return v[0] === base[0] && v[1] === base[1];
    if (base[0] > 0) return v[0] === base[0];
    if (base[1] > 0) return v[0] === 0 && v[1] === base[1];
    return v[0] === 0 && v[1] === 0 && v[2] === base[2];
  }
  return cmp(v, num(intervalo)) === 0;
}`, explanation: 'O caret preserva a parte mais significativa não nula.' }
],
'nex-03': [
  { id: 'nex-03-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'No Express 5, o que acontece quando um handler async lança um erro?', options: ['A requisição fica pendurada', 'O erro é encaminhado ao middleware de erro (medido: 500)', 'O processo é encerrado sempre', 'O erro é ignorado'], answer: 1, explanation: 'O Express 5 trata promises rejeitadas automaticamente.' },
  { id: 'nex-03-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'A rota "/arquivos/*" é aceita no Express 5 sem alterações.', answer: false, explanation: 'Medido: "Missing parameter name". Use um curinga nomeado, como "/arquivos/*caminho".' },
  { id: 'nex-03-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a propriedade à origem do dado.', pairs: [['req.params', 'Parâmetros da rota, como :id'], ['req.query', 'Query string'], ['req.body', 'Corpo lido por um parser'], ['req.headers', 'Cabeçalhos da requisição']], explanation: 'Fontes de dados de uma requisição.' },
  { id: 'nex-03-e4', type: 'trace', difficulty: 3, points: 10, prompt: 'Requisição medida no Express 5.3.0: GET /usuarios/42?filtro=a&filtro=b&n=1', code: "app.get('/usuarios/:id', (req, res) => res.json({ id: req.params.id, query: req.query }))", lang: 'text', steps: [{ q: 'Qual o tipo de valor de req.query.filtro (texto ou array)?', answers: ['array'] }, { q: 'req.query.n é número ou texto?', answers: ['texto', 'string'] }], explanation: 'Valores repetidos viram array e números continuam texto.' },
  { id: 'nex-03-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Por que manter handlers finos e como organizar rotas de uma API com vários recursos?', model: 'Handlers finos apenas validam a entrada, chamam um serviço e respondem; a regra de negócio fica em serviços e o acesso a dados em repositórios, o que facilita testes e reuso e uma migração futura de framework. Organize por recurso com Routers montados sob prefixos (/v1/usuarios, /v1/pedidos), com route() agrupando métodos do mesmo caminho, e registre 404 e o tratador de erros por último.', rubric: ['Explica o papel do handler fino', 'Cita serviços e repositórios', 'Cita Router por recurso', 'Cita a ordem de 404 e erro'], explanation: 'Boa estrutura facilita testes e evolução.' },
  { id: 'nex-03-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §casar(padrao, caminho)§, um roteador mínimo. §padrao§ usa segmentos separados por §/§: §:nome§ captura um segmento e um último segmento §*nome§ captura o resto como array. Devolva um objeto com os parâmetros (capturas simples em texto) ou §null§ se não casar. Os segmentos literais devem ser iguais; o número de segmentos deve coincidir (exceto com o curinga final, que exige pelo menos um segmento).', lang: 'javascript', starter: 'function casar(padrao, caminho) {\n  // seu código aqui\n}\n', hints: ['Divida padrão e caminho por "/".', 'Trate o curinga apenas no último segmento do padrão.', 'Compare literais com ===.'], tests: [{ name: 'parâmetros', code: R`assert.equal(JSON.stringify(casar('/usuarios/:id', '/usuarios/42')), '{"id":"42"}');
assert.equal(JSON.stringify(casar('/u/:a/p/:b', '/u/1/p/2')), '{"a":"1","b":"2"}');
assert.equal(casar('/usuarios/:id', '/usuarios'), null);
assert.equal(casar('/usuarios/:id', '/pedidos/42'), null);
assert.equal(casar('/usuarios/:id', '/usuarios/42/extra'), null);` }, { name: 'curinga nomeado', code: R`assert.equal(JSON.stringify(casar('/arquivos/*caminho', '/arquivos/a/b/c.txt')), '{"caminho":["a","b","c.txt"]}');
assert.equal(JSON.stringify(casar('/arquivos/*caminho', '/arquivos/x')), '{"caminho":["x"]}');
assert.equal(casar('/arquivos/*caminho', '/arquivos'), null);
assert.equal(JSON.stringify(casar('/', '/')), '{}');` }], solution: R`function casar(padrao, caminho) {
  const p = padrao.split('/').filter(Boolean);
  const c = caminho.split('/').filter(Boolean);
  const params = {};
  for (let i = 0; i < p.length; i++) {
    const seg = p[i];
    if (seg[0] === '*') {
      if (i !== p.length - 1 || c.length <= i) return null;
      params[seg.slice(1)] = c.slice(i);
      return params;
    }
    if (i >= c.length) return null;
    if (seg[0] === ':') params[seg.slice(1)] = c[i];
    else if (seg !== c[i]) return null;
  }
  return c.length === p.length ? params : null;
}`, explanation: 'É a ideia do roteador: casar segmentos e extrair parâmetros.' }
],
'nex-04': [
  { id: 'nex-04-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'O que acontece se um middleware nem responde nem chama next()?', options: ['O Express chama o próximo automaticamente', 'A requisição fica pendurada', 'Responde 404', 'Responde 500'], answer: 1, explanation: 'Todo middleware deve responder ou chamar next().' },
  { id: 'nex-04-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Com o CORS configurado para uma origem, o servidor devolve 403 a requisições de outras origens.', answer: false, explanation: 'Medido: a origem não listada recebeu 200; quem bloqueia a leitura é o navegador. CORS não é autenticação.' },
  { id: 'nex-04-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o resultado medido ao cenário.', pairs: [['413', 'JSON de ~200 KB com o limite padrão de 100 KB'], ['400', 'JSON malformado'], ['204 com allow-methods', 'Pré-voo OPTIONS do CORS'], ['x-powered-by removido', 'Uso do helmet']], explanation: 'Medições da aula.' },
  { id: 'nex-04-e4', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que impede a rota /uploads-json de aceitar corpos de até 1 MB.', code: 'app.use(express.json({ limit: "10kb" }));\napp.post("/uploads-json", express.json({ limit: "1mb" }), (req, res) => res.sendStatus(204));', answer: 1, explanation: 'O parser global registrado antes rejeita o corpo com 413. Registre a exceção antes dele ou aplique parsers por rota.' },
  { id: 'nex-04-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Proponha a ordem de middlewares de uma API (de cima para baixo) e justifique três posições.', model: 'Segurança de cabeçalhos (helmet) e CORS; identificador e log da requisição; parsers com limites; autenticação e autorização; validação; rotas; 404; tratador de erros. Justificativas: o log/id vêm cedo para cobrir tudo; os parsers vêm antes das rotas para req.body existir e com limites para evitar abuso; 404 e erro vêm por último porque só devem agir se nenhuma rota respondeu.', rubric: ['Ordem coerente', 'Justifica três posições', 'Cita limites de corpo', 'Cita 404 e erro por último'], explanation: 'A ordem de registro é a ordem de execução.' },
  { id: 'nex-04-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §executar(mws, req)§ para um mini-Express. §mws§ é uma lista de funções §(req, next)§. Execute-as em ordem: cada função chama §next()§ para continuar ou §next(err)§ para parar com erro; se não chamar §next§, a cadeia para. Devolva §{ ordem, erro }§: §ordem§ é a lista dos índices executados e §erro§ o valor passado a §next(err)§ ou §null§.', lang: 'javascript', starter: 'function executar(mws, req) {\n  // seu código aqui\n}\n', hints: ['Use uma função recursiva ou um índice.', 'Registre o índice antes de chamar o middleware.', 'next(err) com valor verdadeiro encerra a execução.'], tests: [{ name: 'cadeia completa', code: R`const mws = [(r, n) => { r.a = 1; n(); }, (r, n) => { r.b = 2; n(); }, (r, n) => n()];
const req = {};
const r = executar(mws, req);
assert.equal(JSON.stringify(r), '{"ordem":[0,1,2],"erro":null}');
assert.equal(req.a + req.b, 3);` }, { name: 'parada e erro', code: R`let r = executar([(q, n) => n(), (q, n) => {}, (q, n) => n()], {});
assert.equal(JSON.stringify(r), '{"ordem":[0,1],"erro":null}');
r = executar([(q, n) => n(), (q, n) => n(new Error('x')), (q, n) => n()], {});
assert.equal(JSON.stringify(r.ordem), '[0,1]');
assert.equal(r.erro.message, 'x');` }], solution: R`function executar(mws, req) {
  const ordem = []; let erro = null;
  const passo = (i) => {
    if (i >= mws.length) return;
    ordem.push(i);
    mws[i](req, (err) => { if (err) { erro = err; return; } passo(i + 1); });
  };
  passo(0);
  return { ordem, erro };
}`, explanation: 'É a essência do next(): cada middleware decide se a cadeia continua.' }
],
'nex-05': [
  { id: 'nex-05-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Como o Express identifica o middleware de tratamento de erros?', options: ['Pelo nome da função', 'Por ter quatro parâmetros (err, req, res, next)', 'Por estar no arquivo errors.js', 'Por usar app.error()'], answer: 1, explanation: 'A assinatura com quatro parâmetros o identifica.' },
  { id: 'nex-05-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'No Node 26.13.1, uma promise rejeitada sem tratamento encerra o processo com código 1, a menos que haja um ouvinte de unhandledRejection.', answer: true, explanation: 'Medido: sem ouvinte, código 1; com ouvinte, o processo continuou e terminou com código 0.' },
  { id: 'nex-05-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a situação ao status mais adequado.', pairs: [['Entrada inválida com campos incorretos', '422 (ou 400)'], ['Registro inexistente', '404'], ['Dependência indisponível', '503'], ['Bug inesperado', '500 com mensagem genérica']], explanation: 'Mapeamento usual de erros.' },
  { id: 'nex-05-e4', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que vaza informações internas para o cliente.', code: 'app.use((err, req, res, next) => {\n  console.error(err);\n  res.status(500).json({ erro: err.message, stack: err.stack });\n});', answer: 3, explanation: 'Mensagem e stack de um 500 vão só para o log; ao cliente, um erro genérico e o id da requisição.' },
  { id: 'nex-05-e5', type: 'open', difficulty: 3, points: 10, prompt: 'O que fazer ao detectar uma uncaughtException e por que não simplesmente continuar?', model: 'O estado do processo pode estar corrompido e não é confiável. A estratégia é registrar o erro com contexto, parar de aceitar novas requisições, deixar as em andamento terminarem (com um prazo máximo) e sair com código diferente de zero para que o supervisor (Docker, systemd, Kubernetes) reinicie um processo limpo. Engolir o erro pode causar comportamento imprevisível, vazamentos e dados inconsistentes.', rubric: ['Explica a falta de confiança no estado', 'Registrar o erro', 'Drenar as requisições com prazo', 'Sair e deixar o supervisor reiniciar'], explanation: 'Política recomendada na documentação do Node.' },
  { id: 'nex-05-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §mapearErro(err, producao)§, que devolve §{ status, corpo }§. O status é §err.status§ se existir e for 400–499 (respeitando o que o parser ou o domínio definiu); caso contrário, §500§. Para status 4xx, §corpo§ é §{ erro: err.message }§. Para 500: se §producao§ for verdadeiro, §{ erro: "erro interno" }§; senão §{ erro: "erro interno", detalhe: err.message }§.', lang: 'javascript', starter: 'function mapearErro(err, producao) {\n  // seu código aqui\n}\n', hints: ['Verifique se status é número entre 400 e 499.', 'Qualquer outro caso vira 500.'], tests: [{ name: '4xx', code: R`const e = Object.assign(new Error('pedido não encontrado'), { status: 404 });
assert.equal(JSON.stringify(mapearErro(e, true)), '{"status":404,"corpo":{"erro":"pedido não encontrado"}}');` }, { name: '500 em produção e desenvolvimento', code: R`const bug = new TypeError('x is undefined');
assert.equal(JSON.stringify(mapearErro(bug, true)), '{"status":500,"corpo":{"erro":"erro interno"}}');
assert.equal(JSON.stringify(mapearErro(bug, false)), '{"status":500,"corpo":{"erro":"erro interno","detalhe":"x is undefined"}}');
const e5 = Object.assign(new Error('banco'), { status: 503 });
assert.equal(mapearErro(e5, true).status, 500);` }], solution: R`function mapearErro(err, producao) {
  const s = err.status;
  if (Number.isInteger(s) && s >= 400 && s < 500) return { status: s, corpo: { erro: err.message } };
  const corpo = { erro: 'erro interno' };
  if (!producao) corpo.detalhe = err.message;
  return { status: 500, corpo };
}`, explanation: 'Um tratador central controla o que sai para o cliente.' }
],
'nex-06': [
  { id: 'nex-06-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual o pico de memória medido ao calcular o hash de um arquivo de 200 MiB com stream?', options: ['251 MiB', '84 MiB', '200 MiB', '10 MiB'], answer: 1, explanation: 'readFile chegou a 251 MiB; o stream, 84 MiB.' },
  { id: 'nex-06-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Worker threads são a melhor escolha para operações de E/S, como consultas ao banco.', answer: false, explanation: 'O loop já cuida da E/S sem bloqueio; workers servem para CPU.' },
  { id: 'nex-06-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o tipo de stream ao exemplo.', pairs: [['Readable', 'fs.createReadStream'], ['Writable', 'fs.createWriteStream'], ['Transform', 'zlib.createGzip()'], ['Duplex', 'Socket TCP']], explanation: 'Tipos básicos de stream.' },
  { id: 'nex-06-e4', type: 'trace', difficulty: 3, points: 10, prompt: 'Medições de 4 tarefas pesadas em 8 núcleos.', code: 'Sequencial: 18403 ms\n4 workers:   6341 ms', lang: 'text', steps: [{ q: 'Qual o ganho aproximado, arredondado para uma casa (use ponto)?', answers: ['2.9', '2,9', '2.9x', '2,9x'] }, { q: 'O ganho foi menor que 4x por custo de iniciar e contenção de recursos (sim ou não)?', answers: ['sim'] }], explanation: '18403 / 6341 ≈ 2,9.' },
  { id: 'nex-06-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Por que pipeline é preferível a pipe e o que é backpressure?', model: 'Backpressure é o mecanismo pelo qual o consumidor sinaliza ao produtor que o buffer está cheio (write devolve false e o produtor espera o evento drain), evitando acúmulo em memória. O pipeline aplica backpressure, propaga erros de qualquer stream e destrói todos os streams ao terminar ou falhar, evitando vazamento de descritores; o pipe não limpa os recursos em caso de erro.', rubric: ['Define backpressure', 'Cita write devolvendo false e drain', 'Explica a propagação de erros', 'Cita a destruição dos streams'], explanation: 'Boa prática da documentação do Node.' },
  { id: 'nex-06-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §pausas(tamanhos, hwm)§, que simula um Writable com §highWaterMark§ igual a §hwm§. Para cada chunk de §tamanhos§ (em ordem), some o tamanho ao buffer; se o buffer ficar maior ou igual a §hwm§, §write§ devolveria §false§: conte uma pausa e esvazie o buffer (o evento drain). Devolva o número de pausas.', lang: 'javascript', starter: 'function pausas(tamanhos, hwm) {\n  // seu código aqui\n}\n', hints: ['Mantenha uma variável com o buffer.', 'Depois de contar a pausa, zere o buffer.'], tests: [{ name: 'contagem', code: R`assert.equal(pausas([4, 4, 4, 4, 4, 4], 10), 2);
assert.equal(pausas([1, 1, 1], 10), 0);
assert.equal(pausas([10, 10], 10), 2);` }, { name: 'borda', code: R`assert.equal(pausas([], 5), 0);
assert.equal(pausas([5, 5, 5, 5], 5), 4);
assert.equal(pausas([3, 3, 3, 3], 6), 2);` }], solution: R`function pausas(tamanhos, hwm) {
  let buffer = 0, n = 0;
  for (const t of tamanhos) {
    buffer += t;
    if (buffer >= hwm) { n++; buffer = 0; }
  }
  return n;
}`, explanation: 'O produtor respeita a pausa e só retoma após o drain.' }
],
'nex-07': [
  { id: 'nex-07-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual verificação de saúde deve checar o banco de dados e devolver 503 durante o encerramento?', options: ['Liveness', 'Readiness', 'Nenhuma', 'Ambas, sempre'], answer: 1, explanation: 'A readiness diz se o serviço pode receber tráfego; a liveness só indica que o processo vive.' },
  { id: 'nex-07-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Sem tratar o SIGTERM, uma requisição em andamento é concluída normalmente antes de o processo sair.', answer: false, explanation: 'Medido: a requisição falhou (UND_ERR_SOCKET) e o processo saiu em ~0,4 s.' },
  { id: 'nex-07-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a medição ao resultado.', pairs: [['--cpu-prof', 'Arquivo .cpuprofile com amostras por função'], ['monitorEventLoopDelay', 'Histograma do atraso do event loop'], ['SIGTERM tratado e conexões ociosas fechadas', 'Encerramento de ~1,1 s com 200 OK'], ['Sem fechar conexões ociosas', 'Encerramento de ~4,1 s']], explanation: 'Resultados do laboratório.' },
  { id: 'nex-07-e4', type: 'trace', difficulty: 3, points: 10, prompt: 'Perfil de CPU medido.', code: 'lento 73,6% (2798 ms)\nordenaTudo 15,9% (605 ms)\n(anônima) 7,7%\nbarato: não apareceu entre as principais', lang: 'text', steps: [{ q: 'Qual função otimizar primeiro?', answers: ['lento'] }, { q: 'O tempo próprio exclui o tempo das funções chamadas (sim ou não)?', answers: ['sim'] }], explanation: 'Otimize o maior tempo próprio.' },
  { id: 'nex-07-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Descreva o desligamento ordenado de uma API Express ao receber SIGTERM, incluindo o prazo máximo e o cuidado com as conexões keep-alive.', model: 'Ao receber SIGTERM marca-se o estado de encerramento (a readiness passa a devolver 503), chama-se server.close para parar de aceitar conexões e esperar as ativas, fecha-se as conexões ociosas (closeIdleConnections, também depois de cada resposta durante o encerramento, pois o keep-alive as mantém abertas: medido ~4,1 s contra ~1,1 s), fecham-se os pools de banco e filas e sai-se com código 0. Define-se um prazo máximo menor que o do orquestrador, após o qual se sai com código 1.', rubric: ['Marca o encerramento e readiness 503', 'server.close', 'Fecha ociosas e cita keep-alive', 'Fecha recursos', 'Prazo máximo'], explanation: 'Receita da aula.' },
  { id: 'nex-07-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §proximoEstado(est, evento)§ para o ciclo de vida do servidor. §est§ é §{ estado, codigo }§ com estado §"rodando"§, §"encerrando"§ ou §"encerrado"§ (e §codigo§ §null§ enquanto não encerrado). Eventos: §"SIGTERM"§ (de rodando → encerrando), §"conexoes-zeradas"§ (de encerrando → encerrado com código 0) e §"prazo"§ (de encerrando → encerrado com código 1). Qualquer outro caso mantém o estado. Devolva um novo objeto.', lang: 'javascript', starter: 'function proximoEstado(est, evento) {\n  // seu código aqui\n}\n', hints: ['Trate cada par estado/evento.', 'Não altere o objeto recebido.'], tests: [{ name: 'fluxo normal', code: R`let e = { estado: 'rodando', codigo: null };
e = proximoEstado(e, 'SIGTERM');
assert.equal(JSON.stringify(e), '{"estado":"encerrando","codigo":null}');
e = proximoEstado(e, 'conexoes-zeradas');
assert.equal(JSON.stringify(e), '{"estado":"encerrado","codigo":0}');` }, { name: 'prazo e eventos ignorados', code: R`const a = { estado: 'encerrando', codigo: null };
assert.equal(JSON.stringify(proximoEstado(a, 'prazo')), '{"estado":"encerrado","codigo":1}');
const r = { estado: 'rodando', codigo: null };
assert.equal(JSON.stringify(proximoEstado(r, 'prazo')), '{"estado":"rodando","codigo":null}');
assert.equal(JSON.stringify(proximoEstado({ estado: 'encerrado', codigo: 0 }, 'SIGTERM')), '{"estado":"encerrado","codigo":0}');
assert.equal(r.estado, 'rodando');` }], solution: R`function proximoEstado(est, evento) {
  if (est.estado === 'rodando' && evento === 'SIGTERM') return { estado: 'encerrando', codigo: null };
  if (est.estado === 'encerrando' && evento === 'conexoes-zeradas') return { estado: 'encerrado', codigo: 0 };
  if (est.estado === 'encerrando' && evento === 'prazo') return { estado: 'encerrado', codigo: 1 };
  return { ...est };
}`, explanation: 'Modelar o ciclo de vida como máquina de estados facilita testes.' }
]
};

const P = 'node-express-p';
export const assessment = {
  id: 'node-express', title: 'Avaliação final — Node.js e Express', passPct: 70, minutes: 45,
  items: [
    { id: P + '1', type: 'mc', difficulty: 1, points: 10, prompt: 'Por que um laço síncrono de 600 ms em um handler prejudica outras requisições no Node?', options: ['O Node cria uma thread por requisição', 'O código de JavaScript roda em uma única thread e o laço a ocupa', 'O Express limita o número de requisições', 'O banco de dados trava'], answer: 1, explanation: 'Medido: a rota rápida levou 558 ms.' },
    { id: P + '2', type: 'tf', difficulty: 2, points: 10, prompt: 'No Express 5, "/arquivos/*" foi substituído por um curinga nomeado como "/arquivos/*caminho".', answer: true, explanation: 'Medido: o curinga sem nome foi recusado.' },
    { id: P + '3', type: 'trace', difficulty: 3, points: 10, prompt: 'Corpo de ~200 KB e JSON malformado enviados a uma rota com express.json() padrão.', code: 'POST corpo ~200 KB\nPOST {a:1', lang: 'text', steps: [{ q: 'Qual status do corpo grande?', answers: ['413'] }, { q: 'Qual status do JSON malformado?', answers: ['400'] }], explanation: 'O limite padrão é 100 KB; o JSON malformado dá 400.' },
    { id: P + '4', type: 'mc', difficulty: 3, points: 10, prompt: 'Qual configuração de CORS é mais segura para uma API usada por um único site?', options: ['origin: "*" com credentials: true', 'origin com a lista exata de origens permitidas', 'Sem CORS e confiar no navegador', 'Responder 403 no cliente'], answer: 1, explanation: 'Liste origens exatas; lembre que CORS não autentica.' },
    { id: P + '5', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que impede o tratamento de erros por rotas e middlewares anteriores.', code: 'app.use(express.json());\napp.use((err, req, res, next) => res.status(500).json({ erro: "erro interno" }));\napp.get("/x", () => { throw new Error("falha"); });', answer: 2, explanation: 'O tratador de erros deve ser registrado depois das rotas; antes delas, não recebe seus erros.' },
    { id: P + '6', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete a chamada que encadeia streams com backpressure e tratamento de erros.', code: "import { [[0]] } from 'node:stream/promises';\nawait [[1]](fs.createReadStream('a.log'), zlib.createGzip(), fs.createWriteStream('a.log.gz'));", answers: [['pipeline'], ['pipeline']], explanation: 'pipeline propaga erros e destrói os streams.' },
    { id: P + '7', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a medição ao resultado do curso.', pairs: [['readFile de 200 MiB', 'Pico de 251 MiB de RSS'], ['stream de 200 MiB', 'Pico de 84 MiB de RSS'], ['4 workers em 8 núcleos', 'Ganho de 2,9x'], ['Rejeição sem tratamento no Node 26.13.1', 'Processo encerra com código 1']], explanation: 'Fatos medidos nas aulas 5 e 6.' },
    { id: P + '8', type: 'mc', difficulty: 3, points: 10, prompt: 'Qual a ordem garantida entre os tipos de tarefa?', options: ['Timers, depois código síncrono', 'Código síncrono, depois microtarefas, depois macrotarefas', 'Promises, depois código síncrono', 'setImmediate antes de qualquer outra coisa'], answer: 1, explanation: 'Detalhes como timer 0 x immediate no módulo principal não são determinísticos.' },
    { id: P + '9', type: 'tf', difficulty: 3, points: 10, prompt: 'A liveness deve verificar a conexão com o banco, para reiniciar o processo quando o banco cair.', answer: false, explanation: 'A liveness só indica que o processo está vivo; checar dependências nela causa reinícios em cascata. Use a readiness.' },
    { id: P + '10', type: 'mc', difficulty: 3, points: 10, prompt: 'No experimento de desligamento, por que o encerramento ordenado simples levou ~4,1 s?', options: ['O servidor aguardava o banco', 'Conexões keep-alive ociosas ficaram abertas até o cliente fechá-las', 'O SIGTERM atrasou', 'O Express é lento ao encerrar'], answer: 1, explanation: 'Fechar as ociosas após cada resposta reduziu para ~1,1 s.' },
    { id: P + '11', type: 'open', difficulty: 3, points: 10, prompt: 'Liste cinco práticas para colocar uma API Express em produção com segurança e confiabilidade.', model: 'Helmet e remoção de x-powered-by; CORS com origens exatas e limites de corpo e de tempo; validação de entrada e tratador de erros central sem vazar detalhes; logs estruturados com id de requisição e redação de segredos; verificações de liveness e readiness; desligamento ordenado com prazo; configuração por variáveis de ambiente validadas na partida; processo não bloqueante (workers, filas) e dependências fixadas com lockfile.', rubric: ['Cinco práticas', 'Cita segurança de cabeçalhos ou CORS', 'Cita erros sem vazamento', 'Cita desligamento ordenado ou saúde', 'Cita configuração ou logs'], explanation: 'Resumo do projeto integrador.' },
    { id: P + '12', type: 'mc', difficulty: 3, points: 10, prompt: 'Qual a abordagem para servir um relatório CSV de milhões de linhas sem encher a memória?', options: ['Montar o CSV em uma string e enviá-lo com res.send', 'Gerar e enviar com stream e pipeline (de preferência comprimindo)', 'Usar readFileSync no handler', 'Aumentar a memória do servidor'], answer: 1, explanation: 'Streams mantêm a memória constante.' }
  ]
};

export const project = {
  id: 'api-express-producao', name: 'API Express pronta para produção: camadas, validação, erros, logs, saúde, shutdown e medições', lv: 'M', stack: 'Node.js 22+, Express 5, Zod, pino, helmet, cors, PostgreSQL (opcional)', ds: ['node'],
  desc: 'Construa uma **API de tarefas** com **Express 5** pronta para produção: camadas (rotas, serviços, repositórios), **validação** com Zod, **tratamento central de erros**, **logs estruturados** com id de requisição, **helmet, CORS e limites**, **/vivo e /pronto**, **desligamento ordenado**, **configuração validada por ambiente**, um relatório pesado servido por **stream** e um cálculo em **worker**. Meça o **perfil de CPU**, o **atraso do event loop** e a **memória**, corrija um gargalo e compare antes e depois.',
  rf: ['CRUD de tarefas em camadas, com Routers por recurso e handlers finos', 'Validação de params, query e body com Zod e respostas 422 por campo', 'Tratador central de erros com classes de domínio, formato padronizado e sem vazamento de detalhes', 'Logs com pino, id de requisição e redação de segredos', 'helmet, CORS com origens exatas e limites de corpo por rota (exceções registradas antes do parser global)', 'Rotas /vivo e /pronto e desligamento ordenado testado (requisição em andamento termina; código 0)', 'Configuração por variáveis de ambiente validada na partida', 'Um relatório grande servido com stream e pipeline e um cálculo pesado em worker (ou pool)'],
  rnf: ['Versões fixas e lockfile commitado; npm ci no CI', 'Nenhuma chamada síncrona de E/S no caminho das requisições', 'README com medições, comandos e limitações', 'Testes de integração dos caminhos de sucesso e de erro'],
  ac: ['Um teste prova que a resposta 500 não contém stack nem mensagem interna', 'Um teste prova o desligamento ordenado (200 na requisição em andamento e saída com código 0)', 'O relatório de 200 MiB (ou maior) é servido com pico de memória baixo e comparado ao readFile', 'O perfil de CPU antes e depois comprova a correção de um gargalo', 'O atraso do event loop é medido com e sem o cálculo no worker'],
  ch: ['Adicionar rate limiting e comparar o efeito', 'Usar um pool de workers e medir o ganho', 'Migrar um módulo para o NestJS e comparar', 'Empacotar em Docker (usuário não root, PID 1 correto) e testar o SIGTERM no contêiner', 'Gerar um flame graph e identificar o gargalo']
};
