// C5.2 — Design Patterns: exercícios, avaliação final e projeto.
// Medições reais do laboratório (Node 26.13.1); os desafios "code" são em JavaScript e modelam a lógica.
const R = String.raw;

export const exsets = {
'pat-01': [
  { id: 'pat-01-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Em Node.js, por que o Singleton clássico (construtor privado e getInstance) raramente é necessário?', options: ['Porque o Node não tem classes', 'Porque o cache de módulos já compartilha o objeto exportado por processo', 'Porque o Node é multithread', 'Porque o JavaScript proíbe variáveis globais'], answer: 1, explanation: 'O módulo é avaliado uma vez por processo; o risco real é o estado global mutável.' },
  { id: 'pat-01-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Medido: o segundo teste, independente, que usa o contador global do módulo recebeu 3 porque herdou o estado do primeiro.', answer: true, explanation: 'Estado global acopla os testes por ordem de execução (1 e 2 no primeiro; 3 no segundo).' },
  { id: 'pat-01-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a necessidade à primeira opção mais simples.', pairs: [['Escolher o tipo em tempo de execução', 'Tabela de construtores'], ['Muitos parâmetros opcionais sem etapas', 'Objeto de opções com padrões'], ['Instância única por processo', 'Módulo + injeção na raiz de composição'], ['Copiar um objeto', 'structuredClone ou spread']], explanation: 'Padrões entram quando reduzem a complexidade.' },
  { id: 'pat-01-e4', type: 'code', difficulty: 2, points: 25, prompt: 'Implemente §criarFabrica(tabela)§ (Factory por tabela): devolve uma função §criar(tipo, ...args)§ que chama §tabela[tipo](...args)§; se o tipo não existir, lança §Error("tipo desconhecido: " + tipo)§. A tabela é consultada em cada chamada (registros posteriores valem).', lang: 'javascript', starter: 'function criarFabrica(tabela) {\n  // seu código aqui\n}\n', hints: ['Use um objeto com funções construtoras.', 'Verifique typeof ... === "function".'], tests: [{ name: 'criação', code: R`const f = criarFabrica({ soma: (a, b) => a + b, dobro: (x) => x * 2 });
assert.equal(f('soma', 2, 3), 5);
assert.equal(f('dobro', 4), 8);` }, { name: 'erro e registro posterior', code: R`const t = {};
const f = criarFabrica(t);
assert.throws(() => f('x'), 'tipo desconhecido: x');
t.x = () => 'ok';
assert.equal(f('x'), 'ok');
assert.throws(() => f('toString2'), 'tipo desconhecido: toString2');` }], solution: R`function criarFabrica(tabela) {
  return function criar(tipo, ...args) {
    const fn = Object.hasOwn(tabela, tipo) ? tabela[tipo] : undefined;
    if (typeof fn !== 'function') throw new Error('tipo desconhecido: ' + tipo);
    return fn(...args);
  };
}`, explanation: 'Object.hasOwn evita resolver chaves herdadas como "toString" ou "constructor".' },
  { id: 'pat-01-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Por que o estado global do Singleton prejudica os testes e como evitá-lo mantendo uma única instância no programa?', model: 'O estado compartilhado faz o resultado de um teste depender dos anteriores (medido: o contador deu 1 e 2 e depois 3 em um teste independente), o que causa falhas intermitentes em ordem aleatória ou execução paralela, e a dependência fica escondida. Para manter uma única instância, cria-se o objeto uma vez na raiz de composição e injeta-se nos consumidores (ou usa-se o ciclo de vida singleton do contêiner), usando instâncias novas por teste. Lembre que o singleton vale por processo; workers e vários processos têm instâncias separadas.', rubric: ['Dependência da ordem dos testes', 'Dependência escondida', 'Injeção a partir da raiz de composição', 'Singleton vale por processo'], explanation: 'Resumo da aula.' },
  { id: 'pat-01-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §criarConsulta(tabela)§ (Builder fluente) devolvendo um objeto com §onde(campo, valor)§, §ordenarPor(campo)§, §limitar(n)§ (todos devolvem o próprio builder) e §construir()§ → §{ sql, params }§. SQL: §SELECT * FROM <tabela>§ + §" WHERE c1 = ? AND c2 = ?"§ (se houver filtros) + §" ORDER BY <campo>"§ + §" LIMIT <n>"§. Sem tabela, §construir()§ lança §Error("tabela obrigatória")§.', lang: 'javascript', starter: 'function criarConsulta(tabela) {\n  // seu código aqui\n}\n', hints: ['Guarde filtros, ordem e limite em variáveis da closure.', 'O limite pode ser 0: compare com null.'], tests: [{ name: 'consulta completa', code: R`const q = criarConsulta('pedidos').onde('status', 'pago').onde('uf', 'SP').ordenarPor('criado').limitar(10).construir();
assert.equal(q.sql, 'SELECT * FROM pedidos WHERE status = ? AND uf = ? ORDER BY criado LIMIT 10');
assert.equal(JSON.stringify(q.params), '["pago","SP"]');` }, { name: 'mínimo e erro', code: R`assert.equal(criarConsulta('t').construir().sql, 'SELECT * FROM t');
assert.equal(criarConsulta('t').limitar(0).construir().sql, 'SELECT * FROM t LIMIT 0');
assert.throws(() => criarConsulta().construir(), 'tabela obrigatória');
assert.throws(() => criarConsulta('').construir(), 'tabela obrigatória');` }], solution: R`function criarConsulta(tabela) {
  const filtros = []; let ordem = null; let limite = null;
  const b = {
    onde(campo, valor) { filtros.push([campo, valor]); return b; },
    ordenarPor(campo) { ordem = campo; return b; },
    limitar(n) { limite = n; return b; },
    construir() {
      if (!tabela) throw new Error('tabela obrigatória');
      const w = filtros.length ? ' WHERE ' + filtros.map(([c]) => c + ' = ?').join(' AND ') : '';
      return { sql: 'SELECT * FROM ' + tabela + w + (ordem ? ' ORDER BY ' + ordem : '') + (limite !== null ? ' LIMIT ' + limite : ''), params: filtros.map(([, v]) => v) };
    }
  };
  return b;
}`, explanation: 'Valores vão em params (parametrizados); nomes de colunas vêm do código, nunca da entrada do usuário.' }
],
'pat-02': [
  { id: 'pat-02-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual padrão converte a interface de um componente na interface esperada pelo cliente (por exemplo, reais em centavos)?', options: ['Decorator', 'Adapter', 'Facade', 'Composite'], answer: 1, explanation: 'O Adapter traduz interfaces incompatíveis, isolando o legado.' },
  { id: 'pat-02-e2', type: 'tf', difficulty: 3, points: 10, prompt: 'Medido: o decorator de cache reduziu 100 leituras de 10 chaves, com 5 ms de latência simulada, de 524 ms para 52 ms.', answer: true, explanation: 'Foram 10 chamadas ao backend em vez de 100.' },
  { id: 'pat-02-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o padrão à intenção.', pairs: [['Adapter', 'Mudar a interface'], ['Decorator', 'Acrescentar comportamento com a mesma interface'], ['Facade', 'Simplificar vários subsistemas'], ['Proxy', 'Controlar o acesso a um objeto']], explanation: 'Escolha pela intenção.' },
  { id: 'pat-02-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §comRetry(fn, tentativas)§: devolve uma função assíncrona que chama §fn(...args)§ e devolve o resultado do primeiro sucesso; se todas as §tentativas§ falharem, relança o último erro. Chame §fn§ no máximo §tentativas§ vezes.', lang: 'javascript', starter: 'function comRetry(fn, tentativas) {\n  // seu código aqui\n}\n', hints: ['Use um laço com try/catch e await.', 'Guarde o último erro.'], tests: [{ name: 'sucesso na terceira', code: R`let n = 0;
const f = comRetry(async (x) => { n++; if (n < 3) throw new Error('falha ' + n); return x * 2; }, 5);
assert.equal(await f(21), 42);
assert.equal(n, 3);` }, { name: 'esgota as tentativas', code: R`let n = 0;
const f = comRetry(async () => { n++; throw new Error('erro ' + n); }, 3);
let msg = '';
try { await f(); } catch (e) { msg = e.message; }
assert.equal(msg, 'erro 3');
assert.equal(n, 3);` }], solution: R`function comRetry(fn, tentativas) {
  return async function (...args) {
    let ultimo;
    for (let i = 1; i <= tentativas; i++) {
      try { return await fn(...args); } catch (e) { ultimo = e; }
    }
    throw ultimo;
  };
}`, explanation: 'Só repita operações idempotentes; em produção acrescente espera crescente entre tentativas (backoff).' },
  { id: 'pat-02-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Explique a diferença entre Decorator, Proxy e Adapter e por que a ordem entre cache e retry importa.', model: 'O Adapter muda a interface para torná-la compatível com a esperada pelo cliente; o Decorator mantém a mesma interface e acrescenta responsabilidades (retry, cache, log); o Proxy também mantém a interface, mas controla o acesso (validação, carregamento preguiçoso, permissões). Com o cache por fora do retry, uma resposta já armazenada não dispara chamadas nem tentativas (medido: 3 chamadas na primeira leitura e continua 3 na segunda); com o retry por fora, até leituras em cache seriam repetidas em falha. Erros não devem ser cacheados e o retry só serve para operações idempotentes.', rubric: ['Adapter muda a interface', 'Decorator acrescenta comportamento', 'Proxy controla o acesso', 'Ordem cache/retry e idempotência'], explanation: 'Resumo da aula.' },
  { id: 'pat-02-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §comCache(fn)§ para funções assíncronas de um argumento: devolve §f(chave)§ que guarda no cache o resultado de §fn(chave)§ (chamando §fn§ só se não houver valor) e o método §f.tamanho()§. Se §fn§ lançar erro, o erro propaga e NADA é guardado (uma nova chamada executa §fn§ de novo).', lang: 'javascript', starter: 'function comCache(fn) {\n  // seu código aqui\n}\n', hints: ['Use um Map.', 'Só faça set depois do await bem-sucedido.'], tests: [{ name: 'cache', code: R`let chamadas = 0;
const f = comCache(async (k) => { chamadas++; return k + 1; });
assert.equal(await f(1), 2); assert.equal(await f(1), 2); assert.equal(await f(5), 6);
assert.equal(chamadas, 2); assert.equal(f.tamanho(), 2);
for (let i = 0; i < 100; i++) await f(i % 10);
assert.equal(f.tamanho(), 10);` }, { name: 'erros não são guardados', code: R`let n = 0;
const f = comCache(async (k) => { n++; if (n === 1) throw new Error('boom'); return k; });
let msg = ''; try { await f('a'); } catch (e) { msg = e.message; }
assert.equal(msg, 'boom'); assert.equal(f.tamanho(), 0);
assert.equal(await f('a'), 'a'); assert.equal(n, 2); assert.equal(f.tamanho(), 1);` }], solution: R`function comCache(fn) {
  const m = new Map();
  const f = async (k) => {
    if (m.has(k)) return m.get(k);
    const r = await fn(k);
    m.set(k, r);
    return r;
  };
  f.tamanho = () => m.size;
  return f;
}`, explanation: 'Evita cachear erros; em produção acrescente TTL e limite de tamanho (e trate chamadas simultâneas à mesma chave).' }
],
'pat-03': [
  { id: 'pat-03-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual padrão descreve melhor os middlewares do Express?', options: ['Singleton', 'Chain of Responsibility', 'Builder', 'Flyweight'], answer: 1, explanation: 'Cada elo pode tratar, repassar com next() ou interromper.' },
  { id: 'pat-03-e2', type: 'tf', difficulty: 3, points: 10, prompt: 'Medido: o 11º ouvinte do mesmo evento de um EventEmitter dispara o aviso MaxListenersExceededWarning (limite padrão 10).', answer: true, explanation: 'O aviso sugere possível vazamento de ouvintes.' },
  { id: 'pat-03-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o padrão ao exemplo do laboratório.', pairs: [['Strategy', 'Frete normal, expresso e drone'], ['State', 'Transições do pedido (novo → pago → enviado)'], ['Command', 'Inserir texto com desfazer'], ['Iterator/gerador', 'Números naturais consumidos de 5 em 5']], explanation: 'Casos testados.' },
  { id: 'pat-03-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §criarMaquina(transicoes, inicial)§: devolve §{ estado(), ir(para) }§. §ir§ valida na tabela §transicoes[estadoAtual]§ (lista de destinos); se inválida, lança §Error("transição inválida: " + atual + " → " + para)§; se válida, muda o estado e devolve o próprio objeto (encadeável).', lang: 'javascript', starter: 'function criarMaquina(transicoes, inicial) {\n  // seu código aqui\n}\n', hints: ['Guarde o estado atual em uma variável da closure.', 'Use includes na lista de destinos.'], tests: [{ name: 'fluxo válido', code: R`const t = { novo: ['pago', 'cancelado'], pago: ['enviado'], enviado: [], cancelado: [] };
const m = criarMaquina(t, 'novo');
assert.equal(m.estado(), 'novo');
assert.equal(m.ir('pago').ir('enviado').estado(), 'enviado');` }, { name: 'transições inválidas', code: R`const t = { novo: ['pago'], pago: [] };
const m = criarMaquina(t, 'novo');
assert.throws(() => m.ir('enviado'), 'transição inválida: novo → enviado');
assert.equal(m.estado(), 'novo');
m.ir('pago');
assert.throws(() => m.ir('novo'), 'transição inválida: pago → novo');` }], solution: R`function criarMaquina(transicoes, inicial) {
  let atual = inicial;
  const m = {
    estado: () => atual,
    ir(para) {
      if (!(transicoes[atual] || []).includes(para)) throw new Error('transição inválida: ' + atual + ' → ' + para);
      atual = para; return m;
    }
  };
  return m;
}`, explanation: 'A tabela de transições é a fonte única das regras do ciclo de vida.' },
  { id: 'pat-03-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Compare Strategy e State e explique dois riscos de usar EventEmitter (Observer) em produção.', model: 'No Strategy o cliente escolhe o algoritmo (frete normal ou expresso) e ele não muda sozinho; no State o próprio objeto muda de estado conforme eventos e valida as transições (novo → pago → enviado). Riscos do EventEmitter: vazamento de ouvintes registrados sem remoção (medido: 100.000 ouvintes elevaram o heap de 4,0 MB para 117,2 MB, que voltou a 4,1 MB após off e GC) e exceções ou ouvintes assíncronos sem tratamento (um erro síncrono interrompe os demais; o evento error sem ouvinte derruba o processo); além disso, é síncrono e em memória, não uma fila confiável.', rubric: ['Strategy: cliente escolhe', 'State: objeto muda e valida transições', 'Vazamento de ouvintes', 'Exceções, evento error ou falta de confiabilidade'], explanation: 'Resumo da aula.' },
  { id: 'pat-03-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §cadeia(...elos)§: devolve §executar(ctx)§. Cada elo é §(ctx, proximo) => ...§; chamar §proximo()§ executa o elo seguinte e devolve seu resultado; se o último elo chamar §proximo()§, devolve-se §ctx§. §executar§ devolve o que o primeiro elo devolver. Um elo que não chama §proximo§ interrompe a cadeia.', lang: 'javascript', starter: 'function cadeia(...elos) {\n  // seu código aqui\n}\n', hints: ['Use um índice compartilhado e uma função proximo.', 'Cada chamada executa novos elos a partir do índice atual.'], tests: [{ name: 'ordem e resultado', code: R`const ordem = [];
const exec = cadeia((c, n) => { ordem.push('a'); return n(); }, (c, n) => { ordem.push('b'); c.ok = true; return n(); });
const r = exec({});
assert.equal(JSON.stringify(ordem), '["a","b"]');
assert.equal(r.ok, true);` }, { name: 'curto-circuito', code: R`const ordem = [];
const exec = cadeia((c, n) => { ordem.push('auth'); if (!c.user) { c.status = 401; return c; } return n(); }, (c, n) => { ordem.push('log'); return n(); }, (c) => { c.status = 200; return c; });
assert.equal(exec({ user: 'a' }).status, 200);
ordem.length = 0;
assert.equal(exec({}).status, 401);
assert.equal(JSON.stringify(ordem), '["auth"]');` }], solution: R`function cadeia(...elos) {
  return function executar(ctx) {
    let i = -1;
    const proximo = () => { i++; return elos[i] ? elos[i](ctx, proximo) : ctx; };
    return proximo();
  };
}`, explanation: 'É o mecanismo dos middlewares do Express e do Koa.' }
],
'pat-04': [
  { id: 'pat-04-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual a relação entre DIP e DI?', options: ['São a mesma coisa', 'DIP é o princípio e DI é a técnica de receber dependências de fora', 'DI é um princípio e DIP é uma ferramenta', 'DIP só existe em Java'], answer: 1, explanation: 'O contêiner é só uma ferramenta opcional para a DI.' },
  { id: 'pat-04-e2', type: 'tf', difficulty: 3, points: 10, prompt: 'Medido: com o Service Locator vazio, cadastrar() lançou TypeError somente ao executar, mostrando que a dependência estava escondida da assinatura.', answer: true, explanation: 'O construtor não declarava que precisava do repositório.' },
  { id: 'pat-04-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o ciclo de vida ao comportamento do contêiner.', pairs: [['Singleton', 'Uma instância por contêiner'], ['Transiente', 'Nova instância a cada resolução'], ['Por requisição', 'Uma instância por requisição HTTP'], ['Captive dependency', 'Singleton que retém algo de escopo menor']], explanation: 'Ciclos de vida em contêineres (como o do NestJS).' },
  { id: 'pat-04-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §criarContainer()§ com §registrar(nome, fabrica, ciclo)§ (ciclo §"singleton"§ padrão ou §"transiente"§; devolve o próprio contêiner) e §resolver(nome)§. A fábrica recebe uma função §resolver§ para pedir suas dependências. Erros: §Error("não registrado: " + nome)§ e §Error("dependência circular: a → b → a")§ (nomes da pilha unidos por §" → "§, terminando no nome repetido). Singleton cria uma única vez por contêiner.', lang: 'javascript', starter: 'function criarContainer() {\n  // seu código aqui\n}\n', hints: ['Mantenha uma pilha de nomes em resolução.', 'Guarde singletons em um Map.'], tests: [{ name: 'ciclos de vida', code: R`let criados = 0;
const c = criarContainer().registrar('repo', () => ({ id: ++criados })).registrar('log', () => ({}), 'transiente').registrar('servico', (r) => ({ repo: r('repo'), log: r('log') }), 'transiente');
const a = c.resolver('servico'); const b = c.resolver('servico');
assert.equal(a.repo, b.repo);
assert.equal(a.log !== b.log, true);
assert.equal(a !== b, true);
assert.equal(criados, 1);` }, { name: 'erros', code: R`const c = criarContainer().registrar('a', (r) => r('b')).registrar('b', (r) => r('c')).registrar('c', (r) => r('a'));
assert.throws(() => c.resolver('a'), 'dependência circular: a → b → c → a');
assert.throws(() => c.resolver('zzz'), 'não registrado: zzz');` }], solution: R`function criarContainer() {
  const regs = new Map(); const unicos = new Map();
  const resolver = (nome, pilha = []) => {
    if (pilha.includes(nome)) throw new Error('dependência circular: ' + [...pilha, nome].join(' → '));
    const r = regs.get(nome); if (!r) throw new Error('não registrado: ' + nome);
    if (r.ciclo === 'singleton' && unicos.has(nome)) return unicos.get(nome);
    const obj = r.fabrica((n) => resolver(n, [...pilha, nome]));
    if (r.ciclo === 'singleton') unicos.set(nome, obj);
    return obj;
  };
  const c = { registrar(nome, fabrica, ciclo = 'singleton') { regs.set(nome, { fabrica, ciclo }); return c; }, resolver: (n) => resolver(n) };
  return c;
}`, explanation: 'Versão reduzida do contêiner do laboratório.' },
  { id: 'pat-04-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Como a injeção manual com raiz de composição deixa o teste de um serviço que usa data e identificador determinístico? Quando adotar um contêiner?', model: 'O serviço recebe relógio, gerador de identificador e repositório pelo construtor; a raiz de composição liga as implementações reais e o teste passa fakes (um relógio fixo e um id constante), obtendo exatamente a saída esperada (id "X" e a data fixa), sem depender do relógio do sistema. Um contêiner vale a pena quando o grafo é grande e há ciclos de vida (singleton, por requisição), módulos e decorators, como no NestJS; para aplicações pequenas a injeção manual é mais simples de ler e depurar. Evite o Service Locator e ciclos de dependência.', rubric: ['Dependências pelo construtor', 'Raiz de composição', 'Dublês no teste', 'Quando usar contêiner'], explanation: 'Resumo da aula.' },
  { id: 'pat-04-e6', type: 'code', difficulty: 2, points: 25, prompt: 'Implemente §comPadroes(fabrica, padroes)§: devolve uma função §(deps)§ que chama §fabrica§ com um objeto que junta §padroes§ e §deps§ (os valores de §deps§ prevalecem; §deps§ pode ser omitido) e devolve o resultado. Nenhum dos objetos recebidos deve ser alterado.', lang: 'javascript', starter: 'function comPadroes(fabrica, padroes) {\n  // seu código aqui\n}\n', hints: ['Use spread: { ...padroes, ...deps }.', 'Valor padrão {} para deps.'], tests: [{ name: 'padrões e sobrescrita', code: R`const criar = comPadroes((d) => d.relogio() + ':' + d.id(), { relogio: () => 'agora', id: () => 7 });
assert.equal(criar(), 'agora:7');
assert.equal(criar({ relogio: () => 'fixo' }), 'fixo:7');
assert.equal(criar({ id: () => 'X', relogio: () => 'R' }), 'R:X');` }, { name: 'sem mutação', code: R`const padroes = { a: 1 }; const deps = { b: 2 };
const criar = comPadroes((d) => d, padroes);
const r = criar(deps);
assert.equal(JSON.stringify(r), '{"a":1,"b":2}');
assert.equal(JSON.stringify(padroes), '{"a":1}');
assert.equal(JSON.stringify(deps), '{"b":2}');
assert.equal(r !== padroes, true);` }], solution: R`function comPadroes(fabrica, padroes) {
  return (deps = {}) => fabrica({ ...padroes, ...deps });
}`, explanation: 'Padrões na produção, dublês nos testes: injeção sem contêiner.' }
],
'pat-05': [
  { id: 'pat-05-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual destes é o melhor retrato de um God Object?', options: ['Uma função pura de 5 linhas', 'Uma classe que valida, calcula, grava, notifica e depende de dezenas de coisas', 'Um módulo de constantes', 'Um teste de integração'], answer: 1, explanation: 'Concentra responsabilidades e dificulta testes e mudanças.' },
  { id: 'pat-05-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Usar "isso é um anti-pattern" como argumento de autoridade em uma revisão é mais eficaz do que descrever o custo concreto e a alternativa.', answer: false, explanation: 'Descreva o custo (por exemplo, 6 dependências falsas por teste) e a alternativa.' },
  { id: 'pat-05-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o anti-pattern à saída.', pairs: [['God Object', 'Separar por responsabilidade'], ['Service Locator', 'Injeção por construtor'], ['Otimização prematura', 'Medir e perfilar antes'], ['Golden Hammer', 'ADR com alternativas']], explanation: 'Saídas discutidas na aula.' },
  { id: 'pat-05-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §criarEmissor(limite, aviso)§ (Observer com proteção): devolve §{ on(evento, fn), off(evento, fn), emit(evento, ...args), contar(evento) }§. Ao adicionar um ouvinte que faça a contagem do evento ultrapassar §limite§, chama §aviso(evento, contagem)§ UMA vez por evento (na primeira ultrapassagem). §emit§ chama os ouvintes na ordem de registro; §off§ remove o primeiro ouvinte igual; §contar§ devolve a quantidade (0 se não houver).', lang: 'javascript', starter: 'function criarEmissor(limite, aviso) {\n  // seu código aqui\n}\n', hints: ['Use um Map evento → lista.', 'Controle os eventos já avisados com um Set.'], tests: [{ name: 'emit e off', code: R`const e = criarEmissor(10, () => {});
const a = []; const f = (x) => a.push('f' + x); const g = (x) => a.push('g' + x);
e.on('v', f); e.on('v', g); e.emit('v', 1);
e.off('v', f); e.emit('v', 2);
assert.equal(JSON.stringify(a), '["f1","g1","g2"]');
assert.equal(e.contar('v'), 1); assert.equal(e.contar('nada'), 0);` }, { name: 'aviso de limite', code: R`const avisos = [];
const e = criarEmissor(3, (ev, n) => avisos.push(ev + ':' + n));
for (let i = 0; i < 6; i++) e.on('x', () => {});
assert.equal(JSON.stringify(avisos), '["x:4"]');
e.on('y', () => {});
assert.equal(avisos.length, 1);
for (let i = 0; i < 3; i++) e.on('y', () => {});
assert.equal(JSON.stringify(avisos), '["x:4","y:4"]');` }], solution: R`function criarEmissor(limite, aviso) {
  const ouvintes = new Map(); const avisados = new Set();
  return {
    on(ev, fn) {
      const l = ouvintes.get(ev) || []; l.push(fn); ouvintes.set(ev, l);
      if (l.length > limite && !avisados.has(ev)) { avisados.add(ev); aviso(ev, l.length); }
    },
    off(ev, fn) { const l = ouvintes.get(ev) || []; const i = l.indexOf(fn); if (i >= 0) l.splice(i, 1); },
    emit(ev, ...args) { for (const fn of [...(ouvintes.get(ev) || [])]) fn(...args); },
    contar(ev) { return (ouvintes.get(ev) || []).length; }
  };
}`, explanation: 'Modelo do aviso MaxListenersExceededWarning do Node (limite padrão 10).' },
  { id: 'pat-05-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Você encontrou um God Object em um projeto legado. Descreva um plano seguro de saída e como justificaria o esforço.', model: 'Escrevo testes de caracterização do comportamento atual, identifico os motivos para mudar (cálculo, validação, persistência, notificação) e extraio uma responsabilidade por vez, começando pelas regras puras (funções testáveis com uma linha) e injetando dependências, mantendo um adaptador na interface antiga; para partes grandes uso o Strangler. Justifico o esforço com dados: dependências falsas exigidas por teste (por exemplo, 6 contra 1), tempo de mudança, conflitos de merge e defeitos, estimando juros e payback e registrando a dívida restante no backlog com tíquete.', rubric: ['Testes de caracterização', 'Extração por responsabilidade e injeção', 'Strangler ou adaptador', 'Justificativa com dados (juros e payback)'], explanation: 'Resumo da aula.' },
  { id: 'pat-05-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §modulosDeus(grafo, limite)§: §grafo§ mapeia cada módulo à lista dos módulos de que depende. Devolva os nomes dos módulos cuja quantidade de dependências DISTINTAS (fan-out) seja §>= limite§, em ordem decrescente de fan-out (empate: ordem alfabética).', lang: 'javascript', starter: 'function modulosDeus(grafo, limite) {\n  // seu código aqui\n}\n', hints: ['Use new Set(deps).size.', 'Ordene por fan-out e depois por nome.'], tests: [{ name: 'fan-out', code: R`const g = { pedidos: ['repo', 'estoque', 'pagamento', 'email', 'relogio', 'logger'], util: ['log'], cobranca: ['repo', 'pagamento', 'email', 'repo'], x: [] };
assert.equal(JSON.stringify(modulosDeus(g, 3)), '["pedidos","cobranca"]');
assert.equal(JSON.stringify(modulosDeus(g, 6)), '["pedidos"]');` }, { name: 'empate e vazio', code: R`const g = { b: ['1', '2'], a: ['3', '4'], c: ['5'] };
assert.equal(JSON.stringify(modulosDeus(g, 2)), '["a","b"]');
assert.equal(JSON.stringify(modulosDeus({}, 1)), '[]');
assert.equal(JSON.stringify(modulosDeus(g, 9)), '[]');` }], solution: R`function modulosDeus(grafo, limite) {
  return Object.entries(grafo)
    .map(([nome, deps]) => ({ nome, n: new Set(deps).size }))
    .filter((m) => m.n >= limite)
    .sort((a, b) => b.n - a.n || (a.nome < b.nome ? -1 : a.nome > b.nome ? 1 : 0))
    .map((m) => m.nome);
}`, explanation: 'Fan-out alto é um sinal (não prova) de módulo com responsabilidades demais.' }
]
};

