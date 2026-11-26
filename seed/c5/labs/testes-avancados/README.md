# Laboratório C5.6 — Contrato, carga e análise estática

Ambiente (2026-11-25): Node.js 26.13.1; @pact-foundation/pact 17.1.4 (pact-core 20.2.0), Express 5.3.0, Vitest 5.1.2, k6 (imagem Docker `grafana/k6:latest`), c8 12.0.0, TypeScript 7.0.2, dependency-cruiser 18.9.0, Stryker 10.1.1 (+ vitest-runner) e ESLint 10.15.0. Instalação: `npm i` com as versões exatas do `package.json` (dependências fora do repositório).

## Conteúdo
- `src/provedor.mjs` (API Express: `/clientes/:id`, `/saude`, `/relatorio` intensivo em CPU) e `src/consumidor.mjs` (cliente que usa `id`, `nome` e `email`).
- Contrato: `test/consumidor.pact.test.mjs` (gera `pacts/loja-web-api-clientes.json`) e `verificar-provedor.mjs`.
- Carga: `carga/{smoke,carga,estresse}.js`, `servidor-carga.mjs`, `rodar-k6.sh`, `resultados/`.
- Análise: `analise/` (calculos, testes node:test e Vitest, tipos JSDoc, alvo de lint), `arq/` (dependências com violações), `.dependency-cruiser.cjs`, `eslint.config.mjs`, `stryker.config.json`.

## Comandos
```
npx vitest run                                  # 2 testes de contrato do consumidor
node verificar-provedor.mjs [nome|name]         # verificação do provedor
./rodar-k6.sh smoke | carga | estresse          # k6 no Docker
npx c8 --include analise/calculos.mjs node --test analise/calculos.node.test.mjs
npx stryker run
npx tsc --noEmit --allowJs --checkJs --strict --target es2022 --module nodenext analise/tipos.js
npx depcruise arq --config .dependency-cruiser.cjs
npx eslint analise/lint-alvo.mjs
```

## Resultados medidos (arquivos `saida-*.txt`)
- Pact: 2 interações do consumidor passaram (gerando o arquivo de contrato); o provedor correto foi verificado com sucesso (200 e 404); com o campo renomeado para `name` a verificação falhou com "Actual map is missing the following keys: nome"; o campo extra `vip` não quebrou o contrato.
- k6 (uma execução, provedor em uma única thread): smoke 50 requisições, p95 2,8 ms, 0% de falhas; carga em modelo aberto de 50 it/s por 15 s: 750 requisições, p95 13,0 ms, 0% de falhas; estresse com taxa crescente até 100 it/s no relatório de ~24 ms: vazão 35,5 req/s, p95 4,59 s, máximo 6,69 s, 119 iterações descartadas, 0% de falhas HTTP e saída 99 (threshold violado). O servidor degradou por fila (latência), não por erros.
- c8: 100% das linhas, 92,85% dos ramos e 75% das funções (a função `formatarMoeda` sem teste).
- Stryker: pontuação 69,44% (25 mortos, 6 sobreviventes, 5 sem cobertura); após testes de fronteira 97,22% (35 mortos, 1 sobrevivente, que é equivalente: `peso < 5` e `peso <= 5` dão o mesmo frete).
- tsc 7.0.2 (`--checkJs --strict`): 6 erros em JSDoc; dependency-cruiser: 2 violações (domínio → infra e ciclo), saída 2; ESLint: 7 problemas (5 erros e 2 avisos).

## Limitações
Medidas de uma máquina; o k6 rodou no mesmo host do servidor (disputam CPU), com servidor em uma thread e sem banco; não é um teste de capacidade de produção. Não executados: broker do Pact (Pact Broker/PactFlow), `can-i-deploy`, contratos de mensageria, k6 com navegador, testes distribuídos (k6 Cloud/Operator), Gatling, JMeter, SonarQube e análise de segurança (SAST/DAST).
