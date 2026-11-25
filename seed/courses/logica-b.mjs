// Curso 1 — Aulas 5 a 9.
import { REF } from './logica-a.mjs';

export const lessonsB = [
{
  id: 'log-05', moduleId: 'm2', order: 5, minutes: 75, tags: ['estruturas-de-dados', 'pilha', 'fila', 'lista-ligada'],
  title: 'Pilhas, filas e listas ligadas',
  objectives: ['Diferenciar as políticas LIFO (pilha) e FIFO (fila)', 'Implementar pilha e fila com custo constante por operação', 'Explicar como funciona uma lista ligada e quando ela é vantajosa', 'Resolver problemas clássicos com pilha (parênteses balanceados) e fila (processamento em ordem)'],
  intro: `Pilhas e filas são estruturas definidas pelo **comportamento**, não pela implementação: o que importa é em que ordem os itens saem. Elas estão por trás do botão "desfazer", do histórico do navegador, de filas de mensagens, de impressoras e do próprio event loop que você verá no curso de JavaScript assíncrono. A lista ligada é uma forma de guardar sequências sem posições contíguas, base para entender várias outras estruturas.`,
  theory: `### Tipo abstrato de dados
Um **tipo abstrato de dados** (TAD) descreve operações e regras, sem dizer como são implementadas. Pilha e fila são TADs; arrays e listas ligadas são formas de implementá-los.

### Pilha (stack): último a entrar, primeiro a sair (LIFO)
Operações: §push(x)§ empilha no topo; §pop()§ remove e devolve o topo; §peek()§ consulta o topo sem remover; §isEmpty()§.
Em JavaScript, um array já funciona como pilha eficiente: §push§ e §pop§ atuam no fim e custam tempo constante.

Usos: desfazer/refazer, navegação "voltar", avaliação de expressões, verificação de parênteses, conversão de recursão em iteração (a pilha de chamadas é uma pilha!) e busca em profundidade (DFS).

### Fila (queue): primeiro a entrar, primeiro a sair (FIFO)
Operações: §enqueue(x)§ insere no fim; §dequeue()§ remove do início; §peek()§; §isEmpty()§.
Cuidado: usar um array com §push§ e §shift§ funciona, mas §shift§ desloca todos os elementos, e o custo cresce com o tamanho da fila. Duas implementações com custo constante:
1. **Array com índice de início:** guarde os itens em um array e um índice §inicio§; o dequeue lê §itens[inicio]§ e avança o índice. Periodicamente, descarte a parte já consumida.
2. **Lista ligada** com ponteiros para o primeiro e o último nó.

Usos: processamento em ordem de chegada, filas de tarefas, busca em largura (BFS), buffers de streaming.

### Deque
Uma **deque** (*double-ended queue*) permite inserir e remover nas duas pontas. Serve, por exemplo, para o problema do máximo em janela deslizante.

### Lista ligada (linked list)
Cada **nó** guarda um valor e uma referência ao próximo nó (§next§). A lista guarda a referência ao primeiro nó (§head§) e, opcionalmente, ao último (§tail§).
| Operação | Array | Lista ligada |
|---|---|---|
| Acessar o i-ésimo | constante | proporcional a i (percorre) |
| Inserir/remover no início | proporcional a n | constante |
| Inserir no fim | constante amortizado | constante com §tail§ |
| Inserir após um nó conhecido | proporcional a n (desloca) | constante |

Na **lista duplamente ligada**, cada nó também aponta para o anterior (§prev§), o que permite remover um nó conhecido em tempo constante. Caches LRU combinam lista duplamente ligada com tabela hash.

Na prática em JavaScript, arrays costumam ser mais rápidos que listas ligadas para a maioria dos usos, porque os elementos ficam próximos na memória (melhor uso de cache do processador). Listas ligadas valem quando há muitas inserções e remoções em posições já conhecidas.

### Problema clássico: parênteses balanceados
Percorra o texto; ao ver um símbolo de abertura, empilhe; ao ver um de fechamento, o topo da pilha precisa ser a abertura correspondente. No fim, a pilha precisa estar vazia.`,
  concepts: [
    { term: 'Tipo abstrato de dados (TAD)', def: 'Especificação de operações e regras, independente da implementação.' },
    { term: 'LIFO', def: 'Last In, First Out: o último a entrar é o primeiro a sair (pilha).' },
    { term: 'FIFO', def: 'First In, First Out: o primeiro a entrar é o primeiro a sair (fila).' },
    { term: 'Deque', def: 'Fila com inserção e remoção nas duas pontas.' },
    { term: 'Nó', def: 'Elemento de uma lista ligada: valor mais referência ao próximo (e ao anterior, na duplamente ligada).' },
    { term: 'head / tail', def: 'Referências ao primeiro e ao último nó de uma lista ligada.' }
  ],
  examples: `**Analogias:** a pilha é uma pilha de pratos: você coloca e tira por cima. A fila é a fila do caixa: quem chegou primeiro é atendido primeiro. A lista ligada é uma caça ao tesouro: cada pista diz onde está a próxima; para chegar à décima, você precisa passar pelas nove anteriores.

**Exemplo real:** o botão "desfazer" de um editor guarda cada ação em uma pilha. Desfazer = §pop§. Uma nova ação depois de desfazer limpa a pilha de "refazer".`,
  code: [
    { title: 'Parênteses balanceados com pilha', lang: 'javascript', code: `function balanceado(texto) {
  const pares = { ')': '(', ']': '[', '}': '{' };
  const pilha = [];
  for (const c of texto) {
    if (c === '(' || c === '[' || c === '{') pilha.push(c);
    else if (c in pares) {
      if (pilha.pop() !== pares[c]) return false;
    }
  }
  return pilha.length === 0;
}

console.log(balanceado('{[a](b)}'), balanceado('(]'), balanceado('((')); // true false false`,
      notes: [ { l: '2', t: 'Mapa de fechamento para abertura correspondente.' }, { l: '5', t: 'Abertura: empilha.' }, { l: '7', t: 'Fechamento: o topo precisa ser a abertura correspondente. Se a pilha estiver vazia, pop devolve undefined, que também é diferente: retorna false.' }, { l: '10', t: 'Sobrou abertura sem fechamento? Então não está balanceado.' } ] },
    { title: 'Fila com custo constante usando índice de início', lang: 'javascript', code: `class Fila {
  #itens = [];
  #inicio = 0;
  enqueue(x) { this.#itens.push(x); }
  dequeue() {
    if (this.isEmpty()) return undefined;
    const x = this.#itens[this.#inicio++];
    if (this.#inicio > 1024 && this.#inicio * 2 > this.#itens.length) {
      this.#itens = this.#itens.slice(this.#inicio);
      this.#inicio = 0;
    }
    return x;
  }
  get size() { return this.#itens.length - this.#inicio; }
  isEmpty() { return this.size === 0; }
}`,
      notes: [ { l: '2-3', t: 'Campos privados (#) guardam os itens e a posição do próximo a sair.' }, { l: '7', t: 'Lê o item do início e avança o índice: nenhum elemento é deslocado.' }, { l: '8-11', t: 'Compactação ocasional: quando mais da metade já foi consumida, descarta a parte inicial. O custo é amortizado entre muitas operações.' } ] },
    { title: 'Lista ligada: inserir no início e percorrer', lang: 'javascript', code: `function criarNo(valor, next = null) {
  return { valor, next };
}

let head = null;
head = criarNo(3, head);
head = criarNo(2, head);
head = criarNo(1, head);

const valores = [];
for (let no = head; no !== null; no = no.next) valores.push(no.valor);
console.log(valores); // [1, 2, 3]`,
      notes: [ { l: '6-8', t: 'Cada inserção no início cria um nó que aponta para o antigo head: tempo constante, independente do tamanho.' }, { l: '11', t: 'Percorrer exige seguir as referências uma a uma até null.' } ] }
  ],
  bestPractices: ['Use array com push/pop como pilha em JavaScript.', 'Não use shift em filas grandes; use índice de início ou lista ligada.', 'Encapsule a estrutura em uma classe com operações claras (enqueue, dequeue, isEmpty).', 'Verifique se a estrutura está vazia antes de remover.', 'Escolha lista ligada só quando houver muitas inserções/remoções em posições conhecidas.'],
  mistakes: ['Implementar fila com shift e ter lentidão com milhares de itens.', 'Esquecer de verificar a pilha vazia no final do algoritmo de parênteses.', 'Perder a referência ao restante da lista ao inserir um nó (atualizar next na ordem errada).', 'Confundir LIFO com FIFO ao escolher a estrutura para BFS ou DFS.'],
  market: `Filas estão no centro de sistemas distribuídos (RabbitMQ, Kafka, SQS) e de processamento em segundo plano (BullMQ). Pilhas aparecem em parsers, interpretadores, editores e roteamento de navegação em apps mobile (React Navigation e o Navigator do Flutter usam o modelo de pilha de telas).`,
  summary: `Pilha é LIFO (push/pop no topo); fila é FIFO (entra no fim, sai do início). Em JavaScript, array serve como pilha, mas fila eficiente precisa de índice de início ou lista ligada. Lista ligada insere e remove em posições conhecidas em tempo constante, mas acesso por posição exige percorrer.`,
  refs: [REF.array, REF.ods, REF.algs4],
  cards: [
    { q: 'Qual estrutura segue a política FIFO?', a: 'A fila: o primeiro a entrar é o primeiro a sair.' },
    { q: 'Por que array.shift() é ruim para filas grandes?', a: 'Porque desloca todos os elementos restantes a cada remoção.' },
    { q: 'Qual a vantagem de uma lista ligada sobre um array?', a: 'Inserir ou remover em uma posição já conhecida (como o início) em tempo constante.' }
  ]
},
{
  id: 'log-06', moduleId: 'm2', order: 6, minutes: 70, tags: ['estruturas-de-dados', 'hash', 'map', 'set', 'javascript'],
  title: 'Tabelas hash: Map, Set e contagem de frequência',
  objectives: ['Explicar como uma tabela hash consegue busca média em tempo constante', 'Escolher entre objeto, Map e Set', 'Usar contagem de frequência e índice auxiliar para eliminar laços aninhados', 'Reconhecer colisões e o pior caso de uma tabela hash'],
  intro: `Muitos problemas se resumem a perguntar "já vi este valor?" ou "quantas vezes ele apareceu?". Procurar em um array exige olhar elemento por elemento. Uma tabela hash responde em tempo médio constante. Essa troca de memória por velocidade é uma das ideias mais úteis da computação.`,
  theory: `### Como funciona uma tabela hash
Uma **função hash** transforma uma chave (texto, número) em um número inteiro. Esse número, reduzido ao tamanho de um array interno (por exemplo, com resto da divisão), indica o **balde** (*bucket*) onde o par chave-valor fica.

Para buscar, calcula-se o hash da chave e vai-se direto ao balde: não é preciso percorrer tudo.

### Colisões
Duas chaves diferentes podem cair no mesmo balde: isso é uma **colisão**, inevitável quando há mais chaves possíveis do que baldes. Estratégias comuns:
- **Encadeamento:** cada balde guarda uma pequena lista de pares.
- **Endereçamento aberto:** procura o próximo balde livre.

Quando a tabela enche (o **fator de carga** passa de um limite), ela é **redimensionada**: aloca mais baldes e redistribui tudo. Como isso é raro, o custo médio continua constante (amortizado).

### Custos
- Caso médio de inserir, buscar e remover: **constante**.
- Pior caso: se muitas chaves colidirem, a busca degrada até percorrer todas as chaves do balde. Boas funções hash e redimensionamento tornam isso improvável.

A especificação ECMAScript exige que §Map§ e §Set§ tenham tempo de acesso médio **sublinear** no número de elementos; os motores usam tabelas hash.

### Objeto, Map ou Set?
- **Objeto (§{}§):** chaves são strings ou symbols (números viram strings). Herda propriedades do protótipo; uma chave como §"__proto__"§ ou §"constructor"§ pode causar surpresas. Bom para registros com campos conhecidos.
- **§Map§:** qualquer valor como chave (inclusive objetos, comparados por referência), mantém a **ordem de inserção**, tem §size§ e métodos claros (§get§, §set§, §has§, §delete§). Melhor para dicionários dinâmicos.
- **§Set§:** coleção de valores **únicos**, com §add§, §has§ e §delete§. Ideal para deduplicar e testar pertencimento.

Atenção: chaves de objeto em §Map§ e §Set§ são comparadas por **identidade**. Dois objetos com o mesmo conteúdo são chaves diferentes. Para usar conteúdo como chave, converta para uma string estável (por exemplo, §"x:y"§).

### Padrões que eliminam laços aninhados
1. **Pertencimento:** transformar um array em §Set§ para testar §has§ em tempo constante.
2. **Contagem de frequência:** §Map§ de valor para número de ocorrências (anagramas, moda, duplicatas).
3. **Complemento:** no problema "dois números que somam alvo" em array **não ordenado**, guarde cada número visto em um §Map§ (valor → índice) e pergunte se §alvo - x§ já apareceu.
4. **Agrupamento:** §Map§ de chave para lista (agrupar pedidos por cliente).`,
  concepts: [
    { term: 'Função hash', def: 'Função que transforma uma chave em um inteiro usado para escolher o balde.' },
    { term: 'Colisão', def: 'Duas chaves diferentes mapeadas para o mesmo balde.' },
    { term: 'Fator de carga', def: 'Razão entre itens armazenados e baldes; acima de um limite, a tabela é redimensionada.' },
    { term: 'Map', def: 'Dicionário de JavaScript com chaves de qualquer tipo e ordem de inserção.' },
    { term: 'Set', def: 'Coleção de valores únicos com teste de pertencimento rápido.' },
    { term: 'Comparação por identidade', def: 'Objetos são iguais como chave só se forem a mesma referência.' }
  ],
  examples: `**Analogia:** uma biblioteca sem catálogo obriga você a olhar livro por livro. Com o catálogo, você calcula a estante a partir do título (a função hash) e vai direto lá. Às vezes dois títulos caem na mesma estante (colisão): você olha os poucos livros dela. Quando as estantes lotam, a biblioteca compra mais e reorganiza (redimensionamento).

**Exemplo real:** remover e-mails duplicados de uma lista de 100 mil cadastros. Com §includes§ dentro de um laço, cada verificação percorre a lista. Com um §Set§, cada verificação é imediata.`,
  code: [
    { title: 'Dois números que somam o alvo (array não ordenado)', lang: 'javascript', code: `function doisSomam(nums, alvo) {
  const vistos = new Map();
  for (let i = 0; i < nums.length; i++) {
    const falta = alvo - nums[i];
    if (vistos.has(falta)) return [vistos.get(falta), i];
    vistos.set(nums[i], i);
  }
  return null;
}

console.log(doisSomam([8, 3, 11, 5], 16)); // [2, 3]`,
      notes: [ { l: '2', t: 'Map de valor para índice dos números já vistos.' }, { l: '4-5', t: 'Se o complemento já apareceu, achamos o par. Uma consulta ao Map tem custo médio constante.' }, { l: '6', t: 'Registra depois de testar, para não usar o mesmo elemento duas vezes.' } ] },
    { title: 'Contagem de frequência: anagramas', lang: 'javascript', code: `function contar(texto) {
  const freq = new Map();
  for (const c of texto) freq.set(c, (freq.get(c) || 0) + 1);
  return freq;
}

function anagramas(a, b) {
  if (a.length !== b.length) return false;
  const fa = contar(a);
  for (const c of b) {
    const n = fa.get(c);
    if (!n) return false;
    fa.set(c, n - 1);
  }
  return true;
}

console.log(anagramas('amor', 'roma'), anagramas('casa', 'saca'), anagramas('ola', 'oi')); // true true false`,
      notes: [ { l: '3', t: '(freq.get(c) || 0) trata a primeira ocorrência, quando get devolve undefined.' }, { l: '8', t: 'Tamanhos diferentes nunca são anagramas: saída rápida.' }, { l: '11-13', t: 'Cada letra de b consome uma ocorrência de a; se faltar, não é anagrama.' } ] },
    { title: 'Set para deduplicar e Map para agrupar', lang: 'javascript', code: `const emails = ['a@x.com', 'b@x.com', 'a@x.com'];
const unicos = [...new Set(emails)];

const pedidos = [{ cliente: 'ana', id: 1 }, { cliente: 'bia', id: 2 }, { cliente: 'ana', id: 3 }];
const porCliente = new Map();
for (const p of pedidos) {
  if (!porCliente.has(p.cliente)) porCliente.set(p.cliente, []);
  porCliente.get(p.cliente).push(p.id);
}

console.log(unicos, [...porCliente]); // ['a@x.com', 'b@x.com'] [['ana', [1, 3]], ['bia', [2]]]`,
      notes: [ { l: '2', t: 'O Set descarta repetidos; o espalhamento volta a ser array, na ordem da primeira ocorrência.' }, { l: '7-8', t: 'Cria a lista do grupo na primeira vez e depois acrescenta. Map.groupBy (ES2024) faz o mesmo em uma linha nos ambientes que o suportam.' } ] }
  ],
  bestPractices: ['Use Set para pertencimento e deduplicação.', 'Use Map para dicionários dinâmicos; use objeto para registros com campos fixos.', 'Para chaves compostas, crie uma string estável como "x:y".', 'Ao ver includes ou indexOf dentro de um laço, considere um Set ou Map.', 'Lembre que a tabela hash troca memória por velocidade.'],
  mistakes: ['Usar objetos como chave esperando comparação por conteúdo.', 'Usar objeto literal como dicionário com chaves vindas do usuário (ex.: "__proto__").', 'Esquecer que chaves numéricas em objetos viram strings.', 'Achar que a busca em hash é sempre constante, ignorando o pior caso com muitas colisões.'],
  market: `Caches (Redis é, essencialmente, um grande dicionário em memória), índices de banco de dados do tipo hash, deduplicação de eventos, contadores de rate limiting e agrupamentos em relatórios usam a mesma ideia. Em entrevistas, "use um hash map" é a otimização mais comum para problemas de arrays.`,
  summary: `Tabelas hash calculam o balde a partir da chave e oferecem busca, inserção e remoção em tempo médio constante. Colisões são tratadas por encadeamento ou endereçamento aberto. Em JavaScript, use Map para dicionários e Set para valores únicos; objetos como chave são comparados por referência.`,
  refs: [REF.map, REF.set, REF.ods, REF.clrs],
  cards: [
    { q: 'O que é uma colisão em tabela hash?', a: 'Quando duas chaves diferentes caem no mesmo balde.' },
    { q: 'new Set([1, 1, 2]).size vale quanto?', a: '2.' },
    { q: 'Duas chaves {id: 1} diferentes em um Map são a mesma chave?', a: 'Não: objetos são comparados por referência.' }
  ]
},
{
  id: 'log-07', moduleId: 'm2', order: 7, minutes: 85, tags: ['estruturas-de-dados', 'arvores', 'grafos', 'bfs', 'dfs'],
  title: 'Árvores e grafos: percursos em largura e profundidade',
  objectives: ['Descrever árvores, árvores binárias e árvores binárias de busca', 'Percorrer árvores em pré-ordem, em-ordem e pós-ordem', 'Representar grafos com lista de adjacência', 'Aplicar busca em largura (BFS) e busca em profundidade (DFS), incluindo menor caminho em número de arestas'],
  intro: `Muitos dados reais não são listas: são hierarquias (pastas, organogramas, o DOM) ou redes (ruas, amizades, dependências entre pacotes). Árvores e grafos modelam essas estruturas. Duas estratégias de percurso, em largura e em profundidade, resolvem uma grande família de problemas, do menor caminho em um mapa à detecção de dependências circulares.`,
  theory: `### Árvores
Uma **árvore** é formada por **nós** ligados por **arestas**, com um nó especial, a **raiz**, e nenhum ciclo. Cada nó (exceto a raiz) tem exatamente um **pai**. Nós sem filhos são **folhas**. A **altura** é o maior número de arestas da raiz até uma folha.

**Árvore binária:** cada nó tem no máximo dois filhos (esquerdo e direito).

### Percursos em profundidade de árvore binária
- **Pré-ordem:** nó, esquerda, direita. Útil para copiar ou serializar a árvore.
- **Em-ordem:** esquerda, nó, direita. Em uma árvore binária de busca, visita os valores **em ordem crescente**.
- **Pós-ordem:** esquerda, direita, nó. Útil para liberar recursos ou calcular tamanhos (os filhos antes do pai).

### Árvore binária de busca (BST)
Para todo nó, os valores da subárvore esquerda são **menores** e os da direita são **maiores**. A busca desce comparando: se o alvo é menor, vai para a esquerda; se maior, para a direita. O custo é proporcional à **altura**:
- Árvore equilibrada: altura cerca de log₂(n), então a busca é logarítmica.
- Inserções em ordem (1, 2, 3, 4...) criam uma árvore "degenerada", parecida com uma lista: altura n.
Árvores **autoequilibradas** (AVL, rubro-negra) mantêm a altura logarítmica; os índices B-tree de bancos de dados seguem a mesma ideia com muitos filhos por nó.

### Grafos
Um **grafo** é um conjunto de **vértices** e **arestas**. Pode ser:
- **dirigido** (arestas têm sentido: "A segue B") ou **não dirigido** (ruas de mão dupla);
- **ponderado** (arestas têm custo, como distância) ou não ponderado;
- **com ciclos** ou **acíclico**. Árvores são grafos conexos e acíclicos.

### Representação
- **Lista de adjacência:** para cada vértice, a lista de vizinhos. Em JavaScript, um §Map§ de vértice para array. Ocupa memória proporcional a vértices + arestas: é a escolha padrão.
- **Matriz de adjacência:** tabela V × V com 1 onde há aresta. Responde "existe aresta entre A e B?" em tempo constante, mas ocupa V² de memória.

### Busca em largura (BFS)
Explora o grafo em **camadas**: primeiro os vizinhos da origem, depois os vizinhos dos vizinhos, e assim por diante. Usa uma **fila** e um conjunto de **visitados**.
Propriedade central: em grafo **não ponderado**, a primeira vez que a BFS alcança um vértice é pelo caminho com **menos arestas**. Por isso BFS resolve menor caminho em número de passos.

### Busca em profundidade (DFS)
Segue um caminho até não poder mais e então volta (*backtracking*). Usa uma **pilha**, explícita ou a própria pilha de chamadas (recursão). Serve para verificar se dois vértices estão conectados, contar componentes, detectar ciclos e fazer **ordenação topológica** (ordem de tarefas com dependências).

Nas duas buscas, o custo é proporcional a **V + E** (vértices mais arestas), porque cada vértice e cada aresta são processados uma vez. Sem o conjunto de visitados, ciclos fazem a busca girar para sempre.

### E caminhos com peso?
Quando as arestas têm custos diferentes, a BFS não garante o menor custo. Usa-se o algoritmo de **Dijkstra** (pesos não negativos), que troca a fila simples por uma fila de prioridade. Ele está fora do escopo deste curso, mas é a continuação natural.`,
  concepts: [
    { term: 'Raiz, folha, altura', def: 'Raiz é o nó sem pai; folha é o nó sem filhos; altura é o maior número de arestas da raiz até uma folha.' },
    { term: 'Árvore binária de busca', def: 'Árvore binária em que, para cada nó, a esquerda tem valores menores e a direita, maiores.' },
    { term: 'Percurso em-ordem', def: 'Esquerda, nó, direita; em uma BST visita os valores em ordem crescente.' },
    { term: 'Lista de adjacência', def: 'Representação de grafo que guarda, para cada vértice, a lista de vizinhos.' },
    { term: 'BFS', def: 'Busca em largura: camada por camada, com fila; dá o menor caminho em número de arestas.' },
    { term: 'DFS', def: 'Busca em profundidade: vai até o fim de um caminho e volta, com pilha ou recursão.' },
    { term: 'Ordenação topológica', def: 'Ordem dos vértices de um grafo dirigido acíclico em que toda aresta vai de um vértice anterior para um posterior.' }
  ],
  examples: `**Analogias:** BFS é uma pedra jogada no lago: as ondas se espalham em círculos, uma distância por vez. DFS é explorar um labirinto com a mão na parede: segue um corredor até o fim e, se não houver saída, volta até a última bifurcação.

**Exemplo real:** "graus de separação" em uma rede social (quantas conexões entre duas pessoas) é BFS. A ordem de instalação de pacotes com dependências, ou de execução de migrations, é ordenação topológica feita com DFS.`,
  code: [
    { title: 'BST: inserir, buscar e percorrer em ordem', lang: 'javascript', code: `function inserir(no, valor) {
  if (no === null) return { valor, esq: null, dir: null };
  if (valor < no.valor) no.esq = inserir(no.esq, valor);
  else if (valor > no.valor) no.dir = inserir(no.dir, valor);
  return no;
}

function contem(no, valor) {
  while (no !== null) {
    if (valor === no.valor) return true;
    no = valor < no.valor ? no.esq : no.dir;
  }
  return false;
}

function emOrdem(no, saida = []) {
  if (no === null) return saida;
  emOrdem(no.esq, saida);
  saida.push(no.valor);
  emOrdem(no.dir, saida);
  return saida;
}

let raiz = null;
for (const v of [8, 3, 10, 1, 6]) raiz = inserir(raiz, v);
console.log(contem(raiz, 6), contem(raiz, 7), emOrdem(raiz)); // true false [1, 3, 6, 8, 10]`,
      notes: [ { l: '2', t: 'Caso base: posição vazia, cria o nó.' }, { l: '3-4', t: 'Desce pelo lado certo. Valores iguais são ignorados (sem duplicatas).' }, { l: '9-12', t: 'Busca iterativa: cada passo desce um nível, então o custo é a altura.' }, { l: '16-21', t: 'Em-ordem: esquerda, nó, direita. Em uma BST o resultado sai ordenado.' } ] },
    { title: 'BFS: menor número de passos entre dois vértices', lang: 'javascript', code: `function menorCaminho(grafo, origem, destino) {
  const anterior = new Map([[origem, null]]);
  const fila = [origem];
  let i = 0;
  while (i < fila.length) {
    const atual = fila[i++];
    if (atual === destino) break;
    for (const viz of grafo.get(atual) || []) {
      if (!anterior.has(viz)) {
        anterior.set(viz, atual);
        fila.push(viz);
      }
    }
  }
  if (!anterior.has(destino)) return null;
  const caminho = [];
  for (let v = destino; v !== null; v = anterior.get(v)) caminho.unshift(v);
  return caminho;
}

const mapa = new Map([
  ['A', ['B', 'C']], ['B', ['A', 'D']], ['C', ['A', 'D']], ['D', ['B', 'C', 'E']], ['E', ['D']]
]);
console.log(menorCaminho(mapa, 'A', 'E')); // ['A', 'B', 'D', 'E']`,
      notes: [ { l: '2', t: 'anterior serve duas vezes: como conjunto de visitados e para reconstruir o caminho.' }, { l: '3-6', t: 'Fila com índice de leitura (sem shift), como na aula de filas.' }, { l: '9-11', t: 'Marca como visitado ao enfileirar, não ao processar: evita enfileirar o mesmo vértice várias vezes.' }, { l: '15', t: 'Se o destino nunca foi alcançado, não há caminho.' }, { l: '17', t: 'Volta do destino até a origem seguindo os anteriores. O unshift aqui é aceitável porque o caminho é curto.' } ] },
    { title: 'DFS recursiva: contar componentes conectados', lang: 'javascript', code: `function componentes(grafo) {
  const visitado = new Set();
  function dfs(v) {
    visitado.add(v);
    for (const viz of grafo.get(v) || []) if (!visitado.has(viz)) dfs(viz);
  }
  let total = 0;
  for (const v of grafo.keys()) {
    if (!visitado.has(v)) { total++; dfs(v); }
  }
  return total;
}

const g = new Map([['a', ['b']], ['b', ['a']], ['c', []], ['d', ['e']], ['e', ['d']]]);
console.log(componentes(g)); // 3`,
      notes: [ { l: '3-6', t: 'A DFS marca tudo que é alcançável a partir de v.' }, { l: '8-10', t: 'Cada vértice ainda não visitado inicia um novo componente.' } ] }
  ],
  bestPractices: ['Represente grafos com lista de adjacência (Map de vértice para vizinhos) por padrão.', 'Sempre mantenha um conjunto de visitados em grafos que podem ter ciclos.', 'Use BFS para menor caminho em número de passos; DFS para conectividade, ciclos e ordenação topológica.', 'Para árvores ou grafos muito profundos, prefira DFS iterativa com pilha explícita para evitar estouro de pilha.', 'Desenhe o grafo com um exemplo pequeno antes de codificar.'],
  mistakes: ['Esquecer o conjunto de visitados e entrar em laço infinito em grafos com ciclos.', 'Marcar visitado só ao desenfileirar, enfileirando o mesmo vértice várias vezes.', 'Usar BFS para menor custo em grafo ponderado.', 'Inserir dados já ordenados em uma BST simples e obter uma árvore degenerada.', 'Confundir pré-ordem, em-ordem e pós-ordem.'],
  market: `O DOM e a árvore de componentes React são árvores. Gerenciadores de pacotes (npm, pub do Dart, Gradle) resolvem grafos de dependências. Sistemas de recomendação, roteamento de entregas, detecção de fraude e controle de permissões em hierarquias usam grafos. Bancos de dados usam B-trees para seus índices.`,
  summary: `Árvores são hierarquias sem ciclos; a BST permite busca proporcional à altura. Grafos modelam redes e são representados por lista de adjacência. BFS usa fila e acha o menor caminho em número de arestas; DFS usa pilha ou recursão e resolve conectividade e ordenação topológica. Ambas custam V + E e exigem controle de visitados.`,
  refs: [REF.ods, REF.algs4, REF.mit, REF.clrs, REF.map],
  cards: [
    { q: 'Qual percurso de uma BST devolve os valores em ordem crescente?', a: 'Em-ordem (esquerda, nó, direita).' },
    { q: 'Qual estrutura auxiliar a BFS usa? E a DFS?', a: 'BFS usa fila; DFS usa pilha (ou a pilha de chamadas, via recursão).' },
    { q: 'Qual o custo de BFS e DFS em lista de adjacência?', a: 'Proporcional a V + E (vértices mais arestas).' }
  ]
},
{
  id: 'log-08', moduleId: 'm3', order: 8, minutes: 80, tags: ['complexidade', 'big-o', 'algoritmos'],
  title: 'Complexidade de algoritmos e notação Big O',
  objectives: ['Explicar o que a notação Big O mede e o que ela ignora', 'Determinar a complexidade de tempo e de espaço de trechos de código', 'Comparar O(1), O(log n), O(n), O(n log n), O(n²) e O(2ⁿ)', 'Diferenciar melhor caso, pior caso, caso médio e custo amortizado'],
  intro: `Ao longo do curso, você leu frases como "proporcional a n" e "tempo constante". Esta aula dá nome e método a isso. A notação Big O permite comparar algoritmos sem depender de computador, linguagem ou cronômetro, e prever o que acontece quando os dados crescem de mil para um milhão de registros.`,
  theory: `### O que Big O descreve
Big O descreve como o **custo** de um algoritmo **cresce** em função do tamanho da entrada, n, quando n fica grande. Formalmente, dizer que o custo é O(f(n)) significa que, a partir de algum n, o custo é no máximo uma constante vezes f(n). É um **limite superior** de crescimento.

Duas simplificações decorrem dessa definição:
1. **Constantes são descartadas:** 3n + 5 é O(n).
2. **Só o termo dominante importa:** n² + 100n é O(n²), porque para n grande o n² domina.

O que Big O **não** diz: o tempo exato em milissegundos. Um algoritmo O(n) com constante enorme pode ser mais lento que um O(n log n) para entradas pequenas. Big O fala de **escala**; para desempenho real, meça.

### As classes mais comuns
| Notação | Nome | Exemplo | n = 1.000.000 (ordem de grandeza) |
|---|---|---|---|
| O(1) | constante | acessar §a[i]§, §Map.get§ (médio) | 1 |
| O(log n) | logarítmica | busca binária, busca em BST equilibrada | cerca de 20 |
| O(n) | linear | percorrer um array, BFS (V + E) | 1 milhão |
| O(n log n) | linearítmica | merge sort, ordenação eficiente | cerca de 20 milhões |
| O(n²) | quadrática | dois laços aninhados sobre os mesmos dados | 1 trilhão |
| O(2ⁿ) | exponencial | Fibonacci recursivo ingênuo, testar todos os subconjuntos | inviável |

Por que log n é tão pequeno? Porque cada passo **divide** o problema pela metade: 1.000.000 → 500.000 → ... → 1 leva cerca de 20 passos (2²⁰ ≈ 1.048.576).

### Como calcular, regra por regra
1. **Instruções simples** (atribuição, aritmética, acesso por índice): O(1).
2. **Sequência:** some os custos e fique com o maior. O(n) seguido de O(n²) dá O(n²).
3. **Laço:** número de iterações × custo do corpo. Um laço de 0 a n com corpo O(1) é O(n).
4. **Laços aninhados:** multiplique. Dois laços de 0 a n: O(n²). Laço interno de i+1 a n ainda dá cerca de n²/2, que é O(n²).
5. **Laço que divide ou multiplica a variável** (§i = i * 2§ até n): O(log n).
6. **Chamadas de função:** conte o custo da função chamada. §includes§ dentro de um laço é um laço aninhado disfarçado: O(n²).
7. **Recursão:** número de chamadas × trabalho por chamada. Fibonacci ingênuo faz cerca de 2ⁿ chamadas; a potência por divisão do expoente faz cerca de log n.

### Entradas diferentes, variáveis diferentes
Se o algoritmo percorre um array de tamanho a e outro de tamanho b, o custo é O(a + b), não O(n). Laços aninhados sobre os dois dão O(a × b).

### Complexidade de espaço
Mede a memória **extra** usada além da entrada. Criar um §Set§ com todos os elementos é O(n) de espaço; dois ponteiros usam O(1). A recursão também ocupa espaço: uma recursão de profundidade n usa O(n) de pilha.

### Melhor, pior, médio e amortizado
- **Pior caso:** o limite que você pode prometer. É o mais usado.
- **Melhor caso:** raramente útil (a busca linear acha o alvo na primeira posição).
- **Caso médio:** depende de supor uma distribuição das entradas (tabela hash: O(1) em média).
- **Amortizado:** média ao longo de uma sequência de operações (§push§ em array: O(1) amortizado, mesmo que um redimensionamento custe O(n)).

### Trocas entre tempo e espaço
Muitas otimizações gastam memória para ganhar tempo: o §Set§ que transforma O(n²) em O(n), a memoização que transforma Fibonacci de O(2ⁿ) em O(n). Decidir se a troca vale depende do volume de dados e dos limites de memória do ambiente (um celular, uma função serverless).`,
  concepts: [
    { term: 'Big O', def: 'Limite superior de como o custo cresce em função do tamanho da entrada, ignorando constantes e termos menores.' },
    { term: 'Termo dominante', def: 'Parte da expressão de custo que cresce mais rápido; é a única que fica na notação.' },
    { term: 'O(log n)', def: 'Crescimento logarítmico: típico de algoritmos que dividem o problema pela metade a cada passo.' },
    { term: 'O(n log n)', def: 'Custo das ordenações eficientes por comparação, como merge sort.' },
    { term: 'Complexidade de espaço', def: 'Memória extra usada pelo algoritmo, incluindo a pilha de recursão.' },
    { term: 'Pior caso', def: 'Maior custo possível para entradas de tamanho n; é a garantia que se pode dar.' },
    { term: 'Custo amortizado', def: 'Custo médio por operação ao longo de uma sequência de operações.' }
  ],
  examples: `**Analogia:** encontrar um nome em uma lista telefônica. Ler página por página é O(n). Abrir no meio, ver se o nome vem antes ou depois e descartar metade é O(log n): mesmo uma lista com um milhão de nomes é resolvida em cerca de 20 aberturas. Comparar cada pessoa com todas as outras para achar homônimos é O(n²).

**Exemplo numérico:** um computador que faz cerca de 100 milhões de operações simples por segundo (ordem de grandeza ilustrativa) processa n = 100.000 em O(n log n) quase instantaneamente (cerca de 1,7 milhão de operações), mas em O(n²) precisaria de 10 bilhões de operações: perto de 100 segundos.`,
  code: [
    { title: 'Mesma tarefa, complexidades diferentes: há duplicatas?', lang: 'javascript', code: `// O(n²) de tempo, O(1) de espaço extra
function temDuplicataLento(lista) {
  for (let i = 0; i < lista.length; i++) {
    for (let j = i + 1; j < lista.length; j++) {
      if (lista[i] === lista[j]) return true;
    }
  }
  return false;
}

// O(n) de tempo médio, O(n) de espaço extra
function temDuplicata(lista) {
  const vistos = new Set();
  for (const x of lista) {
    if (vistos.has(x)) return true;
    vistos.add(x);
  }
  return false;
}`,
      notes: [ { l: '3-7', t: 'Laços aninhados: cerca de n²/2 comparações no pior caso (sem duplicatas). Ainda é O(n²).' }, { l: '13-16', t: 'Uma passada com consultas O(1) em média. Troca memória (o Set) por tempo.' } ] },
    { title: 'Reconhecendo O(log n) e O(n log n)', lang: 'javascript', code: `function passosAteUm(n) {
  let passos = 0;
  while (n > 1) {
    n = Math.floor(n / 2);
    passos++;
  }
  return passos;
}

function pares(n) {
  let operacoes = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 1; j < n; j *= 2) operacoes++;
  }
  return operacoes;
}

console.log(passosAteUm(1000000), pares(8)); // 19 24`,
      notes: [ { l: '3-6', t: 'n é dividido por 2 a cada volta: o número de voltas é cerca de log₂ n.' }, { l: '11-13', t: 'Laço externo O(n) com interno O(log n), pois j dobra: total O(n log n). Para n = 8: 8 × 3 = 24.' } ] },
    { title: 'Memoização: de exponencial para linear', lang: 'javascript', code: `function fibLento(n) {
  if (n < 2) return n;
  return fibLento(n - 1) + fibLento(n - 2);
}

function fib(n, memo = new Map()) {
  if (n < 2) return n;
  if (memo.has(n)) return memo.get(n);
  const r = fib(n - 1, memo) + fib(n - 2, memo);
  memo.set(n, r);
  return r;
}

console.log(fib(70)); // 190392490709135 (fibLento(70) faria cerca de 6 × 10¹⁴ chamadas)`,
      notes: [ { l: '3', t: 'Duas chamadas por nível: a árvore de chamadas cresce de forma exponencial e recalcula os mesmos valores.' }, { l: '8', t: 'Valor já calculado: devolve direto. Cada n é calculado uma vez, então o tempo é O(n), com O(n) de memória.' }, { l: '13', t: 'fib(70) ainda é exato no tipo number. A partir de fib(79), o resultado passa de Number.MAX_SAFE_INTEGER e perde precisão: seria preciso usar bigint.' } ] }
  ],
  bestPractices: ['Calcule a complexidade de tempo e de espaço antes de otimizar.', 'Procure laços escondidos: includes, indexOf, find, splice e shift dentro de laços.', 'Use variáveis diferentes para entradas diferentes: O(a + b), O(a × b).', 'Confirme com medição quando a constante importar (entradas pequenas ou caminhos críticos).', 'Prefira O(n log n) ou melhor para dados que podem crescer sem limite.'],
  mistakes: ['Dizer que dois laços em sequência são O(n²); são O(n).', 'Esquecer o custo das funções chamadas dentro de um laço.', 'Ignorar o espaço da pilha de recursão.', 'Tratar Big O como tempo exato.', 'Otimizar um trecho O(n) irrelevante enquanto um O(n²) domina o tempo total.'],
  market: `Revisores de código apontam laços aninhados sobre listas grandes, consultas ao banco dentro de laços (o problema N+1, que você verá no curso de ORMs) e ordenações desnecessárias. Em entrevistas, quase toda pergunta termina com "qual a complexidade da sua solução e dá para melhorar?".`,
  summary: `Big O descreve o crescimento do custo, sem constantes e só com o termo dominante. Sequências somam, laços aninhados multiplicam, divisões sucessivas dão log n. Considere tempo e espaço, inclusive a pilha da recursão. Use o pior caso como garantia e meça quando a constante importar.`,
  refs: [REF.mit, REF.clrs, REF.algs4, REF.number],
  cards: [
    { q: 'Qual a complexidade de 3n² + 50n + 7?', a: 'O(n²): descarta constantes e termos menores.' },
    { q: 'Dois laços em sequência, cada um de 0 a n. Qual a complexidade?', a: 'O(n) (n + n = 2n).' },
    { q: 'Quantos passos, aproximadamente, uma busca binária precisa para 1 milhão de itens?', a: 'Cerca de 20 (log₂ 1.000.000 ≈ 19,9).' },
    { q: 'Qual o espaço extra de uma recursão com profundidade n?', a: 'O(n), por causa dos quadros na pilha de chamadas.' }
  ]
},
{
  id: 'log-09', moduleId: 'm3', order: 9, minutes: 85, tags: ['algoritmos', 'busca', 'ordenacao', 'javascript'],
  title: 'Busca e ordenação: busca binária, merge sort e quicksort',
  objectives: ['Implementar busca linear e busca binária, incluindo a busca pela primeira ocorrência', 'Explicar e comparar ordenação por inserção, merge sort e quicksort', 'Definir estabilidade de ordenação e usá-la a seu favor', 'Usar Array.prototype.sort corretamente, com função de comparação'],
  intro: `Ordenar e buscar estão entre as operações mais executadas em qualquer sistema: listas de produtos por preço, extratos por data, rankings, autocompletar. Além de úteis por si, os algoritmos de ordenação são o melhor laboratório para praticar recursão, divisão e conquista e análise de complexidade.`,
  theory: `### Busca linear
Percorre do início ao fim até encontrar o alvo: O(n). Funciona em qualquer array, ordenado ou não.

### Busca binária
Exige array **ordenado**. Compara o alvo com o elemento do **meio**: se for igual, achou; se for menor, descarta a metade direita; se for maior, descarta a esquerda. Cada passo divide o espaço de busca pela metade: O(log n).

Detalhes que causam bugs:
- Use §esq <= dir§ quando o intervalo é fechado [esq, dir].
- Calcule o meio com §Math.floor((esq + dir) / 2)§. Em linguagens com inteiros de tamanho fixo, prefere-se §esq + Math.floor((dir - esq) / 2)§ para evitar estouro; em JavaScript, os índices de array nunca chegam perto do limite seguro, mas o hábito é bom.
- Sempre avance (§esq = meio + 1§ ou §dir = meio - 1§); senão, o laço pode não terminar.

Variação importante: **primeira ocorrência** (ou "limite inferior"). Ao encontrar o alvo, guarde a posição e continue procurando à esquerda. Serve também para responder "onde este valor deveria ser inserido?".

### Ordenação por inserção (insertion sort)
Mantém a parte esquerda ordenada e insere cada novo elemento na posição certa, deslocando os maiores. Pior caso O(n²), mas O(n) se o array já estiver quase ordenado, e é **estável**. Por ser simples e rápida em entradas pequenas, implementações reais a usam como etapa final para pedaços pequenos.

### Merge sort (divisão e conquista)
1. **Divide** o array ao meio.
2. **Conquista:** ordena cada metade recursivamente (caso base: tamanho 0 ou 1).
3. **Combina:** intercala (*merge*) as duas metades ordenadas, comparando os primeiros de cada uma.
Há cerca de log₂ n níveis de divisão e cada nível faz O(n) de trabalho na intercalação: **O(n log n)** em todos os casos. Usa O(n) de memória extra e é **estável** se, em empate, pegar primeiro da metade esquerda.

### Quicksort
Escolhe um **pivô**, **particiona** o array em menores e maiores que o pivô e ordena cada parte recursivamente. Em média O(n log n) e, implementado no próprio array, usa pouca memória extra. No **pior caso** (pivô sempre o menor ou o maior, como em array já ordenado com pivô fixo no extremo), vira O(n²). Escolher o pivô aleatoriamente ou pela mediana de três torna o pior caso improvável. Não é estável na forma clássica.

### Limite inferior das ordenações por comparação
Algoritmos que ordenam **apenas comparando pares** de elementos precisam, no pior caso, de cerca de n log n comparações. Por isso O(n log n) é considerado ótimo para esse tipo de ordenação. Algoritmos que não comparam (counting sort, radix sort) podem ser lineares em casos específicos, como inteiros em um intervalo pequeno.

### Estabilidade
Uma ordenação é **estável** quando elementos com a mesma chave mantêm a ordem original. Isso permite ordenar por vários critérios: ordene primeiro pelo critério secundário e depois pelo principal. Desde o ES2019, a especificação exige que §Array.prototype.sort§ seja estável.

### §Array.prototype.sort§ na prática
- Sem função de comparação, converte os elementos para **string** e compara: §[10, 9, 1].sort()§ dá §[1, 10, 9]§.
- A função §(a, b) => ...§ deve devolver número negativo se §a§ vem antes, positivo se §b§ vem antes, e §0§ se empatam. Para números: §(a, b) => a - b§.
- Para textos em português, use §a.localeCompare(b, 'pt-BR')§, que trata acentos corretamente.
- §sort§ altera o array; §toSorted§ (ES2023) devolve uma cópia.
- A especificação não define qual algoritmo o motor usa; o V8 usa o TimSort, um híbrido de merge sort e inserção.`,
  concepts: [
    { term: 'Busca binária', def: 'Busca em array ordenado que descarta metade do intervalo a cada passo: O(log n).' },
    { term: 'Divisão e conquista', def: 'Estratégia que divide o problema, resolve as partes recursivamente e combina os resultados.' },
    { term: 'Intercalação (merge)', def: 'Combinação de duas listas ordenadas em uma lista ordenada, em tempo linear.' },
    { term: 'Pivô', def: 'Elemento usado pelo quicksort para separar menores e maiores.' },
    { term: 'Ordenação estável', def: 'Mantém a ordem relativa original de elementos com a mesma chave.' },
    { term: 'Função de comparação', def: 'Função (a, b) que devolve negativo, zero ou positivo para indicar a ordem entre a e b.' }
  ],
  examples: `**Analogias:** a busca binária é o jogo "adivinhe o número de 1 a 100": responder "maior" ou "menor" permite acertar em no máximo 7 tentativas. O merge sort é organizar provas de uma turma dividindo a pilha entre monitores, cada um ordena a sua, e depois juntando as pilhas ordenadas duas a duas. A ordenação por inserção é como organizar cartas na mão: cada carta nova é encaixada no lugar certo.

**Exemplo de estabilidade:** uma loja lista pedidos por **status** e, dentro de cada status, por **data**. Ordene primeiro por data e depois, com uma ordenação estável, por status: a ordem por data se mantém dentro de cada grupo.`,
  code: [
    { title: 'Busca binária: primeira ocorrência', lang: 'javascript', code: `function primeiraOcorrencia(ordenado, alvo) {
  let esq = 0;
  let dir = ordenado.length - 1;
  let resposta = -1;
  while (esq <= dir) {
    const meio = Math.floor((esq + dir) / 2);
    if (ordenado[meio] === alvo) {
      resposta = meio;
      dir = meio - 1;
    } else if (ordenado[meio] < alvo) {
      esq = meio + 1;
    } else {
      dir = meio - 1;
    }
  }
  return resposta;
}

console.log(primeiraOcorrencia([1, 2, 2, 2, 5], 2), primeiraOcorrencia([1, 3], 2)); // 1 -1`,
      notes: [ { l: '5', t: 'Intervalo fechado [esq, dir]: continua enquanto houver pelo menos um elemento.' }, { l: '7-9', t: 'Achou: guarda e continua procurando à esquerda, onde pode haver uma ocorrência anterior.' }, { l: '10-14', t: 'Cada ramo avança uma das bordas, garantindo o término.' } ] },
    { title: 'Merge sort estável', lang: 'javascript', code: `function mergeSort(lista, cmp = (a, b) => a - b) {
  if (lista.length <= 1) return lista.slice();
  const meio = Math.floor(lista.length / 2);
  const esq = mergeSort(lista.slice(0, meio), cmp);
  const dir = mergeSort(lista.slice(meio), cmp);
  const saida = [];
  let i = 0;
  let j = 0;
  while (i < esq.length && j < dir.length) {
    if (cmp(esq[i], dir[j]) <= 0) saida.push(esq[i++]);
    else saida.push(dir[j++]);
  }
  while (i < esq.length) saida.push(esq[i++]);
  while (j < dir.length) saida.push(dir[j++]);
  return saida;
}

console.log(mergeSort([5, 2, 9, 1, 5, 6])); // [1, 2, 5, 5, 6, 9]`,
      notes: [ { l: '2', t: 'Caso base: 0 ou 1 elemento já está ordenado. slice devolve uma cópia para não alterar a entrada.' }, { l: '4-5', t: 'Divide e ordena cada metade recursivamente.' }, { l: '10', t: '<= 0 em empate pega da esquerda primeiro: é isso que torna a ordenação estável.' }, { l: '13-14', t: 'Copia o que sobrou de uma das metades.' } ] },
    { title: 'Ordenação por vários critérios com sort estável', lang: 'javascript', code: `const pedidos = [
  { id: 1, status: 'enviado', data: '2026-11-03' },
  { id: 2, status: 'pendente', data: '2026-11-01' },
  { id: 3, status: 'enviado', data: '2026-11-01' },
  { id: 4, status: 'pendente', data: '2026-11-02' }
];

const ordenados = pedidos
  .toSorted((a, b) => a.data.localeCompare(b.data))
  .toSorted((a, b) => a.status.localeCompare(b.status, 'pt-BR'));

console.log(ordenados.map((p) => p.id)); // [3, 1, 2, 4]`,
      notes: [ { l: '9', t: 'Primeiro pelo critério secundário: data. Datas ISO (AAAA-MM-DD) ordenam corretamente como texto.' }, { l: '10', t: 'Depois pelo principal: status. Como sort é estável, a ordem por data se mantém dentro de cada status.' }, { l: '12', t: 'enviado: 3 (dia 1), 1 (dia 3); pendente: 2 (dia 1), 4 (dia 2).' } ] }
  ],
  bestPractices: ['Passe sempre uma função de comparação para sort com números: (a, b) => a − b.', 'Use localeCompare com o idioma para ordenar textos com acentos.', 'Use toSorted quando não puder alterar o array original.', 'Para buscar muitas vezes no mesmo conjunto, ordene uma vez e use busca binária, ou use um Set/Map.', 'Teste a busca binária com array vazio, um elemento, alvo no início, no fim e ausente.'],
  mistakes: ['Esquecer de avançar esq ou dir na busca binária e criar laço infinito.', 'Usar busca binária em array não ordenado.', 'Função de comparação que devolve booleano (a > b) em vez de número.', 'Supor que sort não altera o array.', 'Usar quicksort com pivô fixo no extremo em dados já ordenados.'],
  market: `Ordenações aparecem em toda listagem com filtros; buscas binárias aparecem em paginação por cursor, em versionamento (git bisect usa busca binária para encontrar o commit que introduziu um bug) e em índices de banco. Entender estabilidade evita bugs em tabelas com ordenação por várias colunas.`,
  summary: `Busca linear é O(n); busca binária é O(log n) e exige ordenação. Inserção é O(n²) mas boa para entradas pequenas ou quase ordenadas. Merge sort é O(n log n) sempre, estável e usa memória extra. Quicksort é O(n log n) em média e O(n²) no pior caso. Em JavaScript, sort é estável desde o ES2019 e precisa de função de comparação para números.`,
  refs: [REF.sort, REF.algs4, REF.mit, REF.clrs],
  cards: [
    { q: 'Qual pré-requisito da busca binária?', a: 'O array precisa estar ordenado.' },
    { q: 'Qual a complexidade do merge sort no pior caso?', a: 'O(n log n).' },
    { q: 'O que é ordenação estável?', a: 'Elementos com a mesma chave mantêm a ordem original.' },
    { q: 'Qual função de comparação ordena números do menor para o maior?', a: '(a, b) => a − b.' }
  ]
}
];
