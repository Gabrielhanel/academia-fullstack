# Laboratório C5.7 — Estruturas internas das linguagens

Ambiente (2026-11-25): Node.js 26.13.1 (V8 com Ignition, Maglev e TurboFan), Python 3.14.4 (CPython) e gcc (Linux). Sem dependências externas.

## Conteúdo
- `mini/`: uma mini linguagem (`let`, atribuição, `while`, `if/else`, `print`, aritmética e comparações): `lexer.mjs` (tokens), `parser.mjs` (AST por descida recursiva), `interpretador.mjs` (percorre a árvore), `vm.mjs` (compila para bytecode de pilha e executa), `mini.test.mjs` (5 testes) e `comparar.mjs` (seis estratégias de execução).
- `jit/`: `quente.mjs` (otimização e desotimização), `bytecode.mjs` (bytecode do Ignition), `formas.mjs` (monomórfico x polimórfico) e `laco.mjs` (com e sem JIT).
- `gc/`: `alocacao.mjs` (coletas do V8 com PerformanceObserver), `vazamento.mjs` (cache sem limite x limitado com `--max-old-space-size=64`) e `ciclos.py` (contagem de referências e coletor de ciclos do CPython).

## Comandos
```
node --test mini/
node mini/comparar.mjs
node --trace-opt --trace-deopt jit/quente.mjs
node --print-bytecode --print-bytecode-filter=dobrarMaisUm jit/bytecode.mjs
node jit/formas.mjs ; node jit/laco.mjs ; node --jitless jit/laco.mjs
node --expose-gc gc/alocacao.mjs curto|retido ; node --expose-gc --trace-gc gc/alocacao.mjs curto
node --max-old-space-size=64 gc/vazamento.mjs vaza|limitado
python3 gc/ciclos.py
```

## Resultados medidos (arquivos `saida-*.txt`; uma máquina, uma execução, medianas de 5 quando indicado)
- Mini linguagem: 5 testes passam (tokens, precedência na AST, resultados idênticos nas duas estratégias, erros e bytecode gerado).
- Mesmo laço de 1.000.000 de iterações: interpretador de árvore 2.149,2 ms; máquina virtual de bytecode (opcodes em texto) 1.011,7 ms; JavaScript nativo com JIT 34,5 ms; C com gcc -O0 e -O2 (variável `volatile`) 11,6 e 11,8 ms; Python 698,0 ms. Todos devolveram o mesmo resultado (1999999). A VM do laboratório é simples (instruções como arrays e `switch` sobre texto): é mais lenta que o CPython, que é um interpretador de bytecode muito otimizado.
- V8: a função `somar` foi marcada "hot and stable" e compilada pelo Maglev; ao receber strings houve `deopt-eager, reason: not a Smi` e recompilação. Bytecode de `x * 2 + 1`: `Ldar a0`, `MulSmi [2]`, `AddSmi [1]`, `Return` (9 bytes). Objetos de 1 forma: 35,5 ms; de 5 formas: 148,8 ms (4,2x). Laço com JIT 35,1 ms; `--jitless` 245,7 ms (7x); `--no-opt` 37,4 ms.
- GC do V8 com 3 milhões de objetos: tudo lixo → 46 coletas menores (Scavenge), pausa total 91,6 ms, heap 3,9 → 6,6 MB; um terço retido → 30 menores, 3 maiores, 2 incrementais, pausa 776,1 ms, heap 175,0 MB. Cache sem limite com 64 MB: `FATAL ERROR: Ineffective mark-compacts near heap limit ... JavaScript heap out of memory`; com limite de 5.000 entradas terminou sem falha.
- CPython 3.14.4: objeto sem ciclo liberado na hora; com ciclo e coletor desligado ficou vivo até `gc.collect()` (147 inalcançáveis, incluindo outros); 300.000 ciclos: coletor desligado retém 50,4 MiB; ligado, 0,1 MiB (pico 1,4 MiB), porém mais lento (2.025 ms contra 1.712 ms).

## Limitações
Os tempos de um laço aritmético não representam programas reais. Não foram executados: LLVM/Clang e inspeção de IR, GraalVM, PyPy, JVM (HotSpot, G1/ZGC), Go, Rust, `perf` e profilers de heap (Chrome DevTools heap snapshots), WeakRef/FinalizationRegistry e o modo incremental do GC do Python (apenas descrito).
