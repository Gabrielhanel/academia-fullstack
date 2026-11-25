// Curso 4 — Exercícios por aula, avaliação final e projeto integrador.
// Testes e soluções em String.raw: sem template literals para não interpolar.
const R = String.raw;

export const exsets = {
'js-01': [
  { id: 'js-01-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual é o resultado de §"5" + 3§ em JavaScript?', options: ['8', '"53"', '2', 'NaN'], answer: 1, explanation: 'Com uma string de um dos lados, o + concatena: o 3 vira "3" e o resultado é "53". Já "5" - 3 dá 2, porque a subtração converte para número.' },
  { id: 'js-01-e2', type: 'match', difficulty: 2, points: 10, prompt: 'Associe cada expressão ao seu resultado.', pairs: [['0 || 10', '10'], ['0 ?? 10', '0'], ['"5" - 3', '2'], ['null == undefined', 'true']], explanation: '|| troca qualquer falsy (inclusive 0); ?? só troca null e undefined; a subtração converte para número; null == undefined é true na igualdade frouxa, mas false com ===.' },
  { id: 'js-01-e3', type: 'tf', difficulty: 1, points: 5, prompt: 'Declarar um array com const impede que você adicione elementos a ele com push.', answer: false, explanation: 'const impede reatribuir o nome a outro valor, não alterar o conteúdo do array.' },
  { id: 'js-01-e4', type: 'trace', difficulty: 2, points: 10, prompt: 'Rastreie o código e responda o que cada console.log imprime.', code: "const a = '10';\nconst b = 5;\nconsole.log(a + b);\nconsole.log(a * 2);\nconsole.log(a === 10);\nconsole.log(typeof (a - b));", lang: 'javascript', steps: [ { q: 'Saída da linha 3', answers: ['105', '"105"', "'105'"] }, { q: 'Saída da linha 4', answers: ['20'] }, { q: 'Saída da linha 5', answers: ['false'] }, { q: 'Saída da linha 6', answers: ['number', '"number"', "'number'"] } ], explanation: 'O + com string concatena ("105"); o * converte para número (20); === não converte, então "10" === 10 é false; a subtração dá o número 5, cujo typeof é "number".' },
  { id: 'js-01-e5', type: 'code', difficulty: 2, points: 20, prompt: 'Implemente §tipoReal(valor)§, que corrige as armadilhas do §typeof§: devolva §"null"§ para null, §"array"§ para arrays, §"nan"§ para NaN, §"date"§ para objetos Date e, nos demais casos, o resultado de §typeof§.', lang: 'javascript',
    starter: "function tipoReal(valor) {\n  // seu código aqui\n}\n",
    tests: [
      { name: 'primitivos comuns', code: R`assert.equal(tipoReal('x'), 'string'); assert.equal(tipoReal(3), 'number'); assert.equal(tipoReal(true), 'boolean'); assert.equal(tipoReal(undefined), 'undefined');` },
      { name: 'null e array', code: R`assert.equal(tipoReal(null), 'null'); assert.equal(tipoReal([]), 'array'); assert.equal(tipoReal([1, 2]), 'array');` },
      { name: 'NaN', code: R`assert.equal(tipoReal(NaN), 'nan'); assert.equal(tipoReal(0 / 0), 'nan'); assert.equal(tipoReal(Infinity), 'number');` },
      { name: 'datas e objetos', code: R`assert.equal(tipoReal(new Date(0)), 'date'); assert.equal(tipoReal({}), 'object');` },
      { name: 'funções e bigint', code: R`assert.equal(tipoReal(() => 1), 'function'); assert.equal(tipoReal(10n), 'bigint');` },
      { name: 'string "NaN" não é nan', code: R`assert.equal(tipoReal('NaN'), 'string');` }
    ],
    hints: ['Teste null com === null.', 'Use Array.isArray e instanceof Date.', 'Number.isNaN só é verdadeiro para o número NaN (não para a string "NaN").'],
    solution: R`function tipoReal(valor) {
  if (valor === null) return 'null';
  if (Array.isArray(valor)) return 'array';
  if (valor instanceof Date) return 'date';
  if (Number.isNaN(valor)) return 'nan';
  return typeof valor;
}`, explanation: 'Os casos especiais são tratados antes do typeof. Number.isNaN não converte o argumento, por isso "NaN" (string) não é confundido com o número NaN.' }
],
'js-02': [
  { id: 'js-02-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual laço é o mais adequado para percorrer os **valores** de um array?', options: ['for...in', 'for...of', 'while (true)', 'for (const chave in Object.keys(lista))'], answer: 1, explanation: 'for...of percorre os valores de um iterável. for...in percorre chaves de objetos e não é indicado para arrays.' },
  { id: 'js-02-e2', type: 'bug', difficulty: 1, points: 10, prompt: 'A função deveria devolver o dobro, mas §dobro(4)§ devolve §undefined§. Clique na linha com o problema.', code: "function dobro(n) {\n  const resultado = n * 2;\n  resultado;\n}", answer: 3, explanation: 'Sem a palavra return, a função devolve undefined. A linha 3 deveria ser return resultado;.' },
  { id: 'js-02-e3', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete para somar qualquer quantidade de argumentos e para achar o maior número de um array.', code: "function somar([[0]]numeros) {\n  return numeros.reduce((a, n) => a + n, 0);\n}\nconst maior = Math.max([[1]]lista);", answers: [['...'], ['...']], explanation: 'O ... no parâmetro (rest) reúne os argumentos em um array; o ... na chamada (spread) espalha o array como argumentos separados.' },
  { id: 'js-02-e4', type: 'trace', difficulty: 2, points: 10, prompt: 'Rastreie o laço.', code: "const saida = [];\nfor (let i = 1; i <= 10; i++) {\n  if (i % 3 === 0) continue;\n  if (i > 7) break;\n  saida.push(i);\n}\nconsole.log(saida.join(','));", lang: 'javascript', steps: [ { q: 'O que é impresso?', answers: ['1,2,4,5,7'] }, { q: 'Qual o valor de i quando o break acontece?', answers: ['8'] } ], explanation: 'Os múltiplos de 3 (3 e 6) são pulados pelo continue. Em i = 8, a condição i > 7 dispara o break. Ficam 1, 2, 4, 5 e 7.' },
  { id: 'js-02-e5', type: 'code', difficulty: 2, points: 20, prompt: 'Implemente §intervalo(inicio, fim, passo = 1)§, que devolve um array de números de §inicio§ (incluído) até §fim§ (excluído), avançando de §passo§ em §passo§. Com passo negativo, conta para baixo. Se o passo for 0, lance um erro. Se a direção não levar ao fim (ex.: §intervalo(5, 1)§), devolva §[]§.', lang: 'javascript',
    starter: "function intervalo(inicio, fim, passo = 1) {\n  // seu código aqui\n}\n",
    tests: [
      { name: 'contagem simples', code: R`assert.deepEqual(intervalo(0, 5), [0, 1, 2, 3, 4]);` },
      { name: 'com passo', code: R`assert.deepEqual(intervalo(1, 10, 3), [1, 4, 7]);` },
      { name: 'passo negativo', code: R`assert.deepEqual(intervalo(5, 0, -2), [5, 3, 1]);` },
      { name: 'direção errada devolve vazio', code: R`assert.deepEqual(intervalo(5, 1), []); assert.deepEqual(intervalo(1, 5, -1), []);` },
      { name: 'início igual ao fim', code: R`assert.deepEqual(intervalo(3, 3), []);` },
      { name: 'passo zero lança erro', code: R`assert.throws(() => intervalo(0, 5, 0));` }
    ],
    hints: ['Valide o passo antes de qualquer laço.', 'Com passo positivo, a condição é i < fim; com negativo, i > fim.', 'Um único for com a condição escolhida pelo sinal resolve.'],
    solution: R`function intervalo(inicio, fim, passo = 1) {
  if (passo === 0) throw new RangeError('passo não pode ser 0');
  const saida = [];
  const continuar = passo > 0 ? (i) => i < fim : (i) => i > fim;
  for (let i = inicio; continuar(i); i += passo) saida.push(i);
  return saida;
}`, explanation: 'Validar o passo zero evita um laço infinito. A condição de parada depende do sinal do passo; se a direção estiver errada, a condição é falsa logo de início e o array fica vazio.' }
],
'js-03': [
  { id: 'js-03-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual é o resultado de §[10, 2, 1].sort()§?', options: ['[1, 2, 10]', '[1, 10, 2]', '[10, 2, 1]', '[2, 1, 10]'], answer: 1, explanation: 'Sem comparador, sort compara como texto: "1" < "10" < "2". Para números use sort((a, b) => a - b). Além disso, sort altera o array original.' },
  { id: 'js-03-e2', type: 'trace', difficulty: 2, points: 10, prompt: 'Rastreie o encadeamento.', code: "const nums = [1, 2, 3, 4, 5, 6];\nconst r = nums\n  .filter((n) => n % 2 === 0)\n  .map((n) => n * 10)\n  .reduce((soma, n) => soma + n, 0);\nconsole.log(r, nums.length);", lang: 'javascript', steps: [ { q: 'Resultado do filter', answers: ['[2,4,6]', '[2, 4, 6]', '2,4,6'] }, { q: 'Valor final de r', answers: ['120'] }, { q: 'nums.length depois do encadeamento', answers: ['6'] } ], explanation: 'filter mantém os pares [2, 4, 6]; map multiplica por 10 [20, 40, 60]; reduce soma 120. Nenhum desses métodos altera o array original.' },
  { id: 'js-03-e3', type: 'bug', difficulty: 2, points: 10, prompt: 'A função deveria devolver uma lista com o novo item **sem alterar** a original, mas a original também muda. Clique na linha que causa isso.', code: "function adicionar(lista, item) {\n  const nova = lista;\n  nova.push(item);\n  return nova;\n}", answer: 2, explanation: 'const nova = lista não copia: as duas variáveis apontam para o mesmo array. O correto é const nova = [...lista, item] (ou lista.concat(item)).' },
  { id: 'js-03-e4', type: 'match', difficulty: 1, points: 10, prompt: 'Associe a necessidade ao método.', pairs: [['Transformar cada elemento', 'map'], ['Manter só os que satisfazem a condição', 'filter'], ['Achar o primeiro que satisfaz', 'find'], ['Verificar se todos satisfazem', 'every']], explanation: 'São os métodos funcionais mais usados e não alteram o array original.' },
  { id: 'js-03-e5', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §agruparPor(lista, chave)§, que agrupa os elementos em um objeto. §chave§ pode ser o **nome de uma propriedade** (string) ou uma **função** que recebe o elemento e devolve a chave do grupo. A ordem dos elementos dentro de cada grupo é a da lista. A lista original não pode ser alterada.', lang: 'javascript',
    starter: "function agruparPor(lista, chave) {\n  // seu código aqui\n}\n",
    tests: [
      { name: 'por propriedade', code: R`const r = agruparPor([{ t: 'a', v: 1 }, { t: 'b', v: 2 }, { t: 'a', v: 3 }], 't');
assert.deepEqual(r, { a: [{ t: 'a', v: 1 }, { t: 'a', v: 3 }], b: [{ t: 'b', v: 2 }] });` },
      { name: 'por função', code: R`assert.deepEqual(agruparPor([1, 2, 3, 4, 5], (n) => (n % 2 === 0 ? 'par' : 'impar')), { impar: [1, 3, 5], par: [2, 4] });` },
      { name: 'lista vazia', code: R`assert.deepEqual(agruparPor([], 'x'), {});` },
      { name: 'não altera a entrada', code: R`const l = [{ c: 'x' }, { c: 'y' }]; const copia = JSON.stringify(l);
agruparPor(l, 'c'); assert.equal(JSON.stringify(l), copia);` },
      { name: 'chaves numéricas viram texto', code: R`assert.deepEqual(agruparPor(['aa', 'b', 'cc'], (s) => s.length), { 1: ['b'], 2: ['aa', 'cc'] });` },
      { name: 'grandes listas em tempo linear', code: R`const l = Array.from({ length: 200000 }, (_, i) => ({ g: i % 10 }));
const t = Date.now(); const r = agruparPor(l, 'g');
assert.equal(r[3].length, 20000); assert.ok(Date.now() - t < 1000, 'lento: ' + (Date.now() - t) + ' ms');` }
    ],
    hints: ['Transforme a chave em função: se for string, use (x) => x[chave].', 'Percorra a lista uma vez, criando o grupo quando ainda não existir.', 'Evite reduce com spread a cada volta ({ ...acc }): isso fica quadrático.'],
    solution: R`function agruparPor(lista, chave) {
  const obterChave = typeof chave === 'function' ? chave : (x) => x[chave];
  const grupos = {};
  for (const item of lista) {
    const k = obterChave(item);
    (grupos[k] ||= []).push(item);
  }
  return grupos;
}`, explanation: 'Normalizar a chave para uma função simplifica o resto. Um único laço preenche os grupos em tempo linear; ||= cria o array do grupo na primeira vez. Os elementos não são copiados nem alterados.' },
  { id: 'js-03-e6', type: 'tf', difficulty: 2, points: 5, prompt: '§const copia = { ...original }§ cria uma cópia independente inclusive dos objetos aninhados dentro de original.', answer: false, explanation: 'O spread faz cópia rasa: objetos aninhados continuam compartilhados. Para cópia profunda, use structuredClone.' }
],
'js-04': [
  { id: 'js-04-e1', type: 'trace', difficulty: 2, points: 10, prompt: 'Rastreie os closures.', code: "function criar() {\n  let n = 0;\n  return () => ++n;\n}\nconst a = criar();\nconst b = criar();\na(); a();\nconsole.log(a(), b());", lang: 'javascript', steps: [ { q: 'Valor impresso por a()', answers: ['3'] }, { q: 'Valor impresso por b()', answers: ['1'] } ], explanation: 'Cada chamada de criar cria um n novo. a já foi chamado duas vezes, então a terceira devolve 3; b tem o seu próprio n e devolve 1.' },
  { id: 'js-04-e2', type: 'mc', difficulty: 2, points: 10, prompt: 'O que este código imprime? §for (var i = 0; i < 3; i++) setTimeout(() => console.log(i), 0);§', options: ['0 1 2', '3 3 3', '0 0 0', 'Nada: lança erro'], answer: 1, explanation: 'Com var existe uma única variável i, compartilhada pelos três closures. Quando os timers rodam, o laço já terminou e i vale 3. Com let, cada volta tem a sua variável e o resultado seria 0 1 2.' },
  { id: 'js-04-e3', type: 'bug', difficulty: 3, points: 10, prompt: 'Ao clicar no botão, aparece undefined em vez de "Ana". O método §mostrar§ usa §this.nome§. Clique na linha que perde o this.', code: "const perfil = {\n  nome: 'Ana',\n  mostrar() { console.log(this.nome); }\n};\nbotao.addEventListener('click', perfil.mostrar);\nsetTimeout(() => perfil.mostrar(), 0);", answer: 5, explanation: 'Ao passar perfil.mostrar como callback, o método é separado do objeto: no tratador, this passa a ser o botão, que não tem nome. Use perfil.mostrar.bind(perfil) ou () => perfil.mostrar(). A linha 6 está correta: a arrow chama o método a partir do objeto.' },
  { id: 'js-04-e4', type: 'tf', difficulty: 1, points: 5, prompt: 'O bloco finally é executado mesmo quando o try termina com um return.', answer: true, explanation: 'O finally roda sempre ao final do try/catch, seja por término normal, return ou exceção.' },
  { id: 'js-04-e5', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §memoizar(fn)§, que devolve uma nova função com o mesmo comportamento de §fn§, mas que guarda os resultados: chamadas com os mesmos argumentos (comparados por §JSON.stringify§ da lista de argumentos) não chamam §fn§ de novo. Se §fn§ lançar um erro, nada é guardado e o erro é repassado.', lang: 'javascript',
    starter: "function memoizar(fn) {\n  // seu código aqui\n}\n",
    tests: [
      { name: 'devolve o mesmo resultado', code: R`const dobro = memoizar((n) => n * 2);
assert.equal(dobro(4), 8); assert.equal(dobro(4), 8);` },
      { name: 'não chama de novo com os mesmos argumentos', code: R`let chamadas = 0;
const f = memoizar((a, b) => { chamadas++; return a + b; });
f(1, 2); f(1, 2); f(2, 1);
assert.equal(chamadas, 2);` },
      { name: 'cada função memoizada tem o seu cache', code: R`let c1 = 0, c2 = 0;
const f = memoizar((n) => { c1++; return n; });
const g = memoizar((n) => { c2++; return n; });
f(1); g(1); f(1); g(1);
assert.equal(c1, 1); assert.equal(c2, 1);` },
      { name: 'erros não são guardados', code: R`let n = 0;
const f = memoizar((x) => { n++; if (n === 1) throw new Error('falhou'); return x; });
assert.throws(() => f(5), 'falhou');
assert.equal(f(5), 5);
assert.equal(n, 2);` },
      { name: 'acelera uma recursão cara', code: R`let fib;
fib = memoizar((n) => (n < 2 ? n : fib(n - 1) + fib(n - 2)));
const t = Date.now();
assert.equal(fib(70), 190392490709135);
assert.ok(Date.now() - t < 500);` },
      { name: 'guarda também o resultado undefined', code: R`let n = 0;
const f = memoizar(() => { n++; return undefined; });
f(); f();
assert.equal(n, 1);` }
    ],
    hints: ['Use um Map dentro do closure, com a chave JSON.stringify(args).', 'Teste a existência com cache.has(chave), não com o valor (que pode ser undefined).', 'Só grave no cache depois que fn devolver sem lançar.'],
    solution: R`function memoizar(fn) {
  const cache = new Map();
  return function (...args) {
    const chave = JSON.stringify(args);
    if (cache.has(chave)) return cache.get(chave);
    const valor = fn.apply(this, args);
    cache.set(chave, valor);
    return valor;
  };
}`, explanation: 'O Map vive no closure e é exclusivo de cada função memoizada. has distingue "não calculado" de "resultado undefined". Se fn lançar, a linha do set não é alcançada e o erro segue para quem chamou.' },
  { id: 'js-04-e6', type: 'open', difficulty: 2, points: 10, prompt: 'Explique, com suas palavras e um exemplo, o que é um closure e dê um uso prático.', model: 'Um closure é uma função que mantém acesso às variáveis do escopo onde foi criada, mesmo depois que a função externa terminou. Exemplo: function criarContador() { let n = 0; return () => ++n; }. A função devolvida lembra de n, e cada contador criado tem o seu. Usos: estado privado (ninguém de fora altera n), fábricas de funções (criarSomador(5)), memoização e callbacks/handlers que lembram dados do momento em que foram criados.', rubric: ['Define closure como função que acessa variáveis do escopo onde foi criada', 'Diz que esse acesso continua depois que a função externa terminou', 'Apresenta um exemplo de código correto', 'Cita um uso prático (estado privado, fábrica, memoização, callbacks)'], explanation: 'Compare com o modelo e marque os critérios atendidos.' }
],
'js-05': [
  { id: 'js-05-e1', type: 'trace', difficulty: 2, points: 15, prompt: 'Indique a ordem em que as mensagens aparecem.', code: "console.log('A');\nsetTimeout(() => console.log('B'), 0);\nPromise.resolve().then(() => console.log('C'));\nconsole.log('D');", lang: 'javascript', steps: [ { q: 'Primeira mensagem', answers: ['A'] }, { q: 'Segunda mensagem', answers: ['D'] }, { q: 'Terceira mensagem', answers: ['C'] }, { q: 'Quarta mensagem', answers: ['B'] } ], explanation: 'O código síncrono roda até o fim (A, D). Depois, a fila de microtarefas, que contém o then, é esvaziada (C). Só então a próxima tarefa, o timer, é executada (B).' },
  { id: 'js-05-e2', type: 'mc', difficulty: 2, points: 10, prompt: 'Uma chamada §await fetch(url)§ recebe uma resposta 404. O que acontece?', options: ['A promise rejeita e o catch é executado', 'A promise resolve normalmente; é preciso verificar resposta.ok', 'O navegador tenta de novo automaticamente', 'O fetch devolve null'], answer: 1, explanation: 'fetch só rejeita em falhas de rede. Respostas HTTP de erro resolvem normalmente, com resposta.ok igual a false.' },
  { id: 'js-05-e3', type: 'bug', difficulty: 3, points: 10, prompt: 'A função deveria esperar todos os envios terminarem antes de retornar "pronto", mas retorna antes. Clique na linha responsável.', code: "async function enviarTodos(itens) {\n  itens.forEach(async (item) => {\n    await enviar(item);\n  });\n  return 'pronto';\n}", answer: 2, explanation: 'forEach não espera callbacks async. Use for (const item of itens) await enviar(item); (em série) ou await Promise.all(itens.map(enviar)); (em paralelo).' },
  { id: 'js-05-e4', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o método ao seu comportamento.', pairs: [['Promise.all', 'Espera todas; rejeita assim que alguma rejeitar'], ['Promise.allSettled', 'Espera todas, com sucesso ou falha, e informa o resultado de cada uma'], ['Promise.race', 'Acompanha a primeira que terminar, com sucesso ou falha'], ['Promise.any', 'Resolve com a primeira que cumprir; rejeita só se todas falharem']], explanation: 'Escolha conforme o que importa: todas obrigatórias (all), relatório completo (allSettled), a mais rápida (race) ou qualquer sucesso (any).' },
  { id: 'js-05-e5', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §comRetry(fn, tentativas, esperaMs = 0)§. §fn§ é uma função assíncrona (devolve uma Promise). Chame §fn§ e, se a promise rejeitar, tente de novo, até o total de §tentativas§ chamadas, esperando §esperaMs§ entre elas. Resolva com o primeiro sucesso; se todas falharem, rejeite com o **último** erro. Se §tentativas§ não for um inteiro ≥ 1, rejeite com um erro.', lang: 'javascript',
    starter: "async function comRetry(fn, tentativas, esperaMs = 0) {\n  // seu código aqui\n}\n",
    tests: [
      { name: 'sucesso na primeira', code: R`let n = 0;
assert.equal(await comRetry(async () => { n++; return 'ok'; }, 3), 'ok');
assert.equal(n, 1);` },
      { name: 'sucesso depois de falhas', code: R`let n = 0;
const r = await comRetry(async () => { n++; if (n < 3) throw new Error('falha ' + n); return 'ok ' + n; }, 5);
assert.equal(r, 'ok 3'); assert.equal(n, 3);` },
      { name: 'rejeita com o último erro', code: R`let n = 0;
await assert.rejects(comRetry(async () => { n++; throw new Error('erro ' + n); }, 3), 'erro 3');
assert.equal(n, 3);` },
      { name: 'respeita a espera entre tentativas', code: R`let n = 0; const t = Date.now();
await comRetry(async () => { n++; if (n < 3) throw new Error('x'); return 1; }, 3, 40);
assert.ok(Date.now() - t >= 75, 'esperou ' + (Date.now() - t) + ' ms');` },
      { name: 'tentativas inválidas', code: R`await assert.rejects(comRetry(async () => 1, 0));
await assert.rejects(comRetry(async () => 1, 1.5));` },
      { name: 'erro síncrono dentro de fn também conta como falha', code: R`let n = 0;
const r = await comRetry(() => { n++; if (n === 1) throw new Error('sync'); return Promise.resolve('ok'); }, 2);
assert.equal(r, 'ok');` }
    ],
    hints: ['Um laço for de 1 até tentativas com try/catch e await fn() resolve.', 'Guarde o erro do catch em uma variável e lance-o depois do laço.', 'Para esperar: await new Promise((r) => setTimeout(r, esperaMs)), só entre as tentativas.'],
    solution: R`async function comRetry(fn, tentativas, esperaMs = 0) {
  if (!Number.isInteger(tentativas) || tentativas < 1) throw new RangeError('tentativas deve ser um inteiro >= 1');
  let ultimo;
  for (let i = 1; i <= tentativas; i++) {
    try {
      return await fn();
    } catch (erro) {
      ultimo = erro;
      if (i < tentativas && esperaMs > 0) await new Promise((r) => setTimeout(r, esperaMs));
    }
  }
  throw ultimo;
}`, explanation: 'Dentro de uma função async, lançar vira rejeição. O return await dentro do try faz com que rejeições (e erros síncronos de fn) caiam no catch. A espera acontece só entre tentativas, e o último erro é relançado no fim.' },
  { id: 'js-05-e6', type: 'open', difficulty: 2, points: 10, prompt: 'Uma página precisa buscar, ao abrir, os dados do usuário, a lista de produtos e as notificações. Hoje faz isso com três awaits seguidos. Explique se vale mudar, como e o que acontece se uma das chamadas falhar.', model: 'As três buscas são independentes, então rodar em série soma os tempos sem necessidade. Vale disparar as três ao mesmo tempo e aguardar com Promise.all([buscarUsuario(), buscarProdutos(), buscarNotificacoes()]): o tempo total vira o da mais lenta. Com Promise.all, se uma falhar o conjunto rejeita imediatamente; se as notificações forem opcionais, use Promise.allSettled para mostrar o que deu certo e tratar as falhas individualmente. Em ambos os casos, trate os erros com try/catch e verifique resposta.ok de cada fetch.', rubric: ['Identifica que as chamadas são independentes e que em série os tempos se somam', 'Propõe Promise.all (paralelo)', 'Explica que o Promise.all rejeita se uma falhar', 'Propõe allSettled ou tratamento individual quando alguma parte é opcional', 'Menciona tratar erros (try/catch, resposta.ok)'], explanation: 'Compare com o modelo e marque os critérios atendidos.' }
],
'js-06': [
  { id: 'js-06-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Você vai exibir na página o nome que o usuário digitou em um formulário. Qual é a forma segura?', options: ['elemento.innerHTML = nome', 'elemento.textContent = nome', 'document.write(nome)', 'elemento.outerHTML = nome'], answer: 1, explanation: 'textContent trata o valor como texto puro. As outras opções interpretam o valor como HTML, permitindo XSS se o nome contiver tags.' },
  { id: 'js-06-e2', type: 'bug', difficulty: 2, points: 10, prompt: 'O código abaixo exibe comentários vindos de uma API. Clique na linha que abre uma brecha de XSS.', code: "const lista = document.querySelector('#comentarios');\nfor (const c of comentarios) {\n  const li = document.createElement('li');\n  li.innerHTML = '<b>' + c.autor + '</b>: ' + c.texto;\n  lista.append(li);\n}", answer: 4, explanation: 'c.autor e c.texto vêm de fora e são inseridos como HTML. Crie um <b> com textContent para o autor e um nó de texto para o comentário, ou escape os valores antes.' },
  { id: 'js-06-e3', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete para tratar o envio do formulário sem recarregar a página.', code: "form.[[0]]('submit', (e) => {\n  e.[[1]]();\n  const dados = new FormData(form);\n  salvar(dados);\n});", answers: [['addEventListener'], ['preventDefault']], explanation: 'addEventListener registra o tratador; preventDefault impede o envio padrão (e o recarregamento da página).' },
  { id: 'js-06-e4', type: 'tf', difficulty: 2, points: 5, prompt: 'Com delegação de eventos (um tratador na lista que usa e.target.closest("li")), itens adicionados à lista depois do registro também são atendidos.', answer: true, explanation: 'O evento sobe do item até a lista (bubbling), onde está o tratador. Não importa quando o item foi criado.' },
  { id: 'js-06-e5', type: 'code', difficulty: 2, points: 20, prompt: 'Implemente §escaparHtml(texto)§, que troca §&§, §<§, §>§, §"§ e §\'§ por §&amp;§, §&lt;§, §&gt;§, §&quot;§ e §&#39;§, e §listaHtml(itens)§, que devolve §"<ul>"§ + um §<li>§ por item (cada um escapado) + §"</ul>"§. Valores que não são string devem ser convertidos com §String()§.', lang: 'javascript',
    starter: "function escaparHtml(texto) {\n  // seu código aqui\n}\n\nfunction listaHtml(itens) {\n  // seu código aqui\n}\n",
    tests: [
      { name: 'escapa os cinco caracteres', code: R`assert.equal(escaparHtml('<a href="x">' + "it's" + ' & </a>'), '&lt;a href=&quot;x&quot;&gt;it&#39;s &amp; &lt;/a&gt;');` },
      { name: 'não escapa duas vezes o &', code: R`assert.equal(escaparHtml('&lt;'), '&amp;lt;');` },
      { name: 'texto comum não muda', code: R`assert.equal(escaparHtml('Olá, mundo'), 'Olá, mundo');` },
      { name: 'converte não-strings', code: R`assert.equal(escaparHtml(42), '42'); assert.equal(escaparHtml(null), 'null');` },
      { name: 'lista escapada', code: R`assert.equal(listaHtml(['a', '<img src=x onerror=alert(1)>']), '<ul><li>a</li><li>&lt;img src=x onerror=alert(1)&gt;</li></ul>');` },
      { name: 'lista vazia', code: R`assert.equal(listaHtml([]), '<ul></ul>');` }
    ],
    hints: ['Um replace com /[&<>"\']/g e um objeto de mapeamento faz tudo em uma passada.', 'Fazer replaces encadeados funciona se o & vier primeiro; em uma passada só, a ordem não importa.', 'listaHtml: map com escaparHtml e join("").'],
    solution: R`const MAPA_HTML = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
function escaparHtml(texto) {
  return String(texto).replace(/[&<>"']/g, (c) => MAPA_HTML[c]);
}
function listaHtml(itens) {
  return '<ul>' + itens.map((i) => '<li>' + escaparHtml(i) + '</li>').join('') + '</ul>';
}`, explanation: 'A substituição em uma única passada evita escapar o & que acabou de ser inserido. listaHtml só monta tags fixas e escapa todo o conteúdo variável: é o mesmo princípio que torna o textContent seguro.' },
  { id: 'js-06-e6', type: 'open', difficulty: 2, points: 10, prompt: 'Uma lista tem 500 itens, cada um com um botão "Excluir", e itens novos são adicionados o tempo todo. Hoje o código registra um tratador de clique em cada botão. Proponha uma solução melhor e explique por que funciona.', model: 'Usar delegação de eventos: registrar um único tratador de clique no elemento da lista (ul). No tratador, usar e.target.closest("button") para descobrir se o clique foi em um botão Excluir e closest("li") para achar o item a remover. Funciona porque o evento de clique sobe (bubbling) do botão até a lista. Vantagens: um tratador em vez de 500 (menos memória e trabalho), e itens criados depois funcionam sem registrar nada novo. Os botões continuam sendo <button>, acessíveis pelo teclado.', rubric: ['Propõe um único tratador no elemento pai (delegação)', 'Explica que funciona porque o evento sobe (bubbling)', 'Usa e.target (ou closest) para identificar o botão/item', 'Cita a vantagem para itens criados depois e/ou desempenho'], explanation: 'Compare com o modelo e marque os critérios atendidos.' }
],
'js-07': [
  { id: 'js-07-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'O arquivo §formatar.js§ tem §export default function formatar() {}§ e §export const MOEDA = "BRL"§. Qual import está correto?', options: ['import { formatar, MOEDA } from "./formatar.js";', 'import formatar, { MOEDA } from "./formatar.js";', 'import * from "./formatar.js";', 'const formatar = import("./formatar.js").default;'], answer: 1, explanation: 'A exportação padrão é importada sem chaves (com o nome que você escolher), e as nomeadas entre chaves. import() é dinâmico e devolve uma Promise.' },
  { id: 'js-07-e2', type: 'match', difficulty: 2, points: 10, prompt: 'Associe cada recurso ao que ele faz.', pairs: [['<script type="module">', 'Ativa o modo de módulo: escopo próprio e modo estrito'], ['import()', 'Carrega um módulo sob demanda e devolve uma Promise'], ['package-lock.json', 'Registra as versões exatas das dependências instaladas'], ['node --test', 'Executa os testes com o executor embutido do Node.js']], explanation: 'Esses quatro recursos aparecem em quase todo projeto moderno de JavaScript.' },
  { id: 'js-07-e3', type: 'bug', difficulty: 2, points: 10, prompt: 'No navegador, sem ferramenta de build, a página dá erro ao carregar o módulo. Clique na linha com o caminho inválido.', code: "<script type=\"module\">\n  import { iniciar } from './app.js';\n  import { formatar } from 'utils/formatar';\n  iniciar(formatar);\n</script>", answer: 3, explanation: 'Sem bundler, o navegador exige caminhos relativos com ./ (ou ../ ou /) e com a extensão: "./utils/formatar.js".' },
  { id: 'js-07-e4', type: 'tf', difficulty: 1, points: 5, prompt: 'Uma variável declarada no nível superior de um módulo fica automaticamente disponível como global para os outros scripts da página.', answer: false, explanation: 'Módulos têm escopo próprio: o que não é exportado fica restrito ao módulo.' },
  { id: 'js-07-e5', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §ordemDeCarga(mapa, raiz)§. §mapa§ associa cada módulo à lista dos módulos que ele importa. Devolva a ordem em que os módulos devem ser executados a partir de §raiz§: cada módulo só depois de todas as suas dependências, cada um uma única vez, e as dependências na ordem em que aparecem na lista. Lance um erro contendo a palavra "circular" se houver ciclo, e um erro contendo "não encontrado" se algum módulo não existir no mapa.', lang: 'javascript',
    starter: "function ordemDeCarga(mapa, raiz) {\n  // seu código aqui\n}\n",
    tests: [
      { name: 'ordem com dependência compartilhada', code: R`const mapa = { 'main.js': ['ui.js', 'api.js'], 'ui.js': ['util.js'], 'api.js': ['util.js'], 'util.js': [] };
assert.deepEqual(ordemDeCarga(mapa, 'main.js'), ['util.js', 'ui.js', 'api.js', 'main.js']);` },
      { name: 'só o que é alcançável a partir da raiz', code: R`const mapa = { a: ['b'], b: [], c: ['a'] };
assert.deepEqual(ordemDeCarga(mapa, 'a'), ['b', 'a']);` },
      { name: 'módulo sem dependências', code: R`assert.deepEqual(ordemDeCarga({ x: [] }, 'x'), ['x']);` },
      { name: 'ciclo', code: R`assert.throws(() => ordemDeCarga({ a: ['b'], b: ['c'], c: ['a'] }, 'a'), 'circular');` },
      { name: 'auto-importação é ciclo', code: R`assert.throws(() => ordemDeCarga({ a: ['a'] }, 'a'), 'circular');` },
      { name: 'módulo inexistente', code: R`assert.throws(() => ordemDeCarga({ a: ['b'] }, 'a'), 'não encontrado');
assert.throws(() => ordemDeCarga({}, 'z'), 'não encontrado');` },
      { name: 'diamante grande sem repetir', code: R`const mapa = { raiz: [] };
for (let i = 0; i < 2000; i++) { mapa.raiz.push('m' + i); mapa['m' + i] = ['base']; }
mapa.base = [];
const r = ordemDeCarga(mapa, 'raiz');
assert.equal(r.length, 2002); assert.equal(r[0], 'base'); assert.equal(r[r.length - 1], 'raiz');` }
    ],
    hints: ['É uma busca em profundidade: visite as dependências antes de adicionar o módulo à saída.', 'Use dois conjuntos: "pronto" (já na saída) e "em andamento" (na pilha atual).', 'Encontrar um módulo "em andamento" significa ciclo.'],
    solution: R`function ordemDeCarga(mapa, raiz) {
  const pronto = new Set();
  const emAndamento = new Set();
  const saida = [];
  function visitar(m) {
    if (!Object.prototype.hasOwnProperty.call(mapa, m)) throw new Error('módulo não encontrado: ' + m);
    if (pronto.has(m)) return;
    if (emAndamento.has(m)) throw new Error('dependência circular em ' + m);
    emAndamento.add(m);
    for (const d of mapa[m]) visitar(d);
    emAndamento.delete(m);
    pronto.add(m);
    saida.push(m);
  }
  visitar(raiz);
  return saida;
}`, explanation: 'É uma ordenação topológica por busca em profundidade. O módulo entra na saída só depois das dependências (pós-ordem). O conjunto "em andamento" representa o caminho atual: reencontrar um módulo nele é um ciclo. "pronto" garante que cada módulo apareça uma única vez.' }
]
};

export const assessment = {
  id: 'javascript-fundamentos', title: 'Avaliação final — JavaScript: fundamentos, DOM e módulos', passPct: 70, minutes: 45,
  items: [
    { id: 'js-av-01', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual comparação devolve §true§?', options: ['0 === "0"', 'null === undefined', 'NaN === NaN', '"abc" === "abc"'], answer: 3, explanation: '=== não converte tipos; NaN não é igual a nada. Duas strings iguais são estritamente iguais.' },
    { id: 'js-av-02', type: 'trace', difficulty: 2, points: 10, prompt: 'Rastreie.', code: "const config = { limite: 0, nome: '' };\nconsole.log(config.limite || 50);\nconsole.log(config.limite ?? 50);\nconsole.log(config.usuario?.email);", lang: 'javascript', steps: [ { q: 'Linha 2', answers: ['50'] }, { q: 'Linha 3', answers: ['0'] }, { q: 'Linha 4', answers: ['undefined'] } ], explanation: '|| troca o 0 (falsy) por 50; ?? só troca null/undefined, então mantém 0; ?. devolve undefined em vez de lançar erro.' },
    { id: 'js-av-03', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual expressão devolve a soma dos preços dos itens com §ativo: true§?', options: ['itens.map(i => i.ativo).reduce((s, i) => s + i.preco)', 'itens.filter(i => i.ativo).reduce((s, i) => s + i.preco, 0)', 'itens.find(i => i.ativo).preco', 'itens.every(i => i.ativo && i.preco)'], answer: 1, explanation: 'filter mantém os ativos e reduce, com valor inicial 0, soma os preços (funciona até com lista vazia).' },
    { id: 'js-av-04', type: 'bug', difficulty: 2, points: 10, prompt: 'A função devolve a lista ordenada, mas também bagunça a lista original de quem chamou. Clique na linha responsável.', code: "function ordenarPorPreco(produtos) {\n  return produtos.sort((a, b) => a.preco - b.preco);\n}", answer: 2, explanation: 'sort altera o array original. Copie antes: [...produtos].sort(...) ou produtos.toSorted(...).' },
    { id: 'js-av-05', type: 'tf', difficulty: 2, points: 5, prompt: 'Arrow functions têm o seu próprio this, definido no momento da chamada.', answer: false, explanation: 'Arrow functions não têm this próprio: usam o this do local onde foram criadas.' },
    { id: 'js-av-06', type: 'trace', difficulty: 3, points: 15, prompt: 'Em que ordem as mensagens aparecem?', code: "setTimeout(() => console.log('1'), 0);\n(async () => {\n  console.log('2');\n  await null;\n  console.log('3');\n})();\nPromise.resolve().then(() => console.log('4'));\nconsole.log('5');", lang: 'javascript', steps: [ { q: 'Ordem completa, separada por vírgulas', answers: ['2,5,3,4,1', '2, 5, 3, 4, 1'] } ], explanation: 'A função async roda de forma síncrona até o primeiro await (2), e o código segue (5). Depois as microtarefas, na ordem em que foram agendadas: a continuação do await (3) e o then (4). Por último o timer (1).' },
    { id: 'js-av-07', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual código trata corretamente uma resposta HTTP de erro?', options: ['const r = await fetch(url); return r.json();', 'const r = await fetch(url); if (!r.ok) throw new Error("HTTP " + r.status); return r.json();', 'try { await fetch(url) } catch { /* 404 cai aqui */ }', 'fetch(url).then(r => r.json()).catch(() => {})'], answer: 1, explanation: 'fetch resolve em 404 e 500; é preciso verificar r.ok. Engolir o erro com catch vazio também esconde falhas.' },
    { id: 'js-av-08', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete a delegação de eventos que remove o item clicado.', code: "lista.addEventListener('click', (e) => {\n  const botao = e.[[0]].closest('button');\n  if (botao) botao.[[1]]('li').remove();\n});", answers: [['target'], ['closest']], explanation: 'e.target é o elemento clicado; closest sobe até o ancestral que casa com o seletor.' },
    { id: 'js-av-09', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual opção evita XSS ao exibir um comentário vindo de uma API?', options: ['div.innerHTML = comentario', 'div.textContent = comentario', 'div.innerHTML = "<p>" + comentario + "</p>"', 'div.insertAdjacentHTML("beforeend", comentario)'], answer: 1, explanation: 'Apenas textContent trata o valor como texto puro. As outras interpretam o conteúdo como HTML.' },
    { id: 'js-av-10', type: 'match', difficulty: 2, points: 10, prompt: 'Associe cada linha de import ao que ela importa de um módulo.', pairs: [['import x from "./m.js"', 'A exportação padrão, com o nome x'], ['import { x } from "./m.js"', 'A exportação nomeada x'], ['import * as m from "./m.js"', 'Todas as exportações, em um objeto m'], ['await import("./m.js")', 'O módulo carregado sob demanda']], explanation: 'São as quatro formas de importar mais comuns em módulos ES.' },
    { id: 'js-av-11', type: 'open', difficulty: 3, points: 15, prompt: 'Você recebeu um arquivo de 800 linhas que mistura cálculo de frete, chamadas à API e manipulação do DOM, sem nenhum teste. Descreva como reorganizaria o código em módulos e como passaria a testá-lo.', model: 'Separar por responsabilidade: (1) um módulo de regras puras (frete.js: calcularFrete(peso, distancia)) sem DOM nem rede; (2) um módulo de acesso à API (api.js) com fetch, tratamento de erro e verificação de ok; (3) um módulo de interface (ui.js) com querySelector, eventos (delegação) e textContent; (4) um main.js que junta tudo. Usar exportações nomeadas e evitar dependências circulares. Começar os testes pelas funções puras, com node --test e assert: casos normais, limites e erros. Fazer a mudança aos poucos, mantendo o comportamento (refatorar com testes), e automatizar lint e formatação.', rubric: ['Separa lógica pura, rede e interface em módulos diferentes', 'Usa import/export (preferência por exportações nomeadas) e um ponto de entrada', 'Propõe testar primeiro as funções puras, com casos normais, limites e erros', 'Cita uma ferramenta de teste (node --test, assert) ou automação', 'Menciona refatorar em passos pequenos preservando o comportamento'], explanation: 'Compare com o modelo e marque os critérios atendidos.' },
    { id: 'js-av-12', type: 'tf', difficulty: 2, points: 5, prompt: 'Um módulo importado por vários outros módulos é executado uma única vez, e todos compartilham a mesma instância.', answer: true, explanation: 'Os módulos ES são avaliados uma vez e ficam em cache; os imports seguintes recebem o mesmo módulo.' }
  ]
};

export const project = {
  id: 'mini-store', name: 'Mini-store de estado com assinaturas', lv: 'M', stack: 'JavaScript (módulos ES, Node.js ou navegador)', ds: ['js', 'logic'],
  desc: 'Interfaces modernas guardam o estado da aplicação em um único lugar e avisam os componentes quando ele muda. Construa o núcleo de um "store" no estilo das bibliotecas de gerenciamento de estado: um reducer puro decide o próximo estado a cada ação, e quem se inscreveu é avisado. Depois, use-o para controlar uma lista de tarefas no DOM.',
  rf: ['criarStore(reducer, estadoInicial) devolve { getState, dispatch, subscribe }', 'dispatch(acao) exige um objeto com type do tipo string; calcula o novo estado com reducer(estado, acao)', 'Os inscritos são chamados com o novo estado depois de cada dispatch que mudar o estado (comparação por referência)', 'subscribe(fn) devolve uma função que cancela a inscrição; cancelar durante uma notificação não afeta a notificação em curso', 'Chamar dispatch de dentro do reducer lança um erro', 'Interface: lista de tarefas que usa o store, com delegação de eventos e textContent'],
  rnf: ['Reducer puro: não altera o estado recebido', 'Sem dependências externas', 'Código em módulos (store.js, tarefas.js com o reducer, ui.js)', 'Erros com mensagens claras'],
  ac: ['Todos os testes automatizados do laboratório passam', 'O reducer de tarefas tem testes próprios (adicionar, alternar, remover)', 'A interface funciona com teclado e não usa innerHTML com texto do usuário', 'Um README explica o fluxo ação → reducer → estado → inscritos'],
  ch: ['Evitar notificações quando o reducer devolve o mesmo estado', 'Inscrições canceladas durante a notificação', 'Extensão: middleware de log de ações', 'Extensão: persistir o estado no localStorage com try/catch'],
  lab: { lang: 'javascript',
    prompt: 'Implemente §criarStore(reducer, estadoInicial)§, que devolve §{ getState, dispatch, subscribe }§. Regras: §dispatch(acao)§ lança um erro se §acao§ não for um objeto com §type§ string; calcula §reducer(estadoAtual, acao)§; se o resultado for **o mesmo objeto** (===), não avisa ninguém; senão, troca o estado e chama cada inscrito com o novo estado, na ordem de inscrição, e devolve a ação. §subscribe(fn)§ exige uma função e devolve §cancelar()§; cancelar durante uma notificação não impede que os inscritos daquela rodada sejam chamados. Chamar §dispatch§ enquanto o reducer está executando lança um erro.',
    starter: "function criarStore(reducer, estadoInicial) {\n  // estado no closure, lista de inscritos, flag de 'despachando'\n  return {\n    getState() {},\n    dispatch(acao) {},\n    subscribe(fn) {}\n  };\n}\n",
    tests: [
      { name: 'estado inicial e dispatch', code: R`const s = criarStore((st, a) => (a.type === 'inc' ? { n: st.n + 1 } : st), { n: 0 });
assert.deepEqual(s.getState(), { n: 0 });
s.dispatch({ type: 'inc' }); s.dispatch({ type: 'inc' });
assert.deepEqual(s.getState(), { n: 2 });` },
      { name: 'avisa os inscritos com o novo estado, na ordem', code: R`const s = criarStore((st, a) => (a.type === 'set' ? { v: a.v } : st), { v: 0 });
const log = [];
s.subscribe((e) => log.push('a' + e.v)); s.subscribe((e) => log.push('b' + e.v));
s.dispatch({ type: 'set', v: 7 });
assert.deepEqual(log, ['a7', 'b7']);` },
      { name: 'mesmo estado não notifica', code: R`const s = criarStore((st) => st, { x: 1 });
let n = 0; s.subscribe(() => n++);
s.dispatch({ type: 'nada' });
assert.equal(n, 0);` },
      { name: 'cancelar inscrição', code: R`const s = criarStore((st, a) => ({ c: st.c + 1 }), { c: 0 });
let n = 0; const cancelar = s.subscribe(() => n++);
s.dispatch({ type: 'x' }); cancelar(); cancelar(); s.dispatch({ type: 'x' });
assert.equal(n, 1);` },
      { name: 'cancelar durante a notificação não afeta a rodada atual', code: R`const s = criarStore((st) => ({ c: st.c + 1 }), { c: 0 });
const log = []; let cancelarB;
s.subscribe(() => { log.push('a'); cancelarB(); });
cancelarB = s.subscribe(() => log.push('b'));
s.dispatch({ type: 'x' }); s.dispatch({ type: 'x' });
assert.deepEqual(log, ['a', 'b', 'a']);` },
      { name: 'validações', code: R`const s = criarStore((st) => st, {});
assert.throws(() => s.dispatch('inc')); assert.throws(() => s.dispatch({})); assert.throws(() => s.dispatch({ type: 1 }));
assert.throws(() => s.subscribe('nao sou funcao'));
let s2;
s2 = criarStore((st, a) => { if (a.type === 'loop') s2.dispatch({ type: 'outro' }); return st; }, {});
assert.throws(() => s2.dispatch({ type: 'loop' }));
s2.dispatch({ type: 'ok' });` },
      { name: 'reducer de tarefas imutável e rápido', code: R`function tarefas(st, a) {
  if (a.type === 'add') return { itens: [...st.itens, { id: a.id, feito: false }] };
  if (a.type === 'toggle') return { itens: st.itens.map((t) => (t.id === a.id ? { ...t, feito: !t.feito } : t)) };
  return st;
}
const s = criarStore(tarefas, { itens: [] });
const inicial = s.getState();
s.dispatch({ type: 'add', id: 1 }); s.dispatch({ type: 'toggle', id: 1 });
assert.deepEqual(inicial, { itens: [] });
assert.equal(s.getState().itens[0].feito, true);
const s3 = criarStore((st, a) => ({ n: st.n + 1 }), { n: 0 });
let chamadas = 0; s3.subscribe(() => chamadas++);
const t = Date.now(); for (let i = 0; i < 100000; i++) s3.dispatch({ type: 'i' });
assert.equal(s3.getState().n, 100000); assert.equal(chamadas, 100000);
assert.ok(Date.now() - t < 1500, 'lento: ' + (Date.now() - t) + ' ms');` }
    ],
    solution: R`function criarStore(reducer, estadoInicial) {
  if (typeof reducer !== 'function') throw new TypeError('reducer deve ser uma função');
  let estado = estadoInicial;
  let inscritos = [];
  let despachando = false;
  return {
    getState() {
      return estado;
    },
    dispatch(acao) {
      if (acao === null || typeof acao !== 'object' || typeof acao.type !== 'string') throw new TypeError('ação precisa ser um objeto com type (string)');
      if (despachando) throw new Error('não é permitido chamar dispatch dentro do reducer');
      let proximo;
      despachando = true;
      try {
        proximo = reducer(estado, acao);
      } finally {
        despachando = false;
      }
      if (proximo !== estado) {
        estado = proximo;
        for (const fn of inscritos) fn(estado);
      }
      return acao;
    },
    subscribe(fn) {
      if (typeof fn !== 'function') throw new TypeError('o inscrito deve ser uma função');
      inscritos = [...inscritos, fn];
      let ativo = true;
      return function cancelar() {
        if (!ativo) return;
        ativo = false;
        inscritos = inscritos.filter((f) => f !== fn);
      };
    }
  };
}`
  }
};
