// C4.8 — Python para desenvolvedores: exercícios, avaliação final e projeto.
// Medições reais em Python 3.14.4, FastAPI 0.165.0, Pydantic 2.14.4, mypy 2.4.1, pytest 9.2.0 e uvicorn 0.54.0 (laboratório); os desafios "code" são em JavaScript (o Worker só executa JS) e modelam a lógica do Python.
const R = String.raw;

export const exsets = {
'pyt-01': [
  { id: 'pyt-01-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'O que o Python faz ao avaliar 1 + "1"?', options: ['Devolve "11"', 'Devolve 2', 'Lança TypeError (tipagem forte)', 'Devolve None'], answer: 2, explanation: 'Medido: TypeError: unsupported operand type(s) for +: int and str.' },
  { id: 'pyt-01-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Medido: int("1000") is int("1000") é True porque os valores são iguais.', answer: false, explanation: 'is compara identidade: deu False (== deu True). O CPython só reutiliza inteiros pequenos.' },
  { id: 'pyt-01-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a expressão ao resultado medido.', pairs: [['0.1 + 0.2 == 0.3', 'False'], ['-7 // 2', '-4'], ['7 % -3', '-2'], ['bool("0")', 'True']], explanation: 'Resultados do laboratório.' },
  { id: 'pyt-01-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §divmodPy(a, b)§, que devolve §[q, r]§ com a semântica do Python: §q = Math.floor(a / b)§ e §r = a - q * b§ (o resto tem o sinal do divisor). Lance §Error("divisão por zero")§ se §b§ for 0.', lang: 'javascript', starter: 'function divmodPy(a, b) {\n  // seu código aqui\n}\n', hints: ['Use Math.floor, não Math.trunc.', 'O resto é a - q * b.'], tests: [{ name: 'sinais', code: R`assert.equal(JSON.stringify(divmodPy(7, 2)), '[3,1]');
assert.equal(JSON.stringify(divmodPy(-7, 2)), '[-4,1]');
assert.equal(JSON.stringify(divmodPy(7, -3)), '[-3,-2]');
assert.equal(JSON.stringify(divmodPy(-7, -2)), '[3,-1]');` }, { name: 'zero', code: R`assert.throws(() => divmodPy(1, 0), 'divisão por zero');
assert.equal(JSON.stringify(divmodPy(0, 5)), '[0,0]');` }], solution: R`function divmodPy(a, b) {
  if (b === 0) throw new Error('divisão por zero');
  const q = Math.floor(a / b);
  return [q, a - q * b];
}`, explanation: 'No Python, // arredonda para baixo e % acompanha o sinal do divisor.' },
  { id: 'pyt-01-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Explique a armadilha do argumento padrão mutável e a diferença entre cópia rasa e profunda, com a correção de cada uma.', model: 'O valor padrão de um parâmetro é criado uma única vez, na definição da função; se for uma lista, todas as chamadas que não passam o argumento compartilham a mesma lista (medido: adicionar(1) deu [1] e adicionar(2) deu [1, 2]). A correção é usar None e criar a lista dentro da função. A cópia rasa duplica só o contêiner externo e compartilha os objetos internos (alterar a lista interna do original muda a cópia); a cópia profunda (copy.deepcopy) duplica tudo.', rubric: ['Explica a criação única do padrão', 'Mostra a correção com None', 'Define cópia rasa', 'Define cópia profunda'], explanation: 'Armadilhas clássicas.' },
  { id: 'pyt-01-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §criarAdicionar(corrigido)§, que devolve uma função §adicionar(item, lista)§ que modela o Python. Com §corrigido§ falso, quando §lista§ é §undefined§ usa uma lista padrão compartilhada (criada uma vez em §criarAdicionar§); com §corrigido§ verdadeiro, cria uma lista nova a cada chamada sem lista. Em ambos os casos faz §push(item)§ na lista usada e a devolve.', lang: 'javascript', starter: 'function criarAdicionar(corrigido) {\n  // seu código aqui\n}\n', hints: ['Crie a lista compartilhada fora da função devolvida.', 'No modo corrigido crie [] dentro.'], tests: [{ name: 'com a armadilha', code: R`const f = criarAdicionar(false);
assert.equal(JSON.stringify(f(1)), '[1]');
assert.equal(JSON.stringify(f(2)), '[1,2]');
const minha = []; f(9, minha); assert.equal(minha.length, 1);` }, { name: 'corrigido', code: R`const g = criarAdicionar(true);
assert.equal(JSON.stringify(g(1)), '[1]');
assert.equal(JSON.stringify(g(2)), '[2]');` }], solution: R`function criarAdicionar(corrigido) {
  const padrao = [];
  return function adicionar(item, lista) {
    const alvo = lista !== undefined ? lista : (corrigido ? [] : padrao);
    alvo.push(item);
    return alvo;
  };
}`, explanation: 'Reproduz o comportamento medido de def adicionar(item, lista=[]).' }
],
'pyt-02': [
  { id: 'pyt-02-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Para que serve functools.wraps em um decorador?', options: ['Acelerar a função', 'Preservar o nome e a docstring da função decorada', 'Tornar a função assíncrona', 'Criar um cache'], answer: 1, explanation: 'Sem wraps a função "vira" a função interna do decorador.' },
  { id: 'pyt-02-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Medido: [lambda: i for i in range(3)] devolve [0, 1, 2] ao chamar cada lambda.', answer: false, explanation: 'Devolve [2, 2, 2] (ligação tardia); com lambda i=i: i devolve [0, 1, 2].' },
  { id: 'pyt-02-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o recurso ao resultado medido.', pairs: [['Lista de 1 milhão de inteiros', '8,1 MiB (só o contêiner)'], ['Gerador equivalente', '200 bytes'], ['fib(32) sem cache', '~1.220 ms'], ['fib(32) com lru_cache', '~0,061 ms']], explanation: 'Medidas do laboratório.' },
  { id: 'pyt-02-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §memoizar(fn)§, que devolve uma função com cache por argumento (use §JSON.stringify(args)§ como chave) e o método §info()§ que devolve §{ hits, misses, currsize }§. A primeira chamada com uma chave é um §miss§ (executa §fn§); as seguintes são §hits§.', lang: 'javascript', starter: 'function memoizar(fn) {\n  // seu código aqui\n}\n', hints: ['Use um Map e dois contadores.', 'currsize é o tamanho do Map.'], tests: [{ name: 'hits e misses', code: R`let chamadas = 0; const f = memoizar((a, b) => { chamadas++; return a + b; });
assert.equal(f(1, 2), 3); assert.equal(f(1, 2), 3); assert.equal(f(2, 2), 4);
assert.equal(chamadas, 2);
assert.equal(JSON.stringify(f.info()), '{"hits":1,"misses":2,"currsize":2}');` }, { name: 'recursão', code: R`const fib = memoizar((n) => (n < 2 ? n : fib(n - 1) + fib(n - 2)));
assert.equal(fib(32), 2178309);
assert.equal(JSON.stringify(fib.info()), '{"hits":30,"misses":33,"currsize":33}');` }], solution: R`function memoizar(fn) {
  const cache = new Map(); let hits = 0, misses = 0;
  const f = (...args) => {
    const k = JSON.stringify(args);
    if (cache.has(k)) { hits++; return cache.get(k); }
    misses++; const r = fn(...args); cache.set(k, r); return r;
  };
  f.info = () => ({ hits, misses, currsize: cache.size });
  return f;
}`, explanation: 'Os números (30 hits, 33 misses) coincidem com o CacheInfo medido no Python.' },
  { id: 'pyt-02-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Quando usar geradores e por que isolar as dependências em um ambiente virtual?', model: 'Geradores produzem valores sob demanda com memória constante (medido: lista de 1 milhão = 8,1 MiB e gerador = 200 bytes), ideais para arquivos grandes, fluxos e pipelines; lembre que se esgotam. O venv cria um interpretador e pacotes isolados por projeto, evitando conflitos de versão e alterações no Python do sistema; fixam-se versões (requirements ou lockfile), não se versiona .venv e cuida-se da cadeia de suprimentos.', rubric: ['Memória constante dos geradores', 'Cita os números medidos', 'Isolamento do venv', 'Fixar versões ou cadeia de suprimentos'], explanation: 'Resumo da aula.' },
  { id: 'pyt-02-e6', type: 'code', difficulty: 2, points: 25, prompt: 'Implemente §lambdasEmLaco(n, tardio)§: devolve a lista de resultados ao chamar as §n§ funções criadas em um laço de 0 a §n-1§. Com §tardio§ verdadeiro, todas veem o último valor do contador (§n-1§); com §tardio§ falso (valor capturado), cada uma devolve seu índice. Use §n§ igual a 0 → lista vazia.', lang: 'javascript', starter: 'function lambdasEmLaco(n, tardio) {\n  // seu código aqui\n}\n', hints: ['Em JavaScript, var tem o comportamento tardio; let captura por iteração.', 'Ou apenas modele o resultado.'], tests: [{ name: 'ligação tardia', code: R`assert.equal(JSON.stringify(lambdasEmLaco(3, true)), '[2,2,2]');
assert.equal(JSON.stringify(lambdasEmLaco(3, false)), '[0,1,2]');` }, { name: 'bordas', code: R`assert.equal(JSON.stringify(lambdasEmLaco(0, true)), '[]');
assert.equal(JSON.stringify(lambdasEmLaco(1, true)), '[0]');` }], solution: R`function lambdasEmLaco(n, tardio) {
  const fs = [];
  var i;
  for (i = 0; i < n; i++) {
    if (tardio) fs.push(() => i - 1 + 0);
    else { const v = i; fs.push(() => v); }
  }
  return fs.map((f) => (tardio ? n - 1 : f()));
}`, explanation: 'A closure captura a variável, não o valor.' }
],
'pyt-03': [
  { id: 'pyt-03-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Onde um script deve escrever os dados de saída e onde os logs e avisos?', options: ['Tudo no stdout', 'Dados no stdout e logs/avisos no stderr', 'Tudo no stderr', 'Em arquivos fixos'], answer: 1, explanation: 'Permite pipes e separa dados de diagnóstico.' },
  { id: 'pyt-03-e2', type: 'tf', difficulty: 3, points: 10, prompt: 'Medido: subprocess.run(f"echo processando {entrada}", shell=True) com entrada "a; echo INJETADO" executou o comando extra.', answer: true, explanation: 'Com lista de argumentos a mesma entrada foi tratada como texto.' },
  { id: 'pyt-03-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o recurso do pytest ao uso.', pairs: [['tmp_path', 'Diretório temporário isolado por teste'], ['caplog', 'Verificar mensagens de log'], ['parametrize', 'Executar o mesmo teste com vários dados'], ['fixture', 'Preparar dados ou recursos reutilizáveis']], explanation: 'Recursos usados nos 6 testes do laboratório.' },
  { id: 'pyt-03-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §interpretarArgs(argv, esquema)§, um mini argparse. §esquema§ = §{ posicionais: [nomes], opcoes: { "--saida": "valor", "-v": "flag" } }§. Devolva §{ codigo: 0, args }§ com os posicionais por nome, as opções de valor (a chave sem os traços iniciais, valor = próximo item) e as flags (§true§ se presentes, senão §false§). Em erro (posicional faltando, opção desconhecida ou opção de valor sem valor) devolva §{ codigo: 2, erro }§.', lang: 'javascript', starter: 'function interpretarArgs(argv, esquema) {\n  // seu código aqui\n}\n', hints: ['Percorra argv com um índice.', 'Itens que começam com - são opções; os outros são posicionais em ordem.'], tests: [{ name: 'sucesso', code: R`const esq = { posicionais: ['pasta'], opcoes: { '--saida': 'valor', '-v': 'flag' } };
assert.equal(JSON.stringify(interpretarArgs(['dados', '--saida', 'r.json', '-v'], esq)), '{"codigo":0,"args":{"pasta":"dados","saida":"r.json","v":true}}');
assert.equal(JSON.stringify(interpretarArgs(['dados'], esq)), '{"codigo":0,"args":{"pasta":"dados","saida":null,"v":false}}');` }, { name: 'erros', code: R`const esq = { posicionais: ['pasta'], opcoes: { '--saida': 'valor', '-v': 'flag' } };
assert.equal(interpretarArgs([], esq).codigo, 2);
assert.equal(interpretarArgs(['x', '--nada'], esq).codigo, 2);
assert.equal(interpretarArgs(['x', '--saida'], esq).codigo, 2);` }], solution: R`function interpretarArgs(argv, esquema) {
  const args = {}; const pos = [];
  for (const [o, t] of Object.entries(esquema.opcoes)) args[o.replace(/^-+/, '')] = t === 'flag' ? false : null;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('-')) {
      const t = esquema.opcoes[a];
      if (!t) return { codigo: 2, erro: 'opção desconhecida: ' + a };
      const k = a.replace(/^-+/, '');
      if (t === 'flag') args[k] = true;
      else { if (i + 1 >= argv.length) return { codigo: 2, erro: 'falta o valor de ' + a }; args[k] = argv[++i]; }
    } else pos.push(a);
  }
  if (pos.length < esquema.posicionais.length) return { codigo: 2, erro: 'argumento obrigatório ausente' };
  const resultado = {};
  esquema.posicionais.forEach((n, i) => { resultado[n] = pos[i]; });
  return { codigo: 0, args: { ...resultado, ...args } };
}`, explanation: 'O argparse devolve erro com código 2 para uso incorreto.' },
  { id: 'pyt-03-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Que práticas tornam um script de automação seguro, testável e operável?', model: 'main(argv) que devolve o código de saída e é protegido por __name__ == "__main__"; dados no stdout e logs no stderr; argparse; pathlib, with e tempfile; subprocess com lista de argumentos, timeout e sem shell=True com entrada de usuário; validação de caminhos contra path traversal; testes com pytest (tmp_path, caplog, parametrize); idempotência, travas contra execução simultânea, timeouts, logs e alertas em falha; segredos fora do código.', rubric: ['main(argv) e código de saída', 'stdout x stderr', 'subprocess seguro', 'Testes com pytest', 'Idempotência ou operação'], explanation: 'Resumo da aula.' },
  { id: 'pyt-03-e6', type: 'code', difficulty: 2, points: 25, prompt: 'Implemente §resumir(linhasPorArquivo)§, que modela o script do curso. §linhasPorArquivo§ é um objeto nome do arquivo → lista de linhas §"loja,valor"§ (sem cabeçalho). Linhas com valor não numérico invalidam o arquivo inteiro (conta em §invalidos§ e nenhuma linha dele soma). Devolva §{ arquivos, invalidos, total, porLoja }§ com §total§ arredondado a 2 casas e §porLoja§ com as chaves em ordem alfabética.', lang: 'javascript', starter: 'function resumir(linhasPorArquivo) {\n  // seu código aqui\n}\n', hints: ['Valide o arquivo inteiro antes de somar.', 'Number("abc") é NaN.'], tests: [{ name: 'soma por loja', code: R`const r = resumir({ 'a.csv': ['POA,10.5', 'SP,20', 'POA,4.5'], 'b.csv': ['SP,5'] });
assert.equal(JSON.stringify(r), '{"arquivos":2,"invalidos":0,"total":40,"porLoja":{"POA":15,"SP":25}}');` }, { name: 'arquivo inválido', code: R`const r = resumir({ 'a.csv': ['A,1', 'B,2'], 'c.csv': ['RJ,abc', 'A,100'] });
assert.equal(JSON.stringify(r), '{"arquivos":2,"invalidos":1,"total":3,"porLoja":{"A":1,"B":2}}');
assert.equal(JSON.stringify(resumir({})), '{"arquivos":0,"invalidos":0,"total":0,"porLoja":{}}');` }], solution: R`function resumir(linhasPorArquivo) {
  const por = {}; let invalidos = 0, arquivos = 0;
  for (const nome of Object.keys(linhasPorArquivo).sort()) {
    arquivos++;
    const linhas = linhasPorArquivo[nome].map((l) => l.split(','));
    if (linhas.some(([, v]) => Number.isNaN(Number(v)))) { invalidos++; continue; }
    for (const [loja, v] of linhas) por[loja] = (por[loja] ?? 0) + Number(v);
  }
  const ordenado = Object.fromEntries(Object.entries(por).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
  const total = Math.round(Object.values(por).reduce((a, b) => a + b, 0) * 100) / 100;
  return { arquivos, invalidos, total, porLoja: ordenado };
}`, explanation: 'Falhas esperadas viram avisos; o processamento continua.' }
],
'pyt-04': [
  { id: 'pyt-04-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'O que o response_model do FastAPI faz?', options: ['Valida o corpo da requisição apenas', 'Define e filtra os campos devolvidos (a senha não sai)', 'Acelera o servidor', 'Cria o banco de dados'], answer: 1, explanation: 'Medido: a senha não apareceu na resposta.' },
  { id: 'pyt-04-e2', type: 'tf', difficulty: 3, points: 10, prompt: 'Medido: uma rota async def com time.sleep(0.05) atingiu vazão semelhante à de uma rota com await asyncio.sleep(0.05).', answer: false, explanation: '18,9 req/s contra 261 req/s: o time.sleep bloqueia o event loop.' },
  { id: 'pyt-04-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a rota de espera de 50 ms à vazão medida.', pairs: [['async def + await asyncio.sleep', '261,0 req/s'], ['def + time.sleep (threads)', '197,1 req/s'], ['async def + time.sleep', '18,9 req/s'], ['/busca durante o bloqueio', '54 ms (contra 5 ms ocioso)']], explanation: 'Medidas com cliente Node, 20 simultâneas.' },
  { id: 'pyt-04-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §validarModelo(modelo, corpo)§, um mini Pydantic. §modelo§ é campo → §{ tipo: "str"|"int", min?, max?, minLength? }§. Devolva §{ valido, erros, dados }§. §erros§ é uma lista §{ loc: ["body", campo], type }§ na ordem do modelo, com tipos: campo ausente → §"missing"§; §str§ curta → §"string_too_short"§; §int§ não numérico → §"int_parsing"§ (texto numérico como §"30"§ é convertido); abaixo de §min§ → §"greater_than_equal"§; acima de §max§ → §"less_than_equal"§. Campos extras são ignorados e não aparecem em §dados§.', lang: 'javascript', starter: 'function validarModelo(modelo, corpo) {\n  // seu código aqui\n}\n', hints: ['Percorra o modelo na ordem.', 'Converta inteiros com Number se o texto for numérico inteiro.'], tests: [{ name: 'válido com coerção', code: R`const m = { nome: { tipo: 'str', minLength: 3 }, idade: { tipo: 'int', min: 18, max: 120 } };
assert.equal(JSON.stringify(validarModelo(m, { nome: 'Ana', idade: '30', admin: true })), '{"valido":true,"erros":[],"dados":{"nome":"Ana","idade":30}}');` }, { name: 'erros', code: R`const m = { nome: { tipo: 'str', minLength: 3 }, idade: { tipo: 'int', min: 18, max: 120 } };
const r = validarModelo(m, { nome: 'A', idade: 10 });
assert.equal(JSON.stringify(r.erros.map((e) => e.type)), '["string_too_short","greater_than_equal"]');
assert.equal(JSON.stringify(validarModelo(m, { nome: 'Ana', idade: 'x' }).erros), '[{"loc":["body","idade"],"type":"int_parsing"}]');
assert.equal(JSON.stringify(validarModelo(m, {}).erros.map((e) => e.type)), '["missing","missing"]');
assert.equal(validarModelo(m, { nome: 'Ana', idade: 200 }).erros[0].type, 'less_than_equal');` }], solution: R`function validarModelo(modelo, corpo) {
  const erros = []; const dados = {};
  for (const [campo, r] of Object.entries(modelo)) {
    const loc = ['body', campo]; let v = corpo[campo];
    if (v === undefined) { erros.push({ loc, type: 'missing' }); continue; }
    if (r.tipo === 'str') {
      if (typeof v !== 'string') { erros.push({ loc, type: 'string_type' }); continue; }
      if (r.minLength !== undefined && v.length < r.minLength) { erros.push({ loc, type: 'string_too_short' }); continue; }
    } else {
      if (typeof v === 'string' && /^-?\d+$/.test(v.trim())) v = Number(v);
      if (!Number.isInteger(v)) { erros.push({ loc, type: 'int_parsing' }); continue; }
      if (r.min !== undefined && v < r.min) { erros.push({ loc, type: 'greater_than_equal' }); continue; }
      if (r.max !== undefined && v > r.max) { erros.push({ loc, type: 'less_than_equal' }); continue; }
    }
    dados[campo] = v;
  }
  return { valido: erros.length === 0, erros, dados };
}`, explanation: 'Reproduz os tipos de erro e a coerção medidos no FastAPI.' },
  { id: 'pyt-04-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Quando usar async def e quando def em uma rota FastAPI e como testar sem autenticação?', model: 'Use async def quando a rota só espera E/S com await e drivers assíncronos; use def para código bloqueante, que o FastAPI executa em um pool de threads sem travar o event loop (ou use asyncio.to_thread dentro de async def). Uma chamada bloqueante em async def trava o servidor inteiro (medido: 18,9 req/s contra 261 e atraso nas outras rotas). Nos testes, substitui-se a dependência de autenticação com app.dependency_overrides e usa-se o TestClient.', rubric: ['async def com await', 'def em threads', 'Efeito medido do bloqueio', 'dependency_overrides'], explanation: 'Resumo da aula.' },
  { id: 'pyt-04-e6', type: 'code', difficulty: 2, points: 25, prompt: 'Implemente §filtrarSaida(objeto, camposPermitidos)§, que modela o response_model: devolve um novo objeto com apenas as chaves de §camposPermitidos§ presentes em §objeto§ (na ordem de §camposPermitidos§). Não altere o original.', lang: 'javascript', starter: 'function filtrarSaida(objeto, camposPermitidos) {\n  // seu código aqui\n}\n', hints: ['Percorra os campos permitidos.', 'Use "in" para checar a presença.'], tests: [{ name: 'oculta a senha', code: R`const u = { id: 1, nome: 'Ana', email: 'a@x.com', idade: 30, senha: '12345678' };
const s = filtrarSaida(u, ['id', 'nome', 'email', 'idade']);
assert.equal(JSON.stringify(s), '{"id":1,"nome":"Ana","email":"a@x.com","idade":30}');
assert.equal('senha' in s, false); assert.equal(u.senha, '12345678');` }, { name: 'campos ausentes', code: R`assert.equal(JSON.stringify(filtrarSaida({ a: 1 }, ['b', 'a'])), '{"a":1}');
assert.equal(JSON.stringify(filtrarSaida({}, ['a'])), '{}');` }], solution: R`function filtrarSaida(objeto, camposPermitidos) {
  const r = {};
  for (const c of camposPermitidos) if (c in objeto) r[c] = objeto[c];
  return r;
}`, explanation: 'A lista de permissão de saída evita vazar campos sensíveis.' }
],
'pyt-05': [
  { id: 'pyt-05-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'O que o Python faz com x: int = "texto" em tempo de execução?', options: ['Lança TypeError', 'Executa sem reclamar (anotações não são verificadas)', 'Converte para 0', 'Recusa o arquivo'], answer: 1, explanation: 'Medido: x = "texto" e tipo real str.' },
  { id: 'pyt-05-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'O mypy --strict devolve código de saída 1 quando encontra erros de tipo.', answer: true, explanation: 'Medido: 7 mensagens e código 1 no arquivo com erros; use no CI.' },
  { id: 'pyt-05-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o código do mypy ao problema.', pairs: [['[union-attr]', 'Usar um atributo de um valor que pode ser None'], ['[arg-type]', 'Argumento de tipo incompatível'], ['[typeddict-item]', 'Chave faltando ou valor de tipo errado em um TypedDict'], ['[return-value]', 'Valor de retorno incompatível com a anotação']], explanation: 'Mensagens medidas.' },
  { id: 'pyt-05-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §ehDoTipo(valor, tipo)§, uma verificação em tempo de execução inspirada nos type hints. §tipo§ pode ser §"int"§ (inteiro), §"float"§ (número), §"str"§, §"bool"§, §"None"§, §"list[T]"§ (lista cujos itens são do tipo T) ou uma união §"A | B"§ (separada por §|§, com espaços opcionais).', lang: 'javascript', starter: 'function ehDoTipo(valor, tipo) {\n  // seu código aqui\n}\n', hints: ['Trate a união primeiro, dividindo por |.', 'Para list[T], use uma expressão regular e verifique cada item.'], tests: [{ name: 'básicos e união', code: R`assert.equal(ehDoTipo(3, 'int'), true);
assert.equal(ehDoTipo(3.5, 'int'), false);
assert.equal(ehDoTipo('a', 'str | None'), true);
assert.equal(ehDoTipo(null, 'str | None'), true);
assert.equal(ehDoTipo(5, 'str | None'), false);` }, { name: 'listas', code: R`assert.equal(ehDoTipo([1, 2, 3], 'list[int]'), true);
assert.equal(ehDoTipo([1, 'a'], 'list[int]'), false);
assert.equal(ehDoTipo([], 'list[str]'), true);
assert.equal(ehDoTipo([1, null], 'list[int | None]'), true);
assert.equal(ehDoTipo(true, 'bool'), true);` }], solution: R`function ehDoTipo(valor, tipo) {
  const partes = []; let atual = '', prof = 0;
  for (const c of tipo) { if (c === '[') prof++; if (c === ']') prof--; if (c === '|' && prof === 0) { partes.push(atual.trim()); atual = ''; } else atual += c; }
  partes.push(atual.trim());
  if (partes.length > 1) return partes.some((p) => ehDoTipo(valor, p));
  const t = partes[0];
  const m = /^list\[(.+)\]$/.exec(t);
  if (m) return Array.isArray(valor) && valor.every((x) => ehDoTipo(x, m[1]));
  if (t === 'int') return Number.isInteger(valor);
  if (t === 'float') return typeof valor === 'number';
  if (t === 'str') return typeof valor === 'string';
  if (t === 'bool') return typeof valor === 'boolean';
  if (t === 'None') return valor === null;
  return false;
}`, explanation: 'É o que o Pydantic faz em execução; o mypy faz de forma estática.' },
  { id: 'pyt-05-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Compare mypy e Pydantic: o que cada um verifica, quando e para que dados.', model: 'O mypy faz verificação estática, antes de executar, da coerência interna do código com os type hints (medido: 7 mensagens e código 1 em um arquivo com erros), sem custo em execução; não valida dados externos. O Pydantic valida e converte dados em tempo de execução, na fronteira com o mundo externo (JSON de requisições, arquivos, variáveis de ambiente), com coerção e erros detalhados (n="12" vira 12; "doze" gera int_parsing). As anotações em si não são verificadas pelo interpretador. Usa-se os dois.', rubric: ['mypy estático', 'Pydantic em execução', 'Anotações não verificadas pelo Python', 'Complementaridade'], explanation: 'Resumo da aula.' },
  { id: 'pyt-05-e6', type: 'code', difficulty: 2, points: 25, prompt: 'Implemente §soTemChaves(obj, chaves)§, que modela o TypedDict estrito: devolve a lista de mensagens de erro (texto) para as chaves de §chaves§ que faltam em §obj§ (§"Missing key \'k\'"§, na ordem de §chaves§) e para as chaves de §obj§ que não estão em §chaves§ (§"Extra key \'k\'"§, na ordem de §obj§). Faltantes primeiro; sem problemas devolve §[]§.', lang: 'javascript', starter: 'function soTemChaves(obj, chaves) {\n  // seu código aqui\n}\n', hints: ['Percorra as chaves esperadas e depois as do objeto.', 'Use as mensagens exatamente como no enunciado.'], tests: [{ name: 'faltando e extra', code: R`assert.equal(JSON.stringify(soTemChaves({ sku: 'A' }, ['sku', 'qtd'])), '["Missing key \'qtd\'"]');
assert.equal(JSON.stringify(soTemChaves({ sku: 'A', qtd: 1, x: 2 }, ['sku', 'qtd'])), '["Extra key \'x\'"]');` }, { name: 'ordem e vazio', code: R`assert.equal(JSON.stringify(soTemChaves({ z: 1 }, ['a', 'b'])), '["Missing key \'a\'","Missing key \'b\'","Extra key \'z\'"]');
assert.equal(JSON.stringify(soTemChaves({ a: 1 }, ['a'])), '[]');` }], solution: R`function soTemChaves(obj, chaves) {
  const erros = [];
  for (const k of chaves) if (!(k in obj)) erros.push("Missing key '" + k + "'");
  for (const k of Object.keys(obj)) if (!chaves.includes(k)) erros.push("Extra key '" + k + "'");
  return erros;
}`, explanation: 'O mypy reporta "Missing key" para TypedDict.' }
],
'pyt-06': [
  { id: 'pyt-06-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual estratégia acelerou 4 tarefas de cálculo puro em Python 3.14 com GIL ativo?', options: ['4 threads', '4 processos', 'asyncio.gather', 'Nenhuma'], answer: 1, explanation: 'Medido: threads 1,03x; processos 3,66x.' },
  { id: 'pyt-06-e2', type: 'tf', difficulty: 3, points: 10, prompt: 'No Python 3.14 para Linux, usar ProcessPoolExecutor sem a guarda if __name__ == "__main__" pode falhar com RuntimeError e duplicar a saída.', answer: true, explanation: 'O método de início padrão é forkserver, que reimporta o módulo principal.' },
  { id: 'pyt-06-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o resultado medido ao cenário.', pairs: [['5,04 s x 0,054 s', '100 tarefas de 50 ms: sequencial x gather'], ['101 ms x 2 ms', 'time.sleep no loop x to_thread'], ['13,12 s com 4 threads', 'CPU limitada pelo GIL'], ['0,27 s com 20 threads', '100 esperas de 50 ms (E/S)']], explanation: 'Experimentos da aula.' },
  { id: 'pyt-06-e4', type: 'code', difficulty: 2, points: 25, prompt: 'Implemente §tempoEs(modo, n, ms, limite)§, o tempo ideal de §n§ esperas de §ms§ milissegundos. §"sequencial"§ → §n * ms§. §"gather"§ → §Math.ceil(n / limite) * ms§, onde §limite§ é o máximo de tarefas simultâneas (use §Infinity§ para ilimitado; com §n§ = 0 devolva 0).', lang: 'javascript', starter: 'function tempoEs(modo, n, ms, limite) {\n  // seu código aqui\n}\n', hints: ['Trate n = 0.', 'Math.ceil(n / Infinity) = 0 para n > 0: use pelo menos 1 leva.'], tests: [{ name: 'modelo do curso', code: R`assert.equal(tempoEs('sequencial', 100, 50), 5000);
assert.equal(tempoEs('gather', 100, 50, Infinity), 50);
assert.equal(tempoEs('gather', 100, 50, 20), 250);` }, { name: 'bordas', code: R`assert.equal(tempoEs('gather', 0, 50, 10), 0);
assert.equal(tempoEs('gather', 21, 50, 20), 100);` }], solution: R`function tempoEs(modo, n, ms, limite) {
  if (n === 0) return 0;
  if (modo === 'sequencial') return n * ms;
  return Math.max(1, Math.ceil(n / limite)) * ms;
}`, explanation: 'O semáforo limita a concorrência e aumenta o número de levas.' },
  { id: 'pyt-06-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Como escolher entre asyncio, threads e processos em Python e quais cuidados ter com cada um?', model: 'asyncio para muita E/S concorrente em uma thread (medido: 100 esperas de 50 ms em 0,054 s), com bibliotecas assíncronas, timeouts, semáforos e sem bloquear o loop (to_thread para código bloqueante); threads para E/S com bibliotecas síncronas, pois o GIL é liberado na espera (medido: 0,27 s); processos para CPU, já que o GIL impede o ganho com threads (medido: 1,03x contra 3,66x), com guarda __main__, funções no nível do módulo, custo de iniciar e serializar dados; filas para tarefas longas.', rubric: ['asyncio para E/S', 'Threads para E/S bloqueante', 'Processos para CPU e o GIL', 'Cuidados (to_thread, __main__)'], explanation: 'Resumo da aula.' },
  { id: 'pyt-06-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §tempoCpu(modo, tarefas, trabalhadores, nucleos, t)§: tempo ideal de §tarefas§ tarefas de CPU de §t§ segundos cada. §"sequencial"§ e §"threads"§ (o GIL serializa o cálculo): §tarefas * t§. §"processos"§: §Math.ceil(tarefas / Math.min(trabalhadores, nucleos)) * t§.', lang: 'javascript', starter: 'function tempoCpu(modo, tarefas, trabalhadores, nucleos, t) {\n  // seu código aqui\n}\n', hints: ['Threads não ajudam em CPU.', 'Processos paralelizam até o número de núcleos.'], tests: [{ name: 'modelo', code: R`assert.equal(tempoCpu('sequencial', 4, 1, 8, 3.4), 13.6);
assert.equal(tempoCpu('threads', 4, 4, 8, 3.4), 13.6);
assert.equal(tempoCpu('processos', 4, 4, 8, 3.4), 3.4);` }, { name: 'limite de núcleos', code: R`assert.equal(tempoCpu('processos', 8, 8, 4, 2), 4);
assert.equal(tempoCpu('processos', 5, 2, 8, 1), 3);` }], solution: R`function tempoCpu(modo, tarefas, trabalhadores, nucleos, t) {
  if (modo === 'processos') return Math.ceil(tarefas / Math.min(trabalhadores, nucleos)) * t;
  return tarefas * t;
}`, explanation: 'Modelo ideal; o medido (13,12 s com threads; 3,69 s com 4 processos) soma sobrecargas.' }
]
};

const P = 'python-dev-p';
export const assessment = {
  id: 'python-dev', title: 'Avaliação final — Python para desenvolvedores', passPct: 70, minutes: 45,
  items: [
    { id: P + '1', type: 'mc', difficulty: 1, points: 10, prompt: 'Como evitar a armadilha do argumento padrão mutável?', options: ['Usar sempre listas', 'Usar None como padrão e criar a lista dentro da função', 'Usar is', 'Usar global'], answer: 1, explanation: 'Medido: [1] e depois [1, 2] com o padrão mutável; [1] e [2] corrigido.' },
    { id: P + '2', type: 'tf', difficulty: 2, points: 10, prompt: 'Para dinheiro, Decimal criado a partir de texto é preferível a float.', answer: true, explanation: '0.1 + 0.2 = 0.30000000000000004 com float; Decimal("0.1") + Decimal("0.2") = 0.3.' },
    { id: P + '3', type: 'trace', difficulty: 3, points: 10, prompt: 'Medições com 200 requisições, 20 simultâneas, 50 ms de espera.', code: 'async def + await asyncio.sleep: 261,0 req/s\ndef + time.sleep: 197,1 req/s\nasync def + time.sleep: 18,9 req/s', lang: 'text', steps: [{ q: 'Qual rota bloqueia o event loop?', answers: ['async def + time.sleep', 'async def com time.sleep', 'a terceira'] }, { q: 'Aproximadamente quantas vezes menor é a vazão dela que a da primeira (use um número inteiro)?', answers: ['14'] }], explanation: '261 / 18,9 ≈ 13,8.' },
    { id: P + '4', type: 'mc', difficulty: 3, points: 10, prompt: 'Qual abordagem acelera tarefas de CPU puras em Python com GIL ativo?', options: ['Mais threads', 'Mais processos', 'asyncio.gather', 'time.sleep'], answer: 1, explanation: 'Processos fogem do GIL (3,66x medido).' },
    { id: P + '5', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que expõe o script a injeção de comandos.', code: 'import subprocess\nentrada = input()\nsubprocess.run(f"convert {entrada} saida.png", shell=True)\nprint("ok")', answer: 3, explanation: 'shell=True com texto interpolado; use uma lista de argumentos e valide a entrada.' },
    { id: P + '6', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete a guarda que protege scripts que usam multiprocessing.', code: "if __name__ == [[0]]:\n    main()", answers: [["'__main__'", '"__main__"']], explanation: 'Obrigatória com forkserver, que reimporta o módulo principal.' },
    { id: P + '7', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a ferramenta ao uso.', pairs: [['mypy --strict', 'Verificação estática de tipos no CI'], ['Pydantic', 'Validação de dados externos em execução'], ['pytest + tmp_path', 'Testes com arquivos temporários'], ['uvicorn', 'Servidor ASGI para o FastAPI']], explanation: 'Ferramentas usadas no curso.' },
    { id: P + '8', type: 'mc', difficulty: 3, points: 10, prompt: 'O que o Python faz com as anotações de tipo ao executar o programa?', options: ['Verifica todas e lança TypeError', 'Não as verifica (são metadados)', 'Converte os valores', 'Recusa o arquivo'], answer: 1, explanation: 'Medido: x: int = "texto" executa; o mypy as verifica antes.' },
    { id: P + '9', type: 'tf', difficulty: 3, points: 10, prompt: 'No FastAPI, rotas def comuns são executadas em um pool de threads e não travam o event loop.', answer: true, explanation: 'Medido: 197 req/s com def + time.sleep, contra 18,9 com async def + time.sleep.' },
    { id: P + '10', type: 'mc', difficulty: 3, points: 10, prompt: 'Qual estrutura torna a verificação de pertencimento em 100.000 elementos ~10.000 vezes mais rápida que uma lista?', options: ['tuple', 'set', 'str', 'range'], answer: 1, explanation: 'Medido: in list 630 ms x in set 0,059 ms (200 buscas).' },
    { id: P + '11', type: 'open', difficulty: 3, points: 10, prompt: 'Projete um serviço Python de relatórios: estrutura, API, validação, tipos, concorrência, testes e operação.', model: 'Pacote com pyproject.toml, venv, dependências fixadas e src/ + tests/; API FastAPI com modelos Pydantic (limites e extra=forbid), response_model, dependências (autenticação, configuração validada) e OpenAPI conferido no CI; lógica em funções puras tipadas com mypy --strict e geradores para arquivos grandes; rotas async com await e to_thread para código bloqueante, CPU em processos (com guarda __main__) ou fila; testes pytest com TestClient, dependency_overrides, tmp_path e parametrize; logs estruturados com id de correlação, /saude, desligamento ordenado, medições e ADR.', rubric: ['Estrutura e dependências', 'FastAPI com Pydantic e dependências', 'Tipos e mypy', 'Concorrência correta', 'Testes e operação'], explanation: 'Resumo do projeto integrador.' },
    { id: P + '12', type: 'mc', difficulty: 3, points: 10, prompt: 'Qual o efeito de chamar time.sleep(0.1) dentro do event loop do asyncio?', options: ['Nenhum', 'Atrasa todas as demais tarefas em ~100 ms', 'Acelera o loop', 'Cancela as tarefas'], answer: 1, explanation: 'Medido: atraso do batimento de 101 ms contra 2 ms com to_thread.' }
  ]
};

export const project = {
  id: 'servico-python', name: 'Serviço Python de relatórios: FastAPI, Pydantic, tipos, concorrência correta, testes e medições', lv: 'M', stack: 'Python 3.14, FastAPI, Pydantic, uvicorn, pytest, mypy, httpx', ds: ['python'],
  desc: 'Construa um **serviço de relatórios** em **FastAPI**: **pacote com venv e dependências fixadas**, **modelos Pydantic** com limites e **response_model**, **dependências** de autenticação e configuração, **lógica em funções puras tipadas** (**mypy --strict**), **concorrência correta** (await, to_thread, processos para CPU), **testes pytest** (TestClient, dependency_overrides, tmp_path) e **medições** comparando com a versão Node.',
  rf: ['Pacote com pyproject.toml, venv, dependências fixadas, src/ e tests/', 'API FastAPI com modelos Pydantic (limites e extra=forbid), response_model e erros 422 tratados', 'Dependências de autenticação simulada e configuração por variáveis de ambiente validadas', 'Processamento de CSVs em funções puras tipadas, com geradores para arquivos grandes', 'Rotas async com await para E/S externa e to_thread para código bloqueante; CPU em processos com a guarda __main__ ou em fila', 'Testes pytest cobrindo 422, 401 e 404, com TestClient, dependency_overrides, tmp_path, parametrize e caplog', 'mypy --strict limpo e OpenAPI conferido no CI', 'Medições da vazão com e sem bloqueio do loop (cliente em outro processo), do ganho de processos sobre threads e comparação com a versão Node'],
  rnf: ['Nenhuma chamada bloqueante dentro de async def (medida pelo atraso do loop)', 'Nenhum segredo no repositório e dependências auditadas', 'README com comandos, medições, ADR e limitações', 'Logs estruturados com id de correlação, /saude e desligamento ordenado'],
  ac: ['O teste de atraso do loop falha se alguém introduzir time.sleep em async def', 'O mypy --strict passa e os testes ficam verdes no CI', 'O OpenAPI gerado traz limites e campos obrigatórios corretos', 'O ganho de processos em CPU é medido e documentado', 'O ADR justifica async x threads x processos e a validação'],
  ch: ['Adicionar SQLAlchemy e Alembic e medir o N+1', 'Servir com vários workers e comparar a vazão', 'Empacotar com Docker (usuário não root) e testar o desligamento ordenado', 'Testar com pytest-asyncio e httpx.AsyncClient', 'Experimentar o interpretador free-threaded em tarefas de CPU']
};
