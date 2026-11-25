// Curso 1 da Onda 1: Lógica de programação, algoritmos, estruturas de dados e complexidade Big O.
import { makeCourse } from './_lib.mjs';
import { REF, lessonsA } from './logica-a.mjs';
import { lessonsB } from './logica-b.mjs';
import { exsets, assessment, project } from './logica-ex.mjs';

const lessons = [...lessonsA, ...lessonsB];
const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'Entrada e saída', def: 'Dados que o algoritmo recebe e o resultado que ele produz.' },
  { term: 'Divisão e conquista', def: 'Dividir o problema, resolver as partes recursivamente e combinar os resultados.' },
  { term: 'Vértice e aresta', def: 'Elementos de um grafo: os pontos e as ligações entre eles.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'logica-algoritmos', disciplineId: 'logic', disciplineIds: ['ds', 'bigo'], areaId: 'cs', requires: [],
  title: 'Lógica de programação, algoritmos, estruturas de dados e Big O',
  description: 'Base de todo desenvolvedor: pensar em algoritmos, decompor problemas, usar as estruturas de dados certas e prever o custo de uma solução. Do primeiro if à busca em largura em grafos, com JavaScript como notação e exercícios corrigidos por testes automáticos.',
  objectives: ['Decompor problemas em passos precisos e traduzi-los para código', 'Rastrear a execução de laços e funções recursivas', 'Escolher entre array, pilha, fila, lista ligada, Map, Set, árvore e grafo conforme o problema', 'Aplicar técnicas clássicas: dois ponteiros, janela deslizante, contagem de frequência, BFS, DFS, busca binária e merge sort', 'Calcular a complexidade de tempo e espaço com a notação Big O e otimizar soluções'],
  level: 'I', prereqs: ['Nenhum conhecimento de programação é exigido', 'Saber usar um navegador e um editor de texto'], hours: 24,
  syllabus: 'Algoritmos, pseudocódigo, variáveis, tipos e operadores; decisões, repetições e rastreamento; funções, decomposição e recursão; arrays e strings (dois ponteiros, janela deslizante); pilhas, filas e listas ligadas; tabelas hash com Map e Set; árvores, árvores binárias de busca e grafos (BFS e DFS); complexidade Big O de tempo e espaço; busca binária, ordenação por inserção, merge sort e quicksort.',
  versions: 'Exemplos em JavaScript conforme ECMAScript 2023 (toSorted, toReversed). Map.groupBy, citado como alternativa, é do ES2024. Funciona em navegadores atuais e em Node.js 20 ou superior; o laboratório da plataforma executa os exemplos.',
  skills: ['Raciocínio algorítmico', 'Rastreamento de código', 'Recursão', 'Estruturas de dados lineares', 'Tabelas hash', 'Árvores e grafos', 'Busca e ordenação', 'Análise de complexidade (Big O)'],
  modules: [
    { id: 'm1', title: 'Lógica de programação', lessons: ['log-01', 'log-02', 'log-03'] },
    { id: 'm2', title: 'Estruturas de dados', lessons: ['log-04', 'log-05', 'log-06', 'log-07'] },
    { id: 'm3', title: 'Algoritmos e complexidade', lessons: ['log-08', 'log-09'] }
  ],
  materials: [REF.clrs, REF.algs4, REF.ods, REF.mit, REF.guide],
  projectIds: ['planejador-entregas'],
  supplement: {
    glossary,
    cheatsheet: `### Complexidade das operações mais usadas
| Estrutura | Acesso | Busca | Inserir | Remover |
|---|---|---|---|---|
| Array | O(1) por índice | O(n) | O(1) amort. no fim; O(n) no início/meio | O(1) no fim; O(n) no início/meio |
| Pilha (array) | topo O(1) | — | push O(1) | pop O(1) |
| Fila (índice de início) | início O(1) | — | O(1) | O(1) amort. |
| Lista ligada | O(n) | O(n) | O(1) em nó conhecido | O(1) em nó conhecido (duplamente ligada) |
| Map / Set | — | O(1) médio | O(1) médio | O(1) médio |
| BST equilibrada | — | O(log n) | O(log n) | O(log n) |
| Grafo (lista de adjacência) | — | BFS/DFS O(V + E) | aresta O(1) | — |

### Algoritmos
| Algoritmo | Tempo | Espaço extra | Observação |
|---|---|---|---|
| Busca linear | O(n) | O(1) | qualquer array |
| Busca binária | O(log n) | O(1) | exige ordenação |
| Inserção | O(n²); O(n) se quase ordenado | O(1) | estável |
| Merge sort | O(n log n) | O(n) | estável |
| Quicksort | O(n log n) médio; O(n²) pior | O(log n) médio | escolha bem o pivô |
| BFS | O(V + E) | O(V) | menor caminho em arestas |
| DFS | O(V + E) | O(V) | conectividade, ciclos, topológica |

### JavaScript essencial
- §(a, b) => a - b§ ordena números; §a.localeCompare(b, 'pt-BR')§ ordena textos.
- §reduce(f, 0)§: sempre com valor inicial.
- Não alteram: §map§, §filter§, §slice§, §toSorted§, §toReversed§. Alteram: §sort§, §reverse§, §splice§, §push§, §pop§, §shift§, §unshift§.
- Fila sem §shift§: array + índice de início.
- Pertencimento rápido: §new Set(lista).has(x)§.

### Roteiro para resolver um problema
1. Exemplos de entrada e saída, inclusive casos de borda.
2. Solução simples (força bruta) e sua complexidade.
3. Gargalo: laço aninhado? busca repetida? recálculo?
4. Técnica: ordenar, hash, dois ponteiros, janela, BFS/DFS, divisão e conquista.
5. Código, testes e nova análise de complexidade.`,
    mistakes: ['Laço com i <= length acessando posição inexistente.', 'Recursão sem caso base ou que não se aproxima dele.', 'sort sem função de comparação em números.', 'reduce sem valor inicial em array possivelmente vazio.', 'Fila implementada com shift em volumes grandes.', 'Objetos como chave de Map esperando comparação por conteúdo.', 'BFS sem conjunto de visitados em grafos com ciclos.', 'Busca binária que não avança esq ou dir.', 'Busca binária em array não ordenado.', 'includes, indexOf ou find dentro de laços sobre listas grandes (O(n²) escondido).', 'Somar dinheiro em ponto flutuante em vez de centavos inteiros.'],
    prereqMap: `**Este curso não tem pré-requisitos.** Ele é a base da trilha Full Stack.

| Este curso prepara para | Por quê |
|---|---|
| JavaScript: fundamentos, DOM e módulos | usa variáveis, laços, funções e arrays daqui como ponto de partida |
| JavaScript Assíncrono | supõe funções, callbacks e pilha de chamadas |
| TypeScript | tipa as estruturas de dados que você aprendeu aqui |
| SQL e Modelagem de dados | índices de banco são árvores e tabelas hash |
| System Design | filas, caches (hash) e grafos aparecem em arquitetura |

Dentro do curso, a ordem recomendada é a dos módulos: lógica (aulas 1 a 3) → estruturas (4 a 7) → complexidade e algoritmos (8 e 9). A aula 8 formaliza os custos citados nas aulas 4 a 7.`,
    officialRefs: [REF.guide, REF.loops, REF.functions, REF.array, REF.sort, REF.map, REF.set, REF.mit, REF.algs4, REF.ods],
    practice: ['Resolva cada exercício de código primeiro com força bruta, meça e depois otimize.', 'Rastreie no papel pelo menos um caso de borda antes de rodar os testes.', 'Reimplemente pilha, fila e BFS sem consultar a aula, uma semana depois de estudá-la.', 'Escolha um problema por dia em plataformas públicas de exercícios (categorias arrays, hash, árvores e grafos) e escreva a complexidade antes de codificar.', 'Explique em voz alta, como em entrevista, o raciocínio de uma solução sua em até 3 minutos.', 'No projeto Planejador de entregas, implemente a extensão com Dijkstra e compare com a BFS.']
  }
};

export const LOGICA = makeCourse({ course, lessons, exsets, assessment, project });
