# Laboratório C5.4 — Fundamentos de testes

Ambiente (2026-11-25): Node.js 26.13.1 (`node:test`, `node:sqlite` com SQLite 3.54.1, `mock.fn`, `mock.timers`), fast-check 4.11.0, @cucumber/cucumber 13.3.0, puppeteer-core 25.18.1 com o Google Chrome do sistema (headless). Instalação: `npm i` (as dependências ficam fora do repositório; o `package.json` lista as versões exatas).

## Sistema sob teste (`src/`)
`dominio.mjs` (regras puras: total, desconto, cupom), `repositorio.mjs` (SQLite com transações e restrições CHECK/FOREIGN KEY), `servico.mjs` (orquestração com dependências injetadas) e `servidor.mjs` (API HTTP em `node:http` + página para o E2E).

## Testes (`test/`) e experimentos
- `unitarios.test.mjs` (12 testes): AAA, tabelas parametrizadas, erros, 3 testes de propriedade com fast-check (um deles falha de propósito para obter o contraexemplo).
- `repositorio.integracao.test.mjs` (5) e `api.integracao.test.mjs` (3): SQLite real em memória e servidor HTTP real em porta efêmera.
- `servico.mock.test.mjs` (5): `mock.fn`, stubs, `mock.timers` e um fake (repositório real) para teste de estado.
- `e2e.test.mjs` (3): fluxo de compra no Chrome headless. `e2e-flaky.mjs`: espera fixa x espera por condição.
- `overmock.mjs`: teste com mocks de interação x teste de estado antes e depois de uma refatoração interna.
- `tdd/`: kata da calculadora de strings, 8 testes contra 8 versões da implementação (v0 a v7).
- `features/` + `cucumber.mjs`: BDD em português (Gherkin), 7 cenários.
- `piramide.mjs`: tempo por camada. `mutacao-manual.mjs`: 7 mutantes aplicados ao código; `extras/fronteiras.test.mjs`: 2 testes que fecham os buracos.

## Comandos
```
node --test test/            # 28 testes
IMPL=v3 node --test tdd/kata.test.mjs
npx cucumber-js
node e2e-flaky.mjs ; node overmock.mjs ; node piramide.mjs
node mutacao-manual.mjs ; node mutacao-manual.mjs --com-extras
```

## Resultados medidos
- 28 de 28 testes do `node --test test/` passam; BDD: 7 cenários e 40 passos passam (com 1 falha real no meio do caminho: a data do cenário do cupom expirado estava errada e foi corrigida).
- Pirâmide (cada camada em um processo próprio, tempo inclui a inicialização do Node): unitários 12 testes em 613 ms (inclui 1.000+ execuções de propriedades), mocks 5 em 346 ms, integração SQLite 5 em 321 ms, integração HTTP 3 em 661 ms, E2E 3 em 2.983 ms (≈ 994 ms por teste, com abertura do Chrome).
- Flakiness: espera fixa de 120 ms em um E2E com resposta atrasada de 0 a 300 ms falhou em 8 de 14 execuções; a espera por condição falhou em 0 de 14 (tempo médio 224 ms contra 269 ms).
- Over-mocking: após renomear internamente `salvar` para `inserir`, o teste com mocks de interação falhou e o teste de estado com fake continuou passando.
- TDD (mesmos 8 testes contra cada passo): v0 0/8, v1 2/8, v2 4/8, v3 5/8, v4 6/8, v5 7/8, v6 8/8 e v7 (refatoração) 8/8.
- fast-check encontrou um contraexemplo para "soma de floats não depende da ordem" (propriedade falsa de propósito), com semente fixa.

- Cobertura (`node --test --experimental-test-coverage`, sem E2E): 100% das linhas e 98,48% dos ramos, mas a mutação manual deixou 2 de 7 mutantes vivos (último dia do cupom e quantidade 0); com os 2 testes de `extras/` todos os 7 morreram.

## Limitações
O passo a passo do TDD foi reconstruído em versões sucessivas e executado contra os mesmos testes (não é o histórico real de commits). As medições vêm de uma máquina e uma execução (os tempos variam); o tempo por teste inclui a inicialização do processo. Não executados: Jest, Vitest, Playwright e Cypress (C5.5), testes de contrato e carga (C5.6) e mutação automatizada (Stryker).