const P = 'design-patterns-p';
export const assessment = {
  id: 'design-patterns', title: 'Avaliação final — Design Patterns', passPct: 70, minutes: 45,
  items: [
    { id: P + '1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual padrão encapsula algoritmos intercambiáveis escolhidos em tempo de execução (frete normal, expresso, drone)?', options: ['State', 'Strategy', 'Adapter', 'Facade'], answer: 1, explanation: 'No Strategy o cliente escolhe a variante; ela entra como parâmetro.' },
    { id: P + '2', type: 'tf', difficulty: 2, points: 10, prompt: 'Em Node.js, um módulo exportando um objeto já funciona como um singleton por processo.', answer: true, explanation: 'O cache de módulos avalia o módulo uma vez; workers e outros processos têm instâncias próprias.' },
    { id: P + '3', type: 'trace', difficulty: 3, points: 10, prompt: 'Cadeia de middlewares: auth, log, tratador. Chamada com ctx = {} (sem usuário).', code: 'auth: if (!c.user) { c.status = 401; return c; } return n()\nlog:  registra e chama n()\ntratador: c.status = 200', lang: 'text', steps: [{ q: 'Qual status final (use um número)?', answers: ['401'] }, { q: 'Quantos elos executam (use um número)?', answers: ['1'] }], explanation: 'O primeiro elo interrompe a cadeia: o log não roda.' },
    { id: P + '4', type: 'mc', difficulty: 3, points: 10, prompt: 'Por que o cache por fora do retry é preferível a retry por fora do cache?', options: ['É mais bonito', 'Evita repetir (e reexecutar) chamadas cujo resultado já está armazenado', 'O retry não funciona com cache', 'Porque reduz o número de classes'], answer: 1, explanation: 'Medido: 3 chamadas na primeira leitura e continua 3 na segunda.' },
    { id: P + '5', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que provoca vazamento de ouvintes a cada requisição.', code: "app.get('/status', (req, res) => {\n  barramento.on('mudanca', (m) => res.write(m));\n  res.write('ok');\n});", answer: 2, explanation: 'O ouvinte nunca é removido (off); o emissor mantém a closure e o res.' },
    { id: P + '6', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete o conceito.', code: 'O ponto único onde os objetos concretos são criados e ligados chama-se raiz de [[0]].\nBuscar dependências em um registro global chama-se Service [[1]].', answers: [['composição', 'composicao'], ['Locator', 'locator']], explanation: 'A raiz de composição substitui o Service Locator.' },
    { id: P + '7', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o padrão à família do GoF.', pairs: [['Factory', 'Criacional'], ['Decorator', 'Estrutural'], ['Observer', 'Comportamental'], ['Dependency Injection', 'Não é do GoF (técnica de composição)']], explanation: 'Famílias do catálogo.' },
    { id: P + '8', type: 'mc', difficulty: 3, points: 10, prompt: 'Medido: 100.000 ouvintes de ~1 KB elevaram o heap de ~4 MB para ~117 MB. O que devolveu a memória?', options: ['Aumentar setMaxListeners', 'Remover os ouvintes com off e coletar', 'Reiniciar o navegador', 'Nada'], answer: 1, explanation: 'O emissor mantém referências; off e GC devolveram o heap a ~4 MB.' },
    { id: P + '9', type: 'tf', difficulty: 3, points: 10, prompt: 'Aplicar um padrão por reflexo, mesmo sem variação real, é uma boa prática de design.', answer: false, explanation: 'É pattern-itis: indireção sem benefício (Yagni, regra dos três).' },
    { id: P + '10', type: 'mc', difficulty: 3, points: 10, prompt: 'Qual padrão você usaria para permitir desfazer operações em um editor?', options: ['Command', 'Singleton', 'Proxy', 'Adapter'], answer: 0, explanation: 'Cada ação é um objeto com fazer e desfazer.' },
    { id: P + '11', type: 'open', difficulty: 3, points: 10, prompt: 'Projete um módulo de cálculo de preço com descontos por cliente, frete por região e integração com um gateway legado, indicando padrões, injeção de dependências e testes.', model: 'Strategy (ou tabela de funções) para descontos e frete, permitindo novas regras sem alterar o cálculo; Adapter para o gateway legado (reais para centavos, erros do fornecedor convertidos para erros do domínio); Decorators de retry (só em operações idempotentes), cache e log, com o cache por fora do retry; Facade fina para a operação de compra, com compensação do estoque ao recusar o pagamento; State para o ciclo de vida do pedido com tabela de transições. Dependências (relógio, repositório, gateway, gerador de id) injetadas por construtor e montadas em uma raiz de composição, o que permite fakes e testes determinísticos (incluindo transições inválidas e erros), sem Service Locator nem estado global.', rubric: ['Strategy ou tabela para regras', 'Adapter para o legado', 'Decorators e ordem', 'State ou Facade', 'DI e raiz de composição com testes determinísticos'], explanation: 'Resumo do projeto integrador.' },
    { id: P + '12', type: 'mc', difficulty: 3, points: 10, prompt: 'No laboratório, testar uma regra de desconto no God Object exigiu quantas dependências falsas, contra quantas na função pura?', options: ['1 e 6', '6 e 0', '6 e 6', '0 e 0'], answer: 1, explanation: 'A função pura se testa sem dependências.' }
  ]
};

export const project = {
  id: 'motor-de-regras-patterns', name: 'Motor de regras de pedido com padrões: Strategy, State, Decorators, Adapter e DI com testes', lv: 'M', stack: 'JavaScript, Node.js test runner', ds: ['patterns'],
  desc: 'Construa um **motor de regras de pedido** em Node.js puro: **Strategy** para descontos e frete, **State** para o ciclo de vida, **Adapter** para um gateway de pagamento legado, **Decorators** (retry, cache, log), **Facade** para a compra com compensação, **injeção de dependência** com raiz de composição e **testes determinísticos**, **medindo** o custo dos padrões e **documentando** o que **não** foi abstraído.',
  rf: ['Tabela de estratégias de desconto e de frete extensível sem alterar o cálculo e com erro explícito para tipo desconhecido', 'Máquina de estados do pedido com tabela de transições e testes das transições válidas e inválidas', 'Adapter que converte reais para centavos e erros do legado para erros do domínio', 'Decorators de retry (apenas idempotentes), cache (sem cachear erros) e log, compostos na ordem correta', 'Facade de compra que libera o estoque quando o pagamento é recusado', 'Raiz de composição única, dependências injetadas (relógio, id, repositório, gateway) e nenhum Service Locator', 'Pelo menos 20 testes determinísticos, incluindo fakes e relógio fixo', 'Medição do efeito do cache e de um ponto de custo (por exemplo, Proxy ou decorators) e registro dos números'],
  rnf: ['Sem estado global mutável e sem new de infraestrutura na regra de negócio', 'Cada padrão justificado em um ADR curto, com a alternativa mais simples considerada', 'README com comandos, medições e limitações', 'Nenhuma abstração sem variação real ou teste que a justifique'],
  ac: ['Adicionar uma nova estratégia de frete exige apenas registrá-la e vir com testes', 'O pagamento recusado devolve a reserva de estoque', 'Os testes passam em qualquer ordem de execução', 'O cache não armazena erros e reduz as chamadas medidas', 'O ADR explica o que foi deliberadamente deixado sem padrão'],
  ch: ['Trocar a raiz de composição por um contêiner mínimo com ciclos de vida', 'Portar o módulo para NestJS com providers e testing module', 'Adicionar um Proxy de validação e medir o custo', 'Adicionar eventos de domínio com EventEmitter sem vazar ouvintes']
};
