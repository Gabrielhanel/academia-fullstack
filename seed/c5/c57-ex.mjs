// C5.7 — Estruturas internas das linguagens: exercícios, avaliação final e projeto.
// Medições reais do laboratório (Node 26.13.1/V8 14.6, Python 3.14.4, gcc); os desafios "code" são em JavaScript e modelam a lógica.
const R = String.raw;

export const exsets = {
'int-01': [
  { id: 'int-01-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual é a ordem correta das fases de um interpretador/compilador?', options: ['Sintática, léxica, execução', 'Léxica (tokens), sintática (AST), semântica, geração e execução', 'Execução, léxica, sintática', 'Semântica, léxica, execução'], answer: 1, explanation: 'Texto → tokens → AST → verificação de significado → geração → execução.' },
  { id: 'int-01-e2', type: 'tf', difficulty: 3, points: 10, prompt: 'Medido: no laboratório, a VM de bytecode simples foi mais rápida que o CPython no mesmo laço.', answer: false, explanation: 'VM do laboratório 1.011,7 ms contra CPython 698,0 ms: bytecode não é sinônimo de lento, depende da implementação.' },
  { id: 'int-01-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a estratégia de execução ao exemplo.', pairs: [['AOT', 'C compilado com gcc'], ['Interpretador de AST', 'Percorrer a árvore a cada execução'], ['Bytecode + VM', 'CPython'], ['JIT', 'V8 (Maglev e TurboFan)']], explanation: 'Híbridos são a regra.' },
  { id: 'int-01-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §compilarExpressao(no)§: recebe uma AST com nós §{ tipo: "Num", valor }§ e §{ tipo: "Bin", op, esq, dir }§ e devolve a lista de instruções de pilha em pós-ordem: §"PUSH n"§ para números e o operador (§"+"§, §"-"§, §"*"§ ou §"/"§) depois dos dois operandos. Ex.: §2 + 3 * 4§ → §["PUSH 2","PUSH 3","PUSH 4","*","+"]§.', lang: 'javascript', starter: 'function compilarExpressao(no) {\n  // seu código aqui\n}\n', hints: ['Pós-ordem: esquerda, direita, operador.', 'Use recursão.'], tests: [{ name: 'exemplo da aula', code: R`const num = (v) => ({ tipo: 'Num', valor: v });
const bin = (op, e, d) => ({ tipo: 'Bin', op, esq: e, dir: d });
assert.equal(JSON.stringify(compilarExpressao(bin('+', num(2), bin('*', num(3), num(4))))), '["PUSH 2","PUSH 3","PUSH 4","*","+"]');` }, { name: 'associatividade e número', code: R`const num = (v) => ({ tipo: 'Num', valor: v });
const bin = (op, e, d) => ({ tipo: 'Bin', op, esq: e, dir: d });
assert.equal(JSON.stringify(compilarExpressao(num(7))), '["PUSH 7"]');
assert.equal(JSON.stringify(compilarExpressao(bin('-', bin('+', num(1), bin('*', num(2), num(3))), num(4)))), '["PUSH 1","PUSH 2","PUSH 3","*","+","PUSH 4","-"]');` }], solution: R`function compilarExpressao(no) {
  if (no.tipo === 'Num') return ['PUSH ' + no.valor];
  return [...compilarExpressao(no.esq), ...compilarExpressao(no.dir), no.op];
}`, explanation: 'É o gerador de bytecode da mini linguagem, reduzido a expressões.' },
  { id: 'int-01-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Explique por que a pergunta "essa linguagem é compilada ou interpretada?" é mal formulada. Use os números do laboratório.', model: 'Porque o que existe são estratégias de execução de um programa, e uma mesma linguagem pode usar várias: JavaScript passa por parser, bytecode (Ignition) e JIT (Maglev e TurboFan); Python compila para bytecode e o interpreta; Java compila para bytecode e a JVM interpreta e faz JIT; C costuma ser AOT. No laboratório, o mesmo laço de 1 milhão de iterações levou 2.149 ms com um interpretador de árvore, 1.012 ms com uma VM de bytecode simples, 698 ms no CPython, 34,5 ms no V8 com JIT e 11,6 ms em C: a diferença está na implementação do motor, não na etiqueta da linguagem. Ressalvas: microbenchmark, volatile no C e uma máquina.', rubric: ['Estratégias de execução, não linguagens', 'Exemplos híbridos (JS, Python, Java)', 'Números do laboratório', 'Ressalvas do microbenchmark'], explanation: 'Resumo da aula.' },
  { id: 'int-01-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §executarBytecode(instrucoes)§ (VM de pilha): cada instrução é §"PUSH n"§ ou um operador §"+" "-" "*" "/"§ (desempilha b e depois a e empilha §a op b§). Devolva o valor final da pilha. Se faltar operando, lance §Error("pilha vazia")§; se sobrar mais de um valor ao final, lance §Error("pilha com sobra")§; instrução desconhecida: §Error("instrução desconhecida: X")§.', lang: 'javascript', starter: 'function executarBytecode(instrucoes) {\n  // seu código aqui\n}\n', hints: ['Use um array como pilha.', 'Separe o texto "PUSH n" com split(" ").'], tests: [{ name: 'cálculos', code: R`assert.equal(executarBytecode(['PUSH 2', 'PUSH 3', 'PUSH 4', '*', '+']), 14);
assert.equal(executarBytecode(['PUSH 1', 'PUSH 2', 'PUSH 3', '*', '+', 'PUSH 4', '-']), 3);
assert.equal(executarBytecode(['PUSH 10', 'PUSH 4', '/']), 2.5);` }, { name: 'erros', code: R`assert.throws(() => executarBytecode(['PUSH 1', '+']), 'pilha vazia');
assert.throws(() => executarBytecode(['PUSH 1', 'PUSH 2']), 'pilha com sobra');
assert.throws(() => executarBytecode(['PUSH 1', 'PUSH 2', '^']), 'instrução desconhecida: ^');
assert.throws(() => executarBytecode([]), 'pilha vazia');` }], solution: R`function executarBytecode(instrucoes) {
  const pilha = [];
  for (const ins of instrucoes) {
    if (ins.startsWith('PUSH ')) { pilha.push(Number(ins.slice(5))); continue; }
    if (!['+', '-', '*', '/'].includes(ins)) throw new Error('instrução desconhecida: ' + ins);
    if (pilha.length < 2) throw new Error('pilha vazia');
    const b = pilha.pop(); const a = pilha.pop();
    pilha.push(ins === '+' ? a + b : ins === '-' ? a - b : ins === '*' ? a * b : a / b);
  }
  if (!pilha.length) throw new Error('pilha vazia');
  if (pilha.length > 1) throw new Error('pilha com sobra');
  return pilha[0];
}`, explanation: 'O laço de despacho (fetch, decode, execute) é o coração de qualquer VM de bytecode.' }
],
'int-02': [
  { id: 'int-02-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'O que acontece quando uma função otimizada pelo JIT recebe um tipo que o código não previa?', options: ['O programa termina', 'Desotimização: volta ao bytecode e pode recompilar depois', 'Nada', 'O V8 troca de linguagem'], answer: 1, explanation: 'Laboratório: "deopt-eager, reason: not a Smi", seguido de nova compilação.' },
  { id: 'int-02-e2', type: 'tf', difficulty: 3, points: 10, prompt: 'Medido: objetos com 5 formas diferentes foram cerca de 4,2 vezes mais lentos de ler do que objetos com 1 forma (148,8 ms contra 35,5 ms).', answer: true, explanation: 'O inline cache deixa de ser monomórfico.' },
  { id: 'int-02-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o componente do V8 ao papel.', pairs: [['Ignition', 'Interpretador de bytecode e coletor de feedback'], ['Maglev', 'JIT intermediário, compila rápido'], ['TurboFan', 'JIT otimizante de topo'], ['Smi', 'Inteiro pequeno sem alocação']], explanation: 'Pipeline em camadas.' },
  { id: 'int-02-e4', type: 'code', difficulty: 2, points: 25, prompt: 'Implemente §estadoDoCache(objetos)§: considere a forma de cada objeto como §Object.keys(o).join(",")§ (a ordem importa). Devolva §{ formas, estado }§ com §formas§ = número de formas distintas e §estado§ = §"vazio"§ (0), §"monomórfico"§ (1), §"polimórfico"§ (2 a 4) ou §"megamórfico"§ (5 ou mais).', lang: 'javascript', starter: 'function estadoDoCache(objetos) {\n  // seu código aqui\n}\n', hints: ['Use um Set de formas.', 'Faça o mapeamento por faixas.'], tests: [{ name: 'estados', code: R`assert.equal(JSON.stringify(estadoDoCache([])), '{"formas":0,"estado":"vazio"}');
assert.equal(JSON.stringify(estadoDoCache([{ x: 1, y: 2 }, { x: 3, y: 4 }])), '{"formas":1,"estado":"monomórfico"}');
assert.equal(JSON.stringify(estadoDoCache([{ x: 1, y: 2 }, { y: 2, x: 1 }, { x: 1 }])), '{"formas":3,"estado":"polimórfico"}');` }, { name: 'megamórfico', code: R`const objs = [{ a: 1 }, { b: 1 }, { c: 1 }, { d: 1 }, { e: 1 }, { a: 2 }];
assert.equal(JSON.stringify(estadoDoCache(objs)), '{"formas":5,"estado":"megamórfico"}');
assert.equal(estadoDoCache([{ x: 1, y: 1 }, { x: 1, y: 1 }, { x: 5, y: 9 }]).estado, 'monomórfico');` }], solution: R`function estadoDoCache(objetos) {
  const formas = new Set(objetos.map((o) => Object.keys(o).join(','))).size;
  const estado = formas === 0 ? 'vazio' : formas === 1 ? 'monomórfico' : formas <= 4 ? 'polimórfico' : 'megamórfico';
  return { formas, estado };
}`, explanation: 'Modelo dos estados do inline cache; no V8 real, os limites são ajustes internos do motor.' },
  { id: 'int-02-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Explique o tiering do V8 e dê três práticas de código que ajudam o JIT, usando os resultados medidos (deopt, formas e jitless).', model: 'O V8 interpreta bytecode no Ignition, coleta feedback de tipos e promove funções quentes e estáveis ao Maglev e ao TurboFan, que compilam assumindo esses tipos; se a suposição falha ocorre desotimização e a função volta ao bytecode (no laboratório, somar foi compilada em 0,4 ms e desotimizada com "not a Smi" ao receber strings). Práticas: manter tipos estáveis em funções quentes, inicializar propriedades sempre na mesma ordem (5 formas foram 4,2x mais lentas que 1) e usar arrays homogêneos, além de aquecer e repetir ao medir. O JIT importa: sem ele (--jitless) o laço foi 7x mais lento (245,7 x 35,1 ms), mas laços aritméticos não representam aplicações reais.', rubric: ['Pipeline e tiering', 'Deopt medido', 'Formas e tipos estáveis', 'Efeito do JIT e ressalva'], explanation: 'Resumo da aula.' },
  { id: 'int-02-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §simularTiering(tipos, limiar)§: §tipos§ é a lista dos tipos dos argumentos de cada chamada (ex.: §"number"§, §"string"§). Estado inicial: não otimizada, contador 0, nenhum tipo visto. Para cada chamada §i§: (1) se está otimizada e o tipo ainda não foi visto → registre §"deopt@i"§, passe a não otimizada e zere o contador; (2) registre o tipo como visto; (3) se NÃO está otimizada, incremente o contador e, se ele alcançar §limiar§, registre §"otimiza@i"§ e passe a otimizada. Devolva a lista de eventos.', lang: 'javascript', starter: 'function simularTiering(tipos, limiar) {\n  // seu código aqui\n}\n', hints: ['Mantenha um Set de tipos vistos e um booleano otimizada.', 'A chamada que causa o deopt já conta como a primeira do novo contador (o passo 3 vem depois).'], tests: [{ name: 'otimiza, deopt e reotimiza', code: R`const tipos = ['number', 'number', 'number', 'number', 'number', 'string', 'string', 'string', 'string', 'string', 'string'];
assert.equal(JSON.stringify(simularTiering(tipos, 3)), '["otimiza@2","deopt@5","otimiza@7"]');` }, { name: 'estável e curto', code: R`assert.equal(JSON.stringify(simularTiering(['number', 'number'], 3)), '[]');
assert.equal(JSON.stringify(simularTiering(Array(10).fill('number'), 4)), '["otimiza@3"]');
assert.equal(JSON.stringify(simularTiering([], 2)), '[]');` }], solution: R`function simularTiering(tipos, limiar) {
  const eventos = []; const vistos = new Set(); let otimizada = false; let contador = 0;
  tipos.forEach((t, i) => {
    if (otimizada && !vistos.has(t)) { eventos.push('deopt@' + i); otimizada = false; contador = 0; }
    vistos.add(t);
    if (!otimizada) { contador++; if (contador >= limiar) { eventos.push('otimiza@' + i); otimizada = true; } }
  });
  return eventos;
}`, explanation: 'Mostra por que mudar tipos em código quente custa recompilações.' }
],
'int-03': [
  { id: 'int-03-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Por que a contagem de referências simples não libera um ciclo A → B → A?', options: ['Porque o ciclo é grande', 'Porque os contadores de A e B nunca chegam a zero', 'Porque o GC está desligado', 'Porque o ciclo é imutável'], answer: 1, explanation: 'Cada um mantém o outro vivo; é preciso rastreamento ou referências fracas.' },
  { id: 'int-03-e2', type: 'tf', difficulty: 3, points: 10, prompt: 'Medido: um cache sem limite fez o Node falhar com "JavaScript heap out of memory" com --max-old-space-size=64, enquanto o cache limitado a 5.000 entradas terminou sem falha.', answer: true, explanation: 'As entradas continuaram alcançáveis; o GC não pode coletar o que ainda é referenciado.' },
  { id: 'int-03-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o número medido ao cenário.', pairs: [['46 coletas menores e 91,6 ms de pausa', '3 milhões de objetos que viram lixo logo'], ['776,1 ms de pausa e 175 MB', '1/3 dos objetos retidos'], ['50,4 MiB retidos', 'CPython com 300.000 ciclos e o coletor desligado'], ['0,1 MiB retidos', 'CPython com 300.000 ciclos e o coletor ligado']], explanation: 'Resultados do laboratório de GC.' },
  { id: 'int-03-e4', type: 'code', difficulty: 2, points: 25, prompt: 'Implemente §coletar(grafo, raizes)§ (marcação por rastreamento): §grafo§ é um objeto nó → lista de nós referenciados; §raizes§ é a lista de nós raiz. Devolva §{ vivos, lixo }§ com os nós alcançáveis a partir das raízes e os demais nós do grafo, ambos em ordem alfabética (ciclos inalcançáveis são lixo).', lang: 'javascript', starter: 'function coletar(grafo, raizes) {\n  // seu código aqui\n}\n', hints: ['Percorra a partir das raízes com uma pilha e um Set de marcados.', 'Lixo = nós do grafo não marcados.'], tests: [{ name: 'ciclo inalcançável', code: R`const g = { raiz: ['a'], a: ['b'], b: [], c: ['d'], d: ['c'], e: ['f'], f: [] };
assert.equal(JSON.stringify(coletar(g, ['raiz'])), '{"vivos":["a","b","raiz"],"lixo":["c","d","e","f"]}');` }, { name: 'ciclo alcançável e vazio', code: R`assert.equal(JSON.stringify(coletar({ r: ['a'], a: ['r'] }, ['r'])), '{"vivos":["a","r"],"lixo":[]}');
assert.equal(JSON.stringify(coletar({ a: [], b: [] }, [])), '{"vivos":[],"lixo":["a","b"]}');
assert.equal(JSON.stringify(coletar({}, [])), '{"vivos":[],"lixo":[]}');` }], solution: R`function coletar(grafo, raizes) {
  const marcados = new Set(); const pilha = [...raizes];
  while (pilha.length) {
    const n = pilha.pop();
    if (marcados.has(n)) continue;
    marcados.add(n);
    for (const f of grafo[n] || []) pilha.push(f);
  }
  const todos = Object.keys(grafo);
  return { vivos: todos.filter((n) => marcados.has(n)).sort(), lixo: todos.filter((n) => !marcados.has(n)).sort() };
}`, explanation: 'É a fase de marcação de um mark-sweep.' },
  { id: 'int-03-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Um serviço Node reinicia por falta de memória a cada poucas horas. Como investigaria e corrigiria? Use o laboratório.', model: 'Confirmar o padrão de crescimento (process.memoryUsage, --trace-gc, métricas de heap e pausas: heap em dente de serra crescente, pausas maiores e latência pior), comparar dois snapshots de heap para ver o que cresceu e procurar as causas comuns: cache ou Map sem limite, ouvintes e timers não removidos, closures que retêm contexto grande e globais que só crescem. No laboratório, um cache sem limite chegou a 77 MB com 200.000 entradas e morreu com "JavaScript heap out of memory" (Mark-Compact liberando quase nada), e a versão com limite de 5.000 entradas terminou. Corrigir a retenção (limite, TTL, LRU, off, clear), alinhar --max-old-space-size ao limite do contêiner, criar teste de estabilidade do heap e alertas antes do OOM; aumentar o limite apenas adia o problema.', rubric: ['Observação e snapshots', 'Causas comuns de vazamento', 'Correção da retenção e limites', 'Teste e alerta; limite de memória não resolve'], explanation: 'Resumo da aula.' },
  { id: 'int-03-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §contagemDeReferencias(grafo, raizes)§: simule a contagem de referências. A contagem de cada nó é o número de arestas que apontam para ele (vindas de qualquer nó do grafo) mais 1 se for raiz. Repetidamente, libere os nós com contagem 0 (decrementando a contagem de cada filho, uma aresta por filho listado) até não haver mais nenhum. Devolva §{ liberados, vazados }§ em ordem alfabética: §liberados§ = nós liberados; §vazados§ = nós que NÃO são alcançáveis a partir das raízes e mesmo assim não foram liberados (ciclos).', lang: 'javascript', starter: 'function contagemDeReferencias(grafo, raizes) {\n  // seu código aqui\n}\n', hints: ['Calcule primeiro as contagens.', 'Use uma fila com os nós de contagem zero.'], tests: [{ name: 'ciclo vaza, cadeia é liberada', code: R`const g = { raiz: ['a'], a: ['b'], b: [], c: ['d'], d: ['c'], e: ['f'], f: [] };
assert.equal(JSON.stringify(contagemDeReferencias(g, ['raiz'])), '{"liberados":["e","f"],"vazados":["c","d"]}');` }, { name: 'sem lixo e com raiz isolada', code: R`assert.equal(JSON.stringify(contagemDeReferencias({ r: ['a'], a: [] }, ['r'])), '{"liberados":[],"vazados":[]}');
assert.equal(JSON.stringify(contagemDeReferencias({ x: [], y: ['x'] }, [])), '{"liberados":["x","y"],"vazados":[]}');
assert.equal(JSON.stringify(contagemDeReferencias({ a: ['a'] }, [])), '{"liberados":[],"vazados":["a"]}');` }], solution: R`function contagemDeReferencias(grafo, raizes) {
  const cont = {};
  for (const n of Object.keys(grafo)) cont[n] = 0;
  for (const r of raizes) cont[r] += 1;
  for (const filhos of Object.values(grafo)) for (const f of filhos) cont[f] += 1;
  const fila = Object.keys(grafo).filter((n) => cont[n] === 0); const liberados = new Set();
  while (fila.length) {
    const n = fila.pop();
    if (liberados.has(n)) continue;
    liberados.add(n);
    for (const f of grafo[n]) { cont[f] -= 1; if (cont[f] === 0) fila.push(f); }
  }
  const alcancaveis = new Set(); const pilha = [...raizes];
  while (pilha.length) { const n = pilha.pop(); if (alcancaveis.has(n)) continue; alcancaveis.add(n); pilha.push(...grafo[n]); }
  const todos = Object.keys(grafo);
  return { liberados: [...liberados].sort(), vazados: todos.filter((n) => !alcancaveis.has(n) && !liberados.has(n)).sort() };
}`, explanation: 'Mostra por que a contagem de referências precisa de um coletor de ciclos ou referências fracas.' },
  { id: 'int-03-e7', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §criarCacheLru(capacidade)§ (a correção do vazamento do laboratório): devolve §{ obter(chave), definir(chave, valor), tamanho() }§. §definir§ insere ou atualiza e marca a chave como a mais recente; ao passar de §capacidade§ remove a menos recentemente usada. §obter§ devolve o valor (ou §undefined§) e, se existir, marca a chave como a mais recente.', lang: 'javascript', starter: 'function criarCacheLru(capacidade) {\n  // seu código aqui\n}\n', hints: ['Um Map mantém a ordem de inserção.', 'Para marcar como recente, apague e insira de novo.'], tests: [{ name: 'limite e ordem de uso', code: R`const c = criarCacheLru(2);
c.definir('a', 1); c.definir('b', 2);
assert.equal(c.obter('a'), 1);
c.definir('c', 3);
assert.equal(c.obter('b'), undefined);
assert.equal(c.obter('a'), 1); assert.equal(c.obter('c'), 3);
assert.equal(c.tamanho(), 2);` }, { name: 'atualização e vazamento evitado', code: R`const c = criarCacheLru(3);
c.definir('x', 1); c.definir('x', 2);
assert.equal(c.tamanho(), 1); assert.equal(c.obter('x'), 2);
for (let i = 0; i < 1000; i++) c.definir('k' + i, i);
assert.equal(c.tamanho(), 3);
assert.equal(c.obter('k999'), 999); assert.equal(c.obter('k0'), undefined);` }], solution: R`function criarCacheLru(capacidade) {
  const m = new Map();
  return {
    obter(chave) { if (!m.has(chave)) return undefined; const v = m.get(chave); m.delete(chave); m.set(chave, v); return v; },
    definir(chave, valor) { m.delete(chave); m.set(chave, valor); if (m.size > capacidade) m.delete(m.keys().next().value); },
    tamanho: () => m.size
  };
}`, explanation: 'Um cache com limite mantém o heap estável: o contrário do cache sem limite que causou o OOM.' }
]
};

const P = 'estruturas-internas-p';
export const assessment = {
  id: 'estruturas-internas', title: 'Avaliação final — Estruturas internas das linguagens', passPct: 70, minutes: 45,
  items: [
    { id: P + '1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual fase transforma o texto-fonte em tokens?', options: ['Sintática', 'Léxica', 'Semântica', 'Geração de código'], answer: 1, explanation: 'O lexer (scanner) emite os tokens.' },
    { id: P + '2', type: 'tf', difficulty: 2, points: 10, prompt: 'Uma mesma linguagem pode usar várias estratégias de execução (bytecode, interpretação e JIT).', answer: true, explanation: 'JavaScript no V8 e Java na JVM são exemplos.' },
    { id: P + '3', type: 'trace', difficulty: 3, points: 10, prompt: 'Resultados medidos do mesmo laço de 1 milhão de iterações.', code: 'interpretador de árvore: 2149,2 ms\nVM de bytecode: 1011,7 ms\nJavaScript (V8 com JIT): 34,5 ms\nPython 3.14: 698,0 ms', lang: 'text', steps: [{ q: 'Qual estratégia foi mais lenta?', answers: ['interpretador de árvore', 'árvore', 'interpretador de AST', 'ast'] }, { q: 'Quantas vezes (aprox., inteiro) o JIT foi mais rápido que a VM de bytecode simples?', answers: ['29', '30', '29,3', '29.3'] }], explanation: '1011,7 / 34,5 ≈ 29,3.' },
    { id: P + '4', type: 'mc', difficulty: 3, points: 10, prompt: 'No V8, o que significa o motivo "not a Smi" em um deopt?', options: ['Faltou memória', 'O código assumia inteiros pequenos e recebeu outro tipo', 'O arquivo é muito grande', 'A função é recursiva'], answer: 1, explanation: 'A suposição de tipo falhou: o código otimizado foi descartado.' },
    { id: P + '5', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que provoca crescimento ilimitado da memória.', code: "const cache = new Map();\nfunction obter(chave) {\n  if (!cache.has(chave)) cache.set(chave, calcular(chave));\n  return cache.get(chave);\n}", answer: 3, explanation: 'Sem limite, TTL ou LRU, chaves sempre novas acumulam para sempre.' },
    { id: P + '6', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete.', code: 'A hipótese [[0]] diz que a maioria dos objetos morre [[1]], por isso a geração jovem é coletada com frequência.', answers: [['geracional'], ['jovem', 'cedo']], explanation: 'Base dos coletores geracionais.' },
    { id: P + '7', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o termo à definição.', pairs: [['Scavenge', 'Coleta copiadora da geração jovem do V8'], ['Mark-Compact', 'Coleta da geração velha que marca e compacta'], ['Coletor de ciclos', 'Complemento da contagem de referências no CPython'], ['Referência fraca', 'Não impede a coleta do objeto']], explanation: 'Vocabulário de GC.' },
    { id: P + '8', type: 'mc', difficulty: 3, points: 10, prompt: 'Medido: qual foi a razão entre ler objetos de 5 formas e de 1 forma no V8?', options: ['1,0x', '≈ 4,2x', '≈ 20x', '≈ 100x'], answer: 1, explanation: '148,8 ms contra 35,5 ms.' },
    { id: P + '9', type: 'tf', difficulty: 3, points: 10, prompt: 'Aumentar --max-old-space-size resolve um vazamento de memória.', answer: false, explanation: 'Apenas adia o problema e aumenta as pausas; é preciso corrigir a retenção.' },
    { id: P + '10', type: 'mc', difficulty: 3, points: 10, prompt: 'Por que C compilado com -O0 e -O2 deram o mesmo tempo no laboratório?', options: ['Porque o gcc não otimiza', 'Porque a variável volatile impede as otimizações do laço', 'Porque o C usa JIT', 'Porque o laço era pequeno demais'], answer: 1, explanation: 'Um artefato do microbenchmark.' },
    { id: P + '11', type: 'open', difficulty: 3, points: 10, prompt: 'Projete a mini linguagem do projeto: fases, estruturas de dados, estratégias de execução, testes, medições e riscos (segurança e desempenho).', model: 'Lexer com posição de erro, parser por descida recursiva com precedência e associatividade e AST com tipos de nó; análise semântica (variáveis definidas, tipos básicos); duas estratégias de execução: interpretador de AST e compilador para bytecode com VM de pilha (variáveis resolvidas em compilação, saltos com backpatching), com testes de equivalência de resultados, de erros por fase e de bytecode gerado. Medições com aquecimento e mediana comparando os motores, JavaScript nativo e C, e a ressalva sobre microbenchmarks. Riscos: nunca usar eval com entrada do usuário, limites de profundidade de recursão, de memória e de tempo de execução (laços infinitos), mensagens de erro com posição e testes de entradas maliciosas; opcional: otimização por dobramento de constantes.', rubric: ['Fases e estruturas', 'Duas estratégias de execução e testes de equivalência', 'Medição responsável', 'Segurança e limites de recursos'], explanation: 'Resumo do projeto integrador.' },
    { id: P + '12', type: 'mc', difficulty: 3, points: 10, prompt: 'Medido no CPython 3.14.4: o que retinham 300.000 ciclos com o coletor de ciclos desligado?', options: ['0,1 MiB', '≈ 50,4 MiB', '≈ 1 GiB', 'Nada'], answer: 1, explanation: 'Com o coletor ligado, 0,1 MiB (pico 1,4 MiB).' }
  ]
};

export const project = {
  id: 'mini-linguagem', name: 'Mini linguagem: lexer, parser, interpretador de AST, VM de bytecode e medições de execução e memória', lv: 'A', stack: 'JavaScript (Node.js), node:test, V8 flags, gcc (opcional)', ds: ['internals'],
  desc: 'Construa e **meça uma mini linguagem** com **variáveis, laços, condicionais e funções simples**: **lexer**, **parser por descida recursiva** com **AST**, **análise semântica**, **interpretador de árvore** e **compilador para bytecode com máquina virtual**, com **testes de equivalência**, **erros com posição**, **medições comparativas** (árvore, VM, JavaScript, C) e um **relatório de memória e GC** do seu interpretador (alocação por nó, pausas e vazamentos).',
  rf: ['Lexer com posição de erro e parser por descida recursiva com precedência e associatividade corretas', 'AST documentada com todos os tipos de nó e testes da forma da árvore', 'Análise semântica (variável não definida, uso antes da definição) antes da execução', 'Interpretador de AST e compilador de bytecode com VM, com resultados idênticos em pelo menos 10 programas', 'Pelo menos um recurso novo (funções com parâmetros, strings, listas ou escopos) nos dois motores', 'Medições com aquecimento e mediana de pelo menos 3 programas, comparando os motores com JavaScript e C', 'Limites de recursos: profundidade de recursão, número de instruções e memória, com erros claros', 'Relatório de GC do interpretador: pausas e heap em um programa que aloca muito (PerformanceObserver) e uma correção de retenção, se houver'],
  rnf: ['Nenhum uso de eval ou new Function em entrada do usuário', 'Mensagens de erro com posição e contexto', 'Testes automatizados independentes da ordem', 'README com decisões, medições e limitações (o que não foi executado)'],
  ac: ['As duas estratégias dão o mesmo resultado nos testes de equivalência', 'Erros léxicos, sintáticos e semânticos têm mensagens distintas e testes', 'Um programa com laço infinito é interrompido pelo limite de instruções', 'As medições registram versão, máquina e a ressalva sobre microbenchmarks', 'O relatório de memória identifica o que o interpretador retém'],
  ch: ['Implementar dobramento de constantes e eliminação de código morto e medir', 'Gerar código para WebAssembly ou JavaScript a partir do bytecode', 'Adicionar um GC próprio (mark-sweep) para os valores da linguagem', 'Comparar o interpretador com o mesmo laço no PyPy ou na JVM']
};
