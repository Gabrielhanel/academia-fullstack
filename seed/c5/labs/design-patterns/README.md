# Laboratório C5.2 — Design Patterns em JavaScript

Ambiente (2026-11-25): Node.js 26.13.1, sem dependências externas (`node:test`, `node:events`).

## Conteúdo
- `criacionais.mjs`: Factory, Builder (campos privados `#`), Singleton de módulo e instância por teste.
- `estruturais.mjs`: Adapter, Decorators (retry, cache, log), Facade, Proxy (validação e carregamento preguiçoso) e Composite.
- `comportamentais.mjs`: Strategy, Observer (`EventEmitter`), Command (desfazer), State, Chain of Responsibility, Template Method e Iterator (geradores).
- `di.mjs`: injeção manual (raiz de composição), contêiner mínimo com ciclos de vida e detecção de ciclo, e um service locator como anti-padrão.
- `antipatterns.mjs`: God Object x função pura e callback hell x async/await.
- `padroes.test.mjs`: 22 testes. `medicoes.mjs`: medições (use `node --expose-gc medicoes.mjs`).

## Comandos
```
node --test                      # 22 testes
node --expose-gc medicoes.mjs
```

## Resultados medidos (arquivos `saida-*.txt`)
- Testes: 22 de 22 passam. O teste do Singleton de módulo mostra o acoplamento por ordem: o segundo teste só passa porque herda o contador do primeiro (valor 3); com instância criada por teste o valor é sempre 1.
- Observer: 11 ouvintes no mesmo evento disparam `MaxListenersExceededWarning` (limite padrão 10). Com `setMaxListeners(0)`, 100.000 ouvintes (closures de ~1 KB) elevaram o heap de 4,0 MB para 117,2 MB e, após `off` e GC, voltaram a 4,1 MB.
- Proxy: 10 milhões de leituras levaram 30,6 ms no objeto direto, 1.613,6 ms em um Proxy com trap `get` e 953,7 ms em um Proxy só com trap `set` (medianas de 7 execuções nesta máquina; em uma execução anterior deu 18,2 ms, 1.036,7 ms e 725,5 ms, ~57x; o objeto direto é otimizado pelo motor, portanto a razão é indicativa, não universal).
- Decorator de cache: 100 leituras de 10 chaves com latência simulada de 5 ms: 524 ms sem cache e 52 ms com cache (10 chamadas ao backend; em outra execução 528 ms e 53 ms).

## Limitações
Medidas de uma máquina e de uma execução; micro-benchmarks variam com versão do motor. Não foram executados NestJS DI, InversifyJS, TSyringe nem padrões de concorrência. Os exemplos são simplificações didáticas, não bibliotecas.
