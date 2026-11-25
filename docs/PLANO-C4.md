# PLANO-C4 — Backend: Node/Express, NestJS, APIs, autenticação, filas, observabilidade, microsserviços e Python

Data: 2026-11-25. Fonte da verdade: `PLANO-ACADEMIA-V2.md` (tabela de disciplinas, linha C4) e `seed/seed.json` (área `back`, disciplinas `node`, `nest`, `apis`, `auth`, `async-be`, `obs`, `micro`, `python`). Produção isolada em `seed/c4/`; nada é integrado, publicado nem escrito no banco real; Onda 1, C1, C2, C3, `SEED_REV` (3), motor e `seed/build.mjs` não são alterados.

## Divergências registradas
- O plano estima 9, 10, 10, 7, 5, 4, 4 e 6 tópicos/aulas para as disciplinas; os cursos agrupam os tópicos do `seed.json` em aulas mais densas (48 aulas no total), como na C2 e na C3. Cobertura é conferida por tópico (`TOPICS`/`COVER`) pelo validador.
- A disciplina de filas no catálogo chama-se `async-be` (id), não `queues`.
- Exercícios `code` rodam só em JavaScript (Worker). Os cursos NestJS/TypeScript e Python usam desafios JS que modelam a lógica; o código real foi executado nos laboratórios.

## Cursos, agrupamento e justificativa
| Curso | Arquivo | Disciplina | Tópicos cobertos | Aulas | Projeto integrador |
|---|---|---|---|---|---|
| C4.1 Node.js e Express | c41-node-express | node | Runtime e event loop; Módulos e npm; Express; Middlewares; Tratamento de erros; Streams e buffers; Worker threads; Profiling; Node em produção | 7 | api-express-producao |
| C4.2 NestJS | c42-nestjs | nest | Módulos/controllers/providers; DI; Pipes e validação; Guards; Interceptors; Exception filters; Testes; Microsserviços com Nest; Filas com BullMQ; Arquitetura modular | 9 | api-nest-modular |
| C4.3 APIs REST, GraphQL e WebSockets | c43-apis | apis | HTTP e REST; Status e verbos; Design REST; OpenAPI; GraphQL; WebSockets; Paginação/filtros/rate limiting; Versionamento; Idempotência; Gateways e contratos | 8 | api-contratos-tempo-real |
| C4.4 Autenticação e autorização | c44-auth | auth | Sessões vs tokens; JWT; Hash de senhas; OAuth2; OIDC; RBAC e ABAC; SSO | 6 | auth-completa |
| C4.5 Filas e processamento assíncrono | c45-filas | async-be | Filas e jobs; BullMQ; Retry e backoff; DLQ; Integrações | 4 | pipeline-de-jobs |
| C4.6 Logs e observabilidade | c46-observabilidade | obs | Logs estruturados; Métricas e tracing (OpenTelemetry); Prometheus e Grafana; SLI, SLO e alertas | 4 | observabilidade-api |
| C4.7 Microsserviços | c47-microsservicos | micro | Decomposição; Síncrona x assíncrona; Sagas e consistência; Service mesh | 4 | decomposicao-sagas |
| C4.8 Python para desenvolvedores | c48-python | python | Sintaxe e tipos; Funções e módulos; Scripts e automação; FastAPI; Type hints; asyncio | 6 | servico-python |
Agrupar em um curso por disciplina mantém a trilha do catálogo; Node/Express antecede Nest e APIs; auth, filas e observabilidade exigem uma API em Node; microsserviços fecham a sequência; Python é independente.

## Estimativas
Aulas ~48; exercícios ~280 (6 por aula, mc/tf/match/trace/open/bug/fill/code); desafios code ≥ 7 por curso (≈ 60); 8 provas de 12 itens; 8 projetos integradores.

## Pré-requisitos
JavaScript e TypeScript (Onda 1) para C4.1–C4.7; SQL (C3.1) e ORMs (C3.6) para persistência nos projetos; Redis (C3.7/C3.8) para filas e cache; Python não exige outro curso.

## Ferramentas e ambientes (verificados em 2026-11-25)
Node 26.13.1; npm: express 5.3.0, @nestjs/core 12.6.1, @nestjs/cli 12.0.15, graphql 17.1.0, graphql-yoga 6.1.1, ws 8.23.0, bullmq 6.7.10, jose 6.2.18, argon2 0.45.2, bcryptjs 3.0.3, pino 10.4.0, prom-client 15.1.3, @opentelemetry/api 1.10.0, @opentelemetry/sdk-node 0.301.2, supertest 7.3.2, zod 4.6.7, class-validator 0.15.1, helmet 8.3.0, cors 2.8.6; Python 3.14.4 (venv); Docker com imagens oficiais postgres:17 e redis:8 (contêineres isolados `c4-*`, portas em 127.0.0.1; os contêineres do usuário não são tocados). Versões exatas confirmadas em cada laboratório.

## Laboratórios (`seed/c4/labs/<curso>/`)
README (ambiente, versões, comandos, resultados, limitações), código executado, testes e saídas registradas. Separação em cada curso entre executado, analisado e não executado.

## Validação
`node seed/c4/validate.mjs` (estrutura, cobertura de tópicos, exercícios e gabaritos, provas, projetos, referências, IDs duplicados e colisões com Onda 1/C1/C2/C3, dependências, execução dos desafios), `node seed/c4/refs-check.mjs` (todas as URLs abertas com HTTP real) e `node seed/c4/browser-check.mjs` (Workers no Chrome). IDs de aula: `nex-`, `nst-`, `api-`, `aut-`, `fil-`, `obs-`, `mic-`, `pyt-`.
