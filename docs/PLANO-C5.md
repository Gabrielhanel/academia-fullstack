# PLANO-C5 — Engenharia e qualidade: Clean Code/SOLID, patterns, documentação arquitetural, testes, ferramentas de teste, testes avançados, estruturas internas e qualidade

Data: 2026-11-25. Fonte da verdade: `PLANO-ACADEMIA-V2.md` (tabela de disciplinas, linha C5: "Engenharia e qualidade ... 8 cursos") e `seed/seed.json` (áreas `arch`, `test`, `cs`, `eng`; disciplinas `clean`, `patterns`, `adr`, `testing`, `test-js`, `test-adv`, `internals`, `quality`). Produção isolada em `seed/c5/`; nada de Onda 1, `seed/c1`–`c4`, `SEED_REV` (continua 3), `seedPlan`, migração ou `seed/build.mjs` é alterado; nada é integrado, publicado ou gravado no banco real.

## Divergências registradas
- O plano estima 5, 5, 4, 8, 6, 4, 2 e 6 tópicos para as disciplinas; os cursos agrupam os tópicos do `seed.json` (5, 5, 4, 8, 6, 4, 2, 6) em aulas mais densas. Cobertura conferida por tópico (`TOPICS`/`COVER`).
- Estilos arquiteturais, Event-Driven e Resiliência (área `arch`) e Testes na JVM (`test-jvm`) não estão na C5 do plano; ficam para ondas posteriores (C8/C9).
- `internals` tem 2 tópicos no catálogo; o curso dá 3 aulas (a execução de código — bytecode/JIT — ganha aula própria entre compiladores e GC).
- Exercícios `code` rodam só em JavaScript (Worker). Cursos cujo laboratório usa outras ferramentas (UML, k6, Pact) têm desafios JS que modelam a lógica; o que foi executado nas ferramentas reais é registrado no laboratório.

## Cursos, agrupamento e justificativa
| Curso | Arquivo | Disciplina | Tópicos cobertos | Aulas | Projeto integrador |
|---|---|---|---|---|---|
| C5.1 Clean Code e SOLID | c51-clean-code | clean | Nomes, funções e comentários; SOLID; Refatoração; Code smells; Technical Debt | 5 | refatoracao-guiada |
| C5.2 Design Patterns | c52-patterns | patterns | Criacionais; Estruturais; Comportamentais; Dependency Injection; Anti-patterns | 5 | motor-de-regras-patterns |
| C5.3 Documentação arquitetural | c53-arquitetura-docs | adr | UML essencial; Diagramas C4; ADR; Comunicação de decisões | 4 | dossie-arquitetural |
| C5.4 Fundamentos de testes | c54-testes | testing | Pirâmide; Unitários; Integração; E2E; Mocking e stubbing; TDD; BDD; Estratégia de qualidade | 6 | suite-de-testes-do-zero |
| C5.5 Ferramentas de teste JS | c55-testes-js | test-js | Jest; Vitest; Supertest; Cypress; Playwright; Testes em pipelines de CI | 6 | testes-api-e-e2e |
| C5.6 Contrato, carga e análise estática | c56-testes-avancados | test-adv | Contrato (Pact); Carga (k6); Estresse; Coverage e análise estática | 4 | qualidade-automatizada |
| C5.7 Estruturas internas das linguagens | c57-internals | internals | Compiladores e interpretadores; Garbage collection | 3 | mini-linguagem |
| C5.8 Qualidade e manutenção de software | c58-qualidade | quality | O que é qualidade; Code review; Métricas; Refatoração contínua; Dívida técnica; SRE para devs | 5 | programa-de-qualidade |
Ordem: Clean Code (C5.1) → patterns (C5.2) → documentação (C5.3) formam a trilha de design; testes fundamentos (C5.4) → ferramentas (C5.5) → avançados (C5.6) a de testes; internals (C5.7) e qualidade (C5.8) fecham, usando tudo antes.

## Estimativas
Aulas ~38; exercícios ~228 (6 por aula, mc/tf/match/trace/open/bug/fill/code); desafios code ≥ 7 por curso (≈ 60); 8 provas de 12 itens; 8 projetos integradores.

## Pré-requisitos
JavaScript e TypeScript (Onda 1), Git (Onda 1), Node/Express (C4.1) e APIs (C4.3) para C5.5/C5.6 (testar APIs), CI/CD (C6) é apenas referenciado (pipelines mostrados como YAML não executado em nuvem).

## Ferramentas e ambientes (verificados com `npm view` em 2026-11-25)
Node 26.13.1 (`node:test`, `--experimental-test-coverage`), Jest 30.5.2, Vitest 5.1.2, Supertest 7.3.2, Playwright 1.65.1, Cypress 16.3.0 (binário grande: avaliar), Pact 17.1.4, ESLint 10.15.0, TypeScript 7.0.2, fast-check 4.11.0, Stryker 10.1.1, c8 12.0.0, Cucumber 13.3.0, dependency-cruiser 18.9.0, jscpd 5.4.3, mermaid 12.3.0 / mermaid-cli 12.2.0. Docker disponível; k6 via imagem oficial se baixável; Java/PlantUML/dot ausentes (UML/C4 com Mermaid; PlantUML e Structurizr: analisados, não executados). GCC e Python 3 presentes (GC: Node `--trace-gc`, Python `gc`; sem JVM).

## Laboratórios (`seed/c5/labs/<curso>/`)
README (ambiente, versões, comandos, resultados, limitações), código executado, testes e saídas registradas. Separação em cada curso entre executado, analisado e não executado.

## Validação
`node seed/c5/validate.mjs` (estrutura, cobertura de tópicos, exercícios e gabaritos, provas, projetos, referências, IDs duplicados, colisões com Onda 1/C1–C4, dependências, execução dos desafios), `node seed/c5/refs-check.mjs` (todas as URLs abertas), `node seed/c5/browser-check.mjs` (Worker no Chrome). Cada curso só entra em `PROGRESSO` após validate OK.
