// Curso 5 — Exercícios por aula, avaliação final e projeto integrador.
// O laboratório executa JavaScript: os desafios de código treinam a parte de TypeScript que existe em runtime
// (guards, validação de fronteira, uniões discriminadas, Result, classes com #privado). A parte de tipos é
// corrigida por questões objetivas, rastreamento de tipos e correção de código.
const R = String.raw;

export const exsets = {
'ts-01': [
  { id: 'ts-01-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'O que acontece com as anotações de tipo depois que o compilador do TypeScript termina a checagem?', options: ['Viram verificações executadas em runtime', 'São apagadas: o JavaScript gerado não tem informação de tipo', 'Viram comentários que o navegador interpreta', 'Ficam no código para o motor JavaScript otimizar a execução'], answer: 1, explanation: 'O compilador apaga os tipos. Por isso o TypeScript não valida em runtime o formato de dados que chegam de fora do programa.' },
  { id: 'ts-01-e2', type: 'match', difficulty: 1, points: 10, prompt: 'Associe cada conceito à sua descrição.', pairs: [['any', 'Desliga a verificação de tipos do valor'], ['unknown', 'Aceita qualquer valor, mas exige estreitar antes de usar'], ['noImplicitAny', 'Transforma em erro os casos em que o compilador cairia em any'], ['strictNullChecks', 'Dá a null e undefined tipos próprios']], explanation: 'any aceita qualquer operação; unknown obriga a verificar antes. noImplicitAny e strictNullChecks fazem parte da família strict.' },
  { id: 'ts-01-e3', type: 'trace', difficulty: 2, points: 10, prompt: 'Informe o tipo que o compilador infere em cada caso (modo strict).', code: "let a = 'x';\nconst b = 5;\nlet c = [1, 2];\nconst d: [string, number] = ['k', 1];\nfunction f(x?: number) {\n  return x;\n}", lang: 'typescript', steps: [ { q: 'Tipo de a', answers: ['string'] }, { q: 'Tipo de b', answers: ['5', 'literal 5', 'o literal 5'] }, { q: 'Tipo de c', answers: ['number[]', 'Array<number>'] }, { q: 'Tipo de retorno de f', answers: ['number | undefined', 'number|undefined', 'undefined | number', 'undefined|number'] } ], explanation: 'let alarga o literal para string; const mantém o literal 5; o array vira number[]. O parâmetro opcional vale number | undefined dentro da função, e o retorno herda esse tipo.' },
  { id: 'ts-01-e4', type: 'bug', difficulty: 2, points: 10, prompt: 'Com strict ligado, o compilador rejeita uma linha desta função. Clique nela.', code: "function primeiraLetra(x: unknown): string {\n  if (typeof x === 'string') {\n    return x[0];\n  }\n  return x.toString();\n}", answer: 5, explanation: 'Fora do if, x continua unknown, e unknown não permite chamar métodos. Estreite o tipo (por exemplo, com String(x)) antes de usar.' },
  { id: 'ts-01-e5', type: 'code', difficulty: 2, points: 25, prompt: 'Dados externos entram como §unknown§ e precisam ser validados. Implemente §lerConfig(texto)§, que recebe um texto JSON e devolve §{ ok: true, config }§ ou §{ ok: false, erro }§ (§erro§ é um texto). Regras: JSON inválido é erro; o valor precisa ser um objeto simples (não §null§, não array); §host§ é um texto não vazio (depois de §trim§, e o config devolve o valor já sem espaços); §porta§ é um inteiro de 1 a 65535; §debug§ é opcional (booleano; padrão §false§). O §config§ devolvido tem só §host§, §porta§ e §debug§. A mensagem de erro deve citar o nome do campo inválido.', lang: 'javascript',
    starter: "function lerConfig(texto) {\n  // seu código aqui\n}\n",
    tests: [
      { name: 'configuração válida com padrão', code: R`const r = lerConfig('{"host":"localhost","porta":5432}');
assert.equal(r.ok, true);
assert.deepEqual(r.config, { host: 'localhost', porta: 5432, debug: false });` },
      { name: 'debug informado, host com espaços e campos extras ignorados', code: R`const r = lerConfig('{"host":"  api.local ","porta":80,"debug":true,"x":1}');
assert.equal(r.ok, true);
assert.deepEqual(r.config, { host: 'api.local', porta: 80, debug: true });` },
      { name: 'JSON inválido', code: R`const r = lerConfig('{ nao e json');
assert.equal(r.ok, false); assert.equal(typeof r.erro, 'string'); assert.ok(r.erro.length > 0);` },
      { name: 'raiz precisa ser objeto', code: R`for (const t of ['null', '[]', '123', '"texto"', 'true']) { const r = lerConfig(t); assert.equal(r.ok, false, t); }` },
      { name: 'host inválido', code: R`for (const t of ['{"porta":80}', '{"host":"","porta":80}', '{"host":"   ","porta":80}', '{"host":5,"porta":80}']) { const r = lerConfig(t); assert.equal(r.ok, false, t); assert.ok(r.erro.includes('host'), r.erro); }` },
      { name: 'porta inválida', code: R`for (const t of ['{"host":"a"}', '{"host":"a","porta":0}', '{"host":"a","porta":70000}', '{"host":"a","porta":80.5}', '{"host":"a","porta":"80"}']) { const r = lerConfig(t); assert.equal(r.ok, false, t); assert.ok(r.erro.includes('porta'), r.erro); }` },
      { name: 'debug inválido', code: R`const r = lerConfig('{"host":"a","porta":80,"debug":"sim"}');
assert.equal(r.ok, false); assert.ok(r.erro.includes('debug'));` },
      { name: 'limites da porta', code: R`assert.equal(lerConfig('{"host":"a","porta":1}').ok, true); assert.equal(lerConfig('{"host":"a","porta":65535}').ok, true);` }
    ],
    hints: ['Use try/catch em volta de JSON.parse.', 'Number.isInteger rejeita 80.5 e a string "80".', 'Monte o config só no final, com os três campos.'],
    solution: R`function lerConfig(texto) {
  let dado;
  try {
    dado = JSON.parse(texto);
  } catch {
    return { ok: false, erro: 'JSON inválido' };
  }
  if (dado === null || typeof dado !== 'object' || Array.isArray(dado)) return { ok: false, erro: 'a configuração deve ser um objeto' };
  if (typeof dado.host !== 'string' || dado.host.trim() === '') return { ok: false, erro: 'host deve ser um texto não vazio' };
  if (!Number.isInteger(dado.porta) || dado.porta < 1 || dado.porta > 65535) return { ok: false, erro: 'porta deve ser um inteiro de 1 a 65535' };
  if (dado.debug !== undefined && typeof dado.debug !== 'boolean') return { ok: false, erro: 'debug deve ser booleano' };
  return { ok: true, config: { host: dado.host.trim(), porta: dado.porta, debug: dado.debug ?? false } };
}`, explanation: 'O TypeScript não valida o JSON: a função recebe um texto, trata o resultado como desconhecido e confere cada campo antes de devolver um objeto confiável. É o mesmo raciocínio de "unknown + guard" que o compilador exige.' },
  { id: 'ts-01-e6', type: 'tf', difficulty: 1, points: 5, prompt: 'Escrever §const u = JSON.parse(texto) as Usuario§ faz o TypeScript validar, em runtime, que o JSON tem o formato de §Usuario§.', answer: false, explanation: 'O "as" só afirma o tipo ao compilador. Não existe verificação em runtime: se o JSON vier diferente, o erro aparece depois, longe da origem.' }
],
'ts-02': [
  { id: 'ts-02-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual afirmação sobre §interface§ e §type§ está correta?', options: ['Só a interface pode descrever objetos', 'O type pode nomear uniões e tuplas; a interface pode ser reaberta e ganhar membros por declaração repetida', 'As duas são idênticas em todos os recursos', 'A interface existe em runtime e o type não'], answer: 1, explanation: 'Quase tudo que a interface faz o type também faz. As diferenças: o type nomeia uniões, tuplas e primitivos; a interface pode ser reaberta (declaration merging). Nenhum dos dois existe em runtime.' },
  { id: 'ts-02-e2', type: 'tf', difficulty: 2, points: 5, prompt: 'Uma propriedade §readonly§ não pode ser alterada em runtime: tentar mudá-la lança um erro.', answer: false, explanation: 'readonly só vale na checagem de tipos. O JavaScript emitido não tem essa proteção, e o conteúdo interno (um objeto dentro do campo) também continua mutável.' },
  { id: 'ts-02-e3', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete a interface e a lista de valores fixos.', code: "interface Config {\n  [[0]] host: string;\n  porta[[1]]: number;\n}\nconst modos = ['dev', 'prod'] [[2]];", lang: 'typescript', answers: [['readonly'], ['?'], ['as const']], explanation: 'readonly impede reatribuir o campo; ? torna a porta opcional; as const faz o array virar uma tupla somente leitura com os literais "dev" e "prod".' },
  { id: 'ts-02-e4', type: 'bug', difficulty: 2, points: 10, prompt: 'O compilador rejeita uma linha deste código (propriedades em excesso). Clique nela.', code: "interface Ponto { x: number; y: number }\nconst a: Ponto = { x: 1, y: 2 };\nconst b: Ponto = { x: 1, y: 2, z: 3 };\nconst c = { x: 1, y: 2, z: 3 };\nconst d: Ponto = c;", answer: 3, explanation: 'A checagem de excesso vale para literais de objeto atribuídos direto a um tipo. Na linha 5, c é uma variável com z a mais, e isso é aceito pela tipagem estrutural: tem x e y.' },
  { id: 'ts-02-e5', type: 'code', difficulty: 2, points: 20, prompt: 'Opções parciais (§Partial§) causam um bug clássico: §{ ...padroes, ...opcoes }§ deixa um valor §undefined§ em §opcoes§ apagar o padrão. Implemente §mesclarPadroes(padroes, opcoes)§, que devolve um **novo** objeto com os padrões sobrescritos pelas opções, **ignorando as chaves cujo valor é §undefined§**. Valores §null§, §0§, §false§ e §""§ são válidos e sobrescrevem. §opcoes§ pode ser §undefined§. Não altere os argumentos.', lang: 'javascript',
    starter: "function mesclarPadroes(padroes, opcoes) {\n  // seu código aqui\n}\n",
    tests: [
      { name: 'sobrescreve e mantém os padrões', code: R`assert.deepEqual(mesclarPadroes({ a: 1, b: 2 }, { b: 9 }), { a: 1, b: 9 });` },
      { name: 'undefined não apaga o padrão', code: R`assert.deepEqual(mesclarPadroes({ cor: 'azul', tam: 3 }, { cor: undefined, tam: 5 }), { cor: 'azul', tam: 5 });` },
      { name: 'valores falsy válidos sobrescrevem', code: R`assert.deepEqual(mesclarPadroes({ a: 1, b: true, c: 'x', d: 5 }, { a: 0, b: false, c: '', d: null }), { a: 0, b: false, c: '', d: null });` },
      { name: 'opções ausentes', code: R`const p = { a: 1 }; const r = mesclarPadroes(p, undefined);
assert.deepEqual(r, { a: 1 }); assert.ok(r !== p);` },
      { name: 'chaves novas são incluídas', code: R`assert.deepEqual(mesclarPadroes({ a: 1 }, { z: 26 }), { a: 1, z: 26 });` },
      { name: 'não altera os argumentos', code: R`const p = { a: 1 }; const o = { a: 2, b: undefined };
mesclarPadroes(p, o);
assert.deepEqual(p, { a: 1 }); assert.deepEqual(o, { a: 2, b: undefined });` }
    ],
    hints: ['Comece com uma cópia rasa de padroes.', 'Percorra Object.entries(opcoes ?? {}).', 'Só atribua quando o valor for diferente de undefined.'],
    solution: R`function mesclarPadroes(padroes, opcoes) {
  const resultado = { ...padroes };
  for (const [chave, valor] of Object.entries(opcoes ?? {})) {
    if (valor !== undefined) resultado[chave] = valor;
  }
  return resultado;
}`, explanation: 'Partial<T> permite chaves presentes com valor undefined, e o spread as trata como valores. Filtrar undefined explicitamente evita sobrescrever padrões sem querer.' },
  { id: 'ts-02-e6', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual é a vantagem de usar §satisfies§ em vez de uma anotação §: Tipo§ ao declarar uma configuração?', options: ['Ele converte o valor para o tipo em runtime', 'Valida o objeto contra o tipo e mantém o tipo específico de cada propriedade', 'Ele permite ignorar propriedades que faltam', 'Ele deixa o objeto imutável'], answer: 1, explanation: 'A anotação valida mas alarga o tipo para o declarado (perdendo, por exemplo, que uma propriedade é string e não string | number[]). satisfies valida sem apagar o tipo mais específico.' }
],
'ts-03': [
  { id: 'ts-03-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Com §let v: string | number§, qual chamada é permitida **sem** estreitar o tipo?', options: ['v.toUpperCase()', 'v.toFixed(2)', 'v.toString()', 'v.trim()'], answer: 2, explanation: 'Uma operação só é permitida em uma união se for válida para todos os membros. toString existe em string e em number; as outras existem só em um deles.' },
  { id: 'ts-03-e2', type: 'trace', difficulty: 2, points: 10, prompt: 'Siga o estreitamento de tipos (modo strict).', code: "function f(v: string | number | null) {\n  if (v === null) return 0;\n  // ponto A\n  if (typeof v === 'string') return v.length;\n  // ponto B\n  return v;\n}", lang: 'typescript', steps: [ { q: 'Tipo de v no ponto A', answers: ['string | number', 'number | string', 'string|number', 'number|string'] }, { q: 'Tipo de v no ponto B', answers: ['number'] }, { q: 'Tipo de retorno de f', answers: ['number'] } ], explanation: 'O retorno antecipado remove null; o teste de typeof remove string. Todos os ramos devolvem number.' },
  { id: 'ts-03-e3', type: 'match', difficulty: 1, points: 10, prompt: 'Associe a técnica de narrowing ao que ela faz.', pairs: [["typeof x === 'string'", 'Estreita para string'], ["'nadar' in a", 'Separa os membros da união que têm a propriedade'], ['x instanceof Date', 'Estreita para Date'], ['x != null', 'Remove null e undefined']], explanation: 'São as técnicas de estreitamento mais usadas: typeof, in, instanceof e comparação de igualdade.' },
  { id: 'ts-03-e4', type: 'mc', difficulty: 2, points: 10, prompt: 'Um §switch§ trata os kinds §"a"§ e §"b"§ de uma união e termina com §default: const nunca: never = x;§. Depois alguém acrescenta o membro §{ kind: "c" }§ à união. O que acontece na compilação?', options: ['Nada, o default continua válido', 'O compilador acusa erro no default, pois x ainda pode ser do tipo c', 'O compilador remove o membro c da união', 'O programa lança um erro de compilação só em runtime'], answer: 1, explanation: 'Esse é o exhaustiveness check: se sobrar um membro não tratado, ele não é atribuível a never e a compilação falha, apontando o lugar a atualizar.' },
  { id: 'ts-03-e5', type: 'code', difficulty: 2, points: 25, prompt: 'Implemente §calcularArea(forma)§ para uma união discriminada pela propriedade §kind§: §"circulo"§ (§raio§), §"quadrado"§ (§lado§), §"retangulo"§ (§largura§, §altura§) e §"triangulo"§ (§base§, §altura§). Dimensões precisam ser números finitos maiores ou iguais a zero; senão, lance §RangeError§. Para um §kind§ desconhecido, lance §Error§ com a mensagem §"forma desconhecida: <kind>"§. Se §forma§ não for um objeto, lance §TypeError§.', lang: 'javascript',
    starter: "function calcularArea(forma) {\n  // seu código aqui\n}\n",
    tests: [
      { name: 'cada forma', code: R`assert.equal(calcularArea({ kind: 'quadrado', lado: 3 }), 9);
assert.equal(calcularArea({ kind: 'retangulo', largura: 2, altura: 5 }), 10);
assert.equal(calcularArea({ kind: 'triangulo', base: 4, altura: 5 }), 10);
assert.ok(Math.abs(calcularArea({ kind: 'circulo', raio: 1 }) - Math.PI) < 1e-12);` },
      { name: 'dimensão zero é válida', code: R`assert.equal(calcularArea({ kind: 'quadrado', lado: 0 }), 0);` },
      { name: 'dimensão inválida', code: R`assert.throws(() => calcularArea({ kind: 'quadrado', lado: -1 }));
assert.throws(() => calcularArea({ kind: 'circulo', raio: NaN }));
assert.throws(() => calcularArea({ kind: 'retangulo', largura: 2, altura: Infinity }));
assert.throws(() => calcularArea({ kind: 'triangulo', base: '4', altura: 5 }));` },
      { name: 'kind desconhecido cita o kind', code: R`assert.throws(() => calcularArea({ kind: 'hexagono', lado: 2 }), 'forma desconhecida: hexagono');` },
      { name: 'entrada que não é objeto', code: R`let e1, e2;
try { calcularArea(null); } catch (e) { e1 = e; }
try { calcularArea('quadrado'); } catch (e) { e2 = e; }
assert.ok(e1 instanceof TypeError); assert.ok(e2 instanceof TypeError);` },
      { name: 'erros usam os tipos pedidos', code: R`let e1, e2;
try { calcularArea({ kind: 'quadrado', lado: -2 }); } catch (e) { e1 = e; }
try { calcularArea({ kind: 'x' }); } catch (e) { e2 = e; }
assert.ok(e1 instanceof RangeError); assert.ok(e2 instanceof Error && !(e2 instanceof RangeError));` }
    ],
    hints: ['Valide forma antes de ler forma.kind.', 'Crie uma função auxiliar que confere se todos os números são finitos e >= 0.', 'O default do switch lança o erro de kind desconhecido.'],
    solution: R`function calcularArea(forma) {
  if (forma === null || typeof forma !== 'object') throw new TypeError('forma deve ser um objeto');
  const validos = (...ns) => {
    if (!ns.every((n) => typeof n === 'number' && Number.isFinite(n) && n >= 0)) throw new RangeError('dimensões inválidas');
  };
  switch (forma.kind) {
    case 'circulo':
      validos(forma.raio);
      return Math.PI * forma.raio ** 2;
    case 'quadrado':
      validos(forma.lado);
      return forma.lado ** 2;
    case 'retangulo':
      validos(forma.largura, forma.altura);
      return forma.largura * forma.altura;
    case 'triangulo':
      validos(forma.base, forma.altura);
      return (forma.base * forma.altura) / 2;
    default:
      throw new Error('forma desconhecida: ' + forma.kind);
  }
}`, explanation: 'O switch sobre a tag é o equivalente em runtime do estreitamento da união discriminada. O default lança um erro para que um kind novo nunca passe em silêncio, como o never faz na compilação.' },
  { id: 'ts-03-e6', type: 'tf', difficulty: 2, points: 5, prompt: 'Estreitar com §if (n)§ (truthiness) uma variável §number | undefined§ remove §undefined§, mas também trata o valor §0§ como se fosse ausente.', answer: true, explanation: 'O 0 é falsy. Para distinguir ausência de zero, compare explicitamente: if (n !== undefined).' },
  { id: 'ts-03-e7', type: 'open', difficulty: 3, points: 15, prompt: 'Uma tela guarda o estado de uma requisição como §{ carregando: boolean; erro?: string; dados?: Usuario[] }§. Explique o problema desse modelo e como uma união discriminada o resolve.', model: 'Esse modelo permite combinações impossíveis: carregando true com dados preenchidos, erro e dados ao mesmo tempo, ou sucesso sem dados. Cada uso exige conferir vários campos e o compilador não ajuda. Uma união discriminada modela só os estados válidos: { status: "carregando" } | { status: "erro"; mensagem: string } | { status: "sucesso"; dados: Usuario[] }. Testar status estreita para o membro certo, e cada ramo enxerga apenas os campos que existem naquele estado. Com um default que atribui a never, acrescentar um novo estado faz o compilador apontar todos os lugares que precisam tratá-lo.', rubric: ['Aponta que o modelo com campos opcionais permite combinações impossíveis', 'Apresenta uma união discriminada com uma tag literal (como status)', 'Explica que o teste da tag estreita o tipo e dá acesso apenas aos campos do estado', 'Cita a verificação de exaustividade com never'], explanation: 'A união discriminada torna os estados impossíveis impossíveis de escrever e transforma a checagem de todos os casos em tarefa do compilador.' }
],
'ts-04': [
  { id: 'ts-04-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Uma função tem as assinaturas de overload §f(x: string): void§ e §f(x: number): void§, seguidas de uma implementação §f(x: string | number | boolean)§. Qual chamada o compilador aceita?', options: ['f(true)', 'f("a")', 'f(Math.random() > 0.5 ? "a" : 1)', 'f(null)'], answer: 1, explanation: 'A assinatura de implementação não é visível para quem chama: só os overloads contam. f(true) e f(null) não casam com nenhum. A chamada com "a" ou 1 dependendo do sorteio também falha, porque nenhum overload aceita a união; é por isso que o Handbook recomenda preferir um parâmetro com tipo união quando possível.' },
  { id: 'ts-04-e2', type: 'tf', difficulty: 2, points: 5, prompt: 'Um campo declarado com §private§ do TypeScript continua acessível em JavaScript puro depois da compilação.', answer: true, explanation: 'private é apenas uma checagem de tipos ("privacidade suave"). Para privacidade real em runtime, use #campo.' },
  { id: 'ts-04-e3', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete a classe com um campo privado de verdade e um titular somente leitura.', code: "class Conta {\n  [[0]]saldo = 0;\n  constructor(public [[1]] titular: string) {}\n}", lang: 'typescript', answers: [['#'], ['readonly']], explanation: '#saldo é privado em runtime. O modificador readonly junto de public cria, via parameter property, um campo titular somente leitura.' },
  { id: 'ts-04-e4', type: 'bug', difficulty: 3, points: 10, prompt: 'Este código compila sem erros, mas lança §TypeError§ ao executar. Em qual linha o erro acontece?', code: "class Contador {\n  n = 0;\n  incrementar() { this.n++; }\n}\nconst c = new Contador();\nconst f = c.incrementar;\nf();", answer: 7, explanation: 'Ao extrair o método em f, ele perde o this. A chamada f() na linha 7 executa this.n++ com this indefinido. O TypeScript não detecta isso; solução: arrow function como campo, bind ou chamar c.incrementar().' },
  { id: 'ts-04-e5', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente a classe §ContaBancaria§ com estado **realmente privado** (campos §#§). §new ContaBancaria(titular, saldoInicial = 0)§: §titular§ é um texto não vazio (senão §TypeError§) e §saldoInicial§ um número finito ≥ 0 (senão §RangeError§). Getters §titular§ e §saldo§. §depositar(valor)§ e §sacar(valor)§ exigem número finito maior que zero (senão §RangeError§), devolvem o novo saldo, e §sacar§ lança §Error§ com a mensagem §"saldo insuficiente"§ se o valor passar do saldo. §extrato()§ devolve uma **cópia** da lista de movimentos §{ tipo: "deposito" | "saque", valor }§. Nenhum estado pode aparecer como propriedade do objeto.', lang: 'javascript',
    starter: "class ContaBancaria {\n  // seu código aqui\n}\n",
    tests: [
      { name: 'depósitos e saques', code: R`const c = new ContaBancaria('Ana', 100);
assert.equal(c.titular, 'Ana'); assert.equal(c.saldo, 100);
assert.equal(c.depositar(50), 150); assert.equal(c.sacar(30), 120); assert.equal(c.saldo, 120);
assert.equal(new ContaBancaria('Bia').saldo, 0);` },
      { name: 'extrato registra movimentos em ordem', code: R`const c = new ContaBancaria('Ana');
c.depositar(10); c.sacar(4); c.depositar(1);
assert.deepEqual(c.extrato(), [{ tipo: 'deposito', valor: 10 }, { tipo: 'saque', valor: 4 }, { tipo: 'deposito', valor: 1 }]);` },
      { name: 'extrato devolve cópia', code: R`const c = new ContaBancaria('Ana');
c.depositar(10);
const e = c.extrato(); e.push({ tipo: 'saque', valor: 999 }); e[0].valor = 0;
assert.deepEqual(c.extrato(), [{ tipo: 'deposito', valor: 10 }]);` },
      { name: 'saldo insuficiente', code: R`const c = new ContaBancaria('Ana', 10);
assert.throws(() => c.sacar(11), 'saldo insuficiente');
assert.equal(c.saldo, 10); assert.deepEqual(c.extrato(), []);
assert.equal(c.sacar(10), 0);` },
      { name: 'valores inválidos', code: R`const c = new ContaBancaria('Ana', 5);
for (const v of [0, -1, NaN, Infinity, '5', null, undefined]) { assert.throws(() => c.depositar(v)); assert.throws(() => c.sacar(v)); }
assert.equal(c.saldo, 5); assert.deepEqual(c.extrato(), []);` },
      { name: 'construtor valida os argumentos', code: R`let e1, e2, e3;
try { new ContaBancaria(''); } catch (e) { e1 = e; }
try { new ContaBancaria('Ana', -1); } catch (e) { e2 = e; }
try { new ContaBancaria(42); } catch (e) { e3 = e; }
assert.ok(e1 instanceof TypeError); assert.ok(e2 instanceof RangeError); assert.ok(e3 instanceof TypeError);` },
      { name: 'estado é privado de verdade', code: R`const c = new ContaBancaria('Ana', 10);
assert.equal(Object.keys(c).length, 0);
assert.equal(JSON.stringify(c), '{}');
assert.equal(Object.getOwnPropertyNames(c).length, 0);` }
    ],
    hints: ['Declare #titular, #saldo e #movimentos no corpo da classe.', 'Valide valores com uma função fora da classe para reaproveitar.', 'extrato() deve copiar a lista e cada movimento.'],
    solution: R`function validarValor(v) {
  if (typeof v !== 'number' || !Number.isFinite(v) || v <= 0) throw new RangeError('valor deve ser um número positivo');
}
class ContaBancaria {
  #titular;
  #saldo;
  #movimentos = [];
  constructor(titular, saldoInicial = 0) {
    if (typeof titular !== 'string' || titular.trim() === '') throw new TypeError('titular inválido');
    if (typeof saldoInicial !== 'number' || !Number.isFinite(saldoInicial) || saldoInicial < 0) throw new RangeError('saldo inicial inválido');
    this.#titular = titular.trim();
    this.#saldo = saldoInicial;
  }
  get titular() {
    return this.#titular;
  }
  get saldo() {
    return this.#saldo;
  }
  depositar(valor) {
    validarValor(valor);
    this.#saldo += valor;
    this.#movimentos.push({ tipo: 'deposito', valor });
    return this.#saldo;
  }
  sacar(valor) {
    validarValor(valor);
    if (valor > this.#saldo) throw new Error('saldo insuficiente');
    this.#saldo -= valor;
    this.#movimentos.push({ tipo: 'saque', valor });
    return this.#saldo;
  }
  extrato() {
    return this.#movimentos.map((m) => ({ ...m }));
  }
}`, explanation: 'Campos # são privados em runtime, ao contrário do private do TypeScript, que só existe na compilação. Validar antes de alterar o estado mantém a conta consistente quando uma operação falha.' },
  { id: 'ts-04-e6', type: 'mc', difficulty: 2, points: 10, prompt: 'Uma função precisa aceitar §string§ ou §string[]§ e devolver o tamanho (§number§) em ambos os casos. Qual a abordagem mais simples recomendada?', options: ['Dois overloads, um para cada tipo', 'Um parâmetro com o tipo união string | string[]', 'Usar any no parâmetro', 'Um generic com T extends unknown'], answer: 1, explanation: 'Quando o retorno não depende do tipo do argumento, um parâmetro com tipo união é mais simples e aceita também valores cujo tipo é "um ou outro". Overloads só valem quando a saída muda conforme a entrada.' }
],
'ts-05': [
  { id: 'ts-05-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Dada §function primeiro<T>(lista: T[]): T | undefined§, qual é o tipo de §primeiro([1, 2, 3])§?', options: ['any', 'number', 'number | undefined', 'T | undefined'], answer: 2, explanation: 'O compilador infere T = number a partir do argumento, e o retorno vira number | undefined.' },
  { id: 'ts-05-e2', type: 'trace', difficulty: 2, points: 10, prompt: 'Informe o tipo de cada chamada (modo strict).', code: "function pegar<T, K extends keyof T>(obj: T, chave: K): T[K] {\n  return obj[chave];\n}\nconst u = { nome: 'Ana', idade: 30, ativo: true };\nconst a = pegar(u, 'nome');\nconst b = pegar(u, 'idade');\nconst c = pegar(u, 'ativo');", lang: 'typescript', steps: [ { q: 'Tipo de a', answers: ['string'] }, { q: 'Tipo de b', answers: ['number'] }, { q: 'Tipo de c', answers: ['boolean'] }, { q: 'pegar(u, "email") compila? (sim ou não)', answers: ['não', 'nao'] } ], explanation: 'K é uma chave literal de u, e T[K] é o tipo exato da propriedade. "email" não está em keyof typeof u, então a chamada é rejeitada.' },
  { id: 'ts-05-e3', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual assinatura usa um generic sem necessidade, porque o parâmetro de tipo aparece uma única vez e não relaciona nada?', options: ['function f<T>(x: T): void', 'function g<T>(x: T): T', 'function h<T>(lista: T[]): T | undefined', 'function k<T, K extends keyof T>(o: T, c: K): T[K]'], answer: 0, explanation: 'Em f, T aparece só uma vez: (x: unknown) teria o mesmo efeito. Nas outras, T liga a entrada à saída ou a chave ao valor.' },
  { id: 'ts-05-e4', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete a restrição e o tipo padrão.', code: "function comprimento<T [[0]] { length: number }>(x: T): number {\n  return x.length;\n}\ntype Par<A, B [[1]] A> = [A, B];", lang: 'typescript', answers: [['extends'], ['=']], explanation: 'extends restringe o parâmetro de tipo (aqui, exige a propriedade length); "= A" define A como tipo padrão de B.' },
  { id: 'ts-05-e5', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente o padrão **Result** em JavaScript. §ok(valor)§ devolve §{ ok: true, valor }§; §falha(erro)§ devolve §{ ok: false, erro }§. §mapear(r, fn)§ aplica §fn§ ao valor de um sucesso e devolve um novo sucesso; em uma falha, devolve §r§ sem chamar §fn§. §encadear(r, fn)§ faz o mesmo, mas §fn§ já devolve um Result, que é o resultado. §valorOu(r, padrao)§ devolve o valor do sucesso ou o padrão. §combinar(lista)§ recebe uma lista de Results: se todos forem sucesso, devolve §ok§ com a lista de valores; senão, devolve **a primeira falha**.', lang: 'javascript',
    starter: "function ok(valor) {\n  // seu código aqui\n}\nfunction falha(erro) {}\nfunction mapear(r, fn) {}\nfunction encadear(r, fn) {}\nfunction valorOu(r, padrao) {}\nfunction combinar(lista) {}\n",
    tests: [
      { name: 'ok e falha', code: R`assert.deepEqual(ok(5), { ok: true, valor: 5 }); assert.deepEqual(falha('x'), { ok: false, erro: 'x' });` },
      { name: 'mapear transforma só o sucesso', code: R`assert.deepEqual(mapear(ok(2), (n) => n * 10), ok(20));
let chamou = false; const f = falha('e');
const r = mapear(f, () => { chamou = true; });
assert.equal(chamou, false); assert.equal(r, f);` },
      { name: 'encadear', code: R`const dividir = (a, b) => (b === 0 ? falha('div0') : ok(a / b));
assert.deepEqual(encadear(ok(10), (n) => dividir(n, 2)), ok(5));
assert.deepEqual(encadear(ok(10), (n) => dividir(n, 0)), falha('div0'));
let chamou = false; encadear(falha('antes'), () => { chamou = true; return ok(1); });
assert.equal(chamou, false);
assert.deepEqual(encadear(falha('antes'), () => ok(1)), falha('antes'));` },
      { name: 'valorOu', code: R`assert.equal(valorOu(ok(3), 0), 3); assert.equal(valorOu(falha('x'), 0), 0); assert.equal(valorOu(ok(0), 9), 0); assert.equal(valorOu(ok(null), 9), null);` },
      { name: 'combinar', code: R`assert.deepEqual(combinar([ok(1), ok(2), ok(3)]), ok([1, 2, 3]));
assert.deepEqual(combinar([]), ok([]));
assert.deepEqual(combinar([ok(1), falha('a'), falha('b')]), falha('a'));` },
      { name: 'encadeamento completo', code: R`const parseNum = (t) => (Number.isNaN(Number(t)) || t.trim() === '' ? falha('não é número: ' + t) : ok(Number(t)));
const soma = (xs) => mapear(combinar(xs.map(parseNum)), (ns) => ns.reduce((a, n) => a + n, 0));
assert.deepEqual(soma(['1', '2', '3']), ok(6));
assert.deepEqual(soma(['1', 'x', 'y']), falha('não é número: x'));` }
    ],
    hints: ['Em mapear e encadear, teste r.ok primeiro.', 'combinar pode percorrer a lista parando na primeira falha.', 'valorOu deve usar r.ok, não a veracidade do valor (0 e null são valores válidos).'],
    solution: R`function ok(valor) {
  return { ok: true, valor };
}
function falha(erro) {
  return { ok: false, erro };
}
function mapear(r, fn) {
  return r.ok ? ok(fn(r.valor)) : r;
}
function encadear(r, fn) {
  return r.ok ? fn(r.valor) : r;
}
function valorOu(r, padrao) {
  return r.ok ? r.valor : padrao;
}
function combinar(lista) {
  const valores = [];
  for (const r of lista) {
    if (!r.ok) return r;
    valores.push(r.valor);
  }
  return ok(valores);
}`, explanation: 'Result transforma o erro em dado: cada função testa a tag ok e repassa a falha sem executar o resto. No TypeScript, o mesmo teste estreita a união discriminada Result<T, E>.' },
  { id: 'ts-05-e6', type: 'open', difficulty: 2, points: 10, prompt: 'Compare devolver um §Result<T, E>§ com lançar exceções para erros esperados, como um CPF inválido digitado em um formulário. Qual a vantagem de tipos aqui?', model: 'Uma função que lança exceção não mostra isso na assinatura: o chamador pode esquecer de tratar, e o compilador não avisa. Com Result<T, E>, o erro faz parte do tipo de retorno: para acessar o valor é preciso estreitar a união (testar ok), então o caso de falha é tratado obrigatoriamente. Isso funciona bem para erros esperados e de negócio (validação, não encontrado). Exceções continuam adequadas para situações realmente excepcionais (falha de infraestrutura, bug), que sobem até um tratador central.', rubric: ['Diz que exceções não aparecem no tipo e podem ser esquecidas', 'Explica que o Result obriga a tratar o erro por meio do estreitamento', 'Indica que Result serve a erros esperados/de negócio', 'Menciona que exceções ainda cabem em falhas excepcionais ou bugs'], explanation: 'Result move o erro para o sistema de tipos, onde o compilador pode cobrar o tratamento.' }
],
'ts-06': [
  { id: 'ts-06-e1', type: 'match', difficulty: 1, points: 10, prompt: 'Associe cada utility type ao seu efeito.', pairs: [['Partial<T>', 'Todas as propriedades ficam opcionais'], ['Pick<T, K>', 'Mantém apenas as propriedades K'], ['Omit<T, K>', 'Mantém todas, exceto as propriedades K'], ['Record<K, V>', 'Objeto com as chaves K e valores do tipo V']], explanation: 'São os utility types mais usados para derivar tipos de um tipo-base.' },
  { id: 'ts-06-e2', type: 'trace', difficulty: 2, points: 10, prompt: 'Calcule os tipos derivados (modo strict).', code: "type U = { id: number; nome: string; email?: string };\ntype A = Pick<U, 'id' | 'nome'>;\ntype B = Partial<U>;\ntype C = Required<U>;\ntype D = keyof U;\ntype E = Exclude<'a' | 'b' | 'c', 'b'>;", lang: 'typescript', steps: [ { q: 'Quantas propriedades tem A?', answers: ['2', 'duas'] }, { q: 'Em B, o campo id é obrigatório? (sim ou não)', answers: ['não', 'nao'] }, { q: 'Tipo de C["email"]', answers: ['string'] }, { q: 'Tipo de D', answers: ["'id' | 'nome' | 'email'", '"id" | "nome" | "email"', "'id'|'nome'|'email'", '"id"|"nome"|"email"'] }, { q: 'Tipo de E', answers: ["'a' | 'c'", '"a" | "c"', "'a'|'c'", '"a"|"c"'] } ], explanation: 'Pick escolhe 2 campos; Partial torna tudo opcional; Required torna email string; keyof devolve a união das chaves; Exclude remove "b" da união.' },
  { id: 'ts-06-e3', type: 'mc', difficulty: 2, points: 10, prompt: 'Dado §const niveis = ["info", "aviso", "erro"] as const§, como obter o tipo §"info" | "aviso" | "erro"§?', options: ['typeof niveis', 'keyof niveis', 'typeof niveis[number]', 'ReturnType<typeof niveis>'], answer: 2, explanation: 'typeof niveis dá a tupla readonly; indexá-la com [number] devolve a união dos elementos.' },
  { id: 'ts-06-e4', type: 'bug', difficulty: 2, points: 10, prompt: 'O compilador rejeita uma linha deste código. Clique nela.', code: "type Pessoa = { nome: string; idade: number };\nconst chave = 'idade';\ntype Idade = Pessoa[chave];", answer: 3, explanation: 'Um índice de tipo precisa ser um tipo, não um valor. Declare type Chave = "idade" e use Pessoa[Chave], ou use Pessoa["idade"] direto.' },
  { id: 'ts-06-e5', type: 'code', difficulty: 3, points: 25, prompt: 'Os utility types têm equivalentes em runtime. Implemente três funções que **não alteram** o objeto original: §pick(obj, chaves)§ devolve um objeto só com as chaves listadas que existem em §obj§ (chaves ausentes são ignoradas, sem criar valores §undefined§); §omit(obj, chaves)§ devolve uma cópia sem as chaves listadas; §mapearValores(obj, fn)§ devolve um objeto com as mesmas chaves e valores §fn(valor, chave)§. Considere apenas propriedades próprias e enumeráveis.', lang: 'javascript',
    starter: "function pick(obj, chaves) {\n  // seu código aqui\n}\nfunction omit(obj, chaves) {}\nfunction mapearValores(obj, fn) {}\n",
    tests: [
      { name: 'pick', code: R`assert.deepEqual(pick({ a: 1, b: 2, c: 3 }, ['a', 'c']), { a: 1, c: 3 });
assert.deepEqual(pick({ a: 1 }, ['a', 'zz']), { a: 1 });
assert.equal('zz' in pick({ a: 1 }, ['zz']), false);` },
      { name: 'pick preserva valores falsy', code: R`assert.deepEqual(pick({ a: 0, b: null, c: undefined, d: '' }, ['a', 'b', 'c', 'd']), { a: 0, b: null, c: undefined, d: '' });` },
      { name: 'omit', code: R`assert.deepEqual(omit({ id: 1, nome: 'A', senha: 'x' }, ['senha']), { id: 1, nome: 'A' });
assert.deepEqual(omit({ a: 1 }, []), { a: 1 });
assert.deepEqual(omit({ a: 1 }, ['a', 'nao-existe']), {});` },
      { name: 'mapearValores recebe valor e chave', code: R`assert.deepEqual(mapearValores({ a: 1, b: 2 }, (v) => v * 2), { a: 2, b: 4 });
assert.deepEqual(mapearValores({ x: 'a', y: 'b' }, (v, k) => k + v), { x: 'xa', y: 'yb' });
assert.deepEqual(mapearValores({}, () => 1), {});` },
      { name: 'não altera o original', code: R`const o = { a: 1, b: 2 };
pick(o, ['a']); omit(o, ['a']); mapearValores(o, (v) => v + 1);
assert.deepEqual(o, { a: 1, b: 2 });` },
      { name: 'ignora propriedades herdadas', code: R`const base = { herdada: 1 }; const o = Object.create(base); o.propria = 2;
assert.deepEqual(pick(o, ['herdada', 'propria']), { propria: 2 });
assert.deepEqual(omit(o, []), { propria: 2 });` }
    ],
    hints: ['Use Object.prototype.hasOwnProperty.call(obj, chave) para propriedades próprias.', 'omit pode partir de Object.entries e filtrar.', 'Object.fromEntries monta o resultado.'],
    solution: R`const temPropria = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
function pick(obj, chaves) {
  const r = {};
  for (const k of chaves) if (temPropria(obj, k)) r[k] = obj[k];
  return r;
}
function omit(obj, chaves) {
  const fora = new Set(chaves);
  return Object.fromEntries(Object.entries(obj).filter(([k]) => !fora.has(k)));
}
function mapearValores(obj, fn) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, fn(v, k)]));
}`, explanation: 'Pick, Omit e um mapped type fazem no sistema de tipos o que essas funções fazem com valores: escolher chaves, excluir chaves e transformar cada valor mantendo as chaves.' },
  { id: 'ts-06-e6', type: 'mc', difficulty: 3, points: 10, prompt: 'Com §type Elemento<T> = T extends Array<infer Item> ? Item : T§, qual é o tipo de §Elemento<string[] | number>§?', options: ['string[] | number', 'string | number', 'string', 'never'], answer: 1, explanation: 'Conditional types são distributivos: aplicado à união, vale para cada membro. Elemento<string[]> é string e Elemento<number> é number, e o resultado é a união string | number.' }
],
'ts-07': [
  { id: 'ts-07-e1', type: 'tf', difficulty: 2, points: 5, prompt: 'A opção §noUncheckedIndexedAccess§ faz parte da família ligada por §"strict": true§.', answer: false, explanation: 'Ela precisa ser ligada separadamente. Ela acrescenta undefined aos acessos por índice (inclusive em arrays e index signatures).' },
  { id: 'ts-07-e2', type: 'mc', difficulty: 2, points: 10, prompt: 'Com §strict§ ligado, qual é o tipo da variável §err§ em §try { ... } catch (err) { ... }§?', options: ['any', 'Error', 'unknown', 'never'], answer: 2, explanation: 'useUnknownInCatchVariables (parte do strict) torna a variável unknown, porque em JavaScript qualquer valor pode ser lançado. Estreite com instanceof Error antes de ler err.message.' },
  { id: 'ts-07-e3', type: 'match', difficulty: 1, points: 10, prompt: 'Associe cada recurso ao seu papel.', pairs: [['strict', 'Liga a família de verificações estritas'], ['noEmit', 'Só checa os tipos, sem gerar arquivos'], ['noUncheckedIndexedAccess', 'Acrescenta undefined aos acessos por índice'], ['import type', 'Importa só tipos e some do JavaScript emitido']], explanation: 'São opções e recursos de configuração e módulos do dia a dia em projetos TypeScript.' },
  { id: 'ts-07-e4', type: 'bug', difficulty: 2, points: 10, prompt: 'A função promete devolver um §Usuario§ validado, mas pode devolver qualquer coisa que a API enviar. Clique na linha problemática.', code: "interface Usuario { nome: string; idade: number }\nasync function carregar(url: string): Promise<Usuario> {\n  const resp = await fetch(url);\n  return (await resp.json()) as Usuario;\n}", answer: 4, explanation: 'O "as Usuario" só afirma o tipo; nada confere o formato recebido. O correto é receber unknown, validar (com guards ou uma biblioteca) e só então devolver Usuario, ou um erro.' },
  { id: 'ts-07-e5', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente o guard §ehPedido(v)§, que devolve §true§ somente se §v§ for um objeto simples (não null, não array) com: §id§ inteiro maior que zero; §itens§ array **não vazio** de objetos simples, cada um com §sku§ (texto não vazio depois de §trim§) e §qtd§ (inteiro maior que zero); §cupom§ opcional, mas, se existir, precisa ser texto. Campos extras são permitidos. A função nunca lança erro, qualquer que seja a entrada.', lang: 'javascript',
    starter: "function ehPedido(v) {\n  // seu código aqui\n}\n",
    tests: [
      { name: 'pedidos válidos', code: R`assert.equal(ehPedido({ id: 1, itens: [{ sku: 'A1', qtd: 2 }] }), true);
assert.equal(ehPedido({ id: 7, itens: [{ sku: 'A', qtd: 1 }, { sku: 'B', qtd: 3 }], cupom: 'PROMO', extra: true }), true);` },
      { name: 'raiz inválida', code: R`for (const v of [null, undefined, 5, 'x', [], true, () => 1]) assert.equal(ehPedido(v), false);` },
      { name: 'id inválido', code: R`for (const id of [0, -1, 1.5, '1', NaN, undefined, null]) assert.equal(ehPedido({ id, itens: [{ sku: 'A', qtd: 1 }] }), false, String(id));` },
      { name: 'itens inválidos', code: R`for (const itens of [undefined, null, [], 'x', {}, [null], [5], [[]], [{ sku: 'A' }], [{ qtd: 1 }]]) assert.equal(ehPedido({ id: 1, itens }), false, JSON.stringify(itens));` },
      { name: 'campos dos itens', code: R`for (const it of [{ sku: '', qtd: 1 }, { sku: '  ', qtd: 1 }, { sku: 1, qtd: 1 }, { sku: 'A', qtd: 0 }, { sku: 'A', qtd: 1.5 }, { sku: 'A', qtd: '2' }, { sku: 'A', qtd: -1 }, { sku: 'A', qtd: NaN }]) assert.equal(ehPedido({ id: 1, itens: [it] }), false, JSON.stringify(it));` },
      { name: 'um item inválido invalida o pedido', code: R`assert.equal(ehPedido({ id: 1, itens: [{ sku: 'A', qtd: 1 }, { sku: 'B', qtd: 0 }] }), false);` },
      { name: 'cupom opcional, mas tipado', code: R`assert.equal(ehPedido({ id: 1, itens: [{ sku: 'A', qtd: 1 }], cupom: undefined }), true);
assert.equal(ehPedido({ id: 1, itens: [{ sku: 'A', qtd: 1 }], cupom: 10 }), false);
assert.equal(ehPedido({ id: 1, itens: [{ sku: 'A', qtd: 1 }], cupom: null }), false);` },
      { name: 'nunca lança erro', code: R`const hostil = new Proxy({}, { get() { throw new Error('boom'); } });
let lancou = false; try { ehPedido(hostil); } catch { lancou = true; }
assert.equal(lancou, false);` }
    ],
    hints: ['Escreva ehObjeto(v) primeiro e reaproveite.', 'Number.isInteger resolve inteiro, NaN e texto de uma vez.', 'Para nunca lançar, envolva a checagem em try/catch e devolva false.'],
    solution: R`function ehObjeto(v) {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
function ehPedido(v) {
  try {
    if (!ehObjeto(v)) return false;
    if (!Number.isInteger(v.id) || v.id <= 0) return false;
    if (v.cupom !== undefined && typeof v.cupom !== 'string') return false;
    if (!Array.isArray(v.itens) || v.itens.length === 0) return false;
    return v.itens.every((i) => ehObjeto(i) && typeof i.sku === 'string' && i.sku.trim() !== '' && Number.isInteger(i.qtd) && i.qtd > 0);
  } catch {
    return false;
  }
}`, explanation: 'Um guard confere, em runtime, tudo o que o tipo promete. No TypeScript, o retorno seria "v is Pedido": o compilador confiaria nesse teste, por isso ele precisa cobrir cada campo, inclusive os casos de borda.' },
  { id: 'ts-07-e6', type: 'open', difficulty: 3, points: 15, prompt: 'Seu front-end consome uma API REST que você não controla. Descreva como tipar e proteger a fronteira entre a API e o resto do código em TypeScript.', model: 'Tratar a resposta como unknown e validar antes de usar, em um único ponto de entrada (um cliente de API ou camada de acesso). A validação pode ser um conjunto de guards ou uma biblioteca de schemas; ela devolve o dado já com o tipo certo (ou um erro descrito, como um Result). O restante do código só recebe tipos já validados, sem usar "as" na resposta. Tipos derivados (Pick, Omit, ReturnType) partem de um tipo único do domínio. Tratar erros de rede e de status (resp.ok) e usar unknown no catch. Se o formato mudar, a validação acusa a falha na fronteira, e não em outro lugar do sistema.', rubric: ['Recebe a resposta como unknown em vez de usar "as"', 'Valida em runtime em um ponto único (guards ou schemas)', 'Entrega ao resto do código um tipo já validado ou um erro explícito', 'Cita tratamento de erros (status da resposta e catch com unknown)'], explanation: 'A fronteira concentra a desconfiança: dentro dela, os tipos podem ser confiáveis porque foram verificados na entrada.' }
]
};

export const assessment = {
  id: 'typescript-fundamentos', title: 'Prova final — TypeScript: fundamentos e recursos avançados', passPct: 70, minutes: 45,
  items: [
    { id: 'ts-av-01', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual afirmação descreve corretamente a relação entre TypeScript e JavaScript em execução?', options: ['O TypeScript valida os tipos a cada execução', 'Os tipos são apagados na compilação; em runtime roda JavaScript sem tipos', 'O navegador entende TypeScript e checa os tipos ao carregar', 'Os tipos viram objetos que podem ser consultados com instanceof'], answer: 1, explanation: 'O compilador checa e apaga os tipos. Interfaces e aliases não existem em runtime.' },
    { id: 'ts-av-02', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual é a diferença essencial entre §any§ e §unknown§?', options: ['Nenhuma, são sinônimos', 'any desliga a checagem; unknown aceita qualquer valor mas exige estreitar antes de usar', 'unknown só aceita objetos', 'any só existe em arquivos .js'], answer: 1, explanation: 'unknown é a versão segura de "qualquer valor": nada pode ser feito com ele antes de verificar seu tipo.' },
    { id: 'ts-av-03', type: 'tf', difficulty: 2, points: 5, prompt: 'Por tipagem estrutural, um objeto com os campos exigidos por uma interface é aceito mesmo sem declarar que a implementa.', answer: true, explanation: 'A compatibilidade depende da forma (campos e tipos), não do nome. A checagem de excesso só vale para literais atribuídos diretamente.' },
    { id: 'ts-av-04', type: 'trace', difficulty: 2, points: 10, prompt: 'Informe os tipos (modo strict).', code: "type Forma =\n  | { kind: 'c'; raio: number }\n  | { kind: 'q'; lado: number };\nfunction f(x: Forma) {\n  if (x.kind === 'c') {\n    return x.raio;\n  }\n  return x.lado;\n}", lang: 'typescript', steps: [ { q: 'Tipo de x dentro do if', answers: ["{ kind: 'c'; raio: number }", "{ kind: 'c', raio: number }", "{kind: 'c'; raio: number}", 'o membro c', 'círculo', 'circulo'] }, { q: 'Tipo de retorno de f', answers: ['number'] } ], explanation: 'O teste da tag estreita para o membro "c" dentro do if. Depois dele sobra o membro "q". Os dois retornos são number.' },
    { id: 'ts-av-05', type: 'match', difficulty: 2, points: 10, prompt: 'Associe cada tipo ao resultado.', pairs: [["Partial<{ a: number }>", '{ a?: number }'], ["keyof { x: 1; y: 2 }", "'x' | 'y'"], ["Exclude<'a' | 'b', 'a'>", "'b'"], ["NonNullable<string | null>", 'string']], explanation: 'Partial torna opcional; keyof dá as chaves; Exclude remove membros da união; NonNullable remove null e undefined.' },
    { id: 'ts-av-06', type: 'bug', difficulty: 2, points: 10, prompt: 'O compilador rejeita uma linha deste código. Clique nela.', code: "interface Usuario { readonly id: number; nome: string }\nconst u: Usuario = { id: 1, nome: 'Ana' };\nu.nome = 'Bia';\nu.id = 2;\nconsole.log(u);", answer: 4, explanation: 'id é readonly e não pode ser reatribuído. nome pode ser alterado.' },
    { id: 'ts-av-07', type: 'mc', difficulty: 3, points: 10, prompt: 'Em qual situação overloads são mais adequados que um parâmetro com tipo união?', options: ['Quando a função devolve sempre o mesmo tipo', 'Quando o tipo de retorno depende do tipo do argumento', 'Quando a função recebe dois argumentos', 'Sempre, porque são mais flexíveis'], answer: 1, explanation: 'Overloads relacionam entrada e saída (string → string, number → number). Se o retorno é o mesmo, uma união basta.' },
    { id: 'ts-av-08', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual declaração torna §saldo§ inacessível de fora da classe **também em runtime**?', options: ['private saldo = 0;', 'protected saldo = 0;', '#saldo = 0;', 'readonly saldo = 0;'], answer: 2, explanation: 'Só #campo é privado de verdade. private do TypeScript é checado apenas na compilação.' },
    { id: 'ts-av-09', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete a função genérica que só aceita chaves existentes no objeto.', code: "function pegar<T, K [[0]] keyof T>(obj: T, chave: K): [[1]] {\n  return obj[chave];\n}", lang: 'typescript', answers: [['extends'], ['T[K]']], explanation: 'K extends keyof T restringe a chave ao conjunto de chaves de T; o retorno T[K] é o tipo exato da propriedade escolhida.' },
    { id: 'ts-av-10', type: 'tf', difficulty: 2, points: 5, prompt: 'Com §useUnknownInCatchVariables§ (parte do strict), é necessário estreitar a variável do catch (por exemplo, com instanceof Error) antes de ler §err.message§.', answer: true, explanation: 'A variável do catch é unknown, pois em JavaScript qualquer valor pode ser lançado.' },
    { id: 'ts-av-11', type: 'trace', difficulty: 3, points: 10, prompt: 'Este código compila sem erros no modo strict. Informe o que cada linha imprime ao executar o JavaScript gerado.', code: "const dados = JSON.parse('{\"idade\": \"30\"}') as { idade: number };\nconsole.log(typeof dados.idade);\nconsole.log(dados.idade + 1);", lang: 'typescript', steps: [ { q: 'O que a linha 2 imprime?', answers: ['string', '"string"', "'string'"] }, { q: 'O que a linha 3 imprime?', answers: ['301', '"301"', "'301'"] } ], explanation: 'O "as" só afirma o tipo ao compilador. Em runtime, idade é o texto "30": typeof dá "string" e a soma concatena, resultando em "301". Dados externos precisam de validação em runtime.' },
    { id: 'ts-av-12', type: 'open', difficulty: 3, points: 15, prompt: 'Explique por que "TypeScript garante que o formato da resposta da API está correto" é uma afirmação falsa, e o que fazer a respeito.', model: 'O TypeScript verifica tipos em tempo de compilação e depois os apaga. Em runtime, a resposta que chega pela rede pode ter qualquer formato, e JSON.parse e resp.json() devolvem any. Escrever "as Tipo" apenas afirma o formato ao compilador, sem conferir. Para ter garantia, é preciso validar em runtime: receber como unknown, conferir cada campo (guards ou uma biblioteca de schemas) e só então tratar como o tipo esperado, devolvendo um erro descrito quando o formato não bater. Fazer isso em um ponto único (a fronteira) deixa o resto do código confiável.', rubric: ['Explica que os tipos são apagados e não existem em runtime', 'Diz que JSON.parse e resp.json() devolvem any e que "as" só afirma', 'Propõe validar em runtime (unknown + guards ou schemas)', 'Sugere concentrar a validação em um ponto de entrada'], explanation: 'A garantia vem da validação feita na fronteira, não do sistema de tipos.' }
  ]
};

export const project = {
  id: 'validador-tipado', name: 'Validador de dados com tipos inferidos', lv: 'M', stack: 'TypeScript (módulos, generics e tipos condicionais) com núcleo testável em JavaScript', ds: ['ts', 'js'],
  desc: 'Bibliotecas como Zod e Valibot resolvem o problema central do TypeScript: tipos não validam dados em runtime. Construa um mini validador. Um esquema descreve o formato esperado; a função §validar§ confere o dado em runtime e devolve o valor limpo ou todos os erros com o caminho de cada um. Depois, em TypeScript, derive o tipo do dado a partir do próprio esquema, de modo que esquema e tipo nunca divirjam.',
  rf: ['criarValidador(schema) devolve uma função validar(valor)', 'O esquema aceita "string", "number" e "boolean", com sufixos "[]" (lista) e "?" (opcional), como em "number[]?"', 'Uma lista de textos (["admin", "user"]) define um conjunto de valores permitidos; um objeto define um esquema aninhado', 'validar devolve { ok: true, valor } com um objeto novo só com as chaves do esquema, ou { ok: false, erros } com todos os erros { caminho, mensagem }', 'Caminhos como "endereco.cidade" e "tags[1]"; erro de raiz tem caminho vazio', 'Esquemas inválidos lançam erro ao criar o validador, não ao validar', 'Em TypeScript: tipo Inferido<Esquema> calculado a partir do esquema (mapped e conditional types)'],
  rnf: ['Não altera o dado de entrada', 'Valida em tempo linear no tamanho do dado', 'Sem dependências externas', 'Mensagens de erro claras', 'tsconfig com strict e noUncheckedIndexedAccess'],
  ac: ['Todos os testes automatizados do laboratório passam', 'O tipo Inferido produz o formato esperado para pelo menos três esquemas de exemplo (verificado com tsc --noEmit)', 'Há testes para dados válidos, inválidos, opcionais, listas e aninhados', 'Um README explica a diferença entre o tipo (compilação) e o validador (runtime)'],
  ch: ['Coletar todos os erros sem parar no primeiro', 'Distinguir campo ausente de campo com null', 'Derivar o tipo com mapped e conditional types (Inferido<Esquema>)', 'Extensão: valores padrão por campo', 'Extensão: validadores personalizados (função por campo)'],
  lab: { lang: 'javascript',
    prompt: 'Implemente §criarValidador(schema)§, que devolve §validar(valor)§. O §schema§ é um objeto cujas chaves apontam para uma especificação: um texto §"string"§, §"number"§ ou §"boolean"§, com os sufixos opcionais §"[]"§ (lista) e §"?"§ (campo opcional), nessa ordem (§"string[]?"§); uma **lista de textos** (conjunto de valores permitidos, obrigatório); ou um **objeto** (esquema aninhado, obrigatório). Números precisam ser finitos. §validar§ devolve §{ ok: true, valor }§, com um objeto **novo** contendo só as chaves do esquema (campos opcionais ausentes ficam de fora; listas são copiadas), ou §{ ok: false, erros }§ com **todos** os problemas, cada um §{ caminho, mensagem }§ (§mensagem§ é um texto não vazio). Caminhos: §"nome"§, §"endereco.cidade"§, §"tags[1]"§; se o valor recebido não for um objeto simples, um único erro com §caminho§ vazio (§""§). Campo obrigatório ausente (§undefined§) é erro; §null§ nunca é válido. Uma especificação inválida lança erro ao **criar** o validador.',
    starter: "function criarValidador(schema) {\n  // compile o esquema uma vez e devolva a função validar\n  return function validar(valor) {\n    return { ok: false, erros: [] };\n  };\n}\n",
    tests: [
      { name: 'dado válido: valor limpo e sem campos extras', code: R`const v = criarValidador({ nome: 'string', idade: 'number', ativo: 'boolean' });
const r = v({ nome: 'Ana', idade: 30, ativo: true, extra: 'x' });
assert.equal(r.ok, true);
assert.deepEqual(r.valor, { nome: 'Ana', idade: 30, ativo: true });` },
      { name: 'campos opcionais', code: R`const v = criarValidador({ nome: 'string', apelido: 'string?', notas: 'number[]?' });
const a = v({ nome: 'Ana' }); assert.equal(a.ok, true); assert.deepEqual(a.valor, { nome: 'Ana' }); assert.equal('apelido' in a.valor, false);
const b = v({ nome: 'Ana', apelido: 'A', notas: [1, 2] }); assert.deepEqual(b.valor, { nome: 'Ana', apelido: 'A', notas: [1, 2] });
const c = v({ nome: 'Ana', apelido: undefined }); assert.equal(c.ok, true);` },
      { name: 'coleta todos os erros com caminho', code: R`const v = criarValidador({ nome: 'string', idade: 'number', ativo: 'boolean' });
const r = v({ nome: 5, ativo: 'sim' });
assert.equal(r.ok, false);
const caminhos = r.erros.map((e) => e.caminho).sort();
assert.deepEqual(caminhos, ['ativo', 'idade', 'nome']);
for (const e of r.erros) { assert.equal(typeof e.mensagem, 'string'); assert.ok(e.mensagem.length > 0); }` },
      { name: 'objetos aninhados', code: R`const v = criarValidador({ nome: 'string', endereco: { cidade: 'string', cep: 'string?', geo: { lat: 'number', lng: 'number' } } });
const ok = v({ nome: 'A', endereco: { cidade: 'SP', geo: { lat: 1, lng: 2 }, lixo: 1 } });
assert.equal(ok.ok, true); assert.deepEqual(ok.valor, { nome: 'A', endereco: { cidade: 'SP', geo: { lat: 1, lng: 2 } } });
const r = v({ nome: 'A', endereco: { cidade: 3, geo: { lat: 'x' } } });
assert.deepEqual(r.erros.map((e) => e.caminho).sort(), ['endereco.cidade', 'endereco.geo.lat', 'endereco.geo.lng']);
const s = v({ nome: 'A' }); assert.deepEqual(s.erros.map((e) => e.caminho), ['endereco']);
const t = v({ nome: 'A', endereco: 'rua' }); assert.deepEqual(t.erros.map((e) => e.caminho), ['endereco']);` },
      { name: 'listas', code: R`const v = criarValidador({ tags: 'string[]', notas: 'number[]?' });
const ok = v({ tags: ['a', 'b'] }); assert.equal(ok.ok, true);
const r = v({ tags: ['a', 2, 'c', null], notas: [1, 'x'] });
assert.deepEqual(r.erros.map((e) => e.caminho).sort(), ['notas[1]', 'tags[1]', 'tags[3]']);
const s = v({ tags: 'a' }); assert.deepEqual(s.erros.map((e) => e.caminho), ['tags']);
assert.equal(v({ tags: [] }).ok, true);` },
      { name: 'conjunto de valores permitidos', code: R`const v = criarValidador({ papel: ['admin', 'editor', 'leitor'] });
assert.equal(v({ papel: 'admin' }).ok, true);
const r = v({ papel: 'root' }); assert.equal(r.ok, false); assert.deepEqual(r.erros.map((e) => e.caminho), ['papel']);
assert.equal(v({}).ok, false); assert.equal(v({ papel: 1 }).ok, false);` },
      { name: 'obrigatório ausente, null e números inválidos', code: R`const v = criarValidador({ a: 'string', n: 'number', o: 'string?' });
assert.deepEqual(v({ n: 1 }).erros.map((e) => e.caminho), ['a']);
assert.equal(v({ a: null, n: 1 }).ok, false);
assert.equal(v({ a: 'x', n: 1, o: null }).ok, false);
for (const n of [NaN, Infinity, -Infinity, '1']) assert.equal(v({ a: 'x', n }).ok, false, String(n));
assert.equal(v({ a: 'x', n: 0 }).ok, true); assert.equal(v({ a: '', n: -5 }).ok, true);` },
      { name: 'raiz precisa ser objeto simples', code: R`const v = criarValidador({ a: 'string' });
for (const x of [null, undefined, 5, 'texto', [], true]) { const r = v(x); assert.equal(r.ok, false); assert.equal(r.erros.length, 1); assert.equal(r.erros[0].caminho, ''); }` },
      { name: 'não altera a entrada e copia listas', code: R`const v = criarValidador({ tags: 'string[]', nome: 'string' });
const entrada = { tags: ['a', 'b'], nome: 'x', extra: 1 };
const antes = JSON.stringify(entrada);
const r = v(entrada);
assert.equal(JSON.stringify(entrada), antes);
assert.ok(r.valor.tags !== entrada.tags); assert.deepEqual(r.valor.tags, ['a', 'b']);` },
      { name: 'esquemas inválidos lançam ao criar', code: R`assert.throws(() => criarValidador({ a: 'texto' }));
assert.throws(() => criarValidador({ a: 'string??' }));
assert.throws(() => criarValidador({ a: '?string' }));
assert.throws(() => criarValidador({ a: 42 }));
assert.throws(() => criarValidador({ a: null }));
assert.throws(() => criarValidador({ a: { b: 'nada' } }));
assert.throws(() => criarValidador(null));
assert.throws(() => criarValidador('string'));` },
      { name: 'o mesmo validador serve várias vezes e é rápido', code: R`const v = criarValidador({ id: 'number', nome: 'string', tags: 'string[]', end: { cidade: 'string' } });
const t = Date.now(); let oks = 0;
for (let i = 0; i < 20000; i++) if (v({ id: i, nome: 'n' + i, tags: ['a', 'b', 'c'], end: { cidade: 'x' } }).ok) oks++;
assert.equal(oks, 20000); assert.ok(Date.now() - t < 1500, 'lento: ' + (Date.now() - t) + ' ms');` }
    ],
    solution: R`const ehObjeto = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);
const primitivos = {
  string: (v) => typeof v === 'string',
  number: (v) => typeof v === 'number' && Number.isFinite(v),
  boolean: (v) => typeof v === 'boolean'
};

function compilar(spec, local) {
  if (typeof spec === 'string') {
    const m = /^(string|number|boolean)(\[\])?(\?)?$/.exec(spec);
    if (!m) throw new Error('especificação inválida em ' + local + ': ' + spec);
    const tipo = m[1];
    const lista = !!m[2];
    const teste = primitivos[tipo];
    return {
      opcional: !!m[3],
      checar(v, caminho, erros) {
        if (!lista) {
          if (!teste(v)) { erros.push({ caminho, mensagem: 'esperado ' + tipo }); return undefined; }
          return v;
        }
        if (!Array.isArray(v)) { erros.push({ caminho, mensagem: 'esperada uma lista de ' + tipo }); return undefined; }
        const saida = [];
        v.forEach((x, i) => {
          if (teste(x)) saida.push(x);
          else erros.push({ caminho: caminho + '[' + i + ']', mensagem: 'esperado ' + tipo });
        });
        return saida;
      }
    };
  }
  if (Array.isArray(spec)) {
    if (!spec.length || !spec.every((x) => typeof x === 'string')) throw new Error('lista de valores inválida em ' + local);
    return {
      opcional: false,
      checar(v, caminho, erros) {
        if (typeof v !== 'string' || !spec.includes(v)) { erros.push({ caminho, mensagem: 'esperado um de: ' + spec.join(', ') }); return undefined; }
        return v;
      }
    };
  }
  if (ehObjeto(spec)) {
    const filhos = Object.entries(spec).map(([nome, s]) => [nome, compilar(s, local ? local + '.' + nome : nome)]);
    return {
      opcional: false,
      checar(v, caminho, erros) {
        if (!ehObjeto(v)) { erros.push({ caminho, mensagem: 'esperado um objeto' }); return undefined; }
        const saida = {};
        for (const [nome, c] of filhos) {
          const cam = caminho ? caminho + '.' + nome : nome;
          const x = v[nome];
          if (x === undefined) {
            if (!c.opcional) erros.push({ caminho: cam, mensagem: 'campo obrigatório' });
            continue;
          }
          const r = c.checar(x, cam, erros);
          if (r !== undefined) saida[nome] = r;
        }
        return saida;
      }
    };
  }
  throw new Error('especificação inválida em ' + (local || 'raiz'));
}

function criarValidador(schema) {
  if (!ehObjeto(schema)) throw new TypeError('o esquema deve ser um objeto');
  const raiz = compilar(schema, '');
  return function validar(valor) {
    const erros = [];
    const saida = raiz.checar(valor, '', erros);
    return erros.length ? { ok: false, erros } : { ok: true, valor: saida };
  };
}`
  }
};
