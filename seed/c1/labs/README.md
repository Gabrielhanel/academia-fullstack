# Laboratórios de apoio da C1 (evidência de execução)

Scripts usados para **executar os exemplos** das aulas antes de publicá-los no texto. Não fazem parte do build do app nem do seed.

| Pasta | O que contém | Como executar | Requisitos |
| --- | --- | --- | --- |
| `paradigmas-lab/` | Exemplos de POO, funcional, Worker Threads, `Atomics`, mutex, pool e deadlock (C1.4) | `node p1.mjs` … `node p6.mjs` | Node.js 22+ (testado no 26) |
| `../web-lab/` | Páginas de teste, servidor local (HTTP, SSE, WebSocket) e executores em Chrome (C1.5) | ver `../web-lab/README.md` | `ws@8`, `puppeteer-core@24`, Google Chrome |
| `flow-lab/` | Históricos de Git (merge, squash, rebase, Git Flow), Conventional Commits, Lei de Little, Monte Carlo, PERT, link checker e CODEOWNERS (C1.6) | `bash hist.sh`, `bash gf.sh`, `node m.mjs`, `node k2.mjs`, `node lk.mjs`, `node t.mjs` | Git 2.53, Node.js 22+ |
| `bdd-lab/` | Feature Gherkin executada com cucumber-js e agregado DDD (C1.7) | `npm i @cucumber/cucumber` e `npx cucumber-js`; `node ddd.mjs` | Node.js 22+, `@cucumber/cucumber` 13.3.0 |

Os scripts `hist.sh` e `gf.sh` criam repositórios Git temporários no diretório atual; execute-os em uma pasta vazia (usam `GIT_AUTHOR_NAME` e e-mail de exemplo). Os resultados citados nas aulas foram registrados em 2026-11-18.

## Verificação dos desafios em navegador real

`node seed/c1/browser-check.mjs` executa todos os desafios `code` da C1 (soluções e códigos iniciais) em Web Workers do Chrome, do mesmo modo que o laboratório do app. Requer `puppeteer-core` (variável `PUPPETEER_PATH` aponta para o módulo), Google Chrome (`CHROME_PATH`) e uma página servida em `PAGE_URL` (padrão: o servidor de `../web-lab/`, porta 8765).
