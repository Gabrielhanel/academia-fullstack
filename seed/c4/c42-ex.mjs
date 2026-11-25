// C4.2 — NestJS: exercícios, avaliação final e projeto.
// Medições reais em NestJS 12.6.1, TypeScript 7.0.2, Node.js 26.13.1, BullMQ 6.7.10 e Redis 8 (laboratório); os desafios "code" (JavaScript) modelam a lógica.
const R = String.raw;

export const exsets = {
'nst-01': [
  { id: 'nst-01-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'O que acontece quando um controller injeta um serviço de um módulo importado que não o exporta?', options: ['Funciona normalmente', 'O Nest não consegue resolver a dependência e a aplicação falha ao subir', 'O serviço é criado duas vezes', 'A rota devolve 404'], answer: 1, explanation: 'Medido: "Nest can\'t resolve dependencies of the XCtrl (?)...". Com exports, a rota devolveu 200.' },
  { id: 'nst-01-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Para rodar um app Nest com injeção por tipo, basta executar o TypeScript com um transpilador como o tsx.', answer: false, explanation: 'A injeção depende dos metadados emitidos pelo tsc com emitDecoratorMetadata; o esbuild não os emite.' },
  { id: 'nst-01-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o elemento do Nest à sua função.', pairs: [['@Module', 'Agrupa controllers e providers e define exports'], ['@Controller', 'Declara rotas e delega'], ['@Injectable', 'Marca uma classe como gerenciada pelo contêiner'], ['NestFactory', 'Cria a aplicação a partir de um módulo raiz']], explanation: 'Blocos básicos.' },
  { id: 'nst-01-e4', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que impede o AppModule de usar o SecretoService.', code: '@Injectable() class SecretoService {}\n@Module({ providers: [SecretoService] }) class SecretoModule {}\n@Module({ imports: [SecretoModule], controllers: [XCtrl] }) class AppModule {}', answer: 2, explanation: 'O SecretoModule precisa de exports: [SecretoService] para o provider ficar visível a quem o importa.' },
  { id: 'nst-01-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Compare Express e NestJS: quando você escolheria cada um?', model: 'O Express é minimalista e livre, ótimo para APIs pequenas e quando a equipe quer controle total; o NestJS impõe módulos, controllers, providers e injeção de dependências, com pipes, guards, interceptors e filtros, o que traz padronização, testabilidade e previsibilidade em equipes e domínios grandes, ao custo de mais conceitos, boilerplate e decoradores. Ambos exigem conhecer HTTP e o event loop; o Nest usa o Express por baixo.', rubric: ['Descreve o Express como minimalista', 'Descreve a estrutura do Nest', 'Cita testabilidade ou padronização', 'Cita o custo do Nest'], explanation: 'Escolha conforme tamanho, equipe e longevidade.' },
  { id: 'nst-01-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §podeInjetar(modulos, consumidor, token)§. §modulos§ é um objeto nome → §{ providers: [], exports: [], imports: [] }§ (ausentes valem §[]§). O módulo §consumidor§ pode injetar §token§ se o token está em §providers§ dele ou em §exports§ de algum módulo listado em §imports§ dele (apenas um nível, sem reexportação). Devolva §true§ ou §false§.', lang: 'javascript', starter: 'function podeInjetar(modulos, consumidor, token) {\n  // seu código aqui\n}\n', hints: ['Olhe os providers do próprio módulo.', 'Depois percorra os imports e confira os exports de cada um.'], tests: [{ name: 'próprio e importado', code: R`const m = { App: { imports: ['Sec'], providers: ['Ctrl'] }, Sec: { providers: ['SecretoService'], exports: [] }, Ok: { providers: ['S'], exports: ['S'] }, App2: { imports: ['Ok'] } };
assert.equal(podeInjetar(m, 'App', 'Ctrl'), true);
assert.equal(podeInjetar(m, 'App', 'SecretoService'), false);
assert.equal(podeInjetar(m, 'App2', 'S'), true);` }, { name: 'sem reexportação', code: R`const m = { A: { imports: ['B'] }, B: { imports: ['C'] }, C: { providers: ['X'], exports: ['X'] } };
assert.equal(podeInjetar(m, 'A', 'X'), false);
assert.equal(podeInjetar(m, 'B', 'X'), true);
assert.equal(podeInjetar(m, 'A', 'Z'), false);` }], solution: R`function podeInjetar(modulos, consumidor, token) {
  const m = modulos[consumidor] || {};
  if ((m.providers || []).includes(token)) return true;
  return (m.imports || []).some((nome) => ((modulos[nome] || {}).exports || []).includes(token));
}`, explanation: 'É o encapsulamento por módulo: público só o que é exportado.' }
],
'nst-02': [
  { id: 'nst-02-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual forma de provider cria um alias para um provider já existente?', options: ['useValue', 'useClass', 'useFactory', 'useExisting'], answer: 3, explanation: 'Medido: o alias devolveu a classe original (real), não a substituída por useClass.' },
  { id: 'nst-02-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Um provider com escopo REQUEST é instanciado uma única vez para toda a aplicação.', answer: false, explanation: 'Medido: 5 instâncias em 5 requisições, contra 1 do singleton.' },
  { id: 'nst-02-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o hook de ciclo de vida ao momento.', pairs: [['onModuleInit', 'Depois de resolver as dependências do módulo'], ['onApplicationBootstrap', 'Com todos os módulos prontos, antes de escutar'], ['onModuleDestroy', 'Início do encerramento'], ['onApplicationShutdown', 'Último hook do desligamento']], explanation: 'Ordem medida: onModuleInit, onApplicationBootstrap, onModuleDestroy, beforeApplicationShutdown, onApplicationShutdown.' },
  { id: 'nst-02-e4', type: 'trace', difficulty: 3, points: 10, prompt: 'App com um singleton e um provider REQUEST, 5 requisições.', code: 'criadosSingleton = ?\ncriadosRequest = ?', lang: 'text', steps: [{ q: 'Quantas instâncias do singleton?', answers: ['1'] }, { q: 'Quantas do provider por requisição?', answers: ['5'] }], explanation: 'O escopo de requisição cria uma instância por chamada e contagia quem depende dele.' },
  { id: 'nst-02-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Por que a dependência circular é um sinal de design e como você a resolveria?', model: 'Duas classes que dependem uma da outra indicam responsabilidades mal divididas e acoplamento forte. Preferir reprojetar: extrair um terceiro serviço com o que ambos precisam ou usar eventos para desacoplar. forwardRef resolve tecnicamente (medido), mas mantém o acoplamento e deve ser paliativo. No laboratório, a circularidade no mesmo arquivo falhou no carregamento com ReferenceError.', rubric: ['Relaciona ao acoplamento', 'Propõe extrair um serviço', 'Propõe eventos', 'Cita forwardRef como paliativo'], explanation: 'Mesma ideia dos princípios SOLID.' },
  { id: 'nst-02-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §ordemDeCriacao(providers, alvo)§. §providers§ é um objeto token → lista de tokens dos quais depende. Devolva a lista de tokens na ordem em que devem ser criados para obter §alvo§ (dependências antes de quem depende; cada token uma vez; ordem estável pela ordem das dependências). Se houver ciclo, lance §Error("dependência circular: A -> B -> A")§ com o caminho do ciclo (a partir do primeiro token repetido).', lang: 'javascript', starter: 'function ordemDeCriacao(providers, alvo) {\n  // seu código aqui\n}\n', hints: ['Use uma busca em profundidade com pilha do caminho.', 'Marque os tokens já criados.', 'O ciclo aparece quando um token já está no caminho atual.'], tests: [{ name: 'ordem', code: R`const p = { Ctrl: ['Servico', 'Config'], Servico: ['Repo'], Repo: ['Config'], Config: [] };
assert.equal(JSON.stringify(ordemDeCriacao(p, 'Ctrl')), '["Config","Repo","Servico","Ctrl"]');
assert.equal(JSON.stringify(ordemDeCriacao(p, 'Repo')), '["Config","Repo"]');` }, { name: 'ciclo', code: R`const p = { A: ['B'], B: ['A'] };
assert.throws(() => ordemDeCriacao(p, 'A'), 'dependência circular: A -> B -> A');
const q = { X: ['Y'], Y: ['Z'], Z: ['Y'] };
assert.throws(() => ordemDeCriacao(q, 'X'), 'dependência circular: Y -> Z -> Y');` }], solution: R`function ordemDeCriacao(providers, alvo) {
  const feito = new Set(); const ordem = []; const caminho = [];
  const visitar = (t) => {
    if (feito.has(t)) return;
    const i = caminho.indexOf(t);
    if (i !== -1) throw new Error('dependência circular: ' + [...caminho.slice(i), t].join(' -> '));
    caminho.push(t);
    for (const d of providers[t] || []) visitar(d);
    caminho.pop();
    feito.add(t); ordem.push(t);
  };
  visitar(alvo);
  return ordem;
}`, explanation: 'É a resolução do grafo de dependências que o contêiner faz.' }
],
'nst-03': [
  { id: 'nst-03-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Por que o DTO é uma classe e não uma interface?', options: ['Por convenção apenas', 'Interfaces somem em tempo de execução; as anotações de validação precisam existir', 'Porque interfaces são mais lentas', 'Porque o Express exige'], answer: 1, explanation: 'Os metadados de validação ficam na classe.' },
  { id: 'nst-03-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Com forbidNonWhitelisted, enviar um campo extra "admin" resulta em 400 com a mensagem "property admin should not exist".', answer: true, explanation: 'Medido no laboratório.' },
  { id: 'nst-03-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o pipe ao comportamento medido.', pairs: [['ParseIntPipe com "abc"', '400 "Validation failed (numeric string is expected)"'], ['ParseUUIDPipe com "123"', '400 "Validation failed (uuid is expected)"'], ['DefaultValuePipe(1) sem a query', 'Usa o valor 1'], ['ValidationPipe com transform e @Type(() => Number)', 'Converte "30" em número']], explanation: 'Respostas medidas.' },
  { id: 'nst-03-e4', type: 'trace', difficulty: 3, points: 10, prompt: 'POST com { nome: "A", email: "x", idade: 10 }.', code: 'nome: @MinLength(3)\nemail: @IsEmail()\nidade: @Min(18)', lang: 'text', steps: [{ q: 'Qual o status?', answers: ['400'] }, { q: 'Quantas mensagens de erro vêm na lista?', answers: ['3'] }], explanation: 'O ValidationPipe devolve todas as violações de uma vez.' },
  { id: 'nst-03-e5', type: 'open', difficulty: 3, points: 10, prompt: 'O que é mass assignment e como o ValidationPipe ajuda a preveni-lo?', model: 'Mass assignment ocorre quando o cliente envia campos que não deveria controlar (role, isAdmin, id) e o servidor os copia para o objeto. Com whitelist: true o ValidationPipe remove as propriedades sem anotação, e com forbidNonWhitelisted rejeita a requisição (medido: 400 "property admin should not exist"). Complementa-se com DTOs de entrada específicos e autorização.', rubric: ['Define mass assignment', 'Cita whitelist', 'Cita forbidNonWhitelisted', 'Cita DTOs específicos ou autorização'], explanation: 'Falha comum em APIs.' },
  { id: 'nst-03-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §validar(dto, regras)§, um mini ValidationPipe com lista branca. §regras§ é campo → §{ tipo, minimo?, opcional? }§ com tipo §"texto"§ (§minimo§ = tamanho mínimo), §"inteiro"§ (aceita número inteiro ou texto numérico inteiro, convertido; §minimo§ = valor mínimo) ou §"email"§ (contém um §@§ com texto antes e depois). Devolva §{ valido, erros, dados }§. Erros, na ordem das regras: campo ausente não opcional → §"<campo> should not be empty"§; texto curto → §"<campo> must be longer than or equal to <minimo> characters"§; inteiro inválido → §"<campo> must be an integer number"§; abaixo do mínimo → §"<campo> must not be less than <minimo>"§; email inválido → §"<campo> must be an email"§. Depois, para cada propriedade do dto fora das regras (em ordem), §"property <nome> should not exist"§. §dados§ traz só os campos das regras presentes e válidos já convertidos.', lang: 'javascript', starter: 'function validar(dto, regras) {\n  // seu código aqui\n}\n', hints: ['Percorra as regras na ordem.', 'Converta inteiros em texto numérico com Number se for inteiro.', 'Junte os erros de campos extras ao final.'], tests: [{ name: 'válido com conversão', code: R`const regras = { nome: { tipo: 'texto', minimo: 3 }, email: { tipo: 'email' }, idade: { tipo: 'inteiro', minimo: 18 }, apelido: { tipo: 'texto', opcional: true } };
const r = validar({ nome: 'Ana', email: 'ana@x.com', idade: '30' }, regras);
assert.equal(JSON.stringify(r), '{"valido":true,"erros":[],"dados":{"nome":"Ana","email":"ana@x.com","idade":30}}');` }, { name: 'erros em ordem e campo extra', code: R`const regras = { nome: { tipo: 'texto', minimo: 3 }, email: { tipo: 'email' }, idade: { tipo: 'inteiro', minimo: 18 } };
const r = validar({ nome: 'A', email: 'x', idade: 10, admin: true }, regras);
assert.equal(r.valido, false);
assert.equal(JSON.stringify(r.erros), '["nome must be longer than or equal to 3 characters","email must be an email","idade must not be less than 18","property admin should not exist"]');
const s = validar({ idade: 'abc' }, regras);
assert.equal(JSON.stringify(s.erros), '["nome should not be empty","email should not be empty","idade must be an integer number"]');` }], solution: R`function validar(dto, regras) {
  const erros = []; const dados = {};
  for (const [campo, r] of Object.entries(regras)) {
    const v = dto[campo];
    if (v === undefined || v === null || v === '') { if (!r.opcional) erros.push(campo + ' should not be empty'); continue; }
    if (r.tipo === 'texto') {
      if (typeof v !== 'string' || v.length < (r.minimo || 0)) { erros.push(campo + ' must be longer than or equal to ' + r.minimo + ' characters'); continue; }
      dados[campo] = v;
    } else if (r.tipo === 'inteiro') {
      const n = typeof v === 'string' && /^-?\d+$/.test(v) ? Number(v) : v;
      if (!Number.isInteger(n)) { erros.push(campo + ' must be an integer number'); continue; }
      if (r.minimo !== undefined && n < r.minimo) { erros.push(campo + ' must not be less than ' + r.minimo); continue; }
      dados[campo] = n;
    } else if (r.tipo === 'email') {
      if (typeof v !== 'string' || !/^[^@\s]+@[^@\s]+$/.test(v)) { erros.push(campo + ' must be an email'); continue; }
      dados[campo] = v;
    }
  }
  for (const k of Object.keys(dto)) if (!(k in regras)) erros.push('property ' + k + ' should not exist');
  return { valido: erros.length === 0, erros, dados };
}`, explanation: 'Resume o que o ValidationPipe faz com whitelist e transform.' }
],
'nst-04': [
  { id: 'nst-04-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'O que o Nest devolve quando canActivate de um guard retorna false?', options: ['200', '401', '403 Forbidden', '500'], answer: 2, explanation: 'Medido: 403 com "Forbidden resource".' },
  { id: 'nst-04-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Ler o papel do usuário de um cabeçalho x-papel enviado pelo cliente é uma forma segura de autorização.', answer: false, explanation: 'O cabeçalho é controlado pelo cliente; o papel deve vir de uma identidade verificada (token assinado, sessão).' },
  { id: 'nst-04-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a etapa da linha de processamento à responsabilidade.', pairs: [['Guard', 'Autorização: pode ou não pode'], ['Interceptor', 'Lógica antes e depois, transformação, timeout, cache'], ['Pipe', 'Validação e transformação de argumentos'], ['Filtro de exceção', 'Traduzir exceções em respostas']], explanation: 'Cada componente tem uma função.' },
  { id: 'nst-04-e4', type: 'trace', difficulty: 3, points: 10, prompt: 'Rota com um guard, um interceptor e um pipe, medida no laboratório.', code: 'trilha: guard -> interceptor:antes -> pipe -> handler -> interceptor:depois', lang: 'text', steps: [{ q: 'O guard executa antes ou depois do pipe?', answers: ['antes'] }, { q: 'O interceptor "depois" executa antes ou depois do handler?', answers: ['depois'] }], explanation: 'Ordem: guard, interceptor, pipe, handler, interceptor (volta), filtro em caso de erro.' },
  { id: 'nst-04-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Explique a política "negar por padrão" em um guard global e como liberar rotas públicas. Por que verificar apenas o papel não basta?', model: 'Um guard global (APP_GUARD) exige autenticação em toda rota; rotas abertas (login, saúde) são liberadas explicitamente com um decorador @Public() lido pelo Reflector, de modo que esquecer de proteger uma rota é impossível. O papel não basta porque um usuário com o papel correto ainda pode acessar o recurso de outro (IDOR/BOLA): é preciso verificar a propriedade do recurso no serviço ou em um guard que o carregue.', rubric: ['Descreve o guard global', 'Descreve @Public', 'Cita IDOR ou BOLA', 'Cita a verificação do dono do recurso'], explanation: 'Boas práticas de autorização.' },
  { id: 'nst-04-e6', type: 'code', difficulty: 2, points: 25, prompt: 'Implemente §autorizar(regra, usuario)§. §regra§ é §{ publica?, papeis? }§; §usuario§ é §null§ (não autenticado) ou §{ papel }§. Devolva §"ok"§, §"401"§ ou §"403"§: rota pública → ok; sem usuário → 401; sem §papeis§ (qualquer autenticado) → ok; papel incluído em §papeis§ → ok; caso contrário → 403.', lang: 'javascript', starter: 'function autorizar(regra, usuario) {\n  // seu código aqui\n}\n', hints: ['Verifique publica primeiro.', 'Depois a autenticação (401).', 'Por fim os papéis (403).'], tests: [{ name: 'casos principais', code: R`assert.equal(autorizar({ publica: true }, null), 'ok');
assert.equal(autorizar({}, null), '401');
assert.equal(autorizar({}, { papel: 'user' }), 'ok');` }, { name: 'papéis', code: R`assert.equal(autorizar({ papeis: ['admin'] }, { papel: 'user' }), '403');
assert.equal(autorizar({ papeis: ['admin'] }, { papel: 'admin' }), 'ok');
assert.equal(autorizar({ papeis: ['admin', 'gestor'] }, { papel: 'gestor' }), 'ok');
assert.equal(autorizar({ papeis: ['admin'] }, null), '401');` }], solution: R`function autorizar(regra, usuario) {
  if (regra.publica) return 'ok';
  if (!usuario) return '401';
  if (!regra.papeis) return 'ok';
  return regra.papeis.includes(usuario.papel) ? 'ok' : '403';
}`, explanation: 'Distingue não autenticado (401) de sem permissão (403).' }
],
'nst-05': [
  { id: 'nst-05-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'O que next.handle() devolve em um interceptor?', options: ['A resposta HTTP', 'Um Observable com o resultado do handler', 'Uma Promise de status', 'void'], answer: 1, explanation: 'Os operadores do RxJS no pipe atuam depois do handler.' },
  { id: 'nst-05-e2', type: 'tf', difficulty: 3, points: 10, prompt: 'O timeout de 100 ms do interceptor cancela o trabalho do handler que levaria 400 ms.', answer: false, explanation: 'O timeout abandona a espera e responde 408 (~110 ms), mas não cancela o trabalho; use AbortSignal e timeouts nas dependências.' },
  { id: 'nst-05-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o operador RxJS ao uso em interceptors.', pairs: [['tap', 'Efeito colateral como log, sem alterar o valor'], ['map', 'Transformar a resposta, como um envelope'], ['timeout', 'Falhar se o handler demorar demais'], ['catchError', 'Converter erros']], explanation: 'Operadores comuns.' },
  { id: 'nst-05-e4', type: 'trace', difficulty: 3, points: 10, prompt: 'Medições dos interceptors.', code: 'GET /u/envelope (handler devolve { n: 1 })\nGET /u/lento com timeout(100) em uma rota de 400 ms', lang: 'text', steps: [{ q: 'Qual o corpo do envelope (use dados como chave)?', answers: ['{"dados":{"n":1}}', '{"dados":{"n":1}}'] }, { q: 'Qual o status do timeout?', answers: ['408'] }], explanation: 'map embrulhou a resposta; o timeout virou RequestTimeoutException (408).' },
  { id: 'nst-05-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Quando usar middleware, guard, interceptor ou pipe? Dê um exemplo de cada.', model: 'Middleware: preocupações independentes do Nest (CORS, parsers, id da requisição). Guard: autorização (um decorador de papéis). Interceptor: lógica antes e depois, como log de latência, transformação de resposta, timeout ou cache. Pipe: validar e transformar argumentos (ValidationPipe, ParseIntPipe). Filtro: traduzir exceções.', rubric: ['Middleware com exemplo', 'Guard com exemplo', 'Interceptor com exemplo', 'Pipe com exemplo'], explanation: 'Escolha pela responsabilidade.' },
  { id: 'nst-05-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §compor(interceptors, handler)§, que devolve uma função §() => resultado§. Cada interceptor é §(next) => valor§ e deve chamar §next()§ para continuar a cadeia. A ordem de execução é a da lista (o primeiro é o mais externo). Se um interceptor não chamar §next()§, o handler e os seguintes não são executados (curto-circuito).', lang: 'javascript', starter: 'function compor(interceptors, handler) {\n  // seu código aqui\n}\n', hints: ['Use reduceRight para encadear.', 'O último next chama o handler.'], tests: [{ name: 'ordem e transformação', code: R`const log = [];
const a = (next) => { log.push('a:antes'); const r = next(); log.push('a:depois'); return { dados: r }; };
const b = (next) => { log.push('b:antes'); const r = next(); log.push('b:depois'); return r; };
const f = compor([a, b], () => { log.push('handler'); return 1; });
assert.equal(JSON.stringify(f()), '{"dados":1}');
assert.equal(log.join(','), 'a:antes,b:antes,handler,b:depois,a:depois');` }, { name: 'curto-circuito', code: R`let chamado = false;
const cache = () => 'do cache';
const f = compor([cache], () => { chamado = true; return 'real'; });
assert.equal(f(), 'do cache');
assert.equal(chamado, false);
assert.equal(compor([], () => 7)(), 7);` }], solution: R`function compor(interceptors, handler) {
  return interceptors.reduceRight((proximo, i) => () => i(proximo), handler);
}`, explanation: 'É a cebola de interceptors: ida em ordem, volta em ordem inversa.' }
],
'nst-06': [
  { id: 'nst-06-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'O que o Nest devolve por padrão para um TypeError inesperado em um handler?', options: ['A stack no corpo', '500 com {"statusCode":500,"message":"Internal server error"}', '400', '200 com o erro'], answer: 1, explanation: 'Medido: o Nest esconde os detalhes e registra o erro no log.' },
  { id: 'nst-06-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'A camada de domínio deve lançar HttpException para indicar erros de negócio.', answer: false, explanation: 'O domínio deve ser independente de HTTP; um filtro na borda traduz erros de domínio em status.' },
  { id: 'nst-06-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a situação à resposta medida.', pairs: [['NotFoundException("usuário não existe")', '404 com message, error e statusCode'], ['HttpException com objeto e 418', '418 com o objeto como corpo'], ['ErroDominio com filtro', '409 em formato Problem Details'], ['Rota inexistente', '404 "Cannot GET /u/nada"']], explanation: 'Respostas do laboratório.' },
  { id: 'nst-06-e4', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que vaza informações internas em um filtro global.', code: '@Catch() class TudoFilter implements ExceptionFilter {\n  catch(e: any, host: ArgumentsHost) {\n    host.switchToHttp().getResponse().status(500).json({ erro: e.message, stack: e.stack });\n  }\n}', answer: 3, explanation: 'Mensagem e stack devem ir só para o log; o cliente recebe um erro genérico com o id da requisição.' },
  { id: 'nst-06-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Por que padronizar as respostas de erro com Problem Details e como fazer isso no Nest?', model: 'Um formato único (RFC 9457: type, title, status, detail, instance, mais extensões como requestId e errors por campo) facilita o consumo por clientes e ferramentas e a documentação. No Nest registra-se um filtro global com @Catch() via APP_FILTER que converte HttpException (inclusive as da validação e dos guards), erros de domínio e erros inesperados no mesmo formato, devolvendo 500 genérico sem stack e registrando os detalhes no log com o id da requisição.', rubric: ['Cita o formato padrão', 'Cita o filtro global com APP_FILTER', 'Cita 500 genérico sem vazamento', 'Cita o id da requisição'], explanation: 'Contrato de erro estável.' },
  { id: 'nst-06-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §traduzir(erro, mapa)§, que converte um erro em Problem Details. Se §erro.codigo§ está em §mapa§ (código → status), devolva §{ type: "https://exemplo.com/erros/" + codigo, title: erro.message, status }§. Se §erro§ tem §status§ inteiro entre 400 e 499, devolva §{ type: "about:blank", title: erro.message, status: erro.status }§. Qualquer outro caso: §{ type: "about:blank", title: "Erro interno", status: 500 }§ (sem a mensagem original).', lang: 'javascript', starter: 'function traduzir(erro, mapa) {\n  // seu código aqui\n}\n', hints: ['Verifique primeiro o código do domínio.', 'Depois o status 4xx.', 'No restante, devolva o erro genérico.'], tests: [{ name: 'domínio e 4xx', code: R`const mapa = { 'saldo-insuficiente': 409, 'nao-encontrado': 404 };
const e1 = Object.assign(new Error('saldo insuficiente'), { codigo: 'saldo-insuficiente' });
assert.equal(JSON.stringify(traduzir(e1, mapa)), '{"type":"https://exemplo.com/erros/saldo-insuficiente","title":"saldo insuficiente","status":409}');
const e2 = Object.assign(new Error('dados inválidos'), { status: 422 });
assert.equal(JSON.stringify(traduzir(e2, mapa)), '{"type":"about:blank","title":"dados inválidos","status":422}');` }, { name: 'inesperados', code: R`assert.equal(JSON.stringify(traduzir(new TypeError('x is undefined'), {})), '{"type":"about:blank","title":"Erro interno","status":500}');
const e = Object.assign(new Error('banco'), { status: 503 });
assert.equal(traduzir(e, {}).status, 500);
assert.equal(traduzir(e, {}).title, 'Erro interno');` }], solution: R`function traduzir(erro, mapa) {
  if (erro.codigo && Object.prototype.hasOwnProperty.call(mapa, erro.codigo)) return { type: 'https://exemplo.com/erros/' + erro.codigo, title: erro.message, status: mapa[erro.codigo] };
  if (Number.isInteger(erro.status) && erro.status >= 400 && erro.status < 500) return { type: 'about:blank', title: erro.message, status: erro.status };
  return { type: 'about:blank', title: 'Erro interno', status: 500 };
}`, explanation: 'Um mapa central de erros evita regras espalhadas.' }
],
'nst-07': [
  { id: 'nst-07-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual método troca um provider real por um falso em um teste e2e do Nest?', options: ['overrideProvider(Token).useValue(falso)', 'mockEverything()', 'app.useGlobalPipes', 'enableShutdownHooks'], answer: 0, explanation: 'Feito antes de compile().' },
  { id: 'nst-07-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Um app criado com createNestApplication em um teste herda automaticamente os pipes globais registrados no main.ts.', answer: false, explanation: 'O main.ts não é executado nos testes; repita a configuração ou registre os componentes em módulos com APP_PIPE e APP_FILTER.' },
  { id: 'nst-07-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o tipo de dublê à descrição.', pairs: [['Stub', 'Devolve respostas fixas'], ['Mock', 'Verifica como foi chamado'], ['Fake', 'Implementação simples funcional, como um repositório em memória'], ['Spy', 'Registra as chamadas de um objeto real']], explanation: 'Vocabulário de testes.' },
  { id: 'nst-07-e4', type: 'trace', difficulty: 3, points: 10, prompt: 'Testes medidos com node --test.', code: 'unitário: pass\ne2e com override (200, 404, 400): pass\nsem override: a rota chamou o repositório real', lang: 'text', steps: [{ q: 'Qual o status da rota sem o override?', answers: ['500'] }, { q: 'Quantos testes passaram no total?', answers: ['3'] }], explanation: 'O repositório real lançou de propósito; o teste afirma o 500.' },
  { id: 'nst-07-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Que equilíbrio entre testes unitários, de integração e e2e você adotaria em uma API Nest e por quê?', model: 'Muitos unitários rápidos para as regras dos serviços com dependências falsas; testes de integração dos repositórios contra um banco real em contêiner (consultas, constraints, transações); poucos e2e valiosos pelas rotas HTTP cobrindo sucesso e erros (400, 401, 403, 404, 409, 500 sem vazamento) e a matriz de autorização. Mantém-se a suíte rápida e determinística e roda-se no CI.', rubric: ['Unitários numerosos', 'Integração com banco real', 'e2e focados em contrato e erros', 'Velocidade e CI'], explanation: 'Pirâmide de testes.' },
  { id: 'nst-07-e6', type: 'code', difficulty: 2, points: 25, prompt: 'Implemente §rodarMatriz(guard, casos)§. §guard(rota, papel)§ devolve um status (200, 401 ou 403). §casos§ é uma lista §{ rota, papel, esperado }§. Devolva a lista de falhas (texto), uma por caso que diverge: §"<rota>/<papel>: esperado <esperado>, obtido <status>"§, na ordem dos casos.', lang: 'javascript', starter: 'function rodarMatriz(guard, casos) {\n  // seu código aqui\n}\n', hints: ['Percorra os casos e compare.', 'Monte a mensagem exatamente como no enunciado.'], tests: [{ name: 'sem falhas', code: R`const guard = (rota, papel) => (!papel ? 401 : rota === '/admin' && papel !== 'admin' ? 403 : 200);
const casos = [{ rota: '/admin', papel: 'admin', esperado: 200 }, { rota: '/admin', papel: 'user', esperado: 403 }, { rota: '/admin', papel: null, esperado: 401 }];
assert.equal(JSON.stringify(rodarMatriz(guard, casos)), '[]');` }, { name: 'com falhas', code: R`const guardRuim = () => 200;
const casos = [{ rota: '/admin', papel: 'user', esperado: 403 }, { rota: '/vitrine', papel: 'user', esperado: 200 }, { rota: '/admin', papel: null, esperado: 401 }];
assert.equal(JSON.stringify(rodarMatriz(guardRuim, casos)), '["/admin/user: esperado 403, obtido 200","/admin/null: esperado 401, obtido 200"]');` }], solution: R`function rodarMatriz(guard, casos) {
  const falhas = [];
  for (const c of casos) {
    const obtido = guard(c.rota, c.papel);
    if (obtido !== c.esperado) falhas.push(c.rota + '/' + c.papel + ': esperado ' + c.esperado + ', obtido ' + obtido);
  }
  return falhas;
}`, explanation: 'Um teste de tabela documenta e protege a política de autorização.' }
],
'nst-08': [
  { id: 'nst-08-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual decorador consome eventos sem devolver resposta?', options: ['@MessagePattern', '@EventPattern', '@Get', '@Processor'], answer: 1, explanation: 'EventPattern é fire and forget; MessagePattern responde a requisições.' },
  { id: 'nst-08-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Com o servidor TCP parado, o cliente de microsserviço continua respondendo normalmente.', answer: false, explanation: 'Medido: ECONNREFUSED; proteja as chamadas com timeout, retry limitado e disjuntor.' },
  { id: 'nst-08-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o job ao resultado medido no BullMQ (attempts 3).', pairs: [['Job simples', 'completed na 1ª tentativa'], ['Job instável', 'completed na 3ª tentativa'], ['Job quebrado', 'failed após 3 tentativas'], ['Contagem final', '2 completed e 1 failed']], explanation: 'Resultado do laboratório.' },
  { id: 'nst-08-e4', type: 'trace', difficulty: 3, points: 10, prompt: 'Medições do transporte TCP.', code: '500 chamadas sequenciais: 292 ms\nemit de 2 eventos: ?\nservidor parado: ?', lang: 'text', steps: [{ q: 'Quantos eventos foram recebidos?', answers: ['2'] }, { q: 'Qual o código do erro com o servidor parado?', answers: ['ECONNREFUSED'] }], explanation: 'Eventos chegam sem resposta; sem servidor, a conexão é recusada.' },
  { id: 'nst-08-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Quando usar chamada direta, evento ou fila de jobs? Cite cuidados com filas.', model: 'Chamada direta quando se precisa da resposta agora, em operações curtas; evento para notificar vários interessados e desacoplar produtores de consumidores; fila de jobs para trabalho longo, retentável, com picos e controle de concorrência. Cuidados: entrega pelo menos uma vez exige processadores idempotentes, retries com backoff e jitter, dead letter queue para jobs que sempre falham, persistência do Redis e monitoramento do tamanho e da idade da fila, e desligamento ordenado do worker.', rubric: ['Distingue os três usos', 'Cita idempotência', 'Cita backoff ou DLQ', 'Cita monitoramento ou persistência'], explanation: 'Resumo da aula.' },
  { id: 'nst-08-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §rodarJob(job, opcoes)§, que simula as tentativas do BullMQ sem esperar de verdade. §job(tentativa)§ (tentativa começa em 1) devolve um valor ou lança um erro. §opcoes§ é §{ attempts, backoff }§ com §backoff§ §{ type: "fixed" | "exponential", delay }§. Tente até §attempts§ vezes. Devolva §{ estado, tentativas, esperas, resultado }§ em caso de sucesso (§estado: "completed"§) ou §{ estado: "failed", tentativas, esperas, erro }§ (mensagem do último erro). §esperas§ é a lista dos atrasos entre tentativas: fixo = §delay§; exponencial = §delay * 2 ** (n - 1)§ após a falha de número n. Sem espera após a última tentativa.', lang: 'javascript', starter: 'function rodarJob(job, opcoes) {\n  // seu código aqui\n}\n', hints: ['Use um laço de 1 até attempts.', 'Registre a espera só se ainda houver tentativas.', 'Guarde a mensagem do último erro.'], tests: [{ name: 'sucesso na terceira', code: R`const f = (t) => { if (t < 3) throw new Error('falha ' + t); return 'ok' + t; };
const r = rodarJob(f, { attempts: 3, backoff: { type: 'fixed', delay: 100 } });
assert.equal(JSON.stringify(r), '{"estado":"completed","tentativas":3,"esperas":[100,100],"resultado":"ok3"}');` }, { name: 'falha e backoff exponencial', code: R`const f = () => { throw new Error('quebrado'); };
const r = rodarJob(f, { attempts: 4, backoff: { type: 'exponential', delay: 100 } });
assert.equal(JSON.stringify(r), '{"estado":"failed","tentativas":4,"esperas":[100,200,400],"erro":"quebrado"}');
assert.equal(JSON.stringify(rodarJob(() => 1, { attempts: 3, backoff: { type: 'fixed', delay: 50 } })), '{"estado":"completed","tentativas":1,"esperas":[],"resultado":1}');` }], solution: R`function rodarJob(job, opcoes) {
  const esperas = []; let erro = '';
  for (let t = 1; t <= opcoes.attempts; t++) {
    try {
      const resultado = job(t);
      return { estado: 'completed', tentativas: t, esperas, resultado };
    } catch (e) {
      erro = e.message;
      if (t < opcoes.attempts) esperas.push(opcoes.backoff.type === 'exponential' ? opcoes.backoff.delay * 2 ** (t - 1) : opcoes.backoff.delay);
    }
  }
  return { estado: 'failed', tentativas: opcoes.attempts, esperas, erro };
}`, explanation: 'É a lógica de retry e backoff do BullMQ em miniatura.' }
],
'nst-09': [
  { id: 'nst-09-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'O que um método estático como forRoot() devolve em um módulo dinâmico?', options: ['Um provider', 'Um DynamicModule', 'Uma promise de módulo', 'Um controller'], answer: 1, explanation: 'O DynamicModule traz providers e exports configurados.' },
  { id: 'nst-09-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'No laboratório, a validação de ConfigModule.forRoot falhou antes de a aplicação existir quando faltava DATABASE_URL.', answer: true, explanation: 'Medido: a exceção foi lançada ao avaliar forRoot (falha rápida).' },
  { id: 'nst-09-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o conceito à descrição.', pairs: [['Monólito modular', 'Aplicação única com módulos de fronteiras claras'], ['forFeature', 'Registro por módulo de funcionalidade'], ['Módulo global', 'Exports disponíveis sem importar'], ['Repository', 'Encapsula o acesso a dados']], explanation: 'Vocabulário de arquitetura modular.' },
  { id: 'nst-09-e4', type: 'trace', difficulty: 3, points: 10, prompt: 'Tempo de partida medido (criar e escutar), 1 módulo com 1 controller e 1 provider cada.', code: '1 módulo: 18 ms\n50 módulos: 132 ms\n200 módulos: 310 ms', lang: 'text', steps: [{ q: 'O custo cresce de forma explosiva ou modesta?', answers: ['modesta', 'modesto'] }, { q: 'Quantos ms para 200 módulos?', answers: ['310'] }], explanation: 'Cresce de forma modesta, mas considere em serverless.' },
  { id: 'nst-09-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Defina três regras de fronteira para um monólito modular em Nest e explique como elas facilitam extrair um microsserviço depois.', model: 'Cada módulo expõe uma API pública pequena via exports e mantém o resto privado; um módulo nunca acessa as tabelas de outro, usando seu serviço público ou eventos; as dependências seguem um sentido, sem ciclos, e testes de arquitetura impedem violações. Com essas fronteiras, extrair um módulo vira trocar chamadas internas por chamadas de rede ou eventos, pois o contrato já existe e os dados já são privados.', rubric: ['Três regras', 'Cita exports e API pública', 'Cita não acessar tabelas alheias', 'Liga à extração de microsserviços'], explanation: 'Monolith first.' },
  { id: 'nst-09-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §validarConfig(env, esquema)§. §esquema§ é variável → §{ tipo, obrigatoria?, padrao?, valores? }§ com tipo §"inteiro"§, §"texto"§ ou §"enum"§ (§valores§). Aplique §padrao§ quando ausente; variável obrigatória ausente (sem padrão) é inválida; inteiro precisa ser texto/número inteiro (convertido para número); enum precisa estar em §valores§. Se houver inválidas, lance §Error("configuração inválida: " + nomes.join(", "))§ (nomes na ordem do esquema). Caso contrário, devolva o objeto de configuração (só as variáveis do esquema).', lang: 'javascript', starter: 'function validarConfig(env, esquema) {\n  // seu código aqui\n}\n', hints: ['Aplique o padrão primeiro.', 'Acumule os nomes inválidos.', 'Converta inteiros com Number.'], tests: [{ name: 'válida com padrões', code: R`const esquema = { PORT: { tipo: 'inteiro', padrao: 3000 }, DATABASE_URL: { tipo: 'texto', obrigatoria: true }, LOG_LEVEL: { tipo: 'enum', valores: ['debug', 'info', 'warn'], padrao: 'info' } };
const c = validarConfig({ DATABASE_URL: 'postgres://x', PORT: '8080', OUTRA: 'ignorada' }, esquema);
assert.equal(JSON.stringify(c), '{"PORT":8080,"DATABASE_URL":"postgres://x","LOG_LEVEL":"info"}');` }, { name: 'inválida', code: R`const esquema = { PORT: { tipo: 'inteiro', padrao: 3000 }, DATABASE_URL: { tipo: 'texto', obrigatoria: true }, LOG_LEVEL: { tipo: 'enum', valores: ['debug', 'info'], padrao: 'info' } };
assert.throws(() => validarConfig({ PORT: 'abc', LOG_LEVEL: 'trace' }, esquema), 'configuração inválida: PORT, DATABASE_URL, LOG_LEVEL');
assert.throws(() => validarConfig({}, esquema), 'configuração inválida: DATABASE_URL');` }], solution: R`function validarConfig(env, esquema) {
  const invalidas = []; const cfg = {};
  for (const [nome, r] of Object.entries(esquema)) {
    let v = env[nome];
    if (v === undefined || v === '') v = r.padrao;
    if (v === undefined) { if (r.obrigatoria) invalidas.push(nome); continue; }
    if (r.tipo === 'inteiro') {
      const n = typeof v === 'number' ? v : (/^-?\d+$/.test(String(v)) ? Number(v) : NaN);
      if (!Number.isInteger(n)) { invalidas.push(nome); continue; }
      cfg[nome] = n;
    } else if (r.tipo === 'enum') {
      if (!(r.valores || []).includes(v)) { invalidas.push(nome); continue; }
      cfg[nome] = v;
    } else cfg[nome] = String(v);
  }
  if (invalidas.length) throw new Error('configuração inválida: ' + invalidas.join(', '));
  return cfg;
}`, explanation: 'É o que um esquema de configuração faz: falha rápida e lista tudo de uma vez.' }
]
};

const P = 'nestjs-p';
export const assessment = {
  id: 'nestjs', title: 'Avaliação final — NestJS', passPct: 70, minutes: 45,
  items: [
    { id: P + '1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual a ordem da linha de processamento do Nest, medida em uma rota com guard, interceptor e pipe?', options: ['Pipe, guard, interceptor, handler', 'Guard, interceptor (antes), pipe, handler, interceptor (depois)', 'Interceptor, pipe, guard, handler', 'Handler, guard, pipe'], answer: 1, explanation: 'Medido: guard -> interceptor:antes -> pipe -> handler -> interceptor:depois.' },
    { id: P + '2', type: 'tf', difficulty: 2, points: 10, prompt: 'O Nest 12 é distribuído como ESM e, com TypeScript 7, o projeto deve usar module e moduleResolution nodenext.', answer: true, explanation: 'Medido: com commonjs o TypeScript acusa TS1479 e o node10 foi removido.' },
    { id: P + '3', type: 'trace', difficulty: 3, points: 10, prompt: 'ValidationPipe com whitelist, forbidNonWhitelisted e transform.', code: 'POST { nome: "Ana", email: "ana@x.com", idade: "30" }\nPOST { nome: "Ana", email: "ana@x.com", idade: 30, admin: true }', lang: 'text', steps: [{ q: 'Status do primeiro?', answers: ['201'] }, { q: 'Status do segundo?', answers: ['400'] }, { q: 'Qual o tipo de dto.idade no primeiro (use number ou string)?', answers: ['number'] }], explanation: 'A conversão ocorre com @Type e transform; o campo extra é recusado.' },
    { id: P + '4', type: 'mc', difficulty: 3, points: 10, prompt: 'O que o guard devolve quando canActivate retorna false e como se distingue de 401?', options: ['401 sempre', '403; o 401 indica usuário não autenticado, lançado pela autenticação', '500', '404'], answer: 1, explanation: '403 = sem permissão; 401 = não autenticado.' },
    { id: P + '5', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que torna o teste e2e perigoso por poder acessar o banco real.', code: 'const mod = await Test.createTestingModule({ imports: [UsuariosModule] }).compile();\nconst app = mod.createNestApplication(); await app.init();\nawait request(app.getHttpServer()).get("/usuarios/1").expect(200);', answer: 1, explanation: 'Falta o overrideProvider do repositório antes de compile(); sem ele o repositório real é chamado.' },
    { id: P + '6', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete o provider que cria um alias para o provider Relogio.', code: "{ provide: 'ALIAS', [[0]]: Relogio }", answers: [['useExisting']], explanation: 'useExisting cria um alias.' },
    { id: P + '7', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o fato medido à lição.', pairs: [['500 chamadas TCP em 292 ms', 'Request-response local é barato, mas sem garantias de entrega'], ['Job instável concluiu na 3ª tentativa', 'Retry com backoff resolve falhas transitórias'], ['Provider REQUEST: 5 instâncias em 5 requisições', 'Escopo de requisição tem custo'], ['Timeout de 100 ms devolveu 408 em ~110 ms', 'O timeout abandona a espera sem cancelar o trabalho']], explanation: 'Experimentos das aulas 2, 5 e 8.' },
    { id: P + '8', type: 'mc', difficulty: 3, points: 10, prompt: 'Por que os processadores de filas devem ser idempotentes?', options: ['Para economizar memória', 'Porque a entrega é pelo menos uma vez e um job pode executar mais de uma vez', 'Porque o Redis exige', 'Porque o Nest exige'], answer: 1, explanation: 'Retries e falhas após efeitos colaterais repetem o trabalho.' },
    { id: P + '9', type: 'tf', difficulty: 3, points: 10, prompt: 'Um módulo de um monólito modular deve ler diretamente as tabelas de outro módulo para ser mais rápido.', answer: false, explanation: 'Isso quebra as fronteiras; use o serviço público ou eventos.' },
    { id: P + '10', type: 'mc', difficulty: 3, points: 10, prompt: 'Qual abordagem de erros evita vazamento de informações em respostas 5xx?', options: ['Devolver err.message', 'Devolver a stack em desenvolvimento e produção', 'Filtro global que devolve erro genérico com id e registra os detalhes no log', 'Desligar os logs'], answer: 2, explanation: 'O cliente recebe o mínimo; o log guarda os detalhes.' },
    { id: P + '11', type: 'open', difficulty: 3, points: 10, prompt: 'Descreva a arquitetura de uma API Nest modular de pedidos: módulos, validação, autorização, erros, testes e filas.', model: 'Módulos por domínio (usuários, catálogo, pedidos, pagamentos) com exports mínimos e módulos dinâmicos para banco e filas, configuração validada na partida; ValidationPipe global com whitelist e transform; guard global que nega por padrão com @Public, papéis e verificação do dono do pedido; filtro global com Problem Details e 500 sem vazamento; interceptors de log com id e timeout; fila BullMQ com retry, backoff e processadores idempotentes; testes unitários dos serviços, e2e das rotas (200, 400, 401, 403, 404, 409, 500) e da matriz de autorização; desligamento ordenado e ADR.', rubric: ['Módulos por domínio e exports', 'Validação global', 'Autorização que nega por padrão', 'Erros padronizados', 'Testes e filas idempotentes'], explanation: 'Resumo do projeto integrador.' },
    { id: P + '12', type: 'mc', difficulty: 3, points: 10, prompt: 'O que acontece com a configuração inválida usando ConfigModule.forRoot com validate?', options: ['A aplicação sobe e falha na primeira requisição', 'A exceção é lançada ao avaliar forRoot, antes de a aplicação existir', 'O Nest usa valores padrão ocultos', 'O erro é ignorado'], answer: 1, explanation: 'Medido: falha rápida.' }
  ]
};

export const project = {
  id: 'api-nest-modular', name: 'API Nest modular: módulos por domínio, validação, autorização, erros, filas, testes e ADR', lv: 'M', stack: 'NestJS 12, TypeScript 7, PostgreSQL, Redis, BullMQ, class-validator, Prisma (opcional), node:test ou Jest, Supertest', ds: ['nest'],
  desc: 'Construa uma **API de pedidos** em **NestJS** como **monólito modular** (usuários, catálogo, pedidos e pagamentos), com **configuração validada**, **ValidationPipe global**, **guard global que nega por padrão**, **filtro global de Problem Details**, **interceptors** de log e timeout, **fila BullMQ** com retry e processadores idempotentes, **testes unitários e e2e** (incluindo a **matriz de autorização**), **desligamento ordenado** e um **ADR**.',
  rf: ['Módulos por domínio com exports mínimos; módulos dinâmicos para banco e filas', 'Configuração por ambiente validada na partida (falha rápida)', 'DTOs com ValidationPipe global (whitelist, forbidNonWhitelisted, transform)', 'Guard global que nega por padrão, decorador @Public, papéis e verificação do dono do pedido', 'Filtro global com Problem Details, erros de domínio e 500 sem vazamento, com id da requisição', 'Interceptors de log com id e de timeout (documentando que não cancela o trabalho)', 'Fila BullMQ para e-mail ou relatório com retry, backoff e processador idempotente; jobs failed guardados', 'Testes unitários dos serviços, e2e das rotas (200, 400, 401, 403, 404, 409, 500) e da matriz papel × rota × resultado'],
  rnf: ['Versões fixas (Nest, TypeScript, BullMQ, Redis) e projeto ESM com tsc', 'Nenhum acesso direto entre tabelas de módulos diferentes', 'enableShutdownHooks e /saude', 'README com medições e limitações'],
  ac: ['O app recusa subir com configuração inválida e lista as variáveis', 'Um teste prova que o 500 não contém stack nem mensagem interna', 'A matriz de autorização é um teste de tabela e passa', 'Um job que falha duas vezes conclui na terceira e o idempotente não duplica efeitos', 'O ADR justifica as fronteiras de módulo e onde caberia um microsserviço'],
  ch: ['Gerar OpenAPI com @nestjs/swagger e validar o contrato', 'Usar eventos de domínio entre módulos', 'Comparar o Express e o Fastify como adaptadores', 'Adicionar um teste de arquitetura (dependency-cruiser) para as fronteiras', 'Extrair o módulo de pagamentos como microsserviço com um contrato']
};
