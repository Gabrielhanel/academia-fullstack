// Curso 1 — Lógica, algoritmos, estruturas de dados e Big O. Aulas 1 a 4.
export const REF = {
  guide: { title: 'MDN — JavaScript Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide', kind: 'doc' },
  grammar: { title: 'MDN — Grammar and types', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types', kind: 'doc' },
  operators: { title: 'MDN — Expressions and operators', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_operators', kind: 'doc' },
  control: { title: 'MDN — Control flow and error handling', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling', kind: 'doc' },
  loops: { title: 'MDN — Loops and iteration', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration', kind: 'doc' },
  functions: { title: 'MDN — Functions', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions', kind: 'doc' },
  recursion: { title: 'MDN — Recursion (glossário)', url: 'https://developer.mozilla.org/en-US/docs/Glossary/Recursion', kind: 'doc' },
  array: { title: 'MDN — Array', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array', kind: 'doc' },
  sort: { title: 'MDN — Array.prototype.sort()', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort', kind: 'doc' },
  string: { title: 'MDN — String', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String', kind: 'doc' },
  map: { title: 'MDN — Map', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map', kind: 'doc' },
  set: { title: 'MDN — Set', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set', kind: 'doc' },
  number: { title: 'MDN — Number.MAX_SAFE_INTEGER', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER', kind: 'doc' },
  ods: { title: 'Pat Morin — Open Data Structures (livro aberto, CC BY)', url: 'https://opendatastructures.org/', kind: 'book' },
  algs4: { title: 'Robert Sedgewick e Kevin Wayne — Algorithms, 4ª ed. (site do livro)', url: 'https://algs4.cs.princeton.edu/home/', kind: 'book' },
  mit: { title: 'MIT OpenCourseWare — 6.006 Introduction to Algorithms (Spring 2020)', url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/', kind: 'course' },
  clrs: { title: 'Cormen, Leiserson, Rivest e Stein — Introduction to Algorithms, 4ª ed. (MIT Press, 2022)', url: '', kind: 'book' }
};

export const lessonsA = [
{
  id: 'log-01', moduleId: 'm1', order: 1, minutes: 60, tags: ['logica', 'javascript'],
  title: 'Algoritmos, variáveis, tipos e operadores',
  objectives: ['Definir algoritmo e decompor um problema em passos', 'Escrever pseudocódigo e traduzi-lo para JavaScript', 'Usar variáveis, tipos primitivos e operadores aritméticos, relacionais e lógicos', 'Prever o resultado de expressões, incluindo divisão inteira e resto'],
  intro: `Programar é dar instruções precisas a uma máquina que não interpreta intenções. Antes de qualquer linguagem, o que importa é a **lógica**: entender o problema, quebrá-lo em passos e garantir que cada passo é inequívoco. Esta aula apresenta o vocabulário básico que vai acompanhar você em todos os cursos: algoritmo, entrada, saída, variável, tipo e expressão. Usaremos JavaScript como notação, porque ele roda no navegador e no laboratório da plataforma.`,
  theory: `### O que é um algoritmo
Um **algoritmo** é uma sequência finita de passos bem definidos que transforma uma **entrada** em uma **saída**. Três propriedades importam:
1. **Finitude:** termina depois de um número finito de passos.
2. **Definição:** cada passo tem um único significado possível.
3. **Correção:** para toda entrada válida, produz a saída esperada.

Uma receita de bolo é a analogia clássica, mas ela é pouco precisa ("asse até dourar"). Um algoritmo de computador não pode ter esse tipo de ambiguidade.

### Como pensar antes de codificar
Um roteiro que funciona do primeiro exercício até entrevistas técnicas:
1. **Entenda o problema:** qual é a entrada? Qual é a saída? Escreva dois ou três exemplos à mão.
2. **Procure casos de borda:** lista vazia, um único elemento, números negativos, zero, texto com acentos.
3. **Decomponha:** divida em subproblemas menores que você já sabe resolver.
4. **Escreva pseudocódigo:** passos em português estruturado, sem se preocupar com sintaxe.
5. **Traduza para código** e **teste** com os exemplos e os casos de borda.

### Pseudocódigo
Pseudocódigo é uma descrição do algoritmo que pessoas leem com facilidade. Não existe um padrão único; o importante é ser claro:

    algoritmo media
      entrada: lista de notas
      soma <- 0
      para cada nota na lista: soma <- soma + nota
      se a lista estiver vazia: devolva 0
      devolva soma / quantidade de notas

### Variáveis e constantes
Uma **variável** é um nome associado a um valor guardado na memória. Em JavaScript moderno:
- §const§ cria um vínculo que **não pode ser reatribuído**. Use por padrão.
- §let§ cria um vínculo que **pode ser reatribuído**, com escopo de bloco.
- §var§ é a forma antiga, com escopo de função e regras confusas. Evite em código novo.

Atenção: §const§ impede reatribuir o nome, mas não impede alterar o conteúdo de um objeto ou array. Isso será aprofundado no curso de JavaScript.

### Tipos primitivos
JavaScript tem sete tipos primitivos: §number§, §bigint§, §string§, §boolean§, §undefined§, §null§ e §symbol§. Todo o resto (arrays, funções, datas) é **objeto**. O operador §typeof§ informa o tipo de um valor; uma exceção histórica é §typeof null§, que retorna §"object"§.

O tipo §number§ usa ponto flutuante de 64 bits (IEEE 754). Consequências práticas:
- Inteiros são exatos só até §Number.MAX_SAFE_INTEGER§ (2⁵³ − 1). Acima disso, use §bigint§.
- Frações decimais nem sempre são exatas: §0.1 + 0.2§ resulta em §0.30000000000000004§. Para dinheiro, trabalhe com centavos inteiros.

### Operadores
- **Aritméticos:** §+ - * / % **§. O §%§ é o **resto** da divisão; §7 % 3§ vale §1§. Não existe operador de divisão inteira: use §Math.floor(7 / 3)§ (para números positivos) ou §Math.trunc§.
- **Relacionais:** §< <= > >=§ e as igualdades §===§ e §!==§, que comparam **sem conversão de tipo**. Evite §==§, que converte tipos de formas surpreendentes (§0 == ''§ é §true§).
- **Lógicos:** §&&§ (e), §||§ (ou), §!§ (não). Eles fazem **curto-circuito**: em §a && b§, se §a§ for falso, §b§ nem é avaliado.
- **Precedência:** multiplicação e divisão antes de soma e subtração; use parênteses para deixar a intenção explícita.

### Expressões e instruções
Uma **expressão** produz um valor (§2 * x + 1§). Uma **instrução** executa uma ação (§let total = 0;§). Programas são sequências de instruções que avaliam expressões e guardam resultados em variáveis.`,
  concepts: [
    { term: 'Algoritmo', def: 'Sequência finita de passos bem definidos que transforma uma entrada em uma saída.' },
    { term: 'Caso de borda', def: 'Entrada no limite do que é válido (vazia, mínima, máxima, negativa) e que costuma revelar erros.' },
    { term: 'Pseudocódigo', def: 'Descrição estruturada do algoritmo em linguagem natural, sem a sintaxe de uma linguagem.' },
    { term: 'Variável', def: 'Nome associado a um valor na memória. Em JavaScript: const (sem reatribuição) ou let (com reatribuição).' },
    { term: 'Tipo primitivo', def: 'Valor imutável e não objeto: number, bigint, string, boolean, undefined, null e symbol.' },
    { term: 'Operador de resto (%)', def: 'Devolve o resto da divisão inteira; útil para paridade, ciclos e dígitos.' },
    { term: 'Curto-circuito', def: 'Avaliação de && e || que para assim que o resultado já é conhecido.' }
  ],
  examples: `**Analogia:** um algoritmo é como as instruções de montagem de um móvel. A entrada são as peças; a saída é o móvel montado. Se uma instrução diz "aperte bem", ela é ambígua; se diz "aperte o parafuso A3 até encostar na peça B", qualquer pessoa obtém o mesmo resultado.

**Exemplo de decomposição:** "verificar se um ano é bissexto". Regra do calendário gregoriano: é bissexto se for divisível por 4, **exceto** os divisíveis por 100, **a menos que** também sejam divisíveis por 400. Decompondo: (1) divisível por 400 → sim; (2) senão, divisível por 100 → não; (3) senão, divisível por 4 → sim; (4) senão → não. Exemplos para testar: 2024 (sim), 1900 (não), 2000 (sim), 2023 (não).`,
  code: [
    { title: 'Do pseudocódigo ao código: média de notas', lang: 'javascript', code: `function media(notas) {
  if (notas.length === 0) return 0;
  let soma = 0;
  for (const nota of notas) {
    soma = soma + nota;
  }
  return soma / notas.length;
}

console.log(media([7, 8.5, 10])); // 8.5
console.log(media([]));           // 0`,
      notes: [ { l: '1', t: 'A função recebe a entrada (lista de notas) como parâmetro.' }, { l: '2', t: 'Caso de borda tratado primeiro: sem notas, evitamos dividir por zero (que daria NaN).' }, { l: '3', t: 'let, porque o valor de soma muda a cada volta.' }, { l: '4-6', t: 'Percorre cada nota e acumula. Este padrão chama-se acumulador.' }, { l: '7', t: 'A saída: soma dividida pela quantidade.' } ] },
    { title: 'Ano bissexto com operadores lógicos', lang: 'javascript', code: `function bissexto(ano) {
  return (ano % 4 === 0 && ano % 100 !== 0) || ano % 400 === 0;
}

console.log(bissexto(2024), bissexto(1900), bissexto(2000)); // true false true`,
      notes: [ { l: '2', t: 'ano % 4 === 0 testa divisibilidade. && exige as duas condições; || aceita qualquer uma. Os parênteses deixam a precedência explícita.' } ] },
    { title: 'Armadilhas de tipos numéricos', lang: 'javascript', code: `console.log(0.1 + 0.2);                 // 0.30000000000000004
console.log((10 + 20) / 100);           // 0.3 — calcule em centavos
console.log(Math.floor(7 / 2), 7 % 2);  // 3 1
console.log(Number.MAX_SAFE_INTEGER);   // 9007199254740991
console.log(2n ** 64n);                 // 18446744073709551616n
console.log(typeof null);               // "object" (exceção histórica)`,
      notes: [ { l: '1', t: 'Ponto flutuante binário não representa 0,1 exatamente.' }, { l: '2', t: 'Somar inteiros (centavos) e converter só na exibição evita o erro.' }, { l: '3', t: 'Quociente inteiro com Math.floor e resto com %.' }, { l: '5', t: 'bigint (sufixo n) representa inteiros arbitrariamente grandes.' } ] }
  ],
  bestPractices: ['Escreva exemplos de entrada e saída antes de programar.', 'Use const por padrão e let só quando o valor precisar mudar; evite var.', 'Prefira === e !== a == e !=.', 'Trate casos de borda no começo da função (cláusulas de guarda).', 'Dê nomes que explicam o significado: totalEmCentavos é melhor que t.', 'Use parênteses para deixar a precedência explícita em expressões lógicas.'],
  mistakes: ['Somar valores monetários em ponto flutuante e exibir 0.30000000000000004.', 'Dividir por zero ao calcular a média de uma lista vazia (resultado NaN).', 'Usar = (atribuição) quando queria comparar com ===.', 'Esperar que 7 / 2 resulte em 3, como em linguagens com divisão inteira.', 'Confundir const com valor imutável: o conteúdo de um array const pode mudar.'],
  market: `Em entrevistas, o avaliador observa mais o **processo** (entender, exemplificar, decompor, testar) do que a sintaxe. No trabalho, cálculos de dinheiro, datas e limites numéricos causam bugs caros: sistemas de pagamento armazenam valores em centavos inteiros justamente pelo problema do ponto flutuante.`,
  summary: `Algoritmo é uma sequência finita, precisa e correta de passos. Antes de codificar, entenda o problema com exemplos e casos de borda, decomponha e escreva pseudocódigo. Em JavaScript, use const e let, conheça os sete tipos primitivos e as limitações do number, e prefira === nas comparações.`,
  refs: [REF.guide, REF.grammar, REF.operators, REF.number, REF.clrs],
  cards: [
    { q: 'Quais as três propriedades de um algoritmo?', a: 'Finitude, definição (sem ambiguidade) e correção.' },
    { q: 'Quanto vale 17 % 5 em JavaScript?', a: '2 (o resto da divisão de 17 por 5).' },
    { q: 'Por que evitar == em JavaScript?', a: 'Porque ele converte tipos antes de comparar (0 == "" é true). === compara sem conversão.' },
    { q: 'Qual o maior inteiro seguro do tipo number?', a: 'Number.MAX_SAFE_INTEGER = 2^53 − 1 = 9007199254740991.' }
  ]
},
{
  id: 'log-02', moduleId: 'm1', order: 2, minutes: 70, tags: ['logica', 'javascript'],
  title: 'Decisões, repetições e rastreamento de execução',
  objectives: ['Usar if, else if, else e switch para decisões', 'Escolher entre for, while, do...while e for...of', 'Rastrear a execução de um laço anotando o valor das variáveis', 'Identificar e corrigir erros de limite (off-by-one) e laços infinitos'],
  intro: `Quase todo algoritmo combina dois movimentos: **decidir** o que fazer com base em uma condição e **repetir** um passo até alcançar um objetivo. Nesta aula você vai praticar essas estruturas e, principalmente, aprender a **rastrear** a execução: simular o computador no papel, linha por linha. É a habilidade que mais acelera a depuração.`,
  theory: `### Estruturas de decisão
§if (condição) { ... } else if (outra) { ... } else { ... }§ executa o primeiro bloco cuja condição for verdadeira. Em JavaScript, a condição não precisa ser booleana: valores **falsy** (§false§, §0§, §-0§, §0n§, §""§, §null§, §undefined§ e §NaN§) contam como falsos; todo o resto conta como verdadeiro (**truthy**). Por isso §if (lista.length)§ significa "se a lista não estiver vazia".

O §switch§ compara um valor com vários casos usando igualdade estrita (§===§). Cada §case§ precisa de §break§ (ou §return§); sem ele, a execução **continua no caso seguinte** (*fall-through*).

O **operador ternário** §cond ? a : b§ é uma expressão: devolve §a§ ou §b§. Use para escolhas simples, não para lógica aninhada.

### Estruturas de repetição
- §for (inicio; condição; passo)§: quando você conhece o número de iterações ou precisa do índice.
- §while (condição)§: repete enquanto a condição for verdadeira; a condição é testada **antes** de cada volta.
- §do { ... } while (condição)§: executa pelo menos uma vez; testa **depois**.
- §for (const x of iteravel)§: percorre os **valores** de arrays, strings, Map e Set. Prefira quando não precisa do índice.
- §for (const k in objeto)§: percorre **chaves** de objetos. Não use em arrays: a ordem e as chaves herdadas podem surpreender.

§break§ encerra o laço; §continue§ pula para a próxima iteração.

### Invariante de laço
Um **invariante** é uma afirmação que vale no início de cada iteração. Em um laço que soma os elementos, o invariante é "§soma§ contém a soma dos elementos de índice 0 até §i - 1§". Pensar no invariante ajuda a escrever laços corretos e a explicar por que o algoritmo funciona.

### Rastreamento (teste de mesa)
Rastrear é executar o código à mão, mantendo uma **tabela** com uma coluna por variável e uma linha por passo. Exemplo para §let s = 0; for (let i = 1; i <= 3; i++) s += i;§:

| passo | i | s |
|---|---|---|
| início | — | 0 |
| volta 1 | 1 | 1 |
| volta 2 | 2 | 3 |
| volta 3 | 3 | 6 |
| teste final | 4 | 6 (i <= 3 é falso; sai) |

Repare que, ao sair do laço, §i§ vale 4: a condição foi testada mais uma vez.

### Erros de limite (off-by-one)
São os erros mais comuns em laços. Perguntas para checar:
- O índice começa em 0 ou em 1?
- A condição é §<§ ou §<=§? Para percorrer um array de tamanho §n§, os índices válidos vão de §0§ a §n - 1§: use §i < n§.
- O laço executa para a entrada vazia? Deveria?

### Laços infinitos
Um laço §while§ termina quando algo **muda** a condição. Se nenhuma variável da condição muda dentro do laço, ele nunca termina e trava a página ou o processo. No laboratório, a execução é interrompida pelo limite de tempo.`,
  concepts: [
    { term: 'Falsy', def: 'Valores tratados como falsos em condições: false, 0, -0, 0n, "", null, undefined e NaN.' },
    { term: 'Fall-through', def: 'No switch, sem break a execução continua no próximo case.' },
    { term: 'Invariante de laço', def: 'Afirmação verdadeira no início de cada iteração; base para provar que o laço está correto.' },
    { term: 'Teste de mesa', def: 'Execução manual do código, anotando o valor das variáveis a cada passo.' },
    { term: 'Off-by-one', def: 'Erro de limite em que o laço executa uma vez a mais ou a menos.' },
    { term: 'for...of', def: 'Laço que percorre os valores de um iterável (array, string, Map, Set).' }
  ],
  examples: `**Analogia:** um laço é um porteiro contando pessoas que entram. A condição é "ainda há gente na fila?". Se ele esquecer de deixar a pessoa entrar (não muda o estado), vai olhar para a mesma pessoa para sempre: laço infinito.

**Exemplo:** FizzBuzz, um exercício clássico de entrevista. Para cada número de 1 a n: múltiplo de 3 e de 5 → "FizzBuzz"; só de 3 → "Fizz"; só de 5 → "Buzz"; senão, o próprio número. A ordem dos testes importa: o caso mais específico (3 e 5) vem primeiro.`,
  code: [
    { title: 'FizzBuzz: ordem das condições', lang: 'javascript', code: `function fizzBuzz(n) {
  const saida = [];
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) saida.push('FizzBuzz');
    else if (i % 3 === 0) saida.push('Fizz');
    else if (i % 5 === 0) saida.push('Buzz');
    else saida.push(String(i));
  }
  return saida;
}

console.log(fizzBuzz(5)); // ['1', '2', 'Fizz', '4', 'Buzz']`,
      notes: [ { l: '3', t: 'De 1 até n inclusive: por isso <=. Aqui o laço conta números, não índices de array.' }, { l: '4', t: 'Múltiplo de 3 e de 5 é múltiplo de 15. Testar primeiro evita que caia em "Fizz".' }, { l: '7', t: 'String(i) mantém o tipo da saída uniforme (só strings).' } ] },
    { title: 'while com condição que muda: soma dos dígitos', lang: 'javascript', code: `function somaDigitos(n) {
  let soma = 0;
  while (n > 0) {
    soma += n % 10;
    n = Math.floor(n / 10);
  }
  return soma;
}

console.log(somaDigitos(4096)); // 19`,
      notes: [ { l: '3', t: 'Repete enquanto ainda houver dígitos.' }, { l: '4', t: 'n % 10 é o último dígito.' }, { l: '5', t: 'Remove o último dígito. É esta linha que garante o término: n diminui a cada volta.' } ] },
    { title: 'switch com break e agrupamento de casos', lang: 'javascript', code: `function tipoDia(dia) {
  switch (dia) {
    case 'sábado':
    case 'domingo':
      return 'fim de semana';
    case 'feriado':
      return 'descanso';
    default:
      return 'dia útil';
  }
}`,
      notes: [ { l: '3-5', t: 'Casos sem corpo "caem" no próximo de propósito: sábado e domingo têm o mesmo resultado.' }, { l: '5', t: 'return encerra a função, então não é preciso break aqui.' }, { l: '8', t: 'default trata qualquer outro valor.' } ] }
  ],
  bestPractices: ['Prefira for...of quando não precisar do índice.', 'Para percorrer índices de um array de tamanho n, use i < n.', 'Garanta que toda variável da condição de um while mude dentro do laço.', 'Ordene as condições do caso mais específico para o mais geral.', 'Use return antecipado para reduzir o aninhamento de if.', 'Rastreie à mão os casos de borda antes de rodar o código.'],
  mistakes: ['Usar i <= array.length e acessar uma posição que não existe (undefined).', 'Esquecer o break no switch e executar o caso seguinte sem querer.', 'Usar for...in em arrays.', 'Testar if (x) quando 0 é um valor válido: 0 é falsy.', 'Esquecer de atualizar a variável da condição em um while.'],
  market: `Teste de mesa é o que desenvolvedores experientes fazem mentalmente ao ler um pull request. Erros de limite aparecem em paginação ("a página 2 repete o último item da página 1"), em cálculos de datas e em processamento de arquivos. Ferramentas de depuração (breakpoints) automatizam o rastreamento, mas você precisa saber o que esperar em cada passo.`,
  summary: `Decisões usam if/else, switch (com break) e ternário. Repetições usam for, while, do...while e for...of. Rastrear a execução em uma tabela revela erros de limite e laços infinitos. Pense no invariante do laço e teste a entrada vazia.`,
  refs: [REF.control, REF.loops, REF.guide],
  cards: [
    { q: 'Cite os valores falsy de JavaScript.', a: 'false, 0, -0, 0n, "", null, undefined e NaN.' },
    { q: 'Qual a diferença entre while e do...while?', a: 'while testa antes da primeira volta; do...while executa ao menos uma vez e testa depois.' },
    { q: 'Ao final de for (let i = 0; i < 3; i++), qual o último valor que i assume?', a: '3: a condição é testada com i = 3, falha, e o laço termina.' }
  ]
},
{
  id: 'log-03', moduleId: 'm1', order: 3, minutes: 70, tags: ['logica', 'javascript', 'recursao'],
  title: 'Funções, decomposição e recursão',
  objectives: ['Escrever funções puras com parâmetros e retorno', 'Decompor um problema em funções pequenas e testáveis', 'Escrever funções recursivas com caso base e caso recursivo', 'Explicar a pilha de chamadas e o risco de estouro de pilha'],
  intro: `Funções são a principal ferramenta de decomposição: cada uma resolve um subproblema, tem um nome e pode ser testada isoladamente. A recursão leva essa ideia ao extremo: uma função resolve um problema chamando a si mesma para uma versão menor dele. Árvores, grafos e algoritmos de ordenação eficientes, que você verá neste curso, dependem desse raciocínio.`,
  theory: `### Anatomia de uma função
Uma função recebe **parâmetros**, executa instruções e devolve um valor com §return§. Sem §return§, ela devolve §undefined§. Formas comuns em JavaScript:
- Declaração: §function soma(a, b) { return a + b; }§ — pode ser chamada antes da linha em que aparece (*hoisting*).
- Arrow function: §const soma = (a, b) => a + b;§ — forma curta; o retorno é implícito quando o corpo é uma expressão.

Parâmetros podem ter **valor padrão**: §function saudar(nome = 'visitante')§.

### Funções puras
Uma função é **pura** quando (1) o resultado depende só dos argumentos e (2) não causa efeitos colaterais: não altera variáveis externas, não modifica os argumentos, não faz I/O. Funções puras são fáceis de testar e de reutilizar. Efeitos (gravar no banco, imprimir, chamar a rede) continuam necessários, mas ficam concentrados nas bordas do programa.

### Decomposição
Uma boa função faz **uma coisa** e tem um nome que diz qual. Sinais de que uma função precisa ser dividida: comentários separando "partes", muitos níveis de aninhamento, nome com "e" (§validarESalvar§).

### Escopo
Variáveis declaradas com §let§ e §const§ dentro de um bloco só existem nele. Uma função enxerga as variáveis do escopo onde foi **definida** (escopo léxico). Esse comportamento, chamado *closure*, é estudado em detalhe no curso de JavaScript.

### Recursão
Uma função **recursiva** chama a si mesma. Toda recursão correta tem:
1. **Caso base:** uma entrada pequena resolvida diretamente, sem nova chamada.
2. **Caso recursivo:** reduz o problema e chama a função para a parte menor, **aproximando-se** do caso base.

Exemplo: §fatorial(n) = n × fatorial(n − 1)§, com §fatorial(0) = 1§.

Para confiar em uma recursão, use o "salto de fé": suponha que a chamada para o problema menor funciona e verifique apenas se você combina o resultado corretamente e se o caso base está certo. Isso é o mesmo raciocínio de uma prova por indução.

### A pilha de chamadas
Cada chamada cria um **quadro** (frame) na pilha de chamadas, com seus parâmetros e variáveis locais. A recursão empilha um quadro por nível; os retornos desempilham. Como a pilha tem tamanho limitado, uma recursão muito profunda (ou sem caso base) gera §RangeError: Maximum call stack size exceeded§. O limite varia por ambiente. A especificação ECMAScript prevê otimização de chamadas em cauda, mas a maioria dos motores não a implementa; não conte com ela.

### Recursão ou laço?
Todo laço pode ser escrito como recursão e vice-versa (usando uma pilha explícita). Prefira laço quando a estrutura é linear (percorrer uma lista). Prefira recursão quando a estrutura é **hierárquica** (árvores, pastas, JSON aninhado) ou o algoritmo é de **divisão e conquista** (merge sort, busca binária recursiva).

### Recursão com repetição de trabalho
A definição ingênua de Fibonacci (§fib(n) = fib(n-1) + fib(n-2)§) recalcula os mesmos valores muitas vezes e cresce de forma exponencial. Guardar resultados já calculados (**memoização**) ou calcular de baixo para cima com um laço resolve o problema. Você vai medir essa diferença na aula de Big O.`,
  concepts: [
    { term: 'Função pura', def: 'Resultado depende só dos argumentos e não há efeitos colaterais.' },
    { term: 'Efeito colateral', def: 'Qualquer mudança observável fora da função: alterar variáveis externas ou argumentos, I/O, rede.' },
    { term: 'Caso base', def: 'Entrada resolvida diretamente, que encerra a recursão.' },
    { term: 'Caso recursivo', def: 'Reduz o problema e chama a função para a parte menor.' },
    { term: 'Quadro de pilha (frame)', def: 'Registro de uma chamada em andamento, com parâmetros e variáveis locais.' },
    { term: 'Estouro de pilha', def: 'Erro quando há chamadas aninhadas demais (RangeError em JavaScript).' },
    { term: 'Memoização', def: 'Guardar resultados de chamadas já feitas para não recalculá-los.' }
  ],
  examples: `**Analogia da recursão:** você está numa fila de cinema e quer saber sua posição. Pergunta à pessoa da frente: "qual a sua posição?". Ela faz a mesma pergunta para a da frente, até chegar à primeira pessoa, que responde "1" (caso base). Cada uma soma 1 à resposta recebida e repassa para trás. A pilha de chamadas é a fila de pessoas esperando resposta.

**Analogia da pilha:** uma pilha de pratos. Cada chamada coloca um prato; cada retorno tira o de cima. Se a pilha ficar alta demais, cai: estouro de pilha.`,
  code: [
    { title: 'Decomposição em funções puras', lang: 'javascript', code: `const apenasLetras = (texto) => texto.toLowerCase().replace(/[^a-z]/g, '');
const inverter = (texto) => texto.split('').reverse().join('');

function ehPalindromo(frase) {
  const limpa = apenasLetras(frase);
  return limpa === inverter(limpa);
}

console.log(ehPalindromo('Socorram-me, subi no onibus em Marrocos')); // true`,
      notes: [ { l: '1', t: 'Subproblema 1: normalizar. Esta versão simples remove acentos e tudo que não for letra a-z; textos com acentos precisariam de normalize("NFD") antes.' }, { l: '2', t: 'Subproblema 2: inverter. split, reverse e join criam um novo array e uma nova string, sem alterar a original.' }, { l: '4-7', t: 'A função principal fica curta e legível porque delega os detalhes.' } ] },
    { title: 'Recursão: soma de uma lista e potência', lang: 'javascript', code: `function somaLista(lista) {
  if (lista.length === 0) return 0;
  const [primeiro, ...resto] = lista;
  return primeiro + somaLista(resto);
}

function potencia(base, exp) {
  if (exp === 0) return 1;
  const metade = potencia(base, Math.floor(exp / 2));
  return exp % 2 === 0 ? metade * metade : metade * metade * base;
}

console.log(somaLista([3, 4, 5]), potencia(2, 10)); // 12 1024`,
      notes: [ { l: '2', t: 'Caso base: a soma da lista vazia é 0.' }, { l: '3-4', t: 'Caso recursivo: o primeiro mais a soma do resto. O resto é menor, então o caso base será alcançado. Criar o array resto custa memória: é uma versão didática.' }, { l: '8', t: 'Caso base da potência: qualquer base elevada a 0 é 1.' }, { l: '9-10', t: 'Divide o expoente pela metade a cada chamada: cerca de log₂(exp) chamadas em vez de exp. É uma prévia de divisão e conquista.' } ] },
    { title: 'Recursão em estrutura hierárquica: contar arquivos', lang: 'javascript', code: `const pasta = {
  nome: 'projeto',
  itens: [
    { nome: 'README.md' },
    { nome: 'src', itens: [{ nome: 'index.js' }, { nome: 'util.js' }] },
    { nome: 'docs', itens: [] }
  ]
};

function contarArquivos(no) {
  if (!no.itens) return 1;
  let total = 0;
  for (const filho of no.itens) total += contarArquivos(filho);
  return total;
}

console.log(contarArquivos(pasta)); // 3`,
      notes: [ { l: '11', t: 'Caso base: um item sem a propriedade itens é um arquivo.' }, { l: '12-14', t: 'Uma pasta tem tantos arquivos quanto a soma dos seus filhos. Uma pasta vazia retorna 0.' } ] }
  ],
  bestPractices: ['Escreva primeiro o caso base e teste-o.', 'Garanta que cada chamada recursiva receba uma entrada estritamente menor.', 'Mantenha funções curtas, com nome que descreve a única coisa que fazem.', 'Prefira funções puras e concentre efeitos (I/O, rede) nas bordas.', 'Não altere arrays e objetos recebidos como argumento; devolva novos valores.', 'Para estruturas lineares muito grandes, prefira laços à recursão.'],
  mistakes: ['Esquecer o caso base e causar estouro de pilha.', 'Caso recursivo que não se aproxima do caso base (por exemplo, chamar f(n) dentro de f(n)).', 'Esquecer o return na chamada recursiva e devolver undefined.', 'Fibonacci recursivo ingênuo para n grande, com tempo exponencial.', 'Funções que alteram o array recebido e surpreendem quem as chama.'],
  market: `Recursão aparece em código real ao percorrer árvores: o DOM, componentes React aninhados, menus com submenus, comentários com respostas, sistemas de arquivos e JSON. Funções puras são a base de reducers (Redux, useReducer), de testes unitários simples e de código fácil de manter.`,
  summary: `Funções decompõem problemas; funções puras são previsíveis e testáveis. Recursão precisa de caso base e de um caso recursivo que reduz o problema. Cada chamada ocupa um quadro na pilha, que é limitada. Use recursão para estruturas hierárquicas e divisão e conquista; use laços para estruturas lineares.`,
  refs: [REF.functions, REF.recursion, REF.algs4, REF.clrs],
  cards: [
    { q: 'Quais os dois componentes de toda recursão correta?', a: 'Caso base (resolvido diretamente) e caso recursivo (reduz o problema e se aproxima do caso base).' },
    { q: 'O que torna uma função pura?', a: 'O resultado depende só dos argumentos e ela não tem efeitos colaterais.' },
    { q: 'Que erro JavaScript lança quando a recursão é profunda demais?', a: 'RangeError: Maximum call stack size exceeded.' }
  ]
},
{
  id: 'log-04', moduleId: 'm2', order: 4, minutes: 80, tags: ['estruturas-de-dados', 'arrays', 'strings', 'javascript'],
  title: 'Arrays e strings: técnicas essenciais',
  objectives: ['Descrever como arrays são acessados por índice e o custo de inserir e remover em cada posição', 'Usar map, filter, reduce, find e some com segurança', 'Aplicar as técnicas de dois ponteiros e janela deslizante', 'Manipular strings sabendo que são imutáveis'],
  intro: `Arrays e strings são as estruturas que você mais vai usar. Saber o custo de cada operação e conhecer duas ou três técnicas clássicas resolve uma grande parte dos problemas de entrevista e de código do dia a dia, como deduplicar listas, encontrar pares, validar textos e calcular médias móveis.`,
  theory: `### Arrays
Um array é uma sequência ordenada de valores acessada por **índice**, a partir de 0. Conceitualmente (e na prática, nos motores JavaScript, quando os elementos são densos), o acesso por índice é imediato: §lista[i]§ não depende do tamanho da lista.

Custos típicos em um array de tamanho n:
| Operação | Custo |
|---|---|
| Ler ou escrever §a[i]§ | constante |
| §push§ / §pop§ (no fim) | constante (amortizado) |
| §unshift§ / §shift§ (no início) | proporcional a n: desloca todos os elementos |
| §splice§ no meio | proporcional ao número de elementos deslocados |
| §includes§, §indexOf§, §find§ | proporcional a n no pior caso |

"Amortizado" significa que, de vez em quando, o array precisa crescer e copiar tudo, mas a média por operação continua constante.

### Métodos de alto nível
- §map(f)§: novo array com §f§ aplicada a cada elemento.
- §filter(f)§: novo array com os elementos para os quais §f§ é verdadeira.
- §reduce(f, inicial)§: acumula um único valor. **Sempre** passe o valor inicial; sem ele, um array vazio lança §TypeError§.
- §find(f)§ / §findIndex(f)§: primeiro elemento (ou índice) que satisfaz §f§; §undefined§ (ou §-1§) se nenhum.
- §some(f)§ / §every(f)§: existe algum / todos satisfazem? Param assim que a resposta é conhecida.

§map§, §filter§ e §reduce§ não alteram o array original. Já §sort§, §reverse§, §splice§, §push§ e §pop§ **alteram**. A partir do ES2023 existem versões que devolvem cópia: §toSorted§, §toReversed§ e §toSpliced§.

### Strings
Strings são sequências de unidades de código UTF-16 e são **imutáveis**: métodos como §toUpperCase§, §slice§ e §replace§ devolvem uma nova string. Concatenar em laço (§s += x§) é aceitável para textos pequenos; para muitos pedaços, junte em um array e use §join§.

Atenção a caracteres fora do plano básico (emojis): §'😀'.length§ é 2. Para percorrer caracteres visíveis com segurança, §for...of§ e §Array.from(texto)§ iteram por *code points*.

### Técnica: dois ponteiros
Use dois índices que se movem pela estrutura. Variações:
- **Das pontas para o centro:** verificar palíndromo, inverter no lugar, encontrar par com soma alvo em array **ordenado**.
- **Leitura e escrita:** um ponteiro lê, outro escreve; remove duplicatas de um array ordenado sem memória extra.

Ganho típico: transforma uma solução com dois laços aninhados (custo proporcional a n²) em uma passada única (proporcional a n).

### Técnica: janela deslizante
Para problemas sobre **subarrays contíguos** ("maior soma de k elementos seguidos", "maior trecho sem caracteres repetidos"), mantenha uma janela [início, fim]. Ao avançar, adicione o elemento que entra e remova o que sai, em vez de recalcular a janela inteira.

### Técnica: contagem de frequência
Para anagramas, duplicatas e "elemento mais frequente", conte ocorrências em um objeto ou §Map§. Esta técnica é aprofundada na aula de tabelas hash.`,
  concepts: [
    { term: 'Índice', def: 'Posição de um elemento no array, começando em 0; o último é length − 1.' },
    { term: 'Custo amortizado', def: 'Custo médio por operação ao longo de muitas operações, mesmo que algumas sejam caras.' },
    { term: 'Imutabilidade de strings', def: 'Métodos de string nunca alteram a original; devolvem uma nova string.' },
    { term: 'Dois ponteiros', def: 'Técnica com dois índices que percorrem a estrutura em direções ou velocidades diferentes.' },
    { term: 'Janela deslizante', def: 'Técnica para subarrays contíguos que atualiza o resultado ao mover as bordas, sem recalcular tudo.' },
    { term: 'Método que altera (mutating)', def: 'Método que modifica o próprio array: sort, reverse, splice, push, pop, shift, unshift.' }
  ],
  examples: `**Analogia:** um array é uma fileira de armários numerados. Abrir o armário 57 é imediato, porque você vai direto ao número. Inserir um armário novo no começo obriga a renumerar e deslocar todos os outros: por isso §unshift§ é caro.

**Exemplo de janela deslizante:** uma loja quer saber a maior venda somada em 7 dias consecutivos ao longo de um ano. Recalcular cada semana soma 7 valores para cada um dos 359 dias possíveis. Com a janela, cada novo dia faz só duas operações: soma o dia que entra e subtrai o que saiu.`,
  code: [
    { title: 'Dois ponteiros: par com soma alvo em array ordenado', lang: 'javascript', code: `function parComSoma(ordenado, alvo) {
  let esq = 0;
  let dir = ordenado.length - 1;
  while (esq < dir) {
    const soma = ordenado[esq] + ordenado[dir];
    if (soma === alvo) return [esq, dir];
    if (soma < alvo) esq++;
    else dir--;
  }
  return null;
}

console.log(parComSoma([1, 3, 4, 6, 9], 10)); // [0, 4]`,
      notes: [ { l: '2-3', t: 'Um ponteiro em cada ponta.' }, { l: '4', t: 'Para quando os ponteiros se encontram: não há mais pares a testar.' }, { l: '7', t: 'Soma pequena: avançar a esquerda aumenta a soma, porque o array está ordenado.' }, { l: '8', t: 'Soma grande: recuar a direita diminui a soma.' }, { l: '10', t: 'Nenhum par encontrado. Cada passo descarta um elemento, então são no máximo n − 1 passos.' } ] },
    { title: 'Janela deslizante: maior soma de k elementos seguidos', lang: 'javascript', code: `function maiorSomaJanela(valores, k) {
  if (k <= 0 || k > valores.length) return null;
  let janela = 0;
  for (let i = 0; i < k; i++) janela += valores[i];
  let melhor = janela;
  for (let fim = k; fim < valores.length; fim++) {
    janela += valores[fim] - valores[fim - k];
    if (janela > melhor) melhor = janela;
  }
  return melhor;
}

console.log(maiorSomaJanela([2, 1, 5, 1, 3, 2], 3)); // 9 (5 + 1 + 3)`,
      notes: [ { l: '2', t: 'Casos de borda: janela inválida.' }, { l: '4', t: 'Soma da primeira janela, índices 0 a k − 1.' }, { l: '7', t: 'Entra valores[fim], sai valores[fim − k]. Uma única passada pelo array.' } ] },
    { title: 'reduce com valor inicial e métodos que não alteram o original', lang: 'javascript', code: `const pedidos = [
  { cliente: 'ana', total: 120 },
  { cliente: 'bia', total: 80 },
  { cliente: 'ana', total: 50 }
];

const totalGeral = pedidos.reduce((acc, p) => acc + p.total, 0);
const grandes = pedidos.filter((p) => p.total >= 100).map((p) => p.cliente);
const porValor = pedidos.toSorted((a, b) => b.total - a.total);

console.log(totalGeral, grandes, porValor[0].total, pedidos[0].total); // 250 ['ana'] 120 120`,
      notes: [ { l: '7', t: 'O 0 é o valor inicial do acumulador. Sem ele, um array vazio lançaria TypeError.' }, { l: '8', t: 'filter e map encadeados criam arrays novos.' }, { l: '9', t: 'toSorted (ES2023) devolve uma cópia ordenada. sort alteraria pedidos. A função (a, b) => b.total − a.total ordena do maior para o menor.' } ] }
  ],
  bestPractices: ['Passe sempre o valor inicial em reduce.', 'Prefira métodos que não alteram (map, filter, toSorted) quando o array é compartilhado.', 'Evite shift e unshift em laços com arrays grandes; use um índice ou uma fila.', 'Antes de escrever dois laços aninhados, pergunte se dois ponteiros, janela ou contagem resolvem.', 'Para montar strings grandes, acumule partes em um array e use join.'],
  mistakes: ['Chamar sort em números sem função de comparação: [10, 9, 1].sort() resulta em [1, 10, 9].', 'Usar reduce sem valor inicial em um array que pode estar vazio.', 'Esquecer que sort altera o array original.', 'Supor que length de string conta caracteres visíveis (emojis contam 2).', 'Usar dois ponteiros em array não ordenado quando a técnica depende da ordenação.'],
  market: `Paginação, deduplicação de listas, cálculo de métricas em janelas de tempo (médias móveis em dashboards, limites de requisições por minuto) e validação de textos são tarefas diárias. Em entrevistas, problemas de arrays e strings são os mais frequentes nas primeiras etapas.`,
  summary: `Acesso por índice é constante; inserir ou remover no início é proporcional a n. map, filter e reduce criam valores novos; sort, reverse e splice alteram o original. Strings são imutáveis. Dois ponteiros e janela deslizante transformam soluções quadráticas em lineares.`,
  refs: [REF.array, REF.sort, REF.string, REF.ods],
  cards: [
    { q: 'Qual o resultado de [10, 9, 1].sort()?', a: '[1, 10, 9]: sem função de comparação, os números são comparados como strings.' },
    { q: 'Por que shift é caro em arrays grandes?', a: 'Porque desloca todos os elementos restantes uma posição para a esquerda.' },
    { q: 'Quando usar janela deslizante?', a: 'Em problemas sobre subarrays ou substrings contíguos, atualizando o resultado ao mover as bordas.' }
  ]
}
];
