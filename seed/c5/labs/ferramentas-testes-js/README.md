# Laboratório C5.5 — Ferramentas de teste para JavaScript

Ambiente (2026-11-25): Node.js 26.13.1; Jest 30.5.2 (ESM com `--experimental-vm-modules`, cobertura v8), Vitest 5.1.2 (+ @vitest/coverage-v8 5.1.2), Supertest 7.3.2 com Express 5.3.0, Playwright 1.65.1 (Google Chrome do sistema, `channel: 'chrome'`), Cypress 16.3.0 (binário no cache `~/.cache/academia-v2-cypress-lab`, 811 MB; navegador padrão Electron) e actionlint 1.7.12 (imagem Docker). Instalação: `npm i` com as versões exatas do `package.json` (as dependências ficam fora do repositório).

## Conteúdo
- `src/`: domínio, repositório (SQLite), serviço, servidor `node:http` (E2E) e `app.mjs` (Express 5 sem `listen`, para Supertest).
- `jest/dominio.test.mjs` (13 testes), `vitest/dominio.test.mjs` (17), `api/pedidos.test.mjs` (5, Supertest sob Vitest).
- `playwright/compra.spec.mjs` (11 testes) e `cypress/e2e/compra.cy.js` (7), ambos contra `servidor-e2e.mjs` (porta 4571).
- `ci/ci.yml` (workflow com matriz de Node e shards do Playwright) e `ci/invalido.yml` (defeitos propositais); validados com o actionlint.

## Comandos
```
NODE_OPTIONS=--experimental-vm-modules npx jest [--coverage]
npx vitest run vitest | npx vitest run api | npx vitest run --coverage
npx playwright test [--workers=1] [--shard=1/2]      # TRACE=1 grava o trace
node servidor-e2e.mjs & CYPRESS_CACHE_FOLDER=... npx cypress run
docker run --rm -v "$PWD/ci:/repo" -w /repo rhysd/actionlint:latest ci.yml
```

## Resultados medidos (arquivos `saida-*.txt`)
- Jest: 13 testes, 1 snapshot inline, `Time: 0.659 s`; Vitest: 17 testes (inclui `expect.soft`, `test.concurrent` e `vi.stubEnv`), 817 ms; Supertest + Vitest: 5 testes (201, 422, 404, 400 para JSON inválido e 413 para corpo acima de 10 kb) em 1,44 s.
- Tempo de parede (binário direto, mediana de 5 execuções): Jest 1,54 s, Vitest 2,07 s, Vitest com Supertest 2,60 s e `node:test` (12 testes de domínio) 0,38 s. São suítes minúsculas: o resultado é dominado pela inicialização e não generaliza para suítes grandes.
- Cobertura v8: Jest 100% de linhas (91,3% dos ramos) em `dominio.mjs` e `servico.mjs`; Vitest 100% de linhas e 91,89% dos ramos incluindo `app.mjs`.
- Playwright: 11 testes passaram em 12,3 s (4 workers), 13,1 s (1 worker); shards 1/2 em 8,3 s e 2/2 em 7,9 s; um trace de um teste ocupou 46.310 bytes. As 7 variações de atraso (0 a 300 ms) passaram sem nenhum `sleep` (auto-espera).
- Cypress: 7 testes passaram em 3 s; antes, 1 falhou porque `should('match', regex)` testava o seletor do elemento e não o texto; corrigido com `invoke('text')`.
- actionlint: `ci.yml` sem problemas (exit 0); `invalido.yml` com 4 erros (job inexistente em `needs`, `matrix.nodee`, `github.evnt` e `runs-on` ausente; exit 1).

## Limitações
O workflow do GitHub Actions foi apenas validado estaticamente (não foi executado em um runner). Os tempos vêm de uma máquina e de execuções curtas. Não foram executados Mocha, Karma, Selenium, WebdriverIO, Playwright Component Testing, testes visuais nem o modo UI/watch das ferramentas. Para repetir o Cypress é preciso baixar o binário (cerca de 800 MB já extraídos).
