// C5.7 — Estruturas internas das linguagens. Aulas 1 e 2 (compiladores e interpretadores; execução: bytecode, JIT e desotimização).
const R = String.raw;

export const REF = {
  crafting: { title: 'Crafting Interpreters (Robert Nystrom)', url: 'https://craftinginterpreters.com/', kind: 'livro' },
  cs6120: { title: 'Cornell CS 6120 — Advanced Compilers', url: 'https://www.cs.cornell.edu/courses/cs6120/2019fa/', kind: 'curso' },
  pyDis: { title: 'Python — dis (disassembler de bytecode)', url: 'https://docs.python.org/3/library/dis.html', kind: 'doc' },
  pyAst: { title: 'Python — ast (árvore sintática abstrata)', url: 'https://docs.python.org/3/library/ast.html', kind: 'doc' },
  v8Ignition: { title: 'V8 — Firing up the Ignition interpreter', url: 'https://v8.dev/blog/ignition-interpreter', kind: 'artigo' },
  v8Maglev: { title: 'V8 — Maglev: V8’s fastest optimizing JIT', url: 'https://v8.dev/blog/maglev', kind: 'artigo' },
  v8Docs: { title: 'V8 — Documentation', url: 'https://v8.dev/docs', kind: 'doc' },
  shapes: { title: 'Mathias Bynens — JavaScript engine fundamentals: Shapes and Inline Caches', url: 'https://mathiasbynens.be/notes/shapes-ics', kind: 'artigo' },
  gccOpt: { title: 'GCC — Optimize Options', url: 'https://gcc.gnu.org/onlinedocs/gcc/Optimize-Options.html', kind: 'doc' }
};

