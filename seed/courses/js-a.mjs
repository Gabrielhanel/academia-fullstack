// Curso 4 — JavaScript: fundamentos, DOM e módulos. Aulas 1 a 4.
const R = String.raw;

export const REF = {
  scripting: { title: 'MDN — Dynamic scripting with JavaScript (Learn web development)', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting', kind: 'course' },
  equality: { title: 'MDN — Equality comparisons and sameness', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Equality_comparisons_and_sameness', kind: 'doc' },
  closures: { title: 'MDN — Closures', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures', kind: 'doc' },
  promises: { title: 'MDN — Using promises', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises', kind: 'doc' },
  eventLoop: { title: 'MDN — JavaScript execution model (event loop)', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop', kind: 'doc' },
  dom: { title: 'MDN — Document Object Model (DOM)', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Using_the_Document_Object_Model', kind: 'doc' },
  events: { title: 'MDN — Introduction to events', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Events', kind: 'doc' },
  modules: { title: 'MDN — JavaScript modules', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules', kind: 'doc' }
};

export const lessonsA = [
{
  id: 'js-01', moduleId: 'm1', order: 1, minutes: 65, tags: ['javascript', 'tipos', 'variaveis', 'operadores'],
  title: 'Valores, tipos, variáveis e operadores',
  objectives: ['Declarar variáveis com const e let e explicar por que evitar var', 'Reconhecer os tipos primitivos e o typeof', 'Prever resultados de coerção de tipos e usar === por padrão', 'Usar template strings, operadores lógicos e o operador ??'],
  intro: `JavaScript é a linguagem da web e roda também no servidor. Antes de funções e DOM, vale dominar o chão: o que são valores, quais tipos existem e por que \`"5" + 3\` e \`"5" - 3\` dão resultados diferentes. A maior parte dos bugs de iniciantes nasce daqui.`,
  theory: `### Como rodar JavaScript
No navegador, a tag §<script>§ executa o código; as ferramentas de desenvolvimento (tecla F12) têm um console para testar. No servidor, o Node.js executa arquivos com §node arquivo.js§. Neste curso, os exercícios rodam em um ambiente isolado dentro da própria Academia, e §console.log()§ mostra valores na saída.

### Variáveis: const, let e var
- §const§: o nome **não pode ser reatribuído**. Use por padrão.
- §let§: pode ser reatribuída. Use quando o valor muda (contadores, acumuladores).
- §var§: forma antiga, com escopo de função e comportamentos surpreendentes (veja a aula de closures). Evite em código novo.
Cuidado: §const§ impede reatribuir o **nome**, não alterar o **conteúdo** de um objeto ou array.

### Tipos primitivos
§number§ (inteiros e decimais, incluindo §NaN§ e §Infinity§), §string§, §boolean§, §undefined§ (valor ainda não definido), §null§ (ausência intencional), §bigint§ e §symbol§. Todo o resto é **objeto**: arrays, funções, datas, objetos literais.
O operador §typeof§ devolve o tipo como texto, com dois tropeços famosos: §typeof null§ é §"object"§ (um erro histórico da linguagem) e arrays também dão §"object"§ (use §Array.isArray(x)§).

### Números e a imprecisão do ponto flutuante
Números são representados em ponto flutuante binário: §0.1 + 0.2§ dá §0.30000000000000004§. Para dinheiro, trabalhe em **centavos** (inteiros) ou use §toFixed§ só para exibir. §Number.isNaN(x)§ testa NaN; §NaN === NaN§ é §false§.

### Strings
Aspas simples, duplas ou crase. **Template strings** (§\`Olá, \DOLAR{nome}!\`§) interpolam expressões e aceitam várias linhas. Strings são **imutáveis**: métodos como §toUpperCase()§, §trim()§, §slice()§, §includes()§, §split()§ devolvem **novas** strings.

### Conversão e coerção
- Conversão explícita: §Number("42")§, §String(42)§, §Boolean(x)§, §parseInt("42px", 10)§.
- **Coerção implícita**: §"5" + 3§ é §"53"§ (o + concatena se algum lado é string), mas §"5" - 3§ é §2§ (a subtração converte para número).
- **Falsy** (viram false em contexto booleano): §false§, §0§, §""§, §null§, §undefined§, §NaN§ (e §0n§). Todo o resto é **truthy**, inclusive §"0"§, §[]§ e §{}§.

### Igualdade
Segundo a MDN: §==§ faz conversão de tipos e §===§ não; §===§ é "quase sempre a comparação correta". §0 == "0"§ é §true§, mas §0 === "0"§ é §false§; §null == undefined§ é §true§, mas §null === undefined§ é §false§. §NaN§ não é igual a nada, nem a si mesmo, nem com §Object.is§ ser a exceção (§Object.is(NaN, NaN)§ é §true§). Use §===§ e §!==§ por padrão.

### Operadores lógicos e atalhos
- §&&§ devolve o primeiro valor falsy ou o último; §||§ devolve o primeiro truthy ou o último.
- §??§ (coalescência nula) usa o valor da direita **só quando a esquerda é null ou undefined**: §0 ?? 10§ é §0§, enquanto §0 || 10§ é §10§.
- §?.§ (encadeamento opcional): §usuario?.endereco?.cidade§ não lança erro se algo no caminho for null/undefined.
- Operador ternário: §condicao ? a : b§.`,
  concepts: [
    { term: 'const', def: 'Declara uma variável cujo nome não pode ser reatribuído (o conteúdo de um objeto ainda pode mudar).' },
    { term: 'Tipos primitivos', def: 'number, string, boolean, undefined, null, bigint e symbol; imutáveis e comparados por valor.' },
    { term: 'Coerção', def: 'Conversão automática de tipos feita pela linguagem em certas operações.' },
    { term: 'Falsy', def: 'Valor tratado como falso em contexto booleano: false, 0, "", null, undefined, NaN.' },
    { term: '=== versus ==', def: '=== compara sem converter tipos; == converte antes de comparar.' },
    { term: '??', def: 'Operador que devolve o lado direito apenas se o esquerdo for null ou undefined.' },
    { term: 'Template string', def: 'String entre crases que interpola expressões com ${...}.' }
  ],
  examples: `**Analogia:** variáveis são etiquetas coladas em caixas. \`const\` cola uma etiqueta que não pode ser movida para outra caixa; o que está dentro da caixa (se for um objeto) ainda pode mudar. Tipos são os formatos das caixas: números, textos, sim/não.

**Armadilhas do dia a dia:**

    "5" + 3        // "53"  (concatena)
    "5" - 3        // 2     (converte)
    0 || 10        // 10    (0 é falsy)
    0 ?? 10        // 0     (0 não é nulo)
    typeof null    // "object" (erro histórico)`,
  code: [
    { title: 'Variáveis, tipos e template strings', lang: 'javascript', code: R`const nome = 'Ana';
let pontos = 0;
pontos += 10;

console.log(typeof nome, typeof pontos, typeof null, typeof [], Array.isArray([]));
console.log(§DOLAR{nome} tem DOLAR{pontos} pontos§);
console.log(0.1 + 0.2 === 0.3, Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON);`,
      notes: [ { l: '1-3', t: 'const para o que não muda; let para o que muda. += soma e reatribui.' }, { l: '5', t: 'Mostra os tropeços do typeof: null e array dão "object"; Array.isArray resolve o segundo.' }, { l: '6', t: 'A crase permite interpolar com ${}.' }, { l: '7', t: 'Compare decimais com tolerância, não com ===.' } ] },
    { title: 'Coerção e igualdade', lang: 'javascript', code: R`console.log('5' + 3, '5' - 3);
console.log(0 == '0', 0 === '0');
console.log(null == undefined, null === undefined);
console.log(0 || 10, 0 ?? 10);

const config = { tema: null };
console.log(config.tema ?? 'claro');
console.log(config.usuario?.nome);`,
      notes: [ { l: '1', t: 'O + concatena quando há string; o - converte para número.' }, { l: '2-3', t: '== converte tipos e === não.' }, { l: '4', t: '|| trata 0 como "vazio"; ?? só reage a null e undefined.' }, { l: '7-8', t: '?? entrega o valor padrão; ?. evita erro ao acessar propriedade de algo inexistente e devolve undefined.' } ] },
    { title: 'Descobrindo o tipo "de verdade"', lang: 'javascript', code: R`function tipoReal(valor) {
  if (valor === null) return 'null';
  if (Array.isArray(valor)) return 'array';
  if (typeof valor === 'number' && Number.isNaN(valor)) return 'nan';
  return typeof valor;
}

console.log(['x', 3, NaN, null, [], {}, undefined].map(tipoReal));
// ['string', 'number', 'nan', 'null', 'array', 'object', 'undefined']`,
      notes: [ { l: '2-4', t: 'Trata os casos em que typeof engana: null, arrays e NaN.' }, { l: '8', t: 'map aplica a função a cada elemento do array.' } ] }
  ],
  bestPractices: ['Use const por padrão e let quando precisar reatribuir; evite var.', 'Compare com === e !==.', 'Use ?? para valores padrão quando 0, "" e false são válidos.', 'Trabalhe com dinheiro em centavos (inteiros).', 'Converta tipos explicitamente (Number, String) em vez de confiar na coerção.', 'Use Number.isNaN e Array.isArray para os casos que o typeof não resolve.'],
  mistakes: ['Usar == e se surpreender com conversões.', 'Achar que const torna o objeto imutável.', 'Comparar NaN com ===.', 'Usar || para valor padrão e descartar um 0 legítimo.', 'Somar string com número esperando uma soma.', 'Comparar decimais com === (0.1 + 0.2).'],
  market: `Coerção e igualdade são perguntas clássicas de entrevista e a origem de uma fatia grande dos bugs reais em JavaScript. Quem entende tipos e escreve com === e ?? produz código mais previsível e é cobrado nisso em revisões de código.`,
  summary: `Use const por padrão e let quando for reatribuir. Os primitivos são number, string, boolean, undefined, null, bigint e symbol; o resto é objeto. typeof tem exceções (null, arrays). A coerção converte tipos de formas nem sempre óbvias: prefira === e conversões explícitas. ?? e ?. tratam null e undefined com segurança.`,
  refs: [REF.scripting, REF.equality],
  cards: [
    { q: 'Qual a diferença entre == e ===?', a: '== converte os tipos antes de comparar; === não converte.' },
    { q: 'O que 0 ?? 10 devolve? E 0 || 10?', a: '0 ?? 10 devolve 0 (0 não é nulo); 0 || 10 devolve 10 (0 é falsy).' },
    { q: 'const impede alterar o conteúdo de um array?', a: 'Não. Impede reatribuir o nome; o conteúdo do array ainda pode mudar.' },
    { q: 'Como testar se um valor é array?', a: 'Array.isArray(valor); typeof devolve "object".' }
  ]
},
{
  id: 'js-02', moduleId: 'm1', order: 2, minutes: 70, tags: ['javascript', 'funcoes', 'controle-de-fluxo', 'escopo'],
  title: 'Controle de fluxo e funções',
  objectives: ['Escrever condicionais e laços (for, for...of, while) com clareza', 'Declarar funções de várias formas e escolher entre elas', 'Usar parâmetros padrão, rest e spread', 'Explicar escopo de bloco e de função e o hoisting'],
  intro: `Funções são a unidade de construção em JavaScript: tudo o que você escreve passa por elas. Junto com condicionais e laços, formam o núcleo da lógica que você viu no curso de Lógica, agora na sintaxe da linguagem.`,
  theory: `### Condicionais
§if / else if / else§ para decisões; §switch§ para muitos casos de um mesmo valor (lembre do §break§); o ternário para escolhas curtas dentro de expressões. Use **early return** para evitar aninhamento: em vez de um grande §if§ envolvendo a função, saia cedo nos casos inválidos.

### Laços
- §for (let i = 0; i < n; i++)§: contagem controlada.
- §for (const item of lista)§: percorre os **valores** de um iterável (arrays, strings, Set, Map).
- §for (const chave in objeto)§: percorre **chaves** de um objeto; evite em arrays.
- §while§ e §do...while§: repetem enquanto uma condição for verdadeira; cuidado com laços infinitos.
- §break§ interrompe o laço; §continue§ pula para a próxima volta.

### Funções
Três formas principais:

    function soma(a, b) { return a + b; }          // declaração
    const soma2 = function (a, b) { return a + b; }; // expressão
    const soma3 = (a, b) => a + b;                  // arrow function

- **Declarações** sofrem *hoisting*: podem ser chamadas antes da linha em que aparecem. Expressões (e arrows) atribuídas a §const§ não.
- Uma função sem §return§ devolve §undefined§.
- **Arrow functions** têm sintaxe curta e não têm o seu próprio §this§ (aula 4).
- Funções são **valores**: podem ser guardadas em variáveis, passadas como argumento e devolvidas por outras funções. É a base da programação funcional e dos callbacks.

### Parâmetros
- **Padrão:** §function saudar(nome = 'visitante')§ usa o padrão quando o argumento é §undefined§.
- **Rest:** §function somar(...numeros)§ reúne os argumentos restantes em um array.
- **Spread:** §Math.max(...lista)§ espalha os elementos de um iterável como argumentos separados.
- Primitivos são passados por **valor**; objetos e arrays, por **referência** (a função pode alterar o objeto recebido).

### Escopo
- **Escopo de bloco** (§let§ e §const§): a variável só existe dentro das chaves onde foi declarada.
- **Escopo de função** (§var§): existe na função inteira.
- Funções internas enxergam as variáveis das externas (**escopo léxico**): a ponte para os closures.
- **Hoisting:** declarações são "içadas". Com §let§/§const§, acessar a variável antes da declaração lança erro (*temporal dead zone*); com §var§, devolve §undefined§.

### Funções puras
Uma função é **pura** se, com os mesmos argumentos, sempre devolve o mesmo resultado e não altera nada fora dela. São fáceis de testar e de entender. Prefira devolver um novo valor a alterar o argumento.

### Boas práticas de funções
Um nome que descreve a ação (§calcularTotal§), poucos parâmetros (até 3 ou 4; acima disso, use um objeto), uma responsabilidade por função e retorno consistente.`,
  concepts: [
    { term: 'Arrow function', def: 'Sintaxe curta de função (a, b) => a + b, sem this próprio.' },
    { term: 'Hoisting', def: 'Comportamento em que declarações são processadas antes da execução do código.' },
    { term: 'Escopo de bloco', def: 'Visibilidade limitada às chaves onde let ou const foi declarada.' },
    { term: 'Parâmetro rest', def: '...nome: reúne os argumentos restantes em um array.' },
    { term: 'Spread', def: '...lista: espalha os elementos de um iterável.' },
    { term: 'Função pura', def: 'Mesmo resultado para os mesmos argumentos e sem efeitos colaterais.' },
    { term: 'Early return', def: 'Sair da função cedo nos casos inválidos para evitar aninhamento.' }
  ],
  examples: `**Analogia:** uma função é uma receita: recebe ingredientes (parâmetros), segue passos e entrega um prato (retorno). Uma função pura é uma receita que, com os mesmos ingredientes, sempre entrega o mesmo prato e não suja a cozinha dos outros.

**Early return:**

    // aninhado                          // com early return
    function f(x) {                      function f(x) {
      if (x > 0) {                         if (x <= 0) return null;
        return Math.sqrt(x);               return Math.sqrt(x);
      } else { return null; }            }
    }`,
  code: [
    { title: 'Funções e parâmetros', lang: 'javascript', code: R`const somar = (...numeros) => numeros.reduce((a, n) => a + n, 0);

function saudar(nome = 'visitante', { formal = false } = {}) {
  return formal ? §Prezado(a) DOLAR{nome}§ : §Oi, DOLAR{nome}!§;
}

console.log(somar(1, 2, 3), somar());
console.log(saudar(), saudar('Ana', { formal: true }));
console.log(Math.max(...[4, 9, 2]));`,
      notes: [ { l: '1', t: 'Rest reúne os argumentos em um array; reduce com valor inicial 0 devolve 0 quando não há argumentos.' }, { l: '3', t: 'Parâmetro padrão para nome, e um objeto de opções com desestruturação e padrão {} para o segundo.' }, { l: '9', t: 'Spread espalha o array como argumentos de Math.max.' } ] },
    { title: 'Laços e early return', lang: 'javascript', code: R`function primeiroNegativo(lista) {
  for (const n of lista) {
    if (n < 0) return n;
  }
  return null;
}

console.log(primeiroNegativo([3, 8, -2, -9])); // -2
console.log(primeiroNegativo([1, 2]));          // null

let i = 0;
while (true) {
  i++;
  if (i % 2 === 0) continue;
  if (i > 7) break;
  console.log(i); // 1, 3, 5, 7
}`,
      notes: [ { l: '3', t: 'Early return dentro do laço: sai da função assim que acha.' }, { l: '12-14', t: 'continue pula os pares; break encerra o laço infinito controlado.' } ] },
    { title: 'Escopo e hoisting', lang: 'javascript', code: R`console.log(dobro(4));            // 8: declarações são içadas
function dobro(x) { return x * 2; }

try {
  console.log(triplo(4));
} catch (e) {
  console.log(e.name);             // ReferenceError: const não pode ser usada antes
}
const triplo = (x) => x * 3;

{
  let interno = 1;
}
console.log(typeof interno);       // 'undefined': não existe fora do bloco`,
      notes: [ { l: '1-2', t: 'A declaração de função é içada inteira.' }, { l: '4-7', t: 'const está na temporal dead zone até a linha da declaração: lança ReferenceError.' }, { l: '10-13', t: 'let existe só dentro das chaves.' } ] }
  ],
  bestPractices: ['Prefira funções pequenas, com um nome que descreve a ação.', 'Use early return para reduzir o aninhamento.', 'Use for...of para percorrer arrays; reserve o for clássico para quando precisa do índice.', 'Prefira funções puras: devolva valores novos em vez de alterar argumentos.', 'Use parâmetros padrão e um objeto de opções quando houver muitos parâmetros.', 'Sempre dê uma condição de parada clara aos laços.'],
  mistakes: ['Esquecer o return e receber undefined.', 'Esquecer o break em um switch.', 'Usar for...in para percorrer arrays.', 'Alterar o array ou objeto recebido sem perceber que ele é compartilhado.', 'Chamar uma arrow function antes de sua declaração.', 'Laços infinitos por condição que nunca muda.'],
  market: `Funções de primeira classe e callbacks estão no centro de todo o ecossistema JavaScript (React, Node, testes). Entrevistas técnicas começam quase sempre por problemas que exigem laços, condicionais e funções bem escritas.`,
  summary: `Condicionais e laços controlam o fluxo; for...of percorre valores. Funções podem ser declaradas, expressas ou arrow, e são valores. Parâmetros padrão, rest e spread dão flexibilidade. let e const têm escopo de bloco; declarações de função são içadas. Prefira funções puras e early return.`,
  refs: [REF.scripting, REF.closures],
  cards: [
    { q: 'O que um parâmetro rest faz?', a: 'Reúne os argumentos restantes em um array: function f(...itens).' },
    { q: 'Qual a diferença entre for...of e for...in?', a: 'for...of percorre os valores de um iterável; for...in percorre as chaves de um objeto.' },
    { q: 'O que acontece ao chamar uma const-arrow antes da declaração?', a: 'ReferenceError (temporal dead zone); só declarações function são içadas por inteiro.' }
  ]
},
{
  id: 'js-03', moduleId: 'm1', order: 3, minutes: 80, tags: ['javascript', 'arrays', 'objetos', 'json', 'funcional'],
  title: 'Arrays, objetos e métodos funcionais',
  objectives: ['Criar e manipular arrays e objetos', 'Usar map, filter, reduce, find, some, every e sort corretamente', 'Usar desestruturação, spread e cópia rasa versus profunda', 'Converter dados de e para JSON'],
  intro: `Quase todo dado em um programa é uma lista ou um conjunto de campos. Saber transformá-los com poucos métodos expressivos faz o código ficar mais curto e mais fácil de testar do que laços cheios de variáveis auxiliares.`,
  theory: `### Arrays
Listas ordenadas e indexadas a partir de 0. Métodos que **alteram** o array (mutadores): §push§, §pop§, §shift§, §unshift§, §splice§, §sort§, §reverse§. Métodos que **devolvem algo novo**: §slice§, §concat§, §map§, §filter§, §toSorted§, §toReversed§ (versões recentes do JavaScript; confira a compatibilidade no seu ambiente).

### Os métodos funcionais essenciais
- §map(fn)§: transforma cada elemento e devolve um array do mesmo tamanho.
- §filter(fn)§: mantém os elementos para os quais §fn§ devolve truthy.
- §reduce(fn, inicial)§: reduz a lista a **um** valor (soma, objeto, contagem). Passe sempre o valor inicial.
- §find(fn)§ / §findIndex(fn)§: primeiro elemento (ou índice) que satisfaz; §undefined§ (ou -1) se nenhum.
- §some(fn)§ / §every(fn)§: pelo menos um / todos satisfazem.
- §includes(x)§: tem o valor? §flat()§ e §flatMap()§: achatam níveis.
Eles se encadeiam: §itens.filter(ativo).map(preco).reduce(soma, 0)§.

### Ordenação
§sort()§ sem argumentos ordena como **texto**: §[10, 2, 1].sort()§ dá §[1, 10, 2]§. Para números, passe um comparador: §sort((a, b) => a - b)§. O comparador devolve negativo (a antes de b), zero ou positivo. O §sort§ **altera** o array original: copie antes (§[...lista].sort(...)§).

### Objetos
Conjuntos de pares chave-valor: §const pessoa = { nome: 'Ana', idade: 30 }§. Acesso por §pessoa.nome§ ou §pessoa['nome']§ (útil quando a chave está em uma variável). Funções úteis: §Object.keys§, §Object.values§, §Object.entries§ e §Object.fromEntries§. §delete§ remove uma chave; §in§ e §Object.hasOwn§ testam a existência.
Ao nomear uma propriedade com o mesmo nome de uma variável, use a forma curta: §{ nome, idade }§.

### Desestruturação e spread
    const { nome, idade = 18 } = pessoa;       // objeto, com padrão
    const [primeiro, , terceiro] = lista;      // array, ignorando o segundo
    const copia = { ...pessoa, idade: 31 };    // novo objeto, sobrescrevendo idade
    const todos = [...a, ...b];                // concatena arrays

### Referência e cópia
Objetos e arrays são **referências**: §const b = a§ não copia, apenas aponta para o mesmo objeto. O spread e §Object.assign§ fazem **cópia rasa**: objetos aninhados continuam compartilhados. Para cópia profunda, use §structuredClone(x)§ (disponível em navegadores e Node.js modernos). Prefira **atualizações imutáveis**: criar novos objetos em vez de alterar os existentes; isso evita bugs sutis e é a base de frameworks como o React.

### Map e Set
§Map§ guarda pares chave-valor com chaves de qualquer tipo e preserva a ordem de inserção; §Set§ guarda valores **únicos**. Remover duplicatas de um array: §[...new Set(lista)]§.

### JSON
Formato de texto para trocar dados. §JSON.stringify(obj)§ vira texto; §JSON.parse(texto)§ volta a objeto e **lança erro** se o texto for inválido (use §try/catch§). JSON não guarda funções, §undefined§ nem datas (viram texto).`,
  concepts: [
    { term: 'map', def: 'Transforma cada elemento e devolve um novo array do mesmo tamanho.' },
    { term: 'filter', def: 'Devolve um novo array só com os elementos que satisfazem a condição.' },
    { term: 'reduce', def: 'Reduz um array a um único valor, acumulando resultados.' },
    { term: 'Desestruturação', def: 'Sintaxe para extrair valores de arrays e objetos em variáveis.' },
    { term: 'Cópia rasa', def: 'Cópia que duplica o primeiro nível e compartilha os objetos aninhados.' },
    { term: 'Imutabilidade', def: 'Prática de criar novos valores em vez de alterar os existentes.' },
    { term: 'JSON', def: 'Formato de texto para representar dados, lido e escrito com JSON.parse e JSON.stringify.' }
  ],
  examples: `**Analogia:** map, filter e reduce são uma linha de produção. A esteira entrega cada peça (map transforma, filter descarta as defeituosas) e no final tudo é empacotado em uma caixa só (reduce).

**Exemplo:**

    const pedidos = [
      { item: 'caneta', preco: 3, qtd: 10, pago: true },
      { item: 'caderno', preco: 20, qtd: 2, pago: false },
      { item: 'lápis', preco: 1, qtd: 30, pago: true }
    ];
    const totalPago = pedidos.filter(p => p.pago).reduce((s, p) => s + p.preco * p.qtd, 0); // 60`,
  code: [
    { title: 'Transformando dados sem laços manuais', lang: 'javascript', code: R`const pedidos = [
  { item: 'caneta', preco: 3, qtd: 10, pago: true },
  { item: 'caderno', preco: 20, qtd: 2, pago: false },
  { item: 'lápis', preco: 1, qtd: 30, pago: true }
];

const nomes = pedidos.map((p) => p.item);
const pagos = pedidos.filter((p) => p.pago);
const total = pagos.reduce((soma, p) => soma + p.preco * p.qtd, 0);
const temCaro = pedidos.some((p) => p.preco > 10);

console.log(nomes, pagos.length, total, temCaro);
// ['caneta', 'caderno', 'lápis'] 2 60 true`,
      notes: [ { l: '7', t: 'map: um item para cada pedido.' }, { l: '9', t: 'reduce com valor inicial 0 acumula a soma.' }, { l: '10', t: 'some responde sim/não sem percorrer o resto após achar.' } ] },
    { title: 'Ordenação, cópia e imutabilidade', lang: 'javascript', code: R`const notas = [10, 2, 33, 4];
console.log([...notas].sort());                // [10, 2, 33, 4]  (como texto!)
console.log([...notas].sort((a, b) => a - b)); // [2, 4, 10, 33]
console.log(notas);                            // original intacto

const a = { nome: 'Ana', contato: { email: 'a@x.com' } };
const rasa = { ...a };
rasa.contato.email = 'novo@x.com';
console.log(a.contato.email);                  // 'novo@x.com' (compartilhado!)

const funda = structuredClone(a);
funda.contato.email = 'outro@x.com';
console.log(a.contato.email);                  // continua 'novo@x.com'`,
      notes: [ { l: '2', t: 'O sort padrão compara como texto: "10" vem antes de "2".' }, { l: '3', t: 'O comparador numérico resolve; a cópia com spread protege o original.' }, { l: '8', t: 'A cópia rasa compartilha o objeto aninhado.' }, { l: '11', t: 'structuredClone faz a cópia profunda.' } ] },
    { title: 'JSON com tratamento de erro', lang: 'javascript', code: R`function lerJson(texto, padrao = null) {
  try {
    return JSON.parse(texto);
  } catch {
    return padrao;
  }
}

console.log(lerJson('{"a":1}'));          // { a: 1 }
console.log(lerJson('{a:1}', {}));        // {} (JSON inválido)
console.log(JSON.stringify({ x: undefined, y: [1, 2], d: new Date(0) }));
// {"y":[1,2],"d":"1970-01-01T00:00:00.000Z"}`,
      notes: [ { l: '3-5', t: 'JSON.parse lança em texto inválido; o catch devolve um valor padrão.' }, { l: '11', t: 'undefined some, e a data vira texto.' } ] }
  ],
  bestPractices: ['Prefira map, filter e reduce a laços com variáveis auxiliares quando melhorar a leitura.', 'Passe sempre o valor inicial ao reduce.', 'Passe um comparador ao sort numérico e copie antes de ordenar.', 'Crie novos objetos e arrays em vez de alterar os existentes.', 'Use structuredClone para cópias profundas.', 'Envolva JSON.parse em try/catch quando a entrada não é confiável.'],
  mistakes: ['Usar sort() em números sem comparador.', 'Achar que o spread copia objetos aninhados.', 'Chamar reduce sem valor inicial em uma lista vazia (lança erro).', 'Usar map apenas para executar efeitos, ignorando o array devolvido (use for...of ou forEach).', 'Alterar um array enquanto o percorre.', 'Esperar que JSON guarde funções, datas ou undefined.'],
  market: `Transformar listas de objetos (respostas de APIs, linhas de banco, estado de interfaces) é o dia a dia de qualquer pessoa que programa em JavaScript. Frameworks de interface exigem imutabilidade, e os métodos funcionais aparecem em praticamente toda entrevista técnica da linguagem.`,
  summary: `map transforma, filter seleciona, reduce acumula, find/some/every consultam. sort ordena como texto por padrão e altera o original. Desestruturação e spread simplificam o código; o spread faz cópia rasa e structuredClone faz cópia profunda. Prefira atualizações imutáveis. JSON.parse pode lançar erro.`,
  refs: [REF.scripting],
  cards: [
    { q: 'Por que [10, 2, 1].sort() dá [1, 10, 2]?', a: 'Sem comparador, sort ordena como texto.' },
    { q: 'O spread { ...obj } copia objetos aninhados?', a: 'Não. A cópia é rasa: os objetos aninhados continuam compartilhados.' },
    { q: 'Como remover duplicatas de um array?', a: '[...new Set(lista)].' },
    { q: 'O que reduce faz sem valor inicial em lista vazia?', a: 'Lança TypeError; passe sempre o valor inicial.' }
  ]
},
{
  id: 'js-04', moduleId: 'm2', order: 4, minutes: 75, tags: ['javascript', 'closures', 'this', 'erros', 'classes'],
  title: 'Closures, this, classes e tratamento de erros',
  objectives: ['Explicar o que é um closure e usá-lo para guardar estado privado', 'Prever o valor de this em funções, métodos e arrows', 'Escrever classes simples e entender herança', 'Lançar e tratar erros com try/catch/finally e erros personalizados'],
  intro: `Estes são os conceitos que mais separam quem "escreve JavaScript" de quem o entende. Closures explicam como funções lembram de onde nasceram; o this explica o contexto de uma chamada; e o tratamento de erros decide se um problema derruba o programa ou é tratado com elegância.`,
  theory: `### Closures
Segundo a MDN, um closure é uma função agrupada com referências ao seu estado ao redor (seu ambiente léxico): dá a uma função acesso ao escopo externo, e closures são criados toda vez que uma função é criada. Depois que a função externa termina, a interna ainda acessa suas variáveis.

    function criarContador() {
      let n = 0;                    // privada: ninguém de fora enxerga
      return () => ++n;
    }
    const c = criarContador();
    c(); c();                       // 1, 2

Usos: **estado privado**, **fábricas de funções** (§criarSomador(5)§), **memoização** (guardar resultados já calculados) e callbacks que lembram dados.

**A armadilha do §var§ em laços:** segundo a MDN, com §var§ todos os closures criados em um laço compartilham a mesma variável, que no fim do laço guarda o último valor. As soluções são usar §let§ ou §const§ (cada volta ganha sua própria variável), uma função fábrica ou um §forEach§.

### this
O valor de §this§ depende de **como a função é chamada**:
- Método de objeto (§obj.metodo()§): §this§ é §obj§.
- Função solta: em modo estrito (módulos e classes), §undefined§; em modo não estrito, o objeto global.
- §new Funcao()§ ou classe: o novo objeto.
- §fn.call(x, ...)§, §fn.apply(x, [...])§ e §fn.bind(x)§ fixam o §this§ explicitamente.
- **Arrow functions** não têm §this§ próprio: usam o do local onde foram criadas. Por isso são ideais para callbacks dentro de métodos, e inadequadas como método de objeto que precise do §this§.
Um erro clássico: separar o método do objeto (§const f = obj.metodo; f()§) e perder o §this§.

### Classes
Açúcar sintático sobre os protótipos da linguagem:

    class Conta {
      #saldo = 0;                       // campo privado
      constructor(titular) { this.titular = titular; }
      depositar(v) { if (v <= 0) throw new RangeError('valor inválido'); this.#saldo += v; }
      get saldo() { return this.#saldo; }
    }
    class Poupanca extends Conta { /* herda e pode sobrescrever */ }

§extends§ cria herança, §super§ chama a classe-mãe, §static§ define membros da classe e §#campo§ cria campos realmente privados. Prefira **composição** (objetos que usam outros objetos) a hierarquias profundas.

### Tratamento de erros
- §throw new Error('mensagem')§ interrompe o fluxo; tipos nativos: §TypeError§, §RangeError§, §SyntaxError§, §ReferenceError§.
- §try { ... } catch (e) { ... } finally { ... }§: o §finally§ roda sempre (útil para liberar recursos).
- Erros personalizados: §class ErroDeValidacao extends Error { constructor(msg) { super(msg); this.name = 'ErroDeValidacao'; } }§.
- Trate o que você sabe tratar; **não engula erros** com um §catch§ vazio. Relance (§throw e§) o que não for da sua conta.
- Valide entradas cedo e lance erros com mensagens úteis.

### Depuração
§console.log§, §console.table§, o painel de depuração do navegador (pontos de parada) e as mensagens de erro com a **pilha de chamadas** (stack trace): leia a primeira linha do erro e o primeiro arquivo seu na pilha.`,
  concepts: [
    { term: 'Closure', def: 'Função que mantém acesso às variáveis do escopo onde foi criada.' },
    { term: 'Ambiente léxico', def: 'Conjunto de variáveis visíveis no local do código onde a função foi escrita.' },
    { term: 'this', def: 'Referência de contexto cujo valor depende de como a função é chamada.' },
    { term: 'bind', def: 'Cria uma nova função com o this fixado.' },
    { term: 'Classe', def: 'Modelo para criar objetos, com construtor, métodos, herança e campos privados (#).' },
    { term: 'finally', def: 'Bloco executado sempre ao final de um try, com ou sem erro.' },
    { term: 'Memoização', def: 'Guardar resultados de chamadas anteriores para não recalcular.' }
  ],
  examples: `**Analogia do closure:** uma mochila. Quando a função "nasce" em um escopo, ela leva na mochila as variáveis desse lugar e continua com elas mesmo depois de sair de lá.

**Analogia do this:** a palavra "eu": quem diz é quem a pronuncia. O mesmo método chamado por objetos diferentes tem this diferente.

**Armadilha clássica:**

    for (var i = 0; i < 3; i++) setTimeout(() => console.log(i)); // 3, 3, 3
    for (let i = 0; i < 3; i++) setTimeout(() => console.log(i)); // 0, 1, 2`,
  code: [
    { title: 'Closures: contador e fábrica', lang: 'javascript', code: R`function criarContador(inicio = 0) {
  let n = inicio;
  return {
    incrementar: () => ++n,
    valor: () => n
  };
}

const a = criarContador();
const b = criarContador(10);
a.incrementar(); a.incrementar();
b.incrementar();
console.log(a.valor(), b.valor()); // 2 11
console.log(a.n);                  // undefined: n é privada`,
      notes: [ { l: '2', t: 'n vive no ambiente de cada chamada de criarContador.' }, { l: '3-6', t: 'As duas funções devolvidas compartilham o mesmo n.' }, { l: '9-10', t: 'Cada contador tem o seu estado independente.' } ] },
    { title: 'this e arrow functions', lang: 'javascript', code: R`const timer = {
  segundos: 0,
  iniciar() {
    [1, 2, 3].forEach(() => { this.segundos++; }); // arrow: this é o timer
    return this.segundos;
  },
  iniciarErrado() {
    [1, 2, 3].forEach(function () { this.segundos++; }); // this não é o timer
  }
};

console.log(timer.iniciar()); // 3
try { timer.iniciarErrado(); } catch (e) { console.log(e.name); } // TypeError

const solto = timer.iniciar;
try { solto(); } catch (e) { console.log(e.name); } // TypeError (this indefinido)
console.log(timer.iniciar.bind(timer)()); // 6`,
      notes: [ { l: '4', t: 'A arrow não tem this próprio e usa o do método iniciar.' }, { l: '8', t: 'Em função comum chamada pelo forEach, o this não é o timer (undefined em modo estrito, como em módulos e neste ambiente).' }, { l: '15', t: 'bind fixa o this e a chamada volta a funcionar.' } ] },
    { title: 'Erros personalizados e tratamento', lang: 'javascript', code: R`class ErroDeValidacao extends Error {
  constructor(campo, mensagem) {
    super(mensagem);
    this.name = 'ErroDeValidacao';
    this.campo = campo;
  }
}

function validarIdade(idade) {
  if (!Number.isInteger(idade)) throw new ErroDeValidacao('idade', 'idade deve ser um inteiro');
  if (idade < 0) throw new ErroDeValidacao('idade', 'idade não pode ser negativa');
  return idade;
}

for (const entrada of [30, -1, 'x']) {
  try {
    console.log('ok', validarIdade(entrada));
  } catch (e) {
    if (!(e instanceof ErroDeValidacao)) throw e;
    console.log(e.campo + ':', e.message);
  } finally {
    console.log('verificado', entrada);
  }
}`,
      notes: [ { l: '1-7', t: 'Classe de erro própria, com name e um campo extra.' }, { l: '19', t: 'Só trata o erro que conhece; o resto é relançado.' }, { l: '21-22', t: 'finally roda sempre, com ou sem erro.' } ] }
  ],
  bestPractices: ['Use closures para encapsular estado em vez de variáveis globais.', 'Use let e const em laços para evitar a armadilha do var.', 'Use arrows em callbacks dentro de métodos; use métodos curtos de objeto quando precisar do this.', 'Prefira composição à herança profunda.', 'Valide cedo e lance erros com mensagens úteis.', 'Nunca deixe um catch vazio; relance o que não souber tratar.'],
  mistakes: ['Usar var em laços com callbacks assíncronos.', 'Perder o this ao passar um método como callback.', 'Usar arrow function como método que depende do this do objeto.', 'Engolir erros com catch vazio.', 'Lançar strings em vez de objetos Error (perde a pilha).', 'Alterar o estado de um closure sem perceber que ele é compartilhado.'],
  market: `Closures e this estão entre as perguntas mais frequentes em entrevistas de JavaScript, e entender os dois é a base para trabalhar com hooks do React, middlewares do Node e qualquer biblioteca baseada em callbacks. Tratamento de erros decide a confiabilidade de um sistema em produção.`,
  summary: `Closures dão às funções acesso ao escopo onde nasceram e permitem estado privado. O this depende de como a função é chamada; arrows usam o do local onde foram criadas. Classes oferecem herança e campos privados. Trate erros com try/catch/finally, crie erros personalizados e nunca engula exceções.`,
  refs: [REF.closures, REF.scripting],
  cards: [
    { q: 'O que é um closure?', a: 'Uma função junto com as referências ao ambiente onde foi criada; ela continua acessando essas variáveis depois que a função externa terminou.' },
    { q: 'Por que for com var e setTimeout imprime sempre o mesmo valor?', a: 'Todos os closures compartilham a mesma variável var, que no fim do laço guarda o último valor; com let cada volta tem a sua.' },
    { q: 'Quando o finally roda?', a: 'Sempre, ao final do try, com ou sem erro.' },
    { q: 'Arrow functions têm this próprio?', a: 'Não, usam o this do local onde foram criadas.' }
  ]
}
];