export const lessonsA = [
{
  id: 'int-01', moduleId: 'm1', order: 1, minutes: 85, tags: ['compiladores', 'interpretadores', 'lexer', 'parser', 'AST', 'bytecode', 'máquina virtual'],
  title: 'Compiladores e interpretadores: do texto ao resultado, com uma mini linguagem construída e medida',
  objectives: ['Descrever as fases de um compilador/interpretador: léxica, sintática, semântica, geração e execução', 'Construir um lexer, um parser por descida recursiva e uma AST para uma linguagem pequena', 'Executar a AST de duas formas (percorrendo a árvore e compilando para bytecode de pilha com uma VM)', 'Comparar estratégias de execução com medições (árvore, bytecode, JIT, AOT em C, CPython)', 'Distinguir compilação AOT, interpretação e JIT sem cair em dicotomias simplistas', 'Reconhecer erros por fase (léxico, sintático, semântico) e como as ferramentas os relatam'],
  intro: R`**Linguagens não "são" compiladas ou interpretadas**: o que existe são **estratégias de execução** de um programa. Nesta aula você **constrói uma mini linguagem** (variáveis, §while§, §if§, aritmética) com **lexer**, **parser**, **AST**, **interpretador de árvore** e **compilador para bytecode com máquina virtual**, testa as duas estratégias (**5 testes** passam, com **resultados idênticos**) e **mede** o mesmo laço de **1.000.000 de iterações**: **árvore 2.149 ms**, **VM de bytecode 1.012 ms**, **JavaScript com JIT 34,5 ms**, **C (gcc) 11,6 ms** e **Python 698 ms**: diferenças de **ordens de grandeza** que explicam por que o **motor de execução** importa.`,
  theory: R`### As fases
1. **Análise léxica (lexer/scanner):** **texto → tokens** (§let§, §x§, §=§, §3.5§, §;§). Descarta espaços e comentários. **Erros:** caractere inválido (§caractere inesperado "@" na posição 10§);
2. **Análise sintática (parser):** **tokens → árvore sintática abstrata (AST)** conforme uma **gramática**. **Erros:** "§esperava ")" na posição 12 mas veio ";"§". A **AST** reflete **a estrutura**, não a pontuação;
3. **Análise semântica:** **significado**: variáveis **definidas**, **tipos** compatíveis, **escopos**; **erros:** "§variável não definida: x§";
4. **Representação intermediária (IR) e otimizações:** **dobrar constantes** (§2 + 3 * 4§ → §14§), **eliminar código morto**, **inlining**, **alocação de registradores** (nos compiladores sérios: LLVM IR, SSA);
5. **Geração de código:** **código de máquina** (compilador **AOT**), **bytecode** (para uma **VM**) ou **outra linguagem** (transpilador: TypeScript → JavaScript);
6. **Execução:** CPU, **máquina virtual** ou **interpretador**.
**Front-end** (fases 1 a 3, depende da **linguagem**) x **back-end** (4 a 6, depende da **plataforma**): por isso LLVM **reaproveita** o back-end para Rust, Swift, Clang.

### A mini linguagem do laboratório
Gramática (precedência **menor → maior**): **comparação** (§< > <= >= == !=§) → **aditivo** (§+ -§) → **multiplicativo** (§* / %§) → **primário** (número, variável, §(expr)§, §-primário§). **Comandos:** §let x = e;§, §x = e;§, §print e;§, §while (c) { ... }§, §if (c) { ... } else { ... }§.
- **Lexer** (§lexer.mjs§): percorre o texto e emite objetos §{ tipo, valor, pos }§; **palavras reservadas** viram **tipos próprios**; **medido:** §tokenizar('let x = 3.5;')§ → §[let, id, op, num, op, fim]§;
- **Parser por descida recursiva** (§parser.mjs§): **uma função por nível de precedência**, com um **laço** que **constrói** nós §Bin§ **associativos à esquerda**. **Medido:** §1 + 2 * 3 - 4§ vira §((1 + (2*3)) - 4)§ na AST (**precedência** e **associatividade** corretas); §print (1 + 2;§ → **SyntaxError** "esperava ")"";
- **Interpretador de árvore** (§interpretador.mjs§): **percorre a AST** recursivamente: §avaliar(n)§ por tipo de nó (§switch§), com **ambiente** (mapa de variáveis). **Simples** e **fácil de depurar**, **lento** (cada nó é **uma chamada** e **uma busca no mapa**);
- **Compilador de bytecode + VM** (§vm.mjs§): a AST vira **instruções de pilha** (§PUSH§, §LOAD§, §STORE§, §JZ§, §JMP§, §PRINT§, operadores). **Medido:** §let a = 2 + 3 * 4;§ → §[PUSH 2, PUSH 3, PUSH 4, *, +, STORE 0, HALT]§. **Variáveis viram índices** (resolvidas **uma vez**, em **compilação**, **não** a cada acesso); **laços** viram **saltos** (§JZ§/§JMP§ com **endereços**, *backpatching*).
**Os dois motores** dão os mesmos resultados nos testes (§220§ para a soma dos quadrados dos pares até 10, §[3, 2, 1, 9]§ para operadores, **else** correto) e **ambos** lançam §variável não definida§ (o de árvore **em execução**; o compilador **em compilação**: **semântica** detectada **antes**).

### Medido: seis estratégias para o mesmo laço
Programa: §let s = 0; let i = 1; while (i <= 1000000) { s = s + i * i % 7; i = i + 1; } print s;§ (resultado **1999999** em **todos**).
| Estratégia | Tempo | Em relação ao JS |
|---|---|---|
| **Interpretador de árvore** (JavaScript) | **2.149,2 ms** | 62,3x |
| **VM de bytecode** (JavaScript, opcodes em texto) | **1.011,7 ms** | 29,3x |
| **JavaScript nativo** (V8 com JIT) | **34,5 ms** | 1,0x |
| **C com gcc -O0** (variável §volatile§) | **11,6 ms** | 0,3x |
| **C com gcc -O2** (variável §volatile§) | **11,8 ms** | 0,3x |
| **Python 3.14** (CPython, interpretador de bytecode) | **698,0 ms** | 20,2x |
**Leituras e ressalvas:**
- **Cada camada de execução cobra um preço:** o **bytecode** foi **~2x** mais rápido que **percorrer a árvore**; o **JIT** do V8 foi **~30x** mais rápido que a **minha** VM e o **código nativo**, mais ainda;
- **A minha VM é lenta de propósito** (instruções são arrays e o §switch§ compara **texto**): **o CPython é um interpretador de bytecode muito bem engenheirado** (instruções **inteiras**, **pilha otimizada**, **especialização adaptativa**) e **venceu** a minha VM (698 x 1.012 ms): **bytecode não é sinônimo de lento: depende da implementação**;
- **C -O0 = C -O2 (11,6 x 11,8 ms):** com a variável **§volatile§** o compilador **precisa** ler e gravar a memória a cada iteração, **o que impede** as otimizações; é um **artefato do benchmark** (sem §volatile§ o gcc -O2 **eliminaria ou vetorizaria** o laço): **cuidado com microbenchmarks**: o **compilador** pode **apagar** o que você quer medir;
- **Uma máquina, uma execução** (mediana de 5 nas estratégias em processo): **a proporção** é **o que interessa**.

### Compilar x interpretar x JIT (sem dicotomia)
| Estratégia | Como | Exemplos | Prós | Contras |
|---|---|---|---|---|
| **AOT (ahead-of-time)** | traduz **tudo** a código de máquina **antes** | C, C++, Rust, Go | **desempenho previsível**, **sem** runtime pesado | **compilação** lenta, **binário por plataforma** |
| **Interpretador de AST** | **percorre** a árvore | scripts simples, DSLs | **simples**, **portável** | **mais lento** |
| **Bytecode + VM** | **compila** para bytecode **portável** e **interpreta** | CPython, JVM (início), Lua | **portabilidade**, **partida rápida** | **mais lento** que nativo |
| **JIT** | **observa** a execução e **compila trechos quentes** para código nativo | V8, JVM HotSpot, PyPy | **perto do nativo** após aquecer; **otimiza por perfil** | **aquecimento**, **memória**, **complexidade**, **superfície de ataque** |
**Híbridos são a regra:** **Java** compila a **bytecode** (javac) e a **JVM** interpreta e **faz JIT**; **TypeScript** **transpila** para JavaScript; **Python** compila **a bytecode** (§.pyc§) e **interpreta**; **JavaScript** no V8: **parser → bytecode (Ignition) → JIT (Maglev/TurboFan)** (aula int-02).

### Ver o que as linguagens reais fazem
- **Python:** §dis.dis(f)§ para §def f(x): return x * 2 + 1§ mostra **bytecode** (§RESUME§, §LOAD_FAST_BORROW x§, §LOAD_SMALL_INT 2§, §BINARY_OP *§, §LOAD_SMALL_INT 1§, §BINARY_OP +§, §RETURN_VALUE§) e §ast.dump(ast.parse('x * 2 + 1'))§ mostra a **AST** (§BinOp(left=BinOp(left=Name('x'), op=Mult(), right=Constant(2)), op=Add(), right=Constant(1))§): **a mesma ideia** da mini linguagem, em **produção**;
- **V8:** §node --print-bytecode§ (aula int-02);
- **C:** §gcc -S§ gera **assembly**; §-O0§ a §-O3§ (**Optimize Options** do GCC) **controlam** as otimizações.

### Erros por fase
| Fase | Exemplo | Mensagem |
|---|---|---|
| **Léxica** | §let x = 3 @ 4;§ | §caractere inesperado "@" na posição ...§ |
| **Sintática** | §print (1 + 2;§ | §esperava ")" ...§ |
| **Semântica** | §print x;§ | §variável não definida: x§ |
| **Execução** | divisão por zero, estouro de pilha | erro de **tempo de execução** |
**Boas mensagens** (**posição**, **contexto**, **sugestão**) **são engenharia** em compiladores modernos (Rust, Elm).

### Para que serve saber isso
- **Entender** por que **o mesmo algoritmo** tem **custos tão diferentes** em linguagens/motores diferentes;
- **Ler** erros e **ferramentas** (linters, transpiladores, *bundlers*, **ESLint** e **TypeScript** são **front-ends** de compilador: lexer + parser + AST, aula tav-04);
- **Construir** **DSLs** (configuração, regras, consultas, expressões de filtros) com segurança (**nunca** use §eval§ em **entrada do usuário**);
- **Depurar** desempenho e **escolher** a **ferramenta** certa.

### Limites desta aula
**Executados:** a mini linguagem (JS), §dis§/§ast§ do Python e o C com gcc. **Não executados:** **LLVM/Clang** (IR, passes), **GraalVM**, **PyPy**, **JVM**, **WebAssembly**, **geradores de parser** (ANTLR, PEG) e **análise semântica com tipos** (só o teste de variável não definida).`,
  concepts: [
    { term: 'Lexer', def: 'Fase que transforma o texto-fonte em uma sequência de tokens.' },
    { term: 'Parser', def: 'Fase que organiza os tokens em uma árvore sintática de acordo com a gramática.' },
    { term: 'AST', def: 'Árvore sintática abstrata: representação hierárquica da estrutura do programa, sem a pontuação.' },
    { term: 'Bytecode', def: 'Conjunto de instruções de baixo nível, independente de hardware, executado por uma máquina virtual.' },
    { term: 'Máquina virtual (VM)', def: 'Programa que executa bytecode, geralmente com uma pilha ou registradores.' },
    { term: 'AOT', def: 'Ahead-of-time: compilação completa para código de máquina antes da execução.' },
    { term: 'JIT', def: 'Just-in-time: compilação para código nativo durante a execução, guiada pelo comportamento observado.' }
  ],
  examples: R`**Analogia:** executar um programa é **cozinhar a partir de uma receita**: o **interpretador de árvore** lê a receita em voz alta **a cada passo**; a **VM de bytecode** usa uma **ficha resumida** com abreviações; o **compilador AOT** **escreve o prato pronto** antes do jantar; o **JIT** é o cozinheiro que **observa quais pratos saem mais** e **prepara esses antes**.

**Exemplo 1: AST.** 1 + 2 * 3 - 4 vira ((1 + (2 * 3)) - 4): precedência e associatividade já estão na árvore.

**Exemplo 2: bytecode.** let a = 2 + 3 * 4 vira PUSH 2, PUSH 3, PUSH 4, *, +, STORE 0.

**Exemplo 3: medição.** O mesmo laço de 1 milhão de iterações: 2.149 ms (árvore), 1.012 ms (VM), 34,5 ms (JIT) e 11,6 ms (C).`,
  code: [
    { title: 'Lexer e parser por descida recursiva (JavaScript; 5 testes passam)', lang: 'js', code: R`export function tokenizar(src) {
  const tokens = []; let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    if (/[0-9]/.test(c)) { let j = i; while (/[0-9.]/.test(src[j] || '')) j++; tokens.push({ tipo: 'num', valor: Number(src.slice(i, j)), pos: i }); i = j; continue; }
    if (/[A-Za-z_]/.test(c)) { let j = i; while (/[A-Za-z0-9_]/.test(src[j] || '')) j++; const t = src.slice(i, j); tokens.push({ tipo: PALAVRAS.has(t) ? t : 'id', valor: t, pos: i }); i = j; continue; }
    if ('+-*/%<>=(){};'.includes(c)) { tokens.push({ tipo: 'op', valor: c, pos: i }); i++; continue; }
    throw new SyntaxError('caractere inesperado "' + c + '" na posição ' + i);
  }
  return tokens;
}

// um nível de precedência = uma função com um laço (associatividade à esquerda)
const nivel = (ops, abaixo) => () => {
  let e = abaixo();
  while (olhar().tipo === 'op' && ops.includes(olhar().valor)) { const op = prox().valor; e = { tipo: 'Bin', op, esq: e, dir: abaixo() }; }
  return e;
};
const multiplicativo = nivel(['*', '/', '%'], primario);
const aditivo = nivel(['+', '-'], multiplicativo);   // 1 + 2 * 3 - 4  =>  ((1 + (2 * 3)) - 4)`, notes: [{ l: '8', t: 'Erro léxico com posição.' }, { l: '19', t: 'Chamar o nível mais baixo de dentro do mais alto dá a precedência correta.' }] },
    { title: 'Compilar a AST para bytecode de pilha e executar na VM (JavaScript; resultado 220 nas duas estratégias)', lang: 'js', code: R`// let a = 2 + 3 * 4;  =>  [["PUSH",2],["PUSH",3],["PUSH",4],["*"],["+"],["STORE",0],["HALT"]]
const expr = (n) => {
  if (n.tipo === 'Num') emit('PUSH', n.valor);
  else if (n.tipo === 'Var') emit('LOAD', slot(n.nome, false));   // nome -> índice, resolvido na compilação
  else { expr(n.esq); expr(n.dir); emit(n.op); }                  // pós-ordem: operandos primeiro
};
// while: salto condicional para o fim e salto incondicional de volta ao início (backpatching do endereço)
// const ini = codigo.length; expr(c.cond); const sai = emit('JZ', -1); cmds(c.corpo); emit('JMP', ini); codigo[sai][1] = codigo.length;

export function executarVM({ codigo, nVars }) {
  const pilha = []; const mem = new Array(nVars).fill(0); const saida = []; let pc = 0;
  for (;;) {
    const [op, arg] = codigo[pc++];
    switch (op) {
      case 'PUSH': pilha.push(arg); break;
      case 'LOAD': pilha.push(mem[arg]); break;
      case 'STORE': mem[arg] = pilha.pop(); break;
      case 'JZ': if (!pilha.pop()) pc = arg; break;
      case 'JMP': pc = arg; break;
      case 'HALT': return saida;
      default: { const b = pilha.pop(), a = pilha.pop(); pilha.push(aplicar(op, a, b)); }
    }
  }
}`, notes: [{ l: '4', t: 'Variáveis viram índices de memória: sem busca por nome em tempo de execução.' }, { l: '8', t: 'Laços viram saltos com endereços preenchidos depois (backpatching).' }] },
    { title: 'O mesmo programa em seis motores e o bytecode do CPython (shell e Python; resultados medidos)', lang: 'bash', code: R`node mini/comparar.mjs
# interpretador de árvore (AST)      2149.2 ms  (62.3x do nativo)
# máquina virtual de bytecode        1011.7 ms  (29.3x do nativo)
# JavaScript nativo (V8 com JIT)       34.5 ms   (1.0x)
# C compilado com gcc -O0 (volatile)   11.6 ms   (0.3x)
# C compilado com gcc -O2 (volatile)   11.8 ms   (0.3x)
# Python 3.14 (CPython, bytecode)     698.0 ms  (20.2x)

python3 -c "import dis; dis.dis(lambda x: x * 2 + 1)"
#   RESUME 0 | LOAD_FAST_BORROW 0 (x) | LOAD_SMALL_INT 2 | BINARY_OP 5 (*) | LOAD_SMALL_INT 1 | BINARY_OP 0 (+) | RETURN_VALUE`, notes: [{ l: '5', t: 'Com volatile o gcc não pode otimizar o laço: -O0 e -O2 empatam.' }, { l: '9', t: 'O CPython também compila para bytecode e o interpreta.' }] }
  ],
  bestPractices: ['Pense em estratégias de execução, não em linguagens "compiladas" ou "interpretadas".', 'Separe lexer, parser e execução; faça o parser por descida recursiva com uma função por nível de precedência.', 'Resolva nomes e detecte erros semânticos em compilação quando possível.', 'Teste as fases isoladamente e os motores por equivalência de resultados.', 'Ao medir, desconfie de microbenchmarks: o compilador pode eliminar ou limitar o que você mede.', 'Nunca avalie entrada de usuário com eval; construa uma DSL com parser e interpretador próprios.', 'Use dis, ast e print-bytecode para observar o que as linguagens reais fazem.'],
  mistakes: ['Afirmar que uma linguagem é "interpretada" e portanto lenta.', 'Escrever parsers com expressões regulares para gramáticas aninhadas.', 'Misturar análise sintática com execução.', 'Concluir de um microbenchmark que um motor é N vezes mais rápido em geral.', 'Usar eval em entrada não confiável.', 'Ignorar posição e contexto nas mensagens de erro.'],
  market: R`Conhecer as fases e as estratégias de execução ajuda a **ler erros**, **depurar desempenho** e **construir DSLs** (regras, filtros, configuração); é base de **ferramentas** (linters, bundlers, transpiladores) e **aparece** em **entrevistas** de **sistemas** e **linguagens**.`,
  summary: R`Compilar e interpretar são estratégias de execução: lexer, parser (AST), análise semântica, otimização, geração (código de máquina, bytecode ou outra linguagem) e execução (CPU, VM ou interpretador). Construída e medida a mini linguagem (5 testes, resultados idênticos), o mesmo laço de 1 milhão de iterações levou 2.149 ms na árvore, 1.012 ms na VM de bytecode, 34,5 ms em JavaScript com JIT, 11,6 ms em C e 698 ms em Python: o bytecode do CPython supera a VM simples do laboratório; C -O0 e -O2 empataram por causa da variável volatile. Cuidado com microbenchmarks. LLVM, GraalVM, PyPy, JVM e WebAssembly não foram executados.`,
  refs: [REF.crafting, REF.cs6120, REF.pyDis, REF.pyAst, REF.v8Ignition, REF.gccOpt],
  cards: [
    { q: 'Quais são as fases de um compilador ou interpretador?', a: 'Análise léxica, sintática (AST), semântica, otimização/IR, geração de código e execução.' },
    { q: 'Por que o bytecode foi mais rápido que a árvore, mas mais lento que o CPython?', a: 'Evita percorrer a árvore e resolve nomes uma vez, mas a VM do laboratório usa arrays e switch sobre texto; o CPython é um interpretador de bytecode muito otimizado.' },
    { q: 'Por que C -O0 e -O2 empataram no laboratório?', a: 'A variável volatile obriga a ler e gravar a memória a cada iteração, impedindo as otimizações: um artefato do microbenchmark.' },
    { q: 'O que é JIT?', a: 'Compilação para código nativo durante a execução, de trechos quentes, guiada pelo comportamento observado.' }
  ]
},
{
  id: 'int-02', moduleId: 'm1', order: 2, minutes: 80, tags: ['V8', 'Ignition', 'Maglev', 'TurboFan', 'deopt', 'hidden classes', 'inline cache', 'JIT'],
  title: 'Execução em tempo de execução: bytecode, JIT em camadas, desotimização e formas de objetos no V8',
  objectives: ['Explicar o pipeline do V8: parser, Ignition (bytecode), Maglev e TurboFan', 'Observar a otimização e a desotimização com --trace-opt e --trace-deopt', 'Ler o bytecode do Ignition de uma função pequena', 'Medir o efeito de formas de objeto (monomórfico x polimórfico) e do JIT (jitless)', 'Escrever JavaScript que o motor otimiza bem (tipos estáveis, formas consistentes)', 'Evitar conclusões ingênuas de microbenchmarks e reconhecer o custo de aquecimento'],
  intro: R`O V8 não "interpreta" nem "compila" JavaScript de uma vez: ele **observa** o programa e **sobe de camada**. **Ignition** interpreta **bytecode**; funções **quentes e estáveis** vão para o **Maglev** (e depois o **TurboFan**), que **assumem tipos**; se a **suposição falha**, ocorre **desotimização** e volta ao bytecode. No laboratório: §somar(acc, i)§ foi marcada "**hot and stable**" e compilada pelo **Maglev**; ao receber **strings**, houve **§deopt-eager, reason: not a Smi§** e **recompilação**; objetos com **1 forma** foram **4,2x** mais rápidos que com **5 formas** (**35,5 x 148,8 ms**); sem JIT (§--jitless§) o laço levou **245,7 ms contra 35,1 ms** (**7x**).`,
  theory: R`### O pipeline do V8 (Node 26: V8 14.6)
1. **Parser** → **AST** (com **parse preguiçoso**: funções internas só são analisadas **quando chamadas**);
2. **Ignition** (interpretador): gera **bytecode** **compacto** e o **executa**; **coleta *feedback*** (quais **tipos** passaram por cada operação);
3. **Sparkplug** (compilador **base**, sem otimizações): **traduz bytecode** em código nativo **rápido** de gerar (em algumas versões/flags);
4. **Maglev** (compilador **otimizante intermediário**, introduzido no V8 **11.x**): usa o **feedback** para **compilar rápido** com **otimizações moderadas**;
5. **TurboFan** (compilador **otimizante** de **topo**): **otimizações agressivas** (inlining, eliminação de verificações, escape analysis) para **código muito quente**.
**Tiering:** **começar rápido** (interpretar) e **gastar tempo de compilação só onde compensa**. **Observabilidade:** **flags** do V8: §--print-bytecode§, §--trace-opt§, §--trace-deopt§, §--trace-gc§, §--jitless§ (**experimentais** e **mudam** entre versões).

### Bytecode do Ignition (medido)
§node --print-bytecode --print-bytecode-filter=dobrarMaisUm§ para §function dobrarMaisUm(x) { return x * 2 + 1; }§:
§Parameter count 2§ (**a** mais **o receptor** §this§), §Register count 0§, **9 bytes**:
- §Ldar a0§ (carrega o argumento no **acumulador**);
- §MulSmi [2], FBV[1]§ (**multiplica** por **2**, com **slot de feedback**);
- §AddSmi [1], FBV[0]§ (**soma 1**);
- §Return§.
**"Smi"** = ***small integer*** (inteiro de **31/32 bits** **sem alocação**: **otimização central** do V8). Máquina de **acumulador** (registradores + acumulador), **diferente** da **pilha** da minha VM (aula int-01) e parecida com **o espírito** do bytecode do CPython (que usa **pilha**): **o modelo de VM** é **decisão de projeto**.

### Otimização e desotimização (medidas)
Programa (§jit/quente.mjs§): **200.000** chamadas de §somar(acc, i % 10)§ (**números**), depois **2.000** chamadas §somar(txt, 'x')§ (**strings**). Saída de §--trace-opt --trace-deopt§ (resumida):
1. §marking <JSFunction somar> for optimization to MAGLEV, ... reason: hot and stable§ → §compiling method ... (target MAGLEV), mode: ConcurrencyMode::kConcurrent§ → §completed compiling ... took 0.001, 0.422, 0.004 ms§ (**0,4 ms**, **em outra thread**: **concorrente**);
2. **fase 2 (strings):** §bailout (kind: deopt-eager, reason: not a Smi)... deoptimizing <JSFunction somar>, <Code MAGLEV>§: o código **assumia Smi**; chegou **string**: **desotimiza**;
3. **de novo** "**hot and stable**" → **nova compilação Maglev** (agora **com feedback de números e strings**).
**Lições:** **o JIT especula** a partir do que viu; **mudar os tipos** em **código quente** **custa** (desotimizar + recompilar); **tipos estáveis por função** deixam o código **rápido**; **deopt "eager"** = **checagem falhou**; **"lazy"** = **dependência invalidada** (ex.: protótipo alterado). **Nunca** otimize **por flag**: **escreva código previsível**.

### Formas de objeto (*hidden classes/shapes*) e *inline caches*
O V8 dá a cada objeto uma **forma** (§Map§/**hidden class**) que descreve **propriedades e ordem**. Objetos criados **com as mesmas propriedades na mesma ordem** **compartilham** a forma; o acesso §o.x§ vira um **deslocamento fixo** guardado em um **inline cache** (IC) por local de código. **Estados do IC:** **monomórfico** (**1** forma: **muito rápido**), **polimórfico** (2 a 4 formas: verificações em sequência), **megamórfico** (muitas: **tabela hash**, **lento**).
**Medido** (§jit/formas.mjs§, **5 milhões** de leituras de §arr[i].x§, **mediana de 5**):
| Cenário | Tempo |
|---|---|
| **1 forma** (§{ x, y }§ sempre) | **35,5 ms** |
| **5 formas** (ordem e propriedades diferentes) | **148,8 ms** |
| **Razão** | **4,2x** |
**Boas práticas:** **inicialize todas as propriedades no construtor/literal, sempre na mesma ordem**; **evite §delete§** (muda a forma e pode cair em **modo dicionário**); **não adicione propriedades depois** em objetos **quentes**; **arrays homogêneos** (**só números** usam **representação compacta**: §PACKED_SMI_ELEMENTS§ → §PACKED_DOUBLE_ELEMENTS§ → §PACKED_ELEMENTS§ **não volta** atrás).

### O JIT importa quanto? (medido)
Mesmo laço numérico (§jit/laco.mjs§, **1.000.000** de iterações, mediana de 5):
| Modo | Tempo |
|---|---|
| **Padrão (com JIT)** | **35,1 ms** |
| **§--jitless§** (apenas interpretador) | **245,7 ms** (**7x**) |
| **§--no-opt§** (sem compiladores otimizantes) | **37,4 ms** |
**Leitura:** o **Maglev/Sparkplug** **continuam ativos** em §--no-opt§ (**37,4 ms**: **quase igual**): para **esse laço** o **tier intermediário** basta. Sem **nenhum** JIT (§--jitless§), **7x mais lento**. **Uso real do §--jitless§:** **ambientes que proíbem memória executável** (alguns **sandboxes**, **iOS**, **hardening**). **Ressalva:** **um laço aritmético** **não** representa **aplicações reais** (que **passam muito tempo** em **I/O, GC e bibliotecas**).

### Aquecimento e microbenchmarks
O desempenho de **código JIT** **muda ao longo do tempo**: **primeiras chamadas** em **bytecode**, **depois** otimizado. **Boas práticas de medição** (também usadas **nos laboratórios**): **aquecer** antes de medir, **repetir** e **usar mediana**, **verificar** o resultado (**evita eliminação de código morto**), **medir o que importa** (**perfil** com §--cpu-prof§/DevTools, não suposições) e **comparar em condições iguais**. **Armadilha:** otimizar **para o benchmark** (**tipos** fixos) e **degradar** em **produção** (**dados variados**: polimorfismo).

### Outros motores (resumo; não executados)
- **JVM (HotSpot):** **interpretador** → **C1** (rápido) → **C2** (agressivo), **compilação em camadas**, **tipos estáticos** (menos especulação sobre tipos), **GraalVM** (compilador em Java; **AOT** com *native image*); **Java** e **Kotlin** (C9);
- **PyPy:** **JIT de rastros** para **Python**, **ganhos grandes** em laços numéricos, **compatibilidade** limitada com extensões C;
- **CPython 3.13/3.14:** **JIT experimental** (copy-and-patch) e **interpretador adaptativo**: **opcional**, **ganhos moderados**; **sem JIT por padrão**;
- **WebAssembly:** **bytecode compacto** com **tipagem estática**, **compilado** (**Liftoff** + **TurboFan** no V8) **sem especulação de tipos**.

### Escrevendo código "amigável ao motor"
1. **Tipos estáveis** por variável e por função (**não** alterne número ↔ string);
2. **Formas consistentes**: **mesma ordem** de propriedades, **sem** §delete§ nem **campos novos tardios**;
3. **Arrays homogêneos** e **sem buracos** (§new Array(n)§ **cria buracos**);
4. **Funções pequenas** e **previsíveis** (**inlining**);
5. **Evite §arguments§**, **§try/catch§ gigantes** em laços quentes e **exceções para controle de fluxo**;
6. **Meça antes de "otimizar"** (**cln-04** e **pat-05**: otimização prematura).`,
  concepts: [
    { term: 'Ignition', def: 'Interpretador de bytecode do V8, que também coleta feedback de tipos para os compiladores otimizantes.' },
    { term: 'Maglev', def: 'Compilador JIT intermediário do V8, que compila rápido usando o feedback de tipos.' },
    { term: 'TurboFan', def: 'Compilador JIT otimizante de topo do V8, com otimizações agressivas para código muito quente.' },
    { term: 'Desotimização', def: 'Descarte de código otimizado cuja suposição (por exemplo, o tipo) deixou de valer, voltando ao bytecode.' },
    { term: 'Hidden class (shape)', def: 'Descrição interna das propriedades e da ordem de um objeto, compartilhada por objetos de mesma forma.' },
    { term: 'Inline cache', def: 'Cache por local de código que guarda a forma vista e o deslocamento da propriedade para acelerar acessos.' },
    { term: 'Smi', def: 'Inteiro pequeno representado diretamente no valor, sem alocação de objeto no heap.' }
  ],
  examples: R`**Analogia:** o V8 é um **chef que aprende o cardápio no serviço**: no começo **cozinha tudo à mão** (Ignition); quando um prato **se repete**, **monta uma estação** para ele (Maglev/TurboFan) **apostando que será igual**; se chega um pedido **inesperado** (um ingrediente de outro tipo), **desmonta a estação** e volta ao modo manual, **antes de remontar**.

**Exemplo 1: deopt.** A função somar, otimizada para números, é desotimizada ao receber uma string ("not a Smi") e recompilada.

**Exemplo 2: formas.** 5 milhões de leituras: 35,5 ms com 1 forma e 148,8 ms com 5 formas (4,2x).

**Exemplo 3: sem JIT.** O mesmo laço leva 245,7 ms com --jitless contra 35,1 ms com JIT (7x).`,
  code: [
    { title: 'Observar otimização e desotimização (JavaScript e shell; saída resumida medida)', lang: 'js', code: R`// node --trace-opt --trace-deopt jit/quente.mjs
function somar(a, b) { return a + b; }
let acc = 0;
for (let i = 0; i < 200000; i++) acc = somar(acc, i % 10);   // sempre números (Smi)
let txt = '';
for (let i = 0; i < 2000; i++) txt = somar(txt, 'x');         // muda para string

// [marking <JSFunction somar> for optimization to MAGLEV, ... reason: hot and stable]
// [completed compiling <JSFunction somar> (target MAGLEV) - took 0.001, 0.422, 0.004 ms]
// [bailout (kind: deopt-eager, reason: not a Smi): ... deoptimizing <JSFunction somar>, <Code MAGLEV> ...]
// [marking <JSFunction somar> for optimization to MAGLEV, ... reason: hot and stable]   // recompila com novo feedback`, notes: [{ l: '4', t: 'Tipos estáveis deixam o código otimizado valer.' }, { l: '10', t: 'Mudar de tipo em código quente causa deopt e nova compilação.' }] },
    { title: 'Bytecode do Ignition e formas de objeto (shell e JavaScript; resultados medidos)', lang: 'js', code: R`// node --print-bytecode --print-bytecode-filter=dobrarMaisUm jit/bytecode.mjs
function dobrarMaisUm(x) { return x * 2 + 1; }
//   Ldar a0
//   MulSmi [2], FBV[1]
//   AddSmi [1], FBV[0]
//   Return                                   (Bytecode length: 9)

// jit/formas.mjs: 5 milhões de leituras de arr[i].x
const mono = Array.from({ length: 1000 }, (_, i) => ({ x: i, y: 1 }));                // 1 forma
const poli = Array.from({ length: 1000 }, (_, i) => (i % 5 === 0 ? { x: i, y: 1 } : i % 5 === 1 ? { y: 1, x: i } : i % 5 === 2 ? { x: i, z: 0, y: 1 } : i % 5 === 3 ? { a: 0, x: i, y: 1 } : { x: i, y: 1, w: 9 }));   // 5 formas
// monomórfico 35,5 ms | polimórfico 148,8 ms | razão 4,2x`, notes: [{ l: '6', t: 'Smi: inteiro pequeno sem alocação; FBV é o slot de feedback.' }, { l: '10', t: 'Ordem e conjunto de propriedades diferentes criam formas diferentes.' }] },
    { title: 'Com e sem JIT, e como medir com cuidado (shell e JavaScript; resultados medidos)', lang: 'js', code: R`// node jit/laco.mjs               -> mediana 35,1 ms   (com JIT)
// node --jitless jit/laco.mjs     -> mediana 245,7 ms  (apenas interpretador: 7x)
// node --no-opt jit/laco.mjs      -> mediana 37,4 ms   (sem compiladores otimizantes; Maglev/Sparkplug ainda ajudam)
const N = 1000000;
function laco() { let s = 0; for (let i = 1; i <= N; i++) s = s + i * i % 7; return s; }
laco();                                                        // aquecimento: a primeira chamada ainda não está otimizada
const t = [];
for (let k = 0; k < 5; k++) { const t0 = performance.now(); laco(); t.push(performance.now() - t0); }
t.sort((a, b) => a - b);                                       // mediana de 5, não a melhor nem a média
console.log('mediana', t[2].toFixed(1), 'ms');`, notes: [{ l: '6', t: 'Aquecer antes de medir evita contar o tempo em bytecode.' }, { l: '10', t: 'A mediana reduz a influência de variações pontuais.' }] }
  ],
  bestPractices: ['Mantenha tipos estáveis nas funções quentes e evite alternar número e string.', 'Inicialize todas as propriedades do objeto sempre na mesma ordem e evite delete e campos tardios.', 'Prefira arrays homogêneos e sem buracos.', 'Meça com aquecimento, repetição e mediana, e verifique o resultado para evitar eliminação de código.', 'Use as flags do V8 (print-bytecode, trace-opt, trace-deopt) para investigar, sabendo que mudam entre versões.', 'Perfile (cpu-prof, DevTools) antes de otimizar e não otimize para o benchmark.', 'Lembre que aplicações reais passam tempo em I/O, GC e bibliotecas, não só em laços.'],
  mistakes: ['Concluir que o JIT "falha" porque o primeiro run foi lento (sem aquecimento).', 'Misturar formas de objeto em código quente.', 'Usar delete em objetos críticos.', 'Medir uma única execução.', 'Usar flags do V8 em produção sem entender.', 'Otimizar sem perfilar.'],
  market: R`Entender **JIT, formas de objeto e desotimização** ajuda a **diagnosticar regressões de desempenho** em **Node e navegadores** e é **assunto** de **entrevistas** de **desempenho** e **runtime**.`,
  summary: R`O V8 interpreta bytecode (Ignition), coleta feedback e compila funções quentes e estáveis (Maglev e TurboFan) assumindo tipos; se a suposição falha, desotimiza e volta ao bytecode. Medido (Node 26.13.1, V8 14.6): somar foi compilada pelo Maglev em 0,4 ms e desotimizada ao receber strings ("not a Smi") e recompilada; o bytecode de x*2+1 tem 4 instruções e 9 bytes; objetos com 1 forma foram 4,2x mais rápidos que com 5 (35,5 x 148,8 ms); sem JIT (--jitless) o laço foi 7x mais lento (245,7 x 35,1 ms) e --no-opt quase igual (37,4 ms). Escreva código com tipos e formas estáveis e meça com aquecimento. JVM, PyPy, JIT do CPython e WebAssembly foram só descritos.`,
  refs: [REF.v8Ignition, REF.v8Maglev, REF.v8Docs, REF.shapes, REF.pyDis, REF.crafting],
  cards: [
    { q: 'O que significa deopt-eager com "not a Smi"?', a: 'O código otimizado assumia inteiros pequenos; ao receber outro tipo (string) a checagem falhou e o código foi descartado.' },
    { q: 'Por que objetos com a mesma forma são mais rápidos?', a: 'O inline cache fica monomórfico e o acesso à propriedade vira um deslocamento fixo; com 5 formas o laboratório mediu 4,2x mais lento.' },
    { q: 'Quanto o JIT ajudou no laço do laboratório?', a: 'Com --jitless levou 245,7 ms contra 35,1 ms (7x); --no-opt ficou em 37,4 ms porque o tier intermediário já ajuda.' },
    { q: 'Por que aquecer antes de medir?', a: 'As primeiras chamadas rodam em bytecode; medir sem aquecer mistura interpretação com código otimizado.' }
  ]
}
];
